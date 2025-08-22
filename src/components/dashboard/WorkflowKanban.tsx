import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Calendar,
  User,
  Building2,
  Clock,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRFQs } from "@/hooks/useRFQs";
import { RFQ, RFQ_STAGES, PRIORITY_COLORS, RFQStatus } from "@/types/rfq";

interface RFQCardProps {
  rfq: RFQ;
  isDragging?: boolean;
}

function RFQCard({ rfq, isDragging = false }: RFQCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id: rfq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableIsDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (daysInStage: number) => daysInStage > 7;

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card-elevated cursor-pointer hover:shadow-md transition-all ${isDragging ? 'rotate-3 shadow-lg' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {rfq.rfq_number}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Move to Next Stage</DropdownMenuItem>
              <DropdownMenuItem>Assign to...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className={`text-xs ${getPriorityColor(rfq.priority)}`}
          >
            {rfq.priority.toUpperCase()}
          </Badge>
          {isOverdue(rfq.days_in_stage) && (
            <AlertTriangle className="h-3 w-3 text-red-500" />
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div>
          <p className="font-medium text-sm">{rfq.project_name}</p>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            <Building2 className="h-3 w-3" />
            <span>{rfq.company_name}</span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{rfq.contact_name || 'Unassigned'}</span>
            </div>
            {rfq.estimated_value && (
              <span className="font-medium">{formatCurrency(rfq.estimated_value)}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {rfq.due_date && (
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(rfq.due_date)}</span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{rfq.days_in_stage} days</span>
            </div>
          </div>
        </div>

        {rfq.tags && rfq.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rfq.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
            {rfq.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                +{rfq.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WorkflowKanban() {
  const { rfqs, loading, error, updateRFQStatus } = useRFQs();
  const [activeRFQ, setActiveRFQ] = useState<RFQ | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const rfq = rfqs.find(r => r.id === active.id);
    setActiveRFQ(rfq || null);
  }, [rfqs]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRFQ(null);

    if (!over || active.id === over.id) return;

    const rfqId = active.id as string;
    const newStatus = over.id as RFQStatus;

    // Check if it's a valid status
    if (!RFQ_STAGES.find(stage => stage.id === newStatus)) return;

    await updateRFQStatus(rfqId, newStatus);
  }, [updateRFQStatus]);

  const getStageRFQs = useCallback((stageId: RFQStatus) => {
    return rfqs.filter(rfq => rfq.status === stageId);
  }, [rfqs]);

  // Update stage counts
  const stages = RFQ_STAGES.map(stage => ({
    ...stage,
    count: getStageRFQs(stage.id).length
  }));

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">RFQ Workflow</h2>
            <p className="text-muted-foreground">Loading your manufacturing requests...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
          {RFQ_STAGES.map((stage) => (
            <div key={stage.id} className="space-y-4">
              <div className="animate-pulse bg-muted h-8 rounded"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-muted h-32 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-destructive font-medium">Error loading RFQs</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RFQ Workflow</h2>
          <p className="text-muted-foreground">Track and manage your manufacturing requests</p>
        </div>
        <Button asChild>
          <Link to="/rfq/new">
            New RFQ
          </Link>
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
          {stages.map((stage) => {
            const stageRFQs = getStageRFQs(stage.id);

            return (
              <div
                key={stage.id}
                className="space-y-4 bg-muted/30 p-4 rounded-lg border-2 border-dashed border-muted transition-colors hover:border-muted-foreground/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{stage.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {stage.count}
                    </Badge>
                  </div>
                </div>

                <SortableContext
                  items={stageRFQs.map(rfq => rfq.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3" style={{ minHeight: '200px' }}>
                    {stageRFQs.map((rfq) => (
                      <RFQCard key={rfq.id} rfq={rfq} />
                    ))}

                    {stageRFQs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No RFQs in this stage</p>
                        <p className="text-xs mt-1">Drag RFQs here to move them</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeRFQ ? (
            <RFQCard rfq={activeRFQ} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}