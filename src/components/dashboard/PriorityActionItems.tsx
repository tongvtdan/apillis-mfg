import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, Calendar } from "lucide-react";
import { Project } from "@/types/project";
import { ProjectSummaryCard } from "./ProjectSummaryCard";
import { format, isBefore, parseISO } from "date-fns";

interface PriorityActionItemsProps {
  projects: Project[];
}

export function PriorityActionItems({ projects }: PriorityActionItemsProps) {
  // Get top 3 priority projects that need immediate action
  const getTopPriorityProjects = useMemo(() => {
    // Enhanced urgency scoring function
    const getUrgencyScore = (project: Project): { score: number; reasons: string[] } => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Priority level scoring - highest weight
      if (project.priority_level === 'urgent') {
        score += 100;
        reasons.push('Urgent priority');
      } else if (project.priority_level === 'high') {
        score += 80;
        reasons.push('High priority');
      } else if (project.priority_level === 'medium') {
        score += 40;
      } else {
        score += 20;
      }

      // 2. Days in stage scoring - significant weight
      if (project.days_in_stage) {
        if (project.days_in_stage > 14) {
          score += 70;
          reasons.push(`${project.days_in_stage} days in stage`);
        } else if (project.days_in_stage > 7) {
          score += 50;
          reasons.push(`${project.days_in_stage} days in stage`);
        } else if (project.days_in_stage > 3) {
          score += 30;
        }
      }

      // 3. Delivery date scoring - critical for deadline-driven urgency
      if (project.estimated_delivery_date) {
        const deliveryDate = parseISO(project.estimated_delivery_date);
        const today = new Date();
        const daysUntilDelivery = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDelivery < 0) {
          // Overdue
          score += 90;
          reasons.push(`Delivery overdue by ${Math.abs(daysUntilDelivery)} days`);
        } else if (daysUntilDelivery <= 3) {
          // Due very soon
          score += 80;
          reasons.push(`Delivery due in ${daysUntilDelivery} days`);
        } else if (daysUntilDelivery <= 7) {
          // Due soon
          score += 60;
          reasons.push(`Delivery due in ${daysUntilDelivery} days`);
        }
      }

      // 4. Workflow stage scoring - certain stages need quicker action
      if (project.current_stage === 'quoted') {
        score += 40; // Needs decision
        reasons.push('Awaiting customer decision');
      } else if (project.current_stage === 'technical_review') {
        score += 35; // Blocking workflow
        reasons.push('Technical review pending');
      } else if (project.current_stage === 'inquiry_received') {
        score += 30; // Needs initial action
        reasons.push('New inquiry needs processing');
      }

      return { score, reasons };
    };

    // Score all projects for urgency
    const scoredProjects = projects.map(project => {
      const { score, reasons } = getUrgencyScore(project);
      return { project, score, reasons };
    });

    // Sort by score (descending) and take top 3
    const topUrgentProjects = scoredProjects
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => ({
        ...item.project,
        urgency_score: item.score,
        urgency_reasons: item.reasons
      }));

    console.log('Top urgent projects:', topUrgentProjects);

    return topUrgentProjects;
  }, [projects]);

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="relative">
            Priority Action Items
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500/40 dark:bg-red-500/30 rounded"></span>
          </span>
        </h2>
        <p className="text-sm text-red-700/70 dark:text-red-400/70 font-medium mt-1">
          Projects requiring immediate attention based on priority, delivery date, and time in stage
        </p>
      </div>
      <div className="space-y-3">
        {getTopPriorityProjects.length > 0 ? (
          getTopPriorityProjects.map((project) => (
            <ProjectSummaryCard key={project.id} project={project} showUrgencyIndicators={true} />
          ))
        ) : (
          <Card className="list-item list-item-active p-6 text-center border-dashed border-2 border-green-300 dark:border-green-800 bg-green-50/10 dark:bg-green-950/10">
            <div className="flex flex-col items-center gap-2 text-green-700 dark:text-green-400">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-semibold">All caught up!</p>
              <p className="text-xs">No urgent projects requiring immediate attention.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}