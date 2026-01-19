import { useCallback, useEffect, useState, useMemo, type ReactNode } from 'react'
import { Box, Stack, Switch, Typography, useTheme } from '@mui/material'
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
import TableContextMenu from './Right Click - MUI Component'

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
  disableSorting?: boolean
  pageSizeOptions?: number[]
  initialPageSize?: number
  emptyState?: ReactNode
  height?: string | number
  apiRef?: ReturnType<typeof useGridApiRef>
  onCellClick?: (params: GridCellParams<T>, event: MuiEvent<React.MouseEvent>) => void
  onCellDoubleClick?: (params: GridCellParams<T>, event: MuiEvent<React.MouseEvent>) => void
  getRowClassName?: (params: { id: GridRowId; row: T }) => string
  contextMenuItems?: Array<{
    label: string
    onClick: () => void
    divider?: boolean
  }>
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
  disableSorting = false,
  pageSizeOptions,
  initialPageSize = 16,
  emptyState,
  height = '60vh',
  apiRef: externalApiRef,
  onCellClick,
  onCellDoubleClick,
  getRowClassName,
  contextMenuItems,
}: SharedMuiTableProps<T>) {
  const theme = useTheme()
  const internalApiRef = useGridApiRef()
  const apiRef = externalApiRef || internalApiRef
  const [densityMode, setDensityMode] = useState(density)
  const resolvedPageSizeOptions = pageSizeOptions?.length ? pageSizeOptions : [16, 32, 64]
  const normalizedInitialPageSize = initialPageSize ?? resolvedPageSizeOptions[0]
  const resolvedInitialPageSize = normalizedInitialPageSize > 0 ? normalizedInitialPageSize : resolvedPageSizeOptions[0]
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: resolvedInitialPageSize,
    page: 0,
  })

  // Context menu using the reusable hook
  const contextMenu = TableContextMenu<T>({
    additionalItems: contextMenuItems,
  })

  // Apply touch event wrappers to columns
  const modifiedColumns: GridColDef[] = useMemo(() => {
    let cols = columns.map(col => ({ ...col, sortable: disableSorting ? false : col.sortable }))

    // Wrap columns with touch events for mobile support
    cols = cols.map(col => contextMenu.wrapColumnWithTouchEvents(col))

    return cols
  }, [columns, disableSorting, contextMenu])

  // Combined cell click handler for both context menu and custom clicks
  const handleCellClick = useCallback((params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
    if (event.button === 2) { // Right-click
      contextMenu.handleCellRightClick(params, event)
    } else if (onCellClick) {
      onCellClick(params, event)
    }
  }, [contextMenu, onCellClick])

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
        sx={{ width: '100%' }}
      >
        <DataGrid
        sx={{
          height: height,
          width: '100%',
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-columnHeader': {
            fontSize: '0.75rem', // 12px - same as caption variant
            fontWeight: 600,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: '0.75rem', // 12px - same as caption variant
            fontWeight: 600,
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
          '& .selected-row': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(20, 32, 49, 0.25)' 
              : 'rgba(67, 176, 114, 0.08)', // energyAccent green with low opacity
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(20, 32, 49, 0.35)' 
                : 'rgba(67, 176, 114, 0.12)', // energyAccent green with slightly higher opacity on hover
            },
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(20, 32, 49, 0.25) !important' 
              : 'rgba(67, 176, 114, 0.08) !important', // Override MUI's default blue selection
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(20, 32, 49, 0.35) !important' 
                : 'rgba(67, 176, 114, 0.12) !important',
            },
          },
        }}
        apiRef={apiRef}
        rows={rows}
        columns={modifiedColumns}
        getRowId={getRowId}
        getRowClassName={getRowClassName}
        density={densityMode}
        loading={loading}
        hideFooter={hideFooter || !enablePagination}
        autoHeight={false}
        {...(enablePagination && {
          pagination: true as const,
          pageSizeOptions: resolvedPageSizeOptions,
          paginationModel,
          onPaginationModelChange: setPaginationModel,
        })}
        disableRowSelectionOnClick={true}
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
      {contextMenu.contextMenuComponent}
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
