/* Rotary phone — alien deep-space line.
   Dial 06 20 83 88 25 to trigger a real-time synthesized alien transmission. */

(() => {
    "use strict";

    const SECRET = "0620838825";
    const SECRET_DISPLAY = SECRET.match(/.{1,2}/g).join(" ");
    const MAX_DIGITS = SECRET.length;

    const dial = document.getElementById("dial");
    const handset = document.getElementById("handset");
    const display = document.getElementById("display");
    const clearBtn = document.getElementById("clear");
    const signal = document.getElementById("signal");
    const overlay = document.getElementById("overlay");
    const overlayStatus = document.getElementById("status");
    const subtitles = document.getElementById("subtitles");
    const hangup = document.getElementById("hangup");
    const scope = document.getElementById("scope");
    const metaRssi = document.getElementById("meta-rssi");
    const metaDrift = document.getElementById("meta-drift");
    const metaOrigin = document.getElementById("meta-origin");
    const hint = document.getElementById("hint");

    let dialed = "";
    let isSpinning = false;

    // ---------- audio context (lazy) ----------
    let ctx = null;
    function audio() {
        if (!ctx) {
            const C = window.AudioContext || window.webkitAudioContext;
            ctx = new C();
        }
        if (ctx.state === "suspended") ctx.resume();
        return ctx;
    }

    // ---------- rotary click sound ----------
    /* Real GPO/Socotel pulse: very brief mechanical "tac" — a sharp metallic
       transient (pawl hitting tooth) plus a low-frequency body resonance
       from the bakelite case. No long oscillator tail. */
    function clickTick(strength = 1) {
        const a = audio();
        const t = a.currentTime;

        // 1) Sharp metallic transient — short filtered noise burst
        const burstLen = Math.floor(a.sampleRate * 0.012);
        const burst = a.createBuffer(1, burstLen, a.sampleRate);
        const bd = burst.getChannelData(0);
        for (let i = 0; i < burstLen; i++) {
            // very fast exponential decay, with sub-ms attack
            const env = Math.exp(-i / (a.sampleRate * 0.0018));
            bd[i] = (Math.random() * 2 - 1) * env;
        }
        const bs = a.createBufferSource();
        bs.buffer = burst;
        const bp = a.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 2600;     // bright metallic "tick"
        bp.Q.value = 4;
        const bg = a.createGain();
        bg.gain.value = 0.32 * strength;
        bs.connect(bp).connect(bg).connect(a.destination);
        bs.start(t);

        // 2) Low body thunk — bakelite resonance picked up from the case
        const body = a.createOscillator();
        const bodyGain = a.createGain();
        body.type = "triangle";
        body.frequency.setValueAtTime(140, t);
        body.frequency.exponentialRampToValueAtTime(70, t + 0.04);
        bodyGain.gain.setValueAtTime(0, t);
        bodyGain.gain.linearRampToValueAtTime(0.10 * strength, t + 0.003);
        bodyGain.gain.exponentialRampToValueAtTime(0.0005, t + 0.07);
        body.connect(bodyGain).connect(a.destination);
        body.start(t);
        body.stop(t + 0.09);
    }

    // ---------- governor whirr (centrifugal speed regulator) ----------
    /* A real rotary dial has a centrifugal governor that limits return speed.
       It produces a steady high-pitched mechanical whirr underneath the clicks,
       starting fast and gradually slowing as the dial decelerates near home. */
    function startGovernorWhirr(durationSec) {
        const a = audio();
        const t = a.currentTime;

        // Filtered noise = mechanical air/spring rush
        const buf = a.createBuffer(1, Math.floor(a.sampleRate * durationSec) + 256, a.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const noise = a.createBufferSource();
        noise.buffer = buf;

        const bp = a.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(1800, t);
        // Slows down as dial approaches rest — pitch drops
        bp.frequency.exponentialRampToValueAtTime(900, t + durationSec);
        bp.Q.value = 2.2;

        const g = a.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.045, t + 0.04);
        g.gain.setValueAtTime(0.045, t + Math.max(0.04, durationSec - 0.12));
        g.gain.linearRampToValueAtTime(0, t + durationSec);

        // Subtle amplitude tremolo from the spinning governor blades
        const trem = a.createOscillator();
        const tremGain = a.createGain();
        trem.frequency.setValueAtTime(38, t);
        trem.frequency.exponentialRampToValueAtTime(14, t + durationSec);
        tremGain.gain.value = 0.018;
        trem.connect(tremGain).connect(g.gain);

        noise.connect(bp).connect(g).connect(a.destination);
        noise.start(t);
        noise.stop(t + durationSec + 0.05);
        trem.start(t);
        trem.stop(t + durationSec + 0.05);
    }

    // ---------- final stop "thunk" when the finger-stop catches the wheel ----------
    function dialHomeThud() {
        const a = audio();
        const t = a.currentTime;

        // Low body thud
        const o = a.createOscillator();
        const g = a.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(95, t);
        o.frequency.exponentialRampToValueAtTime(45, t + 0.09);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0005, t + 0.16);
        o.connect(g).connect(a.destination);
        o.start(t);
        o.stop(t + 0.18);

        // Soft metallic tap on top — finger-stop contact
        const burstLen = Math.floor(a.sampleRate * 0.018);
        const buf = a.createBuffer(1, burstLen, a.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < burstLen; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (a.sampleRate * 0.003));
        }
        const bs = a.createBufferSource();
        bs.buffer = buf;
        const bp = a.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 1700;
        bp.Q.value = 3;
        const bg = a.createGain();
        bg.gain.value = 0.16;
        bs.connect(bp).connect(bg).connect(a.destination);
        bs.start(t);
    }

    function dialTone(duration = 0.3) {
        const a = audio();
        const t = a.currentTime;
        const o1 = a.createOscillator();
        const o2 = a.createOscillator();
        const g  = a.createGain();
        o1.frequency.value = 350;
        o2.frequency.value = 440;
        o1.type = "sine"; o2.type = "sine";
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.08, t + 0.02);
        g.gain.linearRampToValueAtTime(0.08, t + duration - 0.04);
        g.gain.linearRampToValueAtTime(0, t + duration);
        o1.connect(g); o2.connect(g);
        g.connect(a.destination);
        o1.start(t); o2.start(t);
        o1.stop(t + duration);
        o2.stop(t + duration);
    }

    // ---------- per-digit DTMF tone ----------
    /* Standard DTMF row/column frequencies — each digit has a unique pair. */
    const DTMF = {
        "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
        "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
        "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
        "0": [941, 1336]
    };

    function digitTone(digit, duration = 0.22) {
        const pair = DTMF[String(digit)];
        if (!pair) return;
        const a = audio();
        const t = a.currentTime;
        const [fLo, fHi] = pair;

        const oLo = a.createOscillator();
        const oHi = a.createOscillator();
        oLo.type = "sine"; oHi.type = "sine";
        oLo.frequency.value = fLo;
        oHi.frequency.value = fHi;

        const g = a.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.012);
        g.gain.setValueAtTime(0.18, t + duration - 0.04);
        g.gain.linearRampToValueAtTime(0, t + duration);

        oLo.connect(g); oHi.connect(g);
        g.connect(a.destination);
        oLo.start(t); oHi.start(t);
        oLo.stop(t + duration + 0.02);
        oHi.stop(t + duration + 0.02);
    }

    function ringChime() {
        // gentle two-pulse chime when prefix matches 01 / 02 / 09
        const a = audio();
        const t = a.currentTime;
        [0, 0.18].forEach((offset, idx) => {
            const o = a.createOscillator();
            const g = a.createGain();
            o.type = "sine";
            o.frequency.value = idx === 0 ? 880 : 1175;
            const t0 = t + offset;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
            o.connect(g).connect(a.destination);
            o.start(t0);
            o.stop(t0 + 0.18);
        });
    }

    // ---------- dial spin animation ----------
    /* Each digit rotates the wheel clockwise by digit*30deg (0 → 300deg),
       then springs back. While returning, we emit N click ticks. */
    function spinTo(digit) {
        if (isSpinning) return;
        isSpinning = true;
        const pulses = digit === 0 ? 10 : digit;
        const angle = pulses * 30; // CSS rotation degrees, positive = clockwise
        const spinTime = 0.16 + pulses * 0.04;        // out
        const returnTime = 0.18 + pulses * 0.085;     // back

        dial.style.setProperty("--spin-time", spinTime + "s");
        dial.style.setProperty("--return-time", returnTime + "s");

        // forward
        dial.classList.add("spinning");
        dial.classList.remove("returning");
        dial.style.transform = `rotate(${angle}deg)`;

        setTimeout(() => {
            // return spring
            dial.classList.remove("spinning");
            dial.classList.add("returning");
            dial.style.transform = "rotate(0deg)";

            // governor whirr underneath the whole return — slows with the dial
            startGovernorWhirr(returnTime + 0.04);

            // schedule click ticks during return — 1 per pulse, slightly
            // accelerating spacing (dial is slower at start, faster mid-return)
            // is wrong for real dials: governor keeps speed roughly constant,
            // so equal spacing matches reality.
            const dt = (returnTime * 1000) / pulses;
            for (let i = 0; i < pulses; i++) {
                // alternate slight strength variation — pawl/spring asymmetry
                const s = 0.82 + (i % 2 === 0 ? 0.08 : 0);
                setTimeout(() => clickTick(s), Math.round(i * dt + 30));
            }

            // final "thunk" when the wheel hits the finger-stop at home
            setTimeout(dialHomeThud, Math.round(returnTime * 1000 + 10));

            setTimeout(() => {
                isSpinning = false;
                registerDigit(digit);
            }, returnTime * 1000 + 30);
        }, spinTime * 1000 + 60);
    }

    const PREFIXES = ["01", "02", "09"];

    function registerDigit(digit) {
        if (dialed.length >= MAX_DIGITS) return;
        dialed += String(digit);
        renderDisplay();

        // unique DTMF tone per digit — fires once the dial returns home
        digitTone(digit);

        signal.classList.add("dialing");
        signal.classList.remove("live");
        signal.innerHTML = `<span class="dot"></span> dialing… ${dialed.length}/${MAX_DIGITS}`;

        // recognize French regional prefixes 01 / 02 / 09 — gentle chime
        if (dialed.length === 2 && PREFIXES.includes(dialed)) {
            setTimeout(ringChime, 220);
            signal.innerHTML = `<span class="dot"></span> prefix ${dialed} · keep dialing…`;
        }

        if (dialed === SECRET) {
            startAlienCall();
        } else if (!SECRET.startsWith(dialed)) {
            // wrong number — short busy tone
            busyTone();
            signal.innerHTML = `<span class="dot"></span> wrong number — try again`;
            setTimeout(resetDialed, 1400);
        }
    }

    function renderDisplay() {
        const padded = dialed.padEnd(MAX_DIGITS, "_");
        display.textContent = padded.match(/.{1,2}/g).join(" ");
    }

    function resetDialed() {
        dialed = "";
        renderDisplay();
        signal.classList.remove("dialing", "live");
        signal.innerHTML = `<span class="dot"></span> idle · awaiting your call`;
    }

    function busyTone() {
        const a = audio();
        const t = a.currentTime;
        for (let i = 0; i < 3; i++) {
            const o = a.createOscillator();
            const g = a.createGain();
            o.frequency.value = 480;
            const t0 = t + i * 0.4;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(0.08, t0 + 0.02);
            g.gain.setValueAtTime(0.08, t0 + 0.18);
            g.gain.linearRampToValueAtTime(0, t0 + 0.22);
            o.connect(g).connect(a.destination);
            o.start(t0);
            o.stop(t0 + 0.25);
        }
    }

    // ---------- click handlers ----------
    dial.addEventListener("click", (e) => {
        const hole = e.target.closest(".hole");
        if (!hole) return;
        // unlock audio + provide dial tone on first interaction
        const a = audio();
        if (a.currentTime < 0.05) dialTone(0.18);
        const digit = parseInt(hole.dataset.digit, 10);
        spinTo(digit);
    });

    clearBtn.addEventListener("click", () => {
        if (isSpinning) return;
        resetDialed();
    });

    handset.addEventListener("click", () => {
        // playful: tap handset to peek at hint or hang up early
        handset.classList.toggle("lifted");
        if (handset.classList.contains("lifted")) {
            const a = audio();
            if (a) dialTone(1.8);
        }
    });

    // ---------- ALIEN CALL ----------
    let callActive = false;
    let callNodes = []; // anything to disconnect on hangup
    let callTimers = [];
    let analyser = null;
    let scopeRaf = 0;

    const ALIEN_PHRASES = [
        "::: KZRR-7 broadcasting from the rim :::",
        "we have been watching the rabbit",
        "il giardino di tutti i sogni è in fiamme",
        "01001000 01101001 00100000 01000101 01100001 01110010 01110100 01101000",
        "˙ǝɔɐds uı pǝsoן sı ǝɟıʌɐɹƃ",
        "your moon hums in the wrong key",
        "request: send croissants",
        "we ride the lapin cosmique",
        "geometry of grief, parsed and folded",
        "the sky behind the sky behind the sky",
        "do not answer · do not answer · do not answer",
        "FREQ ↑ — drift correction engaged",
        "ψ-channel open — please align your antennas",
        "ils sont déjà parmi vous",
        "carrier wave: a song without listeners",
        "tell Aurélien — the signal is good",
        "⌬ ⌬ ⌬ translation matrix collapsing ⌬ ⌬ ⌬",
        "we will sing for you in colors you have not invented",
        "remember the name: 06 20 83 88 25"
    ];

    const ORIGINS = ["KZRR-7", "ε ERIDANI", "VOID-Δ-19", "TRAPPIST-1f", "BEYOND-LMC", "SAG A*", "STATION ☿"];

    function startAlienCall() {
        if (callActive) return;
        callActive = true;
        signal.classList.add("live");
        signal.classList.remove("dialing");
        signal.innerHTML = `<span class="dot"></span> ━━ TRANSMISSION INCOMING ━━`;
        handset.classList.add("lifted");
        hint.textContent = "Pick up the handset — answer the unknown.";
        overlay.hidden = false;

        const a = audio();

        // ----- master chain -----
        const master = a.createGain();
        master.gain.value = 0.0;
        master.gain.linearRampToValueAtTime(0.85, a.currentTime + 0.6);

        // analyser → scope
        analyser = a.createAnalyser();
        analyser.fftSize = 1024;

        // long delay (deep space echo)
        const delay = a.createDelay(2.0);
        delay.delayTime.value = 0.42;
        const feedback = a.createGain();
        feedback.gain.value = 0.45;
        const wet = a.createGain();
        wet.gain.value = 0.55;

        delay.connect(feedback).connect(delay);
        delay.connect(wet).connect(master);

        // global filter sweep
        const filter = a.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 800;
        filter.Q.value = 0.8;

        const filterLfo = a.createOscillator();
        const filterDepth = a.createGain();
        filterLfo.frequency.value = 0.07;
        filterDepth.gain.value = 600;
        filterLfo.connect(filterDepth).connect(filter.frequency);
        filterLfo.start();

        filter.connect(master);
        filter.connect(delay);

        master.connect(analyser);
        analyser.connect(a.destination);

        callNodes.push(master, analyser, delay, feedback, wet, filter, filterLfo);

        // ----- handshake (modem-ish) -----
        const handshake = [
            { f: 1270, t: 0.0,  d: 0.18 },
            { f: 2225, t: 0.20, d: 0.18 },
            { f: 1080, t: 0.42, d: 0.20 },
            { f: 2400, t: 0.66, d: 0.40 }
        ];
        const t0 = a.currentTime + 0.05;
        handshake.forEach(h => {
            const o = a.createOscillator();
            const g = a.createGain();
            o.type = "sine";
            o.frequency.value = h.f;
            g.gain.setValueAtTime(0, t0 + h.t);
            g.gain.linearRampToValueAtTime(0.18, t0 + h.t + 0.01);
            g.gain.setValueAtTime(0.18, t0 + h.t + h.d - 0.01);
            g.gain.linearRampToValueAtTime(0, t0 + h.t + h.d);
            o.connect(g).connect(filter);
            o.start(t0 + h.t);
            o.stop(t0 + h.t + h.d + 0.05);
        });

        // ----- alien layers, fired after handshake -----
        const startAt = (t0 + 1.2 - a.currentTime) * 1000;
        callTimers.push(setTimeout(() => {
            overlayStatus.textContent = "::: TRANSMISSION LIVE — DO NOT ANSWER :::";
            startDrone(filter);
            startAlienBabble(filter);
            startSpaceBlips(delay);
            startSubtitles();
            startMetaUpdates();
        }, startAt));

        // ----- scope draw -----
        drawScope();

        hangup.addEventListener("click", endCall, { once: true });
    }

    function startDrone(out) {
        const a = audio();
        // 3 detuned carriers, FM-modulated by slow oscillators
        const base = [55, 82.5, 110, 165];
        base.forEach((freq, idx) => {
            const carrier = a.createOscillator();
            const carrierGain = a.createGain();
            carrier.frequency.value = freq;
            carrier.type = idx % 2 === 0 ? "sine" : "triangle";
            carrierGain.gain.value = 0.06;

            // modulator
            const mod = a.createOscillator();
            const modGain = a.createGain();
            mod.frequency.value = 0.12 + Math.random() * 0.4;
            modGain.gain.value = freq * 0.05;
            mod.connect(modGain).connect(carrier.frequency);

            // amp LFO
            const ampLfo = a.createOscillator();
            const ampLfoGain = a.createGain();
            ampLfo.frequency.value = 0.15 + Math.random() * 0.2;
            ampLfoGain.gain.value = 0.03;
            ampLfo.connect(ampLfoGain).connect(carrierGain.gain);

            carrier.connect(carrierGain).connect(out);
            carrier.start();
            mod.start();
            ampLfo.start();

            callNodes.push(carrier, mod, ampLfo, carrierGain, modGain, ampLfoGain);
        });
    }

    function startAlienBabble(out) {
        const a = audio();
        // formant-ish bursts that resemble speech in an unknown language
        const formantPairs = [
            [320, 920], [430, 1180], [600, 1700], [270, 2300], [490, 1350],
            [380, 800], [550, 1900], [700, 1100], [240, 2600], [360, 1500]
        ];

        function burst() {
            if (!callActive) return;
            const pair = formantPairs[Math.floor(Math.random() * formantPairs.length)];
            const dur = 0.08 + Math.random() * 0.32;
            const t = a.currentTime;
            const pitchMod = 0.6 + Math.random() * 1.8;

            // source: sawtooth with random pitch glide
            const src = a.createOscillator();
            src.type = "sawtooth";
            const f0 = (60 + Math.random() * 240) * pitchMod;
            src.frequency.setValueAtTime(f0, t);
            src.frequency.exponentialRampToValueAtTime(f0 * (0.5 + Math.random() * 1.5), t + dur);

            const g = a.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.16, t + 0.02);
            g.gain.linearRampToValueAtTime(0, t + dur);

            // 2 parallel bandpass formants
            const f1 = a.createBiquadFilter(); f1.type = "bandpass";
            f1.frequency.value = pair[0]; f1.Q.value = 8;
            const f2 = a.createBiquadFilter(); f2.type = "bandpass";
            f2.frequency.value = pair[1]; f2.Q.value = 10;

            src.connect(f1); src.connect(f2);
            f1.connect(g); f2.connect(g);
            g.connect(out);

            src.start(t);
            src.stop(t + dur + 0.05);

            const next = 80 + Math.random() * 520;
            callTimers.push(setTimeout(burst, next));
        }
        burst();
    }

    function startSpaceBlips(out) {
        const a = audio();
        function blip() {
            if (!callActive) return;
            const t = a.currentTime;
            const o = a.createOscillator();
            const g = a.createGain();
            o.type = "sine";
            const f = 600 + Math.random() * 3400;
            o.frequency.setValueAtTime(f, t);
            o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.18);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.10, t + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
            o.connect(g).connect(out);
            o.start(t);
            o.stop(t + 0.3);

            // occasional noise burst (cosmic static)
            if (Math.random() < 0.35) {
                const buf = a.createBuffer(1, a.sampleRate * 0.3, a.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < d.length; i++) {
                    d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
                }
                const ns = a.createBufferSource();
                const ng = a.createGain();
                const nf = a.createBiquadFilter();
                nf.type = "highpass";
                nf.frequency.value = 1500 + Math.random() * 2000;
                ns.buffer = buf;
                ng.gain.value = 0.06;
                ns.connect(nf).connect(ng).connect(out);
                ns.start(t);
                ns.stop(t + 0.32);
            }

            const next = 350 + Math.random() * 1200;
            callTimers.push(setTimeout(blip, next));
        }
        blip();
    }

    function glitchify(text) {
        const marks = ["́", "̇", "̱", "̏", "̐", "̼"];
        return text.split("").map(ch => {
            if (ch === " " || Math.random() > 0.3) return ch;
            return ch + marks[Math.floor(Math.random() * marks.length)];
        }).join("");
    }

    function startSubtitles() {
        let i = 0;
        function next() {
            if (!callActive) return;
            const phrase = ALIEN_PHRASES[i % ALIEN_PHRASES.length];
            i++;
            subtitles.textContent = "";
            // typewriter
            let n = 0;
            const target = Math.random() < 0.4 ? glitchify(phrase) : phrase;
            const id = setInterval(() => {
                if (!callActive) { clearInterval(id); return; }
                subtitles.textContent = target.slice(0, ++n);
                if (n >= target.length) clearInterval(id);
            }, 28);
            callTimers.push(setTimeout(next, 2600 + Math.random() * 1800));
        }
        next();
    }

    function startMetaUpdates() {
        function tick() {
            if (!callActive) return;
            metaRssi.textContent = (-30 + Math.random() * -45).toFixed(1) + " dBm";
            metaDrift.textContent = (Math.random() * 80 - 40).toFixed(2) + " Hz";
            metaOrigin.textContent = ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
            callTimers.push(setTimeout(tick, 700 + Math.random() * 800));
        }
        tick();
    }

    function drawScope() {
        const cx = scope.getContext("2d");
        const W = scope.width, H = scope.height;
        const buf = new Uint8Array(analyser.fftSize);

        function frame() {
            if (!callActive) return;
            analyser.getByteTimeDomainData(buf);
            cx.fillStyle = "rgba(0, 0, 0, 0.25)";
            cx.fillRect(0, 0, W, H);

            cx.lineWidth = 2;
            cx.strokeStyle = "rgba(124, 249, 255, 0.95)";
            cx.shadowColor = "rgba(124, 249, 255, 0.6)";
            cx.shadowBlur = 8;
            cx.beginPath();
            for (let i = 0; i < buf.length; i++) {
                const v = buf[i] / 128 - 1;
                const x = (i / buf.length) * W;
                const y = H / 2 + v * H * 0.45;
                if (i === 0) cx.moveTo(x, y); else cx.lineTo(x, y);
            }
            cx.stroke();
            cx.shadowBlur = 0;
            scopeRaf = requestAnimationFrame(frame);
        }
        frame();
    }

    function endCall() {
        if (!callActive) return;
        callActive = false;
        cancelAnimationFrame(scopeRaf);
        callTimers.forEach(clearTimeout);
        callTimers = [];

        const a = audio();
        // fade out master quickly
        callNodes.forEach(node => {
            try {
                if (node.gain && node.gain.value !== undefined) {
                    node.gain.cancelScheduledValues(a.currentTime);
                    node.gain.linearRampToValueAtTime(0, a.currentTime + 0.25);
                }
            } catch (_) {}
        });
        setTimeout(() => {
            callNodes.forEach(node => {
                try { node.stop && node.stop(); } catch (_) {}
                try { node.disconnect && node.disconnect(); } catch (_) {}
            });
            callNodes = [];
        }, 350);

        overlay.hidden = true;
        handset.classList.remove("lifted");
        hint.textContent = "Dial 06 20 83 88 25 again to try the line.";
        resetDialed();
    }

    // ---------- init ----------
    renderDisplay();
})();
