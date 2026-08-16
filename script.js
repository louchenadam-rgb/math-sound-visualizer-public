/* ══════════════════════════════════════════════
   MATHEMATICS OF SOUND — MAIN SCRIPT
   22 Scenes · Web Audio API · Canvas Morphing
   ══════════════════════════════════════════════ */

'use strict';

// ─── STATE ───────────────────────────────────────
let currentSceneIndex = 0;
const scenes       = document.querySelectorAll('.scene');
const totalScenes  = scenes.length;
const progressBar  = document.getElementById('progress-bar');
const backBtn      = document.getElementById('back-btn');
const sceneCounter = document.getElementById('scene-counter');

// ─── MAIN CANVAS ─────────────────────────────────
const canvas = document.getElementById('waveCanvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── COORDINATE CANVAS (Scene 19) ────────────────
let sceneProgress = 0; // Used for progressive mathematical drawing

// ─── MINI-WAVE CANVASES (Scene 21) ───────────────
const waveCanvases = {
    low:  document.getElementById('wave-low'),
    med:  document.getElementById('wave-med'),
    high: document.getElementById('wave-high'),
};

// ─── WEB AUDIO API ──────────────────────────────
const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let currentOsc = null;

function playTone(frequency, btn) {
    if (!audioCtx) audioCtx = new AudioCtxClass();

    // Stop previous
    if (currentOsc) { try { currentOsc.stop(); } catch(e){} currentOsc = null; }
    document.querySelectorAll('.audio-btn').forEach(b => b.classList.remove('playing'));

    // Oscillator + Gain
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type              = 'sine';
    osc.frequency.value   = frequency;
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.45, audioCtx.currentTime + 0.08);
    gain.gain.linearRampToValueAtTime(0,    audioCtx.currentTime + 1.6);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 1.7);
    currentOsc = osc;

    btn.classList.add('playing');
    setTimeout(() => btn.classList.remove('playing'), 1700);

    // Sync main canvas wave to played frequency
    targetWave.frequency = frequency * 0.000095;
    targetWave.amplitude = 160;
    setTimeout(() => { if(currentSceneIndex === 25) { targetWave.amplitude = 55; targetWave.frequency = 0.01; } }, 1800);
}

document.querySelectorAll('.audio-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const map = { low: 220, med: 440, high: 880 };
        playTone(map[btn.dataset.freq], btn);
    });
});

// ─── WAVE CONFIG (Lerp-able) ─────────────────────
let wave = {
    amplitude: 0, frequency: 0.01, phase: 0,
    numWaves: 1,  complexity: 0,   yOffset: 0,
    alpha: 0,     color: '#00e5ff'
};
let targetWave = { ...wave };

