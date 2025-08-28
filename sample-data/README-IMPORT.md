# 🚀 Factory Pulse Sample Data Import Guide

This guide explains how to import the sample data to your Supabase database using various methods.

## 📁 Files Generated

- **`supabase-import.sql`** - Complete SQL import script (250 records, 10 tables)
- **`import-supabase.js`** - Node.js script to regenerate the SQL file
- **`import-via-cli.sh`** - Bash script for CLI-based import options
- **`import-to-supabase.sh`** - Comprehensive import script with multiple options

## 🎯 Import Methods

### **Method 1: Supabase Dashboard (Recommended for Beginners)**

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your "Factory Pulse" project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Import the Data**
   - Copy the entire content of `supabase-import.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Verify Import**
   - Go to "Database" > "Tables" to see your data
   - Check that all 10 tables have data

### **Method 2: Using psql Command Line**

1. **Get Database Connection String**
   - Go to Supabase Dashboard > Settings > Database
   - Copy the connection string

2. **Install PostgreSQL Client** (if not already installed)
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   ```

3. **Import Data**
   ```bash
   psql "your-connection-string" -f sample-data/supabase-import.sql
   ```

### **Method 3: Using Database Clients**

#### **pgAdmin**
1. Open pgAdmin
2. Connect to your Supabase database
3. Open Query Tool
4. Copy and paste the SQL content
5. Execute the query

#### **DBeaver**
1. Open DBeaver
2. Connect to your Supabase database
3. Open SQL Editor
4. Copy and paste the SQL content
5. Execute the script

### **Method 4: Using the Import Scripts**

#### **Node.js Script (Regenerate SQL)**
```bash
# Generate the SQL import file
node sample-data/import-supabase.js
```

#### **CLI Import Script**
```bash
# Run the CLI-based import options
./sample-data/import-via-cli.sh
```

#### **Comprehensive Import Script**
```bash
# Run the comprehensive import script
./sample-data/import-to-supabase.sh
```

## 📊 Data Overview

The sample data includes:

| Table               | Records | Description                     |
| ------------------- | ------- | ------------------------------- |
| **organizations**   | 1       | Factory Pulse organization      |
| **workflow-stages** | 8       | Project workflow stages         |
| **users**           | 15      | System users and roles          |
| **contacts**        | 20      | Customers and suppliers         |
| **projects**        | 17      | Manufacturing projects          |
| **documents**       | 38      | Project documents and files     |
| **reviews**         | 25      | Quality and engineering reviews |
| **messages**        | 25      | Internal communication          |
| **notifications**   | 34      | System notifications            |
| **activity-log**    | 67      | User activity audit trail       |

**Total: 250 records across 10 tables**

## 🔧 Prerequisites

### **Required Tools**
- Supabase CLI (already installed)
- Node.js (for script generation)
- PostgreSQL client (optional, for command line import)

### **Project Setup**
- Supabase project created and linked
- Database schema ready
- Proper permissions configured

## ⚠️ Important Notes

### **Before Importing**
1. **Backup your database** if you have existing data
2. **Check your schema** matches the expected table structure
3. **Verify permissions** for the tables you're importing to

### **Data Relationships**
- All data maintains referential integrity
- UUIDs follow consistent pattern: `550e8400-e29b-41d4-a716-44665544xxxx`
- Foreign keys reference existing records

### **Post-Import Verification**
1. Check record counts in each table
2. Verify foreign key relationships
3. Test application functionality
4. Review data quality and consistency

## 🚨 Troubleshooting

### **Common Issues**

#### **Permission Denied**
- Check your database user permissions
- Verify RLS policies are configured correctly
- Ensure you have INSERT privileges on all tables

#### **Foreign Key Violations**
- Import tables in the correct order (organizations → users → contacts → projects → others)
- Check that referenced records exist before importing dependent data

#### **Data Type Mismatches**
- Verify your schema matches the expected data types
- Check for any custom constraints or validations

#### **Import Timeout**
- Break large imports into smaller chunks
- Use the Supabase Dashboard for large datasets
- Consider using the CLI for better control

### **Getting Help**

1. **Check Supabase Logs**
   - Go to Dashboard > Logs
   - Look for any error messages

2. **Verify Schema**
   - Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
   - Check table structures match expected schema

3. **Test Small Import**
   - Try importing just one table first
   - Verify it works before importing everything

## 🔄 Regenerating Data

If you need to regenerate the sample data:

```bash
# Regenerate the SQL file
node sample-data/import-supabase.js

# This will create a new supabase-import.sql file
# with the latest data from your JSON files
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Import/Export Guide](https://www.postgresql.org/docs/current/app-psql.html)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

## 🎉 Success Checklist

After importing, verify:

- [ ] All 10 tables have data
- [ ] Total record count is 250
- [ ] Foreign key relationships work
- [ ] Application can read the data
- [ ] No error messages in logs
- [ ] Data quality looks correct

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase logs and error messages
3. Verify your database schema matches expectations
4. Test with a small subset of data first

---

**Happy importing! 🚀**

Your Factory Pulse application should now have rich, realistic sample data to work with.
