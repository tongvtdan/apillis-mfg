import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi, notificationsApi } from '@/lib/api/messages';
import type { Message, Notification } from '@/types/message';
import { toast } from 'sonner';

export const useProjectMessages = (projectId: string) => {
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
  
  return useMutation({
    mutationFn: messagesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.project_id] });
      if (data.thread_id) {
        queryClient.invalidateQueries({ queryKey: ['thread-messages', data.thread_id] });
      }
      toast.success('Message sent successfully');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: messagesApi.markAsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.project_id] });
      if (data.thread_id) {
        queryClient.invalidateQueries({ queryKey: ['thread-messages', data.thread_id] });
      }
    },
  });
};

export const useUserNotifications = (userId: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationsApi.getByUserId(userId),
    enabled: !!userId,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', data.user_id] });
    },
    onError: () => {
      toast.error('Failed to create notification');
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', data.user_id] });
    },
  });
};