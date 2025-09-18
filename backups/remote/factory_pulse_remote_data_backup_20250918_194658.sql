SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '383b189e-acec-4989-94b3-a0267f4501bb', 'authenticated', 'authenticated', 'admin@apillis.com', '$2a$06$xIsgfqbG9w9vHM0Y79e.Jutxju7LUs4IVVFQyvqMLhRKaT3g89J/C', '2025-09-07 12:42:05.30059+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-16 12:39:58.876284+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-09-07 12:42:05.298026+00', '2025-09-16 12:39:58.883083+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('383b189e-acec-4989-94b3-a0267f4501bb', '383b189e-acec-4989-94b3-a0267f4501bb', '{"sub": "383b189e-acec-4989-94b3-a0267f4501bb", "email": "admin@apillis.com", "email_verified": false, "phone_verified": false}', 'email', '2025-09-07 12:42:05.29902+00', '2025-09-07 12:42:05.299055+00', '2025-09-07 12:42:05.299055+00', 'e567f63c-4679-4964-b375-5eaa7856e87e');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "organization_id", "email", "name", "role", "department", "phone", "avatar_url", "status", "description", "employee_id", "direct_manager_id", "direct_reports", "last_login_at", "preferences", "created_at", "updated_at") VALUES
	('383b189e-acec-4989-94b3-a0267f4501bb', '550e8400-e29b-41d4-a716-446655440000', 'admin@apillis.com', 'Admin User', 'admin', 'IT', NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-07 12:45:00.097891+00', '2025-09-07 12:45:00.097891+00');


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organizations" ("id", "name", "slug", "description", "industry", "address", "city", "state", "country", "postal_code", "website", "logo_url", "organization_type", "is_active", "created_at", "updated_at", "default_currency", "tax_id", "payment_terms", "timezone", "metadata", "created_by") VALUES
	('550e8400-e29b-41d4-a716-446655440000', 'Apillis', 'apillis', 'Leading manufacturing technology company', 'Technology', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'internal', true, '2023-09-07 11:25:25.470919+00', '2025-09-18 11:01:19.861648+00', 'USD', NULL, NULL, 'UTC', '{}', NULL);


--
-- Data for Name: workflow_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: workflow_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: approval_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: approval_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: custom_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: document_access_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: document_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: document_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: feature_toggles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: permission_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: workflow_sub_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: project_sub_stage_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: supplier_performance_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: supplier_qualification_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: supplier_qualifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: supplier_rfqs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: supplier_quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_custom_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_feature_access; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: workflow_definition_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: workflow_definition_sub_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('rfq-attachments', 'rfq-attachments', NULL, '2025-08-22 00:36:27.915622+00', '2025-08-22 00:36:27.915622+00', false, false, 52428800, '{image/jpeg,image/png,image/gif,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip,application/x-zip-compressed,model/step,model/iges,application/octet-stream}', NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('fcd7adb0-542f-4b78-99b7-b80c1df1a4f1', 'rfq-attachments', 'temp/1755823715154_cs9rvgkf6v.png', '5dc17cbb-4b76-41c1-a292-d1f1b9ca2e2a', '2025-08-22 00:48:36.327981+00', '2025-08-22 00:48:37.424337+00', '2025-08-22 00:48:36.327981+00', '{"eTag": "\"e9ea0eebf0d79538a4318a4089d10412\"", "size": 43048, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-22T00:48:37.000Z", "contentLength": 43048, "httpStatusCode": 200}', '709b4f43-8c25-47b6-8204-91ae8f6184b9', '5dc17cbb-4b76-41c1-a292-d1f1b9ca2e2a', '{}', 2);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('rfq-attachments', 'temp', '2025-08-22 00:48:37.417119+00', '2025-08-22 00:48:37.417119+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 133, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
