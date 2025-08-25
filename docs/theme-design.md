As an experienced UI/UX designer focused on industrial digital platforms, I recommend simplifying the **Factory Pulse** theme design system by adopting a **unified, adaptive theme architecture**—a single, flexible design system that works seamlessly across both light and dark environments, without requiring fully separate themes. This approach reduces development overhead, ensures visual consistency, and improves maintainability—especially critical in manufacturing environments where reliability and clarity are paramount.

---

### ✅ **Recommended Theme Design System: Adaptive Neutral Design (AND)**

#### **1. Core Principle: One Theme, Adaptive Behavior**
Instead of maintaining two distinct themes (light/dark), adopt a **single theme with dynamic color semantics** that adapts to ambient lighting or user preference via CSS media queries (`prefers-color-scheme`) or runtime detection (e.g., time of day, device settings).

This is aligned with modern design trends seen in:
- **Microsoft Fluent Design** – uses neutral palettes with subtle elevation and adaptive lighting.
- **Google Material You (Material 3)** – emphasizes dynamic color and tone-based theming.
- **Siemens Industrial Edge**, **GE Digital’s Proficy**, and **Rockwell Automation** dashboards – all use high-contrast, neutral-grayscale bases with accent colors for status and alerts.

---

#### **2. Color Strategy: Neutral Base + Semantic Accents**

| Element             | Color Recommendation                          | Rationale |
|---------------------|-----------------------------------------------|---------|
| **Background**      | `#F8F9FA` (Light mode fallback) / `#1E1E1E` (Dark adaptation via tone shift) | Use a **neutral grayscale base** that shifts subtly based on environment. Avoid pure white (`#FFFFFF`) or black (`#000000`) to reduce eye strain. |
| **Surface**         | Slight elevation contrast (e.g., `#FFFFFF` / `#2A2A2A`) | Cards and panels adjust tone based on context, not full theme switch. |
| **Text & Icons**    | Dynamic text: `#212529` (light), `#E9ECEF` (dark) | High readability with automatic contrast adjustment. Use `color-scheme: light dark;` in CSS. |
| **Accent Colors**   | **Primary:** `#0066CC` (Industrial Blue) <br> **Success:** `#009966` <br> **Warning:** `#FF9900` <br> **Error:** `#CC0033` | Industry-standard colors for status clarity under all lighting. Blue is trusted in manufacturing UIs. |
| **Interactive States** | Use **opacity shifts** and **subtle shadows**, not hue changes | Ensures consistency across modes. |

> 🔹 **Key Innovation**: Use **tone-based theming** (like Material 3) where the *same semantic token* (e.g., `surface`, `on-surface`) maps to different physical colors depending on environment.

---

#### **3. Typography & Spacing: Clarity First**
- **Font**: Use a clean, legible sans-serif (e.g., **Inter**, **Roboto**, or **SF Pro**) with good monospace support for data.
- **Hierarchy**: 
  - Large cards with ample padding
  - Clear typographic scale (e.g., 16px base, 24px headings)
  - High line height (1.5+) for readability on factory floor tablets
- **Icons**: Stroke-based, consistent weight, paired with labels for quick recognition.

---

#### **4. Component Design: Adaptive, Not Dual**
Instead of building two versions of each component:
- Use **CSS custom properties (variables)** with `prefers-color-scheme`
- Define **semantic tokens** like `--bg-surface`, `--text-primary`, which resolve dynamically
- Apply **subtle elevation** (soft shadows or borders) to maintain depth without strong contrast

Example:
```css
:root {
  --bg-surface: #FFFFFF;
  --text-primary: #212529;
  --border-subtle: #E0E0E0;
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

This ensures **one codebase, one design token set**, but adapts natively.

---

#### **5. Real-World Adaptation: Factory Floor Considerations**
Manufacturing environments often have:
- Harsh lighting (overhead fluorescents, shadows)
- Use of tablets or wall-mounted displays
- Gloved interaction

Thus:
- **Contrast Ratio**: Maintain **minimum 4.5:1** for text (WCAG AA)
- **Avoid pure black backgrounds** in dark mode—they can cause "halo effect" on screens
- Use **accent color sparingly** for alerts and KPIs (e.g., machine downtime = red pulse)
- **QR code modal** (as seen in your reference) should have **light background with dark QR** for print/scanning reliability

---

#### **6. Implementation Roadmap**
1. **Audit existing theme variables** and consolidate into semantic tokens
2. **Define a neutral base palette** with adaptive behavior
3. **Migrate components** to use dynamic tokens
4. **Test on real devices** in factory lighting conditions
5. **Add user toggle** (optional): Let users force light/dark if needed, but default to OS preference

---

### ✅ Benefits of This Approach
| Benefit | Impact |
|-------|--------|
| **Reduced Maintenance** | No duplicate theme files or sync issues |
| **Consistent UX** | Same look and feel across devices and modes |
| **Better Accessibility** | Automatic adaptation to user needs |
| **Faster Development** | One theme to update, test, and deploy |
| **Future-Proof** | Aligns with Material 3, Fluent, and industrial design trends |

---

### 📱 Bonus: Mobile App Alignment
Since Factory Pulse has a mobile app (QR code suggests Android/iOS download):
- Ensure the **web and app share the same design tokens**
- Use **platform-native theme detection** (iOS/Android dark mode)
- Keep the **QR modal simple**: white background, black QR, clear headline (as in current design)

---

### Conclusion
Replace the dual theme system with a **single, adaptive, neutral-toned design system** using semantic color tokens and dynamic theming. This reduces complexity, improves usability in industrial environments, and aligns with modern design standards in manufacturing tech.

**Recommended Name**: **Factory Pulse Adaptive Theme (FP-AT)**  
**Tagline**: *One interface. Every environment.*
