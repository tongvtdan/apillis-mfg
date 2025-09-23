import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MoreHorizontal,
  Edit,
  Check,
  X,
  Clock,
  Mail,
  FileText,
  Star,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  Truck,
  Building2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/shared/hooks/use-toast";
import { useSupplierQuotes } from "@/features/supplier-management/hooks";
import {
  SupplierQuote,
  SupplierQuoteStatus,
  SUPPLIER_QUOTE_STATUS_COLORS,
  SUPPLIER_QUOTE_STATUS_LABELS,
  UpdateSupplierQuoteRequest,
  AcceptQuoteRequest
} from "@/types/supplier";

interface SupplierQuoteTableProps {
  quotes: SupplierQuote[];
  projectId?: string;
  onQuoteUpdate?: () => void;
  showComparison?: boolean;
}

interface QuoteEditModalProps {
  quote: SupplierQuote;
  isOpen: boolean;
  onClose: () => void;
  onSave: (quoteId: string, updates: UpdateSupplierQuoteRequest) => void;
}

interface QuoteComparisonProps {
  quotes: SupplierQuote[];
  isOpen: boolean;
  onClose: () => void;
  onSelectWinner: (quoteId: string) => void;
}

function QuoteEditModal({ quote, isOpen, onClose, onSave }: QuoteEditModalProps) {
  const [formData, setFormData] = useState({
    quote_amount: quote.quote_amount?.toString() || "",
    lead_time_days: quote.lead_time_days?.toString() || "",
    quote_valid_until: quote.quote_valid_until ? quote.quote_valid_until.split('T')[0] : "",
    quote_notes: quote.quote_notes || "",
    internal_notes: quote.internal_notes || "",
    unit_price: quote.unit_price?.toString() || "",
    minimum_quantity: quote.minimum_quantity?.toString() || "",
    payment_terms: quote.payment_terms || "",
    delivery_terms: quote.delivery_terms || "",
    warranty_terms: quote.warranty_terms || ""
  });

  const handleSave = () => {
    const updates: UpdateSupplierQuoteRequest = {
      quote_amount: formData.quote_amount ? parseFloat(formData.quote_amount) : undefined,
      lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : undefined,
      quote_valid_until: formData.quote_valid_until || undefined,
      quote_notes: formData.quote_notes || undefined,
      internal_notes: formData.internal_notes || undefined,
      unit_price: formData.unit_price ? parseFloat(formData.unit_price) : undefined,
      minimum_quantity: formData.minimum_quantity ? parseInt(formData.minimum_quantity) : undefined,
      payment_terms: formData.payment_terms || undefined,
      delivery_terms: formData.delivery_terms || undefined,
      warranty_terms: formData.warranty_terms || undefined
    };

    onSave(quote.id, updates);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Edit Quote Details
        </div>
      }
      description={`Update quote information from ${quote.supplier?.name}`}
      showDescription={true}
      maxWidth="max-w-2xl"
    >

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quote_amount">Quote Amount ($)</Label>
          <Input
            id="quote_amount"
            type="number"
            step="0.01"
            value={formData.quote_amount}
            onChange={(e) => setFormData(prev => ({ ...prev, quote_amount: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
          <Input
            id="lead_time_days"
            type="number"
            value={formData.lead_time_days}
            onChange={(e) => setFormData(prev => ({ ...prev, lead_time_days: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="unit_price">Unit Price ($)</Label>
          <Input
            id="unit_price"
            type="number"
            step="0.01"
            value={formData.unit_price}
            onChange={(e) => setFormData(prev => ({ ...prev, unit_price: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="minimum_quantity">Minimum Quantity</Label>
          <Input
            id="minimum_quantity"
            type="number"
            value={formData.minimum_quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, minimum_quantity: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="quote_valid_until">Valid Until</Label>
          <Input
            id="quote_valid_until"
            type="date"
            value={formData.quote_valid_until}
            onChange={(e) => setFormData(prev => ({ ...prev, quote_valid_until: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Input
            id="payment_terms"
            value={formData.payment_terms}
            onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
            placeholder="e.g., Net 30"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="delivery_terms">Delivery Terms</Label>
          <Input
            id="delivery_terms"
            value={formData.delivery_terms}
            onChange={(e) => setFormData(prev => ({ ...prev, delivery_terms: e.target.value }))}
            placeholder="e.g., FOB Origin"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="warranty_terms">Warranty Terms</Label>
          <Input
            id="warranty_terms"
            value={formData.warranty_terms}
            onChange={(e) => setFormData(prev => ({ ...prev, warranty_terms: e.target.value }))}
            placeholder="e.g., 1 year parts and labor"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="quote_notes">Quote Notes</Label>
          <Textarea
            id="quote_notes"
            value={formData.quote_notes}
            onChange={(e) => setFormData(prev => ({ ...prev, quote_notes: e.target.value }))}
            placeholder="Notes from supplier..."
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="internal_notes">Internal Notes</Label>
          <Textarea
            id="internal_notes"
            value={formData.internal_notes}
            onChange={(e) => setFormData(prev => ({ ...prev, internal_notes: e.target.value }))}
            placeholder="Internal notes (not visible to supplier)..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}

function QuoteComparison({ quotes, isOpen, onClose, onSelectWinner }: QuoteComparisonProps) {
  const receivedQuotes = quotes.filter(q => q.status === 'received' && q.quote_amount);
  const sortedQuotes = receivedQuotes.sort((a, b) => (a.quote_amount || 0) - (b.quote_amount || 0));

  const getBestValueScore = (quote: SupplierQuote) => {
    // Simple scoring: combine price competitiveness with supplier rating
    const priceRank = sortedQuotes.findIndex(q => q.id === quote.id) + 1;
    const maxRank = sortedQuotes.length;
    const priceScore = ((maxRank - priceRank + 1) / maxRank) * 60; // 60% weight for price
    const qualityScore = (quote.supplier?.rating || 0) * 8; // 40% weight for quality (rating * 8 to get 0-40 scale)

    return Math.round(priceScore + qualityScore);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Quote Comparison
        </div>
      }
      description="Compare received quotes and select the best option"
      showDescription={true}
      maxWidth="max-w-4xl"
    >

      {receivedQuotes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No quotes received yet to compare.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedQuotes.map((quote, index) => {
              const isLowest = index === 0;
              const valueScore = getBestValueScore(quote);

              return (
                <Card
                  key={quote.id}
                  className={cn(
                    "relative",
                    isLowest && "ring-2 ring-green-500 bg-green-50/50"
                  )}
                >
                  {isLowest && (
                    <div className="absolute -top-2 left-4">
                      <Badge className="bg-green-500">
                        Lowest Price
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{quote.supplier?.name}</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        <span className="text-xs">{quote.supplier?.rating.toFixed(1)}</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {quote.supplier?.company}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        ${quote.quote_amount?.toLocaleString()}
                      </p>
                      {quote.unit_price && (
                        <p className="text-xs text-muted-foreground">
                          ${quote.unit_price}/unit
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Lead Time:</span>
                        <span>{quote.lead_time_days} days</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Value Score:</span>
                        <Badge variant={valueScore >= 80 ? "default" : valueScore >= 60 ? "secondary" : "outline"}>
                          {valueScore}/100
                        </Badge>
                      </div>

                      {quote.payment_terms && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Payment:</span>
                          <span>{quote.payment_terms}</span>
                        </div>
                      )}

                      {quote.response_time_hours && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span>{Math.round(quote.response_time_hours)}h</span>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => onSelectWinner(quote.id)}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Select This Quote
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close Comparison
        </Button>
      </div>
    </Modal>
  );
}

export function SupplierQuoteTable({ quotes, projectId, onQuoteUpdate, showComparison = true }: SupplierQuoteTableProps) {
  const [editingQuote, setEditingQuote] = useState<SupplierQuote | null>(null);
  const [showComparison_, setShowComparison] = useState(false);
  const { toast } = useToast();
  const { updateQuote, acceptQuote, updateQuoteStatus } = useSupplierQuotes(projectId);

  const handleEditQuote = async (quoteId: string, updates: UpdateSupplierQuoteRequest) => {
    try {
      await updateQuote(quoteId, updates);
      onQuoteUpdate?.();
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      const request: AcceptQuoteRequest = {
        quote_id: quoteId,
        decision_rationale: "Selected from quote comparison"
      };

      await acceptQuote(request);
      onQuoteUpdate?.();
    } catch (error) {
      console.error('Error accepting quote:', error);
    }
  };

  const handleStatusChange = async (quoteId: string, newStatus: SupplierQuoteStatus) => {
    try {
      await updateQuoteStatus(quoteId, newStatus);
      onQuoteUpdate?.();
    } catch (error) {
      console.error('Error updating quote status:', error);
    }
  };

  const getStatusBadge = (status: SupplierQuoteStatus) => {
    return (
      <Badge className={SUPPLIER_QUOTE_STATUS_COLORS[status]}>
        {SUPPLIER_QUOTE_STATUS_LABELS[status]}
      </Badge>
    );
  };

  const getQuoteActions = (quote: SupplierQuote) => {
    const actions = [];

    if (quote.status === 'sent') {
      actions.push(
        <DropdownMenuItem
          key="mark-received"
          onClick={() => handleStatusChange(quote.id, 'received')}
        >
          <Check className="w-4 h-4 mr-2" />
          Mark as Received
        </DropdownMenuItem>
      );
    }

    if (quote.status === 'received') {
      actions.push(
        <DropdownMenuItem
          key="accept"
          onClick={() => handleAcceptQuote(quote.id)}
        >
          <Check className="w-4 h-4 mr-2" />
          Accept Quote
        </DropdownMenuItem>
      );
    }

    if (quote.status !== 'cancelled') {
      actions.push(
        <DropdownMenuItem
          key="cancel"
          onClick={() => handleStatusChange(quote.id, 'cancelled')}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </DropdownMenuItem>
      );
    }

    return actions;
  };

  const isOverdue = (quote: SupplierQuote) => {
    return quote.status === 'sent' &&
      quote.quote_deadline &&
      new Date(quote.quote_deadline) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Supplier Quotes</h3>
          <p className="text-sm text-muted-foreground">
            {quotes.length} quote{quotes.length !== 1 ? 's' : ''} •
            {quotes.filter(q => q.status === 'received').length} received •
            {quotes.filter(q => q.status === 'sent').length} pending
          </p>
        </div>

        {showComparison && quotes.filter(q => q.status === 'received').length > 1 && (
          <Button
            variant="outline"
            onClick={() => setShowComparison(true)}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Compare Quotes
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quote Amount</TableHead>
              <TableHead>Lead Time</TableHead>
              <TableHead>Response Time</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No quotes found.</p>
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote) => (
                <TableRow key={quote.id} className={cn(isOverdue(quote) && "bg-red-50/50")}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div>
                        <p className="font-medium text-sm">{quote.supplier?.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Building2 className="w-3 h-3 mr-1" />
                          {quote.supplier?.company}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          <span className="text-xs">{quote.supplier?.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(quote.status)}
                      {isOverdue(quote) && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {quote.quote_amount ? (
                      <div>
                        <p className="font-medium">${quote.quote_amount.toLocaleString()}</p>
                        {quote.unit_price && (
                          <p className="text-xs text-muted-foreground">
                            ${quote.unit_price}/unit
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {quote.lead_time_days ? (
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                        <span>{quote.lead_time_days} days</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {quote.response_time_hours ? (
                      <span className="text-sm">
                        {Math.round(quote.response_time_hours)}h
                      </span>
                    ) : quote.status === 'sent' ? (
                      <span className="text-muted-foreground">Pending</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {quote.quote_deadline ? (
                      <div>
                        <p className="text-sm">
                          {format(new Date(quote.quote_deadline), 'MMM dd')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(quote.quote_deadline), { addSuffix: true })}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditingQuote(quote)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        {getQuoteActions(quote)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Modal */}
      {editingQuote && (
        <QuoteEditModal
          quote={editingQuote}
          isOpen={!!editingQuote}
          onClose={() => setEditingQuote(null)}
          onSave={handleEditQuote}
        />
      )}

      {/* Comparison Modal */}
      <QuoteComparison
        quotes={quotes}
        isOpen={showComparison_}
        onClose={() => setShowComparison(false)}
        onSelectWinner={handleAcceptQuote}
      />
    </div>
  );
}