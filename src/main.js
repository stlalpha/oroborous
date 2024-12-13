console.log('🚀 main.js loaded');

console.log('📦 Importing modules...');
import { PlasmaEffect } from './effects/plasma.js';
import { TextScroller } from './ui/scroller.js';
import { AudioManager } from './audio/audioManager.js';
import { CopperBars } from './effects/copperBars.js';
import { VectorBalls } from './effects/vectorBalls.js';
import { LoadScreen } from './ui/loadScreen.js';
console.log('📦 Modules imported successfully');

// Add immediate debug
console.log('🔍 CopperBars class available:', typeof CopperBars);

class Demo {
    constructor() {
        // Effect configurations
        this.effectConfigs = {
            plasma: {
                duration: 20000,  // 20 seconds
                name: 'plasma'
            },
            copper: {
                duration: 20000,  // 20 seconds
                name: 'copper'
            },
            vectorBalls: {
                duration: 20000,  // 20 seconds
                name: 'vectorBalls'
            }
        };
        
        console.log('🎬 Creating load screen...');
        // Create load screen first with async initialization
        this.loadScreen = new LoadScreen(async () => {
            console.log('🚀 Load screen callback triggered');
            await this.initialize();
        });
    }

    async setupBackgroundMusic() {
        try {
            console.log('🎵 Setting up background music...');
            const musicPath = './assets/music/background-track.mp3';
            console.log('🎵 Music path:', musicPath);
            await this.audioManager.loadTrack(musicPath);
            console.log('🎵 Track loaded, setting volume...');
            this.audioManager.setVolume(0.5);
            console.log('🎵 Starting playback...');
            this.audioManager.play();
        } catch (error) {
            console.error('🔴 Error in setupBackgroundMusic:', error);
        }
    }

    init() {
        try {
            // Initialize all effects
            console.log('🎨 Initializing effects...');
            this.plasma = new PlasmaEffect('demoCanvas');
            console.log('✓ Plasma initialized');
            this.scroller = new TextScroller('demoText');
            console.log('✓ Scroller initialized');
            this.copperBars = new CopperBars('copperCanvas');
            console.log('✓ Copper Bars initialized');
            this.vectorBalls = new VectorBalls('vectorBallsCanvas');
            console.log('✓ Vector Balls initialized');
            
            // Setup animation loop
            console.log('🔄 Setting up animation loop');
            const animate = (timestamp) => {
                requestAnimationFrame(animate);  // Schedule next frame first
                if (this.plasma) this.plasma.render(timestamp);
                if (this.scroller) this.scroller.update(timestamp);
                if (this.copperBars) this.copperBars.render(timestamp);
                if (this.vectorBalls) this.vectorBalls.render(timestamp);
            };
            requestAnimationFrame(animate);
            console.log('✨ Animation loop started');
        } catch (error) {
            console.error('Error in init:', error);
            this.showErrorMessage('Effect initialization failed');
        }
    }

    initialize() {
        try {
            console.log('🎨 Starting demo initialization...');
            
            // Create canvas elements first
            this.createCanvases();
            
            // Initialize audio manager
            this.audioManager = new AudioManager();
            console.log('🎵 Audio manager initialized');
            
            // Initialize effects
            this.plasma = new PlasmaEffect('demoCanvas');
            console.log('✨ Plasma initialized');
            
            this.copperBars = new CopperBars();
            console.log('✨ Copper bars initialized');
            
            this.vectorBalls = new VectorBalls();
            console.log('✨ Vector balls initialized');
            
            this.scroller = new TextScroller('demoText');
            console.log('✨ Scroller initialized');

            // Show initial effect
            this.plasma.fadeIn();
            setTimeout(() => this.scroller.show(), 1000);
            
            // Start animation loop
            this.startAnimationLoop();
            
            // Setup background music
            this.setupBackgroundMusic();

            // Add transition triggers
            this.setupTransitions();
            
            console.log('✅ Demo initialization complete');
        } catch (error) {
            console.error('🔴 Error in initialize:', error);
            this.showErrorMessage(error.message);
        }
    }

