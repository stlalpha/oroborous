import { amigaPalette } from '../utils/amigaPalette.js';

export class PlasmaEffect {
    constructor(canvasId) {
        console.log('🎨 Creating Plasma Effect...');
        
        // Main display canvas
        this.displayCanvas = document.getElementById(canvasId);
        if (!this.displayCanvas) {
            console.error('Canvas not found:', canvasId);
            throw new Error(`Canvas with id ${canvasId} not found`);
        }
        
        // Ensure canvas is visible
        this.displayCanvas.style.opacity = '0';
        this.displayCanvas.style.transition = 'opacity 2s ease-in-out';
        
        // Create buffer canvas
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = window.innerWidth;
        this.bufferCanvas.height = window.innerHeight;

        // Set up WebGL on buffer canvas
        this.gl = this.bufferCanvas.getContext('webgl');
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        console.log('✓ WebGL context created');

        // Setup display canvas
        this.displayCtx = this.displayCanvas.getContext('2d');
        this.displayCanvas.style.transition = 'opacity 2s ease-in-out';
        this.displayCanvas.style.opacity = '1';
        
        this.program = null;
        this.uniforms = {};
        this.isRendering = true;  // Set to true by default
        console.log('✓ Display context setup complete');
        
        this.init();
        console.log('✓ Plasma effect initialized');
    }

    init() {
        try {
            // Initialize WebGL
            this.initShaders();
            console.log('✓ Shaders initialized');
            this.initBuffers();
            console.log('✓ Buffers initialized');
            this.initUniforms();
            console.log('✓ Uniforms initialized');
            this.resize = this.resize.bind(this);
            window.addEventListener('resize', this.resize);
            this.resize();
            console.log('✓ Initial resize complete');
        } catch (error) {
            console.error('❌ Error initializing plasma effect:', error);
            throw error;
        }
    }

    resize() {
        const width = this.displayCanvas.offsetWidth;
        const height = this.displayCanvas.offsetHeight;
        
        // Resize both canvases
        this.displayCanvas.width = width;
        this.displayCanvas.height = height;
        this.bufferCanvas.width = width;
        this.bufferCanvas.height = height;
        
        this.gl.viewport(0, 0, width, height);
    }

    initShaders() {
        const vertexShader = `
            attribute vec4 position;
            void main() {
                gl_Position = position;
            }
        `;

        const fragmentShader = `
            precision highp float;
            uniform float time;
            uniform vec2 resolution;

            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                
                float v1 = sin(uv.x * 10.0 + time);
                float v2 = sin(uv.y * 10.0 + time);
                float v3 = sin(uv.x * 10.0 + uv.y * 10.0 + time);
                float v = v1 + v2 + v3;
                
                vec3 color1 = vec3(0.5, 0.0, 0.5);  // Purple
                vec3 color2 = vec3(0.0, 0.7, 0.7);  // Cyan
                vec3 finalColor = mix(color1, color2, v * 0.5 + 0.5);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const createShader = (type, source) => {
            const shader = this.gl.createShader(type);
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                const info = this.gl.getShaderInfoLog(shader);
                throw new Error(`Shader compilation failed: ${info}`);
            }
            return shader;
        };

        this.program = this.gl.createProgram();
        const vertShader = createShader(this.gl.VERTEX_SHADER, vertexShader);
        const fragShader = createShader(this.gl.FRAGMENT_SHADER, fragmentShader);
        
        this.gl.attachShader(this.program, vertShader);
        this.gl.attachShader(this.program, fragShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            const info = this.gl.getProgramInfoLog(this.program);
            throw new Error(`Program linking failed: ${info}`);
        }

        this.gl.useProgram(this.program);
    }

    initBuffers() {
        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]);
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    initUniforms() {
        this.uniforms = {
            time: this.gl.getUniformLocation(this.program, 'time'),
            resolution: this.gl.getUniformLocation(this.program, 'resolution')
        };
    }

    fadeOut() {
        this.displayCanvas.style.opacity = '0';
        setTimeout(() => {
            this.isRendering = false;
        }, 2000);
    }

    fadeIn() {
        console.log('🎨 Fading in plasma effect');
        this.displayCanvas.style.opacity = '1';
        this.isRendering = true;
    }

    render(time) {
        if (!this.isRendering) {
            console.log('⏸️ Plasma rendering paused');
            return;
        }

        try {
            // Render to buffer
            this.gl.uniform1f(this.uniforms.time, time * 0.001);
            this.gl.uniform2f(this.uniforms.resolution, this.bufferCanvas.width, this.bufferCanvas.height);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            
            // Copy to display canvas
            this.displayCtx.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
            this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
        } catch (error) {
            console.error('❌ Error rendering plasma:', error);
            this.isRendering = false;
        }
    }
} 