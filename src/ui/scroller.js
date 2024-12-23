export class TextScroller {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        // Initially hide the scroller
        this.element.style.opacity = '0';
        this.messages = {
            plasma: "-=PiRATE MiND STATiON=-................--==<<[ WELCOME TO THE DEMO! ]>>==--..........",
            copper: "--==<<[ COPPER BARS EFFECT - JUST LIKE THE GOOD OLD DAYS! ]>>==--................",
            vectorBalls: "--==<<[ VECTOR BALLS - BRINGING BACK MEMORIES OF CLASSIC DEMOS ]>>==--..........."
        };
        this.currentMessage = this.messages.plasma;
        
        document.fonts.ready.then(() => {
            this.init();
        });
    }

    init() {
        this.updateText(this.currentMessage);
        this.updateBounds();
    }

    updateText(newText) {
        // Clear and create spans
        this.element.textContent = '';
        this.currentMessage = newText;
        newText.split('').forEach((char) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.transition = 'opacity 0.2s';
            this.element.appendChild(span);
        });
    }

    setMessage(effectName) {
        if (this.messages[effectName]) {
            this.updateText(this.messages[effectName]);
            // Reset position when changing message
            this.textPos = this.crtBounds?.right + 800;
        }
    }

    updateBounds() {
        // Get CRT container bounds
        const crtContainer = document.querySelector('.crt-container');
        const crtRect = crtContainer.getBoundingClientRect();
        
        // Calculate the actual visible area within the CRT container
        const padding = 20;
        const fadeZone = 30;
        
        this.crtBounds = {
            left: padding,
            right: crtRect.width - padding,
            width: crtRect.width - (padding * 2),
            fadeZone: fadeZone
        };

        // Start position should be outside the right edge of the CRT
        if (!this.textPos) {
            this.textPos = crtRect.width + 800;
        }
    }

    update(timestamp) {
        if (!this.crtBounds) return;
        
        this.textPos -= 2;
        
        // Calculate the total width of the text
        const textWidth = this.currentMessage.length * 30;
        
        // Reset when the entire text has moved past the left edge
        if (this.textPos + textWidth < -800) {
            this.textPos = this.crtBounds.right + 800;
        }

        Array.from(this.element.children).forEach((span, index) => {
            const offset = index * 30;
            const xPos = this.textPos + offset;
            const sineWave = Math.sin((timestamp * 0.003) + (index * 0.2)) * 50;
            
            // Always update position for smooth movement
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
            
            // Apply opacity with smooth transition
            span.style.opacity = Math.max(0, Math.min(1, opacity));
        });
    }

    show() {
        this.element.style.opacity = '1';
    }

    hide() {
        this.element.style.opacity = '0';
    }
} 