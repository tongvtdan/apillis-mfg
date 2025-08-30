import { toast } from 'sonner';

export interface RetryConfig {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
    jitter: boolean;
    retryCondition?: (error: Error) => boolean;
    onRetry?: (attempt: number, error: Error) => void;
    onMaxAttemptsReached?: (error: Error) => void;
}

export interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    attempts: number;
    totalTime: number;
}

/**
 * Comprehensive retry service with exponential backoff, jitter, and configurable conditions
 */
export class RetryService {
    private static defaultConfig: RetryConfig = {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
        jitter: true,
        retryCondition: (error: Error) => {
            // Default retry condition - retry on network/server errors
            const message = error.message.toLowerCase();
            return (
                message.includes('network') ||
                message.includes('timeout') ||
                message.includes('connection') ||
                message.includes('500') ||
                message.includes('502') ||
                message.includes('503') ||
                message.includes('504') ||
                message.includes('rate limit')
            );
        }
    };

    /**
     * Execute an operation with retry logic
     */
    static async execute<T>(
        operation: () => Promise<T>,
        config: Partial<RetryConfig> = {}
    ): Promise<RetryResult<T>> {
        const finalConfig = { ...this.defaultConfig, ...config };
        const startTime = Date.now();
        let lastError: Error;
        let attempts = 0;

        for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
            attempts = attempt;

            try {
                const result = await operation();
                const totalTime = Date.now() - startTime;

                return {
                    success: true,
                    data: result,
                    attempts,
                    totalTime
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                // Call retry callback if provided
                if (finalConfig.onRetry) {
                    finalConfig.onRetry(attempt, lastError);
                }

                // Don't retry on the last attempt
                if (attempt === finalConfig.maxAttempts) {
                    break;
                }

                // Check if we should retry this error
                if (finalConfig.retryCondition && !finalConfig.retryCondition(lastError)) {
                    console.log(`Not retrying error: ${lastError.message} (doesn't match retry condition)`);
                    break;
                }

                // Calculate delay with exponential backoff
                let delay = Math.min(
                    finalConfig.baseDelay * Math.pow(finalConfig.backoffFactor, attempt - 1),
                    finalConfig.maxDelay
                );

                // Add jitter to prevent thundering herd
                if (finalConfig.jitter) {
                    delay += Math.random() * 1000;
                }

                console.log(`Retry attempt ${attempt}/${finalConfig.maxAttempts} after ${delay}ms delay`);

                await this.sleep(delay);
            }
        }

        // Call max attempts callback if provided
        if (finalConfig.onMaxAttemptsReached) {
            finalConfig.onMaxAttemptsReached(lastError!);
        }

        const totalTime = Date.now() - startTime;

        return {
            success: false,
            error: lastError!,
            attempts,
            totalTime
        };
    }

    /**
     * Execute with automatic toast notifications
     */
    static async executeWithToast<T>(
        operation: () => Promise<T>,
        config: Partial<RetryConfig> & {
            operationName?: string;
            showRetryToasts?: boolean;
            showSuccessToast?: boolean;
            showErrorToast?: boolean;
        } = {}
    ): Promise<RetryResult<T>> {
        const {
            operationName = 'Operation',
            showRetryToasts = true,
            showSuccessToast = true,
            showErrorToast = true,
            ...retryConfig
        } = config;

        const enhancedConfig: Partial<RetryConfig> = {
            ...retryConfig,
            onRetry: (attempt, error) => {
                if (showRetryToasts) {
                    toast.info(`${operationName} failed, retrying...`, {
                        description: `Attempt ${attempt}/${retryConfig.maxAttempts || 3}: ${error.message}`
                    });
                }
                retryConfig.onRetry?.(attempt, error);
            },
            onMaxAttemptsReached: (error) => {
                if (showErrorToast) {
                    toast.error(`${operationName} failed`, {
                        description: `Maximum retry attempts reached: ${error.message}`
                    });
                }
                retryConfig.onMaxAttemptsReached?.(error);
            }
        };

        const result = await this.execute(operation, enhancedConfig);

        if (result.success && showSuccessToast) {
            toast.success(`${operationName} completed successfully`);
        }

        return result;
    }

