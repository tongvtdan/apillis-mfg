import React, { useEffect } from 'react';
import { useDocument } from '@/core/documents/DocumentProvider';

interface DocumentLoaderProps {
    projectId: string;
}

/**
 * Background document loader that loads documents for a project
 * without rendering any UI. This ensures documents are loaded
 * when the project details page loads, making them available
 * immediately when the user clicks on the Documents tab.
 */
export const DocumentLoader: React.FC<DocumentLoaderProps> = ({ projectId }) => {
    const { loadDocuments, projectId: currentProjectId } = useDocument();

    // Load documents when component mounts or projectId changes (only if not already loaded for this project)
    useEffect(() => {
        if (projectId && loadDocuments && currentProjectId !== projectId) {
            console.log('📄 DocumentLoader: Loading documents in background for project:', projectId);
            loadDocuments(projectId);
        } else if (projectId && !currentProjectId) {
            console.log('📄 DocumentLoader: Loading documents in background for project (no current project):', projectId);
            loadDocuments(projectId);
        }
    }, [projectId, loadDocuments, currentProjectId]);

    // This component doesn't render anything
    return null;
};
