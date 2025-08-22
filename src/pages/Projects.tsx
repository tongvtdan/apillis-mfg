import { WorkflowKanban } from "@/components/dashboard/WorkflowKanban";

export default function Projects() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Manage all your projects and their workflow stages</p>
      </div>
      <WorkflowKanban />
    </div>
  );
}