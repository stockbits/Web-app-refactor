App MUI Inventory

Theme ([src/theme.ts](src/theme.ts))
- MUI primitives: createTheme, ThemeOptions, CssBaseline styleOverrides.
- Custom work: Openreach brand tokens (`theme.openreach`), typography defaults, scrollbar styling.

Suspense Fallback ([src/App.tsx](src/App.tsx))
- MUI primitives: Stack, Typography; icons from icons-material.
- Custom work: Friendly loader copy and global lazy loading.

Landing Overview ([src/Openreach - App/App - Scaffold/App - Landing Overview.tsx](src/Openreach%20-%20App/App%20-%20Scaffold/App%20-%20Landing%20Overview.tsx))
- MUI primitives: Stack, Box, Typography, Paper, Chip, IconButton, Popover.
- Custom work: Access summary banner with info popover, responsive cards, chip cloud.

Top Banner ([src/Openreach - App/App - Scaffold/App - Top Banner.tsx](src/Openreach%20-%20App/App%20-%20Scaffold/App%20-%20Top%20Banner.tsx))
- MUI primitives: AppBar, Toolbar, Stack, IconButton, Avatar, Menu, MenuItem, Typography.
- Custom work: Gradient chrome, profile avatar menu, action slot.

Side Navigation ([src/Openreach - App/App - Scaffold/App - Side Nav.tsx](src/Openreach%20-%20App/App%20-%20Scaffold/App%20-%20Side%20Nav.tsx))
- MUI primitives: Drawer, Paper, Stack, List, ListItemButton, ListItemIcon, ListItemText, InputBase, IconButton, Tooltip, Chip, Divider, Typography.
- Custom work: Searchable tree with badges, client footer, brand theming.

Bread Crumb ([src/Openreach - App/App - Scaffold/App - Bread Crumb.tsx](src/Openreach%20-%20App/App%20-%20Scaffold/App%20-%20Bread%20Crumb.tsx))
- MUI primitives: Box, Typography.
- Custom work: Theme-aware separators and truncation for long paths.

Theme Toggle Button ([src/Openreach - App/App - Scaffold/ThemeToggleButton.tsx](src/Openreach%20-%20App/App%20-%20Scaffold/ThemeToggleButton.tsx))
- MUI primitives: IconButton.
- Custom work: Animated toggle with subtle scale/keyframes.

Shared Table Shell ([src/Openreach - App/App - Shared Components/MUI - Table/MUI Table - Table Shell.tsx](src/Openreach%20-%20App/App%20-%20Shared%20Components/MUI%20-%20Table/MUI%20Table%20-%20Table%20Shell.tsx))
- MUI primitives: Box, Stack, Typography, Switch, DataGrid, GridToolbarQuickFilter.
- Custom work: Density toggle, quick filter toolbar, autosize on mount, empty-state slot. Recent styling update removes light-mode sort icon halo, aligns sort icon color to brand, and suppresses ripple in header action areas.

Task Filter + Date Window ([src/Openreach - App/App - Shared Components/MUI - Table/MUI Table - Task Filter Component.tsx](src/Openreach%20-%20App/App%20-%20Shared%20Components/MUI%20-%20Table/MUI%20Table%20-%20Task%20Filter%20Component.tsx))
- MUI primitives: Paper, Stack, Box, TextField, Chip, Button, Divider, OutlinedInput, InputAdornment, IconButton, Popover, Autocomplete, Tabs; date adapters via LocalizationProvider and StaticDatePicker.
- Custom work: Draft query state with Apply/Clear flow, bulk-select inputs with select/clear logic, exact-match global search validation vs. Division/Domain/Status trio. Recent improvements: status labels show `CODE → friendly`, grid column ratio tuning, bulk action defaults to select when nothing chosen, date shortcuts anchored to system date, and trimmed submission.

Panel Structure - Live People ([src/Openreach - App/App - Shared Components/MUI - Panel Structure/App - Pannels/Live - People.tsx](src/Openreach%20-%20App/App%20-%20Shared%20Components/MUI%20-%20Panel%20Structure/App%20-%20Pannels/Live%20-%20People.tsx))
- MUI primitives: AppBar, Toolbar, Stack, Typography, Tooltip, IconButton, Box.
- Custom work: Fullscreen toggle and panel chrome.

Panel Structure - Live Task ([src/Openreach - App/App - Shared Components/MUI - Panel Structure/App - Pannels/Live - Task.tsx](src/Openreach%20-%20App/App%20-%20Shared%20Components/MUI%20-%20Panel%20Structure/App%20-%20Pannels/Live%20-%20Task.tsx))
- MUI primitives: AppBar, Toolbar, Stack, Typography, Tooltip, IconButton, Box.
- Custom work: Fullscreen toggle and panel chrome.

Panel Structure - Live Gantt ([src/Openreach - App/App - Shared Components/MUI - Panel Structure/App - Pannels/Live - Gantt.tsx](src/Openreach%20-%20App/App%20-%20Shared%20Components/MUI%20-%20Panel%20Structure/App%20-%20Pannels/Live%20-%20Gantt.tsx))
- MUI primitives: AppBar, Toolbar, Stack, Typography, Tooltip, IconButton, Box.
- Custom work: Fullscreen toggle and panel chrome.

Panel Structure - Live Map ([src/Openreach - App/App - Shared Components/MUI - Panel Structure/App - Pannels/Live - Map.tsx](src/Openreach%20-%20App/App%20-%20Shared%20Components/MUI%20-%20Panel%20Structure/App%20-%20Pannels/Live%20-%20Map.tsx))
- MUI primitives: AppBar, Toolbar, Stack, Typography, Tooltip, IconButton, Box, Chip, Menu, MenuItem, Button.
- Custom work: Base/terrain/satellite layer controls and panel chrome.

Page Container ([src/Openreach - App/App - Shared Components/Page Container/Page Container.tsx](src/Openreach%20-%20App/App%20-%20Shared%20Components/Page%20Container/Page%20Container.tsx))
- MUI primitives: Stack.
- Custom work: Responsive page spacing and max-width handling.

Section Wrapper ([src/Openreach - App/App - Shared Components/Page Container/Section Wrapper.tsx](src/Openreach%20-%20App/App%20-%20Shared%20Components/Page%20Container/Section%20Wrapper.tsx))
- MUI primitives: Paper, Stack, Typography.
- Custom work: Section chrome, title/subtitle layout, theme-aware paddings.

Task Management ([src/Openreach - App/App - Scaffold/App - Pages/Operations Management/Task Management.tsx](src/Openreach%20-%20App/App%20-%20Scaffold/App%20-%20Pages/Operations%20Management/Task%20Management.tsx))
- MUI primitives: Alert, Box, Chip, IconButton, Paper, Snackbar, Stack, Tooltip, Typography.
- Custom work: Integrates `SharedMuiTable` and `TaskTableQueryConfig`; priority/status chip palettes; copy-to-clipboard; arrow navigation; exact-match validation with memoised token set.

Other Pages (Domain/Resource/Schedule/System/User Admin)
- MUI primitives: Predominantly Box, Typography (placeholders).
- Custom work: To be populated as views mature.

Notes
- Where components use `sx`, we treat that as customization and document the intent (alignment, spacing, brand accents), not every rule.
- Icons from `@mui/icons-material` are considered primitives usage and listed when they drive interactions.