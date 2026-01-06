import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack, Typography } from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";

interface LiveGanttProps {
  onDock?: () => void;
  onUndock?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  isDocked?: boolean;
  isExpanded?: boolean;
  minimized?: boolean;
}

export default function LiveGantt({ onDock, onUndock, onExpand, onCollapse, isDocked, isExpanded, minimized }: LiveGanttProps = {}) {
  const theme = useTheme();

  if (minimized) {
    return (
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimelineIcon sx={{ fontSize: 16, color: theme.openreach.energyAccent }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Minimized content */}
        </Box>
      </Box>
    );
  }

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
          backgroundColor: theme.openreach.tableColors.headerBg,
          minHeight: 40,
          '& .MuiToolbar-root': {
            minHeight: 40,
            px: 1,
          }
        }}
      >
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          {/* Left side reserved for main tools */}
          <Box />

          {/* Right side for secondary actions */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={isDocked ? "Undock panel" : "Dock panel"}>
              <IconButton
                size="small"
                onClick={isDocked ? onUndock : onDock}
                sx={{
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <TimelineIcon
                  sx={{
                    fontSize: 20,
                    color: theme.openreach.energyAccent,
                  }}
                />
              </IconButton>
            </Tooltip>
            {!isExpanded && (
              <Tooltip title="Expand to full screen">
                <IconButton
                  size="small"
                  onClick={onExpand}
                  sx={{
                    p: 0.5,
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <OpenInFullIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isExpanded && (
              <Tooltip title="Collapse to normal view">
                <IconButton
                  size="small"
                  onClick={onCollapse}
                  sx={{
                    p: 0.5,
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <CloseFullscreenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          flex: 1,
          backgroundColor: theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <TimelineIcon sx={{ fontSize: 48, color: theme.openreach.energyAccent, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Gantt Chart
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Timeline view of scheduled tasks and resources
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
