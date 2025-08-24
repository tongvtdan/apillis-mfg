import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, Calendar, Users, AlertTriangle, RefreshCw } from "lucide-react";

export default function ProjectDetailTest() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Test Header */}
            <div className="border-b bg-background/95 backdrop-blur">
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" onClick={() => navigate('/projects')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Projects
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Project: P-25082001 – Test Project
                                </h1>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center">
                                        Status: <Badge className="ml-2 bg-blue-100 text-blue-800">
                                            Inquiry Received
                                        </Badge>
                                    </span>
                                    <span className="flex items-center">
                                        Priority: <Badge className="ml-2 bg-orange-100 text-orange-800">
                                            HIGH
                                        </Badge>
                                    </span>
                                </div>
                                <div className="flex items-center space-x-6 mt-2 text-sm text-muted-foreground">
                                    <span className="flex items-center">
                                        <Building2 className="w-4 h-4 mr-1" />
                                        Customer: TechCorp Industries
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Created: Aug 23, 2025
                                    </span>
                                    <span className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        Owner: Sarah Johnson
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex">
                {/* Navigation Sidebar */}
                <div className="w-48 border-r bg-muted/30 min-h-screen">
                    <div className="p-4">
                        <nav className="space-y-2">
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground">
                                Overview
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                                Documents
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                                Reviews
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                                Supplier
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                                Timeline
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                                Analytics
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                                Settings
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>PROJECT DETAILS</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Title:</label>
                                    <p className="mt-1">Advanced IoT Sensor System</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Volume:</label>
                                    <p className="mt-1">5,000 pcs</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description:</label>
                                <p className="mt-1">High-precision mount for industrial sensors</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Target Price:</label>
                                    <p className="mt-1">$8.50/unit</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Delivery:</label>
                                    <p className="mt-1">Oct 15, 2025</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Notes:</label>
                                <p className="mt-1">Customer open to alternative materials</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Debug Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Project ID from URL: {id}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    This is a test version of the Project Detail page to ensure basic rendering works.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}