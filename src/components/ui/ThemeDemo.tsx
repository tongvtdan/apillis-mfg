import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

export const ThemeDemo: React.FC = () => {
    return (
        <div className="p-8 space-y-8 bg-background">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-foreground">
                    Factory Pulse Blue Theme System
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Updated theme system using the blue primary color (#1E40AF) from the landing page image reference.
                    This creates a cohesive, professional appearance for manufacturing environments.
                </p>
            </div>

            {/* Color Palette */}
            <Card>
                <CardHeader>
                    <CardTitle>Blue Color Palette</CardTitle>
                    <CardDescription>
                        Primary colors derived from the landing page image reference
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <div className="h-16 bg-blue-800 rounded-lg border"></div>
                            <p className="text-sm font-medium">Primary</p>
                            <p className="text-xs text-muted-foreground">#1E40AF</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 bg-blue-500 rounded-lg border"></div>
                            <p className="text-sm font-medium">Secondary</p>
                            <p className="text-xs text-muted-foreground">#3B82F6</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 bg-blue-400 rounded-lg border"></div>
                            <p className="text-sm font-medium">Accent</p>
                            <p className="text-xs text-muted-foreground">#60A5FA</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 bg-blue-100 rounded-lg border"></div>
                            <p className="text-sm font-medium">Light</p>
                            <p className="text-xs text-muted-foreground">#DBEAFE</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Button Variants */}
            <Card>
                <CardHeader>
                    <CardTitle>Button Variants</CardTitle>
                    <CardDescription>
                        All button variants now use the new blue theme system
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <Button variant="default">Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="outline">Outline Button</Button>
                        <Button variant="accent">Accent Button</Button>
                        <Button variant="ghost">Ghost Button</Button>
                        <Button variant="link">Link Button</Button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="default" size="sm">Small</Button>
                        <Button variant="default" size="default">Default</Button>
                        <Button variant="default" size="lg">Large</Button>
                        <Button variant="default" size="icon">🔍</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Status Colors */}
            <Card>
                <CardHeader>
                    <CardTitle>Status Colors</CardTitle>
                    <CardDescription>
                        Status indicators using the updated color system
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <Badge variant="default" className="bg-success text-success-foreground">
                            Success
                        </Badge>
                        <Badge variant="default" className="bg-warning text-warning-foreground">
                            Warning
                        </Badge>
                        <Badge variant="default" className="bg-destructive text-destructive-foreground">
                            Error
                        </Badge>
                        <Badge variant="default" className="bg-info text-info-foreground">
                            Info
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Item Styles */}
            <Card>
                <CardHeader>
                    <CardTitle>Selected Item Styles</CardTitle>
                    <CardDescription>
                        New selected item styles using the blue primary color
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg selected-item">
                            <h4 className="font-medium">Selected Item</h4>
                            <p className="text-sm text-muted-foreground">
                                Uses blue-100 background with blue-800 border
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                            <h4 className="font-medium text-blue-700">Light Blue Variant</h4>
                            <p className="text-sm text-blue-600">
                                Uses blue-50 background with blue-200 border
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg bg-blue-800 text-white">
                            <h4 className="font-medium">Primary Blue</h4>
                            <p className="text-sm text-blue-100">
                                Uses blue-800 background with white text
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Utility Classes */}
            <Card>
                <CardHeader>
                    <CardTitle>Utility Classes</CardTitle>
                    <CardDescription>
                        New utility classes for consistent blue theming
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="p-3 bg-primary-blue rounded text-white text-center">
                                .bg-primary-blue
                            </div>
                            <div className="p-3 border border-primary-blue rounded text-primary-blue text-center">
                                .border-primary-blue
                            </div>
                            <div className="p-3 ring-2 ring-primary-blue rounded text-center">
                                .ring-primary-blue
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="p-3 bg-blue-100 border border-blue-300 rounded text-blue-800 text-center">
                                .status-primary
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-center">
                                .status-secondary
                            </div>
                            <div className="p-3 bg-blue-800 text-white rounded text-center">
                                .active-state
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CSS Custom Properties */}
            <Card>
                <CardHeader>
                    <CardTitle>CSS Custom Properties</CardTitle>
                    <CardDescription>
                        The theme system uses CSS custom properties for consistent theming
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                        <div><span className="text-blue-600">--primary:</span> hsl(217 91% 33%)</div>
                        <div><span className="text-blue-600">--secondary:</span> hsl(217 91% 60%)</div>
                        <div><span className="text-blue-600">--accent:</span> hsl(217 91% 70%)</div>
                        <div><span className="text-blue-600">--ring:</span> hsl(217 91% 33%)</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ThemeDemo;
