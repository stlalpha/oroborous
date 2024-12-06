console.log('🚀 main.js loaded');

console.log('📦 Importing modules...');
import { PlasmaEffect } from './effects/plasma.js';
import { TextScroller } from './ui/scroller.js';
import { AudioManager } from './audio/audioManager.js';
console.log('📦 Modules imported successfully');

class Demo {
    constructor() {
        try {
            // Initialize audio manager immediately
            this.audioManager = new AudioManager();
            
            // Load and set up background music
            this.setupBackgroundMusic();

            // Wait for font to load before initializing
            document.fonts.ready.then(() => {
                this.plasma = new PlasmaEffect('demoCanvas');
                this.scroller = new TextScroller('demoText');
                this.init();
                
                // Add resize handler
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
        if (this.plasma && this.scroller) {
            this.plasma.render(timestamp);
            this.scroller.update(timestamp);
            requestAnimationFrame((ts) => this.animate(ts));
        }
    }
}

// Start the demo
window.addEventListener('DOMContentLoaded', () => {
    const demo = new Demo();
}); 