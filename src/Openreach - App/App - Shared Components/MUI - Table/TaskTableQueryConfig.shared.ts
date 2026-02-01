import { TASK_STATUS_LABELS, type TaskSkillCode, type TaskTableRow } from '../../App - Data Tables/Task - Table';

// Combined status type that includes ACT sub-states
export type CombinedStatusFilter = 
  | 'ACT-assigned' 
  | 'ACT-not-assigned' 
  | 'ACT-waiting-confirmation'
  | Exclude<TaskTableRow['status'], 'ACT'>

export type TaskTableQueryState = {
  searchTerm: string;
  divisions: TaskTableRow['division'][];
  domains: TaskTableRow['domainId'][];
  statuses: CombinedStatusFilter[];
  capabilities: TaskSkillCode[];
  responseCodes: TaskTableRow['responseCode'][];
  commitTypes: TaskTableRow['commitType'][];
  updatedFrom: string | null;
  updatedTo: string | null;
  impactOperator?: 'gt' | 'lt' | 'eq' | null;
  impactValue?: number | null;
};

export const buildDefaultTaskTableQuery = (): TaskTableQueryState => ({
  searchTerm: '',
  divisions: [],
  domains: [],
  statuses: [],
  capabilities: [],
  responseCodes: [],
  commitTypes: [],
  updatedFrom: null,
  updatedTo: null,
  impactOperator: null,
  impactValue: null,
});

export type TaskFilterTab = 'simple' | 'advanced';

export const TASK_FILTER_TABS: Array<{ value: TaskFilterTab; label: string }> = [
  { value: 'simple', label: 'Simple view' },
  { value: 'advanced', label: 'Advanced view' },
];

// Combined status options that match ProgressTaskDialog structure
export const DEFAULT_COMBINED_STATUSES: CombinedStatusFilter[] = [
  'ACT-assigned',
  'ACT-waiting-confirmation', 
  'ACT-not-assigned',
  'AWI',
  'ISS', 
  'EXC',
  'COM',
  'FUR',
  'CMN',
  'HPD',
  'HLD',
  'CPD',
  'DLG',
  'CAN'
];

export const DEFAULT_STATUSES: TaskTableRow['status'][] = ['ACT', 'AWI', 'ISS', 'EXC', 'COM', 'FUR', 'CMN', 'HPD', 'HLD', 'CPD', 'DLG', 'CAN'];

// Statuses that should appear on Gantt chart
export const GANTT_STATUSES: TaskTableRow['status'][] = ['ACT', 'AWI', 'ISS', 'EXC', 'COM', 'HLD'];

// Combined status labels that match ProgressTaskDialog
export const COMBINED_STATUS_LABELS: Record<CombinedStatusFilter, string> = {
  'ACT-assigned': 'Assigned',
  'ACT-waiting-confirmation': 'Waiting for Confirmation',
  'ACT-not-assigned': 'Not Assigned',
  AWI: 'Awaiting Issue',
  ISS: 'Issued',
  EXC: 'Executing',
  COM: 'Complete',
  FUR: 'Furthered',
  CMN: 'Common',
  HPD: 'Held Pending Details',
  HLD: 'Held Linked or Retained',
  CPD: 'Closed Pending Details',
  DLG: 'Dealing',
  CAN: 'Cancelled',
};

export const STATUS_OPTION_LABELS: Record<TaskTableRow['status'], string> = TASK_STATUS_LABELS;

/**
 * Helper function to check if a task matches a combined status filter
 * Centralizes the ACT sub-state matching logic
 */
export const taskMatchesStatusFilter = (task: TaskTableRow, statusFilter: CombinedStatusFilter): boolean => {
  if (statusFilter === 'ACT-assigned') {
    return task.status === 'ACT' && !!task.resourceId && task.awaitingConfirmation === 'N';
  }
  if (statusFilter === 'ACT-waiting-confirmation') {
    return task.status === 'ACT' && task.awaitingConfirmation === 'Y';
  }
  if (statusFilter === 'ACT-not-assigned') {
    return task.status === 'ACT' && !task.resourceId && task.awaitingConfirmation === 'N';
  }
  // For non-ACT statuses, match directly
  return task.status === statusFilter;
};

/**
 * Helper function to get display label for a task's current status
 * Handles ACT sub-states based on task properties
 */
export const getTaskStatusLabel = (task: TaskTableRow): string => {
  if (task.status === 'ACT') {
    if (task.awaitingConfirmation === 'Y') return 'Waiting for Confirmation';
    if (task.resourceId) return 'Assigned';
    return 'Not Assigned';
  }
  return TASK_STATUS_LABELS[task.status];
};
