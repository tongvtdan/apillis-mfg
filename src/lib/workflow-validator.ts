import { Project, ProjectStatus } from "@/types/project";
import { SupplierQuote } from "@/types/supplier";
import { UserRole } from "@/types/auth";

export interface WorkflowValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    canAutoAdvance: boolean;
    requiresManagerApproval: boolean;
    autoAdvanceReason?: string;
}

export interface WorkflowBypassRequest {
    reason: string;
    comment: string;
    requestedBy: string;
    requestedAt: Date;
}

export interface ExitCriteria {
    technical_review: string[];
    supplier_rfq_sent: string[];
    quoted: string[];
    order_confirmed: string[];
    procurement_planning: string[];
    in_production: string[];
    shipped_closed: string[];
}

export const DEFAULT_EXIT_CRITERIA: ExitCriteria = {
    technical_review: [
        "Engineering review completed",
        "QA inspection requirements defined",
        "Production process evaluation completed"
    ],
    supplier_rfq_sent: [
        "BOM breakdown completed",
        "Suppliers selected",
        "RFQs sent to all suppliers"
    ],
    quoted: [
        "All supplier quotes received",
        "Internal costing finalized",
        "Quote document generated"
    ],
    order_confirmed: [
        "Customer PO received",
        "Internal sales order created"
    ],
    procurement_planning: [
        "Purchase orders finalized",
        "Production schedule confirmed",
        "Raw materials inventory confirmed"
    ],
    in_production: [
        "Work order released",
        "Manufacturing started"
    ],
    shipped_closed: [
        "Product shipped",
        "Proof of delivery received",
        "Customer feedback collected"
    ]
};

export class WorkflowValidator {
    static async validateStatusChange(
        project: Project,
        newStatus: ProjectStatus,
        supplierQuotes?: SupplierQuote[]
    ): Promise<WorkflowValidationResult> {
        const result: WorkflowValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            canAutoAdvance: false,
            requiresManagerApproval: false
        };

        // Check if the status change is valid (can't go backwards except for specific cases)
        const currentStageIndex = this.getStageIndex(project.status);
        const newStageIndex = this.getStageIndex(newStatus);

        // Prevent moving backwards in workflow unless specifically allowed
        if (newStageIndex < currentStageIndex && !this.isBackwardMovementAllowed(project.status, newStatus)) {
            result.isValid = false;
            result.errors.push(`Cannot move project backwards from ${this.getStageName(project.status)} to ${this.getStageName(newStatus)}`);
            return result;
        }

        // Check if current stage exit criteria are met for auto-advance
        const currentStageComplete = this.isStageComplete(project, project.status);
        const isNextStage = newStageIndex === currentStageIndex + 1;

        if (currentStageComplete && isNextStage) {
            result.canAutoAdvance = true;
            result.autoAdvanceReason = `All exit criteria for ${this.getStageName(project.status)} are met. Project can automatically advance to ${this.getStageName(newStatus)}.`;
        }

        // Validate exit criteria based on current status
        switch (project.status) {
            case 'inquiry_received':
                if (newStatus === 'technical_review') {
                    // Check that required fields are filled
                    if (!project.customer_id) {
                        result.errors.push("Customer information is required");
                    }
                    if (!project.description) {
                        result.warnings.push("Project description is recommended");
                    }
                }
                break;

            case 'technical_review':
                if (newStatus === 'supplier_rfq_sent') {
                    if (!this.areReviewCriteriaMet(project)) {
                        result.requiresManagerApproval = true;
                        result.warnings.push("Technical review criteria not fully met. Manager approval required or complete all reviews.");
                    }
                }
                break;

            case 'supplier_rfq_sent':
                if (newStatus === 'quoted') {
                    if (supplierQuotes && supplierQuotes.length > 0) {
                        const receivedQuotes = supplierQuotes.filter(q => q.status === 'received').length;
                        const totalQuotes = supplierQuotes.length;

                        if (receivedQuotes < totalQuotes) {
                            result.requiresManagerApproval = true;
                            result.warnings.push(`Not all supplier quotes received (${receivedQuotes}/${totalQuotes} received). Manager approval required.`);
                        }
                    } else {
                        result.requiresManagerApproval = true;
                        result.warnings.push("No supplier quotes found. Manager approval required to proceed.");
                    }
                }
                break;

            case 'quoted':
                if (newStatus === 'order_confirmed') {
                    if (!project.estimated_value) {
                        result.requiresManagerApproval = true;
                        result.warnings.push("Quote value not set. Manager approval required.");
                    }
                }
                break;

            case 'order_confirmed':
                if (newStatus === 'procurement_planning') {
                    // Check that PO is received
                    const orderConfirmedCriteria = DEFAULT_EXIT_CRITERIA.order_confirmed;
                    if (orderConfirmedCriteria.length > 0) {
                        result.warnings.push("Ensure internal sales order is created");
                    }
                }
                break;

            case 'procurement_planning':
                if (newStatus === 'in_production') {
                    const procurementCriteria = DEFAULT_EXIT_CRITERIA.procurement_planning;
                    if (procurementCriteria.length > 0) {
                        result.warnings.push("Ensure all procurement and planning tasks are completed");
                    }
                }
                break;

            case 'in_production':
                if (newStatus === 'shipped_closed') {
                    const productionCriteria = DEFAULT_EXIT_CRITERIA.in_production;
                    if (productionCriteria.length > 0) {
                        result.warnings.push("Ensure all production tasks are completed and product is shipped");
                    }
                }
                break;
        }

