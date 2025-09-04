# Tab System Documentation

## Overview

The Factory Pulse application now uses a **unified DaisyUI tab system** with custom colors using CSS custom properties. This provides consistent styling, better accessibility, and flexible color customization across all tab implementations.

## Tab Implementation

### DaisyUI Tabs with Custom Colors
**Used in:** All pages (Auth, Projects, Customers, RFQDetail, AdminUsers, Settings)

**Implementation:**
```tsx
import { DaisyUITabs, DaisyUITabsList, DaisyUITabsTrigger, DaisyUITabsContent } from '@/components/ui/daisyui-tabs';

<DaisyUITabs defaultValue="tab1" variant="lift">
  <DaisyUITabsList>
    <DaisyUITabsTrigger value="tab1">Tab 1</DaisyUITabsTrigger>
    <DaisyUITabsTrigger value="tab2">Tab 2</DaisyUITabsTrigger>
  </DaisyUITabsList>
  
  <DaisyUITabsContent value="tab1">
    Content for tab 1
  </DaisyUITabsContent>
  
  <DaisyUITabsContent value="tab2">
    Content for tab 2
  </DaisyUITabsContent>
</DaisyUITabs>
```

**Custom Colors:**
```tsx
<DaisyUITabsTrigger 
  value="tab1"
  activeColor="white"
  activeBgColor="orange"
  activeBorderColor="orange"
>
  Custom Orange Tab
</DaisyUITabsTrigger>
```

**Components:**
- `DaisyUITabs` - Main container with variant support
- `DaisyUITabsList` - Tab navigation container
- `DaisyUITabsTrigger` - Individual tab button with custom colors
- `DaisyUITabsContent` - Tab content panel

## Pages Using Tabs

### 1. Auth Page (`/auth`)
- **Implementation:** DaisyUI tabs with lift variant
- **Tabs:** Sign In, Sign Up
- **Status:** ✅ Migrated to unified system

### 2. Projects Page (`/projects`)
- **Implementation:** DaisyUI tabs with lift variant
- **Tabs:** List, Workflow, Calendar, Analytics
- **Status:** ✅ Migrated to unified system

### 3. Customers Page (`/customers`)
- **Implementation:** DaisyUI tabs with lift variant
- **Tabs:** All Customers, Analytics
- **Status:** ✅ Migrated to unified system

### 4. RFQDetail Page (`/rfq/:id`)
- **Implementation:** DaisyUI tabs with lift variant
- **Tabs:** Overview, Internal Reviews, Approvals, Documents, Activity Log
- **Status:** ✅ Migrated to unified system

### 5. AdminUsers Page (`/admin/users`)
- **Implementation:** DaisyUI tabs with lift variant
- **Tabs:** Users, Activity
- **Status:** ✅ Migrated to unified system

### 6. Settings Page (`/settings`)
- **Implementation:** DaisyUI tabs with lift variant
- **Tabs:** General, Notifications, Admin (conditional)
- **Status:** ✅ Migrated to unified system

## CSS Files

### 1. `src/styles/tab-system-fix.css`
- **Purpose:** Unified tab styling with custom color support
- **Features:**
  - CSS custom properties for dynamic colors
  - Support for all DaisyUI tab variants
  - Dark mode enhancements
  - Responsive design
  - High specificity overrides

### 2. `src/components/ui/daisyui-tabs.tsx`
- **Purpose:** Unified tab component implementation
- **Features:**
  - Custom color support via CSS custom properties
  - Multiple variant support (lift, boxed, bordered)
  - Proper accessibility attributes
  - TypeScript interfaces

## Tab Variants

### 1. Lift Variant (`variant="lift"`)
- Tabs appear to lift when active
- Enhanced shadow effects
- Smooth transitions

### 2. Boxed Variant (`variant="boxed"`)
- Tabs in a boxed container
- Background and border styling
- Good for contained layouts

### 3. Bordered Variant (`variant="bordered"`)
- Tabs with borders
- Bottom border for active tab
- Clean, minimal appearance

## Custom Colors

### CSS Custom Properties
The tab system uses CSS custom properties for dynamic color changes:

```css
.tab-active {
    color: var(--tab-color, hsl(var(--p))) !important;
    background-color: var(--tab-bg, hsl(var(--p))) !important;
    border-color: var(--tab-border-color, hsl(var(--p))) !important;
}
```

### Color Properties
- `activeColor` - Text color when active
- `activeBgColor` - Background color when active
- `activeBorderColor` - Border color when active

