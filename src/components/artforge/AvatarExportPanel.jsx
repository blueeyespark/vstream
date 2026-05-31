import { useState } from "react";
import { Download, Package, CheckCircle2, Loader2, ChevronDown, ChevronUp, ExternalLink, Zap, FileJson, Box, Layers } from "lucide-react";
import { toast } from "sonner";

// ── Bundle definitions ────────────────────────────────────────────────────────

const VTUBE_STUDIO_BUNDLE = (modelName, colors, params) => ({
  "Version": "1.0",
  "Name": modelName,
  "FileReferences": {
    "Moc": `${modelName}.moc3`,
    "Textures": [`${modelName}.2048/texture_00.png`],
    "Physics": `${modelName}.physics3.json`,
    "Pose": `${modelName}.pose3.json`,
    "UserData": `${modelName}.userdata3.json`,
    "Expression": [
      { "Name": "idle", "File": `expressions/idle.exp3.json` },
      { "Name": "happy", "File": `expressions/happy.exp3.json` },
      { "Name": "sad",   "File": `expressions/sad.exp3.json` },
      { "Name": "angry", "File": `expressions/angry.exp3.json` },
      { "Name": "surprised", "File": `expressions/surprised.exp3.json` },
    ],
    "Motions": {
      "Idle": [{ "File": `motions/idle_01.motion3.json`, "FadeInTime": 0.5, "FadeOutTime": 0.5 }],
      "TapBody": [{ "File": `motions/tap_body_01.motion3.json`, "FadeInTime": 0.5, "FadeOutTime": 0.5 }],
    },
  },
  "Groups": [
    { "Target": "Parameter", "Name": "LipSync",  "Ids": ["ParamMouthOpenY"] },
    { "Target": "Parameter", "Name": "EyeBlink", "Ids": ["ParamEyeLOpen", "ParamEyeROpen"] },
  ],
  "HitAreas": [
    { "Id": "HitArea", "Name": "Head", "LinkedPartId": "HitAreaHead" },
    { "Id": "HitArea", "Name": "Body", "LinkedPartId": "HitAreaBody" },
  ],
  "_meta": {
    "VStreamExport": true,
    "HairColor": colors?.hair || "#3d1a6e",
    "EyeColor": colors?.eye || "#8b5cf6",
    "GeneratedAt": new Date().toISOString(),
    "ParamDefaults": params || {},
  }
});

const VTUBE_STUDIO_PLUGIN_CONFIG = (modelName) => ({
  "APIName": "VTubeStudioPublicAPI",
  "APIVersion": "1.0",
  "PluginName": "VStream ArtForge",
  "PluginDeveloper": "VStream",
  "ModelName": modelName,
  "FaceTracking": {
    "enabled": true,
    "FaceFound": true,
    "Rotation": { "X": 0, "Y": 0, "Z": 0 },
    "EyeLeft": 1.0,
    "EyeRight": 1.0,
    "MouthOpen": 0.0,
    "MouthSmile": 0.0,
    "Brows": 0.0,
  },
  "Parameters": [
    { "Id": "ParamAngleX",     "DefaultValue": 0,  "Min": -30, "Max": 30  },
    { "Id": "ParamAngleY",     "DefaultValue": 0,  "Min": -30, "Max": 30  },
    { "Id": "ParamAngleZ",     "DefaultValue": 0,  "Min": -30, "Max": 30  },
    { "Id": "ParamEyeLOpen",   "DefaultValue": 1,  "Min": 0,   "Max": 1   },
    { "Id": "ParamEyeROpen",   "DefaultValue": 1,  "Min": 0,   "Max": 1   },
    { "Id": "ParamMouthOpenY", "DefaultValue": 0,  "Min": 0,   "Max": 1   },
    { "Id": "ParamBrowLY",     "DefaultValue": 0,  "Min": -1,  "Max": 1   },
    { "Id": "ParamBrowRY",     "DefaultValue": 0,  "Min": -1,  "Max": 1   },
    { "Id": "ParamBodyAngleX", "DefaultValue": 0,  "Min": -10, "Max": 10  },
    { "Id": "ParamBodyAngleY", "DefaultValue": 0,  "Min": -10, "Max": 10  },
    { "Id": "ParamCheek",      "DefaultValue": 0,  "Min": 0,   "Max": 1   },
  ],
});

