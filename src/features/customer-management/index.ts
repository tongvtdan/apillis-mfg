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
    CustomerStatus,
    CustomerType,
    CustomerTier,
    CustomerLifecycleStage
} from './types/customer.types';

// Constants (export as values, not types)
export {
    CUSTOMER_STATUS_CONFIG,
    CUSTOMER_TYPE_CONFIG,
    CUSTOMER_TIER_CONFIG,
    CONTACT_RELATIONSHIP_CONFIG
} from './types/customer.types';

// Services
export { CustomerManagementService } from './services/customerManagementService';

// Validation
export { customerSchema, contactSchema, customerInteractionSchema } from './types/customer.types';
