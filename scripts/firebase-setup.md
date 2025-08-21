# Firebase Setup Instructions

## Prerequisites

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

## Project Setup

1. Create a new Firebase project or select existing one:
   ```bash
   firebase init
   ```
   
   Select the following services:
   - Firestore: Configure security rules and indexes files
   - Authentication: Configure authentication
   - Emulators: Set up local emulators for development

2. Configure Authentication providers in Firebase Console:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
   - Enable Google provider and configure OAuth consent screen
   - Add your domain to authorized domains

3. Update environment variables in `.env` file with your Firebase project configuration:
   - Get config from Firebase Console > Project Settings > General > Your apps
   - Replace placeholder values in `.env` file

## Security Rules Deployment

Deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

Deploy Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

## Development with Emulators

Start Firebase emulators for local development:
```bash
firebase emulators:start
```

This will start:
- Authentication emulator on port 9099
- Firestore emulator on port 8080
- Emulator UI on port 4000

## Custom Claims Setup

For role-based authentication, you'll need to set up Cloud Functions to manage custom claims:

1. Initialize Cloud Functions:
   ```bash
   firebase init functions
   ```

2. Create a function to set user roles as custom claims
3. Deploy the function:
   ```bash
   firebase deploy --only functions
   ```

## Environment Configuration

Make sure to set up different Firebase projects for:
- Development (with emulators)
- Staging
- Production

Use Firebase CLI to switch between projects:
```bash
firebase use --add  # Add a new project alias
firebase use <alias>  # Switch to a project
```