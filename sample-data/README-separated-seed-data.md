# Factory Pulse - Separated Seed Data Structure

This directory contains properly separated seed data files for the Factory Pulse MES system, organized by table to maintain referential integrity and make data management easier.

## 📁 File Structure

The seed data is organized in the following order to respect foreign key dependencies:

### 1. **01-organizations.json** - Base Organizations
- Factory Pulse Vietnam (main organization)
- Customer organizations (Toyota, Honda, Boeing, etc.)
- Supplier organizations (Precision Machining, Metal Fabrication, etc.)

### 2. **02-workflow-stages.json** - Workflow Configuration
- 8 workflow stages from "Inquiry Received" to "Shipped & Closed"
- All stages belong to Factory Pulse Vietnam organization
- Includes stage order, colors, and responsible roles

### 3. **03-users.json** - Internal Factory Pulse Employees
- 16 internal users with different roles and departments
- All users belong to Factory Pulse Vietnam organization
- Includes management hierarchy and direct reports

### 4. **04-contacts.json** - External Customers & Suppliers
- 10 contacts (5 customers + 5 suppliers)
- All contacts belong to Factory Pulse Vietnam organization
- Includes AI categorization and risk scoring

### 5. **05-projects.json** - Project Records
- 7 sample projects across different industries
- References customers, workflow stages, and assigned users
- Includes project metadata and requirements

### 6. **06-documents.json** - Project Documents
- 8 sample documents (drawings, specifications, certificates)
- References projects and uploaded by users
- Includes AI-extracted data and processing status

### 7. **07-reviews.json** - Project Reviews
- 9 sample reviews across different projects
- References projects, reviewers, and review types
- Includes risk assessments and recommendations

### 8. **08-messages.json** - Communication Messages
- 10 sample messages for project communication
- References projects, senders, and recipients
- Includes thread-based messaging structure

### 9. **09-notifications.json** - User Notifications
- 13 sample notifications for various events
- References users, projects, and notification types
- Includes delivery methods and priorities

### 10. **10-activity-log.json** - System Activity Log
- 18 sample activity log entries
- References organizations, projects, users, and entities
- Includes IP addresses and user agent information

## 🔗 Referential Integrity

All seed data maintains proper foreign key relationships:

- **Organizations**: Base entities that all other data references
- **Workflow Stages**: Referenced by projects for current stage
- **Users**: Referenced by projects, reviews, messages, and notifications
- **Contacts**: Referenced by projects as customers
- **Projects**: Central entity referenced by documents, reviews, messages, and notifications
- **Documents**: Referenced by projects and uploaded by users
- **Reviews**: Referenced by projects and assigned to users
- **Messages**: Referenced by projects and sent by users
- **Notifications**: Referenced by users and projects
- **Activity Log**: References all major entities for audit trail

## 🚀 Import Order

When importing the seed data, follow this order to maintain referential integrity:

1. **Organizations** (01-organizations.json)
2. **Workflow Stages** (02-workflow-stages.json)
3. **Users** (03-users.json)
4. **Contacts** (04-contacts.json)
5. **Projects** (05-projects.json)
6. **Documents** (06-documents.json)
7. **Reviews** (07-reviews.json)
8. **Messages** (08-messages.json)
9. **Notifications** (09-notifications.json)
10. **Activity Log** (10-activity-log.json)

## 📊 Data Overview

### Organizations
- **1 Main Organization**: Factory Pulse Vietnam
- **4 Customer Organizations**: Toyota, Honda, Boeing, Airbus, Samsung
- **5 Supplier Organizations**: Various manufacturing service providers

### Users (Internal Employees)
- **3 Management**: CEO, Operations Manager, Quality Manager
- **4 Engineering**: Senior, Mechanical, Electrical Engineers
- **2 QA**: QA Engineer, Quality Inspector
- **2 Production**: Production Supervisor, Team Lead
- **2 Sales**: Sales Manager, Customer Service
- **1 Procurement**: Procurement Specialist
- **1 Project Management**: Project Coordinator
- **1 IT**: System Administrator

### Projects
- **17 Active Projects**: Automotive, Motorcycle, Aerospace, Electronics, Industrial, Medical, Solar, Robotics, Defense, Renewable Energy
- **Multiple Industries**: Automotive, Aerospace, Electronics, Medical, Renewable Energy, Defense, Robotics
- **Various Stages**: From Inquiry to Production
- **Priority Levels**: Low, Medium, High, Critical
- **Project Types**: Fabrication, System Build, Manufacturing

### Documents
- **8 Documents**: Drawings, Specifications, Certificates
- **Multiple Formats**: DWG, PDF, STEP files
- **AI Processing**: Extracted data and confidence scores

## 🛠️ Usage

### For Development
```bash
# Seed projects using the provided script
npm run seed:projects

# Or with relationship fixing if needed
npm run seed:projects:fix

# Or force overwrite existing data
npm run seed:projects:force
```

### For Testing
```bash
# Use individual files for specific table testing
# Each file can be imported independently after dependencies are satisfied
```

### For Production
```bash
# Import in sequence ensuring all dependencies are met
# Verify referential integrity after each import
```

## 🔍 Data Validation

Each seed data file includes:
- **Unique UUIDs**: All entities have unique identifiers
- **Proper References**: All foreign keys reference existing entities
- **Realistic Data**: Vietnamese context with realistic company names and addresses
- **Complete Records**: All required fields are populated
- **Consistent Timestamps**: All records use consistent date/time format

## 📝 Notes

- **Local Development**: All data is configured for local Supabase development
- **Vietnamese Context**: Addresses, names, and companies reflect Vietnamese manufacturing industry
- **Multi-tenant Ready**: Structure supports multiple organizations with proper isolation
- **AI Integration**: Includes AI processing fields for future automation features
- **Audit Trail**: Complete activity logging for compliance and debugging

## 🚨 Important

- **Never Reset Production**: These seed files are for development and testing only
- **Backup First**: Always backup existing data before importing
- **Verify Dependencies**: Ensure all referenced entities exist before importing dependent data
- **Test Import Order**: Verify the import order works in your specific environment

## 📞 Support

For questions about the seed data structure or import process, refer to:
- Database schema documentation
- Supabase CLI documentation
- Project architecture documentation


Database backups created:

factory_pulse_backup_20250831_085425.sql - Full schema backup (most recent)
factory_pulse_data_backup_20250831_085438.sql - Data-only backup
The full schema backup includes both the database structure and data, while the data-only backup contains just the data (with some warnings about circular foreign key constraints, which is normal for complex schemas).

To restore from backup later:



# Restore full backup (schema + data)
supabase db reset --local
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres < backups/factory_pulse_backup_20250831_085425.sql

# Or restore just data to existing schema
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres < backups/factory_pulse_data_backup_20250831_085438.sql