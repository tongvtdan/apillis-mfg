import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedSwitch } from '@/components/ui/enhanced-switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Modal } from '@/components/ui/modal';
import {
    Settings,
    Clock,
    Users,
    AlertTriangle,
    CheckCircle,
    X,
    Save,
    RotateCcw
} from 'lucide-react';

interface ReviewWorkflowConfig {
    autoAdvanceOnApproval: boolean;
    requireAllDepartments: boolean;
    enableRiskEscalation: boolean;
    slaHours: {
        engineering: number;
        qa: number;
        production: number;
    };
    escalationThreshold: number;
    autoAssignment: boolean;
    notificationSettings: {
        onReviewSubmitted: boolean;
        onReviewApproved: boolean;
        onReviewRejected: boolean;
        onRiskIdentified: boolean;
    };
}

interface ReviewConfigurationProps {
    projectId: string;
    onClose: () => void;
    onSave: (config: ReviewWorkflowConfig) => Promise<void>;
    // Modal mode props
    isOpen?: boolean;
}

const defaultConfig: ReviewWorkflowConfig = {
    autoAdvanceOnApproval: true,
    requireAllDepartments: true,
    enableRiskEscalation: true,
    slaHours: {
        engineering: 48,
        qa: 24,
        production: 72
    },
    escalationThreshold: 24,
    autoAssignment: true,
    notificationSettings: {
        onReviewSubmitted: true,
        onReviewApproved: true,
        onReviewRejected: true,
        onRiskIdentified: true
    }
};

export function ReviewConfiguration({ projectId, onClose, onSave, isOpen }: ReviewConfigurationProps) {
    const [config, setConfig] = useState<ReviewWorkflowConfig>(defaultConfig);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const updateConfig = (updates: Partial<ReviewWorkflowConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
        setHasChanges(true);
    };

    const updateSLA = (department: keyof typeof config.slaHours, value: number) => {
        updateConfig({
            slaHours: {
                ...config.slaHours,
                [department]: value
            }
        });
    };

    const updateNotification = (key: keyof typeof config.notificationSettings, value: boolean) => {
        updateConfig({
            notificationSettings: {
                ...config.notificationSettings,
                [key]: value
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(config);
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to save configuration:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setConfig(defaultConfig);
        setHasChanges(false);
    };

    // If in modal mode and not open, don't render
    if (isOpen !== undefined && !isOpen) return null;

    const configContent = (
        <div className="space-y-6">
            {/* Workflow Automation */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Workflow Automation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label className="font-medium">Auto-advance on Approval</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically advance project when all reviews are approved
                            </p>
                        </div>
                        <EnhancedSwitch
                            checked={config.autoAdvanceOnApproval}
                            onCheckedChange={(checked) => updateConfig({ autoAdvanceOnApproval: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label className="font-medium">Require All Departments</Label>
                            <p className="text-sm text-muted-foreground">
                                All departments must complete review before proceeding
                            </p>
                        </div>
                        <EnhancedSwitch
                            checked={config.requireAllDepartments}
                            onCheckedChange={(checked) => updateConfig({ requireAllDepartments: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label className="font-medium">Enable Risk Escalation</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically escalate high-risk items to management
                            </p>
                        </div>
                        <EnhancedSwitch
                            checked={config.enableRiskEscalation}
                            onCheckedChange={(checked) => updateConfig({ enableRiskEscalation: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label className="font-medium">Auto-assignment</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically assign reviews based on workload
                            </p>
                        </div>
                        <EnhancedSwitch
                            checked={config.autoAssignment}
                            onCheckedChange={(checked) => updateConfig({ autoAssignment: checked })}
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* SLA Configuration */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Service Level Agreements (SLA)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Engineering Review</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={config.slaHours.engineering}
                                onChange={(e) => updateSLA('engineering', parseInt(e.target.value) || 0)}
                                min="1"
                                max="168"
                            />
                            <span className="text-sm text-muted-foreground">hours</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>QA Review</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={config.slaHours.qa}
                                onChange={(e) => updateSLA('qa', parseInt(e.target.value) || 0)}
                                min="1"
                                max="168"
                            />
                            <span className="text-sm text-muted-foreground">hours</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Production Review</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={config.slaHours.production}
                                onChange={(e) => updateSLA('production', parseInt(e.target.value) || 0)}
                                min="1"
                                max="168"
                            />
                            <span className="text-sm text-muted-foreground">hours</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Escalation Threshold</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={config.escalationThreshold}
                            onChange={(e) => updateConfig({ escalationThreshold: parseInt(e.target.value) || 0 })}
                            min="1"
                            max="168"
                        />
                        <span className="text-sm text-muted-foreground">hours before escalation</span>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Notification Settings */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Notification Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label className="font-medium">Review Submitted</Label>
                            <p className="text-sm text-muted-foreground">
                                Notify when a review is submitted
                            </p>
                        </div>
                        <EnhancedSwitch
                            checked={config.notificationSettings.onReviewSubmitted}
                            onCheckedChange={(checked) => updateNotification('onReviewSubmitted', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label className="font-medium">Review Approved</Label>
                            <p className="text-sm text-muted-foreground">
                                Notify when a review is approved
                            </p>
                        </div>
                        <EnhancedSwitch
                            checked={config.notificationSettings.onReviewApproved}
                            onCheckedChange={(checked) => updateNotification('onReviewApproved', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label className="font-medium">Review Rejected</Label>
                            <p className="text-sm text-muted-foreground">
                                Notify when a review is rejected
                            </p>
                        </div>
                        <EnhancedSwitch
                            checked={config.notificationSettings.onReviewRejected}
                            onCheckedChange={(checked) => updateNotification('onReviewRejected', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label className="font-medium">Risk Identified</Label>
                            <p className="text-sm text-muted-foreground">
                                Notify when high risks are identified
                            </p>
                        </div>
                        <EnhancedSwitch
                            checked={config.notificationSettings.onRiskIdentified}
                            onCheckedChange={(checked) => updateNotification('onRiskIdentified', checked)}
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Unsaved Changes
                        </Badge>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={!hasChanges}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset to Default
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </div>
            </div>
        </div>
    );

    // If in modal mode, wrap with modal container
    if (isOpen) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Review Workflow Configuration
                    </div>
                }
            >
                {configContent}
            </Modal>
        );
    }

    // Return inline content (existing behavior)
    return configContent;
}
