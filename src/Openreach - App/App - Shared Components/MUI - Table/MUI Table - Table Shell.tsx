import { useCallback, useEffect, useState, useMemo, memo, type ReactNode } from 'react'
import { Box, Stack, Switch, Typography, useTheme, type SxProps, type Theme } from '@mui/material'
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
  sortModel?: any[]
  pageSizeOptions?: number[]
  initialPageSize?: number
  emptyState?: ReactNode
  height?: string | number
  apiRef?: ReturnType<typeof useGridApiRef>
  onCellClick?: (params: GridCellParams<T>, event: MuiEvent<React.MouseEvent>) => void
  onCellDoubleClick?: (params: GridCellParams<T>, event: MuiEvent<React.MouseEvent>) => void
  onSortModelChange?: (model: any) => void
  getRowClassName?: (params: { id: GridRowId; row: T }) => string
  sx?: SxProps<Theme>
  contextMenuItems?: Array<{
    label: string
    onClick: () => void
    divider?: boolean
  }>
}

// Memoized NoRowsOverlay to prevent recreation
const NoRowsOverlay = memo(({ emptyState }: { emptyState?: ReactNode }) => (
  <Box sx={{ py: 4, textAlign: 'center' }}>
    {emptyState ?? (
      <Typography variant="body2" color="text.secondary">
        No records available yet.
      </Typography>
    )}
  </Box>
));
NoRowsOverlay.displayName = 'NoRowsOverlay';

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
  sortModel,
  pageSizeOptions,
  initialPageSize = 16,
  emptyState,
  height = '60vh',
  apiRef: externalApiRef,
  onCellClick,
  onCellDoubleClick,
  onSortModelChange,
  getRowClassName,
  sx,
  contextMenuItems,
}: SharedMuiTableProps<T>) {
  const theme = useTheme()
  const internalApiRef = useGridApiRef()
  const apiRef = externalApiRef || internalApiRef
  const [densityMode, setDensityMode] = useState(density)
  
  // Memoize page size options to prevent recreation
  const resolvedPageSizeOptions = useMemo(() => 
    pageSizeOptions?.length ? pageSizeOptions : [16, 32, 64], 
    [pageSizeOptions]
  );
  
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

  // Extract stable methods to avoid dependency warnings
  const { handleCellRightClick, wrapColumnWithTouchEvents, contextMenuComponent } = contextMenu

  // Apply touch event wrappers to columns - memoize to prevent column recreation
  const modifiedColumns: GridColDef[] = useMemo(() => {
    let cols = columns.map(col => ({ ...col, sortable: disableSorting ? false : col.sortable }))

    // Wrap columns with touch events for mobile support
    cols = cols.map(col => wrapColumnWithTouchEvents(col))

    return cols
  }, [columns, disableSorting, wrapColumnWithTouchEvents])

  // Combined cell click handler for both context menu and custom clicks - stabilized
  const handleCellClick = useCallback((params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
    if (event.button === 2) { // Right-click
      handleCellRightClick(params, event)
    } else if (onCellClick) {
      onCellClick(params, event)
    }
  }, [handleCellRightClick, onCellClick])

  useEffect(() => {
    setDensityMode(density)
  }, [density])

  const handleDensityToggle = useCallback((nextDense: boolean) => {
    setDensityMode(nextDense ? 'compact' : 'standard')
  }, [])

  // Memoize NoRowsOverlay slot
  const NoRowsComponent = useCallback(() => <NoRowsOverlay emptyState={emptyState} />, [emptyState]);

  // Memoize toolbar slot to prevent recreation
  const ToolbarComponent = useMemo(() => {
    if (!enableQuickFilter) return undefined;
    return () => (
      <QuickFilterToolbar
        densityMode={densityMode}
        onToggleDensity={handleDensityToggle}
      />
    );
  }, [enableQuickFilter, densityMode, handleDensityToggle]);

  return (
    <>
      <Box
        sx={{ width: '100%' }}
        role="region"
        aria-label="Data table"
      >
        <DataGrid
        sx={{
          height: height,
          width: '100%',
          userSelect: 'none',
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
              ? 'rgba(144, 202, 249, 0.12)' 
              : 'rgba(25, 118, 210, 0.08)',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(144, 202, 249, 0.18)' 
                : 'rgba(25, 118, 210, 0.12)',
            },
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(144, 202, 249, 0.12) !important' 
              : 'rgba(25, 118, 210, 0.08) !important',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(144, 202, 249, 0.18) !important' 
                : 'rgba(25, 118, 210, 0.12) !important',
            },
          },
          '& .MuiDataGrid-cell:focus': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '-2px',
          },
          '& .MuiDataGrid-columnHeader:focus': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '-2px',
          },
          ...sx,
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
        {...(sortModel !== undefined && {
          sortingMode: 'server' as const,
          sortModel,
        })}
        {...(enablePagination && {
          pagination: true as const,
          pageSizeOptions: resolvedPageSizeOptions,
          paginationModel,
          onPaginationModelChange: setPaginationModel,
        })}
        disableRowSelectionOnClick={true}
        onCellClick={handleCellClick}
        onCellDoubleClick={onCellDoubleClick}
        onSortModelChange={onSortModelChange}
        aria-label="Interactive data table"
        slots={{
          toolbar: ToolbarComponent,
          noRowsOverlay: NoRowsComponent,
        }}
      />
      </Box>
      {contextMenuComponent}
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
