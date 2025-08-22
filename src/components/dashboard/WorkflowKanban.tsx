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
  useDroppable,
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
  } = useSortable({ 
    id: rfq.id,
    data: {
      type: 'rfq',
      rfq: rfq
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-50' : ''}
    >
      <Card className={`card-elevated cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${isDragging ? 'rotate-3 shadow-lg scale-105' : 'hover:scale-[1.02]'} ${sortableIsDragging ? 'z-50' : ''}`}>
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
              <DropdownMenuItem onClick={() => window.location.href = `/rfq/${rfq.id}`}>
                View Details
              </DropdownMenuItem>
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
    </div>
  );
}

// DroppableStage component for each stage column
interface DroppableStageProps {
  stageId: RFQStatus;
  stageName: string;
  stageCount: number;
  children: React.ReactNode;
}

function DroppableStage({ stageId, stageName, stageCount, children }: DroppableStageProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: stageId,
    data: {
      type: 'stage',
      stageId: stageId
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-4 bg-muted/30 p-4 rounded-lg border-2 border-dashed transition-all duration-300 min-h-[500px] ${
        isOver ? 'border-primary bg-primary/10 scale-[1.02] shadow-md' : 'border-muted hover:border-muted-foreground/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold">{stageName}</h3>
          <Badge variant="secondary" className="text-xs">
            {stageCount}
          </Badge>
        </div>
      </div>
      {children}
    </div>
  );
}

export function WorkflowKanban() {
  const { rfqs, loading, error, updateRFQStatusOptimistic } = useRFQs();
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
    
    console.log('Drag end event:', { active: active.id, over: over?.id });

    if (!over) {
      console.log('No drop target found');
      setActiveRFQ(null);
      return;
    }

    const rfqId = active.id as string;
    const overData = over.data.current;
    
    // If dropped over a stage, use the stage ID
    let newStatus: RFQStatus;
    if (overData?.type === 'stage') {
      newStatus = overData.stageId;
    } else {
      // If dropped over another RFQ, get the stage from that RFQ
      const targetRFQ = rfqs.find(r => r.id === over.id);
      if (!targetRFQ) {
        console.log('Invalid drop target');
        setActiveRFQ(null);
        return;
      }
      newStatus = targetRFQ.status;
    }

    const currentRFQ = rfqs.find(r => r.id === rfqId);
    if (!currentRFQ || currentRFQ.status === newStatus) {
      console.log('No change needed');
      setActiveRFQ(null);
      return;
    }

    console.log('Updating RFQ status:', { rfqId, from: currentRFQ.status, to: newStatus });
    
    // Clear the drag overlay immediately
    setActiveRFQ(null);
    
    // Make the optimistic API call (this will update UI immediately)
    await updateRFQStatusOptimistic(rfqId, newStatus);
  }, [updateRFQStatusOptimistic, rfqs]);

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
              <DroppableStage
                key={stage.id}
                stageId={stage.id}
                stageName={stage.name}
                stageCount={stage.count}
              >
                <SortableContext
                  items={stageRFQs.map(rfq => rfq.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 transition-all duration-200" style={{ minHeight: '200px' }}>
                    {stageRFQs.map((rfq) => (
                      <div key={rfq.id} className="animate-fade-in">
                        <RFQCard rfq={rfq} />
                      </div>
                    ))}

                    {stageRFQs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No RFQs in this stage</p>
                        <p className="text-xs mt-1">Drag RFQs here to move them</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableStage>
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