    createCanvases() {
        const container = document.querySelector('.crt-container');
        
        // Create main demo canvas if it doesn't exist
        if (!document.getElementById('demoCanvas')) {
            const demoCanvas = document.createElement('canvas');
            demoCanvas.id = 'demoCanvas';
            container.appendChild(demoCanvas);
        }
    }

    startAnimationLoop() {
        const animate = (timestamp) => {
            if (this.plasma) this.plasma.render(timestamp);
            if (this.scroller) this.scroller.update(timestamp);
            if (this.copperBars) this.copperBars.render(timestamp);
            if (this.vectorBalls) this.vectorBalls.render(timestamp);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        console.log('🔄 Animation loop started');
    }

    handleResize() {
        // Update scroller boundaries
        if (this.scroller) {
            this.scroller.updateBounds();
        }
        // Update plasma canvas size if needed
        if (this.plasma) {
            this.plasma.resize();
        }
        if (this.copperBars) {
            this.copperBars.resize();
        }
        if (this.vectorBalls) {
            this.vectorBalls.resize();
        }
    }

    showErrorMessage(message) {
        const crtContainer = document.querySelector('.crt-container');
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            color: white;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            font-family: 'Topaz', monospace;
            text-align: center;
            z-index: 4;
            text-shadow: 2px 2px 0 #ff00ff, 4px 4px 0 #00ffff;
        `;
        errorDiv.textContent = `Demo initialization failed: ${message}`;
        crtContainer.appendChild(errorDiv);
    }

    async init() {
        try {
            this.animate();
        } catch (error) {
            console.error('Error in demo init:', error);
            this.showErrorMessage(error.message);
        }
    }

    animate(timestamp) {
        if (this.plasma && this.scroller && this.copperBars && this.vectorBalls) {
            this.plasma.render(timestamp);
            this.scroller.update(timestamp);
            this.copperBars.render(timestamp);
            this.vectorBalls.render(timestamp);
            requestAnimationFrame((ts) => this.animate(ts));
        }
    }

    async transitionEffects() {
        if (!this.plasma || !this.copperBars) return;
        
        try {
            console.log('🔄 Transitioning from plasma to copper bars...');
            // First transition: plasma to copper bars
            this.plasma.fadeOut();
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.copperBars.fadeIn();
            this.scroller.setMessage('copper');
        } catch (error) {
            console.error('Error during transition:', error);
        }
    }

    async transitionToVectorBalls() {
        if (!this.copperBars || !this.vectorBalls) return;
        
        try {
            console.log('🔄 Transitioning from copper bars to vector balls...');
            this.copperBars.fadeOut();
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.vectorBalls.fadeIn();
            this.scroller.setMessage('vectorBalls');
        } catch (error) {
            console.error('Error during vector balls transition:', error);
        }
    }

    showAudioMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Topaz', monospace;
            z-index: 10;
            pointer-events: none;
            opacity: 1;
            transition: opacity 1s;
        `;
        messageDiv.textContent = "Click anywhere to start music";
        document.body.appendChild(messageDiv);

        // Hide message after first interaction
        const hideMessage = () => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 1000);
            ['click', 'keydown', 'touchstart'].forEach(event => {
                document.removeEventListener(event, hideMessage);
            });
        };

        ['click', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, hideMessage);
        });
    }

    setupTransitions() {
        // Setup keyboard triggers
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'n') {
                this.transitionEffects();
            }
            if (e.key.toLowerCase() === 'b') {
                this.transitionToVectorBalls();
            }
        });

        // Auto transition after plasma duration
        setTimeout(() => {
            console.log('🔄 Auto-transitioning to copper bars...');
            this.transitionEffects();
            
            // Then transition to vector balls after copper duration
            setTimeout(() => {
                console.log('🔄 Auto-transitioning to vector balls...');
                this.transitionToVectorBalls();
            }, this.effectConfigs.copper.duration);
            
        }, this.effectConfigs.plasma.duration);
    }
}

// Start the demo
window.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Starting demo...');
    window.demo = new Demo();  // Keep reference for debugging
}); 