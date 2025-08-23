Absolutely. Below is a **text-based Figma Wireframe Pack** for **Factory Pulse**, designed to reflect your **comprehensive PRD and feature list**, with a focus on clarity, usability, and scalability.

This pack includes **key screens** of the application, described in structured text format so you or a designer can easily translate them into actual Figma designs, prototypes, or development components.

---

# 🎨 Factory Pulse  - Light mode

**Text-Based Figma Wireframe Pack**

> *Designed for manufacturing teams — from inquiry to delivery.*

---

## 🖼️ Screen 1: **Login & Authentication**

```
┌─────────────────────────────────────────────────────────────┐
│                          FACTORY PULSE                      │
└─────────────────────────────────────────────────────────────┘

          [Logo: Factory Pulse]
          [Tagline: The heartbeat of your factory.]

  ┌─────────────────────────────────────────────────────────┐
  │                   Sign In to Your Account               │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  Email Address                                          │
  │  ┌───────────────────────────────────────────────────┐  │
  │  │ user@company.com                                   │  │
  │  └───────────────────────────────────────────────────┘  │
  │                                                         │
  │  Password                                               │
  │  ┌───────────────────────────────────────────────────┐  │
  │  │ ••••••••••                                         │  │
  │  └───────────────────────────────────────────────────┘  │
  │                                                         │
  │  [ ] Remember me                                        │
  │                                                         │
  │              [Sign In]           [Forgot Password?]     │
  │                                                         │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │  Need an account? Contact your administrator            │
  └─────────────────────────────────────────────────────────┘
```

> 💡 Optional: Add **SSO buttons** (Google, Microsoft) for future.

---

## 🖼️ Screen 2: **Kanban Dashboard (Main View)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Factory Pulse                                                                                                      │
│  🔔 3 Notifications  │  👤 Anna Tran (Procurement Owner)  │  🌐 Projects  │  📂 Documents  │  📊 Analytics            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

🔍 Search RFQs: [ P-25082001 or "connector housing"                   ]   🎯 Filter: All | High | Overdue | Mine

🟢 P-25082203 – New Enclosure Design (Low priority)  
👤 Anna Tran · 📅 Aug 22 · 📎 4 files

🔴 P-25082101 – Motor Bracket (High priority)  
👤 David Kim · 📅 Aug 21 · 📎 6 files · ⚠️ 2 risks logged

🟡 P-25082001 – Sensor Mount (Medium)  
👤 Sarah Lee · 📅 Aug 20 · 📎 3 files · ✅ Eng: Approved

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

┌─────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│  Inquiry Received       │   │  Technical Review        │   │  Supplier RFQ Sent       │   │  Quoted                  │
│  (2)                    │   │  (1)                     │   │  (1)                     │   │  (0)                     │
│                         │   │                         │   │                         │   │                         │
│  🟢 P-25082203          │   │  🔴 P-25082101           │   │  🟡 P-25082001           │   │                         │
│  🔴 P-25082101          │   │                         │   │  (2/3 quotes in)         │   │                         │
│                         │   │                         │   │                         │   │                         │
└─────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘

