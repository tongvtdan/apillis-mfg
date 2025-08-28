## List of columns of tables on Supabase

### Table list

```text
| table_name                   | table_type | table_schema |
| ---------------------------- | ---------- | ------------ |
| activity_log                 | BASE TABLE | public       |
| ai_model_configs             | BASE TABLE | public       |
| ai_processing_queue          | BASE TABLE | public       |
| approval_chains              | BASE TABLE | public       |
| approval_requests            | BASE TABLE | public       |
| bom_items                    | BASE TABLE | public       |
| cloud_storage_integrations   | BASE TABLE | public       |
| contacts                     | BASE TABLE | public       |
| document_access_log          | BASE TABLE | public       |
| document_comments            | BASE TABLE | public       |
| document_sync_log            | BASE TABLE | public       |
| document_versions            | BASE TABLE | public       |
| documents                    | BASE TABLE | public       |
| email_templates              | BASE TABLE | public       |
| messages                     | BASE TABLE | public       |
| notifications                | BASE TABLE | public       |
| organization_settings        | BASE TABLE | public       |
| organizations                | BASE TABLE | public       |
| project_assignments          | BASE TABLE | public       |
| project_stage_history        | BASE TABLE | public       |
| projects                     | BASE TABLE | public       |
| review_checklist_items       | BASE TABLE | public       |
| reviews                      | BASE TABLE | public       |
| supplier_performance_metrics | BASE TABLE | public       |
| supplier_qualifications      | BASE TABLE | public       |
| supplier_quotes              | BASE TABLE | public       |
| supplier_rfqs                | BASE TABLE | public       |
| system_events                | BASE TABLE | public       |
| user_preferences             | BASE TABLE | public       |
| users                        | BASE TABLE | public       |
| users_backup                 | BASE TABLE | public       |
| workflow_business_rules      | BASE TABLE | public       |
| workflow_rule_executions     | BASE TABLE | public       |
| workflow_stage_transitions   | BASE TABLE | public       |
| workflow_stages              | BASE TABLE | public       |
```


---
## 0. `Authentication` users:
```text
| column_name                 | data_type                | is_nullable | column_default          |
| --------------------------- | ------------------------ | ----------- | ----------------------- |
| instance_id                 | uuid                     | YES         | null                    |
| id                          | uuid                     | NO          | null                    |
| aud                         | character varying        | YES         | null                    |
| role                        | character varying        | YES         | null                    |
| email                       | character varying        | YES         | null                    |
| encrypted_password          | character varying        | YES         | null                    |
| email_confirmed_at          | timestamp with time zone | YES         | null                    |
| invited_at                  | timestamp with time zone | YES         | null                    |
| confirmation_token          | character varying        | YES         | null                    |
| confirmation_sent_at        | timestamp with time zone | YES         | null                    |
| recovery_token              | character varying        | YES         | null                    |
| recovery_sent_at            | timestamp with time zone | YES         | null                    |
| email_change_token_new      | character varying        | YES         | null                    |
| email_change                | character varying        | YES         | null                    |
| email_change_sent_at        | timestamp with time zone | YES         | null                    |
| last_sign_in_at             | timestamp with time zone | YES         | null                    |
| raw_app_meta_data           | jsonb                    | YES         | null                    |
| raw_user_meta_data          | jsonb                    | YES         | null                    |
| is_super_admin              | boolean                  | YES         | null                    |
| created_at                  | timestamp with time zone | YES         | null                    |
| updated_at                  | timestamp with time zone | YES         | null                    |
| phone                       | text                     | YES         | NULL::character varying |
| phone_confirmed_at          | timestamp with time zone | YES         | null                    |
| phone_change                | text                     | YES         | ''::character varying   |
| phone_change_token          | character varying        | YES         | ''::character varying   |
| phone_change_sent_at        | timestamp with time zone | YES         | null                    |
| confirmed_at                | timestamp with time zone | YES         | null                    |
| email_change_token_current  | character varying        | YES         | ''::character varying   |
| email_change_confirm_status | smallint                 | YES         | 0                       |
| banned_until                | timestamp with time zone | YES         | null                    |
| reauthentication_token      | character varying        | YES         | ''::character varying   |
| reauthentication_sent_at    | timestamp with time zone | YES         | null                    |
| is_sso_user                 | boolean                  | NO          | false                   |
| deleted_at                  | timestamp with time zone | YES         | null                    |
| is_anonymous                | boolean                  | NO          | false                   |
```
---
## 1. `users` table
```text
| column_name       | data_type                | is_nullable | column_default              |
| ----------------- | ------------------------ | ----------- | --------------------------- |
| organization_id   | uuid                     | YES         | null                        |
| email             | character varying        | NO          | null                        |
| name              | character varying        | NO          | null                        |
| role              | character varying        | NO          | null                        |
| department        | character varying        | YES         | null                        |
| phone             | character varying        | YES         | null                        |
| avatar_url        | text                     | YES         | null                        |
| status            | character varying        | YES         | 'active'::character varying |
| description       | text                     | YES         | null                        |
| employee_id       | character varying        | YES         | null                        |
| direct_manager_id | uuid                     | YES         | null                        |
| direct_reports    | ARRAY                    | YES         | '{}'::uuid[]                |
| last_login_at     | timestamp with time zone | YES         | null                        |
| preferences       | jsonb                    | YES         | '{}'::jsonb                 |
| created_at        | timestamp with time zone | YES         | now()                       |
| updated_at        | timestamp with time zone | YES         | now()                       |
| id                | uuid                     | NO          | null                        |
```
---
## 2. `projects` table

