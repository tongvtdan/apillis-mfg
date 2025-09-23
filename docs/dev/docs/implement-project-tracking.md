Here’s the simplest, practical way to think about it: one table defines the “template” (what steps exist), another table records the “progress” (what’s happening for this specific project). The glue is a trigger that seeds sub-stages for the project when its stage changes, and a status lifecycle that moves each sub-stage from pending to done (possibly gated by approvals).

High-level model (who stores what)
- Templates (shared, not project-specific)
  - workflow_stages: the main phases (Inquiry, Technical Review, …).
  - workflow_sub_stages: the atomic steps inside each stage.
  - workflow_definitions: a versioned template per org.
  - workflow_definition_stages / workflow_definition_sub_stages: which stages/sub-stages are included in a given template, with overrides like order, requires_approval, etc.

- Project state (specific to one project)
  - projects.current_stage_id: which main stage the project is in right now.
  - projects.workflow_definition_id: which template/version that project follows.
  - project_sub_stage_progress: one row per sub-stage that applies to this project, holding the live status, timestamps, and assignee.

Lifecycle (how status moves)
1) When you set or change projects.current_stage_id:
   - Trigger seeds rows in project_sub_stage_progress for all sub-stages that are included by the project’s workflow_definition and belong to that stage.
   - First included sub-stage is set to in_progress, others pending (configurable).
2) Team members work the sub-stages:
   - pending → in_progress → completed (or skipped/blocked).
   - If a sub-stage requires approval (template override or base setting), “complete” is gated: the system creates an approvals record and holds status in in_review/blocked until approved.
3) When all required sub-stages of the current stage are completed:
   - The system (or a user with permissions) advances projects.current_stage_id to the next stage; the trigger seeds the next set of sub-stages.
   - Repeat until delivery/closure.

What to query (common questions)

A) What stage is the project in?
```sql
SELECT p.id, p.project_id, ws.id AS current_stage_id, ws.name AS current_stage_name, p.stage_entered_at
FROM projects p
JOIN workflow_stages ws ON ws.id = p.current_stage_id
WHERE p.id = :project_id;
```

B) Which sub-stages and statuses are active for this project right now?
```sql
SELECT
  wss.id          AS sub_stage_id,
  wss.name        AS sub_stage_name,
  COALESCE(wdss.sub_stage_order_override, wss.sub_stage_order) AS display_order,
  pssp.status,
  pssp.assigned_to,
  pssp.started_at,
  pssp.due_at,
  pssp.completed_at
FROM project_sub_stage_progress pssp
JOIN workflow_sub_stages wss  ON wss.id = pssp.sub_stage_id
LEFT JOIN projects p          ON p.id = pssp.project_id
LEFT JOIN workflow_definition_sub_stages wdss
       ON wdss.workflow_definition_id = p.workflow_definition_id
      AND wdss.workflow_sub_stage_id  = wss.id
WHERE pssp.project_id = :project_id
  AND pssp.workflow_stage_id = (SELECT current_stage_id FROM projects WHERE id = :project_id)
ORDER BY display_order;
```

C) Is the current stage complete yet?
```sql
WITH req AS (
  SELECT wss.id AS sub_stage_id
  FROM workflow_sub_stages wss
  JOIN projects p ON p.id = :project_id
  LEFT JOIN workflow_definition_sub_stages wdss
         ON wdss.workflow_definition_id = p.workflow_definition_id
        AND wdss.workflow_sub_stage_id  = wss.id
  WHERE wss.workflow_stage_id = p.current_stage_id
    AND COALESCE(wdss.is_included, true) = true
    AND COALESCE(wdss.can_skip_override, wss.is_required) = true
)
SELECT
  COUNT(*) FILTER (WHERE pssp.status = 'completed') AS required_completed,
  COUNT(*)                                          AS required_total,
  CASE
    WHEN COUNT(*) FILTER (WHERE pssp.status = 'completed') = COUNT(*) THEN true
    ELSE false
  END AS stage_complete
FROM req
JOIN project_sub_stage_progress pssp
  ON pssp.project_id = :project_id AND pssp.sub_stage_id = req.sub_stage_id;
```

