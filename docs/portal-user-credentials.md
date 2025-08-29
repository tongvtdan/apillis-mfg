# Factory Pulse Portal User Credentials

## Portal Authentication Users Created

All external customers and suppliers now have portal authentication accounts for accessing the Factory Pulse portal. Each organization has one designated contact with authentication access.

**Default Password: `Password@123`**

## Portal User Structure

- **Total Portal Users**: 20 external users
- **Customers**: 8 organizations with portal access
- **Suppliers**: 12 organizations with portal access
- **Authentication System**: Supabase Auth
- **Password Policy**: Uniform default password for development/testing
- **User Metadata**: Each portal user includes company info, contact details, and type classification
- **Database Storage**: Dual-table approach (auth.users + contacts table + users table)
- **Profile Management**: Portal users have full profile management capabilities in users table

## Customer Portal Users

| Company         | Contact Name   | Email                    | Type     |
| --------------- | -------------- | ------------------------ | -------- |
| ABB Vietnam     | Bùi Thị Hương  | `procurement@abb.vn`     | Customer |
| Airbus Vietnam  | Đặng Văn Giang | `supply.chain@airbus.vn` | Customer |
| Boeing Vietnam  | Lê Văn Cường   | `supply.chain@boeing.vn` | Customer |
| Honda Vietnam   | Trần Thị Bình  | `purchasing@honda.vn`    | Customer |
| LG Vietnam      | Vũ Thị Phương  | `purchasing@lg.vn`       | Customer |
| Samsung Vietnam | Phạm Thị Dung  | `procurement@samsung.vn` | Customer |
| Siemens Vietnam | Hoàng Văn Em   | `procurement@siemens.vn` | Customer |
| Toyota Vietnam  | Nguyễn Văn An  | `procurement@toyota.vn`  | Customer |

## Supplier Portal Users

| Company                  | Contact Name   | Email                          | Type     |
| ------------------------ | -------------- | ------------------------------ | -------- |
| Assembly Solutions       | Hồ Văn Minh    | `sales@assemblysolutions.vn`   | Supplier |
| Calibration Lab          | Đặng Văn Hùng  | `sales@calibrationlab.vn`      | Supplier |
| Electronics Assembly     | Nguyễn Văn Sơn | `sales@electronicsassembly.vn` | Supplier |
| Logistics Solutions      | Lê Văn Dũng    | `sales@logisticssolutions.vn`  | Supplier |
| Material Supply Co.      | Phạm Thị Thảo  | `sales@materialsupply.vn`      | Supplier |
| Metal Fabrication Ltd.   | Lý Thị Lan     | `sales@metalfab.vn`            | Supplier |
| Packaging Services       | Vũ Thị Linh    | `sales@packagingservices.vn`   | Supplier |
| Precision Machining Co.  | Ngô Văn Tâm    | `sales@precisionmachining.vn`  | Supplier |
| Quality Control Services | Trần Thị Hoa   | `sales@qualitycontrol.vn`      | Supplier |
| Surface Finishing Pro    | Trương Thị Mai | `sales@surfacefinishing.vn`    | Supplier |
| Tooling Solutions        | Hoàng Văn Nam  | `sales@toolingsolutions.vn`    | Supplier |
| Training Institute       | Bùi Thị Nga    | `sales@traininginstitute.vn`   | Supplier |

## Database Architecture

### Dual-Table Approach

Portal users are stored in **three locations** for comprehensive management:

1. **auth.users** - Supabase authentication (login/logout, sessions)
2. **public.contacts** - Business relationship data (company info, contact details)
3. **public.users** - Profile management (user preferences, settings, updates)

### Data Flow

```
auth.users (Authentication)
    ↓
public.users (Profile Management)
    ↔
public.contacts (Business Data)
```

### Benefits

- **Authentication**: Secure login/logout via Supabase Auth
- **Profile Management**: Full CRUD operations on user profiles
- **Business Logic**: Maintains relationship with contacts table
- **Flexibility**: Can manage portal users like internal employees
- **Separation**: Clear distinction between internal and external users

## Portal Access Instructions

1. **Customer Portal**: Navigate to the Factory Pulse customer portal
2. **Supplier Portal**: Navigate to the Factory Pulse supplier portal
3. **Login**: Use the email address and default password `Password@123`
4. **Access**: Users will have access to their organization's specific portal features

## Portal User Metadata

Each portal user includes the following metadata:
- **Name**: Contact person's full name
- **Company**: Organization name
- **Type**: Either "customer" or "supplier"
- **Contact ID**: Link to the contacts table record
- **Organization ID**: Link to the organizations table
- **Portal User Flag**: Identifies as external portal user (not internal)

## Authentication Details

- **Authentication System**: Supabase Auth with email/password
- **Email Confirmation**: All emails pre-confirmed for immediate access
- **Session Management**: Standard Supabase session handling
- **Password Security**: Default password for development (change in production)
- **User Isolation**: Portal users are separate from internal Factory Pulse users

## Portal Features Access

### Customer Portal Features
- View project status and updates
- Submit new project inquiries
- Access quotes and proposals
- View invoices and payments
- Communicate with Factory Pulse team
- Download project documentation

### Supplier Portal Features
- View RFQs (Request for Quotes)
- Submit quotations and proposals
- Track order status
- Access purchase orders
- Communicate with procurement team
- Manage supplier profile

## Security Considerations

⚠️ **Important**: These are development/testing credentials. In production:

### For Customers:
- Implement customer-specific password policies
- Enable two-factor authentication for sensitive operations
- Regular password rotation requirements
- Audit logging for portal access

### For Suppliers:
- Supplier verification process
- Contract-based access controls
- Compliance monitoring
- Secure document exchange protocols

## Testing and Verification

The portal authentication system has been tested and verified:
- ✅ All 20 portal users created successfully
- ✅ All portal users can authenticate with default password
- ✅ User metadata properly populated
- ✅ Customer and supplier types correctly classified
- ✅ Portal user flag set for external identification

## Integration Points

### Database Integration
- **Contacts Table**: Primary source of portal user information
- **Organizations Table**: Multi-tenant organization data
- **Auth Users Table**: Supabase authentication linkage
- **Projects Table**: Customer project access
- **RFQs Table**: Supplier RFQ access

### Application Integration
- **Customer Portal**: Separate interface for customer interactions
- **Supplier Portal**: Separate interface for supplier interactions
- **Role-Based Access**: Automatic routing based on user type
- **Data Isolation**: Customer/supplier data separation

## File Locations

- **Portal Auth Creation Script**: `scripts/create-portal-auth-users.js`
- **Portal Auth Test Script**: `scripts/test-portal-auth-login.js`
- **Internal User Credentials**: `docs/user-credentials.md`
- **Database Schema**: `docs/database-schema.md`

## Next Steps

1. **Portal Development**: Build customer and supplier portal interfaces
2. **Role-Based Access**: Implement portal-specific permissions
3. **User Onboarding**: Guide external users through portal features
4. **Password Management**: Implement secure password change functionality
5. **Audit Logging**: Track portal user activities
6. **Multi-Tenant Security**: Ensure proper data isolation between organizations
