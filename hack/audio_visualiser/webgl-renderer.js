// WebGL Renderer for particle systems
// Provides GPU-accelerated rendering for starfield and particle explosion animations

function WebGLRenderer(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.program = null;
    this.particles = [];
    this.initialized = false;
    
    // Shader sources
    this.vertexShaderSource = `
        attribute vec2 a_position;
        attribute float a_life;
        attribute float a_size;
        
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_overall;
        
        varying float v_life;
        varying float v_size;
        
        void main() {
            vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
            float size = a_size * (0.5 + a_life * 0.5);
            
            gl_Position = vec4(clipSpace, 0.0, 1.0);
            gl_PointSize = size * (10.0 + u_overall * 20.0);
            
            v_life = a_life;
            v_size = size;
        }
    `;
    
    this.fragmentShaderSource = `
        precision mediump float;
        
        uniform vec3 u_color;
        uniform float u_time;
        
        varying float v_life;
        varying float v_size;
        
        void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            
            float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
            alpha *= v_life;
            
            float pulse = sin(u_time * 2.0) * 0.1 + 0.9;
            alpha *= pulse;
            
            gl_FragColor = vec4(u_color, alpha);
        }
    `;
    
    this.init();
}

WebGLRenderer.prototype.init = function() {
    // Get WebGL context
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
        console.warn('WebGL not available');
        return false;
    }
    
    // Create shaders
    var vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.vertexShaderSource);
    var fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) {
        return false;
    }
    
    // Create program
    this.program = this.createProgram(vertexShader, fragmentShader);
    if (!this.program) {
        return false;
    }
    
    // Set up WebGL state
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(0, 0, 0, 0);
    
    this.initialized = true;
    return true;
};

WebGLRenderer.prototype.createShader = function(type, source) {
    var shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
        return null;
    }
    
    return shader;
};

WebGLRenderer.prototype.createProgram = function(vertexShader, fragmentShader) {
    var program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.error('Program linking error:', this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
        return null;
    }
    
    return program;
};

WebGLRenderer.prototype.updateParticles = function(particles, audio, WIDTH, HEIGHT) {
    this.particles = particles;
    this.audio = audio;
    this.WIDTH = WIDTH;
    this.HEIGHT = HEIGHT;
};

WebGLRenderer.prototype.render = function(time) {
    if (!this.initialized || !this.gl || this.particles.length === 0) {
        return false;
    }
    
    var gl = this.gl;
    
    // Resize canvas if needed
    if (this.canvas.width !== this.WIDTH || this.canvas.height !== this.HEIGHT) {
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        gl.viewport(0, 0, this.WIDTH, this.HEIGHT);
    }
    
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use program
    gl.useProgram(this.program);
    
    // Prepare particle data
    var positions = [];
    var lives = [];
    var sizes = [];
    
    for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        positions.push(p.x, p.y);
        lives.push(p.life || 1.0);
        sizes.push(p.size || 1.0);
    }
    
    // Create buffers
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
    
    var positionLocation = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    var lifeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lifeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lives), gl.DYNAMIC_DRAW);
    
    var lifeLocation = gl.getAttribLocation(this.program, 'a_life');
    gl.enableVertexAttribArray(lifeLocation);
    gl.vertexAttribPointer(lifeLocation, 1, gl.FLOAT, false, 0, 0);
    
    var sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.DYNAMIC_DRAW);
    
    var sizeLocation = gl.getAttribLocation(this.program, 'a_size');
    gl.enableVertexAttribArray(sizeLocation);
    gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);
    
    // Set uniforms
    var resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
    gl.uniform2f(resolutionLocation, this.WIDTH, this.HEIGHT);
    
    var timeLocation = gl.getUniformLocation(this.program, 'u_time');
    gl.uniform1f(timeLocation, time);
    
    var overallLocation = gl.getUniformLocation(this.program, 'u_overall');
    gl.uniform1f(overallLocation, this.audio ? this.audio.overall : 0.5);
    
    // Get theme color
    var computedStyle = window.getComputedStyle(document.documentElement);
    var textColor = computedStyle.getPropertyValue('--text-color').trim() || '#2a2a2a';
    var rgb = this.hexToRgb(textColor);
    
    var colorLocation = gl.getUniformLocation(this.program, 'u_color');
    gl.uniform3f(colorLocation, rgb.r / 255, rgb.g / 255, rgb.b / 255);
    
    // Draw particles
    gl.drawArrays(gl.POINTS, 0, this.particles.length);
    
    return true;
};

WebGLRenderer.prototype.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 42, g: 42, b: 42 };
};

WebGLRenderer.prototype.isAvailable = function() {
    return this.initialized;
};

