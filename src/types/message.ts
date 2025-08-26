export interface Message {
  id: string;
  project_id: string;
  thread_id?: string;
  sender_id?: string;
  sender_type: 'user' | 'contact' | 'system';
  recipient_type: 'user' | 'contact' | 'department' | 'role';
  recipient_id?: string;
  recipient_role?: string;
  recipient_department?: string;
  subject?: string;
  content: string;
  message_type: 'message' | 'notification' | 'alert' | 'reminder' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  read_at?: string;
  attachments?: any[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  project_id?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  read_at?: string;
  delivery_method: 'in_app' | 'email' | 'sms' | 'push';
  delivered_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}