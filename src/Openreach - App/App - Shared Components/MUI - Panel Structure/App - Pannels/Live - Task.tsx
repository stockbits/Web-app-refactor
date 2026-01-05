import { Box, AppBar, Toolbar, useTheme, Tooltip } from "@mui/material";
import ChecklistIcon from "@mui/icons-material/Checklist";

export default function LiveTask() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxSizing: "border-box",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.warning?.main || '#f57c00',
          minHeight: 40,
          '& .MuiToolbar-root': {
            minHeight: 40,
            px: 1,
          }
        }}
      >
        <Toolbar variant="dense">
          <Tooltip title="Live Tasks - Active work assignments">
            <ChecklistIcon
              sx={{
                fontSize: 20,
                color: theme.palette.warning?.contrastText || '#000000',
                cursor: "pointer",
              }}
            />
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          flex: 1,
          backgroundColor: theme.palette.background.paper,
        }}
      />
    </Box>
  );
}
