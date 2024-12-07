import { amigaPalette } from '../utils/amigaPalette.js';

export class PlasmaEffect {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id ${canvasId} not found`);
        }

        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.program = null;
        this.uniforms = {};
        this.opacity = 1.0;
        this.canvas.style.opacity = '1';
        this.canvas.style.transition = 'opacity 2s';
        this.init();
    }

    init() {
        // Resize handling
        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();

        // Initialize WebGL
        this.initShaders();
        this.initBuffers();
        this.initUniforms();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
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
                
                vec3 color1 = vec3(0.5, 0.0, 0.5);
                vec3 color2 = vec3(0.0, 0.7, 0.7);
                vec3 finalColor = mix(color1, color2, v * 0.5 + 0.5);
                
                float scanline = sin(gl_FragCoord.y * 0.7) * 0.15;
                finalColor = finalColor * (0.85 + scanline);
                
                float vignette = length(vec2(0.5, 0.5) - uv) * 0.5;
                finalColor = finalColor * (1.0 - vignette);

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

    fadeOut(duration = 2000) {
        console.log('🟪 Plasma fadeOut called');
        const currentOpacity = this.canvas.style.opacity;
        this.canvas.style.opacity = '0';
        console.log('🟪 Plasma opacity changed from', currentOpacity, 'to', this.canvas.style.opacity);
    }

    fadeIn(duration = 2000) {
        this.canvas.style.opacity = '1';
    }

    render(time) {
        const opacity = parseFloat(this.canvas.style.opacity);
        console.log('🟪 Plasma render:', {
            opacity,
            time,
            visible: opacity > 0
        });
        
        if (opacity > 0) {
            this.gl.uniform1f(this.uniforms.time, time * 0.001);
            this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        }
    }
} 