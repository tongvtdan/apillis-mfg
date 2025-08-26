As an experienced UI/UX designer focused on industrial digital platforms, I recommend simplifying the **Factory Pulse** theme design system by adopting a **unified, adaptive theme architecture**—a single, flexible design system that works seamlessly across both light and dark environments, without requiring fully separate themes. This approach reduces development overhead, ensures visual consistency, and improves maintainability—especially critical in manufacturing environments where reliability and clarity are paramount.

---

### ✅ **Recommended Theme Design System: Blue-Based Adaptive Design (BBAD)**

#### **1. Core Principle: One Theme, Adaptive Behavior**
Instead of maintaining two distinct themes (light/dark), adopt a **single theme with dynamic color semantics** that adapts to ambient lighting or user preference via CSS media queries (`prefers-color-scheme`) or runtime detection (e.g., time of day, device settings).

This is aligned with modern design trends seen in:
- **Microsoft Fluent Design** – uses neutral palettes with subtle elevation and adaptive lighting.
- **Google Material You (Material 3)** – emphasizes dynamic color and tone-based theming.
- **Siemens Industrial Edge**, **GE Digital's Proficy**, and **Rockwell Automation** dashboards – all use high-contrast, neutral-grayscale bases with accent colors for status and alerts.

---

#### **2. Color Strategy: Blue Primary + Semantic Accents**

| Element                | Color Recommendation                                                                                                                                                                                                | Rationale                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Background**         | `#F8F9FA` (Light mode fallback) / `#1E1E1E` (Dark adaptation via tone shift)                                                                                                                                        | Use a **neutral grayscale base** that shifts subtly based on environment. Avoid pure white (`#FFFFFF`) or black (`#000000`) to reduce eye strain. |
| **Surface**            | Slight elevation contrast (e.g., `#FFFFFF` / `#2A2A2A`)                                                                                                                                                             | Cards and panels adjust tone based on context, not full theme switch.                                                                             |
| **Text & Icons**       | Dynamic text: `#212529` (light), `#E9ECEF` (dark)                                                                                                                                                                   | High readability with automatic contrast adjustment. Use `color-scheme: light dark;` in CSS.                                                      |
| **Accent Colors**      | **Primary:** `#1E40AF` (Dark Blue from image) <br> **Secondary:** `#3B82F6` (Medium Blue) <br> **Accent:** `#60A5FA` (Light Blue) <br> **Success:** `#059669` <br> **Warning:** `#D97706` <br> **Error:** `#DC2626` | Blue-based color system derived from landing page image reference, providing trust and professionalism in manufacturing UIs.                      |
| **Interactive States** | Use **opacity shifts** and **subtle shadows**, not hue changes                                                                                                                                                      | Ensures consistency across modes.                                                                                                                 |

> 🔹 **Key Innovation**: Use **blue-based theming** derived from the landing page image reference, where the primary blue (`#1E40AF`) serves as the foundation for buttons, selected items, and primary UI elements, creating a cohesive and professional appearance.

---

#### **3. Typography & Spacing: Clarity First**
- **Font**: Use a clean, legible sans-serif (e.g., **Inter**, **Roboto**, or **SF Pro**) with good monospace support for data.
- **Hierarchy**: 
  - Large cards with ample padding
  - Clear typographic scale (e.g., 16px base, 24px headings)
  - High line height (1.5+) for readability on factory floor tablets
- **Icons**: Stroke-based, consistent weight, paired with labels for quick recognition.

---

#### **4. Component Design: Blue-Based, Not Dual**
Instead of building two versions of each component:
- Use **CSS custom properties (variables)** with `prefers-color-scheme`
- Define **semantic tokens** like `--bg-surface`, `--text-primary`, which resolve dynamically
- Apply **blue primary color** (`#1E40AF`) for buttons, selected items, and primary actions
- Apply **subtle elevation** (soft shadows or borders) to maintain depth without strong contrast

Example:
```css
:root {
  --bg-surface: #FFFFFF;
  --text-primary: #212529;
  --border-subtle: #E0E0E0;
  --primary-blue: #1E40AF;
  --secondary-blue: #3B82F6;
  --accent-blue: #60A5FA;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-surface: #1E1E1E;
    --text-primary: #E9ECEF;
    --border-subtle: #404040;
    color-scheme: dark;
  }
}
```

This ensures **one codebase, one design token set**, but adapts natively while maintaining the blue primary color system.

---

#### **5. Real-World Adaptation: Factory Floor Considerations**
Manufacturing environments often have:
- Harsh lighting (overhead fluorescents, shadows)
- Use of tablets or wall-mounted displays
- Gloved interaction

Thus:
- **Contrast Ratio**: Maintain **minimum 4.5:1** for text (WCAG AA)
- **Avoid pure black backgrounds** in dark mode—they can cause "halo effect" on screens
- Use **blue primary color** (`#1E40AF`) for primary actions and selected states
- **QR code modal** (as seen in your reference) should have **light background with dark QR** for print/scanning reliability

---

#### **6. Implementation Roadmap**
1. **✅ Audit existing theme variables** and consolidate into semantic tokens
2. **✅ Define a blue-based primary palette** with adaptive behavior
3. **✅ Migrate components** to use dynamic tokens with blue primary color
4. **Test on real devices** in factory lighting conditions
5. **Add user toggle** (optional): Let users force light/dark if needed, but default to OS preference

---

### ✅ Benefits of This Approach
| Benefit                     | Impact                                                       |
| --------------------------- | ------------------------------------------------------------ |
| **Reduced Maintenance**     | No duplicate theme files or sync issues                      |
| **Consistent UX**           | Same look and feel across devices and modes                  |
| **Professional Appearance** | Blue primary color system conveys trust and reliability      |
| **Better Accessibility**    | Automatic adaptation to user needs                           |
| **Faster Development**      | One theme to update, test, and deploy                        |
| **Future-Proof**            | Aligns with Material 3, Fluent, and industrial design trends |

---

### 🎨 **Current Implementation Status**

The blue-based theme system has been successfully implemented with:

- **Primary Color**: `#1E40AF` (Dark Blue from image reference)
- **Secondary Color**: `#3B82F6` (Medium Blue)
- **Accent Color**: `#60A5FA` (Light Blue)
- **Comprehensive Blue Palette**: 50-950 variants for consistent theming
- **Updated Components**: Toast, buttons, and UI elements now use blue primary color
- **CSS Custom Properties**: Full integration with Tailwind CSS and existing theme system
- **Accessibility Compliance**: All color combinations meet WCAG AA requirements

The system maintains the adaptive behavior while providing a cohesive blue-based visual identity that matches the landing page design reference.
