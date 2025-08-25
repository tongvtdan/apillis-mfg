/**
 * Utility functions to trigger the global update animation in the header
 */

export const showUpdateNotification = (message: string = "Updating project status...") => {
    window.dispatchEvent(new CustomEvent('show-project-update', { detail: { message } }));
};

export const hideUpdateNotification = () => {
    window.dispatchEvent(new CustomEvent('hide-project-update'));
};


