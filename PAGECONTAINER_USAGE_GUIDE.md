# Page Container Components - Usage Guide

## Overview

The `PageContainer` and `SectionWrapper` components provide a standardized, reusable structure for all pages in the application. They ensure consistent padding, spacing, and theme-aware styling across the entire app.

---

## PageContainer

**Purpose:** Main page wrapper that provides responsive padding, max-width constraint, and proper background color.

### Basic Usage

```tsx
import { PageContainer } from "./App - Shared Components/Page Container";
import { Typography } from "@mui/material";

const MyPage = () => (
  <PageContainer>
    <Typography variant="body1">Hello World</Typography>
  </PageContainer>
);
```

### With Title

```tsx
const DashboardPage = () => (
  <PageContainer title="Dashboard" spacing={3}>
    <Typography>Content here...</Typography>
  </PageContainer>
);
```

### Full Example with All Props

```tsx
const AdvancedPage = () => (
  <PageContainer
    title="Resource Management"
    maxWidth="lg"
    spacing={3}
    gap={2}
    paddingX={{ xs: 1, sm: 1.5, md: 2 }}
    paddingY={2}
    withBackground={true}
    overflow="auto"
    sx={{
      minHeight: "100%",
      // Custom overrides
    }}
  >
    <Typography>Page content...</Typography>
  </PageContainer>
);
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Main page content |
| `title` | `string?` | undefined | Optional page title |
| `maxWidth` | `'sm'\|'md'\|'lg'\|'xl'\|false` | `'lg'` | Maximum container width |
| `spacing` | `number` | `3` | Vertical spacing between sections (MUI units = 8px each) |
| `gap` | `number` | `2` | Horizontal gap between items |
| `paddingX` | `SxProps` | `{ xs: 1, sm: 1.5, md: 2 }` | Left/right responsive padding |
| `paddingY` | `SxProps` | `2` | Top/bottom padding |
| `withBackground` | `boolean` | `true` | Use theme background color |
| `overflow` | `'auto'\|'hidden'\|'visible'\|'scroll'` | `'auto'` | Scrolling behavior |
| `sx` | `SxProps` | `{}` | Custom MUI sx props (overrides defaults) |
| `component` | `ElementType` | `'section'` | HTML component to render |

### Spacing Values

All spacing uses MUI's 8px base unit:

- `1` = 8px
- `2` = 16px
- `2.5` = 20px
- `3` = 24px
- `4` = 32px

### Max-Width Breakpoints

| Value | Breakpoint | Pixels |
|-------|-----------|--------|
| `'sm'` | Small | 600px |
| `'md'` | Medium | 900px |
| `'lg'` | Large | 1200px |
| `'xl'` | Extra Large | 1536px |
| `false` | Full width | - |

---

## SectionWrapper

**Purpose:** Secondary container for grouping related content within a page. Creates visual separation with subtle background and border.

### Basic Usage

```tsx
import { SectionWrapper } from "./App - Shared Components/Page Container";

const MySection = () => (
  <SectionWrapper title="Personal Information">
    <TextField label="Name" />
    <TextField label="Email" />
  </SectionWrapper>
);
```

### Without Title

```tsx
<SectionWrapper>
  <Typography>Anonymous section content</Typography>
</SectionWrapper>
```

### Custom Styling

```tsx
<SectionWrapper
  title="Advanced Options"
  spacing={2}
  padding={3}
  borderRadius={3}
  elevation={1}
  sx={{
    borderColor: "primary.main",
    borderWidth: 2,
  }}
>
  <Button>Option 1</Button>
  <Button>Option 2</Button>
</SectionWrapper>
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Section content |
| `title` | `string?` | undefined | Optional section title |
| `spacing` | `number` | `2` | Vertical spacing between items |
| `padding` | `SxProps['p']` | `2.5` | Internal padding (20px) |
| `gap` | `number` | `1.5` | Horizontal gap between items |
| `withBorder` | `boolean` | `true` | Show border |
| `withBackground` | `boolean` | `true` | Show alt background color |
| `elevation` | `number` | `0` | Shadow elevation (0-24) |
| `borderRadius` | `number` | `2` | Border radius multiplier |
| `sx` | `SxProps` | `{}` | Custom MUI sx props |

---

## Complete Page Example

