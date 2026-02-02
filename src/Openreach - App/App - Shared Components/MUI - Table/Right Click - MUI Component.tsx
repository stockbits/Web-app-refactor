import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material'
import { type GridCellParams, type GridRenderCellParams, type MuiEvent, type GridColDef } from '@mui/x-data-grid'

/**
 * TableContextMenu - A reusable right-click context menu for MUI DataGrid tables
 *
 * Features:
 * - Copy cell value to clipboard (shows the actual value in the menu)
 * - Extensible with additional menu items
 * - TypeScript support with generics
 *
 * @example
 * ```tsx
 * import { TableContextMenu } from './Right Click - MUI Component'
 *
 * function MyTable() {
 *   const contextMenu = TableContextMenu({
 *     additionalItems: [
 *       {
 *         label: 'View Details',
 *         icon: <InfoIcon />,
 *         onClick: () => console.log('View details clicked'),
 *       }
 *     ]
 *   })
 *
 *   return (
 *     <>
 *       <DataGrid
 *         // ... other props
 *         onCellClick={contextMenu.handleCellRightClick}
 *       />
 *       {contextMenu.contextMenuComponent}
 *     </>
 *   )
 * }
 * ```
 */

export interface ContextMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  disabled?: boolean
  divider?: boolean
}

export interface TableContextMenuProps<T = Record<string, unknown>> {
  /** Additional menu items to show in the context menu */
  additionalItems?: ContextMenuItem[] | ((rowData: T, selectedRows: (string | number)[]) => ContextMenuItem[])
  /** Callback when the context menu is closed */
  onClose?: () => void
  /** Custom styling for the menu */
  menuSx?: object
  /** Selected row IDs for multi-selection context */
  selectedRows?: (string | number)[]
  /** Callback to get row data by ID */
  getRowData?: (rowId: string | number) => T | null
}

export interface TableContextMenuState<T = Record<string, unknown>> {
  mouseX: number
  mouseY: number
  value: string
  field: string
  rowId: string | number
  rowData?: T
  selectedRows?: (string | number)[]
}

/**
 * A reusable right-click context menu component for MUI DataGrid tables.
 * Provides copy functionality and extensible menu items.
 */