┌─────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│  Order Confirmed        │   │  In Production           │   │  Shipped & Closed        │
│  (0)                    │   │  (0)                     │   │  (3)                     │
│                         │   │                         │   │                         │
│                         │   │                         │   │  ✅ P-25081501           │
│                         │   │                         │   │  ✅ P-25081002           │
│                         │   │                         │   │  ✅ P-25080503           │
│                         │   │                         │   │                         │
└─────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘
```

> ✅ Features:
> - Drag-and-drop between columns
> - Priority color: 🔴 High, 🟡 Medium, 🟢 Low
> - Badges: 📎 files, ⚠️ risks, ✅ approvals
> - Search + filter bar
> - Top navigation

---

## 🖼️ Screen 3: **Project Detail Page (P-25082001)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Project: P-25082001 – Sensor Mount | Status: Supplier RFQ Sent | Priority: Medium                                  │
│  🏢 Customer: TechNova Inc. | 📅 Created: Aug 20, 2025 | 👤 Owner: Sarah Lee                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  NAVIGATION │ │  DETAILS                                                                                           │
├─────────────┤ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Overview    │ │ Title:        Sensor Mount – Aluminum Alloy                                                       │
│ Documents   │ │ Description:  High-precision mount for industrial sensors                                           │
│ Reviews     │ │ Volume:       5,000 pcs                                                                             │
│ Supplier    │ │ Target Price: $8.50/unit                                                                            │
│ Timeline    │ │ Delivery:    Oct 15, 2025                                                                           │
│ Analytics   │ │ Notes:       Customer open to alternative materials                                                │
│ Settings    │ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
│             │
│             │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│             │ │  DOCUMENTS                                                                                         │
│             │ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│             │ │ 📄 Sensor_Mount_Drawing_REV2.pdf  [v2]  📅 Aug 20 · 👤 Sarah · 🔒 Internal Only                      │
│             │ │ 📄 BOM_SensorMount.xlsx         [v1]  📅 Aug 20 · 👤 Anna                                           │
│             │ │ 📄 Material_Spec_Al6061.pdf     [v1]  📅 Aug 20 · 👤 Engineering                                    │
│             │ │                                                                                                    │
│             │ │ [+] Upload New File                                                                                │
│             │ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
│             │
│             │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│             │ │  INTERNAL REVIEWS                                                                                  │
│             │ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│             │ │ ✅ Engineering                                                                       👤 Minh · Aug 21│
│             │ │   - Design feasible, no major risks                                                  📅 14:30       │
│             │ │   - Suggest anodizing for corrosion resistance                                                      │
│             │ │                                                                                                    │
│             │ │ ✅ QA                                                                                👤 Linh · Aug 21│
│             │ │   - CMM inspection required for critical dimensions                                                 │
│             │ │                                                                                                    │
│             │ │ 🟡 Production                                                                          👤 Hung · Aug 21│
│             │ │   - Tooling required: custom jig ($1,200)                                                           │
│             │ │   - Cycle time: ~4.5 min/unit → may impact lead time                                                │
│             │ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
│             │
│             │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│             │ │  SUPPLIER RFQ SENT                                                                                 │
│             │ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│             │ │ 📧 Sent to:                                                                                         │
│             │ │   • Precision Metals Co. (joe@precimetals.com) – 🟡 Pending (Due: Aug 25)                            │
│             │ │   • CNC Masters Inc. (quotes@cnchub.com) – ✅ Received ($7.80/unit)                                   │
│             │ │   • Alpha Fabricators (rfq@alphafab.com) – ✅ Received ($8.10/unit)                                   │
│             │ │                                                                                                    │
│             │ │ [📤 Resend]  [➕ Add Supplier]  [📅 Set Deadline]                                                     │
│             │ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
│             │
│             │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│             │ │  ACTIVITY & COMMENTS                                                                               │
│             │ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│             │ │ 📅 Aug 25, 10:15 – Sarah (Sales)                                                                   │
│             │ │   Updated target price to $8.20 based on supplier quotes                                            │
│             │ │                                                                                                    │
│             │ │ 📅 Aug 21, 16:20 – Anna (Procurement)                                                              │
│             │ │   Sent RFQ to 3 suppliers – deadline Aug 25                                                         │
│             │ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
└─────────────┘ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> ✅ Features:
> - Tabbed navigation
> - Versioned documents with access control
> - Review status per department
> - Supplier RFQ tracking with status
> - Activity timeline

---

## 🖼️ Screen 4: **RFQ Intake Portal (Public Form)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             Submit Your Manufacturing Inquiry                                                      │
│                                  We'll get back to you within 48 hours                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

[ ] I'm submitting as a Customer  
[ ] I'm a Sales Representative submitting on behalf of a customer

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Project Details                                                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Project Title*        [ High-Precision Sensor Mount ]                                                              │
│ Description           [ Durable aluminum mount for industrial sensors... ]                                         │
│ Estimated Volume      [ 5,000 ] pcs                                                                                │
│ Target Price          [ $8.50 ] /unit                                                                              │
│ Desired Delivery Date [ 📅 Oct 15, 2025 ]                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Customer Information                                                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Name*                 [ Sarah Chen ]                                                                               │
│ Company*              [ TechNova Inc. ]                                                                            │
│ Email*                [ sarah.chen@technova.com ]                                                                  │
│ Phone                 [ +1-555-123-4567 ]                                                                          │
│ Country               [ United States ▼ ]                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Attach Files                                                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📎 Drag & drop files or click to upload                                                                             │
│   Supported: PDF, STEP, IGES, XLSX, DWG, SLDPRT (Max 50MB)                                                          │
│                                                                                                                     │
│   [ Sensor_Mount_Drawing.pdf ] ✅                                                                                   │
│   [ BOM_SensorMount.xlsx ] ✅                                                                                       │
│                                                                                                                     │
│   [+] Add Another File                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

[ ] I agree to the Terms of Service and Privacy Policy

                     [Submit Inquiry]                                  [Save as Draft]
```

