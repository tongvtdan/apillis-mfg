
## 🔄 Detailed Stage Breakdown

### 1. **Inquiry Received**
- Customer or sales submits RFQ
- Auto-ID: `P-25082001`
- Files uploaded (drawings, BOM)
- Assigned to Sales/Procurement Owner

### 2. **Technical Review**
- Engineering: assesses design feasibility
- QA: identifies inspection needs
- Production: evaluates process, tooling, capacity
- Output: approved, rejected, or needs info

✅ **Exit Criteria**: All departments complete review

---

### 3. **Supplier RFQ Sent** ✅ (New Stage)
- **Trigger**: Technical review complete
- **Owner**: Procurement / Purchasing
- **Actions**:
  - Break down BOM into supplier-scope items
  - Select suppliers from database (based on capability, past performance)
  - Send sub-RFQs via email or **Supplier Portal** (Phase 2)
  - Set quote deadline
  - Track: “Sent”, “Viewed”, “Quote Submitted”, “Overdue”
- **Visibility**:
  - List of suppliers contacted
  - Expected quote date
  - Status badges: 🟡 Pending, ✅ Received, ⚠️ Overdue
- **Integration**:
  - Uses **Supplier Management & RFQ Engine** (Phase 2)
  - In MVP: manual email + status update

✅ **Exit Criteria**: All critical supplier quotes received

> 💡 Tip: Show a **"Quote Readiness Score"** on the card (e.g., “3/5 quotes in – 2 pending”)

---

### 4. **Quoted**
- **Trigger**: Supplier quotes received + internal costing complete
- **Actions**:
  - Finalize quote (material + labor + markup)
  - Generate PDF (manual in MVP, auto in Phase 2)
  - Send to customer
  - Set follow-up deadline
- **Owner**: Sales / Costing Team

✅ **Exit Criteria**: Quote sent + deadline set

---

### 5. **Order Confirmed**
- Customer accepts quote or sends PO
- Internal Sales Order created
- Project moves to execution phase

---

### 6. **Procurement & Planning**
- Finalize Purchase Orders
- Schedule production
- Confirm inventory / raw materials

---

### 7. **In Production**
- Work order released
- Manufacturing, assembly, testing
- Real-time status updates

---

### 8. **Shipped & Closed**
- Packaging, shipping, delivery
- Proof of Delivery (POD)
- Feedback loop

---

## 📋 Updated Kanban Board (Visual)

```text
┌─────────────────┐   ┌──────────────────────┐   ┌──────────────────────────┐   ┌─────────────┐
│ Inquiry         │   │ Technical            │   │ Supplier                 │   │ Quoted      │
│ Received        │   │ Review               │   │ RFQ Sent                 │   │             │
│ • P-25082001    │   │ • P-25082001 ✅      │   │ • P-25082001 🟡 (2/3 in)  │   │ • P-25082102│
│ • P-25082101    │   │ • P-25082101 🟡      │   │ • P-25082101             │   │             │
└─────────────────┘   └──────────────────────┘   └──────────────────────────┘   └─────────────┘

┌────────────────────┐   ┌─────────────────┐   ┌─────────────────────────┐
│ Order              │   │ In              │   │ Shipped &               │
│ Confirmed          │   │ Production      │   │ Closed                  │
│ • P-25082102       │   │ • P-25082102 🟡 │   │ • P-25082001 ✅         │
│                    │   │ • P-25082203    │   │                         │
└────────────────────┘   └─────────────────┘   └─────────────────────────┘
```

---

## 🧱 How This Fits Your Feature List

| Your Feature | Maps To |
|------------|--------|
| **Supplier Management & RFQ Engine** | Powers the "Supplier RFQ Sent" stage |
| **Notification System** | Alerts when supplier quote is overdue |
| **Document Management** | Attach supplier quotes to project |
| **Workflow Configuration** | Admin can rename "Supplier RFQ Sent" → "Outsourced Quoting" if needed |
| **Metrics Dashboard** | Track: *Avg. supplier response time*, *Quote submission rate* |

> ✅ This change **enhances traceability** and directly supports your success metric:  
> **"Improve supplier response rate from 60% → 90%"**

---

## 🎯 Optional: Split into Two Sub-Stages (Advanced)

If you want more granularity (especially in Phase 2), split it:

```
→ Supplier RFQ Sent → Supplier Quotes Received
```

- **Sent**: RFQ dispatched
- **Received**: All quotes in, costing finalized

But for **MVP**, one stage ("Supplier RFQ Sent") with **status badges** is cleaner.

---

## ✅ Summary: Final Kanban Workflow

```text
Inquiry Received 
    ↓
Technical Review 
    ↓
Supplier RFQ Sent 
    ↓
Quoted 
    ↓
Order Confirmed 
    ↓
Procurement & Planning 
    ↓
In Production 
    ↓
Shipped & Closed
```
