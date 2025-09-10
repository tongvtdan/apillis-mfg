import { useState, useCallback, useEffect } from 'react';
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/core/auth';
import { useDocument } from '@/core/documents';
import { IntakeFormData, IntakeSubmissionType, IntakeSubmissionResult, DocumentProcessingStatus, DocumentUploadMode } from '../types/intake.types';
import { intakeFormSchema } from '../validations/intakeValidation';
import { IntakeService } from '../services/intakeService';

export interface UseIntakeFormOptions {
    submissionType: IntakeSubmissionType;
    onSuccess?: (projectId: string) => void;
    onError?: (error: string) => void;
}

export interface IntakeFormState {
    isSubmitting: boolean;
    isSubmitted: boolean;
    submitResult: IntakeSubmissionResult | null;
    documentProcessing: DocumentProcessingStatus[];
    tempProjectId: string;
    isGeneratingId: boolean;
}

export function useIntakeForm(options: UseIntakeFormOptions) {
    const { submissionType, onSuccess, onError } = options;
    const { user, profile } = useAuth();

    // Form state
    const form = useForm<IntakeFormData>({
        resolver: zodResolver(intakeFormSchema),
        defaultValues: {
            intakeType: submissionType,
            priority: 'normal',
            agreedToTerms: false,
            documents: [
                { type: 'Drawing', description: 'Technical drawing or specification' },
                { type: 'BOM', description: 'Bill of Materials' }
            ]
        }
    });

    // Volume and document field arrays
    const volumeFields = useFieldArray({
        control: form.control,
        name: 'volumes'
    });

    const documentFields = useFieldArray({
        control: form.control,
        name: 'documents'
    });

    // Component state
    const [state, setState] = useState<IntakeFormState>({
        isSubmitting: false,
        isSubmitted: false,
        submitResult: null,
        documentProcessing: [],
        tempProjectId: '',
        isGeneratingId: true
    });

    // Document upload modes
    const [documentModes, setDocumentModes] = useState<Record<number, DocumentUploadMode>>({});

    // Generate project ID on mount
    useEffect(() => {
        const generateId = async () => {
            if (profile?.organization_id) {
                try {
                    const projectId = await IntakeService['generateProjectId'](profile.organization_id);
                    setState(prev => ({
                        ...prev,
                        tempProjectId: projectId,
                        isGeneratingId: false
                    }));
                } catch (error) {
                    console.error('Failed to generate project ID:', error);
                    setState(prev => ({ ...prev, isGeneratingId: false }));
                }
            }
        };

        generateId();
    }, [profile?.organization_id]);

    // Submit handler
    const submitForm = useCallback(async (data: IntakeFormData) => {
        if (!user?.id || !profile?.organization_id) {
            onError?.('User not authenticated');
            return;
        }

        setState(prev => ({ ...prev, isSubmitting: true }));

        try {
            const result = await IntakeService.submitIntakeForm(data, profile.organization_id, user.id);

            setState(prev => ({
                ...prev,
                isSubmitting: false,
                isSubmitted: true,
                submitResult: result
            }));

            if (result.success && result.projectId) {
                onSuccess?.(result.projectId);
            } else if (result.error) {
                onError?.(result.error);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Submission failed';
            setState(prev => ({
                ...prev,
                isSubmitting: false,
                submitResult: { success: false, error: errorMessage }
            }));
            onError?.(errorMessage);
        }
    }, [user?.id, profile?.organization_id, onSuccess, onError]);

    // Reset form
    const resetForm = useCallback(() => {
        form.reset();
        setState({
            isSubmitting: false,
            isSubmitted: false,
            submitResult: null,
            documentProcessing: [],
            tempProjectId: '',
            isGeneratingId: true
        });
        setDocumentModes({});
    }, [form]);

    // Add volume item
    const addVolume = useCallback((volume: any) => {
        volumeFields.append(volume);
    }, [volumeFields]);

    // Remove volume item
    const removeVolume = useCallback((index: number) => {
        volumeFields.remove(index);
    }, [volumeFields]);

    // Add document
    const addDocument = useCallback((document: any) => {
        documentFields.append(document);
        // Initialize document mode
        setDocumentModes(prev => ({
            ...prev,
            [documentFields.fields.length]: 'none'
        }));
    }, [documentFields]);

    // Remove document
    const removeDocument = useCallback((index: number) => {
        documentFields.remove(index);
        // Clean up document mode
        setDocumentModes(prev => {
            const newModes = { ...prev };
            delete newModes[index];
            // Shift indices for remaining documents
            Object.keys(newModes).forEach(key => {
                const keyNum = parseInt(key);
                if (keyNum > index) {
                    newModes[keyNum - 1] = newModes[keyNum];
                    delete newModes[keyNum];
                }
            });
            return newModes;
        });
    }, [documentFields]);

    // Update document mode
    const updateDocumentMode = useCallback((index: number, mode: DocumentUploadMode) => {
        setDocumentModes(prev => ({ ...prev, [index]: mode }));
    }, []);

    // Get form validation state
    const getValidationState = useCallback(() => {
        const formData = form.getValues();
        return IntakeService.validateIntakeForm(formData);
    }, [form]);

    // Check if form can be submitted
    const canSubmit = useCallback(() => {
        const formData = form.getValues();
        return IntakeService.canSubmitForm(formData) && !state.isSubmitting;
    }, [form, state.isSubmitting]);

    return {
        // Form state
        form,
        volumeFields,
        documentFields,

        // Component state
        ...state,

        // Document management
        documentModes,
        updateDocumentMode,

        // Actions
        submitForm,
        resetForm,
        addVolume,
        removeVolume,
        addDocument,
        removeDocument,

        // Validation
        getValidationState,
        canSubmit,

        // Metadata
        submissionType,
        config: IntakeService.getIntakeConfig(submissionType)
    };
}
