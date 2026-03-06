/**
 * Simplified Interactions Module
 * Ripple effects on buttons and minimal sparkles on key actions
 */

class RippleEffect {
    constructor() {
        this.init();
    }

    init() {
        this.injectStyles();
        document.addEventListener('click', (e) => this.handleClick(e), true);
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                pointer-events: none;
                animation: ripple-spread 200ms ease-out;
            }

            @keyframes ripple-spread {
                0% {
                    width: 8px;
                    height: 8px;
                    opacity: 0.6;
                }
                100% {
                    width: 250px;
                    height: 250px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    handleClick(event) {
        const target = event.target.closest('[data-ripple]');
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = (x - 4) + 'px';
        ripple.style.top = (y - 4) + 'px';

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ripple.style.backgroundColor = isDark
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(0, 0, 0, 0.2)';

        target.style.position = 'relative';
        target.style.overflow = 'hidden';
        target.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    }
}

class MinimalSparkles {
    constructor() {
        this.enabled = true;
    }

    /**
     * Burst sparkles from element
     * Used only for chat send, form submit
     */
    burst(element, count = 8) {
        if (!this.enabled) return;

        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const vx = Math.cos(angle) * 150;
            const vy = Math.sin(angle) * 150;

            const sparkle = document.createElement('div');
            sparkle.style.position = 'fixed';
            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';
            sparkle.style.width = '3px';
            sparkle.style.height = '3px';
            sparkle.style.backgroundColor = 'var(--color-accent)';
            sparkle.style.borderRadius = '50%';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '9999';

            document.body.appendChild(sparkle);

            let lifetime = 500;
            let startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / lifetime, 1);

                const currentX = x + vx * progress;
                const currentY = y + vy * progress;

                sparkle.style.left = currentX + 'px';
                sparkle.style.top = currentY + 'px';
                sparkle.style.opacity = 1 - progress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    sparkle.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }
}

const ripple = new RippleEffect();
const sparkles = new MinimalSparkles();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RippleEffect, MinimalSparkles, ripple, sparkles };
}
