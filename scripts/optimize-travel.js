#!/usr/bin/env node

/**
 * Travel Time Optimizer for Tasks
 * 
 * This script optimizes task locations and schedules based on travel strategies:
 * - EFFICIENT: Cluster tasks close together to minimize travel time
 * - TRAVEL_PRIORITY: Spread tasks between Mountain Ash and Hirwaun to maximize travel
 * 
 * Usage:
 *   node optimize-travel.js --strategy efficient --days 7
 *   node optimize-travel.js --strategy travel-priority --days 14 --preview
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const taskTablePath = path.join(__dirname, '../src/Openreach - App/App - Data Tables/Task - Table.ts');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name, defaultValue) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
};

const strategy = getArg('strategy', 'efficient'); // 'efficient' or 'travel-priority'
const daysSpread = parseInt(getArg('days', '7'));
const maxTasksPerDay = parseInt(getArg('max-tasks', '5'));
const minTravelMinutes = parseInt(getArg('min-travel', '15'));
const previewMode = args.includes('--preview');
const verbose = args.includes('--verbose');

// Reference locations (South Wales valleys)
const LOCATIONS = {
  aberdare: { lat: 51.7150, lng: -3.4469, name: 'Aberdare (Center)' },
  mountainAsh: { lat: 51.6850, lng: -3.5100, name: 'Mountain Ash (South)' },
  hirwaun: { lat: 51.7550, lng: -3.3850, name: 'Hirwaun (North)' }
};

console.log('\n🚗 Task Travel Time Optimizer');
console.log('━'.repeat(60));
console.log(`Strategy: ${strategy.toUpperCase()}`);
console.log(`Days to spread: ${daysSpread}`);
console.log(`Max tasks per day: ${maxTasksPerDay}`);
console.log(`Min travel time: ${minTravelMinutes} minutes`);
console.log(`Mode: ${previewMode ? 'PREVIEW (no changes)' : 'APPLY CHANGES'}`);
console.log('━'.repeat(60) + '\n');

/**
 * Calculate distance between two geographic points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Estimate travel time based on distance (average speed with traffic)
 */
function estimateTravelTime(distanceKm) {
  const avgSpeedKmh = 40; // Average speed in valleys (accounting for roads/traffic)
  return (distanceKm / avgSpeedKmh) * 60; // Return in minutes
}

/**
 * Parse tasks from the TypeScript file
 */
function parseTasks(content) {
  const tasks = [];
  const taskRegex = /{[\s\S]*?taskId:\s*'([^']+)'[\s\S]*?taskLatitude:\s*([\d.]+)[\s\S]*?taskLongitude:\s*([-\d.]+)[\s\S]*?commitDate:\s*'([^']+)'[\s\S]*?postCode:\s*'([^']+)'[\s\S]*?}/g;
  
  let match;
  while ((match = taskRegex.exec(content)) !== null) {
    tasks.push({
      taskId: match[1],
      taskLatitude: parseFloat(match[2]),
      taskLongitude: parseFloat(match[3]),
      commitDate: match[4],
      postCode: match[5],
      originalLat: parseFloat(match[2]),
      originalLng: parseFloat(match[3]),
      originalDate: match[4]
    });
  }
  
  return tasks;
}

/**
 * Optimize tasks for EFFICIENT strategy (minimize travel)
 */
function optimizeEfficient(tasks) {
  const { aberdare } = LOCATIONS;
  const optimized = [];
  
  console.log('📍 Optimizing for EFFICIENT travel (clustering near Aberdare)...\n');
  
  tasks.forEach((task, index) => {
    // Cluster tasks around Aberdare with small variance
    const variance = 0.008; // ~0.5km radius
    const angle = (index * 137.5) * Math.PI / 180; // Golden angle for even distribution
    const radius = Math.sqrt(index / tasks.length) * variance;
    
    const newTask = {
      ...task,
      taskLatitude: aberdare.lat + Math.cos(angle) * radius,
      taskLongitude: aberdare.lng + Math.sin(angle) * radius
    };
    
    // Schedule tasks close together in time
    const dayOffset = Math.floor(index / maxTasksPerDay);
    const taskIndexInDay = index % maxTasksPerDay;
    
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    baseDate.setDate(baseDate.getDate() + dayOffset);
    
    // Tasks start at 8 AM with 1-1.5 hour intervals (includes work + minimal travel)
    const hourOffset = 8 + (taskIndexInDay * 1.25);
    baseDate.setHours(Math.floor(hourOffset), (hourOffset % 1) * 60, 0, 0);
    
    newTask.commitDate = baseDate.toISOString();
    newTask.scheduledStartTime = baseDate.toISOString();
    
    optimized.push(newTask);
  });
  
  return optimized;
}

