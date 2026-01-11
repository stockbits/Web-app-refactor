import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack, Typography } from "@mui/material";
import ChecklistIcon from "@mui/icons-material/Checklist";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";

interface LiveTaskProps {
  onDock?: () => void;
  onUndock?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  isDocked?: boolean;
  isExpanded?: boolean;
  minimized?: boolean;
  globalSearch?: string;
}

export default function LiveTask({ onDock, onUndock, onExpand, onCollapse, isDocked, isExpanded, minimized, globalSearch = '' }: LiveTaskProps = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? theme.openreach.darkTableColors.headerBg : theme.openreach.tableColors.headerBg;
  const bodyIconColor = theme.openreach.energyAccent;
  const bodyTextColor = isDark ? theme.palette.common.white : theme.palette.text.primary;

  // TODO: Use globalSearch for filtering tasks
  console.log('Global search:', globalSearch);

  if (minimized) {
    return (
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ChecklistIcon sx={{ fontSize: 16, color: theme.openreach.energyAccent }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Minimized content */}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        border: isExpanded ? 'none' : `1px solid ${theme.palette.divider}`,
        boxSizing: "border-box",
        minHeight: 0,
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: headerBg,
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
          <Stack direction="row" spacing={0.5} sx={{ pr: 2 }}>
            <Tooltip title={isDocked ? "Undock panel" : "Dock panel"}>
              <IconButton
                size="small"
                onClick={isDocked ? onUndock : onDock}
                sx={{
                  p: 0.5,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: theme.openreach.energyAccent,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                  },
                }}
              >
                <ChecklistIcon
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
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                >
                  <OpenInFullIcon sx={{ fontSize: 20, color: 'inherit' }} />
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
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                >
                  <CloseFullscreenIcon sx={{ fontSize: 20, color: 'inherit' }} />
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
          <ChecklistIcon sx={{ fontSize: 48, color: bodyIconColor, mb: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ color: bodyTextColor }}>
            Active Tasks
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
