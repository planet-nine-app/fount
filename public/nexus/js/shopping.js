/**
 * Shopping Page - Real Sanora Integration
 * Fetches products from Sanora bases and enables purchases
 */

// Current environment and product state
let currentEnvironment = 'dev';
let currentProducts = [];
let selectedProduct = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛍️ Shopping page loaded - initializing...');

    // Set initial environment
    initializeEnvironment();

    // Load products
    loadProducts();
});

/**
 * Initialize environment configuration
 */
function initializeEnvironment() {
    // Check if environment config is available
    if (typeof getEnvironmentConfig === 'function') {
        const config = getEnvironmentConfig();
        currentEnvironment = config.env;

        // Update UI
        const envSelect = document.getElementById('environment-select');
        if (envSelect) {
            envSelect.value = currentEnvironment;
        }

        console.log(`🌍 Environment initialized: ${currentEnvironment}`);
    } else {
        console.warn('⚠️ Environment config not available, using default: dev');
    }
}

/**
 * Switch environment and reload products
 */
function switchEnvironment() {
    const envSelect = document.getElementById('environment-select');
    if (!envSelect) return;

    const newEnv = envSelect.value;
    console.log(`🔄 Switching environment from ${currentEnvironment} to ${newEnv}`);

    currentEnvironment = newEnv;

    // Switch environment if function is available
    if (typeof nexusEnv !== 'undefined' && nexusEnv.switch) {
        nexusEnv.switch(newEnv);
    }

    // Reload products
    loadProducts();
}

/**
 * Get Sanora base URL for current environment
 */
function getSanoraUrl() {
    const environments = {
        'dev': 'https://dev.sanora.allyabase.com',
        'test': 'http://localhost:5121', // First test base
        'local': 'http://localhost:7243'
    };

    return environments[currentEnvironment] || environments['dev'];
}

/**
 * Get Addie base URL for current environment
 */
function getAddieUrl() {
    const environments = {
        'dev': 'https://dev.addie.allyabase.com',
        'test': 'http://localhost:5116', // First test base
        'local': 'http://localhost:3005'
    };

    return environments[currentEnvironment] || environments['dev'];
}

/**
 * Load products from Sanora
 */
async function loadProducts() {
    console.log(`🔍 Loading products from Sanora (${currentEnvironment})...`);

    // Show loading state
    showLoadingState();

    try {
        const sanoraUrl = getSanoraUrl();
        const endpoint = `${sanoraUrl}/products/base`;

        console.log(`📡 Fetching from: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Received response:`, data);

        // Process products
        const products = processProductsResponse(data);

        if (products.length === 0) {
            showEmptyState();
        } else {
            currentProducts = products;
            displayProducts(products);
        }

    } catch (error) {
        console.error('❌ Failed to load products:', error);
        showErrorState(error.message);
    }
}

/**
 * Process products response from Sanora
 */
function processProductsResponse(data) {
    let products = [];

    console.log('🔄 Processing products response...');

    try {
        // Handle different response formats
        if (Array.isArray(data)) {
            // Check if array contains nested product objects (from seeding)
            data.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    // Extract products from nested object structure
                    Object.keys(item).forEach(key => {
                        if (item[key] && typeof item[key] === 'object' && item[key].title) {
                            products.push(item[key]);
                        }
                    });
                } else if (item && item.title) {
                    // Direct product object
                    products.push(item);
                }
            });
        } else if (data.products && Array.isArray(data.products)) {
            // Wrapped in products array
            products = data.products;
        } else if (data.data && Array.isArray(data.data)) {
            // Wrapped in data array
            products = data.data;
        } else if (typeof data === 'object') {
            // Single product object
            products = [data];
        }

        // Filter and validate products
        products = products.filter(product => {
            return product &&
                   product.title &&
                   typeof product.price !== 'undefined';
        });

        console.log(`✅ Processed ${products.length} valid products`);
        return products;

    } catch (error) {
        console.error('❌ Error processing products:', error);
        return [];
    }
}

