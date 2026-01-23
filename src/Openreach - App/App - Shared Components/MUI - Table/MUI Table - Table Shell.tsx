import { useCallback, useEffect, useState, useMemo, memo, type ReactNode } from 'react'
import { Box, Stack, Switch, Typography, useTheme, type SxProps, type Theme, Autocomplete, TextField } from '@mui/material'
import { STANDARD_INPUT_PROPS, STANDARD_AUTOCOMPLETE_PROPS } from '../../../AppCentralTheme/input-config.ts'
import {
  DataGrid,
  useGridApiRef,
  type GridColDef,
  type GridPaginationModel,
  type GridRowId,
  type GridValidRowModel,
  type MuiEvent,
  type GridCellParams,
  type GridSortModel,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
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
  sortModel?: GridSortModel
  pageSizeOptions?: number[]
  initialPageSize?: number
  emptyState?: ReactNode
  height?: string | number
  apiRef?: ReturnType<typeof useGridApiRef>
  onCellClick?: (params: GridCellParams<T>, event: MuiEvent<React.MouseEvent>) => void
  onCellDoubleClick?: (params: GridCellParams<T>, event: MuiEvent<React.MouseEvent>) => void
  onSortModelChange?: (model: GridSortModel) => void
  getRowClassName?: (params: { id: GridRowId; row: T }) => string
  sx?: SxProps<Theme>
  contextMenuItems?: Array<{
    label: string
    onClick: () => void
    divider?: boolean
    icon?: ReactNode
    disabled?: boolean
  }> | ((rowData: T, selectedRowIds: GridRowId[]) => Array<{
    label: string
    onClick: () => void
    divider?: boolean
    icon?: ReactNode
    disabled?: boolean
  }>)
  checkboxSelection?: boolean
  rowSelectionModel?: GridRowSelectionModel
  onRowSelectionModelChange?: (model: GridRowSelectionModel) => void
  externalSelectedIds?: string[]
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
  checkboxSelection = false,
  rowSelectionModel,
  onRowSelectionModelChange,
  externalSelectedIds,
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

  // Get selected row IDs - handle GridRowSelectionModel structure or external selection
  const selectedRowArray = useMemo(() => {
    // Prioritize external selected IDs (from Selection UI context)
    if (externalSelectedIds && externalSelectedIds.length > 0) {
      return externalSelectedIds
    }
    
    // Fallback to rowSelectionModel for components not using external selection
    if (!rowSelectionModel) return []
    // GridRowSelectionModel is { type: 'include' | 'exclude', ids: Set<GridRowId> }
    if (typeof rowSelectionModel === 'object' && 'ids' in rowSelectionModel) {
      const modelWithIds = rowSelectionModel as { ids: Set<GridRowId> }
      return Array.from(modelWithIds.ids).map((id: GridRowId) => String(id))
    }
    // Fallback for potential legacy array format
    const modelArray = rowSelectionModel as GridRowId[]
    return Array.isArray(modelArray) ? modelArray.map((id: GridRowId) => String(id)) : []
  }, [rowSelectionModel, externalSelectedIds])

  // Context menu using the reusable hook with dynamic items
  const contextMenu = TableContextMenu({
    additionalItems: contextMenuItems as unknown as Parameters<typeof TableContextMenu>[0]['additionalItems'],
    selectedRows: selectedRowArray,
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

  // Combined cell click handler for custom clicks
  const handleCellClick = useCallback((params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
    if (onCellClick) {
      onCellClick(params, event)
    }
  }, [onCellClick])

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
        apiRef={apiRef}
      />
    );
  }, [enableQuickFilter, densityMode, handleDensityToggle, apiRef]);

  // Native context menu handler to intercept right-clicks
  const handleNativeContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault() // Prevent browser's default context menu
    
    const target = event.target as HTMLElement
    const cell = target.closest('.MuiDataGrid-cell')
    
    if (!cell || !apiRef.current) return
    
    const cellElement = cell as HTMLElement
    const field = cellElement.getAttribute('data-field')
    const rowId = cellElement.parentElement?.getAttribute('data-id')
    
    if (!field || !rowId) return
    
    const row = apiRef.current.getRow(rowId)
    const column = apiRef.current.getColumn(field)
    
    if (!row || !column) return
    
    const params: GridCellParams = {
      id: rowId,
      field: field,
      value: row[field],
      row: row,
      colDef: column,
      cellMode: 'view',
      hasFocus: false,
      tabIndex: -1,
      rowNode: apiRef.current.getRowNode(rowId)!,
      api: apiRef.current,
      getValue: (id: GridRowId, f: string) => apiRef.current?.getCellValue(id, f) ?? null,
    } as GridCellParams
    
    const syntheticEvent = {
      ...event,
      defaultMuiPrevented: false,
    } as MuiEvent<React.MouseEvent>
    
    handleCellRightClick(params, syntheticEvent)
  }, [apiRef, handleCellRightClick])

  return (
    <>
      <Box
        sx={{ width: '100%' }}
        role="region"
        aria-label="Data table"
        onContextMenu={handleNativeContextMenu}
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
        checkboxSelection={checkboxSelection}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={onRowSelectionModelChange}
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
  apiRef,
}: {
  densityMode: 'compact' | 'standard' | 'comfortable'
  onToggleDensity: (dense: boolean) => void
  apiRef: ReturnType<typeof useGridApiRef>
}) {
  const SEARCH_HISTORY_KEY = 'liveTaskSearchHistory'
  const MAX_HISTORY_ITEMS = 10
  
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  
  const [searchValue, setSearchValue] = useState('')
  
  const addToSearchHistory = (searchTerm: string) => {
    const trimmed = searchTerm.trim()
    if (!trimmed) return
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== trimmed)
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS)
      
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
      } catch {
        // Ignore localStorage errors
      }
      
      return updated
    })
  }
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const value = searchValue.trim()
      if (value) {
        addToSearchHistory(value)
        // The search is already applied automatically by MUI DataGrid
      }
    }
  }
  
  const handleSearchChange = (_: React.SyntheticEvent, newValue: string) => {
    setSearchValue(newValue)
    // Apply filter to DataGrid
    apiRef.current?.setQuickFilterValues([newValue])
  }
  
  return (
    <Stack
      px={1.5}
      py={1}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
    >
      <Box flex={1} maxWidth={400}>
        <Autocomplete
          {...STANDARD_AUTOCOMPLETE_PROPS}
          freeSolo
          options={searchHistory}
          value={searchValue}
          onInputChange={handleSearchChange}
          renderInput={(params) => (
            <TextField
              {...params}
              {...STANDARD_INPUT_PROPS}
              placeholder="Quick filter..."
              onKeyDown={handleKeyDown}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <SearchRoundedIcon sx={{ mr: 0.5, ml: 0.5, color: 'text.secondary', fontSize: 18 }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem',
                },
              }}
            />
          )}
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
