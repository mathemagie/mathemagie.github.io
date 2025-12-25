// Web Worker for offloading grid calculations
// This worker receives audio data and animation parameters, then calculates the grid

// Import animation functions (we'll need to duplicate the logic here)
// For simplicity, we'll include simplified versions of the animation calculations

var WIDTH = 0;
var HEIGHT = 0;
var workerTime = 0; // Use different variable name to avoid conflicts

// Helper functions
function distSquared(dx, dy) {
    return dx * dx + dy * dy;
}

function distance(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
}

// Simplified animation functions (core logic only)
function animateHybrid(audio, grid, cachedValues) {
    var bass = audio.bass;
    var mid = audio.mid;
    var treble = audio.treble;
    var overall = audio.overall;
    var chars = ['#', '+', '*', '.', ':', ';', '=', '-', '_', '|', '/', '\\', '<', '>', '^', 'v', 'o', 'O', '@', '~', '`'];
    var maxDist = cachedValues.maxDist;
    var centerX = cachedValues.centerX;
    var centerY = cachedValues.centerY;
    
    for (var y = 0; y < HEIGHT; y++) {
        for (var x = 0; x < WIDTH; x++) {
            var dx = x - centerX;
            var dy = y - centerY;
            var dist = distance(dx, dy);
            var angle = Math.atan2(dy, dx);
            var normalizedDist = dist / maxDist;
            
            var radialWave1 = Math.sin(dist * 0.15 - workerTime * 2.5 - bass * 6);
            var radialWave2 = Math.sin(dist * 0.25 - workerTime * 1.8 - mid * 4);
            var radialWave3 = Math.sin(dist * 0.35 - workerTime * 1.2 - treble * 3);
            
            var ringRadius1 = (bass * 40 + workerTime * 3) % 60;
            var ringRadius2 = (mid * 35 + workerTime * 2.5) % 55;
            var ringRadius3 = (treble * 30 + workerTime * 2) % 50;
            var ring1 = Math.abs(dist - ringRadius1) < 2.5;
            var ring2 = Math.abs(dist - ringRadius2) < 2;
            var ring3 = Math.abs(dist - ringRadius3) < 1.5;
            
            var numSegments = 6 + Math.floor(bass * 4);
            var segmentAngle = (2 * Math.PI) / numSegments;
            var segmentIndex = Math.floor((angle + Math.PI) / segmentAngle);
            var segmentAngleCenter = segmentIndex * segmentAngle - Math.PI;
            var angleOffset = angle - segmentAngleCenter;
            
            var swirl = Math.sin(dist * 0.2 - angle * 3 + workerTime * 2 + overall * 5);
            var segmentSwirl = Math.abs(angleOffset) < segmentAngle / 2 && swirl > 0.3;
            
            var grain = Math.sin(dist * 0.3 + angle * 2 + workerTime * 1.5) * 
                        Math.cos(dist * 0.2 - angle * 1.5 + workerTime * 1.8);
            var grainyPattern = grain > (0.4 - overall * 0.5);
            
            var pulsePhase = Math.sin(workerTime * 1.5 + overall * 3);
            var pulseDist = dist - (pulsePhase * 15 * overall);
            var pulseWave = Math.sin(pulseDist * 0.2) > 0.5;
            
            var spiral1 = Math.sin(dist * 0.1 - angle * 4 + workerTime * 2 + bass * 4);
            var spiral2 = Math.sin(dist * 0.15 - angle * 6 + workerTime * 1.5 + mid * 3);
            var spiral3 = Math.sin(dist * 0.2 - angle * 8 + workerTime * 1.2 + treble * 2);
            
            var radialPattern1 = radialWave1 > (0.2 - bass * 0.4);
            var radialPattern2 = radialWave2 > (0.1 - mid * 0.3);
            var radialPattern3 = radialWave3 > (0.0 - treble * 0.2);
            
            var threshold = 0.3 + overall * 0.5;
            var random = Math.random();
            var charIndex = Math.floor((normalizedDist + random) * chars.length) % chars.length;
            
            if (ring1 && bass > 0.15) {
                grid[y][x] = chars[Math.floor(bass * chars.length)];
            } else if (ring2 && mid > 0.15) {
                grid[y][x] = chars[Math.floor(mid * chars.length)];
            } else if (ring3 && treble > 0.15) {
                grid[y][x] = chars[Math.floor(treble * chars.length)];
            } else if (segmentSwirl && overall > 0.2 && random > threshold * 0.6) {
                grid[y][x] = chars[charIndex];
            } else if (radialPattern1 && bass > 0.2 && random > threshold * 0.7) {
                grid[y][x] = '#';
            } else if (radialPattern2 && mid > 0.2 && random > threshold * 0.75) {
                grid[y][x] = '+';
            } else if (radialPattern3 && treble > 0.2 && random > threshold * 0.8) {
                grid[y][x] = '.';
            } else if (spiral1 > 0.5 && bass > 0.15) {
                grid[y][x] = '/';
            } else if (spiral2 > 0.5 && mid > 0.15) {
                grid[y][x] = '\\';
            } else if (spiral3 > 0.5 && treble > 0.15) {
                grid[y][x] = '|';
            } else if (pulseWave && overall > 0.25 && random > threshold * 0.65) {
                grid[y][x] = chars[charIndex];
            } else if (grainyPattern && overall > 0.15 && random > threshold * 0.9) {
                grid[y][x] = ':';
            } else if (random > 0.88 + overall * 0.12) {
                if (dist < 25 + overall * 20) {
                    grid[y][x] = '.';
                }
            }
        }
    }
}

// Animation registry for worker
var animationRegistry = {
    'hybrid': animateHybrid
    // Note: For full implementation, all animation functions would be here
    // For now, we'll use a simplified version that falls back to main thread
};

// Message handler
self.onmessage = function(e) {
    var data = e.data;
    
    if (data.type === 'init') {
        WIDTH = data.WIDTH || 0;
        HEIGHT = data.HEIGHT || 0;
        workerTime = data.time || 0;
    } else if (data.type === 'update') {
        WIDTH = data.WIDTH || 0;
        HEIGHT = data.HEIGHT || 0;
        workerTime = data.time || 0;
        
        // Safety check: ensure valid dimensions
        if (WIDTH <= 0 || HEIGHT <= 0) {
            self.postMessage({ type: 'fallback' });
            return;
        }
        
            // Initialize grid
            var grid = [];
            for (var y = 0; y < HEIGHT; y++) {
                var row = [];
                for (var x = 0; x < WIDTH; x++) {
                    row.push(' ');
                }
                grid.push(row);
            }
            
            // Calculate animation
            var audio = data.audio;
            var style = data.style || 'hybrid';
            var cachedValues = data.cachedValues || { centerX: WIDTH/2, centerY: HEIGHT/2, maxDist: Math.sqrt(WIDTH*WIDTH + HEIGHT*HEIGHT) };
            
            var animationFn = animationRegistry[style];
            if (animationFn) {
                try {
                    animationFn(audio, grid, cachedValues);
                    // Verify grid structure before sending
                    if (grid && grid.length === HEIGHT && grid[0] && grid[0].length === WIDTH) {
                        // Send grid back to main thread
                        self.postMessage({ type: 'grid', grid: grid });
                    } else {
                        // Grid structure invalid, fallback to main thread
                        self.postMessage({ type: 'fallback' });
                    }
                } catch (e) {
                    console.error('Worker animation error:', e);
                    self.postMessage({ type: 'fallback' });
                }
            } else {
                // Fallback: signal main thread to calculate
                self.postMessage({ type: 'fallback' });
            }
    }
};