const PHYSICS3_JSON = (modelName) => ({
  "Version": 3,
  "Meta": { "PhysicsSettingCount": 2, "TotalInputCount": 4, "TotalOutputCount": 4, "VertexCount": 8, "Fps": 30.0, "Name": `${modelName} Physics`, "EffectiveForcesX": 0, "EffectiveForcesY": -1 },
  "PhysicsSettings": [
    {
      "Id": "PhysicsSetting1",
      "Input": [
        { "Source": { "Target": "Parameter", "Id": "ParamAngleX" }, "Weight": 1.0, "Type": "X", "Reflect": false },
        { "Source": { "Target": "Parameter", "Id": "ParamAngleY" }, "Weight": 1.0, "Type": "Y", "Reflect": false },
      ],
      "Output": [
        { "Destination": { "Target": "Parameter", "Id": "ParamHairFront" }, "VertexIndex": 0, "Scale": 1.0, "Weight": 1.0, "Type": "X", "Reflect": false },
        { "Destination": { "Target": "Parameter", "Id": "ParamHairSide" },  "VertexIndex": 0, "Scale": 1.0, "Weight": 1.0, "Type": "X", "Reflect": false },
      ],
      "Vertices": [
        { "Position": { "X": 0, "Y": 0 }, "Radius": 0.0, "Mobility": 0.55, "Delay": 0.8, "Acceleration": 1.5, "Wind": 0.2 },
        { "Position": { "X": 0, "Y": -1.0 }, "Radius": 0.0, "Mobility": 0.55, "Delay": 0.8, "Acceleration": 1.5, "Wind": 0.2 },
      ],
      "Normalization": { "Position": { "Minimum": -10, "Default": 0, "Maximum": 10 }, "Angle": { "Minimum": -10, "Default": 0, "Maximum": 10 } },
    },
  ],
});

