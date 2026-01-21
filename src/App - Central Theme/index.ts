import { createTheme } from "@mui/material/styles";
import type {} from '@mui/x-data-grid/themeAugmentation';
import { TASK_ICON_COLORS } from './Icon-Colors';

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
    default: "#fafafa",
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
    appointment: TASK_ICON_COLORS.appointment,
    startBy: TASK_ICON_COLORS.startBy,
    completeBy: TASK_ICON_COLORS.completeBy,
    failedSLA: TASK_ICON_COLORS.failedSLA,
    taskGroup: TASK_ICON_COLORS.taskGroup,
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
    appointment: TASK_ICON_COLORS.appointment,
    startBy: TASK_ICON_COLORS.startBy,
    completeBy: TASK_ICON_COLORS.completeBy,
    failedSLA: TASK_ICON_COLORS.failedSLA,
    taskGroup: TASK_ICON_COLORS.taskGroup,
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
  shape: {
    borderRadius: 2, // More square with slight rounding
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${brandColors.networkNavy} ${lightTokens.background.default}`,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: "0.8rem",
            height: "0.8rem",
          },
          "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
            backgroundColor: lightTokens.background.default,
            borderRadius: "999px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            backgroundColor: brandColors.networkNavy,
            borderRadius: "999px",
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
    // ============================================================
    // FORM INPUT CONSISTENCY
    // Standard: size="small", consistent height ~40px, borderRadius: 2
    // ============================================================
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: lightTokens.input.bg,
            borderRadius: 2,
            '& fieldset': {
              borderColor: lightTokens.input.border,
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: lightTokens.input.borderFocus,
            },
            '&.Mui-focused fieldset': {
              borderColor: lightTokens.input.borderFocus,
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: lightTokens.text.secondary,
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: lightTokens.input.borderFocus,
            },
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            marginLeft: 2,
            marginRight: 2,
            marginTop: 4,
          },
        },
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          backgroundColor: lightTokens.input.bg,
          borderRadius: 2,
          fontSize: '0.875rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: lightTokens.input.border,
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: lightTokens.input.borderFocus,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: lightTokens.input.borderFocus,
            borderWidth: '2px',
          },
        },
        input: {
          color: lightTokens.input.text,
          padding: '8.5px 14px', // Consistent padding for ~40px height
          fontSize: '0.875rem',
          lineHeight: 1.5,
          '&::placeholder': {
            color: lightTokens.input.placeholder,
            opacity: 1,
          },
        },
        // Ensure consistent height for all input sizes
        sizeSmall: {
          fontSize: '0.875rem',
          '& input': {
            padding: '8.5px 14px',
          },
        },
      },
    },
    MuiInputBase: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          color: lightTokens.input.text,
          fontSize: '0.875rem',
          borderRadius: 2,
        },
        input: {
          fontSize: '0.875rem',
          '&::placeholder': {
            color: lightTokens.input.placeholder,
            opacity: 1,
          },
        },
        sizeSmall: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiInputLabel: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          color: lightTokens.text.secondary,
          fontSize: '0.875rem',
          '&.Mui-focused': {
            color: lightTokens.input.borderFocus,
          },
        },
        sizeSmall: {
          fontSize: '0.875rem',
          transform: 'translate(14px, 9px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
          },
        },
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            borderRadius: 2,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          marginLeft: 2,
          marginRight: 2,
          marginTop: 4,
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
      styleOverrides: {
        select: {
          padding: '8.5px 14px',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          borderRadius: 2,
        },
        icon: {
          color: lightTokens.text.secondary,
        },
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        size: 'small',
        disableClearable: false,
        componentsProps: {
          popupIndicator: {
            disableRipple: true,
            disableTouchRipple: true,
            title: '', // Disable tooltip
          },
          clearIndicator: {
            disableRipple: true,
            disableTouchRipple: true,
            title: '', // Disable tooltip
          },
        },
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            padding: '4px 9px',
            '& input': {
              padding: '4.5px 5px',
            },
          },
        },
        input: {
          fontSize: '0.875rem',
        },
        inputRoot: {
          fontSize: '0.875rem',
          padding: '4px 9px !important',
          '&[class*="MuiOutlinedInput-root"]': {
            padding: '4px 9px',
          },
        },
        endAdornment: {
          position: 'absolute',
          right: 9,
          top: '50%',
          transform: 'translateY(-50%)',
        },
        popupIndicator: {
          color: lightTokens.text.secondary,
          padding: 2,
          marginRight: '-2px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
        clearIndicator: {
          color: lightTokens.text.secondary,
          padding: 2,
          marginRight: '-2px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
          border: `1px solid ${lightTokens.table.border}`,
        },
        columnHeader: {
          backgroundColor: lightTokens.table.headerBg,
          color: lightTokens.table.headerText,
          fontWeight: 600,
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          },
          '& .MuiDataGrid-sortIcon': {
            color: lightTokens.table.headerText,
            opacity: 0.6,
            '&:hover': {
              opacity: 1,
            },
          },
          '& .MuiDataGrid-iconButtonContainer': {
            '& .MuiIconButton-root': {
              color: lightTokens.table.headerText,
              backgroundColor: 'transparent !important',
              '&:hover': {
                backgroundColor: 'transparent !important',
                color: lightTokens.primary.main,
              },
              '& .MuiTouchRipple-root': {
                display: 'none',
              },
            },
          },
        },
        columnSeparator: {
          color: lightTokens.table.border,
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: lightTokens.primary.main,
          color: lightTokens.primary.text,
          '&:hover': {
            backgroundColor: lightTokens.primary.hover,
          },
          '&:active': {
            backgroundColor: lightTokens.primary.active,
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 2,
        },
        filled: {
          backgroundColor: lightTokens.chip.bg,
          color: lightTokens.chip.text,
          border: `1px solid ${lightTokens.chip.border}`,
          '&:hover': {
            backgroundColor: lightTokens.chip.hover.bg,
          },
        },
        outlined: {
          borderColor: lightTokens.chip.border,
          color: lightTokens.chip.text,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          '&:hover': {
            backgroundColor: `rgba(67, 176, 114, 0.08)`,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: lightTokens.background.overlay,
          color: lightTokens.text.inverse,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '6px 12px',
          borderRadius: 2,
        },
        arrow: {
          color: lightTokens.background.overlay,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: `1px solid ${lightTokens.border.soft}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 2,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: lightTokens.divider,
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
  shape: {
    borderRadius: 2, // More square with slight rounding
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `#4A5568 ${darkTokens.background.default}`,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: "0.8rem",
            height: "0.8rem",
          },
          "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
            backgroundColor: darkTokens.background.default,
            borderRadius: "999px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            backgroundColor: "#4A5568",
            borderRadius: "999px",
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
    // ============================================================
    // FORM INPUT CONSISTENCY
    // Standard: size="small", consistent height ~40px, borderRadius: 2
    // ============================================================
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: darkTokens.input.bg,
            color: darkTokens.input.text,
            borderRadius: 2,
            '& fieldset': {
              borderColor: darkTokens.input.border,
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: darkTokens.input.borderFocus,
            },
            '&.Mui-focused fieldset': {
              borderColor: darkTokens.input.borderFocus,
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: darkTokens.text.secondary,
            fontSize: '0.875rem',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: darkTokens.input.borderFocus,
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            marginLeft: 2,
            marginRight: 2,
            marginTop: 4,
          },
        },
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          backgroundColor: darkTokens.input.bg,
          color: darkTokens.input.text,
          borderRadius: 2,
          fontSize: '0.875rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: darkTokens.input.border,
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: darkTokens.input.borderFocus,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: darkTokens.input.borderFocus,
            borderWidth: '2px',
          },
        },
        input: {
          color: darkTokens.input.text,
          padding: '8.5px 14px', // Consistent padding for ~40px height
          fontSize: '0.875rem',
          lineHeight: 1.5,
          '&::placeholder': {
            color: darkTokens.input.placeholder,
            opacity: 1,
          },
        },
        sizeSmall: {
          fontSize: '0.875rem',
          '& input': {
            padding: '8.5px 14px',
          },
        },
      },
    },
    MuiInputBase: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          color: darkTokens.input.text,
          fontSize: '0.875rem',
          borderRadius: 2,
        },
        input: {
          fontSize: '0.875rem',
          '&::placeholder': {
            color: darkTokens.input.placeholder,
            opacity: 1,
          },
        },
        sizeSmall: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiInputLabel: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          color: darkTokens.text.secondary,
          fontSize: '0.875rem',
          '&.Mui-focused': {
            color: darkTokens.input.borderFocus,
          },
        },
        sizeSmall: {
          fontSize: '0.875rem',
          transform: 'translate(14px, 9px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
          },
        },
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            borderRadius: 2,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          marginLeft: 2,
          marginRight: 2,
          marginTop: 4,
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
      styleOverrides: {
        select: {
          padding: '8.5px 14px',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          borderRadius: 2,
        },
        icon: {
          color: darkTokens.text.secondary,
        },
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        size: 'small',
        disableClearable: false,
        componentsProps: {
          popupIndicator: {
            disableRipple: true,
            disableTouchRipple: true,
            title: '', // Disable tooltip
          },
          clearIndicator: {
            disableRipple: true,
            disableTouchRipple: true,
            title: '', // Disable tooltip
          },
        },
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            padding: '4px 9px',
            '& input': {
              padding: '4.5px 5px',
            },
          },
        },
        input: {
          fontSize: '0.875rem',
        },
        inputRoot: {
          fontSize: '0.875rem',
          padding: '4px 9px !important',
          '&[class*="MuiOutlinedInput-root"]': {
            padding: '4px 9px',
          },
        },
        endAdornment: {
          position: 'absolute',
          right: 9,
          top: '50%',
          transform: 'translateY(-50%)',
        },
        popupIndicator: {
          color: darkTokens.text.secondary,
          padding: 2,
          marginRight: '-2px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
        clearIndicator: {
          color: darkTokens.text.secondary,
          padding: 2,
          marginRight: '-2px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          },
          '& .MuiDataGrid-sortIcon': {
            color: darkTokens.table.headerText,
            opacity: 0.6,
            '&:hover': {
              opacity: 1,
            },
          },
          '& .MuiDataGrid-iconButtonContainer': {
            '& .MuiIconButton-root': {
              color: darkTokens.table.headerText,
              backgroundColor: 'transparent !important',
              '&:hover': {
                backgroundColor: 'transparent !important',
                color: darkTokens.primary.main,
              },
              '& .MuiTouchRipple-root': {
                display: 'none',
              },
            },
          },
        },
        columnSeparator: {
          color: darkTokens.table.border,
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: darkTokens.primary.main,
          color: darkTokens.primary.text,
          '&:hover': {
            backgroundColor: darkTokens.primary.hover,
          },
          '&:active': {
            backgroundColor: darkTokens.primary.active,
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 2,
        },
        filled: {
          backgroundColor: darkTokens.chip.bg,
          color: darkTokens.chip.text,
          border: `1px solid ${darkTokens.chip.border}`,
          '&:hover': {
            backgroundColor: darkTokens.chip.hover.bg,
          },
        },
        outlined: {
          borderColor: darkTokens.chip.border,
          color: darkTokens.chip.text,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          '&:hover': {
            backgroundColor: `rgba(82, 190, 132, 0.12)`,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: darkTokens.background.overlay,
          color: darkTokens.text.onPrimary,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '6px 12px',
          borderRadius: 2,
        },
        arrow: {
          color: darkTokens.background.overlay,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: `1px solid ${darkTokens.border.soft}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 2,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: darkTokens.divider,
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
