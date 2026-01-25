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
import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import type { TaskTableRow } from '../../App - Data Tables/Task - Table';
import type { ResourceTableRow } from '../../App - Data Tables/Resource - Table';

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
  
  // Resource selection
  selectedResourceIds: string[];
  lastInteractedResourceId: string | null;
  resourceSelectionSource: 'map' | 'table' | null;
  isResourceSelected: (resourceId: string) => boolean;
  isLastResourceInteracted: (resourceId: string) => boolean;
  toggleResourceSelection: (resourceId: string, multiSelect?: boolean, source?: 'map' | 'table') => void;
  rangeSelectResources: (resourceId: string, allResourceIds: string[], additive?: boolean, source?: 'map' | 'table') => void;
  clearResourceSelection: () => void;
  clearResourceSelectionOnSort: () => void;
  selectResources: (resourceIds: string[], source?: 'map' | 'table') => void;
  getPrioritizedResources: (allResources: ResourceTableRow[]) => ResourceTableRow[];
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
  const [shouldPrioritizeTasks, setShouldPrioritizeTasks] = useState(false); // Track if we should actively reorder
  const mapOrderedTaskIdsRef = useRef<string[]>([]); // Track the last map-established order (ref to avoid dependency loop)

  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [lastInteractedResourceId, setLastInteractedResourceId] = useState<string | null>(null);
  const [resourceSelectionSource, setResourceSelectionSource] = useState<'map' | 'table' | null>(null);
  const [shouldPrioritizeResources, setShouldPrioritizeResources] = useState(false); // Track if we should actively reorder
  const mapOrderedResourceIdsRef = useRef<string[]>([]); // Track the last map-established order (ref to avoid dependency loop)

  // Use Set for O(1) lookups
  const selectedTaskIdsSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);
  const selectedResourceIdsSet = useMemo(() => new Set(selectedResourceIds), [selectedResourceIds]);

  // Check if a task is selected - O(1) lookup
  const isTaskSelected = useCallback((taskId: string) => selectedTaskIdsSet.has(taskId), [selectedTaskIdsSet]);

  // Check if task is the last interacted
  const isLastInteracted = useCallback((taskId: string) => taskId === lastInteractedTaskId, [lastInteractedTaskId]);

  // Check if a resource is selected - O(1) lookup
  const isResourceSelected = useCallback((resourceId: string) => selectedResourceIdsSet.has(resourceId), [selectedResourceIdsSet]);

  // Check if resource is the last interacted
  const isLastResourceInteracted = useCallback((resourceId: string) => resourceId === lastInteractedResourceId, [lastInteractedResourceId]);

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
    
    // Map/Gantt selections should trigger prioritization
    if (source === 'map') {
      setSelectionSource('map');
      setShouldPrioritizeTasks(true);
    } else {
      // Table clicks preserve the map source but stop active prioritization
      // This keeps the current order established by map but prevents further reordering
      setSelectionSource(prevSource => prevSource === 'map' ? prevSource : 'table');
      setShouldPrioritizeTasks(false);
    }
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
    
    // Map/Gantt selections should trigger prioritization
    if (source === 'map') {
      setSelectionSource('map');
      setShouldPrioritizeTasks(true);
    } else {
      // Table clicks preserve the map source but stop active prioritization
      setSelectionSource(prevSource => prevSource === 'map' ? prevSource : 'table');
      setShouldPrioritizeTasks(false);
    }
  }, [lastInteractedTaskId]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
    setLastInteractedTaskId(null);
    setShouldPrioritizeTasks(false);
    mapOrderedTaskIdsRef.current = [];
  }, []);

  // Clear selection when user sorts table - resets to default behavior
  const clearSelectionOnSort = useCallback(() => {
    setSelectedTaskIds([]);
    setLastInteractedTaskId(null);
    setSelectionSource(null);
    setShouldPrioritizeTasks(false);
    mapOrderedTaskIdsRef.current = [];
  }, []);

  // Select multiple tasks at once
  const selectTasks = useCallback((taskIds: string[], source: 'map' | 'table' = 'table') => {
    setSelectedTaskIds(taskIds);
    setSelectionSource(source);
    setShouldPrioritizeTasks(source === 'map');
  }, []);

  // Get tasks with selected tasks prioritized (moved to top) - optimized single pass
  const getPrioritizedTasks = useCallback((tasks: TaskTableRow[]) => {
    const mapOrderedTaskIds = mapOrderedTaskIdsRef.current;
    
    // If we have a map-established order, use it (preserves order across table selections)
    if (mapOrderedTaskIds.length > 0 && !shouldPrioritizeTasks) {
      const taskMap = new Map<string, TaskTableRow>();
      tasks.forEach(task => taskMap.set(task.taskId, task));
      
      // Build array maintaining map order, then append any new tasks not in the order
      const orderedTasks: TaskTableRow[] = [];
      const orderedSet = new Set(mapOrderedTaskIds);
      
      mapOrderedTaskIds.forEach(taskId => {
        const task = taskMap.get(taskId);
        if (task) orderedTasks.push(task);
      });
      
      // Add any tasks not in the preserved order
      tasks.forEach(task => {
        if (!orderedSet.has(task.taskId)) {
          orderedTasks.push(task);
        }
      });
      
      return orderedTasks;
    }
    
    // Only prioritize if we should actively reorder (map/gantt selection, not subsequent table clicks)
    // Return early to preserve array reference and prevent unnecessary re-renders
    if (!shouldPrioritizeTasks || selectedTaskIds.length === 0) {
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

    const reorderedTasks = [...selectedTasks, ...unselectedTasks];
    
    // Save this order as the map-established order
    mapOrderedTaskIdsRef.current = reorderedTasks.map(t => t.taskId);
    
    return reorderedTasks;
  }, [shouldPrioritizeTasks, selectedTaskIds, selectedTaskIdsSet]);

  // Resource selection methods
  const toggleResourceSelection = useCallback((resourceId: string, multiSelect = false, source: 'map' | 'table' = 'table') => {
    setLastInteractedResourceId(resourceId);
    setSelectedResourceIds(prev => {
      const isCurrentlySelected = prev.includes(resourceId);

      if (multiSelect) {
        return isCurrentlySelected ? prev.filter(id => id !== resourceId) : [...prev, resourceId];
      } else {
        return isCurrentlySelected && prev.length === 1 ? [] : [resourceId];
      }
    });
    
    // Map/Gantt selections should trigger prioritization
    if (source === 'map') {
      setResourceSelectionSource('map');
      setShouldPrioritizeResources(true);
    } else {
      // Table clicks preserve the map source but stop active prioritization
      setResourceSelectionSource(prevSource => prevSource === 'map' ? prevSource : 'table');
      setShouldPrioritizeResources(false);
    }
  }, []);

  const rangeSelectResources = useCallback((resourceId: string, allResourceIds: string[], additive = false, source: 'map' | 'table' = 'table') => {
    setLastInteractedResourceId(resourceId);
    
    if (!lastInteractedResourceId || !allResourceIds.includes(lastInteractedResourceId)) {
      setSelectedResourceIds([resourceId]);
    } else {
      const lastIndex = allResourceIds.indexOf(lastInteractedResourceId);
      const currentIndex = allResourceIds.indexOf(resourceId);
      
      const startIndex = Math.min(lastIndex, currentIndex);
      const endIndex = Math.max(lastIndex, currentIndex);
      const rangeIds = allResourceIds.slice(startIndex, endIndex + 1);
      
      setSelectedResourceIds(prev => 
        additive ? [...new Set([...prev, ...rangeIds])] : rangeIds
      );
    }
    
    // Map/Gantt selections should trigger prioritization
    if (source === 'map') {
      setResourceSelectionSource('map');
      setShouldPrioritizeResources(true);
    } else {
      // Table clicks preserve the map source but stop active prioritization
      setResourceSelectionSource(prevSource => prevSource === 'map' ? prevSource : 'table');
      setShouldPrioritizeResources(false);
    }
  }, [lastInteractedResourceId]);

  const clearResourceSelection = useCallback(() => {
    setSelectedResourceIds([]);
    setLastInteractedResourceId(null);
    setShouldPrioritizeResources(false);
    mapOrderedResourceIdsRef.current = [];
  }, []);

  const clearResourceSelectionOnSort = useCallback(() => {
    setSelectedResourceIds([]);
    setLastInteractedResourceId(null);
    setResourceSelectionSource(null);
    setShouldPrioritizeResources(false);
    mapOrderedResourceIdsRef.current = [];
  }, []);

  const selectResources = useCallback((resourceIds: string[], source: 'map' | 'table' = 'table') => {
    setSelectedResourceIds(resourceIds);
    setResourceSelectionSource(source);
    setShouldPrioritizeResources(source === 'map');
  }, []);

  const getPrioritizedResources = useCallback((resources: ResourceTableRow[]) => {
    const mapOrderedResourceIds = mapOrderedResourceIdsRef.current;
    
    // If we have a map-established order, use it (preserves order across table selections)
    if (mapOrderedResourceIds.length > 0 && !shouldPrioritizeResources) {
      const resourceMap = new Map<string, ResourceTableRow>();
      resources.forEach(resource => resourceMap.set(resource.resourceId, resource));
      
      const orderedResources: ResourceTableRow[] = [];
      const orderedSet = new Set(mapOrderedResourceIds);
      
      mapOrderedResourceIds.forEach(resourceId => {
        const resource = resourceMap.get(resourceId);
        if (resource) orderedResources.push(resource);
      });
      
      resources.forEach(resource => {
        if (!orderedSet.has(resource.resourceId)) {
          orderedResources.push(resource);
        }
      });
      
      return orderedResources;
    }
    
    // Only prioritize if we should actively reorder (map/gantt selection, not subsequent table clicks)
    // Return early to preserve array reference and prevent unnecessary re-renders
    if (!shouldPrioritizeResources || selectedResourceIds.length === 0) {
      return resources;
    }

    const resourceMap = new Map<string, ResourceTableRow>();
    resources.forEach(resource => resourceMap.set(resource.resourceId, resource));

    const selectedResources: ResourceTableRow[] = [];
    for (let i = selectedResourceIds.length - 1; i >= 0; i--) {
      const resource = resourceMap.get(selectedResourceIds[i]);
      if (resource) selectedResources.push(resource);
    }

    const unselectedResources = resources.filter(resource => !selectedResourceIdsSet.has(resource.resourceId));

    const reorderedResources = [...selectedResources, ...unselectedResources];
    
    // Save this order as the map-established order
    mapOrderedResourceIdsRef.current = reorderedResources.map(r => r.resourceId);
    
    return reorderedResources;
  }, [shouldPrioritizeResources, selectedResourceIds, selectedResourceIdsSet]);

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
    getPrioritizedTasks,
    selectedResourceIds,
    lastInteractedResourceId,
    resourceSelectionSource,
    isResourceSelected,
    isLastResourceInteracted,
    toggleResourceSelection,
    rangeSelectResources,
    clearResourceSelection,
    clearResourceSelectionOnSort,
    selectResources,
    getPrioritizedResources
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
    getPrioritizedTasks,
    selectedResourceIds,
    lastInteractedResourceId,
    resourceSelectionSource,
    isResourceSelected,
    isLastResourceInteracted,
    toggleResourceSelection,
    rangeSelectResources,
    clearResourceSelection,
    clearResourceSelectionOnSort,
    selectResources,
    getPrioritizedResources
  ]);

  return (
    <SelectionUIContext.Provider value={value}>
      {children}
    </SelectionUIContext.Provider>
  );
};

