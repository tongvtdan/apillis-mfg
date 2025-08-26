import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MessageSquare,
    Mail,
    MessageCircle,
    Send,
    Plus,
    Paperclip,
    Clock,
    User,
    FileText,
    AlertCircle,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useProjectMessages, useCreateMessage } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectCommunicationProps {
    projectId: string;
    projectTitle: string;
}

const mockTemplates = [
    {
        id: '1',
        name: 'RFQ Follow-up',
        subject: 'Follow-up on RFQ - {Project Name}',
        content: 'Hi {Supplier Name},\n\nI wanted to follow up on the RFQ we sent for {Project Name}. Please let us know if you have any questions or if you need additional information.\n\nBest regards,\n{Your Name}',
        type: 'email' as const,
        category: 'rfq' as const
    },
    {
        id: '2',
        name: 'Status Update',
        subject: 'Project Status Update - {Project Name}',
        content: 'Hi {Customer Name},\n\nI wanted to provide you with an update on {Project Name}. We are currently in the {Current Stage} phase and everything is progressing well.\n\nPlease let me know if you have any questions.\n\nBest regards,\n{Your Name}',
        type: 'email' as const,
        category: 'status_update' as const
    }
];

export default function ProjectCommunication({ projectId, projectTitle }: ProjectCommunicationProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [newMessage, setNewMessage] = useState('');
    const [newSubject, setNewSubject] = useState('');
    const [messageType, setMessageType] = useState('message');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [showNewMessage, setShowNewMessage] = useState(false);

    const { user } = useAuth();
    const { data: messages = [], isLoading } = useProjectMessages(projectId);
    const createMessage = useCreateMessage();

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'read': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case 'delivered': return <Clock className="w-4 h-4 text-blue-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            urgent: 'bg-red-100 text-red-800 border-red-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            low: 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'email': return <Mail className="w-4 h-4" />;
            case 'chat': return <MessageCircle className="w-4 h-4" />;
            case 'comment': return <MessageSquare className="w-4 h-4" />;
            case 'notification': return <AlertCircle className="w-4 h-4" />;
            default: return <MessageSquare className="w-4 h-4" />;
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() && user) {
            await createMessage.mutateAsync({
                project_id: projectId,
                sender_id: user.id,
                sender_type: 'user',
                recipient_type: 'department',
                subject: newSubject || undefined,
                content: newMessage,
                message_type: messageType as any,
                priority: 'normal',
                is_read: false
            });
            setNewMessage('');
            setNewSubject('');
            setShowNewMessage(false);
        }
    };

    const handleTemplateSelect = (templateId: string) => {
        const template = mockTemplates.find(t => t.id === templateId);
        if (template) {
            setNewMessage(template.content);
            setSelectedTemplate(templateId);
        }
    };

    return (
        <div className="space-y-6">
            {/* Communication Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Communication Overview
                        </span>
                        <Button
                            onClick={() => setShowNewMessage(true)}
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Message
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <Mail className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                            <div className="text-2xl font-bold text-blue-600">
                                {messages.filter(m => m.message_type === 'message' && m.subject).length}
                            </div>
                            <div className="text-sm text-blue-600">Messages</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <MessageCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                            <div className="text-2xl font-bold text-green-600">
                                {messages.filter(m => m.message_type === 'message' && !m.subject).length}
                            </div>
                            <div className="text-sm text-green-600">Quick Messages</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <MessageSquare className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                            <div className="text-2xl font-bold text-purple-600">
                                {messages.filter(m => m.message_type === 'notification').length}
                            </div>
                            <div className="text-sm text-purple-600">Notifications</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <AlertCircle className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                            <div className="text-2xl font-bold text-orange-600">
                                {messages.filter(m => !m.is_read).length}
                            </div>
                            <div className="text-sm text-orange-600">Unread</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Communication Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Communication History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">All</TabsTrigger>
                            <TabsTrigger value="emails">Emails</TabsTrigger>
                            <TabsTrigger value="chat">Chat</TabsTrigger>
                            <TabsTrigger value="comments">Comments</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                                    <p>Loading messages...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                                    <p>No messages yet</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div key={message.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(message.message_type)}
                                                <Badge variant="outline" className={getPriorityColor(message.priority)}>
                                                    {message.priority}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                                                </span>
                                            </div>
                                            {getStatusIcon(message.is_read ? 'read' : 'delivered')}
                                        </div>

                                        {message.subject && (
                                            <h4 className="font-medium mb-2">{message.subject}</h4>
                                        )}

                                        <p className="text-sm text-muted-foreground mb-3">{message.content}</p>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3" />
                                                <span>Sender ID: {message.sender_id}</span>
                                            </div>
                                            {message.recipient_id && (
                                                <div className="flex items-center gap-2">
                                                    <span>To: {message.recipient_id}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="emails" className="space-y-4">
                            <div className="text-center py-8 text-muted-foreground">
                                <Mail className="w-12 h-12 mx-auto mb-4" />
                                <p>Email communications will be displayed here</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="chat" className="space-y-4">
                            <div className="text-center py-8 text-muted-foreground">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                                <p>Chat messages will be displayed here</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="comments" className="space-y-4">
                            <div className="text-center py-8 text-muted-foreground">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                                <p>Project comments will be displayed here</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* New Message Modal */}
            {showNewMessage && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            New Message
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="template">Use Template</Label>
                                <select
                                    id="template"
                                    value={selectedTemplate}
                                    onChange={(e) => handleTemplateSelect(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="">Select a template...</option>
                                    {mockTemplates.map((template) => (
                                        <option key={template.id} value={template.id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="type">Message Type</Label>
                                <select
                                    id="type"
                                    value={messageType}
                                    onChange={(e) => setMessageType(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="message">Message</option>
                                    <option value="notification">Notification</option>
                                    <option value="alert">Alert</option>
                                    <option value="reminder">Reminder</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input 
                                id="subject" 
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                placeholder="Message subject..." 
                            />
                        </div>

                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message here..."
                                rows={6}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Paperclip className="w-4 h-4 mr-2" />
                                Attach Files
                            </Button>
                            <div className="flex-1" />
                            <Button variant="outline" onClick={() => setShowNewMessage(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                <Send className="w-4 h-4 mr-2" />
                                Send Message
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
