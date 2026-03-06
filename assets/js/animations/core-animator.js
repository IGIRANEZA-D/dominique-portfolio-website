/**
 * Core Animation Orchestrator
 * Main controller that initializes all animation systems
 * Clean, professional, minimal approach
 */

class CoreAnimator {
    constructor() {
        this.config = AnimationConfig;
        this.initialized = false;
    }

    /**
     * Initialize all animation systems
     */
    init() {
        if (this.initialized) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        console.log('🎯 Initializing animation systems...');

        if (prefersReduced) {
            console.log('⚙️  Respecting prefers-reduced-motion');
            this.disableAnimations();
            return;
        }

        // Initialize in order of priority
        this.initScrollAnimations();
        this.initInteractionAnimations();
        this.initParticles();

        this.initialized = true;
        console.log('✅ Animation systems ready');
    }

    /**
     * Initialize scroll-triggered animations
     * Counters, progress bars, timeline reveals
     */
    initScrollAnimations() {
        console.log('📊 Initializing scroll animations...');

        // Stat counters
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    this.animateCounter(entry.target);
                    entry.target.dataset.animated = 'true';
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('[data-animate-counter]').forEach(el => observer.observe(el));

        // Progress bars
        const barObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    const target = entry.target.dataset.progressBar || '100';
                    this.animateProgressBar(entry.target, parseInt(target));
                    entry.target.dataset.animated = 'true';
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('[data-progress-bar]').forEach(el => barObserver.observe(el));

        // Timeline / card reveals on scroll
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && !entry.target.dataset.revealed) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * this.config.scroll.staggerDelay);
                    entry.target.dataset.revealed = 'true';
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `opacity ${this.config.timing.slow}ms, transform ${this.config.timing.slow}ms`;
            revealObserver.observe(el);
        });

        console.log('  ✓ Scroll animations ready');
    }

    /**
     * Initialize interaction animations
     * Button hovers, ripples, card tilts
     */
    initInteractionAnimations() {
        console.log('🖱️  Initializing interaction animations...');

        // Button hover animations
        document.querySelectorAll('button, [data-ripple]').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                springController.animate(btn, 'scale', 1.05, this.config.springs.button);
            });

            btn.addEventListener('mouseleave', () => {
                springController.animate(btn, 'scale', 1.0, this.config.springs.smooth);
            });
        });

        // Card hover tilt (subtle, professional)
        document.querySelectorAll(this.config.selectors.cardTilt).forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (window.matchMedia('(pointer:coarse)').matches) return; // No tilt on touch

                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                // Subtle 3-5 degree tilt
                const rotX = (y - 0.5) * 6;
                const rotY = (x - 0.5) * -6;

                card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });

        console.log('  ✓ Interactive animations ready');
    }

    /**
     * Initialize particle system in hero
     */
    initParticles() {
        console.log('✨ Initializing particle system...');

        // Lazy load particles when hero is visible
        const canvas = document.querySelector(this.config.selectors.particleCanvas);
        if (!canvas) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.setupParticles(canvas);
                observer.disconnect();
            }
        });

        observer.observe(canvas);
    }

    /**
     * Setup particle system on canvas
     */
    setupParticles(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.5;

        // Get optimized particle count
        const particles = [];
        const width = window.innerWidth;
        let particleCount = this.config.particles.deskt op;

        if (width < 640) particleCount = this.config.particles.mobile;
        else if (width < 1024) particleCount = this.config.particles.tablet;

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                radius: Math.random() * 2 + 0.5,
                life: 1
            });
        }

        // Animation loop
        const animate = () => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-accent')
                .trim();

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += this.config.particles.gravity;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -0.9;

                p.vx *= this.config.particles.friction;
                p.vy *= this.config.particles.friction;

                ctx.globalAlpha = p.life * 0.6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            requestAnimationFrame(animate);
        };

        animate();
        console.log('  ✓ Particles initialized');
    }

    /**
     * Animate counter from 0 to target
     */
    animateCounter(element) {
        const target = parseInt(element.dataset.animateCounter) || parseInt(element.textContent) || 0;
        let current = 0;
        const duration = 1500;
        const start = Date.now();

        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            current = Math.floor(target * eased);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target;
            }
        };

        animate();
    }

    /**
     * Animate progress bar fill
     */
    animateProgressBar(element, target) {
        const duration = this.config.timing.slow;
        const start = Date.now();

        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const width = target * eased;

            element.style.width = width + '%';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.width = target + '%';
            }
        };

        animate();
    }

    /**
     * Disable animations for accessibility
     */
    disableAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation: none !important;
                transition: none !important;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Initialize animations when ready
 */
const animator = new CoreAnimator();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => animator.init());
} else {
    animator.init();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CoreAnimator, animator };
}
