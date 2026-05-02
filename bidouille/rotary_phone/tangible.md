# tangible.md — physical Socotel S63 + Raspberry Pi

Goal: convert a real vintage rotary phone into a "space line". Lift the
handset, dial a digit, hear the recording from that body in the
earpiece. Dial the full secret number → alien transmission.

## Bill of materials

| Part                                        | Notes                                              |
|---------------------------------------------|----------------------------------------------------|
| Vintage rotary phone (Socotel S63 or GPO 746) | Pulse dial, hook switch, 4–6 internal wires         |
| Raspberry Pi Zero 2 W                        | Tiny, fits inside the phone shell. Pi 4 also fine. |
| MicroSD card 16 GB                          | Class 10                                           |
| MAX98357A I²S DAC + 3 W speaker             | Drives the original handset earpiece via amp.      |
|   *or* USB audio dongle                     | Simpler if I²S feels intimidating.                 |
| Optocouplers (PC817 ×2) or simple pull-ups  | Galvanic isolation for dial + hook GPIO.           |
| 10 kΩ resistors (×4)                         | Pull-ups / current-limit for opto LEDs.            |
| Wire, heatshrink, terminal blocks           |                                                    |
| 5 V 2.5 A USB-C PSU                         | Or a LiPo + boost if you want it untethered.       |

