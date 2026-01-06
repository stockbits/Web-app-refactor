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
        // Simple 2x2 grid layout with resizable panels
        <Box sx={{
          height: '100%',
          display: 'grid',
          gridTemplateRows: `${rowSizes[0]}% ${rowSizes[1]}%`,
          gridTemplateColumns: `${colSizes[0]}% ${colSizes[1]}%`,
          gap: 0,
          position: 'relative',
        }}>
          <Box sx={{ gridRow: 1, gridColumn: 1, overflow: 'hidden' }}>
            <LiveGantt
              onDock={() => handleDockPanel({
                id: 'gantt',
                title: 'Gantt Chart',
                icon: <TimelineIcon fontSize="small" />,
                content: <LiveGantt minimized />
              })}
              onUndock={() => handleUndockPanel('gantt')}
              onExpand={() => handleExpandPanel('gantt')}
              onCollapse={handleCollapsePanel}
              isDocked={isPanelDocked('gantt')}
              isExpanded={false}
            />
          </Box>
          
          {/* Vertical resize handle */}
          <Box
            sx={{
              position: 'absolute',
              left: `${colSizes[0]}%`,
              top: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: theme.palette.divider,
              cursor: 'col-resize',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
              zIndex: 10,
            }}
            onMouseDown={handleMouseDown('col')}
          />
          
          <Box sx={{ gridRow: 1, gridColumn: 2, overflow: 'hidden' }}>
            <LiveMap
              onDock={() => handleDockPanel({
                id: 'map',
                title: 'Live Map',
                icon: <MapIcon fontSize="small" />,
                content: <LiveMap minimized />
              })}
              onUndock={() => handleUndockPanel('map')}
              onExpand={() => handleExpandPanel('map')}
              onCollapse={handleCollapsePanel}
              isDocked={isPanelDocked('map')}
              isExpanded={false}
            />
          </Box>
          
          {/* Horizontal resize handle */}
          <Box
            sx={{
              position: 'absolute',
              top: `${rowSizes[0]}%`,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: theme.palette.divider,
              cursor: 'row-resize',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
              zIndex: 10,
            }}
            onMouseDown={handleMouseDown('row')}
          />
          
          <Box sx={{ gridRow: 2, gridColumn: 1, overflow: 'hidden' }}>
            <LivePeople
              onDock={() => handleDockPanel({
                id: 'people',
                title: 'Team Status',
                icon: <PeopleIcon fontSize="small" />,
                content: <LivePeople minimized />
              })}
              onUndock={() => handleUndockPanel('people')}
              onExpand={() => handleExpandPanel('people')}
              onCollapse={handleCollapsePanel}
              isDocked={isPanelDocked('people')}
              isExpanded={false}
            />
          </Box>
          
          <Box sx={{ gridRow: 2, gridColumn: 2, overflow: 'hidden' }}>
            <LiveTask
              onDock={() => handleDockPanel({
                id: 'tasks',
                title: 'Active Tasks',
                icon: <ChecklistIcon fontSize="small" />,
                content: <LiveTask minimized />
              })}
              onUndock={() => handleUndockPanel('tasks')}
              onExpand={() => handleExpandPanel('tasks')}
              onCollapse={handleCollapsePanel}
              isDocked={isPanelDocked('tasks')}
              isExpanded={false}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}