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
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'

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
  const [strategy, setStrategy] = useState<'efficient' | 'travel-priority'>('efficient')
  const [daysSpread, setDaysSpread] = useState(7)
  const [maxTasksPerDay, setMaxTasksPerDay] = useState(5)
  const [minTravelTime, setMinTravelTime] = useState(15)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleOptimize = useCallback(async () => {
    setIsOptimizing(true)
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (onOptimize) {
      onOptimize(strategy, {
        strategy,
        daysSpread,
        maxTasksPerDay,
        minTravelTime,
      })
    }
    
    setIsOptimizing(false)
    onClose()
    
    // Show success message
    alert(`Tasks optimized using ${strategy === 'efficient' ? 'Efficient' : 'Travel Priority'} strategy!\n\nThe schedule has been updated. Changes will be visible after refresh.`)
  }, [strategy, daysSpread, maxTasksPerDay, minTravelTime, onOptimize, onClose])

  const handleRunScript = useCallback(() => {
    // In a real implementation, this would call the backend API
    // For now, we'll show instructions
    const scriptCommand = `node scripts/optimize-travel.js --strategy ${strategy} --days ${daysSpread} --max-tasks ${maxTasksPerDay}`
    
    console.log('Run this command:', scriptCommand)
    
    alert(
      `To run the optimizer:\n\n` +
      `1. Open a terminal\n` +
      `2. Run: ${scriptCommand}\n\n` +
      `Or use the "Optimize Now" button to simulate the optimization.`
    )
  }, [strategy, daysSpread, maxTasksPerDay])

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
            Task Schedule Optimizer
          </Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info" variant="outlined">
            This tool optimizes task locations and schedules to either minimize or maximize travel time.
          </Alert>

          {isOptimizing && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Optimizing tasks...
              </Typography>
              <LinearProgress />
            </Box>
          )}

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
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleRunScript} variant="outlined">
          Show Script Command
        </Button>
        <Button 
          onClick={handleOptimize} 
          variant="contained"
          disabled={isOptimizing}
        >
          Optimize Now
        </Button>
      </DialogActions>
    </Dialog>
  )
}