The original handset has a carbon mic and a magnetic earpiece. The mic
is fine to leave disconnected for a playback-only build. The earpiece
is a 50–300 Ω coil — drive it through the I²S amp (lower volume than a
speaker; that's authentic).

## Wiring

The Socotel dial has **two switches** in the base:
- **Pulse switch (PS)** — opens/closes once per digit pulse while the
  dial returns to rest. Digit *N* = *N* opens (digit `0` = 10 opens).
- **Off-normal / shunt switch (ON)** — closed only while the dial is
  off the rest position. Use it to mute the earpiece during the dial
  return so the user doesn't hear pulse clicks.

The hook switch is in the cradle: closed when the handset is **lifted**.

Recommended GPIO map (BCM numbering):

| Pi pin (BCM) | Phone signal       | Direction | Pull       |
|--------------|--------------------|-----------|------------|
| GPIO 17      | Dial pulse (PS)    | input     | pull-up    |
| GPIO 27      | Dial off-normal    | input     | pull-up    |
| GPIO 22      | Hook switch        | input     | pull-up    |
| GPIO 18 (PCM_CLK) / 19 (FS) / 21 (DOUT) | I²S DAC | output | —          |

Drive each phone switch through a PC817 optocoupler powered from 5 V on
the phone side; the Pi-side transistor pulls the GPIO to GND when the
switch closes. This keeps the noisy phone wiring out of the Pi rails.

ASCII sketch (one switch — repeat for the other two):

```
        +5V ──[10kΩ]──┬─── (phone side switch SW)──── GND
                      │
                      └──► PC817 LED anode
                          PC817 LED cathode ── GND
                          PC817 collector ──── 3V3 via [10kΩ]
                          PC817 emitter ────── GND
                          collector node ───── Pi GPIO (BCM 17/27/22)
```

## Software stack

- **OS**: Raspberry Pi OS Lite (Bookworm).
- **Python 3** with `gpiozero` (uses `lgpio` backend on Bookworm — no
  `RPi.GPIO` needed).
- **Audio**: `mpv` for low-latency playback (`apt install mpv`), or
  `pygame.mixer` if staying inside Python.
- **Service**: a `systemd` unit that runs the script at boot.

```sh
sudo apt update
sudo apt install -y python3-gpiozero python3-pip mpv alsa-utils
pip install --break-system-packages mpv
```

## Pulse decoding

Real rotary dials bounce. Two reliable approaches:

**A. Edge-triggered with timing window** (preferred)
- Count falling edges on `GPIO 17`.
- Reset the count when `GPIO 27` (off-normal) goes back to *rest*.
- Treat the count as the dialed digit (10 = `0`).

**B. Polling at 1 kHz** with software debounce ≥ 8 ms.

Skeleton:

```python
from gpiozero import Button
from threading import Timer
from pathlib import Path
import subprocess

PULSE = Button(17, pull_up=True, bounce_time=0.008)
DIAL  = Button(27, pull_up=True, bounce_time=0.030)  # off-normal
HOOK  = Button(22, pull_up=True, bounce_time=0.050)

ASSETS = Path("/home/pi/space")  # 0_sun.wav, 1_mercury.wav, ...
count = 0
player = None

def on_pulse():
    global count
    count += 1

def on_dial_rest():
    global count
    digit = 0 if count == 10 else count
    count = 0
    play(digit)

def play(digit):
    global player
    if player and player.poll() is None:
        player.terminate()
    f = ASSETS / f"{digit}_*.wav"
    matches = sorted(ASSETS.glob(f"{digit}_*.wav"))
    if matches:
        player = subprocess.Popen(["mpv", "--really-quiet", str(matches[0])])

def on_hook_up():     pass            # handset lifted — could play dial tone
def on_hook_down():   stop_all()

def stop_all():
    global player, count
    count = 0
    if player and player.poll() is None:
        player.terminate()
        player = None

PULSE.when_pressed = on_pulse
DIAL.when_released = on_dial_rest      # off-normal returns to rest
HOOK.when_pressed  = on_hook_up
HOOK.when_released = on_hook_down

from signal import pause
pause()
```

## Dial-tone & full-number detection

Optional polish:
- On hook-lift, loop `dial_tone.wav` (a real French tonality at 440 Hz
  continuous) until the first pulse arrives.
- Buffer dialed digits with a 5-second inter-digit timeout.
- If the buffer matches the secret number `0620838825` → play
  `alien_call.wav` and pulse a relay/LED that flickers an "incoming
  signal" lamp wired to a spare GPIO.

## Audio routing into the original earpiece

The handset cord typically has 4 conductors. Two of them go to the
earpiece coil. Trace continuity with a multimeter, snip those two,
and wire them across the speaker output of the MAX98357A through a
220 µF blocking cap (the coil is happy with the Class-D PWM).

If volume is wrong:
- Too quiet → drop a small step-up transformer (8 Ω : 100 Ω) inline.
- Too loud → 47 Ω in series, or `amixer set Master 60%`.

## Enclosure

The Pi Zero 2 W and DAC fit on a piece of perfboard inside the
Socotel base — there's room around the bell. Drill a small notch in
the cable-grommet for a USB-C tail; keep the original cloth cord for
authenticity (it's no longer carrying line voltage).

## Test sequence (bench, before reassembly)

1. Power up; `systemctl status spaceline.service` → active.
2. Short PULSE pin to GND 4 times within 2 s, then DIAL goes back to
   rest → `4_mars.wav` plays.
3. Short HOOK to GND → audio cuts; release → audio armed.
4. Dial `0620838825` → alien call.

## Safety / preservation

The original PTT phone is a museum-grade object. Wherever possible:
- Don't desolder original components — *parallel* the wiring with new
  taps that can be removed.
- Keep the bell intact; you can drive it later from a GPIO via a
  20 V buzz coil if you want full ringer simulation.
- Photograph the inside before any modification.

## References

- TeCoEd, GPO 746 Rotary Phone Hack (Python pulse counting):
  <https://github.com/TeCoEd/GPO-746-Rotary-Phone-Hack>
- ZZ76, pi-dial:
  <https://github.com/ZZ76/pi-dial>
- jacob-meacham, rotary-voip (full VoIP stack):
  <https://github.com/jacob-meacham/rotary-voip>
- Logic Ethos PiTelephone write-up:
  <https://logicethos.com/blog/pitelephone-raspberry-pi-retro-dial-phone/index.html>
- Hackaday rotary VoIP overview:
  <https://hackaday.com/2015/03/09/convert-a-rotary-phone-to-voip-using-raspberry-pi/>
