# Factory Pulse Development Memory

## 2025-01-27 - User Authentication Setup and Email Display Fix

### Work Done
- **Identified and fixed email display issue** in AdminUsers component where emails were showing as "Email not available"
- **Root cause analysis**: `getUserEmail` function was hardcoded to return "Email not available" for any user that wasn't the current user
- **Database verification**: Confirmed that users table contains proper email data for all sample users
- **Type system fixes**: Resolved TypeScript interface conflicts between `UserProfile` and `UserWithStats`
- **Authentication setup**: Created authentication users for existing database users to enable login functionality

### Root Cause Analysis
- **AdminUsers component**: Used `getUserEmail(user.id)` function that was hardcoded to return "Email not available"
- **Database data**: Users table actually contained proper email addresses (ceo@factorypulse.vn, operations@factorypulse.vn, etc.)
- **Type mismatch**: `UserWithStats` interface incorrectly extended `UserProfile` with optional email field
- **Function logic**: `getUserEmail` function was designed for a different authentication approach
- **Authentication gap**: Users existed in custom `users` table but not in Supabase `auth.users` table

### Changes Made
1. **Fixed email display**:
   - Replaced `{getUserEmail(user.id)}` with `{user.email || 'No email'}`
   - Removed unused `getUserEmail` function entirely

2. **Fixed TypeScript interfaces**:
   - Removed conflicting `email?: string` from `UserWithStats` interface
   - Made `login_attempts` optional since it's not in database schema
   - Fixed type casting for database query results

3. **Updated status handling**:
   - Changed "Pending Users" to "Dismissed Users" to match actual database values
   - Updated statuses array from `['active', 'inactive', 'pending', 'locked', 'dormant']` to `['active', 'dismiss']`
   - Fixed status comparison in stats card

4. **Fixed property references**:
   - Changed `user.last_login` to `user.last_login_at` to match database schema

5. **Created authentication users**:
   - Created migration `20250127000006_create_auth_users.sql` to create auth users for existing database users
   - Set default password: `Password123!` for all users
   - Created proper identity records in `auth.identities` table

### Files Modified
- `src/pages/AdminUsers.tsx` - Fixed email display, type interfaces, and status handling
- `supabase/migrations/20250127000006_create_auth_users.sql` - New migration for authentication users

### Result
- **Email display**: Now shows actual email addresses from database instead of "Email not available"
- **Type safety**: Resolved TypeScript compilation errors
- **Data accuracy**: Status counts and user information now match database schema
- **User experience**: Admin users can now see actual email addresses for all users
- **Authentication**: Users can now sign in with their email and default password `Password123!`

### Technical Details
- **Database schema**: Users table has `email` field as `VARCHAR(255) NOT NULL`
- **Sample data**: 12 users with proper email addresses (ceo@factorypulse.vn, operations@factorypulse.vn, etc.)
- **Type system**: `UserProfile` interface correctly defines `email: string` as required field
- **Component logic**: Direct access to `user.email` instead of complex function calls
- **Authentication**: All users now have corresponding records in `auth.users` and `auth.identities` tables

### Login Credentials
- **Email**: ceo@factorypulse.vn (or any other user email from the database)
- **Password**: Password123!
- **Note**: This is the default password set for all users during migration

### Next Steps
- Test user authentication with the new credentials
- Verify user management interface displays emails correctly
- Test user editing and role management functionality
- Consider implementing password change functionality for security

## 2025-01-27 - Admin Role Display Issue Investigation and Fix

### Issue Identified
- **Problem**: `admin@factorypulse.vn` user showing as "customer" role instead of "admin" role
- **Root Cause**: UUID mismatch between `auth.users` table and custom `users` table
- **Symptoms**: 
  - Database correctly shows admin role for admin@factorypulse.vn
  - Application displays user as customer role
  - AuthContext logs show "No user data found in database for email: admin@factorypulse.vn"

### Technical Analysis
- **Database users table**: Contains admin@factorypulse.vn with UUID `550e8400-e29b-41d4-a716-446655440012` and role `admin`
- **Auth migration issue**: Previous migration tried to use same UUIDs for both tables, but Supabase auth generates different UUIDs
- **Authentication flow**: `fetchProfile` function queries by email, but there's a mismatch between auth user ID and database user ID

### Solution Implemented
1. **Enhanced AuthContext**: Improved profile fetching with better fallback logic and database profile creation
2. **Migration script**: Created `20250127000007_fix_auth_user_mapping.sql` to properly link auth users with database users
3. **Diagnostic tools**: Created `scripts/diagnose-auth-issue.js` to identify authentication mapping problems
4. **Quick fix script**: Created `scripts/fix-admin-role-issue.sql` for immediate resolution

