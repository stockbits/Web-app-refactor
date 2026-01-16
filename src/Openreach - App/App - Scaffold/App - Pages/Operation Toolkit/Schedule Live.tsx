import { useState, useMemo, useRef } from 'react'
import { Box, Stack, TextField, Autocomplete, useTheme, IconButton, Tooltip, Button } from '@mui/material'
import MUI4Panel from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import type { DockedPanel } from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import { TASK_TABLE_ROWS } from '../../../App - Data Tables/Task - Table'
import type { TaskDomainId } from '../../../App - Data Tables/Task - Table'
import AppSearchTool from './App - Search Tool'

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
  const [globalSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchToolOpen, setSearchToolOpen] = useState(false)

  // Extract unique divisions and domains from DB data
  const divisionOptions = useMemo(() => 
    Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.division))).sort(), 
  [])

  const domainOptions = useMemo(() => 
    Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.domainId))).sort((a, b) => a.localeCompare(b)), 
  [])

  // TODO: Use globalSearch for filtering
  console.log('Global search applied:', globalSearch)

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
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              inputRef={searchRef}
            />
            
            <Tooltip title="Search Tool">
              <Button
                size="small"
                onClick={() => setSearchToolOpen(true)}
                variant="contained"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                Search Tool
              </Button>
            </Tooltip>
          </Stack>
          
          <Stack direction="row" spacing={1} alignItems="center">
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
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <MUI4Panel
          dockedPanels={dockedPanels}
          onDockedPanelsChange={onDockedPanelsChange}
        />
      </Box>

      <AppSearchTool
        open={searchToolOpen}
        onClose={() => setSearchToolOpen(false)}
        currentSearchTerm={searchInput}
        onSearch={(filters) => {
          // TODO: Implement search logic with filters and current searchInput
          console.log('Search filters:', filters)
          console.log('Current search term:', searchInput)
        }}
      />
    </Box>
  )
}

export default ScheduleLivePage
