import { amigaPalette } from '../utils/amigaPalette.js';

export class LoadScreen {
    static SPEED_TEST_FILE = 'data:application/octet-stream;base64,'.concat(
        // 100KB of random data
        btoa(Array(100 * 1024).fill().map(() => String.fromCharCode(Math.random() * 256)).join(''))
    );

    constructor(onLaunch) {
        const crtContainer = document.querySelector('.crt-container');
        
        this.container = document.createElement('div');
        this.container.className = 'load-screen';
        this.container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10;
            display: flex;
            flex-direction: column;
            font-family: monospace;
            color: #fff;
            transition: opacity 1s;
            border-radius: 20px;
            overflow: hidden;
        `;

        // Create and store canvas reference
        this.canvas = document.createElement('canvas');
        this.canvas.width = crtContainer.offsetWidth;
        this.canvas.height = crtContainer.offsetHeight;
        this.canvas.id = 'loadScreenCanvas';
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        `;
        this.container.appendChild(this.canvas);

        // Create SMPTE color bars container
        const colorBars = document.createElement('div');
        colorBars.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        `;

        // Main bars section
        const mainSection = document.createElement('div');
        mainSection.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 75%;
            display: flex;
        `;

        // Main colors
        const mainColors = [
            '#FFFFFF',    // White
            '#FFFF00',    // Yellow
            '#00FFFF',    // Cyan
            '#00FF00',    // Green
            '#FF00FF',    // Magenta
            '#FF0000',    // Red
            '#0000FF'     // Blue
        ];

        // Calculate bar width
        const barWidth = 100 / mainColors.length; // Width percentage for each bar

        mainColors.forEach((color, index) => {
            const bar = document.createElement('div');
            bar.style.cssText = `
                flex: 1;
                background-color: ${color};
            `;
            mainSection.appendChild(bar);
        });

        // Black band
        const blackBand = document.createElement('div');
        blackBand.style.cssText = `
            position: absolute;
            top: 75%;
            left: 0;
            width: 100%;
            height: 25%;
            background-color: #000000;
        `;

        // White patch
        const whitePatch = document.createElement('div');
        whitePatch.style.cssText = `
            position: absolute;
            top: 75%;
            left: ${barWidth * 1.5}%;
            width: ${barWidth}%;
            height: 18.75%;
            background-color: #FFFFFF;
        `;

        // Add elements in correct order
        colorBars.appendChild(mainSection);
        colorBars.appendChild(blackBand);
        colorBars.appendChild(whitePatch);

        // Add color bars before other elements
        this.container.appendChild(colorBars);

        // Create technical info element
        this.technicalInfo = document.createElement('div');
        this.technicalInfo.style.cssText = `
            font-family: monospace;
            font-size: 16px;
            color: #fff;
            text-align: left;
            line-height: 1.8;
            padding: 20px;
            position: absolute;
            bottom: 120px;
            left: 20px;
            text-shadow: 2px 2px 0px #000;
            z-index: 2;
        `;

        // Create glitch logo first (before gathering system info)
        this.glitchLogo = document.createElement('div');
        this.glitchLogo.style.cssText = `
            font-family: monospace;
            font-size: 24px;
            color: #fff;
            position: absolute;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
            z-index: 2;
        `;
        this.glitchLogo.innerHTML = `-=PiRATE MiND STATiON=-`;
        
        // Now gather system info but don't display yet
        this.systemStatus = "INITIALIZING";
        this.browserInfo = this.getBrowserInfo();
        this.gpuInfo = this.getGPUInfo();
        this.screenInfo = this.getScreenInfo();
        this.audioInfo = this.getAudioInfo();
        
        // Create launch button
        this.launchButton = document.createElement('button');
        this.launchButton.textContent = "START TRANSMISSION";
        this.launchButton.style.cssText = `
            font-family: monospace;
            font-size: 16px;
            padding: 10px 20px;
            background: #000;
            border: 1px solid #fff;
            color: #fff;
            cursor: pointer;
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            display: none;
            transition: all 0.3s;
            z-index: 2;
            animation: pulseGlow 2s infinite;
        `;

        // Add hover effects
        this.launchButton.addEventListener('mouseover', () => {
            this.launchButton.style.background = '#fff';
            this.launchButton.style.color = '#000';
            this.launchButton.style.animation = 'none';
            this.launchButton.style.boxShadow = '0 0 15px #fff, 0 0 25px #fff, 0 0 35px #ff00ff, 0 0 45px #00ffff';
        });

        this.launchButton.addEventListener('mouseout', () => {
            this.launchButton.style.background = '#000';
            this.launchButton.style.color = '#fff';
            this.launchButton.style.animation = 'pulseGlow 2s infinite';
        });

        this.launchButton.addEventListener('click', () => {
            this.hide();
            onLaunch();
        });

        // Add scanline effect
        const scanlines = document.createElement('div');
        scanlines.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0) 50%,
                rgba(0, 0, 0, 0.2) 50%
            );
            background-size: 100% 4px;
            pointer-events: none;
            z-index: 3;
        `;

        // Add glitch animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glitch {
                0% { 
                    transform: translate(0) skew(0deg);
                    text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
                }
                20% { 
                    transform: translate(-3px) skew(-20deg);
                    text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff;
                }
                40% { 
                    transform: translate(2px) skew(20deg);
                    text-shadow: 4px 0 #ff00ff, -4px 0 #00ffff;
                }
                60% { 
                    transform: translate(-2px) skew(-5deg);
                    text-shadow: -3px 0 #ff00ff, 3px 0 #00ffff;
                }
                80% { 
                    transform: translate(1px) skew(10deg);
                    text-shadow: 3px 0 #ff00ff, -3px 0 #00ffff;
                }
                100% { 
                    transform: translate(0) skew(0deg);
                    text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
                }
            }

            @keyframes glitchLogo {
                0% { 
                    transform: translateX(-50%) skew(0deg);
                    text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
                }
                20% { 
                    transform: translateX(-53%) skew(-20deg);
                    text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff;
                }
                40% { 
                    transform: translateX(-48%) skew(20deg);
                    text-shadow: 4px 0 #ff00ff, -4px 0 #00ffff;
                }
                60% { 
                    transform: translateX(-52%) skew(-5deg);
                    text-shadow: -3px 0 #ff00ff, 3px 0 #00ffff;
                }
                80% { 
                    transform: translateX(-49%) skew(10deg);
                    text-shadow: 3px 0 #ff00ff, -3px 0 #00ffff;
                }
                100% { 
                    transform: translateX(-50%) skew(0deg);
                    text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
                }
            }

            @keyframes pulseGlow {
                0% {
                    box-shadow: 0 0 5px #fff,
                               0 0 10px #fff,
                               0 0 15px #ff00ff,
                               0 0 20px #00ffff;
                }
                50% {
                    box-shadow: 0 0 10px #fff,
                               0 0 20px #fff,
                               0 0 25px #ff00ff,
                               0 0 30px #00ffff;
                }
                100% {
                    box-shadow: 0 0 5px #fff,
                               0 0 10px #fff,
                               0 0 15px #ff00ff,
                               0 0 20px #00ffff;
                }
            }

            .reverse-text {
                background: #000;
                color: #fff;
                padding: 0 4px;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);

        // Create loading text
        this.loadingText = document.createElement('div');
        this.loadingText.style.cssText = `
            font-family: monospace;
            font-size: 16px;
            color: #fff;
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            text-shadow: 2px 2px 0px #000;
            z-index: 2;
        `;
        this.loadingText.textContent = "LOADING....";
        this.container.appendChild(this.loadingText);

        // Assemble all elements
        this.container.appendChild(this.technicalInfo);
        this.container.appendChild(this.glitchLogo);
        this.container.appendChild(this.launchButton);
        this.container.appendChild(scanlines);
        crtContainer.appendChild(this.container);

        // Start the sequence:
        // 1. Start glitch
        // 2. Wait 2 seconds
        // 3. Begin typing
        this.startSequence();
    }

    async startSequence() {
        // Start glitch animations with faster speed
        this.glitchLogo.style.animation = 'glitchLogo 0.2s infinite';
        this.technicalInfo.style.animation = 'glitch 0.2s infinite';
        
        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Begin typing
        await this.updateTechnicalInfo(this.browserInfo, this.gpuInfo, this.screenInfo, this.audioInfo);
    }

    hide() {
        // Clear any pending timers
        if (this._glitchTimer) {
            clearTimeout(this._glitchTimer);
        }
        
        this.container.style.opacity = '0';
        setTimeout(() => {
            this.container.remove();
        }, 1000);
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        const browser = {
            name: 'Unknown',
            version: 'Unknown',
            platform: navigator.platform,
            language: navigator.language,
            cores: navigator.hardwareConcurrency || 'Unknown'
        };

        if (ua.includes('Firefox/')) {
            browser.name = 'Firefox';
            browser.version = ua.split('Firefox/')[1];
        } else if (ua.includes('Chrome/')) {
            browser.name = 'Chrome';
            browser.version = ua.split('Chrome/')[1].split(' ')[0];
        } else if (ua.includes('Safari/')) {
            browser.name = 'Safari';
            browser.version = ua.split('Version/')[1].split(' ')[0];
        }

        return browser;
    }

    getGPUInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            return { renderer: 'Unknown', vendor: 'Unknown' };
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        let renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
        let vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';

        // Clean up Mac GPU info
        if (renderer.includes('Google')) {
            if (navigator.platform.toLowerCase().includes('mac')) {
                renderer = 'Apple M1/M2 GPU';
                vendor = 'Apple';
            }
        }

        return { renderer, vendor };
    }

    getScreenInfo() {
        return {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            orientation: screen.orientation?.type || 'Unknown'
        };
    }

    getAudioInfo() {
        try {
            // Only create AudioContext when needed and after user interaction
            return {
                sampleRate: 'Pending user interaction',
                state: 'Suspended',
                maxChannels: 'Unknown'
            };
        } catch (error) {
            console.warn('Audio info not available:', error);
            return {
                sampleRate: 'Not available',
                state: 'Not available',
                maxChannels: 'Not available'
            };
        }
    }

    async typeText(text) {
        const lines = text.split('\n').map(line => line.trim());
        let fullText = '';
        const labelSpeed = 20; // faster typing for labels
        const valueSpeed = 40; // slower typing for values
        
        for (const line of lines) {
            if (line.includes('SIGNAL LOCK STATUS:')) {
                // Display this line immediately and handle simulation
                fullText += line + '\n';
                this.technicalInfo.innerHTML = fullText.split('\n').join('<br>');
                fullText = await this.simulateSignalLock(fullText); // Update fullText with result
                continue;
            }
            
            // Skip empty lines or decorative lines
            if (!line || line.startsWith('PLEASE') || line.startsWith('SYSTEM')) {
                fullText += line + '\n';
                this.technicalInfo.innerHTML = fullText.split('\n').join('<br>');
                continue;
            }

            // Split line into label and value
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const label = line.substring(0, colonIndex + 1);
                const value = line.substring(colonIndex + 1);

                // Type label at faster speed
                for (const char of label) {
                    fullText += char;
                    this.technicalInfo.innerHTML = fullText.split('\n').join('<br>');
                    await new Promise(resolve => setTimeout(resolve, labelSpeed));
                }

                // Type value at slower speed
                for (const char of value) {
                    fullText += char;
                    this.technicalInfo.innerHTML = fullText.split('\n').join('<br>');
                    await new Promise(resolve => setTimeout(resolve, valueSpeed));
                }
            } else {
                // For lines without colons, type at normal speed
                for (const char of line) {
                    fullText += char;
                    this.technicalInfo.innerHTML = fullText.split('\n').join('<br>');
                    await new Promise(resolve => setTimeout(resolve, labelSpeed));
                }
            }
            
            fullText += '\n';
            this.technicalInfo.innerHTML = fullText.split('\n').join('<br>');
        }

        return fullText;
    }

    async simulateSignalLock(fullText) {
        console.log('🎬 Starting signal lock simulation');
        
        // Reduced glitch duration to improve responsiveness
        const textGlitchDuration = 3000 + Math.floor(Math.random() * 2000);
        console.log(`⏱️ Glitch duration set to: ${textGlitchDuration/1000} seconds`);
        
        const startTime = Date.now();
        
        return new Promise(resolve => {
            const glitchTimer = setTimeout(() => {
                const actualDuration = (Date.now() - startTime) / 1000;
                console.log(`✨ Glitch effect completed after ${actualDuration} seconds`);
                
                // Stop text glitch
                this.technicalInfo.style.animation = 'none';
                
                // Reduce logo glitch intensity
                this.glitchLogo.style.animation = 'glitchLogo 0.4s infinite';
                
                // Update signal status text immediately
                const lines = this.technicalInfo.innerHTML.split('<br>');
                const updatedLines = lines.map(line => {
                    if (line.includes('SIGNAL LOCK STATUS: ACQUIRING')) {
                        return line.replace('ACQUIRING', '<span class="reverse-text">ACQUIRED</span>');
                    }
                    return line;
                });
                
                // Update the display with the new status
                this.technicalInfo.innerHTML = updatedLines.join('<br>');
                console.log('✅ Signal lock status updated to ACQUIRED');
                
                // Update fullText with the new content
                fullText = updatedLines.join('\n');
                resolve(fullText);
            }, textGlitchDuration);

            // Store the timer reference
            this._glitchTimer = glitchTimer;
        });
    }

    async updateTechnicalInfo(browserInfo, gpuInfo, screenInfo, audioInfo) {
        console.log('📝 Starting to type technical info...');
        
        const memoryInfo = (() => {
            if (performance?.memory) {
                const totalMemGB = navigator.deviceMemory || 
                                  Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024 * 1024));
                return `MEMORY: ${totalMemGB}GB TOTAL`;
            }
            return 'MEMORY: NOT AVAILABLE';
        })();

        // Define our virtual Amiga resolution and colors
        const amigaWidth = 320;
        const amigaHeight = 256;
        const amigaColors = 32; // Standard Amiga OCS/ECS
        const canvasWidth = this.canvas?.width || window.innerWidth;
        const canvasHeight = this.canvas?.height || window.innerHeight;

        const text = `
            PLEASE STAND BY...
            
            SIGNAL LOCK STATUS: ACQUIRING
            
            SYSTEM STATUS: ${this.systemStatus}
            
            BROWSER: ${browserInfo.name} ${browserInfo.version}
            PLATFORM: ${browserInfo.platform}
            CPU CORES: ${browserInfo.cores}
            ${memoryInfo}
            
            GPU VENDOR: ${gpuInfo.vendor}
            GPU RENDERER: ${gpuInfo.renderer}
            
            NATIVE DISPLAY:
            RESOLUTION: ${screenInfo.width}x${screenInfo.height}
            COLOR DEPTH: ${screenInfo.colorDepth}-bit
            PIXEL RATIO: ${screenInfo.pixelRatio}x
            
            VIRTUAL DISPLAY:
            AMIGA MODE: ${amigaWidth}x${amigaHeight}
            SCALED TO: ${canvasWidth}x${canvasHeight}
            COLOR DEPTH: ${amigaColors} COLORS
            REFRESH RATE: 60Hz
            COLOR BAR SIGNAL: ACTIVE
        `;

        // Clear existing content
        this.technicalInfo.innerHTML = '';
        
        // Type out the text
        console.log('⌨️ Typing text...');
        const fullText = await this.typeText(text);
        console.log('✅ Technical info sequence complete');

        // Update system status and remove "PLEASE STAND BY..." while preserving spacing
        const lines = this.technicalInfo.innerHTML.split('<br>');
        const updatedLines = lines.map(line => {
            if (line.includes('SYSTEM STATUS: INITIALIZING')) {
                return line.replace('INITIALIZING', '<span class="reverse-text">INITIALIZED</span>');
            }
            // Replace "PLEASE STAND BY..." line with empty string but keep the line
            if (line.includes('PLEASE STAND BY')) {
                return line.replace('PLEASE STAND BY...', '');
            }
            return line;
        });
        
        this.technicalInfo.innerHTML = updatedLines.join('<br>');

        // After typing is complete, replace loading text with launch button
        this.loadingText.remove();
        if (this.launchButton) {
            this.launchButton.style.display = 'block';
            requestAnimationFrame(() => {
                this.launchButton.style.opacity = '1';
            });
        }
    }

    async startCountdown() {
        this.systemStatus = "INITIALIZED";
        // Update the technical info with new status
        const browserInfo = this.getBrowserInfo();
        const gpuInfo = this.getGPUInfo();
        const screenInfo = this.getScreenInfo();
        const audioInfo = this.getAudioInfo();
        await this.updateTechnicalInfo(browserInfo, gpuInfo, screenInfo, audioInfo);
    }

    getBrowserCapabilities() {
        return {
            webgl2: !!window.WebGL2RenderingContext,
            webgpu: 'gpu' in window,
            webAssembly: typeof WebAssembly === 'object',
            sharedArrayBuffer: typeof SharedArrayBuffer === 'function',
            serviceWorker: 'serviceWorker' in navigator,
            bluetooth: 'bluetooth' in navigator,
            touchscreen: 'ontouchstart' in window,
            battery: 'getBattery' in navigator,
            virtualReality: 'xr' in navigator,
            networkType: navigator.connection?.type || 'Unknown',
            networkSpeed: navigator.connection?.downlink || 'Unknown',
            maxTouchPoints: navigator.maxTouchPoints,
            deviceMemory: navigator.deviceMemory || 'Unknown',
            doNotTrack: navigator.doNotTrack || 'Unknown',
            cookiesEnabled: navigator.cookieEnabled,
            pdfViewerEnabled: navigator.pdfViewerEnabled,
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        };
    }

    getSystemTimings() {
        const timing = performance.timing;
        return {
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            domReadyTime: timing.domComplete - timing.domLoading,
            renderTime: timing.domComplete - timing.domContentLoadedEventStart
        };
    }

    getGPUDetails() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (!gl) return {};
        
        return {
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            version: gl.getParameter(gl.VERSION),
            shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)
        };
    }

    getMediaCapabilities() {
        return {
            speakers: typeof navigator.mediaDevices !== 'undefined',
            microphone: typeof navigator.mediaDevices !== 'undefined',
            camera: typeof navigator.mediaDevices !== 'undefined',
            midi: 'requestMIDIAccess' in navigator,
            gamepad: 'getGamepads' in navigator
        };
    }

    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        const info = {
            type: 'API NOT SUPPORTED',
            downlinkSpeed: 'API NOT SUPPORTED',
            rtt: 'API NOT SUPPORTED',
            effectiveType: 'API NOT SUPPORTED',
            saveData: false
        };

        if (connection) {
            // More descriptive connection types
            const connectionTypes = {
                bluetooth: 'BLUETOOTH',
                cellular: 'CELLULAR',
                ethernet: 'ETHERNET',
                none: 'NO CONNECTION',
                wifi: 'WIFI',
                wimax: 'WIMAX',
                other: 'OTHER',
                unknown: 'UNIDENTIFIED'
            };

            info.type = connectionTypes[connection.type] || 'UNIDENTIFIED';
            info.downlinkSpeed = connection.downlink ? `${connection.downlink} Mbps` : 'NOT AVAILABLE';
            info.rtt = connection.rtt ? `${connection.rtt}ms` : 'NOT AVAILABLE';
            info.effectiveType = connection.effectiveType ? connection.effectiveType.toUpperCase() : 'NOT AVAILABLE';
            info.saveData = connection.saveData || false;
        }

        return info;
    }

    // Optional: Add a more accurate speed test
    async measureNetworkSpeed() {
        const startTime = performance.now();
        try {
            const response = await fetch(LoadScreen.SPEED_TEST_FILE);
            const data = await response.blob();
            const endTime = performance.now();
            
            const durationInSeconds = (endTime - startTime) / 1000;
            const fileSizeInBits = data.size * 8;
            const speedInMbps = (fileSizeInBits / durationInSeconds / 1000000).toFixed(2);
            
            return `${speedInMbps} Mbps`;
        } catch (error) {
            console.warn('Speed test failed:', error);
            return 'Test Failed';
        }
    }
} 