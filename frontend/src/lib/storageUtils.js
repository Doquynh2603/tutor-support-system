/**
 * Utility to safely initialize and clean up browser storage
 */

export const initializeAppStorage = () => {
  try {
    // Check if localStorage is accessible
    const testKey = '__app_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);

    // Try to parse stored token to ensure it's not corrupted
    const token = localStorage.getItem('token');
    if (token && typeof token !== 'string') {
      console.warn('Invalid token format in storage, clearing...');
      localStorage.removeItem('token');
    }

    return true;
  } catch (error) {
    console.error('Storage initialization failed:', error);
    try {
      localStorage.clear();
      console.log('Cleared potentially corrupted storage');
    } catch (clearError) {
      console.error('Failed to clear storage:', clearError);
    }
    return false;
  }
};

export const clearAppStorage = () => {
  try {
    // Clear only app-related keys, not browser defaults
    const keysToRemove = ['token', 'user', 'auth'];
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Failed to clear app storage:', error);
    return false;
  }
};

export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};
