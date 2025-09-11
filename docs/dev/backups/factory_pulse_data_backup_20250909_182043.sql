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
	('00000000-0000-0000-0000-000000000000', '1eff3024-8567-411e-a5c7-d3532c4c2be7', '{"action":"token_revoked","actor_id":"660e8400-e29b-41d4-a716-446655440003","actor_username":"nguyen.van.a@apillis.com","actor_via_sso":false,"log_type":"token"}', '2025-09-09 11:04:07.364041+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	(NULL, '660e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'john.smith@apillis.com', '$2a$06$Tza1FyyqVvJeUOnt8d7wfuR.aJhvUtOLGRqofhALAK4Lytsad3bwa', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "USA", "display_name": "John Smith"}', NULL, '2022-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440002', NULL, NULL, 'mary.johnson@apillis.com', '$2a$06$YN7rK67yMoOHSQ3ApP1WEOwCcsDLTBwM8cmZJrj1jClfIoz4iORbC', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "USA", "display_name": "Mary Johnson"}', NULL, '2023-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440004', NULL, NULL, 'tran.thi.b@apillis.com', '$2a$06$HOga9Q5b8ssEOYTZus8zke8WGGpZMa9wZUJesqwun1nX5g9wfn8Y2', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Tran Thi B"}', NULL, '2023-11-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440005', NULL, NULL, 'le.van.c@apillis.com', '$2a$06$MUidWyuGXM8BdVPgsKgyVedpgG0myXU96/zJwbZYkrsBhjtQsoj22', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Le Van C"}', NULL, '2024-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440006', NULL, NULL, 'pham.thi.d@apillis.com', '$2a$06$ytihZnO1jMMarCROFwgG8eMiosYnGAIH8jDPsmIBWFXbPahqwDxMC', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Pham Thi D"}', NULL, '2024-07-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440013', NULL, NULL, 'ly.van.k@apillis.com', '$2a$06$u3qdnk0xhbqntzBUgGK7zuSJcPO.IZ3XdyvFSV9KaMIzYjdNyuaAe', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Ly Van K"}', NULL, '2025-07-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '660e8400-e29b-41d4-a716-446655440003', 'authenticated', 'authenticated', 'nguyen.van.a@apillis.com', '$2a$06$Sp2uwgMM1gtLKC6GN3l9v.oiU7qXjxduDrnrbfSDecfCNkKN9m1Nm', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-09 00:08:19.669372+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "660e8400-e29b-41d4-a716-446655440003", "email": "nguyen.van.a@apillis.com", "email_verified": true, "phone_verified": false}', NULL, '2023-09-07 11:25:25.470919+00', '2025-09-09 11:04:07.367029+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440007', NULL, NULL, 'hoang.van.e@apillis.com', '$2a$06$FP/My6d3RGA2.giYS/Y2gO4lj6bXwN8l/DsGbZVwRbMPkWQH2KYgq', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Hoang Van E"}', NULL, '2024-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440008', NULL, NULL, 'vu.thi.f@apillis.com', '$2a$06$gtzDcnI0sLbtxlb1PsJRH.eseqMV5Zy4P2GP50YGvvM/KN1UuAvVO', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Vu Thi F"}', NULL, '2024-11-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440009', NULL, NULL, 'dinh.van.g@apillis.com', '$2a$06$GFD8Yw2AJsGbqSfboJ6uf.uRUhd6X0.vwbbdatJylsdfiwp.iVY4O', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Dinh Van G"}', NULL, '2025-01-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440010', NULL, NULL, 'bui.thi.h@apillis.com', '$2a$06$tHqmHOopzUHqI7Sf6hQIm.6MYqqtf1YHfYWxloXONMsuDveVmD8/G', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Bui Thi H"}', NULL, '2025-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440011', NULL, NULL, 'ngo.van.i@apillis.com', '$2a$06$Lkd8BO.Axv2HW76PJSnr/.pG1nlwVCg1VLn7NIn6M5WpCqOhLImq2', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Ngo Van I"}', NULL, '2025-05-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '660e8400-e29b-41d4-a716-446655440012', NULL, NULL, 'do.thi.j@apillis.com', '$2a$06$EBC0d98gvefFtbq2EwLEi.SoAc.7r3Ct0oHajqwuIkkEXq57xVy9u', '2025-09-07 11:25:25.470919+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, NULL, '{"country": "Vietnam", "display_name": "Do Thi J"}', NULL, '2025-06-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '383b189e-acec-4989-94b3-a0267f4501bb', 'authenticated', 'authenticated', 'admin@apillis.com', '$2a$06$xIsgfqbG9w9vHM0Y79e.Jutxju7LUs4IVVFQyvqMLhRKaT3g89J/C', '2025-09-07 12:42:05.30059+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-08 05:55:46.588928+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-09-07 12:42:05.298026+00', '2025-09-08 09:51:13.356805+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


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
	('433c2f0e-673e-47f6-a02c-0a3c7ea6514b', '660e8400-e29b-41d4-a716-446655440003', '2025-09-09 00:08:19.669421+00', '2025-09-09 11:04:07.369424+00', NULL, 'aal1', NULL, '2025-09-09 11:04:07.369391', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '172.217.194.95', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('433c2f0e-673e-47f6-a02c-0a3c7ea6514b', '2025-09-09 00:08:19.670473+00', '2025-09-09 00:08:19.670473+00', 'password', 'b859e667-bd15-4d6b-8221-f62dc7cc374b');


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
	('00000000-0000-0000-0000-000000000000', 30, 'e5aazggx44km', '660e8400-e29b-41d4-a716-446655440003', true, '2025-09-09 00:08:19.669969+00', '2025-09-09 09:06:47.577448+00', NULL, '433c2f0e-673e-47f6-a02c-0a3c7ea6514b'),
	('00000000-0000-0000-0000-000000000000', 31, 'l6v6bomf4jfi', '660e8400-e29b-41d4-a716-446655440003', true, '2025-09-09 09:06:47.577798+00', '2025-09-09 10:05:33.429848+00', 'e5aazggx44km', '433c2f0e-673e-47f6-a02c-0a3c7ea6514b'),
	('00000000-0000-0000-0000-000000000000', 32, '6v2xtoz46mff', '660e8400-e29b-41d4-a716-446655440003', true, '2025-09-09 10:05:33.430832+00', '2025-09-09 11:04:07.364579+00', 'l6v6bomf4jfi', '433c2f0e-673e-47f6-a02c-0a3c7ea6514b'),
	('00000000-0000-0000-0000-000000000000', 33, 'eolptg2dklhn', '660e8400-e29b-41d4-a716-446655440003', false, '2025-09-09 11:04:07.366161+00', '2025-09-09 11:04:07.366161+00', '6v2xtoz46mff', '433c2f0e-673e-47f6-a02c-0a3c7ea6514b');


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

INSERT INTO "public"."organizations" ("id", "name", "slug", "description", "industry", "address", "city", "state", "country", "postal_code", "website", "logo_url", "organization_type", "is_active", "created_at", "updated_at", "created_by") VALUES
	('550e8400-e29b-41d4-a716-446655440000', 'Apillis', 'apillis', 'Leading manufacturing technology company', 'Technology', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'internal', true, '2023-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL),
	('550e8400-e29b-41d4-a716-446655440004', 'Precision Parts Inc', 'precision-parts', 'High-precision component supplier', 'Manufacturing', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'supplier', true, '2025-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL),
	('550e8400-e29b-41d4-a716-446655440001', 'Acme Manufacturing Corp', 'acme-mfg', 'Leading manufacturer of precision components', 'Manufacturing', NULL, NULL, NULL, 'US', NULL, NULL, NULL, 'customer', true, '2024-09-07 11:25:25.470919+00', '2025-09-07 14:43:24.334356+00', NULL),
	('550e8400-e29b-41d4-a716-446655440002', 'TechCorp Solutions', 'techcorp', 'Technology solutions provider', 'Technology', NULL, NULL, NULL, 'VN', NULL, NULL, NULL, 'customer', true, '2024-11-07 11:25:25.470919+00', '2025-09-08 07:48:00.259176+00', NULL),
	('550e8400-e29b-41d4-a716-446655440003', 'Global Industries Ltd', 'global-industries', 'Global manufacturing conglomerate', 'Manufacturing', NULL, NULL, NULL, 'US', NULL, NULL, NULL, 'customer', true, '2025-01-07 11:25:25.470919+00', '2025-09-08 10:05:53.743293+00', NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "organization_id", "email", "name", "role", "department", "phone", "avatar_url", "status", "description", "employee_id", "direct_manager_id", "direct_reports", "last_login_at", "preferences", "created_at", "updated_at", "permission_override", "custom_permissions_cache", "last_permission_update") VALUES
	('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'mary.johnson@apillis.com', 'Mary Johnson', 'management', 'Finance', '+1-555-0102', NULL, 'active', NULL, NULL, NULL, NULL, NULL, '{"theme": "light", "language": "en", "timezone": "America/New_York"}', '2023-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'pham.thi.d@apillis.com', 'Pham Thi D', 'sales', 'Sales', '+84-555-987-654', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2024-07-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'hoang.van.e@apillis.com', 'Hoang Van E', 'procurement', 'Procurement', '+84-555-456-789', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2024-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'vu.thi.f@apillis.com', 'Vu Thi F', 'sales', 'Sales', '+84-555-321-098', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2024-11-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'dinh.van.g@apillis.com', 'Dinh Van G', 'engineering', 'Engineering', '+84-555-654-321', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440005', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2025-01-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'bui.thi.h@apillis.com', 'Bui Thi H', 'qa', 'Quality', '+84-555-789-012', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440004', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2025-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'ngo.van.i@apillis.com', 'Ngo Van I', 'qa', 'Quality', '+84-555-098-765', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440004', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2025-05-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'do.thi.j@apillis.com', 'Do Thi J', 'production', 'Production', '+84-555-135-792', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2025-06-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'ly.van.k@apillis.com', 'Ly Van K', 'production', 'Production', '+84-555-246-813', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2025-07-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'john.smith@apillis.com', 'John Smith', 'admin', 'Executive', '+1-555-0101', NULL, 'active', NULL, NULL, NULL, '{660e8400-e29b-41d4-a716-446655440003,660e8400-e29b-41d4-a716-446655440004,660e8400-e29b-41d4-a716-446655440005}', NULL, '{"theme": "light", "language": "en", "timezone": "America/New_York"}', '2022-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'nguyen.van.a@apillis.com', 'Nguyen Van A', 'management', 'Operations', '+84-123-456-789', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440001', '{660e8400-e29b-41d4-a716-446655440006,660e8400-e29b-41d4-a716-446655440007,660e8400-e29b-41d4-a716-446655440008,660e8400-e29b-41d4-a716-446655440012,660e8400-e29b-41d4-a716-446655440013}', NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2023-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'tran.thi.b@apillis.com', 'Tran Thi B', 'management', 'Quality', '+84-987-654-321', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440001', '{660e8400-e29b-41d4-a716-446655440010,660e8400-e29b-41d4-a716-446655440011}', NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2023-11-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'le.van.c@apillis.com', 'Le Van C', 'management', 'Engineering', '+84-555-123-456', NULL, 'active', NULL, NULL, '660e8400-e29b-41d4-a716-446655440001', '{660e8400-e29b-41d4-a716-446655440009}', NULL, '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}', '2024-03-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', false, '{}', '2025-09-08 00:36:04.6512+00'),
	('383b189e-acec-4989-94b3-a0267f4501bb', '550e8400-e29b-41d4-a716-446655440000', 'admin@apillis.com', 'Admin User', 'admin', 'IT', NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-07 12:45:00.097891+00', '2025-09-07 12:45:00.097891+00', false, '{}', '2025-09-08 00:36:04.6512+00');


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
	('220e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'P-25082001', 'Acme Manufacturing - Precision Components', 'High-precision mechanical components manufacturing project', '550e8400-e29b-41d4-a716-446655440001', '{770e8400-e29b-41d4-a716-446655440001}', '880e8400-e29b-41d4-a716-446655440002', NULL, 'reviewing', 'high', 0.00, NULL, '2025-11-06', NULL, NULL, NULL, '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440006', NULL, NULL, '{}', 'manufacturing', NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 12:31:51.827125+00', NULL, NULL),
	('d75dae81-e97c-4f20-aee4-d1a86fe43d5e', '550e8400-e29b-41d4-a716-446655440000', 'P-DEV001', 'Development Test Project', NULL, '550e8400-e29b-41d4-a716-446655440001', '{}', '880e8400-e29b-41d4-a716-446655440001', NULL, 'inquiry', 'normal', 0.00, NULL, NULL, NULL, NULL, NULL, '660e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', NULL, NULL, '{}', NULL, NULL, NULL, NULL, '{}', '2025-09-07 12:32:01.472263+00', '2025-09-07 12:32:11.047265+00', NULL, NULL),
	('220e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'P-25082003', 'Global Industries - Automation Line', 'High-volume manufacturing line for industrial automation', '550e8400-e29b-41d4-a716-446655440003', '{}', '880e8400-e29b-41d4-a716-446655440003', NULL, 'inquiry', 'low', 0.00, NULL, '2025-12-06', NULL, NULL, NULL, '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440006', NULL, NULL, '{}', 'manufacturing', NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-07 14:13:22.47561+00', NULL, NULL),
	('220e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'P-25082002', 'TechCorp - System Integration', 'Complete system integration for TechCorp Solutions', '550e8400-e29b-41d4-a716-446655440002', '{770e8400-e29b-41d4-a716-446655440003}', '880e8400-e29b-41d4-a716-446655440003', NULL, 'inquiry', 'normal', 0.00, '2025-09-08 07:12:36.85+00', '2025-10-22', NULL, NULL, NULL, '660e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440008', NULL, NULL, '{}', 'system_build', NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00', '2025-09-08 07:12:36.877941+00', NULL, NULL);


--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."activity_log" ("id", "organization_id", "user_id", "project_id", "entity_type", "entity_id", "action", "description", "old_values", "new_values", "ip_address", "user_agent", "metadata", "created_at") VALUES
	('ee0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440006', '220e8400-e29b-41d4-a716-446655440001', 'project', '220e8400-e29b-41d4-a716-446655440001', 'create', 'Created new project for Acme Manufacturing', NULL, NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('ee0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440009', '220e8400-e29b-41d4-a716-446655440001', 'project', '220e8400-e29b-41d4-a716-446655440001', 'update', 'Updated project technical specifications', NULL, NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('ee0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440007', '220e8400-e29b-41d4-a716-446655440001', 'project', '220e8400-e29b-41d4-a716-446655440001', 'update', 'Updated project cost estimation', NULL, NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('ee0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440005', '220e8400-e29b-41d4-a716-446655440002', 'approval', 'dd0e8400-e29b-41d4-a716-446655440001', 'approve', 'Approved technical review for Acme project', NULL, NULL, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('d1cb6a72-6d83-46a1-bda4-ec7e99414a7f', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'login_success', 'User logged in successfully', NULL, NULL, NULL, NULL, '{}', '2025-09-07 12:45:54.419026+00'),
	('f2570cfa-fcf3-4fd5-ac58-ea24e43a816a', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'login_success', NULL, NULL, '{"details": {}, "success": true}', NULL, 'test', '{}', '2025-09-07 13:05:10.784201+00'),
	('fcc54614-9660-407f-82a2-39d096399023', '550e8400-e29b-41d4-a716-446655440000', NULL, NULL, 'system', '139b36fd-583b-4457-b16d-67e3943da93d', 'refresh_materialized_views', 'Refreshed dashboard materialized views', NULL, NULL, NULL, NULL, '{"refreshed_at": "2025-09-07T13:24:10.12896+00:00", "views_refreshed": ["mv_user_workload"]}', '2025-09-07 13:24:10.12896+00'),
	('1daa4b12-253d-43c4-a3c0-cb0d97e73ad6', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "management", "access_time": "2025-09-08T00:15:07.068Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:15:07.068Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:15:07.081272+00'),
	('1d9a4a26-2626-4303-9977-073fd9308fcd', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "management", "access_time": "2025-09-08T00:15:07.068Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:15:07.068Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:15:07.081266+00'),
	('0a0c6bca-aea6-435d-b8fb-8a69f5183837', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "management", "access_time": "2025-09-08T00:18:59.050Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:18:59.050Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:18:59.077083+00'),
	('1c4d4e9e-9ab7-417d-b79a-75b64624ce36', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "management", "access_time": "2025-09-08T00:18:59.051Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:18:59.051Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:18:59.077118+00'),
	('d0c3abd4-5e69-48e2-9e77-6ebcc17ff89f', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "management", "access_time": "2025-09-08T00:36:32.625Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:36:32.625Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:36:32.639867+00'),
	('65296dda-8d71-4444-84df-54c7e775da6b', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "management", "access_time": "2025-09-08T00:36:32.625Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:36:32.625Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:36:32.644672+00'),
	('c3f60e03-ee37-4756-a5b1-987dca442d66', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T00:36:39.447Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:36:39.45653+00'),
	('39e88ed9-9c9d-40b0-adc8-2374ff6cf31c', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:49:20.053Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:49:20.053Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:49:20.066668+00'),
	('3a636542-45ca-42a2-9be9-9ca1076ab1bb', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:49:20.054Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:49:20.054Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:49:20.066591+00'),
	('a84b5184-a42e-490e-a951-3d4358912def', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:50:24.894Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:50:24.894Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:50:24.919007+00'),
	('9cc6912b-3f60-4993-9c36-cfa7033f1836', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:53:03.048Z", "attempted_action": "route_access", "attempted_resource": "/suppliers"}, "success": false, "client_info": {"url": "http://localhost:8080/suppliers", "referrer": "", "timestamp": "2025-09-08T00:53:03.048Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:53:03.06323+00'),
	('25b07557-a320-42f5-a116-997ec55fedd2', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T01:04:09.217Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T01:04:09.217Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 01:04:09.236062+00'),
	('b9f5df4d-d055-414a-8288-0e68e4239163', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T01:04:09.219Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T01:04:09.219Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 01:04:09.236603+00'),
	('1f8cb5be-00ec-48ea-8798-4a1b47245f33', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T01:29:43.108Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "http://localhost:8080/permissions", "timestamp": "2025-09-08T01:29:43.108Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 01:29:43.128794+00'),
	('7e607ab2-44df-43fd-9347-644d38a98d37', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T01:29:43.109Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "http://localhost:8080/permissions", "timestamp": "2025-09-08T01:29:43.109Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 01:29:43.131774+00'),
	('c65db822-add3-4171-a11d-8ee1b0198bf4', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T02:43:57.977Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 02:43:58.033716+00'),
	('15b7723b-02be-4934-8e6b-1f0c1a8b84d4', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T02:43:57.980Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 02:43:58.051644+00'),
	('19cd2533-28b4-4541-9cc0-a3398a32148b', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T02:43:57.991Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 02:43:58.051635+00'),
	('9cf2b2cf-c24b-47c6-ab1d-5cb5f8b02bd2', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T02:43:57.980Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 02:43:58.052919+00'),
	('28096293-6241-4e41-88da-323a62a5d098', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', '220e8400-e29b-41d4-a716-446655440002', 'project', '220e8400-e29b-41d4-a716-446655440002', 'stage_transition_bypass', 'Stage changed from Inquiry Received to Technical Review', NULL, NULL, NULL, NULL, '{"reason": "Manager bypass", "timestamp": "2025-09-08T07:12:17.856Z", "to_stage_id": "880e8400-e29b-41d4-a716-446655440002", "bypass_reason": "demo", "from_stage_id": "880e8400-e29b-41d4-a716-446655440001", "to_stage_name": "Technical Review", "bypass_required": true, "from_stage_name": "Inquiry Received"}', '2025-09-08 07:12:17.858898+00'),
	('e39a58d9-aaee-4fa3-a768-46c2c07bbd05', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', '220e8400-e29b-41d4-a716-446655440002', 'project', '220e8400-e29b-41d4-a716-446655440002', 'stage_transition_bypass', 'Stage changed from Inquiry Received to Technical Review', NULL, NULL, NULL, NULL, '{"reason": "Manager bypass", "timestamp": "2025-09-08T07:12:24.157Z", "to_stage_id": "880e8400-e29b-41d4-a716-446655440002", "bypass_reason": "demo", "from_stage_id": "880e8400-e29b-41d4-a716-446655440001", "to_stage_name": "Technical Review", "bypass_required": true, "from_stage_name": "Inquiry Received"}', '2025-09-08 07:12:24.159333+00'),
	('b6d6f2e6-546e-4709-9f35-0bb9417b3296', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', '220e8400-e29b-41d4-a716-446655440002', 'project', '220e8400-e29b-41d4-a716-446655440002', 'stage_transition', 'Stage changed from Technical Review to Supplier RFQ Sent', NULL, NULL, NULL, NULL, '{"reason": "Normal transition", "timestamp": "2025-09-08T07:12:36.775Z", "to_stage_id": "880e8400-e29b-41d4-a716-446655440003", "from_stage_id": "880e8400-e29b-41d4-a716-446655440002", "to_stage_name": "Supplier RFQ Sent", "bypass_required": false, "from_stage_name": "Technical Review"}', '2025-09-08 07:12:36.776865+00'),
	('e7f5d16f-dc57-4412-8eac-99876010bc85', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', '220e8400-e29b-41d4-a716-446655440002', 'project', '220e8400-e29b-41d4-a716-446655440002', 'stage_transition', 'Stage changed from Technical Review to Supplier RFQ Sent', NULL, NULL, NULL, NULL, '{"reason": "Normal stage transition", "timestamp": "2025-09-08T07:12:36.846Z", "to_stage_id": "880e8400-e29b-41d4-a716-446655440003", "from_stage_id": "880e8400-e29b-41d4-a716-446655440002", "to_stage_name": "Supplier RFQ Sent", "bypass_required": false, "from_stage_name": "Technical Review"}', '2025-09-08 07:12:36.846662+00'),
	('5f29777f-850c-460b-a7a1-5c900cfb255a', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:50:24.895Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:50:24.895Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:50:24.919009+00'),
	('1ab25ce6-26e1-4659-89d1-6f8fee3a5216', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:52:24.979Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:52:24.979Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:52:24.991151+00'),
	('548ae26f-21ed-4eba-a3f5-7bfcfc1b16da', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:52:24.978Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:52:24.978Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:52:24.99115+00'),
	('4eadc476-2d10-4c8e-aa16-6b0479461a2d', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:52:30.204Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:52:30.204Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:52:30.215711+00'),
	('827634f9-5953-4ec2-a42b-73bf506ac480', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:52:30.205Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:52:30.205Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:52:30.215733+00'),
	('830a3d99-3828-46f2-975a-1e3c4e11dd98', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:52:36.936Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:52:36.936Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:52:36.95224+00'),
	('390c0573-7489-47bf-9837-7f9510f9ae6b', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:52:36.935Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:52:36.935Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:52:36.952244+00'),
	('5391b367-87d6-4e58-b48e-c7bc982a9559', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:52:43.899Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:52:43.899Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:52:43.907179+00'),
	('3e29ed15-7d7c-4cdf-91a6-1dcf0b84b552', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:52:43.900Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:52:43.900Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:52:43.907206+00'),
	('20f5f42d-491b-4b4b-be4a-9c24d5b71e76', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:52:51.112Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:52:51.112Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:52:51.118328+00'),
	('4d384f21-3109-421b-be3d-31dfb7ceaa8c', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:52:51.111Z", "attempted_action": "route_access", "attempted_resource": "/customers"}, "success": false, "client_info": {"url": "http://localhost:8080/customers", "referrer": "", "timestamp": "2025-09-08T00:52:51.111Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:52:51.118349+00'),
	('c27e42d3-3a1e-4dce-9ba3-fa175d4ed099', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'unauthorized_access', NULL, NULL, '{"details": {"user_role": "admin", "access_time": "2025-09-08T00:53:03.051Z", "attempted_action": "route_access", "attempted_resource": "/suppliers"}, "success": false, "client_info": {"url": "http://localhost:8080/suppliers", "referrer": "", "timestamp": "2025-09-08T00:53:03.051Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 00:53:03.063243+00'),
	('c51db4ea-1a6c-4b98-b41e-8e0958789057', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T09:51:13.281Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 09:51:13.547423+00'),
	('d152c1ea-c13b-4476-a1a9-94b238a2f63a', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T09:51:13.281Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 09:51:13.547452+00'),
	('adc03293-a3dd-4702-be8a-256986d4cb95', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T09:51:13.314Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 09:51:13.54747+00'),
	('19920a7b-f5eb-41e1-88cb-0b775566d4bd', '550e8400-e29b-41d4-a716-446655440000', '383b189e-acec-4989-94b3-a0267f4501bb', NULL, 'user', '383b189e-acec-4989-94b3-a0267f4501bb', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T09:51:13.281Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 09:51:13.547417+00'),
	('b47f11f0-049f-41ff-b75c-94fd0dba07af', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T17:41:08.221Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 17:41:08.435172+00'),
	('e8d2250d-de56-4e24-ba3e-da4cf4df49ba', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-08T17:41:08.223Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-08 17:41:08.435344+00'),
	('98ebb10c-b241-4f1b-852f-eda90d3c7383', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-09T00:07:59.133Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-09 00:07:59.275418+00'),
	('0cc0d3d8-3ef2-4088-a2e6-0b4db1848888', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-09T00:07:59.131Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-09 00:07:59.276555+00'),
	('dbc53927-a661-4b95-812d-af88dfe615b8', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-09T00:07:59.185Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-09 00:07:59.273901+00'),
	('e8bcd346-a813-430d-b8fe-c8cfe3102cc1', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', NULL, 'user', '660e8400-e29b-41d4-a716-446655440003', 'logout', NULL, NULL, '{"details": {"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "logout_time": "2025-09-09T00:07:59.133Z"}, "success": true}', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '{}', '2025-09-09 00:07:59.276129+00');


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

INSERT INTO "public"."contacts" ("id", "organization_id", "type", "contact_name", "email", "phone", "address", "city", "state", "country", "postal_code", "website", "tax_id", "payment_terms", "credit_limit", "is_active", "role", "is_primary_contact", "notes", "created_at", "updated_at", "created_by") VALUES
	('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'John Customer', 'john.customer@acme.com', '+1-555-0101', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Purchasing Manager', true, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL),
	('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Sarah Engineering', 'sarah.eng@acme.com', '+1-555-0102', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Engineering Lead', false, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL),
	('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'customer', 'Mary Buyer', 'mary.buyer@techcorp.com', '+1-555-0201', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Senior Buyer', true, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL),
	('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'customer', 'Bob Tech', 'bob.tech@techcorp.com', '+1-555-0202', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Technical Director', false, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL),
	('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'supplier', 'Alice Supplier', 'alice@precisionparts.com', '+1-555-0301', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Sales Manager', true, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL),
	('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 'supplier', 'Charlie Quality', 'charlie@precisionparts.com', '+1-555-0302', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Quality Manager', false, NULL, '2025-09-07 11:25:25.470919+00', '2025-09-07 11:25:25.470919+00', NULL),
	('8f05707d-fde1-4c54-8297-d45d881217a8', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Development Contact', 'dev.contact@acme.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Project Manager', false, NULL, '2025-09-07 12:32:40.765997+00', '2025-09-07 12:32:40.765997+00', NULL),
	('91575f59-429e-4008-a895-429756109e95', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Dan Tong', 'dantong@acme.com', '232343432', 'fdsfa', 'fdfs', 'fsd', NULL, 'e2312341', NULL, NULL, NULL, NULL, true, 'general', false, NULL, '2025-09-09 00:17:35.592053+00', '2025-09-09 00:17:35.592053+00', '660e8400-e29b-41d4-a716-446655440003');


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

INSERT INTO "public"."notifications" ("id", "organization_id", "user_id", "type", "title", "message", "priority", "action_url", "is_read", "read_at", "expires_at", "metadata", "created_at") VALUES
	('ff0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440005', 'approval', 'New Approval Request', 'Technical review approval needed for Acme project', 'normal', '/approvals/dd0e8400-e29b-41d4-a716-446655440001', false, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('ff0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440006', 'workflow', 'Project Stage Update', 'Acme project moved to Technical Review stage', 'low', '/projects/220e8400-e29b-41d4-a716-446655440001', false, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00'),
	('ff0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440008', 'approval', 'Approval Approved', 'Your cost approval request has been approved', 'normal', '/approvals/dd0e8400-e29b-41d4-a716-446655440002', false, NULL, NULL, '{}', '2025-09-07 11:25:25.470919+00');


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
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 33, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
