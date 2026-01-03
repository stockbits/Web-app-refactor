import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Box, Paper, Stack, Switch, Typography } from '@mui/material'
import {
  DataGrid,
  GridFooterContainer,
  GridPagination,
  GridToolbarQuickFilter,
  useGridApiRef,
  type GridColDef,
  type GridRowId,
  type GridValidRowModel,
} from '@mui/x-data-grid'
import { useMuiTableSelection } from './MUI Table - Selection Logic'

type DensityToggleContextValue = {
  isDense: boolean
  onToggleDense: (next: boolean) => void
}

const DensityToggleContext = createContext<DensityToggleContextValue | null>(null)

const useDensityToggleContext = () => {
  const context = useContext(DensityToggleContext)

  if (!context) {
    throw new Error('Density toggle context must be used within its provider')
  }

  return context
}

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
  showFooterControls?: boolean
  pageSizeOptions?: number[]
  initialPageSize?: number
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
  showFooterControls = false,
  pageSizeOptions,
  initialPageSize = 5,
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
  const { selectionModel, handleSelectionModelChange, clearSelection } = useMuiTableSelection(resolvedRowIds, apiRef)
  const [densityMode, setDensityMode] = useState(density)

  useEffect(() => {
    setDensityMode(density)
  }, [density])

  const handleDensityToggle = useCallback((nextDense: boolean) => {
    setDensityMode(nextDense ? 'compact' : 'standard')
  }, [])

  const densityContextValue = useMemo(
    () => ({
      isDense: densityMode === 'compact',
      onToggleDense: handleDensityToggle,
    }),
    [densityMode, handleDensityToggle],
  )

  const resolvedPageSizeOptions = pageSizeOptions?.length ? pageSizeOptions : [5, 10, 25]
  const normalizedInitialPageSize = initialPageSize ?? resolvedPageSizeOptions[0]
  const resolvedInitialPageSize = resolvedPageSizeOptions.includes(normalizedInitialPageSize)
    ? normalizedInitialPageSize
    : resolvedPageSizeOptions[0]
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
    : null

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

  const NoRowsOverlay = () => (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      {emptyState ?? (
        <Typography variant="body2" color="text.secondary">
          No records available yet.
        </Typography>
      )}
    </Box>
  )

  const hasSelection = selectionModel.ids.size > 0

  const tableContent = (
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
        density={densityMode}
        loading={loading}
        hideFooter={resolvedHideFooter}
        {...(paginationSettings ?? {})}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionModelChange}
        checkboxSelection
        disableMultipleRowSelection={false}
        slots={{
          toolbar: enableQuickFilter ? QuickFilterToolbar : undefined,
          noRowsOverlay: NoRowsOverlay,
          footer: showFooterControls ? DensePaddingFooter : undefined,
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
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          '& .MuiDataGrid-row': {
            '&:last-of-type': {
              borderBottom: 'none',
            },
          },
          ...(!hasSelection
            ? {
                '& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-checkboxInput': {
                  pointerEvents: 'none',
                  opacity: 0.4,
                },
                '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root': {
                  pointerEvents: 'none',
                },
              }
            : null),
        }}
      />
    </Paper>
  )

  if (showFooterControls) {
    return <DensityToggleContext.Provider value={densityContextValue}>{tableContent}</DensityToggleContext.Provider>
  }

  return tableContent
}

export default SharedMuiTable

const QuickFilterToolbar = () => (
  <Stack px={1.5} py={1} alignItems="flex-start">
    <Box sx={{ width: '100%' }}>
      <GridToolbarQuickFilter
        debounceMs={250}
        quickFilterParser={(value) => value.split(/\s+/).filter(Boolean)}
      />
    </Box>
  </Stack>
)

const DensePaddingFooter = () => {
  const { isDense, onToggleDense } = useDensityToggleContext()

  return (
    <GridFooterContainer sx={{ px: 2, py: 1.25, borderTop: '1px solid rgba(7,59,76,0.08)' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        width="100%"
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            size="small"
            checked={isDense}
            onChange={(event) => onToggleDense(event.target.checked)}
            inputProps={{ 'aria-label': 'Toggle dense padding' }}
          />
          <Typography variant="body2" color="text.secondary">
            Dense padding
          </Typography>
        </Stack>
        <GridPagination />
      </Stack>
    </GridFooterContainer>
  )
}
