/**
 * Nexus API Client
 * Handles communication with Planet Nine services via the Nexus server
 */

class NexusAPIClient {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.timeout = 10000; // 10 second timeout
        this.retryAttempts = 3;
    }

    /**
     * Make a request to the Nexus API with error handling and retries
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`🌐 API Request (attempt ${attempt}): ${options.method || 'GET'} ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log(`✅ API Success: ${endpoint}`, data);
                return data;
                
            } catch (error) {
                console.warn(`⚠️ API Request failed (attempt ${attempt}):`, error.message);
                
                if (attempt === this.retryAttempts) {
                    console.error(`❌ API Request failed after ${this.retryAttempts} attempts:`, error);
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    /**
     * GET request helper
     */
    async get(endpoint, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * POST request helper
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request helper
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request helper
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // === Base Management API ===

    /**
     * Get connected bases status
     */
    async getBasesStatus() {
        return this.get('/api/bases/status');
    }

    /**
     * Get available bases for discovery
     */
    async getAvailableBases() {
        return this.get('/api/bases/available');
    }

    /**
     * Connect to a new base
     */
    async connectToBase(baseUrl, baseConfig = {}) {
        return this.post('/api/bases/connect', {
            url: baseUrl,
            config: baseConfig
        });
    }

    /**
     * Disconnect from a base
     */
    async disconnectFromBase(baseId) {
        return this.delete(`/api/bases/${baseId}/disconnect`);
    }

    // === Service Health API ===

    /**
     * Check health of specific services
     */
    async checkServicesHealth(services = []) {
        return this.post('/api/services/health', {
            services
        });
    }

    /**
     * Get overall service status
     */
    async getServicesStatus() {
        return this.get('/api/services/status');
    }

    // === Content & Social API ===

    /**
     * Get aggregated content feed from all connected bases
     */
    async getContentFeed(options = {}) {
        const params = {
            limit: options.limit || 20,
            offset: options.offset || 0,
            types: options.types ? options.types.join(',') : '',
            bases: options.bases ? options.bases.join(',') : ''
        };
        
        return this.get('/api/content/feed', params);
    }

    /**
     * Get content from specific app type
     */
    async getAppContent(appType, options = {}) {
        const params = {
            limit: options.limit || 20,
            offset: options.offset || 0,
            bases: options.bases ? options.bases.join(',') : ''
        };
        
        return this.get(`/api/content/${appType}`, params);
    }

    // === Communications API ===

    /**
     * Get StackChat conversations
     */
    async getConversations(options = {}) {
        const params = {
            limit: options.limit || 10,
            bases: options.bases ? options.bases.join(',') : ''
        };
        
        return this.get('/api/communications/conversations', params);
    }

    /**
     * Send a message via StackChat
     */
    async sendMessage(conversationId, message, messageType = 'text') {
        return this.post('/api/communications/send', {
            conversationId,
            message,
            type: messageType
        });
    }

    /**
     * Start new conversation
     */
    async startConversation(participants, baseId) {
        return this.post('/api/communications/conversations', {
            participants,
            baseId
        });
    }

    // === Shopping API ===

    /**
     * Get products from Sanora across all bases
     */
    async getProducts(options = {}) {
        const params = {
            limit: options.limit || 20,
            offset: options.offset || 0,
            category: options.category || '',
            bases: options.bases ? options.bases.join(',') : '',
            search: options.search || ''
        };
        
        return this.get('/api/shopping/products', params);
    }

    /**
     * Get product categories
     */
    async getProductCategories() {
        return this.get('/api/shopping/categories');
    }

    /**
     * Get product details
     */
    async getProductDetails(productId, baseId) {
        return this.get(`/api/shopping/products/${productId}`, { baseId });
    }

    // === Authentication API ===

    /**
     * Initialize sessionless authentication
     */
    async initializeAuth() {
        return this.get('/api/auth/init');
    }

    /**
     * Authenticate with sessionless keys
     */
    async authenticate(publicKey, signature, message) {
        return this.post('/api/auth/verify', {
            publicKey,
            signature,
            message
        });
    }

    /**
     * Get current user profile
     */
    async getUserProfile() {
        return this.get('/api/auth/profile');
    }

    // === Utility Methods ===

    /**
     * Test connection to Nexus server
     */
    async ping() {
        try {
            const response = await this.get('/api/ping');
            return { success: true, ...response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get Nexus server information
     */
    async getServerInfo() {
        return this.get('/api/info');
    }

    /**
     * Handle offline scenarios with cached data
     */
    getCachedData(key) {
        try {
            const cached = localStorage.getItem(`nexus_cache_${key}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.warn('Failed to get cached data:', error);
            return null;
        }
    }

    setCachedData(key, data, expiryMinutes = 10) {
        try {
            const cached = {
                data,
                expiry: Date.now() + (expiryMinutes * 60 * 1000)
            };
            localStorage.setItem(`nexus_cache_${key}`, JSON.stringify(cached));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    }

    isCacheValid(key) {
        try {
            const cached = localStorage.getItem(`nexus_cache_${key}`);
            if (!cached) return false;
            
            const parsed = JSON.parse(cached);
            return Date.now() < parsed.expiry;
        } catch (error) {
            return false;
        }
    }
}

// Create global API client instance
const nexusAPI = new NexusAPIClient();

// Make it available globally for easy access
if (typeof window !== 'undefined') {
    window.nexusAPI = nexusAPI;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NexusAPIClient, nexusAPI };
}