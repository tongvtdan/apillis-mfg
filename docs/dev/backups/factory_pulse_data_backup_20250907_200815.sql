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
	('00000000-0000-0000-0000-000000000000', 'ce260e5c-aa75-4d12-bb2a-812b2d2b07d0', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@apillis.com","user_id":"383b189e-acec-4989-94b3-a0267f4501bb","user_phone":""}}', '2025-09-07 12:42:05.299632+00', ''),
	('00000000-0000-0000-0000-000000000000', '32f37ab5-f9c1-47f6-bd9d-d32d161b4e53', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-07 12:42:14.287208+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d3e71df-1429-4ca0-8c30-8130f3eb38e5', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-07 12:43:24.410652+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d75c029-7f31-46f2-822f-83a47ed5f607', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-07 12:45:33.551575+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	(NULL, '660e8400-e29b-41d4-a716-446655440999', NULL, NULL, 'test@apillis.com', '$2a$06$P643IWL6JW8ilBAEwDkemOOom6j5PUN7AgsG4L0H7b7UNX/6ppesC', '2025-09-07 12:41:41.50163+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"display_name": "Test User"}', NULL, '2025-09-07 12:41:41.50163+00', '2025-09-07 12:41:41.50163+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '660e8400-e29b-41d4-a716-446655440003', 'authenticated', 'authenticated', 'nguyen.van.a@apillis.com', '$2a$06$57RLnYH311t4I4CMBtAh7u8gYUL38sB66AoxJaflFLkjwxvIiXqS.', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-07 12:43:24.411424+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "660e8400-e29b-41d4-a716-446655440003", "email": "nguyen.van.a@apillis.com", "email_verified": true, "phone_verified": false}', NULL, '2023-09-07 11:25:25.470919+00', '2025-09-07 12:43:24.412575+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'john.smith@apillis.com', '$2a$06$mdu.6eZuOpzEaORy1/E6oOsw/VP9mTdZkUxuabbTKOJRy1P7hO8W.', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "USA", "display_name": "John Smith"}', NULL, '2022-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440002', NULL, NULL, 'mary.johnson@apillis.com', '$2a$06$VntcA8mPvt8W1RVg3HWn7eJCKfuA9hmQJHODvEdR0XR5nXGo455T2', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "USA", "display_name": "Mary Johnson"}', NULL, '2023-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440004', NULL, NULL, 'tran.thi.b@apillis.com', '$2a$06$Gjl1E4bAbNXnMC/cGT5KI.xvquxvwlsd.BC/4ZualhzYbKTmo4aay', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Tran Thi B"}', NULL, '2023-11-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440005', NULL, NULL, 'le.van.c@apillis.com', '$2a$06$d.2tqpfN3zcVEX.UgrRwd.bXq1kF3GtyI89J2kIDflSVsWUaK.AUC', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Le Van C"}', NULL, '2024-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440006', NULL, NULL, 'pham.thi.d@apillis.com', '$2a$06$eSdGwuk1QWrzybMfdrIBoe4w/glkghfMTXHn5wj3GlF4VO4nAzzNe', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Pham Thi D"}', NULL, '2024-07-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440013', NULL, NULL, 'ly.van.k@apillis.com', '$2a$06$Vla28By.zPYb/Eqm6w1UAODh4A6g13guFmL9ojRtDB1Vte3HVQOPq', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Ly Van K"}', NULL, '2025-07-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '383b189e-acec-4989-94b3-a0267f4501bb', 'authenticated', 'authenticated', 'admin@apillis.com', '$2a$10$QVF2Od37Jx8XBMl7deSbdO15HlbmI0g9Q2Vlydb8Zmq5HyYnLte4a', '2025-09-07 12:42:05.30059+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-07 12:45:33.552045+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-09-07 12:42:05.298026+00', '2025-09-07 12:45:33.553053+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440007', NULL, NULL, 'hoang.van.e@apillis.com', '$2a$06$CinSZaFknX4RFl.HLaJF0em6sF2jxk2Rf0rPq5.WNALy4egzr/W/2', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Hoang Van E"}', NULL, '2024-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440008', NULL, NULL, 'vu.thi.f@apillis.com', '$2a$06$rpgqhv33QLxuTl8aVV.YX.SBVdpFxH7hVuiDGjoERugNFtEGvhm0K', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Vu Thi F"}', NULL, '2024-11-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440009', NULL, NULL, 'dinh.van.g@apillis.com', '$2a$06$WjezmZwmU/ZPDZDFJx04pOAxo74OOtuXnRqZMc7jpRsSN2U8yKvki', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Dinh Van G"}', NULL, '2025-01-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440010', NULL, NULL, 'bui.thi.h@apillis.com', '$2a$06$Zr5cFaSuNpCpJtTKgKUEmOuKufT2tS7GQTSJcIVspwFJiV3o5ukz.', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Bui Thi H"}', NULL, '2025-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440011', NULL, NULL, 'ngo.van.i@apillis.com', '$2a$06$NBkBTWQbPsgOlselIXG.q.tRqnF5L.XuWUMVtuM7gY0lref3mJk9i', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Ngo Van I"}', NULL, '2025-05-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440012', NULL, NULL, 'do.thi.j@apillis.com', '$2a$06$iAY8i57DTqsFpENlgjAmvewF52F.oC2T9cKjtoq97Si4ahdGHuL2y', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Do Thi J"}', NULL, '2025-06-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '{"sub": "660e8400-e29b-41d4-a716-446655440003", "email": "nguyen.van.a@apillis.com", "email_verified": true, "phone_verified": false}', 'email', '2025-09-07 11:26:35.431968+00', '2025-09-07 11:26:35.431968+00', '2025-09-07 11:26:35.431968+00', '100cde13-0b8c-4837-a2f1-eb056e55c932'),
	('383b189e-acec-4989-94b3-a0267f4501bb', '383b189e-acec-4989-94b3-a0267f4501bb', '{"sub": "383b189e-acec-4989-94b3-a0267f4501bb", "email": "admin@apillis.com", "email_verified": false, "phone_verified": false}', 'email', '2025-09-07 12:42:05.29902+00', '2025-09-07 12:42:05.299055+00', '2025-09-07 12:42:05.299055+00', 'e567f63c-4679-4964-b375-5eaa7856e87e');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('c7074087-78c4-4fd3-af64-e86fdf4958e2', '383b189e-acec-4989-94b3-a0267f4501bb', '2025-09-07 12:42:14.287632+00', '2025-09-07 12:42:14.287632+00', NULL, 'aal1', NULL, NULL, 'curl/8.7.1', '172.217.194.95', NULL),
	('4ac2c1ae-3caa-4ea0-ad52-cabd80c87506', '660e8400-e29b-41d4-a716-446655440003', '2025-09-07 12:43:24.41152+00', '2025-09-07 12:43:24.41152+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '172.217.194.95', NULL),
	('ba8bdc79-b21a-4f4d-a6d2-427e10afca26', '383b189e-acec-4989-94b3-a0267f4501bb', '2025-09-07 12:45:33.552083+00', '2025-09-07 12:45:33.552083+00', NULL, 'aal1', NULL, NULL, 'curl/8.7.1', '172.217.194.95', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('c7074087-78c4-4fd3-af64-e86fdf4958e2', '2025-09-07 12:42:14.290743+00', '2025-09-07 12:42:14.290743+00', 'password', '8423af0c-372a-43c6-bf9e-eeab3344be3c'),
	('4ac2c1ae-3caa-4ea0-ad52-cabd80c87506', '2025-09-07 12:43:24.412704+00', '2025-09-07 12:43:24.412704+00', 'password', '2b040080-62cf-4234-baae-52aa0bdb05f3'),
	('ba8bdc79-b21a-4f4d-a6d2-427e10afca26', '2025-09-07 12:45:33.553174+00', '2025-09-07 12:45:33.553174+00', 'password', '9e87476d-714f-406d-a9d3-f085cd91ef9f');


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
	('00000000-0000-0000-0000-000000000000', 1, 'kttp7zsr5k24', '383b189e-acec-4989-94b3-a0267f4501bb', false, '2025-09-07 12:42:14.289229+00', '2025-09-07 12:42:14.289229+00', NULL, 'c7074087-78c4-4fd3-af64-e86fdf4958e2'),
	('00000000-0000-0000-0000-000000000000', 2, 'snhh5l3a3qvn', '660e8400-e29b-41d4-a716-446655440003', false, '2025-09-07 12:43:24.412095+00', '2025-09-07 12:43:24.412095+00', NULL, '4ac2c1ae-3caa-4ea0-ad52-cabd80c87506'),
	('00000000-0000-0000-0000-000000000000', 3, '6s3kx4qhcww3', '383b189e-acec-4989-94b3-a0267f4501bb', false, '2025-09-07 12:45:33.552647+00', '2025-09-07 12:45:33.552647+00', NULL, 'ba8bdc79-b21a-4f4d-a6d2-427e10afca26');


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
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organizations" ("id", "name", "slug", "description", "industry", "address", "city", "state", "country", "postal_code", "website", "logo_url", "organization_type", "is_active", "created_at", "updated_at") VALUES
	('550e8400-e29b-41d4-a716-446655440000', 'Apillis', 'apillis', 'Leading manufacturing technology company', 'Technology', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'internal', true, '2023-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('550e8400-e29b-41d4-a716-446655440001', 'Acme Manufacturing Corp', 'acme-mfg', 'Leading manufacturer of precision components', 'Manufacturing', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'customer', true, '2024-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('550e8400-e29b-41d4-a716-446655440002', 'TechCorp Solutions', 'techcorp', 'Technology solutions provider', 'Technology', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'customer', true, '2024-11-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('550e8400-e29b-41d4-a716-446655440003', 'Global Industries Ltd', 'global-industries', 'Global manufacturing conglomerate', 'Manufacturing', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'customer', true, '2025-01-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('550e8400-e29b-41d4-a716-446655440004', 'Precision Parts Inc', 'precision-parts', 'High-precision component supplier', 'Manufacturing', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'supplier', true, '2025-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "organization_id", "email", "name", "role", "department", "phone", "avatar_url", "status", "description", "employee_id", "direct_manager_id", "direct_reports", "last_login_at", "preferences", "created_at", "updated_at") VALUES
	('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'mary.johnson@apillis.com', 'Mary Johnson', 'management', 'Finance', '+1-555-0102', NULL, 'active', NULL, NULL, NULL, NULL, NULL, '{"theme": "light", "language": "en", "timezone": "America/New_York"}', '2023-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'pham.thi.d@apillis.com', 'Pham Thi D', 'sales', 'Sales', '+84-555-987-654', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2024-07-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'hoang.van.e@apillis.com', 'Hoang Van E', 'procurement', 'Procurement', '+84-555-456-789', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2024-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'vu.thi.f@apillis.com', 'Vu Thi F', 'sales', 'Sales', '+84-555-321-098', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2024-11-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'dinh.van.g@apillis.com', 'Dinh Van G', 'engineering', 'Engineering', '+84-555-654-321', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440005', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2025-01-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'bui.thi.h@apillis.com', 'Bui Thi H', 'qa', 'Quality', '+84-555-789-012', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440004', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2025-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'ngo.van.i@apillis.com', 'Ngo Van I', 'qa', 'Quality', '+84-555-098-765', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440004', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2025-05-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'do.thi.j@apillis.com', 'Do Thi J', 'production', 'Production', '+84-555-135-792', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2025-06-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'ly.van.k@apillis.com', 'Ly Van K', 'production', 'Production', '+84-555-246-813', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2025-07-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'john.smith@apillis.com', 'John Smith', 'admin', 'Executive', '+1-555-0101', NULL, 'active', NULL, NULL, NULL, '{660e8400-e29b-41d4-a716-446655440003,660e8400-e29b-41d4-a716-446655440004,660e8400-e29b-41d4-a716-446655440005}', NULL, '{"theme": "light", "language": "en", "timezone": "America/New_York"}', '2022-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'nguyen.van.a@apillis.com', 'Nguyen Van A', 'management', 'Operations', '+84-123-456-789', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440001', '{660e8400-e29b-41d4-a716-446655440006,660e8400-e29b-41d4-a716-446655440007,660e8400-e29b-41d4-a716-446655440008,660e8400-e29b-41d4-a716-446655440012,660e8400-e29b-41d4-a716-446655440013}', NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2023-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'tran.thi.b@apillis.com', 'Tran Thi B', 'management', 'Quality', '+84-987-654-321', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440001', '{660e8400-e29b-41d4-a716-446655440010,660e8400-e29b-41d4-a716-446655440011}', NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2023-11-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'le.van.c@apillis.com', 'Le Van C', 'management', 'Engineering', '+84-555-123-456', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440001', '{660e8400-e29b-41d4-a716-446655440009}', NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2024-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('383b189e-acec-4989-94b3-a0267f4501bb', '550e8400-e29b-41d4-a716-446655440000', 'admin@apillis.com', 'Admin User', 'admin', 'IT', NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-07 12:45:00.097891+00', '2025-09-07 12:45:00.097891+00');


--
-- Data for Name: workflow_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: workflow_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."workflow_stages" ("id", "organization_id", "name", "slug", "description", "color", "stage_order", "is_active", "exit_criteria", "responsible_roles", "estimated_duration_days", "created_at", "updated_at") VALUES
	('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Inquiry Received', 'inquiry_received', 'Customer RFQ submitted and initial review completed', '#3B82F6', 1, true, NULL, '{sales,procurement}', 2, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Technical Review', 'technical_review', 'Engineering, QA, and Production teams review technical requirements', '#F59E0B', 2, true, NULL, '{engineering,qa,production}', 3, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Supplier RFQ Sent', 'supplier_rfq_sent', 'RFQs sent to qualified suppliers for component pricing and lead times', '#F97316', 3, true, NULL, '{procurement}', 1, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Quoted', 'quoted', 'Customer quote generated and sent based on supplier responses', '#10B981', 4, true, NULL, '{sales,procurement}', 2, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Order Confirmed', 'order_confirmed', 'Customer accepted quote and order confirmed', '#6366F1', 5, true, NULL, '{sales,procurement,production}', 1, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Procurement Planning', 'procurement_planning', 'BOM finalized, purchase orders issued, material planning completed', '#8B5CF6', 6, true, NULL, '{procurement,production}', 2, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'Production', 'production', 'Manufacturing process initiated and quality control implemented', '#84CC16', 7, true, NULL, '{production,qa}', 14, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'Completed', 'completed', 'Order fulfilled and delivered to customer', '#6B7280', 8, true, NULL, '{sales,production}', 1, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00');


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."projects" ("id", "organization_id", "project_id", "title", "description", "customer_organization_id", "point_of_contacts", "current_stage_id", "workflow_definition_id", "status", "priority_level", "priority_score", "stage_entered_at", "estimated_delivery_date", "actual_delivery_date", "requested_due_date", "promised_due_date", "assigned_to", "created_by", "estimated_value", "actual_value", "tags", "project_type", "intake_type", "intake_source", "notes", "metadata", "created_at", "updated_at", "source", "description_legacy") VALUES
	('220e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'P-25082002', 'TechCorp - System Integration', 'Complete system integration for TechCorp Solutions', '550e8400-e29b-41d4-a716-446655440002', '{770e8400-e29b-41d4-a716-446655440003}', '880e8400-e29b-41d4-a716-446655440001', NULL, 'inquiry', 'normal', 0.00, NULL, '2025-10-22', NULL, NULL, NULL, '660e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440008', NULL, NULL, '{}', 'system_build', NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL),
	('220e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'P-25082003', 'Global Industries - Automation Line', 'High-volume manufacturing line for industrial automation', '550e8400-e29b-41d4-a716-446655440003', '{}', '880e8400-e29b-41d4-a716-446655440003', NULL, 'inquiry', 'urgent', 0.00, NULL, '2025-12-06', NULL, NULL, NULL, '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440006', NULL, NULL, '{}', 'manufacturing', NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL),
	('220e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'P-25082001', 'Acme Manufacturing - Precision Components', 'High-precision mechanical components manufacturing project', '550e8400-e29b-41d4-a716-446655440001', '{770e8400-e29b-41d4-a716-446655440001}', '880e8400-e29b-41d4-a716-446655440002', NULL, 'reviewing', 'high', 0.00, NULL, '2025-11-06', NULL, NULL, NULL, '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440006', NULL, NULL, '{}', 'manufacturing', NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 12:31:51.827125+00', NULL, NULL),
	('d75dae81-e97c-4f20-aee4-d1a86fe43d5e', '550e8400-e29b-41d4-a716-446655440000', 'P-DEV001', 'Development Test Project', NULL, '550e8400-e29b-41d4-a716-446655440001', '{}', '880e8400-e29b-41d4-a716-446655440001', NULL, 'inquiry', 'normal', 0.00, NULL, NULL, NULL, NULL, NULL, '660e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{}', NULL, NULL, NULL, NULL, '{}', '2025-09-07 12:32:01.472263+00', '2025-09-07 12:32:11.047265+00', NULL, NULL);


--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."activity_log" ("id", "organization_id", "user_id", "project_id", "entity_type", "entity_id", "action", "description", "old_values", "new_values", "ip_address", "user_agent", "metadata", "created_at") VALUES
	('ee0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440006', '220e8400-e29b-41d4-a716-446655440001', 'project', '220e8400-e29b-41d4-a716-446655440001', 'create', 'Created new project for Acme Manufacturing', NULL, NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('ee0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440009', '220e8400-e29b-41d4-a716-446655440001', 'project', '220e8400-e29b-41d4-a716-446655440001', 'update', 'Updated project technical specifications', NULL, NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('ee0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440007', '220e8400-e29b-41d4-a716-446655440001', 'project', '220e8400-e29b-41d4-a716-446655440001', 'update', 'Updated project cost estimation', NULL, NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('ee0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440005', '220e8400-e29b-41d4-a716-446655440002', 'approval', 'dd0e8400-e29b-41d4-a716-446655440001', 'approve', 'Approved technical review for Acme project', NULL, NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('d1cb6a72-6d83-46a1-bda4-ec7e99414a7f', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'login_success', 'User logged in successfully', NULL, NULL, NULL, NULL, '{}', '2025-09-07 12:45:54.419026+00'),
	('f2570cfa-fcf3-4fd5-ac58-ea24e43a816a', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'login_success', NULL, NULL, '{"details": {}, "success": true}', NULL, 'test', '{}', '2025-09-07 13:05:10.784201+00');


--
-- Data for Name: approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."approvals" ("id", "organization_id", "approval_type", "title", "description", "reference_id", "entity_type", "entity_id", "approval_chain_id", "step_number", "total_steps", "requested_by", "requested_at", "request_reason", "request_metadata", "current_approver_id", "current_approver_role", "current_approver_department", "status", "priority", "due_date", "expires_at", "sla_due_at", "decision_comments", "decision_reason", "decision_metadata", "decided_at", "decided_by", "escalated_from", "escalated_to", "escalated_at", "escalation_reason", "delegated_from", "delegated_to", "delegated_at", "delegation_reason", "delegation_end_date", "auto_approval_rules", "auto_approved_at", "auto_approval_reason", "created_at", "updated_at", "created_by") VALUES
	('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'technical_review', 'Technical Review Approval', 'Approve technical specifications for Acme project', NULL, 'project', '220e8400-e29b-41d4-a716-446655440001', NULL, 1, 1, '660e8400-e29b-41d4-a716-446655440009', '2025-09-07 11:25:25.470919+00', 'Technical specifications require management approval', '{}', '660e8400-e29b-41d4-a716-446655440005', NULL, NULL, 'pending', 'normal', '2025-09-10', NULL, NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL),
	('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'cost_approval', 'Cost Approval Request', 'Approve project budget for TechCorp integration', NULL, 'project', '220e8400-e29b-41d4-a716-446655440002', NULL, 1, 1, '660e8400-e29b-41d4-a716-446655440008', '2025-09-07 11:25:25.470919+00', 'Budget exceeds standard approval threshold', '{}', '660e8400-e29b-41d4-a716-446655440002', NULL, NULL, 'approved', 'high', '2025-09-12', NULL, NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL);


--
-- Data for Name: approval_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: approval_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contacts" ("id", "organization_id", "type", "company_name", "contact_name", "email", "phone", "address", "city", "state", "country", "postal_code", "website", "tax_id", "payment_terms", "credit_limit", "is_active", "role", "is_primary_contact", "notes", "created_at", "updated_at") VALUES
	('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Acme Manufacturing Corp', 'John Customer', 'john.customer@acme.com', '+1-555-0101', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Purchasing Manager', true, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Acme Manufacturing Corp', 'Sarah Engineering', 'sarah.eng@acme.com', '+1-555-0102', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Engineering Lead', false, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'customer', 'TechCorp Solutions', 'Mary Buyer', 'mary.buyer@techcorp.com', '+1-555-0201', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Senior Buyer', true, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'customer', 'TechCorp Solutions', 'Bob Tech', 'bob.tech@techcorp.com', '+1-555-0202', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Technical Director', false, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'supplier', 'Precision Parts Inc', 'Alice Supplier', 'alice@precisionparts.com', '+1-555-0301', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Sales Manager', true, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 'supplier', 'Precision Parts Inc', 'Charlie Quality', 'charlie@precisionparts.com', '+1-555-0302', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Quality Manager', false, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('8f05707d-fde1-4c54-8297-d45d881217a8', '550e8400-e29b-41d4-a716-446655440001', 'customer', NULL, 'Development Contact', 'dev.contact@acme.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Project Manager', false, NULL, '2025-09-07 12:32:40.765997+00', '2025-09-07 12:32:40.765997+00');


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: document_access_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: document_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notifications" ("id", "organization_id", "user_id", "type", "title", "message", "priority", "action_url", "is_read", "read_at", "expires_at", "metadata", "created_at") VALUES
	('ff0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440005', 'approval', 'New Approval Request', 'Technical review approval needed for Acme project', 'normal', '/approvals/dd0e8400-e29b-41d4-a716-446655440001', false, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('ff0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440006', 'workflow', 'Project Stage Update', 'Acme project moved to Technical Review stage', 'low', '/projects/220e8400-e29b-41d4-a716-446655440001', false, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('ff0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440008', 'approval', 'Approval Approved', 'Your cost approval request has been approved', 'normal', '/approvals/dd0e8400-e29b-41d4-a716-446655440002', false, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00');


--
-- Data for Name: workflow_sub_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."workflow_sub_stages" ("id", "organization_id", "workflow_stage_id", "name", "slug", "description", "color", "sub_stage_order", "is_active", "exit_criteria", "responsible_roles", "estimated_duration_hours", "is_required", "can_skip", "auto_advance", "requires_approval", "approval_roles", "metadata", "created_at", "updated_at") VALUES
	('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Initial Review', 'initial_review', 'Review customer requirements and feasibility', NULL, 1, true, NULL, '{sales,management}', 4, true, false, false, false, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Technical Assessment', 'technical_assessment', 'Assess technical requirements and capabilities', NULL, 2, true, NULL, '{engineering}', 8, true, false, false, false, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Cost Estimation', 'cost_estimation', 'Initial cost estimation and budget planning', NULL, 3, true, NULL, '{sales,procurement}', 6, true, false, false, false, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 'Design Review', 'design_review', 'Review design specifications and requirements', NULL, 1, true, NULL, '{engineering}', 16, true, false, false, true, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 'Quality Assessment', 'quality_assessment', 'Quality requirements and testing procedures', NULL, 2, true, NULL, '{qa}', 8, true, false, false, true, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('990e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 'Production Planning', 'production_planning', 'Production process planning and resource allocation', NULL, 3, true, NULL, '{production}', 12, true, false, false, false, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('990e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003', 'Supplier Selection', 'supplier_selection', 'Select qualified suppliers for component sourcing', NULL, 1, true, NULL, '{procurement}', 4, true, false, false, false, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('990e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003', 'RFQ Preparation', 'rfq_preparation', 'Prepare and send RFQs to selected suppliers', NULL, 2, true, NULL, '{procurement}', 2, true, false, false, false, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('990e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003', 'Supplier Responses', 'supplier_responses', 'Collect and analyze supplier responses', NULL, 3, true, NULL, '{procurement}', 3, true, false, false, false, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00');


--
-- Data for Name: project_sub_stage_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."project_sub_stage_progress" ("id", "organization_id", "project_id", "workflow_stage_id", "sub_stage_id", "status", "assigned_to", "started_at", "due_at", "completed_at", "blocked_reason", "notes", "metadata", "created_at", "updated_at") VALUES
	('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '220e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'completed', '660e8400-e29b-41d4-a716-446655440006', '2025-09-05 11:25:25.470919+00', NULL, NULL, NULL, NULL, '{}', '2025-09-05 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '220e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'completed', '660e8400-e29b-41d4-a716-446655440009', '2025-09-06 11:25:25.470919+00', NULL, NULL, NULL, NULL, '{}', '2025-09-06 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '220e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', 'in_progress', '660e8400-e29b-41d4-a716-446655440007', '2025-09-07 11:25:25.470919+00', NULL, NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '220e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440004', 'in_progress', '660e8400-e29b-41d4-a716-446655440009', '2025-09-07 11:25:25.470919+00', NULL, NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('aab10af5-eb1a-4248-b9e5-6e6b1e1f5911', '550e8400-e29b-41d4-a716-446655440000', 'd75dae81-e97c-4f20-aee4-d1a86fe43d5e', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'pending', '660e8400-e29b-41d4-a716-446655440009', NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-07 12:32:22.381159+00', '2025-09-07 12:32:22.381159+00'),
	('1acb8a16-7b06-42f9-9475-dee8b15d00a3', '550e8400-e29b-41d4-a716-446655440000', 'd75dae81-e97c-4f20-aee4-d1a86fe43d5e', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'in_progress', '660e8400-e29b-41d4-a716-446655440006', '2025-09-07 12:32:40.765997+00', NULL, NULL, NULL, NULL, '{}', '2025-09-07 12:32:22.381159+00', '2025-09-07 12:32:22.381159+00');


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."reviews" ("id", "organization_id", "project_id", "reviewer_id", "reviewer_role", "review_type", "status", "priority", "comments", "risks", "recommendations", "tooling_required", "estimated_cost", "estimated_lead_time", "due_date", "reviewed_at", "created_at", "updated_at") VALUES
	('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '220e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005', NULL, 'technical_review', 'pending', 'normal', NULL, '{}', NULL, true, NULL, NULL, '2025-09-10', NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00'),
	('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '220e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', NULL, 'cost_approval', 'approved', 'high', NULL, '{}', NULL, false, NULL, NULL, '2025-09-12', NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00');


--
-- Data for Name: review_checklist_items; Type: TABLE DATA; Schema: public; Owner: postgres
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



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 3, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
