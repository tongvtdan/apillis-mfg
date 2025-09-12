Absolutely. Based on your **updated supplier implementation model** in Factory Pulse — which centralizes suppliers as **organizations** (`organization_type = 'supplier'`) with associated **contacts** (`type = 'supplier'`), and uses dedicated tables for **qualification**, **RFQs**, and **quotes** — I’ve fully revised the **“Add Supplier” screen specification** to align precisely with your **data schema, workflow, and architecture** from the End-to-End Blueprint.

This version eliminates redundant or conflicting structures (e.g., `supplier_profile` JSONB on contacts) and replaces them with **correct, normalized, and scalable** references to:

- `organizations`
- `contacts`
- `supplier_qualifications`
- `documents`

All while preserving full functionality, UX clarity, and compliance with your **Tech Stack**, **PRD**, and **Data Schema**.

---

# 🖼️ **Screen: Add Supplier (Revised & Schema-Aligned)**  
*Factory Pulse – Supplier Management Module*  
*Aligned with PRD v1.2, Tech Stack v1.0.0, and End-to-End Data Schema Blueprint*

---

## 🎯 **Purpose**

Allow Procurement/Sourcing users to onboard a new supplier into Factory Pulse by creating:

- A **Supplier Organization** (`organizations.organization_type = 'supplier'`)
- A primary **Supplier Contact** (`contacts.type = 'supplier'`, linked via `organization_id`)
- Optional **Supplier Qualification** record (to trigger workflow)
- Associated **Profile Documents** (PDF, logo, brochures)

> ✅ **All data stored in normalized, org-scoped tables per blueprint**  
> ✅ **No JSONB bloat** — capabilities, certifications, and terms are stored in dedicated tables or documents  
> ✅ **RLS enforced** — all records scoped to `organization_id`  
> ✅ **Supabase Storage** — profile documents uploaded to `supplier-documents` bucket

---

## 🧭 **Navigation & Access**

- **Entry Point**: From Supplier List → Click `[+] Add New Supplier`
- **User Roles**: `procurement`, `sourcing`, `admin`
- **RLS**: Auto-assigns `organization_id = get_current_user_org_id()`

---

# 🖼️ **Text-Based Figma Design: Add Supplier Screen (Schema-Aligned)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            Add New Supplier                                                         │
│                             Onboard a new supplier into your qualified vendor base                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  SUPPLIER ORGANIZATION (CORE ENTITY)
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Organization Name*       [ Acme Precision Machining LLC                 ]
                         → Will become organization_type = 'supplier'

Primary Contact*         [ John Smith                                   ]
Email*                   [ john.smith@acme-machining.com                ]
Phone                    [ +1-555-123-4567                              ]
Website                  [ www.acme-machining.com                       ]
Address*                 [ 123 Industrial Blvd, Torrance, CA 90210, USA ]

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  SUPPLIER CAPABILITIES & PROFILE
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Processes*               [ Select multiple ▼ ] → [✓] CNC Machining, [✓] 5-Axis, [✓] Wire EDM, [✓] Surface Grinding
                         → Search: “CNC”, “Molding”, “PCB”, etc.
                         → [+] Add Custom Process: _______________________

Materials*               [ Select multiple ▼ ] → [✓] Aluminum 6061, [✓] Stainless Steel 304, [✓] Titanium Grade 5
                         → Search: “Aluminum”, “Plastic”, “Copper”, etc.
                         → [+] Add Custom Material: _____________________

Tolerance Capability*    [ ±0.01mm ▼ ] → Options: ±0.001mm, ±0.005mm, ±0.01mm, ±0.05mm, ±0.1mm, ±0.2mm, Custom

Max Part Size            [ Length: 500 ] mm  [ Width: 500 ] mm  [ Height: 300 ] mm
Lead Time (Prototype)    [ 2 ] weeks
Lead Time (Production)   [ 4 ] weeks

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  CERTIFICATIONS & COMPLIANCE
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Certifications           [ Select multiple ▼ ] → [✓] ISO 9001, [✓] AS9100, [✓] ITAR Registered, [✓] RoHS Compliant
                         → Search: “ISO”, “AS9100”, “UL”, “FDA”, etc.
                         → [+] Add Custom Cert: _________________________

