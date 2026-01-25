/**
 * Update task locations to spread them across Rhondda valleys
 * This creates more realistic travel distances between tasks
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const taskTablePath = join(__dirname, '../src/Openreach - App/App - Data Tables/Task - Table.ts');

// Rhondda area coordinates (CF37-CF45 postcodes)
// Spreads tasks across valleys: Rhondda Fach, Rhondda Fawr, Cynon
const RHONDDA_COORDS = {
  minLat: 51.58,
  maxLat: 51.68,
  minLong: -3.55,
  maxLong: -3.40
};

// Generate random coordinate within Rhondda bounds
function getRandomCoord(min, max, precision = 4) {
  const value = min + Math.random() * (max - min);
  return parseFloat(value.toFixed(precision));
}

// Process the task table file
function updateTaskLocations() {
  console.log('📍 Updating task locations...');
  
  let content = readFileSync(taskTablePath, 'utf-8');
  
  // Match taskLatitude and taskLongitude pairs
  const latLongPattern = /taskLatitude:\s*([\d.]+),\s*taskLongitude:\s*([-\d.]+),/g;
  
  let match;
  let count = 0;
  const replacements = [];
  
  // Find all matches first
  while ((match = latLongPattern.exec(content)) !== null) {
    const oldLat = match[1];
    const oldLong = match[2];
    const newLat = getRandomCoord(RHONDDA_COORDS.minLat, RHONDDA_COORDS.maxLat);
    const newLong = getRandomCoord(RHONDDA_COORDS.minLong, RHONDDA_COORDS.maxLong);
    
    replacements.push({
      old: `taskLatitude: ${oldLat},\n    taskLongitude: ${oldLong},`,
      new: `taskLatitude: ${newLat},\n    taskLongitude: ${newLong},`
    });
    count++;
  }
  
  // Apply all replacements
  replacements.forEach(({ old, new: newVal }) => {
    content = content.replace(old, newVal);
  });
  
  // Write updated content
  writeFileSync(taskTablePath, content, 'utf-8');
  
  console.log(`✅ Updated ${count} task locations`);
  console.log(`   Latitude range: ${RHONDDA_COORDS.minLat} to ${RHONDDA_COORDS.maxLat}`);
  console.log(`   Longitude range: ${RHONDDA_COORDS.minLong} to ${RHONDDA_COORDS.maxLong}`);
  console.log('   Spread across Rhondda valleys (CF37-CF45)');
}

// Run the update
try {
  updateTaskLocations();
} catch (error) {
  console.error('❌ Error updating task locations:', error);
  process.exit(1);
}
