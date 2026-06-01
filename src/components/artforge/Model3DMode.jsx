import { useState, useRef, useEffect } from "react";
import {
  Box, Loader2, Download, Zap, CheckCircle2,
  RotateCcw, Layers, Sparkles, Camera, Eye, Copy
} from "lucide-react";
import { toast } from "sonner";
import CharacterInputPanel from "@/components/artforge/CharacterInputPanel";
import * as THREE from "three";
import Model3DRigPreview from "@/components/artforge/Model3DRigPreview";

// ── Config ──────────────────────────────────────────────────────────────────

const CHARACTER_PRESETS = [
  { id: "anime_girl", label: "Anime Girl", emoji: "👧", color: "#ff6eb4", prompt: "cute anime girl character, big expressive eyes, long flowing hair, school uniform, detailed facial features" },
  { id: "warrior", label: "Fantasy Warrior", emoji: "⚔️", color: "#ff8c42", prompt: "fantasy warrior character, ornate armor, battle-worn details, heroic pose, dynamic silhouette" },
  { id: "vtuber", label: "VTuber Model", emoji: "🎭", color: "#a855f7", prompt: "VTuber avatar, anime style, expressive face rig, colorful hair, idol costume, live2d-style features" },
  { id: "mech", label: "Mech / Robot", emoji: "🤖", color: "#00c8ff", prompt: "sci-fi mech robot, modular armor panels, glowing accents, joint articulation visible, gundam-inspired" },
  { id: "creature", label: "Fantasy Creature", emoji: "🐉", color: "#10b981", prompt: "mystical fantasy creature, detailed scales/fur, expressive face, creature design, game-ready" },
  { id: "chibi", label: "Chibi / SD", emoji: "🌸", color: "#f59e0b", prompt: "super-deformed chibi character, 1:2 head-to-body ratio, big round eyes, cute accessories, pastel colors" },
];

const MODEL_STYLES = [
  { id: "game_ready", label: "Game Ready", desc: "Low-poly, UV-mapped, engine-ready" },
  { id: "high_detail", label: "High Detail", desc: "Subdivision-ready, cinematic quality" },
  { id: "vtuber_rig", label: "VTuber Rig", desc: "Face rigged, blend shapes included" },
  { id: "3d_print", label: "3D Print", desc: "Watertight, support-optimized" },
];

const TEXTURE_STYLES = [
  { id: "anime", label: "Anime / Toon", emoji: "⛩️" },
  { id: "pbr", label: "PBR Realistic", emoji: "✨" },
  { id: "cel", label: "Cel Shaded", emoji: "🎨" },
  { id: "clay", label: "White Clay", emoji: "⬜" },
];

const EXPORT_FORMATS = ["GLB", "FBX", "OBJ", "USDZ"];

// ── 3D Turntable Viewer ──────────────────────────────────────────────────────

