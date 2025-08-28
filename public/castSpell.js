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
            
            // Show selection confirmation
            alert(`✅ Added to magistack!\\n\\nSelection: ${JSON.stringify(components, null, 2)}\\n\\nTotal selections: ${window.magistackSelections.length}`);
            
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
        
        alert('🧪 spellTest detected!\\n\\nThis requires The Advancement browser extension for full MAGIC protocol support.\\n\\nFallback: Test spell acknowledged.');
        
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
        
        // Show spell details
        const componentsText = components ? JSON.stringify(components, null, 2) : 'None';
        alert(`⚡ Generic spell cast: ${spellType}\\n\\nComponents: ${componentsText}\\n\\nThis is a fallback handler - add specific logic for this spell type.`);
        
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
        
        // In a real implementation, this would:
        // 1. Fetch the card from BDO using the pubKey
        // 2. Display the new card
        // 3. Update browser history/navigation
        // 4. Apply spell handlers to the new card content
        
        // For now, simulate the navigation
        console.log(`🔍 Fetching card from BDO: ${bdoPubKey}`);
        
        // Dispatch navigation event for any listeners
        window.dispatchEvent(new CustomEvent('cardNavigation', {
            detail: {
                bdoPubKey: bdoPubKey,
                timestamp: new Date().toISOString(),
                navigationSource: element.getAttribute('spell')
            }
        }));
        
        // Show navigation confirmation
        alert(`🧭 Navigating to card: ${bdoPubKey}\n\nThis would fetch the card from BDO and display it.\n\nIn a real implementation:\n• Fetch card content from BDO\n• Update current display\n• Apply spell handlers to new content`);
        
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
