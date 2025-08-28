## List of columns of tables on Supabase
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

