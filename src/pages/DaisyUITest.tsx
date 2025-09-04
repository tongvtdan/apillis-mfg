import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '@/components/ui/modal';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
    Sun,
    Moon,
    Monitor,
    CheckCircle,
    AlertTriangle,
    Info,
    XCircle,
    Plus,
    Settings,
    User,
    FileText,
    Calendar,
    DollarSign
} from 'lucide-react';

export const DaisyUITestPage: React.FC = () => {
    const [showModal, setShowModal] = React.useState(false);

    return (
        <div className="min-h-screen bg-base-100 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">DaisyUI Theme Test</h1>
                        <p className="text-base-content/70">Testing all components with light/dark theme support</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle variant="button" showLabel />
                        <Button variant="outline" onClick={() => setShowModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Open Modal
                        </Button>
                    </div>
                </div>

                {/* Theme Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Current Theme Status
                        </CardTitle>
                        <CardDescription>
                            Verify that all components adapt properly to the current theme
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-base-200 rounded-lg">
                                <Sun className="h-8 w-8 mx-auto mb-2 text-warning" />
                                <h3 className="font-semibold">Light Theme</h3>
                                <p className="text-sm text-base-content/70">Clean, bright interface</p>
                            </div>
                            <div className="text-center p-4 bg-base-200 rounded-lg">
                                <Moon className="h-8 w-8 mx-auto mb-2 text-info" />
                                <h3 className="font-semibold">Dark Theme</h3>
                                <p className="text-sm text-base-content/70">Easy on the eyes</p>
                            </div>
                            <div className="text-center p-4 bg-base-200 rounded-lg">
                                <Monitor className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <h3 className="font-semibold">System Theme</h3>
                                <p className="text-sm text-base-content/70">Follows OS preference</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Buttons Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Button Variants</CardTitle>
                        <CardDescription>All button styles with DaisyUI classes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="default">Primary Button</Button>
                            <Button variant="secondary">Secondary Button</Button>
                            <Button variant="outline">Outline Button</Button>
                            <Button variant="ghost">Ghost Button</Button>
                            <Button variant="destructive">Destructive Button</Button>
                            <Button variant="link">Link Button</Button>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <Button size="sm">Small</Button>
                            <Button size="default">Default</Button>
                            <Button size="lg">Large</Button>
                            <Button size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Form Elements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Form Elements</CardTitle>
                        <CardDescription>Input fields and form controls</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text">Text Input</span>
                                </label>
                                <Input placeholder="Enter text here..." />
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text">Select Dropdown</span>
                                </label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="option1">Option 1</SelectItem>
                                        <SelectItem value="option2">Option 2</SelectItem>
                                        <SelectItem value="option3">Option 3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label className="label">
                                <span className="label-text">Textarea</span>
                            </label>
                            <textarea className="textarea textarea-bordered w-full min-h-24" placeholder="Enter long text here..."></textarea>
                        </div>
                    </CardContent>
                </Card>

                {/* Badges and Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Badge Variants</CardTitle>
                            <CardDescription>Status indicators and labels</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="default">Default</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="destructive">Error</Badge>
                                <Badge variant="outline">Outline</Badge>
                                <Badge variant="success">Success</Badge>
                                <Badge variant="warning">Warning</Badge>
                                <Badge variant="info">Info</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <Badge size="sm">Small</Badge>
                                <Badge size="default">Default</Badge>
                                <Badge size="lg">Large</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Alert Messages</CardTitle>
                            <CardDescription>Notification and status messages</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert variant="default">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Information</AlertTitle>
                                <AlertDescription>
                                    This is an informational message with DaisyUI styling.
                                </AlertDescription>
                            </Alert>
                            <Alert variant="success">
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>
                                    Operation completed successfully!
                                </AlertDescription>
                            </Alert>
                            <Alert variant="warning">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>
                                    Please review your input before proceeding.
                                </AlertDescription>
                            </Alert>
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    Something went wrong. Please try again.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,234</div>
                            <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">89</div>
                            <p className="text-xs text-muted-foreground">
                                +12.3% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">
                                -5.2% from yesterday
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$45,231</div>
                            <p className="text-xs text-muted-foreground">
                                +180.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Modal */}
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                    <ModalHeader>
                        <ModalTitle>DaisyUI Modal Test</ModalTitle>
                    </ModalHeader>
                    <ModalContent>
                        <p className="text-base-content/70">
                            This modal demonstrates DaisyUI modal styling with proper theme support.
                            The background, text, and borders should adapt to the current theme.
                        </p>
                        <div className="mt-4 p-4 bg-base-200 rounded-lg">
                            <p className="text-sm">
                                This is a themed content area within the modal.
                            </p>
                        </div>
                    </ModalContent>
                    <ModalFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setShowModal(false)}>
                            Confirm
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        </div>
    );
};

export default DaisyUITestPage;
