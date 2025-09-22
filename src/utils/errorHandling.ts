import { toast } from '@/hooks/use-toast';

interface ErrorOptions {
    showToast?: boolean;
    toastTitle?: string;
    toastDescription?: string;
}

export function handleError(error: unknown, options: ErrorOptions = {}) {
    const {
        showToast = true,
        toastTitle = 'Error',
        toastDescription = 'An error occurred. Please try again.'
    } = options;

    console.error(error);

    if (showToast) {
        toast({
            title: toastTitle,
            description: toastDescription,
            variant: 'destructive'
        });
    }
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}
