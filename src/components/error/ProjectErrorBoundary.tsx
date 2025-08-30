import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showErrorDetails?: boolean;
    context?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    retryCount: number;
}

/**
 * Error boundary specifically designed for project-related components
 * Provides graceful error handling with retry mechanisms and user-friendly fallbacks
 */
export class ProjectErrorBoundary extends Component<Props, State> {
    private maxRetries = 3;
    private retryTimeouts: NodeJS.Timeout[] = [];

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details
        console.error('ProjectErrorBoundary caught an error:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            context: this.props.context
        });

        // Update state with error info
        this.setState({
            error,
            errorInfo
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Show toast notification
        toast.error('An error occurred in the project component', {
            description: 'The component has been reset. Please try again.',
            action: {
                label: 'Retry',
                onClick: () => this.handleRetry()
            }
        });

        // Report error to monitoring service (if available)
        this.reportError(error, errorInfo);
    }

    componentWillUnmount() {
        // Clear any pending retry timeouts
        this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    }

    private reportError = (error: Error, errorInfo: ErrorInfo) => {
        // In a real application, you would send this to your error monitoring service
        // For now, we'll just log it with structured data
        const errorReport = {
            timestamp: new Date().toISOString(),
            context: this.props.context || 'ProjectErrorBoundary',
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            componentStack: errorInfo.componentStack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            retryCount: this.state.retryCount
        };

        console.error('Error Report:', errorReport);

        // TODO: Send to error monitoring service
        // Example: errorMonitoringService.captureException(error, errorReport);
    };

    private handleRetry = () => {
        const { retryCount } = this.state;

        if (retryCount >= this.maxRetries) {
            toast.error('Maximum retry attempts reached', {
                description: 'Please refresh the page or contact support if the problem persists.'
            });
            return;
        }

        // Exponential backoff for retries
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s

        toast.info(`Retrying in ${delay / 1000} seconds...`);

        const timeout = setTimeout(() => {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                retryCount: retryCount + 1
            });

            toast.success('Component reset successfully');
        }, delay);

        this.retryTimeouts.push(timeout);
    };

    private handleRefreshPage = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
        // Categorize errors by severity
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
            return 'medium';
        }
        if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
            return 'high';
        }
        if (error.name === 'TypeError' || error.name === 'ReferenceError') {
            return 'critical';
        }
        return 'medium';
    };

    private getErrorCategory = (error: Error): string => {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
            return 'Network Error';
        }
        if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
            return 'Code Loading Error';
        }
        if (error.name === 'TypeError') {
            return 'Type Error';
        }
        if (error.name === 'ReferenceError') {
            return 'Reference Error';
        }
        if (error.message.includes('database') || error.message.includes('supabase')) {
            return 'Database Error';
        }
        return 'Application Error';
    };

    private getUserFriendlyMessage = (error: Error): string => {
        const category = this.getErrorCategory(error);

        switch (category) {
            case 'Network Error':
                return 'Unable to connect to the server. Please check your internet connection and try again.';
            case 'Code Loading Error':
                return 'Failed to load application resources. This usually resolves with a page refresh.';
            case 'Database Error':
                return 'Unable to access project data. The database may be temporarily unavailable.';
            case 'Type Error':
            case 'Reference Error':
                return 'A technical error occurred in the application. Our team has been notified.';
            default:
                return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const { error } = this.state;
            const severity = error ? this.getErrorSeverity(error) : 'medium';
            const category = error ? this.getErrorCategory(error) : 'Application Error';
            const userMessage = error ? this.getUserFriendlyMessage(error) : 'An error occurred';
            const canRetry = this.state.retryCount < this.maxRetries;

            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                {category}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert variant={severity === 'critical' ? 'destructive' : 'default'}>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    {userMessage}
                                </AlertDescription>
                            </Alert>

                            {/* Error Context */}
                            {this.props.context && (
                                <div className="text-sm text-muted-foreground">
                                    <strong>Context:</strong> {this.props.context}
                                </div>
                            )}

                            {/* Retry Information */}
                            {this.state.retryCount > 0 && (
                                <div className="text-sm text-muted-foreground">
                                    <strong>Retry Attempts:</strong> {this.state.retryCount} of {this.maxRetries}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                {canRetry && (
                                    <Button onClick={this.handleRetry} variant="default">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Retry ({this.maxRetries - this.state.retryCount} attempts left)
                                    </Button>
                                )}

                                <Button onClick={this.handleRefreshPage} variant="outline">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh Page
                                </Button>

                                <Button onClick={this.handleGoHome} variant="outline">
                                    <Home className="h-4 w-4 mr-2" />
                                    Go Home
                                </Button>
                            </div>

                            {/* Technical Details (for development/debugging) */}
                            {this.props.showErrorDetails && error && (
                                <details className="mt-4">
                                    <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                                        <Bug className="h-4 w-4" />
                                        Technical Details
                                    </summary>
                                    <div className="mt-2 p-4 bg-muted rounded-md">
                                        <div className="space-y-2 text-sm font-mono">
                                            <div>
                                                <strong>Error:</strong> {error.name}
                                            </div>
                                            <div>
                                                <strong>Message:</strong> {error.message}
                                            </div>
                                            {error.stack && (
                                                <div>
                                                    <strong>Stack Trace:</strong>
                                                    <pre className="mt-1 text-xs overflow-auto max-h-32">
                                                        {error.stack}
                                                    </pre>
                                                </div>
                                            )}
                                            {this.state.errorInfo?.componentStack && (
                                                <div>
                                                    <strong>Component Stack:</strong>
                                                    <pre className="mt-1 text-xs overflow-auto max-h-32">
                                                        {this.state.errorInfo.componentStack}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </details>
                            )}

                            {/* Help Text */}
                            <div className="text-sm text-muted-foreground border-t pt-4">
                                <p>
                                    If this error persists, please try:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Refreshing the page</li>
                                    <li>Clearing your browser cache</li>
                                    <li>Checking your internet connection</li>
                                    <li>Contacting support with the error details above</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component to wrap components with ProjectErrorBoundary
 */
export function withProjectErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ProjectErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ProjectErrorBoundary>
    );

    WrappedComponent.displayName = `withProjectErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}