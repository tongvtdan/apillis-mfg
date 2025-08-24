

Based on your vision for **Factory Pulse** — a modern, clean, minimal, and highly functional **MES platform** — we need a **design system and UI theme** that reflects **precision, clarity, and operational efficiency**, much like the manufacturing processes it supports.

Below are **curated theme recommendations** — including **design systems, color palettes, typography, and implementation tools** — all aligned with your goals of **simplicity, scalability, and professionalism**.

---

## 🎯 Design Principles for Factory Pulse

| Principle | Why It Matters |
|--------|----------------|
| **Modern** | Appeals to tech-forward manufacturers |
| **Clean & Minimal** | Reduces cognitive load on busy teams |
| **High Contrast** | Ensures readability on factory floor screens |
| **Role-Centric UI** | Each user sees only what they need |
| **Responsive** | Works on desktop, tablet, and mobile |
| **Dark Mode Ready** | Supports 24/7 operations in low-light environments |

---

## 🎨 Recommended Design System: **Tailwind UI + Modern Minimal Aesthetic**

You’re already using **Tailwind CSS** — excellent choice. Let’s enhance it with a **refined, production-grade theme**.

### ✅ Best Theme: **[DaisyUI](https://daisyui.com) + Custom Factory Pulse Layer**

> **Why DaisyUI?**
> - Built on **Tailwind CSS**
> - Clean, minimal, component-rich
> - Built-in **dark mode**, themes, and accessibility
> - Highly customizable
> - Perfect for **internal tools and SaaS**

#### 🎨 Factory Pulse Theme (Custom DaisyUI-inspired)

```js
// daisyui.config.js
themes: [
  {
    factorypulse: {
      primary: "#03DAC6",     // Teal (modern, energetic)
      secondary: "#BB86FC",   // Purple (soft contrast)
      accent: "#FFD740",      // Amber (for alerts, supplier status)
      neutral: "#1F2937",     // Dark slate (clean base)
      "base-100": "#FFFFFF",  // White background (light mode)
      "base-200": "#F9FAFB",  // Light gray
      "base-300": "#E5E7EB",  // Divider lines
      info: "#2196F3",        // Blue
      success: "#4CAF50",     // Green
      warning: "#FB8C00",     // Orange
      error: "#CF6679",       // Pink-red (error, overdue)
      "primary-content": "#000000", // Black text on primary
    },
  },
  {
    factorypulse_dark: {
      primary: "#03DAC6",
      secondary: "#BB86FC",
      accent: "#FFD740",
      neutral: "#1E1E1E",     // Near-black
      "base-100": "#121212",  // Dark background
      "base-200": "#1E1E1E",
      "base-300": "#2D2D2D",
      info: "#448AFF",
      success: "#4CAF50",
      warning: "#FFAB40",
      error: "#CF6679",
      "primary-content": "#FFFFFF", // White text
    },
  },
]
```

> ✅ Use `factorypulse` for light mode, `factorypulse_dark` for dark mode.

---

## 🖋️ Typography: Clean & Readable

### **Font Pairing: Inter + Space Mono**

