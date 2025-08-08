/* @vitest-environment jsdom */

import { describe, it, expect, beforeEach } from 'vitest';
import '../js/geography.js';

beforeEach(() => {
  global.width = 1000;
  global.height = 500;
  global.map = (value, inMin, inMax, outMin, outMax) => {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  };
});

function approx(a, b, eps = 1e-6) {
  return Math.abs(a - b) < eps;
}

describe('GeographyManager coordinate conversions', () => {
  it('latLonToXY maps geographic extremes correctly', () => {
    const gm = new window.GeographyManager();

    const topLeft = gm.latLonToXY(90, -180);
    expect(topLeft.x).toBe(0);
    expect(topLeft.y).toBe(0);

    const bottomRight = gm.latLonToXY(-90, 180);
    expect(bottomRight.x).toBe(global.width);
    expect(bottomRight.y).toBe(global.height);
  });

  it('xyToLatLon is inverse of latLonToXY approximately', () => {
    const gm = new window.GeographyManager();

    const lat = 37.7749; // SF
    const lon = -122.4194;
    const { x, y } = gm.latLonToXY(lat, lon);
    const { lat: lat2, lon: lon2 } = gm.xyToLatLon(x, y);

    expect(approx(lat, lat2, 1e-9)).toBe(true);
    expect(approx(lon, lon2, 1e-9)).toBe(true);
  });
});
