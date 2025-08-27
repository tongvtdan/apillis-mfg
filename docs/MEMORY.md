# Factory Pulse Development Memory

## 2025-01-27 - Database Schema Revision & Improvements

### Work Done
- **Comprehensive database schema revision** to align with PRD requirements
- **Standardized UUID generation** from mixed `gen_random_uuid()` vs `uuid_generate_v4()` to consistent `uuid_generate_v4()`
- **Separated project status from workflow stages** - added `status` field (active/delayed/cancelled) distinct from `current_stage` (workflow step)
- **Enhanced document versioning** - replaced parent-child model with dedicated `document_versions` table
- **Simplified messaging system** - removed complex `message_recipients` table, unified with thread-based messaging
- **Added Vietnam & Southeast Asia localization** - default country 'Vietnam', VND currency, expanded currency support
- **Improved AI & automation extensibility** - centralized AI processing in `ai_processing_queue` table
- **Enhanced multi-tenancy** - enforced `organization_id` on all core tables for SaaS readiness
- **Updated timestamp format** - standardized to `TIMESTAMPTZ` for consistency

### Challenges ➜ Solutions
1. **Mixed UUID generation methods** ➜ Standardized all tables to use `uuid_generate_v4()` for consistency
2. **Confused project status vs workflow stages** ➜ Added separate `status` field with clear lifecycle states
3. **Complex document versioning** ➜ Created dedicated `document_versions` table for cleaner version history
4. **Overly complex messaging** ➜ Simplified to thread-based model with unified `thread_id`
5. **Missing localization support** ➜ Added Vietnam defaults and expanded currency/language support
6. **Scattered AI fields** ➜ Centralized in dedicated AI processing queue table

### Files Modified
- `docs/database-schema.md` - Complete revision with improvements table, updated schema, and summary
- `docs/database-selection-items.md` - Converted to enum types structure with PostgreSQL ENUM types and usage guidelines

### Architecture Impact
- **Database structure** - Improved normalization and consistency
- **Multi-tenancy** - Enhanced SaaS readiness with organization isolation
- **Workflow management** - Clearer separation of project lifecycle vs workflow progression
- **Document management** - Better version control and audit trail
- **Internationalization** - Ready for Vietnam and Southeast Asia markets

### Next Steps
- Update migration files to reflect new schema changes
- Implement new document versioning system in application code
- Add Vietnam/SEA localization features to UI
- Test multi-tenancy isolation with new organization_id constraints
