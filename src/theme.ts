import { createTheme } from "@mui/material/styles";
import type {} from '@mui/x-data-grid/themeAugmentation';

// ============================================================
// CORE BRAND COLORS (shared across light + dark)
// ============================================================
const brandColors = {
  ultraWhite: "#FFFFFF",      // Ultra White
  networkNavy: "#142032",     // Network Navy (primary)
  goGreen: "#43B072",         // Go Green (success/accent)
  blazingBlue: "#5488C7",     // Blazing Blue (info/secondary)
  earthGrey: "#50535A",       // Earth Grey (text/neutral)
} as const;

// ============================================================
// CORE BRAND (shared across light + dark)
// ============================================================
const brand = {
  primary: brandColors.networkNavy,           // Main CTA navy
  secondary: brandColors.blazingBlue,         // Secondary accent blue
  success: brandColors.goGreen,               // Success green
  neutral: brandColors.earthGrey,             // Neutral grey text
  white: brandColors.ultraWhite,              // Ultra white
  ink: "#0F1820",                             // Deep navy for text
  background: "#F8F9FA",                      // Light off-white background
} as const;

// ============================================================
// LIGHT MODE TOKENS
// ============================================================
const lightTokens = {
  // Surfaces / Backgrounds
  background: {
    default: "#FAFBFC",      // Light off-white page background
    paper: "#FFFFFF",        // Cards / dialogs / panels (ultra white)
    alt: "#F3F4F7",          // Subtle section background
    overlay: "rgba(20,32,50,0.5)",   // Modal backdrop on light
  },
  // Text
  text: {
    primary: "#142032",      // Network Navy for strong contrast headings + body text
    secondary: "#50535A",    // Earth grey for secondary info
    inverse: "#FFFFFF",      // Text on primary buttons
    disabled: "#A8ABB2",     // Disabled + placeholder
  },
  // Borders / Dividers
  divider: "#D9DBDE",        // Light neutral dividers
  border: {
    soft: "#E8EAF0",         // Inputs/cards subtle border
    strong: "#142032",       // Navy outlined elements
  },
  // Primary Actions (Go Green) - Now using green as primary
  primary: {
    main: brandColors.goGreen,
    hover: "#38A264",        // Darker green on hover
    active: "#2E8A53",       // Darker green when active
    disabled: "#C8E6D1",     // Light disabled state
    text: "#FFFFFF",         // Ultra white text
  },
  // Secondary Actions (Network Navy) - Changed from Blue
  secondary: {
    main: brandColors.networkNavy,
    hover: "#0F1820",        // Darker navy on hover
    light: "rgba(20,32,50,0.12)",
    text: "#FFFFFF",         // Ultra white text
    outline: brandColors.goGreen,
    ghostBg: "rgba(67,176,114,0.1)",
  },
  // Success (Go Green)
  success: {
    main: brandColors.goGreen,
    hover: "#38A264",        // Darker green on hover
    light: "rgba(67,176,114,0.15)",
    text: "#FFFFFF",         // Ultra white text
  },
  // Chips / Filter Pills
  chip: {
    bg: "#F3F4F7",
    border: "#142032",
    text: "#142032",
    active: { bg: brandColors.goGreen, text: "#FFFFFF" },
    hover: { bg: "rgba(67,176,114,0.1)" },
  },
  // Forms / Inputs
  input: {
    bg: "#FFFFFF",
    border: "#D9DBDE",
    borderFocus: brandColors.goGreen,  // Use green for focus
    text: "#142032",
    placeholder: "#A8ABB2",
    disabled: { bg: "#F3F4F7", text: "#A8ABB2" },
  },
  // States
  state: {
    success: brandColors.goGreen,
    info: brandColors.blazingBlue,
    warning: "#D97706",      // Darker warning
    error: "#DC2626",        // Darker error
  },
  // Data Visualization
  map: {
    primary: brandColors.networkNavy,
    secondary: brandColors.goGreen,
    tertiary: brandColors.blazingBlue,
    inactive: "#C9CBCE",
  },
  // Task Status Colors
  taskStatus: {
    ACT: { color: brandColors.blazingBlue, bg: "rgba(84,136,199,0.15)" },
    AWI: { color: "#D97706", bg: "rgba(217,119,6,0.12)" },
    ISS: { color: "#DC2626", bg: "rgba(220,38,38,0.12)" },
    EXC: { color: "#7C3AED", bg: "rgba(124,58,237,0.12)" },
    COM: { color: brandColors.goGreen, bg: "rgba(67,176,114,0.15)" },
  },
} as const;

