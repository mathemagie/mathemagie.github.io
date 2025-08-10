// Particle system for ISS Radio application
class Particle {
  constructor(x, y, isIss) {
    this.pos = createVector(x, y);
    this.originalPos = createVector(x, y); // Store original continent position
    this.isIss = isIss;
    this.isMoving = isIss; // Only ISS moves initially
    this.vel = createVector(0, 0);
    this.isResetting = false; // Track if particle is resetting to original position
    this.resetProgress = 0; // Progress of reset animation (0-1)
    this.baseRadius = this.isIss ? 40 : random(10, 30); // Store base radius for size animation
    if (this.isIss) {
      this.target = createVector(x, y);
      this.vel = p5.Vector.random2D().mult(random(1, 3));
    }
    this.r = this.baseRadius;
    this.m = this.r * 0.1;
    this.color = this.isIss ? color(255, 0, 0) : color(random(255), random(255), random(255));
  }

  collides(other) {
    const d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
    const minDist = this.r + other.r;

    if (d < minDist && d > 0) {
      // Special handling for ISS collisions - trigger bubble reset effect
      if ((this.isIss && !other.isIss && !other.isResetting) ||
          (!this.isIss && other.isIss && !this.isResetting)) {
        const regularParticle = this.isIss ? other : this;
        // Start the bubble reset animation
        regularParticle.startReset();
        return; // Skip normal collision physics for ISS collisions
      }

      // Normal collision physics for non-ISS particle interactions
      if (!this.isIss && !other.isIss) {
        // If one of the colliding particles is moving, the other one starts moving too.
        if (this.isMoving || other.isMoving) {
          this.isMoving = true;
          other.isMoving = true;
        }

        // Separate overlapping particles smoothly
        const overlap = minDist - d;
        const separationX = (other.pos.x - this.pos.x) / d * overlap * 0.5;
        const separationY = (other.pos.y - this.pos.y) / d * overlap * 0.5;

        this.pos.x -= separationX;
        this.pos.y -= separationY;
        other.pos.x += separationX;
        other.pos.y += separationY;

        // Calculate realistic elastic collision using conservation of momentum
        let dx = other.pos.x - this.pos.x;
        let dy = other.pos.y - this.pos.y;
        const distance = sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          // Normalize collision vector
          dx /= distance;
          dy /= distance;

          // Relative velocity in collision normal direction
          const relativeVelX = other.vel.x - this.vel.x;
          const relativeVelY = other.vel.y - this.vel.y;
          const speed = relativeVelX * dx + relativeVelY * dy;

          // Do not resolve if velocities are separating
          if (speed > 0) {return;}

          // Collision impulse with damping for smoothness
          const restitution = 0.8; // Bouncy but not perfectly elastic
          const impulse = 2 * speed * restitution / (this.m + other.m);

          this.vel.x += impulse * other.m * dx;
          this.vel.y += impulse * other.m * dy;
          other.vel.x -= impulse * this.m * dx;
          other.vel.y -= impulse * this.m * dy;
        }
      }
    }
  }

  startReset() {
    if (!this.isIss && !this.isResetting) {
      this.isResetting = true;
      this.resetProgress = 0;
      this.isMoving = false; // Stop normal movement
      this.vel.mult(0); // Stop velocity
    }
  }

  update() {
    if (this.isIss) {
      // Handle ISS horizontal wrapping at world edges
      const target = this.target.copy();
      const pos = this.pos.copy();

      // Calculate shortest path considering wrapping
      const directDistance = Math.abs(target.x - pos.x);
      const wrapDistance = width - directDistance;

      if (wrapDistance < directDistance) {
        // Wrapping is shorter, adjust target
        if (target.x > pos.x) {
          target.x -= width;
        } else {
          target.x += width;
        }
      }

      const desired = p5.Vector.sub(target, pos);
      desired.setMag(2);
      const steer = p5.Vector.sub(desired, this.vel);
      steer.limit(0.1);
      this.vel.add(steer);
      this.pos.add(this.vel);

      // Apply horizontal wrapping for ISS (longitude wrapping)
      this.pos.x = ((this.pos.x % width) + width) % width;
      this.pos.y = constrain(this.pos.y, 0, height);

      return; // Skip normal position update for ISS
    } else if (this.isResetting) {
      // Handle bubble reset animation
      this.resetProgress += 0.025; // Slightly faster animation speed

      // Smooth easing function (ease-out cubic) for natural water movement
      const easeProgress = 1 - Math.pow(1 - this.resetProgress, 3);

      // Interpolate position back to original with water-like flow
      const lerpAmount = map(easeProgress, 0, 1, 0.05, 0.15); // Accelerating return
      this.pos.x = lerp(this.pos.x, this.originalPos.x, lerpAmount);
      this.pos.y = lerp(this.pos.y, this.originalPos.y, lerpAmount);

      // Create soap bubble effect with gentle pulsing
      const pulsePhase = this.resetProgress * Math.PI * 3; // Fewer, smoother pulses
      const sizeMultiplier = 1 + sin(pulsePhase) * 0.2 * (1 - easeProgress * 0.5); // Gentler pulsing that fades
      this.r = this.baseRadius * sizeMultiplier;

      // Complete reset when close enough to original position or animation complete
      const distanceToOriginal = dist(this.pos.x, this.pos.y, this.originalPos.x, this.originalPos.y);
      if (this.resetProgress >= 1 || distanceToOriginal < 3) {
        this.pos.set(this.originalPos);
        this.isResetting = false;
        this.resetProgress = 0;
        this.r = this.baseRadius; // Reset to normal size
      }
    } else if (this.isMoving) {
      // Add subtle attraction to nearest continent point for non-ISS particles
      const closestPoint = this.findClosestContinentPoint();
      if (closestPoint) {
        const distance = dist(this.pos.x, this.pos.y, closestPoint.x, closestPoint.y);
        if (distance > 100) { // Only apply attraction when far from continents
          const attract = p5.Vector.sub(createVector(closestPoint.x, closestPoint.y), this.pos);
          attract.setMag(0.02); // Very gentle attraction
          this.vel.add(attract);
        }
      }
    }

    if (this.isMoving && !this.isResetting && !this.isIss) {
      this.pos.add(this.vel);

      // Bounce off edges for moving non-ISS particles
      if (this.pos.x < this.r || this.pos.x > width - this.r) {
        this.vel.x *= -1;
        this.pos.x = constrain(this.pos.x, this.r, width - this.r);
      }
      if (this.pos.y < this.r || this.pos.y > height - this.r) {
        this.vel.y *= -1;
        this.pos.y = constrain(this.pos.y, this.r, height - this.r);
      }
    }
  }

  findClosestContinentPoint() {
    if (window.continentPoints.length === 0) {return null;}

    let closest = window.continentPoints[0];
    let minDist = dist(this.pos.x, this.pos.y, closest.x, closest.y);

    for (const point of window.continentPoints) {
      const d = dist(this.pos.x, this.pos.y, point.x, point.y);
      if (d < minDist) {
        minDist = d;
        closest = point;
      }
    }

    return closest;
  }

  show() {
    noStroke();

    if (this.isResetting) {
      // Create water/soap bubble effect with dynamic transparency
      const fadeInOut = sin(this.resetProgress * Math.PI); // Fade in then out
      const alpha = map(fadeInOut, 0, 1, 150, 220); // More subtle transparency range

      // Outer bubble rim effect - more pronounced during reset
      stroke(red(this.color), green(this.color), blue(this.color), alpha * 0.6);
      strokeWeight(map(this.resetProgress, 0, 1, 3, 1)); // Thicker rim at start
      noFill();
      ellipse(this.pos.x, this.pos.y, this.r * 2 + 6);

      // Main bubble body with gradient-like effect
      noStroke();
      fill(red(this.color), green(this.color), blue(this.color), alpha);
      ellipse(this.pos.x, this.pos.y, this.r * 2);

      // Inner highlight for realistic soap bubble shimmer
      const highlightAlpha = alpha * 0.4;
      fill(255, 255, 255, highlightAlpha);
      ellipse(this.pos.x - this.r * 0.2, this.pos.y - this.r * 0.2, this.r * 0.4);

      // Secondary smaller highlight for more realism
      fill(255, 255, 255, highlightAlpha * 0.7);
      ellipse(this.pos.x + this.r * 0.3, this.pos.y + this.r * 0.1, this.r * 0.2);
    } else if (this.isIss) {
      // Heartbeat visual for ISS (double-beat pulse)
      const periodMs = 1100;
      const t = (millis() % periodMs) / periodMs;
      const pulse1 = Math.exp(-Math.pow((t - 0.06) / 0.06, 2));
      const pulse2 = Math.exp(-Math.pow((t - 0.26) / 0.06, 2));
      let amp = pulse1 + 0.75 * pulse2;

      // Optional audio reactivity: subtly modulate with current audio level
      // Honors prefers-reduced-motion by limiting modulation
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const audioLevel = (window.radioManager && window.radioManager.visualLevel) ? window.radioManager.visualLevel : 0;
      const audioBoost = prefersReduced ? 0 : audioLevel * 0.6; // clamp subtle
      amp = amp * (1 + audioBoost);

      const drawR = this.baseRadius * (1 + 0.22 * amp);

      // Outer glow rings
      const baseAlpha = 180;
      noFill();
      stroke(255, 70, 70, baseAlpha * 0.35 * (0.6 + 0.4 * amp));
      strokeWeight(3);
      ellipse(this.pos.x, this.pos.y, drawR * 2.6);
      stroke(255, 70, 70, baseAlpha * 0.25 * (0.6 + 0.4 * amp));
      strokeWeight(6);
      ellipse(this.pos.x, this.pos.y, drawR * 3.2);

      // Core
      noStroke();
      fill(red(this.color), green(this.color), blue(this.color), 220);
      ellipse(this.pos.x, this.pos.y, drawR * 2);
    } else {
      // Normal particle rendering
      fill(this.color);
      ellipse(this.pos.x, this.pos.y, this.r * 2);
    }
  }
}

// Export for use in main application
window.Particle = Particle;