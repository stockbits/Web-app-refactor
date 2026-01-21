/**
 * Selection UI System for Map-Task Coordination
 *
 * This system enables seamless coordination between map selections and task table views.
 * When users select tasks on the map (with optional CTRL multi-select), those tasks
 * are automatically highlighted and prioritized in connected task table components.
 *
 * Key Features:
 * - Single/multi-select support with CTRL key
 * - Selected tasks appear at top of task tables regardless of current sort
 * - Visual highlighting of selected tasks on map and in tables
 * - Centralized state management with React Context
 *
 * Usage:
 * 1. Wrap your app/page with SelectionUIProvider
 * 2. Use useMapSelection in map components
 * 3. Use useTaskTableSelection in task table components
 * 4. Selected tasks will automatically sync between components
 */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { TaskTableRow } from '../App - Data Tables/Task - Table';

interface SelectionUIContextType {
  selectedTaskIds: string[];
  lastInteractedTaskId: string | null;
  isTaskSelected: (taskId: string) => boolean;
  isLastInteracted: (taskId: string) => boolean;
  toggleTaskSelection: (taskId: string, multiSelect?: boolean, source?: 'map' | 'table') => void;
  rangeSelectTasks: (taskId: string, allTaskIds: string[], source?: 'map' | 'table') => void;
  clearSelection: () => void;
  selectTasks: (taskIds: string[], source?: 'map' | 'table') => void;
  getPrioritizedTasks: (allTasks: TaskTableRow[]) => TaskTableRow[];
  selectionSource: 'map' | 'table' | null;
}

const SelectionUIContext = createContext<SelectionUIContextType | undefined>(undefined);

export const useSelectionUI = () => {
  const context = useContext(SelectionUIContext);
  if (!context) {
    throw new Error('useSelectionUI must be used within SelectionUIProvider');
  }
  return context;
};

interface SelectionUIProviderProps {
  children: React.ReactNode;
  // Removed allTasks - no longer needed since we removed selectedTasks computation
}

export const SelectionUIProvider: React.FC<SelectionUIProviderProps> = ({
  children
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [lastInteractedTaskId, setLastInteractedTaskId] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] = useState<'map' | 'table' | null>(null);

  // Use Set for O(1) lookups instead of O(n) includes()
  const selectedTaskIdsSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);

  // Remove expensive selectedTasks computation from context - compute only when needed
  // const selectedTasks = useMemo(() => {
  //   return allTasks.filter(task => selectedTaskIdsSet.has(task.taskId));
  // }, [allTasks, selectedTaskIdsSet]);

  // Check if a task is selected - O(1) lookup
  const isTaskSelected = useCallback((taskId: string) => {
    return selectedTaskIdsSet.has(taskId);
  }, [selectedTaskIdsSet]);

  // Check if task is the last interacted - for visual feedback
  const isLastInteracted = useCallback((taskId: string) => {
    return taskId === lastInteractedTaskId;
  }, [lastInteractedTaskId]);

  // Toggle task selection (supports multi-select with multiSelect flag)
  const toggleTaskSelection = useCallback((taskId: string, multiSelect = false, source: 'map' | 'table' = 'table') => {
    setLastInteractedTaskId(taskId);
    setSelectedTaskIds(prev => {
      const isCurrentlySelected = selectedTaskIdsSet.has(taskId);

      if (multiSelect) {
        // Multi-select mode: add/remove from selection
        if (isCurrentlySelected) {
          // Remove taskId from array
          const index = prev.indexOf(taskId);
          if (index > -1) {
            const newArray = [...prev];
            newArray.splice(index, 1);
            return newArray;
          }
          return prev;
        } else {
          // Add taskId to array
          return [...prev, taskId];
        }
      } else {
        // Single select mode: select only this task
        if (isCurrentlySelected && prev.length === 1) {
          // If only this task is selected, deselect it
          return [];
        } else {
          // Select only this one
          return [taskId];
        }
      }
    });
    setSelectionSource(source);
  }, [selectedTaskIdsSet]);

  // Range select tasks (Shift-click)
  const rangeSelectTasks = useCallback((taskId: string, allTaskIds: string[], source: 'map' | 'table' = 'table') => {
    setLastInteractedTaskId(taskId);
    
    if (!lastInteractedTaskId || !allTaskIds.includes(lastInteractedTaskId)) {
      // No previous selection or previous not in current list, just select this one
      setSelectedTaskIds([taskId]);
    } else {
      // Find indices of last and current
      const lastIndex = allTaskIds.indexOf(lastInteractedTaskId);
      const currentIndex = allTaskIds.indexOf(taskId);
      
      // Select all tasks in range (inclusive)
      const startIndex = Math.min(lastIndex, currentIndex);
      const endIndex = Math.max(lastIndex, currentIndex);
      const rangeIds = allTaskIds.slice(startIndex, endIndex + 1);
      
      // Add range to existing selection
      const newSelection = [...new Set([...selectedTaskIds, ...rangeIds])];
      setSelectedTaskIds(newSelection);
    }
    setSelectionSource(source);
  }, [lastInteractedTaskId, selectedTaskIds]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
    setLastInteractedTaskId(null);
  }, []);

  // Select multiple tasks at once
  const selectTasks = useCallback((taskIds: string[], source: 'map' | 'table' = 'table') => {
    setSelectedTaskIds(taskIds);
    setSelectionSource(source);
  }, []);

  // Get tasks with selected tasks prioritized (moved to top) - optimized single pass
  const getPrioritizedTasks = useCallback((tasks: TaskTableRow[]) => {
    // Only prioritize if selection came from map and there are selections
    if (selectedTaskIds.length === 0 || selectionSource !== 'map') {
      return tasks;
    }

    // Create task lookup map for O(1) access
    const taskMap = new Map<string, TaskTableRow>();
    for (let i = 0; i < tasks.length; i++) {
      taskMap.set(tasks[i].taskId, tasks[i]);
    }

    // Build selected tasks in reverse order (most recently selected first)
    const selectedTasks: TaskTableRow[] = [];
    for (let i = selectedTaskIds.length - 1; i >= 0; i--) {
      const task = taskMap.get(selectedTaskIds[i]);
      if (task) {
        selectedTasks.push(task);
      }
    }

    // Build unselected tasks
    const unselectedTasks: TaskTableRow[] = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (!selectedTaskIdsSet.has(task.taskId)) {
        unselectedTasks.push(task);
      }
    }

    // Return concatenated result - most recently selected at top
    return selectedTasks.concat(unselectedTasks);
  }, [selectedTaskIds, selectedTaskIdsSet, selectionSource]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    selectedTaskIds,
    lastInteractedTaskId,
    isTaskSelected,
    isLastInteracted,
    toggleTaskSelection,
    rangeSelectTasks,
    clearSelection,
    selectTasks,
    getPrioritizedTasks,
    selectionSource
  }), [
    selectedTaskIds,
    lastInteractedTaskId,
    isTaskSelected,
    isLastInteracted,
    toggleTaskSelection,
    rangeSelectTasks,
    clearSelection,
    selectTasks,
    getPrioritizedTasks,
    selectionSource
  ]);

  return (
    <SelectionUIContext.Provider value={value}>
      {children}
    </SelectionUIContext.Provider>
  );
};

