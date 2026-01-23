#!/usr/bin/env node

/**
 * Update Task Table commit dates for testing
 * 
 * This script updates all task commit dates and assigns tasks to resources
 * in their matching domain (ZB), stacking tasks to fill engineer days
 * with realistic scheduling based on shift times and task durations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const taskTablePath = path.join(__dirname, '../src/Openreach - App/App - Data Tables/Task - Table.ts');
const resourceTablePath = path.join(__dirname, '../src/Openreach - App/App - Data Tables/Resource - Table.ts');

// Read the files
let content = fs.readFileSync(taskTablePath, 'utf8');
const resourceContent = fs.readFileSync(resourceTablePath, 'utf8');

// Get today's date at midnight
const today = new Date();
today.setHours(0, 0, 0, 0);

// Available task durations (in HH:MM format)
const taskDurations = ['1:00', '1:30', '2:00', '2:30', '3:00'];

// Parse resources from Resource Table
const resourceMatches = resourceContent.matchAll(/resourceId:\s*'([^']+)'[^}]*resourceName:\s*'([^']+)'[^}]*scheduleShift:\s*'([^']+)'[^}]*startTime:\s*'([^']+)'[^}]*endTime:\s*'([^']+)'[^}]*division:\s*'([^']+)'[^}]*domainId:\s*'([^']+)'/gs);
const resources = Array.from(resourceMatches).map(match => ({
  resourceId: match[1],
  resourceName: match[2],
  scheduleShift: match[3],
  startTime: match[4],
  endTime: match[5],
  division: match[6],
  domainId: match[7]
}));

// Filter to Service Delivery, ZB domain
const zbResources = resources.filter(r => r.division === 'Service Delivery' && r.domainId === 'ZB');

console.log(`\n📋 Found ${zbResources.length} resources in Service Delivery, Domain ZB:`);
zbResources.forEach(r => console.log(`  - ${r.resourceName} (${r.resourceId}) | ${r.scheduleShift} ${r.startTime}-${r.endTime}`));

// Resource scheduling state - track current time for each resource per day
const resourceSchedules = new Map(); // key: "resourceId-dayOffset", value: current end time

// Function to parse duration to hours
function parseDuration(duration) {
  const [hours, minutes] = duration.split(':').map(Number);
  return hours + (minutes / 60);
}

// Function to parse time string (HH:MM) to hours
function parseTimeToHours(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes / 60);
}

// Function to assign task to next available resource and time slot
function scheduleTask(taskDuration, dayOffset) {
  const durationHours = parseDuration(taskDuration);
  
  // Try to find a resource with capacity on this day
  for (const resource of zbResources) {
    const scheduleKey = `${resource.resourceId}-${dayOffset}`;
    const shiftStartHours = parseTimeToHours(resource.startTime);
    const shiftEndHours = parseTimeToHours(resource.endTime);
    
    // Get current scheduled end time for this resource on this day
    let currentEndHours = resourceSchedules.get(scheduleKey) || shiftStartHours;
    
    // Check if task fits before shift end
    if (currentEndHours + durationHours <= shiftEndHours) {
      // Schedule the task
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      date.setHours(Math.floor(currentEndHours), Math.round((currentEndHours % 1) * 60), 0, 0);
      
      // Update schedule
      resourceSchedules.set(scheduleKey, currentEndHours + durationHours);
      
      return {
        resourceId: resource.resourceId,
        resourceName: resource.resourceName,
        commitDate: date.toISOString(),
        dayOffset
      };
    }
  }
  
  // If no resource has capacity, move to next day
  return scheduleTask(taskDuration, dayOffset + 1);
}

// Function to calculate scheduled times based on duration
function calculateScheduledTimes(commitDate, taskDuration) {
  const startTime = new Date(commitDate);
  const durationHours = parseDuration(taskDuration);
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + Math.floor(durationHours));
  endTime.setMinutes(endTime.getMinutes() + Math.round((durationHours % 1) * 60));
  
  return {
    start: startTime.toISOString(),
    end: endTime.toISOString()
  };
}

// Extract existing taskDuration or assign one
function getTaskDuration(taskBlock, index) {
  const durationMatch = taskBlock.match(/taskDuration:\s*'([^']*)'/);
  if (durationMatch) {
    return durationMatch[1];
  }
  // Assign duration in rotation if not found
  return taskDurations[index % taskDurations.length];
}

// Find all task objects and update commitDate + scheduled times
const taskRegex = /({[^}]*commitDate:\s*'[^']*'[^}]*})/gs;
const tasks = content.match(taskRegex);

if (!tasks) {
  console.error('No tasks found in the file');
  process.exit(1);
}

console.log(`\n📋 Found ${tasks.length} tasks to update...`);
console.log(`📊 Using task durations: ${taskDurations.join(', ')}\n`);

let taskIndex = 0;
let currentDay = 0;

tasks.forEach((taskBlock) => {
  const taskDuration = getTaskDuration(taskBlock, taskIndex);
  
  // Schedule task to next available resource slot
  const assignment = scheduleTask(taskDuration, currentDay);
  const scheduledTimes = calculateScheduledTimes(assignment.commitDate, taskDuration);
  
  let updatedTask = taskBlock;
  
  // Update domainId to ZB
  updatedTask = updatedTask.replace(/domainId:\s*'[^']*'/, `domainId: 'ZB'`);
  
  // Update resourceId
  updatedTask = updatedTask.replace(/resourceId:\s*'[^']*'/, `resourceId: '${assignment.resourceId}'`);
  
  // Update division to Service Delivery
  updatedTask = updatedTask.replace(/division:\s*'[^']*'/, `division: 'Service Delivery'`);
  
  // Update commitDate
  updatedTask = updatedTask.replace(/commitDate:\s*'[^']*'/, `commitDate: '${assignment.commitDate}'`);
  
  // Add or update scheduledStartTime
  if (updatedTask.includes('scheduledStartTime:')) {
    updatedTask = updatedTask.replace(/scheduledStartTime:\s*'[^']*'/, `scheduledStartTime: '${scheduledTimes.start}'`);
  } else {
    updatedTask = updatedTask.replace(/commitDate: '[^']*',/, `commitDate: '${assignment.commitDate}',\n    scheduledStartTime: '${scheduledTimes.start}',`);
  }
  
  // Add or update scheduledEndTime
  if (updatedTask.includes('scheduledEndTime:')) {
    updatedTask = updatedTask.replace(/scheduledEndTime:\s*'[^']*'/, `scheduledEndTime: '${scheduledTimes.end}'`);
  } else {
    updatedTask = updatedTask.replace(/scheduledStartTime: '[^']*',/, `scheduledStartTime: '${scheduledTimes.start}',\n    scheduledEndTime: '${scheduledTimes.end}',`);
  }
  
  // Ensure taskDuration exists (add if missing, preserve if exists)
  if (!updatedTask.includes('taskDuration:')) {
    updatedTask = updatedTask.replace(/scheduledEndTime: '[^']*',/, `scheduledEndTime: '${scheduledTimes.end}',\n    taskDuration: '${taskDuration}',`);
  }
  
  content = content.replace(taskBlock, updatedTask);
  
  const commitTime = new Date(assignment.commitDate);
  const endTime = new Date(scheduledTimes.end);
  console.log(`Task ${(taskIndex + 1).toString().padStart(2, '0')}: ${assignment.resourceName.padEnd(20)} | Day ${assignment.dayOffset} ${commitTime.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}-${endTime.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})} | ${taskDuration}`);
  taskIndex++;
});

// Write the updated content back
fs.writeFileSync(taskTablePath, content, 'utf8');

// Display scheduling summary
console.log('\n✅ Successfully updated all tasks!');
console.log(`📅 Base date: ${today.toDateString()}`);
console.log(`👥 Assigned to ${zbResources.length} resources in Domain ZB`);
console.log('📊 Task distribution:');
zbResources.forEach(r => {
  let tasksForResource = 0;
  for (let day = 0; day < 7; day++) {
    const scheduleKey = `${r.resourceId}-${day}`;
    if (resourceSchedules.has(scheduleKey)) {
      tasksForResource++;
    }
  }
  if (tasksForResource > 0) {
    console.log(`  ${r.resourceName}: ${tasksForResource} day(s) with tasks`);
  }
});
console.log('\n💡 Features:');
console.log('  ✓ All tasks assigned to Service Delivery, Domain ZB');
console.log('  ✓ Tasks stack-fill engineer days (no gaps)');
console.log('  ✓ Respects shift times per engineer');
console.log('  ✓ Task durations: 1:00 to 3:00 hours');
console.log('\n🔄 Run: node scripts/update-task-dates.js');
