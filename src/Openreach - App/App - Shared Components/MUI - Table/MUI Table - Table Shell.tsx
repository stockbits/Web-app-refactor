import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Box, Stack, Switch, Typography, useTheme } from '@mui/material'
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
        sx={{ flex: 1, minHeight: 0 }}
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
  initialPageSize = 12,
  emptyState,
  maxHeight = 'calc(100dvh - 420px)',
}: SharedMuiTableProps<T>) {
  const theme = useTheme()
  const apiRef = useGridApiRef()

  const [densityMode, setDensityMode] = useState(density)

  useEffect(() => {
    setDensityMode(density)
  }, [density])

  const handleDensityToggle = useCallback((nextDense: boolean) => {
    setDensityMode(nextDense ? 'compact' : 'standard')
  }, [])

  const resolvedPageSizeOptions = pageSizeOptions?.length ? pageSizeOptions : [20, 50, 100]
  const normalizedInitialPageSize = initialPageSize ?? resolvedPageSizeOptions[0]
  const resolvedInitialPageSize = normalizedInitialPageSize > 0 ? normalizedInitialPageSize : resolvedPageSizeOptions[0]

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
        height: maxHeight,
        maxHeight: maxHeight,
        flex: '1 1 auto',
        minHeight: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        bgcolor: theme.palette.background.paper,
      }}
      aria-label={title ?? caption ?? 'Table'}
    >
      <DataGrid
        sx={{
          height: '100%',
          '& .MuiDataGrid-footerContainer': {
            px: 2,
            py: 1.5,
            minHeight: 'auto',
          },
          '& .MuiDataGrid-row': {
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
        }}
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        density={densityMode}
        loading={loading}
        hideFooter={resolvedHideFooter}
        checkboxSelection
        disableRowSelectionOnClick={false}
        autoHeight={false}
        disableVirtualization={false}
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
