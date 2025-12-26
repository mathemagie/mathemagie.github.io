const rainContainer = document.getElementById('rain-container');
const deflectorContainer = document.getElementById('deflector-container');
const piano = document.getElementById('piano');
const keys = document.querySelectorAll('.white-key, .black-key');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const rectangles = [];
let rectangleIdCounter = 0;
let draggedRectangle = null;
let resizingRectangle = null;
let resizeEdge = null; // 'left' or 'right'
let contextMenuRectangle = null; // Rectangle for context menu

const activeRaindrops = new Map();
const physicsRaindrops = [];
let lastPhysicsTime = performance.now();

const noteFrequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
    'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
    'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
    'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77, 'C6': 1046.50
};

function playNote(frequency) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function createSplash(x, y) {
    const splash = document.createElement('div');
    splash.className = 'splash';
    splash.style.left = x + 'px';
    splash.style.top = y + 'px';
    rainContainer.appendChild(splash);

    setTimeout(() => {
        splash.remove();
    }, 300);
}

function getKeyBounds(key) {
    const rect = key.getBoundingClientRect();
    return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
    };
}

function checkCollision(raindrop, key) {
    const dropRect = raindrop.getBoundingClientRect();
    const keyBounds = getKeyBounds(key);

    const dropBottom = dropRect.bottom;
    const dropLeft = dropRect.left + dropRect.width / 2;

    return (
        dropBottom >= keyBounds.top &&
        dropBottom <= keyBounds.bottom &&
        dropLeft >= keyBounds.left &&
        dropLeft <= keyBounds.right
    );
}

function activateKey(key) {
    key.classList.add('active');
    setTimeout(() => {
        key.classList.remove('active');
    }, 200);
}

function updateRectangleSize(rect) {
    rect.element.style.width = rect.width + 'px';
}

function isNearEdge(mouseX, mouseY, rect) {
    const rectElement = rect.element;
    const rectBounds = rectElement.getBoundingClientRect();
    
    // Convert mouse position to local coordinates (accounting for rotation)
    const centerX = rectBounds.left + rectBounds.width / 2;
    const centerY = rectBounds.top + rectBounds.height / 2;
    
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    
    const angleRad = -rect.rotation * (Math.PI / 180);
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);
    
    // Transform to local coordinates (aligned with rectangle)
    const localX = dx * cosAngle - dy * sinAngle;
    const localY = dx * sinAngle + dy * cosAngle;
    
    const halfWidth = rect.width / 2;
    const edgeThreshold = 15; // Distance from edge to trigger resize
    
    // Check if mouse is near left edge
    if (Math.abs(localX + halfWidth) < edgeThreshold && Math.abs(localY) < rect.height / 2 + 10) {
        return 'left';
    }
    
    // Check if mouse is near right edge
    if (Math.abs(localX - halfWidth) < edgeThreshold && Math.abs(localY) < rect.height / 2 + 10) {
        return 'right';
    }
    
    return null;
}

function createRectangle(x, y) {
    const rect = {
        id: rectangleIdCounter++,
        element: document.createElement('div'),
        x: x,
        y: y,
        width: 150,
        height: 10,
        rotation: 0,
        isDragging: false,
        isResizing: false,
        isMoving: false
    };

    rect.element.className = 'deflector';
    rect.element.style.left = x + 'px';
    rect.element.style.top = y + 'px';
    rect.element.style.width = rect.width + 'px';
    rect.element.style.transform = 'translate(-50%, -50%) rotate(0deg)';

    rect.element.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            e.preventDefault();
            e.stopPropagation();
            
            const edge = isNearEdge(e.clientX, e.clientY, rect);
            
            if (edge) {
                // Start resizing
                resizingRectangle = rect;
                resizeEdge = edge;
                rect.isResizing = true;
                rect.element.classList.add('resizing');
                rect.startMouseX = e.clientX;
                rect.startMouseY = e.clientY;
                rect.startWidth = rect.width;
            } else {
                // Start dragging (rotation or movement based on Shift key)
                draggedRectangle = rect;
                rect.isDragging = true;
                rect.isMoving = e.shiftKey; // If Shift is held, move instead of rotate
                rect.startMouseX = e.clientX;
                rect.startMouseY = e.clientY;
                rect.startX = rect.x;
                rect.startY = rect.y;
                rect.element.classList.add('dragging');
                if (rect.isMoving) {
                    rect.element.classList.add('moving');
                }
            }
        }
    });

    rect.element.addEventListener('mousemove', (e) => {
        if (!rect.isResizing && !rect.isDragging) {
            const edge = isNearEdge(e.clientX, e.clientY, rect);
            if (edge) {
                rect.element.style.cursor = 'ew-resize';
            } else {
                rect.element.style.cursor = 'move';
            }
        }
    });

    rect.element.addEventListener('mouseleave', () => {
        if (!rect.isResizing && !rect.isDragging) {
            rect.element.style.cursor = 'move';
        }
    });

    rect.element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, rect);
    });

    rectangles.push(rect);
    deflectorContainer.appendChild(rect.element);
}

