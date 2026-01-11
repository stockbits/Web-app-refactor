import { useState, useMemo } from 'react'
import { Box, Stack, TextField, Autocomplete, useTheme, IconButton, Popover, Tooltip } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import LegendToggleIcon from '@mui/icons-material/LegendToggle'
import MUI4Panel from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import type { DockedPanel } from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import { TASK_TABLE_ROWS } from '../../../App - Data Tables/Task - Table'
import type { TaskDomainId } from '../../../App - Data Tables/Task - Table'
import { TaskStatusLegend } from '../../../App - Shared Components/MUI - Icon and Key/MUI - Legend'

type DivisionType = 'Service Delivery' | 'Complex Engineering' | 'Admin'

interface ScheduleLivePageProps {
  dockedPanels?: DockedPanel[]
  onDockedPanelsChange?: (panels: DockedPanel[]) => void
}

const ScheduleLivePage = ({ dockedPanels = [], onDockedPanelsChange }: ScheduleLivePageProps = {}) => {
  const theme = useTheme()
  const [selectedDivision, setSelectedDivision] = useState<DivisionType | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<TaskDomainId | null>(null)
  const [globalSearch, setGlobalSearch] = useState('')
  const [legendAnchorEl, setLegendAnchorEl] = useState<HTMLElement | null>(null)

  // Extract unique divisions and domains from DB data
  const divisionOptions = useMemo(() => 
    Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.division))).sort(), 
  [])

  const domainOptions = useMemo(() => 
    Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.domainId))).sort((a, b) => a.localeCompare(b)), 
  [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Toolbar */}
      <Box 
        sx={{ 
          flexShrink: 0, 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Autocomplete
            size="small"
            sx={{ minWidth: 200 }}
            options={divisionOptions}
            value={selectedDivision}
            onChange={(_, newValue) => setSelectedDivision(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Division" placeholder="Select division" />
            )}
          />
          
          <Autocomplete
            size="small"
            sx={{ minWidth: 150 }}
            options={domainOptions}
            value={selectedDomain}
            onChange={(_, newValue) => setSelectedDomain(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Domain" placeholder="Select domain" />
            )}
          />

          <TextField
            size="small"
            sx={{ flex: 1, maxWidth: 400 }}
            placeholder="Global search..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.primary', fontSize: 20 }} />,
            }}
          />
          
          <Tooltip title="Task Status Legend">
            <IconButton
              size="small"
              onClick={(e) => setLegendAnchorEl(e.currentTarget)}
              sx={{
                color: theme.openreach.energyAccent,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <LegendToggleIcon />
            </IconButton>
          </Tooltip>
          
          <Popover
            open={Boolean(legendAnchorEl)}
            anchorEl={legendAnchorEl}
            onClose={() => setLegendAnchorEl(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            slotProps={{
              paper: {
                sx: {
                  p: 2,
                  mt: 1,
                  minWidth: 200,
                  border: `2px solid ${theme.palette.divider}`,
                  outline: `1px solid ${theme.palette.divider}`,
                }
              }
            }}
          >
            <TaskStatusLegend variant="full" showTitle />
          </Popover>
        </Stack>
      </Box>

      {/* Panel Grid */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <MUI4Panel
          dockedPanels={dockedPanels}
          onDockedPanelsChange={onDockedPanelsChange}
        />
      </Box>
    </Box>
  )
}

export default ScheduleLivePage
