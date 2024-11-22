export class TextScroller {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.text = this.element.textContent;
        
        // Wait for font to load before initializing
        document.fonts.ready.then(() => {
            this.init();
        });
    }

    init() {
        // Clear and create spans
        this.element.textContent = '';
        this.text.split('').forEach((char) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.transition = 'opacity 0.2s';  // Add smooth opacity transition
            this.element.appendChild(span);
        });

        // Get CRT container bounds
        const crtContainer = document.querySelector('.crt-container');
        const crtRect = crtContainer.getBoundingClientRect();
        
        // Calculate the actual visible area within the CRT container
        const padding = 20;
        const fadeZone = 30; // Width of the fade in/out zone
        this.crtBounds = {
            left: padding,
            right: crtRect.width - padding,
            width: crtRect.width - (padding * 2),
            fadeZone: fadeZone
        };

        // Position the text container relative to CRT container
        this.element.style.left = `${crtRect.left}px`;
        
        // Start at the right edge of the visible area
        this.textPos = this.crtBounds.right;
    }

    update(timestamp) {
        if (!this.crtBounds) return;
        
        this.textPos -= 2;
        
        // Calculate the total width of the text
        const textWidth = this.text.length * 30;
        
        // Reset when the entire text has moved past the left boundary
        if (this.textPos < this.crtBounds.left - textWidth) {
            this.textPos = this.crtBounds.right;
        }

        Array.from(this.element.children).forEach((span, index) => {
            const offset = index * 30;
            const xPos = this.textPos + offset;
            const sineWave = Math.sin((timestamp * 0.003) + (index * 0.2)) * 50;
            
            // Position relative to CRT container
            span.style.transform = `translate(${xPos}px, ${sineWave}px)`;
            
            // Calculate opacity based on position
            let opacity = 1;
            
            // Fade in from right
            if (xPos > this.crtBounds.right - this.crtBounds.fadeZone) {
                opacity = 1 - ((xPos - (this.crtBounds.right - this.crtBounds.fadeZone)) / this.crtBounds.fadeZone);
            }
            // Fade out to left
            else if (xPos < this.crtBounds.left + this.crtBounds.fadeZone) {
                opacity = (xPos - this.crtBounds.left) / this.crtBounds.fadeZone;
            }
            
            // Ensure character is completely hidden outside bounds
            if (xPos < this.crtBounds.left || xPos > this.crtBounds.right) {
                opacity = 0;
            }
            
            // Apply opacity
            span.style.opacity = Math.max(0, Math.min(1, opacity));
        });
    }
} 