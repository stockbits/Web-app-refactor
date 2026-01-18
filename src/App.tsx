import { Suspense, lazy, useMemo, useState, useCallback, startTransition } from "react";
import type { ElementType, JSX, LazyExoticComponent } from "react";
import "./App.css";
import {
  Box,
  CardActionArea,
  IconButton,
  Paper,
  Popover,
  Stack,
  Typography,
  Tooltip,
  useTheme,
  CircularProgress,
} from "@mui/material";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import BuildCircleRoundedIcon from "@mui/icons-material/BuildCircleRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { OpenreachSideNav } from "./Openreach - App/App - Scaffold/App - Side Nav";
import { OpenreachTopBanner } from "./Openreach - App/App - Scaffold/App - Top Banner";
import { LandingOverview } from "./Openreach - App/App - Scaffold/App - Landing Overview";
import { AppBreadCrumb } from "./Openreach - App/App - Scaffold/App - Bread Crumb";
import type { DockedPanel } from "./Openreach - App/App - Scaffold/App - Top Banner";
import { TaskDockBar } from "./Openreach - App/App - Shared Components/MUI - More Info Component/App - Task Dock Bar";
import AppTaskDialog from "./Openreach - App/App - Shared Components/MUI - More Info Component/App - Task Dialog";
import { MultiTaskDialog } from "./Openreach - App/App - Shared Components/MUI - More Info Component/App - Multi Task Dialog";
import type { TaskNote, TaskTableRow } from "./Openreach - App/App - Data Tables/Task - Table";
import { useMinimizedTasks } from "./App - Central Theme/MinimizedTaskContext";
import { SelectionUIProvider } from "./Openreach - App/App - Shared Components/Selection - UI";

interface MenuCardTile {
  name: string;
  description: string;
}

export default App;

interface MenuGroup {
  id: string;
  label: string;
  description: string;
  icon: ElementType;
  cards: MenuCardTile[];
  accessLabel: string;
}

