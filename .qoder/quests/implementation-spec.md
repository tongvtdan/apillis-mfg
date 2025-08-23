# Factory Pulse Enhancement Implementation Specification

## Overview

This specification outlines the implementation plan for enhancing the Factory Pulse manufacturing management system. The project builds upon the existing React + TypeScript + Supabase architecture to transform it into a comprehensive supplier RFQ tracking and workflow management platform.

**🔒 ZERO BREAKING CHANGES COMMITMENT:**
This implementation maintains 100% backward compatibility with existing codebase, data structures, and user workflows.

### Current Architecture Assessment

**✅ Strong Foundation:**
- Modern tech stack: React 18.3.1, TypeScript 5.8.3, Tailwind CSS, Supabase
- Existing database schema with proper migration patterns
- Legacy RFQ compatibility layer already implemented
- **Enhanced 8-stage workflow**: inquiry_received → technical_review → supplier_rfq_sent → quoted → order_confirmed → procurement_planning → in_production → shipped_closed
- Role-based access control with comprehensive RBAC system
- Document management with file upload and versioning
- Real-time data synchronization with @tanstack/react-query
- Drag & drop functionality with @dnd-kit/core (already installed)

### UI/UX Design System

**Based on Factory Pulse Wireframe Pack:**

**Light Mode Theme:**
```css
:root {
  --bg-primary: #ffffff;
  --bg-card: #f8f9fa;
  --text-primary: #1a1a1a;
  --text-secondary: #6b7280;
  --accent-primary: #3b82f6;
  --accent-secondary: #10b981;
  --border: #e5e7eb;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

**Dark Mode Theme:**
```css
:root[data-theme="dark"] {
  --bg-primary: #121212;
  --bg-card: #1e1e1e;
  --text-primary: #e0e0e0;
  --text-secondary: #9ca3af;
  --accent-primary: #03dac6;
  --accent-secondary: #bb86fc;
  --border: #374151;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

**Priority Color System:**
```typescript
const PRIORITY_COLORS = {
  urgent: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' }, // 🔴 Red
  high: { bg: '#fef3c7', text: '#d97706', border: '#fbbf24' },   // 🟡 Amber
  medium: { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' }, // 🔵 Blue
  low: { bg: '#dcfce7', text: '#16a34a', border: '#86efac' }     // 🟢 Green
};
```

### Backward Compatibility Strategy

**🔄 RFQ TO PROJECT MIGRATION STRATEGY:**
The codebase currently uses RFQ terminology in variables, components, and database structures. This enhancement will gradually migrate to Project terminology while maintaining all RFQ Intake functionality.

**Migration Phases:**

**Phase 1: Database Migration (Week 1)**
- Keep existing `rfqs` table functional
- New `projects` table references existing RFQ data
- Create database views for backward compatibility
- Maintain all existing RFQ endpoints

**Phase 2: Frontend Migration (Week 2-3)**
- Update component names from RFQ* to Project*
- Maintain RFQ Intake Portal functionality (enhanced, not replaced)
- Update hook names from useRFQs to useProjects
- Preserve all existing RFQ form functionality

**Phase 3: Enhanced RFQ Intake Management (Week 4-6)**
- Expand RFQ Intake Portal with advanced project categorization
- Add supplier management integration to intake process
- Enhance document management for RFQ submissions
- Implement automated project workflow assignment

**Status Mapping Preservation:**
- Database continues using legacy status values: inquiry, review, quoted, won, lost, production, completed, cancelled
- Frontend uses enhanced status mapping with `LEGACY_TO_NEW_STATUS` and `NEW_TO_LEGACY_STATUS`
- All new features work seamlessly with existing status system

**Component Migration Map:**
```typescript
// Existing → Enhanced (maintains all functionality)
RFQIntakeForm.tsx → ProjectIntakeForm.tsx (with RFQ legacy support)
RFQIntakePortal.tsx → ProjectIntakePortal.tsx (enhanced RFQ features)
RFQDetail.tsx → ProjectDetail.tsx (backward compatible)
useRFQs.ts → useProjects.ts (maintains RFQ methods)
RFQ types → Project types (with RFQ aliases)
```

**Type Compatibility:**
- Legacy RFQ types maintained as aliases: `export type RFQ = Project`
- Existing components continue working without modification
- New features use Project interfaces but support RFQ legacy calls
- All RFQ Intake functionality preserved and enhanced

**API Compatibility:**
- All existing RFQ endpoints remain functional
- New Project endpoints added alongside existing ones
- Database table structure preserved with additive-only changes
- RFQ Intake Portal API maintains same interface

## Technology Stack

### Frontend Dependencies (Already Available)
```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^8.0.0",
  "@tanstack/react-virtual": "^3.13.12",
  "recharts": "^2.15.4",
  "react-hook-form": "^7.61.1",
  "date-fns": "^3.6.0"
}
```

### Additional Dependencies to Install
```bash
npm install @dnd-kit/modifiers react-intersection-observer
npm install --dev @types/react-virtualized
```

## Phase 1: MVP Enhancement (12 Weeks)

### Week 1-2: Supplier Quote Management System

#### 1.1 Database Schema Extensions

**🔒 ADDITIVE-ONLY SCHEMA CHANGES:**
All new tables are added alongside existing ones. No existing tables, columns, or constraints are modified.

**New Tables:**
```sql
-- Supplier management (new table, no conflicts)
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  country VARCHAR(100),
  specialties TEXT[],
  rating DECIMAL(3,2) DEFAULT 0.0,
  response_rate DECIMAL(5,2) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (following existing pattern)
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies (following existing pattern)
CREATE POLICY "Management can manage all suppliers" ON public.suppliers FOR ALL USING (has_role(auth.uid(), 'Management'::user_role));
CREATE POLICY "Procurement can manage suppliers" ON public.suppliers FOR ALL USING (has_role(auth.uid(), 'Procurement'::user_role));

-- Supplier quotes (references existing projects table)
CREATE TABLE public.supplier_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  quote_amount DECIMAL(12,2),
  lead_time_days INTEGER,
  quote_valid_until DATE,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'rejected', 'accepted', 'expired')),
  rfq_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quote_received_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (following existing pattern)
ALTER TABLE public.supplier_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies (following existing RBAC pattern)
CREATE POLICY "Users can manage quotes for accessible projects" ON public.supplier_quotes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = supplier_quotes.project_id 
    AND (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR p.assignee_id = auth.uid())
  )
);

-- Quote comparison data
CREATE TABLE quote_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  selected_quote_id UUID REFERENCES supplier_quotes(id),
  comparison_criteria JSONB,
  evaluation_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.2 Frontend Components

**SupplierQuoteModal.tsx**
```typescript
// 🔒 MAINTAINS COMPATIBILITY with existing modal patterns
interface SupplierQuoteModalProps {
  project: Project; // Uses existing Project type (compatible with RFQ)
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Follows existing modal patterns from the codebase
// Uses existing UI components (Dialog, Button, Form)
// Compatible with existing form validation patterns
// Uses existing toast notification system

// Features:
// - Multi-supplier selection with search/filter
// - RFQ template generation
// - Email notification sending
// - Attachment management
// - Due date setting
// - Consistent with existing ClarificationModal.tsx design
```

**SupplierQuoteTable.tsx**
```typescript
interface SupplierQuoteTableProps {
  projectId: string;
  quotes: SupplierQuote[];
  onQuoteUpdate: (quote: SupplierQuote) => void;
}

// Features:
// - Real-time quote status tracking
// - Sortable columns (amount, lead time, received date)
// - Status badges with color coding
// - Quick action buttons (accept, reject, request clarification)
// - Bulk operations
```

**SupplierQuoteDashboard.tsx**
```typescript
// Metrics dashboard showing:
// - Response rate by supplier
// - Average quote turnaround time
// - Quote acceptance rates
// - Cost savings analysis
// - Supplier performance rankings
```

#### 1.3 Custom Hooks

**useSupplierQuotes.ts**
```typescript
// 🔒 MAINTAINS COMPATIBILITY with existing useProjects pattern
export const useSupplierQuotes = (projectId?: string) => {
  // Uses same pattern as existing useProjects.ts
  // Follows existing error handling with useToast
  // Maintains same loading/error state structure
  // Compatible with existing auth context
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // CRUD operations for supplier quotes
  // Real-time subscription to quote updates
  // Quote comparison logic
  // Email notification triggers
  // Performance analytics
  
  // Returns same structure as existing hooks
  return {
    quotes: [],
    loading: false,
    error: null,
    createQuote: () => {},
    updateQuote: () => {},
    deleteQuote: () => {}
  };
}

export const useSuppliers = () => {
  // Follows same pattern as useProjects
  // Compatible with existing authentication
  // Uses same error handling patterns
  
  // Supplier management operations
  // Performance tracking
  // Search and filtering
}
```

### Week 3-4: Enhanced Kanban Board & Workflow Engine

#### 2.1 Enhanced WorkflowKanban Component

**🔒 NON-BREAKING ENHANCEMENT of Existing WorkflowKanban.tsx**

**Based on Factory Pulse Wireframe Specifications:**

**Enhanced Kanban Layout:**
```typescript
// 🔒 PRESERVES EXISTING FUNCTIONALITY while adding new features
// Enhanced 8-Stage Workflow (from workflow.md)
const ENHANCED_WORKFLOW_STAGES = [
  { id: "inquiry_received", name: "Inquiry Received", color: "bg-blue-100 text-blue-800", count: 0 },
  { id: "technical_review", name: "Technical Review", color: "bg-orange-100 text-orange-800", count: 0 },
  { id: "supplier_rfq_sent", name: "Supplier RFQ Sent", color: "bg-indigo-100 text-indigo-800", count: 0 },
  { id: "quoted", name: "Quoted", color: "bg-green-100 text-green-800", count: 0 },
  { id: "order_confirmed", name: "Order Confirmed", color: "bg-purple-100 text-purple-800", count: 0 },
  { id: "procurement_planning", name: "Procurement & Planning", color: "bg-yellow-100 text-yellow-800", count: 0 },
  { id: "in_production", name: "In Production", color: "bg-teal-100 text-teal-800", count: 0 },
  { id: "shipped_closed", name: "Shipped & Closed", color: "bg-gray-100 text-gray-800", count: 0 }
];

interface EnhancedKanbanProps {
  projects: Project[]; // Same Project type as existing
  onStageChange: (projectId: string, newStage: ProjectStatus) => void; // Same signature
  
  // 🚀 NEW: Enhanced Features (all optional for backward compatibility)
  enableVirtualScrolling?: boolean; // Default false
  enableQuoteReadinessScore?: boolean; // Default false
  enableBottleneckDetection?: boolean; // Default false
  enableBulkOperations?: boolean; // Default false
  showStageMetrics?: boolean; // Default false
}

// Enhanced Project Card Features (from wireframe pack)
interface ProjectCardFeatures {
  // ✅ Existing features preserved
  projectId: string; // P-25082001 format
  title: string;
  priority: ProjectPriority;
  daysInStage: number;
  customer: string;
  assignee: string;
  estimatedValue?: number;
  
  // 🚀 NEW: Enhanced visual indicators
  quoteReadinessScore?: string; // "3/5 quotes in – 2 pending"
  bottleneckWarning?: boolean; // Show 🔥 icon if stuck
  riskCount?: number; // Show ⚠️ 2 risks logged
  approvalStatus?: {
    engineering?: 'approved' | 'pending' | 'rejected';
    qa?: 'approved' | 'pending' | 'rejected';
    production?: 'approved' | 'pending' | 'rejected';
  };
  fileCount?: number; // Show 📁 4 files
}
```

**Enhanced Search and Filter Bar:**
```typescript
interface KanbanFilterProps {
  // ✅ Existing search functionality preserved
  searchQuery: string;
  onSearchChange: (query: string) => void;
  
  // 🚀 NEW: Advanced filtering (from wireframe)
  filters: {
    priority: 'all' | 'urgent' | 'high' | 'medium' | 'low';
    assignee: 'all' | 'mine' | string;
    overdue: boolean;
    status: ProjectStatus | 'all';
  };
  
  // Search placeholder: "P-25082001 or 'connector housing'"
  // Filter buttons: All | High | Overdue | Mine
}
```
```

**Enhanced KanbanColumn with Metrics:**
```typescript
// 🔒 EXTENDS existing component without breaking changes
interface KanbanColumnProps {
  stage: ProjectStage; // Uses existing ProjectStage type
  projects: Project[]; // Uses existing Project type
  onProjectMove: (projectId: string, targetStage: ProjectStatus) => void; // Same signature
  isDropTarget: boolean;
  
  // 🚀 NEW: Enhanced column features (all optional)
  showMetrics?: boolean; // Default false for backward compatibility
  enableFilters?: boolean; // Default false
  showBottleneckIndicators?: boolean; // Default false
  
  // Column header displays: "Supplier RFQ Sent (1)" with count
  // Sub-header shows: "Avg. 2.8 days" if over SLA threshold
}

// Enhanced Column Header Features:
// - Stage name with project count
// - Average time in stage indicator
// - SLA warning if stage exceeds target (from workflow.md: 2 days target)
// - Bottleneck detection: 🔥 icon if > 14 days
// - Quick filters: Priority, Overdue, Assigned to me
```

**Quote Readiness Score (New Feature from Workflow.md):**
```typescript
interface QuoteReadinessIndicator {
  totalSuppliers: number; // 5 suppliers contacted
  receivedQuotes: number; // 3 quotes received
  pendingQuotes: number; // 2 pending
  overdueQuotes: number; // 0 overdue
  
  // Display: "3/5 quotes in – 2 pending" with progress bar
  // Color coding: 🟢 Green (ready), 🟡 Yellow (waiting), 🔴 Red (overdue)
}

// Visual implementation matches wireframe:
// "🟡 P-25082001 (2/3 quotes in)" in Supplier RFQ Sent column
```
```

**KanbanCard.tsx Enhancement**
```typescript
// Enhanced project cards with:
// - Time in stage visual indicators
// - Supplier quote status badges
// - Priority escalation warnings
// - Assignee avatars
// - Progress indicators for multi-step stages
// - Quick action menu
```

#### 2.2 Workflow Configuration System

**WorkflowConfig.tsx**
```typescript
interface WorkflowStage {
  id: string;
  name: string;
  color: string;
  order: number;
  isActive: boolean;
  wipLimit?: number;
  slaHours?: number;
  requiredFields: string[];
  allowedTransitions: string[];
}

// Features:
// - Drag & drop stage reordering
// - Stage-specific configuration
// - SLA warning thresholds
// - Required field validation
// - Custom stage colors and icons
```

### Week 4-6: Enhanced RFQ Intake Management & Project Integration

**🔄 ENHANCED RFQ INTAKE SYSTEM (Preserving + Expanding Existing Functionality)**

#### 4.1 Enhanced RFQ Intake Portal

**ProjectIntakePortal.tsx (Enhanced RFQIntakePortal.tsx)**
```typescript
// 🔒 MAINTAINS all existing RFQ Intake functionality
// 🚀 ADDS new project management capabilities

interface ProjectIntakePortalProps {
  // Maintains existing RFQ intake interface
  isPublic?: boolean; // For PublicRFQ.tsx compatibility
  onSubmissionSuccess?: (projectId: string) => void;
  
  // New enhanced features
  enableProjectTracking?: boolean;
  enableSupplierPreSelection?: boolean;
  enableAdvancedWorkflow?: boolean;
}

// 🔒 PRESERVES existing PublicRFQ.tsx portal layout:
// "Submit Your Manufacturing Inquiry"
// "We'll get back to you within 48 hours"

// ✅ Maintains existing form sections:
// 1. Customer Type Selection
// 2. Project Details
// 3. Customer Information  
// 4. File Attachments
// 5. Terms Agreement

// Features:
// ✅ All existing RFQ form fields preserved
// ✅ Same file upload functionality (CAD, PDF, XLSX)
// ✅ Same validation and error handling
// ✅ Same temporary ID generation
// 🚀 NEW: Automatic project categorization
// 🚀 NEW: Supplier suggestion based on requirements
// 🚀 NEW: Workflow stage assignment
// 🚀 NEW: Enhanced document management
```

**Enhanced ProjectIntakeForm.tsx (Based on Wireframe Pack):**
```typescript
// 🔒 PRESERVES all existing form functionality from RFQIntakeForm.tsx
interface ProjectIntakeFormData {
  // 🔒 EXISTING RFQ fields (preserved exactly as-is)
  // Customer Type Selection
  submissionType: 'customer' | 'sales_rep';
  
  // Project Details (matches wireframe layout)
  projectTitle: string;        // "High-Precision Sensor Mount"
  description: string;         // "Durable aluminum mount for industrial sensors..."
  estimatedVolume: number;     // 5,000 pcs
  targetPrice: number;         // $8.50 /unit
  desiredDeliveryDate: string; // 📅 Oct 15, 2025
  
  // Customer Information (preserved layout)
  name: string;                // "Sarah Chen"
  company: string;             // "TechNova Inc."
  email: string;               // "sarah.chen@technova.com"
  phone?: string;              // "+1-555-123-4567"
  country: string;             // "United States ▼"
  
  // File Attachments (preserved functionality)
  files: FileUpload[];         // Same drag & drop interface
  
  // Terms Agreement (preserved)
  agreeToTerms: boolean;
  
  // 🚀 NEW optional fields (backward compatible)
  projectType?: 'system_build' | 'fabrication' | 'manufacturing';
  estimatedValue?: number;
  preferredSuppliers?: string[];
  specialRequirements?: string[];
  qualityCertifications?: string[];
}

// 🔒 PRESERVES existing form layout from wireframe:
// ┌───────────────────────────────────────────────────────────────┐
// │  Project Details                                                    │
// ├───────────────────────────────────────────────────────────────┤
// │ Project Title*        [ High-Precision Sensor Mount ]              │
// │ Description           [ Durable aluminum mount for industrial... ] │
// │ Estimated Volume      [ 5,000 ] pcs                                │
// │ Target Price          [ $8.50 ] /unit                              │
// │ Desired Delivery Date [ 📅 Oct 15, 2025 ]                          │
// └───────────────────────────────────────────────────────────────┘

// Enhanced Features:
// ✅ Same UI/UX as existing RFQIntakeForm
// ✅ Same file upload with drag & drop
// ✅ Same form validation patterns
// ✅ Same temporary ID generation (P-YYYYMMDD format)
// 🚀 NEW: Intelligent project type detection
// 🚀 NEW: Supplier recommendation engine
// 🚀 NEW: BOM template suggestions
// 🚀 NEW: Automated workflow routing
```

**Enhanced File Upload Section (Preserved from Wireframe):**
```typescript
interface EnhancedFileUpload {
  // ✅ PRESERVES existing file upload functionality
  supportedTypes: string[]; // PDF, STEP, IGES, XLSX, DWG, SLDPRT
  maxFileSize: number;      // 50MB
  dragAndDrop: boolean;     // true
  
  // File display format (matches wireframe):
  // "📁 Drag & drop files or click to upload"
  // "Supported: PDF, STEP, IGES, XLSX, DWG, SLDPRT (Max 50MB)"
  // "[ Sensor_Mount_Drawing.pdf ] ✅"
  // "[ BOM_SensorMount.xlsx ] ✅"
  // "[+] Add Another File"
  
  // 🚀 NEW: Enhanced document processing
  enableBOMExtraction?: boolean;     // Extract BOM from CAD files
  enableDrawingAnalysis?: boolean;   // Analyze complexity
  enableRequirementDetection?: boolean; // Identify special requirements
}
```

#### 4.2 Database Migration Strategy

**RFQ to Project Data Migration**
```sql
-- 🔒 PRESERVE existing rfqs table
-- 🚀 CREATE projects table with RFQ compatibility

-- Migration script for existing RFQ data
INSERT INTO public.projects (
  id,
  project_id, -- Map from rfq_number
  title, -- Map from project_name  
  description,
  status, -- Use existing status mapping
  priority,
  estimated_value,
  due_date,
  created_at,
  updated_at,
  contact_name,
  contact_email,
  contact_phone,
  days_in_stage,
  stage_entered_at,
  notes
)
SELECT 
  id,
  rfq_number,
  project_name,
  description,
  status,
  priority,
  estimated_value,
  due_date,
  created_at,
  updated_at,
  contact_name,
  contact_email,
  contact_phone,
  days_in_stage,
  stage_entered_at,
  notes
FROM public.rfqs;

-- Create backward compatibility views
CREATE VIEW public.rfqs_compatibility AS
SELECT 
  id,
  project_id as rfq_number,
  title as project_name,
  description,
  status,
  priority,
  estimated_value,
  due_date,
  created_at,
  updated_at,
  contact_name,
  contact_email,
  contact_phone,
  days_in_stage,
  stage_entered_at,
  notes
FROM public.projects;
```

#### 4.3 Enhanced RFQ Processing Workflow

**Automated Project Categorization**
```typescript
// 🚀 NEW: Intelligent project type detection
interface ProjectCategorization {
  detectProjectType: (description: string, files: FileUpload[]) => ProjectType;
  suggestWorkflowPath: (projectType: ProjectType, complexity: string) => WorkflowStage[];
  recommendSuppliers: (projectType: ProjectType, requirements: string[]) => Supplier[];
  estimateTimeline: (projectType: ProjectType, quantity: number) => TimelineEstimate;
}

// Enhanced RFQ Intake Processing:
// 1. Customer submits RFQ (same interface as before)
// 2. System auto-categorizes as Project Type
// 3. Intelligent supplier recommendations
// 4. Automated workflow stage assignment
// 5. Enhanced document processing and BOM extraction
```

**Enhanced Document Processing**
```typescript
// 🔒 MAINTAINS existing file upload functionality
// 🚀 ADDS intelligent document processing

interface EnhancedDocumentProcessor {
  // Existing functionality preserved
  uploadFiles: (files: File[]) => Promise<ProjectDocument[]>;
  validateFileTypes: (files: File[]) => ValidationResult;
  
  // New enhanced features
  extractBOMFromCAD: (cadFile: File) => Promise<BOMItem[]>;
  analyzeDrawingComplexity: (drawingFiles: File[]) => ComplexityAnalysis;
  suggestManufacturingProcesses: (documents: ProjectDocument[]) => ProcessRecommendation[];
  identifySpecialRequirements: (documents: ProjectDocument[]) => RequirementFlag[];
}
```

#### 4.4 Migration Timeline & Compatibility

**Week 4: Database & Backend Migration**
- Migrate existing RFQ data to Projects table
- Create compatibility views for RFQ endpoints
- Test backward compatibility with existing workflows
- Maintain existing RFQ Intake Portal functionality

**Week 5: Frontend Component Migration**
- Rename components with backward compatibility
- Update hooks with legacy method support
- Test existing RFQ submission workflows
- Enhance UI with new project management features

**Week 6: Enhanced Features Integration**
- Add intelligent categorization to intake process
- Integrate supplier recommendations
- Implement enhanced document processing
- Add automated workflow routing

**Validation Checklist:**
- ✅ Existing RFQ submission process works unchanged
- ✅ All existing RFQ data accessible in new Project interface
- ✅ PublicRFQ.tsx portal maintains same user experience
- ✅ File upload and document management preserved
- ✅ Same form validation and error handling
- ✅ Existing API endpoints continue working
- 🚀 New enhanced features available as optional upgrades

### Week 5-6: Enhanced Project Detail Pages & Navigation

**🔒 ENHANCED PROJECT DETAIL INTERFACE (Based on Wireframe Pack)**

#### 5.1 Project Detail Page Layout

**ProjectDetail.tsx (Enhanced RFQDetail.tsx)**
```typescript
// 🔒 MAINTAINS existing RFQDetail.tsx functionality
// 🚀 ENHANCED with comprehensive project management features

interface ProjectDetailProps {
  projectId: string; // P-25082001 format
  // Maintains existing RFQDetail interface compatibility
}

// Enhanced Navigation Sidebar (from wireframe)
interface ProjectDetailNavigation {
  sections: [
    'Overview',      // ✅ Existing project information
    'Documents',     // ✅ Enhanced document management
    'Reviews',       // ✅ Existing internal review system
    'Supplier',      // 🚀 NEW: Supplier RFQ tracking
    'Timeline',      // 🚀 NEW: Project timeline view
    'Analytics',     // 🚀 NEW: Project-specific metrics
    'Settings'       // 🚀 NEW: Project configuration
  ];
}

// Project Header (matches wireframe layout)
interface ProjectHeader {
  projectId: string;     // "P-25082001 – Sensor Mount"
  status: ProjectStatus; // "Status: Supplier RFQ Sent"
  priority: ProjectPriority; // "Priority: Medium"
  customer: string;      // "🏢 Customer: TechNova Inc."
  createdDate: string;   // "📅 Created: Aug 20, 2025"
  owner: string;         // "👤 Owner: Sarah Lee"
}
```

**Enhanced Overview Section:**
```typescript
interface ProjectOverviewData {
  // ✅ Existing fields preserved
  title: string;           // "Sensor Mount – Aluminum Alloy"
  description: string;     // "High-precision mount for industrial sensors"
  volume: number;          // 5,000 pcs
  targetPrice: number;     // $8.50/unit
  deliveryDate: string;    // "Oct 15, 2025"
  notes: string;           // "Customer open to alternative materials"
  
  // 🚀 NEW: Enhanced project data
  projectType: ProjectType; // system_build | fabrication | manufacturing
  estimatedValue: number;   // Total project value
  currentStage: ProjectStatus;
  daysInCurrentStage: number;
  slaTarget: number;        // Days (from workflow.md)
  escalationLevel: 'none' | 'warning' | 'critical';
}
```

#### 5.2 Enhanced Document Management

**Documents Section (Enhanced from Wireframe):**
```typescript
interface ProjectDocument {
  // ✅ Existing document fields preserved
  id: string;
  filename: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: number;
  
  // 🚀 NEW: Enhanced document features
  accessLevel: 'public' | 'internal_only' | 'confidential'; // 🔒 Internal Only
  documentType: 'drawing' | 'bom' | 'specification' | 'quote' | 'other';
  isLatestVersion: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  linkedToStage?: ProjectStatus; // Which workflow stage requires this doc
}

// Document Display (matches wireframe format):
// "📄 Sensor_Mount_Drawing_REV2.pdf [v2] 📅 Aug 20 · 👤 Sarah · 🔒 Internal Only"
```

#### 5.3 Enhanced Internal Reviews Section

**Reviews Section (Enhanced from existing):**
```typescript
interface EnhancedInternalReview {
  // ✅ Existing review structure preserved
  department: 'Engineering' | 'QA' | 'Production';
  status: 'pending' | 'approved' | 'rejected' | 'requires_info';
  reviewer: string;
  reviewDate: string;
  comments: string;
  
  // 🚀 NEW: Enhanced review features
  reviewTime: string;      // "14:30" time stamp
  riskLevel: 'low' | 'medium' | 'high';
  estimatedImpact?: {
    cost?: number;         // "Tooling required: custom jig ($1,200)"
    schedule?: number;     // "Cycle time: ~4.5 min/unit"
    quality?: string;      // "CMM inspection required"
  };
  attachments?: ProjectDocument[];
}

// Display format (matches wireframe):
// "✅ Engineering 👤 Minh · Aug 21 📅 14:30"
// "  - Design feasible, no major risks"
// "  - Suggest anodizing for corrosion resistance"
```

#### 5.4 NEW: Supplier RFQ Tracking Section

**Supplier RFQ Section (New from Workflow.md):**
```typescript
interface SupplierRFQTracking {
  rfqSentDate: string;
  deadline: string;
  suppliers: SupplierQuoteStatus[];
  quoteReadinessScore: {
    total: number;    // 3 suppliers
    received: number; // 2 quotes received
    pending: number;  // 1 pending
    overdue: number;  // 0 overdue
  };
}

interface SupplierQuoteStatus {
  supplierId: string;
  name: string;              // "Precision Metals Co."
  email: string;             // "joe@precimetals.com"
  status: 'sent' | 'received' | 'overdue' | 'declined';
  quoteAmount?: number;      // $7.80/unit
  leadTime?: number;         // weeks
  responseDate?: string;
  deadline: string;          // "Due: Aug 25"
}

// Display format (matches wireframe):
// "📧 Sent to:"
// "  • Precision Metals Co. (joe@precimetals.com) – 🟡 Pending (Due: Aug 25)"
// "  • CNC Masters Inc. (quotes@cnchub.com) – ✅ Received ($7.80/unit)"
// "  • Alpha Fabricators (rfq@alphafab.com) – ✅ Received ($8.10/unit)"

// Action buttons: [📤 Resend] [➕ Add Supplier] [📅 Set Deadline]
```

#### 5.5 NEW: Timeline & Analytics Sections

**Timeline Section:**
```typescript
interface ProjectTimeline {
  stages: ProjectStageHistory[];
  milestones: ProjectMilestone[];
  criticalPath: string[];
  currentBottlenecks: string[];
}

interface ProjectStageHistory {
  stage: ProjectStatus;
  enteredAt: string;
  exitedAt?: string;
  durationDays: number;
  slaTarget: number;
  isOnTime: boolean;
  notes?: string;
}
```

**Analytics Section:**
```typescript
interface ProjectAnalytics {
  cycleTimeComparison: {
    thisProject: number;  // days
    average: number;      // days
    benchmark: number;    // days
  };
  supplierPerformance: {
    responseRate: number; // %
    avgResponseTime: number; // days
    quoteAccuracy: number; // %
  };
  costAnalysis: {
    targetCost: number;
    currentBestQuote: number;
    costSavings: number;
    marginAnalysis: number; // %
  };
}
```

#### 5.6 Activity Feed Enhancement

**Enhanced Activity Log (from wireframe):**
```typescript
interface ProjectActivity {
  // ✅ Existing activity structure preserved
  timestamp: string;        // "📅 Aug 25, 10:15"
  user: string;            // "Sarah (Sales)"
  action: string;          // "Updated target price to $8.20 based on supplier quotes"
  
  // 🚀 NEW: Enhanced activity features
  activityType: 'status_change' | 'document_upload' | 'review_complete' | 
                'supplier_rfq_sent' | 'quote_received' | 'comment_added';
  impactLevel: 'low' | 'medium' | 'high';
  linkedEntities?: {
    documents?: string[];
    suppliers?: string[];
    reviews?: string[];
  };
}

// Display format (matches wireframe):
// "📅 Aug 25, 10:15 – Sarah (Sales)"
// "  Updated target price to $8.20 based on supplier quotes"
```

#### 5.1 Notification Infrastructure

**NotificationBell.tsx**
```typescript
interface NotificationBellProps {
  userId: string;
  onNotificationClick: (notification: Notification) => void;
}

// Features:
// - Real-time notification count
// - Priority-based styling
// - Sound notifications for urgent items
// - Notification categories (quotes, reviews, overdue)
```

**NotificationDropdown.tsx**
```typescript
// Features:
// - Categorized notification list
// - Mark as read/unread
// - Quick actions (acknowledge, snooze, delegate)
// - Notification history with search
// - Bulk operations
```

**NotificationContext.tsx**
```typescript
interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  addNotification: (notification: CreateNotificationRequest) => void;
  subscribeToProject: (projectId: string) => void;
  preferences: NotificationPreferences;
}

// Notification triggers:
// - Project stage changes
// - Supplier quote received
// - SLA breaches
// - Review requests
// - Assignment changes
```

#### 5.2 Real-time Update System

**Database Triggers for Real-time Events**
```sql
-- 🔒 MAINTAINS existing real-time patterns
-- Real-time triggers for project updates (compatible with RFQ legacy)
CREATE OR REPLACE FUNCTION notify_project_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'project_updates',
    json_build_object(
      'operation', TG_OP,
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION notify_project_change();

-- Backward compatibility trigger for RFQ view
CREATE TRIGGER rfq_compatibility_trigger
  INSTEAD OF INSERT OR UPDATE OR DELETE ON public.rfqs_compatibility
  FOR EACH ROW EXECUTE FUNCTION handle_rfq_compatibility();
```

### Week 9-10: Analytics Dashboard & KPI Tracking

#### 6.1 Analytics Components

**AnalyticsDashboard.tsx (Based on Wireframe Pack Layout)**
```typescript
// 🔒 INCLUDES RFQ intake conversion metrics
// Dashboard Layout (matches wireframe specifications)

interface AnalyticsDashboardLayout {
  // Header Controls (from wireframe)
  timeRange: '📅 Last 30 Days' | 'Last 90 Days' | 'Last Year';
  customerFilter: '🏢 All Customers' | string;
  teamFilter: '👥 All Teams' | string;
  
  // KPI Cards Layout (4-column grid from wireframe)
  kpiCards: [
    {
      title: 'Avg. RFQ Cycle Time';
      value: '6.8 days';
      trend: '▼ 2.2 days';
      comparison: '(vs. 9.0)';
      trendDirection: 'down'; // down is good for cycle time
    },
    {
      title: 'Win Rate';
      value: '48%';
      trend: '▲ 13%';
      comparison: '(vs. 35%)';
      trendDirection: 'up';
    },
    {
      title: 'Supplier Response Rate';
      value: '89%';
      trend: '▲ 29%';
      comparison: '(target: 90%)';
      trendDirection: 'up';
      isNearTarget: true;
    },
    {
      title: 'On-Time Quote Delivery Rate';
      value: '92%';
      trend: '▲ 12%';
      comparison: '';
      trendDirection: 'up';
    }
  ];
}

// Key Performance Indicators (enhanced from wireframe):
interface AnalyticsMetrics {
  // 🔒 Core KPIs from wireframe
  supplierResponseRate: number; // Target: 90% (from improve plan)
  averageCycleTime: number;     // 6.8 days (from wireframe)
  winRate: number;              // 48% (from wireframe)
  onTimeDeliveryRate: number;   // 92% (from wireframe)
  
  // 🚀 NEW: Enhanced metrics
  rfqConversionRate: number;    // RFQ to won projects
  bottleneckStages: StageBottleneck[];
  costSavings: number;
  intakePortalMetrics: IntakePortalStats;
  
  // Lead Time Breakdown (from wireframe chart)
  leadTimeByPhase: {
    inquiry: 1.2;        // days
    review: 2.1;         // days
    supplierRFQ: 2.8;    // days (exceeds SLA target of 2 days)
    quoted: 0.7;         // days
    order: 0.0;          // days
  };
}

// Bottleneck Detection (from wireframe)
interface BottleneckAlert {
  type: '🔥 Bottlenecks Detected';
  issues: [
    '• Supplier RFQ phase exceeds SLA (target: 2 days, actual: 2.8)',
    '• 3 RFQs delayed due to missing drawings'
  ];
  severity: 'warning' | 'critical';
}

// Win/Loss Analysis (from wireframe)
interface WinLossAnalysis {
  summary: {
    won: 12;
    lost: 7;
    pending: 4;
  };
  lossReasons: [
    { reason: 'Price', percentage: 60 },
    { reason: 'Lead Time', percentage: 30 },
    { reason: 'Capability', percentage: 10 }
  ];
}
```

**Enhanced Supplier Performance Table (from Wireframe):**
```typescript
interface SupplierPerformanceTable {
  title: '🔄 Supplier Performance (Top 5)';
  columns: [
    'Supplier',
    'Quote Submission', // %
    'On-Time Delivery', // %
    'Quality Score'     // x/5.0
  ];
  
  data: [
    {
      supplier: 'CNC Masters Inc.',
      quoteSubmission: '98%',
      onTimeDelivery: '95%',
      qualityScore: '4.8/5.0'
    },
    {
      supplier: 'Precision Metals Co.',
      quoteSubmission: '85%',
      onTimeDelivery: '90%',
      qualityScore: '4.5/5.0'
    },
    {
      supplier: 'Alpha Fabricators',
      quoteSubmission: '92%',
      onTimeDelivery: '88%',
      qualityScore: '4.3/5.0'
    }
  ];
  
  actions: ['Export Report', 'Customize View'];
}
```

**SupplierMetrics.tsx (Enhanced with RFQ tracking)**
```typescript
// 🔒 TRACKS supplier performance from RFQ stage
interface SupplierMetricsData {
  // Supplier Performance Dashboard:
  responseMetrics: {
    responseRate: number;        // % of RFQs responded to
    avgResponseTime: number;     // days to respond
    onTimeResponseRate: number;  // % responded by deadline
  };
  
  quoteAccuracy: {
    initialVsFinal: number;      // % variance between initial and final quotes
    priceCompetitiveness: number; // ranking vs other suppliers
  };
  
  deliveryPerformance: {
    onTimeDelivery: number;      // %
    qualityScore: number;        // 1-5 rating
    defectRate: number;          // %
  };
  
  rfqAnalytics: {
    totalRFQsSent: number;
    responsesReceived: number;
    averageQuoteValue: number;
    winRate: number;             // % of quotes that led to orders
  };
}
```

**WorkflowAnalytics.tsx (Enhanced with bottleneck detection)**
```typescript
// 🔒 INCLUDES RFQ intake stage analytics
interface WorkflowAnalyticsData {
  // Workflow Efficiency Analysis (matches wireframe lead time chart):
  stagePerformance: {
    inquiryReceived: {
      avgDuration: 1.2;      // days
      slaTarget: 1.0;        // days
      projectCount: number;
      bottleneckRisk: 'low' | 'medium' | 'high';
    };
    technicalReview: {
      avgDuration: 2.1;
      slaTarget: 2.0;
      projectCount: number;
      bottleneckRisk: 'low';
    };
    supplierRFQSent: {
      avgDuration: 2.8;      // EXCEEDS SLA (from wireframe)
      slaTarget: 2.0;
      projectCount: number;
      bottleneckRisk: 'high'; // 🔥 Bottleneck detected
    };
    // ... other stages
  };
  
  // Stage transition patterns
  transitionAnalysis: {
    fastestPath: ProjectStatus[];
    commonDelays: DelayPattern[];
    resourceUtilization: ResourceMetrics[];
  };
  
  // Throughput trends
  throughputMetrics: {
    projectsPerWeek: number;
    avgCycleTime: number;
    wipLimits: Record<ProjectStatus, number>;
  };
}
```

**Chart Components with Recharts (Dark/Light Mode Support)**
```typescript
// 🔒 ENHANCED with RFQ intake analytics
interface ChartComponents {
  // Timeline charts for project progression (from RFQ submission)
  timelineChart: {
    type: 'gantt' | 'timeline';
    showRFQIntakePhase: boolean;
    colorTheme: 'light' | 'dark';
  };
  
  // Bar charts for stage duration analysis (matches wireframe)
  leadTimeChart: {
    data: {
      inquiry: 1.2,
      review: 2.1,
      supplierRFQ: 2.8, // Highlighted as over SLA
      quoted: 0.7,
      order: 0.0
    };
    slaThresholds: boolean; // Show target lines
    highlightBottlenecks: boolean; // Highlight stages over SLA
  };
  
  // Pie charts for project type distribution
  projectTypeDistribution: {
    systemBuild: number;
    fabrication: number;
    manufacturing: number;
  };
  
  // Line charts for trend analysis
  trendAnalysis: {
    supplierResponseRate: TrendData[];
    cycleTime: TrendData[];
    winRate: TrendData[];
  };
  
  // Heatmaps for workload distribution
  workloadHeatmap: {
    byStage: Record<ProjectStatus, number>;
    byAssignee: Record<string, number>;
    byPriority: Record<ProjectPriority, number>;
  };
  
  // 🚀 NEW: Funnel charts for RFQ conversion rates
  rfqConversionFunnel: {
    rfqSubmitted: number;
    technicallyFeasible: number;
    quoted: number;
    won: number;
    conversionRate: number; // %
  };
}

// Dark Mode Chart Configuration (from wireframe pack)
interface DarkModeChartTheme {
  background: '#1E1E1E';
  gridLines: '#333';
  colors: ['#03DAC6', '#BB86FC', '#FFD740', '#CF6679'];
  text: '#E0E0E0';
  alerts: '#CF6679'; // for 🔥 bottleneck indicators
}
```

### Week 11-12: Document Management & Review System Enhancement

#### 7.1 Document Version Control

**DocumentVersionControl.tsx**
```typescript
// 🔒 COMPATIBLE with existing RFQ document uploads
interface DocumentVersion {
  id: string;
  filename: string;
  version: number;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  changes: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  sourceType: 'rfq_intake' | 'project_update' | 'supplier_response'; // NEW: track document source
}

// Features:
// ✅ Compatible with existing RFQ document uploads
// - Side-by-side version comparison
// - Change tracking and comments
// - Approval workflow integration
// - Automatic version numbering
// - Rollback capabilities
// 🚀 NEW: RFQ document lineage tracking
```

#### 7.2 BOM Management

**BOMEditor.tsx**
```typescript
// 🔒 INTEGRATES with RFQ intake document processing
interface BOMItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  leadTime?: number;
  specifications: Record<string, any>;
  sourceDocument?: string; // NEW: link to original RFQ document
}

// Features:
// - Hierarchical BOM structure
// - Cost rollup calculations
// - Supplier assignment per item
// - Alternative part suggestions
// - Export to supplier RFQ format
// 🚀 NEW: Auto-populate from RFQ intake documents
```

#### 7.3 Document Approval Workflow

**DocumentApproval.tsx**
```typescript
// 🔒 INCLUDES RFQ intake document approval
// Features:
// - Multi-stage approval process
// - Role-based approval requirements
// - Parallel and sequential approvals
// - Approval history and audit trail
// - Email notifications for pending approvals
// 🚀 NEW: RFQ intake document fast-track approval
```

### Week 13-14: Admin Configuration & Testing

#### 8.1 System Administration (Based on Wireframe Pack)

**Admin Panel Layout (from Wireframe Specifications):**
```typescript
interface AdminPanelLayout {
  header: {
    title: 'Admin Panel: Workflow Configuration';
    userInfo: '👤 Admin | 🏢 Factory Pulse | 🔐 Secure Mode';
  };
  
  description: '📌 Configure your project lifecycle stages and rules.';
  
  sections: [
    'Workflow Stages',
    'Stage Transitions', 
    'Business Rules'
  ];
}
```

**Enhanced WorkflowConfig.tsx (from Wireframe)**
```typescript
interface WorkflowConfigurationPanel {
  // Workflow Stages Section (drag & drop from wireframe)
  stageConfiguration: {
    stages: [
      { id: 1, name: 'Inquiry Received', color: '🔵', order: 1, active: true },
      { id: 2, name: 'Technical Review', color: '🟡', order: 2, active: true },
      { id: 3, name: 'Supplier RFQ Sent', color: '🟠', order: 3, active: true },
      { id: 4, name: 'Quoted', color: '🟢', order: 4, active: true },
      { id: 5, name: 'Order Confirmed', color: '🔵', order: 5, active: true },
      { id: 6, name: 'In Production', color: '🟣', order: 6, active: true },
      { id: 7, name: 'Shipped & Closed', color: '🟤', order: 7, active: true }
    ];
    
    actions: {
      addNewStage: '[+] Add New Stage';
      dragToReorder: 'Drag to reorder stages. Click to edit name, color, order.';
    };
  };
  
  // Stage Transitions Section (from wireframe)
  transitionRules: {
    allowedTransitions: [
      { from: 'Inquiry Received', to: 'Technical Review', enabled: true },
      { from: 'Technical Review', to: 'Supplier RFQ Sent', enabled: true },
      { from: 'Supplier RFQ Sent', to: 'Quoted', enabled: true },
      { from: 'Quoted', to: 'Order Confirmed', enabled: true }
    ];
    
    actions: {
      addNewRule: '[+] Add New Rule';
    };
  };
  
  // Business Rules Section (from wireframe)
  businessRules: {
    automationRules: [
      {
        rule: 'Auto-advance to "Supplier RFQ Sent" when all reviews are approved';
        enabled: false;
      },
      {
        rule: 'Require management approval for quotes > $10,000';
        enabled: false;
      },
      {
        rule: 'Send reminder if supplier quote is overdue by 1 day';
        enabled: false;
      },
      {
        rule: 'Auto-assign RFQs to Procurement Owner based on workload';
        enabled: false;
      }
    ];
    
    actions: {
      addNewRule: '[+] Add New Rule';
    };
  };
  
  // Panel Actions (from wireframe)
  panelActions: ['Save Configuration', 'Reset to Default', 'Audit Log'];
}

interface WorkflowStage {
  id: string;
  name: string;
  color: string;
  order: number;
  isActive: boolean;
  wipLimit?: number;
  slaHours?: number;
  requiredFields: string[];
  allowedTransitions: string[];
}

// Features (from wireframe pack):
// - Drag-and-drop stage reordering
// - Color picker for stage colors
// - Transition rules configuration
// - Business logic automation
// - SLA threshold settings
```

**UserManagement.tsx (Enhanced with RFQ permissions)**
```typescript
// 🔒 MAINTAINS existing RFQ-based permissions
interface UserManagementPanel {
  // User Role Assignment (maintains existing RFQ roles)
  roleManagement: {
    availableRoles: [
      'Management',
      'Procurement_Owner',
      'Procurement', 
      'Engineering',
      'QA',
      'Production',
      'Customer',
      'Supplier'
    ];
    
    // Permission matrix for RFQ/Project access
    permissionMatrix: Record<UserRole, Permission[]>;
  };
  
  features: [
    'User role assignment (maintains existing RFQ roles)',
    'Permission matrix management',
    'Bulk user operations',
    'Activity monitoring', 
    'Access control testing',
    'RFQ Intake Portal access management' // 🚀 NEW
  ];
}
```

**SystemSettings.tsx (Enhanced with RFQ configuration)**
```typescript
// 🔒 INCLUDES RFQ intake configuration
interface SystemSettingsPanel {
  configurationOptions: {
    // Default SLA times per stage (from workflow.md)
    slaSettings: {
      inquiryReceived: { target: 1, unit: 'days' };
      technicalReview: { target: 2, unit: 'days' };
      supplierRFQSent: { target: 2, unit: 'days' }; // Target from workflow
      quoted: { target: 1, unit: 'days' };
      // ... other stages
    };
    
    // Email notification templates
    emailTemplates: {
      rfqReceived: 'RFQ submission confirmation';
      supplierRFQSent: 'Supplier RFQ notification';
      quoteOverdue: 'Supplier quote overdue reminder';
      stageTransition: 'Project stage change notification';
    };
    
    // Currency and localization
    localization: {
      currency: 'USD' | 'EUR' | 'GBP';
      dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY';
      timeZone: string;
      language: 'en' | 'fr' | 'de' | 'es';
    };
    
    // Integration settings
    integrations: {
      emailProvider: 'smtp' | 'sendgrid' | 'mailgun';
      fileStorage: 'supabase' | 'aws-s3' | 'azure-blob';
      auditLogging: boolean;
      realTimeUpdates: boolean;
    };
    
    // 🚀 NEW: RFQ Intake Portal customization
    intakePortalSettings: {
      enablePublicSubmissions: boolean;
      requireCustomerApproval: boolean;
      autoAssignmentRules: AssignmentRule[];
      customFields: CustomField[];
      fileUploadLimits: {
        maxFileSize: number; // MB
        allowedTypes: string[];
        maxFiles: number;
      };
    };
    
    // 🚀 NEW: Project categorization rules
    categorizationRules: {
      autoDetection: boolean;
      keywordMappings: Record<string, ProjectType>;
      defaultAssignments: DefaultAssignment[];
    };
  };
}
```

#### 8.2 Testing Strategy

**Unit Testing with Jest**
```typescript
// 🔒 INCLUDES RFQ component testing
// Component testing (including RFQ intake components)
// Hook testing with @testing-library/react-hooks
// Utility function testing
// Type safety validation
// RFQ to Project migration testing
```

**Integration Testing**
```typescript
// 🔒 VALIDATES RFQ to Project migration
// API endpoint testing (RFQ + Project endpoints)
// Database operation testing
// Authentication flow testing
// File upload/download testing
// RFQ Intake Portal integration testing
```

**End-to-End Testing with Cypress**
```typescript
// 🔒 COMPREHENSIVE RFQ to Project workflow testing
// Critical user journeys:
// - RFQ submission to project completion
// - Supplier quote management flow
// - Document approval workflow
// - Role-based access validation
// - RFQ Intake Portal public submission
// - Legacy RFQ data access verification
```

## Theme System Implementation

**Based on Factory Pulse Wireframe Pack Design System:**

### Light/Dark Mode Toggle
```typescript
// Theme toggle implementation (from wireframe pack)
interface ThemeSystemProps {
  // CSS Variables for theming (from wireframe specifications)
  lightTheme: {
    '--bg-primary': '#ffffff';
    '--bg-card': '#f8f9fa';
    '--text-primary': '#1a1a1a';
    '--text-secondary': '#6b7280';
    '--accent-primary': '#3b82f6';
    '--accent-secondary': '#10b981';
    '--border': '#e5e7eb';
    '--shadow': '0 1px 3px rgba(0, 0, 0, 0.1)';
  };
  
  darkTheme: {
    '--bg-primary': '#121212';
    '--bg-card': '#1e1e1e';
    '--text-primary': '#e0e0e0';
    '--text-secondary': '#9ca3af';
    '--accent-primary': '#03dac6';
    '--accent-secondary': '#bb86fc';
    '--border': '#374151';
    '--shadow': '0 2px 4px rgba(0, 0, 0, 0.3)';
  };
  
  // Theme toggle component (from wireframe)
  themeToggle: {
    component: 'ThemeToggleButton';
    location: 'AppHeader';
    icons: { light: '☀️', dark: '🌙' };
    persistence: 'localStorage' | 'userProfile';
  };
}

// Theme implementation strategy
const themeImplementation = {
  // 1. CSS Variables for theming
  cssVariables: `
    :root {
      --bg-primary: #ffffff;
      --bg-card: #f8f9fa;
      --text-primary: #1a1a1a;
      --accent: #3b82f6;
    }
    
    :root[data-theme="dark"] {
      --bg-primary: #121212;
      --bg-card: #1e1e1e;
      --text-primary: #e0e0e0;
      --accent: #03dac6;
    }
  `,
  
  // 2. Theme Toggle Button (from wireframe)
  toggleComponent: `
    <button onClick={toggleTheme} className="theme-toggle">
      {darkMode ? '🌙' : '☀️'}
    </button>
  `,
  
  // 3. Persist Preference
  persistence: 'localStorage.setItem("theme", currentTheme)',
  
  // 4. Test on Real Devices (from wireframe pack notes)
  testing: 'especially tablets on the shop floor'
};
```

### Component Style Enhancements
```typescript
// Enhanced component styling (matches wireframe pack)
interface ComponentStyleGuide {
  // Card elevations (from wireframe)
  cardStyles: {
    light: 'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)';
    dark: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3)';
    elevated: 'card-elevated class for enhanced depth';
  };
  
  // Priority color enhancements (from wireframe)
  priorityBadges: {
    urgent: {
      light: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
      dark: { bg: '#7f1d1d', text: '#fca5a5', glow: true };
    };
    high: {
      light: { bg: '#fef3c7', text: '#d97706', border: '#fbbf24' };
      dark: { bg: '#78350f', text: '#fbbf24', glow: true };
    };
    // ... other priorities
  };
  
  // Button enhancements (from wireframe)
  buttonStyles: {
    primary: {
      light: 'bg-blue-600 hover:bg-blue-700';
      dark: 'bg-teal-600 hover:bg-teal-500 glow-effect';
    };
    secondary: {
      light: 'bg-gray-100 hover:bg-gray-200';
      dark: 'bg-gray-800 hover:bg-gray-700';
    };
  };
}
```

### Enhanced Project Model
```typescript
// 🔒 ADDITIVE-ONLY interface extensions
// All existing Project fields remain unchanged
// Legacy RFQ compatibility preserved: export type RFQ = Project

