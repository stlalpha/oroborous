console.log('🚀 main.js loaded');

import { PlasmaEffect } from './effects/plasma.js';
import { TextScroller } from './ui/scroller.js';

class Demo {
    constructor() {
        try {
            // Wait for font to load before initializing
            document.fonts.ready.then(() => {
                this.plasma = new PlasmaEffect('demoCanvas');
                this.scroller = new TextScroller('demoText');
                this.init();
            }).catch(error => {
                console.error('Font loading error:', error);
                this.showErrorMessage('Font loading failed');
            });
        } catch (error) {
            console.error('Error initializing demo:', error);
            this.showErrorMessage(error.message);
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