/**
 * Optimize tasks for TRAVEL_PRIORITY strategy (maximize travel)
 */
function optimizeTravelPriority(tasks) {
  const { aberdare, mountainAsh, hirwaun } = LOCATIONS;
  const optimized = [];
  
  console.log('📍 Optimizing for TRAVEL PRIORITY (spreading between Mountain Ash & Hirwaun)...\n');
  
  tasks.forEach((task, index) => {
    let targetLocation;
    let locationName;
    
    // Create a triangle pattern: Aberdare -> Mountain Ash -> Hirwaun -> Aberdare
    const pattern = index % 3;
    if (pattern === 0) {
      targetLocation = mountainAsh;
      locationName = 'Mountain Ash';
    } else if (pattern === 1) {
      targetLocation = hirwaun;
      locationName = 'Hirwaun';
    } else {
      targetLocation = aberdare;
      locationName = 'Aberdare';
    }
    
    // Add variance around target location
    const variance = 0.005; // ~0.3km radius
    const newTask = {
      ...task,
      taskLatitude: targetLocation.lat + (Math.random() - 0.5) * variance,
      taskLongitude: targetLocation.lng + (Math.random() - 0.5) * variance,
      targetArea: locationName
    };
    
    // Spread tasks across more days (fewer per day to allow for travel)
    const tasksPerDay = Math.min(2, maxTasksPerDay); // Max 2 per day for travel priority
    const dayOffset = Math.floor(index / tasksPerDay);
    const taskIndexInDay = index % tasksPerDay;
    
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    baseDate.setDate(baseDate.getDate() + dayOffset);
    
    // Tasks start at 8 AM with 3-4 hour intervals (includes work + significant travel)
    const hourOffset = 8 + (taskIndexInDay * 3.5);
    baseDate.setHours(Math.floor(hourOffset), (hourOffset % 1) * 60, 0, 0);
    
    newTask.commitDate = baseDate.toISOString();
    newTask.scheduledStartTime = baseDate.toISOString();
    
    optimized.push(newTask);
  });
  
  return optimized;
}

/**
 * Calculate statistics for optimized tasks
 */
function calculateStats(tasks) {
  let totalDistance = 0;
  let totalTravelTime = 0;
  const dayMap = new Map();
  
  for (let i = 1; i < tasks.length; i++) {
    const prev = tasks[i - 1];
    const curr = tasks[i];
    
    const distance = calculateDistance(
      prev.taskLatitude,
      prev.taskLongitude,
      curr.taskLatitude,
      curr.taskLongitude
    );
    
    const travelTime = estimateTravelTime(distance);
    
    totalDistance += distance;
    totalTravelTime += travelTime;
    
    const day = new Date(curr.commitDate).toDateString();
    if (!dayMap.has(day)) {
      dayMap.set(day, []);
    }
    dayMap.get(day).push(curr);
  }
  
  return {
    totalDistance,
    totalTravelTime,
    daysUsed: dayMap.size,
    avgDistancePerLeg: totalDistance / (tasks.length - 1),
    avgTravelTimePerLeg: totalTravelTime / (tasks.length - 1),
    dayMap
  };
}

/**
 * Display optimization results
 */
