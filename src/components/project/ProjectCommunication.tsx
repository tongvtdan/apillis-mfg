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
import { ProjectCommunication as CommunicationType } from "@/types/communication";

interface ProjectCommunicationProps {
    projectId: string;
    projectTitle: string;
}

// Mock data for demonstration
const mockCommunications: CommunicationType[] = [
    {
        id: '1',
        project_id: 'project-1',
        type: 'email',
        subject: 'RFQ Follow-up - Sensor Mount Project',
        content: 'Hi team, I wanted to follow up on the RFQ we sent last week. Have we received any responses from suppliers? We need to move forward with this project quickly.',
        sender_id: 'user-1',
        sender_name: 'Sarah Lee',
        sender_email: 'sarah.lee@company.com',
        status: 'read',
        priority: 'high',
        created_at: '2025-01-25T10:30:00Z',
        read_at: '2025-01-25T11:15:00Z'
    },
    {
        id: '2',
        project_id: 'project-1',
        type: 'comment',
        content: 'Engineering review completed. All specifications look good. Ready to proceed to supplier RFQ phase.',
        sender_id: 'user-2',
        sender_name: 'Minh Nguyen',
        sender_email: 'minh.nguyen@company.com',
        status: 'read',
        priority: 'medium',
        created_at: '2025-01-24T16:45:00Z',
        read_at: '2025-01-24T17:00:00Z'
    },
    {
        id: '3',
        project_id: 'project-1',
        type: 'chat',
        content: 'Customer is asking about lead time. Can we expedite this project?',
        sender_id: 'user-3',
        sender_name: 'Anna Chen',
        sender_email: 'anna.chen@company.com',
        status: 'delivered',
        priority: 'urgent',
        created_at: '2025-01-25T09:15:00Z'
    }
];

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
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [showNewMessage, setShowNewMessage] = useState(false);

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

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            // TODO: Implement actual message sending
            console.log('Sending message:', newMessage);
            setNewMessage('');
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
                            <div className="text-2xl font-bold text-blue-600">12</div>
                            <div className="text-sm text-blue-600">Emails</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <MessageCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                            <div className="text-2xl font-bold text-green-600">8</div>
                            <div className="text-sm text-green-600">Chat Messages</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <MessageSquare className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                            <div className="text-2xl font-bold text-purple-600">15</div>
                            <div className="text-sm text-purple-600">Comments</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <AlertCircle className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                            <div className="text-2xl font-bold text-orange-600">3</div>
                            <div className="text-sm text-orange-600">Pending</div>
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
                            {mockCommunications.map((comm) => (
                                <div key={comm.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(comm.type)}
                                            <Badge variant="outline" className={getPriorityColor(comm.priority)}>
                                                {comm.priority}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {format(new Date(comm.created_at), 'MMM dd, yyyy HH:mm')}
                                            </span>
                                        </div>
                                        {getStatusIcon(comm.status)}
                                    </div>

                                    {comm.subject && (
                                        <h4 className="font-medium mb-2">{comm.subject}</h4>
                                    )}

                                    <p className="text-sm text-muted-foreground mb-3">{comm.content}</p>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            <span>{comm.sender_name}</span>
                                            {comm.sender_email && (
                                                <span>({comm.sender_email})</span>
                                            )}
                                        </div>
                                        {comm.recipient_name && (
                                            <div className="flex items-center gap-2">
                                                <span>To:</span>
                                                <span>{comm.recipient_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
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
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="email">Email</option>
                                    <option value="chat">Chat</option>
                                    <option value="comment">Comment</option>
                                    <option value="notification">Notification</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="Message subject..." />
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
