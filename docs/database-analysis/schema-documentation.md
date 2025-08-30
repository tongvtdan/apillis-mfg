# Database Schema Analysis Report

Generated on: 2025-08-30T00:48:06.478Z

## Overview

This report contains a comprehensive analysis of the Factory Pulse database schema,
focusing on the projects table and its relationships.

## Table: projects

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| organization_id | UUID | ✅ | None | None |
| project_id | VARCHAR(50) | ❌ | None | UNIQUE, NOT NULL |
| title | VARCHAR(255) | ❌ | None | NOT NULL |
| description | TEXT | ✅ | None | None |
| customer_id | UUID | ✅ | None | None |
| current_stage_id | UUID | ✅ | None | None |
| status | VARCHAR(20) | ✅ | 'active' | None |
| CHECK | (status | ✅ | None | None |
| priority_level | VARCHAR(20) | ✅ | 'medium' | None |
| CHECK | (priority_level | ✅ | None | None |
| source | VARCHAR(50) | ✅ | 'portal' | None |
| assigned_to | UUID | ✅ | None | None |
| created_by | UUID | ✅ | None | None |
| estimated_value | DECIMAL(15 | ✅ | None | None |
| tags | TEXT[] | ✅ | None | None |
| metadata | JSONB | ✅ | '{}' | None |
| stage_entered_at | TIMESTAMPTZ | ✅ | None | None |
| project_type | VARCHAR(100) | ✅ | None | None |
| notes | TEXT | ✅ | None | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |
| updated_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Actual Data Analysis

| Column Name | Actual Type | Sample Value | In Migration |
|-------------|-------------|--------------|-------------|
| id | string | "e5838a4e-9c03-4dd9-a239-3a24d9ad68d0" | ✅ |
| organization_id | string | "98421fe1-66bb-4ab1-b595-22f9f20daaf2" | ✅ |
| project_id | string | "P-25012701" | ✅ |
| title | string | "Automotive Bracket Assembly" | ✅ |
| description | string | "High-precision automotive bracket assembly for Toyota Vietnam, including welding, machining, and quality inspection" | ✅ |
| customer_id | string | "a93935b4-856a-4bca-8a55-01aa92e3db31" | ✅ |
| current_stage_id | string | "1c4e19c4-0e99-4a8b-9c29-20770c8cce78" | ✅ |
| status | string | "active" | ✅ |
| priority_level | string | "high" | ✅ |
| source | string | "portal" | ✅ |
| assigned_to | string | "a1f24ed5-319e-4b66-8d21-fbc70d07ea09" | ✅ |
| created_by | string | "a1f24ed5-319e-4b66-8d21-fbc70d07ea09" | ✅ |
| estimated_value | number | 45000000 | ✅ |
| tags | object | ["automotive","bracket","welding","machining"] | ✅ |
| metadata | object | {"material":"steel","quantity":1000,"tolerance":"±0.1mm","project_type":"fabrication","surface_finish":"painted"} | ✅ |
| stage_entered_at | object | null | ✅ |
| project_type | string | "fabrication" | ✅ |
| notes | object | null | ✅ |
| created_at | string | "2025-08-29T15:28:36.767115+00:00" | ✅ |
| updated_at | string | "2025-08-29T15:28:36.767115+00:00" | ✅ |

### Foreign Key Relationships

- `organization_id` → `organizations.id`
- `customer_id` → `contacts.id`
- `current_stage_id` → `workflow_stages.id`
- `assigned_to` → `users.id`
- `created_by` → `users.id`

### Check Constraints

- **CHECK**: status IN ('active', 'on_hold', 'delayed', 'cancelled', 'completed'
- **CHECK**: priority_level IN ('low', 'medium', 'high', 'urgent'

### Indexes

- **idx_projects_organization_id**: organization_id
- **idx_projects_project_id**: project_id
- **idx_projects_customer_id**: customer_id
- **idx_projects_current_stage_id**: current_stage_id
- **idx_projects_status**: status
- **idx_projects_assigned_to**: assigned_to
- **idx_projects_created_by**: created_by
- **idx_projects_priority_level**: priority_level

### Data Patterns Analysis

**id:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["e5838a4e-9c03-4dd9-a239-3a24d9ad68d0","c76c0cc2-58c6-49eb-8250-8eac38a574f7","c0e1cade-7ce4-4582-8bb8-a7029becab07"]
- Constraints: PRIMARY KEY

**organization_id:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["98421fe1-66bb-4ab1-b595-22f9f20daaf2","98421fe1-66bb-4ab1-b595-22f9f20daaf2","98421fe1-66bb-4ab1-b595-22f9f20daaf2"]

**project_id:**
- Migration Type: VARCHAR(50)
- Actual Type: string
- Nullable: NO
- Has Data: Yes
- Sample Values: ["P-25012701","P-25012702","P-25012703"]
- Constraints: UNIQUE, NOT NULL

**title:**
- Migration Type: VARCHAR(255)
- Actual Type: string
- Nullable: NO
- Has Data: Yes
- Sample Values: ["Automotive Bracket Assembly","Motorcycle Frame Welding","Aircraft Landing Gear Bracket"]
- Constraints: NOT NULL

**description:**
- Migration Type: TEXT
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["High-precision automotive bracket assembly for Toyota Vietnam, including welding, machining, and quality inspection","Motorcycle frame welding project for Honda Vietnam, including jig design and quality assurance","High-precision aircraft landing gear bracket for Boeing Vietnam, aerospace-grade materials and certification"]

**customer_id:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["a93935b4-856a-4bca-8a55-01aa92e3db31","a93935b4-856a-4bca-8a55-01aa92e3db31","a93935b4-856a-4bca-8a55-01aa92e3db31"]

**current_stage_id:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["1c4e19c4-0e99-4a8b-9c29-20770c8cce78","1c4e19c4-0e99-4a8b-9c29-20770c8cce78","1c4e19c4-0e99-4a8b-9c29-20770c8cce78"]

**status:**
- Migration Type: VARCHAR(20)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["active","active","active"]

**priority_level:**
- Migration Type: VARCHAR(20)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["high","medium","urgent"]

**source:**
- Migration Type: VARCHAR(50)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["portal","portal","portal"]

**assigned_to:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["a1f24ed5-319e-4b66-8d21-fbc70d07ea09","a1f24ed5-319e-4b66-8d21-fbc70d07ea09","a1f24ed5-319e-4b66-8d21-fbc70d07ea09"]

**created_by:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["a1f24ed5-319e-4b66-8d21-fbc70d07ea09","a1f24ed5-319e-4b66-8d21-fbc70d07ea09","a1f24ed5-319e-4b66-8d21-fbc70d07ea09"]

**estimated_value:**
- Migration Type: DECIMAL(15
- Actual Type: number
- Nullable: YES
- Has Data: Yes
- Sample Values: [45000000,28000000,120000000]

**tags:**
- Migration Type: TEXT[]
- Actual Type: object
- Nullable: YES
- Has Data: Yes
- Sample Values: [["automotive","bracket","welding","machining"],["motorcycle","frame","welding","jig"],["aerospace","landing_gear","bracket","certified"]]

**metadata:**
- Migration Type: JSONB
- Actual Type: object
- Nullable: YES
- Has Data: Yes
- Sample Values: [{"material":"steel","quantity":1000,"tolerance":"±0.1mm","project_type":"fabrication","surface_finish":"painted"},{"material":"aluminum","quantity":500,"tolerance":"±0.5mm","project_type":"fabrication","surface_finish":"anodized"},{"material":"titanium","quantity":100,"tolerance":"±0.05mm","project_type":"fabrication","certification":"AS9100","surface_finish":"polished"}]

**stage_entered_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**project_type:**
- Migration Type: VARCHAR(100)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["fabrication","fabrication","fabrication"]

**notes:**
- Migration Type: TEXT
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**created_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["2025-08-29T15:28:36.767115+00:00","2025-08-29T15:28:36.767115+00:00","2025-08-29T15:28:36.767115+00:00"]

**updated_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["2025-08-29T15:28:36.767115+00:00","2025-08-29T15:28:36.767115+00:00","2025-08-29T15:28:36.767115+00:00"]


---

## Table: organizations

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| name | VARCHAR(255) | ❌ | None | NOT NULL |
| slug | VARCHAR(100) | ❌ | None | UNIQUE, NOT NULL |
| domain | VARCHAR(255) | ✅ | None | None |
| logo_url | TEXT | ✅ | None | None |
| description | TEXT | ✅ | None | None |
| industry | VARCHAR(100) | ✅ | None | None |
| settings | JSONB | ✅ | '{}' | None |
| subscription_plan | VARCHAR(50) | ✅ | 'starter' | None |
| CHECK | (subscription_plan | ✅ | None | None |
| is_active | BOOLEAN | ✅ | true | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |
| updated_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Actual Data Analysis

| Column Name | Actual Type | Sample Value | In Migration |
|-------------|-------------|--------------|-------------|
| id | string | "98421fe1-66bb-4ab1-b595-22f9f20daaf2" | ✅ |
| name | string | "Factory Pulse Vietnam" | ✅ |
| slug | string | "factory-pulse-vietnam" | ✅ |
| domain | string | "factorypulse.vn" | ✅ |
| logo_url | object | null | ✅ |
| description | string | "Leading manufacturing solutions provider in Vietnam" | ✅ |
| industry | string | "manufacturing" | ✅ |
| settings | object | {} | ✅ |
| subscription_plan | string | "starter" | ✅ |
| is_active | boolean | true | ✅ |
| created_at | string | "2025-08-29T15:28:12.20538+00:00" | ✅ |
| updated_at | string | "2025-08-29T15:28:12.20538+00:00" | ✅ |

### Check Constraints

- **CHECK**: subscription_plan IN ('starter', 'growth', 'enterprise', 'trial', 'suspended', 'cancelled'

### Indexes

- **idx_organizations_slug**: slug
- **idx_organizations_industry**: industry
- **idx_organizations_is_active**: is_active

### Data Patterns Analysis

**id:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["98421fe1-66bb-4ab1-b595-22f9f20daaf2","1784ca77-1c6b-489c-9642-7c2b7485695d","c8ce21d4-2790-4852-ae41-1487b524671e"]
- Constraints: PRIMARY KEY

**name:**
- Migration Type: VARCHAR(255)
- Actual Type: string
- Nullable: NO
- Has Data: Yes
- Sample Values: ["Factory Pulse Vietnam","Toyota Vietnam","Honda Vietnam"]
- Constraints: NOT NULL

**slug:**
- Migration Type: VARCHAR(100)
- Actual Type: string
- Nullable: NO
- Has Data: Yes
- Sample Values: ["factory-pulse-vietnam","toyota-vietnam","honda-vietnam"]
- Constraints: UNIQUE, NOT NULL

**domain:**
- Migration Type: VARCHAR(255)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["factorypulse.vn","toyota.com.vn","honda.com.vn"]

**logo_url:**
- Migration Type: TEXT
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**description:**
- Migration Type: TEXT
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["Leading manufacturing solutions provider in Vietnam","Major automotive manufacturer in Vietnam","Motorcycle and automotive parts manufacturer"]

**industry:**
- Migration Type: VARCHAR(100)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["manufacturing","automotive","automotive"]

**settings:**
- Migration Type: JSONB
- Actual Type: object
- Nullable: YES
- Has Data: Yes
- Sample Values: [{},{},{}]

**subscription_plan:**
- Migration Type: VARCHAR(50)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["starter","starter","starter"]

**is_active:**
- Migration Type: BOOLEAN
- Actual Type: boolean
- Nullable: YES
- Has Data: Yes
- Sample Values: [true,true,true]

**created_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00"]

**updated_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00"]


---

## Table: users

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| organization_id | UUID | ✅ | None | None |
| email | VARCHAR(255) | ❌ | None | UNIQUE, NOT NULL |
| name | VARCHAR(255) | ❌ | None | NOT NULL |
| role | VARCHAR(50) | ❌ | None | NOT NULL |
| CHECK | (role | ✅ | None | None |
| department | VARCHAR(100) | ✅ | None | None |
| phone | VARCHAR(50) | ✅ | None | None |
| avatar_url | TEXT | ✅ | None | None |
| status | VARCHAR(20) | ✅ | 'active' | None |
| CHECK | (status | ✅ | None | None |
| description | TEXT | ✅ | None | None |
| employee_id | VARCHAR(50) | ✅ | None | None |
| direct_manager_id | UUID | ✅ | None | None |
| direct_reports | UUID[] | ✅ | '{}' | None |
| last_login_at | TIMESTAMPTZ | ✅ | None | None |
| preferences | JSONB | ✅ | '{}' | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |
| updated_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Actual Data Analysis

| Column Name | Actual Type | Sample Value | In Migration |
|-------------|-------------|--------------|-------------|
| id | string | "083f04db-458a-416b-88e9-94acf10382f8" | ✅ |
| organization_id | string | "98421fe1-66bb-4ab1-b595-22f9f20daaf2" | ✅ |
| email | string | "admin@factorypulse.vn" | ✅ |
| name | string | "Nguyễn Văn Admin" | ✅ |
| role | string | "admin" | ✅ |
| department | string | "Management" | ✅ |
| phone | string | "+84-28-7300-1000" | ✅ |
| avatar_url | object | null | ✅ |
| status | string | "active" | ✅ |
| description | string | "System Administrator" | ✅ |
| employee_id | string | "EMP001" | ✅ |
| direct_manager_id | object | null | ✅ |
| direct_reports | object | [] | ✅ |
| last_login_at | object | null | ✅ |
| preferences | object | {} | ✅ |
| created_at | string | "2025-08-29T15:28:12.20538+00:00" | ✅ |
| updated_at | string | "2025-08-29T15:28:12.20538+00:00" | ✅ |

### Foreign Key Relationships

- `organization_id` → `organizations.id`
- `direct_manager_id` → `users.id`

### Check Constraints

- **CHECK**: role IN ('sales', 'procurement', 'engineering', 'qa', 'production', 'management', 'admin'
- **CHECK**: status IN ('active', 'dismiss'

### Indexes

- **idx_users_organization_id**: organization_id
- **idx_users_email**: email
- **idx_users_role**: role
- **idx_users_status**: status
- **idx_users_department**: department

### Data Patterns Analysis

**id:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["083f04db-458a-416b-88e9-94acf10382f8","99845907-7255-4155-9dd0-c848ab9860cf","a1f24ed5-319e-4b66-8d21-fbc70d07ea09"]
- Constraints: PRIMARY KEY

**organization_id:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["98421fe1-66bb-4ab1-b595-22f9f20daaf2","98421fe1-66bb-4ab1-b595-22f9f20daaf2","98421fe1-66bb-4ab1-b595-22f9f20daaf2"]

**email:**
- Migration Type: VARCHAR(255)
- Actual Type: string
- Nullable: NO
- Has Data: Yes
- Sample Values: ["admin@factorypulse.vn","ceo@factorypulse.vn","sales@factorypulse.vn"]
- Constraints: UNIQUE, NOT NULL

**name:**
- Migration Type: VARCHAR(255)
- Actual Type: string
- Nullable: NO
- Has Data: Yes
- Sample Values: ["Nguyễn Văn Admin","Trần Thị CEO","Lê Văn Sales"]
- Constraints: NOT NULL

**role:**
- Migration Type: VARCHAR(50)
- Actual Type: string
- Nullable: NO
- Has Data: Yes
- Sample Values: ["admin","management","sales"]
- Constraints: NOT NULL

**department:**
- Migration Type: VARCHAR(100)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["Management","Management","Sales"]

**phone:**
- Migration Type: VARCHAR(50)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["+84-28-7300-1000","+84-28-7300-1001","+84-28-7300-1002"]

**avatar_url:**
- Migration Type: TEXT
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**status:**
- Migration Type: VARCHAR(20)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["active","active","active"]

**description:**
- Migration Type: TEXT
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["System Administrator","Chief Executive Officer","Sales Manager"]

**employee_id:**
- Migration Type: VARCHAR(50)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["EMP001","EMP002","EMP003"]

**direct_manager_id:**
- Migration Type: UUID
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**direct_reports:**
- Migration Type: UUID[]
- Actual Type: object
- Nullable: YES
- Has Data: Yes
- Sample Values: [[],[],[]]

**last_login_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**preferences:**
- Migration Type: JSONB
- Actual Type: object
- Nullable: YES
- Has Data: Yes
- Sample Values: [{},{},{}]

**created_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00"]

**updated_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00"]


---

## Table: contacts

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| organization_id | UUID | ✅ | None | None |
| type | VARCHAR(20) | ❌ | None | NOT NULL |
| company_name | VARCHAR(255) | ❌ | None | NOT NULL |
| contact_name | VARCHAR(255) | ✅ | None | None |
| email | VARCHAR(255) | ✅ | None | None |
| phone | VARCHAR(50) | ✅ | None | None |
| address | TEXT | ✅ | None | None |
| city | VARCHAR(100) | ✅ | None | None |
| state | VARCHAR(100) | ✅ | None | None |
| country | VARCHAR(100) | ✅ | 'Vietnam' | None |
| postal_code | VARCHAR(20) | ✅ | None | None |
| website | VARCHAR(255) | ✅ | None | None |
| tax_id | VARCHAR(100) | ✅ | None | None |
| payment_terms | VARCHAR(100) | ✅ | None | None |
| credit_limit | DECIMAL(15 | ✅ | None | None |
| is_active | BOOLEAN | ✅ | true | None |
| notes | TEXT | ✅ | None | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |
| updated_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Actual Data Analysis

| Column Name | Actual Type | Sample Value | In Migration |
|-------------|-------------|--------------|-------------|
| id | string | "a93935b4-856a-4bca-8a55-01aa92e3db31" | ✅ |
| organization_id | string | "1784ca77-1c6b-489c-9642-7c2b7485695d" | ✅ |
| type | string | "customer" | ✅ |
| company_name | string | "Toyota Vietnam" | ✅ |
| contact_name | string | "Nguyễn Văn An" | ✅ |
| email | string | "procurement@toyota.vn" | ✅ |
| phone | string | "+84-28-7300-1001" | ✅ |
| address | string | "123 Đường Võ Văn Ngân, Quận Thủ Đức" | ✅ |
| city | string | "Ho Chi Minh City" | ✅ |
| state | object | null | ✅ |
| country | string | "Vietnam" | ✅ |
| postal_code | object | null | ✅ |
| website | object | null | ✅ |
| tax_id | object | null | ✅ |
| payment_terms | object | null | ✅ |
| credit_limit | object | null | ✅ |
| is_active | boolean | true | ✅ |
| notes | object | null | ✅ |
| created_at | string | "2025-08-29T15:28:12.20538+00:00" | ✅ |
| updated_at | string | "2025-08-29T15:28:12.20538+00:00" | ✅ |
| user_id | object | null | ❌ |

### Foreign Key Relationships

- `organization_id` → `organizations.id`

### Check Constraints

- **CHECK**: type IN ('customer', 'supplier'

### Indexes

- **idx_contacts_organization_id**: organization_id
- **idx_contacts_type**: type
- **idx_contacts_company_name**: company_name
- **idx_contacts_is_active**: is_active
- **idx_contacts_country**: country

### Data Patterns Analysis

**id:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["a93935b4-856a-4bca-8a55-01aa92e3db31","c130084e-4a7e-4274-8927-f40dd88d8717","b5999c42-7bb4-4931-81d6-2745837e2b8f"]
- Constraints: PRIMARY KEY

**organization_id:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["1784ca77-1c6b-489c-9642-7c2b7485695d","c8ce21d4-2790-4852-ae41-1487b524671e","079d0f42-5361-4ab8-9dd7-a4805c535f76"]

**type:**
- Migration Type: VARCHAR(20)
- Actual Type: string
- Nullable: NO
- Has Data: Yes
- Sample Values: ["customer","customer","customer"]
- Constraints: NOT NULL

**company_name:**
- Migration Type: VARCHAR(255)
- Actual Type: string
- Nullable: NO
- Has Data: Yes
- Sample Values: ["Toyota Vietnam","Honda Vietnam","Boeing Vietnam"]
- Constraints: NOT NULL

**contact_name:**
- Migration Type: VARCHAR(255)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["Nguyễn Văn An","Trần Thị Bình","Lê Văn Cường"]

**email:**
- Migration Type: VARCHAR(255)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["procurement@toyota.vn","purchasing@honda.vn","supply.chain@boeing.vn"]

**phone:**
- Migration Type: VARCHAR(50)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["+84-28-7300-1001","+84-28-7300-1002","+84-28-7300-1003"]

**address:**
- Migration Type: TEXT
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["123 Đường Võ Văn Ngân, Quận Thủ Đức","456 Đường Lê Văn Việt, Quận 9","789 Đường Mai Chí Thọ, Quận 2"]

**city:**
- Migration Type: VARCHAR(100)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["Ho Chi Minh City","Ho Chi Minh City","Ho Chi Minh City"]

**state:**
- Migration Type: VARCHAR(100)
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**country:**
- Migration Type: VARCHAR(100)
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["Vietnam","Vietnam","Vietnam"]

**postal_code:**
- Migration Type: VARCHAR(20)
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**website:**
- Migration Type: VARCHAR(255)
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**tax_id:**
- Migration Type: VARCHAR(100)
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**payment_terms:**
- Migration Type: VARCHAR(100)
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**credit_limit:**
- Migration Type: DECIMAL(15
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**is_active:**
- Migration Type: BOOLEAN
- Actual Type: boolean
- Nullable: YES
- Has Data: Yes
- Sample Values: [true,true,true]

**notes:**
- Migration Type: TEXT
- Actual Type: unknown
- Nullable: YES
- Has Data: No
- Sample Values: []
- Null Count: 5

**created_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00"]

**updated_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00"]

**user_id:**
- Migration Type: not_found
- Actual Type: unknown
- Nullable: UNKNOWN
- Has Data: No
- Sample Values: []
- Null Count: 5


---

## Table: workflow_stages

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| name | VARCHAR(100) | ❌ | None | NOT NULL |
| description | TEXT | ✅ | None | None |
| order_index | INTEGER | ❌ | None | NOT NULL |
| is_active | BOOLEAN | ✅ | true | None |
| estimated_duration_days | INTEGER | ✅ | None | None |
| required_approvals | JSONB | ✅ | '[]' | None |
| auto_advance_conditions | JSONB | ✅ | '{}' | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |
| updated_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Actual Data Analysis

| Column Name | Actual Type | Sample Value | In Migration |
|-------------|-------------|--------------|-------------|
| id | string | "1c4e19c4-0e99-4a8b-9c29-20770c8cce78" | ✅ |
| name | string | "Inquiry Received" | ✅ |
| description | string | "Initial customer inquiry received and logged" | ✅ |
| order_index | number | 1 | ✅ |
| is_active | boolean | true | ✅ |
| estimated_duration_days | number | 1 | ✅ |
| required_approvals | object | [] | ✅ |
| auto_advance_conditions | object | {} | ✅ |
| created_at | string | "2025-08-29T15:28:12.20538+00:00" | ✅ |
| updated_at | string | "2025-08-29T15:28:12.20538+00:00" | ✅ |

### Indexes

- **idx_workflow_stages_order_index**: order_index
- **idx_workflow_stages_is_active**: is_active

### Data Patterns Analysis

**id:**
- Migration Type: UUID
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["1c4e19c4-0e99-4a8b-9c29-20770c8cce78","b7d50a39-9be9-4fc0-8305-b23f2e908664","716f1c4d-2537-4ac8-97a1-4ad89bafb018"]
- Constraints: PRIMARY KEY

**name:**
- Migration Type: VARCHAR(100)
- Actual Type: string
- Nullable: NO
- Has Data: Yes
- Sample Values: ["Inquiry Received","Technical Review","Supplier RFQ"]
- Constraints: NOT NULL

**description:**
- Migration Type: TEXT
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["Initial customer inquiry received and logged","Engineering team reviews technical requirements","Request for quotes from suppliers"]

**order_index:**
- Migration Type: INTEGER
- Actual Type: number
- Nullable: NO
- Has Data: Yes
- Sample Values: [1,2,3]
- Constraints: NOT NULL

**is_active:**
- Migration Type: BOOLEAN
- Actual Type: boolean
- Nullable: YES
- Has Data: Yes
- Sample Values: [true,true,true]

**estimated_duration_days:**
- Migration Type: INTEGER
- Actual Type: number
- Nullable: YES
- Has Data: Yes
- Sample Values: [1,3,5]

**required_approvals:**
- Migration Type: JSONB
- Actual Type: object
- Nullable: YES
- Has Data: Yes
- Sample Values: [[],[],[]]

**auto_advance_conditions:**
- Migration Type: JSONB
- Actual Type: object
- Nullable: YES
- Has Data: Yes
- Sample Values: [{},{},{}]

**created_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00"]

**updated_at:**
- Migration Type: TIMESTAMPTZ
- Actual Type: string
- Nullable: YES
- Has Data: Yes
- Sample Values: ["2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00","2025-08-29T15:28:12.20538+00:00"]


---

## Table: project_assignments

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| project_id | UUID | ✅ | None | None |
| user_id | UUID | ✅ | None | None |
| role | VARCHAR(100) | ❌ | None | NOT NULL |
| assigned_at | TIMESTAMPTZ | ✅ | NOW() | None |
| is_active | BOOLEAN | ✅ | true | None |
| notes | TEXT | ✅ | None | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |
| updated_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Foreign Key Relationships

- `project_id` → `projects.id`
- `user_id` → `users.id`

### Indexes

- **idx_project_assignments_project_id**: project_id
- **idx_project_assignments_user_id**: user_id
- **idx_project_assignments_role**: role
- **idx_project_assignments_is_active**: is_active

---

## Table: documents

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| organization_id | UUID | ✅ | None | None |
| project_id | UUID | ✅ | None | None |
| file_name | VARCHAR(255) | ❌ | None | NOT NULL |
| original_file_name | VARCHAR(255) | ❌ | None | NOT NULL |
| file_url | TEXT | ❌ | None | NOT NULL |
| file_size | BIGINT | ✅ | None | None |
| mime_type | VARCHAR(100) | ✅ | None | None |
| checksum | VARCHAR(64) | ✅ | None | None |
| document_type | VARCHAR(100) | ✅ | None | None |
| ai_extracted_data | JSONB | ✅ | '{}' | None |
| ai_confidence_score | DECIMAL(3 | ✅ | None | None |
| uploaded_by | UUID | ✅ | None | None |
| is_active | BOOLEAN | ✅ | true | None |
| metadata | JSONB | ✅ | '{}' | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |
| updated_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Foreign Key Relationships

- `organization_id` → `organizations.id`
- `project_id` → `projects.id`
- `uploaded_by` → `users.id`

### Indexes

- **idx_documents_organization_id**: organization_id
- **idx_documents_project_id**: project_id
- **idx_documents_document_type**: document_type
- **idx_documents_uploaded_by**: uploaded_by
- **idx_documents_is_active**: is_active

---

## Table: reviews

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| organization_id | UUID | ✅ | None | None |
| project_id | UUID | ✅ | None | None |
| reviewer_id | UUID | ✅ | None | None |
| reviewer_role | VARCHAR(100) | ✅ | None | None |
| review_type | VARCHAR(50) | ✅ | 'technical' | None |
| CHECK | (review_type | ✅ | None | None |
| status | VARCHAR(20) | ✅ | 'pending' | None |
| CHECK | (status | ✅ | None | None |
| reviewed_at | TIMESTAMPTZ | ✅ | None | None |
| risks | TEXT[] | ✅ | None | None |
| recommendations | TEXT[] | ✅ | None | None |
| tooling_required | TEXT[] | ✅ | None | None |
| estimated_cost | DECIMAL(15 | ✅ | None | None |
| estimated_lead_time | INTEGER | ✅ | None | None |
| notes | TEXT | ✅ | None | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |
| updated_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Foreign Key Relationships

- `organization_id` → `organizations.id`
- `project_id` → `projects.id`
- `reviewer_id` → `users.id`

### Check Constraints

- **CHECK**: review_type IN ('technical', 'quality', 'safety', 'compliance', 'financial'
- **CHECK**: status IN ('pending', 'approved', 'rejected', 'requires_changes'

### Indexes

- **idx_reviews_organization_id**: organization_id
- **idx_reviews_project_id**: project_id
- **idx_reviews_reviewer_id**: reviewer_id
- **idx_reviews_status**: status
- **idx_reviews_review_type**: review_type

---

## Table: messages

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| organization_id | UUID | ✅ | None | None |
| project_id | UUID | ✅ | None | None |
| thread_id | UUID | ✅ | None | None |
| sender_type | VARCHAR(20) | ❌ | None | NOT NULL |
| sender_contact_id | UUID | ✅ | None | None |
| sender_user_id | UUID | ✅ | None | None |
| recipient_type | VARCHAR(20) | ❌ | None | NOT NULL |
| recipient_role | VARCHAR(100) | ✅ | None | None |
| recipient_department | VARCHAR(100) | ✅ | None | None |
| recipient_user_id | UUID | ✅ | None | None |
| subject | VARCHAR(255) | ✅ | None | None |
| content | TEXT | ❌ | None | NOT NULL |
| is_read | BOOLEAN | ✅ | false | None |
| read_at | TIMESTAMPTZ | ✅ | None | None |
| attachments | JSONB | ✅ | '[]' | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |
| updated_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Foreign Key Relationships

- `organization_id` → `organizations.id`
- `project_id` → `projects.id`
- `sender_contact_id` → `contacts.id`
- `sender_user_id` → `users.id`
- `recipient_user_id` → `users.id`

### Check Constraints

- **CHECK**: sender_type IN ('user', 'contact', 'system'
- **CHECK**: recipient_type IN ('user', 'contact', 'department', 'role'

### Indexes

- **idx_messages_organization_id**: organization_id
- **idx_messages_project_id**: project_id
- **idx_messages_thread_id**: thread_id
- **idx_messages_sender_user_id**: sender_user_id
- **idx_messages_recipient_user_id**: recipient_user_id
- **idx_messages_is_read**: is_read
- **idx_messages_created_at**: created_at

---

## Table: notifications

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| organization_id | UUID | ✅ | None | None |
| user_id | UUID | ✅ | None | None |
| title | VARCHAR(255) | ❌ | None | NOT NULL |
| message | TEXT | ❌ | None | NOT NULL |
| type | VARCHAR(50) | ✅ | 'info' | None |
| CHECK | (type | ✅ | None | None |
| link | TEXT | ✅ | None | None |
| is_read | BOOLEAN | ✅ | false | None |
| read_at | TIMESTAMPTZ | ✅ | None | None |
| delivered_at | TIMESTAMPTZ | ✅ | None | None |
| expires_at | TIMESTAMPTZ | ✅ | None | None |
| metadata | JSONB | ✅ | '{}' | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |
| updated_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Foreign Key Relationships

- `organization_id` → `organizations.id`
- `user_id` → `users.id`

### Check Constraints

- **CHECK**: type IN ('info', 'success', 'warning', 'error', 'urgent'

### Indexes

- **idx_notifications_organization_id**: organization_id
- **idx_notifications_user_id**: user_id
- **idx_notifications_type**: type
- **idx_notifications_is_read**: is_read
- **idx_notifications_created_at**: created_at

---

## Table: activity_log

### Schema Definition (from migrations)

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| id | UUID | ✅ | uuid_generate_v4() | PRIMARY KEY |
| organization_id | UUID | ✅ | None | None |
| user_id | UUID | ✅ | None | None |
| action | VARCHAR(100) | ❌ | None | NOT NULL |
| entity_type | VARCHAR(50) | ✅ | None | None |
| entity_id | UUID | ✅ | None | None |
| old_values | JSONB | ✅ | '{}' | None |
| new_values | JSONB | ✅ | '{}' | None |
| ip_address | INET | ✅ | None | None |
| user_agent | TEXT | ✅ | None | None |
| session_id | VARCHAR(255) | ✅ | None | None |
| metadata | JSONB | ✅ | '{}' | None |
| created_at | TIMESTAMPTZ | ✅ | NOW() | None |

### Foreign Key Relationships

- `organization_id` → `organizations.id`
- `user_id` → `users.id`

### Indexes

- **idx_activity_log_organization_id**: organization_id
- **idx_activity_log_user_id**: user_id
- **idx_activity_log_action**: action
- **idx_activity_log_entity_type**: entity_type
- **idx_activity_log_entity_id**: entity_id
- **idx_activity_log_created_at**: created_at

---

