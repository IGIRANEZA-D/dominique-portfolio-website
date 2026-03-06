/**
 * Advanced Particle System
 * Data-themed particles with physics, connection lines, and pool-based optimization
 */

class Particle {
    constructor(x, y, type = 'dot') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1.0;
        this.lifeDecay = Math.random() * 0.005 + 0.002;
        this.type = type;

        if (type === 'dot') {
            this.radius = Math.random() * 2 + 0.5;
            this.mass = 1;
            this.color = `rgba(0, 188, 212, ${0.3 + Math.random() * 0.4})`;
        } else if (type === 'node') {
            this.radius = Math.random() * 4 + 2;
            this.mass = 2;
            this.color = `rgba(106, 27, 154, ${0.2 + Math.random() * 0.5})`;
        }
    }

    update(gravity, friction, bounds) {
        // Apply gravity
        this.vy += gravity;

        // Apply friction
        this.vx *= friction;
        this.vy *= friction;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Boundary conditions - bounce
        if (this.x - this.radius < bounds.left) {
            this.x = bounds.left + this.radius;
            this.vx *= -0.85;
        }
        if (this.x + this.radius > bounds.right) {
            this.x = bounds.right - this.radius;
            this.vx *= -0.85;
        }
        if (this.y - this.radius < bounds.top) {
            this.y = bounds.top + this.radius;
            this.vy *= -0.85;
        }
        if (this.y + this.radius > bounds.bottom) {
            this.y = bounds.bottom - this.radius;
            this.vy *= -0.8;
        }

        // Life decay
        this.life -= this.lifeDecay;
    }

    isAlive() {
        return this.life > 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life * 0.8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Object pool for particle reuse
 */
class ParticlePool {
    constructor(size) {
        this.particles = [];
        this.available = [];

        for (let i = 0; i < size; i++) {
            this.particles.push(new Particle(0, 0));
            this.available.push(this.particles[i]);
        }
    }

    get(x, y, type) {
        let particle;
        if (this.available.length > 0) {
            particle = this.available.pop();
            particle.x = x;
            particle.y = y;
            particle.type = type;
            particle.life = 1.0;
            particle.vx = (Math.random() - 0.5) * 2;
            particle.vy = (Math.random() - 0.5) * 2;
        } else {
            particle = new Particle(x, y, type);
            this.particles.push(particle);
        }
        return particle;
    }

    release(particle) {
        this.available.push(particle);
    }
}

/**
 * Advanced Particle System
 */
class ParticleSystem {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // Physics parameters
        this.gravity = options.gravity || 0.1;
        this.friction = options.friction || 0.98;
        this.bounds = {
            left: 0,
            right: this.width,
            top: 0,
            bottom: this.height
        };

        // Pool of particles
        const poolSize = options.poolSize || 200;
        this.pool = new ParticlePool(poolSize);
        this.activeParticles = [];

        // Connection lines
        this.drawConnections = options.drawConnections !== false;
        this.connectionDistance = options.connectionDistance || 100;

        // Stats
        this.frameCount = 0;
        this.lastFrameTime = Date.now();
    }

    /**
     * Emit particles from a point
     */
    emit(x, y, count = 5, type = 'dot') {
        for (let i = 0; i < count; i++) {
            const particle = this.pool.get(x, y, type);
            this.activeParticles.push(particle);
        }
    }

    /**
     * Update and render
     */
    update() {
        // Clear canvas with fade
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Update particles
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const particle = this.activeParticles[i];
            particle.update(this.gravity, this.friction, this.bounds);

            if (!particle.isAlive()) {
                this.pool.release(particle);
                this.activeParticles.splice(i, 1);
            }
        }

        // Draw connections between nearby particles
        if (this.drawConnections && this.activeParticles.length > 1) {
            this.drawParticleConnections();
        }

        // Draw particles
        this.ctx.globalAlpha = 1.0;
        this.activeParticles.forEach(p => p.draw(this.ctx));

        this.frameCount++;
    }

    /**
     * Draw connection lines between nearby particles
     */
    drawParticleConnections() {
        const minDist = this.connectionDistance;
        const minDistSq = minDist * minDist;

        this.ctx.strokeStyle = 'rgba(0, 188, 212, 0.1)';
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.3;

        for (let i = 0; i < this.activeParticles.length; i++) {
            const p1 = this.activeParticles[i];
            for (let j = i + 1; j < this.activeParticles.length; j++) {
                const p2 = this.activeParticles[j];

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < minDistSq) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }

        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Get particle count
     */
    getParticleCount() {
        return this.activeParticles.length;
    }

    /**
     * Clear all particles
     */
    clear() {
        this.activeParticles.forEach(p => this.pool.release(p));
        this.activeParticles = [];
    }

    /**
     * Start animation loop
     */
    start() {
        const animate = () => {
            this.update();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}

/**
 * Singleton instance
 */
let particleSystem = null;

/**
 * Initialize particle system with auto-emission
 */
function initParticleSystem(canvas) {
    if (!canvas || !canvas.getContext) return null;

    particleSystem = new ParticleSystem(canvas, {
        gravity: 0.08,
        friction: 0.98,
        poolSize: 200,
        drawConnections: true,
        connectionDistance: 120
    });

    particleSystem.start();

    // Auto-emit particles at intervals
    const emissionRate = DeviceDetector.getDeviceClass() === 'phone' ? 100 : 50;
    setInterval(() => {
        const x = Math.random() * particleSystem.width;
        const y = Math.random() * particleSystem.height * 0.2; // Top 20% only

        const type = Math.random() > 0.7 ? 'node' : 'dot';
        const count = Math.random() > 0.8 ? 3 : 1;

        particleSystem.emit(x, y, count, type);
    }, emissionRate);

    return particleSystem;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Particle,
        ParticlePool,
        ParticleSystem,
        initParticleSystem
    };
}
