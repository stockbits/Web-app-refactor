import { 
  Box, 
  AppBar, 
  Toolbar, 
  useTheme, 
  Tooltip, 
  IconButton, 
  Stack, 
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Avatar,
  Chip,
  Divider,
  alpha
} from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { TASK_TABLE_ROWS, type TaskTableRow, type TaskCommitType } from "../../../App - Data Tables/Task - Table";
import { RESOURCE_TABLE_ROWS } from "../../../App - Data Tables/Resource - Table";
import { useMapSelection, useSelectionUI } from "../../Selection - UI";
import { TASK_ICON_COLORS } from "../../../../AppCentralTheme/Icon-Colors";

// Calculate distance between two coordinates using Haversine formula (in km)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate travel time in hours (assuming average speed of 40 km/h in urban areas)
const calculateTravelTime = (distanceKm: number): number => {
  const averageSpeedKmh = 40;
  return distanceKm / averageSpeedKmh;
};

// Parse time string "HH:MM" to decimal hours
const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes / 60);
};

// Parse duration string "H:MM" or "HH:MM" to decimal hours
const parseDuration = (duration: string): number => {
  const [hours, minutes] = duration.split(':').map(Number);
  return hours + (minutes / 60);
};

// Convert decimal hours to "HH:MM" format
const formatTime = (decimalHours: number): string => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Get task block color based on commit type
const getCommitTypeColor = (commitType: TaskCommitType): string => {
  switch (commitType) {
    case 'APPOINTMENT':
      return TASK_ICON_COLORS.appointment; // Amber/Orange
    case 'START BY':
      return TASK_ICON_COLORS.startBy; // Green
    case 'COMPLETE BY':
      return TASK_ICON_COLORS.completeBy; // Blue
    case 'TAIL':
      return TASK_ICON_COLORS.failedSLA; // Grey
    default:
      return TASK_ICON_COLORS.appointment;
  }
};

interface ScheduledBlock {
  type: 'travel' | 'task';
  taskId?: string;
  startTime: number; // Decimal hours from midnight
  duration: number; // Decimal hours
  dayOffset: number; // 0 for same day, 1 for next day, etc.
  task?: TaskTableRow;
  fromLocation?: { lat: number; lon: number };
  toLocation?: { lat: number; lon: number };
  distanceKm?: number;
}

interface LiveGanttProps {
  onDock?: () => void;
  onUndock?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  isDocked?: boolean;
  isExpanded?: boolean;
  minimized?: boolean;
  selectedDivision?: string | null;
  selectedDomain?: string | null;
}

interface TechnicianDayRow {
  technicianId: string;
  technicianName: string;
  date: Date;
  tasks: TaskTableRow[];
  shift?: string;
  shiftStart?: string;
  shiftEnd?: string;
  workingStatus?: 'Signed on' | 'Signed on no work' | 'Not Signed on' | 'Absent' | 'Rostered off';
  homeLatitude?: number;
  homeLongitude?: number;
  scheduledBlocks?: ScheduledBlock[]; // Scheduled travel and task blocks
  visibleTaskCount?: number;
}

const FIXED_COLUMN_WIDTH = 220;
const HOUR_WIDTH = 50; // pixels per hour
const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 32; // Timeline header with hour markers
const TOOLBAR_HEIGHT = 40; // Main toolbar - matches LiveMap

type DateRangePreset = 'today' | 'tomorrow' | '3-days' | '1-week' | '2-weeks' | '1-month';

interface DatePresetConfig {
  label: string;
  days: number;
  startOffset: number; // days from today
}

const DATE_PRESETS: Record<DateRangePreset, DatePresetConfig> = {
  'today': { label: 'Today', days: 1, startOffset: 0 },
  'tomorrow': { label: 'Tomorrow', days: 1, startOffset: 1 },
  '3-days': { label: '3 Days', days: 3, startOffset: 0 },
  '1-week': { label: '1 Week', days: 7, startOffset: 0 },
  '2-weeks': { label: '2 Weeks', days: 14, startOffset: 0 },
  '1-month': { label: '1 Month', days: 30, startOffset: 0 },
};

