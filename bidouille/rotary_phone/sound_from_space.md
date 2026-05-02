# sound_from_space.md

Curated mapping: each rotary digit 0–9 plays a real recording from a NASA
mission. Most are sonifications of plasma / radio / magnetometer data —
sound doesn't travel through vacuum, but spacecraft instruments capture
electromagnetic waves whose frequencies happen to fall in our hearing
range when shifted.

## Digit → body → recording

| Digit | Body              | Source recording                                 | License / where to grab                                      |
|-------|-------------------|--------------------------------------------------|--------------------------------------------------------------|
| 0     | Sun               | Solar wind / heliosphere (Voyager 1)             | NASA "Sounds from Beyond" — public domain                    |
| 1     | Mercury           | Mariner 10 plasma-wave flyby                     | NASA archives                                                |
| 2     | Venus             | Parker Solar Probe FIELDS — Venusian atmosphere  | NASA / APL — public domain                                   |
| 3     | Earth             | Voyager Golden Record "Sounds of Earth" excerpt  | NASA SoundCloud — public domain                              |
| 4     | Mars              | Perseverance SuperCam mic — Martian wind & laser | NASA/JPL — public domain                                     |
| 5     | Jupiter           | Juno Waves — Ganymede flyby (June 2021)          | NASA/JPL/SwRI — public domain                                |
| 6     | Saturn            | Cassini RPWS — radio/plasma emissions            | NASA/JPL/U. of Iowa — public domain                          |
| 7     | Uranus            | Voyager 2 plasma-wave flyby (1986)               | NASA archives                                                |
| 8     | Neptune           | Voyager 2 plasma-wave flyby (1989)               | NASA archives                                                |
| 9     | Beyond / Pulsar   | Perseus-cluster black-hole sonification, or a pulsar (e.g. PSR B0329+54) | NASA Chandra sonifications, Jodrell Bank pulsar library      |

## Where to source the audio

**Programmatic**
- NASA Images & Video Library API (public, no key, supports
  `media_type=audio`):
  <https://images-api.nasa.gov/search?q=mars&media_type=audio>
- Note: the historical "NASA Space Sounds API" on `data.nasa.gov` wraps
  SoundCloud but its dataset is effectively empty — prefer the Images
  API above.

**Primary NASA pages**
- "Sounds from Beyond" — solar-system audio gallery:
  <https://www.nasa.gov/sounds-from-beyond/>
- Historical sounds (Apollo, ISS, etc.):
  <https://www.nasa.gov/historical-sounds/>
- Sinister Sounds of the Solar System (Halloween compilation, very
  usable as digit clips): <https://science.nasa.gov/resource/sinister-sounds-of-the-solar-system/>
- Audio & ringtones (short MP3/M4R clips):
  <https://www.nasa.gov/audio-and-ringtones/>
- NASA SoundCloud: <https://soundcloud.com/nasa>

**Specific recordings**
- Mars (Perseverance SuperCam first audio):
  <https://mars.nasa.gov/mars2020/multimedia/audio/>
- Cassini at Saturn — radio emissions:
  <https://solarsystem.nasa.gov/missions/cassini/galleries/audio/>
- Juno at Jupiter (Ganymede flyby press kit & audio):
  search "Juno Ganymede flyby audio NASA"
- Voyager Golden Record contents (Earth's sounds):
  <https://science.nasa.gov/mission/voyager/golden-record-contents/sounds/>
- Chandra sonifications (black holes, supernova remnants):
  <https://chandra.harvard.edu/sound/>

NASA media is free to use under their media-usage guidelines (credit
"NASA/JPL-Caltech" or specific instrument team). Always keep the credit
line in the project's README.

## Suggested clip prep

- Trim each clip to **8–20 s**, fade-in/out 200 ms.
- Normalize to **−14 LUFS** so all bodies feel level.
- Encode `OGG Vorbis` (q5) for the web prototype, `WAV` for the
  Raspberry Pi build (no decode CPU cost on Pi Zero 2W).
- File layout matching the digit mapping:

```
assets/space/
  0_sun.ogg
  1_mercury.ogg
  2_venus.ogg
  3_earth.ogg
  4_mars.ogg
  5_jupiter.ogg
  6_saturn.ogg
  7_uranus.ogg
  8_neptune.ogg
  9_pulsar.ogg
```

## Fetching at runtime — NASA Images & Video Library API

Instead of bundling local files, the prototype can lazy-fetch a relevant
NASA clip the first time a digit is dialed. The endpoint is **public,
no API key**, and CORS-friendly:

```
GET https://images-api.nasa.gov/search?q=<query>&media_type=audio
```

The response shape (trimmed):

```json
{
  "collection": {
    "items": [
      {
        "href": "https://images-assets.nasa.gov/audio/<id>/collection.json",
        "data": [{
          "nasa_id": "<id>",
          "title":   "...",
          "description": "...",
          "media_type": "audio",
          "date_created": "..."
        }]
      }
    ]
  }
}
```

To get the actual audio file: fetch `items[i].href` → it returns a JSON
array of asset URLs; pick the `.mp3` or `.wav`.

```js
async function spaceSoundFor(query) {
  const r = await fetch(
    `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=audio`
  );
  const j = await r.json();
  const item = j.collection.items[0];
  if (!item) return null;
  const assets = await (await fetch(item.href)).json();
  const mp3 = assets.find(u => u.endsWith('.mp3')) || assets[0];
  return { url: mp3, title: item.data[0].title };
}
```

Suggested per-digit queries (override per taste):

```js
const DIGIT_QUERIES = {
  0: 'voyager solar wind',
  1: 'mercury mariner',
  2: 'parker solar probe venus',
  3: 'voyager golden record',
  4: 'perseverance mars wind',
  5: 'juno jupiter',
  6: 'cassini saturn radio',
  7: 'voyager 2 uranus',
  8: 'voyager 2 neptune',
  9: 'pulsar sonification'
};
```

Cache successful lookups in `localStorage` (URL only, not the audio
itself — the browser HTTP cache handles that) so subsequent dials are
instant.

## Hooks for the rotary UI

Per-digit DTMF tones already fire in `js/script.js#digitTone`. To layer
the space sound:

1. Pre-decode each file once on first user interaction (Web Audio
   `decodeAudioData`).
2. In the existing `registerDigit(digit)` callback, also play
   `spaceBuffers[digit]` through a low-pass filter (~3.5 kHz) plus a
   hint of room reverb to keep the "old phone receiver" character.
3. If the user dials the secret number `06 20 83 88 25`, the alien-call
   overlay takes over — leave the per-digit clips audible on the way in
   so the dial-up feels like tuning across the solar system.

## Sequencing idea — "tour mode"

Dialing `0123456789` plays the bodies in order, like a planetarium
flyover. Could be triggered by an Easter-egg sequence and skip the
alien-call overlay.
