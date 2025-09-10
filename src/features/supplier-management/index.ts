// Main Components
export { SupplierManagement } from './components/SupplierManagement';

// Types
export type {
    Supplier,
    RFQ,
    SupplierResponse,
    SupplierSearchFilters,
    SupplierSearchResult,
    SupplierPerformance,
    SupplierStatus,
    SupplierType,
    QualificationStatus,
    RFQWorkflowState
} from './types/supplier-management.types';

// Constants (export as values, not types)
export {
    QUALIFICATION_CRITERIA,
    SUPPLIER_STATUS_CONFIG,
    SUPPLIER_TYPE_CONFIG,
    QUALIFICATION_STATUS_CONFIG,
    RFQ_STATUS_CONFIG
} from './types/supplier-management.types';

// Services
export { SupplierManagementService } from './services/supplierManagementService';

// Validation
export { supplierSchema, rfqSchema, supplierResponseSchema } from './types/supplier-management.types';
