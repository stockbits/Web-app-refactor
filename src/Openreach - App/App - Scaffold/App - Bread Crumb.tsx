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
  rightContent?: ReactNode;
}

export const AppBreadCrumb = ({ left, right, onLeftClick, leftClickable = false, accessSummary = false, groupsCount, totalTools, rightContent }: AppBreadCrumbProps) => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      minHeight: { xs: 48, sm: 40 },
      px: { xs: 2, sm: 3 },
      py: { xs: 1.5, sm: 1 },
      gap: { xs: 1.5, sm: 0 },
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper'
    }}>
      {/* Breadcrumb Navigation */}
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
            variant="body2"
            onClick={onLeftClick}
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '0.9rem' },
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline'
              },
              display: 'flex',
              alignItems: 'center',
              minHeight: 'auto',
              py: 0.5
            }}
            aria-label={`Navigate back to ${left}`}
          >
            {left}
          </Link>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '0.9rem' }
            }}
          >
            {left}
          </Typography>
        )}

        {right && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '0.9rem' }
            }}
          >
            {right}
          </Typography>
        )}
      </Breadcrumbs>

      {/* Access Summary or Right Content */}
      {(accessSummary || rightContent) && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mt: { xs: 1, sm: 0 },
          ml: { xs: 0, sm: 'auto' }
        }}>
          {accessSummary && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${groupsCount} programmes`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  height: '24px',
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }}
              />
              <Chip
                label={`${totalTools} tools`}
                size="small"
                variant="filled"
                color="primary"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  height: '24px'
                }}
              />
            </Box>
          )}

          {rightContent && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {rightContent}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
};
