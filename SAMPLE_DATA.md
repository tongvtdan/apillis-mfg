# Sample Data & Demo Setup

This document explains how to populate your development database with comprehensive sample data to demonstrate the various project types, statuses, and workflow features.

## Quick Start

> **Note**: The sample data currently uses the database's existing enum values (`inquiry`, `review`, `quoted`, `won`, `production`, `completed`) rather than the frontend types. This is because the database schema needs to be updated to match the frontend workflow stages.

### Method 1: Using the Database Seeder UI (Recommended)
1. Start the development server: `npm run dev`
2. Navigate to the Dashboard page in your browser
3. Look for the "Database Seeder" component at the bottom of the page (only visible in development mode)
4. Click "Seed Database" to populate with sample data
5. Click "Clear Sample Data" to remove sample data when needed

### Method 2: Using Browser Console
1. Open the browser developer tools (F12)
2. Go to the Console tab
3. Run: `seedDatabase()` (the function is globally available in development)

## Sample Data Overview

### 📊 Data Statistics
- **12 Customers** across various industries and countries
- **15 Projects** with different types, statuses, and priorities
- **7 Project Activities** demonstrating workflow transitions

### 🏢 Customer Industries
- **Technology**: TechCorp Industries, Quantum Systems Ltd, BioTech Solutions
- **Manufacturing**: Precision Manufacturing Co, Global Assembly Corp, Advanced Automation Inc
- **Healthcare**: MedDevice Innovations, Healthcare Systems LLC
- **International**: European Engineering GmbH (Germany), Tokyo Precision Ltd (Japan)
- **Startups**: Innovation Startup, Green Energy Solutions

### 📋 Project Types Distribution
- **System Build**: Complete end-to-end solutions (6 projects)
- **Fabrication**: Custom parts and components (5 projects)  
- **Manufacturing**: High-volume production (4 projects)

### 📈 Project Status Distribution
- **inquiry**: 1 project (new inquiries)
- **review**: 2 projects (under review)
- **quoted**: 1 project (quotes submitted)
- **won**: 2 projects (confirmed orders)
- **production**: 1 project (active production)
- **completed**: 1 project (finished)

### ⚡ Priority Distribution
- **Urgent**: 4 projects (critical deadlines)
- **High**: 4 projects (important but flexible)
- **Medium**: 5 projects (standard priority)
- **Low**: 2 projects (when capacity allows)

## Sample Project Highlights

### High-Value Projects
- **Pharmaceutical Production Line**: $4.2M - GMP compliance
- **Medical Device Assembly Line**: $2.5M - FDA validation required
- **Industrial Automation System**: $1.75M - European facility with CE marking

### Technology Innovations
- **Advanced IoT Sensor System**: Cloud integration for smart factories
- **Quantum Computing Enclosure**: Thermal management and EMI shielding
- **Precision Optical Components**: Nanometer-level accuracy for laser systems

### Bottleneck Examples
- **Complex Multi-System Integration**: 21 days in technical review
- **Automotive Parts Manufacturing**: 22 days in procurement planning
- **Custom Tooling and Fixtures**: 16 days waiting for supplier capacity

### International Projects
- **Germany**: Industrial automation with CE compliance requirements
- **Japan**: Ultra-precision optical components for laser systems

## Features Demonstrated

### 🔄 Workflow Stages
The sample data demonstrates the database workflow stages:
1. **Inquiry** → Initial customer contact
2. **Review** → Engineering and technical evaluation
3. **Quoted** → Customer proposal stage
4. **Won** → Project approval and confirmation
5. **Production** → Active manufacturing
6. **Completed** → Finished projects

Additional stages available: **Lost**, **Cancelled**

### 📊 Analytics & Metrics
- **Bottleneck Detection**: Projects with 14+ days in stage
- **Priority Scoring**: Weighted priority system (30-95 points)
- **Time Tracking**: Days in current stage monitoring
- **Value Analysis**: Estimated project values from $45K to $4.2M

### 🏭 Industry Verticals
- **Aerospace**: Precision CNC components with tight tolerances
- **Medical**: FDA-compliant devices and assembly lines
- **Automotive**: High-volume injection molding
- **Energy**: Solar panel testing equipment
- **Semiconductor**: Cleanroom fabrication requirements

## Database Schema Features

### Customer Management
- Company information with international support
- Contact details and geographic distribution
- Industry classification and relationship tracking

### Project Lifecycle
- Comprehensive status tracking through all stages
- Priority scoring and urgency management
- Estimated values and deadline tracking
- Tag-based categorization and notes

### Activity Logging
- Status change tracking
- Timeline visualization
- Audit trail for compliance

## Development Benefits

### UI/UX Testing
- **Kanban Board**: Drag-and-drop functionality with realistic data
- **Dashboard Metrics**: Real calculations from actual project data
- **Filter & Search**: Multiple criteria testing with diverse projects
- **Responsive Design**: Various content lengths and edge cases

### Workflow Testing
- **Stage Transitions**: Complete project lifecycle examples
- **Bottleneck Alerts**: Projects exceeding time thresholds
- **Priority Management**: Urgent vs. standard project handling
- **Customer Relationships**: Multi-project customer scenarios

### Analytics Testing
- **Performance Metrics**: Time-in-stage calculations
- **Value Analysis**: Revenue and pipeline metrics
- **Resource Planning**: Capacity and scheduling insights
- **Trend Analysis**: Status distribution and flow rates

## Customization

### Adding More Sample Data
To extend the sample data:
1. Edit `/src/components/dev/DatabaseSeeder.tsx`
2. Add new entries to `sampleCustomers` or `sampleProjects` arrays
3. Ensure proper typing with TypeScript enums
4. Include diverse scenarios for testing

### Database Migration
For persistent sample data:
1. Use the SQL migration file: `/supabase/migrations/20250823130000_sample_projects_data.sql`
2. Run migrations in your Supabase project
3. Data will persist across database resets

## Best Practices

### Development Environment
- Always use sample data in development
- Clear sample data before production deployment
- Backup real data before testing with sample data
- Use the UI seeder for interactive development

### Testing Scenarios
- Test with empty database state
- Test with full sample data load
- Test individual workflow stages
- Test edge cases (high priority, bottlenecks, international)

---

**Note**: The Database Seeder component only appears in development mode (`NODE_ENV=development`) to prevent accidental data seeding in production environments.