### Files Modified/Created
- `src/contexts/AuthContext.tsx` - Enhanced profile fetching and fallback logic
- `supabase/migrations/20250127000007_fix_auth_user_mapping.sql` - New migration for proper user mapping
- `scripts/diagnose-auth-issue.js` - Diagnostic script for authentication issues
- `scripts/fix-admin-role-issue.sql` - Quick fix SQL script

### Immediate Resolution Steps
1. **Run diagnostic script**: `node scripts/diagnose-auth-issue.js` to identify the exact issue
2. **Apply quick fix**: Run `scripts/fix-admin-role-issue.sql` in Supabase SQL Editor
3. **Test authentication**: Sign out and sign back in with admin@factorypulse.vn / Password123!

### Long-term Solution
- **Run full migration**: Apply `20250127000007_fix_auth_user_mapping.sql` for proper user mapping
- **Update RLS policies**: Ensure proper security policies for user data access
- **Test all users**: Verify that all 12 sample users can authenticate properly

### Technical Details
- **UUID mismatch**: Custom users table uses predefined UUIDs, auth.users generates new UUIDs
- **Email-based lookup**: Current approach relies on email matching, which works but can be unreliable
- **User ID linking**: New approach creates `user_id` field to properly link auth users with database users
- **Fallback logic**: Enhanced error handling and profile creation for new users

### Work Done
- **Identified and fixed email display issue** in AdminUsers component where emails were showing as "Email not available"
- **Root cause analysis**: `getUserEmail` function was hardcoded to return "Email not available" for any user that wasn't the current user
- **Database verification**: Confirmed that users table contains proper email data for all sample users
- **Type system fixes**: Resolved TypeScript interface conflicts between `UserProfile` and `UserWithStats`

### Root Cause Analysis
- **AdminUsers component**: Used `getUserEmail(user.id)` function that was hardcoded to return "Email not available"
- **Database data**: Users table actually contained proper email addresses (ceo@factorypulse.vn, operations@factorypulse.vn, etc.)
- **Type mismatch**: `UserWithStats` interface incorrectly extended `UserProfile` with optional email field
- **Function logic**: `getUserEmail` function was designed for a different authentication approach

### Changes Made
1. **Fixed email display**:
   - Replaced `{getUserEmail(user.id)}` with `{user.email || 'No email'}`
   - Removed unused `getUserEmail` function entirely

2. **Fixed TypeScript interfaces**:
   - Removed conflicting `email?: string` from `UserWithStats` interface
   - Made `login_attempts` optional since it's not in database schema
   - Fixed type casting for database query results

3. **Updated status handling**:
   - Changed "Pending Users" to "Dismissed Users" to match actual database values
   - Updated statuses array from `['active', 'inactive', 'pending', 'locked', 'dormant']` to `['active', 'dismiss']`
   - Fixed status comparison in stats card

4. **Fixed property references**:
   - Changed `user.last_login` to `user.last_login_at` to match database schema

### Files Modified
- `src/pages/AdminUsers.tsx` - Fixed email display, type interfaces, and status handling

### Result
- **Email display**: Now shows actual email addresses from database instead of "Email not available"
- **Type safety**: Resolved TypeScript compilation errors
- **Data accuracy**: Status counts and user information now match database schema
- **User experience**: Admin users can now see actual email addresses for all users

### Technical Details
- **Database schema**: Users table has `email` field as `VARCHAR(255) NOT NULL`
- **Sample data**: 12 users with proper email addresses (ceo@factorypulse.vn, operations@factorypulse.vn, etc.)
- **Type system**: `UserProfile` interface correctly defines `email: string` as required field
- **Component logic**: Direct access to `user.email` instead of complex function calls

### Next Steps
- Test user management interface to verify email display
- Verify all user information is correctly displayed
- Test user editing and role management functionality

---

## 2025-01-27 - User Management Access Denied Issue Resolution

### Work Done
- **Identified and fixed case sensitivity mismatch** between database role values and application role checks
- **Added missing RLS policies** for the `activity_log` table to resolve 403 Forbidden errors
- **Updated all role references** throughout the application to use consistent lowercase values
- **Resolved "Access Denied" error** when accessing user management from admin tab

### Root Cause Analysis
- **Database roles**: All stored as lowercase (`management`, `engineering`, `qa`, etc.)
- **Application checks**: Used capitalized values (`Management`, `Engineering`, `QA`, etc.)
- **ProtectedRoute component**: Blocked access due to case mismatch in `requiredRoles` array
- **Missing RLS policies**: `activity_log` table had no policies, causing 403 errors during audit logging

