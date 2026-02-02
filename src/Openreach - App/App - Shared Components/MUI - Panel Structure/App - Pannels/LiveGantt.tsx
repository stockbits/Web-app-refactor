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
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SettingsIcon from "@mui/icons-material/Settings";
import React, { useState, useMemo, useRef, useEffect, useCallback, useReducer } from "react";
import { TASK_TABLE_ROWS, TASK_STATUS_LABELS, type TaskTableRow, type TaskCommitType } from "../../../App - Data Tables/Task - Table";
import { RESOURCE_TABLE_ROWS } from "../../../App - Data Tables/Resource - Table";
import { GANTT_STATUSES } from '../../MUI - Table/TaskTableQueryConfig.shared';
import { useMapSelection, useSelectionUI } from "../../MUI - Table/Selection - UI";
import { TASK_ICON_COLORS } from "../../../../AppCentralTheme/Icon-Colors";
import { GanttSettingsDialog, type GanttSettings } from './GanttSettingsDialog';

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
  filteredTasks?: TaskTableRow[];
  onAppendTasks?: (tasks: TaskTableRow[]) => void;
}

interface TechnicianDayRow {
  technicianId: string;
  technicianName: string;
  division?: string;
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
  domainId?: string;
  workPreference?: 'X' | 'B' | 'U';
}

const BASE_HOUR_WIDTH = 50; // Base pixels per hour
const MIN_HOUR_WIDTH = 20; // Minimum zoom out - increased for better positioning
const MAX_HOUR_WIDTH = 200; // Maximum zoom in - reduced to prevent overflow
const ZOOM_MULTIPLIER = 1.15; // Faster zoom response (15% per scroll)
const BASE_ROW_HEIGHT = 36;
const MIN_COLUMN_WIDTH = 80; // Minimum width for resource column
const MAX_COLUMN_WIDTH = 280; // Maximum width for resource column
const HEADER_HEIGHT = 32; // Timeline header with hour markers
const TOOLBAR_HEIGHT = 40; // Main toolbar - matches LiveMap
const DAY_HEADER_HEIGHT = 28; // Day date header

// Determine hour label interval based on visible days and zoom level
const getHourLabelInterval = (hourWidth: number, visibleDays: number): number => {
  // For single day view, always show every hour - no zooming out allowed
  if (visibleDays === 1) {
    return 1; // Always 1-hour intervals for single day view
  }
  
  // For multi-day views, be more conservative to avoid clutter
  // Calculate effective space per hour considering text width requirements
  let baseInterval: number;
  
  if (visibleDays <= 2) {
    // 2 days: generous spacing
    if (hourWidth >= 40) baseInterval = 2;      // Every 2 hours
    else if (hourWidth >= 30) baseInterval = 3; // Every 3 hours  
    else if (hourWidth >= 20) baseInterval = 4; // Every 4 hours
    else baseInterval = 6;                       // Every 6 hours
  } else if (visibleDays <= 4) {
    // 3-4 days: moderate spacing
    if (hourWidth >= 35) baseInterval = 3;      // Every 3 hours
    else if (hourWidth >= 25) baseInterval = 4; // Every 4 hours
    else if (hourWidth >= 20) baseInterval = 6; // Every 6 hours  
    else baseInterval = 8;                       // Every 8 hours
  } else if (visibleDays <= 7) {
    // 5-7 days: conservative spacing
    if (hourWidth >= 30) baseInterval = 4;      // Every 4 hours
    else if (hourWidth >= 22) baseInterval = 6; // Every 6 hours
    else if (hourWidth >= 18) baseInterval = 8; // Every 8 hours
    else baseInterval = 12;                      // Every 12 hours
  } else if (visibleDays <= 14) {
    // 8-14 days: sparse spacing
    if (hourWidth >= 25) baseInterval = 6;      // Every 6 hours
    else if (hourWidth >= 20) baseInterval = 8; // Every 8 hours
    else baseInterval = 12;                      // Every 12 hours
  } else {
    // 15+ days: very sparse spacing
    if (hourWidth >= 22) baseInterval = 8;      // Every 8 hours  
    else if (hourWidth >= 18) baseInterval = 12; // Every 12 hours
    else baseInterval = 24;                      // Once per day only
  }
  
  return baseInterval;
};

// Format date for day header
const formatDateHeader = (date: Date): string => {
  return date.toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short' 
  });
};

type DateRangePreset = 'today' | '2-days' | '4-days' | '1-week' | '1-month';
type GanttPopulationMode = 'auto' | 'manual';

interface DatePresetConfig {
  label: string;
  days: number;
  startOffset: number; // days from today
}

const DATE_PRESETS: Record<DateRangePreset, DatePresetConfig> = {
  'today': { label: 'Today', days: 1, startOffset: 0 },
  '2-days': { label: '2 Days', days: 2, startOffset: 0 },
  '4-days': { label: '4 Days', days: 4, startOffset: 0 },
  '1-week': { label: '1 Week', days: 7, startOffset: 0 },
  '1-month': { label: '1 Month', days: 30, startOffset: 0 },
};

