// Google Drive Configuration Panel
// Allows administrators to configure Google Drive integration

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleDriveConfig {
    id?: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    is_active: boolean;
}

export const GoogleDriveConfigPanel: React.FC = () => {
    const { profile } = useAuth();
    const [config, setConfig] = useState<GoogleDriveConfig>({
        client_id: '',
        client_secret: '',
        redirect_uri: `${window.location.origin}/auth/google/callback`,
        is_active: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    // Load existing configuration
    useEffect(() => {
        const loadConfig = async () => {
            if (!profile?.organization_id) return;

            try {
                const { data, error } = await supabase
                    .from('google_drive_config')
                    .select('*')
                    .eq('organization_id', profile.organization_id)
                    .eq('is_active', true)
                    .single();

                if (data && !error) {
                    setConfig(data);
                } else {
                    // Check environment variables as fallback
                    const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
                    const envClientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;

                    if (envClientId || envClientSecret) {
                        setConfig(prev => ({
                            ...prev,
                            client_id: envClientId || '',
                            client_secret: envClientSecret || ''
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to load Google Drive config:', error);
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, [profile?.organization_id]);

    const handleSave = async () => {
        if (!profile?.organization_id) return;

        setSaving(true);
        try {
            const configData = {
                organization_id: profile.organization_id,
                client_id: config.client_id,
                client_secret: config.client_secret,
                redirect_uri: config.redirect_uri,
                is_active: config.is_active
            };

            if (config.id) {
                // Update existing
                const { error } = await supabase
                    .from('google_drive_config')
                    .update(configData)
                    .eq('id', config.id);

                if (error) throw error;
            } else {
                // Create new
                const { data, error } = await supabase
                    .from('google_drive_config')
                    .insert(configData)
                    .select()
                    .single();

                if (error) throw error;
                setConfig(prev => ({ ...prev, id: data.id }));
            }

            toast.success('Google Drive configuration saved successfully');
        } catch (error) {
            console.error('Failed to save config:', error);
            toast.error('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            // Test the configuration by making a request to Google's OAuth endpoint
            const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
                client_id: config.client_id,
                redirect_uri: config.redirect_uri,
                scope: 'https://www.googleapis.com/auth/drive.readonly',
                response_type: 'code',
                access_type: 'offline',
                prompt: 'consent',
                state: 'test'
            })}`;

            // Open in new tab for testing
            window.open(testUrl, '_blank');
            toast.success('Test OAuth URL opened in new tab');
        } catch (error) {
            console.error('Test failed:', error);
            toast.error('Configuration test failed');
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Google Drive Integration
                    <ExternalLink className="h-4 w-4" />
                </CardTitle>
                <CardDescription>
                    Configure Google Drive integration for document management
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        To set up Google Drive integration, you need to create OAuth 2.0 credentials in the{' '}
                        <a
                            href="https://console.cloud.google.com/apis/credentials"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Google Cloud Console
                        </a>
                        . Make sure to add the redirect URI below to your OAuth client configuration.
                    </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="client_id">Client ID</Label>
                        <Input
                            id="client_id"
                            value={config.client_id}
                            onChange={(e) => setConfig(prev => ({ ...prev, client_id: e.target.value }))}
                            placeholder="Your Google OAuth Client ID"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="client_secret">Client Secret</Label>
                        <Input
                            id="client_secret"
                            type="password"
                            value={config.client_secret}
                            onChange={(e) => setConfig(prev => ({ ...prev, client_secret: e.target.value }))}
                            placeholder="Your Google OAuth Client Secret"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="redirect_uri">Redirect URI</Label>
                        <Input
                            id="redirect_uri"
                            value={config.redirect_uri}
                            onChange={(e) => setConfig(prev => ({ ...prev, redirect_uri: e.target.value }))}
                            placeholder="OAuth redirect URI"
                        />
                        <p className="text-sm text-muted-foreground">
                            Add this URI to your Google OAuth client's authorized redirect URIs
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={saving || !config.client_id || !config.client_secret}
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Save Configuration
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleTest}
                        disabled={testing || !config.client_id}
                    >
                        {testing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Test Configuration
                    </Button>
                </div>

                {config.id && (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            Google Drive integration is configured and ready to use.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};