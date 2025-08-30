# Factory Pulse - Scripts Directory

This directory contains utility scripts for managing the Factory Pulse application.

## Available Scripts

### 1. Create Auth Users Script (`create-auth-users.js`)

**Purpose**: Creates Supabase authentication users with matching UUIDs for the sample data users.

**What it does**:
- Reads user data from `sample-data/03-users.json`
- Creates Supabase auth users with the same UUIDs
- Updates the `users` table to link profiles with auth users
- Maintains referential integrity across the system

**Prerequisites**:
- Local Supabase instance running
- Sample data already imported to database
- Proper environment variables configured

**Usage**:
```bash
# Using npm script (recommended)
npm run create:auth-users

# Direct execution
node scripts/create-auth-users.js

# With custom options
node scripts/create-auth-users.js --password=MySecurePass123 --email-domain=example.com

# Dry run (see what would be created without making changes)
node scripts/create-auth-users.js --dry-run
```

**Command Line Options**:
- `--password=PASSWORD`: Set custom password for all users (default: "FactoryPulse2025!")
- `--email-domain=DOMAIN`: Set email domain for users without domains (default: "factorypulse.vn")
- `--dry-run`: Preview changes without executing them
- `--help`: Show help information

**Environment Variables Required**:
```bash
# In .env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# OR
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Output**:
- Console output showing progress and results
- JSON results file with detailed creation status
- Error handling for failed operations

**Example Output**:
```
🚀 Factory Pulse - Auth Users Creation Script
============================================================
📧 Email Domain: factorypulse.vn
🔑 Default Password: FactoryPulse2025!
🌐 Supabase URL: http://127.0.0.1:54321

📋 Loading sample users data...
✅ Loaded 16 users from sample data

👤 Processing user: Nguyễn Quang Minh (management)
  ✅ Created auth user: ceo@factorypulse.vn (550e8400-e29b-41d4-a716-446655440002)
  ✅ Updated user profile: 550e8400-e29b-41d4-a716-446655440002 with auth user ID: 550e8400-e29b-41d4-a716-446655440002

📊 Summary
============================================================
✅ Successful: 16
❌ Errors: 0
📝 Total: 16

✅ Successfully created users:
  - Nguyễn Quang Minh (ceo@factorypulse.vn) - management
  - Trần Ngọc Hương (operations@factorypulse.vn) - management
  ...

📄 Detailed results saved to: auth-users-creation-2025-01-30T10-30-45-000Z.json
```

### 2. Migrate Users Script (`migrate-users.js`)

**Purpose**: Migrates existing user data to new schema structures.

**Usage**:
```bash
npm run migrate:users
```

## Script Development Guidelines

### Adding New Scripts

1. **Create the script file** in the `scripts/` directory
2. **Add npm script entry** in `package.json` for easy execution
3. **Document the script** in this README
4. **Include proper error handling** and logging
5. **Support dry-run mode** for testing
6. **Use environment variables** for configuration

### Script Structure

```javascript
#!/usr/bin/env node

/**
 * Script Name - Brief Description
 * 
 * Detailed description of what the script does
 * 
 * Usage: node scripts/script-name.js [options]
 */

// Imports and configuration
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
  // Default options
};

// Main functions
async function mainFunction() {
  // Implementation
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Main execution
if (require.main === module) {
  mainFunction().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

// Export for testing
module.exports = { mainFunction };
```

### Best Practices

1. **Environment Safety**: Always check for required environment variables
2. **Dry Run Mode**: Include `--dry-run` flag for testing
3. **Comprehensive Logging**: Use emojis and clear status messages
4. **Error Handling**: Catch and report errors gracefully
5. **Results Export**: Save detailed results to files for analysis
6. **Help Documentation**: Include `--help` flag with usage examples
7. **Type Safety**: Use JSDoc comments for better IDE support

## Troubleshooting

### Common Issues

1. **Environment Variables Missing**
   - Ensure `.env.local` file exists and contains required keys
   - Check that Supabase service role key is properly set

2. **Supabase Connection Issues**
   - Verify local Supabase instance is running
   - Check ports in `supabase/config.toml`
   - Ensure database is accessible

3. **Permission Issues**
   - Make sure script has execute permissions: `chmod +x scripts/script-name.js`
   - Check file ownership and permissions

4. **Sample Data Issues**
   - Verify sample data files exist and are valid JSON
   - Check that database schema matches expected structure

### Getting Help

- Run scripts with `--help` flag for usage information
- Check console output for detailed error messages
- Review generated results files for operation status
- Ensure all prerequisites are met before running scripts
