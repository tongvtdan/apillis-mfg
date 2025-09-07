# Workflow Stages and Sub-Stages Documentation

## Overview
This document provides a comprehensive overview of all workflow stages and their associated sub-stages extracted from the backup file `backups_factory_pulse_data_backup_20250906_151600.sql`.

## Workflow Stages Summary

| Stage Order | Stage Name           | Slug                 | Description                                                           | Color   | Responsible Roles              | Estimated Duration (Days) | Status |
| ----------- | -------------------- | -------------------- | --------------------------------------------------------------------- | ------- | ------------------------------ | ------------------------- | ------ |
| 1           | Inquiry Received     | inquiry_received     | Customer RFQ submitted and initial review completed                   | #3B82F6 | sales, procurement             | 20                        | Active |
| 2           | Technical Review     | technical_review     | Engineering, QA, and Production teams review technical requirements   | #F59E0B | engineering, qa, production    | 10                        | Active |
| 3           | Supplier RFQ Sent    | supplier_rfq_sent    | RFQs sent to qualified suppliers for component pricing and lead times | #F97316 | procurement                    | 5                         | Active |
| 4           | Quoted               | quoted               | Customer quote generated and sent based on supplier responses         | #10B981 | sales, procurement             | 5                         | Active |
| 5           | Order Confirmed      | order_confirmed      | Customer accepted quote and order confirmed                           | #6366F1 | sales, procurement, production | 5                         | Active |
| 6           | Procurement Planning | procurement_planning | BOM finalized, purchase orders issued, material planning completed    | #8B5CF6 | procurement, production        | 5                         | Active |
| 7           | Production           | production           | Manufacturing process initiated and quality control implemented       | #84CC16 | production, qa                 | 4                         | Active |
| 8           | Completed            | completed            | Order fulfilled and delivered to customer                             | #6B7280 | sales, production              | 3                         | Active |

## Detailed Workflow Stages

### Stage 1: Inquiry Received 
**Exit Criteria:** RFQ reviewed, customer requirements understood, initial feasibility assessment completed

**Sub-Stages:**

| Sub-Stage Order | Name                                | Slug                                | Description                                                                 | Responsible Roles  | Duration (Hours) | Required | Can Skip | Auto Advance | Requires Approval | Approval Roles |
| --------------- | ----------------------------------- | ----------------------------------- | --------------------------------------------------------------------------- | ------------------ | ---------------- | -------- | -------- | ------------ | ----------------- | -------------- |
| 1               | RFQ Documentation Review            | rfq_documentation_review            | Review and validate all customer RFQ documents and requirements             | sales, procurement | 2                | Yes      | No       | No           | No                | -              |
| 2               | Initial Feasibility Assessment      | initial_feasibility_assessment      | Quick assessment of project feasibility and resource availability           | sales, engineering | 4                | Yes      | No       | No           | No                | -              |
| 3               | Customer Requirements Clarification | customer_requirements_clarification | Contact customer to clarify any unclear requirements or missing information | sales              | 3                | No       | Yes      | No           | No                | -              |

---

### Stage 2: Technical Review
**Exit Criteria:** All technical reviews completed, feasibility confirmed, requirements clarified

**Sub-Stages:**

| Sub-Stage Order | Name                             | Slug                             | Description                                                                     | Responsible Roles           | Duration (Hours) | Required | Can Skip | Auto Advance | Requires Approval | Approval Roles              |
| --------------- | -------------------------------- | -------------------------------- | ------------------------------------------------------------------------------- | --------------------------- | ---------------- | -------- | -------- | ------------ | ----------------- | --------------------------- |
| 1               | Engineering Technical Review     | engineering_technical_review     | Engineering team reviews technical specifications and design requirements       | engineering                 | 8                | Yes      | No       | No           | Yes               | engineering                 |
| 2               | QA Requirements Review           | qa_requirements_review           | QA team reviews quality requirements and testing specifications                 | qa                          | 6                | Yes      | No       | No           | Yes               | qa                          |
| 3               | Production Capability Assessment | production_capability_assessment | Production team assesses manufacturing capabilities and capacity                | production                  | 4                | Yes      | No       | No           | Yes               | production                  |
| 4               | Cross-Team Review Meeting        | cross_team_review_meeting        | Final cross-team review meeting to align on technical approach and requirements | engineering, qa, production | 2                | Yes      | No       | No           | Yes               | engineering, qa, production |

