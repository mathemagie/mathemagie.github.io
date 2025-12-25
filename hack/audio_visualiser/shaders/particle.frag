// Fragment shader for particle rendering
precision mediump float;

uniform vec3 u_color;
uniform float u_time;

varying float v_life;
varying float v_size;

void main() {
    // Create circular particles using distance from center
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    // Fade out at edges
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    
    // Fade based on particle life
    alpha *= v_life;
    
    // Add pulsing effect
    float pulse = sin(u_time * 2.0) * 0.1 + 0.9;
    alpha *= pulse;
    
    gl_FragColor = vec4(u_color, alpha);
}