function TurntableViewer({ modelUrl, isGenerating, prompt }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animFrameRef = useRef(null);
  const meshRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = el.clientHeight;

    // Scene
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1.2, 3.5);
    camera.lookAt(0, 0.5, 0);

    // Lighting - anime-style
    const ambient = new THREE.AmbientLight(0x8888ff, 0.6);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x00c8ff, 0.5);
    rim.position.set(-3, 2, -2);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xff6eb4, 0.3);
    fill.position.set(0, -1, 2);
    scene.add(fill);

    // Placeholder anime-style character mesh (until real generation)
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.28, 0.6, 8, 16);
    const bodyMat = new THREE.MeshToonMaterial({ color: 0xffe4e1 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.4;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.32, 32, 32);
    const headMat = new THREE.MeshToonMaterial({ color: 0xfce4d0 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.22;
    group.add(head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.34, 32, 32);
    const hairMat = new THREE.MeshToonMaterial({ color: 0x2d1b69 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.28;
    hair.scale.set(1, 0.75, 1);
    group.add(hair);

    // Hair strand
    const strandGeo = new THREE.CylinderGeometry(0.05, 0.02, 0.7, 8);
    const strand = new THREE.Mesh(strandGeo, hairMat);
    strand.position.set(0.28, 0.85, 0.1);
    strand.rotation.z = 0.3;
    group.add(strand);

    // Eyes
    [-0.1, 0.1].forEach((x) => {
      const eyeGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const eyeMat = new THREE.MeshToonMaterial({ color: 0x9333ea });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, 1.22, 0.28);
      group.add(eye);
    });

    // Skirt / dress
    const skirtGeo = new THREE.ConeGeometry(0.42, 0.55, 16);
    const skirtMat = new THREE.MeshToonMaterial({ color: 0x6366f1 });
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    skirt.position.y = -0.05;
    group.add(skirt);

    // Legs
    [-0.12, 0.12].forEach((x) => {
      const legGeo = new THREE.CapsuleGeometry(0.08, 0.45, 8, 8);
      const legMat = new THREE.MeshToonMaterial({ color: 0xfce4d0 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, -0.52, 0);
      group.add(leg);
    });

    // Arms
    [-0.4, 0.4].forEach((x) => {
      const armGeo = new THREE.CapsuleGeometry(0.07, 0.4, 8, 8);
      const armMat = new THREE.MeshToonMaterial({ color: 0xfce4d0 });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(x, 0.38, 0);
      arm.rotation.z = x < 0 ? 0.3 : -0.3;
      group.add(arm);
    });

    // Ground ring
    const ringGeo = new THREE.RingGeometry(0.45, 0.55, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.85;
    group.add(ring);

    meshRef.current = group;
    scene.add(group);
    sceneRef.current = { renderer, scene, camera };

    // Animate
    let t = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.008;
      group.rotation.y = t;
      group.position.y = Math.sin(t * 1.5) * 0.04;
      // Pulse ring
      ring.material.opacity = 0.2 + Math.sin(t * 2) * 0.15;
      renderer.render(scene, camera);
    };
    animate();

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
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      {/* Overlay HUD */}
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-[#00c8ff]/30 bg-[#030e1f]/80 px-2.5 py-1 text-[10px] font-black text-[#00c8ff] backdrop-blur">
          <RotateCcw className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} />
          Turntable
        </div>
      </div>
      <div className="pointer-events-none absolute right-3 top-3">
        <div className="rounded-full border border-[#1a3a60]/60 bg-[#030e1f]/80 px-2.5 py-1 text-[10px] font-black text-blue-200/50 backdrop-blur">
          Preview Model
        </div>
      </div>
      {isGenerating && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030e1f]/80 backdrop-blur-sm rounded-2xl">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-full border-4 border-[#1a3a60] border-t-orange-500 animate-spin" />
            <Box className="absolute inset-0 m-auto h-7 w-7 text-orange-400" />
          </div>
          <p className="font-black text-white text-sm">Building 3D Model…</p>
          <p className="mt-1 text-xs text-blue-200/40">Tripo3D processing · ~30–60s</p>
          {prompt && <p className="mt-2 max-w-[220px] truncate text-center text-[10px] text-blue-200/30">"{prompt}"</p>}
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Model3DMode({ onGenerate, isGenerating, selectedAsset }) {
  const [inputType, setInputType] = useState("preset"); // "preset" | "text" | "image"
  const [selectedPreset, setSelectedPreset] = useState("anime_girl");
  const [textPrompt, setTextPrompt] = useState("");
  const [modelStyle, setModelStyle] = useState("game_ready");
  const [textureStyle, setTextureStyle] = useState("anime");
  const [selectedFormats, setSelectedFormats] = useState(["GLB"]);
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);

  const preset = CHARACTER_PRESETS.find((p) => p.id === selectedPreset);

  const toggleFormat = (fmt) => setSelectedFormats((prev) =>
    prev.includes(fmt) ? (prev.length > 1 ? prev.filter((f) => f !== fmt) : prev) : [...prev, fmt]
  );

  const buildPrompt = () => {
    const style = MODEL_STYLES.find((s) => s.id === modelStyle);
    const tex = TEXTURE_STYLES.find((t) => t.id === textureStyle);
    const base = inputType === "preset" ? preset?.prompt
      : (sourceImage ? "Convert this reference image into a high-quality 3D character model. " : "") + (textPrompt || "stylized 3D character");

    return [
      base,
      `Style: ${style?.label} — ${style?.desc}.`,
      `Texture: ${tex?.label} look.`,
      `Export: ${selectedFormats.join(", ")}.`,
      "Clean topology, proper edge loops, UV unwrapped, game-engine-ready, centered at origin.",
      modelStyle === "vtuber_rig" ? "Include face rig, 52 blend shapes for expressions, ARKit compatible." : "",
      modelStyle === "3d_print" ? "Watertight mesh, no non-manifold edges, optimized for FDM printing." : "",
    ].filter(Boolean).join(" ");
  };

  const handleGenerate = () => {
    if (inputType === "preset" && !selectedPreset) {
      toast.error("Select a character preset");
      return;
    }
    if (inputType === "text" && !textPrompt.trim() && !sourceImage) {
      toast.error("Describe your character or upload a reference photo");
      return;
    }
    onGenerate({
      prompt: buildPrompt(),
      mode: "3d_model",
      provider: "tripo3d",
      referenceImages: sourceImage ? [sourceImage] : [],
      quality: "ultra",
      aspect: "1:1",
    });
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(buildPrompt());
    toast.success("Prompt copied to clipboard");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Left — controls */}
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-violet-500">
              <Box className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-white">Anime 3D Character Studio</h3>
              <p className="text-xs text-blue-200/45">AI-powered · Turntable preview · VTuber & game-ready</p>
            </div>
          </div>
          {/* Input tabs */}
          <div className="flex rounded-xl border border-[#1a3a60]/60 overflow-hidden text-xs font-black">
            {[["preset", "🎭 Presets"], ["text", "✏️ Text / Speech / Photo"]].map(([id, label]) => (
              <button key={id} onClick={() => setInputType(id)}
                className={`flex-1 py-2.5 transition ${inputType === id ? "bg-orange-500/20 text-white" : "text-blue-200/40 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Preset picker with quick details */}
        {inputType === "preset" && (
          <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Character Presets</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CHARACTER_PRESETS.map((p) => (
                <button key={p.id} onClick={() => setSelectedPreset(p.id)}
                  className={`rounded-xl border p-3 text-left transition group ${selectedPreset === p.id ? "border-orange-500/60 bg-orange-500/12" : "border-[#1a3a60]/60 bg-[#030e1f]/60 hover:border-orange-500/30"}`}
                  title={p.prompt}>
                  <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{p.emoji}</span>
                  <p className="text-xs font-black text-white leading-tight">{p.label}</p>
                  <p className="mt-1 text-[10px] text-blue-200/35 line-clamp-2 leading-tight">{p.prompt.split(",")[0]}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text / Photo / Speech unified input */}
        {inputType === "text" && (
          <CharacterInputPanel
            textPrompt={textPrompt}
            setTextPrompt={setTextPrompt}
            sourceImage={sourceImage}
            setSourceImage={setSourceImage}
            sourcePreview={sourcePreview}
            setSourcePreview={setSourcePreview}
            accentColor="orange"
            placeholder="e.g. Stylized anime warrior girl with glowing sword, fantasy armor, flowing white hair…"
            quickExamples={["anime girl mage", "chibi dragon rider", "cyberpunk idol", "fantasy knight"]}
          />
        )}

        {/* Style options */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Model Style</p>
            <div className="space-y-2">
              {MODEL_STYLES.map((s) => (
                <button key={s.id} onClick={() => setModelStyle(s.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-2.5 text-left transition ${modelStyle === s.id ? "border-orange-500/60 bg-orange-500/10" : "border-[#1a3a60]/60 hover:border-orange-500/30"}`}>
                  <div className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${modelStyle === s.id ? "border-orange-500 bg-orange-500" : "border-blue-200/30"}`} />
                  <div>
                    <p className="text-xs font-black text-white">{s.label}</p>
                    <p className="text-[10px] text-blue-200/35">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Texture Style</p>
              <div className="grid grid-cols-2 gap-2">
                {TEXTURE_STYLES.map((t) => (
                  <button key={t.id} onClick={() => setTextureStyle(t.id)}
                    className={`rounded-xl border p-2.5 text-center transition ${textureStyle === t.id ? "border-orange-500/60 bg-orange-500/15" : "border-[#1a3a60]/60 hover:border-orange-500/30"}`}>
                    <span className="text-base">{t.emoji}</span>
                    <p className="mt-1 text-[10px] font-black text-white">{t.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Export Formats</p>
              <div className="flex flex-wrap gap-2">
                {EXPORT_FORMATS.map((fmt) => (
                  <button key={fmt} onClick={() => toggleFormat(fmt)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-black transition ${selectedFormats.includes(fmt) ? "border-orange-500/60 bg-orange-500/15 text-white" : "border-[#1a3a60]/60 text-blue-200/40 hover:text-white"}`}>
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate & Copy buttons */}
        <div className="flex gap-2">
          <button onClick={handleGenerate} disabled={isGenerating}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-violet-500 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-50">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "Generating…" : "Generate 3D"}
          </button>
          <button onClick={copyPrompt}
            className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3.5 text-sm font-black text-orange-300 transition hover:bg-orange-500/20">
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-blue-200/30">Tripo3D AI · 30–60s generation</p>
      </div>

      {/* Right — 3D viewer */}
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {/* Interactive 3D rig preview */}
        {!isGenerating && <Model3DRigPreview preset={selectedPreset} />}

        {/* Generating overlay */}
        {isGenerating && (
          <div className="rounded-2xl border border-orange-500/20 bg-[#030e1f] overflow-hidden" style={{ height: 360 }}>
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-[#1a3a60] border-t-orange-500 animate-spin" />
                <Box className="absolute inset-0 m-auto h-7 w-7 text-orange-400" />
              </div>
              <p className="font-black text-white text-sm">Building 3D Model…</p>
              <p className="text-xs text-blue-200/40">Tripo3D processing · ~30–60s</p>
            </div>
          </div>
        )}

        {/* Preset info card */}
        {inputType === "preset" && preset && (
          <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{preset.emoji}</span>
              <div>
                <p className="font-black text-white">{preset.label}</p>
                <p className="text-xs text-blue-200/40">Selected preset</p>
              </div>
            </div>
            <p className="text-xs text-blue-200/50 leading-relaxed">{preset.prompt}</p>
          </div>
        )}

        {/* Output downloads */}
        {selectedAsset?.url && (
          <div className="rounded-2xl border border-emerald-500/20 bg-[#06101f]/90 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-black text-white">Model Ready!</p>
            </div>
            <img src={selectedAsset.url} alt="3D render" className="w-full rounded-xl mb-3 shadow-xl" />
            <div className="grid grid-cols-2 gap-2">
              {selectedFormats.map((fmt) => (
                <a key={fmt} href={selectedAsset.url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 py-2 text-xs font-black text-orange-300 hover:bg-orange-500/25 transition">
                  <Download className="h-3 w-3" /> .{fmt}
                </a>
              ))}
            </div>
            <p className="mt-2 text-center text-[10px] text-blue-200/35">Compatible with Blender, Unity, Unreal, VSeeFace</p>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl border border-[#1a3a60]/50 bg-[#06101f]/60 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-blue-200/30">Tips for best results</p>
          <ul className="space-y-1.5">
            {[
              { icon: Camera, text: "Front-facing reference images give the most accurate results" },
              { icon: Layers, text: "VTuber Rig style includes 52 blend shapes for facial expressions" },
              { icon: Eye, text: "Anime / Toon texture works best for VStreamer avatars" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-orange-400/60" />
                <span className="text-[11px] text-blue-200/40 leading-tight">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}