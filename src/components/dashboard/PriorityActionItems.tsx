import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Project } from "@/types/project";
import { ProjectSummaryCard } from "./ProjectSummaryCard";

interface PriorityActionItemsProps {
  projects: Project[];
}

export function PriorityActionItems({ projects }: PriorityActionItemsProps) {
  // Get top 3 priority projects that need immediate action
  const getTopPriorityProjects = useMemo(() => {
    const urgentProjects = projects
      .filter(p =>
        // Filter for active projects that need action
        ['inquiry_received', 'technical_review', 'supplier_rfq_sent', 'quoted'].includes(p.status) &&
        // Include projects with high priority, overdue, or urgent status  
        (p.priority === 'high' || p.priority === 'urgent' || p.days_in_stage > 7)
      )
      .sort((a, b) => {
        // Priority scoring for sorting (higher score = more urgent)
        const getPriorityScore = (project: Project) => {
          let score = 0;
          // Priority weight
          if (project.priority === 'urgent') score += 100;
          else if (project.priority === 'high') score += 80;
          else if (project.priority === 'medium') score += 40;
          else score += 20;

          // Days in stage weight (more days = higher urgency)
          if (project.days_in_stage > 14) score += 50;
          else if (project.days_in_stage > 7) score += 30;
          else if (project.days_in_stage > 3) score += 10;

          // Status urgency weight
          if (project.status === 'quoted') score += 25; // Needs decision
          else if (project.status === 'technical_review') score += 20; // Blocking workflow
          else if (project.status === 'inquiry_received') score += 15; // Needs initial action

          return score;
        };

        return getPriorityScore(b) - getPriorityScore(a);
      })
      .slice(0, 3);

    // If we don't have enough urgent projects, fill with recent active projects
    if (urgentProjects.length < 3) {
      const remainingSlots = 3 - urgentProjects.length;
      const urgentIds = new Set(urgentProjects.map(p => p.id));
      const recentActiveProjects = projects
        .filter(p =>
          ['inquiry_received', 'technical_review', 'supplier_rfq_sent', 'quoted'].includes(p.status) &&
          !urgentIds.has(p.id)
        )
        .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
        .slice(0, remainingSlots);

      return [...urgentProjects, ...recentActiveProjects];
    }

    return urgentProjects;
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
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500/60 to-transparent dark:from-red-500/40 rounded"></span>
          </span>
        </h2>
        <p className="text-sm text-red-700/70 dark:text-red-400/70 font-medium mt-1">
          Projects requiring immediate attention based on priority, urgency, and time in stage
        </p>
      </div>
      <div className="space-y-3">
        {getTopPriorityProjects.length > 0 ? (
          getTopPriorityProjects.map((project) => (
            <ProjectSummaryCard key={project.id} project={project} showUrgencyIndicators={true} />
          ))
        ) : (
          <Card className="enhanced-list-item enhanced-list-item-active p-6 text-center border-dashed border-2 border-green-300 dark:border-green-800 bg-gradient-to-r from-green-50/40 to-transparent dark:from-green-950/20">
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