import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    User,
    Calendar,
    Edit,
    Eye,
    AlertCircle
} from 'lucide-react';
import { InternalReview, Department, ReviewStatus, STATUS_COLORS } from '@/types/review';
import { format } from 'date-fns';
import { useUserDisplayName, useUsers } from '@/hooks/useUsers';

interface ReviewListProps {
    reviews: InternalReview[];
    onEditReview: (review: InternalReview) => void;
    onViewReview: (review: InternalReview) => void;
}

export function ReviewList({ reviews, onEditReview, onViewReview }: ReviewListProps) {
    // Get all unique reviewer IDs to fetch display names
    const reviewerIds = reviews ? [...new Set(reviews.map(review => review.reviewer_id).filter(Boolean))] : [];
    const { users: reviewerUsers } = useUsers(reviewerIds);

    const getStatusIcon = (status: ReviewStatus) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'revision_requested':
                return <AlertTriangle className="w-4 h-4 text-orange-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusLabel = (status: ReviewStatus) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'revision_requested':
                return 'Revision Requested';
            default:
                return 'Pending';
        }
    };

    const getDepartmentIcon = (department: Department) => {
        switch (department) {
            case 'Engineering':
                return '⚙️';
            case 'QA':
                return '🔍';
            case 'Production':
                return '🏭';
            default:
                return '📋';
        }
    };

    if (reviews.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground">
                        Reviews will appear here once they are submitted by the respective departments
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{getDepartmentIcon(review.department)}</span>
                                <div>
                                    <CardTitle className="text-base">{review.department} Review</CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="w-4 h-4" />
                                        <ReviewerName
                                            reviewerId={review.reviewer_id}
                                            displayName={reviewerUsers.get(review.reviewer_id)?.display_name || review.reviewer_id}
                                        />
                                        {review.submitted_at && (
                                            <>
                                                <span>•</span>
                                                <Calendar className="w-4 h-4" />
                                                <span>{format(new Date(review.submitted_at), 'MMM dd, yyyy HH:mm')}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge className={STATUS_COLORS[review.status]}>
                                    <div className="flex items-center gap-1">
                                        {getStatusIcon(review.status)}
                                        {getStatusLabel(review.status)}
                                    </div>
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                        {review.feedback && (
                            <div className="mb-4">
                                <h4 className="font-medium text-sm mb-2">Feedback</h4>
                                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                                    {review.feedback}
                                </p>
                            </div>
                        )}

                        {review.suggestions && review.suggestions.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-medium text-sm mb-2">Suggestions</h4>
                                <ul className="space-y-1">
                                    {review.suggestions.map((suggestion, index) => (
                                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Separator className="my-3" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Created: {format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                                {review.updated_at !== review.created_at && (
                                    <>
                                        <span>•</span>
                                        <span>Updated: {format(new Date(review.updated_at), 'MMM dd, yyyy')}</span>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onViewReview(review)}
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditReview(review)}
                                >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Helper component to display reviewer name
function ReviewerName({ reviewerId, displayName }: { reviewerId?: string; displayName: string }) {
    if (!reviewerId) {
        return <span>Unassigned</span>;
    }

    return <span>{displayName}</span>;
}
