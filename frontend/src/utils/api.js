// API Configuration and Helper Functions
const getBaseUrl = () => {
    // If running on localhost, look for local backend
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    // Otherwise (production/Vercel), point to Render backend
    return 'https://vitalityfit-backend.onrender.com';
};

const API_URL = getBaseUrl();

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// API Helper Functions
export const api = {
    // GET request
    get: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // POST request
    post: async (endpoint, data) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // PUT request
    put: async (endpoint, data) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // DELETE request
    delete: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    }
};

// Export API_URL for direct usage if needed
export { API_URL };
