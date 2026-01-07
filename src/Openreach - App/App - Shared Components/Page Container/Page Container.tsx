import type { SxProps, Theme } from "@mui/material";
import { Stack, useTheme } from "@mui/material";
import type { ReactNode } from "react";

/**
 * PageContainer Component
 *
 * A standardized, reusable wrapper for page content that provides:
 * - Consistent responsive padding across all pages
 * - Maximum width constraint for optimal readability
 * - Theme-aware background colors (light/dark mode)
 * - Proper spacing between sections using MUI spacing scale
 * - Full MUI sx props support for customization
 *
 * @example
 * <PageContainer title="Dashboard" maxWidth="lg" spacing={3}>
 *   <Typography>Page content goes here...</Typography>
 * </PageContainer>
 */

export interface PageContainerProps {
  /**
   * Main content to render inside the container
   */
  children: ReactNode;

  /**
   * Optional page title (renders as h5 Typography)
   */
  title?: string;

  /**
   * Maximum width breakpoint: 'sm' (600px), 'md' (900px), 'lg' (1200px), 'xl' (1536px)
   * Set to false to remove max-width constraint
   * @default 'lg'
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;

  /**
   * Vertical spacing between major sections (MUI spacing units)
   * Typically 2-4 for comfortable section separation
   * @default 3
   */
  spacing?: number;

  /**
   * Horizontal gap between Stack items (MUI spacing units)
   * @default 2
   */
  gap?: number;

  /**
   * Horizontal padding applied to left/right
   * Uses responsive breakpoints by default
   * @default { xs: 1, sm: 1.5, md: 2 }
   */
  paddingX?: SxProps<Theme>["px"];

  /**
   * Vertical padding applied to top/bottom
   * @default 2
   */
  paddingY?: SxProps<Theme>["py"];

  /**
   * Additional custom MUI sx props (overrides defaults)
   */
  sx?: SxProps<Theme>;

  /**
   * Component to render as the container (default: Stack)
   * Can be changed to Box, Paper, etc. for different semantics
   * @default 'section'
   */
  component?: React.ElementType;

  /**
   * Enable background color from theme
   * @default true
   */
  withBackground?: boolean;

  /**
   * Should this container be scrollable? (useful for tall pages)
   * @default 'auto'
   */
  overflow?: "auto" | "hidden" | "visible" | "scroll";
}

export const PageContainer = ({
  children,
  title,
  maxWidth = "lg",
  spacing = 3,
  gap = 2,
  paddingX = { xs: 1, sm: 1.5, md: 2 },
  paddingY = 2,
  sx = {},
  component = "section",
  withBackground = true,
  overflow = "auto",
}: PageContainerProps) => {
  const theme = useTheme();

  // Get theme tokens based on current mode
  const tokens =
    theme.palette.mode === "dark"
      ? theme.openreach?.darkTokens
      : theme.openreach?.lightTokens;

  // Calculate actual max-width value in pixels
  const maxWidthValue =
    maxWidth && typeof maxWidth === "string"
      ? theme.breakpoints.values[maxWidth as keyof typeof theme.breakpoints.values]
      : undefined;

  return (
    <Stack
      component={component}
      spacing={spacing}
      gap={gap}
      maxWidth={maxWidthValue}
      mx="auto"
      px={paddingX}
      py={paddingY}
      width="100%"
      bgcolor={withBackground ? tokens?.background?.default : undefined}
      overflow={overflow}
      sx={{
        boxSizing: "border-box",
        ...sx,
      }}
    >
      {/* Optional title */}
      {title && (
        <Stack component="header">
          {/* Title is rendered by parent if needed, or can be added here */}
          {/* This space is reserved for title section if implemented */}
        </Stack>
      )}

      {/* Main content */}
      {children}
    </Stack>
  );
};

export default PageContainer;
