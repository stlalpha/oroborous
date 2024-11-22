// ScripTracker - A JavaScript MOD Player
// Minified version for better performance
class ScripTracker {
    constructor() {
        this.context = null;
        this.sampleRate = 44100;
        this.playing = false;
        this.buffer = null;
        this.song = null;
        this.gainNode = null;
        this.source = null;
        this.position = 0;
        this.channels = [];
        this.s = {
            tick: 0,
            position: 0,
            row: 0,
        };
        this.isInitialized = false;
        
        // ProTracker period table
        this.periodTable = [
            856, 808, 762, 720, 678, 640, 604, 570, 538, 508, 480, 453,  // C-1 to B-1
            428, 404, 381, 360, 339, 320, 302, 285, 269, 254, 240, 226,  // C-2 to B-2
            214, 202, 190, 180, 170, 160, 151, 143, 135, 127, 120, 113   // C-3 to B-3
        ];
        
        // Constants for ProTracker playback
        this.AMIGA_PAL_CLOCK = 7093789.2;
        this.C2_PERIOD = 428;  // Period for C-2 note
        this.C2_FREQUENCY = this.AMIGA_PAL_CLOCK / (this.C2_PERIOD * 2); // ~8287 Hz
        
        // Amiga frequency constants
        this.AMIGA_PAL_CLOCK = 7093789.2;
        this.PAULA_FREQ = this.AMIGA_PAL_CLOCK / 65536; // ~108.2Hz
        
        // Note period lookup table (Protracker)
        this.notePeriods = {
            // Octave 1
            'C-1': 856, 'C#1': 808, 'D-1': 762, 'D#1': 720, 'E-1': 678, 'F-1': 640,
            'F#1': 604, 'G-1': 570, 'G#1': 538, 'A-1': 508, 'A#1': 480, 'B-1': 453,
            // Octave 2
            'C-2': 428, 'C#2': 404, 'D-2': 381, 'D#2': 360, 'E-2': 339, 'F-2': 320,
            'F#2': 302, 'G-2': 285, 'G#2': 269, 'A-2': 254, 'A#2': 240, 'B-2': 226,
            // Octave 3
            'C-3': 214, 'C#3': 202, 'D-3': 190, 'D#3': 180, 'E-3': 170, 'F-3': 160,
            'F#3': 151, 'G-3': 143, 'G#3': 135, 'A-3': 127, 'A#3': 120, 'B-3': 113
        };
    }

    async initialize() {
        if (!this.context) {
            throw new Error('Audio context not initialized. Call init() first.');
        }

        this.sampleRate = this.context.sampleRate;
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        
        this.channels = [
            { gainNode: this.context.createGain(), source: null },
            { gainNode: this.context.createGain(), source: null },
            { gainNode: this.context.createGain(), source: null },
            { gainNode: this.context.createGain(), source: null }
        ];
        
        this.channels.forEach(channel => channel.gainNode.connect(this.gainNode));
        this.isInitialized = true;
    }

    init(audioContext) {
        this.context = audioContext;
    }

    loadMod(t, a) {
        try {
            const s = new Uint8Array(t);
            const e = this.parseMod(s);
            this.song = e;
            this.createAudioBuffer();
            a(true);
        } catch (t) {
            console.error("MOD load error:", t);
            a(false);
        }
    }

    parseMod(t) {
        const a = {
            title: String.fromCharCode(...t.slice(0, 20)).trim(),
            samples: [],
            patterns: [],
            positions: [],
            numberOfPositions: t[950],
            maxPattern: 0
        };

        let s = 20;
        for (let e = 0; e < 31; e++) {
            const e = {
                name: String.fromCharCode(...t.slice(s, s + 22)).trim(),
                length: t[s + 22] << 8 | t[s + 23],
                finetune: t[s + 24],
                volume: t[s + 25],
                repeatPoint: t[s + 26] << 8 | t[s + 27],
                repeatLength: t[s + 28] << 8 | t[s + 29],
                data: null
            };
            a.samples.push(e);
            s += 30;
        }

        for (let e = 0; e < 128; e++) {
            a.positions[e] = t[952 + e];
            a.maxPattern = Math.max(a.maxPattern, t[952 + e]);
        }

        // Debug the pattern data after parsing
        console.log('Pattern data:', {
            numberOfPatterns: a.patterns.length,
            sampleCount: a.samples.length,
            firstPattern: a.patterns[0],
            firstSample: a.samples[0]
        });

        s = 1084;  // Start of pattern data
        for (let patternIndex = 0; patternIndex <= a.maxPattern; patternIndex++) {
            const pattern = new Array(64);  // 64 rows
            
            for (let row = 0; row < 64; row++) {
                const rowData = new Array(4);  // 4 channels
                
                for (let channel = 0; channel < 4; channel++) {
                    const offset = s + ((row * 4 + channel) * 4);
                    
                    // ProTracker format parsing:
                    const byte1 = t[offset];
                    const byte2 = t[offset + 1];
                    const byte3 = t[offset + 2];
                    const byte4 = t[offset + 3];
                    
                    // Extract period and sample number
                    const period = ((byte1 & 0x0f) << 8) | byte2;
                    const sample = (byte1 & 0xf0) | ((byte3 & 0xf0) >> 4);
                    
                    // Extract effect and parameters
                    const effect = byte3 & 0x0f;
                    const effectParam = byte4;

                    rowData[channel] = {
                        period: period,
                        sample: sample,
                        effect: effect,
                        effectParameter: effectParam,
                        // Add frequency calculation
                        frequency: period > 0 ? 7093789.2 / (period * 2) : 0
                    };
                }
                pattern[row] = rowData;
            }
            
            a.patterns[patternIndex] = pattern;
            s += 1024;  // Move to next pattern (4 bytes * 4 channels * 64 rows)
        }

        // Debug output for verification
        console.log('First pattern data:', {
            pattern: a.patterns[0],
            sampleCount: a.samples.length,
            firstRow: a.patterns[0][0]
        });

        // Load sample data
        for (let e = 0; e < 31; e++) {
            const sample = a.samples[e];
            if (sample.length > 0) {
                const sampleData = new Float32Array(sample.length * 2);
                for (let i = 0; i < sample.length; i++) {
                    // Convert 8-bit sample to float32
                    sampleData[i] = (t[s + i] - 128) / 128.0;
                }
                sample.data = sampleData;
                s += sample.length;
            }
        }

        return a;
    }

