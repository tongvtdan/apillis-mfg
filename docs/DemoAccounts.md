# Demo Accounts Documentation

## Overview
This document contains all demo accounts available in the Factory Pulse system for testing and demonstration purposes.

**Total Accounts:** 14 (Active in Database)
**Last Updated:** September 8, 2025
**Default Password:** `Password123!` (for all accounts)

---

## Factory Pulse Internal Users

### Administrators
| Email                    | Role  | Name       | ID                                     | Created    | Password Note  |
| ------------------------ | ----- | ---------- | -------------------------------------- | ---------- | -------------- |
| `admin@apillis.com`      | admin | Admin User | `383b189e-acec-4989-94b3-a0267f4501bb` | 2025-09-07 | `Password123!` |
| `john.smith@apillis.com` | admin | John Smith | `5c15f93c-5cfc-41b8-8aee-b7fed47c50f5` | 2022-09-07 | `Password123!` |

### Management Team
| Email                      | Role       | Name         | ID                                     | Created    | Password Note  |
| -------------------------- | ---------- | ------------ | -------------------------------------- | ---------- | -------------- |
| `mary.johnson@apillis.com` | management | Mary Johnson | `2ec906ce-38c7-4f13-8bc1-72805f0babb1` | 2023-03-07 | `Password123!` |
| `nguyen.van.a@apillis.com` | management | Nguyen Van A | `660e8400-e29b-41d4-a716-446655440003` | 2023-09-07 | `Password123!` |
| `tran.thi.b@apillis.com`   | management | Tran Thi B   | `7eceb5b5-eb6f-484b-8601-6fd29b4ee543` | 2023-11-07 | `Password123!` |
| `le.van.c@apillis.com`     | management | Le Van C     | `951f0ab8-b36b-44e4-90f3-057fc332d8cb` | 2024-03-07 | `Password123!` |

### Sales Team
| Email                    | Role  | Name       | ID                                     | Created    | Password Note  |
| ------------------------ | ----- | ---------- | -------------------------------------- | ---------- | -------------- |
| `pham.thi.d@apillis.com` | sales | Pham Thi D | `b6181435-15ac-4934-9042-8e68b4526449` | 2024-07-07 | `Password123!` |
| `vu.thi.f@apillis.com`   | sales | Vu Thi F   | `f13a197f-503b-4796-8b90-3aefeb63a3c2` | 2024-11-07 | `Password123!` |

### Procurement Team
| Email                     | Role        | Name        | ID                                     | Created    | Password Note  |
| ------------------------- | ----------- | ----------- | -------------------------------------- | ---------- | -------------- |
| `hoang.van.e@apillis.com` | procurement | Hoang Van E | `e5722240-2856-4371-97f7-14ec83f887d0` | 2024-09-07 | `Password123!` |

### Engineering Team
| Email                    | Role        | Name       | ID                                     | Created    | Password Note  |
| ------------------------ | ----------- | ---------- | -------------------------------------- | ---------- | -------------- |
| `dinh.van.g@apillis.com` | engineering | Dinh Van G | `99436219-df0f-47be-a3e9-a58d7ba6a195` | 2025-01-07 | `Password123!` |

### Quality Assurance Team
| Email                   | Role | Name      | ID                                     | Created    | Password Note  |
| ----------------------- | ---- | --------- | -------------------------------------- | ---------- | -------------- |
| `bui.thi.h@apillis.com` | qa   | Bui Thi H | `6bd01c71-c9e5-40dc-82b2-10635a775963` | 2025-03-07 | `Password123!` |
| `ngo.van.i@apillis.com` | qa   | Ngo Van I | `c67b1f45-7caa-4a75-b641-34408efc3c3f` | 2025-05-07 | `Password123!` |

