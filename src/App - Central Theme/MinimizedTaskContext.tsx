import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { TaskTableRow } from '../Openreach - App/App - Data Tables/Task - Table';

interface MinimizedTaskContextType {
  minimizedTasks: TaskTableRow[];
  addMinimizedTask: (task: TaskTableRow) => void;
  removeMinimizedTask: (taskId: string) => void;
  restoreMinimizedTask: (taskId: string) => TaskTableRow | undefined;
}

const MinimizedTaskContext = createContext<MinimizedTaskContextType | undefined>(undefined);

export const MinimizedTaskProvider = ({ children }: { children: ReactNode }) => {
  const [minimizedTasks, setMinimizedTasks] = useState<TaskTableRow[]>([]);

  const addMinimizedTask = useCallback((task: TaskTableRow) => {
    setMinimizedTasks((prev) => {
      // Remove if already present, then add to front, max 5
      const filtered = prev.filter(t => t.taskId !== task.taskId);
      return [task, ...filtered].slice(0, 5);
    });
  }, []);

  const removeMinimizedTask = useCallback((taskId: string) => {
    setMinimizedTasks((prev) => prev.filter(t => t.taskId !== taskId));
  }, []);

  const restoreMinimizedTask = useCallback((taskId: string) => {
    let found: TaskTableRow | undefined;
    setMinimizedTasks((prev) => {
      found = prev.find(t => t.taskId === taskId);
      return prev.filter(t => t.taskId !== taskId);
    });
    return found;
  }, []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    minimizedTasks,
    addMinimizedTask,
    removeMinimizedTask,
    restoreMinimizedTask
  }), [minimizedTasks, addMinimizedTask, removeMinimizedTask, restoreMinimizedTask]);

  return (
    <MinimizedTaskContext.Provider value={contextValue}>
      {children}
    </MinimizedTaskContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMinimizedTasks = () => {
  const ctx = useContext(MinimizedTaskContext);
  if (!ctx) throw new Error('useMinimizedTasks must be used within MinimizedTaskProvider');
  return ctx;
};
