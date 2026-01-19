import { useState, useMemo, useRef } from 'react'
import { Box, Stack, TextField, Autocomplete, useTheme, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, Button } from '@mui/material'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import MUI4Panel from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import type { DockedPanel } from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import { TASK_TABLE_ROWS } from '../../../App - Data Tables/Task - Table'
import type { TaskDomainId } from '../../../App - Data Tables/Task - Table'
import AppSearchTool from './App - Search Tool'
import type { SearchFilters } from './App - Search Tool'
import { TaskStatusLegend } from '../../../App - Shared Components/MUI - Icon and Key/MUI - Legend'
import { useSelectionUI } from '../../../App - Shared Components/Selection - UI'

type DivisionType = 'Service Delivery' | 'Complex Engineering' | 'Admin'

interface ScheduleLivePageProps {
  dockedPanels?: DockedPanel[]
  onDockedPanelsChange?: (panels: DockedPanel[]) => void
}

const ScheduleLivePage = ({ dockedPanels = [], onDockedPanelsChange }: ScheduleLivePageProps = {}) => {
  const theme = useTheme()
  const searchRef = useRef<HTMLInputElement>(null)
  const [selectedDivision, setSelectedDivision] = useState<DivisionType | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<TaskDomainId | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchToolOpen, setSearchToolOpen] = useState(false)
  const [legendOpen, setLegendOpen] = useState(false)
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null)
  const [clearTrigger, setClearTrigger] = useState(0)

  // Selection UI context
  const { clearSelection, selectedTaskIds } = useSelectionUI()

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
          p: { xs: 1, sm: 2 }, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 1, sm: 2 }} 
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          justifyContent="space-between"
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1, sm: 2 }} 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ flex: 1 }}
          >
            <Autocomplete
              size="small"
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                width: { xs: '100%', sm: 'auto' }
              }}
              options={divisionOptions}
              value={selectedDivision}
              onChange={(_, newValue) => setSelectedDivision(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Division" placeholder="Select division" />
              )}
            />
            
            <Autocomplete
              size="small"
              sx={{ 
                minWidth: { xs: '100%', sm: 150 },
                width: { xs: '100%', sm: 'auto' }
              }}
              options={domainOptions}
              value={selectedDomain}
              onChange={(_, newValue) => setSelectedDomain(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Domain" placeholder="Select domain" />
              )}
            />

            <TextField
              size="small"
              sx={{ 
                flex: 1, 
                maxWidth: { xs: 'none', sm: 400 },
                minWidth: { xs: '100%', sm: 'auto' }
              }}
              placeholder="Global search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              inputRef={searchRef}
            />

            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<SearchIcon />}
                onClick={() => setSearchToolOpen(true)}
              >
                Search
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<ClearIcon />}
                onClick={() => {
                  clearSelection()
                  setSearchFilters(null)
                  setClearTrigger(prev => prev + 1)
                  // TODO: Clear sorting in the task table
                }}
                disabled={!searchFilters && selectedDivision === null && selectedDomain === null && searchInput === '' && selectedTaskIds.length === 0}
              >
                Clear
              </Button>
              <Tooltip title="Legend Key Menu">
                <IconButton onClick={() => setLegendOpen(true)}>
                  <VpnKeyIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
          
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center"
            sx={{ 
              flexShrink: 0,
              mt: { xs: 1, sm: 0 },
              justifyContent: { xs: 'center', sm: 'flex-end' }
            }}
          >
            {/* Docked Panel Icons */}
            {dockedPanels.map((panel) => (
              <Tooltip key={panel.id} title={panel.title}>
                <IconButton
                  size="small"
                  onClick={() => {
                    // Undock the panel
                    onDockedPanelsChange?.(dockedPanels.filter(p => p.id !== panel.id))
                  }}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  {panel.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* Panel Grid */}
      <MUI4Panel
        dockedPanels={dockedPanels}
        onDockedPanelsChange={onDockedPanelsChange}
        selectedDivision={selectedDivision}
        selectedDomain={selectedDomain}
        searchFilters={searchFilters}
        clearSorting={clearTrigger}
      />
      <AppSearchTool open={searchToolOpen} onClose={() => setSearchToolOpen(false)} onSearch={setSearchFilters} clearTrigger={clearTrigger} />
      <Dialog open={legendOpen} onClose={() => setLegendOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Legend Key Menu</DialogTitle>
        <DialogContent>
          <TaskStatusLegend variant="full" showTitle={false} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ScheduleLivePage