export default function LiveGantt({ 
  onDock, 
  onUndock, 
  onExpand, 
  onCollapse, 
  isDocked, 
  isExpanded, 
  minimized,
  selectedDivision,
  selectedDomain 
}: LiveGanttProps = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? theme.openreach.darkTableColors.headerBg : theme.openreach.tableColors.headerBg;
  const bodyIconColor = theme.openreach.energyAccent;
  const bodyTextColor = isDark ? theme.palette.common.white : theme.palette.text.primary;
  const borderColor = theme.palette.divider;

  // Date range state - default to today (1 day)
  const [startDate, setStartDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [visibleDays, setVisibleDays] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('today');

  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const fixedColumnRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic hour width based on expanded mode and visible days
  const hourWidth = useMemo(() => {
    // In expanded mode with 1 day, fit 24 hours in the viewport
    if (isExpanded && visibleDays === 1 && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const availableWidth = containerWidth - FIXED_COLUMN_WIDTH - 40; // Subtract fixed column and padding
      const calculatedWidth = Math.floor(availableWidth / 24);
      // Use calculated width but ensure minimum of 40px per hour for usability
      return Math.max(40, calculatedWidth);
    }
    // Default hour width for normal mode or multi-day view
    return HOUR_WIDTH;
  }, [isExpanded, visibleDays]);

  // Selection UI integration
  const { selectTaskFromMap, selectMultipleTasksFromMap } = useMapSelection();
  const { selectedTaskIds, selectTasks } = useSelectionUI();
  const selectedSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);

  // Handler to select all visible tasks for a technician - memoized for performance
  const handleSelectTechnicianTasks = useCallback((row: TechnicianDayRow, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Get all task IDs from the technician's scheduled blocks within the visible date range
    const taskIds = row.scheduledBlocks
      ?.filter(block => block.type === 'task' && block.taskId)
      .filter(block => block.dayOffset < visibleDays) // Only tasks within visible days
      .map(block => block.taskId!)
      .filter((id, index, arr) => arr.indexOf(id) === index) || []; // Remove duplicates
    
    // If Ctrl/Cmd is pressed, add to selection, otherwise replace
    const isCtrlPressed = event.ctrlKey || event.metaKey;
    if (isCtrlPressed) {
      // Add to existing selection
      const newSelection = Array.from(new Set([...selectedTaskIds, ...taskIds]));
      selectTasks(newSelection, 'map');
    } else {
      // Replace selection - use selectMultipleTasksFromMap to properly set source as 'map'
      selectMultipleTasksFromMap(taskIds);
    }
  }, [visibleDays, selectedTaskIds, selectTasks, selectMultipleTasksFromMap]);

  // Trigger recalculation on window resize in expanded mode
  useEffect(() => {
    if (!isExpanded || visibleDays !== 1) return;

    const handleResize = () => {
      // Force re-render to recalculate hourWidth
      if (containerRef.current) {
        containerRef.current.style.width = containerRef.current.offsetWidth + 'px';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, visibleDays]);

  // Generate date range
  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < visibleDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [startDate, visibleDays]);

  // Schedule tasks with travel time for each technician
  const scheduleTasksWithTravel = (
    tasks: TaskTableRow[],
    homeLatitude: number,
    homeLongitude: number,
    shiftStart: string,
    shiftEnd: string
  ): ScheduledBlock[] => {
    const blocks: ScheduledBlock[] = [];
    if (!tasks.length) return blocks;

    // Parse shift times
    const shiftStartHours = parseTime(shiftStart);
    const shiftEndHours = parseTime(shiftEnd);
    const dailyWorkingHours = shiftEndHours - shiftStartHours;

    // Sort tasks by commit date
    const sortedTasks = [...tasks].sort((a, b) => 
      new Date(a.commitDate).getTime() - new Date(b.commitDate).getTime()
    );

    let currentTime = shiftStartHours; // Start at beginning of shift
    let currentDayOffset = 0;
    let currentLocation = { lat: homeLatitude, lon: homeLongitude };

    sortedTasks.forEach((task) => {
      const taskDuration = parseDuration(task.taskDuration);
      const taskLocation = { lat: task.taskLatitude, lon: task.taskLongitude };

      // Calculate travel time from current location to task
      const distanceKm = calculateDistance(
        currentLocation.lat,
        currentLocation.lon,
        taskLocation.lat,
        taskLocation.lon
      );
      const travelTime = calculateTravelTime(distanceKm);

      // Check if travel + task fits in current day's remaining time
      const timeNeeded = travelTime + taskDuration;
      const timeRemaining = shiftEndHours - currentTime;

      // If doesn't fit, move to next day
      if (currentTime + timeNeeded > shiftEndHours && timeRemaining < dailyWorkingHours) {
        currentDayOffset++;
        currentTime = shiftStartHours;
        // Reset location to home at start of new day
        currentLocation = { lat: homeLatitude, lon: homeLongitude };
        
        // Recalculate travel from home
        const newDistanceKm = calculateDistance(
          currentLocation.lat,
          currentLocation.lon,
          taskLocation.lat,
          taskLocation.lon
        );
        const newTravelTime = calculateTravelTime(newDistanceKm);
        
        // Add travel block
        if (newTravelTime > 0.05) { // Only show if > 3 minutes
          blocks.push({
            type: 'travel',
            startTime: currentTime,
            duration: newTravelTime,
            dayOffset: currentDayOffset,
            fromLocation: currentLocation,
            toLocation: taskLocation,
            distanceKm: newDistanceKm,
          });
          currentTime += newTravelTime;
        }
      } else {
        // Add travel block for current day
        if (travelTime > 0.05) { // Only show if > 3 minutes
          blocks.push({
            type: 'travel',
            startTime: currentTime,
            duration: travelTime,
            dayOffset: currentDayOffset,
            fromLocation: currentLocation,
            toLocation: taskLocation,
            distanceKm: distanceKm,
          });
          currentTime += travelTime;
        }
      }

      // Add task block
      blocks.push({
        type: 'task',
        taskId: task.taskId,
        startTime: currentTime,
        duration: taskDuration,
        dayOffset: currentDayOffset,
        task: task,
        toLocation: taskLocation,
      });

      currentTime += taskDuration;
      currentLocation = taskLocation;
    });

    return blocks;
  };

  // Pre-compute date range set for faster lookups
  const dateRangeSet = useMemo(() => {
    return new Set(dateRange.map(d => {
      const rangeDate = new Date(d);
      rangeDate.setHours(0, 0, 0, 0);
      return rangeDate.getTime();
    }));
  }, [dateRange]);

  // Extract technicians from Resource Table and match with filtered tasks
  const technicianDayRows = useMemo(() => {
    if (!selectedDivision && !selectedDomain) {
      return [];
    }

    // Filter tasks by division and domain
    let filteredTasks = TASK_TABLE_ROWS;
    if (selectedDivision) {
      filteredTasks = filteredTasks.filter(task => task.division === selectedDivision);
    }
    if (selectedDomain) {
      filteredTasks = filteredTasks.filter(task => task.domainId === selectedDomain);
    }

    // Get unique resource IDs from filtered tasks
    const taskResourceIds = new Set(filteredTasks.map(task => task.resourceId));

    // Filter resources that have tasks and match division filter
    const relevantResources = RESOURCE_TABLE_ROWS.filter(resource => {
      const hasMatchingTasks = taskResourceIds.has(resource.resourceId);
      const matchesDivision = !selectedDivision || resource.division === selectedDivision;
      return hasMatchingTasks && matchesDivision;
    });

    // Create rows: one per resource (showing all their tasks across all days)
    const rows: TechnicianDayRow[] = [];
    relevantResources.forEach((resource) => {
      // Get all tasks for this resource across all days in the date range
      const resourceTasks = filteredTasks.filter(task => task.resourceId === resource.resourceId);

      // Schedule tasks with travel time
      const scheduledBlocks = scheduleTasksWithTravel(
        resourceTasks,
        resource.homeLatitude,
        resource.homeLongitude,
        resource.startTime,
        resource.endTime
      );

      // Pre-calculate visible task count for tooltip
      const visibleTaskCount = resourceTasks.filter(t => {
        const taskDate = new Date(t.commitDate);
        taskDate.setHours(0, 0, 0, 0);
        return dateRangeSet.has(taskDate.getTime());
      }).length;

      rows.push({
        technicianId: resource.resourceId,
        technicianName: resource.resourceName,
        date: dateRange[0], // Use first day for reference
        tasks: resourceTasks,
        shift: resource.scheduleShift,
        shiftStart: resource.startTime,
        shiftEnd: resource.endTime,
        workingStatus: resource.workingStatus,
        homeLatitude: resource.homeLatitude,
        homeLongitude: resource.homeLongitude,
        scheduledBlocks: scheduledBlocks,
        visibleTaskCount: visibleTaskCount,
      });
    });

    return rows;
  }, [selectedDivision, selectedDomain, dateRange, dateRangeSet]);

  // Scroll to 4am when data loads (after search) and when layout changes
  useEffect(() => {
    // Only scroll if we have data (after user has searched)
    if (technicianDayRows.length === 0) return;

    const scrollTo4AM = () => {
      const scrollPosition = 4 * hourWidth;
      if (timelineRef.current) {
        timelineRef.current.scrollLeft = scrollPosition;
      }
      if (timelineBodyRef.current) {
        timelineBodyRef.current.scrollLeft = scrollPosition;
      }
    };

    // Use requestAnimationFrame to ensure DOM is painted before scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollTo4AM);
    });
  }, [technicianDayRows.length, hourWidth, isExpanded, visibleDays]); // Re-run when data loads or layout changes

  // Navigation handlers
  const handlePreviousDay = () => {
    setStartDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setStartDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setStartDate(today);
  };

  const handlePresetChange = (preset: DateRangePreset) => {
    const config = DATE_PRESETS[preset];
    setSelectedPreset(preset);
    setVisibleDays(config.days);
    
    // Set start date based on offset
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + config.startOffset);
    setStartDate(today);
  };

  // Format date helpers
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  if (minimized) {
    return (
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimelineIcon sx={{ fontSize: 16, color: theme.openreach.energyAccent }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" noWrap sx={{ color: bodyTextColor }}>
            {technicianDayRows.length > 0 
              ? `${new Set(technicianDayRows.map(r => r.technicianId)).size} technicians`
              : 'Select Division/Domain'
            }
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        width: '100%',
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        border: isExpanded ? 'none' : `1px solid ${borderColor}`,
        boxSizing: "border-box",
        minHeight: 0,
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: headerBg,
          minHeight: TOOLBAR_HEIGHT,
          '& .MuiToolbar-root': {
            minHeight: TOOLBAR_HEIGHT,
            px: 1,
          }
        }}
      >
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between', minHeight: `${TOOLBAR_HEIGHT}px !important`, px: 2, gap: 2 }}>
          {/* Left side - Date navigation and range selector */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Navigation button group */}
            <Paper 
              elevation={0} 
              sx={{ 
                display: 'flex', 
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <Tooltip title="Previous">
                <IconButton
                  size="small"
                  onClick={handlePreviousDay}
                  sx={{ 
                    borderRadius: 0,
                    px: 0.75,
                    py: 0.5,
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem />
              <Tooltip title="Today">
                <IconButton
                  size="small"
                  onClick={handleToday}
                  sx={{ 
                    borderRadius: 0,
                    px: 0.75,
                    py: 0.5,
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <TodayIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem />
              <Tooltip title="Next">
                <IconButton
                  size="small"
                  onClick={handleNextDay}
                  sx={{ 
                    borderRadius: 0,
                    px: 0.75,
                    py: 0.5,
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Paper>
            
            {/* Date Range Preset Selector */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value as DateRangePreset)}
                sx={{
                  height: 28,
                  fontSize: '0.8rem',
                  color: bodyTextColor,
                  borderRadius: 1.5,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.openreach.energyAccent,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.openreach.energyAccent,
                    borderWidth: 1,
                  },
                }}
                startAdornment={
                  <CalendarMonthIcon sx={{ fontSize: 16, mr: 0.5, color: theme.openreach.energyAccent }} />
                }
              >
                {(Object.keys(DATE_PRESETS) as DateRangePreset[]).map((preset) => (
                  <MenuItem key={preset} value={preset} sx={{ fontSize: '0.8rem' }}>
                    {DATE_PRESETS[preset].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Date display as modern chip */}
            <Chip 
              label={
                visibleDays === 1 
                  ? formatDate(startDate)
                  : `${formatDate(startDate)} - ${formatDate(dateRange[dateRange.length - 1])}`
              }
              size="small"
              sx={{ 
                height: 26,
                fontSize: '0.75rem',
                fontWeight: 500,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(0,0,0,0.04)',
                color: bodyTextColor,
                border: `1px solid ${theme.palette.divider}`,
                '& .MuiChip-label': {
                  px: 1.5,
                },
              }}
            />
            
            {/* Time indicator */}
            <Chip 
              icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
              label={new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              size="small"
              sx={{ 
                height: 26,
                fontSize: '0.7rem',
                fontWeight: 500,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(0,0,0,0.04)',
                color: bodyTextColor,
                border: `1px solid ${theme.palette.divider}`,
                '& .MuiChip-icon': {
                  color: theme.openreach.energyAccent,
                  marginLeft: '6px',
                },
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          </Stack>

          {/* Right side for secondary actions */}
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ pr: 2 }}>
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
                <TimelineIcon sx={{ fontSize: 16 }} />
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

      {/* Main Gantt Content */}
      {(!selectedDivision && !selectedDomain) || technicianDayRows.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            backgroundColor: theme.palette.background.paper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <TimelineIcon sx={{ fontSize: 48, color: bodyIconColor, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom sx={{ color: bodyTextColor }}>
              {!selectedDivision && !selectedDomain 
                ? 'Select Division and Domain'
                : 'No technicians found'
              }
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {!selectedDivision && !selectedDomain
                ? 'Choose a division and domain to view technician schedules'
                : 'No technicians available for the selected filters'
              }
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {/* Timeline Header - with hour markers */}
          <Box
            sx={{
              display: 'flex',
              borderBottom: `2px solid ${borderColor}`,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
            }}
          >
            {/* Fixed column header */}
            <Box
              sx={{
                width: FIXED_COLUMN_WIDTH,
                flexShrink: 0,
                borderRight: `2px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: HEADER_HEIGHT,
                minHeight: HEADER_HEIGHT,
                boxSizing: 'border-box',
              }}
            >
              <Typography variant="caption" fontWeight={600} sx={{ color: bodyTextColor, fontSize: '0.8rem' }}>
                Engineer
              </Typography>
            </Box>

            {/* Scrollable timeline header */}
            <Box
              sx={{
                flex: 1,
                overflowX: 'auto',
                overflowY: 'hidden',
                height: HEADER_HEIGHT,
                minHeight: HEADER_HEIGHT,
                boxSizing: 'border-box',
                '&::-webkit-scrollbar': {
                  height: 0,
                  display: 'none',
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              ref={timelineRef}
              onScroll={(e) => {
                // Sync horizontal scroll with timeline body
                if (timelineBodyRef.current) {
                  timelineBodyRef.current.scrollLeft = (e.target as HTMLElement).scrollLeft;
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  minWidth: dateRange.length * 24 * hourWidth,
                  height: '100%',
                }}
              >
                {/* Hour markers for each hour of the day */}
                {dateRange.map((_date, dayIdx) => (
                  <Box key={dayIdx} sx={{ display: 'flex', position: 'relative' }}>
                    {Array.from({ length: 24 }).map((_, hourIdx) => (
                      <Box
                        key={hourIdx}
                        sx={{
                          width: hourWidth,
                          borderRight: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          color: theme.palette.text.secondary,
                          fontWeight: hourIdx % 6 === 0 ? 600 : 400,
                        }}
                      >
                        {hourIdx % 2 === 0 ? `${hourIdx.toString().padStart(2, '0')}:00` : ''}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Gantt Body - Scrollable rows */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden',
              minHeight: 0,
              position: 'relative',
            }}
          >
            {/* Fixed column - Technician names */}
            <Box
              ref={fixedColumnRef}
              sx={{
                width: FIXED_COLUMN_WIDTH,
                flexShrink: 0,
                borderRight: `2px solid ${borderColor}`,
                overflowY: 'scroll',
                overflowX: 'hidden',
                boxSizing: 'border-box',
                '&::-webkit-scrollbar': {
                  width: 0,
                  display: 'none',
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              onScroll={(e) => {
                // Sync vertical scroll with timeline body
                if (timelineBodyRef.current) {
                  timelineBodyRef.current.scrollTop = (e.target as HTMLElement).scrollTop;
                }
              }}
            >
              {technicianDayRows.map((row) => (
                <Box
                  key={`${row.technicianId}-${row.date.getTime()}`}
                  sx={{
                    height: `${ROW_HEIGHT}px`,
                    minHeight: `${ROW_HEIGHT}px`,
                    maxHeight: `${ROW_HEIGHT}px`,
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    gap: 1,
                    backgroundColor: theme.palette.background.paper,
                    boxSizing: 'border-box',
                  }}
                >
                  <Tooltip 
                    title="Select All"
                    placement="right"
                    arrow
                  >
                    <Avatar 
                      onClick={(e) => handleSelectTechnicianTasks(row, e)}
                      sx={{ 
                        width: 24, 
                        height: 24,
                        bgcolor: theme.openreach.energyAccent,
                        flexShrink: 0,
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.15)',
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 16, color: '#fff' }} />
                    </Avatar>
                  </Tooltip>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap sx={{ color: bodyTextColor, fontSize: '0.75rem', lineHeight: 1.1 }}>
                      {row.technicianName || row.technicianId}
                    </Typography>
                    {visibleDays === 1 && row.shiftStart && row.shiftEnd && (
                      <Typography variant="caption" noWrap sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <AccessTimeIcon sx={{ fontSize: 9 }} />
                        {row.shiftStart}-{row.shiftEnd}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Scrollable timeline - Task blocks */}
            <Box
              ref={timelineBodyRef}
              sx={{
                flex: 1,
                overflowX: 'scroll',
                overflowY: 'scroll',
                position: 'relative',
                boxSizing: 'border-box',
                paddingBottom: 0,
                marginBottom: 0,
                '&::-webkit-scrollbar': {
                  width: 10,
                  height: 0,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: theme.palette.background.default,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.divider,
                  borderRadius: 5,
                  '&:hover': {
                    backgroundColor: theme.palette.text.secondary,
                  },
                },
                '&::-webkit-scrollbar:horizontal': {
                  display: 'none',
                  height: 0,
                },
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar-track:horizontal': {
                  display: 'none',
                },
                '&::-webkit-scrollbar-thumb:horizontal': {
                  display: 'none',
                },
              }}
              onScroll={(e) => {
                const target = e.target as HTMLElement;
                // Sync vertical scroll with fixed column
                if (fixedColumnRef.current) {
                  fixedColumnRef.current.scrollTop = target.scrollTop;
                }
                // Sync horizontal scroll with header
                if (timelineRef.current) {
                  timelineRef.current.scrollLeft = target.scrollLeft;
                }
              }}
            >
              <Box
                sx={{
                  minWidth: dateRange.length * 24 * hourWidth,
                  maxWidth: dateRange.length * 24 * hourWidth,
                  position: 'relative',
                }}
              >
                {/* Hour grid lines */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    pointerEvents: 'none',
                  }}
                >
                  {dateRange.map((_, dayIdx) => (
                    <Box
                      key={dayIdx}
                      sx={{
                        width: 24 * hourWidth,
                        flexShrink: 0,
                        borderRight: `1px solid ${borderColor}`,
                        display: 'flex',
                      }}
                    >
                      {Array.from({ length: 24 }).map((_, hourIdx) => (
                        <Box
                          key={hourIdx}
                          sx={{
                            width: hourWidth,
                            borderRight: hourIdx < 23 ? `1px solid ${theme.palette.divider}` : 'none',
                            opacity: 0.3,
                          }}
                        />
                      ))}
                    </Box>
                  ))}
                </Box>

                {/* Current time indicator line */}
                {(() => {
                  const now = new Date();
                  const todayIndex = dateRange.findIndex(d => 
                    d.getDate() === now.getDate() &&
                    d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear()
                  );
                  
                  if (todayIndex !== -1) {
                    const hours = now.getHours();
                    const minutes = now.getMinutes();
                    const totalMinutes = hours * 60 + minutes;
                    const pixelsFromDayStart = (totalMinutes / (24 * 60)) * (24 * hourWidth);
                    const leftPosition = todayIndex * 24 * hourWidth + pixelsFromDayStart;
                    
                    return (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${leftPosition}px`,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          backgroundColor: theme.openreach.energyAccent,
                          zIndex: 100,
                          pointerEvents: 'none',
                          boxShadow: `0 0 4px ${theme.openreach.energyAccent}`,
                        }}
                      >
                        {/* Time indicator circle at top */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -6,
                            left: -4,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: theme.openreach.energyAccent,
                            border: `2px solid ${theme.palette.background.paper}`,
                            boxShadow: `0 0 6px ${theme.openreach.energyAccent}`,
                          }}
                        />
                      </Box>
                    );
                  }
                  return null;
                })()}

                {/* Rows with task blocks */}
                {technicianDayRows.map((row) => {
                  // Calculate shift time bars for each day (show shift hours across all days)
                  const shiftBars: Array<{ left: number; width: number }> = [];
                  
                  if (row.shiftStart && row.shiftEnd) {
                    const [startHour, startMin] = row.shiftStart.split(':').map(Number);
                    const [endHour, endMin] = row.shiftEnd.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMin;
                    const endMinutes = endHour * 60 + endMin;
                    const shiftDuration = ((endMinutes - startMinutes) / 60) * hourWidth;
                    
                    // Create shift bar for each day
                    dateRange.forEach((_, dayIndex) => {
                      const left = (dayIndex * 24 * hourWidth) + ((startMinutes / 60) * hourWidth);
                      shiftBars.push({ left, width: shiftDuration });
                    });
                  }

                  return (
                  <Box
                    key={`${row.technicianId}-${row.date.getTime()}`}
                    sx={{
                      height: `${ROW_HEIGHT}px`,
                      minHeight: `${ROW_HEIGHT}px`,
                      maxHeight: `${ROW_HEIGHT}px`,
                      borderBottom: `1px solid ${borderColor}`,
                      position: 'relative',
                      backgroundColor: theme.palette.background.paper,
                      boxSizing: 'border-box',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    {/* Shift time background bars for each day */}
                    {shiftBars.map((bar, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          position: 'absolute',
                          left: bar.left,
                          width: bar.width,
                          height: '100%',
                          backgroundColor: alpha(theme.palette.info.main, 0.15),
                          pointerEvents: 'none',
                          zIndex: 0,
                        }}
                      />
                    ))}
                    
                    {/* Scheduled blocks (travel and tasks) for this row - filter by visible days */}
                    {row.scheduledBlocks
                      ?.filter(block => block.dayOffset < visibleDays)
                      .map((block, blockIdx) => {
                      // Calculate position based on day offset and start time
                      const left = (block.dayOffset * 24 * hourWidth) + (block.startTime * hourWidth);
                      const width = block.duration * hourWidth;
                      
                      if (block.type === 'travel') {
                        // Render travel block
                        return (
                          <Tooltip
                            key={`travel-${blockIdx}`}
                            title={
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <DirectionsCarIcon sx={{ fontSize: '0.9rem' }} />
                                  <Typography variant="caption" fontWeight={600}>Travel</Typography>
                                </Box>
                                <Typography variant="caption" display="block">
                                  Distance: {block.distanceKm?.toFixed(1)} km
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Duration: {formatTime(block.duration)}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {formatTime(block.startTime)} - {formatTime(block.startTime + block.duration)}
                                </Typography>
                              </Box>
                            }
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                left: left,
                                top: '50%',
                                width: width,
                                height: 0,
                                borderTop: `3px dashed ${alpha(theme.palette.warning.main, 0.7)}`,
                                cursor: 'help',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: '-6px',
                                  width: '8px',
                                  height: '8px',
                                  backgroundColor: theme.palette.warning.main,
                                  borderRadius: '50%',
                                  border: `2px solid ${theme.palette.background.paper}`,
                                },
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  right: 0,
                                  top: '-6px',
                                  width: '8px',
                                  height: '8px',
                                  backgroundColor: theme.palette.warning.main,
                                  borderRadius: '50%',
                                  border: `2px solid ${theme.palette.background.paper}`,
                                },
                                '&:hover': {
                                  borderTopWidth: '4px',
                                  borderTopColor: theme.palette.warning.main,
                                },
                              }}
                            />
                          </Tooltip>
                        );
                      } else {
                        // Render task block
                        const task = block.task!;
                        const isSelected = selectedSet.has(task.taskId);
                        const commitTypeColor = getCommitTypeColor(task.commitType);
                        
                        return (
                          <Tooltip
                            key={`task-${task.taskId}`}
                            title={
                              <Box>
                                <Typography variant="caption" fontWeight={600}>{task.taskId}</Typography>
                                <Typography variant="caption" display="block">{task.commitType}</Typography>
                                <Typography variant="caption" display="block">{task.status}</Typography>
                                <Typography variant="caption" display="block">{task.postCode}</Typography>
                                <Typography variant="caption" display="block">
                                  Duration: {task.taskDuration}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {formatTime(block.startTime)} - {formatTime(block.startTime + block.duration)}
                                </Typography>
                              </Box>
                            }
                          >
                            <Paper
                              onClick={(e) => {
                                const isCtrlPressed = e.ctrlKey || e.metaKey;
                                selectTaskFromMap(task.taskId, isCtrlPressed);
                              }}
                              sx={{
                                position: 'absolute',
                                left: left,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: width,
                                height: ROW_HEIGHT - 16,
                                backgroundColor: commitTypeColor,
                                cursor: 'pointer',
                                border: isSelected 
                                  ? `4px solid ${theme.palette.primary.main}` 
                                  : `2px solid ${alpha('#000', 0.25)}`,
                                borderRadius: 1.5,
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease',
                                outline: isSelected ? `2px solid ${theme.palette.background.paper}` : 'none',
                                outlineOffset: '-1px',
                                '&:hover': {
                                  opacity: 0.9,
                                  boxShadow: theme.shadows[6],
                                  filter: 'brightness(1.15)',
                                  transform: 'translateY(-50%) scale(1.02)',
                                },
                              }}
                              elevation={isSelected ? 6 : 3}
                            />
                          </Tooltip>
                        );
                      }
                    })}
                  </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
