// Organization-Based Customer Model Migration Tests
// Comprehensive test suite for the new customer organization functionality

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CustomerOrganizationService } from '@/services/customerOrganizationService';
import { supabase } from '@/integrations/supabase/client.js';
import { Organization, Contact, Project, ProjectContactPoint } from '@/types/project';

describe('Organization-Based Customer Model Migration', () => {
    let testOrganizationId: string;
    let testContactId: string;
    let testProjectId: string;
    let testContactPointId: string;

    beforeEach(async () => {
        // Clean up any existing test data
        await cleanupTestData();
    });

    afterEach(async () => {
        // Clean up test data after each test
        await cleanupTestData();
    });

    const cleanupTestData = async () => {
        // Clean up in reverse order of dependencies
        if (testContactPointId) {
            await supabase.from('project_contact_points').delete().eq('id', testContactPointId);
        }
        if (testProjectId) {
            await supabase.from('projects').delete().eq('id', testProjectId);
        }
        if (testContactId) {
            await supabase.from('contacts').delete().eq('id', testContactId);
        }
        if (testOrganizationId) {
            await supabase.from('organizations').delete().eq('id', testOrganizationId);
        }
    };

    describe('Database Schema Validation', () => {
        it('should have customer_organization_id column in projects table', async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('customer_organization_id')
                .limit(1);

            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('should have role, is_primary_contact, description columns in contacts table', async () => {
            const { data, error } = await supabase
                .from('contacts')
                .select('role, is_primary_contact, description')
                .limit(1);

            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('should have project_contact_points table', async () => {
            const { data, error } = await supabase
                .from('project_contact_points')
                .select('*')
                .limit(1);

            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('should have address fields in organizations table', async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('address, city, state, country, postal_code')
                .limit(1);

            expect(error).toBeNull();
            expect(data).toBeDefined();
        });
    });

    describe('Customer Organization Service', () => {
        it('should create customer organization', async () => {
            const organizationData = {
                name: 'Test Organization',
                slug: 'test-organization',
                description: 'Customer Organization',
                industry: 'Automotive',
                address: '123 Test St',
                city: 'Test City',
                country: 'Vietnam',
                is_active: true
            };

            const organization = await CustomerOrganizationService.createCustomerOrganization(organizationData);

            expect(organization).toBeDefined();
            expect(organization.name).toBe(organizationData.name);
            expect(organization.slug).toBe(organizationData.slug);
            expect(organization.description).toBe('Customer Organization');

            testOrganizationId = organization.id;
        });

        it('should get customer organizations', async () => {
            const organizations = await CustomerOrganizationService.getCustomerOrganizations();

            expect(Array.isArray(organizations)).toBe(true);
            expect(organizations.length).toBeGreaterThan(0);

            // Verify all returned organizations are customer organizations
            organizations.forEach(org => {
                expect(org.description).toBe('Customer Organization');
                expect(org.is_active).toBe(true);
            });
        });

        it('should add contact to organization', async () => {
            // First create organization
            const organization = await CustomerOrganizationService.createCustomerOrganization({
                name: 'Test Org for Contact',
                slug: 'test-org-contact',
                description: 'Customer Organization',
                is_active: true
            });
            testOrganizationId = organization.id;

            const contactData = {
                contact_name: 'Test Contact',
                email: 'test@example.com',
                phone: '123-456-7890',
                role: 'purchasing',
                is_primary_contact: true,
                description: 'Test contact description'
            };

            const contact = await CustomerOrganizationService.addContactToOrganization(
                organization.id,
                contactData
            );

            expect(contact).toBeDefined();
            expect(contact.contact_name).toBe(contactData.contact_name);
            expect(contact.role).toBe(contactData.role);
            expect(contact.is_primary_contact).toBe(true);
            expect(contact.organization_id).toBe(organization.id);
            expect(contact.type).toBe('customer');

            testContactId = contact.id;
        });

        it('should set primary contact', async () => {
            // Create organization and contacts
            const organization = await CustomerOrganizationService.createCustomerOrganization({
                name: 'Test Org for Primary',
                slug: 'test-org-primary',
                description: 'Customer Organization',
                is_active: true
            });
            testOrganizationId = organization.id;

            const contact1 = await CustomerOrganizationService.addContactToOrganization(
                organization.id,
                {
                    contact_name: 'Contact 1',
                    email: 'contact1@example.com',
                    is_primary_contact: true
                }
            );

            const contact2 = await CustomerOrganizationService.addContactToOrganization(
                organization.id,
                {
                    contact_name: 'Contact 2',
                    email: 'contact2@example.com',
                    is_primary_contact: false
                }
            );

            // Set contact2 as primary
            await CustomerOrganizationService.setPrimaryContact(organization.id, contact2.id);

            // Verify contact2 is now primary and contact1 is not
            const updatedContact1 = await supabase
                .from('contacts')
                .select('is_primary_contact')
                .eq('id', contact1.id)
                .single();

            const updatedContact2 = await supabase
                .from('contacts')
                .select('is_primary_contact')
                .eq('id', contact2.id)
                .single();

            expect(updatedContact1.data.is_primary_contact).toBe(false);
            expect(updatedContact2.data.is_primary_contact).toBe(true);
        });
    });

    describe('Project Contact Points', () => {
        beforeEach(async () => {
            // Setup test data
            const organization = await CustomerOrganizationService.createCustomerOrganization({
                name: 'Test Org for Project',
                slug: 'test-org-project',
                description: 'Customer Organization',
                is_active: true
            });
            testOrganizationId = organization.id;

            const contact = await CustomerOrganizationService.addContactToOrganization(
                organization.id,
                {
                    contact_name: 'Project Contact',
                    email: 'project@example.com',
                    role: 'engineering'
                }
            );
            testContactId = contact.id;

            // Create test project
            const { data: project, error } = await supabase
                .from('projects')
                .insert({
                    organization_id: organization.id,
                    project_id: 'TEST-001',
                    title: 'Test Project',
                    customer_organization_id: organization.id,
                    status: 'active',
                    created_by: 'test-user'
                })
                .select()
                .single();

            expect(error).toBeNull();
            testProjectId = project.id;
        });

        it('should add contact point to project', async () => {
            const contactPoint = await CustomerOrganizationService.addProjectContactPoint(
                testProjectId,
                testContactId,
                'engineering',
                true
            );

            expect(contactPoint).toBeDefined();
            expect(contactPoint.project_id).toBe(testProjectId);
            expect(contactPoint.contact_id).toBe(testContactId);
            expect(contactPoint.role).toBe('engineering');
            expect(contactPoint.is_primary).toBe(true);

            testContactPointId = contactPoint.id;
        });

        it('should get project contact points', async () => {
            // Add contact point first
            const contactPoint = await CustomerOrganizationService.addProjectContactPoint(
                testProjectId,
                testContactId,
                'engineering',
                true
            );
            testContactPointId = contactPoint.id;

            const contactPoints = await CustomerOrganizationService.getProjectContactPoints(testProjectId);

            expect(Array.isArray(contactPoints)).toBe(true);
            expect(contactPoints.length).toBe(1);
            expect(contactPoints[0].contact).toBeDefined();
            expect(contactPoints[0].contact.contact_name).toBe('Project Contact');
        });

        it('should update contact point', async () => {
            // Add contact point first
            const contactPoint = await CustomerOrganizationService.addProjectContactPoint(
                testProjectId,
                testContactId,
                'engineering',
                false
            );
            testContactPointId = contactPoint.id;

            // Update contact point
            const updatedContactPoint = await CustomerOrganizationService.updateProjectContactPoint(
                contactPoint.id,
                { role: 'quality', is_primary: true }
            );

            expect(updatedContactPoint.role).toBe('quality');
            expect(updatedContactPoint.is_primary).toBe(true);
        });

        it('should remove contact point', async () => {
            // Add contact point first
            const contactPoint = await CustomerOrganizationService.addProjectContactPoint(
                testProjectId,
                testContactId,
                'engineering',
                true
            );

            // Remove contact point
            await CustomerOrganizationService.removeProjectContactPoint(contactPoint.id);

            // Verify it's removed
            const contactPoints = await CustomerOrganizationService.getProjectContactPoints(testProjectId);
            expect(contactPoints.length).toBe(0);
        });
    });

    describe('Project Queries with Organization Data', () => {
        beforeEach(async () => {
            // Setup test data
            const organization = await CustomerOrganizationService.createCustomerOrganization({
                name: 'Query Test Org',
                slug: 'query-test-org',
                description: 'Customer Organization',
                is_active: true
            });
            testOrganizationId = organization.id;

            const contact = await CustomerOrganizationService.addContactToOrganization(
                organization.id,
                {
                    contact_name: 'Query Contact',
                    email: 'query@example.com',
                    role: 'purchasing',
                    is_primary_contact: true
                }
            );
            testContactId = contact.id;

            // Create test project
            const { data: project, error } = await supabase
                .from('projects')
                .insert({
                    organization_id: organization.id,
                    project_id: 'QUERY-001',
                    title: 'Query Test Project',
                    customer_organization_id: organization.id,
                    customer_id: contact.id,
                    status: 'active',
                    created_by: 'test-user'
                })
                .select()
                .single();

            expect(error).toBeNull();
            testProjectId = project.id;

            // Add contact point
            const contactPoint = await CustomerOrganizationService.addProjectContactPoint(
                testProjectId,
                testContactId,
                'purchasing',
                true
            );
            testContactPointId = contactPoint.id;
        });

        it('should query project with customer organization data', async () => {
            const { data: projects, error } = await supabase
                .from('projects')
                .select(`
          id,
          project_id,
          title,
          customer_organization_id,
          customer_organization:organizations!customer_organization_id(
            id,
            name,
            industry,
            contacts:contacts(
              id,
              contact_name,
              email,
              role,
              is_primary_contact
            )
          ),
          contact_points:project_contact_points(
            id,
            role,
            is_primary,
            contact:contacts(
              id,
              contact_name,
              email,
              role
            )
          )
        `)
                .eq('id', testProjectId)
                .single();

            expect(error).toBeNull();
            expect(projects).toBeDefined();
            expect(projects.customer_organization).toBeDefined();
            expect(projects.customer_organization.name).toBe('Query Test Org');
            expect(projects.contact_points).toBeDefined();
            expect(projects.contact_points.length).toBe(1);
            expect(projects.contact_points[0].contact.contact_name).toBe('Query Contact');
        });

        it('should maintain backward compatibility with customer_id', async () => {
            const { data: projects, error } = await supabase
                .from('projects')
                .select(`
          id,
          project_id,
          title,
          customer_id,
          customer:contacts!customer_id(
            id,
            contact_name,
            email,
            company_name
          )
        `)
                .eq('id', testProjectId)
                .single();

            expect(error).toBeNull();
            expect(projects).toBeDefined();
            expect(projects.customer).toBeDefined();
            expect(projects.customer.contact_name).toBe('Query Contact');
        });
    });

    describe('Migration Data Integrity', () => {
        it('should have migrated customer organizations', async () => {
            const { data: organizations, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('description', 'Customer Organization')
                .eq('is_active', true);

            expect(error).toBeNull();
            expect(organizations).toBeDefined();
            expect(organizations.length).toBeGreaterThan(0);
        });

        it('should have migrated contacts with organization references', async () => {
            const { data: contacts, error } = await supabase
                .from('contacts')
                .select(`
          id,
          contact_name,
          company_name,
          role,
          is_primary_contact,
          organization_id,
          organizations:organizations!organization_id(
            id,
            name,
            description
          )
        `)
                .eq('type', 'customer')
                .not('organization_id', 'is', null);

            expect(error).toBeNull();
            expect(contacts).toBeDefined();
            expect(contacts.length).toBeGreaterThan(0);

            // Verify all contacts have organization references
            contacts.forEach(contact => {
                expect(contact.organization_id).toBeDefined();
                expect(contact.organizations).toBeDefined();
                expect(contact.organizations.description).toBe('Customer Organization');
            });
        });

        it('should have migrated projects with customer organization references', async () => {
            const { data: projects, error } = await supabase
                .from('projects')
                .select(`
          id,
          project_id,
          title,
          customer_organization_id,
          organizations:organizations!customer_organization_id(
            id,
            name,
            description
          )
        `)
                .not('customer_organization_id', 'is', null);

            expect(error).toBeNull();
            expect(projects).toBeDefined();
            expect(projects.length).toBeGreaterThan(0);

            // Verify all projects have organization references
            projects.forEach(project => {
                expect(project.customer_organization_id).toBeDefined();
                expect(project.organizations).toBeDefined();
                expect(project.organizations.description).toBe('Customer Organization');
            });
        });

        it('should have project contact points for migrated projects', async () => {
            const { data: contactPoints, error } = await supabase
                .from('project_contact_points')
                .select(`
          id,
          project_id,
          contact_id,
          role,
          is_primary,
          projects:projects!project_id(
            id,
            project_id,
            title,
            customer_organization_id
          ),
          contacts:contacts!contact_id(
            id,
            contact_name,
            organization_id
          )
        `);

            expect(error).toBeNull();
            expect(contactPoints).toBeDefined();
            expect(contactPoints.length).toBeGreaterThan(0);

            // Verify contact points have proper relationships
            contactPoints.forEach(cp => {
                expect(cp.projects).toBeDefined();
                expect(cp.contacts).toBeDefined();
                expect(cp.projects.customer_organization_id).toBeDefined();
                expect(cp.contacts.organization_id).toBeDefined();
            });
        });
    });

    describe('Performance and Constraints', () => {
        it('should enforce unique primary contact per organization', async () => {
            // Create organization
            const organization = await CustomerOrganizationService.createCustomerOrganization({
                name: 'Unique Primary Test',
                slug: 'unique-primary-test',
                description: 'Customer Organization',
                is_active: true
            });
            testOrganizationId = organization.id;

            // Add first contact as primary
            const contact1 = await CustomerOrganizationService.addContactToOrganization(
                organization.id,
                {
                    contact_name: 'Primary Contact 1',
                    email: 'primary1@example.com',
                    is_primary_contact: true
                }
            );

            // Add second contact as primary
            const contact2 = await CustomerOrganizationService.addContactToOrganization(
                organization.id,
                {
                    contact_name: 'Primary Contact 2',
                    email: 'primary2@example.com',
                    is_primary_contact: true
                }
            );

            // Verify only one primary contact exists
            const { data: primaryContacts, error } = await supabase
                .from('contacts')
                .select('id, is_primary_contact')
                .eq('organization_id', organization.id)
                .eq('is_primary_contact', true);

            expect(error).toBeNull();
            expect(primaryContacts.length).toBe(1);
        });

        it('should enforce unique primary contact point per project', async () => {
            // Setup test data
            const organization = await CustomerOrganizationService.createCustomerOrganization({
                name: 'Unique Project Primary',
                slug: 'unique-project-primary',
                description: 'Customer Organization',
                is_active: true
            });
            testOrganizationId = organization.id;

            const contact1 = await CustomerOrganizationService.addContactToOrganization(
                organization.id,
                { contact_name: 'Contact 1', email: 'contact1@example.com' }
            );

            const contact2 = await CustomerOrganizationService.addContactToOrganization(
                organization.id,
                { contact_name: 'Contact 2', email: 'contact2@example.com' }
            );

            const { data: project, error } = await supabase
                .from('projects')
                .insert({
                    organization_id: organization.id,
                    project_id: 'UNIQUE-001',
                    title: 'Unique Primary Test Project',
                    customer_organization_id: organization.id,
                    status: 'active',
                    created_by: 'test-user'
                })
                .select()
                .single();

            expect(error).toBeNull();
            testProjectId = project.id;

            // Add first contact point as primary
            const cp1 = await CustomerOrganizationService.addProjectContactPoint(
                testProjectId,
                contact1.id,
                'engineering',
                true
            );

            // Add second contact point as primary
            const cp2 = await CustomerOrganizationService.addProjectContactPoint(
                testProjectId,
                contact2.id,
                'quality',
                true
            );

            testContactPointId = cp2.id;

            // Verify only one primary contact point exists
            const { data: primaryContactPoints, error: primaryError } = await supabase
                .from('project_contact_points')
                .select('id, is_primary')
                .eq('project_id', testProjectId)
                .eq('is_primary', true);

            expect(primaryError).toBeNull();
            expect(primaryContactPoints.length).toBe(1);
        });
    });
});
