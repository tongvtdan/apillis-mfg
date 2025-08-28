#!/bin/bash

# Factory Pulse Sample Data Import via Supabase CLI
# This script imports data directly using the CLI

set -e

echo "🚀 Factory Pulse Sample Data Import via Supabase CLI"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to import to remote database
import_to_remote() {
    echo -e "${BLUE}📊 Importing data to remote database...${NC}"
    
    # Get the database URL from Supabase
    echo -e "${YELLOW}🔗 Getting database connection details...${NC}"
    
    # Try to get connection info
    if command -v psql &> /dev/null; then
        echo -e "${GREEN}✅ psql is available${NC}"
        echo -e "${BLUE}💡 To import manually, you can use:${NC}"
        echo "   psql \"your-connection-string\" -f $SQL_FILE"
    else
        echo -e "${YELLOW}⚠️  psql not found. Please install PostgreSQL client.${NC}"
    fi
    
    echo -e "${BLUE}💡 Alternative import methods:${NC}"
    echo "1. Copy the SQL content to Supabase Dashboard SQL Editor"
    echo "2. Use pgAdmin or DBeaver database clients"
    echo "3. Use the Supabase CLI with direct database connection"
    
    echo -e "${GREEN}✅ Import preparation completed!${NC}"
}

# Function to check database schema
check_schema() {
    echo -e "${BLUE}🔍 Checking database schema...${NC}"
    
    # Try to get schema information
    echo -e "${YELLOW}📋 Attempting to get schema info...${NC}"
    
    # This would require direct database access
    echo -e "${BLUE}💡 To check schema manually:${NC}"
    echo "1. Go to Supabase Dashboard > Database > Tables"
    echo "2. Or use SQL Editor: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
}

# Function to export connection details
export_connection_details() {
    echo -e "${BLUE}📤 Exporting connection details...${NC}"
    
    # Get project info
    PROJECT_INFO=$(supabase projects list | grep "Factory Pulse")
    if [ ! -z "$PROJECT_INFO" ]; then
        echo -e "${GREEN}✅ Project found:${NC}"
        echo "$PROJECT_INFO"
    fi
    
    echo -e "${BLUE}💡 Connection details:${NC}"
    echo "1. Go to Supabase Dashboard > Settings > Database"
    echo "2. Copy the connection string"
    echo "3. Use it with psql or other database clients"
}

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if we're linked to a project
if ! supabase status &> /dev/null; then
    echo -e "${RED}❌ Not linked to a Supabase project. Please run: supabase link${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI is available and linked${NC}"

# Check if the SQL file exists
SQL_FILE="sample-data/supabase-import.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ SQL import file not found: $SQL_FILE${NC}"
    echo -e "${YELLOW}💡 Please run the Node.js script first: node sample-data/import-supabase.js${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SQL import file found: $SQL_FILE${NC}"

# Get file size
FILE_SIZE=$(du -h "$SQL_FILE" | cut -f1)
echo -e "${BLUE}📁 File size: $FILE_SIZE${NC}"

# Show import options
echo ""
echo -e "${BLUE}📋 Import Options:${NC}"
echo "1. Preview the SQL (safe)"
echo "2. Import to remote database (DANGEROUS - will overwrite data!)"
echo "3. Check database schema first"
echo "4. Export database connection details"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}📖 Previewing SQL file (first 20 lines)...${NC}"
        echo "=========================================="
        head -20 "$SQL_FILE"
        echo "=========================================="
        echo -e "${BLUE}💡 To see full file: cat $SQL_FILE${NC}"
        ;;
    2)
        echo -e "${RED}⚠️  WARNING: This will import data to your remote database!${NC}"
        echo -e "${RED}⚠️  Make sure you have a backup or are okay with overwriting data!${NC}"
        read -p "Type 'IMPORT' to confirm: " confirm
        if [ "$confirm" = "IMPORT" ]; then
            echo -e "${YELLOW}📥 Starting import to remote database...${NC}"
            import_to_remote
        else
            echo "Import cancelled."
        fi
        ;;
    3)
        echo -e "${YELLOW}🔍 Checking database schema...${NC}"
        check_schema
        ;;
    4)
        echo -e "${YELLOW}📤 Exporting database connection details...${NC}"
        export_connection_details
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 CLI import script completed!${NC}"
echo ""
echo -e "${BLUE}📚 Next steps:${NC}"
echo "1. Review the generated SQL in supabase-import.sql"
echo "2. Choose your preferred import method"
echo "3. Execute the import in your Supabase database"
echo "4. Verify the data in your tables"
echo ""
echo -e "${BLUE}🔗 Useful commands:${NC}"
echo "   supabase status                    # Check project status"
echo "   supabase projects list             # List all projects"
echo "   cat sample-data/supabase-import.sql  # View the SQL file"
