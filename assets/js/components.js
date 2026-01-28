/**
 * Component Loader - Dynamically loads navbar and footer components
 * 
 * This script:
 * 1. Detects the page's folder depth relative to root
 * 2. Loads navbar.html and footer.html from the components folder
 * 3. Replaces {{BASE_PATH}} placeholders with the correct relative paths
 * 4. Injects components into placeholder elements
 * 
 * Usage:
 * Add <div id="navbar-placeholder"></div> where you want the navbar
 * Add <div id="footer-placeholder"></div> where you want the footer
 * Include this script after jQuery: <script src="assets/js/components.js"></script>
 */

(function () {
    'use strict';

    // Determine the base path based on current page location
    function getBasePath() {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part !== '');

        // Check if we're in a subdirectory (company/, services/, work/, insights/)
        const subdirs = ['company', 'services', 'work', 'insights'];
        let depth = 0;

        for (const part of pathParts) {
            if (subdirs.includes(part)) {
                depth = 1;
                break;
            }
        }

        return depth === 1 ? '../' : '';
    }

    // Replace all {{BASE_PATH}} placeholders with the actual base path
    function replacePaths(html, basePath) {
        return html.replace(/\{\{BASE_PATH\}\}/g, basePath);
    }

    // Load and inject component
    function loadComponent(componentName, placeholderId, basePath) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            console.warn('Component loader: Placeholder "' + placeholderId + '" not found');
            return;
        }

        const componentPath = basePath + 'components/' + componentName + '.html';

        fetch(componentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load ' + componentName);
                }
                return response.text();
            })
            .then(html => {
                const processedHtml = replacePaths(html, basePath);
                placeholder.outerHTML = processedHtml;

                // Reinitialize any necessary JavaScript after injection
                if (componentName === 'navbar') {
                    initNavbarScripts();
                }
            })
            .catch(error => {
                console.error('Component loader error:', error);
            });
    }

    // Reinitialize navbar-related scripts after dynamic loading
    function initNavbarScripts() {
        // Reinitialize sidebar toggle
        if (typeof jQuery !== 'undefined') {
            jQuery('.sidebar-toggle-btn').on('click', function (e) {
                e.preventDefault();
                jQuery('.sidebar-wrap').addClass('active');
            });

            jQuery('.sidebar-close-btn').on('click', function () {
                jQuery('.sidebar-wrap').removeClass('active');
            });

            // Reinitialize submenu if submenu.min.js is loaded
            if (typeof initSubmenu === 'function') {
                initSubmenu();
            }

            // Reinitialize custom scrollbar
            if (jQuery.fn.mCustomScrollbar) {
                jQuery('.mCustomScrollbar').mCustomScrollbar({
                    theme: "minimal-light"
                });
            }
        }
    }

    // Initialize when DOM is ready
    function init() {
        const basePath = getBasePath();

        // Load navbar first, then footer
        loadComponent('navbar', 'navbar-placeholder', basePath);
        loadComponent('footer', 'footer-placeholder', basePath);
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
