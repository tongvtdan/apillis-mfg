# Factory Pulse - Project Rules & Guidelines

## Overview
This document outlines the comprehensive rules and guidelines for the Factory Pulse project development. It combines existing project practices with new organizational requirements for development files and memory management.

## 1. Development File Organization

### 1.1 Development Support Files (`docs/dev/`)
All files, scripts, and resources that support development, testing, bug fixes, or debugging—but are not part of the main project code—must be created in the `docs/dev/` folder.

**Required Structure:**
```
docs/dev/
├── scripts/          # Development scripts, build tools, utilities
├── tests/           # Test files, test data, test utilities
├── debug/           # Debug logs, error analysis, troubleshooting files
├── temp/            # Temporary files, work-in-progress, experiments
├── tools/           # Development tools, linters, formatters
├── docs/            # Development documentation, guides, tutorials
├── backups/         # Database backups and backup documentation
└── data/            # Sample data files and seed data documentation
```

**Examples of files that belong in `docs/dev/`:**
- Test scripts and test data files
- Bug fix analysis documents
- Debug output logs
- Temporary database dumps for testing
- Development utility scripts
- Performance profiling results
- Error reproduction scripts
- Database backup files and summaries
- Development documentation and guides

**File Naming Convention:**
- Use descriptive names with timestamps when relevant
- Format: `feature-description-purpose-YYYYMMDD.md`
- Example: `user-auth-debug-session-20250115.md`

### 1.2 Main Project Code Organization
Files that are part of the core application functionality should remain in their appropriate locations:
- `src/` - Application source code
- `supabase/` - Database migrations and configuration
- `public/` - Static assets
- `scripts/` - Production/deployment scripts (not development support)

## 2. Memory Management System

### 2.1 Memory File Structure (`docs/memory/`)
All development memory and documentation must be saved in separate files within the `docs/memory/` folder using the specified naming convention.

**Required Structure:**
```
docs/memory/
├── feature-timestamp.md    # Individual feature memories
├── bugfix-timestamp.md     # Bug fix memories
├── refactor-timestamp.md   # Refactoring memories
└── research-timestamp.md   # Research and investigation memories
```

**File Naming Convention:**
- Format: `feature-YYYYMMDDHHMM.md`
- Use square brackets for feature identification
- Include full timestamp for chronological ordering
- Examples:
  - `user-auth-202501151430.md`
  - `database-optimization-202501142200.md`
  - `workflow-stages-202501131015.md`

### 2.2 Memory Content Guidelines
Each memory file must include:

**Required Sections:**
1. **Date & Time**: Current timestamp when memory was created
2. **Feature/Context**: What feature or issue this memory addresses
3. **Problem/Situation**: What led to this work
4. **Solution/Changes**: What was implemented or changed
5. **Technical Details**: Code changes, database updates, architecture decisions
6. **Files Modified**: List of all files affected
7. **Challenges**: Any obstacles encountered and how they were overcome
8. **Results**: Outcome and verification of the solution
9. **Future Considerations**: Any follow-up work or monitoring needed

**Example Memory File Structure:**
```markdown
# user-auth-202501151430 - User Authentication Enhancement

## Context
Enhanced user authentication system with improved security and user experience.

## Problem
Users were experiencing session timeout issues during long workflows.

## Solution
Implemented token refresh mechanism and improved session management.

## Technical Details
- Updated AuthContext with automatic token refresh
- Added session persistence layer
- Enhanced error handling for network failures

## Files Modified
- `src/contexts/AuthContext.tsx`
- `src/services/authService.ts`
- `src/hooks/useAuth.ts`

## Challenges
- Handling race conditions during token refresh
- Maintaining backward compatibility with existing sessions

## Results
- Session timeout issues resolved
- Improved user experience during long sessions
- No breaking changes to existing functionality
```

### 2.3 Memory Archival
- Archive memories monthly when the `docs/memory/` folder approaches 500 lines total
- Create monthly archive files: `memory-archive-YYYY-MM.md`
- Maintain chronological order within archives
- Keep the most recent 3 months of memories easily accessible

## 3. Documentation Discipline

### 3.1 Task Flow via `docs/todo.md`
- Maintain `docs/todo.md` with context-rich entries
- Format: `[status] priority: description [context]`
- Status options: `[ ]`, `[WIP]`, `[blocked]`, `[done]`
- Include files, functions, APIs, and error details in context
- Mark `[done]` only after explicit confirmation
- Move completed items to "Recently Completed" section with dates

### 3.2 Documentation Updates
After completing significant code changes, automatically update:

**Database Changes:**
- Update schema section in `docs/architecture.md`
- Generate data flow diagrams
- Document new relationships and constraints

**API/Endpoint Changes:**
- Update API section in `docs/architecture.md`
- Document request/response formats
- Update authentication requirements

**Architecture Changes:**
- Update `docs/architecture.md` with current state
- Generate Mermaid diagrams for data flows
- Document new patterns and architectural decisions

