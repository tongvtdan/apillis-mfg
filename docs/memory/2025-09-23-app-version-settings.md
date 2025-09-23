# App Version Information Added to Settings Page

## Summary
Added a new "Application Information" card to the General settings tab that displays:
- Application Name: Factory Pulse
- Version: v1.0.0 (from package.json)
- Environment: Current mode (development/production)
- Build Status: Production Ready badge

## Implementation Details
- Modified `src/pages/Settings.tsx` to include version constants and new UI card
- Used consistent styling with existing profile information card
- Added environment detection using `import.meta.env.MODE`
- Positioned the card below the existing Profile Information card
- Used responsive grid layout matching the existing design pattern

## Files Modified
- `src/pages/Settings.tsx` - Added app version information section

## Git Commit
- Commit: `feat: add app version information to settings page`
- Changes: Added application information card to General settings tab
