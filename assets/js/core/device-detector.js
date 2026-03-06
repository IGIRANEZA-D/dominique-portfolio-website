/**
 * Device Capability Detector
 * Detects device type, GPU capability, and user motion preferences
 */

const DeviceDetector = (() => {
    const preferences = {
        // Touch device detection
        isTouchDevice() {
            return !!(window.matchMedia("(pointer:coarse)").matches ||
                     navigator.maxTouchPoints > 0 ||
                     navigator.msMaxTouchPoints > 0);
        },

        // Reduced motion preference (accessibility)
        prefersReducedMotion() {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        },

        // GPU capability check
        supportsGPUAcceleration() {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        },

        // WebGL 2.0 support for advanced effects
        supportsWebGL2() {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl2');
        },

        // Backdrop filter support (for glassmorphism)
        supportsBackdropFilter() {
            const div = document.createElement('div');
            div.style.backdropFilter = 'blur(10px)';
            return div.style.backdropFilter !== '';
        },

        // Will-change support
        supportsWillChange() {
            const div = document.createElement('div');
            div.style.willChange = 'transform';
            return div.style.willChange !== '';
        },

        // Transform3d support (GPU acceleration)
        supportsTransform3d() {
            const div = document.createElement('div');
            div.style.transform = 'translate3d(0,0,0)';
            return div.style.transform !== '';
        },

        // Animation frame throttling based on device
        getAnimationFrameThrottle() {
            if (this.isTouchDevice()) {
                return 30; // Mobile: ~30fps
            }
            return 16; // Desktop: ~60fps
        },

        // Get device-optimized particle count
        getParticleCount() {
            if (this.isTouchDevice()) {
                return this.supportsGPUAcceleration() ? 30 : 20; // Mobile reduced
            }
            return this.supportsWebGL2() ? 60 : 40; // Desktop
        },

        // Get device class
        getDeviceClass() {
            if (this.isTouchDevice()) {
                const width = window.innerWidth;
                if (width > 1024) return 'tablet';
                return 'phone';
            }
            return 'desktop';
        }
    };

    return {
        ...preferences
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceDetector;
}
