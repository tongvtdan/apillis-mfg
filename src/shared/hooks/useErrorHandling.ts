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
 * Shared error handling hook for consistent error management across the application
 * Provides retry logic, error logging, and user-friendly error messages
 */
export function useErrorHandling(options: ErrorHandlingOptions = {}) {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        showToast = true,
        logError = true,
        context = 'Unknown',
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

    const retryTimeoutRef = useRef<NodeJS.Timeout>();

    const handleError = useCallback((error: Error, errorContext?: string) => {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const actualContext = errorContext || context;

        if (logError) {
            console.error(`[${actualContext}] Error occurred:`, error);
        }

        setErrorState(prev => ({
            ...prev,
            hasError: true,
            error,
            errorId,
            context: actualContext,
            canRetry: prev.retryCount < maxRetries
        }));

        if (showToast) {
            const formattedError = formatDatabaseError(error);
            toast.error(formattedError.title, {
                description: formattedError.description,
                action: errorState.canRetry ? {
                    label: 'Retry',
                    onClick: () => retry()
                } : undefined
            });
        }

        onError?.(error, actualContext);
    }, [context, logError, showToast, maxRetries, errorState.canRetry, onError]);

    const clearError = useCallback(() => {
        setErrorState({
            hasError: false,
            error: null,
            errorId: null,
            context: null,
            retryCount: 0,
            isRetrying: false,
            canRetry: true
        });

        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
        }
    }, []);

    const retry = useCallback((retryOptions: RetryOptions = {}) => {
        const { immediate = false, resetRetryCount = false } = retryOptions;

        if (!errorState.canRetry && !resetRetryCount) {
            console.warn('Maximum retry attempts reached');
            return;
        }

        setErrorState(prev => ({
            ...prev,
            isRetrying: true,
            retryCount: resetRetryCount ? 0 : prev.retryCount + 1,
            canRetry: (resetRetryCount ? 0 : prev.retryCount + 1) < maxRetries
        }));

        onRetry?.(resetRetryCount ? 0 : errorState.retryCount + 1);

        const executeRetry = () => {
            setErrorState(prev => ({
                ...prev,
                isRetrying: false,
                hasError: false,
                error: null
            }));
        };

        if (immediate) {
            executeRetry();
        } else {
            retryTimeoutRef.current = setTimeout(executeRetry, retryDelay);
        }
    }, [errorState.canRetry, errorState.retryCount, maxRetries, retryDelay, onRetry]);

    const reset = useCallback(() => {
        clearError();
    }, [clearError]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    // Check if max retries reached
    useEffect(() => {
        if (errorState.retryCount >= maxRetries && errorState.hasError) {
            onMaxRetriesReached?.(errorState.error!);
        }
    }, [errorState.retryCount, errorState.hasError, errorState.error, maxRetries, onMaxRetriesReached]);

    return {
        errorState,
        handleError,
        clearError,
        retry,
        reset,
        isRetrying: errorState.isRetrying,
        canRetry: errorState.canRetry,
        retryCount: errorState.retryCount
    };
}
