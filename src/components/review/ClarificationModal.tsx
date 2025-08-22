import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';

interface ClarificationModalProps {
  onSubmit: (description: string) => Promise<boolean>;
  trigger?: React.ReactNode;
}

export function ClarificationModal({ onSubmit, trigger }: ClarificationModalProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    const success = await onSubmit(description.trim());
    setSubmitting(false);

    if (success) {
      setDescription('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Request Clarification
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Request Customer Clarification
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clarification-description">
              What clarification do you need from the customer?
            </Label>
            <Textarea
              id="clarification-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what information or clarification you need from the customer..."
              rows={4}
              className="mt-2"
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting || !description.trim()}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}