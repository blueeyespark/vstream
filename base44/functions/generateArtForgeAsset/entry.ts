import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TRIPO_API_BASE = 'https://api.tripo3d.ai/v2/openapi';

function json(data, status = 200) {
  return Response.json(data, { status });
}

function svgPlaceholder(mode, prompt) {
  const safeMode = String(mode || 'ArtForge').slice(0, 40);
  const safePrompt = String(prompt || 'Generated preview').slice(0, 160);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#020712"/><stop offset=".45" stop-color="#082042"/><stop offset="1" stop-color="#581c87"/></linearGradient><radialGradient id="r" cx=".70" cy=".30" r=".55"><stop stop-color="#1e78ff" stop-opacity=".8"/><stop offset="1" stop-color="#1e78ff" stop-opacity="0"/></radialGradient></defs><rect width="1280" height="720" fill="url(#g)"/><rect width="1280" height="720" fill="url(#r)"/><g opacity=".25" stroke="#1e78ff"><path d="M0 120h1280M0 240h1280M0 360h1280M0 480h1280M0 600h1280M160 0v720M320 0v720M480 0v720M640 0v720M800 0v720M960 0v720M1120 0v720"/></g><text x="640" y="310" text-anchor="middle" fill="white" font-family="Arial" font-size="56" font-weight="800">${safeMode}</text><text x="640" y="370" text-anchor="middle" fill="#9cc8ff" font-family="Arial" font-size="22">${safePrompt.replace(/[<>&]/g, '')}</text><text x="640" y="645" text-anchor="middle" fill="#60a5fa" font-family="Arial" font-size="18">Provider key missing • ArtForge placeholder</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ── fal.ai (FLUX 2 Pro for generation, FLUX Kontext for editing) ───────────
async function callFalImage(prompt, aspectRatio, referenceImages, apiKey) {
  if (!apiKey) throw new Error('FAL API key not configured');
  const hasReference = referenceImages && referenceImages.length > 0;
  // Use FLUX Kontext Pro for editing (when reference image provided), FLUX 2 Pro for generation
  const model = hasReference ? 'fal-ai/flux-pro/kontext' : 'fal-ai/flux-pro/v1.1-ultra';
  const aspectMap = { '1:1': '1:1', '16:9': '16:9', '9:16': '9:16', '4:5': '4:5', '3:4': '3:4', '21:9': '21:9' };
  const aspect = aspectMap[aspectRatio] || '16:9';

  const body = hasReference
    ? { prompt, image_url: referenceImages[0], aspect_ratio: aspect, output_format: 'jpeg' }
    : { prompt, aspect_ratio: aspect, output_format: 'jpeg', safety_tolerance: 2 };

  const res = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`fal.ai failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.images?.[0]?.url || data?.image?.url || null;
}

// ── ElevenLabs Music ──────────────────────────────────────────────────────
async function callElevenLabsMusic(prompt, durationMs, apiKey) {
  if (!apiKey) throw new Error('ElevenLabs API key not configured');
  const clampedMs = Math.min(Math.max(durationMs || 30000, 3000), 600000);
  const res = await fetch('https://api.elevenlabs.io/v1/music', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, music_length_ms: clampedMs, model_id: 'music_v1' }),
  });
  if (!res.ok) throw new Error(`ElevenLabs music failed: ${res.status} ${await res.text()}`);
  // Returns audio binary — upload it
  const audioBlob = await res.blob();
  return audioBlob;
}

// ── Runway Gen-4 ──────────────────────────────────────────────────────────
async function callRunwayVideo(prompt, aspectRatio, referenceImages, apiKey) {
  if (!apiKey) throw new Error('Runway API key not configured');
  const ratio = aspectRatio === '9:16' ? '720:1280' : '1280:720';
  const body = {
    model: 'gen4_turbo',
    promptText: prompt,
    ratio,
    duration: 5,
  };
  if (referenceImages && referenceImages.length > 0) {
    body.promptImage = referenceImages[0];
  }
  const submitRes = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Runway-Version': '2024-11-06' },
    body: JSON.stringify(body),
  });
  if (!submitRes.ok) throw new Error(`Runway submit failed: ${submitRes.status} ${await submitRes.text()}`);
  const submitData = await submitRes.json();
  const taskId = submitData?.id;
  if (!taskId) throw new Error('Runway returned no task ID');

  // Poll for completion (max 3 min)
  for (let i = 0; i < 36; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const pollRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}`, 'X-Runway-Version': '2024-11-06' },
    });
    if (!pollRes.ok) continue;
    const pollData = await pollRes.json();
    if (pollData?.status === 'SUCCEEDED') return pollData?.output?.[0] || null;
    if (pollData?.status === 'FAILED') throw new Error(`Runway generation failed: ${pollData?.failure || 'unknown'}`);
  }
  throw new Error('Runway generation timed out');
}

