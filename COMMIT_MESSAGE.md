# Git Commit Message

```
feat: Enhance sign-in page with domain input, remember password, and show password toggle

- Add separate username and domain input fields for better user experience
- Implement domain persistence in localStorage (e.g., factorypulse.vn)
- Add remember password checkbox with secure localStorage storage
- Smart parsing: automatically extract username/domain from pasted emails
- Visual feedback showing constructed email address before submission
- Automatic cleanup of saved credentials on sign out for security
- Create auth-utils.ts with domain parsing and localStorage management functions
- Update AuthContext to clear saved credentials on sign out
- Add show password toggle with eye icon for better password verification
- Reorder form fields: domain first, then username for logical email construction flow
- Fix persistence issues: domain and username saved immediately when changed

User Experience Improvements:
- Users no longer need to retype domain for each login
- Convenient password remembering for trusted devices
- Clear visual confirmation of email being used for login
- Flexible input: can paste full email or enter separately
- Automatic removal of http://, https://, www. prefixes from domain
- Password visibility toggle for verification without compromising security
- Logical field order: domain → username → password for natural flow
- Instant persistence: preferences saved as user types, not just on login

Security Features:
- Password only stored when user explicitly checks "Remember me"
- All saved credentials automatically cleared on sign out
- Local storage only - no server-side storage of sensitive data
- User control over password storage preferences
- Password visibility toggle for user verification

UI/UX Enhancements:
- Field reordering for better logical flow
- Show password toggle integrated into password field
- Immediate feedback and persistence
- Better visual hierarchy and responsive design

Files Modified:
- src/lib/auth-utils.ts (new)
- src/pages/Auth.tsx
- src/contexts/AuthContext.tsx
- docs/MEMORY.md

Build Status:
- All changes successfully implemented and tested
- Build successful with no TypeScript errors
- Show password toggle functionality working
- Field reordering and persistence fixes implemented