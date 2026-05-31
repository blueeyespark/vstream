import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw, Maximize2, Eye, Smile, Move, Sliders, Play, Pause } from "lucide-react";

// ── Live2D Parameter ranges (mirrors Cubism spec) ───────────────────────────
// ParamAngleX:  -30 to 30  (head yaw)
// ParamAngleY:  -30 to 30  (head pitch)
// ParamEyeLOpen / ParamEyeROpen: 0 to 1 (1 = fully open)
// ParamMouthOpenY: 0 to 1
// ParamBrowLY / ParamBrowRY: -1 to 1 (raise/lower)
// ParamBodyAngleX: -10 to 10

// ── Utility ──────────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

// ── SVG Face Renderer ────────────────────────────────────────────────────────
// Draws a Live2D-style anime face driven by parameter values
function drawFace(ctx, w, h, params, colors) {
  const {
    angleX,   // -30..30
    angleY,   // -30..30
    eyeL,     // 0..1
    eyeR,     // 0..1
    mouthOpen,// 0..1
    browLY,   // -1..1
    browRY,   // -1..1
    bodyX,    // -10..10
    cheekFlush,// 0..1
  } = params;

  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Head perspective shift from angle
  const shiftX = (angleX / 30) * w * 0.06;
  const shiftY = (-angleY / 30) * h * 0.04;
  const perspective = 1 - Math.abs(angleX) / 30 * 0.12;

  // Body sway
  const bodyShiftX = (bodyX / 10) * w * 0.02;

  // ── NECK / BODY ─────────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(bodyShiftX, 0);

  // Neck
  const neckGrad = ctx.createLinearGradient(cx - 18, cy + 80, cx + 18, cy + 80);
  neckGrad.addColorStop(0, colors.skin + "cc");
  neckGrad.addColorStop(1, colors.skin);
  ctx.beginPath();
  ctx.roundRect(cx - 16, cy + 70, 32, 50, 8);
  ctx.fillStyle = neckGrad;
  ctx.fill();

  // Shoulders / body
  const bodyGrad = ctx.createLinearGradient(cx, cy + 110, cx, cy + h * 0.55);
  bodyGrad.addColorStop(0, colors.outfit);
  bodyGrad.addColorStop(1, colors.outfitDark);
  ctx.beginPath();
  ctx.moveTo(cx - 80, cy + 118);
  ctx.quadraticCurveTo(cx - 60, cy + 108, cx - 20, cy + 110);
  ctx.lineTo(cx + 20, cy + 110);
  ctx.quadraticCurveTo(cx + 60, cy + 108, cx + 80, cy + 118);
  ctx.lineTo(cx + 100, h);
  ctx.lineTo(cx - 100, h);
  ctx.closePath();
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  // ── HEAD ────────────────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(cx + shiftX, cy + shiftY);
  ctx.scale(perspective, 1);

  // Shadow under head
  ctx.beginPath();
  ctx.ellipse(0, 62, 48 * perspective, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fill();

  // Face base (oval)
  const faceGrad = ctx.createRadialGradient(-8, -20, 10, 0, 0, 90);
  faceGrad.addColorStop(0, colors.skinLight);
  faceGrad.addColorStop(0.7, colors.skin);
  faceGrad.addColorStop(1, colors.skinShadow);
  ctx.beginPath();
  ctx.ellipse(0, 0, 72, 88, 0, 0, Math.PI * 2);
  ctx.fillStyle = faceGrad;
  ctx.fill();

  // Jaw taper
  ctx.beginPath();
  ctx.moveTo(-72, 10);
  ctx.quadraticCurveTo(-60, 80, 0, 90);
  ctx.quadraticCurveTo(60, 80, 72, 10);
  ctx.fillStyle = colors.skin;
  ctx.fill();

  // ── HAIR (back layer) ──────────────────────────────────────────────────
  ctx.beginPath();
  ctx.ellipse(0, -18, 77, 78, 0, 0, Math.PI * 2);
  ctx.fillStyle = colors.hair;
  ctx.fill();

  // Hair side strands
  ctx.beginPath();
  ctx.moveTo(-74, -10);
  ctx.quadraticCurveTo(-90, 30, -72, 70);
  ctx.quadraticCurveTo(-68, 80, -56, 72);
  ctx.quadraticCurveTo(-70, 30, -60, 0);
  ctx.closePath();
  ctx.fillStyle = colors.hair;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(74, -10);
  ctx.quadraticCurveTo(90, 30, 72, 70);
  ctx.quadraticCurveTo(68, 80, 56, 72);
  ctx.quadraticCurveTo(70, 30, 60, 0);
  ctx.closePath();
  ctx.fillStyle = colors.hair;
  ctx.fill();

  // Hair shine
  ctx.beginPath();
  ctx.ellipse(-15, -42, 22, 12, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fill();

  // ── FACE FEATURES ──────────────────────────────────────────────────────

  // Cheek blush
  if (cheekFlush > 0.05) {
    const blushAlpha = cheekFlush * 0.5;
    const blushGradL = ctx.createRadialGradient(-42, 28, 2, -42, 28, 22);
    blushGradL.addColorStop(0, `rgba(255,120,120,${blushAlpha})`);
    blushGradL.addColorStop(1, `rgba(255,120,120,0)`);
    ctx.beginPath();
    ctx.ellipse(-42, 28, 22, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = blushGradL;
    ctx.fill();

    const blushGradR = ctx.createRadialGradient(42, 28, 2, 42, 28, 22);
    blushGradR.addColorStop(0, `rgba(255,120,120,${blushAlpha})`);
    blushGradR.addColorStop(1, `rgba(255,120,120,0)`);
    ctx.beginPath();
    ctx.ellipse(42, 28, 22, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = blushGradR;
    ctx.fill();
  }

  // Nose (subtle)
  ctx.beginPath();
  ctx.moveTo(-4, 16);
  ctx.quadraticCurveTo(-6, 24, -3, 26);
  ctx.quadraticCurveTo(0, 28, 3, 26);
  ctx.quadraticCurveTo(6, 24, 4, 16);
  ctx.strokeStyle = colors.skinShadow;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── EYEBROWS ─────────────────────────────────────────────────────────
  const browBaseY = -36;
  const browOffsetL = browLY * 8;
  const browOffsetR = browRY * 8;

  // Left brow
  ctx.beginPath();
  ctx.moveTo(-44, browBaseY + browOffsetL + 2);
  ctx.quadraticCurveTo(-28, browBaseY + browOffsetL - 4, -16, browBaseY + browOffsetL + 1);
  ctx.strokeStyle = colors.hair;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.stroke();

  // Right brow
  ctx.beginPath();
  ctx.moveTo(44, browBaseY + browOffsetR + 2);
  ctx.quadraticCurveTo(28, browBaseY + browOffsetR - 4, 16, browBaseY + browOffsetR + 1);
  ctx.strokeStyle = colors.hair;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // ── EYES ─────────────────────────────────────────────────────────────
  // Eye positions - slightly offset by head angle
  const eyeAngleOffset = (angleX / 30) * 4;
  const leftEyeX = -26 - eyeAngleOffset * 0.5;
  const rightEyeX = 26 - eyeAngleOffset * 0.5;
  const eyeBaseY = -16;

  [
    { x: leftEyeX, open: eyeL, side: "L" },
    { x: rightEyeX, open: eyeR, side: "R" },
  ].forEach(({ x, open }) => {
    const eyeH = 16 * open; // eye height driven by open param
    const clippedH = Math.max(eyeH, 0);

    // Save and clip eye area so lids cover iris correctly
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, eyeBaseY, 16, 10, 0, 0, Math.PI * 2);
    ctx.clip();

    if (clippedH > 1) {
      // White sclera
      ctx.beginPath();
      ctx.ellipse(x, eyeBaseY, 14, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Iris gradient
      const irisGrad = ctx.createRadialGradient(x, eyeBaseY, 0, x, eyeBaseY, 8);
      irisGrad.addColorStop(0, colors.eyeLight);
      irisGrad.addColorStop(0.6, colors.eye);
      irisGrad.addColorStop(1, colors.eyeDark);
      ctx.beginPath();
      ctx.arc(x, eyeBaseY, 8, 0, Math.PI * 2);
      ctx.fillStyle = irisGrad;
      ctx.fill();

      // Pupil
      ctx.beginPath();
      ctx.arc(x, eyeBaseY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#1a0a2e";
      ctx.fill();

      // Eye shine
      ctx.beginPath();
      ctx.arc(x - 3, eyeBaseY - 3, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 4, eyeBaseY + 2, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();
    }

    ctx.restore();

    // Upper eyelid (drawn on top to simulate blinking)
    const lidProgress = 1 - open; // 0=open, 1=closed
    const lidY = eyeBaseY - 9 + lidProgress * 20;

    ctx.beginPath();
    ctx.moveTo(x - 16, eyeBaseY - 2);
    ctx.quadraticCurveTo(x, lidY - 6, x + 16, eyeBaseY - 2);
    ctx.lineTo(x + 16, eyeBaseY - 12);
    ctx.quadraticCurveTo(x, eyeBaseY - 18, x - 16, eyeBaseY - 12);
    ctx.closePath();
    ctx.fillStyle = colors.skin;
    ctx.fill();

    // Eye outline / lash
    ctx.beginPath();
    ctx.moveTo(x - 16, eyeBaseY - 2);
    ctx.quadraticCurveTo(x, lidY - 6, x + 16, eyeBaseY - 2);
    ctx.strokeStyle = "#1a0a2e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();

    // Lower lid
    if (open > 0.3) {
      ctx.beginPath();
      ctx.moveTo(x - 14, eyeBaseY + 5);
      ctx.quadraticCurveTo(x, eyeBaseY + 9, x + 14, eyeBaseY + 5);
      ctx.strokeStyle = colors.skinShadow;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  // ── MOUTH ─────────────────────────────────────────────────────────────
  const mouthY = 44;
  const mouthW = 22;
  const openAmount = mouthOpen * 14;

  // Upper lip
  ctx.beginPath();
  ctx.moveTo(-mouthW, mouthY);
  ctx.quadraticCurveTo(-mouthW * 0.5, mouthY - 4, 0, mouthY - 2);
  ctx.quadraticCurveTo(mouthW * 0.5, mouthY - 4, mouthW, mouthY);
  ctx.strokeStyle = colors.lipLine;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.stroke();

  // Mouth interior (when open)
  if (openAmount > 1) {
    ctx.beginPath();
    ctx.moveTo(-mouthW * 0.8, mouthY);
    ctx.quadraticCurveTo(0, mouthY + openAmount * 1.1, mouthW * 0.8, mouthY);
    ctx.quadraticCurveTo(0, mouthY - 2, -mouthW * 0.8, mouthY);
    ctx.closePath();
    ctx.fillStyle = "#2d0e1a";
    ctx.fill();

    // Teeth
    if (openAmount > 6) {
      ctx.beginPath();
      ctx.rect(-mouthW * 0.65, mouthY, mouthW * 1.3, openAmount * 0.45);
      ctx.fillStyle = "#f0ece8";
      ctx.fill();
    }
  }

  // Smile / lower lip
  ctx.beginPath();
  ctx.moveTo(-mouthW, mouthY);
  ctx.quadraticCurveTo(0, mouthY + 6 + openAmount, mouthW, mouthY);
  ctx.strokeStyle = colors.lipLine;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── HAIR (front layer / bangs) ─────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(-77, -30);
  ctx.quadraticCurveTo(-60, -100, 0, -94);
  ctx.quadraticCurveTo(60, -100, 77, -30);
  ctx.quadraticCurveTo(60, -88, 0, -86);
  ctx.quadraticCurveTo(-60, -88, -77, -30);
  ctx.closePath();
  ctx.fillStyle = colors.hair;
  ctx.fill();

  // Bang strands
  const bangData = [
    { x: -55, cp1x: -60, cp1y: -40, endx: -48, endy: 5 },
    { x: -35, cp1x: -38, cp1y: -50, endx: -25, endy: -5 },
    { x: -10, cp1x: -10, cp1y: -55, endx: -2, endy: -12 },
    { x: 15, cp1x: 16, cp1y: -55, endx: 10, endy: -8 },
    { x: 38, cp1x: 42, cp1y: -48, endx: 30, endy: 0 },
  ];
  bangData.forEach(({ x, cp1x, cp1y, endx, endy }) => {
    ctx.beginPath();
    ctx.moveTo(x, -86);
    ctx.quadraticCurveTo(cp1x, cp1y, endx, endy);
    ctx.strokeStyle = colors.hairLight;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();
  });

  // Hair highlight
  ctx.beginPath();
  ctx.ellipse(-18, -60, 18, 8, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();

  // ── EARS ────────────────────────────────────────────────────────────
  // Only draw ear that's visible based on angle
  if (angleX < 5) {
    // Left ear
    ctx.beginPath();
    ctx.ellipse(-70, 4, 9, 13, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = colors.skin;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-70, 4, 5, 8, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = colors.skinShadow;
    ctx.fill();
  }
  if (angleX > -5) {
    // Right ear
    ctx.beginPath();
    ctx.ellipse(70, 4, 9, 13, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = colors.skin;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(70, 4, 5, 8, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = colors.skinShadow;
    ctx.fill();
  }

  ctx.restore();
}

// ── Color presets ────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { id: "purple", label: "Purple", hair: "#3d1a6e", hairLight: "#6b3fae", eye: "#8b5cf6", eyeLight: "#c4b5fd", eyeDark: "#4c1d95", outfit: "#6d28d9", outfitDark: "#4c1d95", lipLine: "#c084fc" },
  { id: "pink", label: "Pink", hair: "#9d174d", hairLight: "#db2777", eye: "#ec4899", eyeLight: "#f9a8d4", eyeDark: "#831843", outfit: "#db2777", outfitDark: "#9d174d", lipLine: "#f472b6" },
  { id: "blue", label: "Blue", hair: "#1e3a5f", hairLight: "#2563eb", eye: "#3b82f6", eyeLight: "#93c5fd", eyeDark: "#1e40af", outfit: "#1d4ed8", outfitDark: "#1e3a5f", lipLine: "#60a5fa" },
  { id: "teal", label: "Teal", hair: "#134e4a", hairLight: "#0d9488", eye: "#14b8a6", eyeLight: "#5eead4", eyeDark: "#0f766e", outfit: "#0d9488", outfitDark: "#134e4a", lipLine: "#2dd4bf" },
  { id: "silver", label: "Silver", hair: "#334155", hairLight: "#94a3b8", eye: "#64748b", eyeLight: "#cbd5e1", eyeDark: "#1e293b", outfit: "#475569", outfitDark: "#334155", lipLine: "#94a3b8" },
];

const SKIN_TONES = [
  { id: "fair", skin: "#fce4d0", skinLight: "#fff0e8", skinShadow: "#e8bea0" },
  { id: "medium", skin: "#f3c99b", skinLight: "#fae0c0", skinShadow: "#d4a574" },
  { id: "tan", skin: "#c68642", skinLight: "#d99a5a", skinShadow: "#a0662e" },
];

// ── Main Component ───────────────────────────────────────────────────────────
export default function Live2DRigPreview({ hairColorPreset = "purple", skinTone = "fair" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const paramsRef = useRef({
    angleX: 0, angleY: 0,
    eyeL: 1, eyeR: 1,
    mouthOpen: 0,
    browLY: 0, browRY: 0,
    bodyX: 0,
    cheekFlush: 0,
  });
  const targetRef = useRef({ ...paramsRef.current });
  const mouseRef = useRef({ x: 0.5, y: 0.5, inside: false });
  const blinkTimerRef = useRef(0);
  const mouthTimerRef = useRef(0);
  const tRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showParams, setShowParams] = useState(false);
  const [liveParams, setLiveParams] = useState({ ...paramsRef.current });
  const [colorId, setColorId] = useState(hairColorPreset);
  const [skinId, setSkinId] = useState(skinTone);

  const colorSet = COLOR_PRESETS.find((c) => c.id === colorId) || COLOR_PRESETS[0];
  const skinSet = SKIN_TONES.find((s) => s.id === skinId) || SKIN_TONES[0];
  const colors = { ...colorSet, ...skinSet };

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawFace(ctx, canvas.width, canvas.height, paramsRef.current, colors);
    setLiveParams({ ...paramsRef.current });
  }, [colors]);

  // Animation tick
  const tick = useCallback(() => {
    if (!isPlaying) return;
    tRef.current += 0.016;
    const t = tRef.current;

    // Mouse-driven head angle
    const mx = mouseRef.current.inside ? mouseRef.current.x : 0.5;
    const my = mouseRef.current.inside ? mouseRef.current.y : 0.5;
    targetRef.current.angleX = (mx - 0.5) * 40;
    targetRef.current.angleY = (my - 0.5) * -30;
    targetRef.current.bodyX = (mx - 0.5) * 12;

    // Idle breathing motion
    targetRef.current.angleY += Math.sin(t * 0.6) * 2;
    targetRef.current.angleX += Math.sin(t * 0.4) * 1;

    // Idle brow flutter
    targetRef.current.browLY = Math.sin(t * 0.5) * 0.15;
    targetRef.current.browRY = Math.sin(t * 0.5 + 0.3) * 0.15;

    // Random blinking
    blinkTimerRef.current -= 0.016;
    if (blinkTimerRef.current <= 0) {
      // Trigger blink
      blinkTimerRef.current = 2.5 + Math.random() * 4;
      targetRef.current.eyeL = 0;
      targetRef.current.eyeR = 0;
      setTimeout(() => {
        if (targetRef.current) {
          targetRef.current.eyeL = 1;
          targetRef.current.eyeR = 1;
        }
      }, 120 + Math.random() * 60);
    }

    // Idle talking simulation (subtle mouth)
    mouthTimerRef.current += 0.016;
    targetRef.current.mouthOpen = Math.max(0, Math.sin(mouthTimerRef.current * 4) * 0.15 + Math.sin(mouthTimerRef.current * 7) * 0.08);

    // Cheek blush on center look
    const lookDist = Math.sqrt((mx - 0.5) ** 2 + (my - 0.5) ** 2);
    targetRef.current.cheekFlush = Math.max(0, 0.4 - lookDist * 1.5);

    // Smooth lerp all params
    const p = paramsRef.current;
    const tg = targetRef.current;
    const speed = 0.08;
    Object.keys(tg).forEach((k) => {
      p[k] = lerp(p[k], tg[k], speed);
    });

    render();
  }, [isPlaying, render]);

  useEffect(() => {
    const loop = () => {
      tick();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [tick]);

  // Mouse tracking
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((e.clientY - rect.top) / rect.height, 0, 1),
      inside: true,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.inside = false;
  }, []);

  // Touch support
  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseRef.current = {
      x: clamp((touch.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((touch.clientY - rect.top) / rect.height, 0, 1),
      inside: true,
    };
  }, []);

  const handleReset = () => {
    targetRef.current = {
      angleX: 0, angleY: 0,
      eyeL: 1, eyeR: 1,
      mouthOpen: 0,
      browLY: 0, browRY: 0,
      bodyX: 0,
      cheekFlush: 0,
    };
    mouseRef.current.inside = false;
  };

  // Manual slider control when not playing
  const setParam = (key, val) => {
    targetRef.current[key] = val;
    paramsRef.current[key] = val;
    render();
  };

  const fmtParam = (v) => v.toFixed(2);

  return (
    <div className="rounded-2xl border border-violet-500/25 bg-[#030e1f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#1a3a60]/60 px-4 py-2.5">
        <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
        <span className="text-xs font-black text-white">Live2D Rig Preview</span>
        <span className="ml-1 rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[9px] font-black text-violet-300">INTERACTIVE</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setIsPlaying(!isPlaying)}
            className="grid h-6 w-6 place-items-center rounded-lg bg-[#1a3a60]/50 text-blue-200/60 hover:text-white transition">
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
          <button onClick={() => setShowParams(!showParams)}
            className={`grid h-6 w-6 place-items-center rounded-lg transition ${showParams ? "bg-violet-500/30 text-violet-300" : "bg-[#1a3a60]/50 text-blue-200/60 hover:text-white"}`}>
            <Sliders className="h-3 w-3" />
          </button>
          <button onClick={handleReset}
            className="grid h-6 w-6 place-items-center rounded-lg bg-[#1a3a60]/50 text-blue-200/60 hover:text-white transition">
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-gradient-to-b from-[#0d1f3d] to-[#030e1f]">
        <canvas
          ref={canvasRef}
          width={320}
          height={380}
          className="w-full cursor-crosshair"
          style={{ maxHeight: 380 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseLeave}
        />
        {/* Crosshair hint */}
        <div className="pointer-events-none absolute bottom-2 left-3 flex items-center gap-1.5 text-[10px] text-blue-200/30">
          <Move className="h-3 w-3" /> Move mouse to control head
        </div>
        {/* Live param badge */}
        <div className="pointer-events-none absolute right-3 top-2 flex flex-col items-end gap-1">
          <div className="rounded-full border border-[#1a3a60]/60 bg-[#030e1f]/80 px-2 py-0.5 text-[9px] font-black text-blue-200/40 backdrop-blur">
            AngleX {fmtParam(liveParams.angleX)}° · Y {fmtParam(liveParams.angleY)}°
          </div>
          <div className="rounded-full border border-[#1a3a60]/60 bg-[#030e1f]/80 px-2 py-0.5 text-[9px] font-black text-blue-200/40 backdrop-blur">
            <Eye className="inline h-2.5 w-2.5 mr-0.5" />
            L {fmtParam(liveParams.eyeL)} · R {fmtParam(liveParams.eyeR)}
          </div>
          <div className="rounded-full border border-[#1a3a60]/60 bg-[#030e1f]/80 px-2 py-0.5 text-[9px] font-black text-blue-200/40 backdrop-blur">
            <Smile className="inline h-2.5 w-2.5 mr-0.5" />
            Mouth {fmtParam(liveParams.mouthOpen)}
          </div>
        </div>
      </div>

      {/* Color preset row */}
      <div className="flex items-center gap-2 border-t border-[#1a3a60]/50 px-3 py-2.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200/30 shrink-0">Hair</span>
        <div className="flex gap-1.5">
          {COLOR_PRESETS.map((c) => (
            <button key={c.id} onClick={() => setColorId(c.id)} title={c.label}
              className={`h-5 w-5 rounded-full border-2 transition ${colorId === c.id ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
              style={{ background: c.hair }} />
          ))}
        </div>
        <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-blue-200/30 shrink-0">Skin</span>
        <div className="flex gap-1.5">
          {SKIN_TONES.map((s) => (
            <button key={s.id} onClick={() => setSkinId(s.id)} title={s.id}
              className={`h-5 w-5 rounded-full border-2 transition ${skinId === s.id ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
              style={{ background: s.skin }} />
          ))}
        </div>
      </div>

      {/* Manual param sliders (shown when paused or toggled) */}
      {showParams && (
        <div className="border-t border-[#1a3a60]/50 p-3 space-y-2 bg-[#06101f]/80">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-300/60 mb-2">Manual Parameters</p>
          {[
            { key: "angleX", label: "Angle X (Yaw)", min: -30, max: 30 },
            { key: "angleY", label: "Angle Y (Pitch)", min: -30, max: 30 },
            { key: "eyeL", label: "Eye L Open", min: 0, max: 1, step: 0.01 },
            { key: "eyeR", label: "Eye R Open", min: 0, max: 1, step: 0.01 },
            { key: "mouthOpen", label: "Mouth Open", min: 0, max: 1, step: 0.01 },
            { key: "browLY", label: "Brow L (raise)", min: -1, max: 1, step: 0.01 },
            { key: "browRY", label: "Brow R (raise)", min: -1, max: 1, step: 0.01 },
            { key: "cheekFlush", label: "Cheek Blush", min: 0, max: 1, step: 0.01 },
          ].map(({ key, label, min, max, step = 1 }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-[10px] text-blue-200/50 truncate">{label}</span>
              <input
                type="range" min={min} max={max} step={step}
                value={liveParams[key] ?? 0}
                onChange={(e) => setParam(key, parseFloat(e.target.value))}
                className="flex-1 accent-violet-500 h-1.5"
              />
              <span className="w-10 text-right text-[10px] font-black text-violet-300">{fmtParam(liveParams[key] ?? 0)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer hint */}
      <div className="border-t border-[#1a3a60]/40 px-3 py-2 flex items-center gap-2">
        <span className="text-[9px] text-blue-200/25">Simulates Live2D Cubism parameters · AngleX/Y · EyeOpen · MouthOpen · BrowY</span>
      </div>
    </div>
  );
}