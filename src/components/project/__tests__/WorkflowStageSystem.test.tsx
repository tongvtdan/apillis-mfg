import { describe, it, expect } from 'vitest';

// Import the workflow stage system components to verify they can be imported
import { WorkflowStepper } from '../WorkflowStepper';
import { StageConfigurationPanel } from '../StageConfigurationPanel';
import { StageTransitionValidator } from '../StageTransitionValidator';
import { EnhancedStageProgression } from '../EnhancedStageProgression';

describe('Workflow Stage System Components', () => {
    it('should export WorkflowStepper component', () => {
        expect(WorkflowStepper).toBeDefined();
        expect(typeof WorkflowStepper).toBe('object'); // React.memo returns an object
    });

    it('should export StageConfigurationPanel component', () => {
        expect(StageConfigurationPanel).toBeDefined();
        expect(typeof StageConfigurationPanel).toBe('function');
    });

    it('should export StageTransitionValidator component', () => {
        expect(StageTransitionValidator).toBeDefined();
        expect(typeof StageTransitionValidator).toBe('function');
    });

    it('should export EnhancedStageProgression component', () => {
        expect(EnhancedStageProgression).toBeDefined();
        expect(typeof EnhancedStageProgression).toBe('function');
    });
});