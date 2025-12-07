/**
 * Utility to safely initialize and clean up browser storage (TypeScript Version)
 */

export const initializeAppStorage = (): boolean => {
  try {
    const testKey = '__app_storage_test__';

    // Test write
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);

    // Validate token format
    const token = localStorage.getItem('token');
    if (token && typeof token !== 'string') {
      console.warn('Invalid token format in storage, clearing...');
      localStorage.removeItem('token');
    }

    return true;
  } catch (error) {
    console.error('Storage initialization failed:', error);

    // Try to clean corrupted storage
    try {
      localStorage.clear();
      console.log('Cleared potentially corrupted storage');
    } catch (clearError) {
      console.error('Failed to clear storage:', clearError);
    }

    return false;
  }
};

/**
 * Clear only app-related keys, not full browser storage
 */
export const clearAppStorage = (): boolean => {
  try {
    const keysToRemove: string[] = ['token', 'user', 'auth'];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    return true;
  } catch (error) {
    console.error('Failed to clear app storage:', error);
    return false;
  }
};

/**
 * Safely check if localStorage is usable (Safari Private Mode can break it)
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};