---

### Stage 3: Supplier RFQ Sent 
**Exit Criteria:** All supplier RFQs sent, responses received and evaluated

**Sub-Stages:**

| Sub-Stage Order | Name                         | Slug                         | Description                                                      | Responsible Roles | Duration (Hours) | Required | Can Skip | Auto Advance | Requires Approval | Approval Roles |
| --------------- | ---------------------------- | ---------------------------- | ---------------------------------------------------------------- | ----------------- | ---------------- | -------- | -------- | ------------ | ----------------- | -------------- |
| 1               | Supplier Identification      | supplier_identification      | Identify and qualify potential suppliers for required components | procurement       | 4                | Yes      | No       | No           | No                | -              |
| 2               | RFQ Preparation              | rfq_preparation              | Prepare detailed RFQ documents for each identified supplier      | procurement       | 6                | Yes      | No       | No           | No                | -              |
| 3               | RFQ Distribution             | rfq_distribution             | Send RFQs to qualified suppliers and track submissions           | procurement       | 2                | Yes      | No       | No           | No                | -              |
| 4               | Supplier Response Collection | supplier_response_collection | Collect and organize supplier responses and quotes               | procurement       | 8                | Yes      | No       | No           | No                | -              |

---

### Stage 4: Quoted 
**Exit Criteria:** Customer quote generated, pricing approved, terms negotiated

**Sub-Stages:**

| Sub-Stage Order | Name                      | Slug                      | Description                                               | Responsible Roles  | Duration (Hours) | Required | Can Skip | Auto Advance | Requires Approval | Approval Roles |
| --------------- | ------------------------- | ------------------------- | --------------------------------------------------------- | ------------------ | ---------------- | -------- | -------- | ------------ | ----------------- | -------------- |
| 1               | Cost Analysis             | cost_analysis             | Analyze supplier quotes and calculate total project costs | procurement, sales | 6                | Yes      | No       | No           | Yes               | procurement    |
| 2               | Quote Preparation         | quote_preparation         | Prepare customer quote with pricing and terms             | sales              | 4                | Yes      | No       | No           | Yes               | sales          |
| 3               | Quote Review and Approval | quote_review_and_approval | Internal review and approval of customer quote            | sales, management  | 2                | Yes      | No       | No           | Yes               | management     |
| 4               | Quote Submission          | quote_submission          | Submit quote to customer and track response               | sales              | 1                | Yes      | No       | No           | No                | -              |

---

### Stage 5: Order Confirmed 
**Exit Criteria:** Customer PO received, contract signed, production planning initiated

**Sub-Stages:**

| Sub-Stage Order | Name                           | Slug                           | Description                                           | Responsible Roles  | Duration (Hours) | Required | Can Skip | Auto Advance | Requires Approval | Approval Roles |
| --------------- | ------------------------------ | ------------------------------ | ----------------------------------------------------- | ------------------ | ---------------- | -------- | -------- | ------------ | ----------------- | -------------- |
| 1               | Customer PO Review             | customer_po_review             | Review customer purchase order and confirm acceptance | sales, procurement | 4                | Yes      | No       | No           | Yes               | sales          |
| 2               | Contract Finalization          | contract_finalization          | Finalize contract terms and legal documentation       | sales, management  | 8                | Yes      | No       | No           | Yes               | management     |
| 3               | Production Planning Initiation | production_planning_initiation | Initiate production planning and resource allocation  | production, sales  | 6                | Yes      | No       | No           | No                | -              |

---

### Stage 6: Procurement Planning 
**Exit Criteria:** All purchase orders issued, material delivery schedule confirmed

**Sub-Stages:**