// ============================================================
// DARK MODE TOKENS (with white incorporated)
// ============================================================
const darkTokens = {
  // Surfaces / Backgrounds
  background: {
    default: "#0F1820",      // Deep navy background - dark mode
    paper: "#1A2536",        // Slightly lighter navy for cards/panels
    alt: "#252F40",          // Raised sections with more contrast
    overlay: "rgba(0,0,0,0.65)",  // Modal backdrop on dark
  },
  // Text
  text: {
    primary: "#F8FAFC",      // Off-white (not pure white) for less eye strain
    secondary: "#D9DDE4",    // Lighter grey for secondary info
    disabled: "#8C909A",     // Disabled text on dark
    onPrimary: "#FFFFFF",    // Text on navy buttons
  },
  // Borders / Dividers
  divider: "rgba(255,255,255,0.18)",
  border: {
    soft: "rgba(255,255,255,0.15)",
    strong: "rgba(255,255,255,0.25)",
  },
  // Primary Actions (Go Green on dark)
  primary: {
    main: "#52BE84",         // Brighter green for dark mode
    hover: "#66D896",        // Even brighter on hover
    active: "#43B072",       // Active state
    disabled: "rgba(255,255,255,0.12)",
    text: "#FFFFFF",         // Ultra white text
  },
  // Secondary Actions (Navy on dark) - Changed from Blue
  secondary: {
    main: "#1E3B52",         // Lighter navy variant for better visibility on dark
    hover: "#2A4A63",        // Hover state
    light: "rgba(30,59,82,0.2)",
    text: "#FFFFFF",         // Ultra white text
    outline: "rgba(255,255,255,0.35)",
    ghostBg: "rgba(82,190,132,0.18)",
  },
  // Success (Go Green on dark)
  success: {
    main: "#52BE84",         // Brighter green for dark mode
    hover: "#66D896",        // Even brighter on hover
    light: "rgba(82,190,132,0.2)",
    text: "#FFFFFF",         // Ultra white text
  },
  // Chips / Filter Pills
  chip: {
    bg: "rgba(255,255,255,0.12)",
    border: "rgba(255,255,255,0.3)",
    text: "#F8FAFC",
    active: { bg: "#52BE84", text: "#FFFFFF" },
    hover: { bg: "rgba(255,255,255,0.18)" },
  },
  // Forms / Inputs
  input: {
    bg: "rgba(255,255,255,0.1)",
    border: "rgba(255,255,255,0.18)",
    borderFocus: "#52BE84",  // Bright green focus
    text: "#F8FAFC",
    placeholder: "#8C909A",
    disabled: { bg: "rgba(255,255,255,0.08)", text: "#8C909A" },
  },
  // States
  state: {
    success: "#52BE84",
    info: "#6B99D8",
    warning: "#FBBF24",
    error: "#FB7185",
  },
  // Data Visualization
  map: {
    primary: "#52BE84",
    secondary: "#6B99D8",
    tertiary: "rgba(255,255,255,0.35)",
    inactive: "rgba(255,255,255,0.2)",
  },
  // Task Status Colors
  taskStatus: {
    ACT: { color: "#6B99D8", bg: "rgba(107,153,216,0.25)" },
    AWI: { color: "#FBBF24", bg: "rgba(251,191,36,0.2)" },
    ISS: { color: "#FB7185", bg: "rgba(251,113,133,0.2)" },
    EXC: { color: "#D8B4FE", bg: "rgba(216,180,254,0.2)" },
    COM: { color: "#52BE84", bg: "rgba(82,190,132,0.25)" },
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
  border: "#D9DBDE", // Changed from lightTokens.border.soft for more defined borders
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
  selectedRowBg: "rgba(20,32,49,0.25)",
  border: darkTokens.border.soft,
  columnSeparator: "#6FAE9A",
  columnSeparatorActive: "#6FAE9A",
};

const openreachBrand = {
  brand,
  brandColors,
  lightTokens,
  darkTokens,
  tableColors,
  darkTableColors,
  // Backward compatibility with old naming
  coreBlock: brand.primary,
  supportingBlock: brand.primary,  // Use green primary for consistency
  energyAccent: brand.success,
  fibreThreads: '#FFFFFF',  // Pure white for text on dark backgrounds
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
          scrollbarColor: `${brandColors.networkNavy} ${lightTokens.background.default}`,
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
            backgroundColor: brandColors.networkNavy,
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: lightTokens.input.bg,
            '& fieldset': {
              borderColor: lightTokens.input.border,
            },
            '&:hover fieldset': {
              borderColor: lightTokens.input.borderFocus,
            },
            '&.Mui-focused fieldset': {
              borderColor: lightTokens.input.borderFocus,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: lightTokens.input.bg,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: lightTokens.input.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: lightTokens.input.borderFocus,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: lightTokens.input.borderFocus,
          },
        },
        input: {
          color: lightTokens.input.text,
          '&::placeholder': {
            color: lightTokens.input.placeholder,
            opacity: 1,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: lightTokens.input.text,
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
          border: `1px solid ${tableColors.border}`,
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
            scrollbarColor: `#4A5568 ${darkTokens.background.default}`,
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
              backgroundColor: "#4A5568",
              border: `2px solid ${darkTokens.background.default}`,
              borderRadius: "999px",
              boxShadow: `inset 0 0 0 1px ${darkTokens.border.soft}`,
            },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#6B7C93",
            },
            "&::-webkit-scrollbar-corner": {
              backgroundColor: darkTokens.background.default,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: darkTokens.input.bg,
              color: darkTokens.input.text,
              '& fieldset': {
                borderColor: darkTokens.input.border,
              },
              '&:hover fieldset': {
                borderColor: darkTokens.input.borderFocus,
              },
              '&.Mui-focused fieldset': {
                borderColor: darkTokens.input.borderFocus,
              },
            },
            '& .MuiInputLabel-root': {
              color: darkTokens.text.secondary,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: darkTokens.input.borderFocus,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: darkTokens.input.bg,
            color: darkTokens.input.text,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: darkTokens.input.border,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: darkTokens.input.borderFocus,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: darkTokens.input.borderFocus,
            },
          },
          input: {
            color: darkTokens.input.text,
            '&::placeholder': {
              color: darkTokens.input.placeholder,
              opacity: 1,
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: darkTokens.input.text,
          },
          input: {
            '&::placeholder': {
              color: darkTokens.input.placeholder,
              opacity: 1,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: darkTokens.text.secondary,
            '&.Mui-focused': {
              color: darkTokens.input.borderFocus,
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
            border: `1px solid ${darkTableColors.border}`,
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
