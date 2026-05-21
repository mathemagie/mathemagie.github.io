// Unit tests for pure functions in index.html.
// Functions are extracted from the live source at test time so tests can't
// drift from the implementation. Run with: node --test tests/

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function extract(name) {
    // Match `function name(...) { ... }` with balanced braces.
    const start = source.indexOf(`function ${name}(`);
    if (start === -1) throw new Error(`Function ${name} not found in index.html`);
    let i = source.indexOf('{', start);
    let depth = 1;
    i++;
    while (i < source.length && depth > 0) {
        const c = source[i];
        if (c === '{') depth++;
        else if (c === '}') depth--;
        i++;
    }
    return source.slice(start, i);
}

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
    [extract('haversine'), extract('calculateSignalQuality'), extract('parseCoverage')].join('\n'),
    sandbox
);
const { haversine, calculateSignalQuality, parseCoverage } = sandbox;

// === haversine ===
test('haversine: identical points return 0', () => {
    assert.strictEqual(haversine(48.85, 2.35, 48.85, 2.35), 0);
});

test('haversine: Paris ↔ London ≈ 344 km', () => {
    const d = haversine(48.8566, 2.3522, 51.5074, -0.1278);
    assert.ok(Math.abs(d - 344) < 5, `expected ~344, got ${d}`);
});

test('haversine: antipodes ≈ half Earth circumference', () => {
    // Earth circumference ≈ 40030 km, half ≈ 20015 km
    const d = haversine(0, 0, 0, 180);
    assert.ok(Math.abs(d - 20015) < 5, `expected ~20015, got ${d}`);
});

test('haversine: result is symmetric', () => {
    const a = haversine(40.7128, -74.0060, 35.6762, 139.6503);
    const b = haversine(35.6762, 139.6503, 40.7128, -74.0060);
    assert.ok(Math.abs(a - b) < 1e-9);
});

test('haversine: NYC ↔ Tokyo ≈ 10845 km', () => {
    const d = haversine(40.7128, -74.0060, 35.6762, 139.6503);
    assert.ok(Math.abs(d - 10845) < 20, `expected ~10845, got ${d}`);
});

// === calculateSignalQuality ===
test('signal quality: <500 km → full strength 1.0', () => {
    assert.strictEqual(calculateSignalQuality(0), 1.0);
    assert.strictEqual(calculateSignalQuality(499), 1.0);
});

test('signal quality: at 500 km transitions to 1.0', () => {
    // distance=500 enters second band: 0.7 + 0.3 * (1 - 0/1500) = 1.0
    assert.ok(Math.abs(calculateSignalQuality(500) - 1.0) < 1e-9);
});

test('signal quality: at 2000 km enters third band at 0.7', () => {
    // distance=2000 third band: 0.3 + 0.4 * 1 = 0.7
    assert.ok(Math.abs(calculateSignalQuality(2000) - 0.7) < 1e-9);
});

test('signal quality: at 5000 km → 0.3', () => {
    assert.ok(Math.abs(calculateSignalQuality(5000) - 0.3) < 1e-9);
});

test('signal quality: at 10000 km → 0', () => {
    assert.strictEqual(calculateSignalQuality(10000), 0);
});

test('signal quality: beyond 10000 km clamped to 0', () => {
    assert.strictEqual(calculateSignalQuality(20000), 0);
    assert.strictEqual(calculateSignalQuality(99999), 0);
});

test('signal quality: monotonically non-increasing with distance', () => {
    let prev = Infinity;
    for (let d = 0; d <= 12000; d += 250) {
        const q = calculateSignalQuality(d);
        assert.ok(q <= prev + 1e-9, `non-monotonic at d=${d}: ${q} > ${prev}`);
        prev = q;
    }
});

test('signal quality: always in [0, 1]', () => {
    for (const d of [-100, 0, 250, 1000, 3500, 7500, 15000]) {
        const q = calculateSignalQuality(d);
        assert.ok(q >= 0 && q <= 1, `out of range at d=${d}: ${q}`);
    }
});

// === parseCoverage ===
test('parseCoverage: null/empty input returns null', () => {
    assert.strictEqual(parseCoverage(null), null);
    assert.strictEqual(parseCoverage(''), null);
    assert.strictEqual(parseCoverage(undefined), null);
});

