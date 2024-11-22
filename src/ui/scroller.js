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
            this.element.appendChild(span);
        });

        // Get CRT container bounds
        const crtContainer = document.querySelector('.crt-container');
        const crtRect = crtContainer.getBoundingClientRect();
        
        // Start at the right edge of the CRT container
        this.textPos = crtRect.right - crtRect.left;
        
        // Store CRT bounds for reuse
        this.crtBounds = {
            left: crtRect.left,
            right: crtRect.right,
            width: crtRect.width
        };
    }

    update(timestamp) {
        if (!this.crtBounds) return;  // Wait for initialization
        
        this.textPos -= 2;
        
        // Reset when text is completely off the left edge of CRT
        if (this.textPos < -(this.text.length * 30)) {
            this.textPos = this.crtBounds.width;
        }

        Array.from(this.element.children).forEach((span, index) => {
            const offset = index * 30;
            const xPos = this.textPos + offset;
            const sineWave = Math.sin((timestamp * 0.003) + (index * 0.2)) * 50;
            
            // Position relative to CRT container
            span.style.transform = `translate(${xPos}px, ${sineWave}px)`;
            
            // Hide characters outside CRT bounds
            const charPos = xPos;
            if (charPos < 0 || charPos > this.crtBounds.width) {
                span.style.opacity = '0';
            } else {
                span.style.opacity = '1';
            }
        });
    }
} 