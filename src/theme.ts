import { createTheme } from "@mui/material/styles";
import type {} from '@mui/x-data-grid/themeAugmentation';

// ============================================================
// CORE BRAND (shared across light + dark)
// ============================================================
const brand = {
  primary: "#3A7F6B",        // CTA green (buttons, key highlights)
  secondary: "#7B6AA6",      // Accent purple (floating button / illustration)
  ink: "#14323C",            // Main text on light surfaces (soft navy ink)
  tealBase: "#1F3F4E",       // Deep teal structural background (menus/footers/sections)
} as const;

// ============================================================
// LIGHT MODE TOKENS
// ============================================================
const lightTokens = {
  // Surfaces / Backgrounds
  background: {
    default: "#F6F7F5",      // App page background (off-white)
    paper: "#FFFFFF",        // Cards / dialogs / panels
    alt: "#EEF2F1",          // Subtle section background
    overlay: "rgba(20,50,60,0.45)",  // Modal backdrop on light
  },
  // Text
  text: {
    primary: "#14323C",      // Headings + body
    secondary: "#6F8C97",    // Muted/supporting copy
    inverse: "#FFFFFF",      // Text on primary buttons
    disabled: "#9FB2B9",     // Disabled + placeholder
  },
  // Borders / Dividers
  divider: "#D9DBDE",        // Dividers on light
  border: {
    soft: "#D9DBDE",         // Inputs/cards subtle border
    strong: "#3A7F6B",       // Outlined cards/chips (green frame)
  },
  // Primary Actions (buttons/links)
  primary: {
    main: "#3A7F6B",
    hover: "#2F6E5D",
    active: "#285B4D",
    disabled: "#D1E2DC",
    text: "#FFFFFF",
  },
  // Secondary Actions
  secondary: {
    main: "#7B6AA6",
    hover: "#6B5B96",
    text: "#FFFFFF",
    outline: "#3A7F6B",      // Green-outlined chips/buttons
    ghostBg: "rgba(58,127,107,0.10)",
  },
  // Chips / Filter Pills
  chip: {
    bg: "#FFFFFF",
    border: "#3A7F6B",
    text: "#3A7F6B",
    active: { bg: "#3A7F6B", text: "#FFFFFF" },
    hover: { bg: "rgba(58,127,107,0.10)" },
  },
  // Forms / Inputs
  input: {
    bg: "#FFFFFF",
    border: "#D9DBDE",
    borderFocus: "#3A7F6B",
    text: "#14323C",
    placeholder: "#9FB2B9",
    disabled: { bg: "#EFEFEF", text: "#9FB2B9" },
  },
  // States
  state: {
    success: "#3A7F6B",
    info: "#4C7F91",
    warning: "#C7A24B",
    error: "#A44A4A",
  },
  // Map / Data Visualization
  map: {
    primary: "#3A7F6B",
    secondary: "#6FAE9A",
    tertiary: "#A8D2C3",
    inactive: "#D4D4D4",
  },
  // Task Status Colors
  taskStatus: {
    ACT: { color: "#006C9E", bg: "rgba(0,108,158,0.15)" },
    AWI: { color: "#6A5B8A", bg: "rgba(106,91,138,0.18)" },
    ISS: { color: "#B34700", bg: "rgba(179,71,0,0.15)" },
    EXC: { color: "#8B2F4E", bg: "rgba(139,47,78,0.15)" },
    COM: { color: "#1B5E20", bg: "rgba(27,94,32,0.12)" },
  },
} as const;

