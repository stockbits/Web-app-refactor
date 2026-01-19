import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material'
import { type GridCellParams, type MuiEvent, type GridColDef } from '@mui/x-data-grid'

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

export interface TableContextMenuProps {
  /** Additional menu items to show in the context menu */
  additionalItems?: ContextMenuItem[]
  /** Callback when the context menu is closed */
  onClose?: () => void
  /** Custom styling for the menu */
  menuSx?: object
}

export interface TableContextMenuState<T = Record<string, unknown>> {
  mouseX: number
  mouseY: number
  value: string
  field: string
  rowId: string | number
  rowData?: T
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
}: TableContextMenuProps & { longPressDelay?: number }) {
  const [contextMenu, setContextMenu] = useState<TableContextMenuState<T> | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)

  const handleCellRightClick = useCallback((
    params: GridCellParams,
    event: MuiEvent<React.MouseEvent>
  ) => {
    if (event.button === 2) { // Right-click
      event.preventDefault()
      event.stopPropagation()

      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
        value: params.value != null ? String(params.value) : '',
        field: params.field,
        rowId: params.id,
        rowData: params.row,
      })
    }
  }, [])

  const handleCellTouchStart = useCallback((
    params: GridCellParams,
    event: React.TouchEvent
  ) => {
    console.log('TableContextMenu: handleCellTouchStart called', params, event)
    const touch = event.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })

    // Start long-press timer
    const timer = window.setTimeout(() => {
      console.log('TableContextMenu: Long press timer triggered, showing context menu')
      setContextMenu({
        mouseX: touch.clientX - 2,
        mouseY: touch.clientY - 4,
        value: params.value != null ? String(params.value) : '',
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
    // Clear any pending long-press timer
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

  // Default menu items
  const defaultItems: ContextMenuItem[] = [
    {
      label: `Copy "${contextMenu?.value || '(empty)'}"`,
      icon: <ContentCopyIcon fontSize="small" />,
      onClick: handleCopyValue,
      disabled: !contextMenu?.value,
    },
  ]

  // Combine default and additional items
  const allItems = [...defaultItems, ...additionalItems]

  // Helper function to wrap column renderCell with touch event handlers
  const wrapColumnWithTouchEvents = useCallback(<T extends GridColDef>(column: T): T => {
    if (!column.renderCell) return column

    return {
      ...column,
      renderCell: (params: any) => {
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
        sx={{
          '& .MuiPaper-root': {
            minWidth: 200,
            ...menuSx,
          },
        }}
      >
        {allItems.map((item, index) => (
          <div key={index}>
            <MenuItem
              onClick={item.onClick}
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