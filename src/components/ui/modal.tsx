import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: string;
    showCloseButton?: boolean;
    className?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "max-w-4xl",
    showCloseButton = true,
    className = ""
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 z-50">
            <div className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto ${className}`}>
                <Card>
                    {(title || showCloseButton) && (
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                {title && (
                                    <CardTitle className="flex items-center gap-2">
                                        {title}
                                    </CardTitle>
                                )}
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
