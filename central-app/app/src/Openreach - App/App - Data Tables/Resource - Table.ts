export interface ResourceTableRow {
  depot: string
  lead: string
  engineersAvailable: number
  engineersOnTask: number
  overtimeApproved: boolean
  lastCheckIn: string
}

export const RESOURCE_TABLE_ROWS: ResourceTableRow[] = [
  {
    depot: 'Northwich',
    lead: 'S. Morgan',
    engineersAvailable: 18,
    engineersOnTask: 15,
    overtimeApproved: true,
    lastCheckIn: '2026-01-03T06:00:00Z',
  },
  {
    depot: 'Leeds East',
    lead: 'P. Donovan',
    engineersAvailable: 22,
    engineersOnTask: 19,
    overtimeApproved: false,
    lastCheckIn: '2026-01-03T05:45:00Z',
  },
  {
    depot: 'Bristol Central',
    lead: 'T. Wallace',
    engineersAvailable: 14,
    engineersOnTask: 13,
    overtimeApproved: true,
    lastCheckIn: '2026-01-03T05:15:00Z',
  },
  {
    depot: 'Glasgow South',
    lead: 'A. Iqbal',
    engineersAvailable: 12,
    engineersOnTask: 11,
    overtimeApproved: false,
    lastCheckIn: '2026-01-03T04:50:00Z',
  },
]
