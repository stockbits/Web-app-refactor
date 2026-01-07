# Quick Reference Card - PageContainer

## One-Page Cheat Sheet for Developers

---

## Basic Usage

```tsx
import { PageContainer } from './App - Shared Components/Page Container'

// Simple page
<PageContainer>
  <Typography>Content</Typography>
</PageContainer>

// With title and spacing
<PageContainer maxWidth="lg" spacing={3}>
  <Typography variant="h5">Title</Typography>
</PageContainer>
```

---

## Common Props

| Prop | Example | Notes |
|------|---------|-------|
| `maxWidth` | `"lg"` | 'sm' (600px), 'md' (900px), 'lg' (1200px), 'xl' (1536px), false |
| `spacing` | `3` | Gaps between sections (24px when =3) |
| `gap` | `2` | Gap between items (16px when =2) |
| `sx` | `{{ mt: 2 }}` | Custom MUI props (overrides) |

---

## Spacing Quick Ref

```
1   = 8px       gap={1}      → 8px
1.5 = 12px      gap={1.5}    → 12px
2   = 16px      gap={2}      → 16px
2.5 = 20px      gap={2.5}    → 20px
3   = 24px      gap={3}      → 24px
```

---

## With Sections

```tsx
import { PageContainer, SectionWrapper } from './App - Shared Components/Page Container'

<PageContainer maxWidth="lg" spacing={3}>
  <SectionWrapper title="First Section">
    <TextField label="Name" fullWidth />
  </SectionWrapper>
  
  <SectionWrapper title="Second Section">
    <Button variant="contained">Submit</Button>
  </SectionWrapper>
</PageContainer>
```

---

## Responsive Padding

```tsx
// Automatic responsive padding at all breakpoints
px={{ xs: 1, sm: 1.5, md: 2 }}
// xs: 8px, sm: 12px, md+ 16px
```

---

## Theme Tokens (in your sx props)

```tsx
const theme = useTheme()
const tokens = theme.openreach.lightTokens // or darkTokens

// Colors
tokens.background.default    // Page background
tokens.background.paper      // Card background
tokens.text.primary          // Main text color
tokens.text.secondary        // Secondary text
tokens.border.soft           // Subtle border
tokens.divider               // Divider color
```

---

## Template (Copy-Paste)

```tsx
import { Typography } from '@mui/material'
import { PageContainer, SectionWrapper } from '../App - Shared Components/Page Container'

export const MyNewPage = () => (
  <PageContainer 
    maxWidth="lg"
    spacing={3}
  >
    <SectionWrapper title="Main Section">
      <Typography>Your content here...</Typography>
    </SectionWrapper>
  </PageContainer>
)

export default MyNewPage
```

---

## SectionWrapper Props

```tsx
<SectionWrapper
  title="Section Title"        // Optional
  spacing={2}                  // Between items
  padding={2.5}                // Internal (20px)
  withBorder={true}            // Show border
  withBackground={true}        // Show alt bg
  elevation={0}                // Shadow (0-24)
  borderRadius={2}             // Corner radius
/>
```

---

## Common Patterns

### Pattern 1: Simple List
```tsx
<PageContainer spacing={2}>
  <Item />
  <Item />
  <Item />
</PageContainer>
```

### Pattern 2: Form
```tsx
<PageContainer maxWidth="md" spacing={3}>
  <SectionWrapper spacing={2}>
    <TextField label="Field" fullWidth />
  </SectionWrapper>
</PageContainer>
```

### Pattern 3: Table
```tsx
<PageContainer maxWidth={false}>
  <SectionWrapper title="Data">
    <DataGrid rows={rows} columns={cols} />
  </SectionWrapper>
</PageContainer>
```

### Pattern 4: Multi-section
```tsx
<PageContainer spacing={3}>
  <SectionWrapper title="A"><Content /></SectionWrapper>
  <SectionWrapper title="B"><Content /></SectionWrapper>
  <SectionWrapper title="C"><Content /></SectionWrapper>
</PageContainer>
```

---

## DO's ✅

```tsx
<PageContainer>
  <SectionWrapper>Content</SectionWrapper>
</PageContainer>

px={{ xs: 1, sm: 1.5, md: 2 }}

sx={{ color: tokens.text.primary }}

import { PageContainer } from './Page Container'
```

---

## DON'Ts ❌

```tsx
<PageContainer>
  <PageContainer>  {/* Don't nest */}
  </PageContainer>
</PageContainer>

sx={{ p: "20px" }}  {/* Use MUI units instead */}

sx={{ color: "#50535A" }}  {/* Use tokens instead */}

<Box>  {/* Don't use bare Box for pages */}
```

---

## Breakpoints

```
xs: 0px        (mobile)
sm: 600px      (tablet)
md: 900px      (desktop)
lg: 1200px     (large desktop)
xl: 1536px     (ultra-wide)
```

---

## Testing

```tsx
// Test mobile (xs)
// Window width: < 600px

// Test tablet (sm)
// Window width: 600-900px

// Test desktop (md)
// Window width: 900-1200px

// Test desktop large (lg+)
// Window width: > 1200px
```

---

## Imports Needed

```tsx
// Always
import { PageContainer, SectionWrapper } 
  from './App - Shared Components/Page Container'

// As needed
import { Typography, Button, TextField, ... } 
  from '@mui/material'
import { useTheme } 
  from '@mui/material'
```

---

## Full Component Reference

### PageContainer Props
```
children       - ReactNode (required)
title          - string (optional)
maxWidth       - 'sm'|'md'|'lg'|'xl'|false
spacing        - number (default: 3)
gap            - number (default: 2)
paddingX       - SxProps (responsive px)
paddingY       - number (default: 2)
sx             - SxProps (overrides)
component      - ElementType (default: 'section')
withBackground - boolean (default: true)
overflow       - 'auto'|'hidden'|'visible'|'scroll'
```

### SectionWrapper Props
```
children       - ReactNode (required)
title          - string (optional)
spacing        - number (default: 2)
padding        - number (default: 2.5)
gap            - number (default: 1.5)
withBorder     - boolean (default: true)
withBackground - boolean (default: true)
elevation      - number 0-24 (default: 0)
borderRadius   - number (default: 2)
sx             - SxProps (overrides)
```

---

## Dark Mode

```tsx
// Automatically handled!
// Just use theme tokens and PageContainer
// No additional code needed

const tokens = 
  theme.palette.mode === 'dark' 
    ? theme.openreach.darkTokens 
    : theme.openreach.lightTokens
```

---

## Documentation

Need more info? See:
- **PAGECONTAINER_USAGE_GUIDE.md** - Complete guide
- **CLEAN_CODE_ARCHITECTURE.md** - Design decisions
- **REFACTORING_CHECKLIST.md** - Implementation steps

---

## Questions?

Refer to component JSDoc or full documentation files.

---

**Last Updated:** January 7, 2026  
**Version:** 1.0