> ✅ Features:
> - Auto-ID generation on submit
> - Required fields marked
> - File validation
> - Confirmation email sent

---

## 🖼️ Screen 5: **Metrics & Analytics Dashboard**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Analytics Dashboard                                                                                                │
│  📅 Last 30 Days  |  🏢 All Customers  |  👥 All Teams                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│  Avg. RFQ Cycle Time│ │  Win Rate           │ │  Supplier Response   │ │  On-Time Quote       │
│  6.8 days          │ │  48%                │ │  Rate                │ │  Delivery Rate        │
│  ▼ 2.2 days        │ │  ▲ 13%               │ │  89%                 │ │  92%                  │
│  (vs. 9.0)         │ │  (vs. 35%)           │ │  ▲ 29%               │ │  ▲ 12%                │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘

📊 Lead Time by Phase (Days)
Inquiry → Review → Supplier RFQ → Quoted → Order
  1.2     2.1       2.8         0.7      0.0

🔥 Bottlenecks Detected:
• Supplier RFQ phase exceeds SLA (target: 2 days, actual: 2.8)
• 3 RFQs delayed due to missing drawings

📈 Win/Loss Analysis
Won: 12  │  Lost: 7  │  Pending: 4

Top Reasons for Loss:
1. Price (60%)  
2. Lead Time (30%)  
3. Capability (10%)

🔄 Supplier Performance (Top 5)
| Supplier             | Quote Submission | On-Time Delivery | Quality Score |
|----------------------|------------------|------------------|---------------|
| CNC Masters Inc.     | 98%              | 95%              | 4.8/5.0       |
| Precision Metals Co. | 85%              | 90%              | 4.5/5.0       |
| Alpha Fabricators    | 92%              | 88%              | 4.3/5.0       |