Payment Terms            [ Net 30 ▼ ] → Options: Net 15, Net 30, Net 45, Net 60, 50% Deposit
Currency                 [ USD ▼ ] → USD, EUR, GBP, CNY, JPY, CAD, MXN
Credit Limit             [ $100,000.00 ]
Incoterms                [ FOB Origin ▼ ] → FOB Origin, CIF, DDP, EXW, DAP
Preferred Region         [ North America ▼ ] → North America, Europe, Asia-Pacific, Latin America, Middle East/Africa

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  SUPPLIER PROFILE DOCUMENTS (NEW)
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
📎 Upload official supplier profile materials (max 5MB per file)
   Supported: PDF, JPG, PNG, SVG, DOCX (company brochure, overview, logo)

   [✓] Company Profile PDF     → [ Acme_Supplier_Profile_2025.pdf ] ✅ (4.1 MB)
   [✓] Company Logo            → [ acme_logo.png ] ✅ (1.8 MB)
   [ ] Product Catalog         → [ Upload ]
   [ ] Quality Manual          → [ Upload ]
   [ ] Sustainability Report   → [ Upload ]
   [+] Add Another File        → Opens file picker

⚠️  Files must be ≤5MB each. Use ZIP if combining multiple files.
💡 Tip: Upload logo as PNG/SVG for crisp display in portal.

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  QUALIFICATION WORKFLOW (OPTIONAL)
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
[ ] Start Supplier Qualification Process Now
→ If checked:
   - Creates record in `supplier_qualifications` table
   - Sets status = 'in_progress'
   - Triggers email to supplier with links to complete profile & upload docs
   - Automatically assigns qualification stage: ‘profile_complete’, ‘nda_signed’, ‘docs_uploaded’, etc.
   - Deadline: [ 14 days from today ▼ ]

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  METADATA & TAGS
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Tags                     [ Add tag ] → e.g., “High Priority”, “Aerospace”, “Prototype Specialist”
Internal Notes           [ Textarea: “Met at IMTS 2025. Strong in 5-axis titanium work. Pricing competitive.” ]

                      [ Cancel ]                                                      [ Save & Close ]                     [ Save & Start Qualification → ]
```

---

## ✅ **Field Validation & Logic (Schema-Aligned)**

| Field                                                | Source Table                                      | Validation Rule                                            | UI Feedback                            |
| ---------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------- |
| **Organization Name**                                | `organizations.name`                              | Required, unique per org                                   | “Organization name already exists”     |
| **Primary Contact Name, Email, Address**             | `contacts.*`                                      | Required; email valid format                               | “Invalid email”                        |
| **Processes, Materials, Tolerance**                  | `supplier_qualifications.capabilities` (JSONB)    | At least one process/material required                     | “Select at least one capability”       |
| **Certifications**                                   | `supplier_qualifications.certifications` (array)  | Optional                                                   | None                                   |
| **Payment Terms, Currency, Incoterms, Credit Limit** | `supplier_qualifications.financial_terms` (JSONB) | Optional                                                   | None                                   |
| **Profile Documents**                                | `documents` table                                 | Max 5MB per file; types: `.pdf,.jpg,.jpeg,.png,.svg,.docx` | ❌ “File exceeds 5MB limit”             |
| **Start Qualification**                              | `supplier_qualifications`                         | If checked → auto-create record                            | Requires all above fields to be filled |

> 💡 **On Save**:
>
> 1. **Create Organization**:
>    ```sql
>    INSERT INTO organizations (name, organization_type, created_by, organization_id)
>    VALUES ('Acme Precision Machining LLC', 'supplier', auth.uid(), get_current_user_org_id());
>    ```
> 2. **Create Primary Contact**:
>    ```sql
>    INSERT INTO contacts (organization_id, type, name, email, phone, address, website)
>    VALUES (new_org_id, 'supplier', 'John Smith', 'john@...', '+1-555...', '123 Industrial Blvd...', 'www...');
>    ```
> 3. **Create Supplier Qualification Record** (if enabled):
>    ```sql
>    INSERT INTO supplier_qualifications (
>      organization_id,
>      capabilities,
>      certifications,
>      financial_terms,
>      status,
>      deadline
>    ) VALUES (
>      new_org_id,
>      '{"processes": ["CNC Machining", "5-Axis"], "materials": ["Aluminum 6061"], "tolerance": "±0.01mm"}',
>      '{"certifications": ["ISO 9001", "AS9100"]}',
>      '{"payment_terms": "Net 30", "currency": "USD", "credit_limit": 100000}',
>      'in_progress',
>      '2025-09-19'
>    );
>    ```
> 4. **Upload Profile Documents**:
>    - Bucket: `supplier-documents`
>    - Path: `supplier_docs/{org_id}/{doc_id}.{ext}`
>    - Insert into `documents`:
>      ```sql
>      INSERT INTO documents (
>        organization_id,
>        category, -- 'supplier_profile', 'supplier_logo'
>        file_path,
>        url,
>        mime_type,
>        file_size_bytes,
>        uploaded_by
>      ) VALUES (...);
>      ```
> 5. **If “Start Qualification” is checked**:
>    - Trigger `start_supplier_qualification(org_id)` RPC
>    - Create `supplier_qualification_progress` records for all stages
>    - Send 3 secure links to contact email:
>      - Profile completion
>      - NDA signing
>      - Document upload

---

## 🔐 **Security & Compliance (Schema-Aligned)**

| Feature                 | Implementation                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Multi-Tenancy**       | All tables use `organization_id` → RLS enforced                                                                             |
| **File Uploads**        | Supabase Storage bucket `supplier-documents` → RLS restricts access to org members                                          |
| **Document Categories** | Uses `document_categories.code = 'supplier_profile'`, `'supplier_logo'` (from Appendix A)                                   |
| **Audit Trail**         | All actions logged in `activity_log` with entity type: `supplier_organization`, `supplier_qualification`, `document_upload` |
| **Compliance**          | Supports ISO 9001, AS9100 — all qualifications and documents are auditable artifacts                                        |
| **Privacy**             | Supplier portal users see only their own organization’s documents via `access_level = 'supplier'`                           |

### ✅ **Supabase RLS Policy for `supplier-documents`**
```sql
CREATE POLICY "supplier_doc_access"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'supplier-documents'
  AND (storage.foldername(name))[1] = (
    SELECT o.id::text
    FROM public.organizations o
    WHERE o.id = get_current_user_org_id()
  )
);

