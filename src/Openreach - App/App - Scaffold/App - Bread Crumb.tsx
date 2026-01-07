import { Box, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';

interface AppBreadCrumbProps {
  left: string;
  right?: string;
  onLeftClick?: () => void;
  leftClickable?: boolean;
  accessSummary?: boolean;
  groupsCount?: number;
  totalTools?: number;
}

export const AppBreadCrumb = ({ left, right, onLeftClick, leftClickable = false, accessSummary = false, groupsCount, totalTools }: AppBreadCrumbProps) => {
  const getTextStyles = (theme: Theme, colorOverride?: string) => ({
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 600,
    color: colorOverride || theme.palette.text.secondary,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    fontSize: '0.75rem',
    lineHeight: 1.2,
    pl: 0,
    mb: 0,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minHeight: 32, pl: 3, pt: 2.2, mb: 0.5 }}>
      <Typography
        variant="overline"
        className="canvas-label"
        sx={theme => getTextStyles(theme)}
      >
        <Box
          component="span"
          sx={leftClickable ? {
            opacity: 0.95,
            cursor: 'pointer',
            textDecoration: 'none',
            textUnderlineOffset: '2px',
            transition: 'color 0.2s, text-decoration 0.2s',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          } : { opacity: 0.95 }}
          onClick={leftClickable ? onLeftClick : undefined}
          tabIndex={leftClickable ? 0 : undefined}
          role={leftClickable ? 'button' : undefined}
          aria-label={leftClickable ? `Back to ${left}` : undefined}
        >
          {left}
        </Box>
        {right && <Box component="span" sx={{ mx: 0.75, color: 'inherit', fontWeight: 400 }}>{'\u2022'}</Box>}
        {right && <Box component="span">{right}</Box>}
      </Typography>
      {accessSummary && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Typography
              variant="overline"
              sx={theme => getTextStyles(theme, theme.openreach.energyAccent)}
              component="span"
            >
              <Box component="span" sx={{ color: 'inherit', fontWeight: 400 }}>{'\u2022'}</Box>
              <Box component="span" sx={{ mx: 0.75, color: 'inherit', fontWeight: 700, textTransform: 'uppercase' }}>{groupsCount} programmes</Box>
              <Box component="span" sx={{ mx: 0.75, color: 'inherit', fontWeight: 400 }}>{'\u2022'}</Box>
              <Box component="span" sx={{ mx: 0.75, color: 'inherit', fontWeight: 700, textTransform: 'uppercase' }}>{totalTools} tools ready to launch</Box>
            </Typography>
          </Box>
        </>
      )}
    </Box>
  )
};