[Export Report] [Customize View]
```

> ✅ Features:
> - KPI cards with trend arrows
> - Bottleneck detection
> - Supplier performance table
> - Exportable

---

## 🖼️ Screen 6: **Admin: Workflow Configuration**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Admin Panel: Workflow Configuration                                                                                │
│  👤 Admin  |  🏢 Factory Pulse  |  🔐 Secure Mode                                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

📌 Configure your project lifecycle stages and rules.

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Workflow Stages                                                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [+] Add New Stage                                                                                                   │
│                                                                                                                     │
│  ┌───┬──────────────────────────┬───────┬───────┐                                                                    │
│  │ 🔘 │ Inquiry Received         │  🔵   │  1    │                                                                    │
│  │ 🔘 │ Technical Review         │  🟡   │  2    │                                                                    │
│  │ 🔘 │ Supplier RFQ Sent        │  🟠   │  3    │                                                                    │
│  │ 🔘 │ Quoted                   │  🟢   │  4    │                                                                    │
│  │ 🔘 │ Order Confirmed          │  🔵   │  5    │                                                                    │
│  │ 🔘 │ In Production            │  🟣   │  6    │                                                                    │
│  │ 🔘 │ Shipped & Closed         │  🟤   │  7    │                                                                    │
│  └───┴──────────────────────────┴───────┴───────┘                                                                    │
│                                                                                                                     │
│  Drag to reorder stages. Click to edit name, color, order.                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Stage Transitions                                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Allow transition from:                                                                                              │
│ [Inquiry Received ▼] ➔ [Technical Review] ✅                                                                         │
│ [Technical Review ▼] ➔ [Supplier RFQ Sent] ✅                                                                        │
│ [Supplier RFQ Sent ▼] ➔ [Quoted] ✅                                                                                  │
│ [Quoted ▼] ➔ [Order Confirmed] ✅                                                                                    │
│                                                                                                                     │
│ [+] Add New Rule                                                                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Business Rules                                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ▢ Auto-advance to "Supplier RFQ Sent" when all reviews are approved                                                  │
│ ▢ Require management approval for quotes > $10,000                                                                  │
│ ▢ Send reminder if supplier quote is overdue by 1 day                                                               │
│ ▢ Auto-assign RFQs to Procurement Owner based on workload                                                           │
│                                                                                                                     │
│ [+] Add New Rule                                                                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

[Save Configuration] [Reset to Default] [Audit Log]
```

> ✅ Features:
> - Drag-and-drop stage reordering
> - Color picker
> - Transition rules
> - Business logic configuration

---

## 🖼️ Screen 7: **Supplier Portal (View RFQ)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Supplier Portal                                                                                                    │
│  🔔 1 New RFQ  │  👤 Joe Wang (Precision Metals Co.)  │  📂 My RFQs  │  📞 Contact Support                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

📄 RFQ: P-25082001 – Sensor Mount  
🏢 Customer: TechNova Inc. (via Factory Pulse)  
📅 Deadline: Aug 25, 2025  
📏 Volume: 5,000 pcs  

📎 Attached Files:
• Sensor_Mount_Drawing_REV2.pdf [Download]
• BOM_SensorMount.xlsx [Download]

💬 Message from Procurement:
"Please quote for aluminum 6061-T6, anodized finish. Open to alternatives."

💰 Submit Your Quote:
Unit Price: [ $7.95 ]  
Tooling Cost: [ $0 ]  
Lead Time: [ 3 weeks ]  
Notes: "Can meet spec with minor process adjustment."

[📤 Submit Quote]  [💬 Reply to Buyer]  [📅 Request Extension]
```

> ✅ Secure, read-only access to RFQ details and files.
---


# 🌙 Factory Pulse  
**Text-Based Figma Wireframe Pack – Dark Mode**

> *Designed for clarity, focus, and usability in any environment.*

---

## 🖼️ Screen 1: **Login & Authentication (Dark Mode)**

```
┌─────────────────────────────────────────────────────────────┐
│                       🌑 FACTORY PULSE                      │
└─────────────────────────────────────────────────────────────┘

          [Logo: Factory Pulse]
          [Tagline: The heartbeat of your factory.]

  ┌─────────────────────────────────────────────────────────┐
  │                   Sign In to Your Account               │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  Email Address                                          │
  │  ┌───────────────────────────────────────────────────┐  │
  │  │ user@company.com                                   │  │
  │  └───────────────────────────────────────────────────┘  │
  │                                                         │
  │  Password                                               │
  │  ┌───────────────────────────────────────────────────┐  │
  │  │ ••••••••••                                         │  │
  │  └───────────────────────────────────────────────────┘  │
  │                                                         │
  │  [ ] Remember me                                        │
  │                                                         │
  │              [Sign In]           [Forgot Password?]     │
  │                                                         │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │  Need an account? Contact your administrator            │
  └─────────────────────────────────────────────────────────┘