interface Project {
  // ✅ ALL EXISTING FIELDS PRESERVED (from existing codebase)
  id: string;
  project_id: string; // P-25082001 format
  title: string;
  description?: string;
  customer_id?: string;
  customer?: Customer;
  status: ProjectStatus; // Uses existing status mapping
  priority: ProjectPriority;
  priority_score?: number;
  project_type: ProjectType;
  assignee_id?: string;
  estimated_value?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  days_in_stage: number;
  stage_entered_at: string;
  engineering_reviewer_id?: string;
  qa_reviewer_id?: string;
  production_reviewer_id?: string;
  review_summary?: any; // JSONB field from database
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  tags?: string[];
  notes?: string;
  
  // 🔒 NEW OPTIONAL FIELDS (backward compatible)
  // New supplier quote fields
  supplierQuotes?: SupplierQuote[];
  selectedQuoteId?: string;
  quotingDeadline?: string;
  quoteComparisonData?: QuoteComparison;
  
  // Enhanced workflow fields
  slaDeadline?: string;
  escalationLevel?: 'none' | 'warning' | 'critical';
  workflowMetrics?: WorkflowMetric[];
  
  // Document management
  bomDocuments?: ProjectDocument[];
  approvalStatus?: DocumentApprovalStatus;
}

// 🔒 LEGACY COMPATIBILITY MAINTAINED
export type RFQStatus = ProjectStatus;
export type RFQPriority = ProjectPriority;
export type RFQType = ProjectType;
export type RFQ = Project; // Existing legacy mapping preserved
export type RFQAttachment = ProjectDocument;
export type RFQActivity = ProjectActivity;
export type RFQStage = ProjectStage;
```

### Supplier Quote Model
```typescript
interface SupplierQuote {
  id: string;
  projectId: string;
  supplierId: string;
  supplier: Supplier;
  quoteAmount: number;
  leadTimeDays: number;
  quoteValidUntil: string;
  status: 'sent' | 'received' | 'rejected' | 'accepted' | 'expired';
  rfqSentAt: string;
  quoteReceivedAt?: string;
  notes?: string;
  attachments: QuoteAttachment[];
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

### Supplier Quote Management
```typescript
// GET /api/projects/:id/quotes - Get all quotes for a project
// POST /api/projects/:id/quotes - Send RFQ to suppliers
// PUT /api/quotes/:id - Update quote status
// POST /api/quotes/:id/accept - Accept a quote
// GET /api/suppliers - Get supplier list with search/filter
// POST /api/suppliers - Create new supplier
```

### Analytics & Reporting
```typescript
// GET /api/analytics/dashboard - Get KPI dashboard data
// GET /api/analytics/suppliers - Get supplier performance metrics
// GET /api/analytics/workflow - Get workflow efficiency data
// GET /api/reports/export - Export analytics data
```

### Workflow Configuration
```typescript
// GET /api/workflow/stages - Get workflow configuration
// PUT /api/workflow/stages - Update workflow configuration
// POST /api/workflow/stages/:id/move - Move project between stages
```

## Performance Optimizations

### Virtual Scrolling Implementation
```typescript
// Use @tanstack/react-virtual for Kanban columns
// Implement windowing for large project lists
// Lazy loading for project details
// Optimize re-renders with React.memo and useMemo
```

### Database Optimizations
```sql
-- 🔒 ADDITIVE-ONLY database optimizations
-- No existing indexes modified or removed
-- New indexes added for performance enhancement

-- New indexes for enhanced performance (safe to add)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status_new ON public.projects(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_assignee_new ON public.projects(assignee_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_customer ON public.projects(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);

-- New table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_quotes_project ON public.supplier_quotes(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_quotes_status ON public.supplier_quotes(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_quotes_sent_at ON public.supplier_quotes(rfq_sent_at);

-- Materialized views for analytics
CREATE MATERIALIZED VIEW project_analytics AS
SELECT 
  status,
  COUNT(*) as project_count,
  AVG(days_in_stage) as avg_days_in_stage,
  AVG(estimated_value) as avg_value
FROM projects 
GROUP BY status;
```

### Caching Strategy
```typescript
// React Query cache configuration
// Supabase real-time subscriptions
// Local storage for user preferences
// Service worker for offline functionality
```

## Security Considerations

### Row Level Security (RLS)
```sql
-- Project access based on user role and assignment
CREATE POLICY project_access ON projects
  FOR ALL TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_project_access 
      WHERE project_id = projects.id
    )
    OR
    auth.jwt() ->> 'role' = 'admin'
  );
```

### Data Validation
```typescript
// Zod schemas for form validation
// API input sanitization
// File upload restrictions
// SQL injection prevention
```

## Deployment Strategy

### Environment Configuration
```typescript
// Development, staging, production environments
// Environment-specific configuration
// Feature flags for gradual rollout
// Database migration strategy
```

### Monitoring & Logging
```typescript
// Error tracking with Sentry
// Performance monitoring
// User analytics
// Database query monitoring
```

## Success Metrics

**🔒 COMPATIBILITY VALIDATION:**
- **Zero regression** in existing functionality
- **100% API compatibility** with existing integrations
- **Seamless user experience** transition
- **No data migration** required for existing projects
- **Maintained performance** for existing workflows

### Key Performance Indicators
- **Supplier Response Rate**: Current 60% → Target 90%
- **Project Cycle Time**: Reduce by 25%
- **User Adoption**: 80% of procurement team using new features daily
- **System Performance**: <2s page load times (maintained)
- **Data Accuracy**: 99%+ project status accuracy (maintained)
- **Backward Compatibility**: 100% existing functionality preserved

### Testing Validation
- **Unit Test Coverage**: >80% (including existing components)
- **Integration Test Coverage**: >70% (existing + new APIs)
- **E2E Test Coverage**: Critical user journeys (existing + enhanced)
- **Regression Testing**: All existing workflows verified
- **Performance Tests**: Load testing for 100+ concurrent users
- **Accessibility**: WCAG 2.1 AA compliance (maintained)
- **Cross-browser Compatibility**: Same support as existing (maintained)

This specification provides a comprehensive roadmap for implementing the Factory Pulse enhancement plan while building upon the existing strong foundation of the current system.

---

## 🔒 BACKWARD COMPATIBILITY CHECKLIST

**Database & Schema:**
- ✅ No existing tables modified
- ✅ No existing columns altered or removed
- ✅ All new tables are additive
- ✅ Existing RLS policies preserved
- ✅ Legacy status enum values maintained
- ✅ Existing foreign key relationships preserved

**API & Interfaces:**
- ✅ All existing API endpoints remain functional
- ✅ Existing component interfaces preserved
- ✅ Legacy RFQ type aliases maintained
- ✅ Existing hook signatures unchanged
- ✅ Same authentication flow
- ✅ Same error handling patterns

**User Experience:**
- ✅ Existing workflows continue working
- ✅ Same UI/UX patterns maintained
- ✅ No learning curve for existing features
- ✅ Progressive enhancement approach
- ✅ Existing keyboard shortcuts preserved
- ✅ Same responsive behavior

**Performance & Security:**
- ✅ No performance regression on existing features
- ✅ Same security model maintained
- ✅ Existing caching strategy preserved
- ✅ Same loading states and error boundaries
- ✅ No breaking changes to build process
- ✅ Same deployment strategy

**Implementation Verification:**
1. **Pre-implementation**: Test existing functionality
2. **During implementation**: Continuous regression testing
3. **Post-implementation**: Full backward compatibility validation
4. **Monitoring**: Real-time performance and error tracking
5. **Rollback plan**: Immediate revert capability if issues arise

**COMMITMENT**: This enhancement will add powerful new features while ensuring that every existing workflow, API call, database query, and user interaction continues to work exactly as before.