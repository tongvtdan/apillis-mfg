import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi, notificationsApi } from '@/lib/api/messages';
import type { Message, Notification } from '@/types/message';
import { useToast } from '@/shared/hooks/use-toast';

export const useProjectMessages = (projectId: string) => {
    const { toast } = useToast();

    return useQuery({
        queryKey: ['messages', projectId],
        queryFn: () => messagesApi.getByProjectId(projectId),
        enabled: !!projectId,
    });
};

export const useThreadMessages = (threadId: string) => {
    return useQuery({
        queryKey: ['thread-messages', threadId],
        queryFn: () => messagesApi.getByThreadId(threadId),
        enabled: !!threadId,
    });
};

export const useCreateMessage = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: messagesApi.create,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['messages', data.project_id] });
            if (data.thread_id) {
                queryClient.invalidateQueries({ queryKey: ['thread-messages', data.thread_id] });
            }
            toast({
                title: "Message Sent",
                description: "Your message has been sent successfully."
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Send Failed",
                description: error instanceof Error ? error.message : 'Failed to send message.'
            });
        },
    });
};

export const useMarkMessageAsRead = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: messagesApi.markAsRead,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['messages', data.project_id] });
            if (data.thread_id) {
                queryClient.invalidateQueries({ queryKey: ['thread-messages', data.thread_id] });
            }
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to mark message as read."
            });
        },
    });
};

export const useNotifications = (userId: string) => {
    return useQuery({
        queryKey: ['notifications', userId],
        queryFn: () => notificationsApi.getByUserId(userId),
        enabled: !!userId,
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: notificationsApi.markAsRead,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['notifications', data.user_id] });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to mark notification as read."
            });
        },
    });
};