```text
| column_name             | data_type                | is_nullable | column_default              |
| ----------------------- | ------------------------ | ----------- | --------------------------- |
| id                      | uuid                     | NO          | uuid_generate_v4()          |
| organization_id         | uuid                     | YES         | null                        |
| project_id              | character varying        | NO          | null                        |
| title                   | character varying        | NO          | null                        |
| description             | text                     | YES         | null                        |
| customer_id             | uuid                     | YES         | null                        |
| current_stage_id        | uuid                     | YES         | null                        |
| status                  | character varying        | NO          | 'active'::character varying |
| priority_score          | integer                  | YES         | 50                          |
| priority_level          | character varying        | YES         | 'medium'::character varying |
| estimated_value         | numeric                  | YES         | null                        |
| estimated_delivery_date | date                     | YES         | null                        |
| actual_delivery_date    | date                     | YES         | null                        |
| source                  | character varying        | YES         | 'manual'::character varying |
| tags                    | ARRAY                    | YES         | '{}'::text[]                |
| metadata                | jsonb                    | YES         | '{}'::jsonb                 |
| created_at              | timestamp with time zone | YES         | now()                       |
| updated_at              | timestamp with time zone | YES         | now()                       |
| created_by              | uuid                     | YES         | null                        |
| assigned_to             | uuid                     | YES         | null                        |
```
---
## 3. `organizations` table
```text
| column_name       | data_type                | is_nullable | column_default               |
| ----------------- | ------------------------ | ----------- | ---------------------------- |
| id                | uuid                     | NO          | uuid_generate_v4()           |
| name              | character varying        | NO          | null                         |
| slug              | character varying        | NO          | null                         |
| domain            | character varying        | YES         | null                         |
| logo_url          | text                     | YES         | null                         |
| description       | text                     | YES         | null                         |
| industry          | character varying        | YES         | null                         |
| settings          | jsonb                    | YES         | '{}'::jsonb                  |
| subscription_plan | character varying        | YES         | 'starter'::character varying |
| is_active         | boolean                  | YES         | true                         |
| created_at        | timestamp with time zone | YES         | now()                        |
| updated_at        | timestamp with time zone | YES         | now()                        |
```

---
## 4. `contacts` table
```text
| column_name      | data_type                | is_nullable | column_default               |
| ---------------- | ------------------------ | ----------- | ---------------------------- |
| id               | uuid                     | NO          | uuid_generate_v4()           |
| organization_id  | uuid                     | YES         | null                         |
| type             | character varying        | NO          | null                         |
| company_name     | character varying        | NO          | null                         |
| contact_name     | character varying        | YES         | null                         |
| email            | character varying        | YES         | null                         |
| phone            | character varying        | YES         | null                         |
| address          | text                     | YES         | null                         |
| city             | character varying        | YES         | null                         |
| state            | character varying        | YES         | null                         |
| country          | character varying        | YES         | 'Vietnam'::character varying |
| postal_code      | character varying        | YES         | null                         |
| website          | character varying        | YES         | null                         |
| tax_id           | character varying        | YES         | null                         |
| payment_terms    | character varying        | YES         | null                         |
| credit_limit     | numeric                  | YES         | null                         |
| is_active        | boolean                  | YES         | true                         |
| notes            | text                     | YES         | null                         |
| metadata         | jsonb                    | YES         | '{}'::jsonb                  |
| ai_category      | jsonb                    | YES         | '{}'::jsonb                  |
| ai_capabilities  | jsonb                    | YES         | '[]'::jsonb                  |
| ai_risk_score    | numeric                  | YES         | null                         |
| ai_last_analyzed | timestamp with time zone | YES         | null                         |
| created_at       | timestamp with time zone | YES         | now()                        |
| updated_at       | timestamp with time zone | YES         | now()                        |
| created_by       | uuid                     | YES         | null                         |
```
---
## 5. `workflow_stages` table
```text
| column_name       | data_type                | is_nullable | column_default               |
| ----------------- | ------------------------ | ----------- | ---------------------------- |
| id                | uuid                     | NO          | uuid_generate_v4()           |
| organization_id   | uuid                     | YES         | null                         |
| name              | character varying        | NO          | null                         |
| slug              | character varying        | NO          | null                         |
| description       | text                     | YES         | null                         |
| color             | character varying        | YES         | '#6B7280'::character varying |
| stage_order       | integer                  | NO          | null                         |
| is_active         | boolean                  | YES         | true                         |
| exit_criteria     | text                     | YES         | null                         |
| responsible_roles | ARRAY                    | YES         | '{}'::text[]                 |
| created_at        | timestamp with time zone | YES         | now()                        |
| updated_at        | timestamp with time zone | YES         | now()                        |
```


## `activity_log` table
```text
| column_name     | data_type                | is_nullable | column_default     |
| --------------- | ------------------------ | ----------- | ------------------ |
| id              | uuid                     | NO          | uuid_generate_v4() |
| organization_id | uuid                     | YES         | null               |
| project_id      | uuid                     | YES         | null               |
| user_id         | uuid                     | YES         | null               |
| contact_id      | uuid                     | YES         | null               |
| action          | character varying        | NO          | null               |
| entity_type     | character varying        | NO          | null               |
| entity_id       | uuid                     | NO          | null               |
| old_values      | jsonb                    | YES         | null               |
| new_values      | jsonb                    | YES         | null               |
| ip_address      | inet                     | YES         | null               |
| user_agent      | text                     | YES         | null               |
| session_id      | character varying        | YES         | null               |
| created_at      | timestamp with time zone | YES         | now()              |
```