/**
 * Display products in grid
 */
function displayProducts(products) {
    console.log(`🎨 Displaying ${products.length} products`);

    const container = document.getElementById('products-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Create product cards
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });

    // Show products container
    showProductsState();
}

/**
 * Create a product card element
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => openProductModal(product);

    // Format price
    const formattedPrice = formatPrice(product.price);

    // Get product icon
    const productIcon = getProductIcon(product);

    // Truncate description
    const maxDescription = 120;
    const description = product.description || 'No description available';
    const truncatedDescription = description.length > maxDescription
        ? description.substring(0, maxDescription) + '...'
        : description;

    card.innerHTML = `
        <div class="product-image">
            ${product.imageURL ? `<img src="${product.imageURL}" alt="${product.title}" />` : productIcon}
        </div>
        <div class="product-content">
            <h3 class="product-title">${escapeHtml(product.title)}</h3>
            <p class="product-description">${escapeHtml(truncatedDescription)}</p>
            <div class="product-footer">
                <div class="product-price">${formattedPrice}</div>
                <div class="product-meta">
                    ${product.uuid ? `<div class="product-uuid">${product.uuid.substring(0, 8)}...</div>` : ''}
                    ${product.timestamp ? `<div class="product-date">${formatDate(product.timestamp)}</div>` : ''}
                </div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Get product icon based on type or title
 */
function getProductIcon(product) {
    const title = (product.title || '').toLowerCase();
    const type = (product.type || '').toLowerCase();

    if (type.includes('magical') || title.includes('wand')) return '🪄';
    if (type.includes('ebook') || title.includes('book')) return '📚';
    if (type.includes('course') || title.includes('tutorial')) return '🎓';
    if (type.includes('physical') || title.includes('sticker')) return '📦';
    if (type.includes('music') || title.includes('song')) return '🎵';
    if (type.includes('video') || title.includes('movie')) return '🎬';
    if (type.includes('game') || title.includes('software')) return '🎮';

    return '🛍️'; // Default shopping icon
}

/**
 * Format price for display
 */
function formatPrice(price) {
    if (typeof price !== 'number') return 'Price Unknown';

    // Assume price is in cents
    const dollarAmount = price / 100;
    return `$${dollarAmount.toFixed(2)}`;
}

/**
 * Format date for display
 */
