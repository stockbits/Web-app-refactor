import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack, ToggleButtonGroup, ToggleButton, Typography, Chip } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import TerrainIcon from "@mui/icons-material/Terrain";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import LayersIcon from "@mui/icons-material/Layers";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

type MapLayerType = 'roadmap' | 'satellite' | 'terrain' | 'hybrid';

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
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? theme.openreach.darkTableColors.headerBg : theme.openreach.tableColors.headerBg;
  const [mapLayer, setMapLayer] = useState<MapLayerType>('roadmap');

  // Fix for default markers in react-leaflet
  useEffect(() => {
    const iconDefault = L.Icon.Default.prototype as unknown as Record<string, unknown>;
    delete iconDefault._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Get tile layer URL based on selected map type
  const getTileLayerConfig = () => {
    // Note: For production, you'd want to use a proper Google Maps API key
    // These are alternative tile providers that work without API keys for development
    switch (mapLayer) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        };
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
        };
      case 'hybrid':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri (Hybrid View)'
        };
      case 'roadmap':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
    }
  };

  const tileConfig = getTileLayerConfig();

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
          {/* Left side - Map type controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            <LayersIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
            <ToggleButtonGroup
              value={mapLayer}
              exclusive
              onChange={(_, newLayer) => newLayer && setMapLayer(newLayer)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 1,
                  py: 0.25,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  color: isDark ? theme.palette.common.white : theme.palette.text.primary,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(7,59,76,0.06)',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(7,59,76,0.12)',
                  },
                  '&.Mui-selected': {
                    bgcolor: theme.openreach.energyAccent,
                    color: '#fff',
                    boxShadow: theme.shadows[1],
                    borderColor: theme.openreach.energyAccent,
                    '&:hover': {
                      bgcolor: theme.openreach.coreBlock,
                    }
                  }
                }
              }}
            >
              <ToggleButton value="roadmap">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <MapIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">Road</Typography>
                </Stack>
              </ToggleButton>
              <ToggleButton value="satellite">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <SatelliteAltIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">Satellite</Typography>
                </Stack>
              </ToggleButton>
              <ToggleButton value="terrain">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TerrainIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">Terrain</Typography>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* Right side for secondary actions */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={isDocked ? "Undock panel" : "Dock panel"}>
              <IconButton
                size="small"
                onClick={isDocked ? onUndock : onDock}
                sx={{
                  p: 0.5,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(7,59,76,0.06)',
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(7,59,76,0.12)',
                    boxShadow: theme.shadows[1],
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
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(7,59,76,0.06)',
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(7,59,76,0.12)',
                      boxShadow: theme.shadows[1],
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
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(7,59,76,0.06)',
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(7,59,76,0.12)',
                      boxShadow: theme.shadows[1],
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
        <MapContainer
          center={[54.5, -2.5]} // Center of UK
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          key={mapLayer} // Force remount when layer changes for better performance
          attributionControl={false}
          zoomControl={true}
        >
            <TileLayer
              url={tileConfig.url}
            />
            {/* Sample markers for Openreach locations */}
            <Marker position={[51.5074, -0.1278]}>
              <Popup>
                <Box sx={{ p: 0.5, minWidth: 140 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: theme.openreach.coreBlock }}>
                    London Central
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    <Chip label="12 tasks" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    <Chip label="8 engineers" size="small" sx={{ height: 20, fontSize: '0.7rem' }} color="primary" />
                  </Stack>
                </Box>
              </Popup>
            </Marker>
            <Marker position={[53.4808, -2.2426]}>
              <Popup>
                <Box sx={{ p: 0.5, minWidth: 140 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: theme.openreach.coreBlock }}>
                    Manchester
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    <Chip label="6 tasks" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    <Chip label="4 engineers" size="small" sx={{ height: 20, fontSize: '0.7rem' }} color="primary" />
                  </Stack>
                </Box>
              </Popup>
            </Marker>
            <Marker position={[52.4862, -1.8904]}>
              <Popup>
                <Box sx={{ p: 0.5, minWidth: 140 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: theme.openreach.coreBlock }}>
                    Birmingham
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    <Chip label="9 tasks" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    <Chip label="6 engineers" size="small" sx={{ height: 20, fontSize: '0.7rem' }} color="primary" />
                  </Stack>
                </Box>
              </Popup>
            </Marker>
            <Marker position={[55.9533, -3.1883]}>
              <Popup>
                <Box sx={{ p: 0.5, minWidth: 140 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: theme.openreach.coreBlock }}>
                    Edinburgh
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    <Chip label="4 tasks" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    <Chip label="3 engineers" size="small" sx={{ height: 20, fontSize: '0.7rem' }} color="primary" />
                  </Stack>
                </Box>
              </Popup>
            </Marker>
            <Marker position={[50.8225, -0.1372]}>
              <Popup>
                <Box sx={{ p: 0.5, minWidth: 140 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: theme.openreach.coreBlock }}>
                    Brighton
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    <Chip label="7 tasks" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    <Chip label="5 engineers" size="small" sx={{ height: 20, fontSize: '0.7rem' }} color="primary" />
                  </Stack>
                </Box>
              </Popup>
            </Marker>
          </MapContainer>
      </Box>
    </Box>
  );
}
