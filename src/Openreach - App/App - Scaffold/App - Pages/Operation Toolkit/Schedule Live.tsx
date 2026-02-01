import { useState, useMemo, useRef, useCallback } from 'react'
import { Box, Stack, TextField, Autocomplete, IconButton, Tooltip, Button, Divider, Dialog, DialogTitle, DialogContent } from '@mui/material'
import { STANDARD_INPUT_PROPS, STANDARD_AUTOCOMPLETE_PROPS } from '../../../../AppCentralTheme/input-config.ts'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import TuneIcon from '@mui/icons-material/Tune'
import { TaskOptimizerDialog, type OptimizationOptions } from '../../../../mui-api-calls/TaskOptimizerDialog'
import MUI4Panel from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import type { DockedPanel } from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import { RESOURCE_TABLE_ROWS } from '../../../App - Data Tables/Resource - Table'
import type { TaskDomainId, TaskTableRow } from '../../../App - Data Tables/Task - Table'
import AppSearchTool from './App - Search Tool'
import type { SearchFilters } from './App - Search Tool'
import { TaskStatusLegend } from '../../../App - Shared Components/MUI - Icon and Key/MUI - Legend'
import { useSelectionUI } from '../../../App - Shared Components/MUI - Table/Selection - UI.tsx'
import GlobalSearchField from '../../../App - Shared Components/MUI - Table/GlobalSearchField'
import type { TaskCommitType } from '../../../App - Data Tables/Task - Table'

type DivisionType = 'Service Delivery' | 'Complex Engineering' | 'Admin'

interface ScheduleLivePageProps {
  dockedPanels?: DockedPanel[]
  onDockedPanelsChange?: (panels: DockedPanel[]) => void
  openTaskDialog?: (task: TaskTableRow | TaskTableRow[]) => void
  onAddToDock?: (item: { id: string; title: string; commitType?: TaskCommitType; task?: TaskTableRow }) => void
}

