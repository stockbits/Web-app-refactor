
import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack, Typography } from "@mui/material";
import ChecklistIcon from "@mui/icons-material/Checklist";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";

import SharedMuiTable from '../../MUI - Table/MUI Table - Table Shell';
import type { GridColDef, GridCellParams } from '@mui/x-data-grid';
import { TASK_STATUS_LABELS, type TaskTableRow } from '../../../App - Data Tables/Task - Table';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import { Chip } from '@mui/material';
import { useGridApiRef } from '@mui/x-data-grid';
import CalloutCompodent from '../../MUI - Callout MGT/Callout - Compodent';
import { useCalloutMgt } from '../../../App - Scaffold/App - Pages/Operations Management/useCalloutMgt';
import { useTaskTableSelection } from '../../Selection - UI';

interface LiveTaskProps {
  onDock?: () => void;
  onUndock?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  isDocked?: boolean;
  isExpanded?: boolean;
  minimized?: boolean;
  filteredTasks?: TaskTableRow[];
  clearSorting?: number;
  openTaskDialog?: (task: TaskTableRow) => void;
}

export default function LiveTask({ onDock, onUndock, onExpand, onCollapse, isDocked, isExpanded, minimized, filteredTasks, clearSorting, openTaskDialog }: LiveTaskProps = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? theme.openreach.darkTableColors.headerBg : theme.openreach.tableColors.headerBg;
  const iconColor = theme.openreach.energyAccent;

  // --- Feature parity with Task Management ---
  const tokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens;

  const { callout, openCallout, closeCallout } = useCalloutMgt();

  // Selection UI integration - use prioritization when selected from map
  const { getPrioritizedTasks, toggleTaskSelection, selectionSource, selectedTaskIds } = useTaskTableSelection();

  // Resize observer for table height - handle mobile tab changes
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(400);

  useEffect(() => {
    const element = tableContainerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        // Only update height if it's a meaningful change (avoid 0 height)
        if (height > 50) {
          setTableHeight(height);
        }
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  // Force height recalculation when component mounts or becomes visible
  useEffect(() => {
    const element = tableContainerRef.current;
    if (element) {
      const { height } = element.getBoundingClientRect();
      if (height > 50) {
        setTableHeight(height);
      }
    }
  }, []);

  // Recalculate height when window resizes or when component becomes visible
  useEffect(() => {
    const handleResize = () => {
      const element = tableContainerRef.current;
      if (element) {
        const { height } = element.getBoundingClientRect();
        if (height > 50) {
          setTableHeight(height);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    // Also trigger on a short delay to handle tab changes
    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // --- Columns (copied from Task Management) ---
  const statusMetadata = useMemo(() => ({ ACT: { label: TASK_STATUS_LABELS.ACT }, AWI: { label: TASK_STATUS_LABELS.AWI }, ISS: { label: TASK_STATUS_LABELS.ISS }, EXC: { label: TASK_STATUS_LABELS.EXC }, COM: { label: TASK_STATUS_LABELS.COM } }), []);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }), []);
  const commitDateFormatter = useMemo(() => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), []);
  const commitTypeLabels = useMemo(() => ({ APPOINTMENT: 'Appointment', 'START BY': 'Start by', 'COMPLETE BY': 'Complete by', TAIL: 'Tail' }), []);
  const commitTypeColors = useMemo(() => ({ APPOINTMENT: tokens.mapTaskColors?.appointment, 'START BY': tokens.mapTaskColors?.startBy, 'COMPLETE BY': tokens.mapTaskColors?.completeBy, TAIL: tokens.mapTaskColors?.failedSLA }), [tokens.mapTaskColors]);
  const linkedTaskLabels = useMemo(() => ({ Y: 'Yes', N: 'No' }), []);
  const columns: GridColDef<TaskTableRow>[] = useMemo(() => [
    {
      field: 'actions', headerName: 'Actions', width: 90, minWidth: 80, sortable: false, filterable: false, align: 'center', headerAlign: 'center', disableColumnMenu: true, resizable: false, cellClassName: 'action-col', headerClassName: 'action-col',
      renderCell: (params) => (
        <IconButton
          disableRipple={true}
          onClick={(e) => {
            e.stopPropagation();
            openCallout(params.row.taskId);
          }}
          sx={{ p: 0.5 }}
        >
          <PhoneRoundedIcon sx={{ fontSize: 22 }} />
        </IconButton>
      ),
    },
    { field: 'taskId', headerName: 'Task ID', flex: 0.8, minWidth: 120, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>{params.row.taskId}</Typography>) },
    { field: 'workId', headerName: 'Work ID', flex: 0.8, minWidth: 120, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>{params.row.workId}</Typography>) },
    { field: 'status', headerName: 'Task Status', flex: 1.0, minWidth: 140, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.primary }} noWrap>{statusMetadata[params.row.status].label}</Typography>) },
    { field: 'commitDate', headerName: 'Commit Date', flex: 0.9, minWidth: 130, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" fontWeight={500} color="text.secondary">{commitDateFormatter.format(new Date(params.row.commitDate))}</Typography>) },
    { field: 'commitType', headerName: 'Commit Type', flex: 0.7, minWidth: 110, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" fontWeight={600} sx={{ color: commitTypeColors[params.row.commitType] }}>{commitTypeLabels[params.row.commitType] ?? params.row.commitType}</Typography>) },
    { field: 'resourceId', headerName: 'Resource ID', flex: 0.8, minWidth: 120, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>{params.row.resourceId}</Typography>) },
    { field: 'impactScore', headerName: 'Impact score', flex: 0.6, minWidth: 100, align: 'left', headerAlign: 'left', renderCell: (params) => { const score = params.row.impactScore; let color: string; if (score >= 500) { color = tokens.state?.error; } else if (score >= 300) { color = tokens.state?.warning; } else { color = tokens.success?.main; } return (<Typography variant="caption" fontWeight={600} color={color} noWrap>{params.row.impactScore}</Typography>); } },
    { field: 'resourceName', headerName: 'Resource name', flex: 1.0, minWidth: 130, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" color={params.row.resourceName ? 'text.primary' : 'text.secondary'} noWrap>{params.row.resourceName || '—'}</Typography>) },
    { field: 'domainId', headerName: 'Domain', flex: 0.7, minWidth: 100, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" fontWeight={600} noWrap>{params.row.domainId}</Typography>) },
    { field: 'responseCode', headerName: 'Response code', flex: 0.8, minWidth: 120, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" fontWeight={600} noWrap>{params.row.responseCode}</Typography>) },
    { field: 'primarySkill', headerName: 'Primary skill', flex: 0.7, minWidth: 110, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" fontWeight={600} noWrap>{params.row.primarySkill}</Typography>) },
    { field: 'capabilities', headerName: 'Capabilities', flex: 1.2, minWidth: 160, align: 'left', headerAlign: 'left', renderCell: (params) => (<Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center">{params.row.capabilities.length === 0 ? (<Typography variant="caption" color="text.secondary">—</Typography>) : (params.row.capabilities.map((capability) => (<Chip key={capability} label={capability} size="small" variant="outlined" sx={{ borderColor: tokens.state?.info, color: tokens.state?.info, backgroundColor: tokens.background?.alt, fontWeight: 500, fontSize: '0.6875rem' }} />)))}</Stack>) },
    { field: 'updatedAt', headerName: 'Last update (alt)', flex: 0.9, minWidth: 140, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" color="text.secondary" noWrap>{dateFormatter.format(new Date(params.row.updatedAt))}</Typography>) },
    { field: 'linkedTask', headerName: 'Linked task', flex: 0.6, minWidth: 100, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" fontWeight={500} color="text.secondary">{linkedTaskLabels[params.row.linkedTask] ?? params.row.linkedTask}</Typography>) },
    { field: 'postCode', headerName: 'Post code', flex: 0.6, minWidth: 90, align: 'left', headerAlign: 'left', renderCell: (params) => (<Typography variant="caption" fontWeight={600} noWrap>{params.row.postCode}</Typography>) },
  ], [statusMetadata, dateFormatter, commitDateFormatter, commitTypeLabels, commitTypeColors, linkedTaskLabels, tokens.success?.main, tokens.state?.error, tokens.state?.warning, tokens.state?.info, tokens.background?.alt, theme.palette.text, openCallout]);

  const filteredRows = useMemo(() => {
    // Use filteredTasks if provided, otherwise return empty array
    const baseTasks = filteredTasks || [];
    // Apply prioritization only when selected from map for visibility
    return getPrioritizedTasks(baseTasks);
  }, [filteredTasks, getPrioritizedTasks]);

  const apiRef = useGridApiRef();

  // Clear sorting when clearSorting prop changes
  useEffect(() => {
    if (clearSorting && clearSorting > 0 && apiRef.current) {
      apiRef.current.setSortModel([]);
    }
  }, [clearSorting, apiRef]);

  // Row styling for selected tasks - optimized to reduce re-renders
  const getRowClassName = useCallback((params: { id: string | number; row: TaskTableRow }) => {
    return selectedTaskIds.includes(params.row.taskId) ? 'selected-row' : '';
  }, [selectedTaskIds]);

  // Handle row clicks for task selection
  const handleRowClick = useCallback((params: GridCellParams<TaskTableRow>, event: React.MouseEvent) => {
    // Check if CTRL key is held for multi-selection
    const isCtrlPressed = event.ctrlKey || event.metaKey;
    toggleTaskSelection(params.row.taskId, isCtrlPressed);
  }, [toggleTaskSelection]);

  // TODO: Use globalSearch for filtering tasks


  if (minimized) {
    return (
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ChecklistIcon sx={{ fontSize: 20, color: iconColor }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Minimized content */}
        </Box>
      </Box>
    );
  }

  // --- Layout ---

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        border: isExpanded ? 'none' : `1px solid ${theme.palette.divider}`,
        boxSizing: "border-box",
        minHeight: 0,
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: headerBg,
          minHeight: 40,
          '& .MuiToolbar-root': {
            minHeight: 40,
            px: 1,
          }
        }}
      >
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          <Box />
          <Stack direction="row" spacing={0.5} sx={{ pr: 2 }}>
            <Tooltip title={isDocked ? "Undock panel" : "Dock panel"}>
              <IconButton
                size="small"
                onClick={isDocked ? onUndock : onDock}
                sx={{
                  p: 0.75,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: iconColor,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                  },
                }}
                aria-label={isDocked ? "Undock panel" : "Dock panel"}
              >
                <ChecklistIcon sx={{ fontSize: 20, color: iconColor }} />
              </IconButton>
            </Tooltip>
            {!isExpanded && (
              <Tooltip title="Expand to full screen">
                <IconButton
                  size="small"
                  onClick={onExpand}
                  sx={{
                    p: 0.75,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: iconColor,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                  aria-label="Expand to full screen"
                >
                  <OpenInFullIcon sx={{ fontSize: 20, color: iconColor }} />
                </IconButton>
              </Tooltip>
            )}
            {isExpanded && (
              <Tooltip title="Collapse to normal view">
                <IconButton
                  size="small"
                  onClick={onCollapse}
                  sx={{
                    p: 0.75,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: iconColor,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                  aria-label="Collapse to normal view"
                >
                  <CloseFullscreenIcon sx={{ fontSize: 20, color: iconColor }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, height: '100%', backgroundColor: theme.palette.background.paper, minHeight: 0 }} ref={tableContainerRef}>
        {filteredRows.length > 0 ? (
          <SharedMuiTable
            columns={columns}
            rows={filteredRows}
            getRowId={(row) => row.taskId}
            density="compact"
            enablePagination={false}
            enableQuickFilter
            disableSorting={selectionSource === 'map' && selectedTaskIds.length > 0}
            height={tableHeight}
            apiRef={apiRef}
            getRowClassName={getRowClassName}
            onCellClick={handleRowClick}
            onCellDoubleClick={(params) => {
              openTaskDialog?.(params.row);
            }}
          />
        ) : (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ChecklistIcon sx={{ fontSize: 48, color: iconColor, mb: 1 }} />
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary }}>
              Task Status
            </Typography>
          </Box>
        )}
      </Box>
      <CalloutCompodent open={callout.open} taskNumber={callout.taskNumber || ''} onClose={closeCallout} />
    </Box>
  );
}
