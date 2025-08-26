Absolutely. Based on your comprehensive **`feature-list.md`**, the **Factory Pulse PRD**, and the **rebranded homepage code** we’ve developed, I’ll now generate a **visual preview** of what the **Factory Pulse** platform will look like — in **text-based Figma wireframe format**, fully aligned with your workflow, features, and design goals.

This preview includes:
- ✅ **Modern, clean, minimal design**
- ✅ **Dark mode support**
- ✅ **Responsive layout**
- ✅ **Alignment with your feature list and MVP phases**
- ✅ **Kanban workflow with Supplier RFQ stage**
- ✅ **Role-based views**

---

# 🖼️ Factory Pulse  
**Visual Preview (Text-Based Wireframes)**

---

## 🖼️ Screen 1: **Homepage / Marketing Landing Page**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Factory Pulse                                                                                                      │
│  🔔 3 Notifications  │  👤 Anna Tran  │  🌐 Projects  │  📂 Docs  │  📊 Analytics                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                          [Logo: Factory Pulse + Factory Icon]
                          [Tagline: The Heartbeat of Your Factory]

            Transform Your Manufacturing Operations with Intelligent Workflow Automation

           Streamline RFQs, accelerate quoting, and ensure quality with a unified platform
           connecting sales, engineering, procurement, and production — from idea to delivery.

                                [Start New Project]          [Sign In]
                                         Free • 24h Response • No Obligation

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │  Why Manufacturers Choose Factory Pulse                                                                         │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │  📋 Smart RFQ Management        🤝 Cross-Team Collaboration      📊 Real-time Performance Analytics               │
  │  Automated intake, priority     Structured reviews across       Track bottlenecks, SLAs,                        │
  │  scoring, and validation        engineering, QA & production    win rates, and supplier performance             │
  │                                                                                                                   │
  │  🔍 100% Document Traceability  ⚙️ Automated Workflows          🌐 End-to-End Visibility                          │
  │  Version control, audit log,    Reduce manual steps with        From inquiry to delivery — full                  │
  │  role-based access              approval chains & rules         traceability and status tracking                 │
  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  "Factory Pulse cut our RFQ processing time in half and improved quote accuracy by 50%."  
  — Operations Director, Precision Components Inc.

                                [See All Customer Stories]    [Schedule a Demo]
```

> 🎨 **Design Notes**:
> - Clean, spacious layout with emerald green (`#03DAC6`) as primary accent
> - Dark text on light background (or vice versa in dark mode)
> - Minimalist icons, professional typography (Inter + Space Mono)
> - Responsive grid layout

---

## 🖼️ Screen 2: **Kanban Dashboard (Main View)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Factory Pulse                                                                                                      │
│  🔔 3 Notifications  │  👤 Anna Tran (Procurement Owner)  │  🌐 Projects  │  📂 Documents  │  📊 Analytics            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

🔍 Search: [ P-25082001 or "sensor mount"                    ]   🎯 Filter: All | High | Overdue | Mine | My Projects

🟢 P-25082203 – New Enclosure Design (Low)  
👤 Anna Tran · 📅 Aug 22 · 📎 4 files · ✅ Eng: Approved

🔴 P-25082101 – Motor Bracket (High)  
👤 David Kim · 📅 Aug 21 · 📎 6 files · ⚠️ 2 risks logged

🟡 P-25082001 – Sensor Mount (Medium)  
👤 Sarah Lee · 📅 Aug 20 · 📎 3 files · 🟡 Supp: 2/3 in

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

> ✅ **Features**:
> - Drag-and-drop between columns
> - Priority badges: 🔴 High, 🟡 Medium, 🟢 Low
> - Supplier RFQ progress: “2/3 quotes in”
> - Search + filter bar
> - Real-time updates

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

> ✅ **Features**:
> - Tabbed navigation
> - Versioned documents with access control
> - Review status per department
> - Supplier RFQ tracking with status
> - Activity timeline

---

## 🖼️ Screen 4: **RFQ Intake Portal (Public Form)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             Submit Your Manufacturing Project                                                      │
│                                  We'll get back to you within 24 hours                                              │
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

                     [Submit Project]                                  [Save as Draft]
```

> ✅ **Features**:
> - Auto-ID generation: `P-25082001`
> - File validation
> - Role-based access
> - Confirmation email

---

## 🖼️ Screen 5: **Analytics Dashboard**

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
| -------------------- | ---------------- | ---------------- | ------------- |
| CNC Masters Inc.     | 98%              | 95%              | 4.8/5.0       |
| Precision Metals Co. | 85%              | 90%              | 4.5/5.0       |
| Alpha Fabricators    | 92%              | 88%              | 4.3/5.0       |

[Export Report] [Customize View]
```

> ✅ **Features**:
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

> ✅ **Features**:
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

> ✅ **Features**:
> - Secure, read-only access
> - File download
> - Quote submission form
> - Communication tools

