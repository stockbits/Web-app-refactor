import { Box, useTheme } from "@mui/material";
import { useState } from "react";
import SplitPane from "split-pane-react";
import "split-pane-react/esm/themes/default.css";

import LiveGantt from "./App - Pannels/Live - Gantt";
import LiveMap from "./App - Pannels/Live - Map";
import LivePeople from "./App - Pannels/Live - People";
import LiveTask from "./App - Pannels/Live - Task";

export default function MUI4Panel() {
  const theme = useTheme();
  // All panels get equal space: 50/50 for main split, then 50/50 for each sub-split = 25% each
  const [verticalSizes, setVerticalSizes] = useState([50, 50]);
  const [leftHorizontalSizes, setLeftHorizontalSizes] = useState([50, 50]);
  const [rightHorizontalSizes, setRightHorizontalSizes] = useState([50, 50]);

  const verticalSashRender = (_index: number, active: boolean) => (
    <div
      style={{
        background: active
          ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
          : `linear-gradient(90deg, ${theme.palette.divider}, ${theme.palette.action.hover})`,
        width: active ? "3px" : "2px",
        height: "100%",
        cursor: "col-resize",
        borderRadius: "1px",
        boxShadow: active
          ? `0 0 8px ${theme.palette.primary.main}40, inset 0 0 2px rgba(255,255,255,0.3)`
          : `0 0 4px ${theme.palette.action.hover}`,
        transition: "all 0.2s ease-in-out",
        opacity: active ? 1 : 0.7,
        position: "relative",
        zIndex: 10,
      }}
    />
  );

  const horizontalSashRender = (_index: number, active: boolean) => (
    <div
      style={{
        background: active
          ? `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
          : `linear-gradient(180deg, ${theme.palette.divider}, ${theme.palette.action.hover})`,
        height: active ? "3px" : "2px",
        width: "100%",
        cursor: "row-resize",
        borderRadius: "1px",
        boxShadow: active
          ? `0 0 8px ${theme.palette.primary.main}40, inset 0 0 2px rgba(255,255,255,0.3)`
          : `0 0 4px ${theme.palette.action.hover}`,
        transition: "all 0.2s ease-in-out",
        opacity: active ? 1 : 0.7,
        position: "relative",
        zIndex: 10,
      }}
    />
  );

  return (
    <Box
      sx={{
        height: "calc(100vh - 130px)", // Account for top banner (~80px) + breadcrumb (~50px)
        width: "100%", // Full width now that padding is removed
        backgroundColor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden", // Prevent handles from extending beyond boundaries
      }}
    >
      <SplitPane
        split="vertical"
        sizes={verticalSizes}
        onChange={setVerticalSizes}
        sashRender={verticalSashRender}
        style={{ height: "100%", position: "relative" }}
      >
        {/* Left Half */}
        <SplitPane
          split="horizontal"
          sizes={leftHorizontalSizes}
          onChange={setLeftHorizontalSizes}
          sashRender={horizontalSashRender}
          style={{ height: "100%", position: "relative" }}
        >
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LiveGantt />
          </Box>
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LivePeople />
          </Box>
        </SplitPane>
        {/* Right Half */}
        <SplitPane
          split="horizontal"
          sizes={rightHorizontalSizes}
          onChange={setRightHorizontalSizes}
          sashRender={horizontalSashRender}
          style={{ height: "100%", position: "relative" }}
        >
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LiveMap />
          </Box>
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LiveTask />
          </Box>
        </SplitPane>
      </SplitPane>
    </Box>
  );
}