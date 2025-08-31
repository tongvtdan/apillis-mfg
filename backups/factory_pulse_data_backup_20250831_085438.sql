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
	('00000000-0000-0000-0000-000000000000', '1f3faeab-bda2-4411-8583-4f33ece6342d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"ceo@factorypulse.vn","user_id":"539da4e2-4492-4803-a31b-e155f62a97bb","user_phone":""}}', '2025-08-30 23:51:01.759297+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b5005da9-7b5f-4846-a2ae-5ea36ffeb277', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"operations@factorypulse.vn","user_id":"45b42035-648b-4a33-a3aa-845f267aab60","user_phone":""}}', '2025-08-30 23:51:01.817993+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4a2b749-838b-4131-b3c4-b3e74612b8ce', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"quality@factorypulse.vn","user_id":"82af21a1-4469-4843-8533-adee006789f5","user_phone":""}}', '2025-08-30 23:51:01.87584+00', ''),
	('00000000-0000-0000-0000-000000000000', '2be7959a-ee9e-4a14-8cac-47ffcca5a812', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"senior.engineer@factorypulse.vn","user_id":"eb2b78df-5423-4b92-ae19-d421bae67912","user_phone":""}}', '2025-08-30 23:51:01.933006+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ee571863-c27c-48fd-83d3-858d2d06966b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"mechanical.engineer@factorypulse.vn","user_id":"45257c4e-c522-4c1b-a387-3b35498cb8d0","user_phone":""}}', '2025-08-30 23:51:01.989989+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ac30d83-296f-4289-bc40-5285ee803e74', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"electrical.engineer@factorypulse.vn","user_id":"64318830-39a2-4e71-86fe-016731023761","user_phone":""}}', '2025-08-30 23:51:02.046789+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c0c08b29-dbfc-4cb4-a6d5-02df8d39bc92', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"qa.engineer@factorypulse.vn","user_id":"f21dd6c2-37d7-48ea-b50e-9e76dfb859a8","user_phone":""}}', '2025-08-30 23:51:02.103598+00', ''),
	('00000000-0000-0000-0000-000000000000', '942f6818-a676-4597-827b-2e754b13fe6b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"production.supervisor@factorypulse.vn","user_id":"5bd681f2-de76-45ed-9294-33078f284438","user_phone":""}}', '2025-08-30 23:51:02.160192+00', ''),
	('00000000-0000-0000-0000-000000000000', '6de9935a-6f73-40fa-8611-0b0361da02e3', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"team.lead@factorypulse.vn","user_id":"2c9e66ab-6cfe-431e-99c4-de7ac46c8332","user_phone":""}}', '2025-08-30 23:51:02.218628+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bf655e0e-b464-4ea1-8fa2-dd072ed513f3', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"quality.inspector@factorypulse.vn","user_id":"80a9cfb3-70b9-4f3b-bf79-a7ea4e284e25","user_phone":""}}', '2025-08-30 23:51:02.276231+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d7e12c8-8e03-4c1c-8af6-8356d2716540', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"sales.manager@factorypulse.vn","user_id":"a929894b-5534-404a-be50-ea8cdf64bca9","user_phone":""}}', '2025-08-30 23:51:02.334615+00', ''),
	('00000000-0000-0000-0000-000000000000', '8e614c80-c8aa-494e-b25a-a30a7c9d22a1', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"procurement@factorypulse.vn","user_id":"6972ece0-081f-487e-a2f8-75c75c6c03cc","user_phone":""}}', '2025-08-30 23:51:02.390063+00', ''),
	('00000000-0000-0000-0000-000000000000', '551812e2-725a-406a-a429-b12aa7efcaeb', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"project.coordinator@factorypulse.vn","user_id":"9d6110ba-b4d1-47a6-a7be-4bf17843d0e1","user_phone":""}}', '2025-08-30 23:51:02.448123+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dc572ea6-7c56-4c10-8325-ae3079af6a9d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@factorypulse.vn","user_id":"03327341-f21c-4a38-9f4e-cbf6754ae757","user_phone":""}}', '2025-08-30 23:51:02.504621+00', ''),
	('00000000-0000-0000-0000-000000000000', '218a230e-4dac-43a5-9cb6-8041f3d75b18', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"customer.service@factorypulse.vn","user_id":"1a08feca-c02d-42e0-9d93-9d188ed63ce4","user_phone":""}}', '2025-08-30 23:51:02.562973+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c73009c6-5e27-4d42-84b0-094431fc2eb0', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"customer.service@factorypulse.vn","user_id":"1a08feca-c02d-42e0-9d93-9d188ed63ce4","user_phone":""}}', '2025-08-30 23:52:09.829709+00', ''),
	('00000000-0000-0000-0000-000000000000', '113dd9c2-9311-4242-b002-add3f8a13573', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@factorypulse.vn","user_id":"03327341-f21c-4a38-9f4e-cbf6754ae757","user_phone":""}}', '2025-08-30 23:52:09.845978+00', ''),
	('00000000-0000-0000-0000-000000000000', '47a4ac57-74f5-4335-9758-fc79064d0f52', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"project.coordinator@factorypulse.vn","user_id":"9d6110ba-b4d1-47a6-a7be-4bf17843d0e1","user_phone":""}}', '2025-08-30 23:52:09.851284+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7bca191-4702-4acd-abcc-180717138830', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"procurement@factorypulse.vn","user_id":"6972ece0-081f-487e-a2f8-75c75c6c03cc","user_phone":""}}', '2025-08-30 23:52:09.856769+00', ''),
	('00000000-0000-0000-0000-000000000000', '0ef5c55e-1a77-4b9b-8099-87b3cb503f41', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sales.manager@factorypulse.vn","user_id":"a929894b-5534-404a-be50-ea8cdf64bca9","user_phone":""}}', '2025-08-30 23:52:09.860175+00', ''),
	('00000000-0000-0000-0000-000000000000', '801040b5-8a34-40de-90e3-1a478220470e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"quality.inspector@factorypulse.vn","user_id":"80a9cfb3-70b9-4f3b-bf79-a7ea4e284e25","user_phone":""}}', '2025-08-30 23:52:09.863025+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a67d0dd9-1a54-4e45-b803-ff3acaa7ffe7', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"team.lead@factorypulse.vn","user_id":"2c9e66ab-6cfe-431e-99c4-de7ac46c8332","user_phone":""}}', '2025-08-30 23:52:09.866239+00', ''),
	('00000000-0000-0000-0000-000000000000', '99a038c0-04c3-4456-80e3-279339ea3ca6', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"production.supervisor@factorypulse.vn","user_id":"5bd681f2-de76-45ed-9294-33078f284438","user_phone":""}}', '2025-08-30 23:52:09.869162+00', ''),
	('00000000-0000-0000-0000-000000000000', '30fbca0b-f0ee-4494-9ec9-637e0eb5db65', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"qa.engineer@factorypulse.vn","user_id":"f21dd6c2-37d7-48ea-b50e-9e76dfb859a8","user_phone":""}}', '2025-08-30 23:52:09.872428+00', ''),
	('00000000-0000-0000-0000-000000000000', '8e133a4a-6031-4fce-a457-18760e94e022', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"electrical.engineer@factorypulse.vn","user_id":"64318830-39a2-4e71-86fe-016731023761","user_phone":""}}', '2025-08-30 23:52:09.874749+00', ''),
	('00000000-0000-0000-0000-000000000000', '288520d1-9242-4934-85bf-6ce2d2f221b4', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"mechanical.engineer@factorypulse.vn","user_id":"45257c4e-c522-4c1b-a387-3b35498cb8d0","user_phone":""}}', '2025-08-30 23:52:09.877271+00', ''),
	('00000000-0000-0000-0000-000000000000', '776f8f6a-fe9a-417c-972d-7e19bd9373c6', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"senior.engineer@factorypulse.vn","user_id":"eb2b78df-5423-4b92-ae19-d421bae67912","user_phone":""}}', '2025-08-30 23:52:09.879516+00', ''),
	('00000000-0000-0000-0000-000000000000', '535e3c9b-b10d-4436-a77f-0a482a5bdbc7', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"quality@factorypulse.vn","user_id":"82af21a1-4469-4843-8533-adee006789f5","user_phone":""}}', '2025-08-30 23:52:09.881495+00', ''),
	('00000000-0000-0000-0000-000000000000', '4333c8d2-62b8-44ad-b9dd-eabd791247ae', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"operations@factorypulse.vn","user_id":"45b42035-648b-4a33-a3aa-845f267aab60","user_phone":""}}', '2025-08-30 23:52:09.884036+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f9b49f3a-ea2d-4de2-9e1d-683789d58f1d', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ceo@factorypulse.vn","user_id":"539da4e2-4492-4803-a31b-e155f62a97bb","user_phone":""}}', '2025-08-30 23:52:09.886152+00', ''),
	('00000000-0000-0000-0000-000000000000', '0d6ad023-a9be-4443-9e79-e11fa29a4db9', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"ceo@factorypulse.vn","user_id":"ceafa7d8-dda2-4645-b253-894839eee7b3","user_phone":""}}', '2025-08-30 23:52:09.944361+00', ''),
	('00000000-0000-0000-0000-000000000000', '0304014d-9138-456b-8db4-42904a42957b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"operations@factorypulse.vn","user_id":"497809e4-7429-437c-a81c-6f43e2fa77c1","user_phone":""}}', '2025-08-30 23:52:09.998632+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b74ede7-7072-4e7b-8ab9-b147cc038fe8', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"quality@factorypulse.vn","user_id":"a161659d-d39c-4f98-aa90-208f0a80e0cc","user_phone":""}}', '2025-08-30 23:52:10.051619+00', ''),
	('00000000-0000-0000-0000-000000000000', '964d06ae-ac3f-4eef-9144-14d9a28b6234', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"senior.engineer@factorypulse.vn","user_id":"00474d04-fe69-4823-91f2-c74b96c5c958","user_phone":""}}', '2025-08-30 23:52:10.104028+00', ''),
	('00000000-0000-0000-0000-000000000000', '1dab5a52-45dc-45e5-9750-ebc7820ab27c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"mechanical.engineer@factorypulse.vn","user_id":"80034f6f-b520-4bf4-9197-0379588b976e","user_phone":""}}', '2025-08-30 23:52:10.157309+00', ''),
	('00000000-0000-0000-0000-000000000000', '965bf233-67e6-424e-8df0-fbac73231f17', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"electrical.engineer@factorypulse.vn","user_id":"da918e06-7480-4b36-8368-456db3fba638","user_phone":""}}', '2025-08-30 23:52:10.210752+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd7a490f4-238c-4fbe-bab4-e24ff372f24c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"qa.engineer@factorypulse.vn","user_id":"a53f503d-ad74-4397-a3f1-5ee9c3e61d34","user_phone":""}}', '2025-08-30 23:52:10.262944+00', ''),
	('00000000-0000-0000-0000-000000000000', '8ca4146b-fc1a-4f69-ab19-3cd50e7eebf1', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"production.supervisor@factorypulse.vn","user_id":"30951eed-46a0-441b-8abf-fbf0e6be127c","user_phone":""}}', '2025-08-30 23:52:10.317758+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a165434b-2af9-4ca1-a053-9002f18c3530', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"team.lead@factorypulse.vn","user_id":"6e6d4947-84b6-41e9-888c-3cf1a3480743","user_phone":""}}', '2025-08-30 23:52:10.37229+00', ''),
	('00000000-0000-0000-0000-000000000000', '587615f0-20fc-47f6-8439-291decdc320e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"quality.inspector@factorypulse.vn","user_id":"27ec8d55-a5d7-476c-9998-fe3fbafb509f","user_phone":""}}', '2025-08-30 23:52:10.424975+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c16e58c-97a2-4ae8-94d7-fc41b8a7b4d6', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"sales.manager@factorypulse.vn","user_id":"6e8fc313-fd4b-4aa5-95b1-9021e2483d3a","user_phone":""}}', '2025-08-30 23:52:10.477137+00', ''),
	('00000000-0000-0000-0000-000000000000', '2546e8ea-83a2-4e1e-b503-3e5dd1729a72', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"procurement@factorypulse.vn","user_id":"2de25409-78d3-4892-b4d3-9fbc252bc674","user_phone":""}}', '2025-08-30 23:52:10.529782+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f63e9da2-84f6-45ed-b223-7544de9e2061', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"project.coordinator@factorypulse.vn","user_id":"9cb57c45-c9e7-4cff-b40b-53e14d13c6e9","user_phone":""}}', '2025-08-30 23:52:10.585003+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bb75a929-e72d-4ee4-92f8-232b9cbc1454', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@factorypulse.vn","user_id":"a3b8e7b3-f0d9-4edd-abd4-ec78f3816d11","user_phone":""}}', '2025-08-30 23:52:10.639126+00', ''),
	('00000000-0000-0000-0000-000000000000', '9a2dd63b-26fe-4771-9943-9149fc4d10d1', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"customer.service@factorypulse.vn","user_id":"d8fa56d6-2b38-4e76-8425-d1daad896f51","user_phone":""}}', '2025-08-30 23:52:10.693768+00', ''),
	('00000000-0000-0000-0000-000000000000', '1c59e118-4835-4afd-a353-96188de99fc6', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"procurement@toyota.vn","user_id":"550e8400-e29b-41d4-a716-446655440101","user_phone":""}}', '2025-08-31 00:16:48.239608+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a7fae126-709d-4916-a759-b748a2367462', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"purchasing@honda.vn","user_id":"550e8400-e29b-41d4-a716-446655440102","user_phone":""}}', '2025-08-31 00:16:48.301431+00', ''),
	('00000000-0000-0000-0000-000000000000', '25a84803-04de-4d6b-9bd3-f37d33491be5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"supply.chain@boeing.vn","user_id":"550e8400-e29b-41d4-a716-446655440103","user_phone":""}}', '2025-08-31 00:16:48.356846+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd85f4c3-dc2d-4b1c-8fe6-d0fded8d72b1', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"procurement@airbus.vn","user_id":"550e8400-e29b-41d4-a716-446655440104","user_phone":""}}', '2025-08-31 00:16:48.412481+00', ''),
	('00000000-0000-0000-0000-000000000000', '54e27f6c-47ac-4ca0-9f0f-1802a0cf7d28', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"purchasing@samsung.vn","user_id":"550e8400-e29b-41d4-a716-446655440105","user_phone":""}}', '2025-08-31 00:16:48.466656+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f23fe5e5-7f5e-449c-956c-9f836456409e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"sales@precision-machining.vn","user_id":"550e8400-e29b-41d4-a716-446655440106","user_phone":""}}', '2025-08-31 00:16:48.520402+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ee89c66b-9083-41f0-b52b-cceb51703920', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"info@metal-fabrication.vn","user_id":"550e8400-e29b-41d4-a716-446655440107","user_phone":""}}', '2025-08-31 00:16:48.574586+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc6b58c9-89ed-4bfe-885e-265938ca0dcb', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"sales@assembly-solutions.vn","user_id":"550e8400-e29b-41d4-a716-446655440108","user_phone":""}}', '2025-08-31 00:16:48.626972+00', ''),
	('00000000-0000-0000-0000-000000000000', '0c63ee35-f47f-4482-bafa-a79ddb105c7d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"info@surface-finishing.vn","user_id":"550e8400-e29b-41d4-a716-446655440109","user_phone":""}}', '2025-08-31 00:16:48.686478+00', ''),
	('00000000-0000-0000-0000-000000000000', '738971bf-6eb0-4841-9e8e-43beb532ef3b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"sales@electronics-assembly.vn","user_id":"550e8400-e29b-41d4-a716-446655440110","user_phone":""}}', '2025-08-31 00:16:48.74117+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ae7423e8-b124-4fd0-8266-b3c034051a7b', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"ceo@factorypulse.vn","user_id":"ceafa7d8-dda2-4645-b253-894839eee7b3","user_phone":""}}', '2025-08-31 00:24:45.403775+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f8392702-593f-4e04-90ce-2fabf4da33c7', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"operations@factorypulse.vn","user_id":"497809e4-7429-437c-a81c-6f43e2fa77c1","user_phone":""}}', '2025-08-31 00:24:45.511107+00', ''),
	('00000000-0000-0000-0000-000000000000', '61597e0a-e796-4104-a59c-bfc79fa4f791', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"quality@factorypulse.vn","user_id":"a161659d-d39c-4f98-aa90-208f0a80e0cc","user_phone":""}}', '2025-08-31 00:24:45.620291+00', ''),
	('00000000-0000-0000-0000-000000000000', '914dad0d-d070-4ab3-b708-2a3f1c46f917', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"senior.engineer@factorypulse.vn","user_id":"00474d04-fe69-4823-91f2-c74b96c5c958","user_phone":""}}', '2025-08-31 00:24:45.730097+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af2db950-7f38-4aec-9395-95c699105960', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"mechanical.engineer@factorypulse.vn","user_id":"80034f6f-b520-4bf4-9197-0379588b976e","user_phone":""}}', '2025-08-31 00:24:45.844724+00', ''),
	('00000000-0000-0000-0000-000000000000', '7b996d7f-99c5-42c5-b02f-8cccf987ea0c', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"electrical.engineer@factorypulse.vn","user_id":"da918e06-7480-4b36-8368-456db3fba638","user_phone":""}}', '2025-08-31 00:24:45.958387+00', ''),
	('00000000-0000-0000-0000-000000000000', '548919cc-0815-41dc-90ca-003324a3d0bd', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"qa.engineer@factorypulse.vn","user_id":"a53f503d-ad74-4397-a3f1-5ee9c3e61d34","user_phone":""}}', '2025-08-31 00:24:46.072897+00', ''),
	('00000000-0000-0000-0000-000000000000', '422b21c9-ffd3-482d-bc49-bbf2e50803e2', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"production.supervisor@factorypulse.vn","user_id":"30951eed-46a0-441b-8abf-fbf0e6be127c","user_phone":""}}', '2025-08-31 00:24:46.184528+00', ''),
	('00000000-0000-0000-0000-000000000000', '4fc8b0ed-6a6a-4bad-a420-825ce0ce4848', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"team.lead@factorypulse.vn","user_id":"6e6d4947-84b6-41e9-888c-3cf1a3480743","user_phone":""}}', '2025-08-31 00:24:46.296054+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b21d3f1f-562e-42fe-b986-c9e0d04997fd', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"quality.inspector@factorypulse.vn","user_id":"27ec8d55-a5d7-476c-9998-fe3fbafb509f","user_phone":""}}', '2025-08-31 00:24:46.405794+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b8738d2b-fd96-4518-ad0b-2b15e323d31d', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"sales.manager@factorypulse.vn","user_id":"6e8fc313-fd4b-4aa5-95b1-9021e2483d3a","user_phone":""}}', '2025-08-31 00:24:46.520536+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ff5de015-af33-4e4d-8154-0689bd88086b', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"procurement@factorypulse.vn","user_id":"2de25409-78d3-4892-b4d3-9fbc252bc674","user_phone":""}}', '2025-08-31 00:24:46.633795+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f806d177-6204-452b-ba78-cacdff6ff0cd', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"project.coordinator@factorypulse.vn","user_id":"9cb57c45-c9e7-4cff-b40b-53e14d13c6e9","user_phone":""}}', '2025-08-31 00:24:46.747898+00', ''),
	('00000000-0000-0000-0000-000000000000', '79f78f11-b42f-4e99-813a-1d715b36859c', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"admin@factorypulse.vn","user_id":"a3b8e7b3-f0d9-4edd-abd4-ec78f3816d11","user_phone":""}}', '2025-08-31 00:24:46.862523+00', ''),
	('00000000-0000-0000-0000-000000000000', '053a2c75-b141-4300-bdbc-2e8af4451958', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"customer.service@factorypulse.vn","user_id":"d8fa56d6-2b38-4e76-8425-d1daad896f51","user_phone":""}}', '2025-08-31 00:24:46.978668+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'a161659d-d39c-4f98-aa90-208f0a80e0cc', 'authenticated', 'authenticated', 'quality@factorypulse.vn', '$2a$10$ZBUn9UZiWTETyef04AwikOLaSXtekp5PMnTci6MplLMuDfiGg3j.C', '2025-08-30 23:52:10.052048+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Lê Viết Tuấn", "role": "management", "phone": "+84-28-7300-0003", "full_name": "Lê Viết Tuấn", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/quality.jpg", "department": "Quality", "employee_id": "EMP-LVT-550e", "display_name": "Lê Viết Tuấn", "email_verified": true}', NULL, '2025-08-30 23:52:10.050718+00', '2025-08-31 00:24:45.619785+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a53f503d-ad74-4397-a3f1-5ee9c3e61d34', 'authenticated', 'authenticated', 'qa.engineer@factorypulse.vn', '$2a$10$bLUak7iXn6.Cgj7zq.nJfeMSFeB9eS3pFAX8AH2F5MPgJEhng1Qju', '2025-08-30 23:52:10.263339+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Ngô Thị Hà", "role": "qa", "phone": "+84-28-7300-0007", "full_name": "Ngô Thị Hà", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/qa-engineer.jpg", "department": "Quality", "employee_id": "EMP-NTH-550e", "display_name": "Ngô Thị Hà", "email_verified": true}', NULL, '2025-08-30 23:52:10.262206+00', '2025-08-31 00:24:46.072481+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00474d04-fe69-4823-91f2-c74b96c5c958', 'authenticated', 'authenticated', 'senior.engineer@factorypulse.vn', '$2a$10$bkLnvc8lLf.Frcpbcrb2/.3khjPFzsla2bWOh8cDSYgVpaDUhezMS', '2025-08-30 23:52:10.104492+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Phạm Văn Dũng", "role": "engineering", "phone": "+84-28-7300-0004", "full_name": "Phạm Văn Dũng", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/senior-engineer.jpg", "department": "Engineering", "employee_id": "EMP-PVD-550e", "display_name": "Phạm Văn Dũng", "email_verified": true}', NULL, '2025-08-30 23:52:10.103205+00', '2025-08-31 00:24:45.729578+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '80034f6f-b520-4bf4-9197-0379588b976e', 'authenticated', 'authenticated', 'mechanical.engineer@factorypulse.vn', '$2a$10$1D3ZfydJKEhjFpUV9G.yoeSXcjL29TB8qoFPyhfbvwFefCpYJPd4C', '2025-08-30 23:52:10.157736+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Hoàng Thị Lan", "role": "engineering", "phone": "+84-28-7300-0005", "full_name": "Hoàng Thị Lan", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/mechanical-engineer.jpg", "department": "Engineering", "employee_id": "EMP-HTL-550e", "display_name": "Hoàng Thị Lan", "email_verified": true}', NULL, '2025-08-30 23:52:10.156468+00', '2025-08-31 00:24:45.844246+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2de25409-78d3-4892-b4d3-9fbc252bc674', 'authenticated', 'authenticated', 'procurement@factorypulse.vn', '$2a$10$1tKNvok1AyCILs/9/N8pweNvQcioPio.fxuHRdSb7FgD7xgHWPTea', '2025-08-30 23:52:10.530175+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Lê Văn Phúc", "role": "procurement", "phone": "+84-28-7300-0012", "full_name": "Lê Văn Phúc", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/procurement.jpg", "department": "Procurement", "employee_id": "EMP-LVP-550e", "display_name": "Lê Văn Phúc", "email_verified": true}', NULL, '2025-08-30 23:52:10.529102+00', '2025-08-31 00:24:46.633155+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6e6d4947-84b6-41e9-888c-3cf1a3480743', 'authenticated', 'authenticated', 'team.lead@factorypulse.vn', '$2a$10$9KLnfj6ojfvcN6AJxwsuwOUt7WzeqNkgBTWSthcEjXKA6ktXu0c3u', '2025-08-30 23:52:10.372737+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Lý Thị Mai", "role": "production", "phone": "+84-28-7300-0009", "full_name": "Lý Thị Mai", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/team-lead.jpg", "department": "Production", "employee_id": "EMP-LTM-550e", "display_name": "Lý Thị Mai", "email_verified": true}', NULL, '2025-08-30 23:52:10.371428+00', '2025-08-31 00:24:46.295542+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '27ec8d55-a5d7-476c-9998-fe3fbafb509f', 'authenticated', 'authenticated', 'quality.inspector@factorypulse.vn', '$2a$10$CcGQwK5zVIeGSNDsE9MpIeYfCu/l.MFDuvwDgiW43SXV8VBG/LFMu', '2025-08-30 23:52:10.425383+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Đặng Văn Hùng", "role": "qa", "phone": "+84-28-7300-0010", "full_name": "Đặng Văn Hùng", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/quality-inspector.jpg", "department": "Quality", "employee_id": "EMP-DVH-550e", "display_name": "Đặng Văn Hùng", "email_verified": true}', NULL, '2025-08-30 23:52:10.424214+00', '2025-08-31 00:24:46.405397+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a3b8e7b3-f0d9-4edd-abd4-ec78f3816d11', 'authenticated', 'authenticated', 'admin@factorypulse.vn', '$2a$10$SfFF.66BU40gvwQPJETJcew0eGxyBR.n.452QZSI0A5ikPu0u8Tla', '2025-08-30 23:52:10.639627+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Võ Đình Tài", "role": "admin", "phone": "+84-28-7300-0014", "full_name": "Võ Đình Tài", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/admin.jpg", "department": "IT", "employee_id": "EMP-VDT-550e", "display_name": "Võ Đình Tài", "email_verified": true}', NULL, '2025-08-30 23:52:10.638335+00', '2025-08-31 00:24:46.862005+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd8fa56d6-2b38-4e76-8425-d1daad896f51', 'authenticated', 'authenticated', 'customer.service@factorypulse.vn', '$2a$10$6O1LLkq5oqjaKaapMNkj9.mxhcQ4Lz1OlFy0T/onZA0BLabt/B3pq', '2025-08-30 23:52:10.694215+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Nguyễn Thị Hoa", "role": "sales", "phone": "+84-28-7300-0015", "full_name": "Nguyễn Thị Hoa", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/customer-service.jpg", "department": "Customer Service", "employee_id": "EMP-NTH-550e", "display_name": "Nguyễn Thị Hoa", "email_verified": true}', NULL, '2025-08-30 23:52:10.693023+00', '2025-08-31 00:24:46.978171+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440101', 'authenticated', 'authenticated', 'procurement@toyota.vn', '$2a$10$FN5I8lu0U3sFbzq4Vq3q8epP2GUDdDj3jr2qbLOZgS9IkssCMfNmG', '2025-08-31 00:16:48.240231+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Nguyễn Văn An", "role": "customer", "phone": "+84-28-7300-1001", "full_name": "Nguyễn Văn An", "company_name": "Toyota Vietnam", "contact_type": "customer", "display_name": "Nguyễn Văn An", "email_verified": true}', NULL, '2025-08-31 00:16:48.238426+00', '2025-08-31 00:16:48.240529+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ceafa7d8-dda2-4645-b253-894839eee7b3', 'authenticated', 'authenticated', 'ceo@factorypulse.vn', '$2a$10$pSa0SfUFMBBAG7QS8AY9yepCVUtwha9i4sduKw17gb9O2LrwAzUfy', '2025-08-30 23:52:09.944885+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Nguyễn Quang Minh", "role": "management", "phone": "+84-28-7300-0001", "full_name": "Nguyễn Quang Minh", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/ceo.jpg", "department": "Executive", "employee_id": "EMP-NVM-550e", "display_name": "Nguyễn Quang Minh", "email_verified": true}', NULL, '2025-08-30 23:52:09.942037+00', '2025-08-31 00:24:45.403188+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '497809e4-7429-437c-a81c-6f43e2fa77c1', 'authenticated', 'authenticated', 'operations@factorypulse.vn', '$2a$10$5tW33.0cXAIwlhGJh1l.oufSBAnAeces5gfJ9fHqqUq7rL0oMCusy', '2025-08-30 23:52:09.99909+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Trần Ngọc Hương", "role": "management", "phone": "+84-28-7300-0002", "full_name": "Trần Ngọc Hương", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/operations.jpg", "department": "Operations", "employee_id": "EMP-TTH-550e", "display_name": "Trần Ngọc Hương", "email_verified": true}', NULL, '2025-08-30 23:52:09.997708+00', '2025-08-31 00:24:45.510819+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440102', 'authenticated', 'authenticated', 'purchasing@honda.vn', '$2a$10$HeO13cli1XfYllyXgGNakOi4BvqcuvzBuVWwj4KwLhNa276uOLsEa', '2025-08-31 00:16:48.302028+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Trần Thị Bình", "role": "customer", "phone": "+84-28-7300-1002", "full_name": "Trần Thị Bình", "company_name": "Honda Vietnam", "contact_type": "customer", "display_name": "Trần Thị Bình", "email_verified": true}', NULL, '2025-08-31 00:16:48.300448+00', '2025-08-31 00:16:48.302338+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440106', 'authenticated', 'authenticated', 'sales@precision-machining.vn', '$2a$10$DzT3y5YnVww6LZ9Yg3IA7eB/vK6TWIcTZYX18vnGVlB15tyqSkp/q', '2025-08-31 00:16:48.521384+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Trần Văn Phúc", "role": "supplier", "phone": "+84-28-7300-2001", "full_name": "Trần Văn Phúc", "company_name": "Precision Machining Co.", "contact_type": "supplier", "display_name": "Trần Văn Phúc", "email_verified": true}', NULL, '2025-08-31 00:16:48.519592+00', '2025-08-31 00:16:48.521647+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440103', 'authenticated', 'authenticated', 'supply.chain@boeing.vn', '$2a$10$5jmIt/192GwU6B.UHeKZRu8ZIMhaUIMD0hdmCOb5G1qX6moxYIN1O', '2025-08-31 00:16:48.35737+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Lê Văn Cường", "role": "customer", "phone": "+84-28-7300-1003", "full_name": "Lê Văn Cường", "company_name": "Boeing Vietnam", "contact_type": "customer", "display_name": "Lê Văn Cường", "email_verified": true}', NULL, '2025-08-31 00:16:48.355987+00', '2025-08-31 00:16:48.357617+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440108', 'authenticated', 'authenticated', 'sales@assembly-solutions.vn', '$2a$10$HBPfgnQxw3pnyi7ZziCc5u6t6BVMAWFeS8ka5FGDlPGMROUriQ6zm', '2025-08-31 00:16:48.627533+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Nguyễn Văn Tâm", "role": "supplier", "phone": "+84-28-7300-2003", "full_name": "Nguyễn Văn Tâm", "company_name": "Assembly Solutions", "contact_type": "supplier", "display_name": "Nguyễn Văn Tâm", "email_verified": true}', NULL, '2025-08-31 00:16:48.626274+00', '2025-08-31 00:16:48.62779+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440104', 'authenticated', 'authenticated', 'procurement@airbus.vn', '$2a$10$DkKiFyvBzcQIVQCrgEJRK.9InLd2sPhiv4iOR0IsSlilL146Bm3wa', '2025-08-31 00:16:48.412982+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Phạm Thị Dung", "role": "customer", "phone": "+84-28-7300-1004", "full_name": "Phạm Thị Dung", "company_name": "Airbus Vietnam", "contact_type": "customer", "display_name": "Phạm Thị Dung", "email_verified": true}', NULL, '2025-08-31 00:16:48.411619+00', '2025-08-31 00:16:48.413324+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440107', 'authenticated', 'authenticated', 'info@metal-fabrication.vn', '$2a$10$ku2/UAsfufboat.Sq9cJw.dsXk9Y/yfTyRZhqOuX9wzzIcCWWhiEW', '2025-08-31 00:16:48.575135+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Lê Thị Hương", "role": "supplier", "phone": "+84-28-7300-2002", "full_name": "Lê Thị Hương", "company_name": "Metal Fabrication Ltd.", "contact_type": "supplier", "display_name": "Lê Thị Hương", "email_verified": true}', NULL, '2025-08-31 00:16:48.573844+00', '2025-08-31 00:16:48.5754+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440105', 'authenticated', 'authenticated', 'purchasing@samsung.vn', '$2a$10$BcSJe24iFK.pVpT7G1XExO5l0VB4GeKBm4PB366lXnpw1zwGj3VyG', '2025-08-31 00:16:48.467108+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Hoàng Văn Em", "role": "customer", "phone": "+84-28-7300-1005", "full_name": "Hoàng Văn Em", "company_name": "Samsung Vietnam", "contact_type": "customer", "display_name": "Hoàng Văn Em", "email_verified": true}', NULL, '2025-08-31 00:16:48.465814+00', '2025-08-31 00:16:48.467369+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6e8fc313-fd4b-4aa5-95b1-9021e2483d3a', 'authenticated', 'authenticated', 'sales.manager@factorypulse.vn', '$2a$10$XAG0/6quDJ4W9kF3indETeA1cZZXwC8Z4k4BPv/wnZo16ciBLbnMa', '2025-08-30 23:52:10.477517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Bùi Thị Thu", "role": "sales", "phone": "+84-28-7300-0011", "full_name": "Bùi Thị Thu", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/sales-manager.jpg", "department": "Sales", "employee_id": "EMP-BTT-550e", "display_name": "Bùi Thị Thu", "email_verified": true}', NULL, '2025-08-30 23:52:10.476428+00', '2025-08-31 00:24:46.51985+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9cb57c45-c9e7-4cff-b40b-53e14d13c6e9', 'authenticated', 'authenticated', 'project.coordinator@factorypulse.vn', '$2a$10$AQSllqm/CIV4h0x/.MyKv.3enPRjrlMUhSLwgDL/HrBWM/gq8yh5S', '2025-08-30 23:52:10.585594+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Phan Thị Kim", "role": "management", "phone": "+84-28-7300-0013", "full_name": "Phan Thị Kim", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/project-coordinator.jpg", "department": "Project Management", "employee_id": "EMP-PTK-550e", "display_name": "Phan Thị Kim", "email_verified": true}', NULL, '2025-08-30 23:52:10.584213+00', '2025-08-31 00:24:46.747291+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440110', 'authenticated', 'authenticated', 'sales@electronics-assembly.vn', '$2a$10$umv1/QRx1rUtVgAJZ4YjCelsHQ/WV.oH9dH1Bto9LoEjqvObGK9le', '2025-08-31 00:16:48.741614+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Vũ Đình Nam", "role": "supplier", "phone": "+84-28-7300-2005", "full_name": "Vũ Đình Nam", "company_name": "Electronics Assembly", "contact_type": "supplier", "display_name": "Vũ Đình Nam", "email_verified": true}', NULL, '2025-08-31 00:16:48.740391+00', '2025-08-31 00:16:48.741846+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440109', 'authenticated', 'authenticated', 'info@surface-finishing.vn', '$2a$10$Yis7eQLbcKQGTjf9.Ic3Mu.6N8hmfBV0mkO6W4vhZv5UN4RNp0OW6', '2025-08-31 00:16:48.687308+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Trịnh Thị Lan", "role": "supplier", "phone": "+84-28-7300-2004", "full_name": "Trịnh Thị Lan", "company_name": "Surface Finishing Pro", "contact_type": "supplier", "display_name": "Trịnh Thị Lan", "email_verified": true}', NULL, '2025-08-31 00:16:48.685444+00', '2025-08-31 00:16:48.687708+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'da918e06-7480-4b36-8368-456db3fba638', 'authenticated', 'authenticated', 'electrical.engineer@factorypulse.vn', '$2a$10$wzD1zc3wQNxW517lvf7KyORhGi7BJKmcM/JAkkAE1Pmzs2NrYuwgW', '2025-08-30 23:52:10.211199+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Vũ Đình Nam", "role": "engineering", "phone": "+84-28-7300-0006", "full_name": "Vũ Đình Nam", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/electrical-engineer.jpg", "department": "Engineering", "employee_id": "EMP-VDN-550e", "display_name": "Vũ Đình Nam", "email_verified": true}', NULL, '2025-08-30 23:52:10.210031+00', '2025-08-31 00:24:45.957522+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '30951eed-46a0-441b-8abf-fbf0e6be127c', 'authenticated', 'authenticated', 'production.supervisor@factorypulse.vn', '$2a$10$bpP.kLXZSC7L7uz7l38k1e7zKub.GIRoPfQjRhRK7gIoa0CP8Yb0y', '2025-08-30 23:52:10.318337+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Trịnh Văn Sơn", "role": "production", "phone": "+84-28-7300-0008", "full_name": "Trịnh Văn Sơn", "avatar_url": "https://storage.googleapis.com/factory-pulse-assets/avatars/production-supervisor.jpg", "department": "Production", "employee_id": "EMP-TVS-550e", "display_name": "Trịnh Văn Sơn", "email_verified": true}', NULL, '2025-08-30 23:52:10.316769+00', '2025-08-31 00:24:46.184018+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('ceafa7d8-dda2-4645-b253-894839eee7b3', 'ceafa7d8-dda2-4645-b253-894839eee7b3', '{"sub": "ceafa7d8-dda2-4645-b253-894839eee7b3", "email": "ceo@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:09.943938+00', '2025-08-30 23:52:09.943988+00', '2025-08-30 23:52:09.943988+00', 'bef9772f-6cda-4545-9def-0fc37b9d8053'),
	('497809e4-7429-437c-a81c-6f43e2fa77c1', '497809e4-7429-437c-a81c-6f43e2fa77c1', '{"sub": "497809e4-7429-437c-a81c-6f43e2fa77c1", "email": "operations@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:09.99825+00', '2025-08-30 23:52:09.998266+00', '2025-08-30 23:52:09.998266+00', '8911a853-131d-4b2d-b05d-e7df5cce26e8'),
	('a161659d-d39c-4f98-aa90-208f0a80e0cc', 'a161659d-d39c-4f98-aa90-208f0a80e0cc', '{"sub": "a161659d-d39c-4f98-aa90-208f0a80e0cc", "email": "quality@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.051231+00', '2025-08-30 23:52:10.051252+00', '2025-08-30 23:52:10.051252+00', '9fb55712-de78-43e8-a7fa-bd5587f31c91'),
	('00474d04-fe69-4823-91f2-c74b96c5c958', '00474d04-fe69-4823-91f2-c74b96c5c958', '{"sub": "00474d04-fe69-4823-91f2-c74b96c5c958", "email": "senior.engineer@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.103706+00', '2025-08-30 23:52:10.103719+00', '2025-08-30 23:52:10.103719+00', '802b587b-203e-4d77-b7d0-0db00a1d99d3'),
	('80034f6f-b520-4bf4-9197-0379588b976e', '80034f6f-b520-4bf4-9197-0379588b976e', '{"sub": "80034f6f-b520-4bf4-9197-0379588b976e", "email": "mechanical.engineer@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.156896+00', '2025-08-30 23:52:10.156921+00', '2025-08-30 23:52:10.156921+00', '051b9dec-d5d7-4f3f-b60f-b093dea268bd'),
	('da918e06-7480-4b36-8368-456db3fba638', 'da918e06-7480-4b36-8368-456db3fba638', '{"sub": "da918e06-7480-4b36-8368-456db3fba638", "email": "electrical.engineer@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.210447+00', '2025-08-30 23:52:10.210459+00', '2025-08-30 23:52:10.210459+00', 'cc9a9f23-b535-4592-a638-48303eb3b746'),
	('a53f503d-ad74-4397-a3f1-5ee9c3e61d34', 'a53f503d-ad74-4397-a3f1-5ee9c3e61d34', '{"sub": "a53f503d-ad74-4397-a3f1-5ee9c3e61d34", "email": "qa.engineer@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.262653+00', '2025-08-30 23:52:10.262666+00', '2025-08-30 23:52:10.262666+00', 'fbbd6294-cf75-483f-a8ba-1974623df8b0'),
	('30951eed-46a0-441b-8abf-fbf0e6be127c', '30951eed-46a0-441b-8abf-fbf0e6be127c', '{"sub": "30951eed-46a0-441b-8abf-fbf0e6be127c", "email": "production.supervisor@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.31731+00', '2025-08-30 23:52:10.317329+00', '2025-08-30 23:52:10.317329+00', 'be0e5b61-ea66-4aa9-98f0-ea1b45a8ce9e'),
	('6e6d4947-84b6-41e9-888c-3cf1a3480743', '6e6d4947-84b6-41e9-888c-3cf1a3480743', '{"sub": "6e6d4947-84b6-41e9-888c-3cf1a3480743", "email": "team.lead@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.371894+00', '2025-08-30 23:52:10.37193+00', '2025-08-30 23:52:10.37193+00', 'eed2c7ba-aae5-4b3f-9fab-6fbca6483e67'),
	('27ec8d55-a5d7-476c-9998-fe3fbafb509f', '27ec8d55-a5d7-476c-9998-fe3fbafb509f', '{"sub": "27ec8d55-a5d7-476c-9998-fe3fbafb509f", "email": "quality.inspector@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.424686+00', '2025-08-30 23:52:10.4247+00', '2025-08-30 23:52:10.4247+00', 'f443c516-3414-4bb9-98de-811e3aa9701b'),
	('6e8fc313-fd4b-4aa5-95b1-9021e2483d3a', '6e8fc313-fd4b-4aa5-95b1-9021e2483d3a', '{"sub": "6e8fc313-fd4b-4aa5-95b1-9021e2483d3a", "email": "sales.manager@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.476844+00', '2025-08-30 23:52:10.476856+00', '2025-08-30 23:52:10.476856+00', 'bfa30bbd-269a-4efe-a388-c8261c51b924'),
	('2de25409-78d3-4892-b4d3-9fbc252bc674', '2de25409-78d3-4892-b4d3-9fbc252bc674', '{"sub": "2de25409-78d3-4892-b4d3-9fbc252bc674", "email": "procurement@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.52952+00', '2025-08-30 23:52:10.529532+00', '2025-08-30 23:52:10.529532+00', '091a123f-dfb1-41a2-9fff-13fb280dc4f1'),
	('9cb57c45-c9e7-4cff-b40b-53e14d13c6e9', '9cb57c45-c9e7-4cff-b40b-53e14d13c6e9', '{"sub": "9cb57c45-c9e7-4cff-b40b-53e14d13c6e9", "email": "project.coordinator@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.584666+00', '2025-08-30 23:52:10.58468+00', '2025-08-30 23:52:10.58468+00', '589b601e-3f20-4ee6-ad8f-2556eaeb3769'),
	('a3b8e7b3-f0d9-4edd-abd4-ec78f3816d11', 'a3b8e7b3-f0d9-4edd-abd4-ec78f3816d11', '{"sub": "a3b8e7b3-f0d9-4edd-abd4-ec78f3816d11", "email": "admin@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.638783+00', '2025-08-30 23:52:10.638796+00', '2025-08-30 23:52:10.638796+00', 'bf89b08d-7cf9-443b-ab45-80b659b4cb69'),
	('d8fa56d6-2b38-4e76-8425-d1daad896f51', 'd8fa56d6-2b38-4e76-8425-d1daad896f51', '{"sub": "d8fa56d6-2b38-4e76-8425-d1daad896f51", "email": "customer.service@factorypulse.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-30 23:52:10.69349+00', '2025-08-30 23:52:10.693505+00', '2025-08-30 23:52:10.693505+00', '8c20d7d9-50c3-4f49-b1fc-19be212bc33b'),
	('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440101', '{"sub": "550e8400-e29b-41d4-a716-446655440101", "email": "procurement@toyota.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-31 00:16:48.239138+00', '2025-08-31 00:16:48.239157+00', '2025-08-31 00:16:48.239157+00', 'fa054581-8f6b-4106-bd05-2c6fab113dfe'),
	('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440102', '{"sub": "550e8400-e29b-41d4-a716-446655440102", "email": "purchasing@honda.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-31 00:16:48.30094+00', '2025-08-31 00:16:48.300957+00', '2025-08-31 00:16:48.300957+00', 'ae1cf289-9e25-4c26-9269-cf25ab104fa0'),
	('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440103', '{"sub": "550e8400-e29b-41d4-a716-446655440103", "email": "supply.chain@boeing.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-31 00:16:48.356499+00', '2025-08-31 00:16:48.356512+00', '2025-08-31 00:16:48.356512+00', '37c6f4c9-d2d7-46de-b6ea-288c2bcf73c5'),
	('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440104', '{"sub": "550e8400-e29b-41d4-a716-446655440104", "email": "procurement@airbus.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-31 00:16:48.412125+00', '2025-08-31 00:16:48.412146+00', '2025-08-31 00:16:48.412146+00', '30ba1a4f-b795-4597-bc5f-e08be2196914'),
	('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440105', '{"sub": "550e8400-e29b-41d4-a716-446655440105", "email": "purchasing@samsung.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-31 00:16:48.466318+00', '2025-08-31 00:16:48.466335+00', '2025-08-31 00:16:48.466335+00', '581dcf13-e2b1-4f70-a03e-5542ab02be86'),
	('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440106', '{"sub": "550e8400-e29b-41d4-a716-446655440106", "email": "sales@precision-machining.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-31 00:16:48.52005+00', '2025-08-31 00:16:48.520062+00', '2025-08-31 00:16:48.520062+00', 'eff31e7a-bb65-48e5-a96d-8c52bc005231'),
	('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440107', '{"sub": "550e8400-e29b-41d4-a716-446655440107", "email": "info@metal-fabrication.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-31 00:16:48.574297+00', '2025-08-31 00:16:48.574312+00', '2025-08-31 00:16:48.574312+00', '71517ba7-1cde-4e72-9d42-947c9a003449'),
	('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440108', '{"sub": "550e8400-e29b-41d4-a716-446655440108", "email": "sales@assembly-solutions.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-31 00:16:48.626695+00', '2025-08-31 00:16:48.626707+00', '2025-08-31 00:16:48.626707+00', '7515e3fe-6e33-4c21-8356-c93491623187'),
	('550e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440109', '{"sub": "550e8400-e29b-41d4-a716-446655440109", "email": "info@surface-finishing.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-31 00:16:48.686043+00', '2025-08-31 00:16:48.686061+00', '2025-08-31 00:16:48.686061+00', 'd4b68067-e26f-4754-880d-28e76e9e772a'),
	('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440110', '{"sub": "550e8400-e29b-41d4-a716-446655440110", "email": "sales@electronics-assembly.vn", "email_verified": false, "phone_verified": false}', 'email', '2025-08-31 00:16:48.74083+00', '2025-08-31 00:16:48.740857+00', '2025-08-31 00:16:48.740857+00', '9cdecc9a-ae63-4f98-bd61-53a847b41e2e');


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
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organizations" ("id", "name", "slug", "domain", "logo_url", "description", "industry", "settings", "subscription_plan", "is_active", "created_at", "updated_at") VALUES
	('550e8400-e29b-41d4-a716-446655440001', 'Factory Pulse Vietnam', 'factory-pulse-vn', 'factorypulse.vn', NULL, 'Manufacturing Execution System for Factory Pulse Vietnam', 'Manufacturing', '{}', 'enterprise', true, '2025-08-30 23:51:01.686105+00', '2025-08-30 23:51:01.686105+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "organization_id", "email", "name", "role", "department", "phone", "avatar_url", "status", "description", "employee_id", "direct_manager_id", "direct_reports", "last_login_at", "preferences", "created_at", "updated_at") VALUES
	('ceafa7d8-dda2-4645-b253-894839eee7b3', '550e8400-e29b-41d4-a716-446655440001', 'ceo@factorypulse.vn', 'Nguyễn Quang Minh', 'management', 'Executive', '+84-28-7300-0001', 'https://storage.googleapis.com/factory-pulse-assets/avatars/ceo.jpg', 'active', 'CEO and General Manager with 20+ years in manufacturing', 'EMP-NVM-550e', NULL, '{497809e4-7429-437c-a81c-6f43e2fa77c1,a161659d-d39c-4f98-aa90-208f0a80e0cc,6e8fc313-fd4b-4aa5-95b1-9021e2483d3a,2de25409-78d3-4892-b4d3-9fbc252bc674}', '2025-01-27 07:30:00+00', '{"theme": "dark", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": true, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('497809e4-7429-437c-a81c-6f43e2fa77c1', '550e8400-e29b-41d4-a716-446655440001', 'operations@factorypulse.vn', 'Trần Ngọc Hương', 'management', 'Operations', '+84-28-7300-0002', 'https://storage.googleapis.com/factory-pulse-assets/avatars/operations.jpg', 'active', 'Operations Manager overseeing production and quality', 'EMP-TTH-550e', 'ceafa7d8-dda2-4645-b253-894839eee7b3', '{30951eed-46a0-441b-8abf-fbf0e6be127c,6e6d4947-84b6-41e9-888c-3cf1a3480743,a53f503d-ad74-4397-a3f1-5ee9c3e61d34,27ec8d55-a5d7-476c-9998-fe3fbafb509f}', '2025-01-27 07:45:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": false, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('a161659d-d39c-4f98-aa90-208f0a80e0cc', '550e8400-e29b-41d4-a716-446655440001', 'quality@factorypulse.vn', 'Lê Viết Tuấn', 'management', 'Quality', '+84-28-7300-0003', 'https://storage.googleapis.com/factory-pulse-assets/avatars/quality.jpg', 'active', 'Quality Manager ensuring compliance and standards', 'EMP-LVT-550e', 'ceafa7d8-dda2-4645-b253-894839eee7b3', '{a53f503d-ad74-4397-a3f1-5ee9c3e61d34,27ec8d55-a5d7-476c-9998-fe3fbafb509f}', '2025-01-27 07:50:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": true, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('00474d04-fe69-4823-91f2-c74b96c5c958', '550e8400-e29b-41d4-a716-446655440001', 'senior.engineer@factorypulse.vn', 'Phạm Văn Dũng', 'engineering', 'Engineering', '+84-28-7300-0004', 'https://storage.googleapis.com/factory-pulse-assets/avatars/senior-engineer.jpg', 'active', 'Senior Engineer with expertise in mechanical design and manufacturing', 'EMP-PVD-550e', '497809e4-7429-437c-a81c-6f43e2fa77c1', '{}', '2025-01-27 08:00:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": false, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('80034f6f-b520-4bf4-9197-0379588b976e', '550e8400-e29b-41d4-a716-446655440001', 'mechanical.engineer@factorypulse.vn', 'Hoàng Thị Lan', 'engineering', 'Engineering', '+84-28-7300-0005', 'https://storage.googleapis.com/factory-pulse-assets/avatars/mechanical-engineer.jpg', 'active', 'Mechanical Engineer specializing in fabrication and assembly', 'EMP-HTL-550e', '497809e4-7429-437c-a81c-6f43e2fa77c1', '{}', '2025-01-27 08:05:00+00', '{"theme": "dark", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": true, "push": false, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('da918e06-7480-4b36-8368-456db3fba638', '550e8400-e29b-41d4-a716-446655440001', 'electrical.engineer@factorypulse.vn', 'Vũ Đình Nam', 'engineering', 'Engineering', '+84-28-7300-0006', 'https://storage.googleapis.com/factory-pulse-assets/avatars/electrical-engineer.jpg', 'active', 'Electrical Engineer focusing on control systems and automation', 'EMP-VDN-550e', '497809e4-7429-437c-a81c-6f43e2fa77c1', '{}', '2025-01-27 08:10:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": false, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('a53f503d-ad74-4397-a3f1-5ee9c3e61d34', '550e8400-e29b-41d4-a716-446655440001', 'qa.engineer@factorypulse.vn', 'Ngô Thị Hà', 'qa', 'Quality', '+84-28-7300-0007', 'https://storage.googleapis.com/factory-pulse-assets/avatars/qa-engineer.jpg', 'active', 'QA Engineer ensuring product quality and compliance', 'EMP-NTH-550e', 'a161659d-d39c-4f98-aa90-208f0a80e0cc', '{}', '2025-01-27 08:15:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": true, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('30951eed-46a0-441b-8abf-fbf0e6be127c', '550e8400-e29b-41d4-a716-446655440001', 'production.supervisor@factorypulse.vn', 'Trịnh Văn Sơn', 'production', 'Production', '+84-28-7300-0008', 'https://storage.googleapis.com/factory-pulse-assets/avatars/production-supervisor.jpg', 'active', 'Production Supervisor managing manufacturing operations', 'EMP-TVS-550e', '497809e4-7429-437c-a81c-6f43e2fa77c1', '{}', '2025-01-27 08:20:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": true, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('6e6d4947-84b6-41e9-888c-3cf1a3480743', '550e8400-e29b-41d4-a716-446655440001', 'team.lead@factorypulse.vn', 'Lý Thị Mai', 'production', 'Production', '+84-28-7300-0009', 'https://storage.googleapis.com/factory-pulse-assets/avatars/team-lead.jpg', 'active', 'Team Lead coordinating assembly and production activities', 'EMP-LTM-550e', '497809e4-7429-437c-a81c-6f43e2fa77c1', '{}', '2025-01-27 08:25:00+00', '{"theme": "dark", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": false, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('27ec8d55-a5d7-476c-9998-fe3fbafb509f', '550e8400-e29b-41d4-a716-446655440001', 'quality.inspector@factorypulse.vn', 'Đặng Văn Hùng', 'qa', 'Quality', '+84-28-7300-0010', 'https://storage.googleapis.com/factory-pulse-assets/avatars/quality-inspector.jpg', 'active', 'Quality Inspector performing final quality checks', 'EMP-DVH-550e', 'a161659d-d39c-4f98-aa90-208f0a80e0cc', '{}', '2025-01-27 08:30:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": true, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('6e8fc313-fd4b-4aa5-95b1-9021e2483d3a', '550e8400-e29b-41d4-a716-446655440001', 'sales.manager@factorypulse.vn', 'Bùi Thị Thu', 'sales', 'Sales', '+84-28-7300-0011', 'https://storage.googleapis.com/factory-pulse-assets/avatars/sales-manager.jpg', 'active', 'Sales Manager managing customer relationships and orders', 'EMP-BTT-550e', 'ceafa7d8-dda2-4645-b253-894839eee7b3', '{}', '2025-01-27 08:35:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": true, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('2de25409-78d3-4892-b4d3-9fbc252bc674', '550e8400-e29b-41d4-a716-446655440001', 'procurement@factorypulse.vn', 'Lê Văn Phúc', 'procurement', 'Procurement', '+84-28-7300-0012', 'https://storage.googleapis.com/factory-pulse-assets/avatars/procurement.jpg', 'active', 'Procurement Specialist managing supplier relationships and sourcing', 'EMP-LVP-550e', 'ceafa7d8-dda2-4645-b253-894839eee7b3', '{}', '2025-01-27 08:40:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": false, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('9cb57c45-c9e7-4cff-b40b-53e14d13c6e9', '550e8400-e29b-41d4-a716-446655440001', 'project.coordinator@factorypulse.vn', 'Phan Thị Kim', 'management', 'Project Management', '+84-28-7300-0013', 'https://storage.googleapis.com/factory-pulse-assets/avatars/project-coordinator.jpg', 'active', 'Project Coordinator tracking project progress and coordination', 'EMP-PTK-550e', '497809e4-7429-437c-a81c-6f43e2fa77c1', '{}', '2025-01-27 08:45:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": true, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('a3b8e7b3-f0d9-4edd-abd4-ec78f3816d11', '550e8400-e29b-41d4-a716-446655440001', 'admin@factorypulse.vn', 'Võ Đình Tài', 'admin', 'IT', '+84-28-7300-0014', 'https://storage.googleapis.com/factory-pulse-assets/avatars/admin.jpg', 'active', 'System Administrator managing technical infrastructure', 'EMP-VDT-550e', 'ceafa7d8-dda2-4645-b253-894839eee7b3', '{}', '2025-01-27 08:50:00+00', '{"theme": "dark", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": false, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00'),
	('d8fa56d6-2b38-4e76-8425-d1daad896f51', '550e8400-e29b-41d4-a716-446655440001', 'customer.service@factorypulse.vn', 'Nguyễn Thị Hoa', 'sales', 'Customer Service', '+84-28-7300-0015', 'https://storage.googleapis.com/factory-pulse-assets/avatars/customer-service.jpg', 'active', 'Customer Service Representative providing support and assistance', 'EMP-NTH-550e', '6e8fc313-fd4b-4aa5-95b1-9021e2483d3a', '{}', '2025-01-27 08:55:00+00', '{"theme": "light", "language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"sms": true, "push": true, "email": true}}', '2025-01-27 08:00:00+00', '2025-01-27 08:00:00+00');


--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: workflow_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: project_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: supplier_quotes; Type: TABLE DATA; Schema: public; Owner: postgres
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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