// Hook for map components to easily select tasks
export const useMapSelection = () => {
  const { toggleTaskSelection, selectTasks, toggleResourceSelection, selectResources } = useSelectionUI();

  const selectTaskFromMap = useCallback((taskId: string, multiSelect = false) => {
    toggleTaskSelection(taskId, multiSelect, 'map');
  }, [toggleTaskSelection]);

  const selectMultipleTasksFromMap = useCallback((taskIds: string[]) => {
    selectTasks(taskIds, 'map');
  }, [selectTasks]);

  const selectResourceFromMap = useCallback((resourceId: string, multiSelect = false) => {
    toggleResourceSelection(resourceId, multiSelect, 'map');
  }, [toggleResourceSelection]);

  const selectMultipleResourcesFromMap = useCallback((resourceIds: string[]) => {
    selectResources(resourceIds, 'map');
  }, [selectResources]);

  return useMemo(() => ({
    selectTaskFromMap,
    selectMultipleTasksFromMap,
    selectResourceFromMap,
    selectMultipleResourcesFromMap
  }), [selectTaskFromMap, selectMultipleTasksFromMap, selectResourceFromMap, selectMultipleResourcesFromMap]);
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

// Hook for resource table components to get prioritized resource list
export const useResourceTableSelection = () => {
  const { 
    getPrioritizedResources, 
    selectedResourceIds, 
    lastInteractedResourceId,
    resourceSelectionSource,
    isResourceSelected, 
    isLastResourceInteracted,
    toggleResourceSelection, 
    rangeSelectResources,
    clearResourceSelectionOnSort
  } = useSelectionUI();

  return useMemo(() => ({
    getPrioritizedResources,
    selectedResourceIds,
    lastInteractedResourceId,
    resourceSelectionSource,
    isResourceSelected,
    isLastResourceInteracted,
    toggleResourceSelection,
    rangeSelectResources,
    clearResourceSelectionOnSort
  }), [
    getPrioritizedResources,
    selectedResourceIds,
    lastInteractedResourceId,
    resourceSelectionSource,
    isResourceSelected,
    isLastResourceInteracted,
    toggleResourceSelection,
    rangeSelectResources,
    clearResourceSelectionOnSort
  ]);
};