        // Set validity based on errors
        result.isValid = result.errors.length === 0;
        return result;
    }

    static getStageIndex(status: ProjectStatus): number {
        const stages: ProjectStatus[] = [
            'inquiry_received',
            'technical_review',
            'supplier_rfq_sent',
            'quoted',
            'order_confirmed',
            'procurement_planning',
            'in_production',
            'shipped_closed'
        ];
        return stages.indexOf(status);
    }

    static getStageName(status: ProjectStatus): string {
        const stageNames: Record<ProjectStatus, string> = {
            inquiry_received: "Inquiry Received",
            technical_review: "Technical Review",
            supplier_rfq_sent: "Supplier RFQ Sent",
            quoted: "Quoted",
            order_confirmed: "Order Confirmed",
            procurement_planning: "Procurement & Planning",
            in_production: "In Production",
            shipped_closed: "Shipped & Closed"
        };
        return stageNames[status] || status;
    }

    static isBackwardMovementAllowed(currentStatus: ProjectStatus, newStatus: ProjectStatus): boolean {
        // Define specific cases where backward movement is allowed
        const allowedBackwardMovements: [ProjectStatus, ProjectStatus][] = [
            // Add specific cases if needed
        ];

        return allowedBackwardMovements.some(([from, to]) => from === currentStatus && to === newStatus);
    }

    static getNextValidStages(currentStatus: ProjectStatus): ProjectStatus[] {
        const currentIndex = this.getStageIndex(currentStatus);
        const allStages: ProjectStatus[] = [
            'inquiry_received',
            'technical_review',
            'supplier_rfq_sent',
            'quoted',
            'order_confirmed',
            'procurement_planning',
            'in_production',
            'shipped_closed'
        ];

        // Return next stages (forward movement only)
        return allStages.slice(currentIndex + 1);
    }

    static canMoveToStage(project: Project, targetStage: ProjectStatus): boolean {
        const currentIndex = this.getStageIndex(project.status);
        const targetIndex = this.getStageIndex(targetStage);

        // Can't move backwards unless specifically allowed
        if (targetIndex < currentIndex && !this.isBackwardMovementAllowed(project.status, targetStage)) {
            return false;
        }

        // Check if current stage exit criteria are met for forward movement
        if (targetIndex > currentIndex) {
            return this.isStageComplete(project, project.status);
        }

        return true;
    }

    static getExitCriteriaForStage(status: ProjectStatus): string[] {
        return DEFAULT_EXIT_CRITERIA[status] || [];
    }

    static isStageComplete(project: Project, status: ProjectStatus): boolean {
        switch (status) {
            case 'inquiry_received':
                return !!(project.customer_id && project.description);

            case 'technical_review':
                return !!(project.engineering_reviewer_id &&
                    project.qa_reviewer_id &&
                    project.production_reviewer_id);

            case 'supplier_rfq_sent':
                // Check if supplier quotes are received (implement based on your data model)
                // For now, allow transition but show warning
                return true;

            case 'quoted':
                return !!(project.estimated_value && project.due_date);

            case 'order_confirmed':
                // Customer PO received - for MVP, assume it's complete
                return true;

            case 'procurement_planning':
                // Purchase orders finalized - for MVP, assume it's complete
                return true;

            case 'in_production':
                // Work order released - for MVP, assume it's complete
                return true;

            case 'shipped_closed':
                // Product shipped - for MVP, assume it's complete
                return true;

            default:
                return false;
        }
    }

    static getStageProgress(project: Project): {
        currentStage: ProjectStatus;
        nextStage: ProjectStatus | null;
        canAdvance: boolean;
        exitCriteria: string[];
        completedCriteria: string[];
        pendingCriteria: string[];
    } {
        const currentStage = project.status;
        const nextStages = this.getNextValidStages(currentStage);
        const nextStage = nextStages.length > 0 ? nextStages[0] : null;
        const canAdvance = nextStage ? this.canMoveToStage(project, nextStage) : false;
        const exitCriteria = this.getExitCriteriaForStage(currentStage);

        // For MVP, we'll show all criteria as pending since we don't have detailed tracking yet
        const completedCriteria: string[] = [];
        const pendingCriteria = exitCriteria;

        return {
            currentStage,
            nextStage,
            canAdvance,
            exitCriteria,
            completedCriteria,
            pendingCriteria
        };
    }

    /**
     * Check if user role can bypass workflow validation
     */
    static canBypassWorkflow(userRole?: UserRole): boolean {
        if (!userRole) return false;

        // Only Management and Procurement Owner roles can bypass workflow
        return userRole === 'Management' || userRole === 'Procurement Owner';
    }

    /**
     * Check if technical review criteria are met
     */
    private static areReviewCriteriaMet(project: Project): boolean {
        return !!(project.engineering_reviewer_id &&
            project.qa_reviewer_id &&
            project.production_reviewer_id);
    }

    /**
     * Auto-advance project to next stage if criteria are met
     */
    static async checkAndAutoAdvance(
        project: Project,
        supplierQuotes?: SupplierQuote[]
    ): Promise<{ shouldAdvance: boolean; nextStage: ProjectStatus | null; reason: string }> {
        const currentStageComplete = this.isStageComplete(project, project.status);

        if (!currentStageComplete) {
            return { shouldAdvance: false, nextStage: null, reason: "Exit criteria not met" };
        }

        const nextStages = this.getNextValidStages(project.status);
        if (nextStages.length === 0) {
            return { shouldAdvance: false, nextStage: null, reason: "Already at final stage" };
        }

        const nextStage = nextStages[0];
        const canAdvance = this.canMoveToStage(project, nextStage);

        if (canAdvance) {
            return {
                shouldAdvance: true,
                nextStage,
                reason: `Auto-advancing to ${this.getStageName(nextStage)} - all exit criteria met`
            };
        }

        return { shouldAdvance: false, nextStage: null, reason: "Cannot advance to next stage" };
    }
}