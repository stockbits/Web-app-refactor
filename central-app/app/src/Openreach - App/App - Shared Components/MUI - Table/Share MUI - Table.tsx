import { useEffect, useMemo, type ReactNode } from 'react'
import { Box, Paper, Stack, Typography } from '@mui/material'
import {
  DataGrid,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  useGridApiRef,
  type GridColDef,
  type GridRowId,
  type GridValidRowModel,
} from '@mui/x-data-grid'
import { useMuiTableSelection } from './MUI Table - Selection Logic'

export interface SharedMuiTableProps<T extends GridValidRowModel = GridValidRowModel> {
  columns: GridColDef<T>[]
  rows: T[]
  title?: string
  caption?: string
  getRowId?: (row: T) => GridRowId
  density?: 'compact' | 'standard' | 'comfortable'
  loading?: boolean
  hideFooter?: boolean
  autoHeight?: boolean
  enableQuickFilter?: boolean
  enableDensitySelector?: boolean
  emptyState?: ReactNode
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
  autoHeight = true,
  enableQuickFilter = false,
  enableDensitySelector = false,
  emptyState,
}: SharedMuiTableProps<T>) {
  const resolvedRowIds = rows.map((row, index) => {
    if (getRowId) {
      return getRowId(row)
    }

    const candidate = (row as { id?: GridRowId }).id
    return candidate ?? index
  })

  const apiRef = useGridApiRef()
  const { selectionModel, handleSelectionModelChange, clearSelection } = useMuiTableSelection(resolvedRowIds)

  useEffect(() => {
    const api = apiRef.current
    if (!api?.subscribeEvent) {
      return
    }

    const unsubscribe = api.subscribeEvent('headerSelectionCheckboxChange', () => {
      clearSelection()
    })

    return () => {
      unsubscribe?.()
    }
  }, [apiRef, clearSelection])

  const ToolbarComponent = useMemo(() => {
    if (!enableQuickFilter && !enableDensitySelector) {
      return undefined
    }

    const Toolbar = () => (
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={1}
        px={1.5}
        py={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {enableQuickFilter && (
          <Box sx={{ flexGrow: 1 }}>
            <GridToolbarQuickFilter
              debounceMs={250}
              quickFilterParser={(value) => value.split(/\s+/).filter(Boolean)}
            />
          </Box>
        )}

        {enableDensitySelector && (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
              Density
            </Typography>
            <GridToolbarDensitySelector slotProps={{ tooltip: { title: 'Adjust row spacing' } }} />
          </Stack>
        )}
      </Stack>
    )

    Toolbar.displayName = 'SharedMuiTableToolbar'
    return Toolbar
  }, [enableQuickFilter, enableDensitySelector])

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
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid rgba(7,59,76,0.12)',
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      {(title || caption) && (
        <Stack px={2} py={1.5} spacing={0.25} borderBottom="1px solid rgba(7,59,76,0.08)">
          {title && (
            <Typography variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
          )}
          {caption && (
            <Typography variant="body2" color="text.secondary">
              {caption}
            </Typography>
          )}
        </Stack>
      )}

      <DataGrid
        apiRef={apiRef}
        autoHeight={autoHeight}
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        density={density}
        loading={loading}
        hideFooter={hideFooter}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionModelChange}
        checkboxSelection
        disableMultipleRowSelection={false}
        slots={{
          toolbar: ToolbarComponent,
          noRowsOverlay: NoRowsOverlay,
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'rgba(7,59,76,0.02)',
            borderBottom: '1px solid rgba(7,59,76,0.08)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          },
          '& .MuiDataGrid-cell': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          '& .MuiDataGrid-row': {
            '&:last-of-type': {
              borderBottom: 'none',
            },
          },
        }}
      />
    </Paper>
  )
}

export default SharedMuiTable
