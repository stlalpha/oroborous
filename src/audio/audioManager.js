export class AudioManager {
    constructor() {
        this.audio = new Audio();
        this.audio.loop = true;
        this.isInitialized = false;
        this.retryAttempts = 3;
        this.queue = [];
        this.currentTrack = null;
        this.hasInteracted = false;
        this.desiredVolume = 1;
        this.unlocked = false;
        
        // Keep only essential error handling
        this.audio.addEventListener('error', (e) => {
            const errorTypes = {
                1: 'MEDIA_ERR_ABORTED',
                2: 'MEDIA_ERR_NETWORK',
                3: 'MEDIA_ERR_DECODE',
                4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
            };
            
            console.error('🔴 Audio error:', {
                errorType: errorTypes[this.audio.error?.code] || 'Unknown',
                currentSrc: this.audio.currentSrc
            });
        });

        this.audio.addEventListener('ended', () => {
            if (!this.audio.loop) {
                this.playNext();
            }
        });

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.source = null;

        // Track user interaction globally
        this.setupInteractionTracking();
        this.unlockAudio();
    }

    setupInteractionTracking() {
        const markInteracted = () => {
            this.hasInteracted = true;
            // If we're currently playing muted, unmute
            if (!this.audio.paused && this.audio.muted) {
                this.audio.muted = false;
                this.audio.volume = this.desiredVolume;
            }
            // Clean up listeners after first interaction
            document.removeEventListener('click', markInteracted, true);
            document.removeEventListener('keydown', markInteracted, true);
            document.removeEventListener('touchstart', markInteracted, true);
        };

        document.addEventListener('click', markInteracted, true);
        document.addEventListener('keydown', markInteracted, true);
        document.addEventListener('touchstart', markInteracted, true);
    }

    async loadTrack(path) {
        let attempts = 0;
        
        const tryLoad = async () => {
            this.audio.src = path;
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Audio loading timeout'));
                }, 10000);

                this.audio.addEventListener('canplaythrough', () => {
                    clearTimeout(timeout);
                    this.isInitialized = true;
                    resolve();
                }, { once: true });

                this.audio.addEventListener('error', (e) => {
                    clearTimeout(timeout);
                    reject(new Error(`Loading failed: ${e.message}`));
                }, { once: true });
            });
        };

        while (attempts < this.retryAttempts) {
            try {
                return await tryLoad();
            } catch (error) {
                attempts++;
                if (attempts === this.retryAttempts) {
                    throw new Error(`Failed to load audio after ${this.retryAttempts} attempts`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    async play() {
        if (!this.isInitialized) return;

        try {
            // If no user interaction yet, start muted
            if (!this.hasInteracted) {
                this.desiredVolume = this.audio.volume;
                this.audio.muted = true;
                this.audio.volume = 0;
            }
            
            await this.audio.play();
            
            // If user has already interacted, unmute immediately
            if (this.hasInteracted) {
                this.audio.muted = false;
                this.audio.volume = this.desiredVolume;
            }
            
            return true;
        } catch (error) {
            console.warn('Autoplay prevented:', error);
            return false;
        }
    }

    setVolume(value) {
        const newVolume = Math.max(0, Math.min(1, value));
        this.desiredVolume = newVolume;
        if (this.hasInteracted) {
            this.audio.volume = newVolume;
        }
    }

    async fadeVolume(targetVolume, duration = 1000) {
        const startVolume = this.audio.volume;
        const startTime = performance.now();
        
        return new Promise(resolve => {
            const updateVolume = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.audio.volume = startVolume + (targetVolume - startVolume) * progress;
                
                if (progress < 1) {
                    requestAnimationFrame(updateVolume);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(updateVolume);
        });
    }

    async fadeOut(duration = 1000) {
        await this.fadeVolume(0, duration);
        this.audio.pause();
    }

    async fadeIn(duration = 1000) {
        const targetVolume = Math.min(this.audio.volume || 1, 1);
        this.audio.volume = 0;
        await this.play();
        await this.fadeVolume(targetVolume, duration);
    }

    addToQueue(trackPath) {
        this.queue.push(trackPath);
    }

    clearQueue() {
        this.queue = [];
    }

    async playNext() {
        if (this.queue.length > 0) {
            const nextTrack = this.queue.shift();
            await this.loadTrack(nextTrack);
            await this.play();
        }
    }

    connectAnalyser() {
        if (!this.source) {
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        }
    }

    getFrequencyData() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    getWaveformData() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);
        return dataArray;
    }

    setPlaybackRate(rate) {
        // Clamp rate between 0.25 and 4
        this.audio.playbackRate = Math.max(0.25, Math.min(4, rate));
    }

    speedUp(amount = 0.1) {
        this.setPlaybackRate(this.audio.playbackRate + amount);
    }

    slowDown(amount = 0.1) {
        this.setPlaybackRate(this.audio.playbackRate - amount);
    }

    async unlockAudio() {
        // Create a short silent audio buffer
        const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(this.audioContext.destination);

        try {
            // Play the silent buffer
            await source.start();
            this.unlocked = true;
        } catch (error) {
            console.warn('Audio unlock failed:', error);
        }
    }
} 