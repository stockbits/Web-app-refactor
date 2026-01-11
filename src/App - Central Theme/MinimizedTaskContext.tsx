import { createContext, useContext, useState } from 'react';
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

  const addMinimizedTask = (task: TaskTableRow) => {
    setMinimizedTasks((prev) => {
      // Remove if already present, then add to front, max 5
      const filtered = prev.filter(t => t.taskId !== task.taskId);
      return [task, ...filtered].slice(0, 5);
    });
  };

  const removeMinimizedTask = (taskId: string) => {
    setMinimizedTasks((prev) => prev.filter(t => t.taskId !== taskId));
  };

  const restoreMinimizedTask = (taskId: string) => {
    const found = minimizedTasks.find(t => t.taskId === taskId);
    setMinimizedTasks((prev) => prev.filter(t => t.taskId !== taskId));
    return found;
  };

  return (
    <MinimizedTaskContext.Provider value={{ minimizedTasks, addMinimizedTask, removeMinimizedTask, restoreMinimizedTask }}>
      {children}
    </MinimizedTaskContext.Provider>
  );
};

export const useMinimizedTasks = () => {
  const ctx = useContext(MinimizedTaskContext);
  if (!ctx) throw new Error('useMinimizedTasks must be used within MinimizedTaskProvider');
  return ctx;
};
