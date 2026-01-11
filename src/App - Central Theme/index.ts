import { createTheme } from "@mui/material/styles";
import type {} from '@mui/x-data-grid/themeAugmentation';

/**
 * Central Theme Configuration
 * 
 * This file contains all theme definitions for the application:
 * - Brand colors and design tokens
 * - Light and dark mode configurations
 * - Component style overrides
 * - MUI theme customizations
 */

// ============================================================
// BRAND COLORS
// ============================================================
const brandColors = {
  ultraWhite: "#FFFFFF",
  networkNavy: "#142032",
  goGreen: "#43B072",
  blazingBlue: "#5488C7",
  earthGrey: "#50535A",
} as const;

// ============================================================
// LIGHT MODE DESIGN TOKENS
// ============================================================
const lightTokens = {
  background: {
    default: "#FAFBFC",
    paper: "#FFFFFF",
    alt: "#F3F4F7",
    overlay: "rgba(20,32,50,0.5)",
  },
  text: {
    primary: "#142032",
    secondary: "#50535A",
    inverse: "#FFFFFF",
    disabled: "#A8ABB2",
  },
  divider: "#D9DBDE",
  border: {
    soft: "#E8EAF0",
    strong: "#142032",
  },
  primary: {
    main: brandColors.goGreen,
    hover: "#38A264",
    active: "#2E8A53",
    disabled: "#C8E6D1",
    text: "#FFFFFF",
  },
  secondary: {
    main: brandColors.networkNavy,
    hover: "#0F1820",
    light: "rgba(20,32,50,0.12)",
    text: "#FFFFFF",
    outline: brandColors.goGreen,
    ghostBg: "rgba(67,176,114,0.1)",
  },
  success: {
    main: brandColors.goGreen,
    hover: "#38A264",
    light: "rgba(67,176,114,0.15)",
    text: "#FFFFFF",
  },
  chip: {
    bg: "#F3F4F7",
    border: "#142032",
    text: "#142032",
    active: { bg: brandColors.goGreen, text: "#FFFFFF" },
    hover: { bg: "rgba(67,176,114,0.1)" },
  },
  input: {
    bg: "#FFFFFF",
    border: "#D9DBDE",
    borderFocus: brandColors.goGreen,
    text: "#142032",
    placeholder: "#A8ABB2",
    disabled: { bg: "#F3F4F7", text: "#A8ABB2" },
  },
  state: {
    success: brandColors.goGreen,
    info: brandColors.blazingBlue,
    warning: "#D97706",
    error: "#DC2626",
  },
  map: {
    primary: brandColors.networkNavy,
    secondary: brandColors.goGreen,
    tertiary: brandColors.blazingBlue,
    inactive: "#C9CBCE",
  },
  mapTaskColors: {
    appointment: "#D97706",
    startBy: "#43B072",
    completeBy: "#5488C7",
    failedSLA: "#50535A",
  },
  table: {
    headerBg: "#F3F4F7",
    footerBg: "#FFFFFF",
    headerText: "#142032",
    rowBg: "#FFFFFF",
    rowText: "#142032",
    rowAltBg: "#F3F4F7",
    selectedRowBg: "rgba(67,176,114,0.1)",
    border: "#D9DBDE",
  },
} as const;

// ============================================================
// DARK MODE DESIGN TOKENS
// ============================================================
const darkTokens = {
  background: {
    default: "#0F1820",
    paper: "#1A2536",
    alt: "#252F40",
    overlay: "rgba(0,0,0,0.65)",
  },
  text: {
    primary: "#F8FAFC",
    secondary: "#D9DDE4",
    disabled: "#8C909A",
    onPrimary: "#FFFFFF",
  },
  divider: "rgba(255,255,255,0.18)",
  border: {
    soft: "rgba(255,255,255,0.15)",
    strong: "rgba(255,255,255,0.25)",
  },
  primary: {
    main: "#52BE84",
    hover: "#66D896",
    active: "#43B072",
    disabled: "rgba(255,255,255,0.12)",
    text: "#FFFFFF",
  },
  secondary: {
    main: "#1E3B52",
    hover: "#2A4A63",
    light: "rgba(30,59,82,0.2)",
    text: "#FFFFFF",
    outline: "rgba(255,255,255,0.35)",
    ghostBg: "rgba(82,190,132,0.18)",
  },
  success: {
    main: "#52BE84",
    hover: "#66D896",
    light: "rgba(82,190,132,0.2)",
    text: "#FFFFFF",
  },
  chip: {
    bg: "rgba(255,255,255,0.12)",
    border: "rgba(255,255,255,0.3)",
    text: "#F8FAFC",
    active: { bg: "#52BE84", text: "#FFFFFF" },
    hover: { bg: "rgba(255,255,255,0.18)" },
  },
  input: {
    bg: "rgba(255,255,255,0.1)",
    border: "rgba(255,255,255,0.18)",
    borderFocus: "#52BE84",
    text: "#F8FAFC",
    placeholder: "#8C909A",
    disabled: { bg: "rgba(255,255,255,0.08)", text: "#8C909A" },
  },
  state: {
    success: "#52BE84",
    info: "#6B99D8",
    warning: "#FBBF24",
    error: "#FB7185",
  },
  map: {
    primary: "#52BE84",
    secondary: "#6B99D8",
    tertiary: "rgba(255,255,255,0.35)",
    inactive: "rgba(255,255,255,0.2)",
  },
  mapTaskColors: {
    appointment: "#FBBF24",
    startBy: "#52BE84",
    completeBy: "#6B99D8",
    failedSLA: "#50535A",
  },
  table: {
    headerBg: "#252F40",
    footerBg: "#1A2536",
    headerText: "#F8FAFC",
    rowBg: "#1A2536",
    rowText: "#F8FAFC",
    rowAltBg: "#252F40",
    selectedRowBg: "rgba(20,32,49,0.25)",
    border: "rgba(255,255,255,0.15)",
  },
} as const;

