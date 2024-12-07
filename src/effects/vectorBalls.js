export class VectorBalls {
    constructor(canvasId) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'vectorBallsCanvas';
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 3;
            mix-blend-mode: screen;
            opacity: 0;
        `;
        
        document.querySelector('.crt-container').appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.transition = 'opacity 2s';
        
        // Ball properties
        this.balls = [];
        const numBalls = 24;
        
        for (let i = 0; i < numBalls; i++) {
            this.balls.push({
                x: 0,
                y: 0,
                z: 0,
                radius: 40,
                phase: (i * Math.PI * 2) / numBalls,
                speed: 1.12 + Math.random() * 0.42,
                targetX: 0,
                targetY: 0,
                targetZ: 0
            });
        }
        
        this.patterns = {
            figure8: (time, ball) => ({
                x: Math.sin(time * 1.4 + ball.phase) * 200,
                y: Math.sin(time * 2.8 + ball.phase) * 100,
                z: Math.cos(time * 1.4 + ball.phase) * 200
            }),
            circle: (time, ball) => ({
                x: Math.cos(time * 1.4 + ball.phase) * 200,
                y: Math.sin(time * 1.4 + ball.phase) * 200,
                z: Math.sin(time * 2.8 + ball.phase) * 100
            }),
            spiral: (time, ball) => ({
                x: Math.cos(time * 1.4 + ball.phase) * (100 + ball.phase * 10),
                y: Math.sin(time * 1.4 + ball.phase) * (100 + ball.phase * 10),
                z: Math.cos(time * 2.8 + ball.phase) * 150
            }),
            dna: (time, ball) => ({
                x: Math.cos(time + ball.phase) * 150,
                y: ball.phase * 40 - 400 + (time * 100 % 800),
                z: Math.sin(time + ball.phase) * 150
            }),
            wave: (time, ball) => ({
                x: (ball.phase * 50) - 600,
                y: Math.sin(time * 2 + ball.phase * 2) * 100,
                z: Math.cos(time * 3 + ball.phase) * 150
            }),
            cube: (time, ball) => {
                const size = 150;
                const cornerIndex = Math.floor(ball.phase / (Math.PI * 2) * 8);
                const rot = time * 0.7;
                const x = ((cornerIndex & 1) ? 1 : -1) * size;
                const y = ((cornerIndex & 2) ? 1 : -1) * size;
                const z = ((cornerIndex & 4) ? 1 : -1) * size;
                return {
                    x: x * Math.cos(rot) - z * Math.sin(rot),
                    y: y,
                    z: x * Math.sin(rot) + z * Math.cos(rot)
                };
            },
            infinity: (time, ball) => {
                const t = time * 1.4 + ball.phase;
                const scale = 200;
                return {
                    x: scale * Math.sin(t) / (1 + Math.cos(t) * Math.cos(t)),
                    y: scale * Math.sin(t) * Math.cos(t) / (1 + Math.cos(t) * Math.cos(t)),
                    z: Math.cos(time * 2 + ball.phase) * 150
                };
            }
        };

        this.currentPattern = 'figure8';
        this.nextPattern = 'circle';
        this.morphProgress = 0;
        this.morphDuration = 2;
        this.patternDuration = 5;
        this.lastPatternChange = 0;
        
        this.sphereGradient = this.createSphereGradient(80);
        this.resize();
    }

    createSphereGradient(size) {
        const gradCanvas = document.createElement('canvas');
        gradCanvas.width = size * 2;
        gradCanvas.height = size * 2;
        const ctx = gradCanvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(
            size, size, 0,
            size, size, size
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(200, 200, 255, 0.95)');
        gradient.addColorStop(0.5, 'rgba(100, 100, 220, 0.85)');
        gradient.addColorStop(0.7, 'rgba(50, 50, 180, 0.75)');
        gradient.addColorStop(1, 'rgba(20, 20, 90, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size * 2, size * 2);
        
        return gradCanvas;
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    render(timestamp) {
        if (this.canvas.style.opacity === '0') return;

        const time = timestamp * 0.001;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (time - this.lastPatternChange > this.patternDuration) {
            this.morphProgress = 0;
            this.currentPattern = this.nextPattern;
            this.nextPattern = this.getNextPattern();
            this.lastPatternChange = time;
        }

        this.morphProgress = Math.min(1, (time - this.lastPatternChange) / this.morphDuration);
        
        this.balls.forEach(ball => {
            const current = this.patterns[this.currentPattern](time, ball);
            const next = this.patterns[this.nextPattern](time, ball);
            
            ball.x = this.lerp(current.x, next.x, this.morphProgress);
            ball.y = this.lerp(current.y, next.y, this.morphProgress);
            ball.z = this.lerp(current.z, next.z, this.morphProgress);
        });
        
        this.balls.sort((a, b) => b.z - a.z);
        
        this.balls.forEach(ball => {
            const perspective = 1200 / (1200 + ball.z);
            const x = this.centerX + ball.x * perspective;
            const y = this.centerY + ball.y * perspective;
            const radius = ball.radius * perspective;
            
            this.ctx.globalAlpha = 0.85 + (ball.z / 400);
            this.ctx.drawImage(
                this.sphereGradient,
                x - radius,
                y - radius,
                radius * 2,
                radius * 2
            );
        });
    }

    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    getNextPattern() {
        const patterns = Object.keys(this.patterns);
        const currentIndex = patterns.indexOf(this.currentPattern);
        return patterns[(currentIndex + 1) % patterns.length];
    }

    fadeIn(duration = 2000) {
        this.canvas.style.opacity = '1';
    }

    fadeOut(duration = 2000) {
        this.canvas.style.opacity = '0';
    }
} 