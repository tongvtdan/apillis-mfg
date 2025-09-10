// Main Components
export { IntakeForm } from './components/IntakeForm';

// Types
export type {
    IntakeFormData,
    IntakeSubmissionType,
    IntakeSubmissionResult,
    VolumeItem,
    DocumentItem,
    CustomerSearchResult,
    ContactSearchResult,
    SUBMISSION_TYPE_CONFIG
} from './types/intake.types';

// Services
export { IntakeService } from './services/intakeService';

// Hooks
export { useIntakeForm } from './hooks/useIntakeForm';
export { useIntakeCustomers } from './hooks/useIntakeCustomers';

// Validation
export { IntakeValidation } from './validations/intakeValidation';
export { intakeFormSchema } from './validations/intakeValidation';
