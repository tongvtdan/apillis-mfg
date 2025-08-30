# Factory Pulse Implementation Plan

## Overview

This implementation plan provides step-by-step instructions for AI coding assistants (Lovable.dev, Cursor AI, Kiro, etc.) to build the Factory Pulse Manufacturing Execution System (MES). The plan is designed to be executed sequentially, with each phase building upon the previous one.

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Build System**: Vite 5.0+ with ES modules and development server on port 8080
- **State Management**: TanStack Query (React Query) + React Context
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Shadcn/ui + Lucide React icons
- **Charts**: Recharts
- **File Upload**: React Dropzone
- **Date Handling**: date-fns
- **Environment**: dotenv for configuration management
- **Deployment**: Vercel (Frontend) + Supabase (Backend)

## Project Structure

```
factory-pulse/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── forms/          # Form components
│   │   ├── charts/         # Chart components
│   │   └── layout/         # Layout components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configurations
│   │   ├── supabase.ts     # Supabase client
│   │   ├── auth.ts         # Authentication utilities
│   │   ├── validations.ts  # Zod schemas
│   │   └── utils.ts        # General utilities
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript type definitions
│   └── constants/          # Application constants
├── docs/                   # Documentation
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge functions
└── public/                # Static assets
```

## Implementation Phases

### Phase 1: Foundation & Authentication (Week 1)
### Phase 2: Core Database & API Layer (Week 2)
### Phase 3: Project Management & Kanban (Week 3)
### Phase 4: Document Management (Week 4)
### Phase 5: Review System (Week 5)
### Phase 6: Supplier Management (Week 6)
### Phase 7: Communication System (Week 7)
### Phase 8: Analytics & Reporting (Week 8)
### Phase 9: Admin Configuration (Week 9)
### Phase 10: AI Integration Preparation (Week 10)
### Phase 11: Cloud Storage Integration (Week 11)
### Phase 12: Testing & Optimization (Week 12)

---

## Detailed Implementation Instructions

*Note: This is the first part of the implementation plan. The detailed instructions for each phase will follow in subsequent sections.*## Phase 1:
 Foundation & Authentication (Week 1)

### 1.1 Project Setup and Configuration

**Task**: Initialize the React TypeScript project with all necessary dependencies

**Instructions for AI Assistant**:
```bash
# Initialize project with Vite + TypeScript
npm create vite@latest factory-pulse -- --template react-ts
cd factory-pulse

# Install core dependencies (minimal essential setup)
npm install @supabase/supabase-js dotenv

# Install development dependencies
npm install -D vite eslint

# Additional dependencies to install as needed:
# npm install @tanstack/react-query @tanstack/react-query-devtools
# npm install react-router-dom react-hook-form @hookform/resolvers
# npm install zod date-fns lucide-react
# npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
# npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
# npm install class-variance-authority clsx tailwind-merge
# npm install react-dropzone recharts
```

**Build System Configuration**:
- **Development Server**: `npm run dev` starts Vite dev server on port 8080
- **Build Commands**: `npm run build` for production, `npm run build:dev` for development builds
- **Environment**: Uses dotenv for environment variable management
- **ES Modules**: Project configured with `"type": "module"` for modern JavaScript

**Files to Create**:
1. `vite.config.ts` - Vite configuration with port 8080 and path aliases
2. `tailwind.config.js` - Tailwind configuration with custom colors
3. `src/lib/supabase.ts` - Supabase client configuration
4. `src/lib/utils.ts` - Utility functions (cn, formatters, etc.)
5. `src/types/index.ts` - Core TypeScript interfaces
6. `src/constants/index.ts` - Application constants
7. `.env.local` - Local environment configuration

**Package.json Scripts**:
```json
{
  "scripts": {
    "dev": "vite --port 8080",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint .",
    "migrate:users": "node scripts/migrate-users.js",
    "seed:organizations": "node scripts/seed-organizations.js"
  }
}
```

### 1.2 Supabase Setup

**Task**: Configure Supabase project and implement authentication

**Instructions for AI Assistant**:
1. Create Supabase project at supabase.com
2. Copy project URL and anon key to `.env.local`
3. Run database migrations from `docs/database-schema.md`
4. Configure RLS policies
5. Set up authentication providers (email, Google)

