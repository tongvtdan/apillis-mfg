# Tab System Documentation

## Overview

The Factory Pulse application uses a hybrid tab system that combines DaisyUI tabs and custom tab components. This document outlines the implementation, fixes applied, and usage patterns.

## Tab Implementations

### 1. DaisyUI Tabs (Native DaisyUI)
**Used in:** `src/pages/Auth.tsx`

**Implementation:**
```tsx
<div className="tabs tabs-boxed mb-6">
  <button
    className={`tab flex-1 ${activeTab === 'signin' ? 'tab-active' : ''}`}
    onClick={() => setActiveTab('signin')}
  >
    Sign In
  </button>
  <button
    className={`tab flex-1 ${activeTab === 'signup' ? 'tab-active' : ''}`}
    onClick={() => setActiveTab('signup')}
  >
    Sign Up
  </button>
</div>
```

**Styling Classes:**
- `tabs tabs-boxed` - Container
- `tab` - Individual tab
- `tab-active` - Active tab state

### 2. Custom Tab Components
**Used in:** Projects, Customers, RFQDetail, AdminUsers, Settings pages

**Implementation:**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="customers" className="w-full">
  <TabsList>
    <TabsTrigger value="customers">All Customers</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
  
  <TabsContent value="customers" className="space-y-6">
    {/* Content */}
  </TabsContent>
  
  <TabsContent value="analytics" className="space-y-6">
    {/* Content */}
  </TabsContent>
</Tabs>
```

**Components:**
- `Tabs` - Main container
- `TabsList` - Tab navigation container
- `TabsTrigger` - Individual tab button
- `TabsContent` - Tab content panel

## Pages Using Tabs

### 1. Auth Page (`/auth`)
- **Implementation:** DaisyUI tabs
- **Tabs:** Sign In, Sign Up
- **Status:** ✅ Fixed

### 2. Projects Page (`/projects`)
- **Implementation:** Custom tabs with special classes
- **Tabs:** List, Workflow, Calendar, Analytics
- **Special Classes:** `auth-tabs-list`, `auth-tab-trigger`
- **Status:** ✅ Fixed

### 3. Customers Page (`/customers`)
- **Implementation:** Custom tabs
- **Tabs:** All Customers, Analytics
- **Status:** ✅ Working

### 4. RFQDetail Page (`/rfq/:id`)
- **Implementation:** Custom tabs
- **Tabs:** Overview, Internal Reviews, Approvals, Documents, Activity Log
- **Status:** ✅ Working

### 5. AdminUsers Page (`/admin/users`)
- **Implementation:** Custom tabs
- **Tabs:** Users, Activity
- **Status:** ✅ Working

### 6. Settings Page (`/settings`)
- **Implementation:** Custom tabs
- **Tabs:** General, Notifications, Admin (conditional)
- **Status:** ✅ Working

## CSS Files

### 1. `src/styles/tab-system-fix.css` (NEW)
- **Purpose:** Comprehensive fix for all tab display issues
- **Features:**
  - DaisyUI tab enhancements
  - Custom tab component fixes
  - Projects page specific fixes (`auth-tabs-list`, `auth-tab-trigger`)
  - Dark mode support
  - Responsive design
  - High specificity overrides

### 2. `src/styles/project-tabs-fix.css`
- **Purpose:** Project-specific tab styling
- **Status:** Still used, but enhanced by tab-system-fix.css

### 3. `src/styles/project-view-tabs.css`
- **Purpose:** Project view tab enhancements
- **Status:** Still used, but enhanced by tab-system-fix.css

### 4. `src/styles/auth-ui-enhancements.css`
- **Purpose:** Auth page specific styling
- **Status:** Still used for auth page tabs

## Key Fixes Applied

### 1. Missing CSS Classes
**Problem:** Projects page used `auth-tabs-list` and `auth-tab-trigger` classes that didn't exist.

**Solution:** Added comprehensive CSS definitions:
```css
.auth-tabs-list {
    @apply tabs tabs-boxed mb-4;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.25rem;
}

.auth-tab-trigger {
    @apply tab transition-all duration-200 font-medium;
    border-radius: 0.375rem;
    text-align: center;
}
```

### 2. Inconsistent Styling
**Problem:** DaisyUI tabs and custom tabs had different styling.

**Solution:** Unified styling approach with high specificity overrides:
```css
.tab-active,
.auth-tab-trigger.tab-active {
    background-color: hsl(var(--p)) !important;
    color: hsl(var(--pc)) !important;
    font-weight: 600 !important;
}
```

### 3. Accessibility Issues
**Problem:** Custom tab components lacked proper accessibility attributes.

**Solution:** Enhanced tab components with ARIA attributes:
```tsx
<div className={`tabs-list ${className}`} role="tablist">
<button role="tab" aria-selected={isActive} aria-disabled={disabled}>
<div role="tabpanel" aria-hidden={!isActive}>
```

## Theme Support

### Light Theme
- Background: `hsl(var(--b2))`
- Active tab: `hsl(var(--p))` (primary color)
- Text: `hsl(var(--bc))` (base content)

### Dark Theme
- Background: `hsl(var(--b2))` (darker)
- Active tab: `hsl(var(--p))` with enhanced shadow
- Text: `hsl(var(--bc))` (lighter)

## Responsive Design

### Desktop (768px+)
- Projects page: 4-column grid
- Other pages: Flexible layout

### Tablet (480px-768px)
- Projects page: 2-column grid
- Reduced padding and font size

### Mobile (<480px)
- Projects page: 1-column stack
- Increased padding for touch targets

## Testing Checklist

- [ ] Auth page tabs display properly
- [ ] Projects page all 4 tabs work
- [ ] Customers page tabs functional
- [ ] RFQDetail page all 5 tabs work
- [ ] AdminUsers page tabs functional
- [ ] Settings page tabs work (including conditional Admin tab)
- [ ] Dark mode support for all tabs
- [ ] Light mode support for all tabs
- [ ] Responsive design on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader accessibility

## Future Considerations

1. **Unification:** Consider migrating all tabs to a single implementation
2. **Component Library:** Create a unified tab component that works with DaisyUI
3. **State Management:** Consider tab state persistence across navigation
4. **Animation:** Add smooth transitions between tab content
5. **Testing:** Add comprehensive unit tests for tab components

## Troubleshooting

### Common Issues

1. **Tabs not visible:**
   - Check if `tab-system-fix.css` is imported in `main.tsx`
   - Verify CSS classes are properly applied

2. **Active state not showing:**
   - Check for conflicting CSS specificity
   - Verify `tab-active` class is applied

3. **Styling inconsistencies:**
   - Check theme variables in `tailwind.config.ts`
   - Verify DaisyUI theme is properly loaded

4. **Responsive issues:**
   - Check media queries in `tab-system-fix.css`
   - Test on different screen sizes

### Debug Steps

1. Open browser dev tools
2. Inspect tab elements
3. Check applied CSS classes
4. Verify CSS specificity
5. Test theme switching
6. Check console for errors
