import { Box, Stack, Typography, useTheme } from '@mui/material';
import { TaskIcon } from './MUI - Icon';
import { TASK_ICON_COLORS } from '../../../AppCentralTheme/Icon-Colors';

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
      <Stack spacing={isCompact ? 0.8 : 1.2} direction={isCompact ? 'row' : 'column'} component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        <Stack direction="row" spacing={isCompact ? 0.75 : 1.5} alignItems="center" sx={{ py: isCompact ? 0 : 0.5 }}>
          <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <TaskIcon 
              variant="appointment" 
              size={28}
              color={taskColors?.appointment || TASK_ICON_COLORS.appointment}
            />
          </Box>
          {!isCompact && <Typography variant="body2" sx={{ fontWeight: 500 }}>Appointment</Typography>}
        </Stack>
        <Stack direction="row" spacing={isCompact ? 0.75 : 1.5} alignItems="center" sx={{ py: isCompact ? 0 : 0.5 }}>
          <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <TaskIcon 
              variant="startBy" 
              size={28}
              color={taskColors?.startBy || TASK_ICON_COLORS.startBy}
            />
          </Box>
          {!isCompact && <Typography variant="body2" sx={{ fontWeight: 500 }}>Start By</Typography>}
        </Stack>
        <Stack direction="row" spacing={isCompact ? 0.75 : 1.5} alignItems="center" sx={{ py: isCompact ? 0 : 0.5 }}>
          <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <TaskIcon 
              variant="completeBy" 
              size={28}
              color={taskColors?.completeBy || TASK_ICON_COLORS.completeBy}
            />
          </Box>
          {!isCompact && <Typography variant="body2" sx={{ fontWeight: 500 }}>Complete By</Typography>}
        </Stack>
        <Stack direction="row" spacing={isCompact ? 0.75 : 1.5} alignItems="center" sx={{ py: isCompact ? 0 : 0.5 }}>
          <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <TaskIcon 
              variant="failedSLA" 
              size={28}
              color={taskColors?.failedSLA || TASK_ICON_COLORS.failedSLA}
            />
          </Box>
          {!isCompact && <Typography variant="body2" sx={{ fontWeight: 500 }}>Failed SLA</Typography>}
        </Stack>
        <Stack direction="row" spacing={isCompact ? 0.75 : 1.5} alignItems="center" sx={{ py: isCompact ? 0 : 0.5 }}>
          <Box sx={{ lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ paintOrder: 'stroke fill' }}>
              <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill={taskColors?.taskGroup || TASK_ICON_COLORS.taskGroup} stroke={theme.openreach.coreBlock} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </Box>
          {!isCompact && <Typography variant="body2" sx={{ fontWeight: 500 }}>Task Group</Typography>}
        </Stack>
      </Stack>
    </Box>
  );
}
