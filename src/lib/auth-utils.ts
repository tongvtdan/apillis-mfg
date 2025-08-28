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
    console.log('🔐 Saving domain to localStorage:', domain);
    localStorage.setItem(AUTH_STORAGE_KEYS.DOMAIN, domain);
    console.log('✅ Domain saved successfully');
  } catch (error) {
    console.warn('❌ Failed to save domain to localStorage:', error);
  }
}

/**
 * Get saved domain from localStorage
 */
export function getSavedDomain(): string {
  try {
    const domain = localStorage.getItem(AUTH_STORAGE_KEYS.DOMAIN) || '';
    console.log('🔍 Retrieved domain from localStorage:', domain);
    return domain;
  } catch (error) {
    console.warn('❌ Failed to get domain from localStorage:', error);
    return '';
  }
}

/**
 * Save username to localStorage
 */
export function saveUsername(username: string): void {
  try {
    console.log('🔐 Saving username to localStorage:', username);
    localStorage.setItem(AUTH_STORAGE_KEYS.USERNAME, username);
    console.log('✅ Username saved successfully');
  } catch (error) {
    console.warn('❌ Failed to save username to localStorage:', error);
  }
}

/**
 * Get saved username from localStorage
 */
export function getSavedUsername(): string {
  try {
    const username = localStorage.getItem(AUTH_STORAGE_KEYS.USERNAME) || '';
    console.log('🔍 Retrieved username from localStorage:', username);
    return username;
  } catch (error) {
    console.warn('❌ Failed to get username from localStorage:', error);
    return '';
  }
}

/**
 * Save remember password preference
 */
export function saveRememberPassword(remember: boolean): void {
  try {
    console.log('🔐 Saving remember password preference:', remember);
    localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_PASSWORD, remember.toString());
    console.log('✅ Remember password preference saved successfully');
  } catch (error) {
    console.warn('❌ Failed to save remember password preference:', error);
  }
}

/**
 * Get remember password preference
 */
export function getRememberPassword(): boolean {
  try {
    const remember = localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_PASSWORD) === 'true';
    console.log('🔍 Retrieved remember password preference:', remember);
    return remember;
  } catch (error) {
    console.warn('❌ Failed to get remember password preference:', error);
    return false;
  }
}

/**
 * Save password to localStorage (only if remember is true)
 */
export function savePassword(password: string, remember: boolean): void {
  try {
    if (remember) {
      console.log('🔐 Saving password to localStorage (remember enabled)');
      localStorage.setItem(AUTH_STORAGE_KEYS.SAVED_PASSWORD, password);
      console.log('✅ Password saved successfully');
    } else {
      console.log('🗑️ Removing password from localStorage (remember disabled)');
      localStorage.removeItem(AUTH_STORAGE_KEYS.SAVED_PASSWORD);
      console.log('✅ Password removed successfully');
    }
  } catch (error) {
    console.warn('❌ Failed to save/remove password from localStorage:', error);
  }
}

/**
 * Get saved password from localStorage
 */
export function getSavedPassword(): string {
  try {
    const password = localStorage.getItem(AUTH_STORAGE_KEYS.SAVED_PASSWORD) || '';
    console.log('🔍 Retrieved password from localStorage:', password ? '***' : '(empty)');
    return password;
  } catch (error) {
    console.warn('❌ Failed to get password from localStorage:', error);
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
