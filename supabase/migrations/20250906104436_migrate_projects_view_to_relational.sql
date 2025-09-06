-- Migration: Migrate from projects_view to relational projects table approach
-- Date: 2025-09-06
-- Description: Architectural change from denormalized view to normalized relational structure

/*
ARCHITECTURAL CHANGE SUMMARY:
===========================

BEFORE (Denormalized Approach):
- Used projects_view with embedded customer/stage information
- Customer data duplicated in every project row
- Required view maintenance and synchronization
- Large payloads with redundant data

AFTER (Normalized Relational Approach):
- Use projects table with customer_organization_id and point_of_contacts[]
- Lookup customer organization details from organizations table
- Lookup contact details from contacts table
- Smaller payloads, better data integrity
- Proper relational database design

DATABASE STRUCTURE:
==================

Projects Table (Normalized):
- customer_organization_id UUID → organizations.id
- point_of_contacts UUID[] → contacts.id[]

Organizations Table:
- id, name, industry, address, etc.

Contacts Table:
- id, contact_name, email, organization_id, etc.

CODE CHANGES:
============

1. Updated useProjects hook to use projects table with proper joins
2. Updated projectDataService to use projects table instead of projects_view
3. Updated data transformation to work with relational objects
4. Maintained backward compatibility with existing component interfaces

BENEFITS:
========

✅ Better Data Integrity (single source of truth)
✅ Improved Performance (no redundant data transfer)
✅ Cleaner Architecture (proper relational structure)
✅ Easier Maintenance (no view synchronization issues)
✅ Better Scalability (normalized vs denormalized approach)

This migration documents the architectural shift from denormalized views
to proper relational database design principles.
*/
