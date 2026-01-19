import { Box, useTheme, Tabs, Tab, useMediaQuery } from "@mui/material";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import * as React from "react";
import TimelineIcon from "@mui/icons-material/Timeline";
import PeopleIcon from "@mui/icons-material/People";
import MapIcon from "@mui/icons-material/Map";
import ChecklistIcon from "@mui/icons-material/Checklist";

import LiveGantt from "./App - Pannels/Live - Gantt";
import LiveMap from "./App - Pannels/Live - Map";
import LivePeople from "./App - Pannels/Live - People";
import LiveTask from "./App - Pannels/Live - Task";
import type { SearchFilters } from "../../App - Scaffold/App - Pages/Operation Toolkit/App - Search Tool";
import { TASK_TABLE_ROWS } from "../../App - Data Tables/Task - Table";

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
  searchFilters?: SearchFilters | null;
  clearSorting?: number;
}

export default function MUI4Panel({ onDockedPanelsChange, dockedPanels = [], selectedDivision, selectedDomain, searchFilters, clearSorting }: MUI4PanelProps = {}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedPanelId, setExpandedPanelId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState(0);

  // Use dockedPanels.length as layout key to trigger re-renders when panels are docked/undocked
  const layoutKey = useMemo(() => dockedPanels.length, [dockedPanels.length]);
  // isResizing: { type: 'row'|'col', index: number, rowIndex?: number } | null
  const [isResizing, setIsResizing] = useState<{ type: 'row'|'col', index: number, rowIndex?: number } | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<{ type: 'row'|'col', index: number, rowIndex?: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleMouseUpRef = useRef<(() => void) | null>(null);
  const handleTouchEndRef = useRef<(() => void) | null>(null);

  // Compute filtered tasks based on selectedDivision, selectedDomain, and searchFilters
  const filteredTasks = useMemo(() => {
    // Only show tasks after search has been performed
    if (!searchFilters) {
      return [];
    }

    let tasks = TASK_TABLE_ROWS;

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

    return tasks;
  }, [selectedDivision, selectedDomain, searchFilters]);

  // Get list of visible panels (not docked)
  const visiblePanels = useMemo(() => {
    const panels = [
      { id: 'gantt', component: LiveGantt, props: { title: 'Gantt Chart', icon: <TimelineIcon fontSize="small" /> } },
      { id: 'map', component: LiveMap, props: { title: 'Live Map', icon: <MapIcon fontSize="small" />, filteredTasks } },
      { id: 'people', component: LivePeople, props: { title: 'Team Status', icon: <PeopleIcon fontSize="small" /> } },
      { id: 'tasks', component: LiveTask, props: { title: 'Active Tasks', icon: <ChecklistIcon fontSize="small" />, filteredTasks, clearSorting } },
    ];
    return panels.filter(panel => !dockedPanels.some(p => p.id === panel.id));
  }, [dockedPanels, filteredTasks, clearSorting]);

  // Ensure activeMobileTab stays within bounds when panels change
  useEffect(() => {
    if (isMobile && activeMobileTab >= visiblePanels.length && visiblePanels.length > 0) {
      setActiveMobileTab(0);
    }
  }, [visiblePanels.length, activeMobileTab, isMobile]);

  // Calculate grid layout based on number of visible panels
  const gridLayout = useMemo(() => {
    const count = visiblePanels.length;
    if (count === 0) return { rows: 1, cols: 1, areas: [] };
    if (count === 1) return { rows: 1, cols: 1, areas: [[visiblePanels[0].id]] };
    if (count === 2) return { rows: 1, cols: 2, areas: [[visiblePanels[0].id, visiblePanels[1].id]] };
    if (count === 3) {
      // For 3 panels, fill a 2x2 grid, leaving one cell empty and letting panels expand
      // Assign panels to top-left, top-right, bottom-left; bottom-right is empty
      return {
        rows: 2, cols: 2,
        areas: [
          [visiblePanels[0].id, visiblePanels[1].id],
          [visiblePanels[2].id, visiblePanels[2].id]] // bottom row: panel 3 spans both columns
      };
    }
    // count === 4
    return {
      rows: 2, cols: 2,
      areas: [
        [visiblePanels[0].id, visiblePanels[1].id],
        [visiblePanels[2].id, visiblePanels[3].id]
      ]
    };
  }, [visiblePanels]);

  // Initialize grid sizes state - separate column sizes for each row
  const [rowSizes, setRowSizes] = useState<number[]>(() => Array(gridLayout.rows).fill(100 / gridLayout.rows));
  const [colSizes, setColSizes] = useState<number[][]>(() => 
    Array(gridLayout.rows).fill(null).map(() => Array(gridLayout.cols).fill(100 / gridLayout.cols))
  );

  // All panels get equal space: 50/50 for main split, then 50/50 for each sub-split = 25% each
  // Allotment handles sizes internally for smooth resizing; no need for manual state unless you want to control it.

  const handleDockPanel = (panel: DockedPanel) => {
    const newDockedPanels = [...dockedPanels, panel];
    onDockedPanelsChange?.(newDockedPanels);
  };

  const handleUndockPanel = (panelId: string) => {
    const newDockedPanels = dockedPanels.filter(p => p.id !== panelId);
    onDockedPanelsChange?.(newDockedPanels);
  };

  const handleExpandPanel = (panelId: string) => {
    setExpandedPanelId(panelId);
  };

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
  const handlePointerDown = (type: 'row' | 'col', index: number, rowIndex?: number) => (e: React.PointerEvent) => {
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
  };

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

  const handleCollapsePanel = () => {
    setExpandedPanelId(null);
  };

  const isPanelDocked = (panelId: string) => dockedPanels.some(p => p.id === panelId);

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
            onExpand: () => handleExpandPanel(expandedPanel.id),
            onCollapse: handleCollapsePanel,
            isExpanded: true
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
            value={activeMobileTab}
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
                  opacity: activeMobileTab === index ? 1 : 0,
                  pointerEvents: activeMobileTab === index ? 'auto' : 'none',
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {React.createElement(panel.component as unknown as React.ComponentType<any>, {
                  ...panel.props,
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
            for (let r = 0; r < gridLayout.rows; r++) {
              for (let c = 0; c < gridLayout.cols; c++) {
                if (gridLayout.areas[r] && gridLayout.areas[r][c] === panel.id) {
                  rowIndex = r;
                  colIndex = c;
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
            const colWidth = colSizes[rowIndex]?.[colIndex] || (100 / gridLayout.cols);

            return (
              <Box key={panel.id} sx={{ 
                position: 'absolute',
                top: `${rowStart}%`,
                left: `${colStart}%`,
                width: `${colWidth}%`,
                height: `${rowHeight}%`,
                minHeight: {
                  xs: panel.id === 'map' ? '250px' : '200px',
                  sm: panel.id === 'map' ? '300px' : 'auto'
                },
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {React.createElement(panel.component as unknown as React.ComponentType<any>, {
                  ...panel.props,
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
                      width: '8px',
                      zIndex: 1000,
                      transform: 'translateX(-50%)',
                      pointerEvents: 'auto',
                      background: 'none',
                      cursor: (isResizing?.type === 'col' && isResizing?.index === c && isResizing?.rowIndex === r) ? 'grabbing' : 'grab',
                      display: { xs: 'none', sm: 'flex' },
                      alignItems: 'center',
                      justifyContent: 'center',
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
                      className="mui4panel-handle-block"
                      sx={{
                        width: '4px',
                        height: '20%',
                        minHeight: '32px',
                        maxHeight: '100%',
                        backgroundColor: (hoveredHandle?.type === 'col' && hoveredHandle?.index === c && hoveredHandle?.rowIndex === r) || 
                                        (isResizing?.type === 'col' && isResizing?.index === c && isResizing?.rowIndex === r)
                          ? theme.palette.primary.main
                          : theme.palette.divider,
                        borderRadius: 2,
                        opacity: (hoveredHandle?.type === 'col' && hoveredHandle?.index === c && hoveredHandle?.rowIndex === r) || 
                                (isResizing?.type === 'col' && isResizing?.index === c && isResizing?.rowIndex === r) ? 1 : 0,
                        transition: 'background 0.2s, opacity 0.2s',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: (hoveredHandle?.type === 'col' && hoveredHandle?.index === c && hoveredHandle?.rowIndex === r) || 
                                  (isResizing?.type === 'col' && isResizing?.index === c && isResizing?.rowIndex === r) ? theme.shadows[2] : 0,
                        pointerEvents: 'none',
                      }}
                    />
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
                  height: '8px',
                  zIndex: 1000,
                  transform: 'translateY(-50%)',
                  pointerEvents: 'auto',
                  background: 'none',
                  cursor: (isResizing?.type === 'row' && isResizing?.index === r) ? 'grabbing' : 'grab',
                  display: { xs: 'none', sm: 'flex' },
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                tabIndex={0}
                onPointerDown={handlePointerDown('row', r)}
                onDoubleClick={() => setRowSizes(Array(gridLayout.rows).fill(100 / gridLayout.rows))}
                onMouseEnter={() => setHoveredHandle({ type: 'row', index: r })}
                onMouseLeave={() => setHoveredHandle(null)}
              >
                <Box
                  className="mui4panel-handle-block"
                  sx={{
                    height: '4px',
                    width: '20%',
                    minWidth: '32px',
                    maxWidth: '100%',
                    backgroundColor: (hoveredHandle?.type === 'row' && hoveredHandle?.index === r) || 
                                    (isResizing?.type === 'row' && isResizing?.index === r)
                      ? theme.palette.primary.main
                      : theme.palette.divider,
                    borderRadius: 2,
                    opacity: (hoveredHandle?.type === 'row' && hoveredHandle?.index === r) || 
                            (isResizing?.type === 'row' && isResizing?.index === r) ? 1 : 0,
                    transition: 'background 0.2s, opacity 0.2s',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: (hoveredHandle?.type === 'row' && hoveredHandle?.index === r) || 
                              (isResizing?.type === 'row' && isResizing?.index === r) ? theme.shadows[2] : 0,
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}