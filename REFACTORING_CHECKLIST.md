# Refactoring Checklist - PageContainer Implementation

**Created:** January 7, 2026  
**Target:** Standardize all pages to use PageContainer + SectionWrapper  
**Estimated Time:** 4-6 hours  
**Priority:** High (UX consistency and maintainability)

---

## Phase 1: Core Scaffolding Files (✅ COMPLETE)

- [x] Create `PageContainer.tsx` component
- [x] Create `SectionWrapper.tsx` component
- [x] Create `index.ts` for easy imports
- [x] Create usage guide documentation
- [x] Create standardization analysis document

**Components Created:**
```
src/Openreach - App/App - Shared Components/Page Container/
├── Page Container.tsx
├── Section Wrapper.tsx
└── index.ts
```

---

## Phase 2: Update Core App Structure (⏳ TODO - High Priority)

### App.tsx Changes Required

**File:** `src/App.tsx`

**Location:** Lines 467-469  
**Current Code:**
```tsx
<Box 
  className={`app-canvas ${activePage ? 'app-canvas-page' : ''}`}
  sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}
>
```

**Action:** Keep as-is (this is the canvas wrapper, not individual pages)  
**Reason:** This is the main layout container, pages will wrap their content with PageContainer inside

---

## Phase 3: Refactor Admin Pages (⏳ TODO - Core Pages)

### 3.1 Resource Admin Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/Resource Admin/`

| File | Current Pattern | Action | Priority |
|------|-----------------|--------|----------|
| `Access Restriction.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Business Overtime.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Closure User Group.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Personal Overtime.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Rota Day Record.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Rota Template Record.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Rota Week Record.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |

**Template for Refactoring:**
```tsx
// BEFORE
import { Box, Typography } from '@mui/material'

const PageName = () => (
  <Box>
    <Typography variant="body1" color="text.secondary">
      Placeholder content...
    </Typography>
  </Box>
)

// AFTER
import { Typography } from '@mui/material'
import { PageContainer } from '../App - Shared Components/Page Container'

const PageName = () => (
  <PageContainer maxWidth="lg" spacing={3}>
    <Typography variant="body1" color="text.secondary">
      Placeholder content...
    </Typography>
  </PageContainer>
)
```

**Count:** 7 files

---

### 3.2 General Settings Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/General Settings/`

| File | Current Pattern | Action | Priority |
|------|-----------------|--------|----------|
| `API Keys.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Notification Channels.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `System Preferences.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Theme Builder.tsx` | Bare `<Box>` | Wrap with PageContainer + SectionWrapper | P1 |

**Count:** 4 files

---

### 3.3 Jeopardy Admin Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/Jeopardy Admin/`

| File | Current Pattern | Action | Priority |
|------|-----------------|--------|----------|
| `Alert Action Definition.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Alert Definitions.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Alert Exclusion.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Alert Parameter Definition.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Alert Ranking.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |

**Count:** 5 files

---

### 3.4 Operation Toolkit Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/Operation Toolkit/`

| File | Current Pattern | Action | Priority |
|------|-----------------|--------|----------|
| `Callout Overview.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Schedule Explorer.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Schedule Live.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |

**Count:** 3 files

---

### 3.5 Operations Management Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/Operations Management/`

| File | Current Pattern | Action | Priority |
|------|-----------------|--------|----------|
| `Resource Management.tsx` | Bare `<Box>` | Wrap with PageContainer + MUI Table | P1 |
| `Task Management.tsx` | Bare `<Box>` | Wrap with PageContainer + MUI Table | P1 |

**Count:** 2 files

**Special Handling:** These may contain DataGrid or tables - use SectionWrapper for table containers

---

### 3.6 Schedule Admin Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/Schedule Admin/`

| File | Current Pattern | Action | Priority |
|------|-----------------|--------|----------|
| `MSS Admin.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `SRM Admin.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `SRM Audit.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |

**Count:** 3 files

---

### 3.7 Self Service Admin Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/Self Service Admin/`

| File | Current Pattern | Action | Priority |
|------|-----------------|--------|----------|
| `Self Selection Patch Admin.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Self Selection Settings Admin.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Self Selection Task Rating Admin.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Self Selection Work Type Admin.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |

**Count:** 4 files

---

### 3.8 System Admin Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/System Admin/`

**Status:** Need to list files in this directory  
**Action:** Wrap all with PageContainer  
**Count:** TBD

---

### 3.9 Task Admin Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/Task Admin/`

**Status:** Need to list files in this directory  
**Action:** Wrap all with PageContainer  
**Count:** TBD

---

### 3.10 User Admin Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/User Admin/`

**Status:** Need to list files in this directory  
**Action:** Wrap all with PageContainer  
**Count:** TBD

---

### 3.11 Domain Admin Pages

**Directory:** `src/Openreach - App/App - Scaffold/App - Pages/Domain Admin/`

