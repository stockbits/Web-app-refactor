import { Box, useTheme, Tabs, Tab, useMediaQuery } from "@mui/material";
import { useState, useRef, useCallback, useMemo, useEffect, lazy, Suspense } from "react";
import * as React from "react";
import TimelineIcon from "@mui/icons-material/Timeline";
import PeopleIcon from "@mui/icons-material/People";
import MapIcon from "@mui/icons-material/Map";
import ChecklistIcon from "@mui/icons-material/Checklist";

import LiveGantt from "./App - Pannels/LiveGantt";
const LiveMap = lazy(() => import("./App - Pannels/LiveMap"));
import LivePeople from "./App - Pannels/LivePeople";
import LiveTask from "./App - Pannels/LiveTask";
import { useSelectionUI } from "../MUI - Table/Selection - UI";
import type { SearchFilters } from "../../App - Scaffold/App - Pages/Operation Toolkit/App - Search Tool";
import { TASK_TABLE_ROWS } from "../../App - Data Tables/Task - Table";
import type { TaskTableRow, TaskCommitType } from "../../App - Data Tables/Task - Table";

export interface DockedPanel {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export interface MUI4PanelProps {
  onDockedPanelsChange?: (panels: DockedPanel[]) => void;
  dockedPanels?: DockedPanel[];
  selectedDivision?: string | null;
  selectedDomain?: string | null;
  searchTerm?: string;
  searchFilters?: SearchFilters | null;
  clearSorting?: number;
  openTaskDialog?: (task: TaskTableRow | TaskTableRow[]) => void;
  onAddToDock?: (item: { id: string; title: string; commitType?: TaskCommitType; task?: TaskTableRow }) => void;
}

export default function MUI4Panel({ onDockedPanelsChange, dockedPanels = [], selectedDivision, selectedDomain, searchTerm = '', searchFilters, clearSorting, openTaskDialog, onAddToDock }: MUI4PanelProps = {}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedPanelId, setExpandedPanelId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState(0);
  
  // State to track tasks appended from Gantt view
  const [appendedTasks, setAppendedTasks] = useState<TaskTableRow[]>([]);

  // Get selected task IDs from selection context
  const { selectedTaskIds, selectedResourceIds } = useSelectionUI();

  // Memoize layout key to avoid unnecessary re-renders
  const layoutKey = useMemo(() => dockedPanels.length, [dockedPanels.length]);

  // Memoize isMobile to prevent unnecessary recalculations
  const isMobileMemo = useMemo(() => isMobile, [isMobile]);

  // isResizing: { type: 'row'|'col', index: number, rowIndex?: number } | null
  const [isResizing, setIsResizing] = useState<{ type: 'row'|'col', index: number, rowIndex?: number } | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<{ type: 'row'|'col', index: number, rowIndex?: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleMouseUpRef = useRef<(() => void) | null>(null);
  const handleTouchEndRef = useRef<(() => void) | null>(null);

  // Compute filtered tasks based on searchTerm, selectedDivision, selectedDomain, and searchFilters
  // Also includes tasks appended from Gantt view
  const filteredTasks = useMemo(() => {
    let tasks = TASK_TABLE_ROWS;

    // If searchTerm is provided, filter by exact match on Task ID, Work ID, or Resource ID
    if (searchTerm && searchTerm.trim()) {
      const keyword = searchTerm.trim().toLowerCase();
      tasks = tasks.filter(task => 
        task.taskId.toLowerCase() === keyword ||
        task.workId.toLowerCase() === keyword ||
        task.resourceId.toLowerCase() === keyword
      );
      // When searchTerm is active, return tasks + appended tasks
      return [...tasks, ...appendedTasks];
    }

    // Only show tasks after search has been performed
    if (!searchFilters) {
      return appendedTasks;
    }

    // Filter by division if selected
    if (selectedDivision) {
      tasks = tasks.filter(task => task.division === selectedDivision);
    }

    // Filter by domain if selected
    if (selectedDomain) {
      tasks = tasks.filter(task => task.domainId === selectedDomain);
    }

    // Apply search filters
    tasks = tasks.filter(task => {
      // Status filter
      if (searchFilters.statuses && searchFilters.statuses.length > 0) {
        if (!searchFilters.statuses.includes(task.status)) {
          return false;
        }
      }

      // Capability filter
      if (searchFilters.capabilities && searchFilters.capabilities.length > 0) {
        if (!searchFilters.capabilities.some(cap => task.capabilities.includes(cap))) {
          return false;
        }
      }

      // Response filter
      if (searchFilters.responseCodes && searchFilters.responseCodes.length > 0) {
        if (!searchFilters.responseCodes.includes(task.responseCode)) {
          return false;
        }
      }

      return true;
    });

    // Merge filtered tasks with appended tasks, removing duplicates
    const taskMap = new Map<string, TaskTableRow>();
    tasks.forEach(task => taskMap.set(task.taskId, task));
    appendedTasks.forEach(task => taskMap.set(task.taskId, task));
    
    return Array.from(taskMap.values());
  }, [searchTerm, selectedDivision, selectedDomain, searchFilters, appendedTasks]);
  
  // Handler to append tasks from Gantt view
  const handleAppendTasks = useCallback((newTasks: TaskTableRow[]) => {
    setAppendedTasks(prev => {
      // Merge new tasks with existing appended tasks, removing duplicates
      const taskMap = new Map<string, TaskTableRow>();
      prev.forEach(task => taskMap.set(task.taskId, task));
      newTasks.forEach(task => taskMap.set(task.taskId, task));
      return Array.from(taskMap.values());
    });
  }, []);
  
  // Clear appended tasks when search filters change
  useEffect(() => {
    setAppendedTasks([]);
  }, [searchFilters, selectedDivision, selectedDomain]);

  // Get list of visible panels (not docked) - memoized to prevent recreation
  const visiblePanels = useMemo(() => {
    const panels = [
      { id: 'gantt', component: LiveGantt, props: { title: 'Gantt Chart', icon: <TimelineIcon fontSize="small" />, selectedDivision, selectedDomain, filteredTasks, onAppendTasks: handleAppendTasks } },
      { id: 'map', component: LiveMap, props: { title: 'Live Map', icon: <MapIcon fontSize="small" />, filteredTasks, selectedTaskIds, selectedResourceIds, selectedDivision, selectedDomain } },
      { id: 'people', component: LivePeople, props: { title: 'Team Status', icon: <PeopleIcon fontSize="small" />, selectedDivision, selectedDomain } },
      { id: 'tasks', component: LiveTask, props: { title: 'Active Tasks', icon: <ChecklistIcon fontSize="small" />, filteredTasks, clearSorting, openTaskDialog, onAddToDock } },
    ];
    return panels.filter(panel => !dockedPanels.some(p => p.id === panel.id));
  }, [dockedPanels, filteredTasks, selectedTaskIds, selectedResourceIds, clearSorting, openTaskDialog, onAddToDock, selectedDivision, selectedDomain, handleAppendTasks]);

  // Ensure activeMobileTab stays within bounds when panels change
  const clampedActiveMobileTab = useMemo(() => {
    if (isMobileMemo && activeMobileTab >= visiblePanels.length && visiblePanels.length > 0) {
      return 0;
    }
    return activeMobileTab;
  }, [visiblePanels.length, activeMobileTab, isMobileMemo]);

  // Calculate grid layout based on number of visible panels
  const gridLayout = useMemo(() => {
    const count = visiblePanels.length;
    if (count === 0) return { rows: 1, cols: 1, areas: [] };
    if (count === 1) return { rows: 1, cols: 1, areas: [[visiblePanels[0].id]] };
    if (count === 2) return { rows: 1, cols: 2, areas: [[visiblePanels[0].id, visiblePanels[1].id]] };
    if (count === 3) {
      // When 3 panels, top row has 2, bottom row has 1 that spans full width
      return {
        rows: 2, cols: 2,
        areas: [
          [visiblePanels[0].id, visiblePanels[1].id],
          [visiblePanels[2].id, visiblePanels[2].id]]
      };
    }
    return {
      rows: 2, cols: 2,
      areas: [
        [visiblePanels[0].id, visiblePanels[1].id],
        [visiblePanels[2].id, visiblePanels[3].id]
      ]
    };
  }, [visiblePanels]);

  // Initialize grid sizes - derive defaults from gridLayout
  const defaultRowSizes = useMemo(() => 
    gridLayout.rows === 1 ? [100] : Array(gridLayout.rows).fill(100 / gridLayout.rows),
    [gridLayout.rows]
  );
  const defaultColSizes = useMemo(() => 
    gridLayout.rows === 1 && gridLayout.cols === 1 
      ? [[100]] 
      : Array(gridLayout.rows).fill(null).map(() => Array(gridLayout.cols).fill(100 / gridLayout.cols)),
    [gridLayout.rows, gridLayout.cols]
  );

  // Use defaultRowSizes and defaultColSizes directly as initial state
  // Reset state when panel count changes using derived state pattern
  const [rowSizes, setRowSizes] = useState<number[]>(() => defaultRowSizes);
  const [colSizes, setColSizes] = useState<number[][]>(() => defaultColSizes);
  const [prevPanelCount, setPrevPanelCount] = useState(dockedPanels.length);

  // Derive state updates - only when panel count actually changes
  if (prevPanelCount !== dockedPanels.length) {
    setPrevPanelCount(dockedPanels.length);
    setRowSizes(defaultRowSizes);
    setColSizes(defaultColSizes);
  }

  // All panels get equal space: 50/50 for main split, then 50/50 for each sub-split = 25% each
  // Allotment handles sizes internally for smooth resizing; no need for manual state unless you want to control it.

  const handleDockPanel = useCallback((panel: DockedPanel) => {
    const newDockedPanels = [...dockedPanels, panel];
    onDockedPanelsChange?.(newDockedPanels);
  }, [dockedPanels, onDockedPanelsChange]);

  const handleUndockPanel = useCallback((panelId: string) => {
    const newDockedPanels = dockedPanels.filter(p => p.id !== panelId);
    onDockedPanelsChange?.(newDockedPanels);
  }, [dockedPanels, onDockedPanelsChange]);

  const handleExpandPanel = useCallback((panelId: string) => {
    setExpandedPanelId(panelId);
  }, []);

  // Unified resize calculation function for smoother performance
  const calculateResize = useCallback((type: 'row' | 'col', index: number, clientX: number, clientY: number, rowIndex?: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const dimension = type === 'row' ? rect.height : rect.width;
    const position = type === 'row' ? y : x;

    const pct = Math.max(5, Math.min(95, (position / dimension) * 100));

    if (type === 'row') {
      setRowSizes(currentSizes => {
        let newSizes = [...currentSizes];

        if (currentSizes.length === 2) {
          newSizes = [pct, 100 - pct];
        } else {
          const sumBefore = currentSizes.slice(0, index).reduce((a, b) => a + b, 0);
          const before = Math.max(5, Math.min(95, pct - sumBefore));
          const after = currentSizes[index] + currentSizes[index + 1] - before;
          newSizes[index] = before;
          newSizes[index + 1] = Math.max(5, after);
        }

        return newSizes;
      });
    } else {
      // Column resize - now per row
      setColSizes(currentSizes => {
        const newSizes = currentSizes.map(row => [...row]);
        
        if (rowIndex !== undefined && newSizes[rowIndex]) {
          const currentRowSizes = newSizes[rowIndex];
          
          if (currentRowSizes.length === 2) {
            newSizes[rowIndex] = [pct, 100 - pct];
          } else {
            const sumBefore = currentRowSizes.slice(0, index).reduce((a, b) => a + b, 0);
            const before = Math.max(5, Math.min(95, pct - sumBefore));
            const after = currentRowSizes[index] + currentRowSizes[index + 1] - before;
            newSizes[rowIndex][index] = before;
            newSizes[rowIndex][index + 1] = Math.max(5, after);
          }
        }

        return newSizes;
      });
    }
  }, []);

  // Pointer event handler for resize handles
  const handlePointerDown = useCallback((type: 'row' | 'col', index: number, rowIndex?: number) => (e: React.PointerEvent) => {
    setIsResizing({ type, index, rowIndex });
    e.preventDefault();

    const moveHandler = (ev: PointerEvent) => {
      calculateResize(type, index, ev.clientX, ev.clientY, rowIndex);
    };

    const upHandler = () => {
      setIsResizing(null);
      window.removeEventListener('pointermove', moveHandler);
      window.removeEventListener('pointerup', upHandler);
    };

    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler);
  }, [calculateResize]);

  // Mouse event handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    calculateResize(isResizing.type, isResizing.index, e.clientX, e.clientY, isResizing.rowIndex);
  }, [isResizing, calculateResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
    document.removeEventListener('mousemove', handleMouseMove);
    if (handleMouseUpRef.current) {
      document.removeEventListener('mouseup', handleMouseUpRef.current);
    }
  }, [handleMouseMove]);

  useEffect(() => {
    handleMouseUpRef.current = handleMouseUp;
  }, [handleMouseUp]);

  // Touch event handlers
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (!isResizing) return;
    const touch = e.touches[0];
    calculateResize(isResizing.type, isResizing.index, touch.clientX, touch.clientY, isResizing.rowIndex);
  }, [isResizing, calculateResize]);

  const handleTouchEnd = useCallback(() => {
    setIsResizing(null);
    document.removeEventListener('touchmove', handleTouchMove);
    if (handleTouchEndRef.current) {
      document.removeEventListener('touchend', handleTouchEndRef.current);
    }
  }, [handleTouchMove]);

  useEffect(() => {
    handleTouchEndRef.current = handleTouchEnd;
  }, [handleTouchEnd]);

  const handleCollapsePanel = useCallback(() => {
    setExpandedPanelId(null);
  }, []);

  const isPanelDocked = useCallback((panelId: string) => dockedPanels.some(p => p.id === panelId), [dockedPanels]);

  // If a panel is expanded, show only that panel
  if (expandedPanelId) {
    const expandedPanel = visiblePanels.find(p => p.id === expandedPanelId);
    if (expandedPanel) {
      return (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            backgroundColor: theme.palette.background.default,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {React.createElement(expandedPanel.component as unknown as React.ComponentType<any>, {
            ...expandedPanel.props,
            onExpand: () => handleExpandPanel(expandedPanel.id),
            onCollapse: handleCollapsePanel,
            isExpanded: true,
          })}
        </Box>
      );
    }
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        width: '100%',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      {/* No Results Message */}
      {(searchTerm || searchFilters) && filteredTasks.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              fontSize: '3rem',
              opacity: 0.5,
            }}
          >
            ⚲
          </Box>
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'text.primary',
                mb: 1,
              }}
            >
              No results found
            </Box>
            <Box
              sx={{
                fontSize: '0.9rem',
                color: 'text.secondary',
              }}
            >
              {searchTerm && `No tasks match the search term "${searchTerm}"`}
              {searchFilters && !searchTerm && 'No tasks match the current filters. Try adjusting your search criteria.'}
            </Box>
          </Box>
        </Box>
      )}

      {/* Grid Layout - Only shown when there are results */}
      {!(searchTerm || searchFilters) || filteredTasks.length > 0 ? (
        <>
          {visiblePanels.length === 0 ? (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.palette.text.secondary
        }}>
          All panels are docked to the top banner
        </Box>
      ) : isMobile ? (
        // Mobile tab layout
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tabs
            value={clampedActiveMobileTab}
            onChange={(_, newValue) => setActiveMobileTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
              }
            }}
          >
            {visiblePanels.map((panel) => (
              <Tab
                key={panel.id}
                label={panel.props.title}
                icon={panel.props.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
          <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {visiblePanels.map((panel, index) => (
              <Box
                key={panel.id}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: clampedActiveMobileTab === index ? 1 : 0,
                  pointerEvents: clampedActiveMobileTab === index ? 'auto' : 'none',
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                <Suspense fallback={<Box sx={{ p: 2 }}>Loading...</Box>}>
                  {React.createElement(panel.component as unknown as React.ComponentType<Record<string, unknown>>, {
                    ...panel.props,
                    key: panel.id, // Maintain component identity to preserve state
                    onDock: () => handleDockPanel({
                      id: panel.id,
                      title: panel.props.title,
                      icon: panel.props.icon,
                      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                      content: React.createElement(panel.component as unknown as React.ComponentType<any>, { minimized: true })
                    }),
                    onUndock: () => handleUndockPanel(panel.id),
                    onExpand: () => handleExpandPanel(panel.id),
                    onCollapse: handleCollapsePanel,
                    isDocked: isPanelDocked(panel.id),
                    isExpanded: false,
                    layoutKey: layoutKey,
                    style: { height: '100%', width: '100%', display: 'flex', flexDirection: 'column' },
                  })}
                </Suspense>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        // Desktop grid layout using absolute positioning for independent per-row column sizing
        <Box sx={{
          height: '100%',
          position: 'relative',
          pointerEvents: isResizing ? 'none' : 'auto',
          '& > *': {
            pointerEvents: isResizing ? 'none' : 'auto',
          },
        }}>
          {visiblePanels.map((panel) => {
            // Find the position of this panel in the grid
            let rowIndex = -1;
            let colIndex = -1;
            let colSpan = 1;
            for (let r = 0; r < gridLayout.rows; r++) {
              for (let c = 0; c < gridLayout.cols; c++) {
                if (gridLayout.areas[r] && gridLayout.areas[r][c] === panel.id) {
                  rowIndex = r;
                  colIndex = c;
                  // Calculate column span by counting consecutive cells with same panel id
                  colSpan = 1;
                  for (let spanCheck = c + 1; spanCheck < gridLayout.cols; spanCheck++) {
                    if (gridLayout.areas[r][spanCheck] === panel.id) {
                      colSpan++;
                    } else {
                      break;
                    }
                  }
                  break;
                }
              }
              if (rowIndex !== -1) break;
            }
            
            if (rowIndex === -1 || colIndex === -1) return null;

            // Calculate position and size
            const rowStart = rowSizes.slice(0, rowIndex).reduce((a, b) => a + b, 0);
            const rowHeight = rowSizes[rowIndex];
            const colStart = colSizes[rowIndex]?.slice(0, colIndex).reduce((a, b) => a + b, 0) || (colIndex * (100 / gridLayout.cols));
            // Sum up the widths of all spanned columns
            let colWidth = 0;
            if (colSizes[rowIndex]) {
              for (let i = 0; i < colSpan; i++) {
                colWidth += colSizes[rowIndex][colIndex + i] || (100 / gridLayout.cols);
              }
            } else {
              colWidth = (100 / gridLayout.cols) * colSpan;
            }

            return (
              <Box key={panel.id} sx={{ 
                position: 'absolute',
                top: `${rowStart}%`,
                left: `${colStart}%`,
                width: `calc(${colWidth}% + 0.5px)`,
                height: `calc(${rowHeight}% + 0.5px)`,
                minHeight: {
                  xs: panel.id === 'map' ? '250px' : '200px',
                  sm: panel.id === 'map' ? '300px' : 'auto'
                },
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                '& > *': {
                  boxSizing: 'border-box',
                }
              }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {React.createElement(panel.component as unknown as React.ComponentType<any>, {
                  ...panel.props,
                  key: panel.id, // Maintain component identity to preserve state
                  onDock: () => handleDockPanel({
                    id: panel.id,
                    title: panel.props.title,
                    icon: panel.props.icon,
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    content: React.createElement(panel.component as unknown as React.ComponentType<any>, { minimized: true })
                  }),
                  onUndock: () => handleUndockPanel(panel.id),
                  onExpand: () => handleExpandPanel(panel.id),
                  onCollapse: handleCollapsePanel,
                  isDocked: isPanelDocked(panel.id),
                  isExpanded: false,
                  layoutKey: layoutKey,
                  style: { height: '100%', width: '100%', display: 'flex', flexDirection: 'column' },
                })}
              </Box>
            );
          })}

          {/* Vertical handles: one per row, positioned within each row */}
          {gridLayout.areas.map((row, r) => {
            return [...Array(gridLayout.cols - 1)].map((_, c) => {
              const leftPanel = row && row[c];
              const rightPanel = row && row[c+1];
              if (leftPanel && rightPanel && leftPanel !== rightPanel) {
                const rowStart = rowSizes.slice(0, r).reduce((a, b) => a + b, 0);
                const rowHeight = rowSizes[r];
                const colStart = colSizes[r]?.slice(0, c+1).reduce((a, b) => a + b, 0) || ((c+1) * (100 / gridLayout.cols));

                return (
                  <Box
                    key={`vhandle-${r}-${c}`}
                    sx={{
                      position: 'absolute',
                      left: `${colStart}%`,
                      top: `${rowStart}%`,
                      height: `${rowHeight}%`,
                      width: '12px',
                      zIndex: 1000,
                      transform: 'translateX(-50%)',
                      pointerEvents: 'auto',
                      background: 'none',
                      cursor: (isResizing?.type === 'col' && isResizing?.index === c && isResizing?.rowIndex === r) ? 'col-resize' : 'col-resize',
                      display: { xs: 'none', sm: 'flex' },
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover .handle-indicator': {
                        opacity: 1,
                        transform: 'translate(-50%, -50%) scale(1)',
                      },
                    }}
                    tabIndex={0}
                    onPointerDown={handlePointerDown('col', c, r)}
                    onDoubleClick={() => setColSizes(current => {
                      const newSizes = [...current];
                      newSizes[r] = Array(gridLayout.cols).fill(100 / gridLayout.cols);
                      return newSizes;
                    })}
                    onMouseEnter={() => setHoveredHandle({ type: 'col', index: c, rowIndex: r })}
                    onMouseLeave={() => setHoveredHandle(null)}
                  >
                    <Box
                      className="handle-indicator"
                      sx={{
                        width: '6px',
                        height: '48px',
                        backgroundColor: (isResizing?.type === 'col' && isResizing?.index === c && isResizing?.rowIndex === r)
                          ? theme.palette.primary.main
                          : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.25)',
                        border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                        borderRadius: '3px',
                        opacity: 1,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: (isResizing?.type === 'col' && isResizing?.index === c && isResizing?.rowIndex === r) 
                          ? 'translate(-50%, -50%) scale(1.1)' 
                          : 'translate(-50%, -50%) scale(0.95)',
                        boxShadow: (hoveredHandle?.type === 'col' && hoveredHandle?.index === c && hoveredHandle?.rowIndex === r) || 
                                  (isResizing?.type === 'col' && isResizing?.index === c && isResizing?.rowIndex === r) 
                          ? `0 0 8px ${theme.palette.primary.main}40` 
                          : 'none',
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                        '&::before, &::after': {
                          content: '""',
                          width: '2px',
                          height: '2px',
                          borderRadius: '50%',
                          backgroundColor: (isResizing?.type === 'col' && isResizing?.index === c && isResizing?.rowIndex === r)
                            ? theme.palette.primary.contrastText
                            : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)',
                          position: 'absolute',
                          left: '50%',
                          transform: 'translateX(-50%)',
                        },
                        '&::before': {
                          top: '30%',
                        },
                        '&::after': {
                          bottom: '30%',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '2px',
                          height: '2px',
                          borderRadius: '50%',
                          backgroundColor: (isResizing?.type === 'col' && isResizing?.index === c && isResizing?.rowIndex === r)
                            ? theme.palette.primary.contrastText
                            : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)',
                        }}
                      />
                    </Box>
                  </Box>
                );
              }
              return null;
            });
          })}

          {/* Horizontal handles: positioned between rows */}
          {[...Array(gridLayout.rows - 1)].map((_, r) => {
            const rowStart = rowSizes.slice(0, r+1).reduce((a, b) => a + b, 0);
            
            return (
              <Box
                key={`hhandle-${r}`}
                sx={{
                  position: 'absolute',
                  top: `${rowStart}%`,
                  left: 0,
                  width: '100%',
                  height: '12px',
                  zIndex: 1000,
                  transform: 'translateY(-50%)',
                  pointerEvents: 'auto',
                  background: 'none',
                  cursor: (isResizing?.type === 'row' && isResizing?.index === r) ? 'row-resize' : 'row-resize',
                  display: { xs: 'none', sm: 'flex' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  '&:hover .handle-indicator': {
                    opacity: 1,
                    transform: 'translate(-50%, -50%) scale(1)',
                  },
                }}
                tabIndex={0}
                onPointerDown={handlePointerDown('row', r)}
                onDoubleClick={() => setRowSizes(Array(gridLayout.rows).fill(100 / gridLayout.rows))}
                onMouseEnter={() => setHoveredHandle({ type: 'row', index: r })}
                onMouseLeave={() => setHoveredHandle(null)}
              >
                <Box
                  className="handle-indicator"
                  sx={{
                    height: '6px',
                    width: '48px',
                    backgroundColor: (isResizing?.type === 'row' && isResizing?.index === r)
                      ? theme.palette.primary.main
                      : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.25)',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                    borderRadius: '3px',
                    opacity: 1,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: (isResizing?.type === 'row' && isResizing?.index === r)
                      ? 'translate(-50%, -50%) scale(1.1)'
                      : 'translate(-50%, -50%) scale(0.95)',
                    boxShadow: (hoveredHandle?.type === 'row' && hoveredHandle?.index === r) || 
                              (isResizing?.type === 'row' && isResizing?.index === r)
                      ? `0 0 8px ${theme.palette.primary.main}40`
                      : 'none',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    '&::before, &::after': {
                      content: '""',
                      width: '2px',
                      height: '2px',
                      borderRadius: '50%',
                      backgroundColor: (isResizing?.type === 'row' && isResizing?.index === r)
                        ? theme.palette.primary.contrastText
                        : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)',
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    },
                    '&::before': {
                      left: '30%',
                    },
                    '&::after': {
                      right: '30%',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '2px',
                      height: '2px',
                      borderRadius: '50%',
                      backgroundColor: (isResizing?.type === 'row' && isResizing?.index === r)
                        ? theme.palette.primary.contrastText
                        : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)',
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
        </>
      ) : null}
    </Box>
  );
}