| Sub-Stage Order | Name                             | Slug                             | Description                                               | Responsible Roles        | Duration (Hours) | Required | Can Skip | Auto Advance | Requires Approval | Approval Roles |
| --------------- | -------------------------------- | -------------------------------- | --------------------------------------------------------- | ------------------------ | ---------------- | -------- | -------- | ------------ | ----------------- | -------------- |
| 1               | BOM Finalization                 | bom_finalization                 | Finalize Bill of Materials and component specifications   | engineering, procurement | 8                | Yes      | No       | No           | Yes               | engineering    |
| 2               | Purchase Order Issuance          | purchase_order_issuance          | Issue purchase orders to suppliers for required materials | procurement              | 6                | Yes      | No       | No           | No                | -              |
| 3               | Material Planning                | material_planning                | Plan material requirements and inventory management       | procurement, production  | 4                | Yes      | No       | No           | No                | -              |
| 4               | Production Schedule Confirmation | production_schedule_confirmation | Confirm production schedule and resource allocation       | production               | 4                | Yes      | No       | No           | Yes               | production     |

---

### Stage 7: Production 
**Exit Criteria:** Production completed, quality checks passed, ready for shipping

**Sub-Stages:**

| Sub-Stage Order | Name                         | Slug                         | Description                                          | Responsible Roles | Duration (Hours) | Required | Can Skip | Auto Advance | Requires Approval | Approval Roles |
| --------------- | ---------------------------- | ---------------------------- | ---------------------------------------------------- | ----------------- | ---------------- | -------- | -------- | ------------ | ----------------- | -------------- |
| 1               | Manufacturing Setup          | manufacturing_setup          | Set up manufacturing equipment and workstations      | production        | 8                | Yes      | No       | No           | No                | -              |
| 2               | Assembly Process             | assembly_process             | Execute assembly process according to specifications | production        | 16               | Yes      | No       | No           | No                | -              |
| 3               | Quality Control Testing      | quality_control_testing      | Perform quality control tests and inspections        | qa, production    | 8                | Yes      | No       | No           | Yes               | qa             |
| 4               | Final Assembly and Packaging | final_assembly_and_packaging | Complete final assembly and prepare for shipping     | production        | 4                | Yes      | No       | No           | No                | -              |

---

### Stage 8: Completed 
**Exit Criteria:** Order delivered, customer satisfied, project closed

**Sub-Stages:**

| Sub-Stage Order | Name                  | Slug                  | Description                                                  | Responsible Roles | Duration (Hours) | Required | Can Skip | Auto Advance | Requires Approval | Approval Roles |
| --------------- | --------------------- | --------------------- | ------------------------------------------------------------ | ----------------- | ---------------- | -------- | -------- | ------------ | ----------------- | -------------- |
| 1               | Shipping Preparation  | shipping_preparation  | Prepare shipping documentation and arrange logistics         | sales, production | 4                | Yes      | No       | No           | No                | -              |
| 2               | Product Delivery      | product_delivery      | Deliver product to customer and obtain delivery confirmation | sales             | 2                | Yes      | No       | No           | No                | -              |
| 3               | Project Documentation | project_documentation | Complete project documentation and archive records           | sales, production | 4                | Yes      | No       | No           | No                | -              |
| 4               | Project Closure       | project_closure       | Final project closure and customer feedback collection       | sales             | 2                | Yes      | No       | No           | Yes               | sales          |

## Workflow Statistics

### Total Stages: 8
### Total Sub-Stages: 30

### Sub-Stages by Stage:
- Stage 1 (Inquiry Received): 3 sub-stages
- Stage 2 (Technical Review): 4 sub-stages
- Stage 3 (Supplier RFQ Sent): 4 sub-stages
- Stage 4 (Quoted): 4 sub-stages
- Stage 5 (Order Confirmed): 3 sub-stages
- Stage 6 (Procurement Planning): 4 sub-stages
- Stage 7 (Production): 4 sub-stages
- Stage 8 (Completed): 4 sub-stages

### Approval Requirements:
- **Stages requiring approval:** 2, 4, 5, 6, 7, 8 (6 out of 8 stages)
- **Total sub-stages requiring approval:** 9 out of 30

### Estimated Durations:
- **Total estimated duration:** 30 days across all stages
- **Longest stage:** Inquiry Received (20 days)
- **Shortest stage:** Completed (3 days)

## Notes
- All stages are currently active
- Most sub-stages are required (cannot be skipped)
- Only 1 sub-stage allows skipping (Customer Requirements Clarification)
- No sub-stages have auto-advance enabled