D) What’s the next actionable step for the team?
- “Actionable” = the first included sub-stage in current stage with status in (pending, blocked) and not approval-gated or already awaiting approval.

```sql
WITH ctx AS (
  SELECT p.id AS project_id, p.current_stage_id, p.workflow_definition_id
  FROM projects p
  WHERE p.id = :project_id
),
included AS (
  SELECT
    wss.id AS sub_stage_id,
    COALESCE(wdss.sub_stage_order_override, wss.sub_stage_order) AS ord,
    COALESCE(wdss.requires_approval_override, wss.requires_approval) AS needs_approval
  FROM workflow_sub_stages wss
  JOIN ctx
  LEFT JOIN workflow_definition_sub_stages wdss
    ON wdss.workflow_definition_id = ctx.workflow_definition_id
   AND wdss.workflow_sub_stage_id  = wss.id
  WHERE wss.workflow_stage_id = ctx.current_stage_id
    AND COALESCE(wdss.is_included, true) = true
),
progress AS (
  SELECT i.sub_stage_id, i.ord, i.needs_approval, pssp.status
  FROM included i
  LEFT JOIN project_sub_stage_progress pssp
    ON pssp.project_id = :project_id
   AND pssp.sub_stage_id = i.sub_stage_id
)
SELECT sub_stage_id
FROM progress
WHERE status IN ('pending','blocked')
ORDER BY ord
LIMIT 1;
```

E) How do approvals gate completion?
- When client requests “complete sub-stage X,” call a server function that:
  - Checks if this sub-stage needs approval (template override wins).
  - If yes: create approvals row and set progress to in_review/blocked; exit without marking completed.
  - If no: mark status = completed, set completed_at = now().

Conceptual pseudo-SQL:
```sql
-- Pseudocode for finalize_sub_stage_with_approval
IF needs_approval(project_id, sub_stage_id) THEN
  PERFORM create_approval('project_sub_stage', progress_id, requested_by, sla_due_at);
  UPDATE project_sub_stage_progress SET status = 'in_review' WHERE id = progress_id;
ELSE
  UPDATE project_sub_stage_progress
    SET status = 'completed', completed_at = now()
  WHERE id = progress_id;
END IF;
```

Why this works project-by-project
- The catalogs (workflow_stages and workflow_sub_stages) describe the reusable steps.
- The project selects a workflow_definition (version) that says which of those steps apply and in what order.
- The project_sub_stage_progress table creates concrete, per-project rows for only the sub-stages that matter to this project and stores each one’s live status, timestamps, assignee, and due date.
- All dashboards and reports read from project_sub_stage_progress to show exactly where each project is, independent of others.

If you want, I can:
- Add a view that flattens “project → current stage → sub-stages + live status” for easy UI use.
- Add a function to auto-advance the stage once required sub-stages complete.
- Wire notifications to ping the next assignee when their sub-stage becomes actionable.

---

### Reliable ways to “track back” what stage and sub-stage were completed for any project.

What’s recorded where
- Sub-stage completion (per project)
  - project_sub_stage_progress: status lifecycle (pending → in_progress → in_review/blocked → completed), started_at, completed_at, assigned_to, workflow_stage_id, sub_stage_id.
- Stage completion (per project)
  - Derived from sub-stages: the stage is “complete” when all required sub-stages are completed; its completion timestamp is typically the latest completed_at among the required sub-stages in that stage.
- Stage transitions and “who did what”
  - activity_log: immutable trail of changes (e.g., projects.current_stage_id updates, progress status updates, with old_values/new_values and user_id).
  - approvals and approval_history: when a sub-stage is approval-gated, the approval decision timestamps and actors are recorded here.