const MENU_GROUPS: MenuGroup[] = [
  {
    id: "operation-toolkit",
    label: "Operation Toolkit",
    description: "Live scheduling and callout controls.",
    icon: BuildCircleRoundedIcon,
    accessLabel: "Full access",
    cards: [
      {
        name: "Schedule Live",
        description: "Monitor and adjust live schedules in real-time.",
      },
      {
        name: "Schedule Explorer",
        description: "Browse and analyse upcoming schedules and plans.",
      },
      {
        name: "Callout Overview",
        description: "Review all ongoing and past callout events.",
      },
    ],
  },
  {
    id: "operations-management",
    label: "Operations Management",
    description:
      "Coordinate resources and delivery tasks across every exchange.",
    icon: PeopleAltRoundedIcon,
    accessLabel: "Full access",
    cards: [
      {
        name: "Resource Management",
        description: "Manage all engineers, depots, and physical assets.",
      },
      {
        name: "Task Management",
        description: "Oversee and assign operational tasks efficiently.",
      },
    ],
  },
  {
    id: "general-settings",
    label: "General Settings",
    description: "Preferences, notifications, and API access.",
    icon: SettingsSuggestRoundedIcon,
    accessLabel: "Editor access",
    cards: [
      {
        name: "System Preferences",
        description: "Modify user-level settings, preferences, and themes.",
      },
      {
        name: "Notification Channels",
        description: "Configure alert destinations and channels.",
      },
      {
        name: "Theme Builder",
        description: "Adjust palettes and typography tokens.",
      },
      {
        name: "API Keys",
        description: "Manage access tokens and integrations securely.",
      },
    ],
  },
  {
    id: "task-admin",
    label: "Task Admin",
    description: "Core definitions that shape work routing.",
    icon: ChecklistRoundedIcon,
    accessLabel: "Editor access",
    cards: [
      {
        name: "Task Type",
        description: "Define and manage task categories and types.",
      },
      {
        name: "Task Routing",
        description: "Configure routing and escalation rules.",
      },
      {
        name: "Task Importance",
        description: "Set and manage task priority and importance levels.",
      },
    ],
  },
  {
    id: "jeopardy-admin",
    label: "Jeopardy Admin",
    description: "Alert templates, actions, and thresholds.",
    icon: WarningAmberRoundedIcon,
    accessLabel: "Editor access",
    cards: [
      {
        name: "Alert Definitions",
        description: "Define and manage all alert templates.",
      },
      {
        name: "Alert Action Definition",
        description: "Configure automated or manual alert responses.",
      },
      {
        name: "Alert Parameter Definition",
        description: "Set up variable parameters and alert thresholds.",
      },
      {
        name: "Alert Ranking",
        description: "Prioritise alerts by severity or impact.",
      },
      {
        name: "Alert Exclusion",
        description: "Manage exceptions and exclusion rules for alerts.",
      },
    ],
  },
  {
    id: "resource-admin",
    label: "Resource Admin",
    description: "Rota governance and overtime controls.",
    icon: AccountTreeRoundedIcon,
    accessLabel: "Full access",
    cards: [
      {
        name: "Rota Day Record",
        description: "Manage and track individual rota day records.",
      },
      {
        name: "Rota Week Record",
        description: "Oversee weekly rota summaries and status tracking.",
      },
      {
        name: "Rota Template Record",
        description: "Design and configure rota templates for scheduling.",
      },
      {
        name: "Closure User Group",
        description: "Administer closure groups for specific operations.",
      },
      {
        name: "Access Restriction",
        description: "Set user and role-based access limitations.",
      },
      {
        name: "Personal Overtime",
        description: "Monitor and manage personal overtime records.",
      },
      {
        name: "Business Overtime",
        description: "Control and review business-wide overtime data.",
      },
    ],
  },
  {
    id: "self-service-admin",
    label: "Self Service Admin",
    description: "Self-selection policy and scoring.",
    icon: HandshakeRoundedIcon,
    accessLabel: "Requester only",
    cards: [
      {
        name: "Self Selection Settings Admin",
        description: "Configure system-wide self-selection settings.",
      },
      {
        name: "Self Selection Task Rating Admin",
        description: "Manage task rating parameters.",
      },
      {
        name: "Self Selection Patch Admin",
        description: "Handle patch management for self-selection.",
      },
      {
        name: "Self Selection Work Type Admin",
        description: "Control available work types.",
      },
    ],
  },
  {
    id: "user-admin",
    label: "User Admin",
    description: "Identity, roles, and access.",
    icon: AdminPanelSettingsRoundedIcon,
    accessLabel: "Restricted",
    cards: [
      {
        name: "User Account",
        description: "Create and manage system user accounts and credentials.",
      },
      {
        name: "User ID",
        description: "View and assign unique user identification numbers.",
      },
      {
        name: "Unbar User",
        description: "Unblock or reinstate restricted user accounts.",
      },
      {
        name: "User Role Profile",
        description: "Define user roles and associated permissions.",
      },
      {
        name: "Supervisor Change Password",
        description: "Allow supervisors to reset/change passwords.",
      },
    ],
  },
  {
    id: "domain-admin",
    label: "Domain Admin",
    description: "Geography, assets, and workforce coverage.",
    icon: PublicRoundedIcon,
    accessLabel: "Full access",
    cards: [
      {
        name: "Domain Building",
        description: "Configure and structure operational domains.",
      },
      {
        name: "Post Areas",
        description: "Define post boundaries, checkpoints, and zones.",
      },
      {
        name: "Travel Areas",
        description: "Set travel regions and mobility zones.",
      },
      { name: "Asset", description: "Manage fixed and movable assets." },
      {
        name: "Workforce",
        description: "Assign and monitor domain workforce allocations.",
      },
      { name: "Division", description: "Oversee structural divisions." },
    ],
  },
  {
    id: "schedule-admin",
    label: "Schedule Admin",
    description: "Master schedule & SRM governance.",
    icon: CalendarMonthRoundedIcon,
    accessLabel: "Editor access",
    cards: [
      {
        name: "MSS Admin",
        description: "Manage and configure the Master Schedule System.",
      },
      {
        name: "SRM Admin",
        description: "Administer SRM modules & permissions.",
      },
      {
        name: "SRM Audit",
        description: "Audit SRM changes and scheduling history.",
      },
    ],
  },
  {
    id: "system-admin",
    label: "System Admin",
    description: "Algorithms, audits, and holiday tables.",
    icon: MemoryRoundedIcon,
    accessLabel: "Read only",
    cards: [
      {
        name: "Algorithm Parameters",
        description: "Configure algorithm behaviours & weights.",
      },
      {
        name: "System Code Editor",
        description: "Maintain scripts, triggers & automation.",
      },
      { name: "Record Audit", description: "Review detailed audit trails." },
      {
        name: "Public Holiday",
        description: "Manage holiday dates affecting schedules.",
      },
      {
        name: "General Travel Times",
        description: "Configure default travel time settings.",
      },
    ],
  },
];

const TOTAL_TOOL_COUNT = MENU_GROUPS.reduce(
  (total, group) => total + group.cards.length,
  0
);