function removeRectangle(rect) {
    const index = rectangles.indexOf(rect);
    if (index > -1) {
        rectangles.splice(index, 1);
    }
    rect.element.remove();
    hideContextMenu();
}

function showContextMenu(x, y, rect) {
    const contextMenu = document.getElementById('context-menu');
    contextMenuRectangle = rect;
    
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
}

function hideContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.display = 'none';
    contextMenuRectangle = null;
}

// Initialize context menu handlers
function initContextMenu() {
    const removeMenuItem = document.getElementById('remove-rectangle');
    if (removeMenuItem) {
        removeMenuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            if (contextMenuRectangle) {
                removeRectangle(contextMenuRectangle);
            }
        });
    }
}

// Hide context menu when clicking elsewhere
document.addEventListener('click', (e) => {
    const contextMenu = document.getElementById('context-menu');
    // Don't hide if clicking on the context menu itself
    if (contextMenu && contextMenu.style.display === 'block' && !contextMenu.contains(e.target)) {
        hideContextMenu();
    }
});

// Hide context menu on scroll
document.addEventListener('scroll', hideContextMenu);

document.addEventListener('mousemove', (e) => {
    if (resizingRectangle && resizingRectangle.isResizing) {
        // Calculate distance moved along the rectangle's width direction
        const rect = resizingRectangle;
        const angleRad = rect.rotation * (Math.PI / 180);
        const cosAngle = Math.cos(angleRad);
        const sinAngle = Math.sin(angleRad);
        
        // Calculate mouse movement in screen coordinates
        const deltaX = e.clientX - rect.startMouseX;
        const deltaY = e.clientY - rect.startMouseY;
        
        // Project movement onto rectangle's local X axis (width direction)
        // The rectangle's width axis is rotated by rect.rotation degrees
        // cos(angle) for X component, sin(angle) for Y component
        const localDelta = deltaX * cosAngle + deltaY * sinAngle;
        
        // Calculate new width based on which edge is being dragged
        let newWidth = rect.startWidth;
        if (resizeEdge === 'right') {
            newWidth = rect.startWidth + localDelta * 2;
        } else if (resizeEdge === 'left') {
            newWidth = rect.startWidth - localDelta * 2;
        }
        
        // Constrain minimum width
        newWidth = Math.max(50, newWidth);
        
        rect.width = newWidth;
        updateRectangleSize(rect);
    } else if (draggedRectangle && draggedRectangle.isDragging) {
        if (draggedRectangle.isMoving) {
            // Move the rectangle
            const deltaX = e.clientX - draggedRectangle.startMouseX;
            const deltaY = e.clientY - draggedRectangle.startMouseY;
            
            draggedRectangle.x = draggedRectangle.startX + deltaX;
            draggedRectangle.y = draggedRectangle.startY + deltaY;
            
            draggedRectangle.element.style.left = draggedRectangle.x + 'px';
            draggedRectangle.element.style.top = draggedRectangle.y + 'px';
            // Keep the rotation when moving
            draggedRectangle.element.style.transform =
                `translate(-50%, -50%) rotate(${draggedRectangle.rotation}deg)`;
        } else {
            // Rotate the rectangle
            const dx = e.clientX - draggedRectangle.x;
            const dy = e.clientY - draggedRectangle.y;

            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            draggedRectangle.rotation = angle;

            draggedRectangle.element.style.transform =
                `translate(-50%, -50%) rotate(${angle}deg)`;
        }
    }
});

document.addEventListener('mouseup', () => {
    if (resizingRectangle) {
        resizingRectangle.isResizing = false;
        resizingRectangle.element.classList.remove('resizing');
        resizingRectangle.element.style.cursor = 'move';
        resizingRectangle = null;
        resizeEdge = null;
    }
    if (draggedRectangle) {
        draggedRectangle.isDragging = false;
        draggedRectangle.isMoving = false;
        draggedRectangle.element.classList.remove('dragging');
        draggedRectangle.element.classList.remove('moving');
        draggedRectangle = null;
    }
});

