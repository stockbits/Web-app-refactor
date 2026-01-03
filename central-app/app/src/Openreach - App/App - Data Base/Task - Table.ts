export interface TaskTableRow {
  id: string
  name: string
  owner: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'In Progress' | 'Queued' | 'Blocked' | 'Complete'
  updatedAt: string
}

export const TASK_TABLE_ROWS: TaskTableRow[] = [
  {
    id: 'TK-1045',
    name: 'Schedule Live P1 follow-up',
    owner: 'R. Patel',
    priority: 'Critical',
    status: 'In Progress',
    updatedAt: '2026-01-03T08:15:00Z',
  },
  {
    id: 'TK-1046',
    name: 'Self-selection scoring review',
    owner: 'M. Zhang',
    priority: 'High',
    status: 'Queued',
    updatedAt: '2026-01-03T06:45:00Z',
  },
  {
    id: 'TK-1047',
    name: 'Domain asset audit import',
    owner: 'E. Ahmed',
    priority: 'Medium',
    status: 'Blocked',
    updatedAt: '2026-01-02T19:30:00Z',
  },
  {
    id: 'TK-1048',
    name: 'Travel profile recalibration',
    owner: 'J. Lewis',
    priority: 'Low',
    status: 'Complete',
    updatedAt: '2026-01-02T16:05:00Z',
  },
]
