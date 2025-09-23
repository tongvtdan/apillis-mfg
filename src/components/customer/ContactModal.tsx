import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { useToast } from '@/shared/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  organizationId?: string;
  onContactCreated?: (contact: any) => void;
}

interface ContactFormData {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
  contactAddress: string;
  contactCity: string;
  contactState: string;
  contactPostalCode: string;
  contactWebsite: string;
  contactNotes: string;
  isPrimaryContact: boolean;
}

const defaultContactFormData: ContactFormData = {
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactRole: 'general',
  contactAddress: '',
  contactCity: '',
  contactState: '',
  contactPostalCode: '',
  contactWebsite: '',
  contactNotes: '',
  isPrimaryContact: false
};

export function ContactModal({ open, onClose, organizationId, onContactCreated }: ContactModalProps) {
  const [contactFormData, setContactFormData] = useState<ContactFormData>(defaultContactFormData);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setContactFormData(defaultContactFormData);
    onClose();
  };

  const handleSubmit = async () => {
    if (!contactFormData.contactName || !contactFormData.contactEmail) {
      toast({
        title: "Missing Required Information",
        description: "Please fill in Contact Name and Email.",
        variant: "destructive",
      });
      return;
    }

    if (!organizationId) {
      toast({
        title: "No Organization Selected",
        description: "Please select an organization first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingContact(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          organization_id: organizationId,
          contact_name: contactFormData.contactName,
          email: contactFormData.contactEmail,
          phone: contactFormData.contactPhone || null,
          role: contactFormData.contactRole,
          address: contactFormData.contactAddress || null,
          city: contactFormData.contactCity || null,
          state: contactFormData.contactState || null,
          postal_code: contactFormData.contactPostalCode || null,
          website: contactFormData.contactWebsite || null,
          notes: contactFormData.contactNotes || null,
          is_primary_contact: contactFormData.isPrimaryContact,
          type: 'customer',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Contact Created Successfully",
        description: `${contactFormData.contactName} has been added as a contact.`,
      });

      // Call the callback if provided
      if (onContactCreated) {
        onContactCreated(data);
      }

      handleClose();
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: "Error Creating Contact",
        description: "There was an error creating the contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="modal-dialog max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="modal-dialog-header">
          <DialogTitle className="modal-dialog-title">Create New Contact</DialogTitle>
          <DialogDescription className="modal-dialog-description">
            Add a new contact for the selected organization.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Contact Name *</Label>
                <Input
                  id="contact-name"
                  placeholder="Full Name"
                  className="modal-form-input"
                  value={contactFormData.contactName}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, contactName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="email@company.com"
                  className="modal-form-input"
                  value={contactFormData.contactEmail}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  placeholder="+1-555-123-4567"
                  className="modal-form-input"
                  value={contactFormData.contactPhone}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-role">Role</Label>
                <Select
                  value={contactFormData.contactRole}
                  onValueChange={(value) => setContactFormData(prev => ({ ...prev, contactRole: value }))}
                >
                  <SelectTrigger className="modal-select-trigger">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Contact</SelectItem>
                    <SelectItem value="purchasing">Purchasing</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="quality">Quality Control</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-primary-contact"
                checked={contactFormData.isPrimaryContact}
                onChange={(e) => setContactFormData(prev => ({ ...prev, isPrimaryContact: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is-primary-contact">Set as Primary Contact</Label>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
              Address Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-address">Address</Label>
                <Input
                  id="contact-address"
                  placeholder="Street Address"
                  className="modal-form-input"
                  value={contactFormData.contactAddress}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, contactAddress: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-city">City</Label>
                <Input
                  id="contact-city"
                  placeholder="City"
                  className="modal-form-input"
                  value={contactFormData.contactCity}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, contactCity: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-state">State/Province</Label>
                <Input
                  id="contact-state"
                  placeholder="State or Province"
                  className="modal-form-input"
                  value={contactFormData.contactState}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, contactState: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-postal-code">Postal Code</Label>
                <Input
                  id="contact-postal-code"
                  placeholder="Postal Code"
                  className="modal-form-input"
                  value={contactFormData.contactPostalCode}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, contactPostalCode: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-website">Website</Label>
              <Input
                id="contact-website"
                placeholder="Personal website or LinkedIn"
                className="modal-form-input"
                value={contactFormData.contactWebsite}
                onChange={(e) => setContactFormData(prev => ({ ...prev, contactWebsite: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-notes">Notes</Label>
              <Input
                id="contact-notes"
                placeholder="Additional contact notes"
                className="modal-form-input"
                value={contactFormData.contactNotes}
                onChange={(e) => setContactFormData(prev => ({ ...prev, contactNotes: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="modal-button-secondary"
              onClick={handleClose}
              disabled={isSubmittingContact}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="modal-button-primary"
              onClick={handleSubmit}
              disabled={isSubmittingContact}
            >
              {isSubmittingContact ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Contact'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