// ── OpenAI DALL-E ─────────────────────────────────────────────────────────
async function callOpenAIImage(prompt, aspectRatio, apiKey) {
  if (!apiKey) return null;
  const size = aspectRatio === '9:16' ? '1024x1536' : aspectRatio === '1:1' ? '1024x1024' : '1536x1024';
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, size }),
  });
  if (!res.ok) throw new Error(`OpenAI image failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  const url = data?.data?.[0]?.url;
  return url || (b64 ? `data:image/png;base64,${b64}` : null);
}

// ── Stability ─────────────────────────────────────────────────────────────
async function callStabilityImage(prompt, aspectRatio, negativePrompt, apiKey) {
  if (!apiKey) return null;
  const [width, height] = aspectRatio === '9:16' ? [768, 1344] : aspectRatio === '1:1' ? [1024, 1024] : [1344, 768];
  const form = new FormData();
  form.append('prompt', prompt);
  if (negativePrompt) form.append('negative_prompt', negativePrompt);
  form.append('model', 'sd3.5-large');
  form.append('output_format', 'png');
  form.append('width', String(width));
  form.append('height', String(height));
  const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    body: form,
  });
  if (!res.ok) throw new Error(`Stability image failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.image ? `data:image/png;base64,${data.image}` : null;
}

// ── Tripo 3D ─────────────────────────────────────────────────────────────
async function callTripo(prompt, apiKey) {
  if (!apiKey) return null;
  const submitRes = await fetch(`${TRIPO_API_BASE}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'text_to_model', prompt }),
  });
  if (!submitRes.ok) throw new Error(`Tripo submit failed: ${submitRes.status} ${await submitRes.text()}`);
  const submitData = await submitRes.json();
  const taskId = submitData?.data?.task_id;
  if (!taskId) throw new Error('Tripo returned no task id');
  for (let i = 0; i < 36; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(`${TRIPO_API_BASE}/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId }),
    });
    if (!statusRes.ok) continue;
    const statusData = await statusRes.json();
    const status = statusData?.data?.status;
    if (status === 'success') return statusData?.data?.model?.glb_url || statusData?.data?.model?.url || null;
    if (status === 'failed' || status === 'error') throw new Error(`Tripo generation ${status}`);
  }
  throw new Error('Tripo generation timed out');
}

// ── Main Handler ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json();
    const {
      mode = 'image',
      provider = 'base44',
      prompt = '',
      negativePrompt = '',
      aspectRatio = '16:9',
      durationSeconds = 8,
      durationMs = 30000,
      quality = 'high',
      referenceImages = [],
    } = body;

    if (!String(prompt).trim()) return json({ error: 'Prompt required' }, 400);

    // Get user's stored API keys
    const userRecord = await base44.asServiceRole.entities.User.filter({ email: user.email });
    const userKeys = userRecord?.[0] || {};

    let url = null;
    let type = mode;
    const startedAt = new Date().toISOString();

    // Music mode → ElevenLabs
    if (mode === 'music' || provider === 'elevenlabs') {
      const apiKey = userKeys.elevenlabs_api_key || Deno.env.get('ELEVENLABS_API_KEY');
      const audioBlob = await callElevenLabsMusic(prompt, durationMs, apiKey);
      // Upload to storage
      const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file: audioBlob });
      url = uploaded?.file_url;
      type = 'audio';
    }
    // fal.ai provider (image or image editing)
    else if (provider === 'fal') {
      const apiKey = userKeys.fal_api_key || Deno.env.get('FAL_API_KEY');
      url = await callFalImage(prompt, aspectRatio, referenceImages, apiKey);
    }
    // Runway video
    else if (provider === 'runway') {
      const apiKey = userKeys.runway_api_key || Deno.env.get('RUNWAY_API_KEY');
      url = await callRunwayVideo(prompt, aspectRatio, referenceImages, apiKey);
      type = 'video';
    }
    // Existing providers
    else if (mode === '3d_model' || provider === 'tripo3d') {
      const apiKey = userKeys.tripo3d_api_key || Deno.env.get('TRIPO3D_API_KEY');
      url = await callTripo(prompt, apiKey);
      type = '3d_model';
    } else if (provider === 'openai') {
      const apiKey = userKeys.openai_api_key || Deno.env.get('OPENAI_API_KEY');
      url = await callOpenAIImage(prompt, aspectRatio, apiKey);
    } else if (provider === 'stability') {
      const apiKey = userKeys.stability_api_key || Deno.env.get('STABILITY_API_KEY');
      url = await callStabilityImage(prompt, aspectRatio, negativePrompt, apiKey);
    }

    if (!url) {
      url = svgPlaceholder(mode, prompt);
      type = mode === 'video' ? 'video' : mode === '3d_model' ? '3d_model' : 'image';
    }

    return json({ status: 'complete', type, url, assetUrl: url, provider, mode, quality, startedAt, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error('ArtForge generation error:', error?.message);
    return json({ status: 'failed', error: error?.message || 'Unknown generation error' }, 500);
  }
});