```tsx
import { Box, Button, TextField, Typography } from "@mui/material";
import { PageContainer, SectionWrapper } from "./App - Shared Components/Page Container";

const ResourceManagementPage = () => (
  <PageContainer
    title="Resource Management"
    maxWidth="lg"
    spacing={3}
  >
    {/* First section - Search and filters */}
    <SectionWrapper title="Search and Filters">
      <TextField
        fullWidth
        placeholder="Search resources..."
        size="small"
      />
    </SectionWrapper>

    {/* Second section - Results table */}
    <SectionWrapper title="Active Resources">
      <Typography variant="body2" color="text.secondary">
        26 resources found
      </Typography>
      {/* DataGrid or table component here */}
    </SectionWrapper>

    {/* Third section - Actions */}
    <SectionWrapper>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="contained">Create Resource</Button>
        <Button variant="outlined">Export</Button>
      </Box>
    </SectionWrapper>
  </PageContainer>
);

export default ResourceManagementPage;
```

---

## Responsive Behavior

Both components are fully responsive:

### PageContainer Padding by Breakpoint

```
xs (0-600px):    px: 8px  (1 unit)
sm (600-900px):  px: 12px (1.5 units)
md (900-1200px): px: 16px (2 units)
lg+ (1200px+):   px: 16px (2 units)
```

### Max-Width Behavior

- **Mobile (xs, sm):** Full width minus responsive padding
- **Tablet (md):** Constrained to 900px centered
- **Desktop (lg+):** Constrained to 1200px centered

---

## Theme Integration

Both components automatically:
- Use current theme mode (light/dark)
- Apply theme tokens for colors
- Support theme breakpoints for responsive design
- Respect user theme preferences

### Accessing Theme Tokens

Components use `theme.openreach.lightTokens` / `theme.openreach.darkTokens`:

```typescript
{
  background: { default, paper, alt, overlay },
  text: { primary, secondary, inverse, disabled },
  border: { soft, strong },
  divider: "#...",
  // ... more tokens
}
```

---

## Migration Guide

### Before (Old Pattern)

```tsx
const OldPage = () => (
  <Box>
    <Typography variant="body1">
      Content without proper structure
    </Typography>
  </Box>
);
```

### After (New Pattern)

```tsx
const NewPage = () => (
  <PageContainer maxWidth="lg" spacing={3}>
    <Typography variant="body1">
      Content with proper structure
    </Typography>
  </PageContainer>
);
```

---

## Best Practices

### ✅ DO

- Use `PageContainer` for all page-level components
- Use `SectionWrapper` to group related content
- Respect the predefined spacing scale (2, 3, 4 units)
- Let theme tokens handle colors
- Use responsive padding values for mobile-first design

### ❌ DON'T

- Add padding directly to page components
- Mix CSS classes with PageContainer
- Use hardcoded colors instead of theme tokens
- Create nested PageContainers
- Override `maxWidth` unless necessary

---

## Accessibility

Both components:
- Use semantic HTML (`<section>`, `<article>`, `<header>`)
- Have proper role attributes
- Support keyboard navigation
- Follow WCAG contrast standards
- Support screen readers

---

## Performance Notes

- Minimal re-renders via React.memo optimization potential
- Uses MUI's built-in breakpoints (no additional CSS)
- Token lookups are cached by theme context
- No additional DOM nodes beyond necessary structure

---

## Troubleshooting

### Content not showing?
- Ensure `children` prop is provided
- Check if `overflow` is set to `'hidden'`
- Verify parent container has sufficient height

### Styling not applying?
- Check if custom `sx` props are conflicting
- Ensure theme tokens are loaded (`theme.openreach`)
- Verify MUI theme provider is wrapping the app

### Spacing looks wrong?
- Remember: spacing units are multiples of 8px
- Use `spacing={3}` for 24px gap (not 3px)
- Check responsive padding at different breakpoints

---

## Additional Resources

- [MUI Stack Documentation](https://mui.com/material-ui/react-stack/)
- [MUI Paper Documentation](https://mui.com/material-ui/react-paper/)
- [MUI Theming Guide](https://mui.com/material-ui/customization/theming/)
- [Material Design 3 Spacing](https://m3.material.io/foundations/layout/understanding-layout)

---

## Questions or Feedback?

For issues or improvements to the PageContainer components, refer to the framework documentation or contact the development team.
