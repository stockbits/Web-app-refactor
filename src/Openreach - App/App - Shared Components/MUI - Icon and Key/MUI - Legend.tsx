import { Box, Stack, Typography, useTheme, Divider, Collapse, IconButton } from '@mui/material';
import { TaskIcon, ResourceIcon } from './MUI - Icon';
import { TASK_ICON_COLORS } from '../../../AppCentralTheme/Icon-Colors';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface TaskStatusLegendProps {
  /**
   * Display style: 'compact' for toolbar, 'full' for floating panel
   */
  variant?: 'compact' | 'full';
  /**
   * Show or hide the title
   */
  showTitle?: boolean;
}

export function TaskStatusLegend({ variant = 'full', showTitle = true }: TaskStatusLegendProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const taskColors = isDark ? theme.openreach?.darkTokens?.mapTaskColors : theme.openreach?.lightTokens?.mapTaskColors;

  const isCompact = variant === 'compact';

  const [taskOpen, setTaskOpen] = useState(true);
  const [resourceOpen, setResourceOpen] = useState(true);
  const [ganttScheduleOpen, setGanttScheduleOpen] = useState(true);

  return (
    <Box component="nav" aria-label="Task status legend" role="navigation">
      {showTitle && (
        <Typography 
          component="h3"
          variant={isCompact ? 'caption' : 'subtitle2'} 
          fontWeight={700} 
          sx={{ 
            mb: isCompact ? 0.5 : 1.5, 
            letterSpacing: '0.3px',
            color: 'text.primary'
          }}
        >
          Legend Key Menu
        </Typography>
      )}
      
      {/* Task Section */}
      <Box sx={{ mb: 2 }}>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={0.5}
          onClick={() => setTaskOpen(!taskOpen)}
          sx={{ 
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': { opacity: 0.8 }
          }}
        >
          <IconButton 
            size="small" 
            sx={{ 
              transform: taskOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s'
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>
            Task
          </Typography>
        </Stack>
        <Collapse in={taskOpen}>
          <Stack spacing={isCompact ? 0.8 : 1.2} sx={{ mt: 1, pl: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                <TaskIcon 
                  variant="appointment" 
                  size={28}
                  color={taskColors?.appointment || TASK_ICON_COLORS.appointment}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Appointment</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                <TaskIcon 
                  variant="startBy" 
                  size={28}
                  color={taskColors?.startBy || TASK_ICON_COLORS.startBy}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Start By</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                <TaskIcon 
                  variant="completeBy" 
                  size={28}
                  color={taskColors?.completeBy || TASK_ICON_COLORS.completeBy}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Complete By</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                <TaskIcon 
                  variant="failedSLA" 
                  size={28}
                  color={taskColors?.failedSLA || TASK_ICON_COLORS.failedSLA}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Failed SLA</Typography>
            </Stack>
          </Stack>
        </Collapse>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Resource Section */}
      <Box sx={{ mb: 2 }}>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={0.5}
          onClick={() => setResourceOpen(!resourceOpen)}
          sx={{ 
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': { opacity: 0.8 }
          }}
        >
          <IconButton 
            size="small" 
            sx={{ 
              transform: resourceOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s'
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>
            Resource
          </Typography>
        </Stack>
        <Collapse in={resourceOpen}>
          <Stack spacing={1.2} sx={{ mt: 1, pl: 1 }}>
            {/* Resource Working Statuses */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                <ResourceIcon 
                  workingStatus="Signed on" 
                  size={28}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Signed on</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                <ResourceIcon 
                  workingStatus="Signed on no work" 
                  size={28}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Signed on no work</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                <ResourceIcon 
                  workingStatus="Not Signed on" 
                  size={28}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Not Signed on</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                <ResourceIcon 
                  workingStatus="Absent" 
                  size={28}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Absent</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                <ResourceIcon 
                  workingStatus="Rostered off" 
                  size={28}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Rostered off</Typography>
            </Stack>
          </Stack>
        </Collapse>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Gantt Schedule Section */}
      <Box sx={{ mb: 2 }}>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={0.5}
          onClick={() => setGanttScheduleOpen(!ganttScheduleOpen)}
          sx={{ 
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': { opacity: 0.8 }
          }}
        >
          <IconButton 
            size="small" 
            sx={{ 
              transform: ganttScheduleOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s'
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>
            Gantt Schedule
          </Typography>
        </Stack>
        <Collapse in={ganttScheduleOpen}>
          <Stack spacing={1.2} sx={{ mt: 1, pl: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ 
                width: 28, 
                height: 20, 
                bgcolor: '#D97706', 
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'divider'
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Appointment</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ 
                width: 28, 
                height: 20, 
                bgcolor: '#43B072', 
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'divider'
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Start By</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ 
                width: 28, 
                height: 20, 
                bgcolor: '#5488C7', 
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'divider'
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Complete By</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ 
                width: 28, 
                height: 20, 
                bgcolor: '#A8ABB2', 
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'divider'
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Failed SLA</Typography>
            </Stack>
            
            <Divider sx={{ my: 0.5 }} />
            
            {/* Travel Time */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ 
                width: 28, 
                height: 20, 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ 
                  width: '100%', 
                  height: 0, 
                  borderTop: '2px dashed',
                  borderColor: theme.palette.warning.main,
                  opacity: 0.6
                }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Travel Time</Typography>
            </Stack>
            
            {/* Selected Task */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ 
                width: 28, 
                height: 20, 
                border: '4px solid #DC2626',
                borderRadius: 0.5,
                bgcolor: 'transparent'
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Selected Task</Typography>
            </Stack>
          </Stack>
        </Collapse>
      </Box>
    </Box>
  );
}