// ─── SCENE WAVE PRESETS ──────────────────────────
const PRESETS = [
    // 0  Scene 1  · Silence
    { amplitude:   0, frequency: 0.010, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
    // 1  Scene 2  · First Wave (tiny)
    { amplitude:  28, frequency: 0.010, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0, color:'#00e5ff' },
    // 2  Scene 3  · Question
    { amplitude:  60, frequency: 0.012, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0.8, color:'#00e5ff' },
    // 3  Scene 4  · sin(x) birth
    { amplitude: 100, frequency: 0.015, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
    // 4  Scene 5  · Motion Insight
    { amplitude: 100, frequency: 0.015, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:1,   color:'#00e5ff' },
    // 5  Scene 6  · Zoom
    { amplitude: 260, frequency: 0.005, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
    // 6  Scene 7  · Cosine
    { amplitude: 100, frequency: 0.015, phase: Math.PI/2,     numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#d500f9' },
    // 7  Scene 8  · Overlay (2 waves drawn specially)
    { amplitude: 100, frequency: 0.015, phase: 0,             numWaves:2, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
    // 8  Scene 9  · Amplitude
    { amplitude: 230, frequency: 0.015, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
    // 9  Scene 10 · Frequency
    { amplitude: 100, frequency: 0.055, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#d500f9' },
    // 10 Scene 11 · Period (cycle highlight drawn in render loop)
    { amplitude:  85, frequency: 0.015, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
    // 11 Scene 12 · Reality transition
    { amplitude:  85, frequency: 0.015, phase: 0,             numWaves:1, complexity:0.3, yOffset:0,   alpha:1,   color:'#00e5ff' },
    // 12 Scene 13 · Sound in Air
    { amplitude: 100, frequency: 0.020, phase: 0,             numWaves:3, complexity:0.6, yOffset:0,   alpha:1,   color:'#00e5ff' },
    // 13 Scene A  · What is sound?
    { amplitude:  60, frequency: 0.020, phase: 0,             numWaves:1, complexity:0.3, yOffset:0,   alpha:0.5, color:'#00e5ff' },
    // 14 Scene 14 · Sources (dim bg)
    { amplitude:  35, frequency: 0.025, phase: 0,             numWaves:1, complexity:0.8, yOffset:0,   alpha:0.15,color:'#d500f9' },
    // 15 Scene B  · Wave Types
    { amplitude:  30, frequency: 0.020, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0.3, color:'#d500f9' },
    // 16 Scene 15 · NEW Sound Propagation
    { amplitude:  20, frequency: 0.020, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0.2, color:'#00e5ff' },
    // 17 Scene C  · Compression & Rarefaction
    { amplitude:   0, frequency: 0.015, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0.1, color:'#00e5ff' },
    // 18 Scene 16 · Equation
    { amplitude:   0, frequency: 0.015, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
    // 19 Scene 17 · Param A (dynamic amp)
    { amplitude: 100, frequency: 0.015, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:1,   color:'#00e5ff' },
    // 20 Scene 18 · Param ω (dynamic freq)
    { amplitude: 100, frequency: 0.015, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:1,   color:'#d500f9' },
    // 21 Scene 19 · Freq split (no wave background)
    { amplitude:   0, frequency: 0.015, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
    // 22 Scene D  · Complex Sound
    { amplitude:   0, frequency: 0.015, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
    // 23 Scene 20 · Coord overlay
    { amplitude: 110, frequency: 0.014, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
    // 24 Scene 21 · Intro to audio
    { amplitude:  90, frequency: 0.010, phase: 0,             numWaves:3, complexity:0.2, yOffset:0,   alpha:0.5, color:'#00e5ff' },
    // 25 Scene 22 · Interactive audio
    { amplitude:  55, frequency: 0.010, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:1,   color:'#00e5ff' },
    // 26 Scene E  · Music & Math
    { amplitude:  40, frequency: 0.012, phase: 0,             numWaves:2, complexity:0.5, yOffset:0,   alpha:0.6, color:'#d500f9' },
    // 27 Scene 23 · Ending (silence)
    { amplitude:   0, frequency: 0.010, phase: 0,             numWaves:1, complexity:0,   yOffset:0,   alpha:0,   color:'#00e5ff' },
];

// ─── ANIMATION TIME ──────────────────────────────
let time = 0;

// ─── MAIN RENDER LOOP ────────────────────────────
function animate() {
    ctx.clearRect(0, 0, W, H);

    // Lerp toward target
    const L = 0.05;
    const lerp = (a, b, t) => a + (b - a) * t;
    wave.amplitude  = lerp(wave.amplitude,  targetWave.amplitude,  L);
    wave.frequency  = lerp(wave.frequency,  targetWave.frequency,  L);
    wave.phase      = lerp(wave.phase,      targetWave.phase,      L);
    wave.numWaves   = lerp(wave.numWaves,   targetWave.numWaves,   L);
    wave.complexity = lerp(wave.complexity, targetWave.complexity, L);
    wave.yOffset    = lerp(wave.yOffset,    targetWave.yOffset,    L);
    wave.alpha      = lerp(wave.alpha,      targetWave.alpha,      L);

    // Dynamic overrides
    let dynAmp  = wave.amplitude;
    let dynFreq = wave.frequency;

    if (currentSceneIndex === 19) {  // Scene 17 – A animation
        dynAmp = wave.amplitude + Math.sin(time * 0.045) * 70;
    }
    if (currentSceneIndex === 20) {  // Scene 18 – ω animation
        dynFreq = wave.frequency + Math.sin(time * 0.025) * 0.014;
    }

    ctx.lineWidth = 2.5;
    ctx.lineCap   = 'round';
    ctx.lineJoin  = 'round';

    // ── Scene 19: three-column split waves ──
    if (currentSceneIndex === 21) {
        drawFreqSplit();

    // ── Scene 11: one-cycle highlight ──
    } else if (currentSceneIndex === 10) {
        drawCycleHighlight(dynAmp, dynFreq);

    // ── Standard multi-wave ──
    } else {
        const isOverlay = (currentSceneIndex === 7);
        const numW = Math.ceil(wave.numWaves);
        for (let j = 0; j < numW; j++) {
            let localAlpha = wave.alpha * Math.max(0, 1 - j * 0.22);
            let [r, g, b]  = hexToRgb(targetWave.color);

            if (isOverlay && j === 1) { r=213; g=0; b=249; }

            ctx.strokeStyle = `rgba(${r},${g},${b},${localAlpha})`;
            ctx.shadowBlur  = 18;
            ctx.shadowColor = ctx.strokeStyle;

            ctx.beginPath();
            for (let x = 0; x < W; x += 4) {
                let ph = wave.phase + (isOverlay && j===1 ? Math.PI/2 : j * 0.5);
                let y  = sineY(x, dynFreq, ph, dynAmp, wave.yOffset);
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    // ── Call Math renderers ──
    drawMathCanvases();

    // ── Scene 22: mini wave canvases ──
    if (currentSceneIndex === 21) {
        drawMiniWaves();
    }

    time++;
    requestAnimationFrame(animate);
}

// ─── HELPERS ─────────────────────────────────────
function hexToRgb(hex) {
    if (hex === '#d500f9') return [213, 0, 249];
    return [0, 229, 255]; // default #00e5ff
}

function sineY(x, freq, phase, amp, yOff) {
    return H/2 + yOff + Math.sin(x * freq + time * 0.05 + phase) * amp;
}

// Scene 11 · cycle highlight
function drawCycleHighlight(amp, freq) {
    const cycleW = (2 * Math.PI) / freq;
    const startX = W / 2 - cycleW / 2;
    const endX   = startX + cycleW;

    ctx.beginPath();
    for (let x = 0; x < W; x += 4) {
        const inCycle = (x >= startX && x <= endX);
        const [r,g,b] = inCycle ? [213,0,249] : [0,229,255];
        const a       = inCycle ? 1 : 0.18;
        ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
        ctx.shadowBlur  = inCycle ? 25 : 5;
        ctx.shadowColor = ctx.strokeStyle;
        const y = sineY(x, freq, wave.phase, amp, wave.yOffset);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

// Scene 18 · three split waves
function drawFreqSplit() {
    const colW = W / 3;
    const specs = [
        { xStart:0,      color:'#64c896', freq:0.005  }, // sin(0.5x) – low
        { xStart:colW,   color:'#00e5ff', freq:0.015  }, // sin(x)    – normal
        { xStart:colW*2, color:'#d500f9', freq:0.030  }, // sin(2x)   – high
    ];
    specs.forEach(({ xStart, color, freq }) => {
        const [r,g,b] = color==='#d500f9'?[213,0,249]:color==='#64c896'?[100,200,150]:[0,229,255];
        ctx.strokeStyle = `rgba(${r},${g},${b},1)`; // Alpha is set to 1 explicitly
        ctx.shadowBlur  = 18;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.beginPath();
        for (let x = xStart; x < xStart + colW; x += 4) {
            const y = H/2 + Math.sin((x - xStart + time*1.5) * freq) * 80;
            x === xStart ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.stroke();
    });
}

// ─── MATH CANVASES ──────────────────────────────
function drawAxes(cx, w, h, xLabel, yLabel) {
    cx.strokeStyle = 'rgba(255,255,255,0.15)';
    cx.lineWidth = 2;
    cx.beginPath();
    const originX = w / 4;
    const originY = h / 2;
    // X axis
    cx.moveTo(10, originY); cx.lineTo(w - 10, originY);
    // Y axis
    cx.moveTo(originX, 10); cx.lineTo(originX, h - 10);
    cx.stroke();

    // Arrows
    cx.beginPath(); cx.moveTo(w-10, originY); cx.lineTo(w-18, originY-6); cx.lineTo(w-18, originY+6); cx.fill();
    cx.beginPath(); cx.moveTo(originX, 10); cx.lineTo(originX-6, 18); cx.lineTo(originX+6, 18); cx.fill();

    cx.fillStyle = 'rgba(255,255,255,0.4)';
    cx.font = '14px "JetBrains Mono"';
    if(xLabel) cx.fillText(xLabel, w - 24, originY + 24);
    if(yLabel) cx.fillText(yLabel, originX - 30, 24);
}

function drawAccurateWave(cx, w, h, fun, color, progress=1, phase=0) {
    cx.strokeStyle = color;
    cx.lineWidth = 3;
    cx.shadowBlur = 12;
    cx.shadowColor = color;
    cx.beginPath();
    const originX = w / 4;
    const originY = h / 2;
    const amp = h / 3.5;
    const freq = 0.02;
    const maxDrawX = originX + (w - originX) * progress;
    for (let x = originX; x < maxDrawX; x++) {
        const dx = x - originX;
        const targetPhase = dx * freq + phase;
        const y = originY - fun(targetPhase) * amp;
        x === originX ? cx.moveTo(x, y) : cx.lineTo(x, y);
    }
    cx.stroke();
    // draw trailing dot
    if (progress > 0 && progress < 1) {
        const dx = maxDrawX - originX;
        const targetPhase = dx * freq + phase;
        const y = originY - fun(targetPhase) * amp;
        cx.beginPath(); cx.arc(maxDrawX, y, 6, 0, Math.PI*2);
        cx.fillStyle = color; cx.fill();
    }
}

function drawMathCanvases() {
    if (currentSceneIndex === 1) { // ── Scene 2: Scientifically accurate vibration
        const c = document.getElementById('canvas-s2');
        if(!c) return;
        c.width = c.offsetWidth || 800; c.height = c.offsetHeight || 150;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        
        const cy = c.height / 2;
        const cxCenter = c.width / 2;
        
        // Oscillation
        const displacement = Math.sin(time * 0.08) * 120;
        const ptX = cxCenter + displacement;
        
        // Track
        cx.strokeStyle = 'rgba(255,255,255,0.15)'; cx.lineWidth = 2;
        cx.beginPath(); cx.moveTo(cxCenter - 150, cy); cx.lineTo(cxCenter + 150, cy); cx.stroke();
        
        // Center mark
        cx.beginPath(); cx.moveTo(cxCenter, cy - 8); cx.lineTo(cxCenter, cy + 8); cx.stroke();
        
        // Point
        cx.beginPath(); cx.arc(ptX, cy, 14, 0, Math.PI*2);
        cx.fillStyle = '#00e5ff'; cx.fill(); cx.shadowBlur = 20; cx.shadowColor = '#00e5ff';

    } else if (currentSceneIndex === 3) {
        sceneProgress = Math.min(1, sceneProgress + 0.005);
        const c = document.getElementById('canvas-s4');
        if(!c) return;
        c.width = c.offsetWidth; c.height = c.offsetHeight;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        drawAxes(cx, c.width, c.height, 'x', 'sin(x)');
        drawAccurateWave(cx, c.width, c.height, Math.sin, '#00e5ff', sceneProgress, 0);
    } else if (currentSceneIndex === 5) {
        const c = document.getElementById('canvas-s6');
        if(!c) return;
        c.width = c.offsetWidth; c.height = c.offsetHeight;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);

        const w = c.width, h = c.height;
        const r = h/3.5;
        const cX = w/4;
        const cY = h/2;
        const angle = -time * 0.03;

        cx.strokeStyle = 'rgba(255,255,255,0.15)'; cx.lineWidth=2;
        cx.beginPath(); cx.moveTo(cX, cY-r-20); cx.lineTo(cX, cY+r+20); cx.stroke();
        cx.beginPath(); cx.moveTo(cX-r-20, cY); cx.lineTo(w, cY); cx.stroke();

        cx.beginPath(); cx.arc(cX, cY, r, 0, Math.PI*2); cx.stroke();

        const pX = cX + Math.cos(angle)*r;
        const pY = cY + Math.sin(angle)*r;

        cx.fillStyle = '#00e5ff'; cx.beginPath(); cx.arc(pX, pY, 6, 0, Math.PI*2); cx.fill();
        cx.strokeStyle = '#00e5ff'; cx.beginPath(); cx.moveTo(cX, cY); cx.lineTo(pX, pY); cx.stroke();

        cx.beginPath();
        cx.strokeStyle = '#00e5ff'; cx.shadowBlur=12; cx.shadowColor='#00e5ff';
        for(let x=cX+r+40; x<w; x++){
            const t = angle - (x - (cX+r+40))*0.03;
            cx.lineTo(x, cY + Math.sin(t)*r);
        }
        cx.stroke();
        cx.beginPath(); cx.setLineDash([5,5]); cx.strokeStyle='rgba(0,229,255,0.5)';
        cx.moveTo(pX, pY); cx.lineTo(cX+r+40, pY); cx.stroke(); cx.setLineDash([]);
        
    } else if (currentSceneIndex === 6) {
        sceneProgress = Math.min(1, sceneProgress + 0.005);
        const c = document.getElementById('canvas-s7');
        if(!c) return;
        c.width = c.offsetWidth; c.height = c.offsetHeight;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        drawAxes(cx, c.width, c.height, 'x', 'cos(x)');
        drawAccurateWave(cx, c.width, c.height, Math.cos, '#d500f9', sceneProgress, 0);
    } else if (currentSceneIndex === 7) {
        sceneProgress = Math.min(1, sceneProgress + 0.008);
        const c = document.getElementById('canvas-s8');
        if(!c) return;
        c.width = c.offsetWidth; c.height = c.offsetHeight;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        drawAxes(cx, c.width, c.height, 'x', 'y');
        cx.globalAlpha = 0.5; drawAccurateWave(cx, c.width, c.height, Math.sin, '#00e5ff', sceneProgress, -time*0.05); cx.globalAlpha = 1;
        drawAccurateWave(cx, c.width, c.height, Math.cos, '#d500f9', sceneProgress, -time*0.05);
    } else if (currentSceneIndex === 8) {
        const c = document.getElementById('canvas-s9');
        if(!c) return;
        c.width = c.offsetWidth; c.height = c.offsetHeight;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        drawAxes(cx, c.width, c.height, 'x', 'y');
        drawAccurateWave(cx, c.width, c.height, Math.sin, '#00e5ff', 1, Math.PI/2);
        
        const topY = c.height/2 - c.height/3.5;
        const topX = c.width/4 + (Math.PI/2)/0.02;
        cx.strokeStyle = '#00e5ff'; cx.lineWidth = 2; cx.setLineDash([4,4]);
        cx.beginPath(); cx.moveTo(topX, c.height/2); cx.lineTo(topX, topY); cx.stroke(); cx.setLineDash([]);
        cx.fillStyle = '#00e5ff'; cx.font = '16px "JetBrains Mono"'; cx.fillText('A', topX + 10, (c.height/2 + topY)/2);
    } else if (currentSceneIndex === 9) {
        const c = document.getElementById('canvas-s10');
        if(!c) return;
        c.width = c.offsetWidth; c.height = c.offsetHeight;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        drawAxes(cx, c.width, c.height, 't', 'y');
        cx.strokeStyle = '#d500f9'; cx.lineWidth=3; cx.shadowBlur=12; cx.shadowColor='#d500f9';
        cx.beginPath();
        for (let x = c.width/4; x < c.width - 20; x++) {
            const y = c.height/2 - Math.sin((x-c.width/4)*0.06)* (c.height/3.5);
            x === c.width/4 ? cx.moveTo(x,y) : cx.lineTo(x,y);
        }
        cx.stroke();
    } else if (currentSceneIndex === 10) {
        const c = document.getElementById('canvas-s11');
        if(!c) return;
        c.width = c.offsetWidth; c.height = c.offsetHeight;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        drawAxes(cx, c.width, c.height, 't', 'y');
        
        const originX = c.width/4;
        const freq = 0.02;
        const endX = originX + (Math.PI*2)/freq;

        cx.strokeStyle = '#00e5ff'; cx.lineWidth = 3; cx.beginPath();
        for (let x = originX; x < c.width - 20; x++) {
            const y = c.height/2 - Math.sin((x-originX)*freq)* (c.height/3.5);
            x === originX ? cx.moveTo(x,y) : cx.lineTo(x,y);
        }
        cx.stroke();

        cx.fillStyle = 'rgba(0,229,255,0.2)';
        cx.fillRect(originX, c.height/2 - c.height/3.5 - 10, endX - originX, (c.height/3.5)*2 + 20);
        cx.strokeStyle = '#00e5ff'; cx.lineWidth = 2; cx.setLineDash([4,4]);
        cx.beginPath(); cx.moveTo(endX, c.height/2 - c.height/3.5); cx.lineTo(endX, c.height/2 + c.height/3.5); cx.stroke();
        cx.setLineDash([]);
    } else if (currentSceneIndex === 11) { // ── Scene 12: Transition to Reality ──
        const c = document.getElementById('canvas-s12-transition');
        if(!c) return;
        c.width = c.offsetWidth || 800; c.height = c.offsetHeight || 250;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);

        const w = c.width, h = c.height, cy = h/2;
        
        // Draw Waveform on the left fading out
        cx.strokeStyle = '#00e5ff'; cx.lineWidth = 3; cx.shadowBlur = 10; cx.shadowColor = '#00e5ff';
        cx.beginPath();
        for (let x = 0; x < w * 0.5; x+=2) {
            const y = cy + Math.sin(x*0.03 + time*0.05) * 60;
            cx.globalAlpha = Math.max(0, 1 - (x / (w * 0.4)));
            x===0 ? cx.moveTo(x,y) : cx.lineTo(x,y);
        }
        cx.stroke(); cx.globalAlpha = 1;

        // Draw Particle compression on the right fading in
        cx.fillStyle = '#00e5ff'; cx.shadowBlur = 5; cx.shadowColor = '#00e5ff';
        const cols = 50, rows = 7;
        const startX = w * 0.3;
        for (let i = 0; i < cols; i++) {
            const baseX = startX + (i / cols) * (w - startX);
            const globalA = Math.min(1, (baseX - startX) / (w * 0.2));
            if (globalA <= 0) continue;
            
            const waveA = Math.sin((baseX)*0.03 + time*0.05); 
            const shiftX = waveA * 15;
            
            cx.globalAlpha = globalA * (0.3 + 0.7 * Math.abs(waveA));
            
            for (let j = 0; j < rows; j++) {
                const py = cy - 45 + (j/(rows-1))*90;
                cx.beginPath(); cx.arc(baseX + shiftX, py, 2.5, 0, Math.PI*2); cx.fill();
            }
        }
        cx.globalAlpha = 1;

    } else if (currentSceneIndex === 13) { // ── Scene A: What is sound? ──
        const c = document.getElementById('canvas-sA-vibration');
        if(!c) return;
        c.width = c.offsetWidth || 800; c.height = c.offsetHeight || 250;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        const cy = c.height/2; const cxCenter = c.width/2;
        const disp = Math.sin(time*0.1) * 5;
        cx.beginPath(); cx.arc(cxCenter+disp, cy, 10, 0, Math.PI*2);
        cx.fillStyle = '#00e5ff'; cx.fill(); cx.shadowBlur=15; cx.shadowColor='#00e5ff';
        for (let i=0; i<4; i++) {
            const rad = ((time*1.5 + i*40) % 160);
            const alpha = 1 - (rad/160);
            if(rad > 12) {
                cx.beginPath(); cx.arc(cxCenter+disp, cy, rad, -Math.PI/3, Math.PI/3);
                cx.strokeStyle = `rgba(0,229,255,${alpha})`; cx.lineWidth = 2; cx.stroke();
                cx.beginPath(); cx.arc(cxCenter+disp, cy, rad, Math.PI - Math.PI/3, Math.PI + Math.PI/3); cx.stroke();
            }
        }
    } else if (currentSceneIndex === 14) { // ── Scene 14: Source mini waves ──
        const c1 = document.getElementById('s14-wave1');
        const c2 = document.getElementById('s14-wave2');
        const c3 = document.getElementById('s14-wave3');
        
        const drawMini = (c, type) => {
            if(!c) return;
            c.width = c.offsetWidth || 200; c.height = c.offsetHeight || 80;
            const cx = c.getContext('2d');
            cx.clearRect(0,0,c.width,c.height);
            cx.lineWidth = 2; cx.beginPath();
            
            for (let x=0; x<c.width; x+=2) {
                let y = c.height/2;
                if(type === 'human') { 
                    cx.strokeStyle = '#00e5ff'; cx.shadowBlur=8; cx.shadowColor='#00e5ff';
                    y += (Math.sin(x*0.05 - time*0.06)*12 + Math.sin(x*0.1 - time*0.1)*8 + Math.sin(x*0.2 - time*0.15)*4);
                } else if(type === 'phone') { 
                    cx.strokeStyle = '#b0c4de'; cx.shadowBlur=8; cx.shadowColor='#b0c4de';
                    const envelope = Math.max(0, Math.sin(time*0.08 - x*0.01));
                    y += Math.sin(x*0.3 - time*0.2) * 20 * (envelope > 0.5 ? 1 : 0);
                } else if(type === 'speaker') { 
                    cx.strokeStyle = '#d500f9'; cx.shadowBlur=12; cx.shadowColor='#d500f9';
                    y += Math.sin(x*0.03 - time*0.1) * 25;
                }
                x===0 ? cx.moveTo(x,y) : cx.lineTo(x,y);
            }
            cx.stroke();
        };
        drawMini(c1, 'human'); drawMini(c2, 'phone'); drawMini(c3, 'speaker');

    } else if (currentSceneIndex === 15) { // ── Scene B: Wave Types ──
        const drawWave = (id, type) => {
            const c = document.getElementById(id);
            if(!c) return;
            c.width = c.offsetWidth || 300; c.height = c.offsetHeight || 150;
            const cx = c.getContext('2d');
            cx.clearRect(0,0,c.width,c.height);
            cx.lineWidth = 3;
            if(type === 'trans') {
                cx.strokeStyle = '#d500f9'; cx.shadowBlur=10; cx.shadowColor='#d500f9';
                cx.beginPath();
                for(let x=0; x<c.width; x+=2) {
                    const y = c.height/2 + Math.sin(x*0.05 - time*0.05)*30;
                    x===0?cx.moveTo(x,y):cx.lineTo(x,y);
                }
                cx.stroke();
            } else {
                cx.fillStyle = '#00e5ff'; cx.shadowBlur=8; cx.shadowColor='#00e5ff';
                const cy = c.height/2;
                for(let x=0; x<c.width; x+=7) {
                    const phase = x*0.04 - time*0.05;
                    const shift = Math.sin(phase)*12;
                    const isComp = Math.cos(phase)>0;
                    cx.globalAlpha = isComp ? 1 : 0.3;
                    cx.beginPath(); cx.arc(x+shift, cy, 2.5, 0, Math.PI*2); cx.fill();
                }
                cx.globalAlpha = 1;
            }
        };
        drawWave('canvas-sB-transverse', 'trans');
        drawWave('canvas-sB-longitudinal', 'long');

    } else if (currentSceneIndex === 16) { // ── Scene 15: Sound in Air Longitudinal ──
        const c = document.getElementById('canvas-s15-air');
        if(!c) return;
        c.width = c.offsetWidth || 800; c.height = c.offsetHeight || 250;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);

        const w = c.width, h = c.height, cy = h/2;
        cx.fillStyle = '#fff';

        const cols = 70, rows = 9;
        for (let i = 0; i < cols; i++) {
            const baseX = (i / cols) * w;
            const wavePhase = (baseX * 0.02) - (time * 0.06); 
            const shiftX = Math.sin(wavePhase) * 20; 
            
            const isCompression = Math.cos(wavePhase) > 0.5;
            
            for (let j = 0; j < rows; j++) {
                const py = cy - 60 + (j/(rows-1))*120;
                
                cx.globalAlpha = isCompression ? 1 : 0.4;
                if(isCompression) { cx.fillStyle = '#00e5ff'; cx.shadowBlur=8; cx.shadowColor='#00e5ff'; }
                else { cx.fillStyle = '#fff'; cx.shadowBlur=0; }
                
                cx.beginPath(); cx.arc(baseX + shiftX, py, 2.5, 0, Math.PI*2); cx.fill();
            }
        }
        cx.globalAlpha = 1;
        
    } else if (currentSceneIndex === 17) { // ── Scene C: Compression & Rarefaction ──
        const c = document.getElementById('canvas-sC-particles');
        if(!c) return;
        c.width = c.offsetWidth || 800; c.height = c.offsetHeight || 250;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        const w = c.width, cy = c.height/2;
        cx.fillStyle = '#fff';
        const cols = 50, rows = 5;
        for (let i = 0; i < cols; i++) {
            const baseX = (i / cols) * w;
            const wavePhase = (baseX * 0.03) - (time * 0.04); 
            const shiftX = Math.sin(wavePhase) * 25; 
            const isCompression = Math.cos(wavePhase) > 0.3;
            for (let j = 0; j < rows; j++) {
                const py = cy - 40 + (j/(rows-1))*80;
                cx.globalAlpha = isCompression ? 1 : 0.4;
                if(isCompression) { cx.fillStyle = '#d500f9'; cx.shadowBlur=12; cx.shadowColor='#d500f9'; }
                else { cx.fillStyle = '#00e5ff'; cx.shadowBlur=0; }
                cx.beginPath(); cx.arc(baseX + shiftX, py, 3, 0, Math.PI*2); cx.fill();
            }
        }
        cx.globalAlpha = 1;

    } else if (currentSceneIndex === 22) { // ── Scene D: Complex Sound ──
        const c = document.getElementById('canvas-sD-complex');
        if(!c) return;
        c.width = c.offsetWidth || 800; c.height = c.offsetHeight || 300;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        const w = c.width, cy = c.height/2;
        
        cx.globalAlpha = 0.3;
        cx.lineWidth = 1.5;
        const waves = [{f:0.02,a:40,c:'#00e5ff'}, {f:0.04,a:25,c:'#d500f9'}, {f:0.08,a:15,c:'#64c896'}];
        waves.forEach(wConf => {
            cx.strokeStyle = wConf.c;
            cx.beginPath();
            for(let x=0; x<w; x+=2) {
                const y = cy + Math.sin(x*wConf.f - time*0.05)*wConf.a;
                x===0?cx.moveTo(x,y):cx.lineTo(x,y);
            }
            cx.stroke();
        });
        cx.globalAlpha = 1;

        cx.strokeStyle = '#fff'; cx.lineWidth = 3; cx.shadowBlur = 15; cx.shadowColor='#fff';
        cx.beginPath();
        for(let x=0; x<w; x+=2) {
            let y = cy;
            waves.forEach(wConf => { y += Math.sin(x*wConf.f - time*0.05)*wConf.a; });
            x===0?cx.moveTo(x,y):cx.lineTo(x,y);
        }
        cx.stroke();

    } else if (currentSceneIndex === 23) {
        sceneProgress = Math.min(1, sceneProgress + 0.005);
        const c = document.getElementById('canvas-s19-mapping');
        if(!c) return;
        c.width = c.offsetWidth; c.height = c.offsetHeight;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);

        const w = c.width, h = c.height;
        const oy = h * 0.5;
        const originX = 120;

        cx.font = '60px serif';
        cx.fillText('🔊', 40, oy + 20);

        const maxDist = (w - originX) * sceneProgress;

        // Proper Cartesian coordinate system
        cx.strokeStyle = 'rgba(255,255,255,0.15)'; cx.lineWidth=2; cx.beginPath();
        cx.moveTo(originX, oy); cx.lineTo(w, oy); // X
        cx.moveTo(originX, oy - 150); cx.lineTo(originX, oy + 150); // Y
        cx.stroke();
        
        cx.beginPath(); cx.moveTo(w-10, oy); cx.lineTo(w-18, oy-6); cx.lineTo(w-18, oy+6); cx.fillStyle='rgba(255,255,255,0.4)'; cx.fill();
        cx.beginPath(); cx.moveTo(originX, oy-150); cx.lineTo(originX-6, oy-142); cx.lineTo(originX+6, oy-142); cx.fill();
        cx.font = '14px "JetBrains Mono"'; cx.fillText('x', w - 24, oy + 24);
        cx.fillText('y', originX - 30, oy - 140);

        // Keep the real sound wave visualization (overlaid on the same Y)
        for(let i=0; i<350; i++) {
            const px = originX + ((i % 35) / 35) * (w - originX - 30);
            const py = oy - 40 + (i / 350) * 80;
            if(px > originX + maxDist) continue;
            
            const phase = (px - originX)*0.02 - time*0.05;
            const shift = Math.sin(phase) * 15;
            
            cx.fillStyle = 'rgba(255,255,255,0.6)';
            cx.beginPath(); cx.arc(px + shift, py + Math.sin(px*123)*15, 1.5, 0, Math.PI*2); cx.fill();
        }

        // Overlay clear sine function matching the shape
        cx.strokeStyle = '#00e5ff'; cx.lineWidth = 3; cx.shadowBlur=12; cx.shadowColor='#00e5ff';
        cx.beginPath();
        for(let x = originX; x < originX + maxDist; x++) {
            const phase = (x - originX)*0.02 - time*0.05;
            const y = oy - Math.sin(phase) * 80;
            x === originX ? cx.moveTo(x,y) : cx.lineTo(x,y);
        }
        cx.stroke();
        
        // Alignment peaks
        cx.strokeStyle = 'rgba(255,255,255,0.3)'; cx.lineWidth = 1; cx.setLineDash([4,4]);
        for(let k=0; k<8; k++) {
            const peakPhase = Math.PI/2 + k*2*Math.PI;
            const peakX = originX + (peakPhase + time*0.05) / 0.02;
            if(peakX > originX && peakX < originX+maxDist) {
                cx.beginPath(); cx.moveTo(peakX, oy + 40); cx.lineTo(peakX, oy - 80); cx.stroke();
            }
        }
        cx.setLineDash([]);
        
    } else if (currentSceneIndex === 26) { // ── Scene E: Music & Math ──
        const c = document.getElementById('canvas-sE-music');
        if(!c) return;
        c.width = c.offsetWidth || 800; c.height = c.offsetHeight || 250;
        const cx = c.getContext('2d');
        cx.clearRect(0,0,c.width,c.height);
        const w = c.width, h = c.height, cy = h/2;

        const signalY = (x, t) => {
            return cy + Math.sin(x*0.02 - t*0.05)*40 + Math.sin(x*0.04 - t*0.08)*15;
        };

        // Draw axes
        cx.strokeStyle = 'rgba(255,255,255,0.15)'; cx.lineWidth=1.5;
        cx.beginPath(); cx.moveTo(0, cy); cx.lineTo(w, cy); cx.stroke();
        cx.beginPath(); cx.moveTo(w/2, 0); cx.lineTo(w/2, h); cx.stroke();
        
        // Draw the wave
        cx.strokeStyle = '#d500f9'; cx.lineWidth = 2; cx.shadowBlur=15; cx.shadowColor='#d500f9';
        cx.beginPath();
        for(let x=0; x<w; x+=2) {
            x===0?cx.moveTo(x,signalY(x, time)):cx.lineTo(x,signalY(x, time));
        }
        cx.stroke();

        // Draw a scanning line / point to represent "state in time"
        const scanX = w/2 + Math.sin(time*0.02) * (w*0.3);
        const ptY = signalY(scanX, time);
        
        cx.beginPath(); cx.moveTo(scanX, 0); cx.lineTo(scanX, h); 
        cx.strokeStyle = 'rgba(0,229,255,0.5)'; cx.lineWidth = 1; cx.stroke();
        
        cx.beginPath(); cx.arc(scanX, ptY, 6, 0, Math.PI*2);
        cx.fillStyle = '#00e5ff'; cx.fill(); cx.shadowBlur = 10; cx.shadowColor = '#00e5ff';
        
        // Draw coordinates text near the point
        cx.font = '14px "JetBrains Mono"'; cx.fillStyle = 'rgba(255,255,255,0.8)';
        cx.fillText(`y(t)`, scanX + 15, ptY - 10);

    } else {
        sceneProgress = 0;
    }
}

// Scene 21 · mini waveform previews
function drawMiniWaves() {
    const freqs = { low: 0.03, med: 0.09, high: 0.18 };
    Object.entries(waveCanvases).forEach(([key, c]) => {
        if (!c) return;
        const cw = c.offsetWidth, ch = c.offsetHeight;
        if (c.width !== cw) c.width = cw || 200;
        if (c.height !== ch) c.height = ch || 60;
        const cx = c.getContext('2d');
        cx.clearRect(0, 0, c.width, c.height);

        const colors = { low:'#64c896', med:'#00e5ff', high:'#d500f9' };
        cx.strokeStyle = colors[key];
        cx.lineWidth   = 2;
        cx.shadowBlur  = 10;
        cx.shadowColor = colors[key];
        cx.beginPath();
        for (let x = 0; x < c.width; x += 2) {
            const y = c.height/2 + Math.sin(x * freqs[key] + time * 0.05) * (c.height * 0.38);
            x === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
        }
        cx.stroke();
    });
}

// ─── SCENE TRANSITION ────────────────────────────
function updateScene() {
    scenes.forEach((s, i) => {
        s.classList.remove('active', 'exit');
        if      (i === currentSceneIndex)  s.classList.add('active');
        else if (i <  currentSceneIndex)   s.classList.add('exit');
    });

    // Scene counter
    sceneCounter.textContent = `${currentSceneIndex + 1} / ${totalScenes}`;

    // Progress bar
    progressBar.style.width = `${((currentSceneIndex + 1) / totalScenes) * 100}%`;

    // Zoom trick for Scene 6
    document.body.classList.toggle('scene-zoom', currentSceneIndex === 5);

    // Apply wave preset
    Object.assign(targetWave, PRESETS[currentSceneIndex]);
}

// ─── NAVIGATION ──────────────────────────────────
function goNext() {
    if (currentSceneIndex < totalScenes - 1) { currentSceneIndex++; updateScene(); }
}
function goPrev() {
    if (currentSceneIndex > 0) { currentSceneIndex--; updateScene(); }
}

window.addEventListener('keydown', e => {
    if (['ArrowRight','ArrowDown','Enter',' '].includes(e.key)) goNext();
    if (['ArrowLeft' ,'ArrowUp'].includes(e.key))               goPrev();
});

window.addEventListener('click', e => {
    if (!e.target.closest('.audio-btn') && !e.target.closest('#back-btn')) goNext();
});

backBtn.addEventListener('click', goPrev);

// ─── INIT ─────────────────────────────────────────
updateScene();
animate();
