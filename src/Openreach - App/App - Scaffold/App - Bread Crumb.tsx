import { Box, Typography, Breadcrumbs, Link, Chip } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import type { ReactNode } from 'react';

interface AppBreadCrumbProps {
  left: string;
  right?: string;
  onLeftClick?: () => void;
  leftClickable?: boolean;
  accessSummary?: boolean;
  groupsCount?: number;
  totalTools?: number;
  rightAction?: ReactNode;
}

export const AppBreadCrumb = ({
  left,
  right,
  onLeftClick,
  leftClickable = false,
  accessSummary = false,
  groupsCount,
  totalTools,
  rightAction
}: AppBreadCrumbProps) => {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48,
      px: 3,
      py: 1.25,
      bgcolor: 'background.paper'
    }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Info icon on the left */}
        {rightAction && (
          <Box sx={{ mr: -0.5 }}>
            {rightAction}
          </Box>
        )}
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />}
          sx={{
            '& .MuiBreadcrumbs-separator': {
              mx: 0.5
            }
          }}
        >
          {leftClickable ? (
            <Link
              component="button"
              variant="h6"
              onClick={onLeftClick}
              sx={{
                color: 'text.primary',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1.125rem',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
              aria-label={`Navigate back to ${left}`}
            >
              {left}
            </Link>
          ) : (
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '1.125rem'
              }}
            >
              {left}
            </Typography>
          )}

          {right && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                fontSize: '0.8125rem'
              }}
            >
              {right}
            </Typography>
          )}
        </Breadcrumbs>

        {/* Access Summary Chips - positioned next to breadcrumb */}
        {accessSummary && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${groupsCount} programmes`}
              variant="outlined"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                height: '24px'
              }}
            />
            <Chip
              label={`${totalTools} tools`}

              variant="filled"
              color="primary"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                height: '24px'
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
};
