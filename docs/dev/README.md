# Development Tools and Resources

This directory contains various development tools, tests, and debugging utilities for the Factory Pulse project.

## Directory Structure

- [debug/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/debug/) - Debugging scripts and utilities
- [tests/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tests/) - Test files and testing utilities
- [tools/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tools/) - Development tools, fix scripts, and utilities
- [scripts/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/scripts/) - Development scripts
- [backups/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/backups/) - Database backup files and scripts
- [data/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/data/) - Sample data files
- [docs/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/docs/) - Development documentation
- [temp/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/temp/) - Temporary files (not tracked in git)

## File Organization Policy

As of September 2025, all debug, test, and fix files should be organized as follows:

- Debug files → [docs/dev/debug/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/debug/)
- Test files → [docs/dev/tests/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tests/)
- Fix files → [docs/dev/tools/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tools/)
- Setup files → [docs/dev/tools/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tools/)
- Development scripts → [docs/dev/scripts/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/scripts/)

This organization helps keep the project root clean and makes it easier to find development resources.

## Recent Cleanup (September 12, 2025)

The following files were moved from the project root to this organized structure:

### Debug Files
- [debug_document_saving.js](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/debug/debug_document_saving.js) → [docs/dev/debug/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/debug/)
- [debug_documents_table.sql](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/debug/debug_documents_table.sql) → [docs/dev/debug/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/debug/)

### Test Files
- [test_debug_utilities.js](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tests/test_debug_utilities.js) → [docs/dev/tests/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tests/)
- [test_document_preview.js](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tests/test_document_preview.js) → [docs/dev/tests/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tests/)
- [test_pdf_preview_fix.js](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tests/test_pdf_preview_fix.js) → [docs/dev/tests/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tests/)
- [test_upload_fix.js](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tests/test_upload_fix.js) → [docs/dev/tests/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tests/)

### Fix and Setup Files
- [fix_storage_provider.sql](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tools/fix_storage_provider.sql) → [docs/dev/tools/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tools/)
- [setup_storage_bucket.js](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tools/setup_storage_bucket.js) → [docs/dev/tools/](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/docs/dev/tools/)

## Guidelines

- All files in this directory are for development support only
- Files here should not be part of the production application
- Use descriptive filenames with timestamps when relevant
- Clean up temporary files regularly
- Document any scripts or tools added to this directory

## File Naming Convention

- Use descriptive names with timestamps: `feature-description-purpose-YYYYMMDD.md`
- Example: `user-auth-debug-session-20250115.md`

For more information, see `../project-rules.md` for the complete project guidelines.