| File | Current Pattern | Action | Priority |
|------|-----------------|--------|----------|
| `Asset.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Division.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Domain Building.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Post Areas.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Travel Areas.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |
| `Workforce.tsx` | Bare `<Box>` | Wrap with PageContainer | P0 |

**Count:** 6 files

---

## Phase 4: Update Shared Components (⏳ TODO - Medium Priority)

### 4.1 App - Scaffold Components

**File:** `src/Openreach - App/App - Scaffold/App - Landing Overview.tsx`

**Current:** Uses Stack with grid layout  
**Action:** Review spacing pattern, ensure consistent with PageContainer  
**Status:** Already uses responsive design, minimal changes needed  
**Priority:** P2 (low - already well-structured)

---

### 4.2 MUI - Panel Structure

**File:** `src/Openreach - App/App - Shared Components/MUI - Panel Structure/MUI4Panel.tsx`

**Current:** Complex resizable panel layout  
**Action:** Review internal padding consistency  
**Status:** This is a special layout component, may not need PageContainer wrapper  
**Priority:** P2 (low)

---

### 4.3 MUI - Table Components

**File:** `src/Openreach - App/App - Shared Components/MUI - Table/MUI Table - Table Shell.tsx`

**Current:** Table wrapper component  
**Action:** Ensure tables are wrapped in SectionWrapper when used on pages  
**Status:** Documentation task, component itself is OK  
**Priority:** P2 (low)

---

## Phase 5: Clean Up CSS (⏳ TODO - Low Priority)

### 5.1 App.css Cleanup

**File:** `src/App.css`

**Current Classes to Review:**
- `.app-canvas-page` - May become unnecessary after PageContainer adoption
- `.canvas-label` - Check if still used
- Unused responsive padding classes - Consolidate into PageContainer

**Actions:**
- [ ] Remove `.app-canvas-page` if no longer needed (Phase 3 completion dependent)
- [ ] Verify all CSS classes are actually used in components
- [ ] Consider consolidating to minimal layout CSS only
- [ ] Keep responsive gutter variables as reference

**Target:** Reduce `App.css` from 111 lines to ~50 lines

---

## Phase 6: Testing & Validation (⏳ TODO - High Priority)

### 6.1 Visual Testing

- [ ] Verify all pages render correctly at xs breakpoint (mobile)
- [ ] Verify all pages at sm breakpoint (tablet)
- [ ] Verify all pages at lg breakpoint (desktop)
- [ ] Verify all pages at xl breakpoint (ultra-wide)
- [ ] Test dark mode on all pages
- [ ] Test light mode on all pages

### 6.2 Responsive Testing

- [ ] Padding is appropriate on all breakpoints
- [ ] Max-width constraint works correctly
- [ ] Scrolling behavior is correct
- [ ] No horizontal overflow on mobile

### 6.3 Accessibility Testing

- [ ] Semantic HTML structure is correct
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG standards

### 6.4 Functionality Testing

- [ ] No regressions in form submission
- [ ] Table/DataGrid pagination still works
- [ ] Modal dialogs display correctly
- [ ] Tooltips and popovers position correctly

---

## Refactoring Priority Matrix

### P0 (Do First - ~30 minutes)
All Resource Admin, Jeopardy Admin, Operation Toolkit, Schedule Admin, Self Service Admin, and Domain Admin pages.

**Total:** 28 files (simple wrapper application)

### P1 (Do Second - ~1 hour)
Operations Management pages (with table considerations), General Settings advanced pages.

**Total:** 4 files

### P2 (Do Last - ~30 minutes)
Scaffold components review, Table/Panel components review, CSS cleanup.

---

## File Modification Template

**Use this for every page refactoring:**

```tsx
// ========== BEFORE ==========
import { Box, Typography } from '@mui/material'

const PageName = () => (
  <Box>
    <Typography variant="body1" color="text.secondary">
      Placeholder content...
    </Typography>
  </Box>
)

export default PageName

// ========== AFTER ==========
import { Typography } from '@mui/material'
import { PageContainer } from '../App - Shared Components/Page Container'

const PageName = () => (
  <PageContainer maxWidth="lg" spacing={3}>
    <Typography variant="body1" color="text.secondary">
      Placeholder content...
    </Typography>
  </PageContainer>
)

export default PageName
```

---

## Estimated Timeline

| Phase | Description | Time | Status |
|-------|-------------|------|--------|
| 1 | Core Components & Docs | 1 hr | ✅ Complete |
| 2 | App Structure Review | 15 min | 🔄 In Progress |
| 3 | Admin Pages Refactoring | 2.5 hrs | ⏳ TODO |
| 4 | Shared Components | 30 min | ⏳ TODO |
| 5 | CSS Cleanup | 30 min | ⏳ TODO |
| 6 | Testing & Validation | 1 hr | ⏳ TODO |
| **Total** | | **5-6 hrs** | |

---

## Success Criteria

- [ ] All pages use PageContainer wrapper
- [ ] No bare `<Box>` page containers remain
- [ ] Consistent padding across all breakpoints
- [ ] Dark/light mode works on all pages
- [ ] No horizontal scrolling on mobile
- [ ] All tests pass
- [ ] No console warnings about padding/styling
- [ ] Responsive design verified at all breakpoints
- [ ] Accessibility checks pass
- [ ] Code review approval

---

## Rollback Plan

If issues arise:
1. PageContainer and SectionWrapper components are backward compatible
2. Pages can gradually migrate without affecting others
3. Individual page refactorings can be reverted independently
4. Original bare `<Box>` approach still works as fallback

---

## Questions & Notes

- [ ] Confirm max-width='lg' (1200px) is appropriate for all page types
- [ ] Verify Theme tokens are loading correctly in all pages
- [ ] Check if any pages have special layout requirements
- [ ] Confirm responsive padding values with design team
- [ ] Identify any special cases (admin dashboards, wizards, etc.)

---

## Next Steps

1. **Phase 2:** Review App.tsx (no changes needed)
2. **Phase 3:** Begin refactoring P0 pages (Resource Admin, etc.)
3. **Phase 4:** Update shared components
4. **Phase 5:** Clean up CSS
5. **Phase 6:** Comprehensive testing

**Ready to start Phase 3?** Begin with any single page in Resource Admin to test the pattern.
