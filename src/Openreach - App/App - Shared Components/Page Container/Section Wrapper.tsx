import type { SxProps, Theme } from "@mui/material";
import { Paper, Stack, Typography, useTheme } from "@mui/material";
import type { ReactNode } from "react";

/**
 * SectionWrapper Component
 *
 * A secondary container used within PageContainer to group related content.
 * Provides consistent visual separation and spacing for logical sections.
 *
 * Features:
 * - Subtle background color distinction
 * - Optional title with typography styling
 * - Border for visual definition
 * - Consistent internal padding
 * - Theme-aware colors (light/dark mode)
 *
 * @example
 * <SectionWrapper title="Personal Information" spacing={2}>
 *   <TextField label="Name" />
 *   <TextField label="Email" />
 * </SectionWrapper>
 */

export interface SectionWrapperProps {
  /**
   * Main content of the section
   */
  children: ReactNode;

  /**
   * Optional section title (renders as subtitle2 Typography)
   */
  title?: string;

  /**
   * Spacing between items within this section (MUI spacing units)
   * @default 2
   */
  spacing?: number;

  /**
   * Padding inside the section container
   * @default 2.5
   */
  padding?: number;

  /**
   * Gap between stack items
   * @default 1.5
   */
  gap?: number;

  /**
   * Show border around the section
   * @default true
   */
  withBorder?: boolean;

  /**
   * Show background color
   * @default true
   */
  withBackground?: boolean;

  /**
   * Show elevation/shadow
   * @default 0
   */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

  /**
   * Border radius
   * @default 2
   */
  borderRadius?: number;

  /**
   * Additional custom MUI sx props
   */
  sx?: SxProps<Theme>;
}

export const SectionWrapper = ({
  children,
  title,
  spacing = 2,
  padding = 2.5,
  gap = 1.5,
  withBorder = true,
  withBackground = true,
  elevation = 0,
  borderRadius = 2,
  sx = {},
}: SectionWrapperProps) => {
  const theme = useTheme();

  // Get theme tokens based on current mode
  const tokens =
    theme.palette.mode === "dark"
      ? theme.openreach?.darkTokens
      : theme.openreach?.lightTokens;

  return (
    <Paper
      component="article"
      elevation={elevation}
      sx={{
        p: padding,
        borderRadius: borderRadius,
        border: withBorder ? `1px solid ${tokens?.border?.soft}` : "none",
        backgroundColor: withBackground ? tokens?.background?.alt : "transparent",
        ...sx,
      }}
    >
      <Stack spacing={spacing} gap={gap}>
        {/* Optional section title */}
        {title && (
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{ color: tokens?.text?.primary }}
          >
            {title}
          </Typography>
        )}

        {/* Main section content */}
        {children}
      </Stack>
    </Paper>
  );
};

export default SectionWrapper;
