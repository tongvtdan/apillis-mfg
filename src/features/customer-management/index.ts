// Main Components
export { CustomerManagement } from './components/CustomerManagement';

// Types
export type {
    Customer,
    Contact,
    CustomerInteraction,
    CustomerSearchFilters,
    CustomerSearchResult,
    CustomerMetrics,
    CustomerHealthScore,
    CUSTOMER_STATUS_CONFIG,
    CUSTOMER_TYPE_CONFIG,
    CUSTOMER_TIER_CONFIG,
    CONTACT_RELATIONSHIP_CONFIG,
    CustomerStatus,
    CustomerType,
    CustomerTier,
    CustomerLifecycleStage
} from './types/customer-management.types';

// Services
export { CustomerManagementService } from './services/customerManagementService';

// Validation
export { customerSchema, contactSchema, customerInteractionSchema } from './types/customer-management.types';