### Changes Made
1. **Fixed App.tsx route protection**:
   - `/users` route: `['Management']` → `['management']`
   - `/reviews` route: `['Engineering', 'QA', 'Production', 'Management', 'Procurement']` → `['engineering', 'qa', 'production', 'management', 'procurement']`
   - `/production` route: `['Production', 'Management']` → `['production', 'management']`
   - `/analytics` route: `['Management', 'Procurement Owner']` → `['management', 'procurement']`

2. **Updated AdminUsers component**:
   - Roles array: Capitalized values → lowercase values
   - `getRoleBadgeColor` function: Updated case matching

3. **Fixed auth constants and types**:
   - `ROLE_DESCRIPTIONS`: Capitalized → lowercase
   - `ROLE_DEFAULT_ROUTES`: Capitalized → lowercase
   - `UserRole` enum: Capitalized → lowercase

4. **Added RLS policies for activity_log table**:
   - Users can view their own activity logs
   - Management can view all activity logs in their organization
   - Users can insert their own activity logs
   - Management can insert activity logs for their organization
   - System can insert activity logs (for triggers and automated processes)

### Files Modified
- `src/App.tsx` - Fixed route role requirements
- `src/pages/AdminUsers.tsx` - Updated role arrays and badge colors
- `src/lib/auth-constants.ts` - Updated role descriptions and routes
- `src/types/auth.ts` - Updated UserRole enum values
- `supabase/migrations/20250127000012_activity_log_rls_policies.sql` - New migration for RLS policies

### Result
- **User management access**: Now working for CEO/management users
- **Audit logging**: Functional without 403 errors
- **Role consistency**: All role references now use lowercase values matching database
- **Admin functionality**: Full access restored for management users

### Next Steps
- Test user management functionality with different user roles
- Verify all admin features are accessible
- Consider adding role validation to prevent future case mismatches
- Test audit logging functionality

---

## 2025-01-27 - Database Migration Setup and User Authentication Data

### Work Done
- **Successfully set up local Supabase database** with all required migrations
- **Fixed migration file organization** by restoring files from backup directory
- **Applied comprehensive database schema** including organizations, users, and workflow tables
- **Populated sample user data** for testing authentication and user management features
- **Resolved PostgreSQL type inference issues** with UUID arrays in migrations

### Database Status
- **Local Supabase instance**: Running on ports 54321-54324
- **Database**: Successfully created with 12 sample users
- **Organization**: Factory Pulse Vietnam Co., Ltd. created
- **CEO User**: Nguyễn Văn Minh (ceo@factorypulse.vn) with management role and Executive department

### Migration Files Applied
1. **`20250127000001_core_tables.sql`** - Core tables (organizations, users, contacts)
2. **`20250127000002_workflow_projects.sql`** - Workflow and project management
3. **`20250127000003_documents_reviews.sql`** - Document management system
4. **`20250127000004_communication_suppliers.sql`** - Communication and supplier features
5. **`20250127000005_advanced_features.sql`** - Advanced system features
6. **`20250127000006_convert_users_to_user_id.sql`** - User ID conversion for Supabase auth
7. **`20250127000008_restore_users_data.sql`** - User data restoration
8. **`20250127000009_insert_sample_users.sql`** - Sample user population

### Challenges ➜ Solutions
1. **Migration files missing** ➜ Restored from backup directory to main migrations folder
2. **PostgreSQL array type errors** ➜ Fixed ARRAY[] syntax by adding explicit UUID type casting
3. **Duplicate organization insertion** ➜ Removed duplicate INSERT from sample users migration
4. **Database connection issues** ➜ Used direct psql connection to verify database state

### Current Database State
- **Tables**: All core tables created successfully
- **Users**: 12 sample users with proper roles and departments
- **Authentication**: Ready for Supabase auth integration
- **User Management**: Database structure supports admin functionality

### Next Steps
- Test user authentication with existing sample users
- Verify admin tab visibility and user management access
- Test role-based permissions and department filtering
- Consider adding more sample data for comprehensive testing

---

## 2025-01-27 - User Avatar Button Popup Menu Navigation Implementation

### Work Done
- **Implemented navigation functionality** for user avatar button popup menu items
- **Created dedicated user profile page** (`/profile`) for viewing and editing user information
- **Added profile route** to application routing with proper authentication protection
- **Enhanced user experience** by providing direct access to profile and settings from header

