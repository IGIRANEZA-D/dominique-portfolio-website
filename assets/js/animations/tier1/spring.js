/**
 * Spring Physics Engine
 * Configurable spring simulation with stiffness, damping, and mass
 * Supports single values and multi-property springs
 */

class SpringSimulation {
    constructor(options = {}) {
        // Physics parameters
        this.mass = options.mass || 1;
        this.stiffness = options.stiffness || 150;
        this.damping = options.damping || 10;
        this.velocity = options.velocity || 0;
        this.position = options.position || 0;
        this.target = options.target || 0;

        // State
        this.isComplete = false;
        this.restThreshold = options.restThreshold || 0.001;
        this.callback = options.callback || null;
        this.animationFrameId = null;

        // Tracking
        this.startTime = null;
        this.lastValue = this.position;
    }

    /**
     * Update the spring simulation by one frame
     * @returns {number} Current position value
     */
    update() {
        if (this.isComplete) return this.position;

        // Calculate forces
        const displacement = this.target - this.position;
        const springForce = -this.stiffness * displacement;
        const dampingForce = -this.damping * this.velocity;

        // Apply Newton's second law: F = ma
        const totalForce = springForce + dampingForce;
        const acceleration = totalForce / this.mass;

        // Update velocity and position
        this.velocity += acceleration;
        this.position += this.velocity;

        // Check if spring is at rest (within threshold of target)
        if (Math.abs(this.velocity) < this.restThreshold &&
            Math.abs(this.position - this.target) < this.restThreshold) {
            this.position = this.target;
            this.velocity = 0;
            this.isComplete = true;
        }

        // Execute callback with current value
        if (this.callback) {
            this.callback(this.position);
        }

        return this.position;
    }

    /**
     * Start animating the spring
     */
    start() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        this.isComplete = false;
        this.startTime = Date.now();

        const animate = () => {
            this.update();
            if (!this.isComplete) {
                this.animationFrameId = requestAnimationFrame(animate);
            }
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    /**
     * Stop the animation
     */
    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Set target value
     */
    setTarget(target) {
        this.target = target;
        this.isComplete = false;
    }

    /**
     * Reset to initial state
     */
    reset(position = 0) {
        this.position = position;
        this.velocity = 0;
        this.isComplete = true;
        this.stop();
    }

    /**
     * Get progress (0-1) towards completion
     */
    getProgress() {
        return Math.min(1, Math.abs(this.position - 0) / Math.abs(this.target - 0));
    }
}

/**
 * Spring Simulation Presets
 */
const SpringPresets = {
    snappy: { stiffness: 300, damping: 20, mass: 1 },
    bouncy: { stiffness: 150, damping: 10, mass: 1 },
    gentle: { stiffness: 50, damping: 20, mass: 1.5 },
    elastic: { stiffness: 200, damping: 12, mass: 1 },
    stiff: { stiffness: 400, damping: 25, mass: 1 }
};

/**
 * Spring Animation Manager
 * High-level interface for element animations
 */
class SpringAnimationController {
    constructor() {
        this.springs = new Map();
        this.elementSprings = new WeakMap();
    }

    /**
     * Create and start a spring animation on an element
     * @param {HTMLElement} element - Target element
     * @param {string} property - CSS property to animate (e.g., 'opacity', 'scale')
     * @param {number} target - Target value
     * @param {string|object} preset - Spring preset name or custom config
     * @param {function} callback - Optional callback on complete
     */
    animate(element, property, target, preset = 'snappy', callback = null) {
        const presetConfig = typeof preset === 'string'
            ? SpringPresets[preset]
            : preset;

        if (!element.dataset.springKey) {
            element.dataset.springKey = Math.random().toString(36);
        }

        const key = `${element.dataset.springKey}_${property}`;

        // Stop existing animation on this property
        if (this.springs.has(key)) {
            this.springs.get(key).stop();
        }

        const spring = new SpringSimulation({
            ...presetConfig,
            target: target,
            callback: (value) => this.applyPropertyValue(element, property, value)
        });

        this.springs.set(key, spring);
        spring.start();

        if (callback) {
            const originalCallback = spring.callback;
            spring.callback = (value) => {
                if (originalCallback) originalCallback(value);
                if (spring.isComplete) callback(value);
            };
        }

        return spring;
    }

    /**
     * Apply a property value to an element
     * Handles CSS properties intelligently
     */
    applyPropertyValue(element, property, value) {
        switch (property) {
            case 'opacity':
                element.style.opacity = value;
                break;
            case 'scale':
                element.style.transform = `scale(${value})`;
                break;
            case 'translateX':
                element.style.transform = `translateX(${value}px)`;
                break;
            case 'translateY':
                element.style.transform = `translateY(${value}px)`;
                break;
            case 'rotate':
                element.style.transform = `rotate(${value}deg)`;
                break;
            default:
                // Custom CSS property
                if (property.startsWith('--')) {
                    element.style.setProperty(property, value);
                } else {
                    element.style[property] = value;
                }
        }
    }

    /**
     * Stop all Springs for an element
     */
    stopElement(element) {
        const springsList = Array.from(this.springs.values());
        springsList.forEach(spring => spring.stop());
    }

    /**
     * Stop all springs
     */
    stopAll() {
        this.springs.forEach(spring => spring.stop());
        this.springs.clear();
    }
}

/**
 * Singleton instance
 */
const springController = new SpringAnimationController();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpringSimulation, SpringAnimationController, SpringPresets, springController };
}
