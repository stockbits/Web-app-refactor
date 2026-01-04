import React from "react"
import { Box, Paper, Typography } from "@mui/material"
import { SplitPane } from "react-split-pane"

import "./mui-4-panel.css"

// ✅ Replace these placeholders with your real imports when ready
// import Gantt from "./Gantt"
// import MapView from "./MapView"
// import PeopleTable from "./PeopleTable"
// import TaskTable from "./TaskTable"

export default function MUI4Panel() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <SplitPane split="horizontal" minSize={120} defaultSize="50%">
        {/* TOP HALF */}
        <SplitPane split="vertical" minSize={200} defaultSize="50%">
          <Panel title="Gantt">
            <Placeholder label="Gantt component goes here" />
          </Panel>

          <Panel title="Map">
            <Placeholder label="Map component goes here" />
          </Panel>
        </SplitPane>

        {/* BOTTOM HALF */}
        <SplitPane split="vertical" minSize={200} defaultSize="50%">
          <Panel title="People">
            <Placeholder label="People table goes here" />
          </Panel>

          <Panel title="Tasks">
            <Placeholder label="Task table goes here" />
          </Panel>
        </SplitPane>
      </SplitPane>
    </Box>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        p: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
        }}
      >
        <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <Typography variant="subtitle2">{title}</Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", p: 1 }}>{children}</Box>
      </Paper>
    </Box>
  )
}

function Placeholder({ label }: { label: string }) {
  return (
    <Box
      sx={{
        height: "100%",
        border: "1px dashed rgba(0,0,0,0.2)",
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}
