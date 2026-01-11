import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack, Typography, Chip, Menu, MenuItem, Paper, Slider } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import TerrainIcon from "@mui/icons-material/Terrain";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import LegendToggleIcon from "@mui/icons-material/LegendToggle";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { memo } from 'react';
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

interface MapClickHandlerProps {
  popupState: { isOpen: boolean; position: [number, number] | null; content: React.ReactNode | null };
  setPopupState: React.Dispatch<React.SetStateAction<{ isOpen: boolean; position: [number, number] | null; content: React.ReactNode | null }>>;
  ignoreNextMapClickRef: React.MutableRefObject<boolean>;
}

function MapClickHandler({ popupState, setPopupState, ignoreNextMapClickRef }: MapClickHandlerProps) {
  useMapEvents({
    click: () => {
      // Skip the very next map click if a marker double-tap just happened
      if (ignoreNextMapClickRef.current) {
        ignoreNextMapClickRef.current = false;
        return;
      }
      // Close popup when clicking on map background (not on markers)
      if (popupState.isOpen) {
        setPopupState({
          isOpen: false,
          position: null,
          content: null,
        });
      }
    },
  });
  return null;
}

// Custom MUI Zoom Control Component
interface ZoomControlProps {
  onZoomChange: (zoom: number) => void;
  currentZoom: number;
  minZoom?: number;
  maxZoom?: number;
}

function ZoomControl({ onZoomChange, currentZoom, minZoom = 1, maxZoom = 18 }: ZoomControlProps) {
  const theme = useTheme();
  const map = useMap();

  const handleZoomChange = (_event: Event, value: number | number[]) => {
    const zoom = value as number;
    map.setZoom(zoom);
    onZoomChange(zoom);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(currentZoom + 1, maxZoom);
    map.setZoom(newZoom);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(currentZoom - 1, minZoom);
    map.setZoom(newZoom);
    onZoomChange(newZoom);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 70,
        left: 10,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <IconButton
        size="small"
        onClick={handleZoomIn}
        disabled={currentZoom >= maxZoom}
        sx={{
          width: 28,
          height: 28,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          color: theme.openreach.energyAccent,
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.openreach.energyAccent,
          },
          '&.Mui-disabled': {
            color: theme.palette.action.disabled,
          }
        }}
      >
        <AddIcon sx={{ fontSize: 18 }} />
      </IconButton>
      
      <Slider
        orientation="vertical"
        value={currentZoom}
        onChange={handleZoomChange}
        min={minZoom}
        max={maxZoom}
        step={1}
        sx={{
          height: 100,
          color: theme.openreach.energyAccent,
          '& .MuiSlider-thumb': {
            width: 14,
            height: 14,
          },
          '& .MuiSlider-track': {
            width: 3,
          },
          '& .MuiSlider-rail': {
            width: 3,
            opacity: 0.3,
          }
        }}
      />
      
      <IconButton
        size="small"
        onClick={handleZoomOut}
        disabled={currentZoom <= minZoom}
        sx={{
          width: 28,
          height: 28,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          color: theme.openreach.energyAccent,
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.openreach.energyAccent,
          },
          '&.Mui-disabled': {
            color: theme.palette.action.disabled,
          }
        }}
      >
        <RemoveIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}