export function TableContextMenu<T = Record<string, unknown>>({
  additionalItems = [],
  onClose,
  menuSx = {},
  longPressDelay = 500, // ms
  selectedRows = [],

}: TableContextMenuProps & { longPressDelay?: number }) {
  const [contextMenu, setContextMenu] = useState<TableContextMenuState<T> | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)

  const handleCellRightClick = useCallback((
    params: GridCellParams,
    event: MuiEvent<React.MouseEvent>
  ) => {
    if (event.button === 2) { // Right-click
      // Get the formatted display value from the cell's rendered content
      let displayValue = '';
      
      // Try to get the text content from the cell element
      const cellElement = event.currentTarget as HTMLElement;
      if (cellElement) {
        displayValue = cellElement.innerText || cellElement.textContent || '';
      }
      
      // Fallback to params.formattedValue or params.value
      if (!displayValue) {
        displayValue = params.formattedValue != null 
          ? String(params.formattedValue) 
          : (params.value != null ? String(params.value) : '');
      }
      
      // Always set new context menu state immediately for snappy response
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
        value: displayValue.trim(),
        field: params.field,
        rowId: params.id,
        rowData: params.row,
        selectedRows: selectedRows,
      })
    }
  }, [selectedRows])

  const handleCellTouchStart = useCallback((
    params: GridCellParams,
    event: React.TouchEvent
  ) => {
    const touch = event.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })

    // Start long-press timer
    const timer = window.setTimeout(() => {
      // Get the formatted display value from the cell's rendered content
      let displayValue = '';
      
      // Try to get the text content from the cell element
      const cellElement = event.currentTarget as HTMLElement;
      if (cellElement) {
        displayValue = cellElement.innerText || cellElement.textContent || '';
      }
      
      // Fallback to params.formattedValue or params.value
      if (!displayValue) {
        displayValue = params.formattedValue != null 
          ? String(params.formattedValue) 
          : (params.value != null ? String(params.value) : '');
      }
      
      setContextMenu({
        mouseX: touch.clientX - 2,
        mouseY: touch.clientY - 4,
        value: displayValue.trim(),
        field: params.field,
        rowId: params.id,
        rowData: params.row,
      })
      setLongPressTimer(null)
    }, longPressDelay)
    setLongPressTimer(timer)
  }, [longPressDelay])

  const handleCellTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    setTouchStartPos(null)
  }, [longPressTimer])

  const handleCellTouchMove = useCallback((_params: GridCellParams, event: React.TouchEvent) => {
    if (!touchStartPos || !longPressTimer) return

    const touch = event.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.y)

    // Cancel long press if user moves finger more than 10px
    if (deltaX > 10 || deltaY > 10) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
      setTouchStartPos(null)
    }
  }, [touchStartPos, longPressTimer])

  const handleClose = useCallback(() => {
    setContextMenu(null)
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    setTouchStartPos(null)
    onClose?.()
  }, [onClose, longPressTimer])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
      }
    }
  }, [longPressTimer])

  const handleCopyValue = useCallback(async () => {
    if (contextMenu?.value) {
      try {
        await navigator.clipboard.writeText(contextMenu.value)
        // Could add a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
      }
    }
    handleClose()
  }, [contextMenu?.value, handleClose])

  // Compute menu items dynamically based on context
  const computedAdditionalItems = useMemo(() => {
    if (!contextMenu) return []
    if (typeof additionalItems === 'function') {
      // Dynamic items based on row data and selection
      return additionalItems(contextMenu.rowData!, contextMenu.selectedRows ?? [])
    }
    return Array.isArray(additionalItems) ? additionalItems : []
  }, [additionalItems, contextMenu])

  // Default menu items
  const defaultItems: ContextMenuItem[] = useMemo(() => [
    {
      label: `Copy "${contextMenu?.value || '(empty)'}"`,
      icon: <ContentCopyIcon fontSize="small" />,
      onClick: handleCopyValue,
      disabled: !contextMenu?.value,
    },
  ], [contextMenu?.value, handleCopyValue])

  // Combine default and additional items
  const allItems = useMemo(() => {
    const additional = Array.isArray(computedAdditionalItems) ? computedAdditionalItems : []
    return [...defaultItems, ...additional]
  }, [defaultItems, computedAdditionalItems])

  // Helper function to wrap column renderCell with touch event handlers
  const wrapColumnWithTouchEvents = useCallback(<T extends GridColDef>(column: T): T => {
    if (!column.renderCell) return column

    return {
      ...column,
      renderCell: (params: GridRenderCellParams) => {
        const cellContent = column.renderCell!(params)
        return (
          <div
            onTouchStart={(e) => handleCellTouchStart(params, e)}
            onTouchMove={(e) => handleCellTouchMove(params, e)}
            onTouchEnd={() => handleCellTouchEnd()}
            style={{ width: '100%', height: '100%' }}
          >
            {cellContent}
          </div>
        )
      }
    }
  }, [handleCellTouchStart, handleCellTouchMove, handleCellTouchEnd])

  return {
    // Handler to attach to DataGrid onCellClick
    handleCellRightClick,

    // Touch handlers for mobile long-press support
    handleCellTouchStart,
    handleCellTouchMove,
    handleCellTouchEnd,

    // Context menu component
    contextMenuComponent: (
      <Menu
        open={!!contextMenu}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        transitionDuration={150}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 200,
            ...menuSx,
          },
        }}
      >
        {allItems.map((item: ContextMenuItem, index: number) => (
          <div key={index}>
            <MenuItem
              onClick={() => {
                item.onClick()
                handleClose()
              }}
              disabled={item.disabled}
              sx={{
                fontSize: '0.875rem',
                py: 1,
                px: 2,
                '& .MuiListItemIcon-root': {
                  minWidth: 32,
                },
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.label}
                secondary={
                  item.label === 'Copy Cell Value' && contextMenu?.value
                    ? `"${contextMenu.value.length > 30 ? contextMenu.value.substring(0, 30) + '...' : contextMenu.value}"`
                    : undefined
                }
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: { fontFamily: item.label.includes('Value') ? 'monospace' : 'inherit' }
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                  sx: { fontFamily: 'monospace', opacity: 0.7 }
                }}
              />
            </MenuItem>
            {item.divider && <Divider />}
          </div>
        ))}
      </Menu>
    ),

    // Current context menu state (useful for debugging or additional logic)
    contextMenuState: contextMenu,
    wrapColumnWithTouchEvents,
  }
}

export default TableContextMenu