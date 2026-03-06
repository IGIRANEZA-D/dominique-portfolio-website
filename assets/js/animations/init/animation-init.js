/**
 * Animation System Initializer
 * Loads and initializes all animation systems based on device capabilities
 */

class AnimationSystemInitializer {
    constructor() {
        this.initialized = false;
        this.systems = {};
        this.config = {};
    }

    /**
     * Initialize all animation systems
     */
    init() {
        if (this.initialized) return;

        // Detect device capabilities
        const deviceClass = DeviceDetector.getDeviceClass();
        const prefersReduced = DeviceDetector.prefersReducedMotion();

        console.log(`🎨 Initializing animations for ${deviceClass} device`);

        // If user prefers reduced motion, minimize animations
        if (prefersReduced) {
            console.log('⚙️ User prefers reduced motion - disabling complex animations');
            this.setupReducedMotionMode();
            return;
        }

        // Initialize Tier 1: Physics-Based Animations
        this.initPhysicsAnimations();

        // Initialize Tier 2: Parallax & Depth (lazy load on first scroll)
        this.initScrollAnimations();

        // Initialize Tier 3: SVG Morphing (lazy load on first hover)
        this.initSVGAnimations();

        // Initialize Tier 4: Particles (lazy load when hero visible)
        this.initParticleSystem();

        // Initialize Tier 4: Sparkles (on first interaction)
        this.initSparkles();

        this.initialized = true;

        console.log('✅ All animation systems initialized');
    }

    /**
     * Initialize physics-based animations
     */
    initPhysicsAnimations() {
        console.log('⚡ Initializing Tier 1: Physics Animations');

        // Ripple effects are auto-initialized via event delegation
        // rippleManager handles all [data-ripple] elements

        // Add button hover animations with spring physics
        document.querySelectorAll('.btn, [data-spring]').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                springController.animate(btn, 'scale', 1.05, 'snappy');
            });

            btn.addEventListener('mouseleave', () => {
                springController.animate(btn, 'scale', 1.0, 'gentle');
            });

            btn.addEventListener('mousedown', () => {
                springController.animate(btn, 'scale', 0.95, 'snappy');
            });

            btn.addEventListener('mouseup', () => {
                springController.animate(btn, 'scale', 1.05, 'bouncy');
            });
        });

        // Momentum parallax on hero elements
        const heroGlows = document.querySelectorAll('.hero-glow');
        heroGlows.forEach(glow => {
            parallaxLayerManager.addLayer(glow, 0.1);
        });

        const heroImage = document.querySelector('.image-frame');
        if (heroImage) {
            parallaxLayerManager.addLayer(heroImage, 0.15);
        }

        console.log('  ✓ Spring physics, ripples, momentum parallax initialized');
    }

    /**
     * Initialize scroll-based animations (lazy)
     */
    initScrollAnimations() {
        console.log('⚡ Initializing Tier 2: Scrollable/Depth Animations');

        // Lazy load on first scroll interaction
        let hasScrolled = false;
        const handleScroll = () => {
            if (hasScrolled) return;
            hasScrolled = true;
            window.removeEventListener('scroll', handleScroll);

            // Add mouse parallax to cards
            document.querySelectorAll('.skill-card, .project-card').forEach(card => {
                this.setupCardTilt(card);
            });

            console.log('  ✓ Card tilt and parallax initialized');
        };

        window.addEventListener('scroll', handleScroll, { once: true, passive: true });
    }

    /**
     * Setup 3D card tilt on hover
     */
    setupCardTilt(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation based on mouse position
            const rotX = ((y / rect.height) - 0.5) * 12;  // 12 degree max
            const rotY = ((x / rect.width) - 0.5) * -12;

            card.style.transform = `
                perspective(1000px)
                rotateX(${rotX}deg)
                rotateY(${rotY}deg)
                translateZ(10px)
            `;

            // Enhance shadow on tilt
            const shadowOpacity = 0.2 + (Math.abs(rotX) + Math.abs(rotY)) / 24 * 0.4;
            card.style.boxShadow = `0 20px 60px rgba(0, 0, 0, ${shadowOpacity})`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            card.style.boxShadow = 'var(--shadow-md)';
        });
    }

    /**
     * Initialize SVG animations (lazy)
     */
    initSVGAnimations() {
        console.log('⚡ Initializing Tier 3: SVG Animations');

        // SVG morphing on hover
        document.querySelectorAll('svg[data-morph]').forEach(svg => {
            svg.addEventListener('mouseenter', () => {
                // Scale and opacity shift for simple morph effect
                springController.animate(svg, 'scale', 1.15, 'snappy');
            });

            svg.addEventListener('mouseleave', () => {
                springController.animate(svg, 'scale', 1.0, 'gentle');
            });
        });

        console.log('  ✓ SVG morphing and animations initialized');
    }

    /**
     * Initialize particle system (lazy)
     */
    initParticleSystem() {
        console.log('⚡ Initializing Tier 4: Particle System');

        // Lazy load particles when hero is visible
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setupParticles();
                    observer.disconnect();
                }
            });
        });

        observer.observe(hero);
    }

    /**
     * Setup particle canvas animation
     */
    setupParticles() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        // Initialize advanced particle system
        const ps = initParticleSystem(canvas);
        if (!ps) return;

        console.log('  ✓ Particle system initialized with auto-emission');
    }

    /**
     * Initialize sparkles (on first interaction)
     */
    initSparkles() {
        console.log('⚡ Initializing Tier 4: Sparkles & Feedback');

        document.addEventListener('click', () => this.createSparkle(event), { once: true });
    }

    /**
     * Create sparkle burst at click
     */
    createSparkle(event) {
        const x = event.clientX;
        const y = event.clientY;

        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const velocity = 200;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';
            sparkle.style.position = 'fixed';
            sparkle.style.width = '4px';
            sparkle.style.height = '4px';
            sparkle.style.borderRadius = '50%';
            sparkle.style.backgroundColor = 'var(--color-accent)';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '9999';

            document.body.appendChild(sparkle);

            // Animate sparkle
            let lifetime = 600;
            let startTime = Date.now();
            const animateSparkle = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / lifetime, 1);

                const currentX = x + vx * progress * (1 - progress * 0.5);
                const currentY = y + vy * progress * (1 - progress * 0.5);
                const opacity = 1 - progress;

                sparkle.style.left = currentX + 'px';
                sparkle.style.top = currentY + 'px';
                sparkle.style.opacity = opacity;

                if (progress < 1) {
                    requestAnimationFrame(animateSparkle);
                } else {
                    sparkle.remove();
                }
            };

            requestAnimationFrame(animateSparkle);
        }

        // Re-enable sparkles for future clicks
        document.addEventListener('click', (e) => this.createSparkle(e));
    }

    /**
     * Setup reduced motion mode (accessibility)
     */
    setupReducedMotionMode() {
        // Disable particle system
        const canvas = document.getElementById('particleCanvas');
        if (canvas) {
            canvas.style.display = 'none';
        }

        // Reduce animation durations
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
        `;
        document.head.appendChild(style);

        console.log('✅ Reduced motion mode enabled');
    }
}

/**
 * Initialize animations when DOM is ready
 */
const initializeAnimations = () => {
    const initializer = new AnimationSystemInitializer();
    initializer.init();
};

// Wait for DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnimations);
} else {
    initializeAnimations();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnimationSystemInitializer, initializeAnimations };
}
