const canvas = document.getElementById('demoCanvas');
const gl = canvas.getContext('webgl');

// Resize canvas to full window size
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

// Shader for plasma effect
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
        
        // Create plasma effect
        float v1 = sin(uv.x * 10.0 + time);
        float v2 = sin(uv.y * 10.0 + time);
        float v3 = sin(uv.x * 10.0 + uv.y * 10.0 + time);
        float v = v1 + v2 + v3;
        
        // Color palette inspired by Amiga
        vec3 color1 = vec3(0.5, 0.0, 0.5);  // Purple
        vec3 color2 = vec3(0.0, 0.7, 0.7);  // Cyan
        vec3 finalColor = mix(color1, color2, v * 0.5 + 0.5);
        
        // Add scanline effect
        float scanline = sin(gl_FragCoord.y * 0.7) * 0.15;
        finalColor = finalColor * (0.85 + scanline);
        
        // Add slight vignette effect
        float vignette = length(vec2(0.5, 0.5) - uv) * 0.5;
        finalColor = finalColor * (1.0 - vignette);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// Create shader program
function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const program = gl.createProgram();
gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShader));
gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentShader));
gl.linkProgram(program);
gl.useProgram(program);

// Create a square to render on
const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
]);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

// Set up attributes and uniforms
const positionLocation = gl.getAttribLocation(program, 'position');
const timeLocation = gl.getUniformLocation(program, 'time');
const resolutionLocation = gl.getUniformLocation(program, 'resolution');

gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Animation loop
function render(time) {
    time *= 0.001; // Convert to seconds
    
    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

// Add some scrolling text animation
const demoText = document.getElementById('demoText');
const text = demoText.textContent;
demoText.textContent = ''; // Clear original text

// Create spans for each character
text.split('').forEach((char) => {
    const span = document.createElement('span');
    span.textContent = char;
    demoText.appendChild(span);
});

let textPos = window.innerWidth;

function animateText(timestamp) {
    textPos -= 2;
    if (textPos < -(text.length * 30)) { // Adjust based on character width
        textPos = window.innerWidth;
    }

    // Animate each character
    Array.from(demoText.children).forEach((span, index) => {
        // Offset each character's sine wave slightly
        const offset = index * 30; // Horizontal spacing between characters
        const xPos = textPos + offset;
        const sineWave = Math.sin((timestamp * 0.003) + (index * 0.2)) * 50;
        
        span.style.transform = `translate(${xPos}px, ${sineWave}px)`;
    });

    requestAnimationFrame(animateText);
}

requestAnimationFrame(animateText);

// Add this music code
const player = new ModPlayer();

// Some classic mod files that are known to work with this player
const modUrls = [
    'https://modarchive.org/index.php?request=view_by_moduleid&query=49735', // "Lotus II"
    'https://modarchive.org/index.php?request=view_by_moduleid&query=59344'  // "Space Debris"
];

// Initialize and play music
async function initMusic() {
    try {
        await player.load(modUrls[0]);
        
        // Add click handler to start music (browser requirement)
        window.addEventListener('click', () => {
            if (!player.isPlaying) {
                player.play();
                console.log('Music started!');
            }
        }, { once: true });
        
    } catch (error) {
        console.error('Error loading music:', error);
    }
}
                                      
initMusic(); 