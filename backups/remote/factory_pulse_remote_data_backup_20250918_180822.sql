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
	('00000000-0000-0000-0000-000000000000', '8d75c029-7f31-46f2-822f-83a47ed5f607', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-07 12:45:33.551575+00', ''),
	('00000000-0000-0000-0000-000000000000', '084a842e-68e5-4889-acb3-533bad4d3deb', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-07 13:41:55.63613+00', ''),
	('00000000-0000-0000-0000-000000000000', '216126e3-e4d1-4cff-a1c6-db1886ae502b', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-07 13:41:55.636922+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5a20596-7ee1-4fa4-989c-c163a6c6d3dd', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-07 14:24:39.032586+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d1f3bce-4168-493f-b7c9-30dac02ae1b9', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-07 14:24:39.035335+00', ''),
	('00000000-0000-0000-0000-000000000000', '01f6a2f1-f1ea-4863-94f5-3324f9f3150d', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 00:14:55.810189+00', ''),
	('00000000-0000-0000-0000-000000000000', '2dfdc0fd-260f-4dd2-8863-09fb6c8d626e', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 00:14:55.810822+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e64a9edd-274d-45be-bca8-5a7f1dc5a036', '{"action":"logout","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-08 00:36:39.466854+00', ''),
	('00000000-0000-0000-0000-000000000000', '36924439-6a33-4433-8479-af2296e3994b', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-08 00:45:05.435213+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fbc9207b-a0c8-409d-867a-e019565067eb', '{"action":"token_refreshed","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 01:43:18.002966+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a0c97596-ac44-4681-9e97-c1ffbb1f5604', '{"action":"token_revoked","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 01:43:18.004318+00', ''),
	('00000000-0000-0000-0000-000000000000', '263331f3-7de2-492e-8acd-4ebb9c07ccc5', '{"action":"token_refreshed","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 02:43:58.017401+00', ''),
	('00000000-0000-0000-0000-000000000000', '0ad1d33e-72db-4e54-b7eb-a35c031d8733', '{"action":"token_revoked","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 02:43:58.018242+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd8d7166b-0e75-4386-8115-d2353d2696b6', '{"action":"logout","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-08 02:43:58.046817+00', ''),
	('00000000-0000-0000-0000-000000000000', '7aecf523-4b9b-440b-82dc-e3fd14b2dd16', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-08 05:36:40.642025+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ded859df-0c14-4110-9823-fe272e07e601', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-08 05:37:12.682416+00', ''),
	('00000000-0000-0000-0000-000000000000', '9aab98ea-b141-4fcd-b1fb-eeddf924ae8a', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-08 05:42:41.635919+00', ''),
	('00000000-0000-0000-0000-000000000000', '3aade859-de61-40b1-81c6-a18b23c1da58', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-08 05:51:11.002562+00', ''),
	('00000000-0000-0000-0000-000000000000', '46ed008a-c7de-4b86-b8d8-2d7062817eb6', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-08 05:55:10.5023+00', ''),
	('00000000-0000-0000-0000-000000000000', '63f06f63-c0bd-4569-8510-a524ca79cc60', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-08 05:55:46.588415+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd798e47c-3e87-414a-8cea-787e96c75f5c', '{"action":"token_refreshed","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 06:54:12.425508+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7f08296-042d-4199-beb7-a4b4e49a16a3', '{"action":"token_revoked","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 06:54:12.426336+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ae6b1d7d-7626-4cea-b8c0-ea3f9af0dcd8', '{"action":"token_refreshed","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 07:52:23.993917+00', ''),
	('00000000-0000-0000-0000-000000000000', '2980fcc4-d09e-49ed-bbb5-89bcd57fe161', '{"action":"token_revoked","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 07:52:23.994921+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd15893b4-c0e4-484b-b9f2-d3849abca3da', '{"action":"token_refreshed","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 08:50:26.593858+00', ''),
	('00000000-0000-0000-0000-000000000000', '15339ff8-a3c3-4164-bfba-bcfbfcffcf90', '{"action":"token_revoked","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 08:50:26.594653+00', ''),
	('00000000-0000-0000-0000-000000000000', '2b7f9aa9-4dca-47cd-b28f-99b916154e95', '{"action":"token_refreshed","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 09:51:13.354818+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3213b58-12ef-4279-b35a-d34a5773132d', '{"action":"token_revoked","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 09:51:13.355431+00', ''),
	('00000000-0000-0000-0000-000000000000', '52717661-193b-4120-a9ea-c2e5c5abb60d', '{"action":"logout","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-08 09:51:13.558963+00', ''),
	('00000000-0000-0000-0000-000000000000', '3567a78f-7b4a-40df-8544-6a7b4a679655', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-08 09:52:34.797896+00', ''),
	('00000000-0000-0000-0000-000000000000', '254010a2-9281-4d9b-96fe-6dc2a596aac2', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 10:50:43.491187+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e76216f-da25-4313-9893-9bf894145571', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 10:50:43.491691+00', ''),
	('00000000-0000-0000-0000-000000000000', '76dd42cf-eafa-4898-976a-798f5561fcf8', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 12:32:45.268898+00', ''),
	('00000000-0000-0000-0000-000000000000', '606aa708-a993-45d5-a068-269019d03b46', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 12:32:45.269866+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6a429f9-dc44-48bd-a257-a3c0fc16c0e5', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 13:31:05.139639+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd9251611-679a-4c92-aad2-40c352199f31', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 13:31:05.140255+00', ''),
	('00000000-0000-0000-0000-000000000000', '428f682c-5017-44e3-8d24-c9a637523cf2', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 14:29:59.733756+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ce6da01-ba8e-4aee-8116-2ebc413d0d6c', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 14:29:59.734519+00', ''),
	('00000000-0000-0000-0000-000000000000', '01387883-21f1-4784-97f8-6638a5ac8c38', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 15:28:39.646092+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b0625e6a-c361-4ee1-9765-ce30ad8090cb', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 15:28:39.647549+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b25f46d-3b7d-4891-b18e-b95c6a986290', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 16:14:12.608135+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c9364d7c-30e1-44fb-b39e-7e5cfadf8cdc', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 16:14:12.609198+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dae80473-115e-4643-b9f1-82c4c393e167', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 17:41:08.231629+00', ''),
	('00000000-0000-0000-0000-000000000000', '5e1f9c7f-f18d-44cc-9ecc-c2f04dbe83d6', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-08 17:41:08.232153+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc6266bf-e5b4-4b87-bcbb-0a1b56514060', '{"action":"logout","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-08 17:41:08.503724+00', ''),
	('00000000-0000-0000-0000-000000000000', '99c5f152-26df-456a-b777-f23480cb3d5d', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-08 22:56:34.318051+00', ''),
	('00000000-0000-0000-0000-000000000000', '09a52317-299c-463c-bd1c-da917ac8d5a0', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 00:07:59.205872+00', ''),
	('00000000-0000-0000-0000-000000000000', '4997dc7c-d0f9-4942-a89d-f90422686485', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 00:07:59.206888+00', ''),
	('00000000-0000-0000-0000-000000000000', '94116383-93ba-447f-8f25-9354adf3c1c0', '{"action":"logout","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-09 00:07:59.282426+00', ''),
	('00000000-0000-0000-0000-000000000000', '2628fac5-4968-4c53-8f10-acad3af6f423', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-09 00:08:19.668821+00', ''),
	('00000000-0000-0000-0000-000000000000', '05c944e7-a86a-4bf1-a2be-69b7fe004cea', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 09:06:47.576199+00', ''),
	('00000000-0000-0000-0000-000000000000', '30a99527-06d3-430d-a72a-aca2a065dc1e', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 09:06:47.576918+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b44f5e2-03c8-4374-b123-b72f120a9178', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 10:05:33.428076+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad980822-1ed4-4817-950f-2231d2acfaff', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 10:05:33.429137+00', ''),
	('00000000-0000-0000-0000-000000000000', '81f116bc-3707-456b-8e6c-07b243f6ffe0', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 11:04:07.361193+00', ''),
	('00000000-0000-0000-0000-000000000000', '1eff3024-8567-411e-a5c7-d3532c4c2be7', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 11:04:07.364041+00', ''),
	('00000000-0000-0000-0000-000000000000', '6578e569-b1f0-4862-b104-e35803e18dad', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 12:03:36.313208+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4962bbb-7cf3-4568-a192-049f41bf4590', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 12:03:36.316456+00', ''),
	('00000000-0000-0000-0000-000000000000', '06a620a8-3239-4ea1-a82c-14d2358da137', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-09 13:07:24.178574+00', ''),
	('00000000-0000-0000-0000-000000000000', '82b127bc-504d-43ce-b16f-bacf7eb6545f', '{"action":"logout","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-09 13:07:24.300862+00', ''),
	('00000000-0000-0000-0000-000000000000', '64b1ab8b-52a2-4815-9022-84933f5f3e65', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-09 13:13:10.894742+00', ''),
	('00000000-0000-0000-0000-000000000000', '02fe28db-916c-4668-93b5-466289698c28', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 14:12:36.380132+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a101b1fe-07cb-4569-8eb3-251a922dc20e', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 14:12:36.380838+00', ''),
	('00000000-0000-0000-0000-000000000000', '4637783f-9328-44c8-8dd5-34a0c0d79e74', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.414398+00', ''),
	('00000000-0000-0000-0000-000000000000', '6b0de1ab-ebf3-44ce-a03f-0c98d8ddc1cb', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.415514+00', ''),
	('00000000-0000-0000-0000-000000000000', '4def4f42-ba74-4a82-9f48-ebbdc32d00c1', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.457284+00', ''),
	('00000000-0000-0000-0000-000000000000', '239f470c-89f1-471f-a96a-2a9c23a6d073', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.458521+00', ''),
	('00000000-0000-0000-0000-000000000000', '452a28e9-4b10-431d-8ccf-772000e4fb89', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.49627+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e7927a92-a500-487a-84f7-e92cc36194fe', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.497013+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e0f70a3d-c771-4493-8e5a-7cdc8b43624e', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.548343+00', ''),
	('00000000-0000-0000-0000-000000000000', '384c0948-abcd-4afd-8bba-6ef2211b0798', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.549882+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ccae7bbe-603a-417e-8c28-ee20cf2a25b4', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.648099+00', ''),
	('00000000-0000-0000-0000-000000000000', '0cab4804-d00a-4338-ae30-fc33265c4e74', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.648549+00', ''),
	('00000000-0000-0000-0000-000000000000', '9823dc05-0ed5-4844-a3de-d2248d208346', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.671504+00', ''),
	('00000000-0000-0000-0000-000000000000', '174352c1-d227-45f4-9619-2c280a556b73', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.672471+00', ''),
	('00000000-0000-0000-0000-000000000000', '38fcbf6f-8665-4eb4-afda-c565f3b145b7', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.69349+00', ''),
	('00000000-0000-0000-0000-000000000000', '54059584-915c-4698-8129-2eeb87d887e4', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.69571+00', ''),
	('00000000-0000-0000-0000-000000000000', '403e9a19-e4a4-4092-bae4-f5dd2c5ca29a', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.724539+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd45a14ce-d58f-444c-adb3-ac9b66f5515f', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.727562+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d916366-cbc2-4164-bef0-ea009bdfaa61', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.755913+00', ''),
	('00000000-0000-0000-0000-000000000000', '6d0d6309-22aa-4d27-b2bb-5deeaa37dbbc', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.757497+00', ''),
	('00000000-0000-0000-0000-000000000000', '2b58b604-afac-4b22-abd0-df420ff2358b', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.824112+00', ''),
	('00000000-0000-0000-0000-000000000000', '0abadc12-d23c-41b8-81f2-8cae01afd485', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.825227+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ff4e43b-ee68-4820-8c74-494968555e41', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.855491+00', ''),
	('00000000-0000-0000-0000-000000000000', '160a13a5-4be4-47e4-ab6a-275fede101d9', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.857811+00', ''),
	('00000000-0000-0000-0000-000000000000', '52e7942b-bbdb-471e-9f4a-8dde43bd7693', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.894799+00', ''),
	('00000000-0000-0000-0000-000000000000', '70d58d71-74f5-4afc-bc4c-9d29f15851cb', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.896166+00', ''),
	('00000000-0000-0000-0000-000000000000', '8830ca1e-30cc-4864-8c07-91023ddeca78', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.917719+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bc3e5462-5acd-4359-8817-6c458b4ad194', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.918959+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a0df9030-7f63-446d-8b26-6184cb6f5fde', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.945024+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc2e5866-7519-416c-86ab-c2dde9fb3032', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.949805+00', ''),
	('00000000-0000-0000-0000-000000000000', '331c792a-f35b-481c-85ef-c7864b6edb20', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.995181+00', ''),
	('00000000-0000-0000-0000-000000000000', '493ce877-7071-45b1-9305-339909f94252', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:06.996203+00', ''),
	('00000000-0000-0000-0000-000000000000', '00af382f-a233-4cf5-ba6b-534f9d5e9263', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:07.017983+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c64e438f-b541-4540-896d-1bdb6df55f19', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:07.019695+00', ''),
	('00000000-0000-0000-0000-000000000000', '57a4ee97-46aa-4e08-8d82-dbfdb36937d1', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:07.04929+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cf600970-62bc-45d1-9361-c1588b5cc95e', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:07.051129+00', ''),
	('00000000-0000-0000-0000-000000000000', '884198ba-8c8a-426d-b408-c12e2b4ae14b', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:07.078228+00', ''),
	('00000000-0000-0000-0000-000000000000', '7282f688-8888-44ff-90ba-efff9ad0a7d3', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:07.088997+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad612c91-5ab1-476d-8db7-58271aea5b8f', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:07.109969+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a3ca81ef-569f-4b51-a74e-8f4258978161', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 18:28:07.111306+00', ''),
	('00000000-0000-0000-0000-000000000000', '033060f3-719f-48af-b694-ca45a5e1fd89', '{"action":"logout","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-09 18:28:07.128337+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ab5df528-94e9-4dfd-a825-2dcd86009237', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-10 02:43:21.671353+00', ''),
	('00000000-0000-0000-0000-000000000000', '62a5a24c-1d36-4793-86f3-c82567828fb0', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 03:41:35.618261+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec65b2b8-77fa-45a3-885c-394a3370c5eb', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 03:41:35.618893+00', ''),
	('00000000-0000-0000-0000-000000000000', '0c700df3-ee14-41a9-9f92-0316f535bc43', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 04:39:47.607343+00', ''),
	('00000000-0000-0000-0000-000000000000', '395b48e7-f74a-4e2a-adce-663d5a8c6996', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 04:39:47.607879+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd5fce131-7156-4161-96b1-426f5ffbdcf5', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 05:37:50.695787+00', ''),
	('00000000-0000-0000-0000-000000000000', '36433e94-5d34-4701-b40a-4be9e975c46e', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 05:37:50.696326+00', ''),
	('00000000-0000-0000-0000-000000000000', '301ca0f6-6660-43a0-b7db-18ef329ccbbf', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 06:36:08.045459+00', ''),
	('00000000-0000-0000-0000-000000000000', '93e971a8-391e-4125-bc01-1fec4935939c', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 06:36:08.046212+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f17345c-faaf-44c1-b249-e7bc3677f639', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 07:51:41.681754+00', ''),
	('00000000-0000-0000-0000-000000000000', '3015f290-79e7-4eca-820b-94a28e392ce5', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 07:51:41.688297+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2183eb5-0265-488f-a744-071972551c43', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 08:51:33.598991+00', ''),
	('00000000-0000-0000-0000-000000000000', '63ed2f5d-8ea2-4f7e-8a23-45e96294bd00', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 08:51:33.602014+00', ''),
	('00000000-0000-0000-0000-000000000000', '50979daa-b8b9-4dec-ae5a-c453883021de', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 09:49:55.817659+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3537b40-f976-4bc9-b245-4afc2a9f4de2', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 09:49:55.818377+00', ''),
	('00000000-0000-0000-0000-000000000000', '4126ca5d-b1de-4718-bd2b-c54a0d6a5ee5', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 10:47:01.604793+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af97fe36-02d5-4ef0-aa1f-48ce3c665675', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 10:47:01.607211+00', ''),
	('00000000-0000-0000-0000-000000000000', '67cbc244-ff78-472f-8de5-7ddd287e64d7', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 11:45:06.801138+00', ''),
	('00000000-0000-0000-0000-000000000000', '09133407-b7dc-4546-913a-c8bfc8abc0ee', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 11:45:06.801816+00', ''),
	('00000000-0000-0000-0000-000000000000', '8478a7fa-0435-4749-8431-aeb75525604c', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 12:43:37.993401+00', ''),
	('00000000-0000-0000-0000-000000000000', '1b10159f-983f-4f2e-9521-de2400184c6f', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 12:43:37.99528+00', ''),
	('00000000-0000-0000-0000-000000000000', '17424432-ce22-4fcc-b137-f41583071aa7', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 13:41:50.045819+00', ''),
	('00000000-0000-0000-0000-000000000000', '9bee7ad2-9441-4288-8d32-a7041397a441', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 13:41:50.047002+00', ''),
	('00000000-0000-0000-0000-000000000000', '06b724fb-bc52-42ec-9239-71c04e00c2f2', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 14:39:54.167654+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e2f9e7c-1cae-43b6-bc1e-7e3d584f470c', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-10 14:39:54.168488+00', ''),
	('00000000-0000-0000-0000-000000000000', '4f4235e5-c81e-48e8-9290-537536d110e7', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-11 04:59:41.052263+00', ''),
	('00000000-0000-0000-0000-000000000000', '8f869efe-616b-481d-9278-d8d7ef064485', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-11 04:59:41.056307+00', ''),
	('00000000-0000-0000-0000-000000000000', '8f04ca69-6225-4254-9747-421fd5811c02', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-11 05:58:15.87321+00', ''),
	('00000000-0000-0000-0000-000000000000', '57c50694-3a06-438a-a272-e8d27b1ea69b', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-11 05:58:15.874193+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc79d1b3-0b8e-4457-b111-284a354ac8e5', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-11 23:00:25.659397+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e14734e-e2b1-407c-8648-4cfde9458b96', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-11 23:00:25.660707+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb12d96a-c86c-430b-b09b-18280c52a3b0', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-11 23:58:54.447865+00', ''),
	('00000000-0000-0000-0000-000000000000', '6579e7d5-a064-408b-b4e7-4293ce616b64', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-11 23:58:54.448725+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c35b4bc0-dfc9-4060-ac5a-195e947d0f07', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-12 00:57:07.352981+00', ''),
	('00000000-0000-0000-0000-000000000000', '5cdf6473-f114-4cf4-a147-01d7975a6c9d', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-12 00:57:07.353938+00', ''),
	('00000000-0000-0000-0000-000000000000', '7e81e547-d43d-45de-83a1-067034098290', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-12 02:12:53.155593+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec0f809e-a89c-4183-90ed-261c782ecfa5', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-12 02:12:53.157181+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad869366-a8ce-43b7-ad28-21af782b30b7', '{"action":"logout","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-12 02:12:53.239186+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a46d309b-c415-4039-b3b3-abef63677354', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-12 02:13:21.053402+00', ''),
	('00000000-0000-0000-0000-000000000000', '318a0d5d-696b-4482-8bce-9e9cc30c2b82', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-12 03:03:44.59357+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a476375c-7c48-4bf2-a34e-6d3004e5f760', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-12 03:03:44.595646+00', ''),
	('00000000-0000-0000-0000-000000000000', '0882b953-0e6d-45c3-b2a0-082dfb5efd4d', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-12 04:02:03.016625+00', ''),
	('00000000-0000-0000-0000-000000000000', '28da308f-c223-4b35-bc45-681122fcbdef', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-12 04:02:03.017613+00', ''),
	('00000000-0000-0000-0000-000000000000', '852a73ad-47dc-46f7-a4e7-93ff34c35db0', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-12 05:00:10.773177+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b0438aae-f5d0-43b0-903c-2d9016c8d4c9', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-12 05:00:10.773953+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b72e6252-d489-4404-aee2-dd5f6588f49f', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-13 02:47:06.098328+00', ''),
	('00000000-0000-0000-0000-000000000000', '3fc464a6-f754-4b96-af8f-10462195ddc9', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-15 06:24:50.917099+00', ''),
	('00000000-0000-0000-0000-000000000000', '702e26d5-dc07-4f5b-bf15-2389ff44d884', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-15 06:24:50.917982+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ee276e85-f1ea-46ae-b7a8-16181d8607aa', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-15 07:25:40.156243+00', ''),
	('00000000-0000-0000-0000-000000000000', '7cc61d6b-5504-458a-b808-c6ba7652915d', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-15 07:25:40.157061+00', ''),
	('00000000-0000-0000-0000-000000000000', '5ca73ca6-2533-4c4d-9766-6ca8c3a9a48e', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-15 08:23:55.415894+00', ''),
	('00000000-0000-0000-0000-000000000000', '0504704f-a318-4411-9bb0-76f45b00eb57', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-15 08:23:55.416875+00', ''),
	('00000000-0000-0000-0000-000000000000', '1c99749e-5f33-45eb-a9b0-684f6f50758f', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-15 09:22:25.252105+00', ''),
	('00000000-0000-0000-0000-000000000000', '2602547d-5e79-430c-be71-1f29426321df', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-15 09:22:25.253049+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f7f9143-03f6-40c2-89af-bcb24cef4278', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-15 10:22:58.961623+00', ''),
	('00000000-0000-0000-0000-000000000000', '986ccf67-b9bb-4335-a22b-7c8e8ff313ad', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-15 10:22:58.962572+00', ''),
	('00000000-0000-0000-0000-000000000000', '985948a6-17b0-485d-a73b-b530bfe29829', '{"action":"logout","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-15 10:22:59.003854+00', ''),
	('00000000-0000-0000-0000-000000000000', '9d48f1c3-e325-424e-8768-5f5dab0ee0ac', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-15 10:30:04.593608+00', ''),
	('00000000-0000-0000-0000-000000000000', '96bde0b2-d138-48b1-bade-fda18ee4f89a', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 05:39:15.700771+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e6d314cc-51a1-4912-9b06-8306641c9f0f', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 05:39:15.70616+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b91b5e9e-4495-4eb9-b51e-8b2035808e6a', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 06:37:55.945528+00', ''),
	('00000000-0000-0000-0000-000000000000', '4d017e32-b9c1-4b32-a655-fad0ae37de4d', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 06:37:55.94617+00', ''),
	('00000000-0000-0000-0000-000000000000', '361bdd64-72a5-4840-beb5-a037cf84f934', '{"action":"user_signedup","actor_id":"1683a856-b3c2-4517-8d82-3f6becda3813","actor_username":"test.user@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:15:54.202221+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f745e6c-af77-4435-8e53-a24329dac8c0', '{"action":"login","actor_id":"1683a856-b3c2-4517-8d82-3f6becda3813","actor_username":"test.user@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:15:54.21433+00', ''),
	('00000000-0000-0000-0000-000000000000', '5c81b970-32d0-4004-974b-4555ba02cb2d', '{"action":"login","actor_id":"1683a856-b3c2-4517-8d82-3f6becda3813","actor_username":"test.user@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:15:57.131244+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1afb95c-4d62-4b59-8a58-73e4b975c783', '{"action":"user_signedup","actor_id":"99436219-df0f-47be-a3e9-a58d7ba6a195","actor_username":"dinh.van.g@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:16:20.421181+00', ''),
	('00000000-0000-0000-0000-000000000000', '4a70a90f-73b4-4bf8-9425-4c2d760dbda9', '{"action":"login","actor_id":"99436219-df0f-47be-a3e9-a58d7ba6a195","actor_username":"dinh.van.g@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:16:20.424332+00', ''),
	('00000000-0000-0000-0000-000000000000', '11f7f919-d7b1-4085-a4bb-10bac155b320', '{"action":"user_signedup","actor_id":"e5722240-2856-4371-97f7-14ec83f887d0","actor_username":"hoang.van.e@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:16:35.09564+00', ''),
	('00000000-0000-0000-0000-000000000000', '9962ebda-b6c7-48de-92ae-043c5aee2f30', '{"action":"login","actor_id":"e5722240-2856-4371-97f7-14ec83f887d0","actor_username":"hoang.van.e@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:16:35.097042+00', ''),
	('00000000-0000-0000-0000-000000000000', '94c1a065-7438-4098-8c35-67b76794e532', '{"action":"login","actor_id":"99436219-df0f-47be-a3e9-a58d7ba6a195","actor_username":"dinh.van.g@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:17:05.285941+00', ''),
	('00000000-0000-0000-0000-000000000000', '18b71836-11a2-43ce-b750-bf5ad23e0d23', '{"action":"login","actor_id":"e5722240-2856-4371-97f7-14ec83f887d0","actor_username":"hoang.van.e@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:17:08.090592+00', ''),
	('00000000-0000-0000-0000-000000000000', '7c5bcf02-5572-4417-9fb6-b6ab313dd54e', '{"action":"login","actor_id":"99436219-df0f-47be-a3e9-a58d7ba6a195","actor_username":"dinh.van.g@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:21:02.509733+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f6b0423f-3b2e-4130-8bd4-76e856d5c160', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:22:20.477958+00', ''),
	('00000000-0000-0000-0000-000000000000', '41410fe5-3df2-45b0-a327-0944e493e99d', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:22:30.500502+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f4740a5-dc90-4597-b341-6b2fdc4bed85', '{"action":"user_signedup","actor_id":"5c15f93c-5cfc-41b8-8aee-b7fed47c50f5","actor_username":"john.smith@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:25:38.650563+00', ''),
	('00000000-0000-0000-0000-000000000000', '72e78a64-5d51-4c4c-bf02-d8880326bffa', '{"action":"login","actor_id":"5c15f93c-5cfc-41b8-8aee-b7fed47c50f5","actor_username":"john.smith@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:25:38.653119+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9108dc6-04ba-444a-8be2-4bcb3f3e20d5', '{"action":"user_signedup","actor_id":"2ec906ce-38c7-4f13-8bc1-72805f0babb1","actor_username":"mary.johnson@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:25:40.69003+00', ''),
	('00000000-0000-0000-0000-000000000000', '42be12c1-0444-4988-83e0-286f33abb3ff', '{"action":"login","actor_id":"2ec906ce-38c7-4f13-8bc1-72805f0babb1","actor_username":"mary.johnson@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:25:40.69214+00', ''),
	('00000000-0000-0000-0000-000000000000', '44c2d445-e480-4903-a627-a7127bb057a4', '{"action":"user_signedup","actor_id":"7eceb5b5-eb6f-484b-8601-6fd29b4ee543","actor_username":"tran.thi.b@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:25:47.578088+00', ''),
	('00000000-0000-0000-0000-000000000000', '613136cb-4912-46a5-928a-6632887a8d60', '{"action":"login","actor_id":"7eceb5b5-eb6f-484b-8601-6fd29b4ee543","actor_username":"tran.thi.b@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:25:47.579654+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd9406ac-f5e1-457f-889e-1469fc1381a2', '{"action":"user_signedup","actor_id":"951f0ab8-b36b-44e4-90f3-057fc332d8cb","actor_username":"le.van.c@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:25:47.651028+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f40bd0c0-f61a-4fde-8260-a6c8f423164a', '{"action":"login","actor_id":"951f0ab8-b36b-44e4-90f3-057fc332d8cb","actor_username":"le.van.c@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:25:47.652606+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c7e6ed9d-dc0b-442a-a128-21756a254a11', '{"action":"user_signedup","actor_id":"b6181435-15ac-4934-9042-8e68b4526449","actor_username":"pham.thi.d@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:25:47.71554+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f60f3bd-8b70-45b8-b34e-ead883697025', '{"action":"login","actor_id":"b6181435-15ac-4934-9042-8e68b4526449","actor_username":"pham.thi.d@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:25:47.717039+00', ''),
	('00000000-0000-0000-0000-000000000000', '33339944-66cf-4b8f-b678-43e9fa4e5a0d', '{"action":"logout","actor_id":"99436219-df0f-47be-a3e9-a58d7ba6a195","actor_username":"dinh.van.g@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-16 07:26:45.295147+00', ''),
	('00000000-0000-0000-0000-000000000000', '10fd34e2-348a-4000-b47d-0f11d8ecf4d4', '{"action":"user_signedup","actor_id":"f13a197f-503b-4796-8b90-3aefeb63a3c2","actor_username":"vu.thi.f@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:27:14.745028+00', ''),
	('00000000-0000-0000-0000-000000000000', '32963f62-9f30-490a-b45e-f7c79d2ea3e4', '{"action":"login","actor_id":"f13a197f-503b-4796-8b90-3aefeb63a3c2","actor_username":"vu.thi.f@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:27:14.746664+00', ''),
	('00000000-0000-0000-0000-000000000000', '111f04ab-1f75-45d8-9014-061016e4c481', '{"action":"user_signedup","actor_id":"6bd01c71-c9e5-40dc-82b2-10635a775963","actor_username":"bui.thi.h@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:27:14.815714+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aa576e1f-d915-400e-986e-399fc8ece2e3', '{"action":"login","actor_id":"6bd01c71-c9e5-40dc-82b2-10635a775963","actor_username":"bui.thi.h@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:27:14.817986+00', ''),
	('00000000-0000-0000-0000-000000000000', '084145e0-65c1-41ed-b6ee-2f16dca51fa4', '{"action":"user_signedup","actor_id":"ca1db5ee-f706-4753-82b3-a578fb259db3","actor_username":"do.thi.j@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:27:14.880275+00', ''),
	('00000000-0000-0000-0000-000000000000', '927513bb-ad90-43b5-bc0f-78c141871b44', '{"action":"login","actor_id":"ca1db5ee-f706-4753-82b3-a578fb259db3","actor_username":"do.thi.j@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:27:14.88184+00', ''),
	('00000000-0000-0000-0000-000000000000', '0d958583-756e-416e-a4e3-69589bca9b48', '{"action":"user_signedup","actor_id":"025f70ae-8fe5-44c1-af1d-741c31af7d0b","actor_username":"ly.van.k@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:27:24.495849+00', ''),
	('00000000-0000-0000-0000-000000000000', '267d20db-b84b-461f-85df-b9e62849f524', '{"action":"login","actor_id":"025f70ae-8fe5-44c1-af1d-741c31af7d0b","actor_username":"ly.van.k@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:27:24.49829+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a2775160-2ddb-4a65-870a-d7e085d8f82b', '{"action":"user_signedup","actor_id":"c67b1f45-7caa-4a75-b641-34408efc3c3f","actor_username":"ngo.van.i@apillis.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-09-16 07:27:24.563365+00', ''),
	('00000000-0000-0000-0000-000000000000', '9d739690-8c74-4d83-8d4e-9355d1bf938b', '{"action":"login","actor_id":"c67b1f45-7caa-4a75-b641-34408efc3c3f","actor_username":"ngo.van.i@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:27:24.566424+00', ''),
	('00000000-0000-0000-0000-000000000000', '09998669-f0d9-433d-9ce4-0e309875061a', '{"action":"login","actor_id":"5c15f93c-5cfc-41b8-8aee-b7fed47c50f5","actor_username":"john.smith@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:28:20.268034+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc595d02-7f70-47d7-981d-7651038bebdb', '{"action":"login","actor_id":"b6181435-15ac-4934-9042-8e68b4526449","actor_username":"pham.thi.d@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:29:16.890424+00', ''),
	('00000000-0000-0000-0000-000000000000', '902f7a2c-a4f2-4f66-ae9d-7517e09638a6', '{"action":"login","actor_id":"6bd01c71-c9e5-40dc-82b2-10635a775963","actor_username":"bui.thi.h@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:29:19.940262+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd26b58e8-c246-4cb2-8151-af1cf2c9cc5d', '{"action":"login","actor_id":"5c15f93c-5cfc-41b8-8aee-b7fed47c50f5","actor_username":"john.smith@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:04.112923+00', ''),
	('00000000-0000-0000-0000-000000000000', '5cbfd21c-3085-4984-91e0-bf3346ac7910', '{"action":"login","actor_id":"2ec906ce-38c7-4f13-8bc1-72805f0babb1","actor_username":"mary.johnson@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:04.182632+00', ''),
	('00000000-0000-0000-0000-000000000000', '9df5547b-81f4-4904-93ec-9e1c95297f36', '{"action":"login","actor_id":"7eceb5b5-eb6f-484b-8601-6fd29b4ee543","actor_username":"tran.thi.b@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:04.248413+00', ''),
	('00000000-0000-0000-0000-000000000000', '65ff5bc8-d876-43cb-bb88-cb369a16d685', '{"action":"login","actor_id":"951f0ab8-b36b-44e4-90f3-057fc332d8cb","actor_username":"le.van.c@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:04.313482+00', ''),
	('00000000-0000-0000-0000-000000000000', '98de1b61-9434-4fd3-bd94-4daae3ef5283', '{"action":"login","actor_id":"b6181435-15ac-4934-9042-8e68b4526449","actor_username":"pham.thi.d@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:04.379392+00', ''),
	('00000000-0000-0000-0000-000000000000', '36574a51-70d6-4683-ac96-5a573d68df92', '{"action":"login","actor_id":"f13a197f-503b-4796-8b90-3aefeb63a3c2","actor_username":"vu.thi.f@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:04.443756+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e2e2b37-9c98-43f3-8613-45dc05bbe1e7', '{"action":"login","actor_id":"6bd01c71-c9e5-40dc-82b2-10635a775963","actor_username":"bui.thi.h@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:04.509417+00', ''),
	('00000000-0000-0000-0000-000000000000', '8584acef-86e5-4162-9c55-cf1da59b6ee1', '{"action":"login","actor_id":"ca1db5ee-f706-4753-82b3-a578fb259db3","actor_username":"do.thi.j@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:04.576347+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e3e9caa8-89ca-4d77-b19e-80f8ce9b943a', '{"action":"login","actor_id":"025f70ae-8fe5-44c1-af1d-741c31af7d0b","actor_username":"ly.van.k@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:04.641178+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c2d57825-a3f9-4777-a91e-69c12ea94155', '{"action":"login","actor_id":"c67b1f45-7caa-4a75-b641-34408efc3c3f","actor_username":"ngo.van.i@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:04.706105+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f505b9c0-7930-49ac-888a-12dc7123439b', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:11.110985+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da98445c-f40b-4c1b-a0c0-701c32ba3d10', '{"action":"login","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:11.135914+00', ''),
	('00000000-0000-0000-0000-000000000000', '3ca07443-515a-4be5-99d3-d1d600a404b5', '{"action":"login","actor_id":"99436219-df0f-47be-a3e9-a58d7ba6a195","actor_username":"dinh.van.g@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:11.22739+00', ''),
	('00000000-0000-0000-0000-000000000000', '806589e1-c9f5-4819-a0d5-8947de7250a0', '{"action":"login","actor_id":"e5722240-2856-4371-97f7-14ec83f887d0","actor_username":"hoang.van.e@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:30:11.29436+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e390abfd-bce6-4031-be0d-df091c6ca360', '{"action":"login","actor_id":"99436219-df0f-47be-a3e9-a58d7ba6a195","actor_username":"dinh.van.g@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:34:05.766121+00', ''),
	('00000000-0000-0000-0000-000000000000', '5069632d-f65d-4341-a141-70fcb8f1a121', '{"action":"token_refreshed","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 07:38:11.153294+00', ''),
	('00000000-0000-0000-0000-000000000000', '578902a5-aa2f-430b-bba4-d974c0f5ff32', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 07:38:11.154372+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a7f0a8da-b0a8-497b-abae-af8af0a4b549', '{"action":"logout","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-16 07:38:11.191533+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f38dde22-f00d-4b32-988c-78b28522c0fb', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:40:16.334885+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad572f3a-1d3e-4c88-949f-32374b63ffcc', '{"action":"logout","actor_id":"99436219-df0f-47be-a3e9-a58d7ba6a195","actor_username":"dinh.van.g@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-16 07:50:05.480313+00', ''),
	('00000000-0000-0000-0000-000000000000', '2ff0d101-0b79-4b44-bc0c-6732e09c2047', '{"action":"login","actor_id":"6bd01c71-c9e5-40dc-82b2-10635a775963","actor_username":"bui.thi.h@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:52:06.468348+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f0b1c6c3-e5e8-4c77-aa12-8401a92de27d', '{"action":"logout","actor_id":"6bd01c71-c9e5-40dc-82b2-10635a775963","actor_username":"bui.thi.h@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-16 07:52:17.055402+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c31bf619-7af6-4b9a-92a6-7f8cc62da828', '{"action":"login","actor_id":"99436219-df0f-47be-a3e9-a58d7ba6a195","actor_username":"dinh.van.g@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 07:53:43.743216+00', ''),
	('00000000-0000-0000-0000-000000000000', '9fdff828-30db-4e3f-a399-4f0b3e2f6b45', '{"action":"logout","actor_id":"99436219-df0f-47be-a3e9-a58d7ba6a195","actor_username":"dinh.van.g@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-16 07:54:17.039306+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a571d315-659e-4e48-a5df-8b73423adc83', '{"action":"token_refreshed","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 08:38:34.763513+00', ''),
	('00000000-0000-0000-0000-000000000000', '5a878623-fe77-4895-9006-e99fd653e071', '{"action":"token_revoked","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 08:38:34.765553+00', ''),
	('00000000-0000-0000-0000-000000000000', '079cfb9d-ee3d-4730-8aaa-e47978bb7afc', '{"action":"token_refreshed","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 09:36:39.208622+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af36c191-127c-4a76-a949-e8e070ea01a3', '{"action":"token_revoked","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 09:36:39.209317+00', ''),
	('00000000-0000-0000-0000-000000000000', '14ae40ce-2f01-4887-be1a-819bceecd2f4', '{"action":"token_refreshed","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 09:45:06.465957+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd0d17d36-924c-4412-a819-562e8c1ff783', '{"action":"token_revoked","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-16 09:45:06.466963+00', ''),
	('00000000-0000-0000-0000-000000000000', '873998cd-9093-4d07-b76c-e0349ee8bcb8', '{"action":"logout","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account"}', '2025-09-16 09:45:06.504256+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd13e290d-eded-47ff-a77e-d4ffe91957de', '{"action":"login","actor_id":"383b189e-acec-4989-94b3-a0267f4501bb","actor_username":"admin@apillis.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-16 12:39:58.869498+00', '');


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

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('8ea88104-af78-4836-894f-cbfb61ce669a', '383b189e-acec-4989-94b3-a0267f4501bb', '2025-09-16 12:39:58.876973+00', '2025-09-16 12:39:58.876973+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '172.253.118.95', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('8ea88104-af78-4836-894f-cbfb61ce669a', '2025-09-16 12:39:58.883351+00', '2025-09-16 12:39:58.883351+00', 'password', '7a566a64-93f9-4cd7-bee8-21398bb79380');


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
	('00000000-0000-0000-0000-000000000000', 133, 'pxuwmavhaqvz', '383b189e-acec-4989-94b3-a0267f4501bb', false, '2025-09-16 12:39:58.880823+00', '2025-09-16 12:39:58.880823+00', NULL, '8ea88104-af78-4836-894f-cbfb61ce669a');


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

INSERT INTO "public"."organizations" ("id", "name", "slug", "description", "industry", "address", "city", "state", "country", "postal_code", "website", "logo_url", "organization_type", "is_active", "created_at", "updated_at", "default_currency", "tax_id", "payment_terms", "timezone", "metadata", "created_by") VALUES
	('550e8400-e29b-41d4-a716-446655440000', 'Apillis', 'apillis', 'Leading manufacturing technology company', 'Technology', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'internal', true, '2023-09-07 11:25:25.470919+00', '2025-09-18 11:01:19.861648+00', 'USD', NULL, NULL, 'UTC', '{}', '383b189e-acec-4989-94b3-a0267f4501bb');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "organization_id", "email", "name", "role", "department", "phone", "avatar_url", "status", "description", "employee_id", "direct_manager_id", "direct_reports", "last_login_at", "preferences", "created_at", "updated_at") VALUES
	('383b189e-acec-4989-94b3-a0267f4501bb', '550e8400-e29b-41d4-a716-446655440000', 'admin@apillis.com', 'Admin User', 'admin', 'IT', NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-07 12:45:00.097891+00', '2025-09-07 12:45:00.097891+00');


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

INSERT INTO "public"."document_categories" ("code", "name", "is_portal_visible", "retention_policy", "created_at", "updated_at") VALUES
	('supplier_nda', 'Supplier NDA', true, '{"years": 7}', '2025-09-13 02:36:58.988605+00', '2025-09-13 02:36:58.988605+00'),
	('supplier_iso', 'Supplier ISO Certificate', true, '{"years": 3}', '2025-09-13 02:36:58.988605+00', '2025-09-13 02:36:58.988605+00'),
	('supplier_insurance', 'Supplier Insurance Certificate', true, '{"years": 2}', '2025-09-13 02:36:58.988605+00', '2025-09-13 02:36:58.988605+00'),
	('supplier_financial', 'Supplier Financial Statement', false, '{"years": 7}', '2025-09-13 02:36:58.988605+00', '2025-09-13 02:36:58.988605+00'),
	('supplier_qc', 'Supplier Quality Certificate', true, '{"years": 3}', '2025-09-13 02:36:58.988605+00', '2025-09-13 02:36:58.988605+00'),
	('supplier_profile', 'Supplier Profile Document', true, '{"years": 5}', '2025-09-13 02:36:58.988605+00', '2025-09-13 02:36:58.988605+00'),
	('supplier_logo', 'Supplier Logo', true, '{"years": 5}', '2025-09-13 02:36:58.988605+00', '2025-09-13 02:36:58.988605+00'),
	('supplier_qualified_image', 'Supplier Qualified Image', true, '{"years": 5}', '2025-09-13 02:36:58.988605+00', '2025-09-13 02:36:58.988605+00'),
	('supplier_external_link', 'Supplier External Document Link', true, '{"years": 5}', '2025-09-13 02:36:58.988605+00', '2025-09-13 02:36:58.988605+00');


--
-- Data for Name: document_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: feature_toggles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."feature_toggles" ("id", "organization_id", "feature_name", "feature_key", "description", "is_enabled", "required_role", "required_permissions", "config", "created_by", "created_at", "updated_at") VALUES
	('8e27411e-a667-434f-af1b-ab0f4e81d9e2', '550e8400-e29b-41d4-a716-446655440000', 'Advanced Analytics', 'advanced_analytics', 'Access to advanced analytics and reporting features', true, 'management', '{analytics:read,analytics:export}', '{"enabled_modules": ["forecasting", "trends", "comparisons"]}', NULL, '2025-09-08 00:36:28.837395+00', '2025-09-08 00:36:28.837395+00'),
	('922e291d-7bbe-4cc8-9c41-f64c58712fb8', '550e8400-e29b-41d4-a716-446655440000', 'Supplier Rating System', 'supplier_rating', 'Rate and review suppliers', true, 'procurement', '{supplier:read,supplier:update}', '{"rating_scale": 5, "allow_reviews": true}', NULL, '2025-09-08 00:36:28.837395+00', '2025-09-08 00:36:28.837395+00'),
	('e1133441-f1a2-4245-a171-fe336e4d7d2c', '550e8400-e29b-41d4-a716-446655440000', 'Bulk Operations', 'bulk_operations', 'Perform bulk operations on records', true, 'management', '{rfq:update,customer:update}', '{"max_batch_size": 50}', NULL, '2025-09-08 00:36:28.837395+00', '2025-09-08 00:36:28.837395+00'),
	('2e79f11f-19ec-4486-add8-f13a744d50b7', '550e8400-e29b-41d4-a716-446655440000', 'Custom Workflows', 'custom_workflows', 'Create and manage custom workflows', true, 'management', '{workflow:create,workflow:update}', '{"max_custom_workflows": 10}', NULL, '2025-09-08 00:36:28.837395+00', '2025-09-08 00:36:28.837395+00');


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

INSERT INTO "public"."permissions" ("id", "name", "resource", "action", "description", "category", "is_system", "created_at", "updated_at") VALUES
	('0dfd2aa6-a490-4aca-aea3-bf80db69daaa', 'customer:create', 'customer', 'create', 'Create new customers', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('49ccdf75-5908-4440-897b-7c72cf62ddfa', 'customer:read', 'customer', 'read', 'View customer information', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('68b9be48-fb96-4612-bf9b-9224313df2a0', 'customer:update', 'customer', 'update', 'Update customer information', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('07d938ed-700a-4a20-a69a-f83586c7933f', 'customer:delete', 'customer', 'delete', 'Delete customers', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('0196d39c-1535-4aba-9523-86543f83ddcd', 'customer:archive', 'customer', 'archive', 'Archive customers', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('33591f7f-7e4a-4dcf-8dc2-9a859c717074', 'supplier:create', 'supplier', 'create', 'Create new suppliers', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('82618717-9f2e-4e68-a7aa-794307621737', 'supplier:read', 'supplier', 'read', 'View supplier information', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('7f8dd2a9-5667-40a2-8409-1e8b6a070eb9', 'supplier:update', 'supplier', 'update', 'Update supplier information', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('297982a3-1b10-4d6b-bfb7-efd2a540dc08', 'supplier:delete', 'supplier', 'delete', 'Delete suppliers', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('5a9a756b-7e93-44a7-a642-622e38d15df4', 'supplier:archive', 'supplier', 'archive', 'Archive suppliers', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('22b5e84e-4b64-4bb1-b31c-a7e47f574984', 'rfq:create', 'rfq', 'create', 'Create new RFQs', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('9ba007e7-dc94-4636-9669-6300c539b7df', 'rfq:read', 'rfq', 'read', 'View RFQ information', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('f7394166-d454-4adc-8c89-fa1382b5ec74', 'rfq:update', 'rfq', 'update', 'Update RFQ information', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('1ed02927-5516-4aac-99ee-5d9ebeb52913', 'rfq:delete', 'rfq', 'delete', 'Delete RFQs', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('2182885e-b9aa-42ea-902b-93db7a50b75e', 'rfq:approve', 'rfq', 'approve', 'Approve RFQs', 'approval', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('a6b5b55c-9775-410a-b9cc-10a4a0ad7fbe', 'rfq:reject', 'rfq', 'reject', 'Reject RFQs', 'approval', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('876f121c-7089-4f78-b057-039e41ec206e', 'rfq:review', 'rfq', 'review', 'Review RFQs', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('96df8dbb-8bbc-4e29-ad5d-f1e632681d1f', 'users:read', 'users', 'read', 'View user information', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('68816447-35b9-4784-8228-5f4281543290', 'users:create', 'users', 'create', 'Create new users', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('fd458c1a-5cd6-4c45-9810-4946b8bbd89e', 'users:update', 'users', 'update', 'Update user information', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('66bbc475-a474-43f9-8e87-8e0b3240788f', 'users:delete', 'users', 'delete', 'Delete users', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('8adca558-2601-4f0a-b78c-dc6a8a14539f', 'users:manage_roles', 'users', 'manage_roles', 'Manage user roles and permissions', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('a624366c-a771-4373-8b1d-680d98e8333b', 'dashboard:read', 'dashboard', 'read', 'Access dashboard', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('9fde8cc2-f75c-4edf-9917-33457f7fa4a7', 'dashboard:admin', 'dashboard', 'admin', 'Admin dashboard access', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('ef6d5a5f-a279-4db3-b2b7-6c1636435620', 'analytics:read', 'analytics', 'read', 'View analytics', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('4bc85325-9636-4ebb-b927-7c9f6ca75e2a', 'analytics:export', 'analytics', 'export', 'Export analytics data', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('e4bcdbb3-284a-4207-954c-a5e601ba8dc1', 'workflow:read', 'workflow', 'read', 'View workflows', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('bc008978-2ca8-4955-a1c3-3c4814eca72b', 'workflow:create', 'workflow', 'create', 'Create workflows', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('ea4ab541-0e05-4e53-9ba2-094fb00fcf78', 'workflow:update', 'workflow', 'update', 'Update workflows', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('e9e91eea-e628-4a7a-a96e-b93a0148aaeb', 'workflow:delete', 'workflow', 'delete', 'Delete workflows', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('bdc98946-48ea-43e6-9114-4a2336426df1', 'workflow:bypass', 'workflow', 'bypass', 'Bypass workflow steps', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('0b8661ff-3462-4291-b54c-1724530068fd', 'documents:read', 'documents', 'read', 'View documents', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('8e8ab924-3697-4804-82e6-16afa3d55b34', 'documents:create', 'documents', 'create', 'Create documents', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('f0b9fe04-a05a-4c83-85cd-1651c418dd8f', 'documents:update', 'documents', 'update', 'Update documents', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('9210d330-7e35-4550-be1d-7b8ff11b5ebc', 'documents:delete', 'documents', 'delete', 'Delete documents', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('b19c9254-dc8f-4d7f-9b6c-ecc30be30e4e', 'approvals:read', 'approvals', 'read', 'View approvals', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('e859ce91-cb90-4517-8f72-6e93e0ad1b42', 'approvals:update', 'approvals', 'update', 'Update approvals', 'general', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('efa525f0-92f6-43d8-96b6-ad78e0fa1430', 'system_config:read', 'system_config', 'read', 'View system configuration', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('14fcbde6-cac8-416d-9c0f-c926c11ac26e', 'system_config:update', 'system_config', 'update', 'Update system configuration', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('4b22fca8-047a-4fb8-855c-05ff294a1e24', 'organizations:read', 'organizations', 'read', 'View organizations', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('d3620f1a-71e1-498f-a2c8-862c12d5cb13', 'organizations:create', 'organizations', 'create', 'Create organizations', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('1d3d04ae-ffb8-4352-905d-a281b67e9af1', 'organizations:update', 'organizations', 'update', 'Update organizations', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('ff7b7f92-7175-410d-87ec-e36db8c99abe', 'organizations:delete', 'organizations', 'delete', 'Delete organizations', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('eaf871de-a8e4-46db-baa3-5a3790cdbd57', 'database:read', 'database', 'read', 'Read database', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('da862b3b-844b-40e3-8524-46803172c915', 'database:backup', 'database', 'backup', 'Backup database', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00'),
	('75b6e574-67b4-4b2f-a7ca-85783b470284', 'database:restore', 'database', 'restore', 'Restore database', 'admin', true, '2025-09-08 00:36:04.6653+00', '2025-09-08 00:36:04.6653+00');


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
	('documents', 'documents', NULL, '2025-09-12 01:03:50.266915+00', '2025-09-12 01:03:50.266915+00', false, false, 104857600, '{application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,image/gif,text/plain,application/zip,application/x-zip-compressed}', NULL, 'STANDARD');


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

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('fc6721a5-d301-4b09-b157-1025828123ab', 'documents', '550e8400-e29b-41d4-a716-446655440000/220e8400-e29b-41d4-a716-446655440001/1757639079521_701-00818-02.pdf', '660e8400-e29b-41d4-a716-446655440003', '2025-09-12 01:04:39.647319+00', '2025-09-12 01:04:39.647319+00', '2025-09-12 01:04:39.647319+00', '{"eTag": "\"26784498fc6971af8f7c9193a70a979f\"", "size": 209387, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-12T01:04:39.634Z", "contentLength": 209387, "httpStatusCode": 200}', 'fa87baed-6573-42f2-b6e3-98c9b37b2404', '660e8400-e29b-41d4-a716-446655440003', '{}', 3),
	('e5cc925b-7da8-445e-b4c9-0b94707dd2aa', 'documents', '550e8400-e29b-41d4-a716-446655440000/cb697e9d-abf1-4d0d-bbad-c9b509493dff/1757928097264_701-00834-02.pdf', NULL, '2025-09-15 09:21:37.372661+00', '2025-09-15 09:21:37.372661+00', '2025-09-15 09:21:37.372661+00', '{"eTag": "\"eb342a8bacae7f8c4ac9697b0b8b0bc9\"", "size": 236749, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-15T09:21:37.366Z", "contentLength": 236749, "httpStatusCode": 200}', '2581f30e-22ee-4090-8d29-d269d3312e87', NULL, '{}', 3),
	('d524a69e-75ed-47cb-a579-add76b1d9f17', 'documents', 'suppliers/745b4064-e912-403e-8b3a-5a3211e32788/supplier-745b4064-e912-403e-8b3a-5a3211e32788-1757928145391-701-00818-02.pdf', NULL, '2025-09-15 09:22:25.403538+00', '2025-09-15 09:22:25.403538+00', '2025-09-15 09:22:25.403538+00', '{"eTag": "\"26784498fc6971af8f7c9193a70a979f\"", "size": 209387, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-15T09:22:25.400Z", "contentLength": 209387, "httpStatusCode": 200}', '54fba3eb-085f-4b9d-89dc-ff49077e66d2', NULL, '{}', 3),
	('429b081b-5b5d-4e92-9541-0983be8bcd04', 'documents', 'suppliers/a94dc946-c5ba-4c06-a41d-72651e035df7/supplier-a94dc946-c5ba-4c06-a41d-72651e035df7-1757930039550-701-00818-02.pdf', NULL, '2025-09-15 09:53:59.583274+00', '2025-09-15 09:53:59.583274+00', '2025-09-15 09:53:59.583274+00', '{"eTag": "\"26784498fc6971af8f7c9193a70a979f\"", "size": 209387, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-15T09:53:59.579Z", "contentLength": 209387, "httpStatusCode": 200}', '96ab4f21-3dc1-484f-9597-d222ba9b4738', NULL, '{}', 3),
	('d8899419-3527-4c92-97ce-6c98be589878', 'documents', 'suppliers/bf8b9e5a-fdab-47bc-9dfc-c01d31d22a4a/supplier-bf8b9e5a-fdab-47bc-9dfc-c01d31d22a4a-1757930151796-MS_TECH-_Profile_2025.pdf', NULL, '2025-09-15 09:55:51.830955+00', '2025-09-15 09:55:51.830955+00', '2025-09-15 09:55:51.830955+00', '{"eTag": "\"a8d0ba96cf2eb7d6f7d6a6324313493f\"", "size": 1746088, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-15T09:55:51.820Z", "contentLength": 1746088, "httpStatusCode": 200}', 'be402f02-4587-4047-a07b-81ee23ffe385', NULL, '{}', 3),
	('117de6eb-2e56-4d35-b308-459929c4b19b', 'documents', '550e8400-e29b-41d4-a716-446655440000/cc66cd6e-2ba9-4d40-9da9-ef077eb7c958/1758004970424_MS TECH- NDA.pdf', NULL, '2025-09-16 06:42:50.573543+00', '2025-09-16 06:42:50.573543+00', '2025-09-16 06:42:50.573543+00', '{"eTag": "\"cf55c61cbd75c3c75ddb6ba71f91aae7\"", "size": 3076390, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-16T06:42:50.544Z", "contentLength": 3076390, "httpStatusCode": 200}', 'cb3899df-2cf5-4d2e-afdf-0dad09b559f2', NULL, '{}', 3);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('documents', '550e8400-e29b-41d4-a716-446655440000', '2025-09-12 01:04:39.647319+00', '2025-09-12 01:04:39.647319+00'),
	('documents', '550e8400-e29b-41d4-a716-446655440000/220e8400-e29b-41d4-a716-446655440001', '2025-09-12 01:04:39.647319+00', '2025-09-12 01:04:39.647319+00'),
	('documents', '550e8400-e29b-41d4-a716-446655440000/cb697e9d-abf1-4d0d-bbad-c9b509493dff', '2025-09-15 09:21:37.372661+00', '2025-09-15 09:21:37.372661+00'),
	('documents', 'suppliers', '2025-09-15 09:22:25.403538+00', '2025-09-15 09:22:25.403538+00'),
	('documents', 'suppliers/745b4064-e912-403e-8b3a-5a3211e32788', '2025-09-15 09:22:25.403538+00', '2025-09-15 09:22:25.403538+00'),
	('documents', 'suppliers/a94dc946-c5ba-4c06-a41d-72651e035df7', '2025-09-15 09:53:59.583274+00', '2025-09-15 09:53:59.583274+00'),
	('documents', 'suppliers/bf8b9e5a-fdab-47bc-9dfc-c01d31d22a4a', '2025-09-15 09:55:51.830955+00', '2025-09-15 09:55:51.830955+00'),
	('documents', '550e8400-e29b-41d4-a716-446655440000/cc66cd6e-2ba9-4d40-9da9-ef077eb7c958', '2025-09-16 06:42:50.573543+00', '2025-09-16 06:42:50.573543+00');


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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 133, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
