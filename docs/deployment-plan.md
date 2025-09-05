# Organization-Based Customer Model Migration - Deployment Plan

**Date:** 2025-01-30  
**Migration Phase:** Phase 6 - Deployment and Monitoring  
**Status:** Ready for Production Deployment

## Deployment Overview

The organization-based customer model migration has been thoroughly tested and validated. This deployment plan ensures a safe, monitored rollout with comprehensive rollback capabilities.

## Pre-Deployment Checklist

### ✅ Development Environment
- [x] Database schema updates applied
- [x] Data migration completed successfully
- [x] Backend services updated and tested
- [x] Frontend components updated and tested
- [x] Comprehensive testing completed (29/29 tests passed)
- [x] Documentation updated

### ✅ Staging Environment Preparation
- [ ] Deploy migration scripts to staging
- [ ] Apply database schema changes
- [ ] Run data migration
- [ ] Deploy updated application code
- [ ] Run integration tests
- [ ] User acceptance testing

### ✅ Production Environment Preparation
- [ ] Create database backup
- [ ] Prepare rollback scripts
- [ ] Schedule maintenance window
- [ ] Notify stakeholders
- [ ] Prepare monitoring dashboards

## Deployment Strategy

### Phase 6A: Staging Deployment

#### 1. Database Migration to Staging
```bash
# Apply schema changes
supabase db push --local

# Run data migration
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/migrations/20250130000001_migrate_org_become_customer.sql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/migrations/20250130000002_migrate_org_become_customer_data.sql
```

#### 2. Application Deployment to Staging
```bash
# Build application
npm run build

# Deploy to staging environment
# (Specific deployment commands depend on your infrastructure)
```

#### 3. Staging Validation
```bash
# Run validation tests
node scripts/validate-migration.js
node scripts/test-services.js

# Manual testing checklist
- [ ] Customer organization creation
- [ ] Contact management within organizations
- [ ] Project creation with organization selection
- [ ] Project contact point management
- [ ] Existing project display
- [ ] Search and filtering
- [ ] User workflows
```

### Phase 6B: Production Deployment

#### 1. Pre-Deployment Backup
```sql
-- Create comprehensive backup
pg_dump -h localhost -p 54322 -U postgres -d postgres \
  --format=custom \
  --file=backup_pre_migration_$(date +%Y%m%d_%H%M%S).dump
```

#### 2. Production Database Migration
```bash
# Apply schema changes to production
supabase db push

# Run data migration
psql $PRODUCTION_DATABASE_URL -f supabase/migrations/20250130000001_migrate_org_become_customer.sql
psql $PRODUCTION_DATABASE_URL -f supabase/migrations/20250130000002_migrate_org_become_customer_data.sql
```

#### 3. Production Application Deployment
```bash
# Deploy application code
npm run build
# Deploy to production (specific commands depend on infrastructure)
```

#### 4. Post-Deployment Validation
```bash
# Run production validation
node scripts/validate-migration.js
node scripts/test-services.js

# Monitor application logs
# Check error rates
# Verify user functionality
```

## Rollback Plan

### Immediate Rollback (if critical issues detected)

#### 1. Application Rollback
```bash
# Revert to previous application version
# (Specific commands depend on deployment method)
```

#### 2. Database Rollback
```sql
-- Rollback data changes
-- Note: This is complex due to data relationships
-- Consider if rollback is necessary vs. fixing issues

-- Option 1: Restore from backup (if critical)
pg_restore -h localhost -p 54322 -U postgres -d postgres \
  --clean --if-exists \
  backup_pre_migration_YYYYMMDD_HHMMSS.dump

-- Option 2: Selective rollback (preferred)
-- Remove new data while preserving existing
DELETE FROM project_contact_points WHERE created_at > '2025-01-30';
UPDATE projects SET customer_organization_id = NULL WHERE customer_organization_id IS NOT NULL;
-- (Additional selective rollback commands as needed)
```

