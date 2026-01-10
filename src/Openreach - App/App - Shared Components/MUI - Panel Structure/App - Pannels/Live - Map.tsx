import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack, Typography, Chip, Menu, MenuItem, Button, Paper } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import TerrainIcon from "@mui/icons-material/Terrain";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LegendToggleIcon from "@mui/icons-material/LegendToggle";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { TaskIcon, type TaskIconVariant } from '../../MUI - Icon and Key/MUI - Icon';
import { TASK_TABLE_ROWS, type TaskCommitType } from '../../../App - Data Tables/Task - Table';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

type MapLayerType = 'roadmap' | 'satellite' | 'terrain' | 'hybrid';

interface LiveMapProps {
  onDock?: () => void;
  onUndock?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  isDocked?: boolean;
  isExpanded?: boolean;
  minimized?: boolean;
  layoutKey?: number;
}

export default function LiveMap({ onDock, onUndock, onExpand, onCollapse, isDocked, isExpanded, minimized, layoutKey = 0 }: LiveMapProps = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? theme.openreach.darkTableColors.headerBg : theme.openreach.tableColors.headerBg;
  
  // Map commit types to icon variants
  const getIconVariant = (commitType: TaskCommitType): TaskIconVariant => {
    switch (commitType) {
      case 'APPOINTMENT':
        return 'appointment';
      case 'START BY':
        return 'startBy';
      case 'COMPLETE BY':
        return 'completeBy';
      case 'TAIL':
        return 'failedSLA';
      default:
        return 'appointment';
    }
  };
  
  // Persist map layer selection in localStorage
  const [mapLayer, setMapLayer] = useState<MapLayerType>(() => {
    const saved = localStorage.getItem('liveMapLayer');
    return (saved as MapLayerType) || 'roadmap';
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showLegend, setShowLegendState] = useState(() => {
    const saved = localStorage.getItem('liveMapShowLegend');
    return saved ? JSON.parse(saved) : false;
  });

  // Persist legend visibility to localStorage
  const setShowLegend = (value: boolean | ((prev: boolean) => boolean)) => {
    setShowLegendState((prev: boolean) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('liveMapShowLegend', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Create custom icon helper with theme colors
  const createTaskMarkerIcon = (variant: TaskIconVariant) => {
    // Get colors from theme context before rendering to static markup
    const colors = isDark ? {
      appointment: theme.openreach.darkTokens.state.info,
      startBy: theme.openreach.darkTokens.state.warning,
      completeBy: theme.openreach.darkTokens.state.success,
      failedSLA: theme.openreach.darkTokens.state.error,
    } : {
      appointment: theme.openreach.lightTokens.state.info,
      startBy: theme.openreach.lightTokens.state.warning,
      completeBy: theme.openreach.lightTokens.state.success,
      failedSLA: theme.openreach.lightTokens.state.error,
    };
    
    const iconHtml = renderToStaticMarkup(
      <div style={{ width: '40px', height: '40px', position: 'relative' }}>
        <TaskIcon 
          variant={variant} 
          size={40} 
          color={colors[variant]}
        />
      </div>
    );
    
    return L.divIcon({
      html: iconHtml,
      className: 'custom-task-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

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

  // Component to handle map resize when layout changes
  function MapResizeHandler({ layoutKey }: { layoutKey: number }) {
    const map = useMap();
    
    useEffect(() => {
      // Trigger resize after a short delay to ensure DOM has updated
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      
      return () => clearTimeout(timer);
    }, [layoutKey, map]);
    
    return null;
  }

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
    localStorage.setItem('liveMapLayer', layer);
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
          <Stack direction="row" spacing={0.5} sx={{ pr: 2 }}>
            <Tooltip title={showLegend ? "Hide legend" : "Show legend"}>
              <IconButton
                size="small"
                onClick={() => setShowLegend(!showLegend)}
                sx={{
                  p: 0.5,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: showLegend ? theme.openreach.energyAccent : 'transparent',
                  color: showLegend ? theme.openreach.brand.white : theme.openreach.energyAccent,
                  '&:hover': {
                    backgroundColor: showLegend ? theme.openreach.coreBlock : (isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)'),
                    boxShadow: theme.shadows[1],
                  },
                }}
              >
                <LegendToggleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
          position: 'relative',
          '& .leaflet-tile-pane': {
            filter: 'contrast(1.05)',
          },
          '& .leaflet-tile': {
            border: 'none !important',
          },
          '& .leaflet-container': {
            background: 'transparent',
          },
          '& .custom-task-icon': {
            background: 'none',
            border: 'none',
          }
        }}
      >
        {/* Task Icon Legend */}
        {showLegend && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            p: 2,
            minWidth: 200,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            Task Status
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TaskIcon 
                variant="appointment" 
                size={24}
                color="#D97706"
              />
              <Typography variant="body2">Appointment</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TaskIcon 
                variant="startBy" 
                size={24}
                color="#43B072"
              />
              <Typography variant="body2">Start By</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TaskIcon 
                variant="completeBy" 
                size={24}
                color="#5488C7"
              />
              <Typography variant="body2">Complete By</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TaskIcon 
                variant="failedSLA" 
                size={24}
                color="#DC2626"
              />
              <Typography variant="body2">Failed SLA</Typography>
            </Stack>
          </Stack>
        </Paper>
        )}

        <MapContainer
          center={[54.5, -2.5]} // Center of UK
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          key={mapLayer} // Force remount only when layer changes
          attributionControl={false}
          zoomControl={true}
          preferCanvas={true}
        >
            <MapResizeHandler layoutKey={layoutKey} />
            <TileLayer
              url={tileConfig.url}
              maxZoom={19}
              maxNativeZoom={18}
              opacity={1}
              className="smooth-tiles"
            />
            {/* Clustered task markers - simplified visual */}
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={200}
              disableClusteringAtZoom={13}
              spiderfyOnMaxZoom={false}
              showCoverageOnHover={false}
              zoomToBoundsOnClick={true}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              iconCreateFunction={(cluster: any) => {
                const count = cluster.getChildCount();
                return L.divIcon({
                  html: `<div style="
                    background: ${isDark ? theme.openreach.darkTokens.primary.main : theme.openreach.lightTokens.primary.main};
                    color: white;
                    border: 2px solid #000000;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                  ">${count}</div>`,
                  className: 'custom-cluster-icon',
                  iconSize: L.point(40, 40, true),
                });
              }}
            >
              {/* Render markers from task data */}
              {TASK_TABLE_ROWS.map((task: typeof TASK_TABLE_ROWS[0]) => {
                const variant = getIconVariant(task.commitType);
                const variantLabel = task.commitType.replace('APPOINTMENT', 'Appointment').replace('START BY', 'Start By').replace('COMPLETE BY', 'Complete By').replace('TAIL', 'Tail');

                return (
                  <Marker 
                    key={task.taskId} 
                    position={[task.taskLatitude, task.taskLongitude]} 
                    icon={createTaskMarkerIcon(variant)}
                  >
                    <Popup>
                      <Box sx={{ p: 0.5, minWidth: 200 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: theme.openreach.coreBlock }}>
                          {task.resourceName || 'Unassigned'}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                          Task ID: {task.taskId}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                          {task.postCode}
                        </Typography>
                        <Chip 
                          label={variantLabel} 
                          size="small" 
                          sx={{ height: 20, fontSize: '0.7rem', backgroundColor: variant === 'appointment' ? '#D97706' : variant === 'startBy' ? '#43B072' : variant === 'completeBy' ? '#5488C7' : '#DC2626', color: '#fff' }} 
                        />
                      </Box>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>
      </Box>
    </Box>
  );
}