```

> 🎨 **Dark Theme**:
> - Background: `#121212` (near-black)
> - Cards: `#1E1E1E`
> - Text: `#E0E0E0` (light gray)
> - Inputs: `#2D2D2D` with `#BB86FC` focus glow
> - Accent: `#03DAC6` (material teal) for buttons

---

## 🖼️ Screen 2: **Kanban Dashboard (Dark Mode)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Factory Pulse                                                                                                      │
│  🔔 3 Notifications  │  👤 Anna Tran (Procurement Owner)  │  🌐 Projects  │  📂 Documents  │  📊 Analytics            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

🔍 Search RFQs: [ P-25082001 or "connector housing"                   ]   🎯 Filter: All | High | Overdue | Mine

🟢 P-25082203 – New Enclosure Design (Low priority)  
👤 Anna Tran · 📅 Aug 22 · 📎 4 files

🔴 P-25082101 – Motor Bracket (High priority)  
👤 David Kim · 📅 Aug 21 · 📎 6 files · ⚠️ 2 risks logged

🟡 P-25082001 – Sensor Mount (Medium)  
👤 Sarah Lee · 📅 Aug 20 · 📎 3 files · ✅ Eng: Approved

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

┌─────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│  Inquiry Received       │   │  Technical Review        │   │  Supplier RFQ Sent       │   │  Quoted                  │
│  (2)                    │   │  (1)                     │   │  (1)                     │   │  (0)                     │
│                         │   │                         │   │                         │   │                         │
│  🟢 P-25082203          │   │  🔴 P-25082101           │   │  🟡 P-25082001           │   │                         │
│  🔴 P-25082101          │   │                         │   │  (2/3 quotes in)         │   │                         │
│                         │   │                         │   │                         │   │                         │
└─────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘

┌─────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│  Order Confirmed        │   │  In Production           │   │  Shipped & Closed        │
│  (0)                    │   │  (0)                     │   │  (3)                     │
│                         │   │                         │   │                         │
│                         │   │                         │   │  ✅ P-25081501           │
│                         │   │                         │   │  ✅ P-25081002           │
│                         │   │                         │   │  ✅ P-25080503           │
│                         │   │                         │   │                         │
└─────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘
```

> 🎨 **Dark Mode Enhancements**:
> - Column headers: `#2C2C2C` background, text in `#FFFFFF`
> - Cards: Slight elevation (`box-shadow: 0 2px 4px rgba(0,0,0,0.3)`)
> - Priority badges: Use glowing effects:
>   - 🔴 `#CF6679` (red)  
>   - 🟡 `#FFD740` (amber)  
>   - 🟢 `#69F0AE` (green)

---

