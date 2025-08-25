import { Project, ProjectStatus } from "@/types/project";
import { SupplierQuote } from "@/types/supplier";

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
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
      warnings: []
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
          // Check exit criteria for technical review
          const technicalReviewCriteria = DEFAULT_EXIT_CRITERIA.technical_review;
          // In a real implementation, we would check actual review completion
          // For now, we'll assume it's completed if moving to next stage
          if (technicalReviewCriteria.length > 0) {
            result.warnings.push("Ensure all technical review tasks are completed");
          }
        }
        break;

      case 'supplier_rfq_sent':
        if (newStatus === 'quoted') {
          // Check that supplier quotes are received
          if (!supplierQuotes || supplierQuotes.length === 0) {
            result.errors.push("Supplier quotes are required before moving to Quoted stage");
          } else {
            const receivedQuotes = supplierQuotes.filter(q => q.status === 'received').length;
            const totalQuotes = supplierQuotes.length;
            
            if (receivedQuotes < totalQuotes) {
              result.errors.push(`All supplier quotes must be received (${receivedQuotes}/${totalQuotes} received)`);
            }
          }
        }
        break;

      case 'quoted':
        if (newStatus === 'order_confirmed') {
          // Check that quote has been sent to customer
          const quotedCriteria = DEFAULT_EXIT_CRITERIA.quoted;
          if (quotedCriteria.length > 0) {
            result.warnings.push("Ensure quote has been sent to customer and follow-up deadline is set");
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
}