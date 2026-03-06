/**
 * Ripple Effect System
 * Material Design-style ripple on click with theme awareness
 */

class RippleManager {
    constructor() {
        this.maxRipples = 6;
        this.rippleQueues = new WeakMap();
        this.init();
    }

    init() {
        // Use event delegation for click events
        document.addEventListener('click', (e) => this.handleClick(e), true);

        // Add CSS for ripple animation if not already present
        if (!document.getElementById('ripple-style')) {
            this.injectRippleStyles();
        }
    }

    injectRippleStyles() {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: currentColor;
                opacity: 0.3;
                animation: ripple-spread 600ms ease-out forwards;
                pointer-events: none;
            }

            @keyframes ripple-spread {
                0% {
                    width: 10px;
                    height: 10px;
                    opacity: 0.5;
                }
                100% {
                    width: 300px;
                    height: 300px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    handleClick(event) {
        const target = event.target.closest('[data-ripple]');
        if (!target) return;

        this.createRipple(target, event);
    }

    createRipple(element, event) {
        // Ensure element has relative positioning
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }

        // Limit number of concurrent ripples
        if (!this.rippleQueues.has(element)) {
            this.rippleQueues.set(element, []);
        }

        const queue = this.rippleQueues.get(element);
        if (queue.length >= this.maxRipples) {
            const oldRipple = queue.shift();
            oldRipple.remove();
        }

        // Calculate ripple position
        const rect = element.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const x = event.clientX - elementRect.left;
        const y = event.clientY - elementRect.top;

        // Create ripple element
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = (x - 5) + 'px';  // -5 for half width
        ripple.style.top = (y - 5) + 'px';   // -5 for half height

        // Set ripple color based on theme
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        ripple.style.backgroundColor = isDarkMode
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(0, 0, 0, 0.2)';

        element.appendChild(ripple);
        queue.push(ripple);

        // Remove ripple after animation completes
        ripple.addEventListener('animationend', () => {
            ripple.remove();
            const index = queue.indexOf(ripple);
            if (index > -1) {
                queue.splice(index, 1);
            }
        });
    }
}

/**
 * Singleton instance
 */
const rippleManager = new RippleManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RippleManager, rippleManager };
}
