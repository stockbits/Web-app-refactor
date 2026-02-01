import { Suspense, useMemo, useState, useEffect, useCallback, lazy } from "react";
import type { ElementType, JSX, LazyExoticComponent } from "react";
import "./App.css";
import {
  alpha,
  Box,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  Popover,
  Skeleton,
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
import { OpenItemsDock } from "./Openreach - App/App - Shared Components/MUI - More Info Component/App - Open Items Dock";
import { useMinimizedTasks } from "./AppCentralTheme/MinimizedTaskContext";
import type { TaskCommitType } from "./Openreach - App/App - Data Tables/Task - Table";
import AppTaskDialog from "./Openreach - App/App - Shared Components/MUI - More Info Component/App - Task Dialog";
import { MultiTaskDialog } from "./Openreach - App/App - Shared Components/MUI - More Info Component/App - Multi Task Dialog";
import type { TaskTableRow, TaskNote } from "./Openreach - App/App - Data Tables/Task - Table";
import { TASK_TABLE_ROWS } from "./Openreach - App/App - Data Tables/Task - Table";
import { SelectionUIProvider } from "./Openreach - App/App - Shared Components/MUI - Table/Selection - UI";

interface MenuCardTile {
  name: string;
  description: string;
}

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

type PageComponent = () => JSX.Element;
type PageModule = { default: PageComponent };
type PageLoader = () => Promise<PageModule>;

const pageModules = import.meta.glob<PageModule>(
  "./Openreach - App/App - Scaffold/App - Pages/**/*.tsx"
) as Record<string, PageLoader>;

const PAGE_COMPONENTS = Object.entries(pageModules).reduce<
  Record<string, Record<string, PageLoader>>
>((acc, [path, loader]) => {
  const segments = path.split("/");
  const folderName = segments[segments.length - 2];
  const fileName = segments[segments.length - 1].replace(".tsx", "");
  if (!acc[folderName]) {
    acc[folderName] = {};
  }
  acc[folderName][fileName] = loader;
  return acc;
}, {});

// Cache for lazy components - created once per page loader
const lazyComponentCache = new Map<PageLoader, LazyExoticComponent<PageComponent>>();

function getLazyComponent(loader: PageLoader): LazyExoticComponent<PageComponent> {
  if (!lazyComponentCache.has(loader)) {
    lazyComponentCache.set(loader, lazy(() => loader()));
  }
  return lazyComponentCache.get(loader)!;
}

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
  }[]>(() => {
    // Initialize from localStorage only once on mount
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
          return parsed.slice(0, 5);
        }
      }
    } catch {
      // ignore load errors
    }
    return [];
  });

  // Minimized tasks context
  const { minimizedTasks, removeMinimizedTask } = useMinimizedTasks();

  // Persist to localStorage - debounced to avoid excessive writes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Only serialize essential data to reduce storage size
        const minimal = taskDockItems.map(({ id, title, commitType, task }) => ({ 
          id, 
          title, 
          commitType, 
          task 
        }));
        localStorage.setItem('recentTasksDock', JSON.stringify(minimal));
      } catch {
        // ignore save errors
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
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
      // Limit to max 20 items, remove oldest when adding new
      const updated = [nextItem, ...prev];
      return updated.slice(0, 20);
    });
  }, []);

  const handleClearAllDockItems = useCallback(() => {
    setTaskDockItems([]);
    // Also clear minimized tasks
    minimizedTasks.forEach(task => removeMinimizedTask(task.taskId));
  }, [minimizedTasks, removeMinimizedTask]);

  const handleDrawerClose = useCallback(() => {
    // When drawer closes, undock all non-minimized items
    // Minimized tasks are kept (they're in the minimizedTasks array)
    const minimizedTaskIds = new Set(minimizedTasks.map(t => t.taskId));
    setTaskDockItems((prev) => prev.filter(item => minimizedTaskIds.has(item.id)));
  }, [minimizedTasks]);

  const [menuInfoAnchor, setMenuInfoAnchor] = useState<HTMLElement | null>(null);
  const menuInfoOpen = Boolean(menuInfoAnchor);

  // Global task dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTask, setDialogTask] = useState<TaskTableRow | null>(null);

  // Multi-task dialog state
  const [multiDialogOpen, setMultiDialogOpen] = useState(false);
  const [multiDialogTasks, setMultiDialogTasks] = useState<TaskTableRow[]>([]);

  // Global task dialog functions
  const openTaskDialog = useCallback((task: TaskTableRow | TaskTableRow[]) => {
    if (Array.isArray(task)) {
      // Multi-task dialog
      setMultiDialogTasks(task.slice(0, 3));
      setMultiDialogOpen(true);
    } else {
      // Single task dialog
      setDialogTask(task);
      setDialogOpen(true);
    }
  }, []);

  const closeTaskDialog = useCallback((keepInDock = false) => {
    setDialogTask((currentTask) => {
      // Remove from dock if needed before closing
      if (currentTask && !keepInDock) {
        setTaskDockItems((prev) => prev.filter((item) => item.id !== currentTask.taskId));
      }
      return null;
    });
    setDialogOpen(false);
  }, []);

  const closeMultiTaskDialog = useCallback((keepInDock = false) => {
    if (!keepInDock) {
      // Remove all tasks from dock when closing without minimizing
      setTaskDockItems((prev) => {
        const taskIds = new Set(multiDialogTasks.map(t => t.taskId));
        return prev.filter((item) => !taskIds.has(item.id));
      });
    }
    setMultiDialogTasks([]);
    setMultiDialogOpen(false);
  }, [multiDialogTasks]);

  const handleAddNote = useCallback(
    (type: 'field' | 'progress', text: string) => {
      setDialogTask((prev) => {
        if (!prev) return prev;
        const nextNote: TaskNote = {
          id: `${type}-${Date.now()}`,
          author: 'You',
          createdAt: new Date().toISOString(),
          text,
        };
        const fieldNotes = type === 'field' ? [nextNote, ...(prev.fieldNotes ?? [])] : prev.fieldNotes;
        const progressNotes = type === 'progress' ? [nextNote, ...(prev.progressNotes ?? [])] : prev.progressNotes;
        return { ...prev, fieldNotes, progressNotes };
      });
    },
    [],
  );

  const [landingInfoAnchor, setLandingInfoAnchor] = useState<HTMLElement | null>(null);
  const landingInfoOpen = Boolean(landingInfoAnchor);

  const openNav = useCallback(() => setNavOpen(true), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

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

  const handleNavSelection = useCallback((itemId: string) => {
    // First, try to find if this is a direct group/menu ID
    const directGroup = MENU_GROUPS.find((group) => group.id === itemId);
    
    if (directGroup) {
      // It's a top-level menu group
      setSelectedMenuId(itemId);
      setShowWelcome(false);
      setActivePage((current) =>
        current && current.menuLabel === directGroup.label ? current : null
      );
    } else {
      // It might be a child card/tool - search for it in all groups
      for (const group of MENU_GROUPS) {
        const matchingCard = group.cards.find(
          (card) => card.name.toLowerCase().replace(/\s+/g, '-') === itemId
        );
        if (matchingCard) {
          // Found the tool - set both the parent menu and the active page
          setSelectedMenuId(group.id);
          setActivePage({
            menuLabel: group.label,
            cardName: matchingCard.name,
          });
          setShowWelcome(false);
          return;
        }
      }
      // If not found anywhere, treat as a group ID (fallback)
      setSelectedMenuId(itemId);
      setShowWelcome(false);
      setActivePage(null);
    }
  }, []);

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
              title="Taskforce"
              subtitle="Day-to-day operational tool for Openreach operations."
              userInitials="JD"
              userName="Jordan Davies"
              userRole="Delivery Lead"
              onMenuClick={openNav}
            />
          </Box>

          {/* Page-level header: Breadcrumb */}
          <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            {/* Unified breadcrumb position and style for all pages */}
            {showWelcome ? null : !activePage ? null : (
              <AppBreadCrumb left={selectedMenu.label} right={activePage.cardName} leftClickable onLeftClick={() => setActivePage(null)} />
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
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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
                  infoIconOpen={landingInfoOpen}
                  onInfoIconClick={(e) => setLandingInfoAnchor(landingInfoOpen ? null : e.currentTarget)}
                  infoIconId={landingInfoOpen ? 'landing-info-popover' : undefined}
                />
              </Box>
            ) : !activePage ? (
              <Box>
                <Popover
                  id="menu-info-popover"
                  open={menuInfoOpen}
                  anchorEl={menuInfoAnchor}
                  onClose={() => setMenuInfoAnchor(null)}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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
                        <Tooltip title="View help" placement="right">
                          <IconButton
                            aria-label="Info: select a tool card"
                            onClick={(e) => setMenuInfoAnchor(menuInfoOpen ? null : e.currentTarget)}
                            aria-describedby={menuInfoOpen ? 'menu-info-popover' : undefined}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                              },
                            }}
                          >
                            <InfoOutlinedIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                        {selectedMenu.accessLabel && (
                          <Chip 
                            label={selectedMenu.accessLabel} 

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
                  const pageLoader =
                    PAGE_COMPONENTS[activePage.menuLabel]?.[activePage.cardName];
                  if (!pageLoader) {
                    return (
                      <Typography color="text.secondary">
                        No page scaffold wired for {activePage.cardName}{' '}
                        yet.
                      </Typography>
                    );
                  }
                  
                  const LazyPageComponent = getLazyComponent(pageLoader);
                  
                  return (
                    <Suspense
                      fallback={
                        <Stack spacing={2} sx={{ p: 3 }}>
                          {/* Page header skeleton */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
                            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
                            <Box sx={{ flex: 1 }} />
                            <Skeleton variant="circular" width={40} height={40} />
                          </Stack>
                          
                          {/* Content area skeleton */}
                          <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
                          
                          <Stack spacing={1.5}>
                            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 1 }} />
                          </Stack>
                        </Stack>
                      }
                    >
                      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                        {activePage?.cardName === 'Schedule Live' ? (
                          <SelectionUIProvider>
                            <LazyPageComponent {...({ dockedPanels, onDockedPanelsChange: setDockedPanels, openTaskDialog, onAddToDock: handleAddTaskDockItem } as Record<string, unknown>)} />
                          </SelectionUIProvider>
                        ) : activePage?.cardName === 'Task Management' ? (
                          <SelectionUIProvider>
                            <LazyPageComponent {...({ openTaskDialog, onAddToDock: handleAddTaskDockItem } as Record<string, unknown>)} />
                          </SelectionUIProvider>
                        ) : (
                          <LazyPageComponent />
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

      {/* Open Items Dock */}
      {activePage && (
        <OpenItemsDock
          items={taskDockItems.map((item) => ({
            id: item.id,
            title: item.title,
            type: 'task' as const,
            subtitle: item.commitType,
            task: item.task,
          }))}
          minimizedTasks={minimizedTasks.map(task => ({ id: task.taskId, task }))}
          maxItems={20}
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
          onClearAll={handleClearAllDockItems}
          onMinimizedTaskClick={openTaskDialog}
          onMinimizedTaskRemove={removeMinimizedTask}
          onDrawerClose={handleDrawerClose}
        />
      )}

      {/* Global task dialog */}
      <AppTaskDialog
        open={dialogOpen}
        onClose={() => closeTaskDialog(false)} // Don't keep in dock when closing
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

      {/* Multi-task comparison dialog */}
      <MultiTaskDialog
        open={multiDialogOpen}
        onClose={() => closeMultiTaskDialog(false)} // Don't keep in dock when closing
        tasks={multiDialogTasks}
        onAddNote={(taskId: string, type: 'field' | 'progress', text: string) => {
          console.log('Add note:', type, text, 'to task:', taskId);
          // TODO: Implement note addition logic
        }}
        onMinimize={() => {
          multiDialogTasks.forEach(task => {
            handleAddTaskDockItem({
              id: task.taskId,
              title: `Task ${task.taskId.split('-').pop() || task.taskId}`,
              commitType: task.commitType,
              task,
            });
          });
          closeMultiTaskDialog(true); // Keep in dock when minimizing
        }}
      />
    </>
  );
}

export default App;
