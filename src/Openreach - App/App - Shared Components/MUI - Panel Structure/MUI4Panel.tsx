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
      ) : visiblePanels.length === 1 ? (
        // Single panel takes full space
        <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {React.createElement(visiblePanels[0].component, {
            onDock: () => handleDockPanel({
              id: visiblePanels[0].id,
              title: visiblePanels[0].props.title,
              icon: visiblePanels[0].props.icon,
              content: React.createElement(visiblePanels[0].component, { minimized: true } as any)
            }),
            onUndock: () => handleUndockPanel(visiblePanels[0].id),
            onExpand: () => handleExpandPanel(visiblePanels[0].id),
            onCollapse: handleCollapsePanel,
            isDocked: false,
            isExpanded: false
          } as any)}
        </Box>
      ) : visiblePanels.length === 2 ? (
        // Two panels split horizontally with equal width
        <Box sx={{ height: "100%", display: "flex", gap: 0 }}>
          <Box sx={{ flex: 1, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {React.createElement(visiblePanels[0].component, {
              onDock: () => handleDockPanel({
                id: visiblePanels[0].id,
                title: visiblePanels[0].props.title,
                icon: visiblePanels[0].props.icon,
                content: React.createElement(visiblePanels[0].component, { minimized: true } as any)
              }),
              onUndock: () => handleUndockPanel(visiblePanels[0].id),
              onExpand: () => handleExpandPanel(visiblePanels[0].id),
              onCollapse: handleCollapsePanel,
              isDocked: false,
              isExpanded: false
            } as any)}
          </Box>
          <Box sx={{ flex: 1, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {React.createElement(visiblePanels[1].component, {
              onDock: () => handleDockPanel({
                id: visiblePanels[1].id,
                title: visiblePanels[1].props.title,
                icon: visiblePanels[1].props.icon,
                content: React.createElement(visiblePanels[1].component, { minimized: true } as any)
              }),
              onUndock: () => handleUndockPanel(visiblePanels[1].id),
              onExpand: () => handleExpandPanel(visiblePanels[1].id),
              onCollapse: handleCollapsePanel,
              isDocked: false,
              isExpanded: false
            } as any)}
          </Box>
        </Box>
      ) : visiblePanels.length === 3 ? (
        // Three panels: top takes 1/3, bottom split horizontally takes 2/3
        <Allotment vertical defaultSizes={[33, 67]}>
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {React.createElement(visiblePanels[0].component, {
              onDock: () => handleDockPanel({
                id: visiblePanels[0].id,
                title: visiblePanels[0].props.title,
                icon: visiblePanels[0].props.icon,
                content: React.createElement(visiblePanels[0].component, { minimized: true } as any)
              }),
              onUndock: () => handleUndockPanel(visiblePanels[0].id),
              onExpand: () => handleExpandPanel(visiblePanels[0].id),
              onCollapse: handleCollapsePanel,
              isDocked: false,
              isExpanded: false
            } as any)}
          </Box>
          <Allotment>
            <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {React.createElement(visiblePanels[1].component, {
                onDock: () => handleDockPanel({
                  id: visiblePanels[1].id,
                  title: visiblePanels[1].props.title,
                  icon: visiblePanels[1].props.icon,
                  content: React.createElement(visiblePanels[1].component, { minimized: true } as any)
                }),
                onUndock: () => handleUndockPanel(visiblePanels[1].id),
                onExpand: () => handleExpandPanel(visiblePanels[1].id),
                onCollapse: handleCollapsePanel,
                isDocked: false,
                isExpanded: false
              } as any)}
            </Box>
            <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {React.createElement(visiblePanels[2].component, {
                onDock: () => handleDockPanel({
                  id: visiblePanels[2].id,
                  title: visiblePanels[2].props.title,
                  icon: visiblePanels[2].props.icon,
                  content: React.createElement(visiblePanels[2].component, { minimized: true } as any)
                }),
                onUndock: () => handleUndockPanel(visiblePanels[2].id),
                onExpand: () => handleExpandPanel(visiblePanels[2].id),
                onCollapse: handleCollapsePanel,
                isDocked: false,
                isExpanded: false
              } as any)}
            </Box>
          </Allotment>
        </Allotment>
      ) : (
        // Four panels: original layout
        <Allotment vertical>
          <Allotment>
            <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
            <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
          </Allotment>
          <Allotment>
            <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
            <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
          </Allotment>
        </Allotment>
      )}
    </Box>
  );
}