## 🖼️ Screen 3: **Project Detail Page (Dark Mode)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Project: P-25082001 – Sensor Mount | Status: Supplier RFQ Sent | Priority: Medium                                  │
│  🏢 Customer: TechNova Inc. | 📅 Created: Aug 20, 2025 | 👤 Owner: Sarah Lee                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  NAVIGATION │ │  DETAILS                                                                                           │
├─────────────┤ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Overview    │ │ Title:        Sensor Mount – Aluminum Alloy                                                       │
│ Documents   │ │ Description:  High-precision mount for industrial sensors                                           │
│ Reviews     │ │ Volume:       5,000 pcs                                                                             │
│ Supplier    │ │ Target Price: $8.50/unit                                                                            │
│ Timeline    │ │ Delivery:    Oct 15, 2025                                                                           │
│ Analytics   │ │ Notes:       Customer open to alternative materials                                                │
│ Settings    │ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
│             │
│             │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│             │ │  DOCUMENTS                                                                                         │
│             │ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│             │ │ 📄 Sensor_Mount_Drawing_REV2.pdf  [v2]  📅 Aug 20 · 👤 Sarah · 🔒 Internal Only                      │
│             │ │ 📄 BOM_SensorMount.xlsx         [v1]  📅 Aug 20 · 👤 Anna                                           │
│             │ │ 📄 Material_Spec_Al6061.pdf     [v1]  📅 Aug 20 · 👤 Engineering                                    │
│             │ │                                                                                                    │
│             │ │ [+] Upload New File                                                                                │
│             │ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
│             │
│             │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│             │ │  INTERNAL REVIEWS                                                                                  │
│             │ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│             │ │ ✅ Engineering                                                                       👤 Minh · Aug 21│
│             │ │   - Design feasible, no major risks                                                  📅 14:30       │
│             │ │   - Suggest anodizing for corrosion resistance                                                      │
│             │ │                                                                                                    │
│             │ │ ✅ QA                                                                                👤 Linh · Aug 21│
│             │ │   - CMM inspection required for critical dimensions                                                 │
│             │ │                                                                                                    │
│             │ │ 🟡 Production                                                                          👤 Hung · Aug 21│
│             │ │   - Tooling required: custom jig ($1,200)                                                           │
│             │ │   - Cycle time: ~4.5 min/unit → may impact lead time                                                │
│             │ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
│             │
│             │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│             │ │  SUPPLIER RFQ SENT                                                                                 │
│             │ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│             │ │ 📧 Sent to:                                                                                         │
│             │ │   • Precision Metals Co. (joe@precimetals.com) – 🟡 Pending (Due: Aug 25)                            │
│             │ │   • CNC Masters Inc. (quotes@cnchub.com) – ✅ Received ($7.80/unit)                                   │
│             │ │   • Alpha Fabricators (rfq@alphafab.com) – ✅ Received ($8.10/unit)                                   │
│             │ │                                                                                                    │
│             │ │ [📤 Resend]  [➕ Add Supplier]  [📅 Set Deadline]                                                     │
│             │ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
│             │
│             │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│             │ │  ACTIVITY & COMMENTS                                                                               │
│             │ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│             │ │ 📅 Aug 25, 10:15 – Sarah (Sales)                                                                   │
│             │ │   Updated target price to $8.20 based on supplier quotes                                            │
│             │ │                                                                                                    │
│             │ │ 📅 Aug 21, 16:20 – Anna (Procurement)                                                              │
│             │ │   Sent RFQ to 3 suppliers – deadline Aug 25                                                         │
│             │ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
└─────────────┘ └────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> 🎨 **Dark UI Notes**:
> - Tabs: `#252525` background, active tab in `#03DAC6`
> - Badges: Use subtle glows for ✅, 🟡, 🔴
> - Activity log: Timestamps in `#B0B0B0`, user roles in `#80CBC4`

---

## 🖼️ Screen 4: **RFQ Intake Portal (Dark Mode)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             Submit Your Manufacturing Inquiry                                                      │
│                                  We'll get back to you within 48 hours                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

[ ] I'm submitting as a Customer  
[ ] I'm a Sales Representative submitting on behalf of a customer

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Project Details                                                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Project Title*        [ High-Precision Sensor Mount ]                                                              │
│ Description           [ Durable aluminum mount for industrial sensors... ]                                         │
│ Estimated Volume      [ 5,000 ] pcs                                                                                │
│ Target Price          [ $8.50 ] /unit                                                                              │
│ Desired Delivery Date [ 📅 Oct 15, 2025 ]                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Customer Information                                                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Name*                 [ Sarah Chen ]                                                                               │
│ Company*              [ TechNova Inc. ]                                                                            │
│ Email*                [ sarah.chen@technova.com ]                                                                  │
│ Phone                 [ +1-555-123-4567 ]                                                                          │
│ Country               [ United States ▼ ]                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Attach Files                                                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📎 Drag & drop files or click to upload                                                                             │
│   Supported: PDF, STEP, IGES, XLSX, DWG, SLDPRT (Max 50MB)                                                          │
│                                                                                                                     │
│   [ Sensor_Mount_Drawing.pdf ] ✅                                                                                   │
│   [ BOM_SensorMount.xlsx ] ✅                                                                                       │
│                                                                                                                     │
│   [+] Add Another File                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

