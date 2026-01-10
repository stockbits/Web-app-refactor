import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Box, Stack, Switch, Typography } from '@mui/material'
import {
  DataGrid,
  GridToolbarQuickFilter,
  useGridApiRef,
  type GridColDef,
  type GridPaginationModel,
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
  pageSizeOptions?: number[]
  initialPageSize?: number
  emptyState?: ReactNode
}

export function SharedMuiTable<T extends GridValidRowModel = GridValidRowModel>({
  columns,
  rows,
  getRowId,
  density = 'compact',
  loading,
  hideFooter = false,
  enableQuickFilter = false,
  pageSizeOptions,
  initialPageSize = 16,
  emptyState,
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
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <DataGrid
          sx={(theme) => ({
            width: '100%',
            height: '100%',
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            // Remove light-mode circle behind sort icon and align color with brand
            '& .MuiDataGrid-iconButtonContainer': {
              backgroundColor: 'transparent !important',
            },
            '& .MuiDataGrid-iconButtonContainer .MuiButtonBase-root': {
              backgroundColor: 'transparent !important',
              borderRadius: 0,
              padding: 0,
              '&:hover': { backgroundColor: 'transparent !important' },
            },
            '& .MuiDataGrid-iconButtonContainer .MuiIconButton-root': {
              backgroundColor: 'transparent !important',
              '&:hover': { backgroundColor: 'transparent !important' },
            },
            '& .MuiDataGrid-iconButtonContainer .MuiTouchRipple-root': {
              display: 'none',
            },
            '& .MuiDataGrid-sortIcon': {
              marginLeft: 0.5,
              color: theme.palette.primary.main,
            },
          })}
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          density={densityMode}
          loading={loading}
          hideFooter={hideFooter}
          pagination
          pageSizeOptions={resolvedPageSizeOptions}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          checkboxSelection
          disableRowSelectionOnClick={false}
          autoHeight={false}
          autosizeOnMount
          autosizeOptions={{
            columns: columns.map(col => col.field),
            includeHeaders: true,
            includeOutliers: false,
          }}
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
