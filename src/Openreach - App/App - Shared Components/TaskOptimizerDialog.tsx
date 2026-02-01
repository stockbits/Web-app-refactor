import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Stack,
  Typography,
  Box,
  Alert,
  LinearProgress,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import RefreshIcon from '@mui/icons-material/Refresh'
import RouteIcon from '@mui/icons-material/Route'

type OperationType = 'optimize-travel' | 'update-dates'

interface OptimizationStrategy {
  value: 'efficient' | 'travel-priority'
  label: string
  description: string
}

const STRATEGIES: OptimizationStrategy[] = [
  {
    value: 'efficient',
    label: 'Efficient (Minimize Travel)',
    description: 'Cluster tasks close to Aberdare to reduce travel time. Best for productivity.',
  },
  {
    value: 'travel-priority',
    label: 'Travel Priority (Maximize Travel)',
    description: 'Spread tasks between Mountain Ash and Hirwaun to increase travel time.',
  },
]

interface TaskOptimizerDialogProps {
  open: boolean
  onClose: () => void
  onOptimize?: (strategy: string, options: OptimizationOptions) => void
}

export interface OptimizationOptions {
  strategy: 'efficient' | 'travel-priority'
  daysSpread: number
  maxTasksPerDay: number
  minTravelTime: number
}

