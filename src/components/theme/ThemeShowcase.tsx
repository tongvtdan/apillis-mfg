import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
    Factory,
    Cpu,
    Zap,
    Shield,
    Gauge,
    Settings,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp
} from "lucide-react";

export function ThemeShowcase() {
    const { isDark, toggleMode } = useTheme();

    return (
        <div className="space-y-6 p-6">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-foreground">Factory Pulse Design System</h1>
                <p className="text-muted-foreground text-lg">
                    Modern • Clean • Minimalist • Professional • High Contrast • Role-Centric
                </p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                    "The Heartbeat of Modern Manufacturing" - A design system focused on usability,
                    readability on factory floor displays, and seamless responsive experience.
                </p>
                <Button onClick={toggleMode} className="btn-primary mt-6">
                    Switch to {isDark ? 'Light' : 'Dark'} Mode
                </Button>
            </div>

            {/* Color Palette */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cpu className="h-5 w-5" />
                        Color Palette
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <div className="h-16 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-medium">#03DAC6</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Primary - Teal/Cyan main brand</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 bg-secondary rounded-lg flex items-center justify-center">
                                <span className="text-secondary-foreground font-medium">#BB86FC</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Secondary - Purple actions</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 bg-accent rounded-lg flex items-center justify-center">
                                <span className="text-accent-foreground font-medium">#FFD740</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Accent - Amber highlights</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 bg-success rounded-lg flex items-center justify-center">
                                <span className="text-success-foreground font-medium">#4CAF50</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Success - Green states</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 bg-destructive rounded-lg flex items-center justify-center">
                                <span className="text-destructive-foreground font-medium">#CF6679</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Error - Pink-red critical</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Badges */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Factory className="h-5 w-5" />
                        Manufacturing Status System
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Badge className="status-inquiry">
                            <Clock className="h-3 w-3 mr-1" />
                            Inquiry Received
                        </Badge>
                        <Badge className="status-review">
                            <Settings className="h-3 w-3 mr-1" />
                            Technical Review
                        </Badge>
                        <Badge className="status-quote">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Quoted
                        </Badge>
                        <Badge className="status-production">
                            <Gauge className="h-3 w-3 mr-1" />
                            In Production
                        </Badge>
                        <Badge className="status-completed">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Priority System - Kanban Style */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Kanban Priority System
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="kanban-card priority-high">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span className="font-medium">Urgent Priority</span>
                                <Badge className="ml-auto bg-white/20 text-white border-white/30">Critical</Badge>
                            </div>
                            <p className="text-sm mt-2 opacity-90">High priority manufacturing task requiring immediate attention</p>
                        </div>
                        <div className="kanban-card priority-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                                <span className="font-medium">Medium Priority</span>
                                <Badge className="ml-auto bg-gray-800/20 text-gray-800 border-gray-800/30">Medium</Badge>
                            </div>
                            <p className="text-sm mt-2 opacity-80">Standard workflow task with normal processing time</p>
                        </div>
                        <div className="kanban-card priority-low">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span className="font-medium">Low Priority</span>
                                <Badge className="ml-auto bg-white/20 text-white border-white/30">Low</Badge>
                            </div>
                            <p className="text-sm mt-2 opacity-90">Non-urgent task that can be scheduled flexibly</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tech Elements */}
            <Card className="tech-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Technology Elements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-card border tech-glow">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-primary" />
                                <span className="font-medium">Precision Engineering</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Clean lines and precise measurements for manufacturing excellence.
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-card border manufacturing-grid">
                            <div className="flex items-center gap-2 mb-2">
                                <Factory className="h-4 w-4 text-accent" />
                                <span className="font-medium">Manufacturing Grid</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Structured layout reflecting industrial organization.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Typography System */}
            <Card>
                <CardHeader>
                    <CardTitle>Typography System - Inter Font Family</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-display text-foreground">Display - 3rem (48px)</h1>
                            <p className="text-xs text-muted-foreground">Font weight: 700 (Bold), Line height: 1.25 (Tight)</p>
                        </div>
                        <div>
                            <h1 className="text-heading-1 text-foreground">Heading 1 - 2.25rem (36px)</h1>
                            <p className="text-xs text-muted-foreground">Font weight: 700 (Bold), Line height: 1.25 (Tight)</p>
                        </div>
                        <div>
                            <h2 className="text-heading-2 text-foreground">Heading 2 - 1.875rem (30px)</h2>
                            <p className="text-xs text-muted-foreground">Font weight: 600 (Semibold), Line height: 1.25 (Tight)</p>
                        </div>
                        <div>
                            <h3 className="text-heading-3 text-foreground">Heading 3 - 1.5rem (24px)</h3>
                            <p className="text-xs text-muted-foreground">Font weight: 600 (Semibold), Line height: 1.25 (Tight)</p>
                        </div>
                        <div>
                            <p className="text-body text-foreground">Body text - 1rem (16px) - Inter Regular with 1.5 line height for optimal readability in manufacturing environments.</p>
                            <p className="text-xs text-muted-foreground">Font weight: 400 (Normal), Line height: 1.5 (Normal)</p>
                        </div>
                        <div>
                            <p className="text-small text-muted-foreground">Small text - 0.875rem (14px) - Used for secondary information and captions.</p>
                            <p className="text-xs text-muted-foreground">Font weight: 400 (Normal), Line height: 1.5 (Normal)</p>
                        </div>
                        <div>
                            <code className="font-mono text-sm bg-muted px-3 py-1 rounded-lg border">
                                RFQ-2024-001 - Space Mono for technical identifiers
                            </code>
                            <p className="text-xs text-muted-foreground mt-1">Monospace font for technical data and IDs</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Button System */}
            <Card>
                <CardHeader>
                    <CardTitle>Button System</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <button className="btn-primary">
                            Primary Button
                        </button>
                        <button className="btn-secondary">
                            Secondary Button
                        </button>
                        <button className="btn-outline">
                            Outline Button
                        </button>
                        <Button variant="destructive">
                            Destructive Action
                        </Button>
                    </div>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            Primary buttons use gradient backgrounds with hover animations.
                            All buttons follow the 0.5rem border radius and cubic-bezier(0.4, 0, 0.2, 1) transitions.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}