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
            circle: (time, ball) => ({
                x: Math.cos(time * 1.4 + ball.phase) * 200,
                y: Math.sin(time * 1.4 + ball.phase) * 200,
                z: Math.sin(time * 2.8 + ball.phase) * 100
            }),
            infinity: (time, ball) => {
                const t = time * 1.4 + ball.phase;
                const scale = 200;
                return {
                    x: scale * Math.sin(t) / (1 + Math.cos(t) * Math.cos(t)),
                    y: scale * Math.sin(t) * Math.cos(t) / (1 + Math.cos(t) * Math.cos(t)),
                    z: Math.cos(time * 2 + ball.phase) * 150
                };
            },
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
            dodecahedron: (time, ball) => {
                const phi = (1 + Math.sqrt(5)) / 2;
                const size = 150;
                
                // Properly defined vertices
                const vertices = [
                    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
                    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
                    [0, -phi, -1/phi], [0, phi, -1/phi],
                    [0, -phi, 1/phi], [0, phi, 1/phi],
                    [-1/phi, 0, -phi], [1/phi, 0, -phi],
                    [-1/phi, 0, phi], [1/phi, 0, phi],
                    [-phi, -1/phi, 0], [-phi, 1/phi, 0],
                    [phi, -1/phi, 0], [phi, 1/phi, 0]
                ].map(v => v.map(coord => coord * size));

                const vertexIndex = Math.floor(ball.phase / (Math.PI * 2) * vertices.length);
                const rot = time * 0.7;
                
                const vertex = vertices[vertexIndex];
                const x = vertex[0];
                const y = vertex[1];
                const z = vertex[2];

                return {
                    x: x * Math.cos(rot) - z * Math.sin(rot),
                    y: y,
                    z: x * Math.sin(rot) + z * Math.cos(rot)
                };
            }
        };

        this.currentPattern = 'circle';
        this.nextPattern = 'circle';
        this.morphProgress = 1;
        this.morphDuration = 2;
        this.patternDuration = 5;
        this.lastPatternChange = -this.patternDuration;
        this.isFirstTransition = true;
        
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
            if (this.isFirstTransition) {
                this.morphDuration = 3;
                this.isFirstTransition = false;
            } else {
                this.morphDuration = 2;
            }
            
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
        if (this.isFirstTransition) {
            return 'infinity';
        }
        
        const sequence = ['circle', 'infinity', 'cube', 'dodecahedron'];
        const currentIndex = sequence.indexOf(this.currentPattern);
        const nextIndex = (currentIndex + 1) % sequence.length;
        return sequence[nextIndex];
    }

    fadeIn(duration = 2000) {
        this.canvas.style.opacity = '1';
    }

    fadeOut(duration = 2000) {
        this.canvas.style.opacity = '0';
    }
} 