import { createTheme } from "@mui/material/styles";
import type {} from '@mui/x-data-grid/themeAugmentation';

const blockGreen = "#073B4C";
const deepBlue = "#142032";
const fibreTeal = "#00CCAD";
const fibreWhite = "#F5F4F5";
const outline = "#ECECEC";
const typographyInk = "#202020";
const typographyMuted = "#63666A";


const tableColors = {
  headerBg: '#e3eaf2', // Light blue-grey for table header background (more visible separation)
  footerBg: '#e3eaf2', // Match footer background to header for main tables
  headerText: typographyInk, // Table header text
  rowBg: '#F8FAFB', // Table row background (alternating or default)
  rowText: typographyInk, // Table row text
  rowAltBg: '#F1F3F6', // Alternate row background for zebra striping
  selectedRowBg: '#E0F7FA', // Selected row background
  border: outline, // Table border color
};

const openreachBrand = {
  coreBlock: blockGreen,
  supportingBlock: deepBlue,
  energyAccent: fibreTeal,
  fibreThreads: fibreWhite,
  outline,
  typographyInk,
  typographyMuted,
  tableColors,
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
  }
  interface OpenreachPalette {
    coreBlock: string;
    supportingBlock: string;
    energyAccent: string;
    fibreThreads: string;
    outline: string;
    typographyInk: string;
    typographyMuted: string;
    tableColors: TableColors;
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
          backgroundColor: openreachPalette.tableColors.headerBg,
          color: openreachPalette.tableColors.headerText,
          fontWeight: 600,
        },
        footerContainer: {
          backgroundColor: openreachPalette.tableColors.footerBg,
        },
        row: {
          backgroundColor: openreachPalette.tableColors.rowBg,
          color: openreachPalette.tableColors.rowText,
        },
        // Add alternate row and selected row styling via sx or in DataGrid usage as needed
      },
    },
  },
});
