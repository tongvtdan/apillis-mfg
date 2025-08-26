export interface ProjectCommunication {
    id: string;
    project_id: string;
    type: 'email' | 'chat' | 'comment' | 'notification';
    subject?: string;
    content: string;
    sender_id: string;
    sender_name: string;
    sender_email?: string;
    recipient_id?: string;
    recipient_name?: string;
    recipient_email?: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    read_at?: string;
    attachments?: CommunicationAttachment[];
    thread_id?: string; // For grouping related communications
    parent_id?: string; // For replies
}

export interface CommunicationAttachment {
    id: string;
    filename: string;
    file_size: number;
    file_type: string;
    file_url: string;
    uploaded_at: string;
}

export interface CommunicationThread {
    id: string;
    project_id: string;
    subject: string;
    participants: string[];
    last_message_at: string;
    message_count: number;
    is_archived: boolean;
    created_at: string;
}

export interface CommunicationTemplate {
    id: string;
    name: string;
    subject: string;
    content: string;
    type: 'email' | 'notification';
    category: 'rfq' | 'status_update' | 'general' | 'reminder';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
