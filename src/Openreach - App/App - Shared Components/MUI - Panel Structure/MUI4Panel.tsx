import { Box, useTheme } from "@mui/material";
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

export interface DockedPanel {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export interface MUI4PanelProps {
  onDockedPanelsChange?: (panels: DockedPanel[]) => void;
  dockedPanels?: DockedPanel[];
  globalSearch?: string;
}

export default function MUI4Panel({ onDockedPanelsChange, dockedPanels = [], globalSearch = '' }: MUI4PanelProps = {}) {
  const theme = useTheme();
  const [expandedPanelId, setExpandedPanelId] = useState<string | null>(null);

  // Use dockedPanels.length as layout key to trigger re-renders when panels are docked/undocked
  const layoutKey = useMemo(() => dockedPanels.length, [dockedPanels.length]);
  // isResizing: { type: 'row'|'col', index: number } | null
  const [isResizing, setIsResizing] = useState<{ type: 'row'|'col', index: number } | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<{ type: 'row'|'col', index: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleMouseUpRef = useRef<(() => void) | null>(null);
  const handleTouchEndRef = useRef<(() => void) | null>(null);

  // Get list of visible panels (not docked)
  const visiblePanels = useMemo(() => {
    const panels = [
      { id: 'gantt', component: LiveGantt, props: { title: 'Gantt Chart', icon: <TimelineIcon fontSize="small" />, globalSearch } },
      { id: 'map', component: LiveMap, props: { title: 'Live Map', icon: <MapIcon fontSize="small" />, globalSearch } },
      { id: 'people', component: LivePeople, props: { title: 'Team Status', icon: <PeopleIcon fontSize="small" />, globalSearch } },
      { id: 'tasks', component: LiveTask, props: { title: 'Active Tasks', icon: <ChecklistIcon fontSize="small" />, globalSearch } },
    ];
    return panels.filter(panel => !dockedPanels.some(p => p.id === panel.id));
  }, [dockedPanels, globalSearch]);

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

  // Initialize grid sizes state
  const [rowSizes, setRowSizes] = useState<number[]>(() => Array(gridLayout.rows).fill(100 / gridLayout.rows));
  const [colSizes, setColSizes] = useState<number[]>(() => Array(gridLayout.cols).fill(100 / gridLayout.cols));

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


  // Pointer event handler for resize handles
  const handlePointerDown = (type: 'row' | 'col', index: number) => (e: React.PointerEvent) => {
    setIsResizing({ type, index });
    e.preventDefault();
    // Add pointermove and pointerup listeners
    const moveHandler = (ev: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;
      if (type === 'row') {
        setRowSizes(currentSizes => {
          const total = currentSizes.reduce((a, b) => a + b, 0);
          const pct = (y / height) * 100;
          let newSizes = [...currentSizes];
          let before = Math.max(10, Math.min(90, pct));
          let after = total - before;
          if (currentSizes.length === 2) {
            newSizes = [before, after];
          } else {
            const sumBefore = currentSizes.slice(0, index).reduce((a, b) => a + b, 0);
            before = Math.max(10, Math.min(90, pct - sumBefore));
            after = currentSizes[index+1] + currentSizes[index] - before;
            newSizes[index] = before;
            newSizes[index+1] = after;
          }
          return newSizes;
        });
      } else if (type === 'col') {
        setColSizes(currentSizes => {
          const total = currentSizes.reduce((a, b) => a + b, 0);
          const pct = (x / width) * 100;
          let newSizes = [...currentSizes];
          let before = Math.max(10, Math.min(90, pct));
          let after = total - before;
          if (currentSizes.length === 2) {
            newSizes = [before, after];
          } else {
            const sumBefore = currentSizes.slice(0, index).reduce((a, b) => a + b, 0);
            before = Math.max(10, Math.min(90, pct - sumBefore));
            after = currentSizes[index+1] + currentSizes[index] - before;
            newSizes[index] = before;
            newSizes[index+1] = after;
          }
          return newSizes;
        });
      }
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
    if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    if (isResizing.type === 'row') {
      const total = rowSizes.reduce((a, b) => a + b, 0);
      const pct = (y / height) * 100;
      let newSizes = [...rowSizes];
      let before = Math.max(10, Math.min(90, pct));
      let after = total - before;
      if (rowSizes.length === 2) {
        newSizes = [before, after];
      } else {
        const sumBefore = rowSizes.slice(0, isResizing.index).reduce((a, b) => a + b, 0);
        before = Math.max(10, Math.min(90, pct - sumBefore));
        after = rowSizes[isResizing.index+1] + rowSizes[isResizing.index] - before;
        newSizes[isResizing.index] = before;
        newSizes[isResizing.index+1] = after;
      }
      setRowSizes(newSizes);
    } else if (isResizing.type === 'col') {
      const total = colSizes.reduce((a, b) => a + b, 0);
      const pct = (x / width) * 100;
      let newSizes = [...colSizes];
      let before = Math.max(10, Math.min(90, pct));
      let after = total - before;
      if (colSizes.length === 2) {
        newSizes = [before, after];
      } else {
        const sumBefore = colSizes.slice(0, isResizing.index).reduce((a, b) => a + b, 0);
        before = Math.max(10, Math.min(90, pct - sumBefore));
        after = colSizes[isResizing.index+1] + colSizes[isResizing.index] - before;
        newSizes[isResizing.index] = before;
        newSizes[isResizing.index+1] = after;
      }
      setColSizes(newSizes);
    }
  }, [isResizing, rowSizes, colSizes]);

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
    if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    if (isResizing.type === 'row') {
      const total = rowSizes.reduce((a, b) => a + b, 0);
      const pct = (y / rect.height) * 100;
      let newSizes = [...rowSizes];
      let before = Math.max(10, Math.min(90, pct));
      let after = total - before;
      if (rowSizes.length === 2) {
        newSizes = [before, after];
      } else {
        const idx = isResizing.index;
        const sumBefore = rowSizes.slice(0, idx).reduce((a, b) => a + b, 0);
        before = Math.max(10, Math.min(90, pct - sumBefore));
        after = rowSizes[idx+1] + rowSizes[idx] - before;
        newSizes[idx] = before;
        newSizes[idx+1] = after;
      }
      setRowSizes(newSizes);
    } else if (isResizing.type === 'col') {
      const total = colSizes.reduce((a, b) => a + b, 0);
      const pct = (x / rect.width) * 100;
      let newSizes = [...colSizes];
      let before = Math.max(10, Math.min(90, pct));
      let after = total - before;
      if (colSizes.length === 2) {
        newSizes = [before, after];
      } else {
        const idx = isResizing.index;
        const sumBefore = colSizes.slice(0, idx).reduce((a, b) => a + b, 0);
        before = Math.max(10, Math.min(90, pct - sumBefore));
        after = colSizes[idx+1] + colSizes[idx] - before;
        newSizes[idx] = before;
        newSizes[idx+1] = after;
      }
      setColSizes(newSizes);
    }
  }, [isResizing, rowSizes, colSizes]);

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
      ) : (
        // Dynamic grid layout based on number of visible panels
        <Box sx={{
          height: '100%',
          display: 'grid',
          gridTemplateRows: rowSizes.slice(0, gridLayout.rows).map(s => `${s}%`).join(' '),
          gridTemplateColumns: colSizes.slice(0, gridLayout.cols).map(s => `${s}%`).join(' '),
          gap: 0,
          position: 'relative',
          pointerEvents: isResizing ? 'none' : 'auto',
          '& > *': {
            pointerEvents: isResizing ? 'none' : 'auto',
          },
        }}>
          {visiblePanels.map((panel) => {
            // Find all grid cells this panel should occupy
            const starts: Array<[number, number]> = [];
            for (let r = 0; r < gridLayout.rows; r++) {
              for (let c = 0; c < gridLayout.cols; c++) {
                if (gridLayout.areas[r] && gridLayout.areas[r][c] === panel.id) {
                  starts.push([r, c]);
                }
              }
            }
            if (starts.length === 0) return null;
            // Calculate the minimal bounding box for this panel
            const minRow = Math.min(...starts.map(([r]) => r));
            const maxRow = Math.max(...starts.map(([r]) => r));
            const minCol = Math.min(...starts.map(([,c]) => c));
            const maxCol = Math.max(...starts.map(([,c]) => c));
            const area = `${minRow+1} / ${minCol+1} / ${maxRow+2} / ${maxCol+2}`;
            return (
              <Box key={panel.id} sx={{ gridArea: area, overflow: 'hidden' }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {React.createElement(panel.component as unknown as React.ComponentType<any>, {
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
                  layoutKey: layoutKey
                })}
              </Box>
            );
          })}

          {/* Chunky vertical handles: 5% of panel height, centered, fade in on hover/focus */}
          {[...Array(gridLayout.cols - 1)].map((_, c) => {
            return gridLayout.areas.map((row, r) => {
              const leftPanel = row && row[c];
              const rightPanel = row && row[c+1];
              if (leftPanel && rightPanel && leftPanel !== rightPanel) {
                return (
                  <Box
                    key={`vhandle-${r}-${c}`}
                    sx={{
                      position: 'absolute',
                      left: `${((colSizes.slice(0, c+1).reduce((a,b)=>a+b,0))/100)*100}%`,
                      top: `${(rowSizes.slice(0, r).reduce((a,b)=>a+b,0)/100)*100}%`,
                      height: `${rowSizes[r]}%`,
                      width: '8px', // MUI standard hit area
                      zIndex: 1000,
                      transform: 'translateX(-50%)',
                      pointerEvents: 'auto',
                      background: 'none',
                      cursor: (isResizing?.type === 'col' && isResizing?.index === c) ? 'grabbing' : 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    tabIndex={0}
                    onPointerDown={handlePointerDown('col', c)}
                    onDoubleClick={() => setColSizes(Array(gridLayout.cols).fill(100 / gridLayout.cols))}
                    onMouseEnter={() => setHoveredHandle({ type: 'col', index: c })}
                    onMouseLeave={() => setHoveredHandle(null)}
                  >
                    <Box
                      className="mui4panel-handle-block"
                      sx={{
                        width: '4px', // MUI standard visible handle
                        height: '20%',
                        minHeight: '32px',
                        maxHeight: '100%',
                        backgroundColor: (hoveredHandle?.type === 'col' && hoveredHandle?.index === c) || (isResizing?.type === 'col' && isResizing?.index === c)
                          ? theme.palette.primary.main
                          : theme.palette.divider,
                        borderRadius: 2,
                        opacity: (hoveredHandle?.type === 'col' && hoveredHandle?.index === c) || (isResizing?.type === 'col' && isResizing?.index === c) ? 1 : 0,
                        transition: 'background 0.2s, opacity 0.2s',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: (hoveredHandle?.type === 'col' && hoveredHandle?.index === c) || (isResizing?.type === 'col' && isResizing?.index === c) ? theme.shadows[2] : 0,
                        pointerEvents: 'none',
                      }}
                    />
                  </Box>
                );
              }
              return null;
            });
          })}

          {/* Chunky horizontal handles: 5% of panel width, centered, fade in on hover/focus */}
          {[...Array(gridLayout.rows - 1)].map((_, r) => {
            return gridLayout.areas[0].map((_, c) => {
              const topPanel = gridLayout.areas[r] && gridLayout.areas[r][c];
              const bottomPanel = gridLayout.areas[r+1] && gridLayout.areas[r+1][c];
              if (topPanel && bottomPanel && topPanel !== bottomPanel) {
                return (
                  <Box
                    key={`hhandle-${r}-${c}`}
                    sx={{
                      position: 'absolute',
                      top: `${(rowSizes.slice(0, r+1).reduce((a,b)=>a+b,0)/100)*100}%`,
                      left: `${(colSizes.slice(0, c).reduce((a,b)=>a+b,0)/100)*100}%`,
                      width: `${colSizes[c]}%`,
                      height: '8px', // MUI standard hit area
                      zIndex: 1000,
                      transform: 'translateY(-50%)',
                      pointerEvents: 'auto',
                      background: 'none',
                      cursor: (isResizing?.type === 'row' && isResizing?.index === r) ? 'grabbing' : 'grab',
                      display: 'flex',
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
                        height: '4px', // MUI standard visible handle
                        width: '20%',
                        minWidth: '32px',
                        maxWidth: '100%',
                        backgroundColor: (hoveredHandle?.type === 'row' && hoveredHandle?.index === r) || (isResizing?.type === 'row' && isResizing?.index === r)
                          ? theme.palette.primary.main
                          : theme.palette.divider,
                        borderRadius: 2,
                        opacity: (hoveredHandle?.type === 'row' && hoveredHandle?.index === r) || (isResizing?.type === 'row' && isResizing?.index === r) ? 1 : 0,
                        transition: 'background 0.2s, opacity 0.2s',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: (hoveredHandle?.type === 'row' && hoveredHandle?.index === r) || (isResizing?.type === 'row' && isResizing?.index === r) ? theme.shadows[2] : 0,
                        pointerEvents: 'none',
                      }}
                    />
                  </Box>
                );
              }
              return null;
            });
          })}
        </Box>
      )}
    </Box>
  );
}