/**
 * Physics Math Utilities
 * Easing functions, trigonometry, and physics calculations
 */

const MathUtils = (() => {
    const TWO_PI = Math.PI * 2;

    return {
        // Easing functions
        easings: {
            // Linear
            linear: (t) => t,

            // In/Out quad
            easeInQuad: (t) => t * t,
            easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
            easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

            // Cubic (smooth default)
            easeInCubic: (t) => t * t * t,
            easeOutCubic: (t) => 1 - (1 - t) ** 3,
            easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2,

            // Spring with overshoot (bouncy)
            easeOutElastic: (t) => {
                const c5 = (2 * Math.PI) / 4.5;
                return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1;
            },

            // Bounce effect
            easeOutBounce: (t) => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) return n1 * t * t;
                if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
                if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            },

            // Smooth step
            smoothstep: (t) => t * t * (3 - 2 * t),

            // Smootherstep (even smoother)
            smootherstep: (t) => t * t * t * (t * (t * 6 - 15) + 10)
        },

        // Interpolation
        lerp: (a, b, t) => a + (b - a) * t,
        clamp: (a, min, max) => Math.min(Math.max(a, min), max),
        invLerp: (a, b, t) => (t - a) / (b - a),
        map: (value, inMin, inMax, outMin, outMax) => {
            return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
        },

        // Trigonometry
        sine: (angle) => Math.sin(angle),
        cosine: (angle) => Math.cos(angle),
        tangent: (angle) => Math.tan(angle),

        // Distance and angle calculations
        distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
        angle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
        angleDegrees: (x1, y1, x2, y2) => (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI,

        // Vector operations
        vector: {
            create: (x = 0, y = 0) => ({ x, y }),
            add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
            subtract: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
            multiply: (v, scalar) => ({ x: v.x * scalar, y: v.y * scalar }),
            divide: (v, scalar) => ({ x: v.x / scalar, y: v.y / scalar }),
            magnitude: (v) => Math.hypot(v.x, v.y),
            normalize: (v) => {
                const mag = Math.hypot(v.x, v.y);
                return mag === 0 ? { x: 0, y: 0 } : { x: v.x / mag, y: v.y / mag };
            },
            dot: (v1, v2) => v1.x * v2.x + v1.y * v2.y,
            limit: (v, max) => {
                const mag = Math.hypot(v.x, v.y);
                if (mag > max) {
                    const scalar = max / mag;
                    return { x: v.x * scalar, y: v.y * scalar };
                }
                return v;
            }
        },

        // Spring physics
        spring: {
            // Calculate spring force: F = -k * x
            force: (displacement, stiffness) => -stiffness * displacement,

            // Damping force: F = -c * v
            damping: (velocity, damping) => -damping * velocity,

            // Check if spring is at rest
            isAtRest: (velocity, position, restOffset = 0.001) => {
                return Math.abs(velocity) < restOffset && Math.abs(position) < restOffset;
            }
        },

        // Random utilities
        random: {
            float: (min = 0, max = 1) => Math.random() * (max - min) + min,
            int: (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1)) + min,
            bool: (probability = 0.5) => Math.random() < probability,
            choose: (array) => array[Math.floor(Math.random() * array.length)],
        },

        // Radian/Degree conversion
        toRadians: (degrees) => (degrees * Math.PI) / 180,
        toDegrees: (radians) => (radians * 180) / Math.PI,

        // Normalize angle to 0-360 degrees or 0-2PI radians
        normalizeAngle: (angle, radians = false) => {
            const max = radians ? TWO_PI : 360;
            return ((angle % max) + max) % max;
        }
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathUtils;
}