// ============================================================
// DARK MODE TOKENS
// ============================================================
const darkTokens = {
  // Surfaces / Backgrounds
  background: {
    default: "#1F3F4E",      // Main app background (deep teal)
    paper: "#173341",        // Cards/panels on dark (slightly deeper)
    alt: "#244B5B",          // Raised sections / subtle contrast
    overlay: "rgba(0,0,0,0.45)",  // Modal backdrop on dark
  },
  // Text
  text: {
    primary: "#FFFFFF",      // Main text on dark
    secondary: "#C7D6DB",    // Muted text on dark
    disabled: "#8FA6AC",     // Disabled on dark
    onPrimary: "#FFFFFF",    // Text on green buttons
  },
  // Borders / Dividers
  divider: "rgba(255,255,255,0.18)",
  border: {
    soft: "rgba(255,255,255,0.18)",
    strong: "#6FAE9A",       // Green-tint outlines on dark
  },
  // Primary Actions
  primary: {
    main: "#3A7F6B",
    hover: "#2F6E5D",
    active: "#285B4D",
    disabled: "rgba(58,127,107,0.35)",
    text: "#FFFFFF",
  },
  // Secondary Actions
  secondary: {
    main: "#7B6AA6",
    hover: "#6B5B96",
    text: "#FFFFFF",
    outline: "#6FAE9A",
    ghostBg: "rgba(111,174,154,0.18)",
  },
  // Chips / Filter Pills
  chip: {
    bg: "rgba(255,255,255,0.08)",
    border: "#6FAE9A",
    text: "#FFFFFF",
    active: { bg: "#3A7F6B", text: "#FFFFFF" },
    hover: { bg: "rgba(255,255,255,0.12)" },
  },
  // Forms / Inputs
  input: {
    bg: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.18)",
    borderFocus: "#6FAE9A",
    text: "#FFFFFF",
    placeholder: "#8FA6AC",
    disabled: { bg: "rgba(255,255,255,0.05)", text: "#8FA6AC" },
  },
  // States
  state: {
    success: "#6FAE9A",
    info: "#8BB8C7",
    warning: "#D6BF7A",
    error: "#C97A7A",
  },
  // Map / Data Visualization
  map: {
    primary: "#6FAE9A",
    secondary: "#A8D2C3",
    tertiary: "#D1E2DC",
    inactive: "rgba(255,255,255,0.22)",
  },
  // Task Status Colors (adjusted for dark mode)
  taskStatus: {
    ACT: { color: "#5B9BC4", bg: "rgba(91,155,196,0.18)" },
    AWI: { color: "#9B8DB3", bg: "rgba(155,141,179,0.18)" },
    ISS: { color: "#D4834F", bg: "rgba(212,131,79,0.18)" },
    EXC: { color: "#C17A9A", bg: "rgba(193,122,154,0.18)" },
    COM: { color: "#5DB167", bg: "rgba(93,177,103,0.18)" },
  },
} as const;

// ============================================================
// TABLE COLORS (Light Mode)
// ============================================================
const tableColors = {
  headerBg: lightTokens.background.alt,
  footerBg: lightTokens.background.paper,
  headerText: lightTokens.text.primary,
  rowBg: lightTokens.background.paper,
  rowText: lightTokens.text.primary,
  rowAltBg: lightTokens.background.alt,
  selectedRowBg: lightTokens.secondary.ghostBg,
  border: lightTokens.border.soft,
  columnSeparator: brand.primary,
  columnSeparatorActive: brand.primary,
};

// ============================================================
// TABLE COLORS (Dark Mode)
// ============================================================
const darkTableColors = {
  headerBg: darkTokens.background.alt,
  footerBg: darkTokens.background.paper,
  headerText: darkTokens.text.primary,
  rowBg: darkTokens.background.paper,
  rowText: darkTokens.text.primary,
  rowAltBg: darkTokens.background.alt,
  selectedRowBg: "rgba(58,127,107,0.25)",
  border: darkTokens.border.soft,
  columnSeparator: "#6FAE9A",
  columnSeparatorActive: "#6FAE9A",
};

const openreachBrand = {
  brand,
  lightTokens,
  darkTokens,
  tableColors,
  darkTableColors,
  // Backward compatibility with old naming
  coreBlock: brand.primary,
  supportingBlock: brand.tealBase,
  energyAccent: brand.primary,
  fibreThreads: lightTokens.background.paper,
  outline: lightTokens.border.soft,
  typographyInk: lightTokens.text.primary,
  typographyMuted: lightTokens.text.secondary,
} as const;

declare module "@mui/material/styles" {
  interface TableColors {
    headerBg: string;
    headerText: string;
    rowBg: string;
    rowText: string;
    rowAltBg: string;
    selectedRowBg: string;
    border: string;
    columnSeparator: string;
    columnSeparatorActive: string;
  }

  interface OpenreachTokens {
    background: Record<string, string>;
    text: Record<string, string>;
    divider: string;
    border: Record<string, string>;
    primary: Record<string, string>;
    secondary: Record<string, string>;
    chip: Record<string, Record<string, string> | string>;
    input: Record<string, Record<string, string> | string>;
    state: Record<string, string>;
    map: Record<string, string>;
  }

  interface OpenreachPalette {
    brand: typeof brand;
    lightTokens: typeof lightTokens;
    darkTokens: typeof darkTokens;
    tableColors: TableColors;
    darkTableColors: TableColors;
    // Backward compatibility
    coreBlock: string;
    supportingBlock: string;
    energyAccent: string;
    fibreThreads: string;
    outline: string;
    typographyInk: string;
    typographyMuted: string;
  }

  interface Theme {
    openreach: OpenreachPalette;
  }

  interface ThemeOptions {
    openreach?: Partial<OpenreachPalette>;
  }
}

