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
    expect(rm.getRegion(52.52, 13.405)).toBe('Europe'); // Berlin
    expect(rm.getRegion(39, -98)).toBe('North America'); // Central US
    expect(rm.getRegion(-23.55, -46.633)).toBe('South America'); // São Paulo
    expect(rm.getRegion(9.076, 7.398)).toBe('Africa'); // Nigeria
    expect(rm.getRegion(35.676, 139.65)).toBe('Asia'); // Tokyo
    expect(rm.getRegion(-33.8688, 151.2093)).toBe('Oceania'); // Sydney
    expect(rm.getRegion(0, -150)).toBe('Ocean'); // Mid-Pacific
  });

  it('setStationForRegion updates audio src and label', () => {
    const audio = document.getElementById('radio-player');
    const label = document.getElementById('station-label');

    rm.setStationForRegion('Europe');

    expect(label.textContent).toContain('Radio Swiss Pop — Europe');
    expect(audio.src).toContain('https://stream.srg-ssr.ch/m/rsp/mp3_128');
    expect(audio.dataset.station).toBe('Radio Swiss Pop');
  });

  it('updateRadioForLocation changes region and station once', () => {
    const audio = document.getElementById('radio-player');

    rm.updateRadioForLocation(52.52, 13.405); // Europe
    expect(rm.currentRegion).toBe('Europe');
    const firstSrc = audio.src;

    // Calling again with same region should not change src
    rm.updateRadioForLocation(50, 10);
    expect(audio.src).toBe(firstSrc);
  });
});
