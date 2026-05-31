import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { RotateCcw, Play, Pause, Sliders, Move, Eye, Box, Zap } from "lucide-react";
import AvatarExportPanel from "@/components/artforge/AvatarExportPanel";

// ── Color presets ─────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { id: "purple", label: "Purple", hair: 0x3d1a6e, hairLight: 0x8b5cf6, skin: 0xfce4d0, outfit: 0x6d28d9, outfitDark: 0x4c1d95, eye: 0x8b5cf6 },
  { id: "pink",   label: "Pink",   hair: 0x9d174d, hairLight: 0xdb2777, skin: 0xfce4d0, outfit: 0xdb2777, outfitDark: 0x9d174d, eye: 0xec4899 },
  { id: "blue",   label: "Blue",   hair: 0x1e3a5f, hairLight: 0x2563eb, skin: 0xfce4d0, outfit: 0x1d4ed8, outfitDark: 0x1e3a5f, eye: 0x3b82f6 },
  { id: "teal",   label: "Teal",   hair: 0x134e4a, hairLight: 0x0d9488, skin: 0xfce4d0, outfit: 0x0d9488, outfitDark: 0x134e4a, eye: 0x14b8a6 },
  { id: "silver", label: "Silver", hair: 0x334155, hairLight: 0x94a3b8, skin: 0xfce4d0, outfit: 0x475569, outfitDark: 0x334155, eye: 0x64748b },
];

const SKIN_TONES = [
  { id: "fair",   skin: 0xfce4d0, skinShadow: 0xe8bea0 },
  { id: "medium", skin: 0xf3c99b, skinShadow: 0xd4a574 },
  { id: "tan",    skin: 0xc68642, skinShadow: 0xa0662e },
];

