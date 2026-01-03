import { createTheme } from "@mui/material/styles";
import type {} from '@mui/x-data-grid/themeAugmentation';

const blockGreen = "#073B4C";
const deepBlue = "#142032";
const fibreTeal = "#00CCAD";
const fibreWhite = "#F5F4F5";
const outline = "#ECECEC";
const typographyInk = "#202020";
const typographyMuted = "#63666A";

const openreachBrand = {
  coreBlock: blockGreen,
  supportingBlock: deepBlue,
  energyAccent: fibreTeal,
  fibreThreads: fibreWhite,
  outline,
  typographyInk,
  typographyMuted,
} as const;

declare module "@mui/material/styles" {
  interface OpenreachPalette {
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
    primary: {
      main: blockGreen,
    },
    secondary: {
      main: deepBlue,
    },
    background: {
      default: "#040b12",
      paper: fibreWhite,
    },
    text: {
      primary: typographyInk,
      secondary: typographyMuted,
    },
    divider: outline,
  },
  typography: {
    fontFamily:
      "'Inter','Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
    body1: {
      color: typographyInk,
    },
    body2: {
      color: typographyMuted,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${fibreTeal} ${deepBlue}`,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: "0.65rem",
            height: "0.65rem",
          },
          "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
            backgroundColor: deepBlue,
            borderRadius: "999px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            backgroundColor: fibreTeal,
            border: `2px solid ${deepBlue}`,
            borderRadius: "999px",
            boxShadow: `inset 0 0 0 1px ${outline}`,
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: blockGreen,
          },
          "&::-webkit-scrollbar-corner": {
            backgroundColor: deepBlue,
          },
        },
      },
    },
    MuiDataGrid: {      defaultProps: {
        autosizeOnMount: true,
      },      styleOverrides: {
        root: {
          borderRadius: 0,
          marginBottom: '8px',
        },
        columnHeader: {
          backgroundColor: openreachPalette.fibreThreads,
          color: openreachPalette.typographyInk,
          fontWeight: 600,
        },
      },
    },
  },
});
