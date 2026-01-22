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
  Divider
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
import { useState, useMemo, useRef, useEffect } from "react";
import { TASK_TABLE_ROWS, type TaskTableRow } from "../../../App - Data Tables/Task - Table";

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

  // Scroll to 5am on initial load
  useEffect(() => {
    const scrollTo5AM = () => {
      const scrollPosition = 5 * HOUR_WIDTH; // 5 hours * 50px = 250px
      if (timelineRef.current) {
        timelineRef.current.scrollLeft = scrollPosition;
      }
      if (timelineBodyRef.current) {
        timelineBodyRef.current.scrollLeft = scrollPosition;
      }
    };

    // Small delay to ensure refs are mounted
    const timer = setTimeout(scrollTo5AM, 0);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array = run only on mount

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

  // Extract unique technicians from filtered tasks
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

    // Group by unique technician (resourceId)
    const technicianMap = new Map<string, { id: string; name: string }>();
    filteredTasks.forEach(task => {
      if (!technicianMap.has(task.resourceId)) {
        technicianMap.set(task.resourceId, {
          id: task.resourceId,
          name: task.resourceName || task.resourceId
        });
      }
    });

    // Create rows: one per technician per day
    const rows: TechnicianDayRow[] = [];
    technicianMap.forEach((tech) => {
      dateRange.forEach(date => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        // Find tasks for this technician on this day
        const dayTasks = filteredTasks.filter(task => {
          if (task.resourceId !== tech.id) return false;
          const taskDate = new Date(task.commitDate);
          return taskDate >= dayStart && taskDate <= dayEnd;
        });

        rows.push({
          technicianId: tech.id,
          technicianName: tech.name,
          date: new Date(date),
          tasks: dayTasks
        });
      });
    });

    return rows;
  }, [selectedDivision, selectedDomain, dateRange]);

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
                  minWidth: dateRange.length * 24 * HOUR_WIDTH,
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
                          width: HOUR_WIDTH,
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
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 28, 
                      height: 28,
                      bgcolor: theme.openreach.energyAccent,
                      flexShrink: 0,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 18, color: '#fff' }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap sx={{ color: bodyTextColor, fontSize: '0.85rem', lineHeight: 1.3 }}>
                      {row.technicianName || row.technicianId}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 0.5, lineHeight: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 10 }} />
                      08:00 - 17:00
                    </Typography>
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
                  minWidth: dateRange.length * 24 * HOUR_WIDTH,
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
                        width: 24 * HOUR_WIDTH,
                        flexShrink: 0,
                        borderRight: `1px solid ${borderColor}`,
                        display: 'flex',
                      }}
                    >
                      {Array.from({ length: 24 }).map((_, hourIdx) => (
                        <Box
                          key={hourIdx}
                          sx={{
                            width: HOUR_WIDTH,
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
                    const pixelsFromDayStart = (totalMinutes / (24 * 60)) * (24 * HOUR_WIDTH);
                    const leftPosition = todayIndex * 24 * HOUR_WIDTH + pixelsFromDayStart;
                    
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
                {technicianDayRows.map((row) => (
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
                    {/* Task blocks for this row */}
                    {row.tasks.map((task) => {
                      // Position task within the day (simplified - assumes tasks are at noon)
                      const taskDate = new Date(task.commitDate);
                      const dayIndex = dateRange.findIndex(d => 
                        d.getDate() === taskDate.getDate() &&
                        d.getMonth() === taskDate.getMonth() &&
                        d.getFullYear() === taskDate.getFullYear()
                      );
                      
                      if (dayIndex === -1) return null;

                      // Position at 12:00 (noon) by default, with 2-hour width
                      const startHour = 12;
                      const durationHours = 2;
                      const left = (dayIndex * 24 + startHour) * HOUR_WIDTH;
                      const width = durationHours * HOUR_WIDTH;

                      return (
                        <Tooltip
                          key={task.taskId}
                          title={
                            <Box>
                              <Typography variant="caption" fontWeight={600}>{task.taskId}</Typography>
                              <Typography variant="caption" display="block">{task.status}</Typography>
                              <Typography variant="caption" display="block">{task.postCode}</Typography>
                            </Box>
                          }
                        >
                          <Paper
                            sx={{
                              position: 'absolute',
                              left: left,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: width,
                              height: ROW_HEIGHT - 16,
                              backgroundColor: theme.openreach.energyAccent,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              px: 1,
                              '&:hover': {
                                opacity: 0.8,
                                boxShadow: theme.shadows[4],
                              },
                            }}
                            elevation={2}
                          >
                            <Typography 
                              variant="caption" 
                              noWrap 
                              sx={{ 
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            >
                              {task.taskId}
                            </Typography>
                          </Paper>
                        </Tooltip>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
