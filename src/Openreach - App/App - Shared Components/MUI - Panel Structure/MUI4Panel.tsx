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
      { id: 'people', component: LivePeople, props: { title: 'Team Status', icon: <PeopleIcon fontSize="small" /> } },
      { id: 'map', component: LiveMap, props: { title: 'Live Map', icon: <MapIcon fontSize="small" /> } },
      { id: 'tasks', component: LiveTask, props: { title: 'Active Tasks', icon: <ChecklistIcon fontSize="small" /> } },
    ];
    return panels.filter(panel => !dockedPanels.some(p => p.id === panel.id));
  }, [dockedPanels]);

  // Calculate grid layout based on number of visible panels
  const gridLayout = useMemo(() => {
    const count = visiblePanels.length;
    if (count === 0) return { rows: 1, cols: 1, showVerticalHandle: false, showHorizontalHandle: false };
    if (count === 1) return { rows: 1, cols: 1, showVerticalHandle: false, showHorizontalHandle: false };
    if (count === 2) return { rows: 1, cols: 2, showVerticalHandle: true, showHorizontalHandle: false };
    if (count === 3) return { rows: 2, cols: 2, showVerticalHandle: true, showHorizontalHandle: true };
    // count === 4
    return { rows: 2, cols: 2, showVerticalHandle: true, showHorizontalHandle: true };
  }, [visiblePanels.length]);

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
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {React.createElement(expandedPanel.component, {
              onExpand: () => handleExpandPanel(expandedPanel.id),
              onCollapse: handleCollapsePanel,
              isExpanded: true
            } as any)}
          </Box>
        </Box>
      );
    }
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100%", // Account for top banner (~80px) + breadcrumb (~50px)
        width: "100%", // Full width now that padding is removed
        backgroundColor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden", // Prevent handles from extending beyond boundaries
        cursor: isResizing ? (isResizing === 'row' ? 'row-resize' : 'col-resize') : 'default',
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
          gridTemplateRows: gridLayout.rows === 1 ? '100%' : `${rowSizes[0]}% ${rowSizes[1]}%`,
          gridTemplateColumns: gridLayout.cols === 1 ? '100%' : `${colSizes[0]}% ${colSizes[1]}%`,
          gap: 0,
          position: 'relative',
          pointerEvents: isResizing ? 'none' : 'auto',
          '& > *': {
            pointerEvents: isResizing ? 'none' : 'auto',
          },
        }}>
          {visiblePanels.map((panel, index) => {
            const row = gridLayout.rows === 1 ? 1 : (index < gridLayout.cols ? 1 : 2);
            const col = gridLayout.cols === 1 ? 1 : ((index % gridLayout.cols) + 1);
            
            const commonProps = {
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
            };
            
            return (
              <Box key={panel.id} sx={{ gridRow: row, gridColumn: col, overflow: 'hidden' }}>
                {React.createElement(panel.component, commonProps as any)}
              </Box>
            );
          })}
          
          {/* Vertical resize handle - only show if needed */}
          {gridLayout.showVerticalHandle && (
            <Box
              sx={{
                position: 'absolute',
                left: `${colSizes[0]}%`,
                top: 0,
                bottom: 0,
                width: '8px',
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
          )}
          
          {/* Horizontal resize handle - only show if needed */}
          {gridLayout.showHorizontalHandle && (
            <Box
              sx={{
                position: 'absolute',
                top: `${rowSizes[0]}%`,
                left: 0,
                right: 0,
                height: '8px',
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
          )}
        </Box>
      )}
    </Box>
  );
}