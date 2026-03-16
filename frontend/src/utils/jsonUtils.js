/**
 * Safe JSON parsing utilities
 * Prevents JSON.parse errors with proper error handling
 */

/**
 * Safely parse JSON from localStorage
 * @param {string} key - localStorage key
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} Parsed data or default value
 */
export const safeParseJSON = (key, defaultValue = null) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored || stored === '') {
      return defaultValue;
    }
    
    const parsed = JSON.parse(stored);
    return parsed !== null ? parsed : defaultValue;
  } catch (error) {
    console.error(`Error parsing JSON from localStorage key "${key}":`, error);
    // Clear corrupted data
    localStorage.removeItem(key);
    return defaultValue;
  }
};

/**
 * Safely parse JSON array from localStorage
 * @param {string} key - localStorage key
 * @returns {Array} Parsed array or empty array
 */
export const safeParseJSONArray = (key) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored || stored === '') {
      return [];
    }
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error parsing JSON array from localStorage key "${key}":`, error);
    // Clear corrupted data
    localStorage.removeItem(key);
    return [];
  }
};

/**
 * Safely parse JSON object from localStorage
 * @param {string} key - localStorage key
 * @returns {Object} Parsed object or empty object
 */
export const safeParseJSONObject = (key) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored || stored === '') {
      return {};
    }
    
    const parsed = JSON.parse(stored);
    return (parsed !== null && typeof parsed === 'object') ? parsed : {};
  } catch (error) {
    console.error(`Error parsing JSON object from localStorage key "${key}":`, error);
    // Clear corrupted data
    localStorage.removeItem(key);
    return {};
  }
};

/**
 * Safely save data to localStorage as JSON
 * @param {string} key - localStorage key
 * @param {any} data - Data to save
 * @returns {boolean} Success status
 */
export const safeSaveJSON = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving JSON to localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Safely parse JSON from API response
 * @param {Response} response - Fetch response object
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {Promise<any>} Parsed data or default value
 */
export const safeParseResponseJSON = async (response, defaultValue = null) => {
  try {
    const text = await response.text();
    if (!text) {
      return defaultValue;
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error parsing response JSON:', error);
    return defaultValue;
  }
};