// ============================================================
// TYPE DEFINITIONS
// ============================================================
declare module "@mui/material/styles" {
  interface OpenreachPalette {
    brandColors: typeof brandColors;
    lightTokens: typeof lightTokens;
    darkTokens: typeof darkTokens;
    // Backward compatibility properties
    brand: {
      primary: string;
      secondary: string;
      success: string;
      neutral: string;
      white: string;
      ink: string;
      background: string;
    };
    energyAccent: string;
    fibreThreads: string;
    supportingBlock: string;
    coreBlock: string;
    tableColors: typeof lightTokens.table;
    darkTableColors: typeof darkTokens.table;
  }

  interface Theme {
    openreach: OpenreachPalette;
  }

  interface ThemeOptions {
    openreach?: OpenreachPalette;
  }
}

// ============================================================
// LIGHT THEME
// ============================================================
export const lightTheme = createTheme({
  openreach: {
    brandColors,
    lightTokens,
    darkTokens,
    // Backward compatibility properties
    brand: {
      primary: brandColors.networkNavy,
      secondary: brandColors.blazingBlue,
      success: brandColors.goGreen,
      neutral: brandColors.earthGrey,
      white: brandColors.ultraWhite,
      ink: "#0F1820",
      background: "#F8F9FA",
    },
    energyAccent: brandColors.goGreen,
    fibreThreads: brandColors.ultraWhite,
    supportingBlock: brandColors.networkNavy,
    coreBlock: brandColors.networkNavy,
    tableColors: lightTokens.table,
    darkTableColors: darkTokens.table,
  },
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
    fontFamily: "'Inter','Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
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
          border: `1px solid ${lightTokens.table.border}`,
        },
        columnHeader: {
          backgroundColor: lightTokens.table.headerBg,
          color: lightTokens.table.headerText,
          fontWeight: 600,
        },
        footerContainer: {
          backgroundColor: lightTokens.table.footerBg,
        },
        row: {
          backgroundColor: lightTokens.table.rowBg,
          color: lightTokens.table.rowText,
          borderBottom: `1px solid ${lightTokens.table.border}`,
        },
      },
    },
  },
});

// ============================================================
// DARK THEME
// ============================================================
export const darkTheme = createTheme({
  openreach: {
    brandColors,
    lightTokens,
    darkTokens,
    // Backward compatibility properties
    brand: {
      primary: brandColors.networkNavy,
      secondary: brandColors.blazingBlue,
      success: brandColors.goGreen,
      neutral: brandColors.earthGrey,
      white: brandColors.ultraWhite,
      ink: "#0F1820",
      background: "#F8F9FA",
    },
    energyAccent: darkTokens.primary.main,
    fibreThreads: brandColors.ultraWhite,
    supportingBlock: darkTokens.secondary.main,
    coreBlock: brandColors.networkNavy,
    tableColors: lightTokens.table,
    darkTableColors: darkTokens.table,
  },
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
    fontFamily: "'Inter','Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
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
          border: `1px solid ${darkTokens.table.border}`,
        },
        columnHeader: {
          backgroundColor: darkTokens.table.headerBg,
          color: darkTokens.table.headerText,
          fontWeight: 600,
        },
        footerContainer: {
          backgroundColor: darkTokens.table.footerBg,
        },
        row: {
          backgroundColor: darkTokens.table.rowBg,
          color: darkTokens.table.rowText,
          borderBottom: `1px solid ${darkTokens.table.border}`,
        },
      },
    },
  },
});

// ============================================================
// EXPORTS (Backward Compatibility)
// ============================================================
export const appTheme = lightTheme;
export const createDarkTheme = () => darkTheme;

// Export design tokens for direct access if needed
export { brandColors, lightTokens, darkTokens };
