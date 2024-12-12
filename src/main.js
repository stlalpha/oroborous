console.log('🚀 main.js loaded');

console.log('📦 Importing modules...');
import { PlasmaEffect } from './effects/plasma.js';
import { TextScroller } from './ui/scroller.js';
import { AudioManager } from './audio/audioManager.js';
import { CopperBars } from './effects/copperBars.js';
import { VectorBalls } from './effects/vectorBalls.js';
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

        // Track current effect
        this.currentEffect = 'plasma';
        
        try {
            // Initialize audio manager immediately
            this.audioManager = new AudioManager();
            this.setupBackgroundMusic();

            // Wait for font to load before initializing
            document.fonts.ready.then(() => {
                this.plasma = new PlasmaEffect('demoCanvas');
                this.scroller = new TextScroller('demoText');
                this.copperBars = new CopperBars('copperCanvas');
                this.vectorBalls = new VectorBalls('vectorBallsCanvas');
                
                // Setup transition triggers
                document.addEventListener('keydown', (e) => {
                    if (e.key.toLowerCase() === 'n') {
                        this.transitionEffects();
                    }
                    if (e.key.toLowerCase() === 'b') {
                        this.transitionToVectorBalls();
                    }
                });

                // Auto transition after 15 seconds
                const scrollDuration = this.scroller.calculateScrollDuration();
                const initialDuration = Math.max(this.effectConfigs.plasma.duration, scrollDuration);
                console.log('⏱️ Initial effect timings:', {
                    scrollDuration,
                    configuredDuration: this.effectConfigs.plasma.duration,
                    actualDuration: initialDuration
                });
                setTimeout(() => this.transitionEffects(), initialDuration);
                
                this.init();
                window.addEventListener('resize', this.handleResize.bind(this));
            }).catch(error => {
                console.error('Font loading error:', error);
                this.showErrorMessage('Font loading failed');
            });
        } catch (error) {
            console.error('Error initializing demo:', error);
            this.showErrorMessage(error.message);
        }
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
            // Calculate minimum duration needed for text scroll
            const scrollDuration = this.scroller.calculateScrollDuration();
            const plasmaDuration = Math.max(this.effectConfigs.plasma.duration, scrollDuration);
            
            console.log('⏱️ Plasma to Copper transition timings:', {
                scrollDuration,
                configuredDuration: this.effectConfigs.plasma.duration,
                actualDuration: plasmaDuration,
                fadeOutStart: plasmaDuration - 2000
            });
            
            // First transition: plasma to copper bars
            await new Promise(resolve => {
                this.scroller.setMessage('copper', () => {
                    console.log('✨ Copper text scroll complete');
                    resolve();
                });
                setTimeout(() => {
                    console.log('🔄 Starting plasma fadeOut');
                    this.plasma.fadeOut();
                }, plasmaDuration - 2000);
            });

            console.log('🔄 Starting copper fadeIn');
            this.copperBars.fadeIn();
            
            // Wait for copper bars duration
            const copperDuration = Math.max(this.effectConfigs.copper.duration, scrollDuration);
            console.log('⏱️ Copper duration:', {
                scrollDuration,
                configuredDuration: this.effectConfigs.copper.duration,
                actualDuration: copperDuration
            });
            
            await new Promise(resolve => {
                setTimeout(() => {
                    console.log('🔄 Starting transition to vector balls');
                    this.transitionToVectorBalls();
                    resolve();
                }, copperDuration);
            });
        } catch (error) {
            console.error('Error during transition:', error);
        }
    }

    async transitionToVectorBalls() {
        if (!this.copperBars || !this.vectorBalls) return;
        
        const scrollDuration = this.scroller.calculateScrollDuration();
        const vectorDuration = Math.max(this.effectConfigs.vectorBalls.duration, scrollDuration);
        
        console.log('⏱️ Vector Balls transition timings:', {
            scrollDuration,
            configuredDuration: this.effectConfigs.vectorBalls.duration,
            actualDuration: vectorDuration
        });
        
        console.log('🔄 Starting copper bars fadeOut');
        this.copperBars.fadeOut();
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('🔄 Starting vector balls fadeIn');
        this.vectorBalls.fadeIn();
        
        await new Promise(resolve => {
            this.scroller.setMessage('vectorBalls', () => {
                console.log('✨ Vector Balls text scroll complete');
                resolve();
            });
        });
    }
}

// Start the demo
window.addEventListener('DOMContentLoaded', () => {
    const demo = new Demo();
}); 