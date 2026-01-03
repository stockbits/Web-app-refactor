import type { ReactNode } from 'react'
import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

export interface SharedMuiTableColumn<T extends object> {
  field?: keyof T
  header: string
  align?: 'left' | 'center' | 'right'
  width?: number | string
  sx?: SxProps<Theme>
  render?: (row: T) => ReactNode
}

export interface SharedMuiTableProps<T extends object> {
  columns: SharedMuiTableColumn<T>[]
  rows: T[]
  getRowId?: (row: T, index: number) => string | number
  title?: string
  caption?: string
  dense?: boolean
  emptyState?: ReactNode
}

export function SharedMuiTable<T extends object>({
  columns,
  rows,
  getRowId,
  title,
  caption,
  dense = false,
  emptyState,
}: SharedMuiTableProps<T>) {
  const rowKey = (row: T, index: number) => {
    if (getRowId) return getRowId(row, index)
    if ('id' in row) {
      const candidate = (row as { id?: unknown }).id
      if (typeof candidate === 'string' || typeof candidate === 'number') {
        return candidate
      }
    }
    return index
  }

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

      <TableContainer>
        <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.header}
                  align={column.align ?? 'left'}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    letterSpacing: 0.5,
                    borderBottom: '1px solid rgba(7,59,76,0.12)',
                    width: column.width,
                    ...column.sx,
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  {emptyState ?? (
                    <Box py={4} textAlign="center">
                      <Typography variant="body2" color="text.secondary">
                        No records available yet.
                      </Typography>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  hover
                  key={rowKey(row, index)}
                  sx={{ '&:last-of-type td': { borderBottom: 0 } }}
                >
                  {columns.map((column) => {
                    const content = column.render
                      ? column.render(row)
                      : column.field
                        ? (row[column.field] as ReactNode)
                        : null
                    return (
                      <TableCell key={column.header + rowKey(row, index)} align={column.align ?? 'left'}>
                        {content ?? '—'}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export default SharedMuiTable
