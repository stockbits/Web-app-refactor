import { Box, useTheme } from "@mui/material";
import { useState, useRef, useCallback } from "react";
import * as React from "react";
import { useMemo } from "react";
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
}

export default function MUI4Panel({ onDockedPanelsChange, dockedPanels = [] }: MUI4PanelProps = {}) {
  const theme = useTheme();
  const [expandedPanelId, setExpandedPanelId] = useState<string | null>(null);
  const [rowSizes, setRowSizes] = useState([50, 50]); // percentages
  const [colSizes, setColSizes] = useState([50, 50]); // percentages
  const [isResizing, setIsResizing] = useState<'row' | 'col' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleMouseDown = (type: 'row' | 'col') => (e: React.MouseEvent) => {
    setIsResizing(type);
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    if (isResizing === 'row') {
      const percentage = (y / height) * 100;
      setRowSizes([Math.max(20, Math.min(80, percentage)), Math.max(20, Math.min(80, 100 - percentage))]);
    } else if (isResizing === 'col') {
      const percentage = (x / width) * 100;
      setColSizes([Math.max(20, Math.min(80, percentage)), Math.max(20, Math.min(80, 100 - percentage))]);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleCollapsePanel = () => {
    setExpandedPanelId(null);
  };

  const isPanelDocked = (panelId: string) => dockedPanels.some(p => p.id === panelId);

  // Get list of visible panels (not docked)
  const visiblePanels = useMemo(() => {
    const panels = [
      { id: 'gantt', component: LiveGantt, props: { title: 'Gantt Chart', icon: <TimelineIcon fontSize="small" /> } },
      { id: 'map', component: LiveMap, props: { title: 'Live Map', icon: <MapIcon fontSize="small" /> } },
      { id: 'people', component: LivePeople, props: { title: 'Team Status', icon: <PeopleIcon fontSize="small" /> } },
      { id: 'tasks', component: LiveTask, props: { title: 'Active Tasks', icon: <ChecklistIcon fontSize="small" /> } },
    ];
    return panels.filter(panel => !dockedPanels.some(p => p.id === panel.id));
  }, [dockedPanels]);

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

  // If a panel is expanded, show only that panel
  if (expandedPanelId) {
    const expandedPanel = visiblePanels.find(p => p.id === expandedPanelId);
    if (expandedPanel) {
      return (
        <Box
          sx={{
            height: "100vh",
            width: "100vw",
            backgroundColor: theme.palette.background.default,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {React.createElement(expandedPanel.component, {
            onExpand: () => handleExpandPanel(expandedPanel.id),
            onCollapse: handleCollapsePanel,
            isExpanded: true
          } as any)}
        </Box>
      );
    }
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        cursor: isResizing ? (isResizing === 'row' ? 'row-resize' : 'col-resize') : 'default',
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
          gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
          gap: 0,
          position: 'relative',
          pointerEvents: isResizing ? 'none' : 'auto',
          '& > *': {
            pointerEvents: isResizing ? 'none' : 'auto',
          },
        }}>
          {visiblePanels.map((panel) => {
            // Find all grid cells this panel should occupy
            let starts = [];
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
                {React.createElement(panel.component, {
                  onDock: () => handleDockPanel({
                    id: panel.id,
                    title: panel.props.title,
                    icon: panel.props.icon,
                    content: React.createElement(panel.component, { minimized: true } as any)
                  }),
                  onUndock: () => handleUndockPanel(panel.id),
                  onExpand: () => handleExpandPanel(panel.id),
                  onCollapse: handleCollapsePanel,
                  isDocked: isPanelDocked(panel.id),
                  isExpanded: false
                } as any)}
              </Box>
            );
          })}

          {/* Render short vertical handles only between adjacent panels */}
          {[...Array(gridLayout.cols - 1)].map((_, c) => {
            // For each row, if both sides of the boundary have a panel, render a short handle
            return gridLayout.areas.map((row, r) => {
              const leftPanel = row && row[c];
              const rightPanel = row && row[c+1];
              if (leftPanel && rightPanel && leftPanel !== rightPanel) {
                return (
                  <Box
                    key={`vhandle-${r}-${c}`}
                    sx={{
                      position: 'absolute',
                      left: `${((c+1)/gridLayout.cols)*100}%`,
                      top: `${(r/gridLayout.rows)*100}%`,
                      height: `${100/gridLayout.rows}%`,
                      width: '3px',
                      backgroundColor: theme.palette.divider,
                      cursor: 'col-resize',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                      },
                      zIndex: 1000,
                      transform: 'translateX(-50%)',
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={handleMouseDown('col')}
                  />
                );
              }
              return null;
            });
          })}

          {/* Render short horizontal handles only between adjacent panels */}
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
                      top: `${((r+1)/gridLayout.rows)*100}%`,
                      left: `${(c/gridLayout.cols)*100}%`,
                      width: `${100/gridLayout.cols}%`,
                      height: '3px',
                      backgroundColor: theme.palette.divider,
                      cursor: 'row-resize',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                      },
                      zIndex: 1000,
                      transform: 'translateY(-50%)',
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={handleMouseDown('row')}
                  />
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