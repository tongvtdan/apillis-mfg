# Factory Pulse User Credentials

## Authentication Users Created

All internal Factory Pulse users have been created with authentication accounts. The default password for all users is:

**Default Password: `Password@123`**

## User List with Credentials

### Management Team
| Email                   | Name             | Role       | Department |
| ----------------------- | ---------------- | ---------- | ---------- |
| `admin@factorypulse.vn` | Nguyễn Văn Admin | admin      | Management |
| `ceo@factorypulse.vn`   | Trần Thị CEO     | management | Management |

### Sales Team
| Email                    | Name           | Role  | Department |
| ------------------------ | -------------- | ----- | ---------- |
| `sales@factorypulse.vn`  | Lê Văn Sales   | sales | Sales      |
| `sales2@factorypulse.vn` | Bùi Thị Sales2 | sales | Sales      |

### Procurement Team
| Email                          | Name                 | Role        | Department  |
| ------------------------------ | -------------------- | ----------- | ----------- |
| `procurement@factorypulse.vn`  | Phạm Thị Procurement | procurement | Procurement |
| `procurement2@factorypulse.vn` | Ngô Văn Procurement2 | procurement | Procurement |

### Engineering Team
| Email                          | Name                  | Role        | Department  |
| ------------------------------ | --------------------- | ----------- | ----------- |
| `engineering@factorypulse.vn`  | Hoàng Văn Engineering | engineering | Engineering |
| `engineering2@factorypulse.vn` | Lý Thị Engineering2   | engineering | Engineering |

### Production Team
| Email                         | Name               | Role       | Department |
| ----------------------------- | ------------------ | ---------- | ---------- |
| `production@factorypulse.vn`  | Vũ Thị Production  | production | Production |
| `production2@factorypulse.vn` | Hồ Văn Production2 | production | Production |

### Quality Assurance Team
| Email                 | Name           | Role | Department        |
| --------------------- | -------------- | ---- | ----------------- |
| `qa@factorypulse.vn`  | Đặng Văn QA    | qa   | Quality Assurance |
| `qa2@factorypulse.vn` | Trương Thị QA2 | qa   | Quality Assurance |

## Authentication Details

- **Total Users**: 12 internal Factory Pulse employees
- **Authentication System**: Supabase Auth
- **Password Policy**: All users have the same default password
- **Email Confirmation**: All emails are pre-confirmed for immediate access
- **User Metadata**: Each auth user includes name, role, and public user ID

## Login Instructions

1. Navigate to the Factory Pulse application
2. Use any of the email addresses above
3. Enter the default password: `Password@123`
4. Users will be automatically logged in with their appropriate role and permissions

## Security Notes

⚠️ **Important**: These are development/testing credentials. In production:
- Each user should change their password on first login
- Implement proper password policies
- Enable MFA for sensitive roles
- Regular password rotation

## Testing

The authentication system has been tested and verified:
- ✅ All 12 users can successfully sign in
- ✅ User metadata (name, role) is properly loaded
- ✅ Session management works correctly
- ✅ Sign out functionality works

## File Locations

- **Authentication Script**: `scripts/create-auth-users.js`
- **Test Script**: `scripts/test-auth-login.js`
- **Database Schema**: `docs/database-schema.md`
- **Sample Data**: `supabase/seed.sql`

## Next Steps

1. **User Onboarding**: Guide users to change passwords on first login
2. **Role-Based Access**: Implement RLS policies based on user roles
3. **Password Management**: Add password change and reset functionality
4. **Audit Logging**: Track authentication events and user actions