export const openreachPalette = openreachBrand;

export const appTheme = createTheme({
  openreach: openreachBrand,
  palette: {
    mode: "light",
    primary: {
      main: lightTokens.primary.main,
      light: lightTokens.primary.hover,
      dark: lightTokens.primary.active,
      contrastText: lightTokens.primary.text,
    },
    secondary: {
      main: lightTokens.secondary.main,
      light: lightTokens.secondary.hover,
      contrastText: lightTokens.secondary.text,
    },
    background: {
      default: lightTokens.background.default,
      paper: lightTokens.background.paper,
    },
    text: {
      primary: lightTokens.text.primary,
      secondary: lightTokens.text.secondary,
      disabled: lightTokens.text.disabled,
    },
    divider: lightTokens.divider,
    success: {
      main: lightTokens.state.success,
    },
    info: {
      main: lightTokens.state.info,
    },
    warning: {
      main: lightTokens.state.warning,
    },
    error: {
      main: lightTokens.state.error,
    },
  },
  typography: {
    fontFamily:
      "'Inter','Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
    body1: {
      color: lightTokens.text.primary,
    },
    body2: {
      color: lightTokens.text.secondary,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${brand.primary} ${brand.tealBase}`,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: "0.65rem",
            height: "0.65rem",
          },
          "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
            backgroundColor: lightTokens.background.default,
            borderRadius: "999px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            backgroundColor: brand.primary,
            border: `2px solid ${lightTokens.background.default}`,
            borderRadius: "999px",
            boxShadow: `inset 0 0 0 1px ${lightTokens.border.soft}`,
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: lightTokens.primary.hover,
          },
          "&::-webkit-scrollbar-corner": {
            backgroundColor: lightTokens.background.default,
          },
        },
      },
    },
    MuiDataGrid: {
      defaultProps: {
        autosizeOnMount: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          marginBottom: '8px',
        },
        columnHeader: {
          backgroundColor: tableColors.headerBg,
          color: tableColors.headerText,
          fontWeight: 600,
        },
        footerContainer: {
          backgroundColor: tableColors.footerBg,
        },
        row: {
          backgroundColor: tableColors.rowBg,
          color: tableColors.rowText,
          borderBottom: `1px solid ${tableColors.border}`,
        },
      },
    },
  },
});

export const createDarkTheme = () => {
  return createTheme({
    openreach: openreachBrand,
    palette: {
      mode: "dark",
      primary: {
        main: darkTokens.primary.main,
        light: darkTokens.primary.hover,
        dark: darkTokens.primary.active,
        contrastText: darkTokens.primary.text,
      },
      secondary: {
        main: darkTokens.secondary.main,
        light: darkTokens.secondary.hover,
        contrastText: darkTokens.secondary.text,
      },
      background: {
        default: darkTokens.background.default,
        paper: darkTokens.background.paper,
      },
      text: {
        primary: darkTokens.text.primary,
        secondary: darkTokens.text.secondary,
        disabled: darkTokens.text.disabled,
      },
      divider: darkTokens.divider,
      success: {
        main: darkTokens.state.success,
      },
      info: {
        main: darkTokens.state.info,
      },
      warning: {
        main: darkTokens.state.warning,
      },
      error: {
        main: darkTokens.state.error,
      },
    },
    typography: {
      fontFamily:
        "'Inter','Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      body1: {
        color: darkTokens.text.primary,
      },
      body2: {
        color: darkTokens.text.secondary,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: `#6FAE9A ${brand.tealBase}`,
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              width: "0.65rem",
              height: "0.65rem",
            },
            "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
              backgroundColor: darkTokens.background.default,
              borderRadius: "999px",
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              backgroundColor: "#6FAE9A",
              border: `2px solid ${darkTokens.background.default}`,
              borderRadius: "999px",
              boxShadow: `inset 0 0 0 1px ${darkTokens.border.soft}`,
            },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
              backgroundColor: darkTokens.primary.hover,
            },
            "&::-webkit-scrollbar-corner": {
              backgroundColor: darkTokens.background.default,
            },
          },
        },
      },
      MuiDataGrid: {
        defaultProps: {
          autosizeOnMount: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 0,
            marginBottom: '8px',
          },
          columnHeader: {
            backgroundColor: darkTableColors.headerBg,
            color: darkTableColors.headerText,
            fontWeight: 600,
          },
          footerContainer: {
            backgroundColor: darkTableColors.footerBg,
          },
          row: {
            backgroundColor: darkTableColors.rowBg,
            color: darkTableColors.rowText,
            borderBottom: `1px solid ${darkTableColors.border}`,
          },
        },
      },
    },
  });
};
