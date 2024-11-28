console.log('🚀 main.js loaded');

import { PlasmaEffect } from './effects/plasma.js';
import { TextScroller } from './ui/scroller.js';
import { AudioManager } from './audio/audioManager.js';

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
            this.setupAudioControls();
            this.animate();
        } catch (error) {
            console.error('Error in demo init:', error);
            this.showErrorMessage(error.message);
        }
    }

    setupAudioControls() {
        const toggleButton = document.getElementById('toggleMusic');
        const volumeSlider = document.getElementById('volumeSlider');

        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                if (this.audioManager.isPlaying) {
                    this.audioManager.pause();
                    toggleButton.textContent = '🔈 Toggle Music';
                } else {
                    this.audioManager.play();
                    toggleButton.textContent = '🔊 Toggle Music';
                }
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.audioManager.setVolume(e.target.value / 100);
            });
        }
    }

    animate(timestamp) {
        if (this.plasma && this.scroller) {
            this.plasma.render(timestamp);
            this.scroller.update(timestamp);
            requestAnimationFrame((ts) => this.animate(ts));
        }
    }

    async setupBackgroundMusic() {
        try {
            // You can put your music file in a public assets folder
            await this.audioManager.loadTrack('/assets/music/background-track.mp3');
            this.audioManager.setVolume(0.7); // Set initial volume to 70%
        } catch (error) {
            console.error('Error loading background music:', error);
        }
    }
}

// Start the demo
window.addEventListener('DOMContentLoaded', () => {
    const demo = new Demo();
}); 