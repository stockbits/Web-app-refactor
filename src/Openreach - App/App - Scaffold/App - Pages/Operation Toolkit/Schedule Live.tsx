import { useState } from 'react'
import MUI4Panel, { DockedPanel } from '../../../App - Shared Components/MUI - Panel Structure/MUI4Panel'

const ScheduleLivePage = () => {
  const [dockedPanels, setDockedPanels] = useState<DockedPanel[]>([])

  return (
    <MUI4Panel
      dockedPanels={dockedPanels}
      onDockedPanelsChange={setDockedPanels}
    />
  )
}

export default ScheduleLivePage
