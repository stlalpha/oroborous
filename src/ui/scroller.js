export class TextScroller {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.text = this.element.textContent;
        this.textPos = window.innerWidth;
        this.init();
    }

    init() {
        this.element.textContent = '';
        this.text.split('').forEach((char) => {
            const span = document.createElement('span');
            span.textContent = char;
            this.element.appendChild(span);
        });
    }

    update(timestamp) {
        this.textPos -= 2;
        if (this.textPos < -(this.text.length * 30)) {
            this.textPos = window.innerWidth;
        }

        Array.from(this.element.children).forEach((span, index) => {
            const offset = index * 30;
            const xPos = this.textPos + offset;
            const sineWave = Math.sin((timestamp * 0.003) + (index * 0.2)) * 50;
            span.style.transform = `translate(${xPos}px, ${sineWave}px)`;
        });
    }
} 