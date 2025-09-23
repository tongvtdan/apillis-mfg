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
	('00000000-0000-0000-0000-000000000000', '07f9dd88-92d4-4a28-b0a8-077529b52057', '{"action":"login","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 10:50:32.316096+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd55e10a-035e-47e4-83ab-3ac72f7c4bcd', '{"action":"token_refreshed","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 11:49:44.408643+00', ''),
	('00000000-0000-0000-0000-000000000000', '836524d9-c955-4583-85ac-60044b568fd9', '{"action":"token_revoked","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 11:49:44.433558+00', ''),
	('00000000-0000-0000-0000-000000000000', '806e78fe-5595-4e4a-812c-1e27aaa118a8', '{"action":"token_refreshed","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 12:44:48.422628+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1198aeb-331f-4bcc-bfde-d1f9b25e2b3c', '{"action":"token_revoked","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 12:44:48.440959+00', ''),
	('00000000-0000-0000-0000-000000000000', '7776453f-6fe3-44d9-bfde-8e74bb109774', '{"action":"token_refreshed","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 12:44:49.445208+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b6a4ac2c-7f4a-479b-a706-a5db62cdfc3f', '{"action":"token_revoked","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 12:44:49.447804+00', ''),
	('00000000-0000-0000-0000-000000000000', '4fa016ba-6820-461b-bd58-554d392ea283', '{"action":"token_refreshed","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 12:44:50.328981+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b406d764-4960-453b-b8ac-03de2c6a71dc', '{"action":"token_revoked","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 12:44:50.329666+00', ''),
	('00000000-0000-0000-0000-000000000000', '22a81c6d-7df6-4a24-af9c-cdf35c6abf47', '{"action":"token_refreshed","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 13:40:46.471044+00', ''),
	('00000000-0000-0000-0000-000000000000', '69dfa701-5d81-4dd7-8f29-7b4d4c520c9e', '{"action":"token_revoked","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 13:40:46.491913+00', ''),
	('00000000-0000-0000-0000-000000000000', '77056777-6d27-4ad5-ab83-e745aa7440d2', '{"action":"token_refreshed","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 13:40:47.532664+00', ''),
	('00000000-0000-0000-0000-000000000000', '77241784-1335-4f3d-a09c-7fde2b8ef608', '{"action":"token_revoked","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 13:40:47.533967+00', ''),
	('00000000-0000-0000-0000-000000000000', '480abcd8-3709-4821-8d9e-5c05e673adb7', '{"action":"token_refreshed","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 13:40:48.449734+00', ''),
	('00000000-0000-0000-0000-000000000000', '6fdac458-c8a0-4932-9c7d-5576031e5216', '{"action":"token_revoked","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-19 13:40:48.453033+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e9e73a5-658c-4435-946e-c42b7b4b43c0', '{"action":"login","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-22 04:25:28.707706+00', ''),
	('00000000-0000-0000-0000-000000000000', '61c44d06-0633-4a67-b3b2-7a9d0574f4d9', '{"action":"token_refreshed","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-22 04:52:37.028022+00', ''),
	('00000000-0000-0000-0000-000000000000', '93ec40fb-dbfa-48e7-98c2-bdd8327751ac', '{"action":"token_revoked","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-22 04:52:37.042327+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3b2ffe2-831d-43f6-85ee-dddf63a130b1', '{"action":"token_refreshed","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-22 05:52:44.062399+00', ''),
	('00000000-0000-0000-0000-000000000000', '028c016d-784a-41c0-a54c-1df9c7b29318', '{"action":"token_revoked","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-22 05:52:44.09191+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bc4fb5d7-d603-4fc1-9a36-c703d863188c', '{"action":"logout","actor_id":"f469d228-de9d-43fb-bac5-0a493a6e4099","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-22 05:52:46.495396+00', ''),
	('00000000-0000-0000-0000-000000000000', '59755abb-3596-430b-a876-9f9e0b2b58ce', '{"action":"login","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-22 06:24:09.543338+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a26edd67-5069-4761-ba05-f9b2f22254e8', '{"action":"login","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-22 06:35:52.512901+00', ''),
	('00000000-0000-0000-0000-000000000000', '48168286-1f00-40f5-bcb7-8d9dbd190337', '{"action":"token_refreshed","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-22 08:11:41.647391+00', ''),
	('00000000-0000-0000-0000-000000000000', '43d9b5b4-f00b-476d-a15c-c7e86c7f66fb', '{"action":"token_revoked","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-22 08:11:41.658079+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1ce50fd-caaf-4fb6-8010-fd42cd723861', '{"action":"logout","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-22 08:11:43.298983+00', ''),
	('00000000-0000-0000-0000-000000000000', '0d6a6469-90f6-4e9f-89a8-6ae9311ed57e', '{"action":"login","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-22 09:58:10.658699+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb604062-4952-4bf9-a024-30b5a10a7578', '{"action":"token_refreshed","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-22 10:56:14.993694+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d3c572a-c260-43e4-9f22-c2c78a1c2115', '{"action":"token_revoked","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-22 10:56:15.006147+00', ''),
	('00000000-0000-0000-0000-000000000000', '130d58c0-1527-49c3-b8a0-0fe2b29a91b9', '{"action":"token_refreshed","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-22 11:54:55.886577+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd38dee0d-eac8-4fd9-a0c1-df76fb9e5611', '{"action":"token_revoked","actor_id":"815c6978-8e4f-425d-9b20-6318d6eb88ca","actor_username":"dantong@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-22 11:54:55.903532+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'f221e843-e64c-4b27-8406-3d0c1ea7a2b5', 'authenticated', 'authenticated', 'phuocbnah@apillis.com', '$2a$10$X7QDp32aENVslwqtFxtTJeVVDoau8vj/UJKpiIc6vc3hPyxLxNwhy', '2025-09-19 08:11:43.637237+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-19 08:11:43.643616+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f221e843-e64c-4b27-8406-3d0c1ea7a2b5", "email": "phuocbnah@apillis.com", "display_name": "phuoc", "email_verified": true, "phone_verified": false}', NULL, '2025-09-19 08:11:43.610631+00', '2025-09-19 09:11:58.464137+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f469d228-de9d-43fb-bac5-0a493a6e4099', 'authenticated', 'authenticated', 'admin@apillis.com', '$2a$10$LXQOrE0jD8uMsmLQUDBlTuMcz80dPm4nOSRf3AT61Du83P76NGvmC', '2025-09-19 08:00:41.940154+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-22 04:25:28.738942+00', '{"provider": "email", "providers": ["email"]}', '{"name": "Admin User", "email_verified": true}', NULL, '2025-09-19 08:00:41.936003+00', '2025-09-22 05:52:44.123531+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'authenticated', 'authenticated', 'dantong@apillis.com', '$2a$10$9akVViKsVn1NwxD.nte54.I2nQ9u.xGcY2A4F607WBgEWSAZ6dE0q', '2025-09-19 07:57:36.768612+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-22 09:58:10.673359+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "815c6978-8e4f-425d-9b20-6318d6eb88ca", "email": "dantong@apillis.com", "display_name": "Dan Tong", "email_verified": true, "phone_verified": false}', NULL, '2025-09-19 07:57:36.73901+00', '2025-09-22 11:54:55.928819+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


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
	('6c128a44-cf9d-4594-8a43-55f76adb8a38', '815c6978-8e4f-425d-9b20-6318d6eb88ca', '2025-09-22 09:58:10.673476+00', '2025-09-22 11:54:55.934289+00', NULL, 'aal1', NULL, '2025-09-22 11:54:55.934218', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '171.250.164.204', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('6c128a44-cf9d-4594-8a43-55f76adb8a38', '2025-09-22 09:58:10.709398+00', '2025-09-22 09:58:10.709398+00', 'password', '45c00060-abc1-406f-b227-dd8be42f5a8e');


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
	('00000000-0000-0000-0000-000000000000', 153, 'jathzl4y2l3a', '815c6978-8e4f-425d-9b20-6318d6eb88ca', true, '2025-09-22 09:58:10.688902+00', '2025-09-22 10:56:15.006769+00', NULL, '6c128a44-cf9d-4594-8a43-55f76adb8a38'),
	('00000000-0000-0000-0000-000000000000', 154, 'k54wijpehwnw', '815c6978-8e4f-425d-9b20-6318d6eb88ca', true, '2025-09-22 10:56:15.020994+00', '2025-09-22 11:54:55.904323+00', 'jathzl4y2l3a', '6c128a44-cf9d-4594-8a43-55f76adb8a38'),
	('00000000-0000-0000-0000-000000000000', 155, 'rirk5zg65f6q', '815c6978-8e4f-425d-9b20-6318d6eb88ca', false, '2025-09-22 11:54:55.921492+00', '2025-09-22 11:54:55.921492+00', 'k54wijpehwnw', '6c128a44-cf9d-4594-8a43-55f76adb8a38');


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
	('550e8400-e29b-41d4-a716-446655440000', 'Apillis', 'apillis', 'Leading manufacturing technology company', 'Technology', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'internal', true, '2023-09-07 11:25:25.470919+00', '2025-09-18 11:01:19.861648+00', 'USD', NULL, NULL, 'UTC', '{}', NULL),
	('3a10d8c5-effd-41eb-b848-b63fa4ac0e37', 'UTECH', 'utech', 'U Tech Manufacturing, Corp. was founded by individuals with Over 50+ years combined experience in:

Semiconductor Equipment
Engineering and automation
Capital equipment design, engineering, and build
Reliability and test engineering
Part fabrication and turnkey manufacturing
Field services support', 'Manufacturing', '18450 Sutter Blvd, Morgan Hill', NULL, 'CA', 'United States', '95037', 'https://utechmanufacturing.com/', NULL, 'customer', true, '2025-09-22 05:03:33.203528+00', '2025-09-22 05:13:14.388254+00', 'USD', NULL, NULL, 'UTC', '{}', 'f469d228-de9d-43fb-bac5-0a493a6e4099'),
	('b8512c78-ebe7-4b5d-8225-435e39a49e72', 'MS Tech', NULL, 'Innovative solutions provider. Strong technical support. Flexible manufacturing.', NULL, '4938 Commerce St', 'Ho Chi Minh', 'Ho Chi Minh', 'Vietnam', '70000', 'https://mstech.vn', NULL, 'supplier', true, '2025-09-22 06:35:05.91886+00', '2025-09-22 06:35:05.91886+00', 'VND', NULL, 'Net 90', 'UTC', '{"capabilities": ["testing", "prototyping", "packaging", "machining"], "supplierType": "manufacturer", "certifications": ["Conflict Minerals Compliant", "SA8000", "TL 9000", "BRCGS", "AS9100", "ISO 9001"], "qualityStandards": ["ISO 9001"], "qualificationStatus": "not_qualified"}', '815c6978-8e4f-425d-9b20-6318d6eb88ca'),
	('20523859-e1a1-4e9c-82aa-35211adc9279', 'ABC DEMO', 'abc-demo', 'ABC company', 'Technology', '123 inno', NULL, 'ca', 'United States', '95037', 'https://acb.com', NULL, 'customer', true, '2025-09-22 07:07:38.090881+00', '2025-09-22 07:07:38.090881+00', 'USD', NULL, NULL, 'UTC', '{}', '815c6978-8e4f-425d-9b20-6318d6eb88ca'),
	('21d6bf72-f0a9-4217-b9b4-45c414337b1b', 'MS Tech-Inactive', NULL, 'Innovative solutions provider. Strong technical support. Flexible manufacturing.', NULL, '4938 Commerce St', 'Ho Chi Minh', 'Ho Chi Minh', 'Vietnam', '70000', 'https://mstech.vn', NULL, 'supplier', false, '2025-09-22 06:31:05.301504+00', '2025-09-22 07:09:46.935491+00', 'VND', NULL, 'Net 90', 'UTC', '{"capabilities": ["testing", "prototyping", "packaging", "machining"], "supplierType": "manufacturer", "certifications": ["Conflict Minerals Compliant", "SA8000", "TL 9000", "BRCGS", "AS9100", "ISO 9001"], "qualityStandards": ["ISO 9001"], "qualificationStatus": "not_qualified"}', '815c6978-8e4f-425d-9b20-6318d6eb88ca');


--
-- Data for Name: workflow_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."workflow_definitions" ("id", "organization_id", "name", "version", "description", "is_active", "created_by", "created_at", "updated_at") VALUES
	('5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '550e8400-e29b-41d4-a716-446655440000', 'Default Manufacturing Workflow', 1, 'Standard manufacturing workflow for all projects', true, NULL, '2025-09-13 02:08:38.408391+00', '2025-09-13 02:08:38.408391+00');


--
-- Data for Name: workflow_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."workflow_stages" ("id", "organization_id", "name", "slug", "description", "color", "stage_order", "is_active", "exit_criteria", "responsible_roles", "estimated_duration_days", "created_at", "updated_at") VALUES
	('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Inquiry Received', 'inquiry_received', 'Customer RFQ submitted and initial review completed', '#3B82F6', 1, true, NULL, '{sales,procurement}', 2, '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Technical Review', 'technical_review', 'Engineering, QA, and Production teams review technical requirements', '#F59E0B', 2, true, NULL, '{engineering,qa,production}', 3, '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Supplier RFQ Sent', 'supplier_rfq_sent', 'RFQs sent to qualified suppliers for component pricing and lead times', '#F97316', 3, true, NULL, '{procurement}', 1, '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Quoted', 'quoted', 'Customer quote generated and sent based on supplier responses', '#10B981', 4, true, NULL, '{sales,procurement}', 2, '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Order Confirmed', 'order_confirmed', 'Customer accepted quote and order confirmed', '#6366F1', 5, true, NULL, '{sales,procurement,production}', 1, '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Procurement Planning', 'procurement_planning', 'Procurement and material planning phase', '#EAB308', 6, true, NULL, '{procurement}', 7, '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'In Production', 'in_production', 'Manufacturing and production phase', '#14B8A6', 7, true, NULL, '{production}', 14, '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'Shipped & Closed', 'shipped_closed', 'Project completed and shipped to customer', '#6B7280', 8, true, NULL, '{sales,logistics}', 1, '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00');


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."projects" ("id", "organization_id", "project_id", "title", "description", "customer_organization_id", "point_of_contacts", "current_stage_id", "workflow_definition_id", "status", "priority_level", "priority_score", "stage_entered_at", "estimated_delivery_date", "actual_delivery_date", "requested_due_date", "promised_due_date", "assigned_to", "created_by", "estimated_value", "actual_value", "tags", "project_type", "intake_type", "intake_source", "notes", "metadata", "created_at", "updated_at", "source", "description_legacy") VALUES
	('add0b56b-3bc0-408f-8caa-081ae0f9d170', '550e8400-e29b-41d4-a716-446655440000', 'P-2025092201', 'BUSBARS-GEN3', 'Fabricate and assemble assemblies for powerbase busbar', '3a10d8c5-effd-41eb-b848-b63fa4ac0e37', '{}', '880e8400-e29b-41d4-a716-446655440001', NULL, 'inquiry', 'normal', 0.00, '2025-09-22 10:05:52.177+00', '2025-10-06', NULL, NULL, NULL, NULL, '815c6978-8e4f-425d-9b20-6318d6eb88ca', 575000.00, NULL, '{rfq,fabrication}', 'fabrication', 'rfq', 'portal', NULL, '{"volume": "[{\"qty\":25000,\"unit\":\"pcs\",\"freq\":\"per year\"}]", "contact_name": "Thien", "contact_email": "thien@utechmanufacturing.com", "desired_delivery_date": "2025-10-06", "target_price_per_unit": 23}', '2025-09-22 10:05:52.433201+00', '2025-09-22 10:05:52.433201+00', 'manual', NULL),
	('0ec97d5a-1d3b-465b-9757-0102308d30cd', '550e8400-e29b-41d4-a716-446655440000', 'P-2025092202', 'POWER RACK', 'fabricate multi parts including sheet metal and machining', '3a10d8c5-effd-41eb-b848-b63fa4ac0e37', '{}', '880e8400-e29b-41d4-a716-446655440001', NULL, 'inquiry', 'normal', 0.00, '2025-09-22 10:55:27.662+00', '2025-10-07', NULL, NULL, NULL, NULL, '815c6978-8e4f-425d-9b20-6318d6eb88ca', 1990.00, NULL, '{rfq,fabrication}', 'fabrication', 'rfq', 'portal', NULL, '{"volume": "[{\"qty\":1000,\"unit\":\"pcs\",\"freq\":\"per year\"}]", "contact_name": "Thien", "contact_email": "thien@utechmanufacturing.com", "desired_delivery_date": "2025-10-07", "target_price_per_unit": 1.99}', '2025-09-22 10:55:27.876813+00', '2025-09-22 10:55:27.876813+00', 'manual', NULL),
	('49112806-383a-4da1-98a8-fea81aaae1ce', '550e8400-e29b-41d4-a716-446655440000', 'P-2025092204', 'CUP', 'Make register cup w/holes and wo/holes, using stamping method', '3a10d8c5-effd-41eb-b848-b63fa4ac0e37', '{}', '880e8400-e29b-41d4-a716-446655440001', NULL, 'inquiry', 'normal', 0.00, '2025-09-22 11:29:53.157+00', '2025-10-07', NULL, NULL, NULL, NULL, '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, NULL, '{rfq,fabrication}', 'fabrication', 'rfq', 'portal', '"5810500721002 – no holes = ~5,400pcs per year

5810500721001 (specified in email) – with holes = 30,600pcs per year"', '{"volume": "[{\"qty\":5400,\"unit\":\"pcs\",\"freq\":\"per year\"},{\"qty\":30600,\"unit\":\"pcs\",\"freq\":\"per year\"}]", "contact_name": "Thien", "contact_email": "thien@utechmanufacturing.com", "desired_delivery_date": "2025-10-07"}', '2025-09-22 11:29:53.933593+00', '2025-09-22 11:29:53.933593+00', 'manual', NULL),
	('8d99fbf4-e71d-45b2-8eae-899d129c73c4', '550e8400-e29b-41d4-a716-446655440000', 'P-2025092203', 'TERA', 'Make some parts for Teradyne, including: sheet metals, cnc, plastic molding,...', '3a10d8c5-effd-41eb-b848-b63fa4ac0e37', '{}', '880e8400-e29b-41d4-a716-446655440002', NULL, 'inquiry', 'normal', 0.00, '2025-09-22 11:35:56.334+00', '2025-10-08', NULL, NULL, NULL, NULL, '815c6978-8e4f-425d-9b20-6318d6eb88ca', 2300.00, NULL, '{rfq,fabrication}', 'fabrication', 'rfq', 'portal', NULL, '{"volume": "[{\"qty\":1000,\"unit\":\"pcs\",\"freq\":\"per year\"}]", "contact_name": "Thien", "contact_email": "thien@utechmanufacturing.com", "desired_delivery_date": "2025-10-08", "target_price_per_unit": 2.3}', '2025-09-22 11:00:00.018559+00', '2025-09-22 11:35:56.66375+00', 'manual', NULL),
	('0580fdd5-e596-4536-a52c-c426cb821ac7', '550e8400-e29b-41d4-a716-446655440000', 'P-2025092205', 'GAS BOX', 'Build a gasbox including making the enclosure, build gasline, wiring,....', '3a10d8c5-effd-41eb-b848-b63fa4ac0e37', '{}', '880e8400-e29b-41d4-a716-446655440001', NULL, 'inquiry', 'normal', 0.00, '2025-09-22 11:45:07.903+00', '2025-10-12', NULL, NULL, NULL, NULL, '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, NULL, '{rfq,fabrication}', 'fabrication', 'rfq', 'portal', NULL, '{"volume": "[{\"qty\":1,\"unit\":\"pcs\",\"freq\":\"one_time\"}]", "contact_name": "Thien", "contact_email": "thien@utechmanufacturing.com", "desired_delivery_date": "2025-10-12"}', '2025-09-22 11:45:08.727431+00', '2025-09-22 11:45:08.727431+00', 'manual', NULL);


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
	('75593fc4-3e6c-42a4-94e0-a9232ff0673a', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-19T09:27:49.313Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-19 09:27:51.567811+00'),
	('566c0371-05a3-404f-99fb-551ae87b0fd0', '550e8400-e29b-41d4-a716-446655440000', 'f469d228-de9d-43fb-bac5-0a493a6e4099', NULL, 'user', 'f469d228-de9d-43fb-bac5-0a493a6e4099', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-22T05:52:40.033Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-22 05:52:45.215923+00'),
	('8277fb04-f257-46bc-812b-b8c52aea2754', '550e8400-e29b-41d4-a716-446655440000', 'f469d228-de9d-43fb-bac5-0a493a6e4099', NULL, 'user', 'f469d228-de9d-43fb-bac5-0a493a6e4099', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-22T05:52:40.036Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-22 05:52:45.940215+00'),
	('44637162-98cd-44f9-be0e-e6c9e5e4812e', '550e8400-e29b-41d4-a716-446655440000', 'f469d228-de9d-43fb-bac5-0a493a6e4099', NULL, 'user', 'f469d228-de9d-43fb-bac5-0a493a6e4099', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-22T05:52:40.036Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-22 05:52:45.950643+00'),
	('6a8d19e1-e8a2-42cc-b890-f72af0a058cf', '550e8400-e29b-41d4-a716-446655440000', 'f469d228-de9d-43fb-bac5-0a493a6e4099', NULL, 'user', 'f469d228-de9d-43fb-bac5-0a493a6e4099', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-22T05:52:40.049Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-22 05:52:46.389593+00'),
	('8e026019-f6a9-4133-9585-53a44a62be82', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'supplier', '21d6bf72-f0a9-4217-b9b4-45c414337b1b', 'supplier_deleted', NULL, NULL, '{"deletedBy": "815c6978-8e4f-425d-9b20-6318d6eb88ca", "supplierName": "MS Tech"}', NULL, NULL, '{}', '2025-09-22 06:45:01.29+00'),
	('6764d685-426e-4e9d-8ab9-0c8f5bcbc869', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-22T07:45:23.507Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-22 08:11:42.387803+00'),
	('20ef4646-4c12-42b0-b29a-427942a79286', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-22T07:45:17.518Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-22 08:11:42.872196+00'),
	('c0e87179-3985-49d5-86ee-df6be43a5201', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-22T07:45:17.500Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-22 08:11:42.890671+00'),
	('afaf0330-7ddd-4a16-88c5-d1631ae81aa3', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, 'user', '815c6978-8e4f-425d-9b20-6318d6eb88ca', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "logout_time": "2025-09-22T07:45:17.500Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '{}', '2025-09-22 08:11:42.905534+00'),
	('1e04533d-1029-4770-9e0d-9cc91c6b84ea', '550e8400-e29b-41d4-a716-446655440000', '815c6978-8e4f-425d-9b20-6318d6eb88ca', '8d99fbf4-e71d-45b2-8eae-899d129c73c4', 'project', '8d99fbf4-e71d-45b2-8eae-899d129c73c4', 'stage_transition_bypass', 'Stage changed from Inquiry Received to Technical Review', NULL, NULL, NULL, NULL, '{"reason": "Manager bypass", "timestamp": "2025-09-22T11:35:51.873Z", "to_stage_id": "880e8400-e29b-41d4-a716-446655440002", "bypass_reason": "ok", "from_stage_id": "880e8400-e29b-41d4-a716-446655440001", "to_stage_name": "Technical Review", "bypass_required": true, "from_stage_name": "Inquiry Received", "estimated_duration_days": 3}', '2025-09-22 11:35:52.16047+00');


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

INSERT INTO "public"."contacts" ("id", "organization_id", "type", "company_name", "contact_name", "email", "phone", "address", "city", "state", "country", "postal_code", "website", "tax_id", "payment_terms", "credit_limit", "is_active", "role", "is_primary_contact", "notes", "created_at", "updated_at", "created_by") VALUES
	('42a65781-334e-40df-a9fd-3250f0e85009', '21d6bf72-f0a9-4217-b9b4-45c414337b1b', 'supplier', NULL, 'MS Tech', 'tri@mstech.vn', '+1-235-200-2708', '4938 Commerce St', 'Ho Chi Minh', 'Ho Chi Minh', 'Vietnam', '70000', 'https://mstech.vn', NULL, NULL, NULL, true, 'Primary Contact', true, NULL, '2025-09-22 06:31:06.224271+00', '2025-09-22 06:31:06.224271+00', '815c6978-8e4f-425d-9b20-6318d6eb88ca'),
	('6aba36e4-bc1f-46a5-be79-54753fc006c9', 'b8512c78-ebe7-4b5d-8225-435e39a49e72', 'supplier', NULL, 'MS Tech', 'tri@mstech.vn', '+1-235-200-2708', '4938 Commerce St', 'Ho Chi Minh', 'Ho Chi Minh', 'Vietnam', '70000', 'https://mstech.vn', NULL, NULL, NULL, true, 'Primary Contact', true, NULL, '2025-09-22 06:35:07.794094+00', '2025-09-22 06:35:07.794094+00', '815c6978-8e4f-425d-9b20-6318d6eb88ca'),
	('9a63f9db-aefa-4ebb-8ddc-c239baed127d', '3a10d8c5-effd-41eb-b848-b63fa4ac0e37', 'customer', NULL, 'Thien', 'thien@utechmanufacturing.com', '+14025557777', '18450 Sutter Blvd', 'Morgan Hill', 'CA', NULL, '95037', NULL, NULL, NULL, NULL, true, 'management', true, NULL, '2025-09-22 07:01:46.80167+00', '2025-09-22 07:01:46.80167+00', '815c6978-8e4f-425d-9b20-6318d6eb88ca'),
	('357a889b-f890-4360-8af9-c062a88c9622', '20523859-e1a1-4e9c-82aa-35211adc9279', 'customer', NULL, 'Jonne', 'jonne@abc.com', '+123434343432', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, true, NULL, '2025-09-22 07:07:38.517623+00', '2025-09-22 07:07:38.517623+00', '815c6978-8e4f-425d-9b20-6318d6eb88ca');


--
-- Data for Name: custom_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."documents" ("id", "organization_id", "project_id", "title", "description", "file_name", "file_path", "file_size", "mime_type", "category", "version_number", "is_current_version", "storage_provider", "checksum", "access_level", "tags", "metadata", "uploaded_by", "approved_by", "approved_at", "created_at", "updated_at") VALUES
	('1f196621-4b58-408f-9231-1bdcadd902e4', '550e8400-e29b-41d4-a716-446655440000', '8d99fbf4-e71d-45b2-8eae-899d129c73c4', '32368.pdf', NULL, '1758540669556_32368.pdf', '550e8400-e29b-41d4-a716-446655440000/8d99fbf4-e71d-45b2-8eae-899d129c73c4/1758540669556_32368.pdf', 180126, 'application/pdf', 'other', 1, true, 'supabase', NULL, 'private', '{}', '{"tags": [], "category": "other", "description": "", "access_level": "internal", "document_type": "drawing"}', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, NULL, '2025-09-22 11:31:11.617782+00', '2025-09-22 11:31:11.617782+00'),
	('01762cf4-6e62-4133-ab7c-7e5c065fe72e', '550e8400-e29b-41d4-a716-446655440000', '0580fdd5-e596-4536-a52c-c426cb821ac7', 'Drawing - 52356-00-Digihelic diagram.pdf', 'Uploaded Drawing document', '0580fdd5-e596-4536-a52c-c426cb821ac7/1758541509535_52356-00-Digihelic diagram.pdf', '0580fdd5-e596-4536-a52c-c426cb821ac7/1758541509535_52356-00-Digihelic diagram.pdf', 68919, 'application/pdf', 'drawing', 1, true, 'supabase', NULL, 'organization', '{drawing}', '{"upload_source": "intake_form", "original_file_name": "52356-00-Digihelic diagram.pdf"}', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, NULL, '2025-09-22 11:45:12.264397+00', '2025-09-22 11:45:12.264397+00'),
	('e6d48be2-6baf-462b-b508-a0843234d831', '550e8400-e29b-41d4-a716-446655440000', '0580fdd5-e596-4536-a52c-c426cb821ac7', 'BOM - List Gas line.xlsx', 'Uploaded BOM document', '0580fdd5-e596-4536-a52c-c426cb821ac7/1758541512669_List Gas line.xlsx', '0580fdd5-e596-4536-a52c-c426cb821ac7/1758541512669_List Gas line.xlsx', 351507, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'bom', 1, true, 'supabase', NULL, 'organization', '{bom}', '{"upload_source": "intake_form", "original_file_name": "List Gas line.xlsx"}', '815c6978-8e4f-425d-9b20-6318d6eb88ca', NULL, NULL, '2025-09-22 11:45:15.643421+00', '2025-09-22 11:45:15.643421+00');


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

INSERT INTO "public"."workflow_sub_stages" ("id", "organization_id", "workflow_stage_id", "name", "slug", "description", "color", "sub_stage_order", "is_active", "exit_criteria", "responsible_roles", "estimated_duration_hours", "is_required", "can_skip", "auto_advance", "requires_approval", "approval_roles", "metadata", "created_at", "updated_at") VALUES
	('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Initial Review', 'initial_review', 'Review customer requirements and feasibility', NULL, 1, true, NULL, '{sales,management}', 4, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Technical Assessment', 'technical_assessment', 'Assess technical requirements and capabilities', NULL, 2, true, NULL, '{engineering}', 8, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Cost Estimation', 'cost_estimation', 'Initial cost estimation and budget planning', NULL, 3, true, NULL, '{sales,procurement}', 6, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 'Design Review', 'design_review', 'Review design specifications and requirements', NULL, 1, true, NULL, '{engineering}', 16, true, false, false, true, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 'Quality Assessment', 'quality_assessment', 'Quality requirements and testing procedures', NULL, 2, true, NULL, '{qa}', 8, true, false, false, true, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 'Production Planning', 'production_planning', 'Production process planning and setup', NULL, 3, true, NULL, '{production}', 12, true, false, false, true, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003', 'Supplier Selection', 'supplier_selection', 'Select appropriate suppliers for components', NULL, 1, true, NULL, '{procurement}', 4, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003', 'RFQ Preparation', 'rfq_preparation', 'Prepare RFQ documents and specifications', NULL, 2, true, NULL, '{procurement}', 8, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003', 'RFQ Distribution', 'rfq_distribution', 'Send RFQ to selected suppliers', NULL, 3, true, NULL, '{procurement}', 2, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440006', 'Material Procurement', 'material_procurement', 'Procure required materials and components', NULL, 1, true, NULL, '{procurement}', 16, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440006', 'Quality Check', 'quality_check', 'Quality assurance and material inspection', NULL, 2, true, NULL, '{procurement,qa}', 8, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440006', 'Inventory Management', 'inventory_management', 'Manage material inventory and storage', NULL, 3, true, NULL, '{procurement}', 4, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440007', 'Setup', 'setup', 'Production setup and preparation', NULL, 1, true, NULL, '{production}', 8, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440007', 'Manufacturing', 'manufacturing', 'Main manufacturing process', NULL, 2, true, NULL, '{production}', 48, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440007', 'Quality Control', 'quality_control', 'Final quality control and testing', NULL, 3, true, NULL, '{production,qa}', 8, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('990e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440007', 'Packaging', 'packaging', 'Product packaging and preparation', NULL, 4, true, NULL, '{production}', 4, true, false, false, false, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00');


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

INSERT INTO "public"."workflow_definition_stages" ("id", "workflow_definition_id", "workflow_stage_id", "is_included", "stage_order_override", "responsible_roles_override", "estimated_duration_days_override", "requires_approval_override", "metadata", "created_at", "updated_at") VALUES
	('aaeba2d4-9581-4984-8c00-65533366831e', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440001', true, 1, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('6edf6696-995e-40e8-b007-0c0b12394682', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440002', true, 2, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('25601f7d-bd51-410a-8416-8565d2a994fd', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440003', true, 3, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('b90c4f51-a133-47a9-b969-570e01ddbf71', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440004', true, 4, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('17e46cb3-246f-4b1e-b6a6-40af43542c68', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440005', true, 5, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('1a9a2c8d-f52f-46c1-926f-6f32f0136f41', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440006', true, 6, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('063b5946-9f96-4fcd-833f-91a1efaf8752', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440007', true, 7, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('fcdb4b88-6d50-47aa-9992-445ddd22b40c', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440008', true, 8, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00');


--
-- Data for Name: workflow_definition_sub_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."workflow_definition_sub_stages" ("id", "workflow_definition_id", "workflow_sub_stage_id", "is_included", "sub_stage_order_override", "responsible_roles_override", "requires_approval_override", "can_skip_override", "auto_advance_override", "estimated_duration_hours_override", "metadata", "created_at", "updated_at") VALUES
	('a0429fa8-b5fa-4521-b39d-b2e0676fb7f5', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440003', true, 3, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('6108eeed-707e-489c-b872-401f5427994b', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440004', true, 1, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('684618c7-d2fb-4735-ae4b-7a1e1e07be5d', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440001', true, 1, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('eaf9ea4f-1845-44f2-95b9-2fb4b854400b', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440012', true, 3, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('931b45e3-42eb-47f3-a598-25ddddb2a354', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440014', true, 2, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('a3654781-14c0-49a4-abbb-6fb443c93844', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440010', true, 1, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('e9e83753-cf85-4555-8a72-847d1ff77065', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440016', true, 4, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('7860ed8f-32f4-410c-8cfa-b0d013106c29', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440006', true, 3, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('30416db6-be1b-4f25-845f-f8308f94cc74', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440005', true, 2, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('cdf08be2-9670-4d5d-833c-c0c4ecdb4aff', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440011', true, 2, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('3f8330c5-c351-44ad-a7e7-d689d8539546', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440015', true, 3, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('67ee1094-ac4f-4f8e-b57e-7224489464f0', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440009', true, 3, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('f80b036e-8b55-4d97-ab0b-bcbf8d10f8c9', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440008', true, 2, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('313f978e-be58-486f-bc15-76f62637ae94', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440013', true, 1, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('8c74a6f6-bf0d-4630-b920-1a1325046810', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440007', true, 1, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00'),
	('4dfb114d-7c4a-46da-bdca-a122f2091fbe', '5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '990e8400-e29b-41d4-a716-446655440002', true, 2, NULL, NULL, NULL, NULL, NULL, '{}', '2025-09-22 09:53:55.597983+00', '2025-09-22 09:53:55.597983+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('rfq-attachments', 'rfq-attachments', NULL, '2025-08-22 00:36:27.915622+00', '2025-08-22 00:36:27.915622+00', false, false, 52428800, '{image/jpeg,image/png,image/gif,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip,application/x-zip-compressed,model/step,model/iges,application/octet-stream}', NULL, 'STANDARD'),
	('documents', 'documents', NULL, '2025-09-22 11:07:11.279396+00', '2025-09-22 11:07:11.279396+00', false, false, 104857600, '{application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,image/gif,text/plain,application/zip,application/x-zip-compressed,application/octet-stream}', NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('fcd7adb0-542f-4b78-99b7-b80c1df1a4f1', 'rfq-attachments', 'temp/1755823715154_cs9rvgkf6v.png', '5dc17cbb-4b76-41c1-a292-d1f1b9ca2e2a', '2025-08-22 00:48:36.327981+00', '2025-08-22 00:48:37.424337+00', '2025-08-22 00:48:36.327981+00', '{"eTag": "\"e9ea0eebf0d79538a4318a4089d10412\"", "size": 43048, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-22T00:48:37.000Z", "contentLength": 43048, "httpStatusCode": 200}', '709b4f43-8c25-47b6-8204-91ae8f6184b9', '5dc17cbb-4b76-41c1-a292-d1f1b9ca2e2a', '{}', 2),
	('5c77e35e-c140-4da1-9526-71981d7a9c6b', 'documents', '550e8400-e29b-41d4-a716-446655440000/8d99fbf4-e71d-45b2-8eae-899d129c73c4/1758540669556_32368.pdf', NULL, '2025-09-22 11:31:11.230109+00', '2025-09-22 11:31:11.230109+00', '2025-09-22 11:31:11.230109+00', '{"eTag": "\"4554648ddb7417f85487cfd1b3b69912\"", "size": 180126, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-22T11:31:12.000Z", "contentLength": 180126, "httpStatusCode": 200}', '9d161f25-00f7-48ce-bd9a-a1c2d7fa4294', NULL, '{}', 3),
	('a4e0352b-227f-44fb-b6af-a30c01550b87', 'documents', '0580fdd5-e596-4536-a52c-c426cb821ac7/1758541509535_52356-00-Digihelic diagram.pdf', NULL, '2025-09-22 11:45:10.915674+00', '2025-09-22 11:45:10.915674+00', '2025-09-22 11:45:10.915674+00', '{"eTag": "\"067cedf215e725f3d0028091f9bb4928\"", "size": 68919, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-22T11:45:11.000Z", "contentLength": 68919, "httpStatusCode": 200}', 'f2e99ede-9898-4854-82fb-8bc9c884a2fa', NULL, '{}', 2),
	('37dc2ff7-8f36-4bfb-8137-e9845690a7c6', 'documents', '0580fdd5-e596-4536-a52c-c426cb821ac7/1758541512669_List Gas line.xlsx', NULL, '2025-09-22 11:45:14.515861+00', '2025-09-22 11:45:14.515861+00', '2025-09-22 11:45:14.515861+00', '{"eTag": "\"c9665dd1d4e8c4869371f6b7cafa29d7\"", "size": 351507, "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "cacheControl": "max-age=3600", "lastModified": "2025-09-22T11:45:15.000Z", "contentLength": 351507, "httpStatusCode": 200}', 'c28d6513-c2d8-4e46-89ae-4ea6fa5e6672', NULL, '{}', 2);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('rfq-attachments', 'temp', '2025-08-22 00:48:37.417119+00', '2025-08-22 00:48:37.417119+00'),
	('documents', '550e8400-e29b-41d4-a716-446655440000', '2025-09-22 11:31:11.230109+00', '2025-09-22 11:31:11.230109+00'),
	('documents', '550e8400-e29b-41d4-a716-446655440000/8d99fbf4-e71d-45b2-8eae-899d129c73c4', '2025-09-22 11:31:11.230109+00', '2025-09-22 11:31:11.230109+00'),
	('documents', '0580fdd5-e596-4536-a52c-c426cb821ac7', '2025-09-22 11:45:10.915674+00', '2025-09-22 11:45:10.915674+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 155, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
