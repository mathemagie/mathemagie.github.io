// Vertex shader for particle rendering
attribute vec2 a_position;
attribute float a_life;
attribute float a_size;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_overall;

varying float v_life;
varying float v_size;

void main() {
    // Convert position from pixels to clip space
    vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
    
    // Apply size based on particle life
    float size = a_size * (0.5 + a_life * 0.5);
    
    gl_Position = vec4(clipSpace, 0.0, 1.0);
    gl_PointSize = size * (10.0 + u_overall * 20.0);
    
    v_life = a_life;
    v_size = size;
}