type PageComponent = () => JSX.Element;
type PageModule = { default: PageComponent };
type PageModuleLoader = () => Promise<PageModule>;
type LazyPageComponent = LazyExoticComponent<PageComponent>;

const pageModules = import.meta.glob<PageModule>(
  "./Openreach - App/App - Scaffold/App - Pages/**/*.tsx"
) as Record<string, PageModuleLoader>;

const PAGE_COMPONENTS = Object.entries(pageModules).reduce<
  Record<string, Record<string, LazyPageComponent>>
>((acc, [path, loader]) => {
  const segments = path.split("/");
  const folderName = segments[segments.length - 2];
  const fileName = segments[segments.length - 1].replace(".tsx", "");
  if (!acc[folderName]) {
    acc[folderName] = {};
  }
  acc[folderName][fileName] = lazy(async () => {
    const module = await loader();
    return { default: module.default };
  });
  return acc;
}, {});

function App() {
  const theme = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(MENU_GROUPS[0].id);
  const [showWelcome, setShowWelcome] = useState(true);
  const [activePage, setActivePage] = useState<{
    menuLabel: string;
    cardName: string;
  } | null>(null);
  const [dockedPanels, setDockedPanels] = useState<DockedPanel[]>([]);

  // Global dialog state for minimized tasks
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTask, setDialogTask] = useState<TaskTableRow | null>(null);
  
  // Multi-task comparison state
  const [multiDialogOpen, setMultiDialogOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  
  const { minimizedTasks, addMinimizedTask, removeMinimizedTask } = useMinimizedTasks();

  // Open dialog for a task
  const openTaskDialog = (task: TaskTableRow) => {
    startTransition(() => {
      setDialogTask(task);
      setDialogOpen(true);
    });
  };
  // Close dialog and remove from minimized if present
  const closeTaskDialog = () => {
    if (dialogTask) removeMinimizedTask(dialogTask.taskId);
    setDialogOpen(false);
    setDialogTask(null);
  };

  // Multi-task comparison functions
  const openMultiTaskDialog = (taskIds: string[]) => {
    const tasks = minimizedTasks.filter(task => taskIds.includes(task.taskId));
    if (tasks.length > 1) {
      startTransition(() => {
        setSelectedTaskIds(taskIds);
        setMultiDialogOpen(true);
        setMultiSelectMode(false);
      });
    }
  };

  // Optimized click handlers for TaskDockBar
  const handleTaskDockClick = useCallback((id: string) => {
    if (multiSelectMode) {
      // In multi-select mode, clicking toggles selection
      const isSelected = selectedTaskIds.includes(id);
      const newSelected = isSelected
        ? selectedTaskIds.filter(taskId => taskId !== id)
        : [...selectedTaskIds, id];
      setSelectedTaskIds(newSelected);
    } else {
      // Normal mode: open single task dialog
      const task = minimizedTasks.find((t) => t.taskId === id);
      if (task) {
        openTaskDialog(task);
      }
    }
  }, [multiSelectMode, selectedTaskIds, minimizedTasks, openTaskDialog]);

  const handleTaskDockDelete = useCallback((id: string) => {
    removeMinimizedTask(id);
    // Also remove from selected if it was selected
    setSelectedTaskIds(prev => prev.filter(taskId => taskId !== id));
  }, [removeMinimizedTask]);

  const closeMultiTaskDialog = () => {
    setMultiDialogOpen(false);
    setSelectedTaskIds([]);
  };

  const handleMultiAddNote = useCallback(
    (taskId: string, type: 'field' | 'progress', text: string) => {
      // Handle adding notes to specific tasks in multi-view
      console.log(`Adding ${type} note to task ${taskId}:`, text);
      // You can implement the actual note adding logic here
    },
    []
  );

  const handleAddNote = useCallback(
    (type: 'field' | 'progress', text: string) => {
      if (!dialogTask) return;
      const nextNote: TaskNote = {
        id: `${type}-${Date.now()}`,
        author: 'You',
        createdAt: new Date().toISOString(),
        text,
      };
      setDialogTask((prev: TaskTableRow | null) => {
        if (!prev) return prev;
        const fieldNotes = type === 'field' ? [nextNote, ...(prev.fieldNotes ?? [])] : prev.fieldNotes;
        const progressNotes = type === 'progress' ? [nextNote, ...(prev.progressNotes ?? [])] : prev.progressNotes;
        return { ...prev, fieldNotes, progressNotes };
      });
    },
    [dialogTask],
  );

  const [landingInfoAnchor, setLandingInfoAnchor] = useState<HTMLElement | null>(null);
  const landingInfoOpen = Boolean(landingInfoAnchor);

  // Memoized task dock items
  const taskDockItems = useMemo(() => 
    minimizedTasks.map((task) => ({
      id: task.taskId,
      title: `${task.taskId.split('-').pop() || task.taskId}`,
      task,
    })), [minimizedTasks]
  )

  // Task dock content for breadcrumb
  const taskDockContent = useMemo(() => minimizedTasks.length > 0 ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={multiSelectMode ? "Exit comparison mode" : "Enter comparison mode"}>
        <IconButton
          size="small"
          onClick={() => {
            setMultiSelectMode(!multiSelectMode);
            setSelectedTaskIds([]);
          }}
          sx={{
            color: multiSelectMode ? 'primary.main' : 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          {multiSelectMode ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
        </IconButton>
      </Tooltip>
      <TaskDockBar
        items={taskDockItems}
        multiSelect={multiSelectMode}
        selectedItems={selectedTaskIds}
        maxItems={3}
        onSelectionChange={setSelectedTaskIds}
        onCompare={openMultiTaskDialog}
        onClick={handleTaskDockClick}
        onDelete={handleTaskDockDelete}
        clickable={true}
      />
    </Box>
  ) : null, [minimizedTasks.length, multiSelectMode, selectedTaskIds, setSelectedTaskIds, openMultiTaskDialog, handleTaskDockClick, handleTaskDockDelete, taskDockItems])

  // Add missing menu info anchor state for info popover
  const [menuInfoAnchor, setMenuInfoAnchor] = useState<HTMLElement | null>(null);
  const menuInfoOpen = Boolean(menuInfoAnchor);

  const openNav = () => setNavOpen(true);
  const closeNav = () => setNavOpen(false);

  const selectedMenu = useMemo(
    () =>
      MENU_GROUPS.find((group) => group.id === selectedMenuId) ??
      MENU_GROUPS[0],
    [selectedMenuId]
  );

  const navItems = useMemo(
    () =>
      MENU_GROUPS.map((group) => {
        const Icon = group.icon;
        return {
          id: group.id,
          label: group.label,
          icon: <Icon fontSize="small" />,
          description: group.description,
          active: group.id === selectedMenuId,
        };
      }),
    [selectedMenuId]
  );

  const handleNavSelection = (itemId: string) => {
    setSelectedMenuId(itemId);
    setShowWelcome(false);
    const nextGroup = MENU_GROUPS.find((group) => group.id === itemId);
    setActivePage((current) =>
      current && current.menuLabel === nextGroup?.label ? current : null
    );
  };

  return (
    <>
      <OpenreachSideNav
        open={navOpen}
        onClose={closeNav}
        onSearch={(value) => console.log("Search query:", value)}
        navItems={navItems}
        onSelect={(item) => handleNavSelection(item.id)}
      />

      <Box className="app-stage">
        <Stack className="app-stack" gap={0} width="100%">
          <Box className="app-hero">
            <OpenreachTopBanner
              title="Task Force"
              subtitle="Day-to-day operational tool for Openreach operations."
              userInitials="JD"
              userName="Jordan Davies"
              userRole="Delivery Lead"
              onMenuClick={openNav}
            />
          </Box>

          {/* Unified breadcrumb position and style for all pages */}
          {showWelcome ? (
            <AppBreadCrumb
              left="Access summary"
              accessSummary
              groupsCount={MENU_GROUPS.length}
              totalTools={TOTAL_TOOL_COUNT}
              rightContent={taskDockContent}
            />
          ) : !activePage ? (
            <AppBreadCrumb left="MENU" right={selectedMenu.label} rightContent={taskDockContent} />
          ) : (
            <AppBreadCrumb left={selectedMenu.label} right={activePage.cardName} leftClickable onLeftClick={() => setActivePage(null)} rightContent={taskDockContent} />
          )}

          {/* Task dock is now integrated into breadcrumb row above */}

          <Box 
            className={`app-canvas ${activePage ? 'app-canvas-page' : ''}`}
            sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pt: activePage ? { xs: 0, sm: 0, md: 0 } : undefined }}
          >
            {showWelcome ? (
              <Box>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mb: 2 }}>
                  <Tooltip title="Tap to view info" placement="left">
                    <IconButton
                      size="small"
                      aria-label="Info: landing page help"
                      onClick={(e) => setLandingInfoAnchor(landingInfoOpen ? null : e.currentTarget)}
                      aria-describedby={landingInfoOpen ? 'landing-info-popover' : undefined}
                    >
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Popover
                  id="landing-info-popover"
                  open={landingInfoOpen}
                  anchorEl={landingInfoAnchor}
                  onClose={() => setLandingInfoAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  disableRestoreFocus
                  slotProps={{
                    paper: {
                      sx: {
                        px: 2,
                        py: 1.5,
                        borderRadius: 0,
                        maxWidth: 320,
                      },
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tap the menu icon to open the navigation and move between tools.
                  </Typography>
                </Popover>
                <LandingOverview
                  groups={MENU_GROUPS}
                />
              </Box>
            ) : !activePage ? (
              <Box>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mb: 1 }}>
                  <Tooltip title="Tap to view info" placement="left">
                    <IconButton
                      size="small"
                      aria-label="Info: select a tool card"
                      onClick={(e) => setMenuInfoAnchor(menuInfoOpen ? null : e.currentTarget)}
                      aria-describedby={menuInfoOpen ? 'menu-info-popover' : undefined}
                    >
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Popover
                  id="menu-info-popover"
                  open={menuInfoOpen}
                  anchorEl={menuInfoAnchor}
                  onClose={() => setMenuInfoAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  disableRestoreFocus
                  slotProps={{
                    paper: {
                      sx: {
                        px: 2,
                        py: 1.5,
                        borderRadius: 0,
                        maxWidth: 320,
                      },
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Select a tool card to load its page.
                  </Typography>
                </Popover>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "repeat(1, minmax(0, 1fr))",
                      sm: "repeat(2, minmax(0, 1fr))",
                      md: "repeat(3, minmax(0, 1fr))",
                    },
                  }}
                >
                  {selectedMenu.cards.map((card) => {
                    const MenuIcon = selectedMenu.icon;
                    return (
                      <Paper
                        key={card.name}
                        elevation={0}
                        sx={{
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: "background.paper",
                          boxShadow: `0 12px 32px ${theme.palette.mode === 'dark' 
                            ? 'rgba(0,0,0,0.3)' 
                            : 'rgba(20,32,50,0.1)'}`,
                        }}
                      >
                        <CardActionArea
                          onClick={() =>
                            setActivePage({
                              menuLabel: selectedMenu.label,
                              cardName: card.name,
                            })
                          }
                          sx={{ p: 2 }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                display: "grid",
                                placeItems: "center",
                                color: theme.palette.primary.main,
                                flexShrink: 0,
                              }}
                            >
                              <MenuIcon fontSize="small" />
                            </Box>
                            <Box flexGrow={1} minWidth={0}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                {card.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {card.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardActionArea>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            ) : (
              <Box
                component="section"
                sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', overflow: 'hidden' }}
              >
                {(() => {
                  const ActivePageComponent =
                    PAGE_COMPONENTS[activePage.menuLabel]?.[
                      activePage.cardName
                    ];
                  if (!ActivePageComponent) {
                    return (
                      <Typography color="text.secondary">
                        No page scaffold wired for {activePage.cardName}{' '}
                        yet.
                      </Typography>
                    );
                  }
                  return (
                    <Suspense
                      fallback={
                        <Stack alignItems="center" py={6} spacing={2}>
                          <CircularProgress size={28} thickness={4} />
                          <Typography color="text.secondary" fontWeight={500}>
                            Loading...
                          </Typography>
                        </Stack>
                      }
                    >
                      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                        {activePage?.cardName === 'Schedule Live' ? (
                            <SelectionUIProvider>
                              <ActivePageComponent {...({ dockedPanels, onDockedPanelsChange: setDockedPanels } as Record<string, unknown>)} />
                            </SelectionUIProvider>
                          ) : activePage?.cardName === 'Task Management' ? (
                            <ActivePageComponent {...({
                              openTaskDialog,
                            } as Record<string, unknown>)} />
                          ) : (
                            <ActivePageComponent />
                          )}
                        </Box>
                      </Suspense>
                    );
                  })()}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Global task dialog */}
      <AppTaskDialog
        open={dialogOpen}
        onClose={closeTaskDialog}
        task={dialogTask ?? undefined}
        onAddNote={handleAddNote}
        onMinimize={dialogTask ? () => {
          addMinimizedTask(dialogTask);
          setDialogOpen(false);
        } : undefined}
      />

      {/* Multi-task comparison dialog */}
      <MultiTaskDialog
        open={multiDialogOpen}
        onClose={closeMultiTaskDialog}
        tasks={minimizedTasks.filter(task => selectedTaskIds.includes(task.taskId))}
        onAddNote={handleMultiAddNote}
        onMinimize={() => {
          // Optionally minimize the multi-dialog
          setMultiDialogOpen(false);
        }}
      />
    </>
  );
}
