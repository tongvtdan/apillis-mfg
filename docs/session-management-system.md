# Session Management System Documentation

## Overview

The Factory Pulse session management system provides comprehensive session monitoring, automatic token refresh, and user activity tracking to ensure secure and uninterrupted user experiences.

## Core Components

### useSessionManager Hook

The `useSessionManager` hook is the central component of the session management system, providing:

- **Automatic Token Refresh**: Proactive token refresh every 55 minutes
- **Session Monitoring**: Real-time session validity checking
- **Activity Tracking**: User activity monitoring for inactivity timeouts
- **Error Handling**: Graceful session error handling with user notifications

#### Usage

```typescript
import { useSessionManager } from '@/hooks/useSessionManager';

function MyComponent() {
  const { isSessionValid, lastActivity, refreshToken, updateActivity } = useSessionManager();
  
  // Session automatically managed in background
  // Manual refresh if needed: await refreshToken();
}
```

#### Return Values

- `isSessionValid`: Boolean indicating if the current session is valid
- `lastActivity`: Timestamp of the last user activity
- `refreshToken`: Function to manually refresh the authentication token
- `updateActivity`: Function to manually update the last activity timestamp

## Configuration

### Authentication Constants

Session management behavior is configured through `AUTH_CONFIG` in `src/lib/auth-constants.ts`:

```typescript
export const AUTH_CONFIG = {
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN_REFRESH_INTERVAL: 55 * 60 * 1000, // 55 minutes
  // ... other config
};
```

### Key Settings

- **Session Timeout**: 24 hours of inactivity before automatic sign-out
- **Token Refresh**: Every 55 minutes to prevent token expiration
- **Health Checks**: Every 60 seconds for session validation
- **Activity Events**: Mouse, keyboard, touch, and scroll events tracked

## Features

### 1. Automatic Token Refresh

- **Proactive Refresh**: Tokens are refreshed before expiration
- **Error Handling**: Failed refreshes trigger automatic sign-out
- **Background Operation**: No user interaction required
- **Conflict Resolution**: Handles concurrent refresh attempts

### 2. Session Monitoring

- **Expiration Detection**: Automatic detection of expired sessions
- **Health Checks**: Periodic validation of session state
- **Real-time Updates**: Immediate response to session changes
- **Status Tracking**: Comprehensive session status information

### 3. Activity Tracking

- **Multi-Event Detection**: Tracks various user interaction types
- **Passive Listeners**: Minimal performance impact
- **Inactivity Timeout**: Configurable timeout for inactive users
- **Activity Extension**: Session extends automatically with user activity

### 4. Error Handling

- **User Notifications**: Toast notifications for session events
- **Graceful Degradation**: Proper cleanup on session failures
- **Automatic Recovery**: Attempts to recover from temporary issues
- **Fallback Mechanisms**: Safe defaults for error conditions

## Integration

### Authentication Context

The session manager integrates with the existing `AuthContext`:

```typescript
const { user, session, signOut } = useAuth();
```

### Toast Notifications

User feedback is provided through the toast system:

```typescript
const { toast } = useToast();

toast({
  variant: "destructive",
  title: "Session Expired",
  description: "Your session has expired. Please sign in again.",
});
```

### Supabase Integration

Direct integration with Supabase auth for token operations:

```typescript
const { data, error } = await supabase.auth.refreshSession();
```

## Security Features

### 1. Session Validation

- **Expiration Checking**: Validates session expiration timestamps
- **Token Validation**: Ensures tokens are valid and not corrupted
- **Automatic Cleanup**: Removes invalid sessions immediately

### 2. Activity Monitoring

- **Inactivity Detection**: Monitors user activity for security timeouts
- **Activity Logging**: Tracks user activity for audit purposes
- **Timeout Enforcement**: Enforces configurable inactivity timeouts

### 3. Error Recovery

- **Secure Defaults**: Fails securely when errors occur
- **Automatic Sign-out**: Signs out users on critical session errors
- **Clean State**: Ensures clean application state after errors

## Performance Considerations

### 1. Efficient Event Handling

- **Passive Listeners**: Event listeners use passive option for performance
- **Debounced Updates**: Activity updates are debounced to prevent excessive processing
- **Minimal Re-renders**: Uses refs to avoid unnecessary component re-renders

### 2. Memory Management

- **Timer Cleanup**: Automatic cleanup of intervals and timeouts
- **Event Cleanup**: Proper removal of event listeners on unmount
- **Reference Management**: Efficient use of refs for persistent data

### 3. Network Optimization

- **Batched Requests**: Token refresh requests are batched when possible
- **Error Backoff**: Implements backoff strategy for failed requests
- **Connection Awareness**: Adapts behavior based on connection status

## Monitoring and Debugging

### 1. Console Logging

The system provides detailed console logging for debugging:

- Token refresh success/failure
- Session expiration events
- Activity tracking updates
- Error conditions and recovery

### 2. Status Information

The hook returns comprehensive status information:

```typescript
const status = {
  isSessionValid: boolean,
  lastActivity: number,
  sessionExpiry: number,
  tokenRefreshStatus: string
};
```

### 3. Error Tracking

All session-related errors are logged and can be monitored:

- Token refresh failures
- Session expiration events
- Network connectivity issues
- Authentication errors

## Best Practices

### 1. Implementation

- Always use the hook at the application root level
- Don't manually manage session state when using the hook
- Handle the returned status appropriately in your components
- Provide user feedback for session-related events

### 2. Configuration

- Adjust timeout values based on your security requirements
- Configure appropriate refresh intervals for your use case
- Set up monitoring for session-related metrics
- Test session behavior under various network conditions

### 3. Error Handling

- Provide clear user feedback for session issues
- Implement graceful degradation for offline scenarios
- Log session events for security monitoring
- Test error scenarios thoroughly

## Troubleshooting

### Common Issues

1. **Token Refresh Failures**
   - Check network connectivity
   - Verify Supabase configuration
   - Check for expired refresh tokens

2. **Session Timeouts**
   - Verify timeout configuration
   - Check activity tracking functionality
   - Ensure proper event listener setup

3. **Memory Leaks**
   - Verify timer cleanup on unmount
   - Check event listener removal
   - Monitor component lifecycle

### Debugging Steps

1. Check console logs for session events
2. Verify authentication context state
3. Test token refresh manually
4. Monitor network requests
5. Check local storage for session data

## Future Enhancements

### Planned Features

1. **Session Analytics**: Detailed session usage analytics
2. **Multi-tab Synchronization**: Session state sync across browser tabs
3. **Offline Support**: Enhanced offline session management
4. **Advanced Security**: Additional security features and monitoring

### Extension Points

The session management system is designed to be extensible:

- Custom activity detection events
- Configurable timeout strategies
- Integration with external monitoring systems
- Custom error handling strategies