**Files to Create**:
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          // ... other fields from schema
        }
        Insert: {
          // ... insert types
        }
        Update: {
          // ... update types
        }
      }
      // ... other tables
    }
  }
}
```

### 1.3 Authentication System

**Task**: Implement complete authentication flow with role-based access

**Instructions for AI Assistant**:
Create authentication components and hooks following this structure:

**Files to Create**:
1. `src/hooks/useAuth.ts` - Authentication hook
2. `src/components/auth/LoginForm.tsx` - Login form component
3. `src/components/auth/SignupForm.tsx` - Signup form component
4. `src/components/auth/AuthGuard.tsx` - Route protection component
5. `src/stores/authStore.ts` - Authentication state management

**Key Requirements**:
- Support email/password and Google OAuth
- Role-based access control (customer, sales, procurement, engineering, qa, production, management, supplier, admin)
- Organization-based multi-tenancy
- Persistent session management
- Automatic redirect after login based on user role

### 1.4 Layout and Navigation

**Task**: Create responsive layout with role-based navigation

**Instructions for AI Assistant**:
Build the main application layout with:

**Files to Create**:
1. `src/components/layout/AppLayout.tsx` - Main application layout
2. `src/components/layout/Sidebar.tsx` - Collapsible sidebar navigation
3. `src/components/layout/Header.tsx` - Top header with user menu
4. `src/components/layout/Breadcrumbs.tsx` - Breadcrumb navigation
5. `src/components/ui/` - Shadcn/ui components (Button, Input, Card, etc.)

**Navigation Structure**:
```typescript
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['all'] },
  { name: 'Projects', href: '/projects', icon: FolderOpen, roles: ['all'] },
  { name: 'Documents', href: '/documents', icon: FileText, roles: ['all'] },
  { name: 'Suppliers', href: '/suppliers', icon: Building2, roles: ['procurement', 'admin'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['management', 'admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] },
]
```

---

## Phase 2: Core Database & API Layer (Week 2)

### 2.1 Database Schema Implementation

**Task**: Implement complete database schema in Supabase

**Instructions for AI Assistant**:
1. Execute all SQL from `docs/database-schema.md` in Supabase SQL editor
2. Verify all tables, indexes, and RLS policies are created
3. Insert default workflow stages and organization settings
4. Create sample data for development

**SQL Files to Execute**:
1. Core tables (organizations, users, contacts, projects, etc.)
2. Indexes for performance
3. RLS policies for security
4. Triggers for automation
5. Default data inserts

### 2.2 TypeScript Types and Interfaces

**Task**: Generate comprehensive TypeScript types from database schema

**Instructions for AI Assistant**:
Create type definitions that match the database schema exactly:

**Files to Create**:
```typescript
// src/types/database.ts
export interface Organization {
  id: string
  name: string
  slug: string
  domain?: string
  logo_url?: string
  settings: Record<string, any>
  subscription_plan: 'starter' | 'growth' | 'enterprise' | 'trial'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  organization_id: string
  email: string
  name: string
  role: 'customer' | 'sales' | 'procurement' | 'engineering' | 'qa' | 'production' | 'management' | 'supplier' | 'admin'
  department?: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  last_login_at?: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

// ... continue for all database tables
```

### 2.3 API Layer with React Query

**Task**: Create API layer using React Query for data fetching

**Instructions for AI Assistant**:
Implement API functions and React Query hooks for all database operations:

**Files to Create**:
1. `src/lib/api/organizations.ts` - Organization API functions
2. `src/lib/api/projects.ts` - Project API functions
3. `src/lib/api/documents.ts` - Document API functions
4. `src/lib/api/suppliers.ts` - Supplier API functions
5. `src/hooks/api/` - React Query hooks for each entity

**Example Structure**:
```typescript
// src/lib/api/projects.ts
import { supabase } from '../supabase'
import type { Project, ProjectInsert, ProjectUpdate } from '../../types'

export const projectsApi = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        customer:contacts(*),
        current_stage:workflow_stages(*),
        created_by:users(name),
        assigned_to:users(name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// src/hooks/api/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../../lib/api/projects'

export const useProjects = (organizationId: string) => {
  return useQuery({
    queryKey: ['projects', organizationId],
    queryFn: () => projectsApi.getAll(organizationId),
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
```

---

## Phase 3: Project Management & Kanban (Week 3)

### 3.1 Kanban Board Implementation

**Task**: Create drag-and-drop Kanban board for project workflow

**Instructions for AI Assistant**:
Build a fully functional Kanban board with the following features:

**Required Libraries**:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Files to Create**:
1. `src/components/kanban/KanbanBoard.tsx` - Main Kanban board component
2. `src/components/kanban/KanbanColumn.tsx` - Individual column component
3. `src/components/kanban/ProjectCard.tsx` - Draggable project card
4. `src/components/kanban/ProjectFilters.tsx` - Filter and search controls
5. `src/pages/ProjectsPage.tsx` - Main projects page

**Key Features to Implement**:
- Drag and drop between workflow stages
- Real-time updates using Supabase realtime
- Project filtering (priority, assignee, customer, date range)
- Search functionality
- Priority color coding (🔴 High, 🟡 Medium, 🟢 Low)
- Project count per column
- Responsive design for mobile/tablet

**Example Kanban Structure**:
```typescript
// src/components/kanban/KanbanBoard.tsx
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export const KanbanBoard = () => {
  const { data: projects } = useProjects(organizationId)
  const { data: stages } = useWorkflowStages(organizationId)
  const updateProjectStage = useUpdateProjectStage()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const projectId = active.id as string
      const newStageId = over.id as string
      
      updateProjectStage.mutate({
        projectId,
        stageId: newStageId
      })
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {stages?.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            projects={projects?.filter(p => p.current_stage_id === stage.id) || []}
          />
        ))}
      </div>
    </DndContext>
  )
}
```

### 3.2 Project Detail Page

**Task**: Create comprehensive project detail page with tabbed interface

**Instructions for AI Assistant**:
Build a detailed project view with multiple tabs and sections:

**Files to Create**:
1. `src/pages/ProjectDetailPage.tsx` - Main project detail page
2. `src/components/project/ProjectOverview.tsx` - Project overview tab
3. `src/components/project/ProjectDocuments.tsx` - Documents tab
4. `src/components/project/ProjectReviews.tsx` - Reviews tab
5. `src/components/project/ProjectSuppliers.tsx` - Supplier RFQ tab
6. `src/components/project/ProjectTimeline.tsx` - Timeline/activity tab
7. `src/components/project/ProjectSettings.tsx` - Settings tab

**Tab Structure**:
- **Overview**: Basic project info, customer details, timeline
- **Documents**: File management with version control
- **Reviews**: Engineering, QA, Production reviews
- **Suppliers**: RFQ management and quotes
- **Timeline**: Activity log and stage history
- **Settings**: Project configuration and assignments

### 3.3 Project Creation and Editing

**Task**: Implement project creation and editing forms

**Instructions for AI Assistant**:
Create comprehensive forms for project management:

**Files to Create**:
1. `src/components/forms/ProjectForm.tsx` - Main project form
2. `src/components/forms/CustomerSelect.tsx` - Customer selection component
3. `src/components/forms/PrioritySelect.tsx` - Priority selection
4. `src/components/forms/DatePicker.tsx` - Date picker component
5. `src/hooks/useProjectForm.ts` - Form logic hook

**Form Validation Schema**:
```typescript
// src/lib/validations.ts
import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  customer_id: z.string().uuid('Please select a customer'),
  priority_level: z.enum(['low', 'medium', 'high', 'urgent']),
  estimated_value: z.number().positive().optional(),
  estimated_delivery_date: z.date().optional(),
  tags: z.array(z.string()).default([]),
})

export type ProjectFormData = z.infer<typeof projectSchema>
```

---

## Phase 4: Document Management (Week 4)

### 4.1 File Upload System

**Task**: Implement comprehensive file upload with drag-and-drop

**Instructions for AI Assistant**:
Create a robust file upload system with the following features:

**Files to Create**:
1. `src/components/documents/FileUpload.tsx` - Main upload component
2. `src/components/documents/FilePreview.tsx` - File preview component
3. `src/components/documents/DocumentList.tsx` - Document listing
4. `src/components/documents/DocumentViewer.tsx` - Document viewer modal
5. `src/lib/fileUtils.ts` - File handling utilities

**Key Features**:
- Drag and drop file upload
- Multiple file selection
- File type validation (PDF, CAD, Office, images)
- File size limits (50MB max)
- Progress indicators
- Preview generation for images/PDFs
- Version control support
- Access level controls

**Example Upload Component**:
```typescript
// src/components/documents/FileUpload.tsx
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText } from 'lucide-react'

interface FileUploadProps {
  projectId: string
  onUploadComplete: (documents: Document[]) => void
}

export const FileUpload = ({ projectId, onUploadComplete }: FileUploadProps) => {
  const uploadDocuments = useUploadDocuments()

  const { getRootProps, getInputProps, acceptedFiles, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/step': ['.step', '.stp'],
      'application/iges': ['.iges', '.igs'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: async (files) => {
      const uploadPromises = files.map(file => 
        uploadDocuments.mutateAsync({
          file,
          projectId,
          documentType: getDocumentType(file.name),
        })
      )
      
      const results = await Promise.all(uploadPromises)
      onUploadComplete(results)
    }
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-900 mb-2">
        {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
      </p>
      <p className="text-sm text-gray-500">
        Supports PDF, CAD files (STEP, IGES), Excel, and images up to 50MB
      </p>
    </div>
  )
}
```

### 4.2 Document Version Control

**Task**: Implement document versioning system

**Instructions for AI Assistant**:
Create version control functionality:

**Files to Create**:
1. `src/components/documents/VersionHistory.tsx` - Version history component
2. `src/components/documents/VersionCompare.tsx` - Version comparison
3. `src/hooks/useDocumentVersions.ts` - Version management hook

**Features**:
- Automatic version numbering
- Version history display
- Ability to revert to previous versions
- Version comparison (metadata only)
- Latest version flagging

### 4.3 Document Comments and Annotations

**Task**: Add commenting and annotation system

**Instructions for AI Assistant**:
Implement collaborative document features:

**Files to Create**:
1. `src/components/documents/DocumentComments.tsx` - Comments section
2. `src/components/documents/CommentForm.tsx` - Add comment form
3. `src/components/documents/AnnotationViewer.tsx` - PDF annotation viewer

**Features**:
- Threaded comments
- @mentions for users
- PDF page-specific comments
- Comment resolution tracking
- Real-time comment updates

---

*[Continue with remaining phases...]*## Phase 5
: Review System (Week 5)

### 5.1 Internal Review Workflow

**Task**: Implement multi-department review system

**Instructions for AI Assistant**:
Create a comprehensive review system for Engineering, QA, and Production teams:

**Files to Create**:
1. `src/components/reviews/ReviewDashboard.tsx` - Review dashboard
2. `src/components/reviews/ReviewForm.tsx` - Review submission form
3. `src/components/reviews/ReviewCard.tsx` - Individual review display
4. `src/components/reviews/ReviewChecklist.tsx` - Checklist component
5. `src/components/reviews/RiskAssessment.tsx` - Risk logging component

**Key Features**:
- Role-based review assignments
- Checklist templates per review type
- Risk identification and logging
- Cost and lead time estimation
- Approval/rejection workflow
- Review status tracking
- Automated notifications

**Example Review Form**:
```typescript
// src/components/reviews/ReviewForm.tsx
interface ReviewFormProps {
  projectId: string
  reviewType: 'engineering' | 'qa' | 'production'
  onSubmit: (review: ReviewFormData) => void
}

export const ReviewForm = ({ projectId, reviewType, onSubmit }: ReviewFormProps) => {
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: 'pending',
      priority: 'medium',
      risks: [],
      checklist_items: getDefaultChecklist(reviewType)
    }
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="needs_info">Needs Information</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="estimated_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Cost ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <ReviewChecklist
        items={form.watch('checklist_items')}
        onChange={(items) => form.setValue('checklist_items', items)}
      />

      <RiskAssessment
        risks={form.watch('risks')}
        onChange={(risks) => form.setValue('risks', risks)}
      />

      <FormField
        control={form.control}
        name="comments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comments</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add your review comments..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <Button type="submit" className="w-full">
        Submit Review
      </Button>
    </form>
  )
}
```

### 5.2 Review Templates and Checklists

**Task**: Create configurable review templates

**Instructions for AI Assistant**:
Implement template system for different review types:

**Files to Create**:
1. `src/components/admin/ReviewTemplates.tsx` - Template management
2. `src/lib/reviewTemplates.ts` - Default templates
3. `src/hooks/useReviewTemplates.ts` - Template management hook

**Default Templates**:
```typescript
// src/lib/reviewTemplates.ts
export const defaultReviewTemplates = {
  engineering: {
    name: 'Engineering Review',
    checklist: [
      'Design feasibility assessed',
      'Material specifications reviewed',
      'Manufacturing processes identified',
      'Tolerances and dimensions verified',
      'Potential design risks identified',
      'Tooling requirements determined'
    ],
    riskCategories: ['design', 'material', 'manufacturing', 'tooling']
  },
  qa: {
    name: 'Quality Assurance Review',
    checklist: [
      'Quality requirements defined',
      'Inspection methods specified',
      'Testing procedures outlined',
      'Compliance requirements verified',
      'Quality control points identified',
      'Documentation requirements set'
    ],
    riskCategories: ['quality', 'compliance', 'testing', 'documentation']
  },
  production: {
    name: 'Production Review',
    checklist: [
      'Manufacturing capability confirmed',
      'Capacity requirements assessed',
      'Lead time estimated',
      'Equipment availability verified',
      'Skill requirements identified',
      'Production risks evaluated'
    ],
    riskCategories: ['capacity', 'equipment', 'skills', 'timeline']
  }
}
```

### 5.3 Review Analytics and Reporting

**Task**: Add review performance tracking

**Instructions for AI Assistant**:
Create analytics for review process optimization:

**Files to Create**:
1. `src/components/analytics/ReviewAnalytics.tsx` - Review metrics dashboard
2. `src/hooks/useReviewMetrics.ts` - Review metrics hook

**Metrics to Track**:
- Average review time by department
- Review approval rates
- Most common risk factors
- Review bottlenecks
- Reviewer workload distribution

---

## Phase 6: Supplier Management (Week 6)

### 6.1 Supplier RFQ System

**Task**: Implement comprehensive supplier RFQ management

**Instructions for AI Assistant**:
Create supplier RFQ workflow with the following components:

**Files to Create**:
1. `src/components/suppliers/SupplierRFQDashboard.tsx` - RFQ management dashboard
2. `src/components/suppliers/CreateRFQ.tsx` - RFQ creation form
3. `src/components/suppliers/RFQList.tsx` - RFQ listing component
4. `src/components/suppliers/SupplierPortal.tsx` - External supplier interface
5. `src/components/suppliers/QuoteComparison.tsx` - Quote comparison tool

**Key Features**:
- Bulk RFQ creation to multiple suppliers
- RFQ template system
- Supplier response tracking
- Quote comparison matrix
- Automated reminders for overdue quotes
- Supplier performance scoring

**Example RFQ Creation**:
```typescript
// src/components/suppliers/CreateRFQ.tsx
export const CreateRFQ = ({ projectId }: { projectId: string }) => {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const { data: suppliers } = useSuppliers()
  const createRFQ = useCreateSupplierRFQ()

  const form = useForm<RFQFormData>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      due_date: addDays(new Date(), 7),
      priority: 'medium'
    }
  })

  const handleSubmit = async (data: RFQFormData) => {
    const rfqPromises = selectedSuppliers.map(supplierId =>
      createRFQ.mutateAsync({
        ...data,
        project_id: projectId,
        supplier_id: supplierId,
        rfq_number: generateRFQNumber()
      })
    )

    await Promise.all(rfqPromises)
    // Send email notifications to suppliers
    await sendRFQNotifications(selectedSuppliers, data)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Response Due Date</FormLabel>
              <FormControl>
                <DatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  minDate={new Date()}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <SupplierSelection
        suppliers={suppliers || []}
        selected={selectedSuppliers}
        onChange={setSelectedSuppliers}
      />

      <FormField
        control={form.control}
        name="requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Requirements</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Specify your requirements..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <Button type="submit" disabled={selectedSuppliers.length === 0}>
        Send RFQ to {selectedSuppliers.length} Supplier(s)
      </Button>
    </form>
  )
}
```

### 6.2 Supplier Qualification System

**Task**: Implement supplier scoring and qualification

**Instructions for AI Assistant**:
Create comprehensive supplier qualification system:

**Files to Create**:
1. `src/components/suppliers/SupplierQualification.tsx` - Qualification form
2. `src/components/suppliers/SupplierScorecard.tsx` - Performance scorecard
3. `src/components/suppliers/QualificationDashboard.tsx` - Qualification overview
4. `src/hooks/useSupplierQualification.ts` - Qualification management

**Scoring Categories**:
- Quality Score (0-100)
- Delivery Score (0-100)
- Cost Competitiveness (0-100)
- Communication (0-100)
- Technical Capability (0-100)
- Financial Stability (0-100)
- Compliance (0-100)

### 6.3 Supplier Portal

**Task**: Create external supplier portal

**Instructions for AI Assistant**:
Build supplier-facing interface for RFQ responses:

**Files to Create**:
1. `src/pages/SupplierPortal.tsx` - Main supplier portal
2. `src/components/suppliers/SupplierLogin.tsx` - Supplier authentication
3. `src/components/suppliers/RFQResponse.tsx` - RFQ response form
4. `src/components/suppliers/SupplierDashboard.tsx` - Supplier dashboard

**Portal Features**:
- Secure supplier login
- RFQ viewing and response
- Quote submission with file attachments
- Communication with procurement team
- Order history and status tracking

---

## Phase 7: Communication System (Week 7)

### 7.1 Real-time Messaging

**Task**: Implement real-time messaging system

**Instructions for AI Assistant**:
Create comprehensive communication system using Supabase Realtime:

**Files to Create**:
1. `src/components/messaging/MessageCenter.tsx` - Main messaging interface
2. `src/components/messaging/MessageThread.tsx` - Message thread component
3. `src/components/messaging/MessageComposer.tsx` - Message composition
4. `src/components/messaging/NotificationCenter.tsx` - Notification management
5. `src/hooks/useRealtime.ts` - Realtime messaging hook

**Key Features**:
- Real-time message delivery
- Thread-based conversations
- File attachments in messages
- @mentions with notifications
- Message status (sent, delivered, read)
- Typing indicators
- Message search and filtering

**Example Realtime Hook**:
```typescript
// src/hooks/useRealtime.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Message } from '../types'

