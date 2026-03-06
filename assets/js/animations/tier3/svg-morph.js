/**
 * SVG Icon Morphing & Animations
 * Smooth path morphing, stroke animations, and icon float effects
 */

class SVGMorphController {
    constructor() {
        this.activeMorphs = new Map();
        this.strokeAnimations = new Map();
    }

    /**
     * Morph an SVG path between two states
     * @param {SVGElement} svg - Target SVG element
     * @param {string} fromPath - Starting path
     * @param {string} toPath - Ending path
     * @param {number} duration - Animation duration in ms
     */
    morphPath(svg, fromPath, toPath, duration = 500) {
        const path = svg.querySelector('path') || svg.querySelector('circle') || svg.querySelector('rect');
        if (!path) return;

        const from = this.parseSVGPath(fromPath);
        const to = this.parseSVGPath(toPath);

        const startTime = Date.now();
        let frameId = null;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out elastic for bouncy morph
            const eased = progress < 1
                ? Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * ((2 * Math.PI) / 4.5)) + 1
                : 1;

            const morphed = this.interpolatePath(from, to, eased);
            path.setAttribute('d', morphed);

            if (progress < 1) {
                frameId = requestAnimationFrame(animate);
            }
        };

        animate();
        return frameId;
    }

    /**
     * Parse SVG path string to coordinates array
     */
    parseSVGPath(pathStr) {
        const commands = pathStr.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
        return commands.map(cmd => ({
            command: cmd[0],
            values: cmd.slice(1).match(/[-+]?[\d.]+/g).map(Number)
        }));
    }

    /**
     * Interpolate between two path arrays
     */
    interpolatePath(from, to, progress) {
        let result = '';
        const lengthMax = Math.max(from.length, to.length);

        for (let i = 0; i < lengthMax; i++) {
            const fromCmd = from[i] || from[from.length - 1];
            const toCmd = to[i] || to[to.length - 1];

            result += fromCmd.command;

            const maxValues = Math.max(fromCmd.values.length, toCmd.values.length);
            for (let j = 0; j < maxValues; j++) {
                const fromVal = fromCmd.values[j] || 0;
                const toVal = toCmd.values[j] || 0;
                const value = fromVal + (toVal - fromVal) * progress;
                result += (j === 0 ? '' : ',') + value.toFixed(2);
            }
            result += ' ';
        }

        return result;
    }

    /**
     * Animate stroke draw effect
     */
    animateStrokeDraw(svg, duration = 600) {
        const paths = svg.querySelectorAll('path, circle, rect, line, polygon, polyline');

        paths.forEach(el => {
            const length = el.getTotalLength?.() || el.getBBox?.().width || 100;

            el.style.strokeDasharray = length;
            el.style.strokeDashoffset = length;
            el.style.transition = `stroke-dashoffset ${duration}ms ease-out`;

            // Trigger animation
            setTimeout(() => {
                el.style.strokeDashoffset = '0';
            }, 10);

            // Clean up after
            setTimeout(() => {
                el.style.strokeDasharray = 'none';
                el.style.strokeDashoffset = 'none';
            }, duration + 10);
        });
    }

    /**
     * Setup hover morph on SVG icons
     */
    setupHoverMorph(svg, onHover, onLeave) {
        svg.addEventListener('mouseenter', () => {
            svg.style.cursor = 'pointer';
            onHover?.();
        });

        svg.addEventListener('mouseleave', () => {
            onLeave?.();
        });
    }
}

/**
 * Icon Float Manager
 * Continuous floating animations for icons
 */
class IconFloatManager {
    constructor() {
        this.floatingIcons = new Map();
    }

    /**
     * Add float animation to an element
     */
    addFloat(element, options = {}) {
        if (this.floatingIcons.has(element)) return;

        const amplitude = options.amplitude || 20;
        const duration = options.duration || 3000;
        const offset = options.offset || Math.random() * duration;
        const delay = options.delay || 0;

        element.style.animation = `
            icon-float ${duration}ms ease-in-out infinite
        `;
        element.style.animationDelay = `${delay}ms`;
        element.style.transformOrigin = 'center center';

        // Create keyframes if not exists
        if (!document.getElementById('icon-float-keyframes')) {
            const style = document.createElement('style');
            style.id = 'icon-float-keyframes';
            style.textContent = `
                @keyframes icon-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(${amplitude}px); }
                }
            `;
            document.head.appendChild(style);
        }

        this.floatingIcons.set(element, { amplitude, duration, delay });
    }

    /**
     * Remove float animation
     */
    removeFloat(element) {
        if (this.floatingIcons.has(element)) {
            element.style.animation = 'none';
            this.floatingIcons.delete(element);
        }
    }

    /**
     * Float all SVG icons in a container
     */
    floatContainer(container, baseDelay = 0) {
        const icons = container.querySelectorAll('svg');
        icons.forEach((icon, index) => {
            this.addFloat(icon, {
                amplitude: 15 + Math.random() * 10,
                duration: 3000 + Math.random() * 1000,
                delay: baseDelay + (index * 100)
            });
        });
    }
}

/**
 * Singleton instances
 */
const svgMorphController = new SVGMorphController();
const iconFloatManager = new IconFloatManager();

// Auto-initialize icon floats on page load
document.addEventListener('DOMContentLoaded', () => {
    // Float skill category icons
    document.querySelectorAll('.skill-card svg').forEach((svg, index) => {
        iconFloatManager.addFloat(svg, {
            amplitude: 12,
            duration: 2500,
            delay: index * 100
        });
    });

    // Float project icons
    document.querySelectorAll('.project-icon svg').forEach((svg, index) => {
        iconFloatManager.addFloat(svg, {
            amplitude: 18,
            duration: 3000,
            delay: index * 80
        });
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SVGMorphController,
        IconFloatManager,
        svgMorphController,
        iconFloatManager
    };
}
