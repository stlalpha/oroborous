export class LoadScreen {
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

        // Create SMPTE color bars
        const colorBars = document.createElement('div');
        colorBars.style.cssText = `
            position: relative;
            width: 100%;
            height: 67%;
            display: flex;
        `;

        // Main SMPTE bars (75% white)
        const mainColors = [
            '#FFFFFF', // White (100%)
            '#FFFF00', // Yellow
            '#00FFFF', // Cyan
            '#00FF00', // Green
            '#FF00FF', // Magenta
            '#FF0000', // Red
            '#0000FF'  // Blue
        ];

        mainColors.forEach(color => {
            const bar = document.createElement('div');
            bar.style.cssText = `
                flex: 1;
                background-color: ${color};
            `;
            colorBars.appendChild(bar);
        });

        // Create reverse bars section (bottom third of main bars)
        const reverseSection = document.createElement('div');
        reverseSection.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 33%;
            display: flex;
        `;

        // Reverse pattern colors
        const reverseColors = [
            '#0000FF', // Blue
            '#000000', // Black
            '#FF00FF', // Magenta
            '#000000', // Black
            '#00FFFF', // Cyan
            '#000000', // Black
            '#FFFFFF'  // White
        ];

        reverseColors.forEach(color => {
            const bar = document.createElement('div');
            bar.style.cssText = `
                flex: 1;
                background-color: ${color};
            `;
            reverseSection.appendChild(bar);
        });

        colorBars.appendChild(reverseSection);

        // Create -I, White, +Q, Black section
        const iqSection = document.createElement('div');
        iqSection.style.cssText = `
            width: 100%;
            height: 8%;
            display: flex;
        `;

        const iqColors = [
            '#4A0088', // -I
            '#FFFFFF', // White
            '#88007F', // +Q
            '#000000', // Black
            '#000000', // Black
            '#000000', // Black
            '#000000'  // Black
        ];

        iqColors.forEach(color => {
            const bar = document.createElement('div');
            bar.style.cssText = `
                flex: 1;
                background-color: ${color};
            `;
            iqSection.appendChild(bar);
        });

        // Create pluge and black section
        const plugeSection = document.createElement('div');
        plugeSection.style.cssText = `
            width: 100%;
            height: 12%;
            display: flex;
        `;

        const plugeColors = [
            '#161616', // 3.5% below black
            '#000000', // Black
            '#1A1A1A', // 3.5% above black
            '#000000', // Black
            '#FFFFFF', // White
            '#000000', // Black
            '#000000'  // Black
        ];

        plugeColors.forEach(color => {
            const bar = document.createElement('div');
            bar.style.cssText = `
                flex: 1;
                background-color: ${color};
            `;
            plugeSection.appendChild(bar);
        });

        // Create technical info text
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

        // Add system info gathering
        const browserInfo = this.getBrowserInfo();
        const gpuInfo = this.getGPUInfo();
        const screenInfo = this.getScreenInfo();
        const audioInfo = this.getAudioInfo();

        this.systemStatus = "INITIALIZING";
        this.updateTechnicalInfo(browserInfo, gpuInfo, screenInfo, audioInfo);

        // Create glitch text effect
        const glitchLogo = document.createElement('div');
        glitchLogo.style.cssText = `
            font-family: monospace;
            font-size: 24px;
            color: #fff;
            position: absolute;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            text-shadow: 
                2px 0 #ff00ff,
                -2px 0 #00ffff;
            animation: glitch 1s infinite;
            z-index: 2;
        `;
        glitchLogo.innerHTML = `
            -=PiRATE MiND STATiON=-
        `;

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
        `;

        // Add hover effects
        this.launchButton.addEventListener('mouseover', () => {
            this.launchButton.style.background = '#fff';
            this.launchButton.style.color = '#000';
        });

        this.launchButton.addEventListener('mouseout', () => {
            this.launchButton.style.background = '#000';
            this.launchButton.style.color = '#fff';
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
                0%, 100% { transform: translateX(-50%) skew(0deg); }
                20% { transform: translateX(-50%) skew(-1deg); }
                40% { transform: translateX(-50%) skew(1deg); }
                60% { transform: translateX(-50%) skew(-1deg); }
                80% { transform: translateX(-50%) skew(1deg); }
            }
        `;
        document.head.appendChild(style);

        // Assemble the elements
        this.container.appendChild(colorBars);
        this.container.appendChild(iqSection);
        this.container.appendChild(plugeSection);
        this.container.appendChild(this.technicalInfo);
        this.container.appendChild(glitchLogo);
        this.container.appendChild(this.launchButton);
        this.container.appendChild(scanlines);
        crtContainer.appendChild(this.container);

        // Start the countdown
        this.startCountdown();
    }

    async startCountdown() {
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.systemStatus = "INITIALIZED";
        // Update the technical info with new status
        const browserInfo = this.getBrowserInfo();
        const gpuInfo = this.getGPUInfo();
        const screenInfo = this.getScreenInfo();
        const audioInfo = this.getAudioInfo();
        await this.updateTechnicalInfo(browserInfo, gpuInfo, screenInfo, audioInfo);
        
        this.launchButton.style.display = 'block';
        setTimeout(() => {
            this.launchButton.style.opacity = '1';
        }, 50);
    }

    hide() {
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
        return {
            renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
            vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown'
        };
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
        const cursor = '█';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (let j = 0; j < line.length; j++) {
                fullText += line[j];
                this.technicalInfo.innerHTML = (fullText + cursor).split('\n').join('<br>');
                // Random typing speed between 30-70ms
                await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
            }
            if (i < lines.length - 1) {
                fullText += '\n';
                this.technicalInfo.innerHTML = (fullText + cursor).split('\n').join('<br>');
                // Longer pause at end of line
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        return fullText;
    }

    async updateTechnicalInfo(browserInfo, gpuInfo, screenInfo, audioInfo) {
        const memoryInfo = performance?.memory ? 
            `MEMORY: ${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB / ${Math.round(performance.memory.jsHeapSizeLimit / 1048576)}MB` :
            'MEMORY: NOT AVAILABLE';

        const canvasWidth = this.canvas?.width || window.innerWidth;
        const canvasHeight = this.canvas?.height || window.innerHeight;

        const text = `
            SMPTE COLOR BARS
            PIRATE MIND STATION TEST PATTERN
            PLEASE STAND BY...
            
            SYSTEM STATUS: ${this.systemStatus}
            
            BROWSER: ${browserInfo.name} ${browserInfo.version}
            PLATFORM: ${browserInfo.platform}
            CPU CORES: ${browserInfo.cores}
            ${memoryInfo}
            
            GPU VENDOR: ${gpuInfo.vendor}
            GPU RENDERER: ${gpuInfo.renderer}
            
            DISPLAY: ${screenInfo.width}x${screenInfo.height}
            COLOR DEPTH: ${screenInfo.colorDepth}-bit
            PIXEL RATIO: ${screenInfo.pixelRatio}x
            
            AUDIO SAMPLE RATE: ${audioInfo.sampleRate}
            AUDIO CHANNELS: ${audioInfo.maxChannels}
            AUDIO STATE: ${audioInfo.state}
            
            COLOR BAR SIGNAL: ACTIVE
            FREQUENCY: 60Hz
            RESOLUTION: ${canvasWidth}x${canvasHeight}
        `;

        // Clear existing content
        this.technicalInfo.innerHTML = '';
        
        // Type out the text
        await this.typeText(text);
    }
} 