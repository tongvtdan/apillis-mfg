import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Project, ProjectStatus, PROJECT_STAGES } from "@/types/project";
import { useProjects } from "@/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectTableProps {
  projects: Project[];
}

const statusVariants = {
  inquiry_received: "bg-blue-100 text-blue-800",
  technical_review: "bg-orange-100 text-orange-800",
  supplier_rfq_sent: "bg-purple-100 text-purple-800",
  quoted: "bg-yellow-100 text-yellow-800",
  order_confirmed: "bg-green-100 text-green-800",
  procurement_planning: "bg-teal-100 text-teal-800",
  in_production: "bg-indigo-100 text-indigo-800",
  shipped_closed: "bg-gray-100 text-gray-800",
} as const;

const priorityVariants = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
} as const;

export function ProjectTable({ projects }: ProjectTableProps) {
  const { updateProjectStatusOptimistic } = useProjects();
  const navigate = useNavigate();

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    await updateProjectStatusOptimistic(projectId, newStatus);
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Project</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Lead Time</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <div className="cursor-pointer hover:text-primary" onClick={() => handleViewProject(project.id)}>
                  <div className="font-semibold">{project.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {project.project_id}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{project.customer?.company || project.contact_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {project.contact_email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={project.status}
                  onValueChange={(value: ProjectStatus) => handleStatusChange(project.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <Badge className={statusVariants[project.status as keyof typeof statusVariants]}>
                        {PROJECT_STAGES.find(s => s.id === project.status)?.name || project.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STAGES.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <Badge className={statusVariants[stage.id as keyof typeof statusVariants]}>
                            {stage.name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge className={priorityVariants[project.priority as keyof typeof priorityVariants]}>
                  {project.priority?.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    Unassigned
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {project.due_date
                    ? `${Math.ceil((new Date(project.due_date).getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24))} days`
                    : 'TBD'
                  }
                </div>
              </TableCell>
              <TableCell>
                {project.estimated_value && (
                  <div className="font-medium">
                    ${project.estimated_value.toLocaleString()}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleViewProject(project.id)}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}