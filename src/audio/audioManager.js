export class AudioManager {
    constructor() {
        this.audio = new Audio();
        this.audio.loop = true;
        
        // Set up audio context for potential future audio visualizations
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Handle browser autoplay restrictions
        this.isPlaying = false;
        this.setupAutoplayHandling();
    }

    setupAutoplayHandling() {
        // Most browsers require user interaction before playing audio
        const startAudio = () => {
            if (!this.isPlaying) {
                this.play();
                // Resume audio context if it was suspended
                this.audioContext.resume();
            }
            // Remove the event listeners after first interaction
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
        };

        document.addEventListener('click', startAudio);
        document.addEventListener('keydown', startAudio);
    }

    loadTrack(url) {
        this.audio.src = url;
        return new Promise((resolve, reject) => {
            this.audio.addEventListener('canplaythrough', resolve, { once: true });
            this.audio.addEventListener('error', reject, { once: true });
        });
    }

    play() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
            })
            .catch(error => {
                console.error('Audio playback failed:', error);
            });
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }

    setVolume(value) {
        this.audio.volume = Math.max(0, Math.min(1, value));
    }
} 