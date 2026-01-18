import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { TaskTableRow } from '../App - Data Tables/Task - Table';

interface SelectionUIContextType {
  selectedTaskIds: string[];
  selectedTasks: TaskTableRow[];
  isTaskSelected: (taskId: string) => boolean;
  toggleTaskSelection: (taskId: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  selectTasks: (taskIds: string[]) => void;
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

  // Get selected task objects
  const selectedTasks = useMemo(() => {
    return allTasks.filter(task => selectedTaskIds.includes(task.taskId));
  }, [allTasks, selectedTaskIds]);

  // Check if a task is selected
  const isTaskSelected = useCallback((taskId: string) => {
    return selectedTaskIds.includes(taskId);
  }, [selectedTaskIds]);

  // Toggle task selection (supports multi-select with multiSelect flag)
  const toggleTaskSelection = useCallback((taskId: string, multiSelect = false) => {
    setSelectedTaskIds(prev => {
      const isCurrentlySelected = prev.includes(taskId);

      if (multiSelect) {
        // Multi-select mode: add/remove from selection
        if (isCurrentlySelected) {
          return prev.filter(id => id !== taskId);
        } else {
          return [...prev, taskId];
        }
      } else {
        // Single select mode: replace selection
        return isCurrentlySelected ? [] : [taskId];
      }
    });
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  // Select multiple tasks at once
  const selectTasks = useCallback((taskIds: string[]) => {
    setSelectedTaskIds(taskIds);
  }, []);

  // Get tasks with selected tasks prioritized (moved to top)
  const getPrioritizedTasks = useCallback((tasks: TaskTableRow[]) => {
    if (selectedTaskIds.length === 0) {
      return tasks;
    }

    const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.taskId));
    const unselectedTasks = tasks.filter(task => !selectedTaskIds.includes(task.taskId));

    // Return selected tasks first, then unselected tasks
    return [...selectedTasks, ...unselectedTasks];
  }, [selectedTaskIds]);

  const value = useMemo(() => ({
    selectedTaskIds,
    selectedTasks,
    isTaskSelected,
    toggleTaskSelection,
    clearSelection,
    selectTasks,
    getPrioritizedTasks
  }), [
    selectedTaskIds,
    selectedTasks,
    isTaskSelected,
    toggleTaskSelection,
    clearSelection,
    selectTasks,
    getPrioritizedTasks
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
    toggleTaskSelection(taskId, multiSelect);
  }, [toggleTaskSelection]);

  const selectMultipleTasksFromMap = useCallback((taskIds: string[]) => {
    selectTasks(taskIds);
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