    createAudioBuffer() {
        if (!this.song) return;
        const t = this.context.createBuffer(2, this.sampleRate * 3, this.sampleRate);
        const a = t.getChannelData(0);
        const s = t.getChannelData(1);
        for (let e = 0; e < t.length; e++) {
            a[e] = 0;
            s[e] = 0;
        }
        this.buffer = t;
    }

    play() {
        if (!this.song || this.playing) return;
        this.playing = true;
        this.position = 0;
        this.playPattern(0);
    }

    playPattern(patternIndex) {
        if (!this.song || !this.song.patterns) return;
        
        const pattern = this.song.patterns[patternIndex];
        if (!pattern) return;

        console.log(`Playing pattern ${patternIndex}`);

        let currentRow = 0;
        const rowTime = 125; // 50Hz = 20ms per row
        
        const processRow = () => {
            if (!this.playing || currentRow >= 64) {
                if (this.playing) {
                    // Schedule next pattern
                    const nextPattern = (patternIndex + 1) % this.song.patterns.length;
                    setTimeout(() => this.playPattern(nextPattern), 0);
                }
                return;
            }

            const rowData = pattern[currentRow];
            if (rowData) {
                rowData.forEach((noteData, channel) => {
                    if (noteData && noteData.sample > 0 && noteData.period > 0) {
                        const sample = this.song.samples[noteData.sample - 1];
                        if (sample && sample.data) {
                            this.playNote(channel, sample, noteData);
                        }
                    }
                });
            }

            currentRow++;
            setTimeout(processRow, rowTime);
        };

        processRow();
    }

    periodToFrequency(period) {
        if (period === 0) return 0;
        // PAL clock frequency / (period * 2)
        return 7093789.2 / (period * 2);
    }

    calculatePlaybackRate(period) {
        if (period === 0) return 0;
        
        // Standard Amiga MOD formula:
        // rate = AMIGA_CLOCK / (period * 2)
        const amigaFreq = this.AMIGA_PAL_CLOCK / (period * 2);
        
        // Convert to Web Audio playback rate
        // (relative to sample rate and base frequency)
        return amigaFreq / this.sampleRate;
    }

    playNote(channel, sample, noteData) {
        try {
            // Stop existing sound
            if (this.channels[channel].source) {
                this.channels[channel].source.stop();
                this.channels[channel].source.disconnect();
            }

            // Create buffer for sample
            const buffer = this.context.createBuffer(1, sample.data.length, this.sampleRate);
            buffer.getChannelData(0).set(sample.data);

            const source = this.context.createBufferSource();
            source.buffer = buffer;

            // Calculate playback rate
            if (noteData.period > 0) {
                const rate = this.calculatePlaybackRate(noteData.period);
                source.playbackRate.setValueAtTime(rate, this.context.currentTime);
            }

            // Create gain node for volume control
            const noteGain = this.context.createGain();
            noteGain.gain.setValueAtTime(sample.volume / 64, this.context.currentTime);

            // Connect audio nodes
            source.connect(noteGain);
            noteGain.connect(this.channels[channel].gainNode);

            // Start playback
            source.start(this.context.currentTime);
            this.channels[channel].source = source;

            console.log('Playing note:', {
                channel,
                period: noteData.period,
                playbackRate: source.playbackRate.value,
                volume: noteGain.gain.value,
                amigaFreq: this.AMIGA_PAL_CLOCK / (noteData.period * 2)
            });
        } catch (error) {
            console.error('Error playing note:', error);
        }
    }

    stop() {
        this.playing = false;
        this.channels.forEach(t => {
            if (t.source) {
                t.source.stop();
                t.source = null;
            }
        });
    }
}