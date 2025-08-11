/* @vitest-environment jsdom */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../js/radio.js';

function setupDom() {
  document.body.innerHTML = `
    <audio id="radio-player"></audio>
    <div id="station-label"></div>
    <button id="fullscreen-btn"></button>
    <button id="play-btn"></button>
    <div id="time-display"></div>
    <div id="progress-bar" style="width:0%"></div>
    <button id="volume-btn"></button>
    <button id="menu-btn"></button>
  `;

  const audio = document.getElementById('radio-player');
  // Stub media methods/properties for JSDOM
  audio.play = vi.fn().mockResolvedValue();
  audio.pause = vi.fn();
  Object.defineProperty(audio, 'paused', { value: true, configurable: true });
  Object.defineProperty(audio, 'ended', { value: false, configurable: true });

  return {
    audio,
    stationLabel: document.getElementById('station-label'),
    playBtn: document.getElementById('play-btn'),
    volumeBtn: document.getElementById('volume-btn'),
    progressBar: document.getElementById('progress-bar'),
  };
}

describe('RadioManager', () => {
  let rm;

  beforeEach(() => {
    setupDom();
    rm = new window.RadioManager();
    rm.init();
  });

  it('getRegion maps locations to expected regions', () => {
    expect(rm.getRegion(37.7749, -122.4194)).toBe('US West'); // San Francisco
    expect(rm.getRegion(40.7128, -74.0060)).toBe('US East'); // New York
    expect(rm.getRegion(43.6532, -79.3832)).toBe('Canada'); // Toronto
    expect(rm.getRegion(19.4326, -99.1332)).toBe('Mexico/Central America'); // Mexico City
    expect(rm.getRegion(-23.5558, -46.6396)).toBe('Brazil'); // São Paulo
    expect(rm.getRegion(-34.6118, -58.3960)).toBe('Argentina/Chile'); // Buenos Aires
    expect(rm.getRegion(51.5074, -0.1278)).toBe('Western Europe'); // London
    expect(rm.getRegion(59.3293, 18.0686)).toBe('Northern Europe'); // Stockholm
    expect(rm.getRegion(50.0755, 14.4378)).toBe('Eastern Europe'); // Prague
    expect(rm.getRegion(41.9028, 12.4964)).toBe('Mediterranean'); // Rome
    expect(rm.getRegion(35.6762, 139.6503)).toBe('East Asia'); // Tokyo
    expect(rm.getRegion(1.3521, 103.8198)).toBe('Southeast Asia'); // Singapore
    expect(rm.getRegion(28.6139, 77.2090)).toBe('South Asia'); // New Delhi
    expect(rm.getRegion(31.2304, 121.4737)).toBe('East Asia'); // Shanghai
    expect(rm.getRegion(30.0444, 31.2357)).toBe('North Africa'); // Cairo
    expect(rm.getRegion(-1.2921, 36.8219)).toBe('Sub-Saharan Africa'); // Nairobi
    expect(rm.getRegion(-33.8688, 151.2093)).toBe('Australia'); // Sydney
    expect(rm.getRegion(-36.8485, 174.7633)).toBe('Pacific Islands'); // Auckland
    expect(rm.getRegion(0, -150)).toBe('Ocean'); // Mid-Pacific
  });

  it('setStationForRegion updates audio src and label', () => {
    const audio = document.getElementById('radio-player');
    const label = document.getElementById('station-label');

    rm.setStationForRegion('Mediterranean');

    expect(label.textContent).toContain('Over Mediterranean • Radio Swiss Pop');
    expect(audio.src).toContain('https://stream.srg-ssr.ch/m/rsp/mp3_128');
    expect(audio.dataset.station).toBe('Radio Swiss Pop');
  });

  it('updateRadioForLocation changes region and station once', () => {
    const audio = document.getElementById('radio-player');

    rm.updateRadioForLocation(50.0755, 14.4378); // Prague - Eastern Europe
    expect(rm.currentRegion).toBe('Eastern Europe');
    const firstSrc = audio.src;

    // Calling again with same region should not change src
    rm.updateRadioForLocation(50, 10);
    expect(audio.src).toBe(firstSrc);
  });
});