function formatDate(timestamp) {
    try {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    } catch (error) {
        return 'Unknown';
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Open product details modal
 */
function openProductModal(product) {
    console.log('👁️ Opening product modal:', product.title);

    selectedProduct = product;

    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-product-details');

    if (!modal || !modalTitle || !modalDetails) return;

    // Set modal title
    modalTitle.textContent = product.title;

    // Generate product details
    const productIcon = getProductIcon(product);
    const formattedPrice = formatPrice(product.price);

    modalDetails.innerHTML = `
        <div class="modal-product-image">
            ${product.imageURL ? `<img src="${product.imageURL}" alt="${product.title}" />` : productIcon}
        </div>
        <div class="modal-product-info">
            <h3>${escapeHtml(product.title)}</h3>
            <div class="price">${formattedPrice}</div>
            <div class="description">${escapeHtml(product.description || 'No description available')}</div>
        </div>
        <div class="modal-product-meta">
            <h4>Product Information</h4>
            ${product.uuid ? `<div class="meta-item"><span class="meta-label">UUID:</span><span class="meta-value">${product.uuid}</span></div>` : ''}
            ${product.productId ? `<div class="meta-item"><span class="meta-label">Product ID:</span><span class="meta-value">${product.productId}</span></div>` : ''}
            ${product.timestamp ? `<div class="meta-item"><span class="meta-label">Created:</span><span class="meta-value">${formatDate(product.timestamp)}</span></div>` : ''}
            ${product.type ? `<div class="meta-item"><span class="meta-label">Type:</span><span class="meta-value">${product.type}</span></div>` : ''}
        </div>
    `;

    // Show modal
    modal.style.display = 'flex';

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Close product modal
 */
function closeProductModal() {
    console.log('❌ Closing product modal');

    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
    }

    // Reset modal state
    const paymentSection = document.getElementById('payment-section');
    const modalFooter = document.querySelector('.modal-footer');

    if (paymentSection) {
        paymentSection.style.display = 'none';
    }

    if (modalFooter) {
        modalFooter.style.display = 'flex';
    }

    // Clear payment form
    if (paymentElement) {
        paymentElement.unmount();
        paymentElement = null;
    }

    stripe = null;
    elements = null;

    // Restore body scroll
    document.body.style.overflow = 'auto';

    selectedProduct = null;
}

/**
 * Purchase selected product
 */
async function purchaseProduct() {
    if (!selectedProduct) {
        showStatusMessage('No product selected', 'error');
        return;
    }

    console.log('💳 Initiating purchase for:', selectedProduct.title);

    try {
        // Show payment section and hide the footer
        const paymentSection = document.getElementById('payment-section');
        const modalFooter = document.querySelector('.modal-footer');

        if (paymentSection && modalFooter) {
            modalFooter.style.display = 'none';
            paymentSection.style.display = 'block';

            // Set the total amount
            const totalAmountEl = document.getElementById('total-amount');
            if (totalAmountEl) {
                totalAmountEl.textContent = formatPrice(selectedProduct.price);
            }

            // Initialize Stripe payment
            await initializeStripePayment(selectedProduct);
        }

    } catch (error) {
        console.error('❌ Purchase initialization failed:', error);
        showStatusMessage(`Purchase failed: ${error.message}`, 'error');
    }
}

// Stripe variables
let stripe;
let elements;
let paymentElement;

/**
 * Initialize Stripe payment for the selected product
 */
async function initializeStripePayment(product) {
    console.log('🔧 Initializing Stripe payment for:', product.title);

    try {
        // Get payment intent from Addie
        const paymentIntent = await getPaymentIntent(product);

        if (!paymentIntent) {
            throw new Error('Failed to create payment intent');
        }

        // Initialize Stripe
        stripe = Stripe(paymentIntent.publishableKey);
        elements = stripe.elements({
            clientSecret: paymentIntent.paymentIntent
        });

        // Create and mount payment element
        paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');

        // Set up form submission
        setupPaymentForm(product);

        // Enable submit button when payment element is ready
        paymentElement.on('ready', () => {
            console.log('✅ Payment element ready');
            enableSubmitButton();
        });

        paymentElement.on('change', (event) => {
            if (event.complete) {
                enableSubmitButton();
            } else {
                disableSubmitButton();
            }
        });

    } catch (error) {
        console.error('❌ Stripe initialization failed:', error);
        showPaymentError(error.message);
    }
}

/**
 * Get payment intent from Addie service
 */
async function getPaymentIntent(product) {
    try {
        console.log('🔄 [PAYMENT FLOW] Step 1: Getting user credentials...');

        // First, get user credentials from The Advancement app
        const userCredentials = await getUserCredentials();

        if (!userCredentials) {
            console.error('❌ [PAYMENT FLOW] No user credentials returned');
            throw new Error('User credentials not available');
        }

        console.log('✅ [PAYMENT FLOW] Step 2: User credentials received:', {
            uuid: userCredentials.uuid,
            hasPrivateKey: !!userCredentials.privateKey,
            hasPublicKey: !!userCredentials.publicKey
        });

        const addieUrl = getAddieUrl();
        console.log('🌐 [PAYMENT FLOW] Step 3: Using Addie URL:', addieUrl);

        // Create payment intent (user should already exist from app launch)
        const endpoint = `${addieUrl}/user/${userCredentials.uuid}/processor/stripe/intent-without-splits`;
        console.log('🎯 [PAYMENT FLOW] Step 4: Payment intent endpoint:', endpoint);

        const timestamp = new Date().getTime() + '';
        const message = timestamp + userCredentials.uuid + product.price + 'USD';
        console.log('📝 [PAYMENT FLOW] Step 5: Message to sign:', message);

        const signature = await signMessage(message, userCredentials.privateKey);
        console.log('✍️ [PAYMENT FLOW] Step 6: Message signed, signature length:', signature?.length || 0);

        const payload = {
            timestamp,
            amount: product.price,
            currency: 'USD',
            savePaymentMethod: true, // For The Advancement app
            signature
        };

        console.log('📦 [PAYMENT FLOW] Step 7: Request payload:', {
            ...payload,
            signature: signature ? `${signature.substring(0, 20)}...` : 'null'
        });

        console.log('📡 [PAYMENT FLOW] Step 8: Making POST request to Addie...');

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('📥 [PAYMENT FLOW] Step 9: Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [PAYMENT FLOW] Error response body:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ [PAYMENT FLOW] Step 10: Payment intent created successfully:', data);

        return data;

    } catch (error) {
        console.error('❌ [PAYMENT FLOW] Failed to get payment intent:', error);
        console.error('❌ [PAYMENT FLOW] Error stack:', error.stack);
        throw error;
    }
}

/**
 * Get user credentials from The Advancement app
 */
async function getUserCredentials() {
    // Check if we're in The Advancement app
    if (typeof window !== 'undefined' && window.webkit && window.webkit.messageHandlers) {
        try {
            // Request user credentials from the native app
            const credentials = await new Promise((resolve, reject) => {
                // Set up a temporary message handler for the response
                window.getUserCredentialsCallback = (data) => {
                    delete window.getUserCredentialsCallback;
                    if (data.error) {
                        reject(new Error(data.error));
                    } else {
                        resolve(data);
                    }
                };

                // Request credentials from native app
                window.webkit.messageHandlers.nexusController.postMessage({
                    type: 'getUserCredentials',
                    callbackName: 'getUserCredentialsCallback'
                });

                // Timeout after 5 seconds
                setTimeout(() => {
                    delete window.getUserCredentialsCallback;
                    reject(new Error('Timeout getting user credentials'));
                }, 5000);
            });

            return credentials;

        } catch (error) {
            console.error('❌ Failed to get credentials from app:', error);
            return null;
        }
    } else {
        // For testing in browser, use placeholder credentials
        console.log('🌐 Browser mode - using test credentials');
        return {
            uuid: 'test-user-uuid',
            privateKey: 'test-private-key'
        };
    }
}

/**
 * Sign a message using the user's private key
 */
async function signMessage(message, privateKey) {
    // Check if we're in The Advancement app
    if (typeof window !== 'undefined' && window.webkit && window.webkit.messageHandlers) {
        try {
            // Request signature from the native app
            const signature = await new Promise((resolve, reject) => {
                // Set up a temporary message handler for the response
                window.signMessageCallback = (data) => {
                    delete window.signMessageCallback;
                    if (data.error) {
                        reject(new Error(data.error));
                    } else {
                        resolve(data.signature);
                    }
                };

                // Request signature from native app
                window.webkit.messageHandlers.nexusController.postMessage({
                    type: 'signMessage',
                    message: message,
                    privateKey: privateKey,
                    callbackName: 'signMessageCallback'
                });

                // Timeout after 5 seconds
                setTimeout(() => {
                    delete window.signMessageCallback;
                    reject(new Error('Timeout signing message'));
                }, 5000);
            });

            return signature;

        } catch (error) {
            console.error('❌ Failed to sign message:', error);
            throw error;
        }
    } else {
        // For testing in browser, return a placeholder signature
        console.log('🌐 Browser mode - using test signature');
        return 'test-signature-' + Date.now();
    }
}

/**
 * Set up payment form event handlers
 */
function setupPaymentForm(product) {
    const form = document.getElementById('payment-form');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handlePaymentSubmission(product);
        });
    }
}

