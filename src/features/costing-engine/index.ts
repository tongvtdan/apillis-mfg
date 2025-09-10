// Main Components
export { CostingEngine } from './components/CostingEngine';

// Types
export type {
    CostItem,
    CostingScenario,
    CostingResult,
    ScenarioComparison,
    CostBreakdown,
    PricingRecommendation,
    CostCategory,
    CostType,
    MarginType,
    PricingStrategy
} from './types/costing-engine.types';

// Constants (export as values, not types)
export {
    COSTING_CONFIG
} from './types/costing-engine.types';

// Services
export { CostingEngineService } from './services/costingEngineService';

// Utilities
export { CostCalculations } from './types/costing-engine.types';