### Color Examples
```tsx
// Orange tabs
<DaisyUITabsTrigger 
  activeColor="white"
  activeBgColor="orange"
  activeBorderColor="orange"
>

// Success green tabs
<DaisyUITabsTrigger 
  activeColor="white"
  activeBgColor="#10b981"
  activeBorderColor="#10b981"
>

// Custom purple tabs
<DaisyUITabsTrigger 
  activeColor="white"
  activeBgColor="#8b5cf6"
  activeBorderColor="#8b5cf6"
>
```

## Accessibility

### ARIA Attributes
- `role="tab"` - Identifies the element as a tab
- `aria-selected` - Indicates if the tab is selected
- `aria-disabled` - Indicates if the tab is disabled
- `role="tablist"` - Container for tabs
- `role="tabpanel"` - Content area for each tab

### Keyboard Navigation
- Tab key navigation between tabs
- Enter/Space to activate tabs
- Arrow keys for tab switching (future enhancement)

## Theme Support

### Light Theme
- Uses theme primary colors by default
- Custom colors override theme colors
- Consistent with DaisyUI theme system

### Dark Theme
- Automatically adapts to dark theme
- Custom colors work in both themes
- Enhanced shadows and effects

## Responsive Design

### Desktop (768px+)
- Full tab labels
- Standard padding and spacing
- All variants work properly

### Tablet (480px-768px)
- Reduced padding
- Smaller font sizes
- Maintains functionality

### Mobile (<480px)
- Increased touch targets
- Simplified layouts
- Maintains accessibility

## Usage Examples

### Basic Usage
```tsx
<DaisyUITabs defaultValue="tab1" variant="lift">
  <DaisyUITabsList>
    <DaisyUITabsTrigger value="tab1">Tab 1</DaisyUITabsTrigger>
    <DaisyUITabsTrigger value="tab2">Tab 2</DaisyUITabsTrigger>
  </DaisyUITabsList>
  
  <DaisyUITabsContent value="tab1">
    Content for tab 1
  </DaisyUITabsContent>
  
  <DaisyUITabsContent value="tab2">
    Content for tab 2
  </DaisyUITabsContent>
</DaisyUITabs>
```

### Custom Colors
```tsx
<DaisyUITabs defaultValue="custom" variant="boxed">
  <DaisyUITabsList>
    <DaisyUITabsTrigger 
      value="custom"
      activeColor="white"
      activeBgColor="orange"
      activeBorderColor="orange"
    >
      Custom Tab
    </DaisyUITabsTrigger>
  </DaisyUITabsList>
  
  <DaisyUITabsContent value="custom">
    Custom colored tab content
  </DaisyUITabsContent>
</DaisyUITabs>
```

### Multiple Variants
```tsx
// Lift variant
<DaisyUITabs variant="lift">

// Boxed variant
<DaisyUITabs variant="boxed">

// Bordered variant
<DaisyUITabs variant="bordered">
```

## Testing Checklist

- [ ] All tab variants work correctly
- [ ] Custom colors display properly
- [ ] Theme switching works
- [ ] Responsive design functions
- [ ] Keyboard navigation works
- [ ] Screen reader accessibility
- [ ] Tab state persistence
- [ ] Performance is maintained

## Troubleshooting

### Common Issues

1. **Custom colors not showing:**
   - Check CSS custom properties are set correctly
   - Verify color values are valid CSS colors
   - Ensure CSS specificity is high enough

2. **Tabs not responding:**
   - Check event handlers are properly connected
   - Verify tab values match content values
   - Ensure no JavaScript errors in console

3. **Styling inconsistencies:**
   - Check theme variables are loaded
   - Verify CSS imports are correct
   - Test in both light and dark themes

### Debug Steps

1. Open browser dev tools
2. Inspect tab elements
3. Check applied CSS custom properties
4. Verify ARIA attributes
5. Test keyboard navigation
6. Check console for errors

## Future Enhancements

1. **Animation Improvements:**
   - Smooth transitions between tabs
   - Enhanced hover effects
   - Loading states for tab content

2. **Additional Variants:**
   - Vertical tabs
   - Pill-shaped tabs
   - Icon-only tabs

3. **Advanced Features:**
   - Tab state persistence
   - URL-based tab routing
   - Dynamic tab generation

4. **Performance Optimizations:**
   - Lazy loading for tab content
   - Virtual scrolling for many tabs
   - Optimized re-renders
