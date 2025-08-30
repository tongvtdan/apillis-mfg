import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { formatDatabaseError, formatErrorsForToast } from '@/lib/validation/error-handlers';

export interface ErrorState {
    hasError: boolean;
    error: Error | null;
    errorId: string | null;
    context: string | null;
    retryCount: number;
    isRetrying: boolean;
    canRetry: boolean;
}

export interface ErrorHandlingOptions {
    maxRetries?: number;
    retryDelay?: number;
    showToast?: boolean;
    logError?: boolean;
    context?: string;
    onError?: (error: Error, context?: string) => void;
    onRetry?: (retryCount: number) => void;
    onMaxRetriesReached?: (error: Error) => void;
}

export interface RetryOptions {
    immediate?: boolean;
    resetRetryCount?: boolean;
}

/**
 * Comprehensive error handling hook for project components
 * Provides error state management, retry logic, and user feedback
 */
export function useErrorHandling(options: ErrorHandlingOptions = {}) {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        showToast = true,
        logError = true,
        context,
        onError,
        onRetry,
        onMaxRetriesReached
    } = options;

    const [errorState, setErrorState] = useState<ErrorState>({
        hasError: false,
        error: null,
        errorId: null,
        context: null,
        retryCount: 0,
        isRetrying: false,
        canRetry: true
    });

    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const errorIdCounterRef = useRef(0);

    // Generate unique error ID
    const generateErrorId = useCallback(() => {
        errorIdCounterRef.current += 1;
        return `error_${Date.now()}_${errorIdCounterRef.current}`;
    }, []);

    // Clear retry timeout on unmount
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    // Handle error with comprehensive logging and user feedback
    const handleError = useCallback((
        error: Error | string,
        errorContext?: string,
        options?: { skipToast?: boolean; skipLog?: boolean }
    ) => {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        const finalContext = errorContext || context || 'Unknown';
        const errorId = generateErrorId();

        // Log error if enabled
        if (logError && !options?.skipLog) {
            console.error(`[${finalContext}] Error ${errorId}:`, {
                error: errorObj.message,
                stack: errorObj.stack,
                context: finalContext,
                timestamp: new Date().toISOString()
            });
        }

        // Update error state
        setErrorState(prev => ({
            ...prev,
            hasError: true,
            error: errorObj,
            errorId,
            context: finalContext,
            canRetry: prev.retryCount < maxRetries,
            isRetrying: false
        }));

        // Show toast notification if enabled
        if (showToast && !options?.skipToast) {
            const userFriendlyMessage = formatDatabaseError(errorObj);

            toast.error('Operation Failed', {
                description: userFriendlyMessage,
                action: prev.retryCount < maxRetries ? {
                    label: 'Retry',
                    onClick: () => retry()
                } : undefined
            });
        }

        // Call custom error handler
        if (onError) {
            onError(errorObj, finalContext);
        }
    }, [context, logError, showToast, maxRetries, onError, generateErrorId]);

    // Retry mechanism with exponential backoff
    const retry = useCallback(async (
        retryFunction?: () => Promise<void> | void,
        options?: RetryOptions
    ) => {
        const { immediate = false, resetRetryCount = false } = options || {};

        if (!errorState.canRetry && !resetRetryCount) {
            if (onMaxRetriesReached && errorState.error) {
                onMaxRetriesReached(errorState.error);
            }
            return false;
        }

        const newRetryCount = resetRetryCount ? 0 : errorState.retryCount + 1;

        setErrorState(prev => ({
            ...prev,
            isRetrying: true,
            retryCount: newRetryCount,
            canRetry: newRetryCount < maxRetries
        }));

        // Call retry callback
        if (onRetry) {
            onRetry(newRetryCount);
        }

        const executeRetry = async () => {
            try {
                if (retryFunction) {
                    await retryFunction();
                }

                // Clear error state on successful retry
                clearError();

                if (showToast) {
                    toast.success('Operation completed successfully');
                }

                return true;
            } catch (retryError) {
                const retryErrorObj = retryError instanceof Error ? retryError : new Error(String(retryError));

                setErrorState(prev => ({
                    ...prev,
                    error: retryErrorObj,
                    isRetrying: false,
                    canRetry: newRetryCount < maxRetries
                }));

                if (newRetryCount >= maxRetries) {
                    if (showToast) {
                        toast.error('Maximum retry attempts reached', {
                            description: 'Please refresh the page or contact support.'
                        });
                    }

                    if (onMaxRetriesReached) {
                        onMaxRetriesReached(retryErrorObj);
                    }
                }

                return false;
            }
        };

        if (immediate) {
            return executeRetry();
        } else {
            // Exponential backoff: 1s, 2s, 4s, 8s...
            const delay = Math.min(retryDelay * Math.pow(2, newRetryCount - 1), 10000);

            if (showToast) {
                toast.info(`Retrying in ${delay / 1000} seconds...`);
            }

            return new Promise<boolean>((resolve) => {
                retryTimeoutRef.current = setTimeout(async () => {
                    const result = await executeRetry();
                    resolve(result);
                }, delay);
            });
        }
    }, [errorState, maxRetries, retryDelay, showToast, onRetry, onMaxRetriesReached]);

    // Clear error state
    const clearError = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        setErrorState({
            hasError: false,
            error: null,
            errorId: null,
            context: null,
            retryCount: 0,
            isRetrying: false,
            canRetry: true
        });
    }, []);

    // Reset retry count while keeping error
    const resetRetryCount = useCallback(() => {
        setErrorState(prev => ({
            ...prev,
            retryCount: 0,
            canRetry: true,
            isRetrying: false
        }));
    }, []);

    // Wrapper for async operations with automatic error handling
    const withErrorHandling = useCallback(<T extends any[], R>(
        asyncFunction: (...args: T) => Promise<R>,
        errorContext?: string
    ) => {
        return async (...args: T): Promise<R | null> => {
            try {
                clearError();
                const result = await asyncFunction(...args);
                return result;
            } catch (error) {
                handleError(
                    error instanceof Error ? error : new Error(String(error)),
                    errorContext
                );
                return null;
            }
        };
    }, [handleError, clearError]);

    // Check if error is recoverable
    const isRecoverableError = useCallback((error: Error): boolean => {
        const message = error.message.toLowerCase();

        // Network errors are usually recoverable
        if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
            return true;
        }

        // Database connection errors are recoverable
        if (message.includes('connection') || message.includes('database')) {
            return true;
        }

        // Rate limiting errors are recoverable
        if (message.includes('rate limit') || message.includes('too many requests')) {
            return true;
        }

        // Server errors (5xx) are potentially recoverable
        if (message.includes('500') || message.includes('502') || message.includes('503')) {
            return true;
        }

        return false;
    }, []);

    // Get user-friendly error message
    const getUserFriendlyMessage = useCallback((error?: Error): string => {
        if (!error) return 'An unknown error occurred';
        return formatDatabaseError(error);
    }, []);

    // Get error severity level
    const getErrorSeverity = useCallback((error?: Error): 'low' | 'medium' | 'high' | 'critical' => {
        if (!error) return 'medium';

        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('timeout')) {
            return 'medium';
        }

        if (message.includes('permission') || message.includes('unauthorized')) {
            return 'high';
        }

        if (message.includes('critical') || message.includes('fatal')) {
            return 'critical';
        }

        return 'medium';
    }, []);

    return {
        // Error state
        errorState,
        hasError: errorState.hasError,
        error: errorState.error,
        isRetrying: errorState.isRetrying,
        canRetry: errorState.canRetry,
        retryCount: errorState.retryCount,

        // Error handling functions
        handleError,
        clearError,
        retry,
        resetRetryCount,
        withErrorHandling,

        // Utility functions
        isRecoverableError,
        getUserFriendlyMessage,
        getErrorSeverity
    };
}