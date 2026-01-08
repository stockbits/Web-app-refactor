import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack, Typography, Chip, Menu, MenuItem, Button } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import TerrainIcon from "@mui/icons-material/Terrain";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const getMapLayerLabel = () => {
    const labels: Record<MapLayerType, string> = {
      roadmap: 'Road',
      satellite: 'Satellite',
      terrain: 'Terrain',
      hybrid: 'Hybrid'
    };
    return labels[mapLayer];
  };

  const getMapLayerIcon = () => {
    switch (mapLayer) {
      case 'satellite':
        return <SatelliteAltIcon sx={{ fontSize: 16 }} />;
      case 'terrain':
        return <TerrainIcon sx={{ fontSize: 16 }} />;
      default:
        return <MapIcon sx={{ fontSize: 16 }} />;
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLayerSelect = (layer: MapLayerType) => {
    setMapLayer(layer);
    handleMenuClose();
  };

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
          {/* Left side - Map type dropdown */}
          <Button
              size="small"
              onClick={handleMenuOpen}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                textTransform: 'none',
                color: theme.palette.text.primary,
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
                px: 1.5,
                py: 0.5,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : theme.palette.action.selected,
                }
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                {getMapLayerIcon()}
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {getMapLayerLabel()}
                </Typography>
              </Stack>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  backgroundColor: headerBg,
                  border: `1px solid ${theme.palette.divider}`,
                }
              }}
            >
              <MenuItem
                onClick={() => handleLayerSelect('roadmap')}
                selected={mapLayer === 'roadmap'}
                sx={{
                  backgroundColor: mapLayer === 'roadmap' ? theme.openreach.energyAccent : 'transparent',
                  color: mapLayer === 'roadmap' ? theme.openreach.brand.white : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: mapLayer === 'roadmap' ? theme.openreach.coreBlock : (isDark ? 'rgba(255,255,255,0.1)' : theme.palette.action.hover),
                  }
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" width="100%">
                  <MapIcon sx={{ fontSize: 18, color: mapLayer === 'roadmap' ? theme.openreach.energyAccent : 'inherit' }} />
                  <Typography variant="body2">Road Map</Typography>
                </Stack>
              </MenuItem>
              <MenuItem
                onClick={() => handleLayerSelect('satellite')}
                selected={mapLayer === 'satellite'}
                sx={{
                  backgroundColor: mapLayer === 'satellite' ? theme.openreach.energyAccent : 'transparent',
                  color: mapLayer === 'satellite' ? theme.openreach.brand.white : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: mapLayer === 'satellite' ? theme.openreach.coreBlock : (isDark ? 'rgba(255,255,255,0.1)' : theme.palette.action.hover),
                  }
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" width="100%">
                  <SatelliteAltIcon sx={{ fontSize: 18, color: mapLayer === 'satellite' ? theme.openreach.energyAccent : 'inherit' }} />
                  <Typography variant="body2">Satellite</Typography>
                </Stack>
              </MenuItem>
              <MenuItem
                onClick={() => handleLayerSelect('terrain')}
                selected={mapLayer === 'terrain'}
                sx={{
                  backgroundColor: mapLayer === 'terrain' ? theme.openreach.energyAccent : 'transparent',
                  color: mapLayer === 'terrain' ? theme.openreach.brand.white : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: mapLayer === 'terrain' ? theme.openreach.coreBlock : (isDark ? 'rgba(255,255,255,0.1)' : theme.palette.action.hover),
                  }
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" width="100%">
                  <TerrainIcon sx={{ fontSize: 18, color: mapLayer === 'terrain' ? theme.openreach.energyAccent : 'inherit' }} />
                  <Typography variant="body2">Terrain</Typography>
                </Stack>
              </MenuItem>
            </Menu>

          {/* Right side for secondary actions */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={isDocked ? "Undock panel" : "Dock panel"}>
              <IconButton
                size="small"
                onClick={isDocked ? onUndock : onDock}
                sx={{
                  p: 0.5,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.palette.action.hover,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : theme.palette.action.selected,
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
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.palette.action.hover,
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : theme.palette.action.selected,
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
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.palette.action.hover,
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : theme.palette.action.selected,
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
          '& .leaflet-tile-pane': {
            filter: 'contrast(1.05)',
          },
          '& .leaflet-tile': {
            border: 'none !important',
          },
          '& .leaflet-container': {
            background: 'transparent',
          }
        }}
      >
        <MapContainer
          center={[54.5, -2.5]} // Center of UK
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          key={mapLayer} // Force remount when layer changes for better performance
          attributionControl={false}
          zoomControl={true}
          preferCanvas={true}
        >
            <TileLayer
              url={tileConfig.url}
              maxZoom={19}
              maxNativeZoom={18}
              opacity={1}
              className="smooth-tiles"
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