function LiveGantt({ 
  onDock, 
  onUndock, 
  onExpand, 
  onCollapse, 
  isDocked, 
  isExpanded, 
  minimized,
  selectedDivision,
  selectedDomain,
  filteredTasks,
  onAppendTasks
}: LiveGanttProps = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? theme.openreach.darkTableColors.headerBg : theme.openreach.tableColors.headerBg;
  const bodyIconColor = theme.openreach.energyAccent;
  const bodyTextColor = isDark ? theme.palette.common.white : theme.palette.text.primary;
  const borderColor = theme.palette.divider;

  // Helper function to build resource display text based on settings
  const getResourceDisplayText = useCallback((row: TechnicianDayRow, settings: GanttSettings): string[] => {
    const parts: string[] = [];
    
    settings.resourceFields.forEach(field => {
      if (!field.enabled) return;
      
      switch (field.key) {
        case 'id':
          parts.push(row.technicianId);
          break;
        case 'name':
          if (row.technicianName) parts.push(row.technicianName);
          break;
        case 'division':
          if (row.division) parts.push(row.division);
          break;
        case 'workingStatus':
          if (row.workingStatus) parts.push(row.workingStatus);
          break;
        case 'shift':
          if (row.shift) parts.push(row.shift);
          break;
        case 'shiftTimes':
          if (row.shiftStart && row.shiftEnd) parts.push(`${row.shiftStart}-${row.shiftEnd}`);
          break;
        case 'domain':
          if (row.domainId) parts.push(row.domainId);
          break;
        case 'workPreference':
          if (row.workPreference) {
            const prefMap = { 'X': 'Default', 'B': 'Batches', 'U': 'Underground' };
            parts.push(prefMap[row.workPreference] || row.workPreference);
          }
          break;
      }
    });
    
    return parts.length > 0 ? parts : [row.technicianId]; // Fallback to ID if nothing enabled
  }, []);

  // Calculate dynamic column width based on enabled resource fields
  const getColumnWidth = useCallback((settings: GanttSettings): number => {
    const enabledCount = settings.resourceFields.filter(f => f.enabled).length;
    // Base width + additional width per enabled field
    const baseWidth = MIN_COLUMN_WIDTH;
    const perFieldWidth = 50; // Additional pixels per field
    const calculatedWidth = baseWidth + (enabledCount * perFieldWidth);
    return Math.min(Math.max(calculatedWidth, MIN_COLUMN_WIDTH), MAX_COLUMN_WIDTH);
  }, []);

  // Calculate row height based on enabled task and resource fields
  const getRowHeight = useCallback((settings: GanttSettings): number => {
    const enabledTaskFieldCount = settings.taskFields.filter(f => f.enabled).length;
    const enabledResourceFieldCount = settings.resourceFields.filter(f => f.enabled).length;
    
    // Use whichever requires more height - resource fields or task fields
    const maxFieldCount = Math.max(enabledTaskFieldCount, enabledResourceFieldCount);
    
    // Base height + additional height for extra fields (stacked vertically)
    // Increased spacing to accommodate longer status labels like "Held Pending Details"
    // First field fits in base height, each additional field adds height
    const additionalLines = Math.max(0, maxFieldCount - 1);
    return BASE_ROW_HEIGHT + (additionalLines * 16); // 16px per additional line (increased from 14px)
  }, []);

  // Get task display content based on settings
  const getTaskDisplayContent = useCallback((task: TaskTableRow, settings: GanttSettings) => {
    const parts: { key: string; value: string }[] = [];
    
    settings.taskFields.forEach(field => {
      if (!field.enabled) return;
      
      switch (field.key) {
        case 'taskNumber':
          parts.push({ key: 'taskNumber', value: task.taskId });
          break;
        case 'commitType':
          parts.push({ key: 'commitType', value: task.commitType });
          break;
        case 'status':
          parts.push({ key: 'status', value: TASK_STATUS_LABELS[task.status] });
          break;
        case 'duration':
          parts.push({ key: 'duration', value: task.taskDuration });
          break;
        case 'workId':
          parts.push({ key: 'workId', value: task.workId });
          break;
        case 'responseCode':
          parts.push({ key: 'responseCode', value: task.responseCode });
          break;
        case 'primarySkill':
          parts.push({ key: 'primarySkill', value: task.primarySkill });
          break;
        case 'postCode':
          parts.push({ key: 'postCode', value: task.postCode });
          break;
        case 'commitDate':
          const commitDate = new Date(task.commitDate);
          parts.push({ key: 'commitDate', value: commitDate.toLocaleDateString() });
          break;
      }
    });
    
    return parts;
  }, []);

  // Date range state - persisted to survive component remounting during expand/collapse
  const [startDate, setStartDate] = useState<Date>(() => {
    const saved = localStorage.getItem('liveGantt-startDate');
    if (saved) {
      const date = new Date(saved);
      if (!isNaN(date.getTime())) return date;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  
  const [visibleDays, setVisibleDays] = useState(() => {
    const saved = localStorage.getItem('liveGantt-visibleDays');
    return saved ? parseInt(saved, 10) : 1;
  });
  
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>(() => {
    const saved = localStorage.getItem('liveGantt-selectedPreset');
    return (saved as DateRangePreset) || 'today';
  });

  const [populationMode, setPopulationMode] = useState<GanttPopulationMode>(() => {
    const saved = localStorage.getItem('liveGantt-populationMode');
    return (saved as GanttPopulationMode) || 'auto';
  });

  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [ganttSettings, setGanttSettings] = useState<GanttSettings>(() => {
    const saved = localStorage.getItem('liveGantt-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to default
      }
    }
    return {
      populationMode: populationMode,
      resourceFields: [
        { key: 'id', label: 'ID', enabled: true },
        { key: 'name', label: 'Name', enabled: false },
        { key: 'division', label: 'Division', enabled: false },
        { key: 'workingStatus', label: 'Working Status', enabled: false },
        { key: 'shift', label: 'Shift', enabled: false },
        { key: 'shiftTimes', label: 'Shift Times', enabled: false },
        { key: 'domain', label: 'Domain', enabled: false },
        { key: 'workPreference', label: 'Work Preference', enabled: false },
      ],
      taskFields: [
        { key: 'taskNumber', label: 'Task #', enabled: true },
        { key: 'commitType', label: 'Commit Type', enabled: true },
        { key: 'status', label: 'Status', enabled: true },
        { key: 'duration', label: 'Duration', enabled: false },
        { key: 'workId', label: 'Work ID', enabled: false },
        { key: 'responseCode', label: 'Response Code', enabled: false },
        { key: 'primarySkill', label: 'Primary Skill', enabled: false },
        { key: 'postCode', label: 'Post Code', enabled: false },
        { key: 'commitDate', label: 'Commit Date', enabled: false },
      ],
    };
  });

  const [isAutoFit, setIsAutoFit] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calculate dynamic dimensions based on settings
  const columnWidth = useMemo(() => getColumnWidth(ganttSettings), [ganttSettings, getColumnWidth]);
  const rowHeight = useMemo(() => getRowHeight(ganttSettings), [ganttSettings, getRowHeight]);

  // Update current time every minute for accurate time indicator
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Persist state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('liveGantt-startDate', startDate.toISOString());
  }, [startDate]);

  useEffect(() => {
    localStorage.setItem('liveGantt-visibleDays', visibleDays.toString());
  }, [visibleDays]);

  useEffect(() => {
    localStorage.setItem('liveGantt-selectedPreset', selectedPreset);
  }, [selectedPreset]);

  useEffect(() => {
    localStorage.setItem('liveGantt-populationMode', populationMode);
  }, [populationMode]);

  // Persist gantt settings and sync population mode
  useEffect(() => {
    localStorage.setItem('liveGantt-settings', JSON.stringify(ganttSettings));
    // Sync population mode from settings
    if (ganttSettings.populationMode !== populationMode) {
      setPopulationMode(ganttSettings.populationMode);
    }
  }, [ganttSettings]);

  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const fixedColumnRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentHourWidthRef = useRef(BASE_HOUR_WIDTH);
  const updateTimeoutRef = useRef<number | null>(null);
  const isZoomingRef = useRef(false);

  // Selection UI integration
  const { selectTaskFromMap, selectMultipleTasksFromMap } = useMapSelection();
  const { selectedTaskIds, selectTasks, selectedResourceIds } = useSelectionUI();
  const selectedSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);

  // Track insertion order using useReducer to avoid setState-in-effect lint errors
  const [technicianOrder, dispatchTechnicianOrder] = useReducer(
    (prevOrder: string[], currentSelections: Set<string>) => {
      if (currentSelections.size === 0) return [];
      
      const newOrder: string[] = [];

      // Keep previously selected items that are still selected (preserve their order)
      prevOrder.forEach(techId => {
        if (currentSelections.has(techId)) {
          newOrder.push(techId);
        }
      });

      // Append newly selected items to the bottom
      currentSelections.forEach(techId => {
        if (!newOrder.includes(techId)) {
          newOrder.push(techId);
        }
      });

      return newOrder;
    },
    []
  );

  // Derive current selection set and dispatch updates
  useMemo(() => {
    if (populationMode !== 'manual') {
      dispatchTechnicianOrder(new Set());
      return;
    }

    const selected = new Set<string>();

    if (selectedResourceIds && selectedResourceIds.length > 0) {
      selectedResourceIds.forEach(resourceId => selected.add(resourceId));
    }

    if (selectedTaskIds && selectedTaskIds.length > 0) {
      selectedTaskIds.forEach(taskId => {
        const task = TASK_TABLE_ROWS.find(t => t.taskId === taskId);
        if (task) {
          selected.add(task.resourceId);
        }
      });
    }

    dispatchTechnicianOrder(selected);
  }, [selectedTaskIds, selectedResourceIds, populationMode]);

  // In manual mode, derive technician list from insertion order
  const manualTechnicianTasks = useMemo(() => {
    if (populationMode !== 'manual') {
      return new Map();
    }

    // Return ordered Map based on tracked insertion order
    return new Map(technicianOrder.map((id: string) => [id, new Set<string>()]));
  }, [technicianOrder, populationMode]);

  // Handler to select all visible tasks for a technician - memoized for performance
  const handleSelectTechnicianTasks = useCallback((row: TechnicianDayRow, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Get all task IDs from the technician's scheduled blocks within the visible date range
    const taskIds = row.scheduledBlocks
      ?.filter(block => block.type === 'task' && block.taskId)
      .filter(block => block.dayOffset < visibleDays) // Only tasks within visible days
      .map(block => block.taskId!)
      .filter((id, index, arr) => arr.indexOf(id) === index) || []; // Remove duplicates
    
    // Check if tasks are in the filtered tasks list, if not, append them
    if (filteredTasks && onAppendTasks) {
      const filteredTaskIds = new Set(filteredTasks.map(t => t.taskId));
      const missingTaskIds = taskIds.filter(id => !filteredTaskIds.has(id));
      
      if (missingTaskIds.length > 0) {
        // Get the full task objects for missing tasks
        const missingTasks = TASK_TABLE_ROWS.filter(task => missingTaskIds.includes(task.taskId));
        // Append them to the live task component
        onAppendTasks(missingTasks);
      }
    }
    
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
  }, [visibleDays, selectedTaskIds, selectTasks, selectMultipleTasksFromMap, filteredTasks, onAppendTasks]);

  // Settings dialog handlers
  const handleOpenSettings = useCallback(() => {
    setSettingsDialogOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setSettingsDialogOpen(false);
  }, []);

  const handleSaveSettings = useCallback((newSettings: GanttSettings) => {
    setGanttSettings(newSettings);
    setSettingsDialogOpen(false);
  }, []);

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
  const scheduleTasksWithTravel = useCallback((
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

    // Group tasks by their commit date and map to day offset
    const tasksByDay = new Map<number, TaskTableRow[]>();
    
    tasks.forEach(task => {
      const taskDate = new Date(task.commitDate);
      taskDate.setHours(0, 0, 0, 0);
      
      // Find which day offset this task belongs to
      const dayOffset = dateRange.findIndex(d => {
        const rangeDate = new Date(d);
        rangeDate.setHours(0, 0, 0, 0);
        return rangeDate.getTime() === taskDate.getTime();
      });
      
      if (dayOffset >= 0) {
        if (!tasksByDay.has(dayOffset)) {
          tasksByDay.set(dayOffset, []);
        }
        tasksByDay.get(dayOffset)!.push(task);
      }
    });

    // Schedule tasks for each day
    tasksByDay.forEach((dayTasks, dayOffset) => {
      // Sort tasks by commit date/time for this day
      const sortedDayTasks = [...dayTasks].sort((a, b) => 
        new Date(a.commitDate).getTime() - new Date(b.commitDate).getTime()
      );

      let currentTime = shiftStartHours; // Start at beginning of shift each day
      let currentLocation = { lat: homeLatitude, lon: homeLongitude };

      sortedDayTasks.forEach((task) => {
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

        // Add travel block if significant travel time
        if (travelTime > 0.05) { // Only show if > 3 minutes
          // Check if travel would fit within working hours
          if (currentTime + travelTime <= shiftEndHours) {
            blocks.push({
              type: 'travel',
              startTime: currentTime,
              duration: travelTime,
              dayOffset: dayOffset,
              fromLocation: currentLocation,
              toLocation: taskLocation,
              distanceKm: distanceKm,
            });
            currentTime += travelTime;
          } else {
            // Skip travel if it would go outside working hours
            currentTime = shiftEndHours;
          }
        }

        // Check if task would fit within working hours
        if (currentTime + taskDuration <= shiftEndHours) {
          // Add task block - full task fits within shift
          blocks.push({
            type: 'task',
            taskId: task.taskId,
            startTime: currentTime,
            duration: taskDuration,
            dayOffset: dayOffset,
            task: task,
            toLocation: taskLocation,
          });

          currentTime += taskDuration;
          currentLocation = taskLocation;
        } else {
          // Task would exceed shift hours - either truncate or skip
          const remainingShiftTime = shiftEndHours - currentTime;
          
          if (remainingShiftTime > 0.25) { // At least 15 minutes remaining
            // Add truncated task that fits within shift
            blocks.push({
              type: 'task',
              taskId: task.taskId,
              startTime: currentTime,
              duration: remainingShiftTime, // Truncated duration
              dayOffset: dayOffset,
              task: { ...task, taskDuration: formatTime(remainingShiftTime) }, // Update displayed duration
              toLocation: taskLocation,
            });
          }
          
          // End of shift reached
          currentTime = shiftEndHours;
          currentLocation = taskLocation;
        }
      });
    });

    return blocks;
  }, [dateRange]);

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
    // Only show data when both division and domain are selected
    if (!selectedDivision || !selectedDomain) {
      return [];
    }

    // Filter tasks by division and domain
    let filteredTasks = TASK_TABLE_ROWS;
    filteredTasks = filteredTasks.filter(task => task.division === selectedDivision);
    filteredTasks = filteredTasks.filter(task => task.domainId === selectedDomain);
    // Only show tasks with Gantt-visible statuses
    filteredTasks = filteredTasks.filter(task => GANTT_STATUSES.includes(task.status));

    // Filter resources to show ALL resources in the selected division and domain
    const relevantResources = RESOURCE_TABLE_ROWS.filter(resource => {
      const matchesDivision = resource.division === selectedDivision;
      const matchesDomain = resource.domainId === selectedDomain;
      return matchesDivision && matchesDomain;
    });

    // Create rows: one per resource (showing all their tasks across all days)
    const rows: TechnicianDayRow[] = [];
    
    // In manual mode with no selections, show empty Gantt
    if (populationMode === 'manual' && manualTechnicianTasks.size === 0) {
      return rows; // Return empty array
    }
    
    // In manual mode, respect selection order from manualTechnicianTasks Map
    const resourcesToProcess = populationMode === 'manual'
      ? Array.from(manualTechnicianTasks.keys())
          .map(techId => relevantResources.find(r => r.resourceId === techId))
          .filter((r): r is NonNullable<typeof r> => r !== undefined)
      : relevantResources;
    
    resourcesToProcess.forEach((resource) => {
      // Get tasks for this resource that fall within the visible date range
      const resourceTasks = filteredTasks.filter(task => {
        if (task.resourceId !== resource.resourceId) return false;
        
        // Check if task date falls within visible date range
        const taskDate = new Date(task.commitDate);
        taskDate.setHours(0, 0, 0, 0);
        return dateRangeSet.has(taskDate.getTime());
      });

      // Schedule tasks with travel time (only for visible date range)
      const scheduledBlocks = scheduleTasksWithTravel(
        resourceTasks,
        resource.homeLatitude,
        resource.homeLongitude,
        resource.startTime,
        resource.endTime
      );

      // Pre-calculate visible task count for tooltip
      const visibleTaskCount = resourceTasks.length;

      rows.push({
        technicianId: resource.resourceId,
        technicianName: resource.resourceName,
        division: resource.division,
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
        domainId: resource.domainId,
        workPreference: resource.workPreference,
      });
    });

    return rows;
  }, [selectedDivision, selectedDomain, dateRange, dateRangeSet, scheduleTasksWithTravel, populationMode, manualTechnicianTasks]);

  // Calculate total hours needed to display all scheduled blocks
  const totalScheduledHours = useMemo(() => {
    if (!technicianDayRows || technicianDayRows.length === 0) return 24;
    
    let maxHours = 0;
    technicianDayRows.forEach(row => {
      row.scheduledBlocks?.forEach(block => {
        const blockEndTime = block.startTime + block.duration;
        const totalHours = (block.dayOffset * 24) + blockEndTime;
        maxHours = Math.max(maxHours, totalHours);
      });
    });
    
    // Ensure we show at least the full visible days, but extend if tasks go beyond
    const minimumHours = visibleDays * 24;
    return Math.max(maxHours, minimumHours);
  }, [technicianDayRows, visibleDays]);

  // Calculate dynamic hour width based on auto-fit, expanded mode, and manual zoom
  const [hourWidth, setHourWidth] = useState(BASE_HOUR_WIDTH);


  
  // Update hour width when necessary
  useEffect(() => {
    // If we're zooming or just finished zooming, use the ref value (DOM is already updated)
    if (isZoomingRef.current || !isAutoFit) {
      setHourWidth(currentHourWidthRef.current);
      return;
    }
    
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const availableWidth = containerWidth - columnWidth - 40;
      
      // Single day view: stretch to fill full panel width with good hour visibility
      if (visibleDays === 1) {
        const calculatedWidth = Math.floor(availableWidth / 24);
        // Ensure minimum 50px per hour for proper hourly view, but allow stretching up to max
        const width = Math.max(50, Math.min(MAX_HOUR_WIDTH, calculatedWidth));
        currentHourWidthRef.current = width;
        setHourWidth(width);
        return;
      }
      
      // Multiple days: fit as many days as possible in the view, but maintain usability
      const totalHours = visibleDays * 24;
      let calculatedWidth = Math.floor(availableWidth / totalHours);
      
      // For multi-day views, ensure a minimum reasonable hour width for readability
      const multiDayMinWidth = visibleDays <= 3 ? 25 : visibleDays <= 7 ? 22 : MIN_HOUR_WIDTH;
      calculatedWidth = Math.max(multiDayMinWidth, calculatedWidth);
      
      const width = Math.max(MIN_HOUR_WIDTH, Math.min(MAX_HOUR_WIDTH, calculatedWidth));
      currentHourWidthRef.current = width;
      setHourWidth(width);
    }
  }, [visibleDays, isAutoFit, totalScheduledHours]);

  // Scroll to 6am when data loads (after search) and when layout changes
  useEffect(() => {
    // Only scroll if we have data (after user has searched)
    if (technicianDayRows.length === 0) return;

    const scrollTo6AM = () => {
      const scrollPosition = 6 * hourWidth;
      if (timelineRef.current) {
        timelineRef.current.scrollLeft = scrollPosition;
      }
      if (timelineBodyRef.current) {
        timelineBodyRef.current.scrollLeft = scrollPosition;
      }
    };

    // Use requestAnimationFrame to ensure DOM is painted before scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollTo6AM);
    });
  }, [technicianDayRows.length, hourWidth, isExpanded, visibleDays]); // Re-run when data loads or layout changes

  // Add Shift+Scroll wheel event listener - SIMPLIFIED for smooth zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelZoom = (event: WheelEvent) => {
      if (!event.shiftKey) return;

      event.preventDefault();
      event.stopPropagation();

      const timelineBody = timelineBodyRef.current;
      if (!timelineBody) return;

      // Get current state
      const oldZoom = currentHourWidthRef.current;
      const scrollLeft = timelineBody.scrollLeft;
      const rect = timelineBody.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      
      // Calculate new zoom with strict limits
      const zoomIn = event.deltaY < 0;
      const factor = zoomIn ? ZOOM_MULTIPLIER : 1 / ZOOM_MULTIPLIER;
      // Dynamic minimum based on visible days - more restrictive for multi-day
      const minZoom = visibleDays === 1 ? 40 : 
                     visibleDays <= 3 ? 25 : 
                     visibleDays <= 7 ? 22 : MIN_HOUR_WIDTH;
      let proposedZoom = oldZoom * factor;
      
      // Clamp to absolute limits
      proposedZoom = Math.max(minZoom, Math.min(MAX_HOUR_WIDTH, proposedZoom));
      
      // Check if we've hit a zoom boundary
      const atMaxZoom = proposedZoom >= MAX_HOUR_WIDTH && zoomIn;
      const atMinZoom = proposedZoom <= minZoom && !zoomIn;
      
      // If at boundary, prevent zoom and provide feedback
      if (atMaxZoom || atMinZoom || proposedZoom === oldZoom) {
        // Visual feedback: briefly change cursor
        container.style.cursor = atMaxZoom ? 'zoom-in' : 'zoom-out';
        setTimeout(() => {
          container.style.cursor = '';
        }, 150);
        return; // Prevent zoom when at limits
      }
      
      const newZoom = proposedZoom;

      // Update zoom ref immediately
      currentHourWidthRef.current = newZoom;
      isZoomingRef.current = true;

      // Calculate scale ratio for all elements
      const ratio = newZoom / oldZoom;

      // 1. Scale timeline containers first (set exact widths)
      const timelineContainers = container.querySelectorAll('[data-timeline-container]');
      timelineContainers.forEach(el => {
        const element = el as HTMLElement;
        const expectedWidth = totalScheduledHours * newZoom;
        element.style.minWidth = `${expectedWidth}px`;
        element.style.maxWidth = `${expectedWidth}px`;
        element.style.width = `${expectedWidth}px`;
      });

      // 2. Scale hour cells to exact new width
      const hourCells = container.querySelectorAll('[data-hour-cell]');
      hourCells.forEach(el => {
        const element = el as HTMLElement;
        element.style.width = `${newZoom}px`;
      });

      // 3-6. Cache all DOM queries once and iterate
      const dayContainers = container.querySelectorAll('[data-day-container]');
      const ganttBlocks = container.querySelectorAll('[data-gantt-block]');
      const shiftBars = container.querySelectorAll('[data-shift-bar]');
      const currentTimeIndicators = container.querySelectorAll('[data-current-time-indicator]');
      
      // 3. Scale day containers to exact new width  
      dayContainers.forEach(el => {
        const element = el as HTMLElement;
        element.style.width = `${24 * newZoom}px`;
      });

      // 4. Scale task blocks and travel elements - recalculate positions precisely
      ganttBlocks.forEach(el => {
        const element = el as HTMLElement;
        
        // Get block data from attributes
        const dayOffset = parseInt(element.getAttribute('data-day-offset') || '0');
        const startTime = parseFloat(element.getAttribute('data-start-time') || '0');
        const duration = parseFloat(element.getAttribute('data-duration') || '0');
        
        // Recalculate position with new zoom level - use precise calculation
        const newLeft = (dayOffset * 24 * newZoom) + (startTime * newZoom);
        const newWidth = Math.max(2, duration * newZoom);
        
        element.style.left = `${newLeft}px`;
        element.style.width = `${newWidth}px`;
      });

      // 5. Scale shift bars - recalculate positions precisely like task blocks
      shiftBars.forEach(el => {
        const element = el as HTMLElement;
        
        // Get shift bar data from attributes  
        const dayIndex = parseInt(element.getAttribute('data-day-index') || '0');
        const startMinutes = parseInt(element.getAttribute('data-start-minutes') || '0');
        const durationHours = parseFloat(element.getAttribute('data-duration-hours') || '0');
        
        // Recalculate position and width with new zoom level
        const newLeft = (dayIndex * 24 * newZoom) + ((startMinutes / 60) * newZoom);
        const newWidth = durationHours * newZoom;
        
        element.style.left = `${newLeft}px`;
        element.style.width = `${newWidth}px`;
      });

      // 6. Update current time indicator - recalculate position precisely
      currentTimeIndicators.forEach(el => {
        const element = el as HTMLElement;
        
        // Get current time data from attributes
        const todayIndex = parseInt(element.getAttribute('data-today-index') || '0');
        const hours = parseInt(element.getAttribute('data-hours') || '0');
        const minutes = parseInt(element.getAttribute('data-minutes') || '0');
        
        // Recalculate position with new zoom level
        const totalMinutes = hours * 60 + minutes;
        const pixelsFromDayStart = (totalMinutes / (24 * 60)) * (24 * newZoom);
        const newLeft = todayIndex * 24 * newZoom + pixelsFromDayStart;
        
        element.style.left = `${newLeft}px`;
      });

      // 7. Update scroll position to keep cursor fixed
      const contentX = scrollLeft + cursorX;
      const newContentX = contentX * ratio;
      const newScrollLeft = newContentX - cursorX;
      
      timelineBody.scrollLeft = Math.max(0, newScrollLeft);
      if (timelineRef.current) {
        timelineRef.current.scrollLeft = Math.max(0, newScrollLeft);
      }

      // 7. Disable auto-fit
      if (isAutoFit) {
        setIsAutoFit(false);
      }

      // 8. Debounced React state update
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        isZoomingRef.current = false;
        setHourWidth(newZoom);
      }, 200);
    };

    container.addEventListener('wheel', handleWheelZoom, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelZoom);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [visibleDays, isAutoFit, totalScheduledHours]);

  // Sync ref when state changes from other sources (but not during active zooming)
  useEffect(() => {
    // Never sync during manual zoom - DOM is already correct
    if (isZoomingRef.current || !isAutoFit) {
      return;
    }
    currentHourWidthRef.current = hourWidth;
  }, [hourWidth, isAutoFit]);

  // Force recalculation when visible days changes (preset changes)
  useEffect(() => {
    // Reset zoom state when changing day count to allow proper recalculation
    if (isAutoFit) {
      isZoomingRef.current = false;
      currentHourWidthRef.current = BASE_HOUR_WIDTH;
      
      // Force container to recalculate by triggering a small style change
      if (containerRef.current) {
        const container = containerRef.current;
        // More aggressive reflow trigger
        const originalStyle = container.style.display;
        container.style.display = 'none';
        void container.offsetHeight; // Force reflow
        container.style.display = originalStyle || '';
        
        // Also force width recalculation
        const timelineContainers = container.querySelectorAll('[data-timeline-container]');
        timelineContainers.forEach(el => {
          const element = el as HTMLElement;
          element.style.minWidth = 'auto';
          element.style.maxWidth = 'none';
          void element.offsetWidth; // Force reflow
          // Set correct width based on totalScheduledHours
          const expectedWidth = totalScheduledHours * currentHourWidthRef.current;
          element.style.minWidth = `${expectedWidth}px`;
          element.style.maxWidth = `${expectedWidth}px`;
          element.style.width = `${expectedWidth}px`;
        });
      }
      
      // Force a re-render by updating the hour width state
      setTimeout(() => {
        setHourWidth(prev => prev + 0.001); // Tiny change to trigger re-render
      }, 0);
    }
  }, [visibleDays, isAutoFit, totalScheduledHours]);

  // Force timeline width update when totalScheduledHours changes
  useEffect(() => {
    if (containerRef.current && isAutoFit) {
      const container = containerRef.current;
      const timelineContainers = container.querySelectorAll('[data-timeline-container]');
      const expectedWidth = totalScheduledHours * hourWidth;
      
      timelineContainers.forEach(el => {
        const element = el as HTMLElement;
        element.style.minWidth = `${expectedWidth}px`;
        element.style.maxWidth = `${expectedWidth}px`;
        element.style.width = `${expectedWidth}px`;
      });
    }
  }, [totalScheduledHours, hourWidth, isAutoFit]);

  // Navigation handlers
  const handlePreviousDay = useCallback(() => {
    setStartDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  }, []);

  const handleNextDay = useCallback(() => {
    setStartDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  }, []);

  const handleToday = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setStartDate(today);
  }, []);

  const handlePresetChange = useCallback((preset: DateRangePreset) => {
    const config = DATE_PRESETS[preset];
    setSelectedPreset(preset);
    setVisibleDays(config.days);
    setIsAutoFit(true);
    isZoomingRef.current = false;
    currentHourWidthRef.current = BASE_HOUR_WIDTH;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + config.startOffset);
    setStartDate(today);
  }, []);

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
        <Toolbar 
          variant="dense" 
          sx={{ 
            justifyContent: 'space-between', 
            minHeight: `${TOOLBAR_HEIGHT}px !important`, 
            px: { xs: 1, sm: 2 }, 
            gap: { xs: 1, sm: 2 },
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: 2,
            },
          }}
        >
          {/* Left side - Date navigation */}
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center" sx={{ flexShrink: 0 }}>
            {/* Navigation buttons */}
            <Paper 
              elevation={0} 
              sx={{ 
                display: 'flex', 
                borderRadius: 1,
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
                    px: { xs: 0.5, sm: 0.75 },
                    py: 0.5,
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem />
              <Tooltip title="Today">
                <IconButton
                  size="small"
                  onClick={handleToday}
                  sx={{ 
                    borderRadius: 0,
                    px: { xs: 0.5, sm: 0.75 },
                    py: 0.5,
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <TodayIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem />
              <Tooltip title="Next">
                <IconButton
                  size="small"
                  onClick={handleNextDay}
                  sx={{ 
                    borderRadius: 0,
                    px: { xs: 0.5, sm: 0.75 },
                    py: 0.5,
                    color: theme.openreach.energyAccent,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </IconButton>
              </Tooltip>
            </Paper>
            
            {/* Date Range Selector */}
            <FormControl size="small" sx={{ minWidth: { xs: 90, sm: 120 } }}>
              <Select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value as DateRangePreset)}
                sx={{
                  height: 28,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  color: bodyTextColor,
                  borderRadius: 1,
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
                  <CalendarMonthIcon sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5, color: theme.openreach.energyAccent }} />
                }
              >
                {(Object.keys(DATE_PRESETS) as DateRangePreset[]).map((preset) => (
                  <MenuItem key={preset} value={preset} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {DATE_PRESETS[preset].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Right side actions */}
          <Stack 
            direction="row" 
            spacing={{ xs: 0.5, sm: 0.75 }} 
            alignItems="center" 
            sx={{ 
              pr: { xs: 0.5, sm: 2 },
              flexShrink: 0,
            }}
          >
            {/* Settings Button */}
            <Tooltip title="Gantt chart settings">
              <IconButton
                size="small"
                onClick={handleOpenSettings}
                sx={{
                  p: 0.25,
                  borderRadius: 1,
                  color: theme.openreach.energyAccent,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.openreach.energyAccent, 0.08),
                    borderColor: theme.openreach.energyAccent,
                  },
                }}
              >
                <SettingsIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
              </IconButton>
            </Tooltip>

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
      {(!selectedDivision || !selectedDomain) || technicianDayRows.length === 0 ? (
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
              {(!selectedDivision || !selectedDomain)
                ? 'Team Gant'
                : 'No Engineers found'
              }
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {(!selectedDivision || !selectedDomain)
                ? 'Please select both Division and Domain to view resources'
                : 'No Engineers available for the selected filters'
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
          {/* Timeline Header - Day headers + Hour markers */}
          <Box
            sx={{
              display: 'flex',
              borderBottom: `2px solid ${borderColor}`,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
            }}
          >
            {/* Fixed column header */}
            <Box
              sx={{
                width: columnWidth,
                flexShrink: 0,
                borderRight: `2px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: DAY_HEADER_HEIGHT + HEADER_HEIGHT,
                minHeight: DAY_HEADER_HEIGHT + HEADER_HEIGHT,
                boxSizing: 'border-box',
              }}
            >
              <Typography variant="caption" fontWeight={600} sx={{ color: bodyTextColor, fontSize: '0.8rem' }}>
                Engineer
              </Typography>
            </Box>

            {/* Scrollable timeline header with day dates + hour markers */}
            <Box
              ref={timelineRef}
              sx={{
                flex: 1,
                overflowX: 'scroll',
                overflowY: 'hidden',
                height: DAY_HEADER_HEIGHT + HEADER_HEIGHT,
                minHeight: DAY_HEADER_HEIGHT + HEADER_HEIGHT,
                boxSizing: 'border-box',
                '&::-webkit-scrollbar': {
                  height: 0,
                  display: 'none',
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              onScroll={(e) => {
                // Sync horizontal scroll with timeline body
                if (timelineBodyRef.current) {
                  timelineBodyRef.current.scrollLeft = (e.target as HTMLElement).scrollLeft;
                }
              }}
            >
              <Box 
                key={`header-timeline-${visibleDays}-${selectedPreset}`}
                sx={{ 
                  display: 'flex', 
                  minWidth: totalScheduledHours * hourWidth,
                  maxWidth: totalScheduledHours * hourWidth, // Use total scheduled hours instead of fixed days
                }} 
                data-timeline-container
              >
                {/* Day headers and hour markers */}
                {dateRange.map((date) => {
                  const hourLabelInterval = getHourLabelInterval(hourWidth, visibleDays);
                  return (
                    <Box
                      key={`day-${date.getTime()}`}
                      data-day-container
                      sx={{
                        width: 24 * hourWidth,
                        flexShrink: 0,
                        borderRight: `2px solid ${borderColor}`,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Day date header */}
                      <Box
                        sx={{
                          height: DAY_HEADER_HEIGHT,
                          borderBottom: `1px solid ${borderColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.06)',
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          fontWeight={700}
                          sx={{ 
                            color: bodyTextColor, 
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {formatDateHeader(date)}
                        </Typography>
                      </Box>

                      {/* Time interval blocks */}
                      <Box sx={{ display: 'flex', height: HEADER_HEIGHT }}>
                        {Array.from({ length: Math.ceil(24 / hourLabelInterval) }).map((_, blockIdx) => {
                          const startHour = blockIdx * hourLabelInterval;
                          const endHour = Math.min(startHour + hourLabelInterval, 24);
                          const blockWidth = (endHour - startHour) * hourWidth;
                          const isMajorBlock = startHour % 12 === 0;
                          
                          return (
                            <Tooltip
                              key={`hour-${date.getTime()}-${startHour}`}
                              title={
                                <Box>
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    {`${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                                    {hourLabelInterval === 1 ? '1 hour' : `${hourLabelInterval} hour block`}
                                  </Typography>
                                </Box>
                              }
                              placement="bottom"
                            >
                              <Box
                                data-time-block
                                sx={{
                                  width: blockWidth,
                                  flexShrink: 0,
                                  borderRight: isMajorBlock ? `3px solid ${theme.palette.divider}` : `2px solid ${theme.palette.divider}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                  },
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: blockWidth >= 60 ? '0.7rem' : blockWidth >= 40 ? '0.65rem' : '0.6rem',
                                    color: theme.palette.text.secondary,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: blockWidth - 8,
                                    textAlign: 'center',
                                  }}
                                >
                                  {hourLabelInterval === 1 
                                    ? `${startHour.toString().padStart(2, '0')}:00`
                                    : `${startHour.toString().padStart(2, '0')}-${endHour.toString().padStart(2, '0')}`
                                  }
                                </Typography>
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })}
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
                width: columnWidth,
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
              {technicianDayRows.map((row, index) => (
                <Box
                  key={`${row.technicianId}-${row.date.getTime()}`}
                  data-row-index={index}
                  sx={{
                    height: `${rowHeight}px`,
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    py: 0.5,
                    gap: 1,
                    backgroundColor: theme.palette.background.paper,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  <Tooltip 
                    title="Select All"
                    placement="right"
                    arrow
                  >
                    <Avatar 
                      onClick={(e) => {
                        // Always select the technician's tasks (don't toggle in manual mode)
                        handleSelectTechnicianTasks(row, e);
                      }}
                      sx={{ 
                        width: 28, 
                        height: 28,
                        bgcolor: theme.openreach.energyAccent,
                        flexShrink: 0,
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.15)',
                        },
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18, color: '#fff' }} />
                    </Avatar>
                  </Tooltip>
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {getResourceDisplayText(row, ganttSettings).map((text, idx) => (
                      <Typography 
                        key={idx}
                        variant="body2" 
                        fontWeight={idx === 0 ? 600 : 500}
                        sx={{ 
                          color: bodyTextColor, 
                          fontSize: idx === 0 ? '0.875rem' : '0.75rem',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: 1.4,
                        }}
                      >
                        {text}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Scrollable timeline - Task blocks */}
            <Box
              key={`timeline-${visibleDays}-${selectedPreset}`}
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
                data-timeline-container
                sx={{
                  minWidth: totalScheduledHours * hourWidth,
                  maxWidth: totalScheduledHours * hourWidth, // Use total scheduled hours
                  position: 'relative',
                }}
              >
                {/* Hour grid lines and day separators */}
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
                  {/* Render days and extra hours to cover all scheduled content */}
                  {Array.from({ length: Math.ceil(totalScheduledHours / 24) }).map((_, dayIdx) => {
                    const isVisibleDay = dayIdx < dateRange.length;
                    return (
                      <Box
                        key={dayIdx}
                        data-day-container
                        sx={{
                          width: 24 * hourWidth,
                          flexShrink: 0,
                          borderRight: `2px solid ${borderColor}`,
                          display: 'flex',
                          backgroundColor: isVisibleDay 
                            ? (dayIdx % 2 === 0 ? 'transparent' : theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)')
                            : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', // Different color for extended hours
                        }}
                      >
                        {Array.from({ length: Math.ceil(24 / getHourLabelInterval(hourWidth, visibleDays)) }).map((_, blockIdx) => {
                          const hourLabelInterval = getHourLabelInterval(hourWidth, visibleDays);
                          const startHour = blockIdx * hourLabelInterval;
                          const endHour = Math.min(startHour + hourLabelInterval, 24);
                          const absoluteStartHour = dayIdx * 24 + startHour;
                          
                          if (absoluteStartHour >= totalScheduledHours) return null;
                          
                          const blockWidth = (endHour - startHour) * hourWidth;
                          const isMajorBlock = startHour % 12 === 0;
                          
                          return (
                            <Box
                              key={blockIdx}
                              data-time-block
                              sx={{
                                width: blockWidth,
                                borderRight: isMajorBlock ? `3px solid ${theme.palette.divider}` : `2px solid ${theme.palette.divider}`,
                                opacity: hourWidth < 20 ? 0.15 : hourWidth < 35 ? 0.2 : 0.25,
                                '&:hover': {
                                  opacity: 0.4,
                                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                },
                              }}
                            />
                          );
                        })}
                      </Box>
                    );
                  })}
                </Box>

                {/* Current time indicator line */}
                {(() => {
                  const now = currentTime;
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
                        data-current-time-indicator
                        data-today-index={todayIndex}
                        data-hours={hours}
                        data-minutes={minutes}
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
                {technicianDayRows.map((row, index) => {
                  // Calculate shift time bars for each day (show shift hours across all days)
                  const shiftBars: Array<{ left: number; width: number; dayIndex: number; startMinutes: number; duration: number }> = [];
                  
                  if (row.shiftStart && row.shiftEnd) {
                    const [startHour, startMin] = row.shiftStart.split(':').map(Number);
                    const [endHour, endMin] = row.shiftEnd.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMin;
                    const endMinutes = endHour * 60 + endMin;
                    const shiftDurationHours = (endMinutes - startMinutes) / 60;
                    const shiftDuration = shiftDurationHours * hourWidth;
                    
                    // Create shift bar for each day
                    dateRange.forEach((_, dayIndex) => {
                      const left = (dayIndex * 24 * hourWidth) + ((startMinutes / 60) * hourWidth);
                      shiftBars.push({ left, width: shiftDuration, dayIndex, startMinutes, duration: shiftDurationHours });
                    });
                  }

                  return (
                  <Box
                    key={`${row.technicianId}-${row.date.getTime()}`}
                    data-row-index={index}
                    sx={{
                      height: `${rowHeight}px`,
                      borderBottom: `1px solid ${borderColor}`,
                      position: 'relative',
                      backgroundColor: theme.palette.background.paper,
                      boxSizing: 'border-box',
                      py: 0.5,
                      overflow: 'hidden',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    {/* Background time interval grid */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        pointerEvents: 'none',
                      }}
                    >
                      {Array.from({ length: Math.ceil(totalScheduledHours / 24) }).map((_, dayIdx) => (
                        <Box
                          key={dayIdx}
                          sx={{
                            width: 24 * hourWidth,
                            display: 'flex',
                          }}
                        >
                          {Array.from({ length: Math.ceil(24 / getHourLabelInterval(hourWidth, visibleDays)) }).map((_, blockIdx) => {
                            const hourLabelInterval = getHourLabelInterval(hourWidth, visibleDays);
                            const startHour = blockIdx * hourLabelInterval;
                            const endHour = Math.min(startHour + hourLabelInterval, 24);
                            const absoluteStartHour = dayIdx * 24 + startHour;
                            
                            if (absoluteStartHour >= totalScheduledHours) return null;
                            
                            const blockWidth = (endHour - startHour) * hourWidth;
                            const isMajorBlock = startHour % 12 === 0;
                            
                            return (
                              <Box
                                key={blockIdx}
                                sx={{
                                  width: blockWidth,
                                  height: '100%',
                                  borderRight: isMajorBlock ? `3px solid ${alpha(theme.palette.divider, 0.3)}` : `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                                }}
                              />
                            );
                          })}
                        </Box>
                      ))}
                    </Box>

                    {/* Shift time background bars for each day */}
                    {shiftBars.map((bar, idx) => (
                      <Box
                        key={idx}
                        data-shift-bar
                        data-day-index={bar.dayIndex}
                        data-start-minutes={bar.startMinutes}
                        data-duration-hours={bar.duration}
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
                      const minWidthToShowText = 30; // Minimum width to show block text/label
                      
                      if (block.type === 'travel') {
                        // Render travel block - dashed line indicator
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
                              data-gantt-block
                              data-day-offset={block.dayOffset}
                              data-start-time={block.startTime}
                              data-duration={block.duration}
                              sx={{
                                position: 'absolute',
                                left: `${left}px`,
                                top: '50%',
                                width: `${Math.max(2, width)}px`,
                                height: 0,
                                borderTop: `3px solid ${alpha(theme.palette.warning.main, 0.7)}`,
                                cursor: 'help',
                                zIndex: 2,
                                '&:hover': {
                                  borderTopColor: theme.palette.warning.main,
                                  borderTopWidth: '4px',
                                  zIndex: 51,
                                },
                              }}
                            />
                          </Tooltip>
                        );
                      } else {
                        // Render task block - colored rectangle
                        const task = block.task!;
                        const isSelected = selectedSet.has(task.taskId);
                        const commitTypeColor = getCommitTypeColor(task.commitType);
                        const isCondensed = width < minWidthToShowText;
                        
                        // Check if there's a previous travel block for this task
                        const prevBlock = blockIdx > 0 ? row.scheduledBlocks?.[blockIdx - 1] : null;
                        const hasPrecedingTravel = prevBlock?.type === 'travel';
                        
                        return (
                          <Tooltip
                            key={`task-${task.taskId}`}
                            title={
                              <Box>
                                {hasPrecedingTravel && prevBlock && (
                                  <Box sx={{ mb: 1, pb: 1, borderBottom: `1px solid ${alpha('#fff', 0.2)}` }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                      <DirectionsCarIcon sx={{ fontSize: '0.9rem' }} />
                                      <Typography variant="caption" fontWeight={600}>Travel Before Task</Typography>
                                    </Box>
                                    <Typography variant="caption" display="block">
                                      Distance: {prevBlock.distanceKm?.toFixed(1)} km
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                      Duration: {formatTime(prevBlock.duration)}
                                    </Typography>
                                  </Box>
                                )}
                                <Typography variant="caption" fontWeight={600}>{task.taskId}</Typography>
                                <Typography variant="caption" display="block">{task.commitType}</Typography>
                                <Typography variant="caption" display="block">
                                  Status: {TASK_STATUS_LABELS[task.status]}
                                </Typography>
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
                              data-gantt-block
                              data-day-offset={block.dayOffset}
                              data-start-time={block.startTime}
                              data-duration={block.duration}
                              onClick={(e) => {
                                const isCtrlPressed = e.ctrlKey || e.metaKey;
                                
                                // Check if task is in filtered tasks, append if missing
                                if (filteredTasks && onAppendTasks) {
                                  const filteredTaskIds = new Set(filteredTasks.map(t => t.taskId));
                                  if (!filteredTaskIds.has(task.taskId)) {
                                    const taskToAppend = TASK_TABLE_ROWS.find(t => t.taskId === task.taskId);
                                    if (taskToAppend) {
                                      onAppendTasks([taskToAppend]);
                                    }
                                  }
                                }
                                
                                selectTaskFromMap(task.taskId, isCtrlPressed);
                              }}
                              sx={{
                                position: 'absolute',
                                left: `${left}px`,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: `${Math.max(3, width)}px`,
                                maxHeight: `${rowHeight - 8}px`,
                                backgroundColor: commitTypeColor,
                                cursor: 'pointer',
                                border: isSelected 
                                  ? `4px solid #DC2626` 
                                  : `2px solid ${alpha('#000', 0.2)}`,
                                borderRadius: 1,
                                boxSizing: 'border-box',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                paddingLeft: '4px',
                                paddingRight: '4px',
                                paddingTop: '2px',
                                paddingBottom: '2px',
                                overflow: 'hidden',
                                zIndex: isSelected ? 100 : 1,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  opacity: 0.95,
                                  filter: 'brightness(1.1)',
                                  zIndex: 50,
                                },
                              }}
                              elevation={0}
                            >
                              {!isCondensed && width > 20 && (() => {
                                const displayContent = getTaskDisplayContent(task, ganttSettings);
                                return (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, width: '100%' }}>
                                    {displayContent.map((item, idx) => (
                                      <Typography
                                        key={idx}
                                        variant="caption"
                                        sx={{
                                          color: '#000000',
                                          fontWeight: item.key === 'taskNumber' ? 'bold' : 'normal',
                                          lineHeight: 1.2,
                                          fontSize: '0.65rem',
                                          wordWrap: 'break-word',
                                          overflowWrap: 'break-word',
                                        }}
                                      >
                                        {item.value}
                                      </Typography>
                                    ))}
                                  </Box>
                                );
                              })()}
                            </Paper>
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

      {/* Gantt Settings Dialog */}
      <GanttSettingsDialog
        open={settingsDialogOpen}
        onClose={handleCloseSettings}
        settings={ganttSettings}
        onSave={handleSaveSettings}
      />
    </Box>
  );
}

export default React.memo(LiveGantt);
