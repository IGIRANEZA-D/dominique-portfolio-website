/**
 * Elastic Card Expansion
 * Smooth height transitions with elastic easing
 * Staggered animations for child elements
 */

class ElasticCardController {
    constructor() {
        this.expandedCards = new WeakSet();
        this.animationFrameIds = new WeakMap();
        this.measurements = new WeakMap();
    }

    /**
     * Toggle card expansion with elastic animation
     * @param {HTMLElement} card - Card element to expand/collapse
     * @param {number} duration - Animation duration in milliseconds
     */
    toggleExpand(card, duration = 600) {
        const isExpanded = this.expandedCards.has(card);

        if (isExpanded) {
            this.collapse(card, duration);
        } else {
            this.expand(card, duration);
        }
    }

    /**
     * Expand a card smoothly
     */
    expand(card, duration = 600) {
        if (this.expandedCards.has(card)) return;

        // Measure expanded height
        const expandedHeight = this.measureHeight(card);

        // Cancel any existing animation
        if (this.animationFrameIds.has(card)) {
            cancelAnimationFrame(this.animationFrameIds.get(card));
        }

        // Start animation
        const startTime = Date.now();
        const startHeight = card.offsetHeight;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Use elastic easing for bounce effect
            const easedProgress = this.elasticEaseOut(progress);
            const newHeight = startHeight + (expandedHeight - startHeight) * easedProgress;

            card.style.maxHeight = newHeight + 'px';
            card.style.opacity = 0.8 + (0.2 * easedProgress);  // Fade in
            card.style.overflow = 'hidden';

            // Animate children with stagger
            const children = card.querySelectorAll('[data-expand-child]');
            children.forEach((child, index) => {
                const childDelay = (index * 50) / duration;  // Stagger delay as fraction
                const childProgress = Math.max(0, progress - childDelay);
                const childOpacity = childProgress < 0.1 ? 0 : childProgress;

                child.style.opacity = childOpacity;
                child.style.transform = `translateY(${(1 - childOpacity) * 10}px)`;
            });

            if (progress < 1) {
                const frameId = requestAnimationFrame(animate);
                this.animationFrameIds.set(card, frameId);
            } else {
                card.style.maxHeight = 'none';
                card.style.opacity = '1';
                this.expandedCards.add(card);
                card.dataset.expanded = 'true';
            }
        };

        animate();
    }

    /**
     * Collapse a card smoothly
     */
    collapse(card, duration = 600) {
        if (!this.expandedCards.has(card)) return;

        // Cancel any existing animation
        if (this.animationFrameIds.has(card)) {
            cancelAnimationFrame(this.animationFrameIds.get(card));
        }

        const startTime = Date.now();
        const startHeight = card.offsetHeight;
        const collapsedHeight = this.measureBaseHeight(card);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Use ease-out-cubic for smooth collapse
            const easedProgress = this.easeOutCubic(progress);
            const newHeight = startHeight - (startHeight - collapsedHeight) * easedProgress;

            card.style.maxHeight = newHeight + 'px';
            card.style.opacity = 1 - (0.2 * easedProgress);

            // Animate children fade out
            const children = card.querySelectorAll('[data-expand-child]');
            children.forEach((child) => {
                child.style.opacity = 1 - easedProgress;
                child.style.transform = `translateY(${easedProgress * 10}px)`;
            });

            if (progress < 1) {
                const frameId = requestAnimationFrame(animate);
                this.animationFrameIds.set(card, frameId);
            } else {
                card.style.maxHeight = collapsedHeight + 'px';
                card.style.opacity = '0.8';
                this.expandedCards.delete(card);
                card.dataset.expanded = 'false';

                // Reset child visibility
                const children = card.querySelectorAll('[data-expand-child]');
                children.forEach((child) => {
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(10px)';
                });
            }
        };

        animate();
    }

    /**
     * Measure the full expanded height of a card
     * Uses a clone to measure without affecting layout
     */
    measureHeight(card) {
        // Check cache first
        if (this.measurements.has(card)) {
            return this.measurements.get(card);
        }

        // Create a temporary clone
        const clone = card.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.maxHeight = 'none';
        clone.style.overflow = 'visible';

        document.body.appendChild(clone);
        const height = clone.offsetHeight;
        document.body.removeChild(clone);

        // Cache measurement
        this.measurements.set(card, height);

        return height;
    }

    /**
     * Measure the base (collapsed) height
     */
    measureBaseHeight(card) {
        const clone = card.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.maxHeight = 'none';
        clone.style.overflow = 'hidden';

        // Hide expand children
        clone.querySelectorAll('[data-expand-child]').forEach(el => {
            el.style.display = 'none';
        });

        document.body.appendChild(clone);
        const height = clone.offsetHeight;
        document.body.removeChild(clone);

        return height;
    }

    /**
     * Elastic ease-out function (bounce effect)
     */
    elasticEaseOut(t) {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0 ? 0 : t === 1 ? 1 :
            Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1;
    }

    /**
     * Ease out cubic (smooth deceleration)
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Clear all animations
     */
    clearAll() {
        this.animationFrameIds = new WeakMap();
        this.measurements = new WeakMap();
        this.expandedCards = new WeakSet();
    }
}

/**
 * Singleton instance
 */
const elasticCardController = new ElasticCardController();

// Auto-attach to project cards with expand buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.project-card .expand-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.project-card');
            if (card) {
                elasticCardController.toggleExpand(card);
            }
        });
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ElasticCardController, elasticCardController };
}
