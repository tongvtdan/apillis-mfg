import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRFQs } from '@/hooks/useRFQs';
import { useReviews } from '@/hooks/useReviews';
import { usePermissions } from '@/hooks/usePermissions';
import { ReviewForm } from '@/components/review/ReviewForm';
import { ReviewStatusPanel } from '@/components/review/ReviewStatusPanel';
import { ClarificationModal } from '@/components/review/ClarificationModal';
import { RFQ, PRIORITY_COLORS } from '@/types/rfq';
import { Department } from '@/types/review';
import { 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  Phone, 
  Mail,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export function RFQDetail() {
  const { id } = useParams<{ id: string }>();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState<Department | null>(null);
  
  const { getRFQById } = useRFQs();
  const { 
    reviews, 
    risks, 
    clarifications, 
    loading: reviewsLoading, 
    submitReview, 
    submitClarification,
    assignReviewer 
  } = useReviews(id || '');
  
  const { profile, canReviewRFQ, canManageUsers } = usePermissions();

  useEffect(() => {
    const fetchRFQ = async () => {
      if (!id) return;
      
      try {
        const rfqData = await getRFQById(id);
        setRfq(rfqData);
      } catch (error) {
        console.error('Error fetching RFQ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRFQ();
  }, [id, getRFQById]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-96">Loading RFQ details...</div>;
  }

  if (!rfq) {
    return <Navigate to="/dashboard" replace />;
  }

  const canReviewForDepartment = (department: Department) => {
    if (!profile) return false;
    return canReviewRFQ() && profile.role === department;
  };

  const getExistingReview = (department: Department) => {
    return reviews.find(r => r.department === department);
  };

  const canShowReviewForm = (department: Department) => {
    const hasPermission = canReviewForDepartment(department);
    const isAssigned = rfq[`${department.toLowerCase()}_reviewer_id` as keyof RFQ] === profile?.user_id;
    return hasPermission && isAssigned;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{rfq.rfq_number}</h1>
          <p className="text-xl text-muted-foreground mt-1">{rfq.project_name}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={PRIORITY_COLORS[rfq.priority]}>
            {rfq.priority} priority
          </Badge>
          <Badge variant="outline" className="status-review">
            {rfq.status}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Internal Reviews</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  RFQ Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Company</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span>{rfq.company_name}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Created</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{format(new Date(rfq.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                {rfq.estimated_value && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Estimated Value</span>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>${rfq.estimated_value.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                
                {rfq.due_date && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Due Date</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{format(new Date(rfq.due_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                )}
                
                {rfq.description && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Description</span>
                    <p className="mt-1 text-sm">{rfq.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rfq.contact_name && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Contact Name</span>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{rfq.contact_name}</span>
                    </div>
                  </div>
                )}
                
                {rfq.contact_email && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${rfq.contact_email}`}
                        className="text-primary hover:underline"
                      >
                        {rfq.contact_email}
                      </a>
                    </div>
                  </div>
                )}
                
                {rfq.contact_phone && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Phone</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={`tel:${rfq.contact_phone}`}
                        className="text-primary hover:underline"
                      >
                        {rfq.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {rfq.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{rfq.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {reviewsLoading ? (
            <div className="text-center py-8">Loading review data...</div>
          ) : (
            <>
              {/* Review Actions */}
              <div className="flex gap-2">
                {(['Engineering', 'QA', 'Production'] as Department[]).map(department => {
                  if (!canShowReviewForm(department)) return null;
                  
                  const existingReview = getExistingReview(department);
                  return (
                    <Button
                      key={department}
                      variant={existingReview ? "outline" : "default"}
                      onClick={() => setShowReviewForm(department)}
                    >
                      {existingReview ? `Update ${department} Review` : `Submit ${department} Review`}
                    </Button>
                  );
                })}
                
                {canReviewRFQ() && (
                  <ClarificationModal onSubmit={submitClarification} />
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <ReviewForm
                  rfqId={rfq.id}
                  department={showReviewForm}
                  existingReview={getExistingReview(showReviewForm)}
                  onSubmit={(submission) => submitReview(showReviewForm, submission)}
                  onCancel={() => setShowReviewForm(null)}
                />
              )}

              {/* Review Status Panel */}
              <ReviewStatusPanel
                rfq={rfq}
                reviews={reviews}
                risks={risks}
                clarifications={clarifications}
                canAssignReviewers={canManageUsers()}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Attachments & Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Document management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Activity log coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}