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
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { TaskTableRow } from '../App - Data Tables/Task - Table';

interface SelectionUIContextType {
  selectedTaskIds: string[];
  selectedTasks: TaskTableRow[];
  isTaskSelected: (taskId: string) => boolean;
  toggleTaskSelection: (taskId: string, multiSelect?: boolean, source?: 'map' | 'table') => void;
  clearSelection: () => void;
  selectTasks: (taskIds: string[], source?: 'map' | 'table') => void;
  getPrioritizedTasks: (allTasks: TaskTableRow[]) => TaskTableRow[];
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
  allTasks: TaskTableRow[];
}

export const SelectionUIProvider: React.FC<SelectionUIProviderProps> = ({
  children,
  allTasks
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectionSource, setSelectionSource] = useState<'map' | 'table' | null>(null);

  // Use Set for O(1) lookups instead of O(n) includes()
  const selectedTaskIdsSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);

  // Get selected task objects - only compute when needed
  const selectedTasks = useMemo(() => {
    return allTasks.filter(task => selectedTaskIdsSet.has(task.taskId));
  }, [allTasks, selectedTaskIdsSet]);

  // Check if a task is selected - O(1) lookup
  const isTaskSelected = useCallback((taskId: string) => {
    return selectedTaskIdsSet.has(taskId);
  }, [selectedTaskIdsSet]);

  // Toggle task selection (supports multi-select with multiSelect flag)
  const toggleTaskSelection = useCallback((taskId: string, multiSelect = false, source: 'map' | 'table' = 'table') => {
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
          return prev; // Shouldn't happen, but safety check
        } else {
          // Add taskId to array
          return [...prev, taskId];
        }
      } else {
        // Single select mode: replace selection
        return isCurrentlySelected ? [] : [taskId];
      }
    });
    setSelectionSource(source);
  }, [selectedTaskIdsSet]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  // Select multiple tasks at once
  const selectTasks = useCallback((taskIds: string[], source: 'map' | 'table' = 'table') => {
    setSelectedTaskIds(taskIds);
    setSelectionSource(source);
  }, []);

  // Get tasks with selected tasks prioritized (moved to top) - single pass optimization
  const getPrioritizedTasks = useCallback((tasks: TaskTableRow[]) => {
    // Only prioritize if selection came from map
    if (selectedTaskIds.length === 0 || selectionSource !== 'map') {
      return tasks;
    }

    const selectedTasks: TaskTableRow[] = [];
    const unselectedTasks: TaskTableRow[] = [];

    // Single pass through tasks for better performance
    for (const task of tasks) {
      if (selectedTaskIdsSet.has(task.taskId)) {
        selectedTasks.push(task);
      } else {
        unselectedTasks.push(task);
      }
    }

    // Return selected tasks first, then unselected tasks
    return [...selectedTasks, ...unselectedTasks];
  }, [selectedTaskIds.length, selectedTaskIdsSet, selectionSource]);

  // Memoize context value with minimal dependencies to prevent unnecessary re-renders
  // Only include primitive values and stable references in dependencies
  const value = useMemo(() => ({
    selectedTaskIds,
    selectedTasks,
    isTaskSelected,
    toggleTaskSelection,
    clearSelection,
    selectTasks,
    getPrioritizedTasks
  }), [
    // Only include the actual state and computed values that change
    selectedTaskIds,
    selectedTasks,
    // Functions are stable due to useCallback, so no need to include them
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

  return {
    selectTaskFromMap,
    selectMultipleTasksFromMap
  };
};

// Hook for task table components to get prioritized task list
export const useTaskTableSelection = () => {
  const { getPrioritizedTasks, selectedTaskIds, isTaskSelected, toggleTaskSelection } = useSelectionUI();

  return {
    getPrioritizedTasks,
    selectedTaskIds,
    isTaskSelected,
    toggleTaskSelection
  };
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