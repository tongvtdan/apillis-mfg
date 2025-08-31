# User Management Scripts

This directory contains scripts for managing user profiles in the Factory Pulse system.

## Scripts

### `add-user-profiles-v2.js`
Creates user profiles from the sample data file. This script:
1. Creates users in Supabase auth.users table
2. Creates corresponding profiles in the users table
3. Properly maps hierarchical relationships (managers/direct reports)
4. Handles ID mapping from sample data to actual database IDs

**Usage:**
```bash
node scripts/add-user-profiles-v2.js
```

**Features:**
- Cleans existing data to avoid conflicts
- Creates organization if it doesn't exist
- Two-phase creation (auth users first, then profiles)
- Proper foreign key relationship handling
- Comprehensive logging and error handling

### `export-updated-users.js`
Exports the current user data from the database to a JSON file for reference.

**Usage:**
```bash
node scripts/export-updated-users.js
```

**Output:** Creates `sample-data/03-users-updated.json` with actual database IDs.

### `create-contact-auth-users.js`
Creates auth.users entries for contacts (customers and suppliers) from the contacts sample data. This script:
1. Creates users in Supabase auth.users table only
2. Uses the same IDs as in the contacts table
3. Sets appropriate roles based on contact type (customer/supplier)
4. Uses the default password: `FactoryPulse@2025`

**Usage:**
```bash
node scripts/create-contact-auth-users.js
```

**Features:**
- Preserves contact IDs for consistency
- Sets user metadata with contact information
- Assigns roles based on contact type
- Comprehensive logging and error handling

## User Credentials

### Internal Users
All internal users are created with the temporary password: `TempPassword123!`

### Contact Users (Customers/Suppliers)
All contact users are created with the password: `FactoryPulse@2025`

Users should reset their passwords on first login.

## User Hierarchy

The system includes the following organizational structure:

- **CEO**: Nguyễn Quang Minh (ceo@factorypulse.vn)
  - **Operations Manager**: Trần Ngọc Hương (operations@factorypulse.vn)
    - Senior Engineer: Phạm Văn Dũng
    - Mechanical Engineer: Hoàng Thị Lan
    - Electrical Engineer: Vũ Đình Nam
    - Production Supervisor: Trịnh Văn Sơn
    - Team Lead: Lý Thị Mai
    - Project Coordinator: Phan Thị Kim
  - **Quality Manager**: Lê Viết Tuấn (quality@factorypulse.vn)
    - QA Engineer: Ngô Thị Hà
    - Quality Inspector: Đặng Văn Hùng
  - **Sales Manager**: Bùi Thị Thu (sales.manager@factorypulse.vn)
    - Customer Service Rep: Nguyễn Thị Hoa
  - **Procurement Specialist**: Lê Văn Phúc (procurement@factorypulse.vn)
  - **System Administrator**: Võ Đình Tài (admin@factorypulse.vn)

## Database Tables

### auth.users
- Supabase authentication table
- Contains login credentials and basic auth metadata

### users
- Extended user profile table
- Contains business information, roles, departments, and relationships
- References auth.users via foreign key

## Notes

- All users belong to organization: Factory Pulse Vietnam (550e8400-e29b-41d4-a716-446655440001)
- User roles: admin, management, sales, engineering, qa, production, procurement
- Direct manager relationships are properly maintained
- Vietnamese names and company structure reflect the local context