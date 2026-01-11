/**
 * Central Icon Color Configuration
 * 
 * This file defines all icon colors used across the application
 * for maps, legends, and other visual indicators.
 * 
 * Colors are designed to be:
 * - Accessible and colorblind-friendly
 * - Distinct and recognizable
 * - Consistent across light and dark modes
 * - Sharp and defined with proper contrast
 */

export const TASK_ICON_COLORS = {
  appointment: '#D97706',    // Amber/Orange - Warm, distinct
  startBy: '#43B072',        // Green - Success, go
  completeBy: '#5488C7',     // Blue - Information, calm
  failedSLA: '#A8ABB2',      // Light Grey - Neutral, disabled
  taskGroup: '#FB7185',      // Pink/Red - Alert, grouped
} as const;

export type TaskIconColorKey = keyof typeof TASK_ICON_COLORS;

/**
 * Get color for a specific task icon type
 */
export function getTaskIconColor(type: TaskIconColorKey): string {
  return TASK_ICON_COLORS[type];
}

/**
 * Get all task icon colors as a record
 */
export function getAllTaskIconColors() {
  return TASK_ICON_COLORS;
}
