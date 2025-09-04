import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: string;
    showCloseButton?: boolean;
    showDescription?: boolean;
    className?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = "max-w-4xl",
    showCloseButton = true,
    showDescription = false,
    className = ""
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto ${className}`}>
                <Card>
                    {(title || showCloseButton) && (
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col space-y-1.5">
                                    {title && (
                                        <CardTitle className="flex items-center gap-2">
                                            {title}
                                        </CardTitle>
                                    )}
                                    {showDescription && description && (
                                        <p className="text-sm text-muted-foreground">
                                            {description}
                                        </p>
                                    )}
                                </div>
                                {showCloseButton && (
                                    <Button variant="ghost" size="sm" onClick={onClose}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                    )}
                    <CardContent>
                        {children}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
