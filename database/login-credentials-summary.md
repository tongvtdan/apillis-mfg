# Factory Pulse - Login Credentials Summary

## Overview
This document contains the login credentials for all Factory Pulse system accounts. These accounts have been created in both the Supabase authentication system and the users table.

---

## Internal Employee Accounts

### Sales Department
| Name             | Email                        | Password      | Role                 | Access Level  |
| ---------------- | ---------------------------- | ------------- | -------------------- | ------------- |
| Nguyễn Thị Hương | nguyen.huong@factoryplus.com | Sales2024!    | Sales Representative | Standard User |
| Trần Văn Minh    | tran.minh@factoryplus.com    | SalesMgr2024! | Sales Manager        | Manager       |

### Procurement Department
| Name         | Email                    | Password     | Role                   | Access Level  |
| ------------ | ------------------------ | ------------ | ---------------------- | ------------- |
| Lê Văn Đức   | le.duc@factoryplus.com   | Proc2024!    | Procurement Specialist | Standard User |
| Phạm Thị Lan | pham.lan@factoryplus.com | ProcMgr2024! | Procurement Manager    | Manager       |

### Engineering Department
| Name           | Email                      | Password    | Role                | Access Level  |
| -------------- | -------------------------- | ----------- | ------------------- | ------------- |
| Hoàng Văn Tuấn | hoang.tuan@factoryplus.com | Eng2024!    | Design Engineer     | Standard User |
| Võ Thị Mai     | vo.mai@factoryplus.com     | EngMgr2024! | Engineering Manager | Manager       |

### Quality Assurance Department
| Name          | Email                     | Password   | Role              | Access Level  |
| ------------- | ------------------------- | ---------- | ----------------- | ------------- |
| Đặng Thị Linh | dang.linh@factoryplus.com | QA2024!    | Quality Inspector | Standard User |
| Bùi Văn Hùng  | bui.hung@factoryplus.com  | QAMgr2024! | QA Manager        | Manager       |

### Production Department
| Name          | Email                     | Password     | Role                | Access Level  |
| ------------- | ------------------------- | ------------ | ------------------- | ------------- |
| Ngô Văn Thành | ngo.thanh@factoryplus.com | Prod2024!    | Production Operator | Standard User |
| Lý Thị Hoa    | ly.hoa@factoryplus.com    | ProdMgr2024! | Production Manager  | Manager       |

### Management/Executive
| Name          | Email                     | Password     | Role                | Access Level |
| ------------- | ------------------------- | ------------ | ------------------- | ------------ |
| Đinh Văn Khoa | dinh.khoa@factoryplus.com | DeptMgr2024! | Operations Director | Director     |
| Cao Thị Nga   | cao.nga@factoryplus.com   | ExecMgr2024! | General Manager     | Executive    |

---

## External Partner Accounts

### Supplier Accounts (VietTech Manufacturing)
| Name        | Email                   | Password      | Role                 | Access Level     |
| ----------- | ----------------------- | ------------- | -------------------- | ---------------- |
| Vũ Minh Tâm | vu.tam@viettech.com.vn  | Supplier2024! | Sales Representative | External User    |
| Đỗ Thị Xuân | do.xuan@viettech.com.vn | SupMgr2024!   | Account Manager      | External Manager |

### Customer Accounts (AutoTech Solutions)
| Name            | Email                        | Password      | Role                   | Access Level     |
| --------------- | ---------------------------- | ------------- | ---------------------- | ---------------- |
| Michael Johnson | michael.johnson@autotech.com | Customer2024! | Procurement Specialist | External User    |
| Rachel Green    | rachel.green@autotech.com    | CusMgr2024!   | Purchasing Manager     | External Manager |

---

## Account Features

### Authentication System
- **Supabase Auth Integration**: All accounts are created in Supabase authentication system
- **Email Confirmation**: Accounts are pre-confirmed for immediate use
- **Password Security**: All passwords follow security policy (8+ chars, mixed case, numbers, symbols)
- **Row Level Security**: Enabled with appropriate policies

### User Profiles
- **Complete Profile Data**: All accounts have full profile information
- **Role-Based Permissions**: Each account has specific permissions based on role
- **Organizational Structure**: Manager-subordinate relationships are maintained
- **Security Clearance**: Appropriate clearance levels assigned

### Database Structure
- **Users Table**: Complete profile information stored
- **Auth Integration**: Linked to Supabase auth.users table
- **Indexes**: Optimized for performance
- **Views**: Helper views for easy querying

---

## Usage Instructions

### For Developers
1. Run the `create-factory-pulse-accounts.sql` script in Supabase SQL editor
2. All accounts will be created with authentication and profile data
3. Users can immediately log in using the credentials above
4. Use the helper functions and views for user management

### For Testing
- Use any of the above credentials to test different user roles
- Each account has appropriate permissions for their role
- External accounts have limited access to relevant portals only

### For Production
- **Change all passwords** before production deployment
- Enable email confirmation workflow
- Review and adjust RLS policies as needed
- Set up proper backup and recovery procedures

---

## Security Notes

⚠️ **Important Security Reminders:**
- These are development/testing credentials
- Change all passwords before production use
- Enable MFA for manager-level accounts and above
- Regularly review and audit user permissions
- Monitor login activities and access patterns

---

## Support Information

### Database Management
- Use Supabase dashboard for user management
- SQL functions available for bulk operations
- Views provide easy access to user data

### Account Issues
- Password resets can be handled through Supabase Auth
- Profile updates go through the users table
- Use RLS policies to control data access

---

*This document contains sensitive information. Handle according to security policies.*