const ScheduleLivePage = ({ dockedPanels = [], onDockedPanelsChange, openTaskDialog, onAddToDock }: ScheduleLivePageProps = {}) => {
  const searchRef = useRef<HTMLInputElement>(null)
  const [selectedDivision, setSelectedDivision] = useState<DivisionType | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<TaskDomainId | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [activeSearchTerm, setActiveSearchTerm] = useState('') // Currently applied search
  const [optimizerOpen, setOptimizerOpen] = useState(false)
  const [searchToolOpen, setSearchToolOpen] = useState(false)
  const [legendOpen, setLegendOpen] = useState(false)
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null)
  const [clearTrigger, setClearTrigger] = useState(0)

  // Selection UI context
  const { clearSelection, selectedTaskIds } = useSelectionUI()

  // Handle search execution
  const handleSearch = useCallback(() => {
    const trimmed = searchInput.trim()
    if (trimmed) {
      setActiveSearchTerm(trimmed)
      setSearchFilters(null) // Clear search tool filters when using global search
    }
  }, [searchInput])

  // Handle search tool results
  const handleSearchToolResults = useCallback((filters: SearchFilters | null) => {
    setSearchFilters(filters)
    setActiveSearchTerm('') // Clear global search when using search tool
  }, [])

  // Clear handler - memoized to prevent unnecessary re-renders
  const handleClear = useCallback(() => {
    clearSelection()
    setSearchFilters(null)
    setSearchInput('')
    setActiveSearchTerm('')
    setClearTrigger(prev => prev + 1)
    // TODO: Clear sorting in the task table
  }, [clearSelection])

  // Undock panel handler - memoized
  const handleUndockPanel = useCallback((panelId: string) => {
    onDockedPanelsChange?.(dockedPanels.filter(p => p.id !== panelId))
  }, [dockedPanels, onDockedPanelsChange])

  // Optimize handler - memoized
  const handleOptimize = useCallback((strategy: string, options: OptimizationOptions) => {
    console.log('Optimizing with:', strategy, options)
    // In production, this would call the backend API
    // For now, refresh to show changes
    setTimeout(() => window.location.reload(), 1000)
  }, [])

  // Close optimizer - memoized
  const handleCloseOptimizer = useCallback(() => setOptimizerOpen(false), [])

  // Close legend - memoized  
  const handleCloseLegend = useCallback(() => setLegendOpen(false), [])

  // Open optimizer - memoized
  const handleOpenOptimizer = useCallback(() => setOptimizerOpen(true), [])

  // Open legend - memoized
  const handleOpenLegend = useCallback(() => setLegendOpen(true), [])

  // Resource DB data to show all available options
  const divisionOptions = useMemo(() => 
    Array.from(new Set(RESOURCE_TABLE_ROWS.map((row) => row.division))).sort(), 
  [])

  const domainOptions = useMemo(() => 
    Array.from(new Set(RESOURCE_TABLE_ROWS.map((row) => row.domainId))).sort((a, b) => a.localeCompare(b)), 
  [])

  return (
    <Stack sx={{ height: '100%', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Compact Toolbar */}
      <Box 
        sx={{ 
          flexShrink: 0,
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 1.25 },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack 
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={1.5}
          sx={{ 
            width: '100%'
          }}
        >
          {/* Filters */}
          <Autocomplete
            {...STANDARD_AUTOCOMPLETE_PROPS}
            sx={{ 
              width: { xs: '100%', md: 180, lg: 240 },
            }}
            options={divisionOptions}
            value={selectedDivision}
            onChange={(_, newValue) => setSelectedDivision(newValue)}
            renderInput={(params) => (
              <TextField {...params} {...STANDARD_INPUT_PROPS} label="Division" placeholder="Select division" />
            )}
          />
          
          <Autocomplete
            {...STANDARD_AUTOCOMPLETE_PROPS}
            sx={{ 
              width: { xs: '100%', md: 180, lg: 200 },
            }}
            options={domainOptions}
            value={selectedDomain}
            onChange={(_, newValue) => setSelectedDomain(newValue)}
            renderInput={(params) => (
              <TextField {...params} {...STANDARD_INPUT_PROPS} label="Domain" placeholder="Select domain" />
            )}
          />

          {/* Global Search */}
          <GlobalSearchField
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            placeholder="Global search..."
            localStorageKey="scheduleLiveSearchHistory"
            showSearchButton={true}
            inputRef={searchRef}
            sx={{ 
              width: { xs: '100%', md: 240, lg: 320 },
            }}
          />

          {/* Action Buttons */}
          <Button 
            variant="contained" 
            size="small"
            onClick={() => setSearchToolOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Search Tool
          </Button>

          <Button 
            variant="outlined" 
            size="small"
            onClick={handleClear}
            disabled={!searchFilters && selectedDivision === null && selectedDomain === null && searchInput === '' && selectedTaskIds.length === 0}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Clear
          </Button>

          {/* Right side: Legend and Docked Panels - pushed to far right */}
          <Stack
            direction="row"
            spacing={{ xs: 0.5, sm: 1 }}
            sx={{ 
              ml: 'auto',
              mr: { xs: 0, sm: -1.5 },
              pr: { xs: 0.5, sm: 1.5 },
              flexShrink: 0,
              overflow: 'auto',
              maxWidth: { xs: '50%', sm: 'none' },
            }}
          >
            <Tooltip title="Optimize Schedule & Travel">
              <IconButton 
                size="small"
                onClick={handleOpenOptimizer}
                sx={{ 
                  border: 1, 
                  borderColor: 'divider',
                  color: 'primary.main',
                  p: { xs: 0.5, sm: 0.75 },
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.lighter',
                  }
                }}
              >
                <TuneIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Legend Key Menu">
              <IconButton 
                size="small"
                onClick={handleOpenLegend}
                sx={{ 
                  border: 1, 
                  borderColor: 'divider',
                  p: { xs: 0.5, sm: 0.75 },
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <VpnKeyIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ my: 0.5, display: { xs: 'none', sm: 'block' } }} />

            {/* Docked Panel Icons */}
            {dockedPanels.map((panel) => (
              <Tooltip key={panel.id} title={panel.title}>
                <IconButton
                  size="small"
                  onClick={() => handleUndockPanel(panel.id)}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    color: 'text.secondary',
                    p: { xs: 0.5, sm: 0.75 },
                    '&:hover': {
                      borderColor: 'error.main',
                      color: 'error.main',
                      bgcolor: 'action.hover',
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: 18, sm: 20 }
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
        searchTerm={activeSearchTerm}
        searchFilters={searchFilters}
        clearSorting={clearTrigger}
        openTaskDialog={openTaskDialog}
        onAddToDock={onAddToDock}
      />
      
      <AppSearchTool 
        open={searchToolOpen} 
        onClose={() => setSearchToolOpen(false)} 
        onSearch={handleSearchToolResults} 
        clearTrigger={clearTrigger}
        selectedDivision={selectedDivision}
        selectedDomain={selectedDomain}
      />

      {/* Task Status Legend Dialog */}
      <Dialog open={legendOpen} onClose={handleCloseLegend} maxWidth="sm" fullWidth>
        <DialogTitle>Legend Key Menu</DialogTitle>
        <DialogContent>
          <TaskStatusLegend variant="full" showTitle={false} />
        </DialogContent>
      </Dialog>

      {/* Task Optimizer Dialog */}
      <TaskOptimizerDialog
        open={optimizerOpen}
        onClose={handleCloseOptimizer}
        onOptimize={handleOptimize}
      />
    </Stack>
  )
}

export default ScheduleLivePage
