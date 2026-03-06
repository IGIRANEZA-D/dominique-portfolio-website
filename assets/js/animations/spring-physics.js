/**
 * Simplified Spring Physics Module
 * Lightweight spring simulations for professional UI animations
 */

class SimpleSpring {
    constructor(target = 0, config = {}) {
        this.target = target;
        this.position = target;
        this.velocity = 0;
        this.stiffness = config.stiffness || 150;
        this.damping = config.damping || 12;
        this.mass = config.mass || 1;
        this.isComplete = false;
        this.callback = config.callback || null;
        this.restThreshold = 0.001;
    }

    update() {
        if (this.isComplete) return this.position;

        const displacement = this.target - this.position;
        const springForce = -this.stiffness * displacement;
        const dampingForce = -this.damping * this.velocity;
        const acceleration = (springForce + dampingForce) / this.mass;

        this.velocity += acceleration;
        this.position += this.velocity;

        if (Math.abs(this.velocity) < this.restThreshold &&
            Math.abs(this.position - this.target) < this.restThreshold) {
            this.position = this.target;
            this.velocity = 0;
            this.isComplete = true;
        }

        return this.position;
    }

    setTarget(target) {
        this.target = target;
        this.isComplete = false;
    }

    reset() {
        this.position = this.target;
        this.velocity = 0;
        this.isComplete = true;
    }
}

/**
 * Simple Spring Controller
 * Manages spring animations on HTML elements
 */
class SimpleSpringController {
    constructor() {
        this.springs = new Map();
    }

    animate(element, property, target, config = {}) {
        const key = `${element.id || Math.random()}_${property}`;

        if (this.springs.has(key)) {
            this.springs.get(key).setTarget(target);
            return;
        }

        const spring = new SimpleSpring(target, {
            ...config,
            callback: (value) => this.applyValue(element, property, value)
        });

        this.springs.set(key, spring);
        this.startAnimation(key);
    }

    applyValue(element, property, value) {
        if (property === 'scale') {
            element.style.transform = `scale(${value})`;
        } else if (property === 'opacity') {
            element.style.opacity = value;
        } else {
            element.style[property] = value;
        }
    }

    startAnimation(key) {
        const spring = this.springs.get(key);
        if (!spring) return;

        const animate = () => {
            spring.update();
            if (!spring.isComplete) {
                requestAnimationFrame(animate);
            } else {
                this.springs.delete(key);
            }
        };

        requestAnimationFrame(animate);
    }

    stop() {
        this.springs.clear();
    }
}

const springController = new SimpleSpringController();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimpleSpring, SimpleSpringController, springController };
}