// ── Build the character group ─────────────────────────────────────────────────
function buildCharacter(colors, skinTone) {
  const group = new THREE.Group();

  const skinColor  = skinTone.skin;
  const hairColor  = colors.hair;
  const outfitColor = colors.outfit;
  const outfitDark  = colors.outfitDark;
  const eyeColor   = colors.eye;

  const toon = (c) => new THREE.MeshToonMaterial({ color: c });
  const phong = (c, shininess = 30) => new THREE.MeshPhongMaterial({ color: c, shininess });

  // ── Neck
  const neckGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.28, 16);
  const neck = new THREE.Mesh(neckGeo, toon(skinColor));
  neck.position.y = -0.28;
  group.add(neck);

  // ── Body / torso
  const torsoGeo = new THREE.CapsuleGeometry(0.28, 0.5, 8, 16);
  const torso = new THREE.Mesh(torsoGeo, toon(outfitColor));
  torso.position.y = -0.75;
  group.add(torso);

  // Outfit detail (collar)
  const collarGeo = new THREE.TorusGeometry(0.14, 0.03, 8, 24);
  const collar = new THREE.Mesh(collarGeo, toon(outfitDark));
  collar.position.y = -0.38;
  collar.rotation.x = Math.PI / 2;
  group.add(collar);

  // ── Head group (for rotation)
  const headGroup = new THREE.Group();

  // Face
  const headGeo = new THREE.SphereGeometry(0.38, 32, 32);
  const head = new THREE.Mesh(headGeo, toon(skinColor));
  headGroup.add(head);

  // Jaw taper
  const jawGeo = new THREE.SphereGeometry(0.32, 16, 16);
  const jaw = new THREE.Mesh(jawGeo, toon(skinColor));
  jaw.position.y = -0.12;
  jaw.scale.set(1, 0.7, 0.9);
  headGroup.add(jaw);

  // ── Hair (back)
  const hairBackGeo = new THREE.SphereGeometry(0.41, 32, 32);
  const hairBack = new THREE.Mesh(hairBackGeo, toon(hairColor));
  hairBack.position.y = 0.04;
  hairBack.scale.set(1, 0.88, 1);
  headGroup.add(hairBack);

  // Hair top
  const hairTopGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const hairTop = new THREE.Mesh(hairTopGeo, toon(hairColor));
  hairTop.position.set(0, 0.3, -0.06);
  headGroup.add(hairTop);

  // Hair side L
  const hairSideL = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.09, 0.45, 8, 8),
    toon(hairColor)
  );
  hairSideL.position.set(-0.36, -0.22, 0);
  hairSideL.rotation.z = 0.18;
  headGroup.add(hairSideL);

  // Hair side R
  const hairSideR = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.09, 0.45, 8, 8),
    toon(hairColor)
  );
  hairSideR.position.set(0.36, -0.22, 0);
  hairSideR.rotation.z = -0.18;
  headGroup.add(hairSideR);

  // Bang strands
  for (let i = -2; i <= 2; i++) {
    const bangGeo = new THREE.CapsuleGeometry(0.055, 0.22, 6, 6);
    const bang = new THREE.Mesh(bangGeo, toon(hairColor));
    bang.position.set(i * 0.1, 0.16, 0.3);
    bang.rotation.x = -0.4 + Math.abs(i) * 0.08;
    bang.rotation.z = i * 0.12;
    headGroup.add(bang);
  }

  // ── Ears
  const earGeo = new THREE.SphereGeometry(0.09, 12, 12);
  const earL = new THREE.Mesh(earGeo, toon(skinColor));
  earL.position.set(-0.37, 0, 0);
  earL.scale.set(0.7, 1, 0.6);
  headGroup.add(earL);

  const earR = new THREE.Mesh(earGeo, toon(skinColor));
  earR.position.set(0.37, 0, 0);
  earR.scale.set(0.7, 1, 0.6);
  headGroup.add(earR);

  // ── Eyes (as groups for opening/closing)
  const makeEye = (side) => {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(side * 0.14, 0.06, 0.33);

    // Sclera
    const scleraGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const sclera = new THREE.Mesh(scleraGeo, new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 60 }));
    eyeGroup.add(sclera);

    // Iris
    const irisGeo = new THREE.SphereGeometry(0.052, 16, 16);
    const iris = new THREE.Mesh(irisGeo, phong(eyeColor, 80));
    iris.position.z = 0.03;
    eyeGroup.add(iris);

    // Pupil
    const pupilGeo = new THREE.SphereGeometry(0.028, 12, 12);
    const pupil = new THREE.Mesh(pupilGeo, new THREE.MeshBasicMaterial({ color: 0x0a0010 }));
    pupil.position.z = 0.06;
    eyeGroup.add(pupil);

    // Shine
    const shineGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const shine = new THREE.Mesh(shineGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    shine.position.set(-0.02, 0.02, 0.075);
    eyeGroup.add(shine);

    // Upper eyelid (for blinking)
    const lidGeo = new THREE.CapsuleGeometry(0.076, 0.01, 6, 12);
    const lid = new THREE.Mesh(lidGeo, toon(skinColor));
    lid.position.z = 0.04;
    lid.rotation.z = Math.PI / 2;
    lid.userData.isLid = true;
    eyeGroup.add(lid);

    eyeGroup.userData.lid = lid;
    eyeGroup.userData.iris = iris;
    return eyeGroup;
  };

  const eyeL = makeEye(-1);
  const eyeR = makeEye(1);
  headGroup.add(eyeL);
  headGroup.add(eyeR);
  headGroup.userData.eyeL = eyeL;
  headGroup.userData.eyeR = eyeR;

  // ── Eyebrows
  const makeBrow = (side) => {
    const browGeo = new THREE.CapsuleGeometry(0.008, 0.1, 4, 8);
    const brow = new THREE.Mesh(browGeo, toon(hairColor));
    brow.position.set(side * 0.14, 0.2, 0.34);
    brow.rotation.z = side * -0.25;
    brow.rotation.x = 0.2;
    return brow;
  };
  const browL = makeBrow(-1);
  const browR = makeBrow(1);
  headGroup.add(browL);
  headGroup.add(browR);
  headGroup.userData.browL = browL;
  headGroup.userData.browR = browR;

  // ── Mouth group
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.17, 0.35);

  // Upper lip
  const upperLipGeo = new THREE.CapsuleGeometry(0.008, 0.13, 4, 8);
  const upperLip = new THREE.Mesh(upperLipGeo, toon(0xd4748a));
  upperLip.rotation.z = Math.PI / 2;
  upperLip.position.y = 0.01;
  mouthGroup.add(upperLip);

  // Lower lip
  const lowerLipGeo = new THREE.CapsuleGeometry(0.009, 0.11, 4, 8);
  const lowerLip = new THREE.Mesh(lowerLipGeo, toon(0xd4748a));
  lowerLip.rotation.z = Math.PI / 2;
  lowerLip.position.y = -0.02;
  mouthGroup.add(lowerLip);

  headGroup.add(mouthGroup);
  headGroup.userData.mouthGroup = mouthGroup;
  headGroup.userData.upperLip = upperLip;
  headGroup.userData.lowerLip = lowerLip;

  // ── Nose (subtle)
  const noseGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const nose = new THREE.Mesh(noseGeo, toon(skinColor));
  nose.position.set(0, -0.06, 0.37);
  nose.scale.set(1.2, 0.8, 0.8);
  headGroup.add(nose);

  group.userData.headGroup = headGroup;
  group.add(headGroup);

  // ── Arms
  const makeArm = (side) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.4, -0.65, 0);

    const upperArmGeo = new THREE.CapsuleGeometry(0.09, 0.28, 8, 8);
    const upperArm = new THREE.Mesh(upperArmGeo, toon(outfitColor));
    upperArm.rotation.z = side * -0.35;
    armGroup.add(upperArm);

    const lowerArmGeo = new THREE.CapsuleGeometry(0.075, 0.24, 8, 8);
    const lowerArm = new THREE.Mesh(lowerArmGeo, toon(skinColor));
    lowerArm.position.set(side * 0.14, -0.28, 0);
    lowerArm.rotation.z = side * -0.2;
    armGroup.add(lowerArm);

    return armGroup;
  };
  group.add(makeArm(-1));
  group.add(makeArm(1));

  // ── Ground glow ring
  const ringGeo = new THREE.RingGeometry(0.38, 0.48, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: eyeColor, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -1.25;
  group.userData.ring = ring;
  group.userData.ringMat = ringMat;
  group.add(ring);

  return group;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Model3DRigPreview({ preset = "anime_girl" }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const charRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, inside: false });
  const tRef = useRef(0);
  const blinkTimerRef = useRef(2);
  const isBlinkingRef = useRef(false);
  const eyeOpenRef = useRef(1);

  const [isPlaying, setIsPlaying] = useState(true);
  const isPlayingRef = useRef(true);
  const [showParams, setShowParams] = useState(false);
  const [colorId, setColorId] = useState("purple");
  const [skinId, setSkinId] = useState("fair");
  const [liveParams, setLiveParams] = useState({ angleX: 0, angleY: 0, eyeOpen: 1, mouthOpen: 0, browY: 0, bodyBob: 0 });
  const [manualParams, setManualParams] = useState(null); // null = auto

  const colorSet = COLOR_PRESETS.find((c) => c.id === colorId) || COLOR_PRESETS[0];
  const skinSet = SKIN_TONES.find((s) => s.id === skinId) || SKIN_TONES[0];
  const colors = { ...colorSet, ...skinSet };

  // Keep ref in sync
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // ── Scene init ────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(0, 0.1, 3.2);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0x8888ff, 0.7);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x00c8ff, 0.6);
    rim.position.set(-3, 2, -2);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0xff6eb4, 0.25);
    fill.position.set(0, -1, 2);
    scene.add(fill);

    // Build character
    const char = buildCharacter(colors, skinSet);
    scene.add(char);
    charRef.current = char;

    sceneRef.current = { renderer, scene, camera };

    // Resize
    const handleResize = () => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animRef.current);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [colorId, skinId]); // rebuild when colors change

  // ── Animation loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      animRef.current = requestAnimationFrame(loop);
      const sc = sceneRef.current;
      const char = charRef.current;
      if (!sc || !char) return;

      tRef.current += 0.016;
      const t = tRef.current;

      const headGroup = char.userData.headGroup;
      const ring = char.userData.ring;
      const ringMat = char.userData.ringMat;

      let targetAngleX, targetAngleY, targetMouth, targetBrow;

      if (manualParams) {
        targetAngleX = manualParams.angleX;
        targetAngleY = manualParams.angleY;
        targetMouth  = manualParams.mouthOpen;
        targetBrow   = manualParams.browY;
      } else if (isPlayingRef.current) {
        const mx = mouseRef.current.inside ? mouseRef.current.x : 0.5;
        const my = mouseRef.current.inside ? mouseRef.current.y : 0.5;
        targetAngleX = (mx - 0.5) * 0.7 + Math.sin(t * 0.35) * 0.08;
        targetAngleY = -(my - 0.5) * 0.45 + Math.sin(t * 0.55) * 0.06;
        targetMouth  = Math.max(0, Math.sin(t * 4.5) * 0.08 + Math.sin(t * 7) * 0.04);
        targetBrow   = Math.sin(t * 0.5) * 0.04;
      } else {
        return; // paused, no auto updates
      }

      // Smooth lerp head
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetAngleX, 0.07);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetAngleY, 0.07);

      // Body subtle sway
      char.rotation.y = THREE.MathUtils.lerp(char.rotation.y, targetAngleX * 0.15, 0.04);
      const bodyBob = Math.sin(t * 0.9) * 0.018;
      char.position.y = THREE.MathUtils.lerp(char.position.y, bodyBob, 0.05);

      // Brow movement
      const browL = headGroup.userData.browL;
      const browR = headGroup.userData.browR;
      if (browL && browR) {
        browL.position.y = THREE.MathUtils.lerp(browL.position.y, 0.2 + targetBrow * 0.08, 0.06);
        browR.position.y = THREE.MathUtils.lerp(browR.position.y, 0.2 + targetBrow * 0.08, 0.06);
      }

      // Mouth open
      const upperLip = headGroup.userData.upperLip;
      const lowerLip = headGroup.userData.lowerLip;
      if (upperLip && lowerLip) {
        upperLip.position.y = THREE.MathUtils.lerp(upperLip.position.y, 0.01 + targetMouth * 0.06, 0.08);
        lowerLip.position.y = THREE.MathUtils.lerp(lowerLip.position.y, -0.02 - targetMouth * 0.06, 0.08);
      }

      // Blinking
      if (!manualParams && isPlayingRef.current) {
        blinkTimerRef.current -= 0.016;
        if (blinkTimerRef.current <= 0 && !isBlinkingRef.current) {
          isBlinkingRef.current = true;
          blinkTimerRef.current = 2.5 + Math.random() * 3.5;
          setTimeout(() => { isBlinkingRef.current = false; }, 140);
        }
        const targetEye = isBlinkingRef.current ? 0 : 1;
        eyeOpenRef.current = THREE.MathUtils.lerp(eyeOpenRef.current, targetEye, 0.18);
      }

      // Apply eyelid
      const eyeOpenVal = manualParams ? manualParams.eyeOpen : eyeOpenRef.current;
      [headGroup.userData.eyeL, headGroup.userData.eyeR].forEach((eyeG) => {
        if (!eyeG) return;
        const lid = eyeG.userData.lid;
        if (lid) {
          lid.position.y = THREE.MathUtils.lerp(lid.position.y, (1 - eyeOpenVal) * 0.075 - 0.01, 0.15);
          lid.scale.y = THREE.MathUtils.lerp(lid.scale.y, 1 + (1 - eyeOpenVal) * 5, 0.15);
        }
      });

      // Ring pulse
      if (ring && ringMat) {
        ringMat.opacity = 0.18 + Math.sin(t * 2.2) * 0.1;
        ring.rotation.z = t * 0.3;
      }

      // Live param display update
      setLiveParams({
        angleX: Math.round(headGroup.rotation.y * 57.3 * 10) / 10,
        angleY: Math.round(headGroup.rotation.x * 57.3 * 10) / 10,
        eyeOpen: Math.round(eyeOpenVal * 100) / 100,
        mouthOpen: Math.round(targetMouth * 100) / 100,
        browY: Math.round(targetBrow * 100) / 100,
        bodyBob: Math.round(bodyBob * 100) / 100,
      });

      sc.renderer.render(sc.scene, sc.camera);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [manualParams]);

  // ── Mouse tracking ────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const el = mountRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseRef.current = {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
      inside: true,
    };
  }, []);

  const handleMouseLeave = useCallback(() => { mouseRef.current.inside = false; }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const el = mountRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const touch = e.touches[0];
    mouseRef.current = {
      x: Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height)),
      inside: true,
    };
  }, []);

  const handleReset = () => {
    setManualParams(null);
    mouseRef.current.inside = false;
    const char = charRef.current;
    if (char) {
      char.rotation.y = 0;
      char.position.y = 0;
      const hg = char.userData.headGroup;
      if (hg) { hg.rotation.y = 0; hg.rotation.x = 0; }
    }
  };

  const setManual = (key, val) => {
    setManualParams((prev) => ({ ...(prev || liveParams), [key]: val }));
  };

  const fmt = (v) => (typeof v === "number" ? v.toFixed(2) : "0.00");

  return (
    <div className="rounded-2xl border border-orange-500/25 bg-[#030e1f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#1a3a60]/60 px-4 py-2.5">
        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-xs font-black text-white">3D Rig Preview</span>
        <span className="ml-1 rounded-full bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[9px] font-black text-orange-300">INTERACTIVE</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => { setIsPlaying((p) => !p); isPlayingRef.current = !isPlayingRef.current; }}
            className="grid h-6 w-6 place-items-center rounded-lg bg-[#1a3a60]/50 text-blue-200/60 hover:text-white transition">
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
          <button onClick={() => setShowParams((p) => !p)}
            className={`grid h-6 w-6 place-items-center rounded-lg transition ${showParams ? "bg-orange-500/30 text-orange-300" : "bg-[#1a3a60]/50 text-blue-200/60 hover:text-white"}`}>
            <Sliders className="h-3 w-3" />
          </button>
          <button onClick={handleReset}
            className="grid h-6 w-6 place-items-center rounded-lg bg-[#1a3a60]/50 text-blue-200/60 hover:text-white transition">
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Three.js viewport */}
      <div className="relative bg-gradient-to-b from-[#0d1f3d] to-[#030e1f]">
        <div
          ref={mountRef}
          className="w-full cursor-crosshair"
          style={{ height: 360 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseLeave}
        />

        {/* Hint */}
        <div className="pointer-events-none absolute bottom-2 left-3 flex items-center gap-1.5 text-[10px] text-blue-200/30">
          <Move className="h-3 w-3" /> Move mouse to control head rotation
        </div>

        {/* Live param badges */}
        <div className="pointer-events-none absolute right-3 top-2 flex flex-col items-end gap-1">
          <div className="rounded-full border border-[#1a3a60]/60 bg-[#030e1f]/80 px-2 py-0.5 text-[9px] font-black text-blue-200/40 backdrop-blur">
            AngleX {fmt(liveParams.angleX)}° · Y {fmt(liveParams.angleY)}°
          </div>
          <div className="rounded-full border border-[#1a3a60]/60 bg-[#030e1f]/80 px-2 py-0.5 text-[9px] font-black text-blue-200/40 backdrop-blur">
            <Eye className="inline h-2.5 w-2.5 mr-0.5" />Eye {fmt(liveParams.eyeOpen)}
          </div>
          <div className="rounded-full border border-[#1a3a60]/60 bg-[#030e1f]/80 px-2 py-0.5 text-[9px] font-black text-blue-200/40 backdrop-blur">
            <Box className="inline h-2.5 w-2.5 mr-0.5" />Mouth {fmt(liveParams.mouthOpen)}
          </div>
        </div>
      </div>

      {/* Color pickers */}
      <div className="flex items-center gap-2 border-t border-[#1a3a60]/50 px-3 py-2.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200/30 shrink-0">Hair</span>
        <div className="flex gap-1.5">
          {COLOR_PRESETS.map((c) => (
            <button key={c.id} onClick={() => setColorId(c.id)} title={c.label}
              className={`h-5 w-5 rounded-full border-2 transition ${colorId === c.id ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
              style={{ background: `#${c.hair.toString(16).padStart(6, "0")}` }} />
          ))}
        </div>
        <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-blue-200/30 shrink-0">Skin</span>
        <div className="flex gap-1.5">
          {SKIN_TONES.map((s) => (
            <button key={s.id} onClick={() => setSkinId(s.id)} title={s.id}
              className={`h-5 w-5 rounded-full border-2 transition ${skinId === s.id ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
              style={{ background: `#${s.skin.toString(16).padStart(6, "0")}` }} />
          ))}
        </div>
        {manualParams && (
          <button onClick={() => setManualParams(null)} className="ml-auto text-[10px] text-orange-300 hover:underline">← Auto</button>
        )}
      </div>

      {/* Manual sliders */}
      {showParams && (
        <div className="border-t border-[#1a3a60]/50 p-3 space-y-2 bg-[#06101f]/80">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-300/60 mb-2">Manual Parameters</p>
          {[
            { key: "angleX", label: "Angle X (Yaw °)", min: -35, max: 35, step: 0.5 },
            { key: "angleY", label: "Angle Y (Pitch °)", min: -25, max: 25, step: 0.5 },
            { key: "eyeOpen", label: "Eye Open", min: 0, max: 1, step: 0.01 },
            { key: "mouthOpen", label: "Mouth Open", min: 0, max: 1, step: 0.01 },
            { key: "browY", label: "Brow Raise", min: -1, max: 1, step: 0.01 },
          ].map(({ key, label, min, max, step }) => {
            const current = manualParams ? manualParams[key] : liveParams[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-[10px] text-blue-200/50 truncate">{label}</span>
                <input type="range" min={min} max={max} step={step}
                  value={current ?? 0}
                  onChange={(e) => setManual(key, parseFloat(e.target.value))}
                  className="flex-1 accent-orange-500 h-1.5" />
                <span className="w-10 text-right text-[10px] font-black text-orange-300">{fmt(current ?? 0)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-[#1a3a60]/40 px-3 py-2">
        <span className="text-[9px] text-blue-200/25">Three.js toon shading · Live2D-style params · Mouse-driven face tracking</span>
      </div>

      {/* Export panel */}
      <div className="p-3 pt-0">
        <AvatarExportPanel
          type="3d"
          modelName="My3DAvatar"
          colors={{ hair: `#${colorSet.hair.toString(16).padStart(6,"0")}`, eye: `#${colorSet.eye.toString(16).padStart(6,"0")}` }}
          params={{ angleX: liveParams.angleX, angleY: liveParams.angleY, eyeOpen: liveParams.eyeOpen }}
        />
      </div>
    </div>
  );
}