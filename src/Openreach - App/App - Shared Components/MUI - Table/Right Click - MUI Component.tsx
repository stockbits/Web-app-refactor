import { useState, useCallback, type ReactNode } from 'react'
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material'
import { type GridCellParams, type MuiEvent } from '@mui/x-data-grid'

/**
 * TableContextMenu - A reusable right-click context menu for MUI DataGrid tables
 *
 * Features:
 * - Copy cell value to clipboard
 * - Copy field name to clipboard
 * - Copy row ID to clipboard
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
  menuSx = {}
}: TableContextMenuProps) {
  const [contextMenu, setContextMenu] = useState<TableContextMenuState<T> | null>(null)

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

  const handleClose = useCallback(() => {
    setContextMenu(null)
    onClose?.()
  }, [onClose])

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

  const handleCopyFieldName = useCallback(async () => {
    if (contextMenu?.field) {
      try {
        await navigator.clipboard.writeText(contextMenu.field)
      } catch (error) {
        console.error('Failed to copy field name to clipboard:', error)
      }
    }
    handleClose()
  }, [contextMenu?.field, handleClose])

  const handleCopyRowId = useCallback(async () => {
    if (contextMenu?.rowId) {
      try {
        await navigator.clipboard.writeText(String(contextMenu.rowId))
      } catch (error) {
        console.error('Failed to copy row ID to clipboard:', error)
      }
    }
    handleClose()
  }, [contextMenu?.rowId, handleClose])

  // Default menu items
  const defaultItems: ContextMenuItem[] = [
    {
      label: 'Copy Cell Value',
      icon: <ContentCopyIcon fontSize="small" />,
      onClick: handleCopyValue,
      disabled: !contextMenu?.value,
    },
    {
      label: 'Copy Field Name',
      icon: <ContentCopyIcon fontSize="small" />,
      onClick: handleCopyFieldName,
    },
    {
      label: 'Copy Row ID',
      icon: <ContentCopyIcon fontSize="small" />,
      onClick: handleCopyRowId,
    },
  ]

  // Combine default and additional items
  const allItems = [...defaultItems, ...additionalItems]

  return {
    // Handler to attach to DataGrid onCellClick
    handleCellRightClick,

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
  }
}

export default TableContextMenu