/**
 * Handle payment form submission
 */
async function handlePaymentSubmission(product) {
    if (!stripe || !elements) {
        showPaymentError('Payment system not initialized');
        return;
    }

    showPaymentLoading(true);

    try {
        console.log('💳 Processing payment...');

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/shopping.html',
                payment_method_data: {
                    allow_redisplay: 'always'
                }
            },
            redirect: 'if_required'
        });

        if (error) {
            throw new Error(error.message);
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log('✅ Payment successful!');

            // In The Advancement app, store payment method for future use
            if (typeof window !== 'undefined' && window.webkit && window.webkit.messageHandlers) {
                console.log('📱 Storing payment method in The Advancement app');

                try {
                    window.webkit.messageHandlers.nexusController.postMessage({
                        type: 'storePaymentMethod',
                        product: product,
                        paymentIntentId: paymentIntent.id,
                        paymentMethodId: paymentIntent.payment_method
                    });
                } catch (nativeError) {
                    console.warn('⚠️ Failed to store payment method:', nativeError);
                }
            }

            // Close modal and show success
            closeProductModal();
            showStatusMessage(`🎉 Successfully purchased ${product.title}! Payment method saved for future use.`, 'success');
        }

    } catch (error) {
        console.error('❌ Payment failed:', error);
        showPaymentError(error.message);
    } finally {
        showPaymentLoading(false);
    }
}

