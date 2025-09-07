# Database Functions Comparison: refresh_dashboard_materialized_views vs get_dashboard_summary

**Date:** January 17, 2025  
**Analysis:** Comparison of two database functions for dashboard data management

## Function Overview

### 1. `refresh_dashboard_materialized_views()`

**Purpose:** Refreshes materialized views for dashboard performance optimization

**Location:** `supabase/migrations/20250117000004_performance_optimizations.sql` (lines 368-403)

**Function Type:** Maintenance/Performance Function

**Return Type:** `void`

**Key Characteristics:**
- Refreshes materialized views using `REFRESH MATERIALIZED VIEW CONCURRENTLY`
- Logs refresh activity to `activity_log` table
- Designed for scheduled execution (every 5 minutes)
- Performance optimization function

**Current Status:** 
- Only `mv_user_workload` materialized view exists
- Other materialized views (`mv_project_dashboard_summary`, `mv_workflow_efficiency`, `mv_approval_performance`) are commented out due to EXTRACT function issues

### 2. `get_dashboard_summary()`

**Purpose:** Returns real-time dashboard summary data for frontend consumption

**Location:** `supabase/migrations/20250117000006_add_dashboard_summary_function.sql` (lines 6-159)

**Function Type:** Data Retrieval Function

**Return Type:** `JSON`

**Key Characteristics:**
- Returns comprehensive project statistics in JSON format
- User-aware (uses `auth.uid()` for organization filtering)
- Real-time data aggregation
- Frontend API function

## Detailed Comparison

### Function Signatures

```sql
-- refresh_dashboard_materialized_views
CREATE OR REPLACE FUNCTION refresh_dashboard_materialized_views()
RETURNS void AS $$

-- get_dashboard_summary  
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSON AS $$
```

### Data Sources

| Function                               | Data Source        | Update Frequency  |
| -------------------------------------- | ------------------ | ----------------- |
| `refresh_dashboard_materialized_views` | Materialized Views | Scheduled (5 min) |
| `get_dashboard_summary`                | Live Tables        | Real-time         |

### Return Data Structure

#### refresh_dashboard_materialized_views
- **Return:** `void`
- **Side Effect:** Refreshes materialized views
- **Logging:** Creates activity log entry

#### get_dashboard_summary
- **Return:** JSON object with structure:
```json
{
  "projects": {
    "total": 7,
    "by_status": {
      "inquiry": 4,
      "reviewing": 2,
      "quoted": 0,
      "confirmed": 0,
      "procurement": 0,
      "production": 0,
      "completed": 1,
      "cancelled": 0
    },
    "by_type": {
      "system_build": 2,
      "fabrication": 1,
      "manufacturing": 3
    },
    "by_priority": {
      "low": 1,
      "normal": 3,
      "high": 2,
      "urgent": 1
    },
    "by_stage": {
      "Inquiry Received": 2,
      "Supplier RFQ Sent": 1,
      "Technical Review": 1,
      "no_stage": 3
    }
  },
  "recent_projects": [...],
  "generated_at": 1757251453.740610,
  "debug": {
    "organization_id": "550e8400-e29b-41d4-a716-446655440000",
    "query_timestamp": "2025-09-07T13:24:13.74061+00:00"
  }
}
```

## Test Results

### Test Environment
- **Database:** Local Supabase instance
- **Organization:** Apillis (550e8400-e29b-41d4-a716-446655440000)
- **Test Data:** 7 projects with various statuses, priorities, and types

### refresh_dashboard_materialized_views Results
```sql
-- Function executed successfully
SELECT refresh_dashboard_materialized_views();
-- Result: void (no return value)
-- Side effect: Refreshed mv_user_workload materialized view
-- Logged activity in activity_log table
```

### get_dashboard_summary Results
```sql
-- Function returned comprehensive JSON data
SELECT get_dashboard_summary_test('550e8400-e29b-41d4-a716-446655440000');
-- Result: Detailed JSON with project statistics and recent projects
```

### Materialized View Content (mv_user_workload)
```
| user_id                              | organization_id                      | user_name  | role  | assigned_projects | assigned_sub_stages | active_sub_stages | completed_sub_stages | pending_approvals | requested_approvals | last_activity                 |
| ------------------------------------ | ------------------------------------ | ---------- | ----- | ----------------- | ------------------- | ----------------- | -------------------- | ----------------- | ------------------- | ----------------------------- |
| 660e8400-e29b-41d4-a716-446655440010 | 550e8400-e29b-41d4-a716-446655440000 | Bui Thi H  | qa    | 0                 | 0                   | 0                 | 0                    | 0                 | 0                   | 1970-01-01 00:00:00+00        |
| 660e8400-e29b-41d4-a716-446655440006 | 550e8400-e29b-41d4-a716-446655440000 | Pham Thi D | sales | 2                 | 2                   | 1                 | 1                    | 0                 | 0                   | 2025-09-07 12:32:22.381159+00 |
```

## Key Differences

### 1. **Purpose & Usage**
- **refresh_dashboard_materialized_views:** Background maintenance function
- **get_dashboard_summary:** Frontend API function

### 2. **Data Freshness**
- **refresh_dashboard_materialized_views:** Pre-computed data (5-minute refresh cycle)
- **get_dashboard_summary:** Real-time data aggregation

### 3. **Performance**
- **refresh_dashboard_materialized_views:** Fast reads from materialized views
- **get_dashboard_summary:** Slower due to real-time aggregation

### 4. **Data Scope**
- **refresh_dashboard_materialized_views:** User workload metrics only (currently)
- **get_dashboard_summary:** Comprehensive project statistics

### 5. **Authentication**
- **refresh_dashboard_materialized_views:** System function (no auth required)
- **get_dashboard_summary:** User-aware (requires authentication)

## Recommendations

### 1. **Materialized Views Implementation**
The commented-out materialized views should be implemented to provide better performance:
- `mv_project_dashboard_summary`
- `mv_workflow_efficiency` 
- `mv_approval_performance`

### 2. **Function Usage**
- Use `refresh_dashboard_materialized_views()` for scheduled background maintenance
- Use `get_dashboard_summary()` for real-time frontend data requests

### 3. **Performance Optimization**
Consider creating a hybrid approach:
- Use materialized views for frequently accessed data
- Use real-time queries for dynamic/real-time requirements

### 4. **Monitoring**
Both functions should be monitored for:
- Execution time
- Error rates
- Data accuracy

## Current Issues

1. **Materialized Views:** Most materialized views are commented out due to EXTRACT function issues
2. **Authentication:** `get_dashboard_summary()` requires proper authentication context
3. **Data Consistency:** Need to ensure materialized views are refreshed regularly

## Conclusion

Both functions serve different but complementary purposes in the dashboard system:
- `refresh_dashboard_materialized_views()` optimizes performance through pre-computed views
- `get_dashboard_summary()` provides real-time, user-specific data

The ideal implementation would use both functions together for optimal performance and data freshness.
