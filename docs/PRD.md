# Product Requirements Document: Apillis MFG Quote-to-Cash

## 1. Introduction

This document outlines the product requirements for the Apillis MFG Quote-to-Cash platform. This platform will streamline the entire process from receiving a customer Request for Quote (RFQ) to final production handover, improving efficiency, transparency, and accuracy.

## 2. Goals

*   To automate and accelerate the RFQ and quoting process.
*   To improve collaboration between internal teams (Engineering, QA, Production).
*   To provide a centralized platform for managing customer and supplier communications.
*   To enhance visibility and control over the quoting and approval workflows.
*   To integrate seamlessly with the existing ERP system for production handover.

## 3. User Personas

*   **Customer**: Submits RFQs and receives final quotes.
*   **Procurement Owner**: Manages the RFQ process, assigns reviews, and interacts with suppliers.
*   **Engineering Team**: Reviews RFQs for technical feasibility and identifies potential risks.
*   **QA Team**: Assesses quality requirements and testing procedures.
*   **Production Team**: Evaluates production capacity and timelines.
*   **Supplier**: Receives RFQs and submits quotes.
*   **Management**: Approves final customer quotes.

## 4. User Stories & Features

### 4.1. RFQ Intake

*   **As a Customer, I want to...**
    *   Submit an RFQ through a secure web portal.
    *   Upload multiple files (e.g., CAD models, specifications) with my RFQ.
    *   Receive a confirmation that my RFQ has been successfully submitted.

### 4.2. Internal Dashboard & Assignment

*   **As a Procurement Owner, I want to...**
    *   View all incoming RFQs on a centralized dashboard.
    *   Have the system automatically validate and identify key information from the RFQ.
    *   Assign RFQs to the appropriate internal teams (Engineering, QA, Production) for review.

### 4.3. Internal Review Workflow

*   **As an Engineer, I want to...**
    *   Receive notifications for RFQs that require my review.
    *   Review the technical specifications and assess feasibility.
    *   Document any potential risks or issues.
*   **As a QA Team Member, I want to...**
    *   Review the quality requirements for an RFQ.
    *   Define the necessary testing procedures.
*   **As a Production Planner, I want to...**
    *   Evaluate our current production capacity.
    *   Estimate the timeline for manufacturing the requested parts.

### 4.4. Supplier Management

*   **As a Procurement Owner, I want to...**
    *   Select and send RFQs to multiple suppliers.
    *   Manage a database of approved suppliers.
*   **As a Supplier, I want to...**
    *   Receive RFQs through a dedicated supplier portal.
    *   Submit my quote and any supporting documents through the portal.

### 4.5. Quoting & Approval

*   **As a Procurement Owner, I want to...**
    *   Compare quotes from different suppliers in a standardized format.
    *   Calculate the total cost roll-up for the customer quote.
    *   Generate a professional PDF of the final customer quote.
*   **As a Manager, I want to...**
    *   Review and approve the final customer quote before it's sent.

### 4.6. Production & Archiving

*   **As a Procurement Owner, I want to...**
    *   Hand over the approved quote to the production team.
    *   Integrate the quote information with our ERP system.
    *   Archive all RFQ and quote-related documents for future reference.
    *   Collect feedback to improve the quoting process.

## 5. Out of Scope

*   Customer invoicing and payment processing.
*   Detailed production scheduling and shop floor control.
*   Supplier onboarding and performance management.
