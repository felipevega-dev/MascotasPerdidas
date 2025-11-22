// Format reward with currency
export function formatReward(amount: string | undefined, currency: string = 'USD'): string {
    if (!amount) return '';

    const currencySymbols: Record<string, string> = {
        'USD': '$',
        'MXN': '$',
        'EUR': '€',
        'GBP': '£',
        'COP': '$',
        'ARS': '$',
        'CLP': '$',
    };

    const symbol = currencySymbols[currency] || '$';
    
    // Return formatted string with symbol and currency code
    return `${symbol}${amount} ${currency}`;
}

// Get currency symbol only
export function getCurrencySymbol(currency: string = 'USD'): string {
    const currencySymbols: Record<string, string> = {
        'USD': '$',
        'MXN': '$',
        'EUR': '€',
        'GBP': '£',
        'COP': '$',
        'ARS': '$',
        'CLP': '$',
    };

    return currencySymbols[currency] || '$';
}

// Format number with thousands separator
export function formatNumber(value: string): string {
    // Remove any non-digit characters except dots and commas
    const cleaned = value.replace(/[^\d.,]/g, '');
    
    // Split by decimal point
    const parts = cleaned.split(/[.,]/);
    
    if (parts.length === 0) return '';
    
    // Format the integer part with thousands separator
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Add decimal part if exists
    if (parts.length > 1) {
        return `${integerPart}.${parts[1]}`;
    }
    
    return integerPart;
}
