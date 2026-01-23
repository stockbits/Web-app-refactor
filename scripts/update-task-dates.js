#!/usr/bin/env node

/**
 * Update Task Table commit dates for testing
 * 
 * This script updates all task commit dates to spread across the next 7 days
 * starting from today, with realistic working hours and varied task durations.
 * Now supports travel-based scheduling by keeping taskDuration values.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const taskTablePath = path.join(__dirname, '../src/Openreach - App/App - Data Tables/Task - Table.ts');

// Read the file
let content = fs.readFileSync(taskTablePath, 'utf8');

// Get today's date at midnight
const today = new Date();
today.setHours(0, 0, 0, 0);

// Available task durations (in HH:MM format)
const taskDurations = ['1:00', '1:30', '2:00', '2:30', '3:00'];

// Function to parse duration to hours
function parseDuration(duration) {
  const [hours, minutes] = duration.split(':').map(Number);
  return hours + (minutes / 60);
}

// Function to generate a random date within the next 7 days during working hours
function generateRandomCommitDate(index, total) {
  // Spread tasks across 7 days
  const dayOffset = Math.floor((index / total) * 7);
  const date = new Date(today);
  date.setDate(date.getDate() + dayOffset);
  
  // Random hour between 8 AM and 2 PM (so 3-hour max task fits in shift)
  const hour = 8 + Math.floor(Math.random() * 6);
  const minute = Math.floor(Math.random() * 60);
  
  date.setHours(hour, minute, 0, 0);
  
  return date.toISOString();
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

console.log(`Found ${tasks.length} tasks to update...`);
console.log(`📊 Using task durations: ${taskDurations.join(', ')}\n`);

let taskIndex = 0;
tasks.forEach((taskBlock) => {
  const taskDuration = getTaskDuration(taskBlock, taskIndex);
  const newCommitDate = generateRandomCommitDate(taskIndex, tasks.length);
  const scheduledTimes = calculateScheduledTimes(newCommitDate, taskDuration);
  
  let updatedTask = taskBlock;
  
  // Update commitDate
  updatedTask = updatedTask.replace(/commitDate:\s*'[^']*'/, `commitDate: '${newCommitDate}'`);
  
  // Add or update scheduledStartTime
  if (updatedTask.includes('scheduledStartTime:')) {
    updatedTask = updatedTask.replace(/scheduledStartTime:\s*'[^']*'/, `scheduledStartTime: '${scheduledTimes.start}'`);
  } else {
    updatedTask = updatedTask.replace(/commitDate: '[^']*',/, `commitDate: '${newCommitDate}',\n    scheduledStartTime: '${scheduledTimes.start}',`);
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
  
  const commitTime = new Date(newCommitDate);
  console.log(`Task ${(taskIndex + 1).toString().padStart(2, '0')}: ${commitTime.toLocaleDateString()} ${commitTime.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})} | Duration: ${taskDuration} | End: ${new Date(scheduledTimes.end).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}`);
  taskIndex++;
});

// Write the updated content back
fs.writeFileSync(taskTablePath, content, 'utf8');

console.log('\n✅ Successfully updated all task commit dates and scheduled times!');
console.log(`📅 Tasks spread across next 7 days from ${today.toDateString()}`);
console.log('🕐 Working hours: 8:00 AM - 2:00 PM (start times)');
console.log('⏰ Task durations: 1:00 to 3:00 hours (preserves existing or rotates)');
console.log('🚗 Travel time scheduling: Automatic based on lat/long distances');
console.log('\n💡 Use refresh button in UI or run: node scripts/update-task-dates.js');
console.log('⏰ All tasks scheduled within engineer working hours');
