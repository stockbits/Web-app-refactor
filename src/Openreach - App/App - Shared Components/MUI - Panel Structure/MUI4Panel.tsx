import { Box, useTheme } from "@mui/material";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

import LiveGantt from "./App - Pannels/Live - Gantt";
import LiveMap from "./App - Pannels/Live - Map";
import LivePeople from "./App - Pannels/Live - People";
import LiveTask from "./App - Pannels/Live - Task";

export default function MUI4Panel() {
  const theme = useTheme();
  // All panels get equal space: 50/50 for main split, then 50/50 for each sub-split = 25% each
  // Allotment handles sizes internally for smooth resizing; no need for manual state unless you want to control it.


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
      <Allotment vertical>
        <Allotment>
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LiveGantt />
          </Box>
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LivePeople />
          </Box>
        </Allotment>
        <Allotment>
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LiveMap />
          </Box>
          <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <LiveTask />
          </Box>
        </Allotment>
      </Allotment>
    </Box>
  );
}