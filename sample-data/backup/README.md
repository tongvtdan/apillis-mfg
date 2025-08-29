# Factory Pulse Sample Data

This directory contains comprehensive sample data for the Factory Pulse MES system, including projects, customers, suppliers, and all related entities.

## 📁 File Structure

```
sample-data/
├── README.md                           # This file
├── organizations.json                  # Organization data
├── users.json                         # User profiles and roles
├── contacts.json                      # Customers and suppliers
├── workflow-stages.json               # Workflow configuration
├── projects.json                      # All 17 sample projects
├── documents.json                     # Sample documents
├── reviews.json                       # Review records
├── messages.json                      # Communication data
├── notifications.json                 # Notification records
├── activity-log.json                  # Audit trail
├── sql-inserts.sql                   # Database seeding script
└── data-overview.md                   # Detailed data breakdown
```

## 🎯 Sample Data Overview

### Projects (17 total)
- **10 Fabrication Projects**: Metal fabrication, welding, sheet metal work
- **5 Manufacturing Projects**: Assembly, production, mass manufacturing  
- **2 System Build Projects**: Complete system integration, testing

### Customers (8 total)
- Automotive industry (Toyota, Honda)
- Aerospace (Boeing, Airbus)
- Electronics (Samsung, LG)
- Industrial (Siemens, ABB)

### Suppliers (12 total)
- **Machining**: Precision machining, CNC operations
- **Fabrication**: Metal fabrication, welding
- **Assembly**: Component assembly, testing
- **Finishing**: Surface treatment, coating
- **Electronics**: PCB assembly, testing

## 🚀 Usage Instructions

### 1. Review Data
- Check `data-overview.md` for detailed breakdown
- Review JSON files for data structure
- Verify relationships between entities

### 2. Database Seeding
```bash
# Option 1: Use SQL script
psql -d your_database -f sample-data/sql-inserts.sql

# Option 2: Use individual JSON files
# Import via your application's data import feature
```

### 3. Data Validation
- Verify all foreign key relationships
- Check that workflow stages are properly configured
- Ensure proper organization isolation

## 🔧 Data Customization

### Modifying Project Data
- Edit `projects.json` to change project details
- Update `documents.json` for document changes
- Modify `reviews.json` for review adjustments

### Adding New Entities
- Follow the existing JSON structure
- Ensure proper UUID generation
- Maintain referential integrity

### Localization
- Default country: Vietnam
- Default currency: VND
- Supported languages: en, vi, th, ms, id

## 📊 Data Relationships

```
Organizations (1)
├── Users (15)
├── Contacts (20)
├── Workflow Stages (8)
└── Projects (17)
    ├── Documents (34)
    ├── Reviews (25)
    ├── Messages (45)
    └── Activity Logs (67)
```

## ⚠️ Important Notes

1. **UUIDs**: All IDs use `uuid_generate_v4()` format
2. **Timestamps**: Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
3. **Organization ID**: All entities belong to the same sample organization
4. **Realistic Data**: All data represents realistic manufacturing scenarios
5. **Vietnam Focus**: Default settings optimized for Vietnam market

## 🧪 Testing

This sample data is designed for:
- Development and testing environments
- Demo presentations
- User training
- System validation
- Performance testing

## 📝 Data Sources

- **Project Types**: Based on real manufacturing scenarios
- **Customer Industries**: Common manufacturing sectors
- **Supplier Specialties**: Standard manufacturing capabilities
- **Financial Data**: Realistic pricing for Vietnam market
- **Timelines**: Typical manufacturing lead times

## 🔄 Updates

- **Last Updated**: 2025-01-27
- **Schema Version**: 2.0 (aligned with database-schema.md)
- **Compatibility**: Factory Pulse v2.0+