export default memo(function LiveMap({ onDock, onUndock, onExpand, onCollapse, isDocked, isExpanded, minimized, layoutKey = 0 }: LiveMapProps = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? theme.openreach?.darkTableColors?.headerBg : theme.openreach?.tableColors?.headerBg;
  const taskColors = theme.openreach?.darkTokens?.mapTaskColors; // Always use dark mode colors for task icons
  
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
  const [clickedMarkerId, setClickedMarkerId] = useState<string | null>(null);
  const ignoreNextMapClickRef = useRef(false); // Prevent map click from closing popup right after marker double-tap
  const [currentZoom, setCurrentZoom] = useState(6); // Track current zoom level
  
  // Single popup state - stays open until explicitly closed
  const [popupState, setPopupState] = useState<{
    isOpen: boolean;
    position: [number, number] | null;
    content: React.ReactNode | null;
  }>({
    isOpen: false,
    position: null,
    content: null,
  });

  // Persist legend visibility to localStorage
  const setShowLegend = (value: boolean | ((prev: boolean) => boolean)) => {
    setShowLegendState((prev: boolean) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('liveMapShowLegend', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Clear clicked marker after a short delay
  const clickedMarkerIdRef = useRef(clickedMarkerId);
  clickedMarkerIdRef.current = clickedMarkerId;

  useEffect(() => {
    if (clickedMarkerIdRef.current) {
      const timer = setTimeout(() => {
        setClickedMarkerId(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  // Create memoized marker icons with visual feedback
  const createMarkerIcon = useCallback((variant: TaskIconVariant, isClicked: boolean) => {
    const iconHtml = renderToStaticMarkup(
      <div style={{ 
        width: '40px', 
        height: '40px', 
        position: 'relative',
        filter: isClicked ? 'brightness(1.3) drop-shadow(0 0 8px rgba(220, 38, 38, 0.6))' : 'none',
        transition: 'filter 0.2s ease-in-out'
      }}>
        <TaskIcon 
          variant={variant} 
          size={40} 
          color={taskColors[variant]}
        />
        {isClicked && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            border: '2px solid #DC2626',
            borderRadius: '4px',
            pointerEvents: 'none'
          }} />
        )}
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: 'custom-task-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }, [taskColors]);

  // Memoize icons for each task to prevent recreation on every render
  const taskIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    TASK_TABLE_ROWS.forEach((task) => {
      const variant = getIconVariant(task.commitType);
      const key = `${task.taskId}-${clickedMarkerId === task.taskId}`;
      icons[key] = createMarkerIcon(variant, clickedMarkerId === task.taskId);
    });
    return icons;
  }, [createMarkerIcon, clickedMarkerId]);

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
        return <SatelliteAltIcon sx={{ fontSize: 20, color: 'inherit' }} />;
      case 'terrain':
        return <TerrainIcon sx={{ fontSize: 20, color: 'inherit' }} />;
      default:
        return <MapIcon sx={{ fontSize: 20, color: 'inherit' }} />;
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
        <Toolbar variant="dense" sx={{ justifyContent: 'flex-end' }}>
          {/* Right side actions */}
          <Stack direction="row" spacing={0.5} sx={{ pr: 2 }}>
            <Tooltip title={showLegend ? "Hide legend" : "Show legend"}>
              <IconButton
                size="small"
                onClick={() => setShowLegend(!showLegend)}
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
                <LegendToggleIcon sx={{ fontSize: 20, color: 'inherit' }} />
              </IconButton>
            </Tooltip>
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
        {/* Map Layer Controls - Overlay on map */}
        <Tooltip title={`Map Type: ${getMapLayerLabel()}`} placement="right">
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              position: 'absolute',
              top: 16,
              left: 10,
              zIndex: 1000,
              width: 34,
              height: 34,
              backgroundColor: theme.palette.background.paper,
              border: `2px solid ${theme.palette.divider}`,
              color: theme.openreach.energyAccent,
              '&:hover': {
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.openreach.energyAccent,
              }
            }}
          >
            {getMapLayerIcon()}
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: theme.palette.background.paper,
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
                <MapIcon sx={{ fontSize: 20, color: mapLayer === 'roadmap' ? theme.openreach.energyAccent : 'inherit' }} />
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
                <SatelliteAltIcon sx={{ fontSize: 20, color: mapLayer === 'satellite' ? theme.openreach.energyAccent : 'inherit' }} />
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
                <TerrainIcon sx={{ fontSize: 20, color: mapLayer === 'terrain' ? theme.openreach.energyAccent : 'inherit' }} />
                <Typography variant="body2">Terrain</Typography>
              </Stack>
            </MenuItem>
          </Menu>


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
                color={taskColors.appointment}
              />
              <Typography variant="body2">Appointment</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TaskIcon 
                variant="startBy" 
                size={24}
                color={taskColors.startBy}
              />
              <Typography variant="body2">Start By</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TaskIcon 
                variant="completeBy" 
                size={24}
                color={taskColors.completeBy}
              />
              <Typography variant="body2">Complete By</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TaskIcon 
                variant="failedSLA" 
                size={24}
                color={taskColors.failedSLA}
              />
              <Typography variant="body2">Failed SLA</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: theme.openreach.energyAccent,
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'white' }}>
                  5
                </Typography>
              </Box>
              <Typography variant="body2">Cluster Task</Typography>
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
          zoomControl={false}
          preferCanvas={true}
        >
            <ZoomControl onZoomChange={setCurrentZoom} currentZoom={currentZoom} minZoom={1} maxZoom={18} />
            <MapResizeHandler layoutKey={layoutKey} />
            <TileLayer
              url={tileConfig.url}
              maxZoom={19}
              maxNativeZoom={18}
              opacity={1}
              className="smooth-tiles"
            />
            {/* Map click handler to close popup */}
            <MapClickHandler
              popupState={popupState}
              setPopupState={setPopupState}
              ignoreNextMapClickRef={ignoreNextMapClickRef}
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
                // Scale size based on cluster count
                const size = count < 10 ? 36 : count < 100 ? 44 : 52;
                const fontSize = count < 10 ? '13px' : count < 100 ? '15px' : '17px';
                
                return L.divIcon({
                  html: `<div style="
                    background: ${theme.openreach.energyAccent};
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.9);
                    border-radius: 50%;
                    width: ${size}px;
                    height: ${size}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: ${fontSize};
                    box-shadow: 0 3px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1);
                    transition: transform 0.2s ease;
                  ">${count}</div>`,
                  className: 'custom-cluster-icon',
                  iconSize: L.point(size, size, true),
                });
              }}
            >
              {/* Render markers from task data */}
              {TASK_TABLE_ROWS.map((task: typeof TASK_TABLE_ROWS[0]) => {
                const variant = getIconVariant(task.commitType);
                const iconKey = `${task.taskId}-${clickedMarkerId === task.taskId}`;

                return (
                  <Marker 
                    key={task.taskId} 
                    position={[task.taskLatitude, task.taskLongitude]} 
                    icon={taskIcons[iconKey]}
                    eventHandlers={{
                      click: (e) => {
                        // Prevent default popup on single click and show visual feedback
                        e.originalEvent.preventDefault();
                        e.originalEvent.stopPropagation();
                        setClickedMarkerId(task.taskId);
                      },
                      mousedown: (e) => {
                        // Prevent default popup on mousedown (works for both mouse and touch) and show visual feedback
                        e.originalEvent.preventDefault();
                        e.originalEvent.stopPropagation();
                        setClickedMarkerId(task.taskId);
                      },
                      dblclick: () => {
                        // Prevent map click handler from closing the popup after this interaction
                        ignoreNextMapClickRef.current = true;
                        setTimeout(() => {
                          ignoreNextMapClickRef.current = false;
                        }, 250);

                        // Update popup with new marker position and content
                        const variantLabel = task.commitType.replace('APPOINTMENT', 'Appointment').replace('START BY', 'Start By').replace('COMPLETE BY', 'Complete By').replace('TAIL', 'Tail');
                        setPopupState({
                          isOpen: true,
                          position: [task.taskLatitude, task.taskLongitude],
                          content: (
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
                                sx={{ height: 20, fontSize: '0.7rem', backgroundColor: variant === 'appointment' ? taskColors.appointment : variant === 'startBy' ? taskColors.startBy : variant === 'completeBy' ? taskColors.completeBy : taskColors.failedSLA, color: '#fff' }}
                              />
                            </Box>
                          ),
                        });
                      }
                    }}
                  >
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
            
            {/* Single reusable popup - stays open until explicitly closed */}
            {popupState.isOpen && popupState.position && (
              <Popup
                position={popupState.position}
                closeButton={true}
                autoClose={false}  // Don't auto-close, we handle it manually
                eventHandlers={{
                  remove: () => {
                    // Close popup when close button is clicked
                    setPopupState({
                      isOpen: false,
                      position: null,
                      content: null,
                    });
                  },
                }}
              >
                {popupState.content}
              </Popup>
            )}
          </MapContainer>
      </Box>
    </Box>
  );
});
