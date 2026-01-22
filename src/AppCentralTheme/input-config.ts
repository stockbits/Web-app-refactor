/**
 * Centralized Input Component Configuration
 * 
 * This file provides standardized configuration for all text input components
 * (TextField, Autocomplete, Select) to ensure UI consistency across the application.
 * 
 * All input components should use these constants to maintain uniform height,
 * sizing, variant, and styling properties.
 */

import type { SxProps, Theme } from '@mui/material'

/**
 * Standard input component properties
 * Ensures consistent 40px height and 'small' size across all inputs
 */
export const STANDARD_INPUT_PROPS = {
  size: 'small' as const,
  variant: 'outlined' as const,
}

/**
 * Standard TextField height configuration
 * Ensures consistent 40px minimum height
 */
export const STANDARD_INPUT_HEIGHT = {
  minHeight: '40px',
}

/**
 * Reusable SX prop for TextField root styling
 * Maintains consistent background and height
 */
export const standardTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    minHeight: '40px',
  },
}

/**
 * Standard Autocomplete component properties
 * Ensures consistent behavior and appearance
 */
export const STANDARD_AUTOCOMPLETE_PROPS = {
  size: 'small' as const,
  disableClearable: false,
}

/**
 * Reusable SX prop for multiline TextField
 * Maintains consistent appearance for text areas while allowing dynamic height
 */
export const multilineTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    minHeight: '40px', // Ensures minimum height even for single line
  },
}

/**
 * Reusable SX prop for search TextField
 * Provides consistent styling for search inputs
 */
export const searchTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    minHeight: '40px',
    bgcolor: 'background.default',
    '&:hover': {
      bgcolor: 'background.default',
    },
  },
}

/**
 * Standard Select component properties
 */
export const STANDARD_SELECT_PROPS = {
  size: 'small' as const,
  variant: 'outlined' as const,
}

/**
 * Helper function to merge custom SX props with standard input SX
 * Useful when you need to add additional styling while maintaining standards
 */
export const mergeInputSx = (customSx?: SxProps<Theme>) => {
  if (!customSx) return standardTextFieldSx
  
  if (Array.isArray(customSx)) {
    return [standardTextFieldSx, ...customSx]
  }
  
  return [standardTextFieldSx, customSx]
}
