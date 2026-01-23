import React, { useCallback, useState } from 'react'
import {
  InfoOutlined as InfoOutlinedIcon,
  CompareArrows as CompareArrowsIcon,
  EditNote as EditNoteIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import {
  type GridColDef,
  type GridRowId,
  type GridValidRowModel,
  type GridSortModel,
  type GridCellParams,
  type MuiEvent,
  useGridApiRef,
} from '@mui/x-data-grid'
import SharedMuiTable from './MUI Table - Table Shell'
import { AppTaskDialog } from '../MUI - More Info Component/App - Task Dialog'
import { MultiTaskDialog } from '../MUI - More Info Component/App - Multi Task Dialog'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'
import type { ContextMenuItem } from './Right Click - MUI Component'
import { useTaskTableSelection } from '../Selection - UI'

interface TaskTableShellProps<T extends GridValidRowModel & { taskId: string }> {
  columns: GridColDef[]
  rows: T[]
  getRowId: (row: T) => GridRowId
  density?: 'compact' | 'standard' | 'comfortable'
  loading?: boolean
  hideFooter?: boolean
  enablePagination?: boolean
  enableQuickFilter?: boolean
  disableSorting?: boolean
  sortModel?: GridSortModel
  pageSizeOptions?: number[]
  initialPageSize?: number
  height?: string | number
  onSortModelChange?: (model: GridSortModel) => void
  getRowClassName?: (params: { id: GridRowId; row: T }) => string
  onProgressTask?: (tasks: T[]) => void
  onAddQuickNote?: (tasks: T[]) => void
  onAddToDock?: (task: T) => void
}

export function TaskTableShell<T extends GridValidRowModel & { taskId: string }>({
  columns,
  rows,
  getRowId,
  density = 'compact',
  loading,
  hideFooter,
  enablePagination = true,
  enableQuickFilter = false,
  disableSorting = false,
  sortModel,
  pageSizeOptions,
  initialPageSize,
  height = '60vh',
  onSortModelChange,
  getRowClassName: externalGetRowClassName,
  onProgressTask,
  onAddQuickNote,
  onAddToDock,
}: TaskTableShellProps<T>) {
  const apiRef = useGridApiRef()
  
  // Selection UI integration for table row selection
  const { 
    selectedTaskIds,
    isTaskSelected,
    toggleTaskSelection, 
    rangeSelectTasks,
  } = useTaskTableSelection()
  
  // Dialog states
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [multiTaskDialogOpen, setMultiTaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<T | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<T[]>([])

  // Context menu handlers
  const handleOpenTaskDetail = useCallback((task: T) => {
    setSelectedTask(task)
    setTaskDialogOpen(true)
  }, [])

  const handleCompareTasks = useCallback((tasks: T[]) => {
    if (tasks.length > 3) {
      alert('You can compare up to 3 tasks maximum')
      return
    }
    setSelectedTasks(tasks)
    setMultiTaskDialogOpen(true)
  }, [])

  const handleProgressTask = useCallback((tasks: T[]) => {
    onProgressTask?.(tasks)
  }, [onProgressTask])

  const handleAddQuickNote = useCallback((tasks: T[]) => {
    onAddQuickNote?.(tasks)
  }, [onAddQuickNote])

  // Build context menu items based on selection
  const buildContextMenuItems = useCallback((rowData: T, selectedRowIds: (string | number)[]): ContextMenuItem[] => {
    if (!rowData) return []
    
    const selectedRows = selectedRowIds
      .map(id => rows.find(row => getRowId(row) === id))
      .filter((row): row is T => row !== undefined)
    
    const selectionCount = selectedRows.length
    const hasSelection = selectionCount > 0
    
    // If clicked row is not in selection, treat it as single selection
    const clickedRowId = getRowId(rowData)
    const isClickedInSelection = selectedRowIds.includes(clickedRowId)
    const effectiveSelection = isClickedInSelection && hasSelection ? selectedRows : [rowData]
    const effectiveCount = effectiveSelection.length

    const items: ContextMenuItem[] = []

    // Open Task Detail (single task only)
    if (effectiveCount === 1) {
      items.push({
        label: 'Open Task Detail',
        icon: <InfoOutlinedIcon fontSize="small" />,
        onClick: () => handleOpenTaskDetail(effectiveSelection[0]),
      })
    }

    // Compare Tasks (2-3 tasks)
    if (effectiveCount >= 2) {
      items.push({
        label: `Compare Tasks (${effectiveCount})`,
        icon: <CompareArrowsIcon fontSize="small" />,
        onClick: () => handleCompareTasks(effectiveSelection),
        disabled: effectiveCount > 3,
      })
    }

    // Divider before bulk actions
    if (items.length > 0) {
      items.push({ label: '', onClick: () => {}, divider: true })
    }

    // Progress Task (multi-select supported)
    items.push({
      label: effectiveCount > 1 ? `Progress ${effectiveCount} Tasks` : 'Progress Task',
      icon: <TrendingUpIcon fontSize="small" />,
      onClick: () => handleProgressTask(effectiveSelection),
    })

    // Add Quick Note (multi-select supported)
    items.push({
      label: effectiveCount > 1 ? `Add Quick Note to ${effectiveCount} Tasks` : 'Add Quick Note',
      icon: <EditNoteIcon fontSize="small" />,
      onClick: () => handleAddQuickNote(effectiveSelection),
    })

    return items
  }, [rows, getRowId, handleOpenTaskDetail, handleCompareTasks, handleProgressTask, handleAddQuickNote])

  // Row click handler - supports single, multi (Ctrl), and range (Shift) selection
  const handleCellClick = useCallback((params: GridCellParams<T>, event: MuiEvent<React.MouseEvent>) => {
    // Ignore clicks on action columns or non-data cells
    if (params.field === 'actions' || params.field === '__check__') return
    
    const taskId = params.row.taskId
    const isCtrlPressed = event.ctrlKey || event.metaKey
    const isShiftPressed = event.shiftKey
    
    if (isShiftPressed) {
      // Prevent text selection on shift+click
      event.stopPropagation()
      event.preventDefault()
      
      // Get sorted row IDs in current display order
      const sortedRowIds = apiRef.current?.getSortedRowIds?.() || rows.map(row => getRowId(row))
      const visibleRowIds = sortedRowIds
        .map(id => apiRef.current?.getRow(id)?.taskId)
        .filter(Boolean) as string[]
      
      rangeSelectTasks(taskId, visibleRowIds, isCtrlPressed, 'table')
    } else {
      toggleTaskSelection(taskId, isCtrlPressed, 'table')
    }
  }, [toggleTaskSelection, rangeSelectTasks, rows, getRowId, apiRef])
  
  // Row className - highlight selected rows
  const getRowClassName = useCallback((params: { id: GridRowId; row: T }) => {
    const isSelected = isTaskSelected(params.row.taskId)
    const externalClass = externalGetRowClassName?.(params) || ''
    return isSelected ? `selected-row ${externalClass}`.trim() : externalClass
  }, [isTaskSelected, externalGetRowClassName])

  const handleMultiTaskAddNote = useCallback((taskId: string, type: 'field' | 'progress', text: string) => {
    console.log('Add note:', type, text, 'to task:', taskId)
    // TODO: Implement note addition logic
  }, [])

  return (
    <>
      <SharedMuiTable
        apiRef={apiRef}
        columns={columns}
        rows={rows}
        getRowId={getRowId}
        density={density}
        loading={loading}
        hideFooter={hideFooter}
        enablePagination={enablePagination}
        enableQuickFilter={enableQuickFilter}
        disableSorting={disableSorting}
        sortModel={sortModel}
        pageSizeOptions={pageSizeOptions}
        initialPageSize={initialPageSize}
        height={height}
        onSortModelChange={onSortModelChange}
        getRowClassName={getRowClassName}
        onCellClick={handleCellClick}
        contextMenuItems={buildContextMenuItems}
        externalSelectedIds={selectedTaskIds}
      />

      {/* Single Task Dialog */}
      <AppTaskDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        task={selectedTask as unknown as TaskTableRow}
        onMinimize={onAddToDock && selectedTask ? () => {
          onAddToDock(selectedTask)
          setTaskDialogOpen(false)
        } : undefined}
      />

      {/* Multi Task Comparison Dialog */}
      <MultiTaskDialog
        open={multiTaskDialogOpen}
        onClose={() => setMultiTaskDialogOpen(false)}
        tasks={selectedTasks as unknown as TaskTableRow[]}
        onAddNote={handleMultiTaskAddNote}
        onMinimize={onAddToDock && selectedTasks.length > 0 ? () => {
          selectedTasks.forEach(task => onAddToDock(task))
          setMultiTaskDialogOpen(false)
        } : undefined}
      />
    </>
  )
}

export default React.memo(TaskTableShell) as typeof TaskTableShell;