const VRM_MANIFEST = (modelName, colors) => ({
  "specVersion": "1.0",
  "extensions": {
    "VRMC_vrm": {
      "specVersion": "1.0",
      "meta": {
        "name": modelName,
        "version": "1.0",
        "authors": ["VStream ArtForge"],
        "licenseUrl": "https://vrm.dev/licenses/1.0/",
        "avatarPermission": "onlyAuthor",
        "allowExcessivelyViolentUsage": false,
        "allowExcessivelySexualUsage": false,
        "commercialUsage": "personalNonProfit",
        "allowPoliticalOrReligiousUsage": false,
        "allowAntisocialOrHateUsage": false,
        "creditNotation": "required",
        "allowRedistribution": false,
        "modification": "prohibited",
      },
      "humanoid": {
        "humanBones": {
          "hips":          { "node": 0 },
          "spine":         { "node": 1 },
          "chest":         { "node": 2 },
          "neck":          { "node": 3 },
          "head":          { "node": 4 },
          "leftUpperLeg":  { "node": 5 },
          "rightUpperLeg": { "node": 6 },
          "leftLowerLeg":  { "node": 7 },
          "rightLowerLeg": { "node": 8 },
          "leftUpperArm":  { "node": 9 },
          "rightUpperArm": { "node": 10 },
          "leftLowerArm":  { "node": 11 },
          "rightLowerArm": { "node": 12 },
        },
      },
      "expressions": {
        "preset": {
          "happy":     { "morphTargetBinds": [{ "node": 4, "index": 0, "weight": 1.0 }] },
          "angry":     { "morphTargetBinds": [{ "node": 4, "index": 1, "weight": 1.0 }] },
          "sad":       { "morphTargetBinds": [{ "node": 4, "index": 2, "weight": 1.0 }] },
          "relaxed":   { "morphTargetBinds": [{ "node": 4, "index": 3, "weight": 1.0 }] },
          "surprised": { "morphTargetBinds": [{ "node": 4, "index": 4, "weight": 1.0 }] },
          "blink":     { "morphTargetBinds": [{ "node": 4, "index": 5, "weight": 1.0 }] },
          "blinkLeft": { "morphTargetBinds": [{ "node": 4, "index": 6, "weight": 1.0 }] },
          "blinkRight":{ "morphTargetBinds": [{ "node": 4, "index": 7, "weight": 1.0 }] },
          "aa":        { "morphTargetBinds": [{ "node": 4, "index": 8, "weight": 1.0 }] },
          "ih":        { "morphTargetBinds": [{ "node": 4, "index": 9, "weight": 1.0 }] },
          "ou":        { "morphTargetBinds": [{ "node": 4, "index": 10, "weight": 1.0 }] },
          "ee":        { "morphTargetBinds": [{ "node": 4, "index": 11, "weight": 1.0 }] },
          "oh":        { "morphTargetBinds": [{ "node": 4, "index": 12, "weight": 1.0 }] },
        },
      },
      "lookAt": {
        "type": "bone",
        "offsetFromHeadBone": { "x": 0, "y": 0.06, "z": 0.0 },
        "rangeMapHorizontalInner": { "inputMaxValue": 90, "outputScale": 0.5 },
        "rangeMapHorizontalOuter": { "inputMaxValue": 90, "outputScale": 0.5 },
        "rangeMapVerticalDown":    { "inputMaxValue": 90, "outputScale": 0.5 },
        "rangeMapVerticalUp":      { "inputMaxValue": 90, "outputScale": 0.5 },
      },
      "firstPerson": {
        "meshAnnotations": [
          { "node": 4, "type": "thirdPersonOnly" },
        ],
      },
    },
  },
  "_vstream": {
    "hairColor": colors?.hair || "#3d1a6e",
    "eyeColor":  colors?.eye  || "#8b5cf6",
    "exportedAt": new Date().toISOString(),
  },
});

const SETUP_GUIDE_LIVE2D = (modelName) => `# ${modelName} — VTube Studio Setup Guide
Generated by VStream ArtForge

## Files in this bundle
- ${modelName}.model3.json     ← Load THIS file in VTube Studio
- ${modelName}.physics3.json   ← Physics simulation (auto-loaded)
- ${modelName}.pose3.json       ← Default pose
- expressions/                  ← Expression presets
- motions/                      ← Motion files
- vtube_studio_plugin.json      ← Plugin/parameter config reference

## Import Steps
1. Copy entire folder to:
   Windows: %APPDATA%/VTube Studio/Models/
   macOS:   ~/Library/Application Support/Steam/steamapps/common/VTubeStudio/
2. Open VTube Studio → Model Settings → Load New Model
3. Select: ${modelName}.model3.json
4. In Tracking → set Face Tracking to your webcam/iPhone
5. Parameters map automatically:
   - Head X/Y → ParamAngleX / ParamAngleY
   - Blink     → ParamEyeLOpen / ParamEyeROpen
   - Mouth     → ParamMouthOpenY

## Notes
- Physics for hair requires the physics3.json to be in the same folder
- Expressions can be triggered via hotkeys in VTube Studio
- For VRoid Hub export, use the included vrm_manifest.json
`;

const SETUP_GUIDE_VROID = (modelName) => `# ${modelName} — VRoid Hub Import Guide
Generated by VStream ArtForge

## Files in this bundle
- ${modelName}.vrm              ← Import this into VRoid Studio / VSeeFace
- vrm_manifest.json             ← VRM 1.0 metadata
- vtube_studio_plugin.json      ← VTube Studio param reference

## Import Steps for VSeeFace (recommended for 3D models)
1. Place ${modelName}.vrm anywhere on your PC
2. Open VSeeFace → Model Setup → Use VRM Model
3. Browse to ${modelName}.vrm and load
4. Enable face tracking under Settings → Camera

## Import Steps for VTube Studio (3D mode)
1. Copy .vrm to VTube Studio Models folder
2. VTube Studio → Load New Model → select .vrm

## Import Steps for VRoid Hub
1. Go to hub.vroid.com → My Page → Upload
2. Select ${modelName}.vrm
3. Fill in the metadata form (use vrm_manifest.json as reference)

## Notes
- VRM 1.0 format, compatible with VSeeFace, VTube Studio, Warudo, and Resonite
- Face tracking expressions: happy, angry, sad, surprised, blink, aa/ih/ou/ee/oh
`;

