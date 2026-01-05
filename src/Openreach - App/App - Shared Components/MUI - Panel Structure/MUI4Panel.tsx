import { Box, useTheme } from "@mui/material";
import { useState } from "react";
import { CustomSplitPane } from "./MUI - split Custom";

import LiveGantt from "./App - Pannels/Live - Gantt";
import LiveMap from "./App - Pannels/Live - Map";
import LivePeople from "./App - Pannels/Live - People";
import LiveTask from "./App - Pannels/Live - Task";

export default function MUI4Panel() {
  const theme = useTheme();
  // All panels get equal space: 50/50 for main split, then 50/50 for each sub-split = 25% each
  const [verticalSizes, setVerticalSizes] = useState<[number, number]>([50, 50]);
  const [leftHorizontalSizes, setLeftHorizontalSizes] = useState<[number, number]>([50, 50]);
  const [rightHorizontalSizes, setRightHorizontalSizes] = useState<[number, number]>([50, 50]);


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
      <CustomSplitPane
        split="vertical"
        sizes={verticalSizes}
        onChange={setVerticalSizes}
        style={{ height: "100%", position: "relative" }}
      >
        {/* Left Half */}
        <CustomSplitPane
          split="horizontal"
          sizes={leftHorizontalSizes}
          onChange={setLeftHorizontalSizes}
          style={{ height: "100%", position: "relative" }}
        >
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LiveGantt />
          </Box>
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LivePeople />
          </Box>
        </CustomSplitPane>
        {/* Right Half */}
        <CustomSplitPane
          split="horizontal"
          sizes={rightHorizontalSizes}
          onChange={setRightHorizontalSizes}
          style={{ height: "100%", position: "relative" }}
        >
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LiveMap />
          </Box>
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LiveTask />
          </Box>
        </CustomSplitPane>
      </CustomSplitPane>
    </Box>
  );
}