/**
 * Authentication utility functions
 */

/**
 * Extract domain from email address
 * @param email - Full email address
 * @returns Domain part without http/www
 */
export function extractDomain(email: string): string {
  if (!email || !email.includes('@')) return '';
  
  const domain = email.split('@')[1];
  if (!domain) return '';
  
  // Remove http://, https://, www. prefixes
  return domain.replace(/^(https?:\/\/)?(www\.)?/, '');
}

/**
 * Build full email from username and domain
 * @param username - Username part
 * @param domain - Domain part
 * @returns Full email address
 */
export function buildEmail(username: string, domain: string): string {
  if (!username || !domain) return '';
  return `${username}@${domain}`;
}

/**
 * Local storage keys for authentication preferences
 */
const AUTH_STORAGE_KEYS = {
  DOMAIN: 'auth_domain',
  USERNAME: 'auth_username',
  REMEMBER_PASSWORD: 'auth_remember_password',
  SAVED_PASSWORD: 'auth_saved_password'
} as const;

/**
 * Save domain to localStorage
 */
export function saveDomain(domain: string): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.DOMAIN, domain);
  } catch (error) {
    console.warn('Failed to save domain to localStorage:', error);
  }
}

/**
 * Get saved domain from localStorage
 */
export function getSavedDomain(): string {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.DOMAIN) || '';
  } catch (error) {
    console.warn('Failed to get domain from localStorage:', error);
    return '';
  }
}

/**
 * Save username to localStorage
 */
export function saveUsername(username: string): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.USERNAME, username);
  } catch (error) {
    console.warn('Failed to save username to localStorage:', error);
  }
}

/**
 * Get saved username from localStorage
 */
export function getSavedUsername(): string {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.USERNAME) || '';
  } catch (error) {
    console.warn('Failed to get username from localStorage:', error);
    return '';
  }
}

/**
 * Save remember password preference
 */
export function saveRememberPassword(remember: boolean): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_PASSWORD, remember.toString());
  } catch (error) {
    console.warn('Failed to save remember password preference:', error);
  }
}

/**
 * Get remember password preference
 */
export function getRememberPassword(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_PASSWORD) === 'true';
  } catch (error) {
    console.warn('Failed to get remember password preference:', error);
    return false;
  }
}

/**
 * Save password to localStorage (only if remember is true)
 */
export function savePassword(password: string, remember: boolean): void {
  try {
    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEYS.SAVED_PASSWORD, password);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.SAVED_PASSWORD);
    }
  } catch (error) {
    console.warn('Failed to save/remove password from localStorage:', error);
  }
}

/**
 * Get saved password from localStorage
 */
export function getSavedPassword(): string {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.SAVED_PASSWORD) || '';
  } catch (error) {
    console.warn('Failed to get password from localStorage:', error);
    return '';
  }
}

/**
 * Clear all saved authentication data
 */
export function clearSavedAuthData(): void {
  try {
    Object.values(AUTH_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear authentication data from localStorage:', error);
  }
}