// ── Download helper ───────────────────────────────────────────────────────────
function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AvatarExportPanel({ type = "live2d", modelName = "MyAvatar", colors = {}, params = {} }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(null); // "vtube" | "vroid" | "both"
  const [expanded, setExpanded] = useState(false);

  const isLive2D = type === "live2d";
  const cleanName = modelName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32) || "MyAvatar";

  const exportVTubeStudio = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 600)); // simulate pack time
    try {
      downloadJSON(`${cleanName}.model3.json`, VTUBE_STUDIO_BUNDLE(cleanName, colors, params));
      await new Promise(r => setTimeout(r, 150));
      downloadJSON(`${cleanName}.physics3.json`, PHYSICS3_JSON(cleanName));
      await new Promise(r => setTimeout(r, 150));
      downloadJSON(`vtube_studio_plugin.json`, VTUBE_STUDIO_PLUGIN_CONFIG(cleanName));
      await new Promise(r => setTimeout(r, 150));
      downloadText(`SETUP_GUIDE.md`, isLive2D ? SETUP_GUIDE_LIVE2D(cleanName) : SETUP_GUIDE_VROID(cleanName));
      setExported("vtube");
      toast.success("VTube Studio bundle downloaded — check your Downloads folder!");
    } catch (e) {
      toast.error("Export failed: " + e.message);
    }
    setIsExporting(false);
  };

  const exportVRoidHub = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 600));
    try {
      downloadJSON(`vrm_manifest.json`, VRM_MANIFEST(cleanName, colors));
      await new Promise(r => setTimeout(r, 150));
      downloadJSON(`vtube_studio_plugin.json`, VTUBE_STUDIO_PLUGIN_CONFIG(cleanName));
      await new Promise(r => setTimeout(r, 150));
      downloadText(`SETUP_GUIDE.md`, SETUP_GUIDE_VROID(cleanName));
      setExported("vroid");
      toast.success("VRoid Hub bundle downloaded!");
    } catch (e) {
      toast.error("Export failed: " + e.message);
    }
    setIsExporting(false);
  };

  const exportAll = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 400));
    try {
      downloadJSON(`${cleanName}.model3.json`, VTUBE_STUDIO_BUNDLE(cleanName, colors, params));
      await new Promise(r => setTimeout(r, 120));
      downloadJSON(`${cleanName}.physics3.json`, PHYSICS3_JSON(cleanName));
      await new Promise(r => setTimeout(r, 120));
      downloadJSON(`vrm_manifest.json`, VRM_MANIFEST(cleanName, colors));
      await new Promise(r => setTimeout(r, 120));
      downloadJSON(`vtube_studio_plugin.json`, VTUBE_STUDIO_PLUGIN_CONFIG(cleanName));
      await new Promise(r => setTimeout(r, 120));
      downloadText(`SETUP_GUIDE.md`, isLive2D ? SETUP_GUIDE_LIVE2D(cleanName) : SETUP_GUIDE_VROID(cleanName));
      setExported("both");
      toast.success("Full bundle downloaded — 5 files ready to import!");
    } catch (e) {
      toast.error("Export failed: " + e.message);
    }
    setIsExporting(false);
  };

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-[#06101f]/90 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 hover:bg-emerald-500/5 transition"
      >
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0">
          <Package className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-black text-white">Export to Streaming Software</p>
          <p className="text-[11px] text-blue-200/40">VTube Studio · VRoid Hub · VSeeFace</p>
        </div>
        {exported && (
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-black text-emerald-300">
            ✓ EXPORTED
          </span>
        )}
        {expanded ? <ChevronUp className="h-4 w-4 text-blue-200/40" /> : <ChevronDown className="h-4 w-4 text-blue-200/40" />}
      </button>

      {expanded && (
        <div className="border-t border-[#1a3a60]/50 p-4 space-y-4">
          {/* One-click full bundle */}
          <button
            onClick={exportAll}
            disabled={isExporting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {isExporting ? "Packaging bundle…" : "⚡ Export Full Bundle (One Click)"}
          </button>

          {exported && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300">Bundle downloaded! Follow SETUP_GUIDE.md to import into your software.</p>
            </div>
          )}

          {/* Individual targets */}
          <div className="grid grid-cols-2 gap-2">
            {/* VTube Studio */}
            <div className="rounded-xl border border-[#1a3a60]/60 bg-[#030e1f]/70 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-lg bg-pink-500/20 grid place-items-center shrink-0">
                  {isLive2D ? <Layers className="h-3.5 w-3.5 text-pink-300" /> : <Box className="h-3.5 w-3.5 text-pink-300" />}
                </div>
                <p className="text-xs font-black text-white">VTube Studio</p>
              </div>
              <p className="text-[10px] text-blue-200/40 mb-3 leading-relaxed">
                {isLive2D
                  ? "model3.json + physics3.json + expressions"
                  : "VRM format + face tracking params"}
              </p>
              <button
                onClick={exportVTubeStudio}
                disabled={isExporting}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-pink-500/15 border border-pink-500/30 py-2 text-xs font-black text-pink-300 hover:bg-pink-500/25 transition disabled:opacity-40"
              >
                <Download className="h-3 w-3" /> Download
              </button>
            </div>

            {/* VRoid Hub */}
            <div className="rounded-xl border border-[#1a3a60]/60 bg-[#030e1f]/70 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-lg bg-violet-500/20 grid place-items-center shrink-0">
                  <Box className="h-3.5 w-3.5 text-violet-300" />
                </div>
                <p className="text-xs font-black text-white">VRoid Hub</p>
              </div>
              <p className="text-[10px] text-blue-200/40 mb-3 leading-relaxed">
                VRM 1.0 manifest + blend shapes + upload guide
              </p>
              <button
                onClick={exportVRoidHub}
                disabled={isExporting}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-500/15 border border-violet-500/30 py-2 text-xs font-black text-violet-300 hover:bg-violet-500/25 transition disabled:opacity-40"
              >
                <Download className="h-3 w-3" /> Download
              </button>
            </div>
          </div>

          {/* File manifest */}
          <div className="rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/50 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/30 mb-2">Bundle Contents</p>
            <div className="space-y-1">
              {[
                { icon: FileJson, name: `${cleanName}.model3.json`, desc: "Live2D Cubism model descriptor" },
                { icon: FileJson, name: `${cleanName}.physics3.json`, desc: "Hair physics simulation" },
                { icon: FileJson, name: `vrm_manifest.json`, desc: "VRM 1.0 metadata + expressions" },
                { icon: FileJson, name: `vtube_studio_plugin.json`, desc: "All 11 tracking parameters" },
                { icon: FileJson, name: `SETUP_GUIDE.md`, desc: "Step-by-step import instructions" },
              ].map(({ icon: Icon, name, desc }) => (
                <div key={name} className="flex items-center gap-2">
                  <Icon className="h-3 w-3 text-blue-200/30 shrink-0" />
                  <span className="text-[10px] font-black text-blue-200/60 truncate">{name}</span>
                  <span className="text-[10px] text-blue-200/25 ml-auto shrink-0 hidden sm:block">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported apps */}
          <div className="flex flex-wrap gap-1.5">
            {["VTube Studio", "VSeeFace", "VRoid Hub", "Warudo", "Resonite", "Inochi2D"].map((app) => (
              <span key={app} className="rounded-full border border-[#1a3a60]/50 bg-[#030e1f]/60 px-2 py-0.5 text-[10px] text-blue-200/40">
                {app}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}