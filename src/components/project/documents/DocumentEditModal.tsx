import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Tag, Plus } from 'lucide-react';
import type { ProjectDocument } from '@/hooks/useDocuments';
import type { DocumentEditData } from '@/services/documentActions';

interface DocumentEditModalProps {
    document: ProjectDocument;
    isOpen: boolean;
    onClose: () => void;
    onSave: (documentId: string, editData: DocumentEditData) => Promise<void>;
}

export const DocumentEditModal: React.FC<DocumentEditModalProps> = ({
    document,
    isOpen,
    onClose,
    onSave
}) => {
    const [formData, setFormData] = useState<DocumentEditData>({
        title: document.title,
        description: document.description || '',
        category: document.category,
        access_level: document.access_level,
        tags: document.metadata?.tags || []
    });
    const [newTag, setNewTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Reset form when document changes
    useEffect(() => {
        setFormData({
            title: document.title,
            description: document.description || '',
            category: document.category,
            access_level: document.access_level,
            tags: document.metadata?.tags || []
        });
    }, [document]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            await onSave(document.id, formData);
            onClose();
        } catch (error) {
            // Error handling is done in the service
            console.error('Error saving document:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Document">
            <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter document title"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter document description"
                        rows={3}
                    />
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                        value={formData.category || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rfq">RFQ</SelectItem>
                            <SelectItem value="drawing">Drawing</SelectItem>
                            <SelectItem value="specification">Specification</SelectItem>
                            <SelectItem value="quote">Quote</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Access Level */}
                <div className="space-y-2">
                    <Label htmlFor="access_level">Access Level</Label>
                    <Select
                        value={formData.access_level || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, access_level: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="confidential">Confidential</SelectItem>
                            <SelectItem value="restricted">Restricted</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="space-y-2">
                        {/* Existing tags */}
                        {formData.tags && formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Add new tag */}
                        <div className="flex gap-2">
                            <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Add a tag"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddTag}
                                disabled={!newTag.trim()}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
