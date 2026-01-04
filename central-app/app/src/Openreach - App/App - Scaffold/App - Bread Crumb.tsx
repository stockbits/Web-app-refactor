import { Box, Typography, IconButton, Popover } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from 'react';
import type { MouseEvent } from 'react';

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
  const [infoAnchor, setInfoAnchor] = useState<HTMLElement | null>(null);
  const infoOpen = Boolean(infoAnchor);

  // Shared text style variables
  const getTextStyles = (theme: any, colorOverride?: string) => ({
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

  const handleInfoToggle = (event: MouseEvent<HTMLButtonElement>) => {
    setInfoAnchor((prev) => (prev ? null : event.currentTarget));
  };
  const handleInfoClose = () => setInfoAnchor(null);

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
            <IconButton
              size="small"
              color="inherit"
              aria-label="Show access tip"
              onClick={handleInfoToggle}
              aria-describedby={infoOpen ? 'access-summary-tip' : undefined}
              sx={{ ml: 1, p: 0.25 }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Popover
            id="access-summary-tip"
            open={infoOpen}
            anchorEl={infoAnchor}
            onClose={handleInfoClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            disableRestoreFocus
            slotProps={{
              paper: {
                sx: {
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  maxWidth: 320,
                  boxShadow: '0 20px 40px rgba(4, 26, 40, 0.25)',
                },
              },
            }}
          >
            <Typography variant="body2" sx={theme => ({ color: theme.palette.text.secondary })}>
              Tap the menu icon to open the navigation and move between tools.
            </Typography>
          </Popover>
        </>
      )}
    </Box>
  )
};