[ ] I agree to the Terms of Service and Privacy Policy

                     [Submit Inquiry]                                  [Save as Draft]
```

> 🎨 **Dark Form Design**:
> - Input fields: `#2D2D2D` background, border `#444`
> - Labels: `#E0E0E0`
> - Buttons: Primary in `#03DAC6`, secondary in `#383838`
> - Hover effects: Slight glow on inputs and buttons

---

## 🖼️ Screen 5: **Metrics & Analytics Dashboard (Dark Mode)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Analytics Dashboard                                                                                                │
│  📅 Last 30 Days  |  🏢 All Customers  |  👥 All Teams                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│  Avg. RFQ Cycle Time│ │  Win Rate           │ │  Supplier Response   │ │  On-Time Quote       │
│  6.8 days          │ │  48%                │ │  Rate                │ │  Delivery Rate        │
│  ▼ 2.2 days        │ │  ▲ 13%               │ │  89%                 │ │  92%                  │
│  (vs. 9.0)         │ │  (vs. 35%)           │ │  ▲ 29%               │ │  ▲ 12%                │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘

📊 Lead Time by Phase (Days)
Inquiry → Review → Supplier RFQ → Quoted → Order
  1.2     2.1       2.8         0.7      0.0

🔥 Bottlenecks Detected:
• Supplier RFQ phase exceeds SLA (target: 2 days, actual: 2.8)
• 3 RFQs delayed due to missing drawings

📈 Win/Loss Analysis
Won: 12  │  Lost: 7  │  Pending: 4

Top Reasons for Loss:
1. Price (60%)  
2. Lead Time (30%)  
3. Capability (10%)

🔄 Supplier Performance (Top 5)
| Supplier             | Quote Submission | On-Time Delivery | Quality Score |
|----------------------|------------------|------------------|---------------|
| CNC Masters Inc.     | 98%              | 95%              | 4.8/5.0       |
| Precision Metals Co. | 85%              | 90%              | 4.5/5.0       |
| Alpha Fabricators    | 92%              | 88%              | 4.3/5.0       |

[Export Report] [Customize View]
```

> 🎨 **Dark Charts**:
> - Background: `#1E1E1E`
> - Grid lines: `#333`
> - Bars/lines: Use `#03DAC6`, `#BB86FC`, `#FFD740`
> - Alerts: 🔥 in `#CF6679` (pink-red)

---

## 🖼️ Screen 6: **Admin: Workflow Configuration (Dark Mode)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Admin Panel: Workflow Configuration                                                                                │
│  👤 Admin  |  🏢 Factory Pulse  |  🔐 Secure Mode                                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

