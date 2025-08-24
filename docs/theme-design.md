# Factory Pulse Design Theme Specification


## 🎨 Design System Overview

### Core Principles
- **Modern & Clean**: Minimalist design focused on usability
- **Professional**: Suitable for manufacturing and industrial environments
- **High Contrast**: Ensures readability on factory floor displays
- **Role-Centric**: Interface adapts to user roles and responsibilities
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices

### Color Palette
```json
{
  "primary": "#03DAC6",     // Teal/Cyan - main brand color
  "primary-content": "#000000",
  "secondary": "#BB86FC",   // Purple - secondary actions
  "secondary-content": "#FFFFFF",
  "accent": "#FFD740",      // Amber - warnings and highlights
  "accent-content": "#1F2937",
  "neutral": "#1F2937",     // Dark slate - base elements
  "neutral-content": "#FFFFFF",
  "base-100": "#FFFFFF",    // White - light mode background
  "base-200": "#F9FAFB",    // Light gray - secondary backgrounds
  "base-300": "#E5E7EB",    // Medium gray - borders and dividers
  "base-content": "#1F2937", // Dark text
  "info": "#2196F3",        // Blue - informational elements
  "success": "#4CAF50",     // Green - success states
  "warning": "#FB8C00",     // Orange - warnings
  "error": "#CF6679"        // Pink-red - errors and critical items
}
```

### Typography
```json
{
  "font-family": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  "font-size": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem"
  },
  "font-weight": {
    "normal": 400,
    "medium": 500,
    "semibold": 600,
    "bold": 700
  },
  "line-height": {
    "tight": "1.25",
    "normal": "1.5",
    "loose": "1.75"
  }
}
```

### Spacing System
```json
{
  "spacing": {
    "px": "1px",
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
    "32": "8rem"
  }
}
```

### Component Design

#### Buttons
```json
{
  "button": {
    "primary": {
      "background": "linear-gradient(135deg, #03DAC6 0%, #0288D1 100%)",
      "color": "white",
      "border-radius": "0.5rem",
      "padding": "0.75rem 1.5rem",
      "font-weight": "600",
      "box-shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      "transition": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    },
    "secondary": {
      "background": "transparent",
      "color": "#1F2937",
      "border": "2px solid #E5E7EB",
      "border-radius": "0.5rem",
      "padding": "0.75rem 1.5rem",
      "font-weight": "600"
    },
    "outline": {
      "background": "transparent",
      "color": "#1F2937",
      "border": "2px solid #E5E7EB",
      "border-radius": "0.5rem",
      "padding": "0.75rem 1.5rem",
      "font-weight": "600",
      "hover": {
        "border-color": "#03DAC6",
        "color": "#03DAC6"
      }
    }
  }
}
```

#### Cards
```json
{
  "card": {
    "background": "white",
    "border-radius": "1rem",
    "border": "1px solid #E5E7EB",
    "box-shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "transition": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "hover": {
      "transform": "translateY(-4px)",
      "box-shadow": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  }
}
```

#### Kanban Board
```json
{
  "kanban": {
    "column": {
      "background": "#F9FAFB",
      "border-radius": "1rem",
      "padding": "1.5rem",
      "width": "20rem",
      "min-width": "20rem"
    },
    "card": {
      "background": "#F9FAFB",
      "border-radius": "1rem",
      "padding": "1.5rem",
      "margin-bottom": "1rem",
      "cursor": "grab",
      "transition": "all 0.2s ease"
    },
    "priority": {
      "high": {
        "background": "linear-gradient(135deg, #CF6679 0%, #B71C1C 100%)",
        "color": "white"
      },
      "medium": {
        "background": "linear-gradient(135deg, #FFD740 0%, #FF8F00 100%)",
        "color": "#1F2937"
      },
      "low": {
        "background": "linear-gradient(135deg, #69F0AE 0%, #00C853 100%)",
        "color": "white"
      }
    }
  }
}
```

#### Navigation Header
```json
{
  "header": {
    "background": "white",
    "border-bottom": "1px solid #E5E7EB",
    "backdrop-filter": "blur(12px)",
    "box-shadow": "0 1px 3px rgba(0, 0, 0, 0.1)",
    "height": "4rem",
    "padding": "0 1rem",
    "position": "sticky",
    "top": "0",
    "z-index": "50"
  }
}
```

#### Forms and Inputs
```json
{
  "form": {
    "input": {
      "background": "white",
      "border": "1px solid #E5E7EB",
      "border-radius": "0.5rem",
      "padding": "0.75rem 1rem",
      "font-size": "1rem",
      "transition": "border-color 0.2s ease",
      "focus": {
        "outline": "2px solid #03DAC6",
        "outline-offset": "2px",
        "border-color": "#03DAC6"
      }
    },
    "label": {
      "font-weight": "500",
      "margin-bottom": "0.5rem",
      "display": "block"
    }
  }
}
```

### Dark Mode Theme
```json
{
  "dark": {
    "base-100": "#121212",
    "base-200": "#1E1E1E",
    "base-300": "#2D2D2D",
    "base-content": "#E0E0E0",
    "neutral": "#1E1E1E"
  }
}
```

### Iconography
- **Primary Icon Set**: Lucide Icons or Font Awesome
- **Icon Sizes**: 
  - Small: 16px
  - Medium: 20px
  - Large: 24px
- **Usage Guidelines**:
  - Primary actions: Solid icons
  - Secondary actions: Regular icons
  - Interactive elements: Hover effects (color change, slight scale)

### Layout Structure
```json
{
  "layout": {
    "max-width": "80rem",
    "padding": {
      "horizontal": "1rem",
      "vertical": "1.5rem"
    },
    "breakpoints": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px"
    }
  }
}
```

### Animation & Transitions
```json
{
  "transitions": {
    "fast": "150ms",
    "normal": "300ms",
    "slow": "500ms"
  },
  "easing": {
    "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
    "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
    "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
    "spring": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
  }
}
```

### Accessibility Features
- WCAG AA compliance for color contrast
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators for interactive elements
- Semantic HTML structure
- ARIA labels for icons and interactive elements

### Responsive Design Guidelines
- Mobile-first approach
- Breakpoints at 640px, 768px, 1024px, and 1280px
- Touch-friendly tap targets (minimum 44px)
- Collapsible navigation on mobile
- Vertical stacking of columns on small screens

### Brand Identity Elements
- **Logo**: "FP" monogram with factory icon
- **Tagline**: "The Heartbeat of Modern Manufacturing"
- **Brand Voice**: Professional, precise, and empowering
- **Visual Metaphor**: Heartbeat/EKG line adapted to factory roof silhouette