/**
 * Enable payment submit button
 */
function enableSubmitButton() {
    const submitButton = document.getElementById('submit-payment');
    if (submitButton) {
        submitButton.disabled = false;
    }
}

/**
 * Disable payment submit button
 */
function disableSubmitButton() {
    const submitButton = document.getElementById('submit-payment');
    if (submitButton) {
        submitButton.disabled = true;
    }
}

/**
 * Show payment error
 */
function showPaymentError(message) {
    const errorEl = document.getElementById('payment-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';

        // Hide error after 5 seconds
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }
}

/**
 * Show/hide payment loading state
 */
function showPaymentLoading(isLoading) {
    const loadingEl = document.getElementById('payment-loading');
    const submitButton = document.getElementById('submit-payment');

    if (loadingEl) {
        loadingEl.style.display = isLoading ? 'block' : 'none';
    }

    if (submitButton) {
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Processing...' : 'Complete Purchase';
    }
}


/**
 * Show status message
 */
function showStatusMessage(message, type = 'info') {
    // Remove existing message
    const existing = document.querySelector('.status-message');
    if (existing) {
        existing.remove();
    }

    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `status-message ${type}`;
    messageEl.textContent = message;

    document.body.appendChild(messageEl);

    // Show message
    setTimeout(() => {
        messageEl.classList.add('show');
    }, 100);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        messageEl.classList.remove('show');
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 300);
    }, 4000);
}

/**
 * Show loading state
 */
function showLoadingState() {
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('products-container').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
}

/**
 * Show products state
 */
function showProductsState() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('products-container').style.display = 'grid';
    document.getElementById('empty-state').style.display = 'none';
}

/**
 * Show error state
 */
function showErrorState(errorMessage) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
    document.getElementById('products-container').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';

    const errorMessageEl = document.getElementById('error-message');
    if (errorMessageEl) {
        errorMessageEl.textContent = errorMessage;
    }
}

/**
 * Show empty state
 */
function showEmptyState() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('products-container').style.display = 'none';
    document.getElementById('empty-state').style.display = 'block';
}


/**
 * Go back to main portal
 */
function goBack() {
    console.log('🔙 Navigating back to main portal');
    window.location.href = 'index.html';
}

/**
 * Close modal on escape key
 */
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeProductModal();
    }
});

console.log('🛍️ Shopping page script loaded successfully');