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
 * - Sort clears selection; map re-selection re-activates prioritization
 *
 * Usage:
 * 1. Wrap your app/page with SelectionUIProvider
 * 2. Use useMapSelection in map components
 * 3. Use useTaskTableSelection in task table components
 * 4. Call clearSelectionOnSort in table's onSortModelChange
 */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { TaskTableRow } from '../App - Data Tables/Task - Table';

interface SelectionUIContextType {
  selectedTaskIds: string[];
  lastInteractedTaskId: string | null;
  selectionSource: 'map' | 'table' | null;
  isTaskSelected: (taskId: string) => boolean;
  isLastInteracted: (taskId: string) => boolean;
  toggleTaskSelection: (taskId: string, multiSelect?: boolean, source?: 'map' | 'table') => void;
  rangeSelectTasks: (taskId: string, allTaskIds: string[], additive?: boolean, source?: 'map' | 'table') => void;
  clearSelection: () => void;
  clearSelectionOnSort: () => void;
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
}

export const SelectionUIProvider: React.FC<SelectionUIProviderProps> = ({ children }) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [lastInteractedTaskId, setLastInteractedTaskId] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] = useState<'map' | 'table' | null>(null);

  // Use Set for O(1) lookups
  const selectedTaskIdsSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);

  // Check if a task is selected - O(1) lookup
  const isTaskSelected = useCallback((taskId: string) => selectedTaskIdsSet.has(taskId), [selectedTaskIdsSet]);

  // Check if task is the last interacted
  const isLastInteracted = useCallback((taskId: string) => taskId === lastInteractedTaskId, [lastInteractedTaskId]);

  // Toggle task selection (supports multi-select with multiSelect flag)
  const toggleTaskSelection = useCallback((taskId: string, multiSelect = false, source: 'map' | 'table' = 'table') => {
    setLastInteractedTaskId(taskId);
    setSelectedTaskIds(prev => {
      const isCurrentlySelected = prev.includes(taskId);

      if (multiSelect) {
        // Multi-select mode: add/remove from selection
        return isCurrentlySelected ? prev.filter(id => id !== taskId) : [...prev, taskId];
      } else {
        // Single select mode: select only this task
        return isCurrentlySelected && prev.length === 1 ? [] : [taskId];
      }
    });
    setSelectionSource(source);
  }, []);

  // Range select tasks (Shift-click)
  // additive=true for CTRL+SHIFT (union), additive=false for SHIFT only (replace)
  const rangeSelectTasks = useCallback((taskId: string, allTaskIds: string[], additive = false, source: 'map' | 'table' = 'table') => {
    setLastInteractedTaskId(taskId);
    
    if (!lastInteractedTaskId || !allTaskIds.includes(lastInteractedTaskId)) {
      setSelectedTaskIds([taskId]);
    } else {
      // Find indices in CURRENT VISIBLE ORDER
      const lastIndex = allTaskIds.indexOf(lastInteractedTaskId);
      const currentIndex = allTaskIds.indexOf(taskId);
      
      // Select all tasks in range (inclusive)
      const startIndex = Math.min(lastIndex, currentIndex);
      const endIndex = Math.max(lastIndex, currentIndex);
      const rangeIds = allTaskIds.slice(startIndex, endIndex + 1);
      
      setSelectedTaskIds(prev => 
        additive ? [...new Set([...prev, ...rangeIds])] : rangeIds
      );
    }
    setSelectionSource(source);
  }, [lastInteractedTaskId]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
    setLastInteractedTaskId(null);
  }, []);

  // Clear selection when user sorts table - resets to default behavior
  const clearSelectionOnSort = useCallback(() => {
    setSelectedTaskIds([]);
    setLastInteractedTaskId(null);
    setSelectionSource(null);
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

    const taskMap = new Map<string, TaskTableRow>();
    tasks.forEach(task => taskMap.set(task.taskId, task));

    // Build selected tasks in reverse order (most recently selected first)
    const selectedTasks: TaskTableRow[] = [];
    for (let i = selectedTaskIds.length - 1; i >= 0; i--) {
      const task = taskMap.get(selectedTaskIds[i]);
      if (task) selectedTasks.push(task);
    }

    // Build unselected tasks
    const unselectedTasks = tasks.filter(task => !selectedTaskIdsSet.has(task.taskId));

    return [...selectedTasks, ...unselectedTasks];
  }, [selectedTaskIds, selectedTaskIdsSet, selectionSource]);

  const value = useMemo(() => ({
    selectedTaskIds,
    lastInteractedTaskId,
    selectionSource,
    isTaskSelected,
    isLastInteracted,
    toggleTaskSelection,
    rangeSelectTasks,
    clearSelection,
    clearSelectionOnSort,
    selectTasks,
    getPrioritizedTasks
  }), [
    selectedTaskIds,
    lastInteractedTaskId,
    selectionSource,
    isTaskSelected,
    isLastInteracted,
    toggleTaskSelection,
    rangeSelectTasks,
    clearSelection,
    clearSelectionOnSort,
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
    selectionSource,
    isTaskSelected, 
    isLastInteracted,
    toggleTaskSelection, 
    rangeSelectTasks,
    clearSelectionOnSort
  } = useSelectionUI();

  return useMemo(() => ({
    getPrioritizedTasks,
    selectedTaskIds,
    lastInteractedTaskId,
    selectionSource,
    isTaskSelected,
    isLastInteracted,
    toggleTaskSelection,
    rangeSelectTasks,
    clearSelectionOnSort
  }), [
    getPrioritizedTasks,
    selectedTaskIds,
    lastInteractedTaskId,
    selectionSource,
    isTaskSelected,
    isLastInteracted,
    toggleTaskSelection,
    rangeSelectTasks,
    clearSelectionOnSort
  ]);
};

// Example usage in MUI DataGrid with proper selection coordination:
/*
import { useTaskTableSelection } from '../Selection - UI';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';

function TaskTable({ tasks }: { tasks: TaskTableRow[] }) {
  const apiRef = useGridApiRef();
  const { 
    getPrioritizedTasks, 
    isTaskSelected, 
    toggleTaskSelection, 
    rangeSelectTasks,
    clearSelectionOnSort 
  } = useTaskTableSelection();

  const displayTasks = getPrioritizedTasks(tasks);

  const handleSortModelChange = () => {
    clearSelectionOnSort(); // Resets selection, allows map to re-prioritize later
  };

  const handleRowClick = (params: GridRowParams, event: React.MouseEvent) => {
    const taskId = params.row.taskId;
    
    // Get visible row IDs in current display order
    const visibleRowIds = apiRef.current.getSortedRowIds().map(id => 
      apiRef.current.getRow(id)?.taskId
    ).filter(Boolean) as string[];

    if (event.shiftKey) {
      rangeSelectTasks(taskId, visibleRowIds, event.ctrlKey || event.metaKey, 'table');
    } else {
      toggleTaskSelection(taskId, event.ctrlKey || event.metaKey, 'table');
    }
  };

  return (
    <DataGrid
      apiRef={apiRef}
      rows={displayTasks}
      onSortModelChange={handleSortModelChange}
      onRowClick={handleRowClick}
      getRowClassName={(params) => 
        isTaskSelected(params.row.taskId) ? 'selected-row' : ''
      }
    />
  );
}
*/