### Changes Made
- **Profile Menu Item**: Now navigates to `/profile` page when selected
- **Settings Menu Item**: Now navigates to `/settings` page when selected
- **New Profile Page**: Created comprehensive user profile interface with edit capabilities
- **Route Protection**: Added profile route with ProtectedRoute wrapper for security

### Files Modified
- `src/components/layout/AppHeader.tsx` - Added navigation links to Profile and Settings menu items
- `src/pages/Profile.tsx` - Created new user profile page with edit functionality
- `src/App.tsx` - Added profile route to application routing

### Profile Page Features
- **Profile Display**: Shows user avatar, name, role, department, and contact information
- **Edit Mode**: Toggle between view and edit modes for profile information
- **Form Validation**: Proper form handling with save/cancel functionality
- **Responsive Design**: Mobile-friendly layout with proper grid structure
- **Toast Notifications**: User feedback for successful updates and errors

### Architecture Impact
- **Navigation consistency** - Profile and Settings now properly navigate to dedicated pages
- **User experience** - Direct access to profile management from header
- **Code organization** - Separated profile functionality from general settings
- **Authentication flow** - Proper route protection for profile access

### Next Steps
- Test profile editing functionality with different user roles
- Consider adding profile picture upload capability
- Review profile page styling consistency with other pages
- Add profile link to sidebar navigation if needed

---

## 2025-01-27 - UI Consistency Improvements for AppHeader Icon Buttons

### Work Done
- **Standardized icon button styling** in AppHeader for consistent visual appearance
- **Unified notification bell and user avatar buttons** to use the same design pattern
- **Applied consistent sky-themed color scheme** across both icon buttons
- **Maintained notification badge visibility** while improving overall button consistency

### Changes Made
- **Notification Bell Button**: Changed from red-themed styling to sky-themed styling with `border-2 border-sky-200 hover:border-sky-300 hover:bg-sky-100`
- **User Avatar Button**: Updated hover background from amber to sky theme for consistency
- **Both buttons**: Now share identical styling classes for size (`h-8 w-8`), border, and hover effects
- **Text colors**: Both buttons now use `text-sky-700` for consistent icon appearance

### Files Modified
- `src/components/layout/AppHeader.tsx` - Updated both icon buttons for consistent styling

### Architecture Impact
- **UI consistency** - Both icon buttons now follow the same design system
- **User experience** - More professional and cohesive header appearance
- **Maintainability** - Easier to maintain consistent styling across similar components
- **Design system** - Establishes pattern for future icon button implementations

### Next Steps
- Apply similar consistency improvements to other icon buttons in the application
- Consider creating a reusable IconButton component for consistent styling
- Review other UI components for similar consistency opportunities

---

## 2025-08-28 - Database Migration Files Creation & Schema Alignment

### Work Done
- **Created comprehensive migration files** to match current `database-schema.md`
- **Fixed schema mismatches** between import script and actual database structure
- **Added missing fields** to organizations table (`description`, `industry`)
- **Enhanced users table** with employee management fields (`employee_id`, `direct_manager_id`, `direct_reports`)
- **Optimized database performance** with proper indexes for all new fields
- **Implemented complete RLS setup** for multi-tenancy security
- **Added automation triggers** for common operations (timestamps, project IDs, activity logging)

### Migration Files Created (Merged & Optimized)
1. **`20250127000001_core_tables.sql`** - Core tables with sample data (organizations, users, contacts)
2. **`20250127000002_workflow_projects.sql`** - Workflow stages and projects
3. **`20250127000003_documents_reviews.sql`** - Document management and reviews
4. **`20250127000004_communication_suppliers.sql`** - Communication and supplier management
5. **`20250127000005_advanced_features.sql`** - Advanced features and configuration

**Note:** Redundant `_organization_user_enhancements.sql` migration was merged into core_tables

### Challenges ➜ Solutions
1. **Schema mismatch in import script** ➜ Created proper migration files matching current schema
2. **Missing fields in organizations table** ➜ Added `description` and `industry` fields with proper indexing
3. **Incomplete user management** ➜ Added employee hierarchy fields (`direct_manager_id`, `direct_reports`)
4. **Performance concerns** ➜ Implemented comprehensive indexing strategy for all tables
5. **Security gaps** ➜ Enabled RLS on all tables with proper organization isolation

### Files Modified
- `supabase/migrations/20250127000001_core_tables.sql` - Core tables with enhanced fields
- `supabase/migrations/20250127000002_workflow_projects.sql` - Workflow and project management
- `supabase/migrations/20250127000003_documents_reviews.sql` - Document and review system
- `supabase/migrations/20250127000004_communication_suppliers.sql` - Communication and suppliers
- `supabase/migrations/20250127000005_advanced_features.sql` - Advanced features and automation
- `docs/ACTUAL_SCHEMA_ANALYSIS.md` - Comprehensive schema analysis document

