import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack, Typography, Chip, Menu, MenuItem, Slider } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SettingsIcon from "@mui/icons-material/Settings";
// Using inline SVG for Task Group shield to control fill/outline
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { TaskIcon, type TaskIconVariant } from '../../MUI - Icon and Key/MUI - Icon';
import { TASK_ICON_COLORS } from '../../../../AppCentralTheme/Icon-Colors';
import { TASK_TABLE_ROWS, type TaskCommitType, type TaskTableRow } from '../../../App - Data Tables/Task - Table';
import { RESOURCE_TABLE_ROWS, type ResourceTableRow } from '../../../App - Data Tables/Resource - Table';
import { useMapSelection, useSelectionUI } from '../../MUI - Table/Selection - UI';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import { alpha } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ExploreIcon from '@mui/icons-material/Explore';

type MapLayerType = 'light' | 'dark' | 'voyager' | 'satellite';

interface LiveMapProps {
  onDock?: () => void;
  onUndock?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  isDocked?: boolean;
  isExpanded?: boolean;
  minimized?: boolean;
  layoutKey?: number;
  filteredTasks?: TaskTableRow[];
  selectedTaskIds?: string[];
  selectedResourceIds?: string[];
  selectedDivision?: string | null;
  selectedDomain?: string | null;
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

// Component to handle zooming to selected tasks and resources together
interface ZoomToResourceSelectionProps {
  selectedResourceIds: string[];
  filteredResources: ResourceTableRow[];
  selectedTaskIds: string[];
  filteredTasks?: TaskTableRow[];
}

function ZoomToResourceSelection({ selectedResourceIds, filteredResources, selectedTaskIds, filteredTasks }: ZoomToResourceSelectionProps) {
  const map = useMap();
  const tasksToDisplay = filteredTasks || TASK_TABLE_ROWS;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Debounce zoom to prevent jittery movements during multi-select
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        // Collect all selected coordinates (both tasks and resources)
        const allCoordinates: Array<[number, number]> = [];

        // Add selected resources
        if (selectedResourceIds.length > 0) {
          const selectedResources = filteredResources.filter(resource => selectedResourceIds.includes(resource.resourceId));
          selectedResources.forEach(resource => {
            allCoordinates.push([resource.homeLatitude, resource.homeLongitude]);
          });
        }

        // Add selected tasks
        if (selectedTaskIds.length > 0) {
          const selectedTasks = tasksToDisplay.filter(task => selectedTaskIds.includes(task.taskId));
          selectedTasks.forEach(task => {
            allCoordinates.push([task.taskLatitude, task.taskLongitude]);
          });
        }

        // If nothing is selected, do nothing
        if (allCoordinates.length === 0) return;

        // Single location: zoom to that location with zoom level 14
        if (allCoordinates.length === 1) {
          map.setView(allCoordinates[0], 14, {
            animate: true,
            duration: 0.4,
            easeLinearity: 0.2
          });
          return;
        }

        // Multiple locations: calculate bounds and fit to show all
        const bounds = L.latLngBounds(allCoordinates);
        map.fitBounds(bounds, {
          padding: [50, 50],
          animate: true,
          duration: 0.4,
          easeLinearity: 0.2
        });
      });
    }, 150);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectedResourceIds, selectedTaskIds, map, filteredResources, tasksToDisplay]);

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
    requestAnimationFrame(() => {
      map.setView(map.getCenter(), zoom, {
        animate: true,
        duration: 0.2,
        easeLinearity: 0.15
      });
    });
    onZoomChange(zoom);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(currentZoom + 0.5, maxZoom);
    requestAnimationFrame(() => {
      map.setView(map.getCenter(), newZoom, {
        animate: true,
        duration: 0.2,
        easeLinearity: 0.15
      });
    });
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(currentZoom - 0.5, minZoom);
    requestAnimationFrame(() => {
      map.setView(map.getCenter(), newZoom, {
        animate: true,
        duration: 0.2,
        easeLinearity: 0.15
      });
    });
    onZoomChange(newZoom);
  };

  return (
    <Box
      sx={theme => ({
        position: 'absolute',
        // Responsive positioning: center on larger screens, bottom-left on mobile
        left: { xs: theme.spacing(1), sm: theme.spacing(2) },
        top: { xs: 'auto', sm: '50%' },
        bottom: { xs: theme.spacing(2), sm: 'auto' },
        transform: { xs: 'none', sm: 'translateY(-50%)' },
        zIndex: 1000,
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'column' }, // Horizontal on mobile, vertical on larger screens
        alignItems: 'center',
        gap: { xs: 1, sm: 1.5 },
        maxWidth: { xs: '100%', sm: 48 },
        width: { xs: 'auto', sm: 'auto' },
        // Ensure it doesn't overflow the container
        right: { xs: theme.spacing(1), sm: 'auto' },
        [theme.breakpoints.down('sm')]: {
          left: theme.spacing(1),
          right: theme.spacing(1),
          bottom: theme.spacing(1),
          gap: 0.5,
          justifyContent: 'center', // Center horizontally on mobile
        },
      })}
    >
      <IconButton
        size="medium"
        onClick={handleZoomIn}
        disabled={currentZoom >= maxZoom}
        sx={{
          width: { xs: 36, sm: 44 },
          height: { xs: 36, sm: 44 },
          backgroundColor: theme.palette.background.paper,
          border: `2px solid ${theme.openreach.energyAccent}`,
          color: theme.openreach.energyAccent,
          boxShadow: 1,
          mb: { xs: 0, sm: 0.5 },
          mr: { xs: 0.5, sm: 0 },
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
          height: { xs: 40, sm: 60 }, // Shorter on mobile
          width: { xs: 60, sm: 'auto' }, // Wider on mobile for horizontal layout
          color: theme.openreach.energyAccent,
          '& .MuiSlider-thumb': {
            width: { xs: 10, sm: 12 },
            height: { xs: 10, sm: 12 },
            backgroundColor: theme.openreach.energyAccent,
            transition: 'all 0.2s ease',
          },
          '& .MuiSlider-track': {
            width: { xs: 2, sm: 2 },
            backgroundColor: theme.openreach.energyAccent,
            transition: 'all 0.2s ease',
          },
          '& .MuiSlider-rail': {
            width: { xs: 2, sm: 2 },
            opacity: 0.2,
            backgroundColor: theme.openreach.energyAccent,
          },
          // Hide slider on very small screens to prevent crowding
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <IconButton
        size="medium"
        onClick={handleZoomOut}
        disabled={currentZoom <= minZoom}
        sx={{
          width: { xs: 36, sm: 44 },
          height: { xs: 36, sm: 44 },
          backgroundColor: theme.palette.background.paper,
          border: `2px solid ${theme.openreach.energyAccent}`,
          color: theme.openreach.energyAccent,
          boxShadow: 1,
          mt: { xs: 0, sm: 0.5 },
          ml: { xs: 0.5, sm: 0 },
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

function LiveMap({ onDock, onUndock, onExpand, onCollapse, isDocked, isExpanded, minimized, layoutKey = 0, filteredTasks, selectedTaskIds: propSelectedTaskIds, selectedResourceIds: propSelectedResourceIds, selectedDivision, selectedDomain }: LiveMapProps = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? theme.openreach?.darkTableColors?.headerBg : theme.openreach?.tableColors?.headerBg;
  const taskColors = theme.openreach?.darkTokens?.mapTaskColors; // Always use dark mode colors for task icons

  // Selection UI integration - separate hooks for different concerns
  const { selectTaskFromMap, selectResourceFromMap } = useMapSelection();
  const { selectedTaskIds: contextSelectedTaskIds, selectedResourceIds: contextSelectedResourceIds } = useSelectionUI();
  
  // Use prop values if provided, otherwise use context
  const selectedTaskIds = propSelectedTaskIds ?? contextSelectedTaskIds;
  const selectedResourceIds = propSelectedResourceIds ?? contextSelectedResourceIds;

  // Use filteredTasks if provided, otherwise fall back to all tasks
  const tasksToDisplay = filteredTasks || TASK_TABLE_ROWS;

  // Filter resources based on selected division and domain
  const resourcesToDisplay = useMemo(() => {
    if (!selectedDivision || !selectedDomain) {
      return [];
    }
    
    return RESOURCE_TABLE_ROWS.filter(resource => 
      resource.division === selectedDivision && resource.domainId === selectedDomain
    );
  }, [selectedDivision, selectedDomain]);

  // Create Set for O(1) lookups - memoized for performance
  const selectedSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);

  // Memoize icon variant lookup
  const getIconVariant = useCallback((commitType: TaskCommitType): TaskIconVariant => {
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
  }, []);
  
  // Persist map layer selection in localStorage
  const [mapLayer, setMapLayer] = useState<MapLayerType>(() => {
    const saved = localStorage.getItem('liveMapLayer');
    return (saved as MapLayerType) || 'voyager'; // Default to Voyager (balanced, soft colors)
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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


  // Note: Removed auto-clear functionality to preserve multi-selections

  // Create memoized marker icons with visual feedback
  // Optimize by creating base icons without selection state, add selection via CSS class
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
      <div 
        className={isSelected ? 'marker-selected' : ''}
        style={{ 
          width: `${markerSize}px`, 
          height: `${markerSize}px`, 
          position: 'relative',
        }}
      >
        <TaskIcon 
          variant={variant} 
          size={markerSize} 
          color={colorMap[variant]}
        />
        {isSelected && (
          <div className="marker-selection-ring" style={{
            position: 'absolute',
            top: '-5px',
            left: '-5px',
            right: '-5px',
            bottom: '-5px',
            border: '3px solid #DC2626',
            borderRadius: '8px',
            pointerEvents: 'none'
          }} />
        )}
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: `custom-task-icon ${isSelected ? 'selected' : ''}`,
      iconSize: [markerSize, markerSize],
      iconAnchor: [markerSize / 2, markerSize],
      popupAnchor: [0, -markerSize],
    });
  }, [taskColors]);

  // Create resource marker icons with MUI PersonPinCircle icon - white background with colored person
  const createResourceMarkerIcon = useCallback((resource: ResourceTableRow, isSelected: boolean) => {
    const tokens = isDark ? theme.openreach?.darkTokens : theme.openreach?.lightTokens;
    
    const getStatusColor = () => {
      switch (resource.workingStatus) {
        case 'Signed on':
          return tokens?.success?.main || '#4CAF50';
        case 'Signed on no work':
          return tokens?.state?.warning || '#FF9800';
        case 'Not Signed on':
          return tokens?.state?.error || '#F44336';
        case 'Absent':
        case 'Rostered off':
          return theme.palette.text.secondary || '#9E9E9E';
        default:
          return '#9E9E9E';
      }
    };

    const markerSize = 40;
    const statusColor = getStatusColor();
    const iconHtml = `
      <div class="${isSelected ? 'marker-selected' : ''}" style="width: ${markerSize}px; height: ${markerSize}px; position: relative;">
        <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 24 24">
          <!-- White teardrop background with colored status outline -->
          <path fill="white" stroke="${statusColor}" stroke-width="1.5" d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"/>
          <!-- Jet black person silhouette in center -->
          <g fill="#000000" stroke="rgba(0, 0, 0, 0.2)" stroke-width="0.3">
            <circle cx="12" cy="6" r="2"/>
            <path d="M12 9.8c-2 0-3.98.73-4 2.05.86 1.3 2.33 2.15 4 2.15s3.14-.85 4-2.15c-.02-1.32-2-2.05-4-2.05z"/>
          </g>
        </svg>
        ${isSelected ? `
          <div class="marker-selection-ring" style="position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; border: 3px solid #DC2626; border-radius: 8px; pointer-events: none;"></div>
        ` : ''}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: `custom-resource-icon ${isSelected ? 'selected' : ''}`,
      iconSize: [markerSize, markerSize],
      iconAnchor: [markerSize / 2, markerSize],
      popupAnchor: [0, -markerSize],
    });
  }, [isDark, theme.openreach?.darkTokens, theme.openreach?.lightTokens, theme.palette.text.secondary]);

  // Memoize icons for each task to prevent recreation on every render
  const taskIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    // Use for loop for better performance than forEach
    for (let i = 0; i < tasksToDisplay.length; i++) {
      const task = tasksToDisplay[i];
      const variant = getIconVariant(task.commitType);
      const isSelected = selectedSet.has(task.taskId);
      const key = `${task.taskId}-${isSelected}`;
      icons[key] = createMarkerIcon(variant, isSelected);
    }
    return icons;
  }, [createMarkerIcon, tasksToDisplay, getIconVariant, selectedSet]);

  // Memoize icons for each resource to prevent recreation on every render
  const resourceIcons = useMemo(() => {
    const selectedResourceSet = new Set(selectedResourceIds);
    const icons: Record<string, L.DivIcon> = {};
    for (let i = 0; i < resourcesToDisplay.length; i++) {
      const resource = resourcesToDisplay[i];
      const isSelected = selectedResourceSet.has(resource.resourceId);
      const key = `${resource.resourceId}-${isSelected}`;
      icons[key] = createResourceMarkerIcon(resource, isSelected);
    }
    return icons;
  }, [createResourceMarkerIcon, resourcesToDisplay, selectedResourceIds]);

  // Get tile layer URL based on selected map type
  const getTileLayerConfig = () => {
    // Multiple theme options for different visual preferences
    switch (mapLayer) {
      case 'light':
        // CartoDB Positron - clean light theme with subtle colors
        return {
          url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd'
        };
      case 'dark':
        // CartoDB Dark Matter - smooth dark theme, easy on eyes
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd'
        };
      case 'satellite':
        // Esri Satellite - excellent quality, no seams
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri',
          subdomains: ''
        };
      case 'voyager':
      default:
        // CartoDB Voyager - balanced, modern style with soft colors (RECOMMENDED)
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd'
        };
    }
  };

  const tileConfig = getTileLayerConfig();

  const getMapLayerLabel = () => {
    const labels: Record<MapLayerType, string> = {
      light: 'Light',
      dark: 'Dark',
      voyager: 'Voyager',
      satellite: 'Satellite'
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
    return <SettingsIcon sx={{ fontSize: 24, color: 'inherit' }} />;
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
        minHeight: 300,
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
          <Stack direction="row" spacing={{ xs: 0.5, sm: 0.75 }} alignItems="center" sx={{ pr: { xs: 0.5, sm: 2 } }}>
            <Tooltip title={isDocked ? "Undock panel" : "Dock panel"}>
              <IconButton
                size="small"
                onClick={isDocked ? onUndock : onDock}
                sx={{
                  p: 0.25,
                  borderRadius: 1,
                  color: theme.openreach.energyAccent,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: theme.openreach.energyAccent,
                  },
                }}
              >
                <MapIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            {!isExpanded && (
              <Tooltip title="Expand to full screen">
                <IconButton
                  size="small"
                  onClick={onExpand}
                  sx={{
                    p: 0.25,
                    borderRadius: 1,
                    color: theme.openreach.energyAccent,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.openreach.energyAccent,
                    },
                  }}
                >
                  <OpenInFullIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
            {isExpanded && (
              <Tooltip title="Collapse to normal view">
                <IconButton
                  size="small"
                  onClick={onCollapse}
                  sx={{
                    p: 0.25,
                    borderRadius: 1,
                    color: theme.openreach.energyAccent,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.openreach.energyAccent,
                    },
                  }}
                >
                  <CloseFullscreenIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#E5E3DF', // Leaflet map tile background color
          position: 'relative',
          overflow: 'hidden', // Prevent white borders from showing
          '& .leaflet-tile-pane': {
            willChange: 'transform',
            transform: 'translate3d(0, 0, 0)',
            // Slight blur to hide tile seams
            filter: 'blur(0.3px) contrast(1.02)',
          },
          '& .leaflet-tile': {
            border: 'none !important',
            outline: 'none !important',
            boxShadow: 'none !important',
            margin: '-0.5px !important', // Negative margin to overlap tiles slightly
            backgroundColor: 'transparent',
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)',
            // High quality rendering with anti-aliasing
            imageRendering: '-webkit-optimize-contrast',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            // Prevent gaps
            display: 'block',
            maxWidth: 'none',
            width: 'calc(100% + 1px)', // Slight overlap
            height: 'calc(100% + 1px)',
          },
          '& .leaflet-tile-container': {
            margin: '0 !important',
            padding: '0 !important',
            // Overlap tiles to hide seams
            transform: 'scale(1.002)',
            transformOrigin: 'center',
          },
          '& .leaflet-container': {
            background: '#E5E3DF', // Match tile background
            willChange: 'transform',
          },
          '& .leaflet-layer': {
            imageRendering: 'auto',
          },
          '& .custom-task-icon': {
            background: 'none !important',
            border: 'none',
            pointerEvents: 'auto',
            transition: 'transform 0.15s ease-out',
            willChange: 'transform',
            '&:hover': {
              background: 'none !important',
              backgroundColor: 'transparent !important',
            },
          },
          '& .custom-task-icon.selected': {
            zIndex: 1000,
            transform: 'scale(1.05)',
          },
          '& .custom-resource-icon': {
            background: 'none !important',
            border: 'none',
            pointerEvents: 'auto',
            transition: 'transform 0.15s ease-out',
            willChange: 'transform',
            '&:hover': {
              background: 'none !important',
              backgroundColor: 'transparent !important',
            },
          },
          '& .custom-resource-icon.selected': {
            zIndex: 1000,
            transform: 'scale(1.05)',
          },
          '& .leaflet-marker-icon': {
            '&:hover': {
              background: 'none !important',
              backgroundColor: 'transparent !important',
            },
          },
          '& .marker-selection-ring': {
            animation: 'marker-pulse 0.3s ease-out',
          },
          '@keyframes marker-pulse': {
            '0%': {
              transform: 'scale(0.95)',
              opacity: 0.6,
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 1,
            }
          }
        }}
      >
        <Tooltip title={`Map Type: ${getMapLayerLabel()}`} placement="left">
          <IconButton
            size="medium"
            onClick={handleMenuOpen}
            sx={theme => ({
              position: 'absolute',
              top: { xs: theme.spacing(1), sm: theme.spacing(2) },
              right: { xs: theme.spacing(1), sm: theme.spacing(2) },
              zIndex: 1001,
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              backgroundColor: theme.palette.background.paper,
              border: `2px solid ${theme.openreach.energyAccent}`,
              color: theme.openreach.energyAccent,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.openreach.coreBlock,
              },
              [theme.breakpoints.down('sm')]: {
                top: theme.spacing(1),
                right: theme.spacing(1),
              },
            })}
            aria-label="Map type"
          >
            {getMapLayerIcon()}
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }
          }}
        >
            <MenuItem
              onClick={() => handleLayerSelect('voyager')}
              selected={mapLayer === 'voyager'}
              sx={{
                backgroundColor: mapLayer === 'voyager' ? theme.openreach.energyAccent : 'transparent',
                color: mapLayer === 'voyager' ? theme.openreach.brand.white : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: mapLayer === 'voyager' ? theme.openreach.coreBlock : (isDark ? 'rgba(255,255,255,0.1)' : theme.palette.action.hover),
                }
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" width="100%">
                <ExploreIcon sx={{ fontSize: 24, color: mapLayer === 'voyager' ? theme.openreach.energyAccent : 'inherit' }} />
                <Typography variant="body2">Voyager (Default)</Typography>
              </Stack>
            </MenuItem>
            <MenuItem
              onClick={() => handleLayerSelect('light')}
              selected={mapLayer === 'light'}
              sx={{
                backgroundColor: mapLayer === 'light' ? theme.openreach.energyAccent : 'transparent',
                color: mapLayer === 'light' ? theme.openreach.brand.white : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: mapLayer === 'light' ? theme.openreach.coreBlock : (isDark ? alpha(theme.palette.common.white, 0.1) : theme.palette.action.hover),
                }
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" width="100%">
                <LightModeIcon sx={{ fontSize: 24, color: mapLayer === 'light' ? theme.openreach.energyAccent : 'inherit' }} />
                <Typography variant="body2">Light</Typography>
              </Stack>
            </MenuItem>
            <MenuItem
              onClick={() => handleLayerSelect('dark')}
              selected={mapLayer === 'dark'}
              sx={{
                backgroundColor: mapLayer === 'dark' ? theme.openreach.energyAccent : 'transparent',
                color: mapLayer === 'dark' ? theme.openreach.brand.white : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: mapLayer === 'dark' ? theme.openreach.coreBlock : (isDark ? alpha(theme.palette.common.white, 0.1) : theme.palette.action.hover),
                }
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" width="100%">
                <DarkModeIcon sx={{ fontSize: 24, color: mapLayer === 'dark' ? theme.openreach.energyAccent : 'inherit' }} />
                <Typography variant="body2">Dark</Typography>
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
          </Menu>


        <MapContainer
          center={[54.5, -2.5]} // Center of UK
          zoom={6}
          style={{ height: '100%', width: '100%', display: 'block' }}
          key={mapLayer} // Force remount only when layer changes
          attributionControl={false}
          zoomControl={false}
          preferCanvas={true}
          minZoom={1}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={0.75}
          zoomSnap={0.5}
          zoomDelta={0.25}
          wheelPxPerZoomLevel={120}
          wheelDebounceTime={100}
          zoomAnimation={true}
          zoomAnimationThreshold={4}
          fadeAnimation={true}
          markerZoomAnimation={true}
        >
            {/* Position ZoomControl at bottom-left */}
            <ZoomControl 
              onZoomChange={setCurrentZoom} 
              currentZoom={currentZoom} 
              minZoom={1} 
              maxZoom={18} 
            />
            <MapResizeHandler layoutKey={layoutKey} />
            <TileLayer
              url={tileConfig.url}
              maxZoom={19}
              maxNativeZoom={18}
              minZoom={1}
              opacity={1}
              className="smooth-tiles"
              noWrap={false}
              bounds={[[-90, -180], [90, 180]]}
              subdomains={(tileConfig as { subdomains?: string }).subdomains || 'abc'}
              tileSize={(tileConfig as { tileSize?: number }).tileSize || 256}
              zoomOffset={(tileConfig as { zoomOffset?: number }).zoomOffset || 0}
              updateWhenIdle={false}
              updateWhenZooming={false}
              updateInterval={100}
              keepBuffer={4}
              crossOrigin={true}
              detectRetina={true}
              zIndex={1}
            />
            {/* Map click handler to close popup */}
            <MapClickHandler
              popupState={popupState}
              setPopupState={setPopupState}
              ignoreNextMapClickRef={ignoreNextMapClickRef}
            />

            {/* Zoom to selected tasks and resources together */}
            <ZoomToResourceSelection
              selectedResourceIds={selectedResourceIds}
              filteredResources={resourcesToDisplay}
              selectedTaskIds={selectedTaskIds}
              filteredTasks={filteredTasks}
            />

            {/* Render task markers */}
            {tasksToDisplay.map((task: TaskTableRow) => {
              const variant = getIconVariant(task.commitType);
              const isSelected = selectedSet.has(task.taskId);
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

                      // Use the selection UI system
                      selectTaskFromMap(task.taskId, isCtrlPressed);
                    },
                    mousedown: (e) => {
                      // Prevent default popup on mousedown (works for both mouse and touch) and show visual feedback
                      e.originalEvent.preventDefault();
                      e.originalEvent.stopPropagation();

                      // Check if CTRL key is held for multi-selection
                      const isCtrlPressed = e.originalEvent.ctrlKey || e.originalEvent.metaKey;

                      // Use the selection UI system
                      selectTaskFromMap(task.taskId, isCtrlPressed);
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
            
            {/* Render resource markers */}
            {resourcesToDisplay.map((resource: ResourceTableRow) => {
              const isSelected = selectedResourceIds.includes(resource.resourceId);
              const iconKey = `${resource.resourceId}-${isSelected}`;
              
              return (
                <Marker
                  key={`resource-${resource.resourceId}`}
                  position={[resource.homeLatitude, resource.homeLongitude]}
                  icon={resourceIcons[iconKey]}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.preventDefault();
                      e.originalEvent.stopPropagation();
                      const isCtrlPressed = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
                      selectResourceFromMap(resource.resourceId, isCtrlPressed);
                    },
                    mousedown: (e) => {
                      e.originalEvent.preventDefault();
                      e.originalEvent.stopPropagation();
                      const isCtrlPressed = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
                      selectResourceFromMap(resource.resourceId, isCtrlPressed);
                    },
                    dblclick: () => {
                      ignoreNextMapClickRef.current = true;
                      setTimeout(() => {
                        ignoreNextMapClickRef.current = false;
                      }, 250);

                      const tokens = isDark ? theme.openreach?.darkTokens : theme.openreach?.lightTokens;
                      const getStatusColor = () => {
                        switch (resource.workingStatus) {
                          case 'Signed on':
                            return tokens?.success?.main || '#4CAF50';
                          case 'Signed on no work':
                            return tokens?.state?.warning || '#FF9800';
                          case 'Not Signed on':
                          case 'Absent':
                            return tokens?.state?.error || '#F44336';
                          case 'Rostered off':
                            return theme.palette.text.secondary;
                          default:
                            return '#9E9E9E';
                        }
                      };

                      setPopupState({
                        isOpen: true,
                        position: [resource.homeLatitude, resource.homeLongitude],
                        content: (
                          <Box sx={{ p: 0.5, minWidth: 200 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: theme.openreach.coreBlock }}>
                              {resource.resourceName}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                              Resource ID: {resource.resourceId}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                              {resource.scheduleShift}: {resource.startTime} - {resource.endTime}
                            </Typography>
                            <Chip
                              label={resource.workingStatus}
                              size="small"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem', 
                                backgroundColor: getStatusColor(), 
                                color: theme.palette.common.white 
                              }}
                            />
                          </Box>
                        ),
                      });
                    }
                  }}
                />
              );
            })}

                {/* Render markers from task data */}
                {tasksToDisplay.map((task: TaskTableRow) => {
                  const variant = getIconVariant(task.commitType);
                  const isSelected = selectedSet.has(task.taskId);
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

                          // Use the selection UI system
                          selectTaskFromMap(task.taskId, isCtrlPressed);
                        },
                        mousedown: (e) => {
                          // Prevent default popup on mousedown (works for both mouse and touch) and show visual feedback
                          e.originalEvent.preventDefault();
                          e.originalEvent.stopPropagation();

                          // Check if CTRL key is held for multi-selection
                          const isCtrlPressed = e.originalEvent.ctrlKey || e.originalEvent.metaKey;

                          // Use the selection UI system
                          selectTaskFromMap(task.taskId, isCtrlPressed);
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
                
                {/* Add resource markers to cluster */}
                {resourcesToDisplay.map((resource: ResourceTableRow) => {
                  const isSelected = selectedResourceIds.includes(resource.resourceId);
                  const iconKey = `${resource.resourceId}-${isSelected}`;
                  
                  return (
                    <Marker
                      key={`resource-${resource.resourceId}`}
                      position={[resource.homeLatitude, resource.homeLongitude]}
                      icon={resourceIcons[iconKey]}
                      eventHandlers={{
                        click: (e) => {
                          e.originalEvent.preventDefault();
                          e.originalEvent.stopPropagation();
                          const isCtrlPressed = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
                          selectResourceFromMap(resource.resourceId, isCtrlPressed);
                        },
                        mousedown: (e) => {
                          e.originalEvent.preventDefault();
                          e.originalEvent.stopPropagation();
                          const isCtrlPressed = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
                          selectResourceFromMap(resource.resourceId, isCtrlPressed);
                        },
                        dblclick: () => {
                          ignoreNextMapClickRef.current = true;
                          setTimeout(() => {
                            ignoreNextMapClickRef.current = false;
                          }, 250);

                          const tokens = isDark ? theme.openreach?.darkTokens : theme.openreach?.lightTokens;
                          const getStatusColor = () => {
                            switch (resource.workingStatus) {
                              case 'Signed on':
                                return tokens?.success?.main || '#4CAF50';
                              case 'Signed on no work':
                                return tokens?.state?.warning || '#FF9800';
                              case 'Not Signed on':
                              case 'Absent':
                                return tokens?.state?.error || '#F44336';
                              case 'Rostered off':
                                return theme.palette.text.secondary;
                              default:
                                return '#9E9E9E';
                            }
                          };

                          setPopupState({
                            isOpen: true,
                            position: [resource.homeLatitude, resource.homeLongitude],
                            content: (
                              <Box sx={{ p: 0.5, minWidth: 200 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: theme.openreach.coreBlock }}>
                                  {resource.resourceName}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                  Resource ID: {resource.resourceId}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                                  {resource.scheduleShift}: {resource.startTime} - {resource.endTime}
                                </Typography>
                                <Chip
                                  label={resource.workingStatus}
                                  size="small"
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.7rem', 
                                    backgroundColor: getStatusColor(), 
                                    color: theme.palette.common.white 
                                  }}
                                />
                              </Box>
                            ),
                          });
                        }
                      }}
                    />
                  );
                })}
            
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
}

// Wrapper component with Selection UI Provider
export default LiveMap;