Queries you can use immediately
1) List all completed sub-stages for a project (with stage and timestamp)
```sql
SELECT
  p.project_id,
  ws.name  AS stage_name,
  wss.name AS sub_stage_name,
  pssp.completed_at
FROM project_sub_stage_progress pssp
JOIN projects           p   ON p.id  = pssp.project_id
JOIN workflow_stages    ws  ON ws.id = pssp.workflow_stage_id
JOIN workflow_sub_stages wss ON wss.id = pssp.sub_stage_id
WHERE p.id = :project_id
  AND pssp.status = 'completed'
ORDER BY ws.stage_order, wss.sub_stage_order, pssp.completed_at;
```

1) Derive stage completion timestamps for a project
- If your rule is “stage completes when all required sub-stages complete,” use MAX(completed_at) across required sub-stages.
```sql
WITH required AS (
  SELECT
    wss.id AS sub_stage_id,
    ws.id  AS stage_id,
    ws.name AS stage_name
  FROM projects p
  JOIN workflow_stages ws ON ws.organization_id = p.organization_id
  JOIN workflow_sub_stages wss ON wss.workflow_stage_id = ws.id
  LEFT JOIN workflow_definition_sub_stages wdss
         ON wdss.workflow_definition_id = p.workflow_definition_id
        AND wdss.workflow_sub_stage_id  = wss.id
  WHERE p.id = :project_id
    AND COALESCE(wdss.is_included, true) = true
    AND COALESCE(wdss.can_skip_override, wss.is_required) = true
),
done AS (
  SELECT pssp.workflow_stage_id, pssp.sub_stage_id, pssp.completed_at
  FROM project_sub_stage_progress pssp
  WHERE pssp.project_id = :project_id
    AND pssp.status = 'completed'
)
SELECT
  r.stage_id,
  r.stage_name,
  MAX(d.completed_at) AS stage_completed_at
FROM required r
JOIN done d
  ON d.sub_stage_id = r.sub_stage_id
GROUP BY r.stage_id, r.stage_name
ORDER BY MIN(d.completed_at);
```

1) Extract stage transitions (old → new) from the audit log
- This assumes activity_log captures updates to projects.current_stage_id with old_values/new_values as JSONB.
```sql
SELECT
  al.created_at              AS changed_at,
  al.user_id                 AS changed_by,
  (al.old_values->>'current_stage_id')::uuid AS from_stage_id,
  (al.new_values->>'current_stage_id')::uuid AS to_stage_id
FROM activity_log al
WHERE al.entity_type = 'projects'
  AND al.entity_id   = :project_id
  AND (al.new_values ? 'current_stage_id')
ORDER BY al.created_at;
```
- Join to stage names if desired:
```sql
WITH trans AS (
  SELECT al.created_at, al.user_id,
         (al.old_values->>'current_stage_id')::uuid AS from_stage_id,
         (al.new_values->>'current_stage_id')::uuid AS to_stage_id
  FROM activity_log al
  WHERE al.entity_type = 'projects'
    AND al.entity_id   = :project_id
    AND (al.new_values ? 'current_stage_id')
)
SELECT
  t.created_at AS changed_at,
  u.name       AS changed_by_name,
  ws_from.name AS from_stage,
  ws_to.name   AS to_stage
FROM trans t
LEFT JOIN users u       ON u.id = t.user_id
LEFT JOIN workflow_stages ws_from ON ws_from.id = t.from_stage_id
LEFT JOIN workflow_stages ws_to   ON ws_to.id   = t.to_stage_id
ORDER BY t.changed_at;
```

1) Who completed a sub-stage (from audit trail)
- If your activity_log writes the new status into new_values, you can recover the actor and timestamp of completion:
```sql
SELECT
  wss.name AS sub_stage,
  al.created_at AS completed_at,
  u.name AS completed_by
FROM activity_log al
JOIN project_sub_stage_progress pssp ON pssp.id = al.entity_id
JOIN workflow_sub_stages wss ON wss.id = pssp.sub_stage_id
LEFT JOIN users u ON u.id = al.user_id
WHERE al.entity_type = 'project_sub_stage_progress'
  AND al.entity_id IN (
    SELECT id FROM project_sub_stage_progress WHERE project_id = :project_id
  )
  AND al.new_values->>'status' = 'completed'
ORDER BY completed_at;
```