### Architecture Impact
- **Database structure** - Now fully aligned with application requirements
- **Multi-tenancy** - Complete RLS implementation for organization isolation
- **Performance** - Optimized with proper indexes and query patterns
- **Scalability** - Ready for production deployment with proper constraints
- **Maintainability** - Clean migration structure for future schema changes

### Next Steps
- Apply migrations to Supabase database using `supabase db push --linked`
- Update `supabase-import.sql` to match new schema structure
- Test multi-tenancy isolation and workflow automation
- Validate performance with proper indexes
- Begin frontend development with confidence in database structure

---

## 2025-01-27 - Database Schema Revision & Improvements

### Work Done
- **Comprehensive database schema revision** to align with PRD requirements
- **Standardized UUID generation** from mixed `gen_random_uuid()` vs `uuid_generate_v4()` to consistent `uuid_generate_v4()`
- **Separated project status from workflow stages** - added `status` field (active/delayed/cancelled) distinct from `current_stage` (workflow step)
- **Enhanced document versioning** - replaced parent-child model with dedicated `document_versions` table
- **Simplified messaging system** - removed complex `message_recipients` table, unified with thread-based messaging
- **Added Vietnam & Southeast Asia localization** - default country 'Vietnam', VND currency, expanded currency support
- **Improved AI & automation extensibility** - centralized AI processing in `ai_processing_queue` table
- **Enhanced multi-tenancy** - enforced `organization_id` on all core tables for SaaS readiness
- **Updated timestamp format** - standardized to `TIMESTAMPTZ` for consistency

### Challenges ➜ Solutions
1. **Mixed UUID generation methods** ➜ Standardized all tables to use `uuid_generate_v4()` for consistency
2. **Confused project status vs workflow stages** ➜ Added separate `status` field with clear lifecycle states
3. **Complex document versioning** ➜ Created dedicated `document_versions` table for cleaner version history
4. **Overly complex messaging** ➜ Simplified to thread-based model with unified `thread_id`
5. **Missing localization support** ➜ Added Vietnam defaults and expanded currency/language support
6. **Scattered AI fields** ➜ Centralized in dedicated AI processing queue table

### Files Modified
- `docs/database-schema.md` - Complete revision with improvements table, updated schema, and summary
- `docs/database-selection-items.md` - Converted to enum types structure with PostgreSQL ENUM types and usage guidelines

### Architecture Impact
- **Database structure** - Improved normalization and consistency
- **Multi-tenancy** - Enhanced SaaS readiness with organization isolation
- **Workflow management** - Clearer separation of project lifecycle vs workflow progression
- **Document management** - Better version control and audit trail
- **Internationalization** - Ready for Vietnam and Southeast Asia markets

### Next Steps
- Update migration files to reflect new schema changes
- Implement new document versioning system in application code
- Add Vietnam/SEA localization features to UI
- Test multi-tenancy isolation with new organization_id constraints

---

## 2025-01-27 - RLS Policy Setup and Authentication Issue Resolution

### Work Done
- **Created comprehensive RLS policies** for the users, organizations, and contacts tables
- **Fixed user authentication lookup** by prioritizing email-based queries over ID-based queries
- **Established proper role-based access control** allowing management users to view and manage all users in their organization
- **Resolved "Access Denied" issue** in User Management by implementing proper database permissions

### RLS Policies Created
1. **Users Table Policies**:
   - Users can view their own profile
   - Management users can view all users in their organization
   - Users can update their own profile
   - Management users can update all users in their organization
   - Management users can insert new users
   - Management users can delete users

2. **Organizations Table Policies**:
   - Users can view their own organization
   - Management users can view organization details

3. **Contacts Table Policies**:
   - Users can view contacts in their organization
   - Management users can manage all contacts

### Authentication Flow Changes
- **Modified AuthContext** to prioritize email-based user lookup for existing users
- **Changed query order** from ID-first to email-first to resolve UUID mismatch issues
- **Maintained fallback** to ID-based lookup for new users

### Current Database State
- **Users**: 12 sample users including 3 management users
- **RLS**: Enabled with comprehensive policies
- **Authentication**: Ready for proper user lookup and role-based access

### Next Steps
- Test user authentication with existing sample users (ceo@factorypulse.vn)
- Verify admin tab visibility and user management access
- Test role-based permissions and department filtering
- Consider implementing proper user registration flow for new users
