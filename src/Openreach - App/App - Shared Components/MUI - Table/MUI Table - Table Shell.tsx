import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Box, Stack, Switch, Typography, Menu, MenuItem } from '@mui/material'
import {
  DataGrid,
  GridToolbarQuickFilter,
  useGridApiRef,
  type GridColDef,
  type GridPaginationModel,
  type GridRowId,
  type GridValidRowModel,
  type MuiEvent,
  type GridCellParams,
} from '@mui/x-data-grid'

interface SharedMuiTableProps<T extends GridValidRowModel = GridValidRowModel> {
  columns: GridColDef[]
  rows: T[]
  title?: string
  caption?: string
  getRowId: (row: T) => GridRowId
  density?: 'compact' | 'standard' | 'comfortable'
  loading?: boolean
  hideFooter?: boolean
  enablePagination?: boolean
  enableQuickFilter?: boolean
  pageSizeOptions?: number[]
  initialPageSize?: number
  emptyState?: ReactNode
  onCellClick?: (params: GridCellParams<T>, event: MuiEvent<React.MouseEvent>) => void
  onCellDoubleClick?: (params: GridCellParams<T>, event: MuiEvent<React.MouseEvent>) => void
  onCellTouchStart?: (params: GridCellParams<T>, event: React.TouchEvent) => void
  onCellTouchEnd?: (params: GridCellParams<T>, event: React.TouchEvent) => void
  onCellTouchMove?: (params: GridCellParams<T>, event: React.TouchEvent) => void
}

export function SharedMuiTable<T extends GridValidRowModel = GridValidRowModel>({
  columns,
  rows,
  getRowId,
  density = 'compact',
  loading,
  hideFooter = false,
  enablePagination = true,
  enableQuickFilter = false,
  pageSizeOptions,
  initialPageSize = 16,
  emptyState,
  onCellClick,
  onCellDoubleClick,
  onCellTouchStart,
  onCellTouchEnd,
  onCellTouchMove,
}: SharedMuiTableProps<T>) {
  const apiRef = useGridApiRef()
  const [densityMode, setDensityMode] = useState(density)
  const resolvedPageSizeOptions = pageSizeOptions?.length ? pageSizeOptions : [16, 32, 64]
  const normalizedInitialPageSize = initialPageSize ?? resolvedPageSizeOptions[0]
  const resolvedInitialPageSize = normalizedInitialPageSize > 0 ? normalizedInitialPageSize : resolvedPageSizeOptions[0]
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: resolvedInitialPageSize,
    page: 0,
  })

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    value: string;
  } | null>(null)

  const handleCellClick = useCallback((params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
    if (event.button === 2) { // Right-click
      event.preventDefault()
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
        value: params.value != null ? String(params.value) : '',
      })
    } else if (onCellClick) {
      onCellClick(params, event)
    }
  }, [onCellClick])

  const handleCloseContextMenu = () => setContextMenu(null)

  const handleCopyValue = async () => {
    if (contextMenu?.value) {
      await navigator.clipboard.writeText(contextMenu.value)
    }
    setContextMenu(null)
  }

  useEffect(() => {
    setDensityMode(density)
  }, [density])

  const handleDensityToggle = useCallback((nextDense: boolean) => {
    setDensityMode(nextDense ? 'compact' : 'standard')
  }, [])

  const NoRowsOverlay = () => (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      {emptyState ?? (
        <Typography variant="body2" color="text.secondary">
          No records available yet.
        </Typography>
      )}
    </Box>
  )

  return (
    <>
      <Box
        onTouchStart={onCellTouchStart ? (e) => {
          // Handle touch start on table level
          const target = e.target as HTMLElement
          const cell = target.closest('.MuiDataGrid-cell')
          if (cell) {
            const rowId = cell.getAttribute('data-rowindex')
            const colField = cell.getAttribute('data-field')
            if (rowId && colField) {
              const row = rows[parseInt(rowId)]
              if (row) {
                onCellTouchStart({ row, field: colField, id: getRowId(row) } as GridCellParams<T>, e)
              }
            }
          }
        } : undefined}
        onTouchEnd={onCellTouchEnd ? (e) => {
          const target = e.target as HTMLElement
          const cell = target.closest('.MuiDataGrid-cell')
          if (cell) {
            const rowId = cell.getAttribute('data-rowindex')
            const colField = cell.getAttribute('data-field')
            if (rowId && colField) {
              const row = rows[parseInt(rowId)]
              if (row) {
                onCellTouchEnd({ row, field: colField, id: getRowId(row) } as GridCellParams<T>, e)
              }
            }
          }
        } : undefined}
        onTouchMove={onCellTouchMove ? (e) => {
          const target = e.target as HTMLElement
          const cell = target.closest('.MuiDataGrid-cell')
          if (cell) {
            const rowId = cell.getAttribute('data-rowindex')
            const colField = cell.getAttribute('data-field')
            if (rowId && colField) {
              const row = rows[parseInt(rowId)]
              if (row) {
                onCellTouchMove({ row, field: colField, id: getRowId(row) } as GridCellParams<T>, e)
              }
            }
          }
        } : undefined}
        sx={{ width: '100%' }}
      >
        <DataGrid
        sx={{
          height: '100%',
          width: '100%',
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
          },
          '& .action-col': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          },
          '& .action-col.MuiDataGrid-cell:focus-within': {
            outline: 'none',
            boxShadow: 'none',
            border: 'none',
          },
        }}
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        density={densityMode}
        loading={loading}
        hideFooter={hideFooter}
        autoHeight={false}
        {...(enablePagination && {
          pagination: true as const,
          pageSizeOptions: resolvedPageSizeOptions,
          paginationModel,
          onPaginationModelChange: setPaginationModel,
        })}
        disableRowSelectionOnClick={false}
        onCellClick={handleCellClick}
        onCellDoubleClick={onCellDoubleClick}
        slots={{
          toolbar: enableQuickFilter
            ? () => (
                <QuickFilterToolbar
                  densityMode={densityMode}
                  onToggleDensity={handleDensityToggle}
                />
              )
            : undefined,
          noRowsOverlay: NoRowsOverlay,
        }}
      />
      </Box>
      <Menu
        open={!!contextMenu}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem disabled sx={{ fontSize: 13, opacity: 0.7 }}>
          Copy value
        </MenuItem>
        <MenuItem onClick={handleCopyValue} sx={{ fontFamily: 'monospace', fontSize: 15 }}>
          {contextMenu?.value || '(empty)'}
        </MenuItem>
      </Menu>
    </>
  )
}

export default SharedMuiTable

function QuickFilterToolbar({
  densityMode,
  onToggleDensity,
}: {
  densityMode: 'compact' | 'standard' | 'comfortable'
  onToggleDensity: (dense: boolean) => void
}) {
  return (
    <Stack
      px={1.5}
      py={1}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
    >
      <Box flex={1}>
        <GridToolbarQuickFilter
          debounceMs={250}
          quickFilterParser={(value) => value.split(/\s+/).filter(Boolean)}
        />
      </Box>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Dense rows
        </Typography>
        <Switch
          size="small"
          checked={densityMode === 'compact'}
          onChange={(e) => onToggleDensity(e.target.checked)}
          inputProps={{ 'aria-label': 'Toggle dense row view' }}
        />
      </Stack>
    </Stack>
  )
}
