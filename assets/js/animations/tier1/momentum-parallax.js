/**
 * Momentum Scrolling Parallax
 * Velocity-based parallax with smooth damping
 * Multi-layer depth effects on hero section
 */

class ScrollVelocityTracker {
    constructor() {
        this.lastScrollY = window.scrollY;
        this.velocity = 0;
        this.lastTime = Date.now();
        this.damping = 0.95;
        this.listeners = [];
        this.throttleTime = 16; // ~60fps
        this.lastUpdate = 0;

        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        this.startMotionLoop();
    }

    onScroll() {
        const currentTime = Date.now();
        const scrollY = window.scrollY;
        const timeDelta = Math.max(currentTime - this.lastTime, 1); // Avoid division by 0

        // Calculate velocity: pixels per millisecond
        this.velocity = (scrollY - this.lastScrollY) / timeDelta;

        this.lastScrollY = scrollY;
        this.lastTime = currentTime;
    }

    startMotionLoop() {
        const animate = () => {
            const now = Date.now();

            if (now - this.lastUpdate >= this.throttleTime) {
                // Apply damping to velocity
                this.velocity *= this.damping;

                // Notify listeners
                this.listeners.forEach(cb => cb(this.velocity, this.lastScrollY));

                this.lastUpdate = now;
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    /**
     * Register a callback to be called with velocity updates
     */
    onVelocityChange(callback) {
        this.listeners.push(callback);
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Get current velocity
     */
    getVelocity() {
        return this.velocity;
    }

    /**
     * Get current scroll position
     */
    getScrollY() {
        return this.lastScrollY;
    }
}

/**
 * Parallax Layer Manager
 * Manages multiple depth layers with parallax
 */
class ParallaxLayerManager {
    constructor(options = {}) {
        this.tracker = options.tracker || new ScrollVelocityTracker();
        this.layers = new Map();
        this.depthMin = options.depthMin || 0.05;
        this.depthMax = options.depthMax || 0.25;
        this.easing = options.easing || 0.15;  // Smooth catch-up easing
        this.currentOffsets = new Map();

        this.animate();
    }

    /**
     * Register a layer for parallax
     * @param {HTMLElement} element - Element to parallax
     * @param {number} depth - Depth value (0-1, where 0 is background, 1 is foreground)
     */
    addLayer(element, depth) {
        this.layers.set(element, depth);
        this.currentOffsets.set(element, 0);
    }

    /**
     * Remove a layer
     */
    removeLayer(element) {
        this.layers.delete(element);
        this.currentOffsets.delete(element);
    }

    /**
     * Animation loop
     */
    animate() {
        const velocity = this.tracker.getVelocity();

        this.layers.forEach((depth, element) => {
            // Calculate parallax offset based on velocity and depth
            const targetOffset = velocity * depth * 50;  // Scale multiplier
            let currentOffset = this.currentOffsets.get(element) || 0;

            // Smoothly interpolate to target offset
            currentOffset += (targetOffset - currentOffset) * this.easing;

            // Apply transform
            element.style.transform = `translateY(${currentOffset}px)`;

            this.currentOffsets.set(element, currentOffset);
        });

        requestAnimationFrame(() => this.animate());
    }

    /**
     * Get all layers
     */
    getLayers() {
        return Array.from(this.layers.entries());
    }
}

/**
 * Singleton instances
 */
const scrollVelocityTracker = new ScrollVelocityTracker();
const parallaxLayerManager = new ParallaxLayerManager({
    tracker: scrollVelocityTracker
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ScrollVelocityTracker,
        ParallaxLayerManager,
        scrollVelocityTracker,
        parallaxLayerManager
    };
}
