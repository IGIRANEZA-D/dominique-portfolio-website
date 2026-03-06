/**
 * Animation Configuration
 * Centralized, professional animation settings
 * Optimized for tech/startup aesthetic
 */

const AnimationConfig = {
    // Timing (professional durations only)
    timing: {
        fast: 200,      // Ripple, quick feedback
        normal: 350,    // Default animations
        slow: 600       // Entrances, complex effects
    },

    // Easing curves (professional subset)
    easing: {
        linear: 'cubic-bezier(0, 0, 1, 1)',
        inOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        outCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },

    // Spring presets (simplified)
    springs: {
        button: { stiffness: 300, damping: 20, mass: 1 },    // Quick response
        card: { stiffness: 150, damping: 12, mass: 1 },      // Subtle bounce
        smooth: { stiffness: 50, damping: 20, mass: 1.5 }    // Gentle
    },

    // Particle system (optimized)
    particles: {
        desktop: 35,        // Desktop: 35 particles (was 60)
        tablet: 25,         // Tablet: 25 particles
        mobile: 15,         // Mobile: 15 particles
        gravity: 0.08,      // Subtle gravity
        friction: 0.98,     // Air resistance
        connectionDist: 100 // Connection line distance
    },

    // Scroll animation thresholds
    scroll: {
        observerThreshold: 0.25,
        staggerDelay: 50  // ms between staggered elements
    },

    // Ripple effect settings
    ripple: {
        duration: 200,
        maxRadius: 250,
        maxParallel: 3  // Max ripples per button (was 6)
    },

    // Animation selectors (what should animate)
    selectors: {
        ripple: '[data-ripple]',           // Buttons only
        counter: '[data-animate-counter]', // Stat numbers
        progressBar: '[data-progress-bar]', // Skill bars
        scrollReveal: '[data-scroll-reveal]', // Timeline, project cards
        cardTilt: '.project-card, .skill-card', // Hover tilt (subtle)
        particleCanvas: '#particleCanvas'
    },

    // Constraints (professional, not excessive)
    limits: {
        maxConcurrentAnimations: 5,  // Never more than 5 at once
        maxAnimationDuration: 600,   // Never longer than 600ms
        minAnimationDuration: 150    // Never shorter than 150ms
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationConfig;
}
