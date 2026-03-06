/**
 * Scroll-Triggered Depth Animations
 * Elements animate in with depth perception as they scroll into view
 * Uses IntersectionObserver for efficiency
 */

class ScrollDepthAnimator {
    constructor() {
        this.observer = null;
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        const options = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, options);

        // Find elements to observe
        this.observeElements();
    }

    /**
     * Find and start observing elements with data-animate attribute
     */
    observeElements() {
        // Timeline items
        document.querySelectorAll('[data-timeline-index]').forEach(el => {
            this.observer.observe(el);
        });

        // Project cards
        document.querySelectorAll('.project-card').forEach(el => {
            this.observer.observe(el);
        });

        // Skill items
        document.querySelectorAll('.skill-item').forEach(el => {
            this.observer.observe(el);
        });

        // About values
        document.querySelectorAll('.value-card').forEach(el => {
            this.observer.observe(el);
        });

        // Certification items
        document.querySelectorAll('.cert-badge').forEach(el => {
            this.observer.observe(el);
        });
    }

    /**
     * Animate element with depth effect
     */
    animateElement(element) {
        const index = element.getAttribute('data-timeline-index') || 0;
        const staggerDelay = parseInt(index) * 50; // ms

        // Get element's position in viewport
        const rect = element.getBoundingClientRect();
        const depth = Math.abs(rect.top / window.innerHeight); // 0 to 1

        // Start with depth perspective
        element.style.opacity = '0';
        element.style.transform = `
            perspective(1000px)
            translateZ(-500px)
            rotateX(15deg)
            translateY(30px)
        `;
        element.style.filter = 'blur(2px)';

        // Trigger animation
        setTimeout(() => {
            element.style.transition = `
                opacity 800ms ease-out,
                transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1),
                filter 800ms ease-out
            `;
            element.style.opacity = '1';
            element.style.transform = `
                perspective(1000px)
                translateZ(0)
                rotateX(0deg)
                translateY(0)
            `;
            element.style.filter = 'blur(0)';

            // Clean up styles after animation
            setTimeout(() => {
                element.style.transition = 'none';
            }, 800);
        }, staggerDelay);
    }

    /**
     * Stop observing elements
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

/**
 * Singleton instance
 */
const scrollDepthAnimator = new ScrollDepthAnimator();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
    scrollDepthAnimator.destroy();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScrollDepthAnimator, scrollDepthAnimator };
}
