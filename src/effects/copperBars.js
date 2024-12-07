export class CopperBars {
    constructor(canvasId) {
        console.log('🟧 CopperBars constructor start');
        try {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'copperCanvas';
            console.log('🟧 Canvas created');
            
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                mix-blend-mode: screen;
                opacity: 0;
            `;
            
            const container = document.querySelector('.crt-container');
            console.log('🟧 Container found:', !!container);
            container.appendChild(this.canvas);
            console.log('🟧 Canvas appended to container');
            
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            
            // Bar properties
            this.bars = [];
            for (let i = 0; i < 5; i++) {
                this.bars.push({
                    y: i * 80,
                    speed: 2.5 + (Math.random() * 3),
                    width: 60,
                    hue: i * 72,
                    direction: Math.random() > 0.5 ? 1 : -1,
                    timeOffset: Math.random() * Math.PI * 2,
                    amplitude: 30 + Math.random() * 40
                });
            }

            this.canvas.style.opacity = '0';
            this.canvas.style.transition = 'opacity 2s';
            console.log('🟧 CopperBars canvas created:', {
                width: this.canvas.width,
                height: this.canvas.height,
                zIndex: this.canvas.style.zIndex,
                opacity: this.canvas.style.opacity
            });
        } catch (error) {
            console.error('❌ Error in CopperBars constructor:', error);
            throw error;
        }
    }

    resize() {
        const oldDimensions = {
            width: this.canvas.width,
            height: this.canvas.height
        };
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        console.log('🟧 CopperBars resized:', {
            from: oldDimensions,
            to: {
                width: this.canvas.width,
                height: this.canvas.height
            }
        });
    }

    render(timestamp) {
        if (this.canvas.style.opacity === '0') return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.bars.forEach(bar => {
            const time = timestamp * 0.001;
            const amplitude = bar.amplitude;
            const frequency = bar.speed * 0.5;
            
            bar.y += Math.sin(time * frequency + bar.timeOffset) * bar.direction * 2;
            
            if (bar.y < 0) bar.y = this.canvas.height;
            if (bar.y > this.canvas.height) bar.y = 0;
            
            const gradient = this.ctx.createLinearGradient(0, bar.y, 0, bar.y + bar.width);
            gradient.addColorStop(0, `hsla(${bar.hue}, 100%, 50%, 0.2)`);
            gradient.addColorStop(0.5, `hsla(${bar.hue}, 100%, 50%, 1.0)`);
            gradient.addColorStop(1, `hsla(${bar.hue}, 100%, 50%, 0.2)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, bar.y, this.canvas.width, bar.width);
            
            bar.hue = (bar.hue + 1) % 360;
        });
    }

    fadeIn(duration = 2000) {
        console.log('🟧 CopperBars fadeIn called');
        this.canvas.style.opacity = '1';
        console.log('🟧 New opacity:', this.canvas.style.opacity);
    }

    fadeOut(duration = 2000) {
        this.canvas.style.opacity = '0';
    }
} 