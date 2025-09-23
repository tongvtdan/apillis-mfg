import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  InternalReview,
  RFQRisk,
  RFQClarification,
  Department,
  DEPARTMENT_LABELS,
  STATUS_COLORS,
  RISK_SEVERITY_COLORS,
  RISK_CATEGORY_COLORS
} from '@/types/review';
import { RFQ } from '@/types/rfq';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  AlertTriangle,
  MessageSquare,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUserDisplayName } from '@/hooks/useUsers';

interface ReviewStatusPanelProps {
  rfq: RFQ;
  reviews: InternalReview[];
  risks: RFQRisk[];
  clarifications: RFQClarification[];
  onAssignReviewer?: (department: Department) => void;
  canAssignReviewers?: boolean;
}

// Helper component to display assigned reviewer
function AssignedReviewerDisplay({ reviewerId }: { reviewerId: string }) {
  const displayName = useUserDisplayName(reviewerId);
  return (
    <AssignedReviewerBadge
      reviewerId={reviewerId}
      displayName={displayName}
    />
  );
}

export function ReviewStatusPanel({
  rfq,
  reviews,
  risks,
  clarifications,
  onAssignReviewer,
  canAssignReviewers
}: ReviewStatusPanelProps) {

  const departments: Department[] = ['Engineering', 'QA', 'Production'];

  // Collect all unique reviewer IDs for reference (no longer using useUsers)
  const reviewerIds = reviews ? [...new Set(reviews.map(review => review.reviewer_id).filter(Boolean))] : [];

  const getReviewForDepartment = (department: Department) => {
    return reviews.find(r => r.department === department);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'revision_requested':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAssignedReviewer = (department: Department) => {
    const field = `${department.toLowerCase()}_reviewer_id` as keyof RFQ;
    return rfq[field] as string | undefined;
  };

  const openClarifications = clarifications.filter(c => c.status === 'open');
  const highRisks = risks.filter(r => r.severity === 'high');

  return (
    <div className="space-y-4">
      {/* Overview Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Review Status Overview
            <div className="flex gap-2">
              {openClarifications.length > 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  {openClarifications.length} Open Clarification{openClarifications.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {highRisks.length > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  {highRisks.length} High Risk{highRisks.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {departments.map(department => {
              const review = getReviewForDepartment(department);
              const assignedReviewer = getAssignedReviewer(department);

              return (
                <div key={department} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(review?.status)}
                    <div>
                      <div className="font-medium">{DEPARTMENT_LABELS[department]}</div>
                      {review?.status ? (
                        <div className="flex items-center gap-2">
                          <Badge className={STATUS_COLORS[review.status]}>
                            {review.status.replace('_', ' ')}
                          </Badge>
                          {review.submitted_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.submitted_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          Pending Review
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {assignedReviewer && (
                      <AssignedReviewerDisplay reviewerId={assignedReviewer} />
                    )}
                    {canAssignReviewers && !assignedReviewer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAssignReviewer?.(department)}
                      >
                        Assign Reviewer
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reviews */}
      {reviews.filter(r => r.status !== 'pending').map(review => (
        <Collapsible key={review.id}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(review.status)}
                    {DEPARTMENT_LABELS[review.department]} Review
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLORS[review.status]}>
                      {review.status.replace('_', ' ')}
                    </Badge>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  {review.feedback && (
                    <div>
                      <h4 className="font-medium mb-2">Feedback</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {review.feedback}
                      </p>
                    </div>
                  )}

                  {review.suggestions && review.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggestions</h4>
                      <ul className="space-y-1">
                        {review.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}

      {/* Risks Section */}
      {risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Identified Risks ({risks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.map(risk => (
                <div key={risk.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-2">
                      <Badge className={RISK_SEVERITY_COLORS[risk.severity]}>
                        {risk.severity} severity
                      </Badge>
                      <Badge className={RISK_CATEGORY_COLORS[risk.category]}>
                        {risk.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(risk.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{risk.description}</p>
                  {risk.mitigation_plan && (
                    <div className="text-sm">
                      <span className="font-medium">Mitigation: </span>
                      <span className="text-muted-foreground">{risk.mitigation_plan}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clarifications Section */}
      {clarifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Customer Clarifications ({clarifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clarifications.map(clarification => (
                <div key={clarification.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={clarification.status === 'open' ? 'default' : 'secondary'}>
                      {clarification.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(clarification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{clarification.description}</p>
                  {clarification.resolution && (
                    <div className="text-sm">
                      <span className="font-medium">Resolution: </span>
                      <span className="text-muted-foreground">{clarification.resolution}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component to display assigned reviewer
function AssignedReviewerBadge({ reviewerId, displayName }: { reviewerId: string; displayName: string }) {
  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <User className="w-3 h-3" />
      {displayName}
    </Badge>
  );
}