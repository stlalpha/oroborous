export class AudioManager {
    constructor() {
        console.log('🎵 Initializing AudioManager');
        this.audio = new Audio();
        this.audio.loop = true;
        this.isInitialized = false;
        this.retryAttempts = 3; // Add retry mechanism
        
        // Enhanced error handling
        this.audio.addEventListener('error', (e) => {
            const errorTypes = {
                1: 'MEDIA_ERR_ABORTED',
                2: 'MEDIA_ERR_NETWORK',
                3: 'MEDIA_ERR_DECODE',
                4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
            };
            
            console.error('🔴 Audio error:', {
                error: e,
                errorType: errorTypes[this.audio.error?.code] || 'Unknown',
                currentSrc: this.audio.currentSrc,
                readyState: this.audio.readyState,
                networkState: this.audio.networkState
            });
        });
        
        // Add more detailed loading feedback
        this.audio.addEventListener('loadstart', () => console.log('🎵 Audio loading started'));
        this.audio.addEventListener('loadeddata', () => console.log('🎵 Audio data loaded'));
        this.audio.addEventListener('canplay', () => console.log('🎵 Audio can play'));
        this.audio.addEventListener('canplaythrough', () => console.log('🎵 Audio can play through'));
    }

    async loadTrack(path) {
        let attempts = 0;
        
        const tryLoad = async () => {
            try {
                console.log(`🎵 Loading audio track from: ${path} (Attempt ${attempts + 1}/${this.retryAttempts})`);
                this.audio.src = path;
                
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Audio loading timeout'));
                    }, 10000); // 10 second timeout

                    this.audio.addEventListener('canplaythrough', () => {
                        clearTimeout(timeout);
                        console.log('🎵 Track loaded successfully');
                        this.isInitialized = true;
                        resolve();
                    }, { once: true });

                    this.audio.addEventListener('error', (e) => {
                        clearTimeout(timeout);
                        reject(new Error(`Loading failed: ${e.message}`));
                    }, { once: true });
                });
            } catch (error) {
                throw error;
            }
        };

        while (attempts < this.retryAttempts) {
            try {
                return await tryLoad();
            } catch (error) {
                attempts++;
                console.error(`🔴 Load attempt ${attempts} failed:`, error);
                if (attempts === this.retryAttempts) {
                    throw new Error(`Failed to load audio after ${this.retryAttempts} attempts`);
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    play() {
        if (!this.isInitialized) {
            console.warn('🟡 Attempting to play before audio is initialized');
            return;
        }

        const attemptPlay = async () => {
            try {
                await this.audio.play();
                console.log('🎵 Audio playing successfully');
                return true;
            } catch (error) {
                return false;
            }
        };

        // First attempt to play
        console.log('🎵 Attempting to play audio...');
        attemptPlay().then(success => {
            if (!success) {
                console.log('🎵 Waiting for user interaction...');
                
                const startAudio = async () => {
                    // Only try to play if we haven't succeeded yet
                    if (this.audio.paused) {
                        const playSuccess = await attemptPlay();
                        if (playSuccess) {
                            // Clean up event listeners only on success
                            document.removeEventListener('click', startAudio, true);
                            document.removeEventListener('keydown', startAudio, true);
                            document.removeEventListener('touchstart', startAudio, true);
                        }
                    }
                };

                // Add capture phase listeners to catch events as early as possible
                document.addEventListener('click', startAudio, true);
                document.addEventListener('keydown', startAudio, true);
                document.addEventListener('touchstart', startAudio, true);
            }
        });
    }

    setVolume(value) {
        this.audio.volume = Math.max(0, Math.min(1, value));
        console.log('🎵 Volume set to:', this.audio.volume);
    }
} 