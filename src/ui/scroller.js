export class TextScroller {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.messages = {
            plasma: "-=PiRATE MiND STATiON=-................--==<<[ WELCOME TO THE DEMO! ]>>==--..........",
            copper: "--==<<[ COPPER BARS EFFECT - JUST LIKE THE GOOD OLD DAYS! ]>>==--................",
            vectorBalls: "--==<<[ VECTOR BALLS - BRINGING BACK MEMORIES OF CLASSIC DEMOS ]>>==--..........."
        };
        this.currentMessage = this.messages.plasma;
        
        document.fonts.ready.then(() => {
            this.init();
        });
        
        this.scrollSpeed = 2; // pixels per frame
        this.isScrollComplete = false;
        this.onScrollComplete = null;
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

    setMessage(effectName, onComplete = null) {
        if (this.messages[effectName]) {
            this.updateText(this.messages[effectName]);
            this.textPos = this.crtBounds?.right + 800;
            this.isScrollComplete = false;
            this.onScrollComplete = onComplete;
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

    calculateScrollDuration() {
        if (!this.crtBounds) return 0;
        
        const textWidth = this.currentMessage.length * 30;
        const totalDistance = this.crtBounds.right + 800 + textWidth;
        const framesNeeded = totalDistance / this.scrollSpeed;
        
        // Convert frames to milliseconds (assuming 60fps)
        const duration = (framesNeeded / 60) * 1000;
        
        console.log('📏 Scroll duration calculation:', {
            textWidth,
            totalDistance,
            framesNeeded,
            duration,
            message: this.currentMessage
        });
        
        return duration;
    }

    update(timestamp) {
        if (!this.crtBounds) return;
        
        this.textPos -= this.scrollSpeed;
        
        // Calculate the total width of the text
        const textWidth = this.currentMessage.length * 30;
        
        // Check if scroll is complete
        if (this.textPos + textWidth < -800) {
            this.isScrollComplete = true;
            console.log('📜 Text scroll complete:', {
                message: this.currentMessage,
                finalPosition: this.textPos + textWidth
            });
            if (this.onScrollComplete) {
                this.onScrollComplete();
            }
            this.textPos = this.crtBounds.right + 800;
            this.isScrollComplete = false;
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
} 