export const TaskOptimizerDialog = ({ open, onClose, onOptimize }: TaskOptimizerDialogProps) => {
  const [operationType, setOperationType] = useState<OperationType>('optimize-travel')
  const [strategy, setStrategy] = useState<'efficient' | 'travel-priority'>('efficient')
  const [daysSpread, setDaysSpread] = useState(7)
  const [maxTasksPerDay, setMaxTasksPerDay] = useState(5)
  const [minTravelTime, setMinTravelTime] = useState(15)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleOptimize = useCallback(async () => {
    setIsOptimizing(true)
    
    if (operationType === 'update-dates') {
      try {
        const response = await fetch('/api/refresh-tasks', {
          method: 'POST',
        })
        const data = await response.json()
        
        setIsOptimizing(false)
        
        if (data.success) {
          const shouldReload = window.confirm(
            '✅ Tasks refreshed successfully!\n\n' +
            'Click OK to reload the page and see the updated tasks.'
          )
          onClose()
          if (shouldReload) {
            window.location.reload()
          }
        } else {
          alert('❌ Failed to refresh tasks:\n\n' + (data.error || data.message))
        }
      } catch (error) {
        setIsOptimizing(false)
        alert(
          '❌ Cannot connect to backend server.\n\n' +
          'Please ensure the server is running:\n' +
          '1. Open a terminal\n' +
          '2. Run: npm run server\n' +
          '3. Or run: npm run dev:full (runs both frontend & backend)\n\n' +
          'Error: ' + (error instanceof Error ? error.message : String(error))
        )
      }
    } else {
      // Travel optimization
      try {
        const response = await fetch('/api/optimize-travel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strategy,
            days: daysSpread,
            maxTasks: maxTasksPerDay,
          }),
        })
        const data = await response.json()
        
        setIsOptimizing(false)
        
        if (data.success) {
          if (onOptimize) {
            onOptimize(strategy, {
              strategy,
              daysSpread,
              maxTasksPerDay,
              minTravelTime,
            })
          }
          onClose()
          alert(`✅ Tasks optimized using ${strategy === 'efficient' ? 'Efficient' : 'Travel Priority'} strategy!\n\nThe schedule has been updated.`)
        } else {
          alert('❌ Failed to optimize travel:\n\n' + (data.error || data.message))
        }
      } catch (error) {
        setIsOptimizing(false)
        alert(
          '❌ Cannot connect to backend server.\n\n' +
          'Please ensure the server is running with: npm run server\n\n' +
          'Error: ' + (error instanceof Error ? error.message : String(error))
        )
      }
    }
  }, [strategy, daysSpread, maxTasksPerDay, minTravelTime, onOptimize, onClose, operationType])

  const handleRunScript = useCallback(async () => {
    // Copy command to clipboard and show instructions
    let scriptCommand = ''
    let description = ''
    
    if (operationType === 'update-dates') {
      scriptCommand = 'npm run refresh-tasks'
      description = 'This will:\n- Update all task commit dates to start from today\n- Assign tasks to Service Delivery resources in Domain ZB\n- Stack tasks to fill engineer days with realistic scheduling\n- Respect shift times and task durations'
    } else {
      scriptCommand = `npm run optimize-travel -- --strategy ${strategy} --days ${daysSpread} --max-tasks ${maxTasksPerDay}`
      description = 'This will optimize task locations and schedules based on your selected strategy'
    }
    
    try {
      await navigator.clipboard.writeText(scriptCommand)
      alert(
        `✅ Command copied to clipboard!\n\n` +
        `Command: ${scriptCommand}\n\n` +
        `Next steps:\n` +
        `1. Open a terminal (Ctrl+\` or Cmd+\`)\n` +
        `2. Paste the command (already copied)\n` +
        `3. Press Enter to run\n` +
        `4. Return here and click "Run & Reload" to see results\n\n` +
        `${description}`
      )
    } catch {
      alert(
        `To run the ${operationType === 'update-dates' ? 'task date refresh' : 'optimizer'}:\n\n` +
        `1. Open a terminal\n` +
        `2. Run: ${scriptCommand}\n\n` +
        `${description}\n\n` +
        `Then use the "Run & Reload" button.`
      )
    }
  }, [operationType, strategy, daysSpread, maxTasksPerDay])

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TuneIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Task Schedule Tools
          </Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info" variant="outlined">
            {operationType === 'update-dates' 
              ? 'Refresh all task dates to start from today and redistribute across engineers in Service Delivery, Domain ZB.'
              : 'Optimize task locations and schedules to either minimize or maximize travel time.'}
          </Alert>

          {/* Operation Type Selector */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Operation Type
            </Typography>
            <ToggleButtonGroup
              value={operationType}
              exclusive
              onChange={(_, value) => value && setOperationType(value)}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            >
              <ToggleButton value="update-dates">
                <Stack direction="row" spacing={1} alignItems="center">
                  <RefreshIcon fontSize="small" />
                  <Typography variant="body2">Refresh Task Dates</Typography>
                </Stack>
              </ToggleButton>
              <ToggleButton value="optimize-travel">
                <Stack direction="row" spacing={1} alignItems="center">
                  <RouteIcon fontSize="small" />
                  <Typography variant="body2">Optimize Travel</Typography>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {isOptimizing && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {operationType === 'update-dates' ? 'Refreshing task dates...' : 'Optimizing tasks...'}
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {/* Travel Optimization Options */}
          {operationType === 'optimize-travel' && (
            <>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                  Optimization Strategy
                </FormLabel>
                <RadioGroup
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as 'efficient' | 'travel-priority')}
                >
                  {STRATEGIES.map((s) => (
                    <FormControlLabel
                      key={s.value}
                      value={s.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {s.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        mb: 1,
                        p: 1.5,
                        border: 1,
                        borderColor: strategy === s.value ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        mr: 0,
                        bgcolor: strategy === s.value ? 'action.selected' : 'transparent',
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Scheduling Parameters
                </Typography>
                
                <TextField
                  label="Days to Spread Tasks"
                  type="number"
                  value={daysSpread}
                  onChange={(e) => setDaysSpread(parseInt(e.target.value))}
                  InputProps={{
                    inputProps: { min: 1, max: 30 }
                  }}
                  size="small"
                  fullWidth
                  helperText="Number of days to distribute tasks across"
                />

                <TextField
                  label="Max Tasks Per Day"
                  type="number"
                  value={maxTasksPerDay}
                  onChange={(e) => setMaxTasksPerDay(parseInt(e.target.value))}
                  InputProps={{
                    inputProps: { min: 1, max: 20 }
                  }}
                  size="small"
                  fullWidth
                  helperText="Maximum number of tasks scheduled per day"
                />

                <TextField
                  label="Minimum Travel Time (minutes)"
                  type="number"
                  value={minTravelTime}
                  onChange={(e) => setMinTravelTime(parseInt(e.target.value))}
                  InputProps={{
                    inputProps: { min: 0, max: 120 }
                  }}
                  size="small"
                  fullWidth
                  helperText="Minimum travel time between consecutive tasks"
                />
              </Stack>

              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Expected Impact:</strong>
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {strategy === 'efficient' ? (
                    <>
                      <Chip label="↓ 33% Travel Distance" size="small" color="success" variant="outlined" />
                      <Chip label="↑ 5 Tasks/Day" size="small" color="info" variant="outlined" />
                      <Chip label="Clustered Near Aberdare" size="small" variant="outlined" />
                    </>
                  ) : (
                    <>
                      <Chip label="↑ 500% Travel Distance" size="small" color="warning" variant="outlined" />
                      <Chip label="↓ 2 Tasks/Day" size="small" color="info" variant="outlined" />
                      <Chip label="Spread Across Valleys" size="small" variant="outlined" />
                    </>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Task Date Refresh Info */}
          {operationType === 'update-dates' && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                What this does:
              </Typography>
              <Stack spacing={1} component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography variant="body2" component="li">
                  Updates all task commit dates to start from today
                </Typography>
                <Typography variant="body2" component="li">
                  Assigns tasks to Service Delivery resources in Domain ZB
                </Typography>
                <Typography variant="body2" component="li">
                  Stacks tasks to fill engineer days with realistic scheduling
                </Typography>
                <Typography variant="body2" component="li">
                  Respects shift times and task durations (1:00 to 3:00 hours)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 0.5 }}>
                <Chip label="Fresh Dates from Today" size="small" color="success" variant="outlined" />
                <Chip label="Domain ZB Only" size="small" color="info" variant="outlined" />
                <Chip label="Optimized Schedule" size="small" variant="outlined" />
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleRunScript} variant="outlined">
          Copy Command (Manual)
        </Button>
        <Button 
          onClick={handleOptimize} 
          variant="contained"
          disabled={isOptimizing}
        >
          {operationType === 'update-dates' ? 'Refresh Now' : 'Optimize Now'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
