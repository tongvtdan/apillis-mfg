# Users Table Migration: Convert to use Supabase Auth user_id

This migration converts the `users` table from using a separate auto-generated `id` column to using the Supabase Auth `user_id` as the primary key. This ensures consistency across the application and eliminates the need for email-based lookups.

## Overview

**Before Migration:**
- Users table had its own `id` column (UUID, auto-generated)
- No connection to Supabase Auth user IDs
- Profile lookups required email-based queries

**After Migration:**
- Users table uses Supabase Auth `user_id` as primary key (renamed to `id`)
- Direct connection between auth system and application users
- Profile lookups use user ID for better performance and consistency

**Why This Approach?**
- **Simpler**: Direct column replacement instead of complex multi-step process
- **Safer**: Fewer steps reduce risk of errors
- **Efficient**: Single column operation instead of add → populate → drop → rename

## Files Created

1. **`scripts/migrate-users-to-user-id.sql`** - Manual migration script
2. **`scripts/get-supabase-auth-users.sql`** - Helper script to get auth user IDs
3. **`scripts/migrate-users.js`** - Automated migration script (Node.js)
4. **`scripts/README-migration.md`** - This documentation

## Prerequisites

1. **Supabase Service Role Key**: Required for the automated script
2. **Database Access**: Admin access to run migrations
3. **Backup**: Ensure you have a backup of your database
4. **Environment Variables**: Set up required environment variables

## Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Alternative names
SUPABASE_URL=https://your-project.supabase.co
```

## Migration Process

### Option 1: Automated Migration (Recommended)

1. **Install dependencies** (if not already installed):
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. **Run the migration script**:
   ```bash
   node scripts/migrate-users.js
   ```

3. **Review the generated SQL**:
   - Check `scripts/generated-migration.sql`
   - Verify all user mappings are correct

4. **Run the migration in your database**:
   ```bash
   # Using Supabase CLI
   supabase db reset
   
   # Or manually in Supabase SQL editor
   # Copy and paste the generated SQL
   ```

### Option 2: Manual Migration

1. **Get Supabase Auth User IDs**:
   - Run `scripts/get-supabase-auth-users.sql` in Supabase SQL editor
   - Note down the user IDs for each email

2. **Update the mapping in the migration script**:
   - Edit `scripts/migrate-users-to-user-id.sql`
   - Replace `REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID` with actual IDs

3. **Run the migration step by step**:
   - Execute each section of the SQL script
   - Verify each step before proceeding

## Step-by-Step Migration

### Step 1: Backup
```sql
CREATE TABLE users_backup AS SELECT * FROM users;
```

### Step 2: Add user_id column
```sql
ALTER TABLE users ADD COLUMN user_id UUID;
```

### Step 3: Create mapping table
```sql
CREATE TABLE email_to_user_id_mapping (
    email VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 4: Populate mapping
```sql
INSERT INTO email_to_user_id_mapping (email, user_id) VALUES
    ('ceo@factorypulse.vn', 'actual-auth-user-id-here'),
    ('operations@factorypulse.vn', 'actual-auth-user-id-here');
    -- ... add all users
```

### Step 5: Update user_id column
```sql
UPDATE users 
SET user_id = mapping.user_id
FROM email_to_user_id_mapping mapping
WHERE users.email = mapping.email;
```

### Step 6: Verify mapping
```sql
SELECT email, name, user_id 
FROM users 
WHERE user_id IS NULL;
```

### Step 7: Add constraints
```sql
ALTER TABLE users ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_user_id_unique UNIQUE (user_id);
```

### Step 8: Handle foreign keys
```sql
-- Update direct_manager_id references
UPDATE users 
SET direct_manager_id = mapping.user_id
FROM email_to_user_id_mapping mapping
WHERE users.direct_manager_id = mapping.user_id;
```

### Step 9: Convert primary key
```sql
ALTER TABLE users DROP CONSTRAINT users_pkey;
ALTER TABLE users DROP COLUMN id;
ALTER TABLE users RENAME COLUMN user_id TO id;
ALTER TABLE users ADD PRIMARY KEY (id);
```

### Step 10: Update indexes and constraints
```sql
-- Recreate indexes and foreign key constraints
-- (See the full migration script for details)
```

## Verification

After migration, verify:

1. **Table structure**:
   ```sql
   \d users
   ```

2. **Data integrity**:
   ```sql
   SELECT COUNT(*) as total_users FROM users;
   SELECT role, COUNT(*) FROM users GROUP BY role;
   ```

3. **Foreign key relationships**:
   ```sql
   SELECT u1.name, u2.name as manager
   FROM users u1
   LEFT JOIN users u2 ON u1.direct_manager_id = u2.id;
   ```

## Rollback

If something goes wrong:

```sql
-- Restore from backup
DROP TABLE users;
ALTER TABLE users_backup RENAME TO users;
ALTER TABLE users ADD PRIMARY KEY (id);
```

## Post-Migration Tasks

1. **Update AuthContext**: Already done - now uses `user.id` instead of email
2. **Test authentication**: Verify login/logout works correctly
3. **Test user management**: Ensure admin functions work
4. **Update any hardcoded user IDs**: Check for any hardcoded references

## Benefits

1. **Consistency**: User IDs are the same across auth and application
2. **Performance**: Direct ID lookups instead of email queries
3. **Reliability**: No risk of email changes breaking user associations
4. **Scalability**: Better performance with large user bases
5. **Security**: Direct ID-based access control

## Troubleshooting

### Common Issues

1. **Missing Auth Users**: Some application users don't have corresponding auth accounts
   - Solution: Create auth users manually or programmatically

2. **Foreign Key Violations**: References to old user IDs
   - Solution: Update all foreign key references before dropping the old column

3. **Permission Errors**: Insufficient database privileges
   - Solution: Use service role key or ensure proper database permissions

### Getting Help

1. Check the generated SQL for syntax errors
2. Verify all user mappings are correct
3. Ensure database has proper permissions
4. Check Supabase logs for detailed error messages

## Support

If you encounter issues during migration:

1. Check the generated migration SQL
2. Verify environment variables are set correctly
3. Ensure you have the necessary database permissions
4. Review the rollback instructions if needed