| Use | Font | Why |
|-----|------|-----|
| **UI & Body** | [Inter](https://rsms.me/inter/) | Modern, highly readable, designed for screens |
| **Code & Data** | [Space Mono](https://fonts.google.com/specimen/Space+Mono) | Monospace for BOMs, IDs, logs |
| **Headings** | Inter (Semi-Bold) | Clean hierarchy |

```html
<!-- In index.html -->
<link href="https://rsms.me/inter/inter.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Space+Mono&display=swap" rel="stylesheet">
```

```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.code, .rfq-id {
  font-family: 'Space Mono', monospace;
}
```

---

## 🎨 Color Palette: Factory Pulse Official

| Color | Hex | Use Case |
|------|-----|---------|
| **Pulse Teal** | `#03DAC6` | Primary buttons, active states, highlights |
| **Signal Purple** | `#BB86FC` | Secondary actions, QA status |
| **Alert Amber** | `#FFD740` | Warnings, pending, medium priority |
| **Go Green** | `#69F0AE` | Success, approved, completed |
| **Urgent Red** | `#CF6679` | High priority, overdue, errors |
| **Neutral Gray** | `#E5E7EB` / `#1E1E1E` | Borders, backgrounds |
| **Text Dark** | `#111827` | Light mode text |
| **Text Light** | `#E0E0E0` | Dark mode text |

> ✅ This palette is **accessible (WCAG AA+)** and works in both light and dark modes.

---

## 🧩 UI Components & Layout Style

### 1. **Kanban Board**
- **Cards**: Soft rounded corners (`rounded-lg`), subtle shadow (`shadow-sm`)
- **Badges**: Circular for priority: 🔴🟡🟢
- **Drag Handle**: `::before` grip icon on left
- **Virtual Scroll**: For 100+ RFQs

### 2. **Project Detail Page**
- **Tabbed Layout**: Minimal tabs, no heavy borders
- **Review Forms**: Clean inputs, expandable sections
- **Document List**: Table view with icons, version tags

### 3. **RFQ Intake Form**
- **Card-based steps**: "Project", "Customer", "Files"
- **Progress indicator**: Dots or line
- **File Upload**: Drag & drop zone with preview

### 4. **Dashboard**
- **KPI Cards**: White (light) or dark cards with accent borders
- **Charts**: Minimalist, using `#03DAC6`, `#BB86FC`, `#FFD740`
- **No clutter**: Only essential metrics

---

## 🧰 Implementation Tools

| Tool | Purpose |
|------|--------|
| **[DaisyUI](https://daisyui.com)** | Pre-built Tailwind components (modals, cards, dropdowns) |
| **[Heroicons](https://heroicons.com)** | Clean, minimal SVG icons |
| **[Tailwind CSS Typography Plugin](https://tailwindcss.com/docs/typography-plugin)** | Beautiful document rendering |
| **[daisyUI Theme Generator](https://daisyui.com/theme-generator/)** | Customize and export your theme |
| **[Figma Community - Minimal UI Kits](https://www.figma.com/community)** | For design mockups |

---

## 🖼️ Visual Style Inspiration

Here are **real-world design systems** to draw inspiration from:

| Name | Why It Fits |
|------|------------|
| **Linear.app** | Ultra-clean, minimal, fast — perfect for workflow apps |
| **Vercel Dashboard** | Developer-friendly, elegant, dark mode |
| **Notion** | Structured, role-based, document-centric |
| **Figma** | Collaborative, intuitive, scalable |
| **Supabase Dashboard** | Functional, clean, built for builders |

> 💡 **Factory Pulse should feel like a blend of Notion’s clarity + Linear’s speed + Supabase’s utility**

---

## 🧪 Live Theme Demo (Preview)

You can **test the theme instantly**:

1. Go to: [https://daisyui.com/theme-generator/](https://daisyui.com/theme-generator/)
2. Set:
   - Primary: `03DAC6`
   - Secondary: `BB86FC`
   - Accent: `FFD740`
   - Neutral: `1F2937`
   - Base: `FFFFFF`
   - Error: `CF6679`
3. Click “Export” → Copy CSS → Paste into your project

---

## ✅ Final Theme Recommendation

| Category | Choice |
|--------|--------|
| **Design System** | Tailwind CSS + DaisyUI |
| **Theme Name** | `factorypulse` (light) / `factorypulse_dark` (dark) |
| **Primary Color** | `#03DAC6` (Pulse Teal) |
| **Typography** | Inter (UI), Space Mono (data) |
| **Icons** | Heroicons |
| **Dark Mode** | Built-in, user-toggleable |
| **Accessibility** | WCAG AA compliant |
| **Customization** | Admin can tweak via theme config (Phase 3) |

---

## 🚀 Next Steps

1. **Install DaisyUI**:
   ```bash
   npm install -D daisyui@latest
   ```
2. **Add to `tailwind.config.js`**:
   ```js
   plugins: [require('daisyui')],
   daisyui: {
     themes: ["light", "dark", "factorypulse", "factorypulse_dark"],
   },
   ```
3. **Apply theme toggle** in header:
   ```jsx
   <button onClick={() => setTheme(theme === 'factorypulse' ? 'factorypulse_dark' : 'factorypulse')}>
     {theme === 'factorypulse' ? '🌙' : '☀️'}
   </button>
   ```
