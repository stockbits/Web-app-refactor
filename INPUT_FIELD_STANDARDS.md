# Input Field Consistency Standards

## Overview
All form input fields across the application have been standardized to ensure consistent height, spacing, and responsive behavior through theme-level configuration.

## Standards Applied

### Size & Dimensions
- **Default Size**: `small` (applied to all TextField, Select, Autocomplete, etc.)
- **Target Height**: ~40px (achieved via padding: 8.5px 14px)
- **Border Radius**: 2px (consistent across all inputs)
- **Font Size**: 0.875rem (14px)

### Component Defaults

#### TextField
- `size="small"` (default)
- `variant="outlined"` (default)
- Consistent border colors (light/dark mode)
- Placeholder opacity: 1

#### Select
- `size="small"` (default)
- `variant="outlined"` (default)
- Matching padding: 8.5px 14px
- Icon color: secondary text

#### Autocomplete
- `size="small"` (default)
- Adjusted padding to match other inputs
- Consistent popup indicator color

#### FormControl
- `size="small"` (default)
- `variant="outlined"` (default)
- Border radius: 2px

#### InputLabel
- Font size: 0.875rem
- Transform positioning for small size
- Focus color: theme primary

#### FormHelperText
- Font size: 0.75rem (12px)
- Consistent margins: 2px horizontal, 4px top

## Usage Guidelines

### Standard Usage (Recommended)
```tsx
// No props needed - defaults apply automatically
<TextField label="Name" />
<Select label="Status">...</Select>
<Autocomplete options={options} renderInput={(params) => <TextField {...params} label="Search" />} />
```

### Override When Necessary
Only override size when you have a specific use case:
```tsx
// Larger input for special cases
<TextField size="medium" label="Title" />

// Dense table filters
<Select size="small" /> // Already default, explicit is fine
```

### Don't Override These
❌ Avoid custom padding/height overrides in component styles
❌ Avoid inline `sx={{ height: '...', padding: '...' }}`
❌ Avoid variant overrides unless required

## Mobile Responsiveness
All inputs automatically adjust for smaller screens:
- Touch-friendly minimum height maintained
- Consistent spacing preserved
- Labels properly positioned on all breakpoints

## Theme Location
All standards defined in: `/src/App - Central Theme/index.ts`

### Light Theme
- Components section: Lines ~220-530
- Applies `lightTokens` color references

### Dark Theme  
- Components section: Lines ~700-1010
- Applies `darkTokens` color references

## Testing
Validated across components:
- Schedule Live (search fields, dropdowns)
- Advanced Search Tool (filters, date pickers)
- Task Management (simple & advanced views)
- All domain/division/status selectors

## Migration Notes
Existing components with explicit `size="small"` will continue to work.
Components without size props will now automatically use `size="small"`.

If you encounter any input that looks inconsistent:
1. Check if it has custom `sx` or `style` props overriding padding/height
2. Verify it's using standard MUI components (TextField, Select, etc.)
3. Remove any custom size/padding overrides to use theme defaults