    /**
     * Create a retry wrapper for a function
     */
    static createRetryWrapper<T extends any[], R>(
        fn: (...args: T) => Promise<R>,
        config: Partial<RetryConfig> = {}
    ): (...args: T) => Promise<R> {
        return async (...args: T): Promise<R> => {
            const result = await this.execute(() => fn(...args), config);

            if (result.success) {
                return result.data!;
            } else {
                throw result.error!;
            }
        };
    }

    /**
     * Batch retry operations with different strategies
     */
    static async executeBatch<T>(
        operations: Array<{
            operation: () => Promise<T>;
            config?: Partial<RetryConfig>;
            name?: string;
        }>,
        strategy: 'parallel' | 'sequential' | 'failFast' = 'parallel'
    ): Promise<Array<RetryResult<T>>> {
        switch (strategy) {
            case 'parallel':
                return Promise.all(
                    operations.map(({ operation, config }) =>
                        this.execute(operation, config)
                    )
                );

            case 'sequential':
                const results: Array<RetryResult<T>> = [];
                for (const { operation, config } of operations) {
                    const result = await this.execute(operation, config);
                    results.push(result);
                }
                return results;

            case 'failFast':
                const failFastResults: Array<RetryResult<T>> = [];
                for (const { operation, config, name } of operations) {
                    const result = await this.execute(operation, config);
                    failFastResults.push(result);

                    if (!result.success) {
                        console.error(`Batch operation failed at step: ${name || 'unnamed'}`);
                        break;
                    }
                }
                return failFastResults;

            default:
                throw new Error(`Unknown batch strategy: ${strategy}`);
        }
    }

    /**
     * Circuit breaker pattern implementation
     */
    static createCircuitBreaker<T extends any[], R>(
        fn: (...args: T) => Promise<R>,
        options: {
            failureThreshold: number;
            resetTimeout: number;
            monitoringPeriod: number;
        } = {
                failureThreshold: 5,
                resetTimeout: 60000,
                monitoringPeriod: 10000
            }
    ): (...args: T) => Promise<R> {
        let failures = 0;
        let lastFailureTime = 0;
        let state: 'closed' | 'open' | 'half-open' = 'closed';

        return async (...args: T): Promise<R> => {
            const now = Date.now();

            // Reset failures if monitoring period has passed
            if (now - lastFailureTime > options.monitoringPeriod) {
                failures = 0;
            }

            // Check circuit breaker state
            if (state === 'open') {
                if (now - lastFailureTime > options.resetTimeout) {
                    state = 'half-open';
                    console.log('Circuit breaker: half-open state');
                } else {
                    throw new Error('Circuit breaker is open - operation blocked');
                }
            }

            try {
                const result = await fn(...args);

                // Success - reset circuit breaker
                if (state === 'half-open') {
                    state = 'closed';
                    failures = 0;
                    console.log('Circuit breaker: closed state (recovered)');
                }

                return result;
            } catch (error) {
                failures++;
                lastFailureTime = now;

                if (failures >= options.failureThreshold) {
                    state = 'open';
                    console.log('Circuit breaker: open state (too many failures)');
                }

                throw error;
            }
        };
    }

    /**
     * Sleep utility
     */
    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get retry statistics for monitoring
     */
    static getRetryStats(results: Array<RetryResult<any>>): {
        totalOperations: number;
        successfulOperations: number;
        failedOperations: number;
        averageAttempts: number;
        averageTime: number;
        successRate: number;
    } {
        const totalOperations = results.length;
        const successfulOperations = results.filter(r => r.success).length;
        const failedOperations = totalOperations - successfulOperations;
        const averageAttempts = results.reduce((sum, r) => sum + r.attempts, 0) / totalOperations;
        const averageTime = results.reduce((sum, r) => sum + r.totalTime, 0) / totalOperations;
        const successRate = (successfulOperations / totalOperations) * 100;

        return {
            totalOperations,
            successfulOperations,
            failedOperations,
            averageAttempts,
            averageTime,
            successRate
        };
    }
}