📌 Configure your project lifecycle stages and rules.

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Workflow Stages                                                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [+] Add New Stage                                                                                                   │
│                                                                                                                     │
│  ┌───┬──────────────────────────┬───────┬───────┐                                                                    │
│  │ 🔘 │ Inquiry Received         │  🔵   │  1    │                                                                    │
│  │ 🔘 │ Technical Review         │  🟡   │  2    │                                                                    │
│  │ 🔘 │ Supplier RFQ Sent        │  🟠   │  3    │                                                                    │
│  │ 🔘 │ Quoted                   │  🟢   │  4    │                                                                    │
│  │ 🔘 │ Order Confirmed          │  🔵   │  5    │                                                                    │
│  │ 🔘 │ In Production            │  🟣   │  6    │                                                                    │
│  │ 🔘 │ Shipped & Closed         │  🟤   │  7    │                                                                    │
│  └───┴──────────────────────────┴───────┴───────┘                                                                    │
│                                                                                                                     │
│  Drag to reorder stages. Click to edit name, color, order.                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Stage Transitions                                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Allow transition from:                                                                                              │
│ [Inquiry Received ▼] ➔ [Technical Review] ✅                                                                         │
│ [Technical Review ▼] ➔ [Supplier RFQ Sent] ✅                                                                        │
│ [Supplier RFQ Sent ▼] ➔ [Quoted] ✅                                                                                  │
│ [Quoted ▼] ➔ [Order Confirmed] ✅                                                                                    │
│                                                                                                                     │
│ [+] Add New Rule                                                                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Business Rules                                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ▢ Auto-advance to "Supplier RFQ Sent" when all reviews are approved                                                  │
│ ▢ Require management approval for quotes > $10,000                                                                  │
│ ▢ Send reminder if supplier quote is overdue by 1 day                                                               │
│ ▢ Auto-assign RFQs to Procurement Owner based on workload                                                           │
│                                                                                                                     │
│ [+] Add New Rule                                                                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

[Save Configuration] [Reset to Default] [Audit Log]
```

> 🎨 **Dark Admin UI**:
> - Tables: `#252525` row background
> - Checkboxes: Modern toggle style with `#03DAC6` accent
> - Buttons: Primary in `#03DAC6`, danger in `#CF6679`

---

## 🖼️ Screen 7: **Supplier Portal (Dark Mode)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Supplier Portal                                                                                                    │
│  🔔 1 New RFQ  │  👤 Joe Wang (Precision Metals Co.)  │  📂 My RFQs  │  📞 Contact Support                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

📄 RFQ: P-25082001 – Sensor Mount  
🏢 Customer: TechNova Inc. (via Factory Pulse)  
📅 Deadline: Aug 25, 2025  
📏 Volume: 5,000 pcs  

📎 Attached Files:
• Sensor_Mount_Drawing_REV2.pdf [Download]
• BOM_SensorMount.xlsx [Download]

💬 Message from Procurement:
"Please quote for aluminum 6061-T6, anodized finish. Open to alternatives."

💰 Submit Your Quote:
Unit Price: [ $7.95 ]  
Tooling Cost: [ $0 ]  
Lead Time: [ 3 weeks ]  
Notes: "Can meet spec with minor process adjustment."

[📤 Submit Quote]  [💬 Reply to Buyer]  [📅 Request Extension]
```

> 🎨 **Supplier Dark Mode**:
> - Clean, professional, secure feel
> - Focus on form clarity and action buttons
> - File links in `#80CBC4` (teal)

---

## 🎨 Dark Mode Design Principles

| Principle | Implementation |
|--------|-----------------|
| **High Contrast** | Light text on dark background (`#E0E0E0` on `#121212`) |
| **Reduced Eye Strain** | No pure white; soft grays and accent colors |
| **Visual Hierarchy** | Use elevation (shadows), color, and spacing |
| **Accent Colors** | `#03DAC6` (primary), `#BB86FC` (secondary), `#CF6679` (error) |
| **Consistency** | Same layout as light mode — only colors change |
| **Accessibility** | Meets WCAG AA contrast standards |

---

## ✅ Implementation Tips

1. **Use CSS Variables** for theming:
   ```css
   :root {
     --bg-primary: #121212;
     --bg-card: #1E1E1E;
     --text-primary: #E0E0E0;
     --accent: #03DAC6;
   }
   ```
2. **Add a Theme Toggle** in the header:
   ```jsx
   <button onClick={toggleTheme}>
     {darkMode ? '🌙' : '☀️'}
   </button>
   ```
3. **Persist Preference** using `localStorage` or user profile setting.
4. **Test on Real Devices** — especially tablets on the shop floor.

---
This level of polish will make **Factory Pulse** stand out as a **modern, professional, and user-centric MES** — ready for any environment. 🌙🏭️