Optional: persist explicit stage history
- Derived history from activity_log works, but many teams prefer an explicit table to simplify BI and reduce JSON parsing.

A) DDL: project_stage_history
```sql
CREATE TABLE IF NOT EXISTS project_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_stage_id uuid REFERENCES workflow_stages(id),
  to_stage_id uuid NOT NULL REFERENCES workflow_stages(id),
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by uuid REFERENCES users(id),
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_psh_project ON project_stage_history(project_id, changed_at);
```

B) Trigger: capture transitions on projects.current_stage_id
```sql
CREATE OR REPLACE FUNCTION log_project_stage_change()
RETURNS trigger AS $$
BEGIN
  IF NEW.current_stage_id IS DISTINCT FROM OLD.current_stage_id THEN
    INSERT INTO project_stage_history (
      project_id, from_stage_id, to_stage_id, changed_at, changed_by
    ) VALUES (
      NEW.id,
      OLD.current_stage_id,
      NEW.current_stage_id,
      now(),
      COALESCE(current_setting('app.user_id', true)::uuid, NULL)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_project_stage_change ON projects;
CREATE TRIGGER trg_log_project_stage_change
AFTER UPDATE OF current_stage_id ON projects
FOR EACH ROW
EXECUTE FUNCTION log_project_stage_change();
```

Optional: a convenience view for “project timeline”
- Unify stage changes, sub-stage completions, and approvals into one ordered feed.
```sql
CREATE OR REPLACE VIEW v_project_timeline AS
SELECT
  p.id AS project_id,
  'stage_change'::text AS event_type,
  psh.changed_at AS occurred_at,
  ws_from.name AS from_stage,
  ws_to.name   AS to_stage,
  psh.changed_by,
  NULL::text AS sub_stage,
  NULL::uuid AS approval_id
FROM project_stage_history psh
LEFT JOIN workflow_stages ws_from ON ws_from.id = psh.from_stage_id
LEFT JOIN workflow_stages ws_to   ON ws_to.id   = psh.to_stage_id

UNION ALL
SELECT
  pssp.project_id,
  'sub_stage_completed',
  pssp.completed_at,
  ws.name AS from_stage,
  ws.name AS to_stage,
  NULL::uuid AS changed_by,
  wss.name AS sub_stage,
  NULL::uuid AS approval_id
FROM project_sub_stage_progress pssp
JOIN workflow_stages ws ON ws.id = pssp.workflow_stage_id
JOIN workflow_sub_stages wss ON wss.id = pssp.sub_stage_id
WHERE pssp.status = 'completed' AND pssp.completed_at IS NOT NULL

UNION ALL
SELECT
  a.metadata->>'project_id'::uuid,
  'approval_decision',
  ah.action_at,
  NULL::text,
  NULL::text,
  ah.action_by,
  NULL::text,
  a.id AS approval_id
FROM approvals a
JOIN approval_history ah ON ah.approval_id = a.id;
```

Good practices to keep this accurate
- Always write a log entry on:
  - projects.current_stage_id changes.
  - project_sub_stage_progress.status transitions.
  - approval decisions (approval_history already does this).
- Ensure the seeding trigger sets started_at on the first actionable sub-stage of a stage and sets completed_at when marking “completed.”
- Index for reporting: project_sub_stage_progress(project_id), (project_id, workflow_stage_id), status, completed_at; activity_log(entity_type, entity_id); project_stage_history(project_id, changed_at).

Summary
- Yes: you can reconstruct exactly which stage and sub-stage completed, when, and by whom.
- Use project_sub_stage_progress for sub-stage truth, derive stage completion from required sub-stages, and read stage transitions from activity_log—or persist them neatly in project_stage_history via a small trigger.
- With these queries and the optional history table, you’ll have a clean, implementation-ready audit of stage/sub-stage completion per project.