**New Features:**
- Create dedicated subfolder under `docs/` for feature documentation
- Include usage guides, API documentation, and examples
- Update main feature list in `docs/feature-list.md`

### 3.3 Decision Documentation
- Record significant decisions in `docs/decisions.md`
- Include context, options considered, and rationale
- Document trade-offs and future considerations
- Flag architectural choices that may need future review

## 4. Code Quality Standards

### 4.1 File Size & Complexity
- Keep files under 300 lines of code (LOC)
- Maintain cognitive complexity ≤ 15
- Break down large functions into smaller, focused functions
- Use single-responsibility principle for all components

### 4.2 Code Patterns
- Use functional/declarative patterns over classes when possible
- Implement explicit function names with JSDoc/docstrings
- Handle errors early with guard clauses
- Avoid deeply nested conditional statements
- Prefer interfaces over types for better documentation

### 4.3 Defensive Programming
- Validate external inputs at module boundaries
- Document assumptions explicitly in code
- Treat failure paths as first-class citizens
- Return meaningful errors or safe fallbacks
- Use TypeScript strict mode when applicable

## 5. Development Workflow

### 5.1 Single-threaded Focus
- Work on one todo item and one open PR at a time
- Think through ripple effects before making changes
- Use "Write tests first, then code, then run tests until they pass" for complex features

### 5.2 Investigation Before Implementation
- Search codebase for existing solutions before coding new ones
- Check `docs/architecture.md` for current patterns
- Review `MEMORY.md` and `docs/decisions.md` for past choices
- Prefer small, incremental fixes over large changes

### 5.3 Git Commit Messages
- Generate summary of changed files and updated files for commit messages
- Include feature context and impact in commit descriptions
- Reference related issues or tasks when applicable

## 6. Database & Data Management

### 6.1 Migration Practices
- Never reset entire database when working with existing data
- Use targeted migrations for schema changes
- Preserve existing IDs to maintain referential integrity
- Work with local Supabase only unless explicitly configured for remote

### 6.2 Data Safety
- Always ask for approval before performing database actions
- Only run specified migration scripts, not others without approval
- Prefer SQL scripts or queries that can be run manually in Supabase UI
- Document all database changes in memory files

## 7. Security & Performance

### 7.1 Dependency Management
- Vet each new dependency thoroughly
- Pin critical dependency versions
- Never commit secrets; use environment variables
- Scan with security tools pre-commit

### 7.2 Performance Guidelines
- Implement proper indexing for database queries
- Use memoization for expensive computations
- Optimize bundle size and loading times
- Monitor and document performance improvements

## 8. AI Collaboration Best Practices

### 8.1 Communication Guidelines
- When uncertain about implementation (< 80% sure), ask clarifying questions
- Reference specific files with `@filename` when discussing changes
- Include exact error messages and file locations in prompts
- Use "Plan first, then implement" for multi-file changes

### 8.2 Context Sharing
- Provide complete context when requesting changes
- Include relevant code snippets or file references
- Specify expected outcomes and success criteria
- Document any constraints or requirements

## 9. Automation Rules

After completing any significant code change, automatically:

1. **Update Task Status**: Mark todo items as `[done]` after explicit confirmation
2. **Log Discoveries**: Add important findings to memory files using current date/time
3. **Update Documentation**: Modify `docs/architecture.md` if structure/API/schema changed
4. **Record Decisions**: Add entries to `docs/decisions.md` for architectural choices
5. **Generate Diagrams**: Create/update Mermaid diagrams when data flows change significantly

## 10. Tool Integration

### 10.1 Preferred Tools
- Use ripgrep (`rg`) for fast, accurate code searches
- Leverage codebase search for semantic understanding
- Utilize go-to-definition for symbol navigation
- Prefer file search for locating files by fuzzy matching

### 10.2 Development Environment
- Maintain consistent development environment across team
- Document environment setup and dependencies
- Use version control for environment configurations
- Keep development tools updated and documented

## Implementation Checklist

- [x] Create `docs/dev/` directory structure
- [x] Create `docs/memory/` directory
- [x] Move test files from `src/test/` to `docs/dev/tests/`
- [x] Move backup files to `docs/dev/backups/`
- [x] Move development documentation to `docs/dev/docs/`
- [x] Move sample data documentation to `docs/dev/data/`
- [x] Create `docs/project-rules.md` with comprehensive guidelines
- [x] Convert existing memory to new format
- [ ] Update any references to moved files
- [ ] Update .gitignore if needed
- [ ] Update CI/CD configurations

## Migration Plan

### Phase 1: Directory Creation ✅
- Create `docs/dev/` with subdirectories
- Create `docs/memory/` directory
- Set up initial file structure

### Phase 2: File Migration ✅
- Move existing development support files to `docs/dev/`
- Convert current memory format to new structured approach
- Update all documentation references

### Phase 3: Process Integration
- Update development workflows to use new structure
- Integrate with existing automation scripts
- Train team on new processes

### Phase 4: Monitoring & Optimization
- Monitor adoption of new structure
- Gather feedback and make adjustments
- Optimize directory structure based on usage patterns
