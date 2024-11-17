import { PlasmaEffect } from './effects/plasma.js';
import { TextScroller } from './ui/scroller.js';
import { DemoMusicPlayer } from './audio/musicPlayer.js';

class Demo {
    constructor() {
        try {
            this.plasma = new PlasmaEffect('demoCanvas');
            this.scroller = new TextScroller('demoText');
            this.musicPlayer = new DemoMusicPlayer();
        } catch (error) {
            console.error('Error initializing demo:', error);
            this.showErrorMessage(error);
        }
    }

    showErrorMessage(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'white';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.fontSize = '20px';
        errorDiv.textContent = `Demo initialization failed: ${error.message}`;
        document.body.appendChild(errorDiv);
    }

    async init() {
        try {
            if (this.musicPlayer) {
                await this.musicPlayer.init();
            }
            this.animate();
        } catch (error) {
            console.error('Error in demo init:', error);
            this.showErrorMessage(error);
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
    demo.init().catch(error => {
        console.error('Failed to initialize demo:', error);
    });
}); 