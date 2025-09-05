#!/bin/bash

# Factory Pulse - Delete Unassigned Projects Script Wrapper
# 
# This script provides a convenient way to run the delete-unassigned-projects.js script
# with proper safety checks and user guidance.
#
# Usage:
#   ./delete-unassigned-projects.sh [options]
#
# Options:
#   --dry-run    Show what would be deleted without actually deleting
#   --confirm    Skip confirmation prompt (use with caution)
#   --limit=N    Limit deletion to N projects (default: no limit)
#   --backup     Create backup before deletion (recommended)
#   --sql-only   Show SQL commands for manual execution in Supabase UI
#   --help       Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to display help
show_help() {
    echo "Factory Pulse - Delete Unassigned Projects Script"
    echo "================================================="
    echo ""
    echo "This script deletes projects where assigned_to is NULL."
    echo ""
    echo "Usage:"
    echo "  $0 [options]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be deleted without actually deleting"
    echo "  --confirm    Skip confirmation prompt (use with caution)"
    echo "  --limit=N    Limit deletion to N projects (default: no limit)"
    echo "  --backup     Create backup before deletion (recommended)"
    echo "  --sql-only   Show SQL commands for manual execution in Supabase UI"
    echo "  --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --dry-run --backup                    # Safe preview with backup"
    echo "  $0 --confirm --backup --limit=5         # Delete 5 projects with backup"
    echo "  $0 --sql-only                           # Show SQL for manual execution"
    echo ""
    echo "Safety Notes:"
    echo "  - Always use --dry-run first to preview changes"
    echo "  - Use --backup to create a backup before deletion"
    echo "  - Start with --limit=N for small batches"
    echo "  - Use --sql-only to run commands manually in Supabase UI"
}

# Function to check if Supabase is running
check_supabase() {
    if ! command -v supabase &> /dev/null; then
        echo -e "${RED}❌ Error: Supabase CLI not found${NC}"
        echo "   Please install Supabase CLI: https://supabase.com/docs/guides/cli"
        exit 1
    fi
    
    if ! supabase status > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: Supabase is not running locally${NC}"
        echo "   Please start Supabase with: supabase start"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Supabase is running locally${NC}"
}

# Function to show SQL commands
show_sql_commands() {
    echo -e "${BLUE}📋 SQL Commands for Manual Execution${NC}"
    echo "=========================================="
    echo ""
    echo "1. First, run this query to see what will be deleted:"
    echo ""
    echo "   SELECT COUNT(*) as total_unassigned_projects"
    echo "   FROM projects WHERE assigned_to IS NULL;"
    echo ""
    echo "2. To see detailed list of unassigned projects:"
    echo ""
    echo "   SELECT id, project_id, title, status, created_at"
    echo "   FROM projects WHERE assigned_to IS NULL"
    echo "   ORDER BY created_at DESC;"
    echo ""
    echo "3. To delete all unassigned projects:"
    echo ""
    echo "   DELETE FROM projects WHERE assigned_to IS NULL;"
    echo ""
    echo "4. To delete only cancelled/completed unassigned projects (safer):"
    echo ""
    echo "   DELETE FROM projects"
    echo "   WHERE assigned_to IS NULL"
    echo "   AND status IN ('cancelled', 'completed');"
    echo ""
    echo "5. To delete with a limit (for testing):"
    echo ""
    echo "   DELETE FROM projects"
    echo "   WHERE assigned_to IS NULL"
    echo "   AND id IN ("
    echo "       SELECT id FROM projects"
    echo "       WHERE assigned_to IS NULL"
    echo "       ORDER BY created_at ASC"
    echo "       LIMIT 5"
    echo "   );"
    echo ""
    echo -e "${YELLOW}⚠️  Important Notes:${NC}"
    echo "   - Run the SELECT queries first to preview changes"
    echo "   - Consider creating a backup before deletion"
    echo "   - Start with small batches using LIMIT"
    echo "   - Most related tables have ON DELETE CASCADE"
    echo ""
    echo "📄 For complete SQL script, see: $SCRIPT_DIR/delete-unassigned-projects.sql"
}

# Function to run the Node.js script
run_node_script() {
    local args=()
    
    # Convert bash arguments to Node.js script arguments
    for arg in "$@"; do
        case $arg in
            --dry-run|--confirm|--backup|--verbose)
                args+=("$arg")
                ;;
            --limit=*)
                args+=("$arg")
                ;;
        esac
    done
    
    # Check if Node.js script exists
    if [ ! -f "$SCRIPT_DIR/delete-unassigned-projects.js" ]; then
        echo -e "${RED}❌ Error: Node.js script not found${NC}"
        echo "   Expected: $SCRIPT_DIR/delete-unassigned-projects.js"
        exit 1
    fi
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Error: Node.js not found${NC}"
        echo "   Please install Node.js: https://nodejs.org/"
        exit 1
    fi
    
    # Run the Node.js script
    echo -e "${BLUE}🚀 Running Node.js script...${NC}"
    cd "$PROJECT_ROOT"
    node "$SCRIPT_DIR/delete-unassigned-projects.js" "${args[@]}"
}

# Main execution
main() {
    echo -e "${BLUE}🏭 Factory Pulse - Delete Unassigned Projects${NC}"
    echo "====================================================="
    
    # Parse arguments
    local sql_only=false
    local args=()
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --sql-only)
                sql_only=true
                shift
                ;;
            --dry-run|--confirm|--backup|--verbose)
                args+=("$1")
                shift
                ;;
            --limit=*)
                args+=("$1")
                shift
                ;;
            *)
                echo -e "${RED}❌ Unknown option: $1${NC}"
                echo "   Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Handle SQL-only mode
    if [ "$sql_only" = true ]; then
        show_sql_commands
        exit 0
    fi
    
    # Check prerequisites
    check_supabase
    
    # Run the Node.js script
    run_node_script "${args[@]}"
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}⚠️  Script interrupted by user${NC}"; exit 130' INT

# Run main function
main "$@"
