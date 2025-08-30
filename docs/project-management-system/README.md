# Project Management System Documentation

This directory contains comprehensive documentation for the Factory Pulse project management system, covering database schema alignment, component architecture, API documentation, and maintenance procedures.

## Documentation Structure

- **[Database Schema](./database-schema.md)** - Complete database schema and TypeScript interface alignment
- **[Component Architecture](./component-architecture.md)** - Component architecture with data flow diagrams
- **[API Documentation](./api-documentation.md)** - All project-related endpoints and data contracts
- **[Error Handling](./error-handling.md)** - Error handling patterns and best practices
- **[Maintenance Procedures](./maintenance-procedures.md)** - Schema change management and best practices
- **[Troubleshooting Guide](./troubleshooting-guide.md)** - Common issues and solutions

## Quick Reference

### Key Components
- **Projects Page Table View** - Simplified HTML table for project listing with filtering
- **ProjectDetail** - Detailed project view with workflow management
- **ProjectIntakeForm** - New project creation form
- **WorkflowStepper** - Visual workflow progression component

### Key Services
- **projectService** - Core project CRUD operations
- **useProjects** - React hook for project state management
- **RealtimeManager** - Real-time updates and synchronization

### Database Tables
- **projects** - Main project data
- **workflow_stages** - Dynamic workflow configuration
- **contacts** - Customer information
- **users** - System users and assignments

## Getting Started

1. Review the [Database Schema](./database-schema.md) for data structure understanding
2. Check [Component Architecture](./component-architecture.md) for system overview
3. Refer to [API Documentation](./api-documentation.md) for integration details
4. Follow [Maintenance Procedures](./maintenance-procedures.md) for ongoing development