### Production Team
| Email                  | Role       | Name     | ID                                     | Created    | Password Note  |
| ---------------------- | ---------- | -------- | -------------------------------------- | ---------- | -------------- |
| `do.thi.j@apillis.com` | production | Do Thi J | `ca1db5ee-f706-4753-82b3-a578fb259db3` | 2025-06-07 | `Password123!` |
| `ly.van.k@apillis.com` | production | Ly Van K | `025f70ae-8fe5-44c1-af1d-741c31af7d0b` | 2025-07-07 | `Password123!` |

---

## Login Information

### Authentication Methods
- **Primary:** Email/Password via Supabase Auth
- **Secondary:** Google OAuth (if configured)

### Password Policy
- **Default Password:** `Password123!` (for all accounts)
- **Security:** All passwords are hashed using bcrypt algorithm
- **Reset:** Users can reset passwords via email
- **Storage:** Passwords are securely encrypted and stored

### Access Levels & Permissions

#### Enhanced Permission System
The system now includes a comprehensive role-based access control (RBAC) system:

- **Admin:** Full system access, user management, database operations
- **Management:** Project oversight, analytics, team management
- **Sales:** Customer management, RFQ creation, project initiation
- **Procurement:** Supplier management, RFQ processing, purchase orders
- **Engineering:** Technical specifications, document management
- **QA:** Quality reviews, audit trails, approval workflows
- **Production:** Production scheduling, capacity management

#### Key Features
- ✅ **Granular Permissions:** Individual permission control per user
- ✅ **Custom Roles:** Create custom permission sets beyond base roles
- ✅ **Feature Toggles:** Enable/disable specific features per user/role
- ✅ **Archive System:** Soft delete with reactivation capability
- ✅ **Audit Trail:** Complete logging of permission changes

### Recent Activity
- **Most Active:** `nguyen.van.a@apillis.com` (last login: 2025-09-07)
- **Recent Logins:** Several accounts show recent activity
- **Admin Access:** `admin@apillis.com` actively used for system management

---

## Usage Notes

### For Testing Enhanced Permissions:
1. **Admin Account:** `admin@apillis.com` - Full system access
2. **Management:** `nguyen.van.a@apillis.com` - Advanced analytics access
3. **Sales:** `pham.thi.d@apillis.com` - Customer creation permissions
4. **Procurement:** `hoang.van.e@apillis.com` - Supplier management permissions
5. **Engineering:** `dinh.van.g@apillis.com` - Document management access

### Permission Testing Scenarios:
- **Customer Creation:** Test with Sales role accounts
- **Supplier Creation:** Test with Procurement role accounts
- **Advanced Analytics:** Test with Management role accounts
- **Archive Functionality:** Available for users with appropriate permissions
- **Feature Toggles:** Different features enabled based on role

### Security Notes:
- All passwords are hashed using bcrypt algorithm (`Password123!`)
- All accounts use the same default password for easy testing
- Default passwords should be changed for production use
- Enhanced RLS policies protect data access
- Audit logging tracks all permission changes

---

## Database Queries

### Check All Users:
```sql
SELECT
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    u.role,
    u.name,
    u.status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
ORDER BY au.created_at DESC;
```

### Check User Permissions:
```sql
-- Test enhanced permission system
SELECT has_user_permission_enhanced('user_id_here', 'customer', 'create');
SELECT has_user_feature_access('user_id_here', 'advanced_analytics');
```

### Check Feature Toggles:
```sql
SELECT feature_key, feature_name, required_role, is_enabled FROM feature_toggles;
```

---

## System Architecture

### Enhanced Security Features:
- **Row Level Security (RLS):** Organization-scoped data access
- **Granular Permissions:** 46+ specific permissions defined
- **Custom Roles:** Flexible role creation and assignment
- **Feature Toggles:** 4+ configurable features
- **Audit System:** Complete permission change tracking
- **Cache System:** Optimized permission checking performance

### Database Tables Added:
- `permissions` - Permission catalog
- `custom_roles` - Custom role definitions
- `role_permissions` - Role-permission mappings
- `user_permissions` - User-specific overrides
- `user_custom_roles` - User role assignments
- `feature_toggles` - Feature enable/disable
- `user_feature_access` - User feature overrides
- `permission_audit_log` - Audit trail

