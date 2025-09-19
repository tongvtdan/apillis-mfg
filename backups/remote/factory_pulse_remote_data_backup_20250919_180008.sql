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

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '4a8b462e-9999-428d-81a7-d49320f443c8', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"admin@apillis.com","user_id":"383b189e-acec-4989-94b3-a0267f4501bb","user_phone":""}}', '2025-09-19 07:54:20.789871+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a3fab9a-8d0d-4bd3-bf52-f109995d5727', '{"action":"user_signedup","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-19 07:57:36.766647+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a66e9867-3479-4b18-af5b-3357f9d64cf0', '{"action":"login","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 07:57:36.777981+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad533d6b-b049-4208-ad74-55996f35bae4', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@apillis.com","user_id":"383b189e-acec-4989-94b3-a0267f4501bb","user_phone":""}}', '2025-09-19 08:00:40.36429+00', ''),
	('00000000-0000-0000-0000-000000000000', '8deff7dc-d72a-42bb-89d7-5e67e45b6088', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@apillis.com","user_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","user_phone":""}}', '2025-09-19 08:00:41.938219+00', ''),
	('00000000-0000-0000-0000-000000000000', '0490a409-effa-4b83-8575-8462dde2dba3', '{"action":"logout","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-19 08:08:41.584853+00', ''),
	('00000000-0000-0000-0000-000000000000', '6cdcac2c-3fb4-41d0-b5da-0eee76d7f877', '{"action":"login","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 08:09:28.354927+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ed0897d-bffc-48b4-beaa-01f31117afde', '{"action":"user_signedup","actor_id":"f221e843-e64c-4b27-8406-3d0c1ea7a2b5","actor_username":"phuocbnah@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-19 08:11:43.635784+00', ''),
	('00000000-0000-0000-0000-000000000000', '7d3334df-11ba-47b7-8136-82e1d3df8676', '{"action":"login","actor_id":"f221e843-e64c-4b27-8406-3d0c1ea7a2b5","actor_username":"phuocbnah@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 08:11:43.642953+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f5fafba6-454a-4967-8b8c-b7751aadb19b', '{"action":"token_refreshed","actor_id":"f221e843-e64c-4b27-8406-3d0c1ea7a2b5","actor_username":"phuocbnah@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 09:11:58.400763+00', ''),
	('00000000-0000-0000-0000-000000000000', '6caa7e9e-c597-4cb9-8f79-c1285465fe61', '{"action":"token_revoked","actor_id":"f221e843-e64c-4b27-8406-3d0c1ea7a2b5","actor_username":"phuocbnah@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 09:11:58.425506+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f2caa9ae-c597-4ecd-bb8a-0a2f3cb22023', '{"action":"logout","actor_id":"f221e843-e64c-4b27-8406-3d0c1ea7a2b5","actor_username":"phuocbnah@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-19 09:12:02.505175+00', ''),
	('00000000-0000-0000-0000-000000000000', '089300fb-73e5-4fb1-bc41-f44d0f2ff783', '{"action":"token_refreshed","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 09:27:50.530068+00', ''),
	('00000000-0000-0000-0000-000000000000', '8f692e29-5a1c-42dc-9312-72e8adc02190', '{"action":"token_revoked","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 09:27:50.535532+00', ''),
	('00000000-0000-0000-0000-000000000000', '72703d14-105c-42a2-adbd-9d3ba9b1ffa8', '{"action":"logout","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-19 09:27:52.400028+00', ''),
	('00000000-0000-0000-0000-000000000000', '07f9dd88-92d4-4a28-b0a8-077529b52057', '{"action":"login","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 10:50:32.316096+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', 'authenticated', 'authenticated', 'phuocbnah@apillis.com', '$2a$10$X7QDp32aENVslwqtFxtTJeVVDoau8vj/UJKpiIc6vc3hPyxLxNwhy', '2025-09-19 08:11:43.637237+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-19 08:11:43.643616+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f221e843-e64c-4b27-8406-3d0c1ea7a2b5", "email": "phuocbnah@apillis.com", "display_name": "phuoc", "email_verified": true, "phone_verified": false}', NULL, '2025-09-19 08:11:43.610631+00', '2025-09-19 09:11:58.464137+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'authenticated', 'authenticated', 'dantong@apillis.com', '$2a$10$9akVViKsVn1NwxD.nte54.I2nQ9u.xGcY2A4F607WBgEWSAZ6dE0q', '2025-09-19 07:57:36.768612+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-19 08:09:28.365833+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "815c6978-8e4f-425d-9b20-6318d6eb88ca", "email": "dantong@apillis.com", "display_name": "Dan Tong", "email_verified": true, "phone_verified": false}', NULL, '2025-09-19 07:57:36.73901+00', '2025-09-19 09:27:50.542936+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f469d228-de9d-43fb-bac5-0a493a6e4099', 'authenticated', 'authenticated', 'admin@apillis.com', '$2a$10$LXQOrE0jD8uMsmLQUDBlTuMcz80dPm4nOSRf3AT61Du83P76NGvmC', '2025-09-19 08:00:41.940154+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-19 10:50:32.328043+00', '{"provider": "email", "providers": ["email"]}', '{"name": "Admin User", "email_verified": true}', NULL, '2025-09-19 08:00:41.936003+00', '2025-09-19 10:50:32.353203+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('815c6978-8e4f-425d-9b20-6318d6eb88ca', '815c6978-8e4f-425d-9b20-6318d6eb88ca', '{"sub": "815c6978-8e4f-425d-9b20-6318d6eb88ca", "email": "dantong@apillis.com", "display_name": "Dan Tong", "email_verified": false, "phone_verified": false}', 'email', '2025-09-19 07:57:36.754369+00', '2025-09-19 07:57:36.754424+00', '2025-09-19 07:57:36.754424+00', '9a6c20ea-ec30-45b9-881a-f1bd0f3ddf96'),
	('f469d228-de9d-43fb-bac5-0a493a6e4099', 'f469d228-de9d-43fb-bac5-0a493a6e4099', '{"sub": "f469d228-de9d-43fb-bac5-0a493a6e4099", "email": "admin@apillis.com", "email_verified": false, "phone_verified": false}', 'email', '2025-09-19 08:00:41.937302+00', '2025-09-19 08:00:41.93735+00', '2025-09-19 08:00:41.93735+00', 'd6f8c83c-c162-4970-95db-9d448df89b0e'),
	('f221e843-e64c-4b27-8406-3d0c1ea7a2b5', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', '{"sub": "f221e843-e64c-4b27-8406-3d0c1ea7a2b5", "email": "phuocbnah@apillis.com", "display_name": "phuoc", "email_verified": false, "phone_verified": false}', 'email', '2025-09-19 08:11:43.622089+00', '2025-09-19 08:11:43.622146+00', '2025-09-19 08:11:43.622146+00', '77efe895-e14f-4642-8212-ae43d89bbd56');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('fb168dd8-70cf-4d26-a27c-1b5b0a6c0988', 'f469d228-de9d-43fb-bac5-0a493a6e4099', '2025-09-19 10:50:32.328143+00', '2025-09-19 10:50:32.328143+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '171.250.164.68', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('fb168dd8-70cf-4d26-a27c-1b5b0a6c0988', '2025-09-19 10:50:32.355299+00', '2025-09-19 10:50:32.355299+00', 'password', '98544e7d-90f0-4749-bd17-9b38b7d2aad4');


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

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 139, '5dhf42tx6tr5', 'f469d228-de9d-43fb-bac5-0a493a6e4099', false, '2025-09-19 10:50:32.33991+00', '2025-09-19 10:50:32.33991+00', NULL, 'fb168dd8-70cf-4d26-a27c-1b5b0a6c0988');


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
	('815c6978-8e4f-425d-9b20-6318d6eb88ca', '550e8400-e29b-41d4-a716-446655440000', 'dantong@apillis.com', 'Dan Tong', 'admin', 'Management', NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 07:57:39.288236+00', '2025-09-19 08:00:17.16104+00'),
	('f469d228-de9d-43fb-bac5-0a493a6e4099', '550e8400-e29b-41d4-a716-446655440000', 'admin@apillis.com', 'Admin User', 'management', 'IT', NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 08:00:42.049+00', '2025-09-19 08:09:58.980434+00'),
	('f221e843-e64c-4b27-8406-3d0c1ea7a2b5', '550e8400-e29b-41d4-a716-446655440000', 'phuocbnah@apillis.com', 'phuoc', 'engineering', 'Engineering', NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 08:11:44.429039+00', '2025-09-19 08:17:18.848146+00');


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

INSERT INTO "public"."activity_log" ("id", "organization_id", "user_id", "project_id", "entity_type", "entity_id", "action", "description", "old_values", "new_values", "ip_address", "user_agent", "metadata", "created_at") VALUES
	('3cb8a198-0601-45a4-bdb6-dd081a987992', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-19T08:08:38.890Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-19 08:08:40.413096+00'),
	('5a4de1fc-b909-466f-a8f8-f1a76f35f8ca', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', 'f469d228-de9d-43fb-bac5-0a493a6e4099', 'role_change', NULL, '{"role": "admin"}', '{"role": "management"}', NULL, NULL, '{}', '2025-09-19 08:09:59.306611+00'),
	('8445ab8d-3195-42fd-9140-f6fe99aaf9ec', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', 'role_change', NULL, '{"role": "sales"}', '{"role": "engineering"}', NULL, NULL, '{}', '2025-09-19 08:16:16.978233+00'),
	('75cd431c-1137-4dbb-a887-aaabfe832666', '550e8400-e29b-41d4-a716-446655440000', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', NULL, 'user', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-19T09:11:58.087Z"}, "success": true}', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-19 09:11:59.7233+00'),
	('2cc387f3-6db6-421f-a4b0-f483103aace4', '550e8400-e29b-41d4-a716-446655440000', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', NULL, 'user', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-19T09:11:58.081Z"}, "success": true}', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-19 09:11:59.726304+00'),
	('badc88f0-3ad3-445b-b20d-3daa7903b874', '550e8400-e29b-41d4-a716-446655440000', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', NULL, 'user', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-19T09:11:58.087Z"}, "success": true}', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-19 09:11:59.766563+00'),
	('80adcc11-6f86-4d51-8acb-dae22de4f2bd', '550e8400-e29b-41d4-a716-446655440000', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', NULL, 'user', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-19T09:11:58.126Z"}, "success": true}', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-19 09:11:59.739001+00'),
	('77033c04-4263-4c61-8b77-b56e721ee6d2', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-19T09:27:49.312Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-19 09:27:51.245451+00'),
	('4ee485ca-9268-4541-a4d4-bfb705be89cf', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-19T09:27:49.309Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-19 09:27:51.435066+00'),
	('4cae8000-317c-450b-9866-95a6cc6eba6d', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-19T09:27:49.326Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-19 09:27:51.534086+00'),
	('75593fc4-3e6c-42a4-94e0-a9232ff0673a', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-19T09:27:49.313Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-19 09:27:51.567811+00');


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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 139, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
