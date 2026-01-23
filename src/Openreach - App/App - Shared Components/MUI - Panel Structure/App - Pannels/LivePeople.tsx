import { Box, AppBar, Toolbar, useTheme, Tooltip, IconButton, Stack, Typography, Chip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { SharedMuiTable } from '../../MUI - Table';
import type { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { RESOURCE_TABLE_ROWS, type ResourceTableRow } from '../../../App - Data Tables/Resource - Table';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useResourceTableSelection } from '../../Selection - UI';

interface LivePeopleProps {
  onDock?: () => void;
  onUndock?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  isDocked?: boolean;
  isExpanded?: boolean;
  minimized?: boolean;
  selectedDivision?: string | null;
  selectedDomain?: string | null;
}

export default function LivePeople({ 
  onDock, 
  onUndock, 
  onExpand, 
  onCollapse, 
  isDocked, 
  isExpanded, 
  minimized,
  selectedDivision,
  selectedDomain
}: LivePeopleProps = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? theme.openreach.darkTableColors.headerBg : theme.openreach.tableColors.headerBg;
  const iconColor = theme.openreach.energyAccent;

  const tokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens;

  // Resize observer for table height
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(400);

  useEffect(() => {
    if (isExpanded) return;

    const element = tableContainerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        if (height > 50 && height < 10000) {
          setTableHeight(height);
        }
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) return;
    
    const element = tableContainerRef.current;
    if (element) {
      const { height } = element.getBoundingClientRect();
      if (height > 50 && height < 10000) {
        setTableHeight(height);
      }
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) return;

    const handleResize = () => {
      const element = tableContainerRef.current;
      if (element) {
        const { height } = element.getBoundingClientRect();
        if (height > 50 && height < 10000) {
          setTableHeight(height);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [isExpanded]);

  // Working status metadata
  const workingStatusMetadata = useMemo(() => ({
    'Signed on': { label: 'Signed on', color: tokens.success?.main || '#4CAF50' },
    'Signed on no work': { label: 'Signed on (No Work)', color: tokens.state?.warning || '#FF9800' },
    'Not Signed on': { label: 'Not Signed on', color: tokens.state?.error || '#F44336' },
    'Absent': { label: 'Absent', color: tokens.state?.error || '#F44336' },
    'Rostered off': { label: 'Rostered off', color: theme.palette.text.secondary }
  }), [tokens.success?.main, tokens.state?.warning, tokens.state?.error, theme.palette.text.secondary]);

  // Columns definition
  const columns: GridColDef<ResourceTableRow>[] = useMemo(() => [
    { 
      field: 'resourceId', 
      headerName: 'Resource ID', 
      flex: 0.8, 
      minWidth: 120, 
      align: 'left', 
      headerAlign: 'left', 
      renderCell: (params) => (
        <Typography variant="caption" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>
          {params.row.resourceId}
        </Typography>
      ) 
    },
    { 
      field: 'resourceName', 
      headerName: 'Resource Name', 
      flex: 1.2, 
      minWidth: 150, 
      align: 'left', 
      headerAlign: 'left', 
      renderCell: (params) => (
        <Typography variant="caption" fontWeight={600} noWrap>
          {params.row.resourceName}
        </Typography>
      ) 
    },
    { 
      field: 'workingStatus', 
      headerName: 'Working Status', 
      flex: 1.0, 
      minWidth: 150, 
      align: 'left', 
      headerAlign: 'left', 
      renderCell: (params) => {
        const status = workingStatusMetadata[params.row.workingStatus];
        return (
          <Typography variant="caption" sx={{ fontWeight: 600, color: status.color }} noWrap>
            {status.label}
          </Typography>
        );
      } 
    },
    { 
      field: 'division', 
      headerName: 'Division', 
      flex: 1.0, 
      minWidth: 140, 
      align: 'left', 
      headerAlign: 'left', 
      renderCell: (params) => (
        <Chip 
          label={params.row.division} 
          size="small" 
          variant="outlined" 
          sx={{ 
            borderColor: theme.palette.mode === 'dark' ? tokens.chip?.border : tokens.secondary?.main,
            color: theme.palette.mode === 'dark' ? tokens.chip?.text : tokens.secondary?.main,
            backgroundColor: theme.palette.mode === 'dark' ? tokens.chip?.bg : tokens.background?.alt,
            fontWeight: 500, 
            fontSize: '0.6875rem' 
          }} 
        />
      ) 
    },
    { 
      field: 'domainId', 
      headerName: 'Domain', 
      flex: 0.6, 
      minWidth: 90, 
      align: 'left', 
      headerAlign: 'left', 
      renderCell: (params) => (
        <Chip 
          label={params.row.domainId} 
          size="small" 
          variant="filled" 
          sx={{ 
            backgroundColor: theme.palette.mode === 'dark' ? tokens.chip?.bg : tokens.background?.alt,
            color: theme.palette.mode === 'dark' ? tokens.chip?.text : theme.palette.text.primary,
            fontWeight: 600, 
            fontSize: '0.6875rem',
            fontFamily: "'IBM Plex Mono', monospace"
          }} 
        />
      ) 
    },
    { 
      field: 'scheduleShift', 
      headerName: 'Shift', 
      flex: 0.8, 
      minWidth: 110, 
      align: 'left', 
      headerAlign: 'left', 
      renderCell: (params) => (
        <Typography variant="caption" fontWeight={500} noWrap>
          {params.row.scheduleShift}
        </Typography>
      ) 
    },
    { 
      field: 'startTime', 
      headerName: 'Start Time', 
      flex: 0.6, 
      minWidth: 90, 
      align: 'left', 
      headerAlign: 'left', 
      renderCell: (params) => (
        <Typography variant="caption" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>
          {params.row.startTime}
        </Typography>
      ) 
    },
    { 
      field: 'endTime', 
      headerName: 'End Time', 
      flex: 0.6, 
      minWidth: 90, 
      align: 'left', 
      headerAlign: 'left', 
      renderCell: (params) => (
        <Typography variant="caption" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>
          {params.row.endTime}
        </Typography>
      ) 
    },
    { 
      field: 'ecbt', 
      headerName: 'ECBT', 
      flex: 0.6, 
      minWidth: 90, 
      align: 'left', 
      headerAlign: 'left', 
      renderCell: (params) => (
        <Typography variant="caption" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>
          {params.row.ecbt}
        </Typography>
      ) 
    },
    { 
      field: 'workPreference', 
      headerName: 'Work Preference', 
      flex: 0.9, 
      minWidth: 130, 
      align: 'left', 
      headerAlign: 'left', 
      renderCell: (params) => {
        const preferenceLabels: Record<string, string> = {
          'X': '(X) Default',
          'B': '(B) Batches',
          'U': '(U) Underground'
        };
        return (
          <Typography variant="caption" fontWeight={500} noWrap>
            {preferenceLabels[params.row.workPreference]}
          </Typography>
        );
      } 
    },
  ], [workingStatusMetadata, tokens.chip?.border, tokens.chip?.bg, tokens.chip?.text, tokens.secondary?.main, tokens.background?.alt, theme.palette.mode]);

  // Track sort model state
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  
  // Use resource selection system
  const { 
    getPrioritizedResources, 
    isResourceSelected, 
    toggleResourceSelection, 
    clearResourceSelectionOnSort 
  } = useResourceTableSelection();

  // Filter resources based on selected division and domain
  const filteredRows = useMemo(() => {
    // Only show data when both division and domain are selected
    if (!selectedDivision || !selectedDomain) {
      return [];
    }
    
    let filtered = RESOURCE_TABLE_ROWS;
    
    // Filter by division
    filtered = filtered.filter(resource => resource.division === selectedDivision);
    
    // Filter by domain
    filtered = filtered.filter(resource => resource.domainId === selectedDomain);
    
    // Apply manual sorting if sortModel exists
    const sortedResources = [...filtered];
    if (sortModel && sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      sortedResources.sort((a, b) => {
        const aVal = a[field as keyof ResourceTableRow];
        const bVal = b[field as keyof ResourceTableRow];
        
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sort === 'asc' ? comparison : -comparison;
      });
    }
    
    return sortedResources;
  }, [selectedDivision, selectedDomain, sortModel]);

  // Apply prioritization from map selection
  const displayRows = useMemo(() => 
    getPrioritizedResources(filteredRows),
    [getPrioritizedResources, filteredRows]
  );

  // Handle sort requests
  const handleSortModelChange = useCallback((newModel: GridSortModel) => {
    setSortModel(newModel);
    clearResourceSelectionOnSort(); // Clear selection when sorting
  }, [clearResourceSelectionOnSort]);

  if (minimized) {
    return (
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PeopleIcon sx={{ fontSize: 20, color: iconColor }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Minimized content */}
        </Box>
      </Box>
    );
  }

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
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ pr: 2 }}>
            <Tooltip title={isDocked ? "Undock panel" : "Dock panel"}>
              <IconButton
                size="small"
                onClick={isDocked ? onUndock : onDock}
                sx={{
                  p: 0.25,
                  borderRadius: 1,
                  color: iconColor,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: iconColor,
                  },
                }}
                aria-label={isDocked ? "Undock panel" : "Dock panel"}
              >
                <PeopleIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            {!isExpanded && (
              <Tooltip title="Expand to full screen">
                <IconButton
                  size="small"
                  onClick={onExpand}
                  sx={{
                    p: 0.25,
                    borderRadius: 1,
                    color: iconColor,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: iconColor,
                    },
                  }}
                  aria-label="Expand to full screen"
                >
                  <OpenInFullIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
            {isExpanded && (
              <Tooltip title="Collapse to normal view">
                <IconButton
                  size="small"
                  onClick={onCollapse}
                  sx={{
                    p: 0.25,
                    borderRadius: 1,
                    color: iconColor,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: iconColor,
                    },
                  }}
                  aria-label="Collapse to normal view"
                >
                  <CloseFullscreenIcon sx={{ fontSize: 16 }} />
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
            rows={displayRows}
            getRowId={(row) => row.resourceId}
            density="compact"
            enablePagination={false}
            enableQuickFilter
            sortModel={sortModel}
            height={isExpanded ? '100%' : tableHeight}
            onSortModelChange={handleSortModelChange}
            onRowClick={(params, event) => {
              const resourceId = params.row.resourceId;
              const isCtrlPressed = event.ctrlKey || event.metaKey;
              toggleResourceSelection(resourceId, isCtrlPressed, 'table');
            }}
            getRowClassName={(params) => 
              isResourceSelected(params.row.resourceId) ? 'Mui-selected' : ''
            }
          />
        ) : (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2 }}>
            <PeopleIcon sx={{ fontSize: 48, color: iconColor, mb: 1 }} />
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary }}>
              Team Status
            </Typography>
            {(!selectedDivision || !selectedDomain) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Please select both Division and Domain to view resources
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
