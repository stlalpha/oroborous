export class DemoMusicPlayer {
    constructor() {
        this.player = null;
        this.isMuted = false;
        this.isInitialized = false;
        this.isPlaying = false;
        this.debugLog = [];
        this.logDebug('DemoMusicPlayer constructed');
    }

    logDebug(message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            message,
            data
        };
        this.debugLog.push(logEntry);
        console.log(`🎵 [${logEntry.timestamp}] ${message}`, data || '');
    }

    async init() {
        if (this.isInitialized) {
            this.logDebug('Already initialized');
            return;
        }

        try {
            if (typeof ScripTracker === 'undefined') {
                this.logDebug('ScripTracker not loaded');
                throw new Error('ScripTracker library not loaded');
            }

            this.logDebug('Creating audio context');
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.logDebug('Loading MOD file');
            const response = await fetch('test.mod');
            if (!response.ok) {
                throw new Error('Failed to load MOD file');
            }
            const arrayBuffer = await response.arrayBuffer();
            
            this.logDebug('Creating ScripTracker');
            this.player = new ScripTracker();
            this.player.init(audioContext);
            
            this.logDebug('Loading MOD into player');
            await new Promise((resolve, reject) => {
                this.player.loadMod(arrayBuffer, (success) => {
                    if (success) {
                        this.isInitialized = true;
                        this.logDebug('MOD loaded successfully');
                        resolve();
                    } else {
                        reject(new Error('Failed to load MOD into player'));
                    }
                });
            });
        } catch (error) {
            this.logDebug('Initialization failed', error);
            throw error;
        }
    }

    async play() {
        if (!this.isInitialized) {
            throw new Error('Player not initialized');
        }

        try {
            if (!this.isPlaying) {
                this.logDebug('Starting playback');
                
                // Make sure audio context is running
                if (this.player.context.state === 'suspended') {
                    await this.player.context.resume();
                }
                
                await this.player.initialize();
                
                // Debug output before playing
                this.logDebug('Audio state before play:', {
                    contextState: this.player.context.state,
                    isInitialized: this.player.isInitialized,
                    sampleRate: this.player.sampleRate,
                    songLoaded: !!this.player.song
                });
                
                this.player.play();
                this.isPlaying = true;
                this.isMuted = false;
            }
        } catch (error) {
            this.logDebug('Play failed', error);
            throw error;
        }
    }

    stop() {
        if (this.player && this.isPlaying) {
            this.logDebug('Stopping playback');
            this.player.stop();
            this.isPlaying = false;
            this.isMuted = true;
        }
    }

    destroy() {
        if (this.player) {
            this.stop();
            this.player = null;
            this.isInitialized = false;
            this.logDebug('Player destroyed');
        }
    }
} 