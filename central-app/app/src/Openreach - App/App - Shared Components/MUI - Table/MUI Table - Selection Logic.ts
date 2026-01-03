import { useCallback, useEffect, useRef, useState, type MutableRefObject, type SyntheticEvent } from 'react'
import type { GridApiCommon, GridCallbackDetails, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid'

interface UseMuiTableSelectionResult {
  selectionModel: GridRowSelectionModel
  handleSelectionModelChange: (
    newSelection: GridRowSelectionModel,
    details?: GridCallbackDetails,
  ) => void
  clearSelection: () => void
}

const createEmptySelection = (): GridRowSelectionModel => ({
  type: 'include',
  ids: new Set<GridRowId>(),
})

const cloneSelection = (model: GridRowSelectionModel): GridRowSelectionModel => ({
  type: model.type,
  ids: new Set(model.ids),
})

const selectionIdsToArray = (model: GridRowSelectionModel) => Array.from(model.ids)

const buildVisibleRowOrder = (rowIds: GridRowId[], api?: GridApiCommon | null) => {
  const gridApi = api ?? undefined
  if (!gridApi?.getRowIndexRelativeToVisibleRows) {
    return rowIds
  }

  const ordered = rowIds
    .map((id) => ({ id, position: gridApi.getRowIndexRelativeToVisibleRows(id) }))
    .filter((entry) => entry.position !== -1)
    .sort((a, b) => a.position - b.position)

  return ordered.length ? ordered.map((entry) => entry.id) : rowIds
}

type ModifierSnapshot = { shift: boolean; ctrlMeta: boolean }

const extractEventModifiers = (details?: GridCallbackDetails): ModifierSnapshot | null => {
  const detailsWithEvent = details as
    | (GridCallbackDetails & {
        event?: SyntheticEvent & { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; nativeEvent?: Event }
      })
    | undefined

  const syntheticEvent = detailsWithEvent?.event
  const eventLike = syntheticEvent?.nativeEvent ?? syntheticEvent

  if (!eventLike) {
    return null
  }

  const possibleMouseEvent = eventLike as Partial<MouseEvent>
  return {
    shift: Boolean(possibleMouseEvent.shiftKey),
    ctrlMeta: Boolean(possibleMouseEvent.metaKey || possibleMouseEvent.ctrlKey),
  }
}

const findChangedId = (
  previousIds: Set<GridRowId>,
  nextIds: Set<GridRowId>,
  orderedIds: GridRowId[],
): GridRowId | undefined => {
  for (let idx = orderedIds.length - 1; idx >= 0; idx -= 1) {
    const id = orderedIds[idx]
    const prevHas = previousIds.has(id)
    const nextHas = nextIds.has(id)
    if (prevHas !== nextHas) {
      return id
    }
  }
  return undefined
}

const buildRangeIds = (anchorId: GridRowId, targetId: GridRowId, orderedIds: GridRowId[]): GridRowId[] => {
  const startIndex = orderedIds.indexOf(anchorId)
  const endIndex = orderedIds.indexOf(targetId)

  if (startIndex === -1 || endIndex === -1) {
    return targetId === undefined ? [] : [targetId]
  }

  const [start, end] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex]
  return orderedIds.slice(start, end + 1)
}

/**
 * Keeps row selection single-select by default, while allowing multi-select via Ctrl/Cmd and range select via Shift.
 */
export const useMuiTableSelection = (
  rowOrder: GridRowId[],
  gridApiRef?: MutableRefObject<GridApiCommon | null>,
): UseMuiTableSelectionResult => {
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(createEmptySelection)
  const modifierState = useRef<ModifierSnapshot>({ ctrlMeta: false, shift: false })
  const rowOrderRef = useRef<GridRowId[]>(rowOrder)
  const anchorRef = useRef<GridRowId | null>(null)

  useEffect(() => {
    rowOrderRef.current = rowOrder
  }, [rowOrder])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const updateModifiers = (event: KeyboardEvent, isKeyDown: boolean) => {
      if (event.key === 'Shift') {
        modifierState.current.shift = isKeyDown
      }
      if (event.key === 'Control' || event.key === 'Meta') {
        modifierState.current.ctrlMeta = isKeyDown
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => updateModifiers(event, true)
    const handleKeyUp = (event: KeyboardEvent) => updateModifiers(event, false)
    const resetModifiers = () => {
      modifierState.current = { ctrlMeta: false, shift: false }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', resetModifiers)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', resetModifiers)
    }
  }, [])

  const handleSelectionModelChange = useCallback(
    (newSelection: GridRowSelectionModel, details?: GridCallbackDetails) => {
      setSelectionModel((previous) => {
        const pointerModifiers = extractEventModifiers(details)
        const activeModifiers = pointerModifiers ?? modifierState.current
        const orderedIdsFromApi = details?.api?.getAllRowIds?.()
        const orderedIds = buildVisibleRowOrder(
          orderedIdsFromApi?.length ? orderedIdsFromApi : rowOrderRef.current,
          gridApiRef?.current ?? undefined,
        )
        const prevIdsSet = previous.ids
        const nextIdsArray = selectionIdsToArray(newSelection)
        const nextIdsSet = new Set<GridRowId>(nextIdsArray)
        const changedId = findChangedId(prevIdsSet, nextIdsSet, orderedIds)

        if (activeModifiers.shift) {
          const anchorId = anchorRef.current ?? changedId
          const targetId = changedId ?? anchorId

          if (anchorId === undefined || targetId === undefined) {
            return previous
          }

          const rangeIds = buildRangeIds(anchorId, targetId, orderedIds)
          anchorRef.current = targetId
          return {
            type: 'include',
            ids: new Set(rangeIds),
          }
        }

        if (activeModifiers.ctrlMeta) {
          if (changedId !== undefined) {
            anchorRef.current = changedId
          }
          return cloneSelection(newSelection)
        }

        const targetId = changedId ?? nextIdsArray[nextIdsArray.length - 1]
        anchorRef.current = targetId ?? null

        if (targetId === undefined) {
          return createEmptySelection()
        }

        return {
          type: 'include',
          ids: new Set<GridRowId>([targetId]),
        }
      })
    },
    [gridApiRef],
  )

  const clearSelection = useCallback(() => {
    anchorRef.current = null
    setSelectionModel(createEmptySelection())
  }, [])

  return { selectionModel, handleSelectionModelChange, clearSelection }
}