document.addEventListener('click', (e) => {
    if (e.target.closest('#piano') || e.target.closest('.deflector')) {
        return;
    }

    const pianoRect = piano.getBoundingClientRect();
    if (e.clientY >= pianoRect.top) {
        return;
    }

    createRectangle(e.clientX, e.clientY);
});

function checkRectangleCollision(raindrop, rectangle) {
    const dropRect = raindrop.getBoundingClientRect();
    const dropX = dropRect.left + dropRect.width / 2;
    const dropY = dropRect.bottom;

    const dx = dropX - rectangle.x;
    const dy = dropY - rectangle.y;

    const angleRad = -rectangle.rotation * (Math.PI / 180);
    const localX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
    const localY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

    const halfWidth = rectangle.width / 2 + 5;
    const halfHeight = rectangle.height / 2 + 10;

    const hit = Math.abs(localX) <= halfWidth &&
                Math.abs(localY) <= halfHeight;

    if (hit) {
        const normalAngle = rectangle.rotation * (Math.PI / 180);
        return {
            hit: true,
            normalX: -Math.sin(normalAngle),
            normalY: Math.cos(normalAngle)
        };
    }

    return { hit: false };
}

function checkRectangleCollisionPhysics(drop, rectangle) {
    const currentX = drop.x;
    const currentY = drop.y;

    const dx = currentX - rectangle.x;
    const dy = currentY - rectangle.y;

    const angleRad = -rectangle.rotation * (Math.PI / 180);
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);

    const localX = dx * cosAngle - dy * sinAngle;
    const localY = dx * sinAngle + dy * cosAngle;

    const halfWidth = rectangle.width / 2 + 5;
    const halfHeight = rectangle.height / 2 + 10;

    const isInside = Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight;

    if (isInside) {
        const normalAngle = rectangle.rotation * (Math.PI / 180);
        const normalX = -Math.sin(normalAngle);
        const normalY = Math.cos(normalAngle);

        const vx = drop.velocityX;
        const vy = drop.velocityY;
        const dotProduct = vx * normalX + vy * normalY;

        if (dotProduct < 0) {
            const separationDepth = 15;
            const separationX = normalX * separationDepth;
            const separationY = normalY * separationDepth;

            return {
                hit: true,
                normalX: normalX,
                normalY: normalY,
                separationX: separationX,
                separationY: separationY
            };
        }
    }

    return { hit: false };
}

function calculateReflection(vx, vy, normalX, normalY) {
    const dotProduct = vx * normalX + vy * normalY;
    const reflectedVX = vx - 2 * dotProduct * normalX;
    const reflectedVY = vy - 2 * dotProduct * normalY;

    const damping = 0.9;
    return {
        vx: reflectedVX * damping,
        vy: reflectedVY * damping
    };
}

function convertToPhysicsRaindrop(raindrop, velocityX, velocityY) {
    const rect = raindrop.getBoundingClientRect();

    const x = rect.left + rect.width / 2;
    const y = rect.bottom;

    const physicsDrop = {
        element: raindrop,
        x: x,
        y: y,
        prevX: x,
        prevY: y - 5,
        velocityX: velocityX,
        velocityY: velocityY,
        bounceCount: 0,
        lastBounceTime: 0,
        lastBouncedRectId: -1
    };

    raindrop.classList.add('physics');
    raindrop.style.animation = 'none';

    physicsRaindrops.push(physicsDrop);
    activeRaindrops.delete(raindrop);

    return physicsDrop;
}

function checkPianoCollisionPhysics(drop, key) {
    const keyBounds = getKeyBounds(key);
    return (
        drop.y >= keyBounds.top &&
        drop.y <= keyBounds.bottom &&
        drop.x >= keyBounds.left &&
        drop.x <= keyBounds.right
    );
}

