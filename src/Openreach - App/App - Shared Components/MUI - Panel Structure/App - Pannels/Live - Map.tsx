import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface LiveMapProps {
  onDock?: () => void;
  onUndock?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  isDocked?: boolean;
  isExpanded?: boolean;
  minimized?: boolean;
}

export default function LiveMap({ onDock, onUndock, onExpand, onCollapse, isDocked, isExpanded, minimized }: LiveMapProps = {}) {
  const theme = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // Fix for default markers in react-leaflet
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
    setIsMounted(true);
  }, []);

  if (minimized) {
    return (
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <MapIcon sx={{ fontSize: 16, color: theme.openreach.energyAccent }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Minimized content */}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: isExpanded ? '100vh' : '100%',
        width: isExpanded ? '100vw' : '100%',
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
                <MapIcon
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
        }}
      >
        {isMounted ? (
          <MapContainer
            center={[54.5, -2.5]} // Center of UK
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Sample markers for Openreach locations */}
            <Marker position={[51.5074, -0.1278]}>
              <Popup>
                <strong>London Central</strong><br />
                Active tasks: 12<br />
                Engineers: 8
              </Popup>
            </Marker>
            <Marker position={[53.4808, -2.2426]}>
              <Popup>
                <strong>Manchester</strong><br />
                Active tasks: 6<br />
                Engineers: 4
              </Popup>
            </Marker>
            <Marker position={[52.4862, -1.8904]}>
              <Popup>
                <strong>Birmingham</strong><br />
                Active tasks: 9<br />
                Engineers: 6
              </Popup>
            </Marker>
            <Marker position={[55.9533, -3.1883]}>
              <Popup>
                <strong>Edinburgh</strong><br />
                Active tasks: 4<br />
                Engineers: 3
              </Popup>
            </Marker>
            <Marker position={[50.8225, -0.1372]}>
              <Popup>
                <strong>Brighton</strong><br />
                Active tasks: 7<br />
                Engineers: 5
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.palette.background.default,
            }}
          >
            Loading map...
          </Box>
        )}
      </Box>
    </Box>
  );
}
