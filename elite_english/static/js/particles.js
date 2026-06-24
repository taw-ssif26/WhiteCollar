// elite_english/static/particles.js

class ParticleSystem {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.count = options.count || 50;
        this.color = options.color || '#e9c176';
        this.size = options.size || 2;
        this.speed = options.speed || 0.5;
        this.opacity = options.opacity || 0.5;
        this.connected = options.connected !== undefined ? options.connected : true;
        this.connectionDistance = options.connectionDistance || 150;
        
        this.particles = [];
        this.animationId = null;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0';
        
        // Make container relative if not already
        if (getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative';
        }
        
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        this.createParticles();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = rect.width;
        this.height = rect.height;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * this.speed * 2,
                vy: (Math.random() - 0.5) * this.speed * 2,
                size: Math.random() * this.size + 1,
                opacity: Math.random() * this.opacity + 0.2,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }
    
    drawParticle(p) {
        const ctx = this.ctx;
        // Pulsing effect
        const pulseFactor = 0.8 + 0.2 * Math.sin(p.pulse);
        const currentSize = p.size * pulseFactor;
        const currentOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse * 0.7));
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = currentOpacity;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    drawConnections() {
        if (!this.connected) return;
        
        const ctx = this.ctx;
        const maxDist = this.connectionDistance;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = this.color;
                    ctx.globalAlpha = opacity;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }
    }
    
    updateParticles() {
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.02;
            
            // Bounce off edges
            if (p.x < 0 || p.x > this.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.height) p.vy *= -1;
            
            // Add slight random movement
            p.vx += (Math.random() - 0.5) * 0.02;
            p.vy += (Math.random() - 0.5) * 0.02;
            
            // Limit speed
            const maxSpeed = this.speed * 2;
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > maxSpeed) {
                p.vx = (p.vx / speed) * maxSpeed;
                p.vy = (p.vy / speed) * maxSpeed;
            }
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.updateParticles();
        
        // Draw connections first (behind particles)
        this.drawConnections();
        
        // Draw particles
        for (const p of this.particles) {
            this.drawParticle(p);
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Helper to initialize particles on elements with class 'particles-container'
function initParticles() {
    const containers = document.querySelectorAll('.particles-container');
    
    containers.forEach((container, index) => {
        const color = container.dataset.color || '#e9c176';
        const count = parseInt(container.dataset.count) || 40;
        const speed = parseFloat(container.dataset.speed) || 0.5;
        const size = parseFloat(container.dataset.size) || 2;
        const connected = container.dataset.connected !== 'false';
        const opacity = parseFloat(container.dataset.opacity) || 0.5;
        
        // Small delay to ensure container is rendered
        setTimeout(() => {
            const particles = new ParticleSystem({
                container: container,
                color: color,
                count: count,
                speed: speed,
                size: size,
                connected: connected,
                opacity: opacity
            });
            particles.start();
            
            // Store reference for cleanup if needed
            container._particles = particles;
        }, 100 + index * 50);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
} else {
    initParticles();
}