---

*Last Updated:* September 8, 2025
*Total Accounts:* 14 (Active)
*Enhanced Permissions:* ✅ Implemented
*Security Level:* Enterprise-grade RBAC
*System:* Factory Pulse Manufacturing Management Platform



---

[20 tools called]

## 🎯 **Who Can Access Customer and Supplier Pages**

Based on the current permission system implementation, here's the comprehensive access breakdown:

### 📊 **Access Permissions Summary**

| **Role**        | **Customer Management** | **Supplier Management** | **Access Level**             |
| --------------- | ----------------------- | ----------------------- | ---------------------------- |
| **Admin**       | ✅ Full Access           | ✅ Full Access           | Complete CRUD + Archive      |
| **Management**  | ✅ Full Access           | ✅ Full Access           | Complete CRUD + Archive      |
| **Sales**       | ✅ Full Access           | ❌ No Access             | Customer CRUD + Archive only |
| **Procurement** | ❌ No Access             | ✅ Full Access           | Supplier CRUD + Archive only |
| **Engineering** | ❌ No Access             | ❌ No Access             | Read-only access             |
| **QA**          | ❌ No Access             | ❌ No Access             | Read-only access             |
| **Production**  | ❌ No Access             | ❌ No Access             | Read-only access             |

---

### 🔐 **Detailed Access Analysis**

#### **✅ Full Access Roles (Both Customer & Supplier)**
- **Admin**: Complete access to all features, user management, system configuration
- **Management**: Project oversight, analytics, team management with full CRUD capabilities

#### **🎯 Specialized Access Roles**

**Sales Team:**
- ✅ **Customer Management**: Can create, read, update, delete, and archive customers
- ❌ **Supplier Management**: No access to supplier features
- **Reason**: Sales focus on customer relationships and RFQ intake

**Procurement Team:**

- ❌ **Customer Management**: No access to customer features  
- ✅ **Supplier Management**: Can create, read, update, delete, and archive suppliers
- **Reason**: Procurement handles supplier relationships and vendor management

#### **👁️ Read-Only Roles**
- **Engineering**: Technical specifications and document management
- **QA**: Quality reviews and approval workflows  
- **Production**: Production scheduling and capacity management
- **Access Level**: These roles have read-only access to basic information

---

### 🛡️ **Permission System Details**


#### **Permission Breakdown:**
- **customer:create** → Add/Edit customers
- **customer:read** → View customer data
- **customer:update** → Modify customer info
- **customer:archive** → Archive/unarchive customers
- **supplier:create** → Add/Edit suppliers
- **supplier:read** → View supplier data
- **supplier:update** → Modify supplier info
- **supplier:archive** → Archive/unarchive suppliers

---

### 🎨 **UI Behavior Based on Permissions**

#### **For Sales Users:**
- ✅ Customer page: Full access to all features
- ✅ Can see "Add Customer" button
- ✅ Can archive/unarchive customers
- ❌ Supplier page: Button hidden, features disabled
- ❌ "Add Supplier" button not visible

#### **For Procurement Users:**
- ❌ Customer page: Button hidden, features disabled
- ✅ Supplier page: Full access to all features
- ✅ Can see "Add Supplier" button
- ✅ Can archive/unarchive suppliers

#### **For Management/Admin:**
- ✅ Both pages: Complete access to all features
- ✅ All buttons and features visible
- ✅ Can manage both customers and suppliers

---

## 🎉 **Summary**

- **Sales** = Customer-focused access
- **Procurement** = Supplier-focused access  
- **Management/Admin** = Full access to both
- **Technical roles** = Read-only access
- **Access is role-based** with granular permissions
- **UI adapts dynamically** based on user permissions

This separation ensures that users only see and can access the features relevant to their job responsibilities! 🚀