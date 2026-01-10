import { TASK_STATUS_LABELS, type TaskSkillCode, type TaskTableRow } from '../../App - Data Tables/Task - Table';

export type TaskTableQueryState = {
  searchTerm: string;
  divisions: TaskTableRow['division'][];
  domains: TaskTableRow['domainId'][];
  statuses: TaskTableRow['status'][];
  capabilities: TaskSkillCode[];
  responseCodes: TaskTableRow['responseCode'][];
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

export const DEFAULT_STATUSES: TaskTableRow['status'][] = ['ACT', 'AWI', 'ISS', 'EXC', 'COM'];

export const STATUS_OPTION_LABELS: Record<TaskTableRow['status'], string> = TASK_STATUS_LABELS;