function updatePhysics(currentTime) {
    const deltaTime = Math.min((currentTime - lastPhysicsTime) / 1000, 0.1);
    lastPhysicsTime = currentTime;

    for (let i = physicsRaindrops.length - 1; i >= 0; i--) {
        const drop = physicsRaindrops[i];

        drop.prevX = drop.x;
        drop.prevY = drop.y;

        drop.velocityY += 980 * deltaTime;

        drop.x += drop.velocityX * deltaTime;
        drop.y += drop.velocityY * deltaTime;

        let hasCollided = false;
        const COOLDOWN_TIME = 0.05;

        if (drop.bounceCount < 5) {
            for (let rect of rectangles) {
                const timeSinceLastBounce = (currentTime - drop.lastBounceTime) / 1000;

                if (rect.id === drop.lastBouncedRectId && timeSinceLastBounce < COOLDOWN_TIME) {
                    continue;
                }

                const collision = checkRectangleCollisionPhysics(drop, rect);

                if (collision.hit) {
                    const reflected = calculateReflection(
                        drop.velocityX,
                        drop.velocityY,
                        collision.normalX,
                        collision.normalY
                    );

                    drop.velocityX = reflected.vx;
                    drop.velocityY = reflected.vy;
                    drop.bounceCount++;
                    drop.lastBounceTime = currentTime;
                    drop.lastBouncedRectId = rect.id;

                    drop.x += collision.separationX;
                    drop.y += collision.separationY;
                    drop.prevX = drop.x;
                    drop.prevY = drop.y;

                    rect.element.classList.add('hit');
                    setTimeout(() => rect.element.classList.remove('hit'), 200);

                    hasCollided = true;
                    break;
                }
            }
        }

        drop.element.style.left = drop.x + 'px';
        drop.element.style.top = drop.y + 'px';

        if (!hasCollided) {
            for (let key of keys) {
                if (checkPianoCollisionPhysics(drop, key)) {
                    const note = key.getAttribute('data-note');
                    const frequency = noteFrequencies[note];
                    playNote(frequency);
                    activateKey(key);
                    createSplash(drop.x, drop.y);

                    drop.element.remove();
                    physicsRaindrops.splice(i, 1);
                    hasCollided = true;
                    break;
                }
            }
        }

        if (drop.y > window.innerHeight + 50 ||
            drop.x < -50 ||
            drop.x > window.innerWidth + 50) {
            drop.element.remove();
            physicsRaindrops.splice(i, 1);
        }
    }

    requestAnimationFrame(updatePhysics);
}

requestAnimationFrame(updatePhysics);

function createRaindrop() {
    const raindrop = document.createElement('div');
    raindrop.className = 'raindrop';

    const startX = Math.random() * window.innerWidth;
    raindrop.style.left = startX + 'px';
    raindrop.style.top = '-20px';

    const duration = 1.5 + Math.random() * 1;
    raindrop.style.animationDuration = duration + 's';

    rainContainer.appendChild(raindrop);

    const dropData = {
        duration: duration,
        velocityY: (window.innerHeight + 20) / duration
    };
    activeRaindrops.set(raindrop, dropData);

    let hasHitKey = false;

    const checkInterval = setInterval(() => {
        if (hasHitKey) {
            clearInterval(checkInterval);
            return;
        }

        for (let rect of rectangles) {
            const collision = checkRectangleCollision(raindrop, rect);
            if (collision.hit) {
                hasHitKey = true;

                const dropData = activeRaindrops.get(raindrop);

                const reflected = calculateReflection(
                    0,
                    dropData.velocityY,
                    collision.normalX,
                    collision.normalY
                );

                const physicsDrop = convertToPhysicsRaindrop(
                    raindrop,
                    reflected.vx,
                    reflected.vy
                );

                const separationDepth = 15;
                physicsDrop.x += collision.normalX * separationDepth;
                physicsDrop.y += collision.normalY * separationDepth;
                physicsDrop.prevX = physicsDrop.x;
                physicsDrop.prevY = physicsDrop.y;
                physicsDrop.bounceCount = 1;
                physicsDrop.lastBounceTime = performance.now();
                physicsDrop.lastBouncedRectId = rect.id;

                rect.element.classList.add('hit');
                setTimeout(() => rect.element.classList.remove('hit'), 200);

                clearInterval(checkInterval);
                return;
            }
        }

        for (let key of keys) {
            if (checkCollision(raindrop, key)) {
                hasHitKey = true;

                const note = key.getAttribute('data-note');
                const frequency = noteFrequencies[note];
                playNote(frequency);

                activateKey(key);

                const dropRect = raindrop.getBoundingClientRect();
                createSplash(dropRect.left, dropRect.bottom);

                raindrop.remove();
                activeRaindrops.delete(raindrop);
                clearInterval(checkInterval);
                break;
            }
        }
    }, 16);

    setTimeout(() => {
        if (!hasHitKey) {
            raindrop.remove();
            activeRaindrops.delete(raindrop);
        }
        clearInterval(checkInterval);
    }, duration * 1000);
}

setInterval(createRaindrop, 50);

keys.forEach(key => {
    key.addEventListener('click', () => {
        const note = key.getAttribute('data-note');
        const frequency = noteFrequencies[note];
        playNote(frequency);
        activateKey(key);
    });
});

// Initialize context menu
initContextMenu();