CREATE POLICY "supplier_doc_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'supplier-documents'
  AND (storage.foldername(name))[1] = (
    SELECT o.id::text
    FROM public.organizations o
    WHERE o.id = get_current_user_org_id()
  )
);
```

> ✅ Folder structure: `supplier_docs/<organization_id>/<filename>`  
> ✅ Only users from same org can view/upload

---

## 🎨 **UI/UX Design (Tailwind + DaisyUI)**

| Element               | Class                                                                                |
| --------------------- | ------------------------------------------------------------------------------------ |
| Card                  | `card bg-base-100 shadow-md border border-gray-200 p-6`                              |
| Section Title         | `font-semibold text-lg text-gray-800 border-b pb-3 mb-4`                             |
| Input                 | `input input-bordered w-full`                                                        |
| Multi-select Dropdown | `select select-bordered select-multiple` (or searchable `react-select`)              |
| File Upload Area      | `file-input file-input-bordered w-full border-dashed border-gray-300 p-4 rounded-lg` |
| File Preview Card     | `card bg-gray-50 shadow-sm p-3 flex items-center gap-3`                              |
| Thumbnail Image       | `w-12 h-12 object-cover rounded`                                                     |
| File Info             | `text-xs text-gray-600` → “4.1 MB • PDF”                                             |
| Warning Banner        | `alert alert-warning text-sm` → “Files must be ≤5MB”                                 |
| Button (Save & Start) | `btn btn-primary loading` → spinner on submit                                        |

> ✅ **Responsive**: Full-width on mobile, 2-column grid on desktop for size fields

---

## ⚙️ **Technical Implementation (React + TypeScript + Supabase)**

### **Frontend Component Structure**

```tsx
// src/features/supplier-management/components/AddSupplierForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const addSupplierSchema = z.object({
  organizationName: z.string().min(2),
  primaryContactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().min(5),
  processes: z.array(z.string()).min(1),
  materials: z.array(z.string()).min(1),
  tolerance: z.string(),
  maxPartSize: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
  }),
  certifications: z.array(z.string()),
  paymentTerms: z.string().optional(),
  currency: z.string().optional(),
  creditLimit: z.number().nonnegative().optional(),
  incoterms: z.string().optional(),
  preferredRegion: z.string().optional(),
  startQualification: z.boolean(),
  qualificationDeadline: z.date().optional(),
  tags: z.array(z.string()),
  internalNotes: z.string().optional(),
  profileFiles: z.array(z.instanceof(File)).optional(),
});

