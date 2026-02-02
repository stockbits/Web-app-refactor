import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Stack,
  Divider,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export type GanttPopulationMode = 'auto' | 'manual';

export interface GanttResourceField {
  key: string;
  label: string;
  enabled: boolean;
}

export interface GanttTaskField {
  key: string;
  label: string;
  enabled: boolean;
}

export interface GanttSettings {
  populationMode: GanttPopulationMode;
  resourceFields: GanttResourceField[];
  taskFields: GanttTaskField[];
}

interface GanttSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: GanttSettings;
  onSave: (settings: GanttSettings) => void;
}

export function GanttSettingsDialog({ open, onClose, settings, onSave }: GanttSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<GanttSettings>(settings);
  const [resourceExpanded, setResourceExpanded] = useState(true);
  const [taskExpanded, setTaskExpanded] = useState(true);

  const handlePopulationModeChange = (mode: GanttPopulationMode) => {
    setLocalSettings(prev => ({ ...prev, populationMode: mode }));
  };

  const handleResourceFieldToggle = (key: string) => {
    setLocalSettings(prev => ({
      ...prev,
      resourceFields: prev.resourceFields.map(field =>
        field.key === key ? { ...field, enabled: !field.enabled } : field
      ),
    }));
  };

  const handleTaskFieldToggle = (key: string) => {
    setLocalSettings(prev => ({
      ...prev,
      taskFields: prev.taskFields.map(field =>
        field.key === key ? { ...field, enabled: !field.enabled } : field
      ),
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings); // Reset to original settings
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Gantt Chart Settings
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Population Mode */}
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
              Population Mode
            </FormLabel>
            <RadioGroup
              value={localSettings.populationMode}
              onChange={(e) => handlePopulationModeChange(e.target.value as GanttPopulationMode)}
            >
              <FormControlLabel
                value="auto"
                control={<Radio />}
                label={
                  <Stack>
                    <Typography variant="body2" fontWeight={500}>Auto Populate</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatically show resources based on filters
                    </Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                value="manual"
                control={<Radio />}
                label={
                  <Stack>
                    <Typography variant="body2" fontWeight={500}>Manual Select</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Manually select which resources to display
                    </Typography>
                  </Stack>
                }
              />
            </RadioGroup>
          </FormControl>

          <Divider />

          {/* Resource Display Fields */}
          <Accordion 
            expanded={resourceExpanded} 
            onChange={() => setResourceExpanded(!resourceExpanded)}
            sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 0, minHeight: '48px !important' }}
            >
              <Stack>
                <Typography variant="body1" fontWeight={600}>
                  Resource Row Information
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select which fields to display for each resource
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 0 }}>
              <FormGroup>
                {localSettings.resourceFields.map((field) => (
                  <FormControlLabel
                    key={field.key}
                    control={
                      <Checkbox
                        checked={field.enabled}
                        onChange={() => handleResourceFieldToggle(field.key)}
                      />
                    }
                    label={field.label}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          <Divider />

          {/* Task Display Fields */}
          <Accordion 
            expanded={taskExpanded} 
            onChange={() => setTaskExpanded(!taskExpanded)}
            sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 0, minHeight: '48px !important' }}
            >
              <Stack>
                <Typography variant="body1" fontWeight={600}>
                  Task Block Information
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select which fields to display in task blocks
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 0 }}>
              <FormGroup>
                {localSettings.taskFields.map((field) => (
                  <FormControlLabel
                    key={field.key}
                    control={
                      <Checkbox
                        checked={field.enabled}
                        onChange={() => handleTaskFieldToggle(field.key)}
                      />
                    }
                    label={field.label}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GanttSettingsDialog;
