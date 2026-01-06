import { Box, useTheme } from "@mui/material";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { useState } from "react";
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
      sx={{
        height: "100%", // Account for top banner (~80px) + breadcrumb (~50px)
        width: "100%", // Full width now that padding is removed
        backgroundColor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden", // Prevent handles from extending beyond boundaries
      }}
    >
      <LiveMap />
    </Box>
  );
}