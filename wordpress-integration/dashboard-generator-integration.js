/**
 * Dashboard Generator - WordPress Integration
 * Handles communication between WordPress and Dashboard Generator iframe
 */

(function() {
    'use strict';

    // Configuration from WordPress
    const config = window.dashboardGeneratorConfig || {};

    // State
    let currentImageData = null;
    let currentDashboardInfo = null;
    let iframe = null;

    /**
     * Initialize when DOM is ready
     */
    document.addEventListener('DOMContentLoaded', function() {
        iframe = document.getElementById('dashboard-generator-iframe');

        if (!iframe) {
            console.error('[DG-WP] Dashboard Generator iframe not found');
            return;
        }

        // Set up message listener for communication with iframe
        window.addEventListener('message', handleIframeMessage);

        // Set up button handlers
        setupButtonHandlers();

        console.log('[DG-WP] Dashboard Generator WordPress integration initialized');
    });

    /**
     * Handle messages from the iframe
     */
    function handleIframeMessage(event) {
        // Verify origin in production
        // if (event.origin !== config.dashboardUrl) return;

        const { type, payload } = event.data || {};

        console.log('[DG-WP] Received message from iframe:', type, payload);

        switch (type) {
            case 'DASHBOARD_READY':
                updateStatus('Dashboard gotowy (' + payload.widgetCount + ' widgetow)');
                break;

            case 'DASHBOARD_IMAGE_READY':
                handleImageReceived(payload);
                break;

            case 'DASHBOARD_STATUS':
                console.log('[DG-WP] Dashboard status:', payload);
                break;
        }
    }

    /**
     * Handle received image from iframe
     */
    function handleImageReceived(payload) {
        currentImageData = payload.imageData;
        currentDashboardInfo = {
            dashboardId: payload.dashboardId,
            dashboardName: payload.dashboardName,
            theme: payload.theme,
            timestamp: payload.timestamp,
            widgetCount: payload.widgetCount
        };

        // Show preview
        showImagePreview(payload.imageData);

        // Update status
        updateStatus('Obraz otrzymany! Kliknij "Zapisz" aby dodac do biblioteki.');

        // Enable save button
        const saveBtn = document.querySelector('.dashboard-save-btn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.style.animation = 'pulse 0.5s';
        }
    }

    /**
     * Show image preview
     */
    function showImagePreview(imageData) {
        const previewContainer = document.querySelector('.dashboard-image-preview');
        const previewImg = previewContainer?.querySelector('img');

        if (previewContainer && previewImg) {
            previewImg.src = imageData;
            previewContainer.style.display = 'block';
        }
    }

    /**
     * Set up button event handlers
     */
    function setupButtonHandlers() {
        // Regenerate button
        const regenerateBtn = document.querySelector('.dashboard-regenerate-btn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', function() {
                requestRegenerate();
            });
        }

        // Save button
        const saveBtn = document.querySelector('.dashboard-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                if (currentImageData) {
                    saveImageToWordPress();
                } else {
                    // First request the image from iframe
                    requestImageFromIframe();
                }
            });
        }
    }

    /**
     * Request dashboard regeneration
     */
    function requestRegenerate() {
        if (!iframe) return;

        updateStatus('Generowanie nowego dashboardu...');

        iframe.contentWindow.postMessage({
            type: 'REGENERATE_DASHBOARD',
            payload: {
                preset: '3+3' // Default preset, can be made configurable
            }
        }, '*');

        // Reset current image
        currentImageData = null;
        currentDashboardInfo = null;

        // Hide preview
        const previewContainer = document.querySelector('.dashboard-image-preview');
        if (previewContainer) {
            previewContainer.style.display = 'none';
        }
    }

    /**
     * Request current image from iframe
     */
    function requestImageFromIframe() {
        if (!iframe) return;

        updateStatus('Pobieranie obrazu z dashboardu...');

        iframe.contentWindow.postMessage({
            type: 'EXPORT_AND_SEND',
            payload: {}
        }, '*');
    }

    /**
     * Save image to WordPress Media Library
     */
    async function saveImageToWordPress() {
        if (!currentImageData) {
            updateStatus('Brak obrazu do zapisania. Kliknij najpierw "Wyslij do WordPress" w dashboardzie.', 'error');
            return;
        }

        const saveBtn = document.querySelector('.dashboard-save-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Zapisywanie...';
        }

        updateStatus('Zapisywanie do biblioteki mediow...');

        try {
            const response = await fetch(config.restUrl + 'save-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': config.nonce
                },
                body: JSON.stringify({
                    imageData: currentImageData,
                    dashboardName: currentDashboardInfo?.dashboardName || 'Dashboard',
                    filename: 'dashboard-' + (currentDashboardInfo?.dashboardId || Date.now()) + '.png'
                })
            });

            const result = await response.json();

            if (result.success) {
                updateStatus('Zapisano! URL: ' + result.url, 'success');

                // Copy URL to clipboard
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(result.url);
                    updateStatus('Zapisano! URL skopiowany do schowka: ' + result.url, 'success');
                }

                // Reset for next save
                currentImageData = null;
            } else {
                throw new Error(result.message || 'Unknown error');
            }
        } catch (error) {
            console.error('[DG-WP] Save error:', error);
            updateStatus('Blad podczas zapisywania: ' + error.message, 'error');
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Zapisz obraz do biblioteki';
            }
        }
    }

    /**
     * Update status message
     */
    function updateStatus(message, type = 'info') {
        const statusEl = document.querySelector('.dashboard-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'dashboard-status';

            if (type === 'success') {
                statusEl.classList.add('dashboard-save-success');
            } else if (type === 'error') {
                statusEl.classList.add('dashboard-save-error');
            }
        }
    }

})();
