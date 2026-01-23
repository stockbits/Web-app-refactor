import { Box, Stack, Typography, useTheme, Divider, Collapse, IconButton } from '@mui/material';
import { TaskIcon } from './MUI - Icon';
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

  const [taskTypesOpen, setTaskTypesOpen] = useState(true);
  const [commitTypesOpen, setCommitTypesOpen] = useState(true);
  const [schedulingOpen, setSchedulingOpen] = useState(true);

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
      
      {/* Task Types Section */}
      <Box sx={{ mb: 2 }}>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={0.5}
          onClick={() => setTaskTypesOpen(!taskTypesOpen)}
          sx={{ 
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': { opacity: 0.8 }
          }}
        >
          <IconButton 
            size="small" 
            sx={{ 
              transform: taskTypesOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s'
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>
            Task Types
          </Typography>
        </Stack>
        <Collapse in={taskTypesOpen}>
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
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ paintOrder: 'stroke fill' }}>
                  <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill={taskColors?.taskGroup || TASK_ICON_COLORS.taskGroup} stroke={theme.openreach.coreBlock} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Task Group</Typography>
            </Stack>
          </Stack>
        </Collapse>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Commit Types Section */}
      <Box sx={{ mb: 2 }}>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={0.5}
          onClick={() => setCommitTypesOpen(!commitTypesOpen)}
          sx={{ 
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': { opacity: 0.8 }
          }}
        >
          <IconButton 
            size="small" 
            sx={{ 
              transform: commitTypesOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s'
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>
            Commit Types
          </Typography>
        </Stack>
        <Collapse in={commitTypesOpen}>
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
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Failed SLA / TAIL</Typography>
            </Stack>
          </Stack>
        </Collapse>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Scheduling Elements Section */}
      <Box sx={{ mb: 2 }}>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={0.5}
          onClick={() => setSchedulingOpen(!schedulingOpen)}
          sx={{ 
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': { opacity: 0.8 }
          }}
        >
          <IconButton 
            size="small" 
            sx={{ 
              transform: schedulingOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s'
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>
            Scheduling
          </Typography>
        </Stack>
        <Collapse in={schedulingOpen}>
          <Stack spacing={1.2} sx={{ mt: 1, pl: 1 }}>
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
                  height: '3px', 
                  borderTop: '3px dashed',
                  borderColor: theme.palette.text.secondary,
                  opacity: 0.6
                }} />
                <Box sx={{ 
                  position: 'absolute', 
                  left: 0, 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: theme.palette.text.secondary,
                  opacity: 0.6
                }} />
                <Box sx={{ 
                  position: 'absolute', 
                  right: 0, 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: theme.palette.text.secondary,
                  opacity: 0.6
                }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Travel Time</Typography>
            </Stack>
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
