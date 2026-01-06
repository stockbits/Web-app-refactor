  import { useCallback, useEffect, useState, type ReactNode } from 'react'
  import { Box, Stack, Switch, Typography } from '@mui/material'
  import {
    DataGrid,
    GridToolbarQuickFilter,
    useGridApiRef,
    type GridColDef,
    type GridRowId,
    type GridValidRowModel,
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
  enableQuickFilter?: boolean
  showFooterControls?: boolean
  pageSizeOptions?: number[]
  initialPageSize?: number
  emptyState?: ReactNode
  /**
   * Max height of the table container.
   * Can be a number (px) or any valid CSS height string.
   * Example: 520 or "calc(100vh - 250px)"
   * Defaults to '100%' to fit the container and scroll internally.
   */
  maxHeight?: number | string
}

export function SharedMuiTable<T extends GridValidRowModel = GridValidRowModel>({
  columns,
  rows,
  title,
  caption,
  getRowId,
  density = 'compact',
  loading,
  hideFooter = true,
  enableQuickFilter = false,
  showFooterControls = false,
  pageSizeOptions,
  initialPageSize = 30,
  emptyState,
}: SharedMuiTableProps<T>) {
  const apiRef = useGridApiRef()

  const [densityMode, setDensityMode] = useState(density)

  useEffect(() => {
    setDensityMode(density)
  }, [density])

  const handleDensityToggle = useCallback((nextDense: boolean) => {
    setDensityMode(nextDense ? 'compact' : 'standard')
  }, [])

  const resolvedPageSizeOptions = pageSizeOptions?.length ? pageSizeOptions : [30, 100, 500]
  const normalizedInitialPageSize = initialPageSize ?? resolvedPageSizeOptions[0]
  const resolvedInitialPageSize = resolvedPageSizeOptions.includes(normalizedInitialPageSize)
    ? normalizedInitialPageSize
    : resolvedPageSizeOptions[0]

  // If showFooterControls is enabled, we must show footer (pagination etc.)
  const resolvedHideFooter = showFooterControls ? false : hideFooter

  const paginationSettings = !resolvedHideFooter
    ? {
        pagination: true as const,
        initialState: {
          pagination: {
            paginationModel: { pageSize: resolvedInitialPageSize },
          },
        },
        pageSizeOptions: resolvedPageSizeOptions,
      }
    : undefined

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
    <Box
      sx={{
        width: '100%',
        height: '1200px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      aria-label={title ?? caption ?? 'Table'}
    >
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        density={densityMode}
        loading={loading}
        hideFooter={resolvedHideFooter}
        checkboxSelection
        disableRowSelectionOnClick={false}
        pageSizeOptions={resolvedPageSizeOptions}
        initialState={{
          pagination: {
            paginationModel: { pageSize: resolvedInitialPageSize, page: 0 },
          },
        }}
        {...paginationSettings}
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
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',

          '& .MuiDataGrid-toolbarContainer': {
            flex: '0 0 auto',
          },

          '& .MuiDataGrid-columnHeaders': {
            flex: '0 0 auto',
            bgcolor: 'rgba(7,59,76,0.02)',
            borderBottom: '1px solid rgba(7,59,76,0.08)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          },

          '& .MuiDataGrid-main': {
            flex: 1,
            overflow: 'hidden',
          },

          '& .MuiDataGrid-virtualScroller': {
            overflow: 'auto !important',
          },

          '& .MuiDataGrid-footerContainer': {
            flex: '0 0 auto',
          },

          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }}
      />
    </Box>
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
