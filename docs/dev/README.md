# Development Files Directory

This directory contains all development support files and resources that are not part of the main application code.

## Directory Structure

### `backups/`
Database backup files and backup documentation
- SQL dump files for schema and data restoration
- Backup summary reports with timestamps
- Restore instructions and metadata

### `data/`
Sample data files and seed data documentation
- Database seed data files
- Data import instructions
- Sample data structure documentation

### `docs/`
Development documentation and guides
- API documentation
- Development tool guides
- Troubleshooting guides
- Development best practices

### `scripts/`
Development utility scripts
- Build scripts
- Deployment helpers
- Database management scripts
- Development automation tools

### `tests/`
Test files and testing infrastructure
- Unit tests
- Integration tests
- End-to-end tests
- Test utilities and mocks
- Test configuration files

### `debug/`
Debug logs and troubleshooting files
- Error logs
- Debug output files
- Performance profiling results
- Issue reproduction scripts

### `temp/`
Temporary files and work-in-progress
- Experimental code
- Work-in-progress features
- Temporary data files
- Development artifacts

### `tools/`
Development tools and utilities
- Linters and formatters
- Development scripts
- Build tools
- Code quality tools

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
