// Country mapping utility for converting between full country names and ISO 3166-1 alpha-2 codes
export const COUNTRY_MAPPING: Record<string, string> = {
    // Full name to code
    'Vietnam': 'VN',
    'United States': 'US',
    'China': 'CN',
    'Japan': 'JP',
    'South Korea': 'KR',
    'Germany': 'DE',
    'France': 'FR',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'Singapore': 'SG',
    'India': 'IN',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Switzerland': 'CH',
    'Austria': 'AT',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'New Zealand': 'NZ',
    'Italy': 'IT',
    'Spain': 'ES',
};

// Reverse mapping for code to full name
export const COUNTRY_CODE_TO_NAME: Record<string, string> = Object.fromEntries(
    Object.entries(COUNTRY_MAPPING).map(([name, code]) => [code, name])
);

/**
 * Convert full country name to ISO 3166-1 alpha-2 country code
 * @param countryName - Full country name (e.g., "Vietnam")
 * @returns ISO 3166-1 alpha-2 country code (e.g., "VN") or empty string if not found
 */
export function getCountryCode(countryName: string): string {
    if (!countryName) return '';
    return COUNTRY_MAPPING[countryName] || '';
}

/**
 * Convert ISO 3166-1 alpha-2 country code to full country name
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "VN")
 * @returns Full country name (e.g., "Vietnam") or empty string if not found
 */
export function getCountryName(countryCode: string): string {
    if (!countryCode) return '';
    return COUNTRY_CODE_TO_NAME[countryCode] || '';
}

/**
 * Get all available countries for form selection
 * @returns Array of objects with code and name for form dropdown
 */
export function getAvailableCountries() {
    return Object.entries(COUNTRY_MAPPING).map(([name, code]) => ({
        code,
        name
    }));
}