test('parseCoverage: extracts lat/lng/name', () => {
    const r = parseCoverage('latitude=48.8566;longitude=2.3522;name=Paris');
    assert.deepEqual(r, { lat: 48.8566, lng: 2.3522, name: 'Paris' });
});

test('parseCoverage: handles negative coordinates', () => {
    const r = parseCoverage('latitude=-33.8688;longitude=-70.6483;name=Santiago');
    assert.strictEqual(r.lat, -33.8688);
    assert.strictEqual(r.lng, -70.6483);
});

test('parseCoverage: handles explicit + sign', () => {
    const r = parseCoverage('latitude=+12.5;longitude=+45.0;name=Foo');
    assert.strictEqual(r.lat, 12.5);
    assert.strictEqual(r.lng, 45.0);
});

test('parseCoverage: integer coordinates (no decimal)', () => {
    const r = parseCoverage('latitude=0;longitude=0;name=Origin');
    assert.strictEqual(r.lat, 0);
    assert.strictEqual(r.lng, 0);
});

test('parseCoverage: missing latitude returns null', () => {
    assert.strictEqual(parseCoverage('longitude=2.35;name=X'), null);
});

test('parseCoverage: missing longitude returns null', () => {
    assert.strictEqual(parseCoverage('latitude=48.85;name=X'), null);
});

test('parseCoverage: missing name defaults to "Unknown"', () => {
    const r = parseCoverage('latitude=10;longitude=20');
    assert.strictEqual(r.name, 'Unknown');
});

test('parseCoverage: name is trimmed', () => {
    const r = parseCoverage('latitude=10;longitude=20;name=  Spaced Out  ');
    assert.strictEqual(r.name, 'Spaced Out');
});

test('parseCoverage: name stops at semicolon', () => {
    const r = parseCoverage('latitude=10;longitude=20;name=Foo;extra=bar');
    assert.strictEqual(r.name, 'Foo');
});

// === extra boundary tests ===
test('haversine: equator quarter circumference ≈ 10007 km', () => {
    const d = haversine(0, 0, 0, 90);
    assert.ok(Math.abs(d - 10007) < 5, `expected ~10007, got ${d}`);
});

test('haversine: pole to pole ≈ 20015 km', () => {
    const d = haversine(-90, 0, 90, 0);
    assert.ok(Math.abs(d - 20015) < 5, `expected ~20015, got ${d}`);
});

test('haversine: same longitude, 1 degree lat ≈ 111 km', () => {
    const d = haversine(0, 0, 1, 0);
    assert.ok(Math.abs(d - 111) < 2, `expected ~111, got ${d}`);
});

test('signal quality: continuous at 2000 km boundary', () => {
    // Left limit of band 2 at 2000 → 0.7 + 0.3*(1 - 1500/1500) = 0.7
    // Band 3 at 2000 → 0.3 + 0.4*1 = 0.7
    const justBelow = calculateSignalQuality(1999.999);
    const at = calculateSignalQuality(2000);
    assert.ok(Math.abs(justBelow - at) < 1e-3, `discontinuous: ${justBelow} vs ${at}`);
});

test('signal quality: continuous at 5000 km boundary', () => {
    const justBelow = calculateSignalQuality(4999.999);
    const at = calculateSignalQuality(5000);
    assert.ok(Math.abs(justBelow - at) < 1e-3, `discontinuous: ${justBelow} vs ${at}`);
});

test('signal quality: at 7500 km → 0.15 (midway in last band)', () => {
    // 0.3 * (1 - 2500/5000) = 0.15
    assert.ok(Math.abs(calculateSignalQuality(7500) - 0.15) < 1e-9);
});

test('signal quality: negative distance treated as <500 → 1.0', () => {
    assert.strictEqual(calculateSignalQuality(-1), 1.0);
});

test('parseCoverage: extra whitespace around values', () => {
    const r = parseCoverage('latitude=10.5;longitude=-20.25;name=Test City');
    assert.strictEqual(r.lat, 10.5);
    assert.strictEqual(r.lng, -20.25);
    assert.strictEqual(r.name, 'Test City');
});

test('parseCoverage: scientific notation parses only the leading number', () => {
    // Regex matches decimal form; "1e2" is parsed as just "1"
    const r = parseCoverage('latitude=1e2;longitude=20;name=X');
    assert.strictEqual(r.lat, 1);
    assert.strictEqual(r.lng, 20);
});
