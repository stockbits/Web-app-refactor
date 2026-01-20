import { useState, useMemo, useRef, useCallback } from 'react'
import { Box, Stack, TextField, Autocomplete, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, Button } from '@mui/material'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import MUI4Panel from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import type { DockedPanel } from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import { TASK_TABLE_ROWS } from '../../../App - Data Tables/Task - Table'
import type { TaskDomainId, TaskTableRow } from '../../../App - Data Tables/Task - Table'
import AppSearchTool from './App - Search Tool'
import type { SearchFilters } from './App - Search Tool'
import { TaskStatusLegend } from '../../../App - Shared Components/MUI - Icon and Key/MUI - Legend'
import { useSelectionUI } from '../../../App - Shared Components/Selection - UI'

type DivisionType = 'Service Delivery' | 'Complex Engineering' | 'Admin'

interface ScheduleLivePageProps {
  dockedPanels?: DockedPanel[]
  onDockedPanelsChange?: (panels: DockedPanel[]) => void
  openTaskDialog?: (task: TaskTableRow) => void
}

const ScheduleLivePage = ({ dockedPanels = [], onDockedPanelsChange, openTaskDialog }: ScheduleLivePageProps = {}) => {
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

  // Clear handler - memoized to prevent unnecessary re-renders
  const handleClear = useCallback(() => {
    clearSelection()
    setSearchFilters(null)
    setClearTrigger(prev => prev + 1)
    // TODO: Clear sorting in the task table
  }, [clearSelection])

  // Undock panel handler - memoized
  const handleUndockPanel = useCallback((panelId: string) => {
    onDockedPanelsChange?.(dockedPanels.filter(p => p.id !== panelId))
  }, [dockedPanels, onDockedPanelsChange])

  // Extract unique divisions and domains from DB data
  const divisionOptions = useMemo(() => 
    Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.division))).sort(), 
  [])

  const domainOptions = useMemo(() => 
    Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.domainId))).sort((a, b) => a.localeCompare(b)), 
  [])

  return (
    <Stack sx={{ height: '100%', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Compact Toolbar */}
      <Box 
        sx={{ 
          flexShrink: 0,
          px: { xs: 1.5, sm: 2 },
          py: 1.25,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack 
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ 
            flexWrap: { xs: 'wrap', md: 'nowrap' },
          }}
        >
          {/* Filters */}
          <Autocomplete
            size="small"
            sx={{ 
              minWidth: { xs: '100%', sm: 160, md: 140 },
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 1, sm: 1 }
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
              minWidth: { xs: '100%', sm: 140, md: 120 },
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 2, sm: 2 }
            }}
            options={domainOptions}
            value={selectedDomain}
            onChange={(_, newValue) => setSelectedDomain(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Domain" placeholder="Select domain" />
            )}
          />

          {/* Global Search with integrated action buttons */}
          <Stack 
            direction="row" 
            spacing={0.75}
            alignItems="center"
            sx={{ 
              flex: { xs: '1 1 100%', md: 1 },
              maxWidth: { md: 500 },
              order: { xs: 3, sm: 3 }
            }}
          >
            <TextField
              size="small"
              sx={{ flex: 1 }}
              placeholder="Global search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              inputRef={searchRef}
            />
            <Button 
              variant="contained" 
              size="small"
              onClick={() => setSearchToolOpen(true)}
              sx={{ 
                minWidth: 80,
                px: 1.5
              }}
            >
              Search
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleClear}
              disabled={!searchFilters && selectedDivision === null && selectedDomain === null && searchInput === '' && selectedTaskIds.length === 0}
              sx={{ 
                minWidth: 70,
                px: 1.5
              }}
            >
              Clear
            </Button>
          </Stack>

          {/* Utility Icons */}
          <Stack 
            direction="row" 
            spacing={0.75}
            sx={{ 
              flexShrink: 0,
              order: { xs: 4, sm: 4 },
              ml: { md: 'auto !important' }
            }}
          >
            <Tooltip title="Legend Key Menu">
              <IconButton 
                size="small"
                onClick={() => setLegendOpen(true)}
                sx={{ 
                  border: 1, 
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <VpnKeyIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Docked Panel Icons */}
            {dockedPanels.length > 0 && (
              <>
                <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', mx: 0.5 }} />
                {dockedPanels.map((panel) => (
                  <Tooltip key={panel.id} title={panel.title}>
                    <IconButton
                      size="small"
                      onClick={() => handleUndockPanel(panel.id)}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        color: 'text.secondary',
                        '&:hover': {
                          borderColor: 'error.main',
                          color: 'error.main',
                          bgcolor: 'action.hover',
                        }
                      }}
                    >
                      {panel.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </>
            )}
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
        openTaskDialog={openTaskDialog}
      />
      
      <AppSearchTool open={searchToolOpen} onClose={() => setSearchToolOpen(false)} onSearch={setSearchFilters} clearTrigger={clearTrigger} />
      <Dialog open={legendOpen} onClose={() => setLegendOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Legend Key Menu</DialogTitle>
        <DialogContent>
          <TaskStatusLegend variant="full" showTitle={false} />
        </DialogContent>
      </Dialog>
    </Stack>
  )
}

export default ScheduleLivePage