export const useRealtime = (projectId: string) => {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id ? payload.new as Message : msg
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  return { messages }
}
```

### 7.2 Notification System

**Task**: Implement multi-channel notification system

**Instructions for AI Assistant**:
Create comprehensive notification system:

**Files to Create**:
1. `src/components/notifications/NotificationBell.tsx` - Notification bell icon
2. `src/components/notifications/NotificationList.tsx` - Notification listing
3. `src/components/notifications/NotificationSettings.tsx` - User preferences
4. `src/lib/notifications.ts` - Notification utilities
5. `src/hooks/useNotifications.ts` - Notification management

**Notification Types**:
- Project stage changes
- New messages and mentions
- Review assignments
- RFQ responses
- Document uploads
- Deadline reminders
- System announcements

### 7.3 Email Integration

**Task**: Set up automated email notifications

**Instructions for AI Assistant**:
Implement email notification system using Supabase Edge Functions:

**Files to Create**:
1. `supabase/functions/send-email/index.ts` - Email sending function
2. `supabase/functions/email-templates/` - Email templates
3. `src/lib/emailService.ts` - Email service integration

**Email Templates**:
- RFQ notifications to suppliers
- Review assignment notifications
- Project status updates
- Welcome emails for new users
- Password reset emails

---

## Phase 8: Analytics & Reporting (Week 8)

### 8.1 Analytics Dashboard

**Task**: Create comprehensive analytics dashboard

**Instructions for AI Assistant**:
Build analytics dashboard with key performance indicators:

**Files to Create**:
1. `src/pages/AnalyticsPage.tsx` - Main analytics page
2. `src/components/analytics/KPICards.tsx` - KPI summary cards
3. `src/components/analytics/ProjectMetrics.tsx` - Project performance charts
4. `src/components/analytics/SupplierMetrics.tsx` - Supplier performance
5. `src/components/analytics/WorkflowAnalytics.tsx` - Workflow bottleneck analysis

**Key Metrics**:
- Average RFQ cycle time
- Win/loss ratio
- Supplier response rates
- On-time delivery rates
- Review completion times
- Project value trends
- Bottleneck identification

**Example KPI Component**:
```typescript
// src/components/analytics/KPICards.tsx
export const KPICards = () => {
  const { data: metrics } = useAnalyticsMetrics()

  const kpis = [
    {
      title: 'Avg. RFQ Cycle Time',
      value: `${metrics?.avgCycleTime || 0} days`,
      change: metrics?.cycleTimeChange || 0,
      trend: metrics?.cycleTimeChange > 0 ? 'down' : 'up'
    },
    {
      title: 'Win Rate',
      value: `${metrics?.winRate || 0}%`,
      change: metrics?.winRateChange || 0,
      trend: metrics?.winRateChange > 0 ? 'up' : 'down'
    },
    {
      title: 'Supplier Response Rate',
      value: `${metrics?.supplierResponseRate || 0}%`,
      change: metrics?.responseRateChange || 0,
      trend: metrics?.responseRateChange > 0 ? 'up' : 'down'
    },
    {
      title: 'On-Time Quote Delivery',
      value: `${metrics?.onTimeDelivery || 0}%`,
      change: metrics?.deliveryChange || 0,
      trend: metrics?.deliveryChange > 0 ? 'up' : 'down'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            {kpi.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className={`text-xs ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change > 0 ? '+' : ''}{kpi.change}% from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### 8.2 Custom Reports

**Task**: Implement custom report generation

**Instructions for AI Assistant**:
Create flexible reporting system:

**Files to Create**:
1. `src/components/reports/ReportBuilder.tsx` - Report configuration
2. `src/components/reports/ReportViewer.tsx` - Report display
3. `src/components/reports/ExportOptions.tsx` - Export functionality
4. `src/lib/reportGenerator.ts` - Report generation logic

**Report Types**:
- Project performance reports
- Supplier performance reports
- Financial summary reports
- Workflow efficiency reports
- Custom date range reports

### 8.3 Data Visualization

**Task**: Add interactive charts and graphs

**Instructions for AI Assistant**:
Implement data visualization using Recharts:

**Chart Types**:
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Scatter plots for correlations
- Gantt charts for timelines

---

## Phase 9: Admin Configuration (Week 9)

### 9.1 Workflow Configuration

**Task**: Implement admin workflow configuration interface

**Instructions for AI Assistant**:
Create the workflow configuration system as shown in the visual preview:

**Files to Create**:
1. `src/pages/admin/WorkflowConfig.tsx` - Main workflow configuration page
2. `src/components/admin/StageManager.tsx` - Stage management component
3. `src/components/admin/TransitionRules.tsx` - Transition rule configuration
4. `src/components/admin/BusinessRules.tsx` - Business rule configuration
5. `src/components/admin/RuleBuilder.tsx` - Visual rule builder

**Key Features**:
- Drag-and-drop stage reordering
- Color picker for stages
- Transition rule configuration
- Business rule automation
- Rule testing and validation

### 9.2 User Management

**Task**: Create comprehensive user management system

**Instructions for AI Assistant**:
Build user administration interface:

**Files to Create**:
1. `src/pages/admin/UserManagement.tsx` - User management page
2. `src/components/admin/UserList.tsx` - User listing component
3. `src/components/admin/UserForm.tsx` - User creation/editing form
4. `src/components/admin/RolePermissions.tsx` - Role-based permissions
5. `src/components/admin/InviteUser.tsx` - User invitation system

### 9.3 Organization Settings

**Task**: Implement organization-wide settings

**Instructions for AI Assistant**:
Create organization configuration interface:

**Files to Create**:
1. `src/pages/admin/OrganizationSettings.tsx` - Organization settings
2. `src/components/admin/GeneralSettings.tsx` - General configuration
3. `src/components/admin/IntegrationSettings.tsx` - Third-party integrations
4. `src/components/admin/SecuritySettings.tsx` - Security configuration

---

## Phase 10: AI Integration Preparation (Week 10)

### 10.1 AI Processing Queue

**Task**: Implement AI processing infrastructure

**Instructions for AI Assistant**:
Create the foundation for AI processing:

**Files to Create**:
1. `src/lib/aiProcessor.ts` - AI processing utilities
2. `src/components/ai/ProcessingQueue.tsx` - Queue monitoring
3. `src/hooks/useAIProcessing.ts` - AI processing hooks
4. `src/types/ai.ts` - AI-related type definitions

**AI Processing Types**:
- Document data extraction
- Supplier categorization
- BOM generation from drawings
- Risk assessment
- Compliance checking

### 10.2 AI Configuration Interface

**Task**: Create AI model configuration interface

**Instructions for AI Assistant**:
Build AI model management system:

**Files to Create**:
1. `src/pages/admin/AIConfiguration.tsx` - AI configuration page
2. `src/components/ai/ModelConfig.tsx` - Model configuration
3. `src/components/ai/ProcessingStatus.tsx` - Processing status monitor

### 10.3 AI Results Integration

**Task**: Integrate AI results into existing workflows

**Instructions for AI Assistant**:
Add AI-generated data display throughout the application:

**Features**:
- AI confidence indicators
- Manual override capabilities
- AI suggestion acceptance/rejection
- Learning feedback loops

---

## Phase 11: Cloud Storage Integration (Week 11)

### 11.1 Google Drive Integration

**Task**: Implement Google Drive integration

**Instructions for AI Assistant**:
Create Google Drive file synchronization:

**Required Libraries**:
```bash
npm install googleapis google-auth-library
```

**Files to Create**:
1. `src/lib/googleDrive.ts` - Google Drive API integration
2. `src/components/storage/CloudStorageSetup.tsx` - Setup interface
3. `src/components/storage/SyncStatus.tsx` - Sync status monitoring
4. `src/hooks/useCloudStorage.ts` - Cloud storage management

### 11.2 Multi-Provider Support

**Task**: Add support for multiple cloud storage providers

**Instructions for AI Assistant**:
Extend cloud storage to support multiple providers:

**Providers to Support**:
- Google Drive
- Dropbox
- Microsoft OneDrive
- Amazon S3
- Azure Blob Storage

### 11.3 Sync Management

**Task**: Implement file synchronization management

**Instructions for AI Assistant**:
Create sync management interface:

**Features**:
- Automatic sync scheduling
- Conflict resolution
- Sync history and logs
- Bandwidth management
- Error handling and retry logic

---

## Phase 12: Testing & Optimization (Week 12)

### 12.1 Unit Testing

**Task**: Implement comprehensive unit testing

**Instructions for AI Assistant**:
Add unit tests for all components and utilities:

**Required Libraries**:
```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D jest-environment-jsdom
```

**Test Files to Create**:
1. `src/components/__tests__/` - Component tests
2. `src/lib/__tests__/` - Utility function tests
3. `src/hooks/__tests__/` - Custom hook tests

### 12.2 Integration Testing

**Task**: Add integration tests for key workflows

**Instructions for AI Assistant**:
Create integration tests for critical user journeys:

**Test Scenarios**:
- Complete RFQ-to-quote workflow
- Document upload and review process
- Supplier RFQ and response flow
- User authentication and authorization

### 12.3 Performance Optimization

**Task**: Optimize application performance

**Instructions for AI Assistant**:
Implement performance optimizations:

**Optimization Areas**:
- Code splitting and lazy loading
- Image optimization
- Database query optimization
- Caching strategies
- Bundle size reduction

### 12.4 Security Audit

**Task**: Conduct security review and hardening

**Instructions for AI Assistant**:
Review and enhance security measures:

**Security Checklist**:
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Authentication security
- Authorization checks
- Data encryption
- Secure file uploads

---

## Deployment Instructions

### Production Deployment

**Task**: Deploy to production environment

**Instructions for AI Assistant**:

1. **Environment Setup**:
   ```bash
   # Set up environment variables
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

2. **Build and Deploy**:
   ```bash
   # Build for production
   npm run build
   
   # Deploy to Vercel
   npx vercel --prod
   ```

3. **Database Migration**:
   - Run all SQL migrations in Supabase
   - Set up RLS policies
   - Configure authentication providers
   - Set up email templates

4. **Post-Deployment Checklist**:
   - Test all authentication flows
   - Verify file upload functionality
   - Test real-time features
   - Validate email notifications
   - Check mobile responsiveness
   - Perform security scan

---

## Success Criteria

Each phase should meet these criteria before proceeding:

### Functional Requirements
- ✅ All features work as specified
- ✅ No critical bugs or errors
- ✅ Responsive design on all devices
- ✅ Proper error handling and user feedback
- ✅ Data validation and security measures

### Performance Requirements
- ✅ Page load times < 3 seconds
- ✅ Real-time updates < 1 second latency
- ✅ File uploads handle 50MB files
- ✅ Database queries optimized with proper indexes
- ✅ Lighthouse score > 90

### Security Requirements
- ✅ All routes properly protected
- ✅ RLS policies prevent unauthorized access
- ✅ Input validation on all forms
- ✅ File upload security measures
- ✅ Audit trail for all actions

### User Experience Requirements
- ✅ Intuitive navigation and workflows
- ✅ Consistent design system
- ✅ Helpful error messages and loading states
- ✅ Keyboard accessibility
- ✅ Mobile-friendly interface

---

## Maintenance and Updates

### Regular Maintenance Tasks
- Monitor application performance
- Update dependencies regularly
- Review and optimize database queries
- Backup data regularly
- Monitor security vulnerabilities
- Update documentation

### Feature Enhancement Process
1. Gather user feedback
2. Prioritize feature requests
3. Design and prototype new features
4. Implement with proper testing
5. Deploy with feature flags
6. Monitor adoption and performance

This implementation plan provides a comprehensive roadmap for building the Factory Pulse platform. Each phase builds upon the previous one, ensuring a solid foundation while maintaining flexibility for future enhancements and AI integration.