const { contextBridge, ipcRenderer } = require('electron');

// Immediate execution to catch early events
(function () {
    console.log("StreamBox: Preload Script Loaded");

    // Fake Fullscreen Implementation
    try {
        const originalRequestFullscreen = Element.prototype.requestFullscreen;
        const originalExitFullscreen = document.exitFullscreen;

        // Helper to enter fake fullscreen
        function enterFake(element) {
            console.log("StreamBox: Entering Fake Fullscreen");

            // Store original styles to restore later
            element.dataset.originalStyle = element.getAttribute('style') || '';

            // Apply strict full-tile styles
            // We use !important to override site styles
            element.style.setProperty('position', 'fixed', 'important');
            element.style.setProperty('top', '0', 'important');
            element.style.setProperty('left', '0', 'important');
            element.style.setProperty('width', '100vw', 'important');
            element.style.setProperty('height', '100vh', 'important');
            element.style.setProperty('z-index', '2147483647', 'important');
            element.style.setProperty('background', '#000', 'important');
            element.style.setProperty('object-fit', 'contain', 'important'); // Keep aspect ratio if needed

            // Mock fullscreenElement property
            Object.defineProperty(document, 'fullscreenElement', {
                get: () => element,
                configurable: true
            });

            // Add a class for CSS targeting if needed
            element.classList.add('streambox-fake-fullscreen');

            // Dispatch events to notify valid players (like YouTube) that we are in fullscreen
            element.dispatchEvent(new Event('fullscreenchange', { bubbles: true }));
            document.dispatchEvent(new Event('fullscreenchange', { bubbles: true }));

            // Handle "Exit Fullscreen" via Escape key (optional safety)
            // But we don't want to capture typing, so only bind if focused?
            // Actually, keep it simple for now. 
        }

        // Helper to exit fake fullscreen
        function exitFake() {
            console.log("StreamBox: Exiting Fake Fullscreen");
            const element = document.fullscreenElement;
            if (!element) return;

            // Restore styles
            const originalStyle = element.dataset.originalStyle;
            if (originalStyle) {
                element.setAttribute('style', originalStyle);
            } else {
                element.removeAttribute('style');
            }
            delete element.dataset.originalStyle;
            element.classList.remove('streambox-fake-fullscreen');

            // Clear fullscreenElement
            Object.defineProperty(document, 'fullscreenElement', {
                get: () => null,
                configurable: true
            });

            // Dispatch events
            element.dispatchEvent(new Event('fullscreenchange', { bubbles: true }));
            document.dispatchEvent(new Event('fullscreenchange', { bubbles: true }));
        }

        // Override Native APIs
        Element.prototype.requestFullscreen = function () {
            enterFake(this);
            return Promise.resolve();
        };
        // Vendor prefixes
        Element.prototype.webkitRequestFullscreen = Element.prototype.requestFullscreen;
        Element.prototype.mozRequestFullScreen = Element.prototype.requestFullscreen;
        Element.prototype.msRequestFullscreen = Element.prototype.requestFullscreen;

        document.exitFullscreen = function () {
            exitFake();
            return Promise.resolve();
        };
        document.webkitExitFullscreen = document.exitFullscreen;
        document.mozCancelFullScreen = document.exitFullscreen;
        document.msExitFullscreen = document.exitFullscreen;

    } catch (err) {
        console.error("StreamBox: Failed to initialize fake fullscreen", err);
    }
})();