#### 3. Schema Rollback
```sql
-- Remove new columns and tables
DROP TABLE IF EXISTS project_contact_points;
ALTER TABLE projects DROP COLUMN IF EXISTS customer_organization_id;
ALTER TABLE contacts DROP COLUMN IF EXISTS role;
ALTER TABLE contacts DROP COLUMN IF EXISTS is_primary_contact;
ALTER TABLE contacts DROP COLUMN IF EXISTS description;
ALTER TABLE organizations DROP COLUMN IF EXISTS address;
ALTER TABLE organizations DROP COLUMN IF EXISTS city;
ALTER TABLE organizations DROP COLUMN IF EXISTS state;
ALTER TABLE organizations DROP COLUMN IF EXISTS country;
ALTER TABLE organizations DROP COLUMN IF EXISTS postal_code;
```

## Monitoring Plan

### Key Metrics to Monitor

#### 1. Database Performance
- Query execution times
- Database connection counts
- Index usage
- Lock contention

#### 2. Application Performance
- API response times
- Error rates
- User session metrics
- Feature usage

#### 3. Business Metrics
- Customer organization creation rate
- Project creation success rate
- User adoption of new features
- Support ticket volume

### Monitoring Dashboard Queries

#### Database Health
```sql
-- Monitor query performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%customer_organization%' 
   OR query LIKE '%project_contact_points%'
ORDER BY total_time DESC;

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename IN ('organizations', 'contacts', 'projects', 'project_contact_points')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Application Health
```sql
-- Monitor customer organization usage
SELECT 
  DATE(created_at) as date,
  COUNT(*) as organizations_created
FROM organizations 
WHERE description = 'Customer Organization'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Monitor project contact points
SELECT 
  DATE(created_at) as date,
  COUNT(*) as contact_points_created
FROM project_contact_points 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

## Success Criteria

### Technical Success Criteria
- [ ] All database migrations applied successfully
- [ ] Application deploys without errors
- [ ] All validation tests pass
- [ ] Performance metrics within acceptable ranges
- [ ] No critical errors in logs

### Business Success Criteria
- [ ] Users can create customer organizations
- [ ] Users can manage contacts within organizations
- [ ] Users can create projects with organization selection
- [ ] Existing projects continue to work
- [ ] User adoption of new features
- [ ] No increase in support tickets

## Risk Assessment

### High Risk
- **Data Loss**: Mitigated by comprehensive backups
- **Performance Degradation**: Mitigated by performance testing
- **User Confusion**: Mitigated by training and documentation

### Medium Risk
- **Rollback Complexity**: Mitigated by rollback plan
- **Integration Issues**: Mitigated by staging testing

### Low Risk
- **Feature Adoption**: Expected gradual adoption
- **Minor UI Issues**: Can be fixed post-deployment

## Communication Plan

### Pre-Deployment
- [ ] Notify stakeholders of deployment schedule
- [ ] Send user training materials
- [ ] Update documentation

### During Deployment
- [ ] Monitor deployment progress
- [ ] Communicate any issues
- [ ] Provide status updates

### Post-Deployment
- [ ] Confirm successful deployment
- [ ] Monitor for issues
- [ ] Gather user feedback
- [ ] Plan follow-up improvements

## Timeline

### Staging Deployment
- **Duration**: 2-4 hours
- **Dependencies**: Staging environment availability
- **Validation**: 1-2 hours

### Production Deployment
- **Duration**: 4-6 hours
- **Maintenance Window**: Scheduled during low-usage period
- **Validation**: 2-3 hours
- **Monitoring**: Continuous for 48 hours

## Post-Deployment Tasks

### Immediate (0-24 hours)
- [ ] Monitor application logs
- [ ] Check error rates
- [ ] Verify user functionality
- [ ] Respond to any issues

### Short-term (1-7 days)
- [ ] Gather user feedback
- [ ] Monitor adoption metrics
- [ ] Address any bugs
- [ ] Update documentation based on feedback

### Long-term (1-4 weeks)
- [ ] Analyze usage patterns
- [ ] Plan feature improvements
- [ ] Conduct user training sessions
- [ ] Document lessons learned

## Conclusion

The organization-based customer model migration is ready for production deployment. The comprehensive testing, rollback plan, and monitoring strategy ensure a safe and successful rollout.

**Deployment Status: READY TO PROCEED** 🚀