function displayResults(original, optimized) {
  const originalStats = calculateStats(original);
  const optimizedStats = calculateStats(optimized);
  
  console.log('📊 OPTIMIZATION RESULTS');
  console.log('━'.repeat(60));
  console.log(`\n${'Metric'.padEnd(30)} ${'Original'.padEnd(15)} ${'Optimized'.padEnd(15)}`);
  console.log('─'.repeat(60));
  console.log(`${'Total Tasks:'.padEnd(30)} ${original.length.toString().padEnd(15)} ${optimized.length.toString().padEnd(15)}`);
  console.log(`${'Days Used:'.padEnd(30)} ${originalStats.daysUsed.toString().padEnd(15)} ${optimizedStats.daysUsed.toString().padEnd(15)}`);
  console.log(`${'Total Distance:'.padEnd(30)} ${originalStats.totalDistance.toFixed(2) + ' km'.padEnd(15)} ${optimizedStats.totalDistance.toFixed(2) + ' km'.padEnd(15)}`);
  console.log(`${'Total Travel Time:'.padEnd(30)} ${Math.round(originalStats.totalTravelTime) + ' mins'.padEnd(15)} ${Math.round(optimizedStats.totalTravelTime) + ' mins'.padEnd(15)}`);
  console.log(`${'Avg Distance/Leg:'.padEnd(30)} ${originalStats.avgDistancePerLeg.toFixed(2) + ' km'.padEnd(15)} ${optimizedStats.avgDistancePerLeg.toFixed(2) + ' km'.padEnd(15)}`);
  console.log(`${'Avg Travel/Leg:'.padEnd(30)} ${Math.round(originalStats.avgTravelTimePerLeg) + ' mins'.padEnd(15)} ${Math.round(optimizedStats.avgTravelTimePerLeg) + ' mins'.padEnd(15)}`);
  
  const distanceChange = ((optimizedStats.totalDistance - originalStats.totalDistance) / originalStats.totalDistance * 100).toFixed(1);
  const timeChange = ((optimizedStats.totalTravelTime - originalStats.totalTravelTime) / originalStats.totalTravelTime * 100).toFixed(1);
  
  console.log('\n💡 IMPACT:');
  console.log(`   Distance: ${distanceChange > 0 ? '+' : ''}${distanceChange}%`);
  console.log(`   Time: ${timeChange > 0 ? '+' : ''}${timeChange}%`);
  
  if (verbose) {
    console.log('\n📅 DAILY BREAKDOWN:');
    console.log('━'.repeat(60));
    
    for (const [day, tasks] of optimizedStats.dayMap.entries()) {
      console.log(`\n${day} (${tasks.length} tasks):`);
      tasks.forEach(task => {
        const time = new Date(task.commitDate).toLocaleTimeString();
        const location = task.targetArea || 'Mixed';
        console.log(`  ${task.taskId.padEnd(15)} ${time.padEnd(12)} ${location.padEnd(15)} ${task.postCode}`);
      });
    }
  }
  
  console.log('\n' + '━'.repeat(60) + '\n');
}

/**
 * Apply optimized coordinates and dates to the TypeScript file
 */
function applyOptimizations(content, optimizedTasks) {
  let updatedContent = content;
  let updatesApplied = 0;
  
  optimizedTasks.forEach(task => {
    // Update latitude, longitude, and commit date for each task
    const taskPattern = new RegExp(
      `(taskId:\\s*'${task.taskId}'[\\s\\S]*?taskLatitude:\\s*)([\\d.]+)([\\s\\S]*?taskLongitude:\\s*)([-\\d.]+)([\\s\\S]*?commitDate:\\s*)'([^']+)'`,
      'g'
    );
    
    const replacement = `$1${task.taskLatitude.toFixed(4)}$3${task.taskLongitude.toFixed(4)}$5'${task.commitDate}'`;
    
    if (taskPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(taskPattern, replacement);
      updatesApplied++;
    }
    
    // Also update scheduledStartTime
    const startTimePattern = new RegExp(
      `(taskId:\\s*'${task.taskId}'[\\s\\S]*?scheduledStartTime:\\s*)'([^']+)'`,
      'g'
    );
    
    const startTimeReplacement = `$1'${task.scheduledStartTime}'`;
    updatedContent = updatedContent.replace(startTimePattern, startTimeReplacement);
  });
  
  console.log(`✅ Applied ${updatesApplied} task updates\n`);
  return updatedContent;
}

/**
 * Main execution
 */
function main() {
  // Read the task table file
  let content;
  try {
    content = fs.readFileSync(taskTablePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }
  
  // Parse tasks
  const tasks = parseTasks(content);
  console.log(`📋 Found ${tasks.length} tasks in the data table\n`);
  
  if (tasks.length === 0) {
    console.log('⚠️  No tasks found to optimize');
    process.exit(0);
  }
  
  // Optimize based on strategy
  let optimizedTasks;
  if (strategy === 'travel-priority') {
    optimizedTasks = optimizeTravelPriority(tasks);
  } else {
    optimizedTasks = optimizeEfficient(tasks);
  }
  
  // Display results
  displayResults(tasks, optimizedTasks);
  
  // Apply changes if not in preview mode
  if (!previewMode) {
    const updatedContent = applyOptimizations(content, optimizedTasks);
    
    try {
      fs.writeFileSync(taskTablePath, updatedContent, 'utf8');
      console.log('✅ Task table updated successfully!');
      console.log(`📁 File: ${taskTablePath}\n`);
    } catch (error) {
      console.error(`❌ Error writing file: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log('👁️  Preview mode - no changes applied');
    console.log('   Remove --preview flag to apply changes\n');
  }
}

// Run the script
main();