// Hook for map components to easily select tasks
export const useMapSelection = () => {
  const { toggleTaskSelection, selectTasks } = useSelectionUI();

  const selectTaskFromMap = useCallback((taskId: string, multiSelect = false) => {
    toggleTaskSelection(taskId, multiSelect, 'map');
  }, [toggleTaskSelection]);

  const selectMultipleTasksFromMap = useCallback((taskIds: string[]) => {
    selectTasks(taskIds, 'map');
  }, [selectTasks]);

  return useMemo(() => ({
    selectTaskFromMap,
    selectMultipleTasksFromMap
  }), [selectTaskFromMap, selectMultipleTasksFromMap]);
};

// Hook for task table components to get prioritized task list
export const useTaskTableSelection = () => {
  const { 
    getPrioritizedTasks, 
    selectedTaskIds, 
    lastInteractedTaskId,
    isTaskSelected, 
    isLastInteracted,
    toggleTaskSelection, 
    rangeSelectTasks,
    selectionSource 
  } = useSelectionUI();

  return useMemo(() => ({
    getPrioritizedTasks,
    selectedTaskIds,
    lastInteractedTaskId,
    isTaskSelected,
    isLastInteracted,
    toggleTaskSelection,
    rangeSelectTasks,
    selectionSource
  }), [
    getPrioritizedTasks,
    selectedTaskIds,
    lastInteractedTaskId,
    isTaskSelected,
    isLastInteracted,
    toggleTaskSelection,
    rangeSelectTasks,
    selectionSource
  ]);
};

// Example usage in a Task Table component:
/*
import { useTaskTableSelection } from '../Selection - UI';

function TaskTable({ tasks }: { tasks: TaskTableRow[] }) {
  const { getPrioritizedTasks, selectedTaskIds, isTaskSelected, toggleTaskSelection } = useTaskTableSelection();

  // Get tasks with selected tasks prioritized (moved to top)
  const displayTasks = getPrioritizedTasks(tasks);

  return (
    <div>
      {displayTasks.map(task => (
        <div
          key={task.taskId}
          className={isTaskSelected(task.taskId) ? 'selected' : ''}
          onClick={() => toggleTaskSelection(task.taskId)}
        >
          {task.taskId} - {task.commitType}
        </div>
      ))}
    </div>
  );
}
*/