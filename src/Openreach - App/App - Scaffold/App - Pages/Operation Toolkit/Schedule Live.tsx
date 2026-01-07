import { useState, useMemo } from 'react'
import { Stack, TextField, Autocomplete } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import MUI4Panel from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import type { DockedPanel } from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'
import { TASK_TABLE_ROWS } from '../../../App - Data Tables/Task - Table'
import type { TaskDomainId } from '../../../App - Data Tables/Task - Table'
import { PageContainer, SectionWrapper } from '../../../App - Shared Components/Page Container'

type DivisionType = 'Service Delivery' | 'Complex Engineering' | 'Admin'

interface ScheduleLivePageProps {
  dockedPanels?: DockedPanel[]
  onDockedPanelsChange?: (panels: DockedPanel[]) => void
}

const ScheduleLivePage = ({ dockedPanels = [], onDockedPanelsChange }: ScheduleLivePageProps = {}) => {
  const [selectedDivision, setSelectedDivision] = useState<DivisionType | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<TaskDomainId | null>(null)
  const [globalSearch, setGlobalSearch] = useState('')

  // Extract unique divisions and domains from DB data
  const divisionOptions = useMemo(() => 
    Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.division))).sort(), 
  [])

  const domainOptions = useMemo(() => 
    Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.domainId))).sort((a, b) => a.localeCompare(b)), 
  [])

  return (
    <PageContainer maxWidth={false} spacing={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Toolbar */}
      <SectionWrapper withBorder={false} padding={2}>
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
        </Stack>
      </SectionWrapper>

      {/* Panel Grid */}
      <SectionWrapper sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }} withBorder={false} padding={0}>
        <MUI4Panel
          dockedPanels={dockedPanels}
          onDockedPanelsChange={onDockedPanelsChange}
        />
      </SectionWrapper>
    </PageContainer>
  )
}

export default ScheduleLivePage
