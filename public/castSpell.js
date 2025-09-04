/**
 * castSpell - Interactive spell casting system for web pages
 * 
 * This file provides the core spell casting functionality for web pages,
 * including support for magistack selection components and magicard navigation.
 * 
 * Served from fount/public/ to make it available as a public endpoint.
 * 
 * Usage:
 * - Include this script on any web page: <script src="http://your-fount-server/castSpell.js"></script>
 * - Add spell attributes to SVG elements: <rect spell="fireball" spell-components='{"damage": 10}' />
 * - Elements with spell attributes will become interactive automatically
 * 
 * BDO Bridge Interface:
 * For actual card navigation (vs simulation), provide a bridge object:
 * 
 * window.castSpellBridge = {
 *   getCardFromBDO: async (bdoPubKey) => {
 *     // Fetch card from BDO with proper authentication
 *     // Return: { success: true, data: cardContent } or { success: false, error: errorMessage }
 *   }
 * };
 * 
 * The bridge handles:
 * - Message signing for BDO authentication
 * - Card retrieval from BDO servers
 * - Error handling for network/auth failures
 * - Card content parsing and validation
 */

(function() {
    'use strict';
    
    console.log('🪄 castSpell.js loaded - Interactive spell casting system ready');
    
    // ========================================
    // In-Memory Selection Storage (page-session only)
    // ========================================
    
    /**
     * Magistack selection storage - persists only while user remains on page
     * Selections are lost when page refreshes (by design for privacy/security)
     */
    window.magistackSelections = window.magistackSelections || [];
    
    /**
     * Add a selection to the magistack collection
     * @param {Object} selection - Selection data from spell-components
     */
    function addSelection(selection) {
        const timestamp = new Date().toISOString();
        const selectionEntry = {
            ...selection,
            timestamp: timestamp,
            id: `selection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        window.magistackSelections.push(selectionEntry);
        console.log('📦 Added selection to magistack:', selectionEntry);
        console.log('🎯 Current magistack selections:', window.magistackSelections.length);
        
        // Dispatch custom event for any listeners
        window.dispatchEvent(new CustomEvent('magistackSelectionAdded', {
            detail: {
                selection: selectionEntry,
                totalSelections: window.magistackSelections.length
            }
        }));
        
        return selectionEntry;
    }
    
    /**
     * Get all current selections
     * @returns {Array} Array of selection objects
     */
    function getSelections() {
        return [...window.magistackSelections];
    }
    
    /**
     * Clear all selections
     */
    function clearSelections() {
        const previousCount = window.magistackSelections.length;
        window.magistackSelections.length = 0;
        console.log(`🗑️ Cleared ${previousCount} selections from magistack`);
        
        // Dispatch clear event
        window.dispatchEvent(new CustomEvent('magistackSelectionsCleared', {
            detail: { previousCount }
        }));
    }
    
    // Expose magistack functions globally
    window.addMagistackSelection = addSelection;
    window.getMagistackSelections = getSelections;
    window.clearMagistackSelections = clearSelections;
    
    // ========================================
    // Spell Element Detection and Interaction
    // ========================================
    
    /**
     * Apply spell interaction handlers to elements
     * @param {Element} container - Container to search for spell elements (default: document)
     */
    function applySpellHandlers(container = document) {
        const spellElements = container.querySelectorAll('[spell]');
        console.log(`🪄 Found ${spellElements.length} spell elements in container`);
        
        spellElements.forEach(element => {
            // Skip if already processed
            if (element.classList.contains('spell-element-processed')) {
                return;
            }
            
            element.classList.add('spell-element-processed');
            
            // Add wand cursor styling
            element.style.cursor = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="24" font-size="24">🪄</text></svg>') 16 16, pointer`;
            
            // Add hover effects
            element.addEventListener('mouseenter', () => {
                element.style.filter = 'drop-shadow(0 0 8px rgba(155, 89, 182, 0.8))';
                element.style.transition = 'filter 0.2s ease';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.filter = '';
            });
            
            // Add click handler for spell casting
            element.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                // Cast spell on this element
                castSpell(element);
            });
            
            console.log('✨ Spell handler applied to:', element.getAttribute('spell'));
        });
    }
    
    // ========================================
    // Core Spell Casting Logic
    // ========================================
    
    /**
     * Cast a spell on the given element
     * @param {Element} element - The element with spell attributes
     */
    async function castSpell(element) {
        const spellType = element.getAttribute('spell');
        const spellComponentsAttr = element.getAttribute('spell-components');
        
        console.log(`🪄 Casting spell: ${spellType}`);
        console.log(`🔍 Element info:`, {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            spell: spellType,
            spellComponents: spellComponentsAttr
        });
        
        let spellComponents = null;
        if (spellComponentsAttr) {
            try {
                spellComponents = JSON.parse(spellComponentsAttr);
                console.log('📦 Parsed spell components:', spellComponents);
            } catch (error) {
                console.warn('⚠️ Failed to parse spell-components JSON:', error);
            }
        }
        
        try {
            // Handle different spell types
            switch (spellType) {
                case 'selection':
                    console.log('🎯 Starting selection spell handler...');
                    await handleSelectionSpell(spellComponents, element);
                    console.log('✅ Selection spell handler completed, starting magicard handler...');
                    await handleMagicardSpell(spellComponents, element);
                    console.log('✅ Both selection and magicard handlers completed');
                    break;
                    
                case 'magicard':
                    await handleMagicardSpell(spellComponents, element);
                    break;
                    
                case 'spellTest':
                    await handleSpellTestSpell(spellComponents, element);
                    break;
                    
                case 'lookup':
                    console.log('🎯 Starting selection spell handler...');
                    await handleSelectionSpell(spellComponents, element);
                    console.log('✅ Selection spell handler completed, starting lookup handler...');
                    await handleLookupSpell(spellComponents, element);
                    break;
                    
                case 'purchase':
                    await handlePurchaseSpell(spellComponents, element);
                    break;
                    
                default:
                    await handleGenericSpell(spellType, spellComponents, element);
                    break;
            }
            
        } catch (error) {
            console.error('❌ Spell casting failed:', error);
            alert(`⚠️ Spell casting failed: ${error.message}`);
        }
    }
    
    // ========================================
    // Spell Type Handlers
    // ========================================
    
    /**
     * Handle 'selection' spell - adds item to magistack AND navigates to next card
     * @param {Object} components - Spell components from spell-components attribute
     * @param {Element} element - The spell element
     */
    async function handleSelectionSpell(components, element) {
        console.log('📦 Handling selection spell with components:', components);
        
        if (!components) {
            throw new Error('Selection spell requires spell-components with selection data');
        }
        
        // Add selection to magistack
        const selection = addSelection(components);
        
        // Provide visual feedback
        const originalFill = element.getAttribute('fill') || element.style.backgroundColor;
        
        // Flash green to show selection was added
        if (element.tagName === 'rect' || element.tagName === 'circle') {
            element.setAttribute('fill', '#27ae60');
        } else {
            element.style.backgroundColor = '#27ae60';
        }
        
        console.log('✅ Selection added to magistack successfully');
        
        // Check if there's navigation data (bdoPubKey for next card)
        if (components.bdoPubKey) {
            console.log(`🧭 Selection spell includes navigation to: ${components.bdoPubKey}`);
            
            // Perform navigation like magicard spell
            await navigateToCard(components.bdoPubKey, element);
            
        } else {
            // No navigation - just show selection confirmation
            console.log('📦 Selection spell completed without navigation (no bdoPubKey)');
            
            // Show selection confirmation using custom dialog
            showCustomDialog({
                title: '✅ Added to Magistack!',
                message: 'Selection successfully added',
                details: [
                    `Selection: ${JSON.stringify(components, null, 2)}`,
                    '',
                    `Total selections: ${window.magistackSelections.length}`
                ],
                type: 'success'
            });
            
            // Reset visual state after delay
            setTimeout(() => {
                if (element.tagName === 'rect' || element.tagName === 'circle') {
                    if (originalFill) {
                        element.setAttribute('fill', originalFill);
                    } else {
                        element.removeAttribute('fill');
                    }
                } else {
                    element.style.backgroundColor = originalFill || '';
                }
            }, 1000);
        }
        
        console.log('✅ Selection spell completed successfully');
    }
    
    /**
     * Handle 'magicard' spell - navigation between cards
     * @param {Object} components - Spell components containing bdoPubKey for navigation
     * @param {Element} element - The spell element
     */
    async function handleMagicardSpell(components, element) {
        console.log('🃏 Handling magicard navigation spell:', components);
        console.log('🔍 bdoPubKey check:', components ? components.bdoPubKey : 'components is null');
        
        if (!components || !components.bdoPubKey) {
            console.log('❌ Magicard navigation skipped - no bdoPubKey found');
            throw new Error('Magicard spell requires spell-components with bdoPubKey');
        }
        
        const { bdoPubKey } = components;
        console.log('🚀 About to call navigateToCard with bdoPubKey:', bdoPubKey);
        await navigateToCard(bdoPubKey, element);
        
        console.log('🧭 Magicard navigation spell completed');
    }
    
    /**
     * Handle 'spellTest' spell - test spell for MAGIC protocol
     * @param {Object} components - Spell components
     * @param {Element} element - The spell element
     */
    async function handleSpellTestSpell(components, element) {
        console.log('🧪 Handling spellTest spell for MAGIC protocol testing');
        
        // This is handled by The Advancement extension for MAGIC protocol spells
        // If we reach here, it means the extension isn't available
        
        // Visual feedback - flash purple for MAGIC spells
        const originalFill = element.getAttribute('fill') || element.style.backgroundColor;
        if (element.tagName === 'rect' || element.tagName === 'circle') {
            element.setAttribute('fill', '#9b59b6');
        } else {
            element.style.backgroundColor = '#9b59b6';
        }
        
        showCustomDialog({
            title: '🧪 SpellTest Detected',
            message: 'MAGIC protocol spell detected',
            details: [
                'This requires The Advancement browser extension for full MAGIC protocol support.',
                '',
                'Fallback: Test spell acknowledged.'
            ],
            type: 'warning'
        });
        
        // Reset visual after delay
        setTimeout(() => {
            if (element.tagName === 'rect' || element.tagName === 'circle') {
                if (originalFill) {
                    element.setAttribute('fill', originalFill);
                } else {
                    element.removeAttribute('fill');
                }
            } else {
                element.style.backgroundColor = originalFill || '';
            }
        }, 1000);
        
        console.log('🧪 spellTest fallback completed');
    }
    
    /**
     * Handle 'lookup' spell - decision tree product resolution
     * Uses magistack selections + catalog data to find and create final product
     * @param {Object} components - Spell components containing catalog data
     * @param {Element} element - The spell element
     */
    async function handleLookupSpell(components, element) {
        console.log('🔍 Handling lookup spell for decision tree resolution:', components);
        
        if (!components || !components.catalog) {
            throw new Error('Lookup spell requires spell-components with catalog data');
        }
        
        if (!window.magistackSelections || window.magistackSelections.length === 0) {
            throw new Error('Lookup spell requires magistack selections to resolve product');
        }
        
        // Visual feedback - flash orange for lookup spells
        const originalFill = element.getAttribute('fill') || element.style.backgroundColor;
        if (element.tagName === 'rect' || element.tagName === 'circle') {
            element.setAttribute('fill', '#f39c12');
        } else {
            element.style.backgroundColor = '#f39c12';
        }
        
        try {
            const { catalog } = components;
            const selections = window.magistackSelections;
            
            console.log('🔍 Resolving product with catalog:', catalog);
            console.log('🔍 Using magistack selections:', selections);
            
            // Build path from magistack selections only
            const selectionValues = selections.map(sel => sel.selection).filter(Boolean);
            console.log('🔍 Using magistack selection path:', selectionValues);
            
            // Find matching product in catalog
            const product = findProductInCatalog(catalog, selectionValues);
            
            if (!product) {
                throw new Error(`No product found for selections: ${selectionValues.join(' → ')}`);
            }
            
            console.log('✅ Found product:', product);
            
            // Navigate to product card if bdoPubKey is available
            if (product.bdoPubKey) {
                console.log('🧭 Navigating to product card:', product.bdoPubKey);
                await navigateToCard(product.bdoPubKey, element);
            } else {
                console.warn('⚠️ No bdoPubKey found for product, showing details only');
                await createAndDisplayProduct(product, selectionValues, catalog);
            }
            
        } catch (error) {
            console.error('❌ Lookup spell failed:', error);
            
            showCustomDialog({
                title: '❌ Lookup Failed',
                message: 'Could not resolve product from selections',
                details: [
                    error.message,
                    '',
                    'Check that:',
                    '• Magistack has valid selections',
                    '• Catalog data is properly formatted',
                    '• Product exists for selected path'
                ],
                type: 'error'
            });
        }
        
        // Reset visual after delay
        setTimeout(() => {
            if (element.tagName === 'rect' || element.tagName === 'circle') {
                if (originalFill) {
                    element.setAttribute('fill', originalFill);
                } else {
                    element.removeAttribute('fill');
                }
            } else {
                element.style.backgroundColor = originalFill || '';
            }
        }, 1000);
        
        console.log('🔍 Lookup spell completed');
    }
    
    /**
     * Find product in catalog based on selection path
     * @param {Object} catalog - The nested map catalog structure
     * @param {Array<string>} selectionPath - Array of selection values
     * @returns {Object|null} - Found product or null
     */
    function findProductInCatalog(catalog, selectionPath) {
        console.log('🔍 Searching nested catalog map for path:', selectionPath);
        console.log('🔍 Catalog structure:', catalog);
        
        // Navigate through nested map using selection path
        // Expected structure: {"adult": {"two-hour": {productId, bdoPubKey, price, name}, ...}, ...}
        let currentLevel = catalog;
        
        for (let i = 0; i < selectionPath.length; i++) {
            const selection = selectionPath[i];
            console.log(`🔍 Looking for "${selection}" in level ${i + 1}:`, Object.keys(currentLevel));
            
            if (currentLevel[selection]) {
                currentLevel = currentLevel[selection];
                console.log(`✅ Found "${selection}" at level ${i + 1}`);
            } else {
                console.warn(`❌ Selection "${selection}" not found at level ${i + 1}`);
                console.warn(`Available options:`, Object.keys(currentLevel));
                return null;
            }
        }
        
        // At this point, currentLevel should contain the product data
        // Check if we have a valid product object
        if (currentLevel && typeof currentLevel === 'object' && 
            (currentLevel.productId || currentLevel.id)) {
            
            const product = {
                productId: currentLevel.productId || currentLevel.id,
                bdoPubKey: currentLevel.bdoPubKey,
                price: currentLevel.price,
                name: currentLevel.name,
                selectionPath: selectionPath
            };
            
            console.log('✅ Found product via nested map navigation:', product);
            console.log('🔍 Product bdoPubKey:', product.bdoPubKey || 'NOT FOUND');
            console.log('🔍 Product ID:', product.productId || 'NOT FOUND');
            
            return product;
        } else {
            console.warn('❌ Selection path led to invalid product data:', currentLevel);
            return null;
        }
    }
    
    /**
     * Create and display product card from lookup result
     * @param {Object} product - The product data from catalog
     * @param {Array<string>} selectionPath - The path that led to this product  
     * @param {Object} catalog - The full catalog for context
     */
    async function createAndDisplayProduct(product, selectionPath, catalog) {
        console.log('🛍️ Creating product card for:', product);
        
        // Extract product details
        const productName = product.name || product.product || 'Unknown Product';
        const productPrice = product.price || 'Price not available';
        const productId = product.id || product.uuid || `generated_${Date.now()}`;
        
        // Dispatch product found event for apps to handle
        window.dispatchEvent(new CustomEvent('productLookupComplete', {
            detail: {
                product: product,
                selectionPath: selectionPath,
                productId: productId,
                catalog: catalog,
                timestamp: new Date().toISOString()
            }
        }));
        
        showCustomDialog({
            title: '🛍️ Product Found',
            message: `Found: ${productName}`,
            details: [
                `Selection Path: ${selectionPath.join(' → ')}`,
                `Product: ${productName}`,
                `Price: ${productPrice}`,
                `Product ID: ${productId}`,
                '',
                'Product details available in productLookupComplete event'
            ],
            type: 'success'
        });
        
        console.log('✅ Product card creation completed');
    }
    
    /**
     * Handle 'purchase' spell - real money transactions for menu products
     * @param {Object} components - Spell components containing amount, productId, mp: false
     * @param {Element} element - The spell element
     */
    async function handlePurchaseSpell(components, element) {
        console.log('💰 Handling purchase spell with components:', components);
        
        if (!components) {
            throw new Error('Purchase spell requires spell-components with payment data');
        }
        
        const { amount, productId, mp } = components;
        
        if (!amount || !productId || mp !== false) {
            throw new Error('Purchase spell requires amount, productId, and mp: false');
        }
        
        console.log(`💰 Purchase details - amount: $${amount/100}, productId: ${productId}, mp: ${mp}`);
        
        // Visual feedback - flash purple for purchase spells
        const originalFill = element.getAttribute('fill') || element.style.backgroundColor;
        if (element.tagName === 'rect' || element.tagName === 'circle') {
            element.setAttribute('fill', '#9b59b6');
        } else {
            element.style.backgroundColor = '#9b59b6';
        }
        
        try {
            // Step 1: Get payment intent from Addie
            console.log('💳 Step 1: Creating payment intent via Addie...');
            const paymentIntent = await createAddiePaymentIntent(amount, productId);
            
            if (!paymentIntent.success) {
                throw new Error(`Payment intent failed: ${paymentIntent.error}`);
            }
            
            console.log('✅ Step 1 complete: Payment intent created');
            
            // Step 2: Process payment (would normally show Stripe UI here)
            console.log('💳 Step 2: Processing payment...');
            const paymentResult = await processPayment(paymentIntent.data, amount, productId);
            
            if (!paymentResult.success) {
                throw new Error(`Payment processing failed: ${paymentResult.error}`);
            }
            
            console.log('✅ Step 2 complete: Payment processed successfully');
            
            // Step 3: Execute MAGIC protocol spell for product delivery
            console.log('⚡ Step 3: Executing MAGIC protocol for product delivery...');
            await executeMagicProtocolSpell(paymentResult.data, productId);
            
            console.log('✅ Step 3 complete: MAGIC protocol executed');
            
            // Show success dialog
            showCustomDialog({
                title: '💰 Purchase Complete',
                message: `Successfully purchased product!`,
                details: [
                    `Amount: $${amount/100}`,
                    `Product ID: ${productId}`,
                    `Payment ID: ${paymentResult.data.paymentId}`,
                    '',
                    'Product access granted via MAGIC protocol'
                ],
                type: 'success'
            });
            
        } catch (error) {
            console.error('❌ Purchase spell failed:', error);
            
            // Show error dialog
            showCustomDialog({
                title: '💰 Purchase Failed',
                message: `Purchase could not be completed`,
                details: [
                    `Error: ${error.message}`,
                    `Amount: $${amount/100}`,
                    `Product ID: ${productId}`,
                    '',
                    'Please try again or contact support'
                ],
                type: 'error'
            });
        }
        
        // Reset visual after delay
        setTimeout(() => {
            if (element.tagName === 'rect' || element.tagName === 'circle') {
                if (originalFill) {
                    element.setAttribute('fill', originalFill);
                } else {
                    element.removeAttribute('fill');
                }
            } else {
                element.style.backgroundColor = originalFill || '';
            }
        }, 1000);
        
        console.log('💰 Purchase spell processing completed');
    }
    
    /**
     * Handle generic/unknown spell types
     * @param {string} spellType - The spell type
     * @param {Object} components - Spell components
     * @param {Element} element - The spell element
     */
    async function handleGenericSpell(spellType, components, element) {
        console.log(`⚡ Handling generic spell: ${spellType}`);
        
        // Visual feedback - flash yellow for generic spells
        const originalFill = element.getAttribute('fill') || element.style.backgroundColor;
        if (element.tagName === 'rect' || element.tagName === 'circle') {
            element.setAttribute('fill', '#f1c40f');
        } else {
            element.style.backgroundColor = '#f1c40f';
        }
        
        // Show spell details using custom dialog
        const componentsText = components ? JSON.stringify(components, null, 2) : 'None';
        showCustomDialog({
            title: `⚡ Generic Spell: ${spellType}`,
            message: 'Unknown spell type cast',
            details: [
                `Components: ${componentsText}`,
                '',
                'This is a fallback handler - add specific logic for this spell type.'
            ],
            type: 'info'
        });
        
        // Reset visual after delay
        setTimeout(() => {
            if (element.tagName === 'rect' || element.tagName === 'circle') {
                if (originalFill) {
                    element.setAttribute('fill', originalFill);
                } else {
                    element.removeAttribute('fill');
                }
            } else {
                element.style.backgroundColor = originalFill || '';
            }
        }, 1000);
        
        console.log(`⚡ Generic spell ${spellType} completed`);
    }
    
    // ========================================
    // Custom Dialog System (Tauri-Compatible)
    // ========================================
    
    /**
     * Show a custom SVG-based dialog (works in Tauri apps)
     * @param {Object} config - Dialog configuration
     * @param {string} config.title - Dialog title
     * @param {string} config.message - Main message
     * @param {Array<string>} config.details - Array of detail lines
     * @param {string} config.type - Dialog type: 'info', 'success', 'warning', 'error'
     */
    function showCustomDialog(config) {
        const { title, message, details = [], type = 'info' } = config;
        
        console.log(`📱 Custom Dialog: ${title} - ${message}`);
        
        // Remove any existing dialog
        const existingDialog = document.getElementById('castspell-custom-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        // Color scheme based on type
        const colorSchemes = {
            info: { bg: '#3498db', border: '#2980b9' },
            success: { bg: '#27ae60', border: '#229954' },
            warning: { bg: '#f39c12', border: '#d68910' },
            error: { bg: '#e74c3c', border: '#c0392b' }
        };
        
        const colors = colorSchemes[type] || colorSchemes.info;
        
        // Create dialog container
        const dialogContainer = document.createElement('div');
        dialogContainer.id = 'castspell-custom-dialog';
        dialogContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Create dialog content
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 480px;
            width: 90vw;
            max-height: 70vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            border-top: 4px solid ${colors.bg};
            position: relative;
            animation: dialog-appear 0.3s ease-out;
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes dialog-appear {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Dialog HTML
        dialog.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: ${colors.bg};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                    color: white;
                    font-size: 20px;
                    font-weight: bold;
                ">
                    ${type === 'success' ? '✓' : type === 'warning' ? '⚠' : type === 'error' ? '✕' : 'ℹ'}
                </div>
                <div>
                    <h3 style="
                        margin: 0 0 4px 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #2c3e50;
                    ">${title}</h3>
                    <p style="
                        margin: 0;
                        font-size: 14px;
                        color: #7f8c8d;
                    ">${message}</p>
                </div>
            </div>
            
            ${details.length > 0 ? `
                <div style="
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 12px;
                    margin: 16px 0;
                    font-family: 'Monaco', 'Consolas', monospace;
                    font-size: 13px;
                    line-height: 1.5;
                    color: #2c3e50;
                    white-space: pre-line;
                    border-left: 3px solid ${colors.bg};
                ">${details.join('\\n')}</div>
            ` : ''}
            
            <div style="
                display: flex;
                justify-content: flex-end;
                margin-top: 20px;
            ">
                <button onclick="document.getElementById('castspell-custom-dialog').remove()" style="
                    background: ${colors.bg};
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 20px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                " onmouseover="this.style.background='${colors.border}'" 
                   onmouseout="this.style.background='${colors.bg}'">
                    OK
                </button>
            </div>
        `;
        
        dialogContainer.appendChild(dialog);
        document.body.appendChild(dialogContainer);
        
        // Auto-close after 10 seconds for non-error dialogs
        if (type !== 'error') {
            setTimeout(() => {
                if (document.getElementById('castspell-custom-dialog')) {
                    dialogContainer.remove();
                }
            }, 10000);
        }
        
        // Close on background click
        dialogContainer.addEventListener('click', (e) => {
            if (e.target === dialogContainer) {
                dialogContainer.remove();
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                dialogContainer.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        console.log(`📱 Dialog displayed: ${title}`);
    }
    
    // ========================================
    // Navigation Helper Functions
    // ========================================
    
    /**
     * Navigate to a card using BDO pubKey (shared by selection and magicard spells)
     * @param {string} bdoPubKey - The BDO public key for the target card
     * @param {Element} element - The element that triggered navigation
     */
    async function navigateToCard(bdoPubKey, element) {
        console.log(`🧭 Navigating to card with BDO pubKey: ${bdoPubKey}`);
        
        // Visual feedback - flash blue for navigation
        const originalFill = element.getAttribute('fill') || element.style.backgroundColor;
        if (element.tagName === 'rect' || element.tagName === 'circle') {
            element.setAttribute('fill', '#3498db');
        } else {
            element.style.backgroundColor = '#3498db';
        }
        
        // Check if BDO bridge is available (provided by The Advancement or MagiCard)
        if (window.castSpellBridge && typeof window.castSpellBridge.getCardFromBDO === 'function') {
            console.log(`🌉 BDO bridge available, fetching real card from BDO: ${bdoPubKey}`);
            
            try {
                const cardData = await window.castSpellBridge.getCardFromBDO(bdoPubKey);
                if (cardData && cardData.success) {
                    console.log(`✅ Card fetched successfully:`, cardData);
                    
                    // Dispatch event with actual card data
                    window.dispatchEvent(new CustomEvent('cardNavigationComplete', {
                        detail: {
                            bdoPubKey: bdoPubKey,
                            cardData: cardData.data,
                            timestamp: new Date().toISOString(),
                            navigationSource: element.getAttribute('spell')
                        }
                    }));
                    
                    showCustomDialog({
                        title: '🧭 Card Retrieved',
                        message: `Successfully loaded card: ${bdoPubKey.substring(0, 8)}...`,
                        details: [
                            `Card fetched from BDO`,
                            `Data size: ${cardData.data ? JSON.stringify(cardData.data).length : 'N/A'} characters`,
                            `Navigation source: ${element.getAttribute('spell')}`
                        ],
                        type: 'success'
                    });
                    
                    return; // Exit early - real navigation handled by bridge
                } else {
                    console.warn(`❌ BDO bridge returned error:`, cardData);
                }
            } catch (error) {
                console.warn(`❌ BDO bridge failed:`, error);
            }
        } else {
            console.log(`🔍 No BDO bridge available, using simulation mode`);
        }
        
        // Dispatch navigation event for any listeners
        window.dispatchEvent(new CustomEvent('cardNavigation', {
            detail: {
                bdoPubKey: bdoPubKey,
                timestamp: new Date().toISOString(),
                navigationSource: element.getAttribute('spell')
            }
        }));
        
        // Show navigation confirmation using custom dialog (Tauri-compatible)
        console.log(`🧭 NAVIGATION CONFIRMATION: ${bdoPubKey}`);
        console.log(`📋 This would normally:`);
        console.log(`   • Fetch card content from BDO`);
        console.log(`   • Update current display`);
        console.log(`   • Apply spell handlers to new content`);
        console.log(`🎯 For MagiCard integration: This is where you'd load the new card SVG`);
        
        // Show custom dialog instead of alert
        showCustomDialog({
            title: '🧭 Card Navigation',
            message: `Navigating to card: ${bdoPubKey}`,
            details: [
                'This would fetch the card from BDO and display it.',
                '',
                'In a real implementation:',
                '• Fetch card content from BDO',
                '• Update current display', 
                '• Apply spell handlers to new content'
            ],
            type: 'info'
        });
        
        // Reset visual after delay
        setTimeout(() => {
            if (element.tagName === 'rect' || element.tagName === 'circle') {
                if (originalFill) {
                    element.setAttribute('fill', originalFill);
                } else {
                    element.removeAttribute('fill');
                }
            } else {
                element.style.backgroundColor = originalFill || '';
            }
        }, 1000);
        
        console.log('🧭 Card navigation completed');
    }
    
    // ========================================
    // Initialization and Auto-Detection
    // ========================================
    
    /**
     * Initialize spell system when DOM is ready
     */
    function initializeSpellSystem() {
        console.log('🚀 Initializing castSpell system...');
        
        // Apply spell handlers to existing elements
        applySpellHandlers();
        
        // Monitor for dynamically added spell elements
        const observer = new MutationObserver((mutations) => {
            let hasNewNodes = false;
            
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    hasNewNodes = true;
                    break;
                }
            }
            
            if (hasNewNodes) {
                console.log('🔄 New DOM nodes detected, scanning for spell elements...');
                applySpellHandlers();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ castSpell system initialized successfully');
        
        // Log magistack status
        console.log(`📦 Magistack selections: ${window.magistackSelections.length}`);
    }
    
    // ========================================
    // Global API
    // ========================================
    
    // Expose castSpell globally for manual use
    window.castSpell = castSpell;
    window.applySpellHandlers = applySpellHandlers;
    
    // Expose debug functions
    window.castSpellDebug = {
        getSelections: getSelections,
        clearSelections: clearSelections,
        addSelection: addSelection,
        navigateToCard: navigateToCard,
        logStatus: () => {
            console.log('🪄 castSpell Status Report:');
            console.log(`  📦 Magistack selections: ${window.magistackSelections.length}`);
            console.log(`  ✨ Spell elements processed: ${document.querySelectorAll('.spell-element-processed').length}`);
            console.log(`  🎯 Current selections:`, getSelections());
        }
    };
    
    // Listen for navigation events (for debugging/monitoring)
    window.addEventListener('cardNavigation', (event) => {
        console.log('🧭 Card navigation event:', event.detail);
    });
    
    // ========================================
    // Purchase Spell Helper Functions
    // ========================================
    
    /**
     * Create payment intent via Addie service
     * @param {number} amount - Amount in cents
     * @param {string} productId - Product identifier
     * @returns {Promise<Object>} Payment intent result
     */
    async function createAddiePaymentIntent(amount, productId) {
        try {
            console.log(`💳 Creating Addie payment intent for $${amount/100} (${productId})`);
            
            // Determine Addie URL (use localhost for development)
            const addieUrl = 'http://localhost:3005'; // Assuming standard local development
            
            const response = await fetch(`${addieUrl}/payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: 'usd',
                    metadata: {
                        productId: productId,
                        source: 'ninefy-menu',
                        timestamp: Date.now()
                    }
                })
            });
            
            if (!response.ok) {
                return {
                    success: false,
                    error: `Addie service responded with ${response.status}`
                };
            }
            
            const data = await response.json();
            console.log('✅ Addie payment intent created:', data);
            
            return {
                success: true,
                data: data
            };
            
        } catch (error) {
            console.error('❌ Failed to create payment intent:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Process payment (simplified for demonstration)
     * @param {Object} paymentIntent - Payment intent from Addie
     * @param {number} amount - Amount in cents
     * @param {string} productId - Product identifier
     * @returns {Promise<Object>} Payment result
     */
    async function processPayment(paymentIntent, amount, productId) {
        try {
            console.log('💳 Processing payment for demo purposes...');
            
            // In a real implementation, this would:
            // 1. Show Stripe payment UI
            // 2. Collect payment method from user
            // 3. Process payment through Stripe
            // 4. Return payment confirmation
            
            // For demo, simulate successful payment
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return {
                success: true,
                data: {
                    paymentId: `pay_demo_${Date.now()}`,
                    amount: amount,
                    productId: productId,
                    status: 'succeeded',
                    timestamp: Date.now()
                }
            };
            
        } catch (error) {
            console.error('❌ Payment processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Execute MAGIC protocol spell for product delivery
     * @param {Object} paymentData - Payment confirmation data
     * @param {string} productId - Product identifier
     */
    async function executeMagicProtocolSpell(paymentData, productId) {
        try {
            console.log('⚡ Executing MAGIC protocol for product delivery...');
            console.log('📦 Payment data:', paymentData);
            console.log('🎯 Product ID:', productId);
            
            // In a real implementation, this would:
            // 1. Create MAGIC protocol payload
            // 2. Sign with user's keys
            // 3. Send to product delivery service
            // 4. Grant product access
            
            // For demo, simulate MAGIC protocol execution
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('✅ MAGIC protocol execution completed - product access granted');
            
        } catch (error) {
            console.error('❌ MAGIC protocol execution failed:', error);
            throw error;
        }
    }
    
    // ========================================
    // Auto-Initialize
    // ========================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSpellSystem);
    } else {
        initializeSpellSystem();
    }
    
    console.log('🪄 castSpell.js setup complete - waiting for DOM ready');
    
})();
