import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack, Typography, Chip, Menu, MenuItem, Slider } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import TerrainIcon from "@mui/icons-material/Terrain";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
// Using inline SVG for Task Group shield to control fill/outline
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { memo } from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { TaskIcon, type TaskIconVariant } from '../../MUI - Icon and Key/MUI - Icon';
import { TASK_ICON_COLORS } from '../../../../App - Central Theme/Icon-Colors';
import { TASK_TABLE_ROWS, type TaskCommitType } from '../../../App - Data Tables/Task - Table';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { alpha } from '@mui/material/styles';

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

  // Sync slider with map zoom changes (from mouse wheel, double-click, etc.)
  useEffect(() => {
    const handleZoomEnd = () => {
      const newZoom = map.getZoom();
      if (newZoom !== currentZoom) {
        onZoomChange(newZoom);
      }
    };

    map.on('zoomend', handleZoomEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, currentZoom, onZoomChange]);

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
        top: '50%',
        left: 16,
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.2,
        maxWidth: 48,
      }}
    >
      <IconButton
        size="medium"
        onClick={handleZoomIn}
        disabled={currentZoom >= maxZoom}
        sx={{
          width: 44,
          height: 44,
          backgroundColor: theme.palette.background.paper,
          border: `2px solid ${theme.openreach.energyAccent}`,
          color: theme.openreach.energyAccent,
          boxShadow: 1,
          mb: 0.5,
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.openreach.coreBlock,
          },
          '&.Mui-disabled': {
            color: theme.palette.action.disabled,
            borderColor: theme.palette.action.disabled,
          }
        }}
        aria-label="Zoom in"
      >
        <AddIcon fontSize="medium" />
      </IconButton>
      <Slider
        orientation="vertical"
        value={currentZoom}
        onChange={handleZoomChange}
        min={minZoom}
        max={maxZoom}
        step={1}
        sx={{
          height: 60,
          color: theme.openreach.energyAccent,
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
            backgroundColor: theme.openreach.energyAccent,
            transition: 'all 0.2s ease',
          },
          '& .MuiSlider-track': {
            width: 2,
            backgroundColor: theme.openreach.energyAccent,
            transition: 'all 0.2s ease',
          },
          '& .MuiSlider-rail': {
            width: 2,
            opacity: 0.2,
            backgroundColor: theme.openreach.energyAccent,
          }
        }}
      />
      <IconButton
        size="medium"
        onClick={handleZoomOut}
        disabled={currentZoom <= minZoom}
        sx={{
          width: 44,
          height: 44,
          backgroundColor: theme.palette.background.paper,
          border: `2px solid ${theme.openreach.energyAccent}`,
          color: theme.openreach.energyAccent,
          boxShadow: 1,
          mt: 0.5,
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.openreach.coreBlock,
          },
          '&.Mui-disabled': {
            color: theme.palette.action.disabled,
            borderColor: theme.palette.action.disabled,
          }
        }}
        aria-label="Zoom out"
      >
        <RemoveIcon fontSize="medium" />
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
  const [clickedMarkerIds, setClickedMarkerIds] = useState<string[]>([]);
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

  // Clear clicked marker after a short delay
  const clickedMarkerIdsRef = useRef(clickedMarkerIds);
  clickedMarkerIdsRef.current = clickedMarkerIds;

  // Note: Removed auto-clear functionality to preserve multi-selections

  // Create memoized marker icons with visual feedback
  const createMarkerIcon = useCallback((variant: TaskIconVariant, isSelected: boolean) => {
    const colorMap: Record<TaskIconVariant, string> = {
      appointment: taskColors?.appointment || TASK_ICON_COLORS.appointment,
      startBy: taskColors?.startBy || TASK_ICON_COLORS.startBy,
      completeBy: taskColors?.completeBy || TASK_ICON_COLORS.completeBy,
      failedSLA: taskColors?.failedSLA || TASK_ICON_COLORS.failedSLA,
      taskGroup: taskColors?.taskGroup || TASK_ICON_COLORS.taskGroup,
    };
    const markerSize = 32;
    const iconHtml = renderToStaticMarkup(
      <div style={{ 
        width: `${markerSize}px`, 
        height: `${markerSize}px`, 
        position: 'relative',
        filter: isSelected ? `brightness(1.3) drop-shadow(0 0 8px ${alpha(theme.palette.error.main, 0.6)})` : 'none',
        transition: 'filter 0.2s ease-in-out'
      }}>
        <TaskIcon 
          variant={variant} 
          size={markerSize} 
          color={colorMap[variant]}
        />
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            border: `2px solid ${theme.palette.error.main}`,
            borderRadius: '4px',
            pointerEvents: 'none'
          }} />
        )}
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: 'custom-task-icon',
      iconSize: [markerSize, markerSize],
      iconAnchor: [markerSize / 2, markerSize],
      popupAnchor: [0, -markerSize],
    });
  }, [taskColors, theme]);

  // Memoize icons for each task to prevent recreation on every render
  const taskIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    TASK_TABLE_ROWS.forEach((task) => {
      const variant = getIconVariant(task.commitType);
      const isSelected = clickedMarkerIds.includes(task.taskId);
      const key = `${task.taskId}-${isSelected}`;
      icons[key] = createMarkerIcon(variant, isSelected);
    });
    return icons;
  }, [createMarkerIcon, clickedMarkerIds]);

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
        return <SatelliteAltIcon sx={{ fontSize: 24, color: 'inherit' }} />;
      case 'terrain':
        return <TerrainIcon sx={{ fontSize: 24, color: 'inherit' }} />;
      default:
        return <MapIcon sx={{ fontSize: 24, color: 'inherit' }} />;
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
        <MapIcon sx={{ fontSize: 24, color: theme.openreach.energyAccent }} />
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
                  <OpenInFullIcon sx={{ fontSize: 24, color: 'inherit' }} />
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
                  <CloseFullscreenIcon sx={{ fontSize: 24, color: 'inherit' }} />
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
            willChange: 'transform', // hardware acceleration
          },
          '& .leaflet-tile': {
            border: 'none !important',
            boxShadow: 'none',
            backgroundColor: 'transparent',
            willChange: 'transform', // hardware acceleration
          },
          '& .leaflet-container': {
            background: 'transparent',
            willChange: 'transform', // hardware acceleration
          },
          '& .custom-task-icon': {
            background: 'none',
            border: 'none',
            pointerEvents: 'auto',
          }
        }}
      >
        {/* Map Layer Controls - Overlay on map */}
        <Tooltip title={`Map Type: ${getMapLayerLabel()}`} placement="right">
          <IconButton
            size="medium"
            onClick={handleMenuOpen}
            sx={{
              position: 'absolute',
              top: 24,
              left: 16,
              zIndex: 1001,
              width: 44,
              height: 44,
              backgroundColor: theme.palette.background.paper,
              border: `2px solid ${theme.openreach.energyAccent}`,
              color: theme.openreach.energyAccent,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.openreach.coreBlock,
              }
            }}
            aria-label="Map type"
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
                <MapIcon sx={{ fontSize: 24, color: mapLayer === 'roadmap' ? theme.openreach.energyAccent : 'inherit' }} />
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
                  backgroundColor: mapLayer === 'satellite' ? theme.openreach.coreBlock : (isDark ? alpha(theme.palette.common.white, 0.1) : theme.palette.action.hover),
                }
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" width="100%">
                <SatelliteAltIcon sx={{ fontSize: 24, color: mapLayer === 'satellite' ? theme.openreach.energyAccent : 'inherit' }} />
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
                  backgroundColor: mapLayer === 'terrain' ? theme.openreach.coreBlock : (isDark ? alpha(theme.palette.common.white, 0.1) : theme.palette.action.hover),
                }
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" width="100%">
                <TerrainIcon sx={{ fontSize: 24, color: mapLayer === 'terrain' ? theme.openreach.energyAccent : 'inherit' }} />
                <Typography variant="body2">Terrain</Typography>
              </Stack>
            </MenuItem>
          </Menu>


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

                // Inline SVG for GppMaybe shield with white count text
                const shieldFill = taskColors?.taskGroup || TASK_ICON_COLORS.taskGroup;
                const borderColor = theme.openreach?.coreBlock || theme.palette.common.black;
                const textColor = theme.palette.common.white;
                const svgSize = Math.round(size * 0.75);
                const fontSize = Math.max(10, Math.round(svgSize * 0.4)); // Scale font size with icon
                const iconHtml = `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;position:relative;">`
                  + `
                  <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="paint-order:stroke fill">
                    <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="${shieldFill}" stroke="${borderColor}" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
                  </svg>
                  <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:${textColor};font-size:${fontSize}px;font-weight:600;font-family:${theme.typography.fontFamily};line-height:1;">${count}</span>
                </div>`;

                return L.divIcon({
                  html: iconHtml,
                  className: 'custom-cluster-icon',
                  iconSize: L.point(size, size, true),
                });
              }}
            >
              {/* Render markers from task data */}
              {TASK_TABLE_ROWS.map((task: typeof TASK_TABLE_ROWS[0]) => {
                const variant = getIconVariant(task.commitType);
                const isSelected = clickedMarkerIds.includes(task.taskId);
                const iconKey = `${task.taskId}-${isSelected}`;

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
                        
                        // Check if CTRL key is held for multi-selection
                        const isCtrlPressed = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
                        
                        if (isCtrlPressed) {
                          // Multi-select: toggle this marker in the selection
                          setClickedMarkerIds(prev => 
                            prev.includes(task.taskId) 
                              ? prev.filter(id => id !== task.taskId) // Remove if already selected
                              : [...prev, task.taskId] // Add if not selected
                          );
                        } else {
                          // Single select: replace selection with just this marker
                          setClickedMarkerIds([task.taskId]);
                        }
                      },
                      mousedown: (e) => {
                        // Prevent default popup on mousedown (works for both mouse and touch) and show visual feedback
                        e.originalEvent.preventDefault();
                        e.originalEvent.stopPropagation();
                        
                        // Check if CTRL key is held for multi-selection
                        const isCtrlPressed = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
                        
                        if (isCtrlPressed) {
                          // Multi-select: toggle this marker in the selection
                          setClickedMarkerIds(prev => 
                            prev.includes(task.taskId) 
                              ? prev.filter(id => id !== task.taskId) // Remove if already selected
                              : [...prev, task.taskId] // Add if not selected
                          );
                        } else {
                          // Single select: replace selection with just this marker
                          setClickedMarkerIds([task.taskId]);
                        }
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
                                sx={{ height: 20, fontSize: '0.7rem', backgroundColor: variant === 'appointment' ? taskColors?.appointment : variant === 'startBy' ? taskColors?.startBy : variant === 'completeBy' ? taskColors?.completeBy : variant === 'taskGroup' ? taskColors?.taskGroup : taskColors?.failedSLA, color: theme.palette.common.white }}
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
