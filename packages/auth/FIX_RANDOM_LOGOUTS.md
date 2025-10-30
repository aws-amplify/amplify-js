# Fix for Random Authentication Logouts (#14534)

## Problem Identified

In `TokenOrchestrator.handleErrors()`, the current implementation clears tokens for **ANY** error that's not a network error:

```typescript
// Current problematic code (line 173-176)
if (err.name !== AmplifyErrorCode.NetworkError) {
    // TODO(v6): Check errors on client
    this.clearTokens();
}
```

This causes users to be logged out for:
- Rate limiting (TooManyRequestsException)
- Temporary service issues (ServiceException)
- Transient errors
- Any other non-network error

## Root Cause

The token refresh flow calls `handleErrors()` when ANY error occurs during refresh. The current logic assumes all non-network errors mean the user should be logged out, which is incorrect.

## Proposed Fix

Only clear tokens for authentication-specific errors that definitively indicate the user's session is invalid:

```typescript
private handleErrors(err: unknown) {
    assertServiceError(err);

    // Only clear tokens for errors that definitively indicate invalid authentication
    const shouldClearTokens =
        err.name === 'NotAuthorizedException' ||
        err.name === 'TokenRevokedException' ||
        err.name === 'UserNotFoundException' ||
        err.name === 'PasswordResetRequiredException' ||
        err.name === 'UserNotConfirmedException';

    if (shouldClearTokens) {
        this.clearTokens();
    }

    Hub.dispatch(
        'auth',
        {
            event: 'tokenRefresh_failure',
            data: { error: err },
        },
        'Auth',
        AMPLIFY_SYMBOL,
    );

    // Only return null for NotAuthorizedException (existing behavior)
    if (err.name.startsWith('NotAuthorizedException')) {
        return null;
    }
    throw err;
}
```

## Why This Fix Works

1. **Preserves valid sessions**: Transient errors (rate limiting, service issues) don't log users out
2. **Maintains security**: Invalid tokens still cause logout
3. **Better UX**: Users stay logged in through temporary issues
4. **Backward compatible**: NotAuthorizedException still returns null as before

## Errors That Should Clear Tokens

- `NotAuthorizedException` - Refresh token is invalid/expired
- `TokenRevokedException` - Token explicitly revoked
- `UserNotFoundException` - User deleted from Cognito
- `PasswordResetRequiredException` - Password reset required
- `UserNotConfirmedException` - User needs confirmation

## Errors That Should NOT Clear Tokens

- `TooManyRequestsException` - Rate limiting (temporary)
- `ServiceException` - AWS service issue (temporary)
- `InternalErrorException` - Internal AWS error (temporary)
- `NetworkError` - Network connectivity (already handled)
- `UnknownError` - Unknown issues (shouldn't assume logout)

## Testing the Fix

1. Simulate rate limiting during token refresh
2. Simulate service exceptions
3. Verify tokens remain after temporary errors
4. Verify tokens clear for auth errors

## Impact

This fix will:
- Stop random logouts for production users
- Improve app reliability
- Maintain security for actual auth failures
- Reduce user frustration

## Alternative Approach (More Conservative)

If we want to be extra conservative, we could add retry logic before clearing tokens:

```typescript
private async handleErrors(err: unknown, retryCount = 0) {
    assertServiceError(err);

    const isRetryableError =
        err.name === 'TooManyRequestsException' ||
        err.name === 'ServiceException' ||
        err.name === 'InternalErrorException';

    const maxRetries = 3;

    if (isRetryableError && retryCount < maxRetries) {
        // Wait with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the refresh
        return this.refreshTokens(); // Would need to pass retry count
    }

    // Only clear for definitive auth errors
    const shouldClearTokens =
        err.name === 'NotAuthorizedException' ||
        err.name === 'TokenRevokedException' ||
        err.name === 'UserNotFoundException';

    if (shouldClearTokens) {
        this.clearTokens();
    }

    // ... rest of the method
}
```

## Recommendation

Implement the first fix immediately as it's simpler and addresses the core issue. The retry logic can be added later if needed.