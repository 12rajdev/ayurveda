// API Configuration
const API_CONFIG = {
    // Base URL for API calls
    // In production, this will automatically use the deployed URL
    // In development, it uses localhost:3000
    BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : window.location.origin,
    
    // API Endpoints
    ENDPOINTS: {
        UPLOAD_IMAGE: '/upload-image',
        GET_USERS: '/get-users',
        SAVE_USERS: '/save-users',
        GET_ORDERS: '/get-orders',
        SAVE_ORDERS: '/save-orders',
        GET_PRODUCTS: '/get-products',
        SAVE_PRODUCTS: '/save-products'
    }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + endpoint;
}
