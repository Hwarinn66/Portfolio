"""
Sound design for the portfolio trailer: every effect is synthesised here
(no samples, no music), placed on the trailer's cue grid and mixed to
public/audio/trailer.mp3 (40 s, stereo).

    python3 scripts/trailer-sound/make_sfx.py

cues.json holds timings exported from components/trailer/trailer-data.ts
(pacing unit B, scan pass times, bead order) so sound and picture match;
regenerate it with export-cues.ts after changing the timeline.
Requires numpy, scipy and ffmpeg.
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
CUE = json.load(open(os.path.join(HERE, 'cues.json')))
SR = 44100
B = CUE['B']
DUR = float(CUE['DURATION'])
N = int(SR * DUR)
rng = np.random.default_rng(20261012)


def b(n):
    return n * B


DROP = b(17)
SHUTTER = CUE['SHUTTER']
SCAN = CUE['SCAN']
BREAKS = CUE['BREAKS']

dry = np.zeros((2, N))
send = np.zeros((2, N))


# ── building blocks ─────────────────────────────────────────────
def T(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rng.standard_normal(int(d * SR))


def sos(kind, f, order=2):
    if kind == 'bp':
        lo, hi = f
        return butter(order, [max(20, lo), min(SR / 2 - 100, hi)], btype='band', fs=SR, output='sos')
    return butter(order, min(SR / 2 - 100, max(20, f)), btype=kind, fs=SR, output='sos')


def filt(x, kind, f, order=2):
    return sosfilt(sos(kind, f, order), x)


def sweep(x, f0, f1, kind='bp', width=0.6, block=256, curve='exp'):
    """Time-varying filter: centre/cutoff moves f0 → f1 across the sound."""
    out = np.zeros_like(x)
    nb = int(np.ceil(len(x) / block))
    zi = None
    prev = None
    for k in range(nb):
        u = k / max(1, nb - 1)
        f = f0 * (f1 / f0) ** u if curve == 'exp' else f0 + (f1 - f0) * u
        s = sos('bp', (f * (1 - width / 2), f * (1 + width / 2))) if kind == 'bp' else sos(kind, f)
        seg = x[k * block:(k + 1) * block]
        if zi is None or prev is None:
            zi = np.zeros((s.shape[0], 2))
        y, zi = sosfilt(s, seg, zi=zi)
        out[k * block:k * block + len(seg)] = y
        prev = s
    return out


def env(n, a=0.005, r=0.05, shape=1.0):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    na = min(na, n)
    e[:na] = np.linspace(0, 1, na) ** shape
    if nr < n:
        e[-nr:] *= np.linspace(1, 0, nr) ** shape
    return e


def dec(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def osc(f0, d, f1=None, kind='sine', glide='exp'):
    n = int(d * SR)
    t = np.arange(n) / SR
    if f1 is None:
        f = np.full(n, f0)
    elif glide == 'exp':
        f = f0 * (f1 / f0) ** (t / max(d, 1e-6))
    else:
        f = f0 + (f1 - f0) * t / max(d, 1e-6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    if kind == 'sine':
        return np.sin(ph)
    if kind == 'square':
        return np.sign(np.sin(ph)) * 0.7
    if kind == 'saw':
        y = np.zeros(n)
        for h in range(1, 14):
            y += np.sin(h * ph) / h * (h * f < SR / 2.2)
        return y * 0.55
    if kind == 'tri':
        return 2 / np.pi * np.arcsin(np.sin(ph))
    raise ValueError(kind)


def place(sig, t, gain=1.0, pan=0.0, rev=0.15):
    """Mono (or stereo) signal into the mix at time t; pan −1..1 (array allowed)."""
    if t >= DUR:
        return
    i = int(max(0.0, t) * SR)
    if sig.ndim == 1:
        p = np.clip(pan, -1, 1)
        lg, rg = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
        st = np.vstack([sig * lg, sig * rg])
    else:
        st = sig
    n = min(st.shape[1], N - i)
    if n <= 0:
        return
    dry[:, i:i + n] += st[:, :n] * gain
    send[:, i:i + n] += st[:, :n] * gain * rev


def mix(*xs):
    """Sum signals of different lengths (shorter ones are padded with silence)."""
    n = max(len(x) for x in xs)
    out = np.zeros(n)
    for x in xs:
        out[:len(x)] += x
    return out


def pan_line(n, p0, p1):
    return np.linspace(p0, p1, n)


# ── sound vocabulary ─────────────────────────────────────────────
def whoosh(d, f0=300, f1=3000, peak=0.65, width=0.9):
    x = sweep(noise(d), f0, f1, 'bp', width)
    n = len(x)
    k = np.arange(n) / n
    e = np.where(k < peak, (k / peak) ** 2, ((1 - k) / (1 - peak)) ** 1.5)
    return x * e * 2.2


def impact(scale=1.0):
    d = 1.6
    n = int(d * SR)
    sub = osc(62, d, 30) * dec(n, 0.42)
    body = filt(noise(d), 'lowpass', 380, 4) * dec(n, 0.18) * 1.6
    crack = filt(noise(d), 'highpass', 2500) * dec(n, 0.025) * 0.9
    return mix(sub * 1.2, body, crack) * scale


def riser(d):
    n = int(d * SR)
    k = np.arange(n) / n
    x = sweep(noise(d), 250, 7000, 'highpass') * k ** 2.2 * 1.3
    tone = (osc(110, d, 440, 'saw') * 0.35 + osc(165, d, 660, 'saw') * 0.25)
    tone = sweep(tone, 400, 5000, 'lowpass') * k ** 2.6
    return x + tone


def click(f=2400, d=0.03, tau=0.006, noisy=0.6):
    n = int(d * SR)
    return mix(osc(f, d) * (1 - noisy), filt(noise(d), 'bp', (f * 0.6, f * 1.8)) * noisy * 2)[:n] * dec(n, tau)


def beep(f, d=0.1, harm=0.15, kind='sine'):
    n = int(d * SR)
    return mix(osc(f, d, kind=kind), harm * osc(f * 3, d))[:n] * env(n, 0.004, 0.02)


def bell(f, d=1.6, ratio=1.4, index=2.5, tau=0.55):
    n = int(d * SR)
    t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * f * ratio * t) * index * dec(n, tau * 0.5)
    return np.sin(2 * np.pi * f * t + mod) * dec(n, tau) * env(n, 0.002, 0.05)


def pluck(f, d=1.2, damp=0.996):
    n = int(d * SR)
    p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = damp * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return filt(out, 'lowpass', 5000) * env(n, 0.001, 0.08)


def bubble(f0=500, d=0.09, up=2.4):
    n = int(d * SR)
    return osc(f0, d, f0 * up) * np.sin(np.pi * np.arange(n) / n) ** 1.5


def pad(freqs, d, cutoff=1400, detune=0.004, a=0.6, r=0.6, kind='saw'):
    x = np.zeros(int(d * SR))
    for f in freqs:
        for dt in (-detune, detune):
            x += osc(f * (1 + dt), d, kind=kind)
    x = filt(x, 'lowpass', cutoff, 2) / len(freqs)
    return x * env(len(x), a, r)


def hum(f, d, harms=(1, 0.5, 0.25, 0.12)):
    x = sum(h * osc(f * (i + 1), d) for i, h in enumerate(harms))
    return x * env(len(x), 0.2, 0.2)


def square_note(f, d, duty_env=True):
    n = int(d * SR)
    return osc(f, d, kind='square') * env(n, 0.002, min(0.03, d / 3))


def formant_voice(f0, d, vowel=((800, 80, 1.0), (1150, 90, 0.5), (2900, 120, 0.22))):
    n = int(d * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.012 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.4, 0, 1)
    src = osc(f0, d, kind='saw') if False else None
    ph = 2 * np.pi * np.cumsum(f0 * vib) / SR
    src = sum(np.sin(h * ph) / h for h in range(1, 40) if h * f0 < 6000)
    src += filt(noise(d), 'bp', (1500, 6000)) * 0.04
    y = np.zeros(n)
    for fc, bw, g in vowel:
        y += filt(src, 'bp', (fc - bw, fc + bw)) * g
    return y * 1.8


def clink(f=3100, d=0.35):
    n = int(d * SR)
    parts = [(1.0, 1.0, 0.09), (2.41, 0.5, 0.06), (3.86, 0.3, 0.04), (5.4, 0.2, 0.03)]
    return sum(g * osc(f * r, d) * dec(n, tau) for r, g, tau in parts) * env(n, 0.001, 0.02)


def thud(f0=95, f1=45, d=0.35, slap=0.6):
    n = int(d * SR)
    return mix(osc(f0, d, f1) * dec(n, 0.09) * 1.4, filt(noise(d), 'bp', (300, 2500)) * dec(n, 0.02) * slap)


def crackle(d, density=400, hp=3000):
    n = int(d * SR)
    x = np.zeros(n)
    idx = rng.integers(0, n, int(density * d))
    x[idx] = rng.uniform(-1, 1, len(idx))
    return filt(x, 'highpass', hp) * 3


def bitcrush(x, bits=4, hold=6):
    y = np.repeat(x[::hold], hold)[:len(x)]
    q = 2 ** bits
    return np.round(y * q) / q


def reverb_ir(d=2.4, tau=0.7):
    n = int(d * SR)
    ir = np.vstack([noise(d), noise(d)]) * dec(n, tau)
    ir = np.vstack([filt(ir[0], 'lowpass', 6000), filt(ir[1], 'lowpass', 6000)])
    ir[:, :int(0.012 * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))


# ── ambience beds (one per world) ───────────────────────────────
scenes = [
    ('open', 0.0, b(17)), ('counter', b(17), b(21)), ('innerself', b(21), b(24)), ('voice', b(24), b(26)),
    ('trash', b(26), BREAKS[0]), ('face', b(29), b(32)), ('hand', b(32), b(35)), ('stock', b(35), BREAKS[1]),
    ('payroll', b(37), b(39)), ('laptop', b(39), b(41)), ('math', b(41), b(43)), ('recap', b(43), BREAKS[2]),
    ('outro', b(45), DUR),
]


def bed(name, d):
    if name == 'open':
        x = pad([110, 164.8, 220, 329.6, 493.9], d, 1100, kind='sine') * 0.9 + filt(noise(d), 'bp', (2000, 9000)) * 0.03
    elif name == 'counter':
        x = osc(36.7, d) * 0.9 + osc(73.4, d) * 0.35 + filt(noise(d), 'lowpass', 220) * 0.5 + hum(120, d) * 0.05
    elif name == 'innerself':
        x = pad([174.6, 220, 261.6, 329.6, 392], d, 1600, kind='sine') * (1 + 0.15 * np.sin(2 * np.pi * 0.8 * T(d)))
    elif name == 'voice':
        x = filt(noise(d), 'lowpass', 700) * 0.35 + filt(noise(d), 'highpass', 7000) * 0.05 + hum(50, d) * 0.08
    elif name == 'trash':
        x = hum(50, d, (1, 0.6, 0.4, 0.2)) * 0.35 + filt(noise(d), 'bp', (200, 1200)) * 0.12
    elif name == 'face':
        x = hum(60, d, (1, 0.7, 0.5, 0.3, 0.2)) * 0.3 + osc(4200, d) * 0.01 + filt(noise(d), 'lowpass', 300) * 0.2
    elif name == 'hand':
        x = pad([261.6, 329.6, 392, 523.3], d, 2200, kind='tri') * (1 + 0.25 * np.sin(2 * np.pi * 2.0 * T(d)))
    elif name == 'stock':
        x = filt(noise(d), 'lowpass', 400) * 0.45 + osc(55, d) * 0.3
    elif name == 'payroll':
        x = filt(noise(d), 'bp', (200, 1500)) * 0.12
        for k in np.arange(0.1, d, 0.5):
            i = int(k * SR)
            c = click(3200, 0.02, 0.003, 0.3) * 0.25
            x[i:i + len(c)] += c[:len(x) - i]
    elif name == 'laptop':
        x = pad([146.8, 220, 277.2, 329.6], d, 1200, kind='sine')
    elif name == 'math':
        x = np.zeros(int(d * SR))
        notes = [130.8, 164.8, 196, 164.8]
        step = B / 2
        for j, k in enumerate(np.arange(0, d, step)):
            s = square_note(notes[j % 4], step * 0.8) * 0.5
            i = int(k * SR)
            x[i:i + len(s)] += s[:len(x) - i]
    elif name == 'recap':
        x = pad([196, 246.9, 293.7, 392], d, 900, kind='sine') * np.linspace(0.4, 1.2, int(d * SR))
    elif name == 'outro':
        x = pad([110, 164.8, 220, 277.2, 329.6, 440], d, 1300, a=0.4, r=2.2, kind='sine') * 1.2
    return x


bed_gain = {'open': 0.05, 'counter': 0.07, 'innerself': 0.05, 'voice': 0.05, 'trash': 0.05, 'face': 0.05, 'hand': 0.04,
            'stock': 0.05, 'payroll': 0.06, 'laptop': 0.045, 'math': 0.035, 'recap': 0.05, 'outro': 0.07}
for name, t0, t1 in scenes:
    a, z = max(0, t0 - 0.12), min(DUR, t1 + 0.15)
    x = bed(name, z - a) * env(int((z - a) * SR), 0.25, 0.25)
    place(x, a, bed_gain[name] * 1.3, 0, rev=0.25)


# ── OPENING ─────────────────────────────────────────────────────
place(whoosh(0.7, 3000, 500, 0.5), 0.0, 0.18, pan_line(int(0.7 * SR), 0.8, 0), 0.3)            # streak sweeps in
place(filt(noise(1.6), 'lowpass', 160) * env(int(1.6 * SR), 0.6, 0.8) * 2, 0.25, 0.12, 0, 0.1)  # letterbox closes
for i, f in enumerate([1568, 2093, 2637, 3136]):                                                 # sparkle
    place(bell(f, 2.2, 2.0, 1.2, 0.9), b(1) - 0.05 + i * 0.035, 0.05, (-0.3 + i * 0.2), 0.6)
place(crackle(0.7, 160, 6000) * dec(int(0.7 * SR), 0.25), b(1), 0.1, 0, 0.5)                      # halo shimmer
for i, f in enumerate([523.3, 587.3, 659.3, 784, 880, 1046.5]):                                  # name letters
    place(bell(f * 2, 0.9, 3.0, 0.8, 0.35), b(2) + 0.04 + i * 0.06, 0.035, -0.4 + i * 0.16, 0.5)
place(whoosh(0.6, 1500, 6000, 0.7), b(3) - 0.05, 0.06, 0, 0.3)                                   # subtitle tracking
place(whoosh(0.5, 4000, 400, 0.8)[::-1].copy(), b(4) - 0.45, 0.12, 0, 0.4)                       # mark blurs out
g = np.zeros(int(1.6 * SR))                                                                       # particles gather
for k in range(160):
    i = int(rng.uniform(0, 1.5) * SR)
    s = bell(rng.uniform(2500, 7000), 0.12, 1.5, 0.5, 0.03)
    g[i:i + len(s)] += s[:len(g) - i] * (i / len(g)) ** 1.5
place(g, b(4) - 0.1, 0.05, 0, 0.6)
for k in range(6):                                                                                # aperture blades
    place(click(1700 + k * 60, 0.03, 0.005, 0.7), b(5) - 0.3 + k * 0.045, 0.06, -0.3 + k * 0.12, 0.3)
place(osc(55, 2.5, 50) * env(int(2.5 * SR), 1.0, 1.2) * 0.8, b(5), 0.08, 0, 0.2)                 # low swell
place(whoosh(0.8, 300, 5000, 0.3), b(7.55) - 0.05, 0.22, 0, 0.4)                                 # blow out toward camera
place(impact(0.35), b(7.6), 0.18, 0, 0.5)
place(mix(bell(1318.5, 1.2, 2.0, 0.6, 0.4), bell(1975.5, 1.2, 2.0, 0.6, 0.4) * 0.6), b(8) + 0.1, 0.05, 0.1, 0.6)  # "Hai"
place(whoosh(0.7, 400, 2500, 0.7), b(9) - 0.1, 0.1, 0, 0.3)                                       # card rises
for i in range(4):
    place(bubble(700 + i * 120, 0.06, 1.8), b(9.6) + i * 0.06, 0.05, -0.3 + i * 0.2, 0.2)          # chips
nkeys = 24
for i in range(nkeys):                                                                            # typing
    t = b(10) + (i + 0.5) * (B * 1.15) / nkeys
    place(click(rng.uniform(1600, 2600), 0.035, 0.007, 0.8), t, 0.08, rng.uniform(-0.25, 0.25), 0.1)
place(whoosh(0.5, 2000, 900, 0.5), b(11.2), 0.03, 0.6, 0.1)                                     # cursor
place(mix(click(1200, 0.05, 0.012, 0.5), click(2400, 0.05, 0.004, 0.8)), b(12) - 0.06, 0.16, 0.3, 0.2)  # send
place(whoosh(0.6, 2500, 300, 0.4), b(12) + 0.08, 0.14, 0, 0.4)                                   # UI tilts away
place(bubble(320, 0.16, 2.5) * 1.2, b(13) - 0.24, 0.12, 0, 0.3)                                   # pill
blips = np.zeros(int((b(15) - b(13)) * SR))                                                      # analysing chatter
for k in np.arange(0, len(blips) / SR - 0.05, 0.055):
    s = beep(rng.choice([1760, 2093, 2349, 2637, 3136]), 0.03, 0.05) * 0.5
    i = int(k * SR)
    blips[i:i + len(s)] += s[:len(blips) - i]
place(blips, b(13), 0.05, 0, 0.3)
for i in range(11):
    a = -np.pi / 2 + i / 11 * 2 * np.pi
    place(whoosh(0.18, 2500, 5000, 0.4), b(13) + 0.04 + i * 0.022, 0.03, np.cos(a) * 0.8, 0.2)    # repos arrive
place(whoosh(0.6, 5000, 250, 0.85), b(14) - 0.1, 0.22, 0, 0.4)                                   # sucked into the pill
place(bubble(220, 0.25, 3.0), b(14) + 0.32, 0.12, 0, 0.4)
place(pad([523.3, 659.3, 784, 1046.5], 1.0, 4000, a=0.25, r=0.6, kind='sine'), b(15) - 0.06, 0.08, 0, 0.6)  # panel opens
for i in range(10):
    place(click(3000 + i * 90, 0.02, 0.003, 0.5), b(15) + 0.1 + i * 0.034, 0.04, -0.2 + i * 0.04, 0.2)
place(whoosh(0.4, 3000, 300, 0.85), b(16) - 0.1, 0.16, 0, 0.4)                                   # panel folds
place(bell(2637, 1.0, 2.0, 1.0, 0.4), b(16) + 0.16, 0.05, 0, 0.6)
place(riser(DROP - (b(16) + 0.2)), b(16) + 0.2, 0.32, 0, 0.3)                                   # rush into the drop

# ── 01 DENSE OBJECT COUNTER ─────────────────────────────────────
place(impact(1.0), DROP, 0.75, 0, 0.45)
place(thud(140, 60, 0.4, 1.0), DROP + 0.02, 0.35, 0, 0.3)                                         # title slam
for i, (rank, x) in enumerate(zip(CUE['beadRank'], CUE['beadX'])):                               # beads land and bounce
    t0 = DROP + rank * 0.009
    for k, g in ((0.364, 0.11), (0.727, 0.05), (0.909, 0.025)):
        place(click(rng.uniform(1800, 4200), 0.04, 0.008, 0.55), t0 + k * 0.62, g, x * 0.8, 0.15)
place(sweep(osc(800, 0.45, 2400, 'saw'), 1000, 5000, 'lowpass') * env(int(0.45 * SR), 0.02, 0.1) * 0.6, b(17.6), 0.06, -0.4, 0.3)  # ROI draws
place(mix(osc(85, 0.8, 70, 'saw') * 0.5, osc(1250, 0.8, 1100) * 0.05) * env(int(0.8 * SR), 0.1, 0.3), b(17.75), 0.16, 0.2, 0.2)  # webcam motor
place(thud(160, 120, 0.15, 0.4), b(17.75) + 0.62, 0.12, 0.2, 0.2)                                 # webcam settles
for i in range(9):
    place(beep(1800 + i * 80, 0.03, 0.1), b(18) + i * 0.035, 0.035, -0.5 + i * 0.12, 0.2)          # tiles
for k in range(6):
    place(click(3400, 0.02, 0.004, 0.6), b(18.2) + k * 0.045, 0.06, 0.2, 0.1)                       # focus ring
for k in range(3):
    place(beep(2800, 0.05), SHUTTER - 0.24 + k * 0.08, 0.07, 0.2, 0.2)                              # LED countdown
place(osc(3000, 0.32, 7500) * env(int(0.32 * SR), 0.25, 0.02) * 0.4, SHUTTER - 0.34, 0.06, 0.2, 0.1)  # flash charge
place(click(2600, 0.04, 0.006, 0.8) * 1.4, SHUTTER, 0.4, 0.2, 0.2)                                # shutter
place(click(1700, 0.05, 0.01, 0.7), SHUTTER + 0.045, 0.32, 0.2, 0.2)
place(filt(noise(0.2), 'lowpass', 1200) * dec(int(0.2 * SR), 0.05) * 1.2, SHUTTER, 0.3, 0.2, 0.3)  # flash pop
sd = SCAN[1] - SCAN[0]                                                                            # laser scan
ns = int(sd * SR)
tt = np.arange(ns) / SR
laser = np.sin(2 * np.pi * np.cumsum(1500 + 300 * tt / sd + 40 * np.sin(2 * np.pi * 28 * tt)) / SR) * 0.5
laser += sweep(osc(110, sd, kind='saw'), 600, 3200, 'bp', 0.5) * 0.8 + filt(noise(sd), 'bp', (3500, 6000)) * 0.25
place(laser * env(ns, 0.05, 0.1), SCAN[0], 0.16, pan_line(ns, -0.8, 0.8), 0.2)
for tpass, x in zip(CUE['scanPass'], CUE['beadX']):                                              # a blip as each box pops
    place(beep(2000 + (x + 1) * 900, 0.025, 0.0), tpass, 0.035, x * 0.8, 0.15)
place(bell(1046.5, 1.0, 2.0, 0.6, 0.3), SCAN[1], 0.05, 0.8, 0.4)
place(whoosh(0.6, 400, 1600, 0.5), b(20) - 0.05, 0.08, 0, 0.3)                                   # camera pulls up
for k in range(4):
    place(beep(2600 + k * 200, 0.03), b(20) + 0.42 + k * 0.05, 0.04, 0.5, 0.2)                      # JSON
place(whoosh(b(21) - b(20.55) + 0.1, 200, 5000, 0.92), b(20.55), 0.25, 0, 0.3)                    # dive
place(pad([523.3, 784, 1046.5], 0.9, 5000, a=0.05, r=0.7, kind='sine'), b(21) - 0.1, 0.06, 0, 0.7)  # iris opens

# ── 02 INNERSELF ────────────────────────────────────────────────
for i, f in enumerate([349.2, 440, 523.3, 659.3, 784, 880, 1046.5]):                            # harp glissando
    place(pluck(f, 1.4), b(21) + i * 0.045, 0.12, -0.6 + i * 0.2, 0.5)
place(mix(bubble(260, 0.3, 2.2) * 0.8, bell(523.3, 1.4, 2.0, 0.6, 0.6) * 0.5), b(21), 0.12, 0.3, 0.6)  # orb pops
for i in range(5):
    place(pluck([587.3, 659.3, 784, 880, 987.8][i], 0.8), b(21.4) + i * 0.05, 0.06, -0.5 + i * 0.25, 0.4)  # reasons appear
    place(bubble(500 + i * 90, 0.18, 2.4), b(22) - 0.1 + i * 0.06 + 0.3, 0.07, 0.4, 0.4)              # fly into the orb
place(crackle(0.5, 250, 7000) * dec(int(0.5 * SR), 0.2), b(22), 0.05, 0.3, 0.6)                   # wires light
for f in (523.3, 659.3, 784, 987.8):                                                              # Te–Ni–Se–Fi
    place(bell(f, 2.0, 2.0, 0.8, 0.8), b(23), 0.06, 0.2, 0.6)
place(whoosh(0.35, 2500, 300, 0.85), b(24) - 0.32, 0.14, 0.3, 0.3)                                # squash to a line

# ── 03 VOICE DATASET ────────────────────────────────────────────
place(beep(1000, 0.16), b(24), 0.1, 0.5, 0.1)                                                     # REC
place(thud(110, 70, 0.2, 0.5), b(24) + 0.02, 0.12, 0, 0.2)                                        # mic bump
vd = b(26) - b(24) + 0.1
v = sum(formant_voice(f, vd) for f in (196, 246.9, 293.7)) / 3
place(v * env(len(v), 0.25, 0.3), b(24) + 0.05, 0.14, 0, 0.5)                                     # "aah" voice chord
for i in range(5):
    place(click(2800, 0.02, 0.004), b(24.5) + i * 0.05, 0.04, 0.5, 0.1)                           # spec chips
for i in range(6):
    place(click(2400 + i * 100, 0.02, 0.004), b(25) - 0.05 + i * 0.05, 0.04, 0.5, 0.1)             # pipeline
place(whoosh(0.3, 300, 4000, 0.9), b(26) - 0.26, 0.18, 0, 0.2)                                   # bars rise
place(thud(90, 55, 0.25, 0.4), b(26), 0.18, 0, 0.3)

# ── 04 SMART TRASH ──────────────────────────────────────────────
place(whoosh(0.8, 300, 2500, 0.5), b(26), 0.12, -0.3, 0.3)                                        # board spins in
place(thud(130, 80, 0.2, 0.7), b(26) + 0.82, 0.18, 0, 0.2)
place(mix(beep(1760, 0.06), beep(2349, 0.08) * 0.8), b(26) + 0.38, 0.06, -0.2, 0.2)                   # power LED
for i in range(5):
    place(click(2200 + i * 150, 0.02, 0.004), b(26.55) + i * 0.08, 0.04, -0.5 + i * 0.2, 0.1)
for tp in (b(26.7), b(27.7)):                                                                     # command along the wire
    place(osc(900, 0.28, 2600, 'square') * env(int(0.28 * SR), 0.01, 0.05) * 0.25, tp, 0.05, 0.5, 0.2)


def servo(d=0.32, up=True):
    n = int(d * SR)
    f = osc(150, d, 210 if up else 120, 'saw')
    am = 1 + 0.4 * np.sin(2 * np.pi * 38 * T(d))
    return mix(filt(f * am, 'bp', (250, 3000)) * env(n, 0.01, 0.06) * 1.6, click(900, 0.04, 0.01) * 0.6)


for tb, side, item in ((b(27), -1, 'leaf'), (b(28), 1, 'bottle')):
    if item == 'leaf':
        place(crackle(0.32, 900, 2500) * env(int(0.32 * SR), 0.05, 0.05), tb - 0.32, 0.08, 0.6, 0.2)   # leaf falls
    else:
        place(whoosh(0.32, 800, 2600, 0.8), tb - 0.32, 0.08, 0.6, 0.2)
        place(sum(g * osc(f, 0.3) * dec(int(0.3 * SR), tau) for f, g, tau in ((260, 1, .09), (615, .6, .06), (1180, .4, .04))), tb, 0.22, 0.6, 0.2)  # bottle clunk
    place(servo(0.32, side > 0), tb, 0.22, 0.5, 0.2)
    place(whoosh(0.45, 1200, 400, 0.3), tb + 0.02, 0.12, pan_line(int(0.45 * SR), 0.5, side), 0.2)   # flicked
    place(bell(1568, 0.6, 2.0, 0.5, 0.2), tb + 0.15, 0.05, 0.7, 0.3)                                  # Blynk counter
cd = 0.6                                                                                          # CRT switch-off
crt = osc(2600, 0.14, 50) * dec(int(0.14 * SR), 0.08) * 0.6
crt = np.concatenate([crt, np.zeros(int((cd - 0.14) * SR))])
crt += crackle(cd, 800, 3500) * dec(int(cd * SR), 0.2) * 0.6 + thud(90, 40, cd, 0.3) * 0.8
place(crt, BREAKS[0], 0.32, 0, 0.3)
place(osc(220, b(29) - BREAKS[0] - 0.25) * 0.05 * env(int((b(29) - BREAKS[0] - 0.25) * SR), 0.05, 0.1), BREAKS[0] + 0.25, 0.3, 0, 0.1)  # the dot

# ── 05 FACE RECOGNITION ─────────────────────────────────────────
place(mix(osc(80, 0.15, 2200) * env(int(0.15 * SR), 0.005, 0.05) * 0.5, click(4000, 0.05, 0.01)), b(29), 0.18, -0.5, 0.2)   # power on
place(osc(1200, 0.5, 2400) * env(int(0.5 * SR), 0.05, 0.1) * 0.25, b(29) + 0.14, 0.12, pan_line(int(0.5 * SR), 0, 0.9), 0.2)  # scan line
for k in np.arange(0, 0.55, 0.028):                                                               # title decodes
    place(beep(rng.choice([1400, 1800, 2200, 2600, 3000]), 0.018, 0.0, 'square') * 0.4, b(29) + 0.08 + k, 0.05, -0.5, 0.1)
place(beep(2637, 0.05), b(29) + 0.27, 0.07, 0.5, 0.2)
place(beep(2637, 0.05), b(29) + 0.35, 0.07, 0.5, 0.2)
place(osc(600, b(30) - b(29), 300) * 0.06 * env(int((b(30) - b(29)) * SR), 0.1, 0.1), b(29), 0.4, 0.4, 0.2)  # scan ring descends
place(crackle(0.45, 600, 6000) * env(int(0.45 * SR), 0.02, 0.2), b(30), 0.06, 0.4, 0.4)           # face mesh draws
place(click(3000, 0.02, 0.003), b(30), 0.04, -0.5, 0.1)
for tb in (b(30.5), b(30.85)):
    place(click(1500, 0.03, 0.006, 0.4), tb, 0.06, 0.4, 0.1)                                        # blinks
place(beep(3136, 0.05) * 0.8, b(30.5) + 0.06, 0.05, -0.4, 0.2)
place(beep(3520, 0.06) * 0.8, b(30.5) + 0.13, 0.05, -0.4, 0.2)
place(bell(1318.5, 1.0, 2.0, 0.7, 0.35), b(31), 0.1, -0.3, 0.4)                                  # access granted
place(bell(1760, 1.2, 2.0, 0.7, 0.45), b(31) + 0.12, 0.1, -0.3, 0.4)
md = 0.75                                                                                        # morph into the hand
grains = np.zeros(int(md * SR))
for k in range(220):
    i = int(rng.uniform(0, md - 0.05) * SR)
    s = bell(rng.uniform(1800, 6500), 0.05, 1.3, 0.4, 0.015)
    grains[i:i + len(s)] += s[:len(grains) - i]
place(grains * 0.6 + whoosh(md, 600, 3500, 0.5), b(32), 0.14, 0.3, 0.4)

# ── 06 HAND GESTURE ─────────────────────────────────────────────
for i in range(11):
    place(bubble(380 + i * 35, 0.08, 2.0), b(32) + 0.22 + i * 0.035, 0.07, -0.6 + i * 0.06, 0.2)  # letters bounce in
for i, tb in enumerate((b(33), b(33.5), b(34), b(34.5))):
    place(whoosh(0.2, 1200, 4500, 0.6), tb - 0.12, 0.1, 0.4, 0.2)                                 # finger move
    place(bubble([520, 660, 440, 780][i], 0.12, 2.0) * 1.3, tb, 0.12, -0.5, 0.2)                    # chip pops
place(whoosh(0.5, 300, 6000, 0.6), b(35) - 0.3, 0.3, pan_line(int(0.5 * SR), -0.9, 0.9), 0.2)  # swipe

# ── 07 STOCK RECORDING ──────────────────────────────────────────
place(thud(110, 55, 0.3, 0.9), b(35) + 0.08, 0.3, -0.3, 0.3)                                      # title stamps
place(thud(100, 50, 0.3, 0.9), b(35) + 0.16, 0.26, -0.3, 0.3)
place(whoosh(0.4, 1500, 4000, 0.5), b(35) + 0.12, 0.08, 0.6, 0.2)                                # label slides in
place(osc(1850, 0.12, kind='square') * env(int(0.12 * SR), 0.003, 0.01) * 0.5, b(35.5), 0.16, 0.5, 0.15)  # barcode beep
place(bell(1046.5, 0.6, 2.0, 0.5, 0.2) * 0.6 + bell(1318.5, 0.6, 2.0, 0.5, 0.2) * 0.4, b(35.75), 0.06, 0, 0.3)  # pending
for i in range(2):
    place(click(2600, 0.02, 0.004), b(35.6) + i * 0.07, 0.04, -0.4, 0.1)
place(thud(80, 42, 0.5, 1.4) * 1.3, b(36) - 0.02, 0.5, 0.5, 0.35)                                 # APPROVED stamp
place(filt(noise(0.15), 'bp', (800, 4000)) * dec(int(0.15 * SR), 0.03), b(36) - 0.02, 0.2, 0.5, 0.2)
for k in range(19):                                                                               # pixel staircase
    place(osc(300 * 2 ** (k / 12), 0.035, kind='square') * env(int(0.035 * SR), 0.002, 0.01) * 0.4, BREAKS[1] + k * 0.024, 0.05, -0.8 + k * 0.09, 0.15)

# ── 08 PAYROLL ──────────────────────────────────────────────────
for k in range(19):
    place(osc(1200 * 2 ** (-k / 12), 0.025, kind='square') * env(int(0.025 * SR), 0.002, 0.008) * 0.35, b(37) - 0.06 + k * 0.011, 0.04, 0.8 - k * 0.09, 0.1)
pd = 0.65                                                                                         # slip prints
pr = filt(osc(170, pd, kind='saw') * (1 + 0.6 * np.sign(np.sin(2 * np.pi * 32 * T(pd)))), 'bp', (400, 3500)) * 0.6
pr += crackle(pd, 300, 4000) * 0.4
place(pr * env(int(pd * SR), 0.02, 0.05), b(37) + 0.3, 0.12, 0.6, 0.15)
for i in range(5):                                                                                # coins stack
    place(clink(2900 + i * 180), b(37.5) + i * B * 0.25, 0.14, 0.3, 0.25)
for i in range(5):
    place(bubble(600 + i * 70, 0.07, 1.6), b(38) - 0.06 + i * 0.06, 0.06, -0.5 + i * 0.15, 0.2)      # formula cards
for k in np.arange(0, 0.6, 0.025):
    place(click(3500, 0.012, 0.002, 0.2), b(38) + 0.25 + k, 0.03, 0.4, 0.05)                        # amount rolls
kc = bell(2093, 1.2, 1.41, 2.0, 0.45) + bell(2637, 1.2, 1.41, 2.0, 0.45) * 0.7
place(kc, b(38) + 0.85, 0.1, 0.4, 0.4)                                                            # ka-ching
place(thud(130, 70, 0.15, 0.6), b(38) + 0.85, 0.08, 0.4, 0.2)
place(whoosh(0.35, 800, 3500, 0.85), b(39) - 0.32, 0.14, 0, 0.2)                                  # blueprint sheet

# ── 09 LAPTOP RECOMMENDATION ────────────────────────────────────
for d, f in enumerate((523.3, 659.3, 784, 1046.5)):                                              # tree grows
    s = osc(f, 0.3) * dec(int(0.3 * SR), 0.06) + osc(f * 4, 0.3) * dec(int(0.3 * SR), 0.015) * 0.3
    place(s, b(39) + 0.06 + d * 0.09, 0.12, 0, 0.3)
place(filt(noise(0.4), 'bp', (3000, 7000)) * env(int(0.4 * SR), 0.05, 0.1) * 0.5, b(39), 0.04, 0.3, 0.1)  # lines drawn
for j in range(6):                                                                                # lens hops
    place(osc(700 + j * 60, 0.12, 1100 + j * 60) * env(int(0.12 * SR), 0.005, 0.06) * 0.6, b(39.5) + j * B * 0.25 - 0.12, 0.08, -0.2 + j * 0.1, 0.2)
place(whoosh(0.35, 1000, 2600, 0.5), b(39.6), 0.05, -0.4, 0.2)                                   # range slider
for i, f in enumerate((784, 880, 1046.5, 1174.7, 1318.5, 1568)):                                 # results light up
    place(bell(f, 1.0, 2.0, 0.6, 0.3), b(40) + i * 0.03, 0.04, -0.3 + i * 0.12, 0.4)
for i in range(3):
    place(thud(170, 110, 0.12, 0.4), b(40.75) + i * 0.06 + 0.2, 0.12, 0.2 + i * 0.2, 0.2)              # laptops land
gl = bitcrush(filt(noise(0.34), 'bp', (500, 5000)), 3, 30) * np.repeat(rng.uniform(0, 1, 34) > 0.45, int(0.01 * SR))[:int(0.34 * SR)]
place(gl, b(41) - 0.34, 0.12, 0, 0.1)                                                             # mosaic

# ── 10 MATH GAME ────────────────────────────────────────────────
place(osc(220, 0.3, 1760, 'square') * env(int(0.3 * SR), 0.005, 0.05) * 0.5, b(41) + 0.04, 0.1, 0, 0.1)  # power up
for k in range(6):
    place(square_note(880, 0.03) * 0.5, b(41) + 0.12 + k * 0.05, 0.06, -0.2, 0.1)                   # equation types
for i, f in enumerate((1046.5, 1318.5, 1568, 2093)):                                              # correct!
    place(square_note(f, 0.07 if i < 3 else 0.22) * 0.5, b(41.6) + i * 0.07, 0.1, 0, 0.15)
for tb in (b(41.6) + 0.02, b(42.5)):                                                              # coins burst
    place(square_note(987.8, 0.06) * 0.5, tb, 0.08, 0.3, 0.15)
    place(square_note(1318.5, 0.25) * 0.5, tb + 0.06, 0.08, 0.3, 0.15)
for i in range(3):
    place(square_note(523.3 * 2 ** (i * 4 / 12), 0.06) * 0.5, b(42) + i * B * 0.33, 0.07, -0.4 + i * 0.4, 0.1)  # levels
for i in range(4):
    place(square_note(1568, 0.03) * 0.4, b(42.2) + i * 0.06, 0.05, -0.3 + i * 0.2, 0.1)              # operators
for k in np.arange(0, B * 0.9, 0.04):
    place(square_note(2093, 0.015) * 0.3, b(42) + k, 0.03, -0.6, 0.05)                              # score rolls
place(whoosh(0.4, 600, 6000, 0.85), b(43) - 0.3, 0.16, 0, 0.3)

# ── RECAP ──────────────────────────────────────────────────────
for i in range(10):
    place(filt(noise(0.05), 'bp', (1500, 5000)) * dec(int(0.05 * SR), 0.01) * 1.5, b(43) + 0.04 + i * 0.045, 0.1, -0.8 + i * 0.18, 0.2)  # tiles flip in
cl = whoosh(0.5, 6000, 400, 0.92)                                                                # collapse into the sparkle
place(cl, BREAKS[2], 0.24, 0, 0.3)
for i, f in enumerate((1568, 2093, 2637)):
    place(bell(f, 1.6, 2.0, 0.9, 0.6), BREAKS[2] + 0.3 + i * 0.04, 0.05, 0, 0.6)
place(riser(b(45) - BREAKS[2] - 0.35) * 0.6, BREAKS[2] + 0.35, 0.16, 0, 0.3)

# ── OUTRO ──────────────────────────────────────────────────────
place(impact(1.2), b(45), 0.8, 0, 0.6)
for i, f in enumerate((440, 554.4, 659.3, 880, 1108.7, 1318.5)):
    place(bell(f, 3.0, 2.0, 0.9, 1.2), b(45) + 0.02 + i * 0.03, 0.05, -0.5 + i * 0.2, 0.7)
place(whoosh(1.0, 2000, 7000, 0.7) * 0.5, b(45.5), 0.06, 0, 0.5)                                  # rules extend
place(click(2600, 0.02, 0.004), b(46) + 0.06, 0.04, 0, 0.3)                                     # link
for tb in (b(46), b(47)):                                                                        # sparkles
    for k in range(10):
        place(bell(rng.uniform(2200, 5200), 0.8, 2.0, 0.6, 0.25), tb + k * 0.02, 0.025, rng.uniform(-0.9, 0.9), 0.7)

# ── mix & master ───────────────────────────────────────────────
ir = reverb_ir()
wet = np.vstack([fftconvolve(send[0], ir[0])[:N], fftconvolve(send[1], ir[1])[:N]])
mix = dry + wet * 0.55
mix = np.vstack([filt(ch, 'highpass', 28) for ch in mix])
mix /= np.abs(mix).max()
# Gentle bus compression (3:1 above −25 dB, linked stereo) so quiet details read on laptop and phone speakers.
lvl = np.abs(mix).max(axis=0)
envl = np.zeros_like(lvl)
att, rel = np.exp(-1 / (0.004 * SR)), np.exp(-1 / (0.18 * SR))
e = 0.0
for i in range(0, len(lvl), 32):
    v = lvl[i:i + 32].max()
    e = att * e + (1 - att) * v if v > e else rel * e + (1 - rel) * v
    envl[i:i + 32] = e
thr = 10 ** (-25 / 20)
gain = np.where(envl > thr, (envl / thr) ** (1 / 3 - 1), 1.0)
mix = mix * gain * 10 ** (12 / 20)
mix = np.tanh(mix * 1.5) / np.tanh(1.5)
mix /= np.abs(mix).max()
fade = int(0.9 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 2
mix *= 10 ** (-1.0 / 20)
out_wav = os.path.join(HERE, 'trailer-sfx.wav')
wavfile.write(out_wav, SR, (mix.T * 32767).astype(np.int16))
out_mp3 = os.path.join(ROOT, 'public', 'audio', 'trailer.mp3')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out_wav, '-b:a', '160k', out_mp3], check=True)
os.remove(out_wav)
print('wrote', out_mp3, f'{DUR:.2f}s')
