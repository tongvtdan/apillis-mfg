import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

export const ThemeDemo: React.FC = () => {
    return (
        <div className="p-8 space-y-8 bg-background">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-foreground">
                    Factory Pulse Teal/Cyan Theme System
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Updated theme system using the vibrant teal/cyan blue color (#0EA5E9) from the landing page image reference.
                    This creates a cohesive, professional appearance with subtle gradients for manufacturing environments.
                </p>
            </div>

            {/* Color Palette */}
            <Card>
                <CardHeader>
                    <CardTitle>Teal/Cyan Color Palette</CardTitle>
                    <CardDescription>
                        Primary colors derived from the landing page image reference with gradient support
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <div className="h-16 bg-gradient-to-b from-sky-400 to-sky-600 rounded-lg border"></div>
                            <p className="text-sm font-medium">Primary</p>
                            <p className="text-xs text-muted-foreground">#0EA5E9 (Gradient)</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 bg-gradient-to-b from-sky-300 to-sky-500 rounded-lg border"></div>
                            <p className="text-sm font-medium">Secondary</p>
                            <p className="text-xs text-muted-foreground">#38BDF8 (Gradient)</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 bg-gradient-to-b from-sky-200 to-sky-400 rounded-lg border"></div>
                            <p className="text-sm font-medium">Accent</p>
                            <p className="text-xs text-muted-foreground">#7DD3FC (Gradient)</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 bg-sky-100 rounded-lg border"></div>
                            <p className="text-sm font-medium">Light</p>
                            <p className="text-xs text-muted-foreground">#E0F2FE</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Button Variants */}
            <Card>
                <CardHeader>
                    <CardTitle>Button Variants with Gradients</CardTitle>
                    <CardDescription>
                        All button variants now use the new teal/cyan theme system with subtle vertical gradients
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
                        New selected item styles using the teal/cyan primary color
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg selected-item">
                            <h4 className="font-medium">Selected Item</h4>
                            <p className="text-sm text-muted-foreground">
                                Uses sky-100 background with sky-500 border
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg bg-sky-50 border-sky-200">
                            <h4 className="font-medium text-sky-700">Light Teal Variant</h4>
                            <p className="text-sm text-sky-600">
                                Uses sky-50 background with sky-200 border
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg bg-gradient-to-b from-sky-500 to-sky-600 text-white">
                            <h4 className="font-medium">Primary Teal</h4>
                            <p className="text-sm text-sky-100">
                                Uses gradient background with white text
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
                        New utility classes for consistent teal/cyan theming with gradients
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="p-3 bg-primary-teal rounded text-white text-center">
                                .bg-primary-teal
                            </div>
                            <div className="p-3 border border-primary-teal rounded text-primary-teal text-center">
                                .border-primary-teal
                            </div>
                            <div className="p-3 ring-2 ring-primary-teal rounded text-center">
                                .ring-primary-teal
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="p-3 bg-sky-100 border border-sky-300 rounded text-sky-800 text-center">
                                .status-primary
                            </div>
                            <div className="p-3 bg-sky-50 border border-sky-200 rounded text-sky-700 text-center">
                                .status-secondary
                            </div>
                            <div className="p-3 bg-gradient-to-b from-sky-500 to-sky-600 text-white rounded text-center">
                                .active-state
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Gradient Utilities */}
            <Card>
                <CardHeader>
                    <CardTitle>Gradient Utilities</CardTitle>
                    <CardDescription>
                        New gradient utility classes for consistent button styling
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg gradient-primary text-white text-center">
                            <h4 className="font-medium">.gradient-primary</h4>
                            <p className="text-sm text-sky-100">
                                Primary gradient button style
                            </p>
                        </div>
                        <div className="p-4 rounded-lg gradient-secondary text-white text-center">
                            <h4 className="font-medium">.gradient-secondary</h4>
                            <p className="text-sm text-sky-100">
                                Secondary gradient button style
                            </p>
                        </div>
                        <div className="p-4 rounded-lg gradient-accent text-sky-900 text-center">
                            <h4 className="font-medium">.gradient-accent</h4>
                            <p className="text-sm text-sky-800">
                                Accent gradient button style
                            </p>
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
                        <div><span className="text-sky-600">--primary:</span> hsl(199 89% 48%)</div>
                        <div><span className="text-sky-600">--secondary:</span> hsl(199 89% 58%)</div>
                        <div><span className="text-sky-600">--accent:</span> hsl(199 89% 68%)</div>
                        <div><span className="text-sky-600">--ring:</span> hsl(199 89% 48%)</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ThemeDemo;
