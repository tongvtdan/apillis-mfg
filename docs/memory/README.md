# Development Memory Directory

This directory contains structured development memory files following the `[feature][timestamp].md` naming convention.

## File Naming Convention

Format: `[feature][YYYYMMDDHHMM].md`

Examples:
- `[user-auth][202501151430].md`
- `[database-optimization][202501142200].md`
- `[workflow-stages][202501131015].md`

## Memory File Structure

Each memory file must include:

1. **Date & Time**: Current timestamp when memory was created
2. **Feature/Context**: What feature or issue this memory addresses
3. **Problem/Situation**: What led to this work
4. **Solution/Changes**: What was implemented or changed
5. **Technical Details**: Code changes, database updates, architecture decisions
6. **Files Modified**: List of all files affected
7. **Challenges**: Any obstacles encountered and how they were overcome
8. **Results**: Outcome and verification of the solution
9. **Future Considerations**: Any follow-up work or monitoring needed

## Guidelines

- Create individual memory files for each significant feature or fix
- Use descriptive feature names in square brackets
- Include full timestamp for chronological ordering
- Archive memories monthly when folder approaches 500 lines total
- Keep the most recent 3 months easily accessible

## Current Memory Files

- `[database-project-fixes][202509060702].md` - Database schema and project display fixes

For more information, see `../project-rules.md` for the complete project guidelines.