type AddSupplierForm = z.infer<typeof addSupplierSchema>;
```

### **Backend Service (Supabase Integration)**

```ts
// src/features/supplier-management/services/supplierService.ts
export const createSupplier = async (data: AddSupplierForm) => {
  const supabase = createClient();

  // 1. Create Organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: data.organizationName,
      organization_type: 'supplier',
      organization_id: getOrgId(),
      created_by: getUserId(),
    })
    .select()
    .single();

  if (orgError) throw orgError;

  // 2. Create Primary Contact
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .insert({
      organization_id: org.id,
      type: 'supplier',
      name: data.primaryContactName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      website: data.website,
    })
    .select()
    .single();

  if (contactError) throw contactError;

  // 3. Create Supplier Qualification (if requested)
  if (data.startQualification) {
    await supabase.functions.invoke('start_supplier_qualification', {
      body: {
        organization_id: org.id,
        capabilities: {
          processes: data.processes,
          materials: data.materials,
          tolerance: data.tolerance,
        },
        certifications: data.certifications,
        financial_terms: {
          payment_terms: data.paymentTerms,
          currency: data.currency,
          credit_limit: data.creditLimit,
          incoterm: data.incoterms,
          preferred_region: data.preferredRegion,
        },
        deadline: data.qualificationDeadline?.toISOString(),
      },
    });
  }

  // 4. Upload Profile Documents
  const documentIds: string[] = [];
  for (const file of data.profileFiles || []) {
    const path = `supplier_docs/${org.id}/${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('supplier-documents')
      .upload(path, file);

    if (uploadError) throw uploadError;

    const { data: doc } = await supabase
      .from('documents')
      .insert({
        organization_id: org.id,
        category: file.name.toLowerCase().includes('logo') ? 'supplier_logo' : 'supplier_profile',
        file_path: uploadData.path,
        url: supabase.storage.from('supplier-documents').getPublicUrl(uploadData.path).data.publicUrl,
        mime_type: file.type,
        file_size_bytes: file.size,
        uploaded_by: getUserId(),
      })
      .select()
      .single();

    documentIds.push(doc.id);
  }

  return { org, contact, documentIds };
};
```

---

## ✅ **Success Metrics & QA Checklist**

| Metric                                         | Target                 |
| ---------------------------------------------- | ---------------------- |
| % of suppliers with profile documents uploaded | ≥80%                   |
| Avg. time to complete supplier onboarding      | ≤1 day                 |
| # of rejected uploads due to >5MB              | 0                      |
| Audit trail completeness                       | 100% of actions logged |
| Qualification initiation rate                  | ≥70% of new suppliers  |

### ✅ QA Checklist
- [ ] Organization created with `organization_type = 'supplier'`
- [ ] Contact created with `type = 'supplier'` and linked to org
- [ ] Profile documents uploaded to correct bucket/path
- [ ] Documents inserted into `documents` table with correct `category`
- [ ] `supplier_qualifications` record created when “Start Qualification” checked
- [ ] RLS prevents unauthorized access to documents
- [ ] File size validation enforced client-side and server-side
- [ ] Activity log captures: `supplier_created`, `document_uploaded`, `qualification_started`
- [ ] Email links sent to contact email (if qualification started)

---

## 📁 **Final Data Model Alignment**

| Entity                     | Source                                                       | Purpose                                                  |
| -------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| **Supplier Org**           | `organizations`                                              | Core entity with `organization_type = 'supplier'`        |
| **Primary Contact**        | `contacts`                                                   | Linked to org via `organization_id`, `type = 'supplier'` |
| **Capabilities**           | `supplier_qualifications.capabilities` (JSONB)               | Processes, materials, tolerances                         |
| **Certifications**         | `supplier_qualifications.certifications` (array)             | ISO, AS9100, etc.                                        |
| **Financial Terms**        | `supplier_qualifications.financial_terms` (JSONB)            | Payment terms, currency, credit limit                    |
| **Profile Docs**           | `documents`                                                  | `category = 'supplier_profile'`, `'supplier_logo'`       |
| **Qualification Workflow** | `supplier_qualifications`, `supplier_qualification_progress` | Managed via `start_supplier_qualification()` RPC         |

# Add New Supplier Screen Design

## Overview
This document outlines the design for the Add New Supplier screen, which will be implemented as a push screen (similar to the Add New Project screen) rather than a modal dialog. When the user clicks "Add Supplier" from the Suppliers page, they will be navigated to this dedicated screen with a back button to return to the Suppliers page.

## Navigation Flow
1. User is on the Suppliers page
2. User clicks "Add Supplier" button
3. User is navigated to the Add New Supplier screen (push screen) at `/suppliers/new`
4. User fills in supplier information
5. User clicks "Save" or "Save & Start Qualification"
6. User is redirected back to the Suppliers page with success confirmation

## Screen Layout

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ← Back                           Add New Supplier                                                              │
│                             Onboard a new supplier into your qualified vendor base                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  SUPPLIER ORGANIZATION (CORE ENTITY)
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Organization Name*       [ Acme Precision Machining LLC                 ]
                         → Will become organization_type = 'supplier'

Primary Contact*         [ John Smith                                   ]
Email*                   [ john.smith@acme-machining.com                ]
Phone                    [ +1-555-123-4567                              ]
Website                  [ www.acme-machining.com                       ]
Address*                 [ 123 Industrial Blvd, Torrance, CA 90210, USA ]

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  SUPPLIER CAPABILITIES & PROFILE
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Processes*               [ Select multiple ▼ ] → [✓] CNC Machining, [✓] 5-Axis, [✓] Wire EDM, [✓] Surface Grinding
                         → Search: "CNC", "Molding", "PCB", etc.
                         → [+] Add Custom Process: _______________________

Materials*               [ Select multiple ▼ ] → [✓] Aluminum 6061, [✓] Stainless Steel 304, [✓] Titanium Grade 5
                         → Search: "Aluminum", "Plastic", "Copper", etc.
                         → [+] Add Custom Material: _____________________

Tolerance Capability*    [ ±0.01mm ▼ ] → Options: ±0.001mm, ±0.005mm, ±0.01mm, ±0.05mm, ±0.1mm, ±0.2mm, Custom

Max Part Size            [ Length: 500 ] mm  [ Width: 500 ] mm  [ Height: 300 ] mm
Lead Time (Prototype)    [ 2 ] weeks
Lead Time (Production)   [ 4 ] weeks

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  CERTIFICATIONS & COMPLIANCE
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Certifications           [ Select multiple ▼ ] → [✓] ISO 9001, [✓] AS9100, [✓] ITAR Registered, [✓] RoHS Compliant
                         → Search: "ISO", "AS9100", "UL", "FDA", etc.
                         → [+] Add Custom Cert: _________________________

Payment Terms            [ Net 30 ▼ ] → Options: Net 15, Net 30, Net 45, Net 60, 50% Deposit
Currency                 [ USD ▼ ] → USD, EUR, GBP, CNY, JPY, CAD, MXN
Credit Limit             [ $100,000.00 ]
Incoterms                [ FOB Origin ▼ ] → FOB Origin, CIF, DDP, EXW, DAP
Preferred Region         [ North America ▼ ] → North America, Europe, Asia-Pacific, Latin America, Middle East/Africa

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  METADATA & TAGS
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Tags                     [ Add tag ] → e.g., "High Priority", "Aerospace", "Prototype Specialist"
Internal Notes           [ Textarea: "Met at IMTS 2025. Strong in 5-axis titanium work. Pricing competitive." ]

                      [ Cancel ]                                                      [ Save & Close ]                     [ Save & Start Qualification → ]

## Implementation Notes

1. The screen is implemented as a dedicated route (`/suppliers/new`) similar to how `/projects/new` is implemented
2. A back button is placed in the top-left corner to navigate back to the Suppliers page
3. Form validation is implemented for all required fields
4. Data is submitted to the organizations table with organization_type = 'supplier'
5. Upon successful submission, user is redirected back to the Suppliers page with a success toast notification
6. The "Save & Start Qualification" option will create a record in the supplier_qualifications table if selected

## Technical Implementation

### Files Created
1. `src/pages/CreateSupplier.tsx` - Main page component
2. `src/components/supplier/SupplierIntakeForm.tsx` - Form component
3. `src/components/supplier/index.ts` - Export index file

### Route Configuration
The route `/suppliers/new` has been added to `src/App.tsx` to render the CreateSupplier page.

### Component Structure
```
CreateSupplier (page)
└── SupplierIntakeForm (component)
    ├── Organization Information Section
    ├── Capabilities & Profile Section
    ├── Certifications & Compliance Section
    └── Metadata & Tags Section
```

### Data Flow
1. Form data is collected in state
2. On submit, data is validated and transformed to match the supplier schema
3. SupplierManagementService.createSupplier() is called to create the supplier
4. On success, user is redirected to Suppliers page with success notification

### Key Features
- Responsive form layout with proper validation
- Dynamic tag and material management
- Predefined options for common supplier attributes
- Integration with existing supplier management service
- Consistent UI with rest of the application
