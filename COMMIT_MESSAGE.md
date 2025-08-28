# Git Commit Message

## Concise Commit Message (for git commit -m)
```
feat: Enhance sign-in page with domain input, password memory, and improved UX

- Add separate domain and username inputs with smart parsing
- Implement remember password checkbox with secure localStorage
- Add show password toggle for better verification
- Reorder fields: Domain → Username → Password for logical flow
- Auto-extract domain/username from pasted emails
- Secure persistence: credentials only saved after successful login
- Clear saved data on sign-out for security
```

## Detailed Commit Message (for git commit)
feat: Enhance sign-in page with domain input, password memory, and improved UX

## ✨ New Features
- **Domain Input Field**: Separate domain and username inputs for better user experience
  - Domain field remembers the last used domain (e.g., factorypulse.vn)
  - Automatically strips http://, https://, and www. prefixes
  - Username field for the part before @ (e.g., admin)
- **Remember Password**: Checkbox to remember password for future sign-ins
  - Only saves password when explicitly checked
  - Password persists across browser sessions until sign-out
- **Show Password Toggle**: Eye icon to toggle password visibility
- **Smart Email Parsing**: Automatically extracts domain/username if full email is pasted

## 🔧 Technical Implementation
- **New Utility Module**: `src/lib/auth-utils.ts` for localStorage management
  - Secure credential storage with proper error handling
  - Functions for domain, username, password, and preferences
  - Automatic cleanup on sign-out
- **Enhanced Auth Component**: `src/pages/Auth.tsx`
  - Reordered fields: Domain → Username → Password
  - Real-time email preview: "Signing in as: username@domain"
  - Conditional password saving based on "Remember me" checkbox
- **Improved AuthContext**: `src/contexts/AuthContext.tsx`
  - Clears saved credentials on sign-out for security
  - Better error handling and audit logging

## 🎯 User Experience Improvements
- **Streamlined Workflow**: Users can quickly sign in with remembered domain
- **Visual Feedback**: Clear indication of constructed email address
- **Flexible Input**: Accepts both separate fields and full email pasting
- **Secure Persistence**: Credentials only saved after successful authentication

## 🔒 Security Considerations
- Password only saved when "Remember me" is explicitly checked
- All saved data cleared on sign-out
- localStorage operations wrapped in try-catch for error handling
- No sensitive data logged to console

## 📁 Files Modified
- `src/lib/auth-utils.ts` (new file)
- `src/pages/Auth.tsx`
- `src/contexts/AuthContext.tsx`
- `docs/MEMORY.md`
- `supabase/migrations/20250127000009_fix_rls_recursion.sql`

## 🧪 Testing
- Build successful with no TypeScript errors
- Remember functionality verified working correctly
- Domain and password persistence confirmed functional
- All form validations maintained

## 🚀 Impact
- Significantly improves user experience for frequent sign-ins
- Reduces typing for users with consistent domain usage
- Maintains security best practices for credential storage
- Provides foundation for future authentication enhancements

feat: Add Admin tab to sidebar and fix role-based access control

## Summary
Fixed the Admin tab not showing issue by implementing comprehensive role-based access control
and adding conditional Admin tab visibility for users with 'management' or 'admin' roles.

## Changes Made

### Core Components
- **AppSidebar**: Added conditional Admin tab under "Administration" section
  - Shows for users with role 'management' OR 'admin'
  - Added debug logging for role troubleshooting
  - Added Shield icon for Admin tab

### Role Checking Consistency
- **AdminUsers**: Updated to allow both 'management' and 'admin' roles
- **Settings**: Fixed role checking for admin tab visibility
- **Profile**: Fixed role checking for management features
- **App.tsx**: Updated all protected routes to allow both admin roles

### Permission System Enhancement
- **UserRole enum**: Added missing 'admin' role
- **ROLE_PERMISSIONS**: Added comprehensive admin role permissions matrix
- **Role hierarchy**: Added admin role as highest privilege level (level 6)
- **Auth constants**: Added admin role descriptions and default routes

### Route Protection Updates
- `/users`: Now allows ['management', 'admin']
- `/reviews`: Now allows ['engineering', 'qa', 'production', 'management', 'admin', 'procurement']
- `/production`: Now allows ['production', 'management', 'admin']
- `/analytics`: Now allows ['management', 'admin', 'procurement']

### Diagnostic Tools
- **check-admin-role.js**: Node.js script to diagnose database role issues
- **fix-admin-role-simple.sql**: SQL script to fix admin role in database
- **Console logging**: Added debug logging in AppSidebar for real-time troubleshooting

## Technical Details
- Role checking now consistently uses: `profile?.role === 'management' || profile?.role === 'admin'`
- Admin role has highest privileges with access to all system resources
- Added comprehensive permission matrix for admin role including system configuration access
- Fixed role hierarchy to properly reflect admin > management > other roles

## Result
- Admin tab now properly displays for users with 'management' OR 'admin' role
- Consistent role checking across all components
- Complete admin role support with comprehensive permissions
- Better debugging capabilities for future role issues

## Files Modified
- src/components/layout/AppSidebar.tsx
- src/pages/AdminUsers.tsx
- src/pages/Settings.tsx
- src/pages/Profile.tsx
- src/App.tsx
- src/types/auth.ts
- src/lib/auth-constants.ts
- src/lib/permissions.ts
- docs/MEMORY.md

## Files Added
- scripts/check-admin-role.js
- scripts/fix-admin-role-simple.sql

## Testing
- Verified Admin tab appears for admin users
- Confirmed role checking consistency across components
- Tested route protection for all admin-accessible routes
- Added debug logging for troubleshooting

Closes: Admin tab not showing for admin users
Resolves: Inconsistent role checking throughout application
