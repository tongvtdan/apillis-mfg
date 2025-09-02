# Activity Log Schema

## activity_log Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NOT NULL | Unique identifier |
| organization_id | uuid | NOT NULL | Organization the activity belongs to |
| user_id | uuid | NULL | User who performed the activity |
| entity_type | character varying(50) | NOT NULL | Type of entity (e.g., 'projects', 'users') |
| entity_id | uuid | NOT NULL | ID of the entity |
| project_id | uuid | NULL | Optional reference to the project for analytics |
| action | character varying(100) | NOT NULL | Type of action performed |
| description | text | NULL | Human-readable description |
| old_values | jsonb | NULL | Previous values of the entity |
| new_values | jsonb | NULL | New values of the entity |
| metadata | jsonb | NULL | Additional metadata |
| ip_address | inet | NULL | IP address of the user |
| user_agent | text | NULL | User agent string |
| created_at | timestamp with time zone | NULL | Timestamp when recorded |

### Project Analytics

With the addition of the `project_id` column, the activity log now provides enhanced analytics capabilities:

1. **Project Activity Tracking**: Direct linking of activities to projects
2. **Project Performance Analytics**: Analysis of project-related activities over time
3. **User Engagement by Project**: Understanding which users are most active on which projects
4. **Workflow Analysis**: Tracking project progression through workflow stages