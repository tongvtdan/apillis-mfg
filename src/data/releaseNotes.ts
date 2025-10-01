// Release notes data structure
// This file contains the release notes for the application
// Maximum of 5 release notes will be displayed in the settings

export interface ReleaseNote {
    version: string;
    date: string;
    title: string;
    description: string;
    features?: string[];
    improvements?: string[];
    bugFixes?: string[];
    breaking?: string[];
}

export const releaseNotes: ReleaseNote[] = [
    {
        version: "0.1.6",
        date: "2025-10-01",
        title: "Supplier Management & Release Notes System",
        description: "Major improvements to supplier management with bulk import capabilities and comprehensive release notes system.",
        features: [
            "Supplier bulk import system with CSV/Excel support",
            "Enhanced supplier import modal with progress tracking",
            "Comprehensive release notes system in Settings",
            "Structured version tracking and changelog display"
        ],
        improvements: [
            "Streamlined supplier onboarding workflow",
            "Enhanced import validation and error handling",
            "Better user experience for bulk operations",
            "Improved Settings page with detailed version information"
        ],
        bugFixes: [
            "Resolved supplier import validation issues",
            "Fixed debug code cleanup in supplier modules",
            "Corrected version display inconsistencies",
            "Improved error messaging for failed imports"
        ]
    },
    {
        version: "0.1.2",
        date: "2025-29-9",
        title: "Public alpha Release",
        description: "First release of Factory Pulse Manufacturing Execution System with core functionality.",

        features: [
            "User authentication and role-based access control",
            "Project management with complete RFQ-to-delivery workflow",
            "Customer and supplier management",
            "Document management system",
            "Dashboard with real-time analytics",
            "Approval system with configurable workflows"
        ],
        improvements: [],
        bugFixes: []
    }
];

// Get the latest release notes (max 5)
export const getLatestReleaseNotes = (limit: number = 5): ReleaseNote[] => {
    return releaseNotes.slice(0, limit);
};

// Get release note by version
export const getReleaseNoteByVersion = (version: string): ReleaseNote | undefined => {
    return releaseNotes.find(note => note.version === version);
};