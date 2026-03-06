/**
 * Animation Constants & Configuration
 * Shared configuration for all animation systems
 */

const AnimationConstants = {
    // Timing
    durations: {
        fast: 150,
        base: 300,
        slow: 500,
        slower: 800,
        slowest: 1200
    },

    // Physics presets for springs
    springs: {
        snappy: { stiffness: 300, damping: 20, mass: 1 },
        bouncy: { stiffness: 150, damping: 10, mass: 1 },
        gentle: { stiffness: 50, damping: 20, mass: 1.5 },
        elastic: { stiffness: 200, damping: 12, mass: 1 },
        stiff: { stiffness: 400, damping: 25, mass: 1 }
    },

    // Easing curves (cubic-bezier)
    easing: {
        linear: 'cubic-bezier(0, 0, 1, 1)',
        easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        easeOutElastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        easeOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },

    // Parallax depth values
    parallax: {
        depositMin: 0.05,      // Background elements (subtle)
        depthMid: 0.15,        // Middle layer
        depthMax: 0.25,        // Foreground elements (pronounced)
        velocityDamping: 0.95  // Smoothing factor
    },

    // 3D perspective and tilt
    perspective: {
        depth: 1000,           // px
        cardTiltMax: 12,       // degrees
        parallaxRotMax: 10     // degrees
    },

    // Particle system
    particles: {
        countMin: 20,          // Mobile minimum
        countDefault: 40,      // Normal desktop count
        countMax: 60,          // High-end desktop
        gravity: 0.1,          // Downward acceleration
        friction: 0.98,        // Air resistance
        lifetime: 3000,        // ms before removal
        poolSize: 200          // Pre-allocated particles
    },

    // SVG animations
    svg: {
        morphDuration: 500,    // ms
        strokeDuration: 600,   // ms
        floatDuration: 1000    // ms
    },

    // Ripple effect
    ripple: {
        maxRadius: 300,        // px spread distance
        duration: 600,         // ms
        maxParallel: 6,        // Max ripples per element
        darkColor: 'rgba(0, 0, 0, 0.2)',
        lightColor: 'rgba(255, 255, 255, 0.2)'
    },

    // Sparkles
    sparkles: {
        countPerBurst: 12,     // Particles per burst
        lifetime: 700,         // ms
        spreadAngle: 360,      // degrees
        initialVelocity: 300   // px/s
    },

    // Color palette for animations
    colors: {
        light: {
            primary: '#0D47A1',
            accent: '#00BCD4',
            accentLight: '#4DD0E1',
            success: '#FFB300',
            purple: '#6A1B9A',
            text: '#0E1421'
        },
        dark: {
            primary: '#1565C0',
            accent: '#4DD0E1',
            accentLight: '#80DEEA',
            success: '#FFB300',
            purple: '#CE93D8',
            text: '#ECF0F1'
        }
    },

    // Scroll detection
    scroll: {
        throttleDelay: 30,     // ms between scroll events
        observerThreshold: 0.3 // When to trigger animations
    },

    // Performance thresholds
    performance: {
        maxParticles: 60,
        targetFPS: 60,
        mobileTargetFPS: 30,
        gpuThreshold: 0.8      // Use GPU if capability > 80%
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationConstants;
}
