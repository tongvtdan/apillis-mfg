# Scripts Directory

This directory contains utility scripts for data management and database operations.

## Available Scripts

### Organization Seeding

**seed-organizations.js** - Seeds sample organization data into the database

```bash
# Seed organizations (safe - won't overwrite existing data)
npm run seed:organizations

# Force seed organizations (overwrites existing data)
npm run seed:organizations:force

# Or run directly with bun/node
bun run scripts/seed-organizations.js
node scripts/seed-organizations.js --force
```

**Requirements:**
- Local Supabase instance running
- Environment variables configured in `.env.local`:
  - `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Features:**
- Checks for existing data before seeding
- Uses `--force` flag to overwrite existing organizations
- Provides detailed logging and error handling
- Validates environment configuration

### Other Scripts

- **migrate-users.js** - User migration script
- **import-projects.js** - Import sample project data
- **reset-admin-password.js** - Reset admin password
- **test-admin-signin.js** - Test admin authentication

## Usage Notes

- All scripts use ES modules (type: "module" in package.json)
- Scripts connect to local Supabase by default
- Use service role key for administrative operations
- Always backup data before running destructive operations