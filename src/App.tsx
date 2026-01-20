import { Suspense, lazy, useMemo, useState, useEffect, useCallback } from "react";
import type { ElementType, JSX, LazyExoticComponent } from "react";
import "./App.css";
import {
  alpha,
  Box,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  Grid,
} from "@mui/material";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import BuildCircleRoundedIcon from "@mui/icons-material/BuildCircleRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { OpenreachSideNav } from "./Openreach - App/App - Scaffold/App - Side Nav";
import { OpenreachTopBanner } from "./Openreach - App/App - Scaffold/App - Top Banner";
import { LandingOverview } from "./Openreach - App/App - Scaffold/App - Landing Overview";
import { AppBreadCrumb } from "./Openreach - App/App - Scaffold/App - Bread Crumb";
import type { DockedPanel } from "./Openreach - App/App - Scaffold/App - Top Banner";
import { RecentTabsBar } from "./Openreach - App/App - Shared Components/MUI - More Info Component/App - Task Dock Bar";
import { useMinimizedTasks } from "./App - Central Theme/MinimizedTaskContext";
import { TaskIcon } from "./Openreach - App/App - Shared Components/MUI - Icon and Key/MUI - Icon";
import type { TaskCommitType } from "./Openreach - App/App - Data Tables/Task - Table";
import AppTaskDialog from "./Openreach - App/App - Shared Components/MUI - More Info Component/App - Task Dialog";
import type { TaskTableRow, TaskNote } from "./Openreach - App/App - Data Tables/Task - Table";
import { TASK_TABLE_ROWS } from "./Openreach - App/App - Data Tables/Task - Table";
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
  const [taskDockItems, setTaskDockItems] = useState<{
    id: string;
    title: string;
    commitType?: TaskCommitType;
    task?: TaskTableRow;
  }[]>([]);

  // Minimized tasks context
  const { minimizedTasks, removeMinimizedTask } = useMinimizedTasks();

  // Persist recent tasks dock in localStorage (id, title, commitType)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentTasksDock');
      if (saved) {
        const parsed = JSON.parse(saved) as {
          id: string;
          title: string;
          commitType?: TaskCommitType;
          task?: TaskTableRow;
        }[];
        if (Array.isArray(parsed)) {
          setTimeout(() => setTaskDockItems(parsed.slice(0, 5)), 0);
        }
      }
    } catch {
      // ignore load errors
    }
  }, []);

  useEffect(() => {
    try {
      // Save the full task object for each item (if present)
      const minimal = taskDockItems.map(({ id, title, commitType, task }) => ({ id, title, commitType, task }));
      localStorage.setItem('recentTasksDock', JSON.stringify(minimal));
    } catch {
      // ignore save errors
    }
  }, [taskDockItems]);

  const handleAddTaskDockItem = useCallback((item: { id: string; title: string; commitType?: TaskCommitType; task?: TaskTableRow }) => {
    setTaskDockItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      const nextItem = {
        id: item.id,
        title: item.title,
        commitType: item.commitType,
        task: item.task,
      };
      return [nextItem, ...prev].slice(0, 5);
    });
  }, []);

  const [menuInfoAnchor, setMenuInfoAnchor] = useState<HTMLElement | null>(null);
  const menuInfoOpen = Boolean(menuInfoAnchor);

  // Global task dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTask, setDialogTask] = useState<TaskTableRow | null>(null);

  // Global task dialog functions
  const openTaskDialog = useCallback((task: TaskTableRow) => {
    setDialogTask(task);
    setDialogOpen(true);
  }, []);

  const closeTaskDialog = useCallback((keepInDock = false) => {
    // If the dialog task is currently docked, remove it from dock when closing (unless keeping in dock)
    if (dialogTask && !keepInDock) {
      setTaskDockItems((prev) => prev.filter((item) => item.id !== dialogTask.taskId));
    }
    setDialogOpen(false);
    setDialogTask(null);
  }, [dialogTask]);

  const handleAddNote = useCallback(
    (type: 'field' | 'progress', text: string) => {
      if (!dialogTask) return;
      const nextNote: TaskNote = {
        id: `${type}-${Date.now()}`,
        author: 'You',
        createdAt: new Date().toISOString(),
        text,
      };
      setDialogTask((prev) => {
        if (!prev) return prev;
        const fieldNotes = type === 'field' ? [nextNote, ...(prev.fieldNotes ?? [])] : prev.fieldNotes;
        const progressNotes = type === 'progress' ? [nextNote, ...(prev.progressNotes ?? [])] : prev.progressNotes;
        return { ...prev, fieldNotes, progressNotes };
      });
      // Could add a snackbar message here if needed
    },
    [dialogTask],
  );

  const [landingInfoAnchor, setLandingInfoAnchor] = useState<HTMLElement | null>(null);
  const landingInfoOpen = Boolean(landingInfoAnchor);

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

      <Box 
        component="main"
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          bgcolor: 'background.default'
        }}
      >
        <Stack 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%' 
          }}
        >
          <Box component="header" sx={{ position: 'relative', zIndex: 1 }}>
            <OpenreachTopBanner
              title="Task Force"
              subtitle="Day-to-day operational tool for Openreach operations."
              userInitials="JD"
              userName="Jordan Davies"
              userRole="Delivery Lead"
              onMenuClick={openNav}
            />
          </Box>

          {/* Page-level header: Breadcrumb + Recent Tabs with consistent spacing */}
          <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            {/* Unified breadcrumb position and style for all pages */}
            {showWelcome ? (
              <AppBreadCrumb
                left="Access summary"
                accessSummary
                groupsCount={MENU_GROUPS.length}
                totalTools={TOTAL_TOOL_COUNT}
                rightAction={
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
                }
              />
            ) : !activePage ? (
              <>
                <RecentTabsBar
                items={taskDockItems.map((item) => {
                  const variant = (() => {
                    switch (item.commitType) {
                      case 'START BY':
                        return 'startBy' as const;
                      case 'COMPLETE BY':
                        return 'completeBy' as const;
                      case 'TAIL':
                        return 'failedSLA' as const;
                      default:
                        return 'appointment' as const;
                    }
                  })();
                  return { ...item, icon: <TaskIcon variant={variant} size={28} /> };
                })}
                minimizedTasks={minimizedTasks.map(task => ({ id: task.taskId, task }))}
                onClick={(id: string) => {
                  const item = taskDockItems.find((it) => it.id === id);
                  if (!item) return;
                  if (item.task) {
                    openTaskDialog(item.task);
                  } else {
                    const task = TASK_TABLE_ROWS.find((row) => row.taskId === id);
                    if (task) {
                      openTaskDialog(task);
                    }
                  }
                }}
                onDelete={(id: string) => setTaskDockItems((prev) => prev.filter((it) => it.id !== id))}
                onMinimizedTaskClick={openTaskDialog}
                onMinimizedTaskRemove={removeMinimizedTask}
                maxItems={5}
                clickable={true}
              />
              <AppBreadCrumb 
                left="MENU" 
                right={selectedMenu.label}
                rightAction={
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
              }
              />
            </>
          ) : (
            <>
              <RecentTabsBar
                items={taskDockItems.map((item) => {
                  const variant = (() => {
                    switch (item.commitType) {
                      case 'START BY':
                        return 'startBy' as const;
                      case 'COMPLETE BY':
                        return 'completeBy' as const;
                      case 'TAIL':
                        return 'failedSLA' as const;
                      default:
                        return 'appointment' as const;
                    }
                  })();
                  return { ...item, icon: <TaskIcon variant={variant} size={28} /> };
                })}
                minimizedTasks={minimizedTasks.map(task => ({ id: task.taskId, task }))}
                onClick={(id: string) => {
                  const item = taskDockItems.find((it) => it.id === id);
                  if (!item) return;
                  if (item.task) {
                    openTaskDialog(item.task);
                  } else {
                    const task = TASK_TABLE_ROWS.find((row) => row.taskId === id);
                    if (task) {
                      openTaskDialog(task);
                    }
                  }
                }}
                onDelete={(id: string) => setTaskDockItems((prev) => prev.filter((it) => it.id !== id))}
                onMinimizedTaskClick={openTaskDialog}
                onMinimizedTaskRemove={removeMinimizedTask}
                maxItems={5}
                clickable={true}
              />
              <AppBreadCrumb left={selectedMenu.label} right={activePage.cardName} leftClickable onLeftClick={() => setActivePage(null)} />
            </>
          )}
          </Box>

          <Box 
            component="section"
            aria-label="Main content area"
            sx={{ 
              flex: 1,
              minHeight: { xs: '240px', md: '320px' },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              ...(activePage && {
                minHeight: 0
              })
            }}
          >
            {showWelcome ? (
              <Box>
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
                  onToolClick={(groupId, toolName) => {
                    const group = MENU_GROUPS.find((g) => g.id === groupId);
                    if (group) {
                      setSelectedMenuId(groupId);
                      setActivePage({
                        menuLabel: group.label,
                        cardName: toolName,
                      });
                      setShowWelcome(false);
                    }
                  }}
                />
              </Box>
            ) : !activePage ? (
              <Box>
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
                <Stack spacing={4} sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, sm: 4 } }}>
                  {/* Category Header */}
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        flexShrink: 0,
                      }}
                    >
                      <selectedMenu.icon sx={{ fontSize: 26 }} />
                    </Box>
                    <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                        <Typography 
                          variant="h5" 
                          component="h1"
                          fontWeight={700} 
                          sx={{ 
                            color: 'text.primary',
                            fontSize: { xs: '1.5rem', sm: '1.75rem' },
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {selectedMenu.label}
                        </Typography>
                        {selectedMenu.accessLabel && (
                          <Chip 
                            label={selectedMenu.accessLabel} 
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              color: 'success.dark',
                              border: 'none',
                            }}
                          />
                        )}
                      </Stack>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.9375rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {selectedMenu.description}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Tool Cards Grid */}
                  <Grid container spacing={2}>
                    {selectedMenu.cards.map((card) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.name}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: '100%',
                            borderRadius: 2,
                            borderColor: 'divider',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '3px',
                              bgcolor: 'primary.main',
                              transform: 'scaleX(0)',
                              transformOrigin: 'left',
                              transition: 'transform 0.2s ease-in-out',
                            },
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                              transform: 'translateY(-2px)',
                              '&::before': {
                                transform: 'scaleX(1)',
                              },
                              '& .tool-arrow': {
                                opacity: 1,
                                transform: 'translateX(4px)',
                              },
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                            },
                          }}
                        >
                          <CardActionArea
                            onClick={() =>
                              setActivePage({
                                menuLabel: selectedMenu.label,
                                cardName: card.name,
                              })
                            }
                            sx={{ 
                              height: '100%',
                              p: 2.5,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              justifyContent: 'flex-start',
                            }}
                          >
                            <Stack spacing={1.5} sx={{ width: '100%' }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Typography 
                                  variant="subtitle1" 
                                  component="h2"
                                  fontWeight={600} 
                                  sx={{ 
                                    color: 'text.primary',
                                    fontSize: '1rem',
                                    lineHeight: 1.4,
                                    pr: 1,
                                    flex: 1,
                                  }}
                                >
                                  {card.name}
                                </Typography>
                                <ArrowForwardIcon 
                                  className="tool-arrow"
                                  sx={{ 
                                    fontSize: 18,
                                    color: 'primary.main',
                                    opacity: 0,
                                    transition: 'all 0.2s',
                                    flexShrink: 0,
                                  }} 
                                />
                              </Stack>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'text.secondary',
                                  lineHeight: 1.6,
                                  fontSize: '0.875rem',
                                }}
                              >
                                {card.description}
                              </Typography>
                            </Stack>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Box>
            ) : (
                <Box
                  component="section"
                  sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.default, overflow: 'hidden' }}
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
                              <ActivePageComponent {...({ dockedPanels, onDockedPanelsChange: setDockedPanels, openTaskDialog } as Record<string, unknown>)} />
                            </SelectionUIProvider>
                          ) : activePage?.cardName === 'Task Management' ? (
                            <SelectionUIProvider>
                              <ActivePageComponent {...({
                                openTaskDialog,
                              } as Record<string, unknown>)} />
                            </SelectionUIProvider>
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
          handleAddTaskDockItem({
            id: dialogTask.taskId,
            title: `Task ${dialogTask.taskId.split('-').pop() || dialogTask.taskId}`,
            commitType: dialogTask.commitType,
            task: dialogTask,
          });
          closeTaskDialog(true); // Keep task in dock when minimizing
        } : undefined}
      />
    </>
  );
}
