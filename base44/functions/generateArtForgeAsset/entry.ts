import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TRIPO_API_BASE = 'https://api.tripo3d.ai/v2/openapi';

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

function svgPlaceholder(mode: string, prompt: string) {
  const safeMode = String(mode || 'ArtForge').slice(0, 40);
  const safePrompt = String(prompt || 'Generated preview').slice(0, 160);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#020712"/><stop offset=".45" stop-color="#082042"/><stop offset="1" stop-color="#581c87"/></linearGradient><radialGradient id="r" cx=".70" cy=".30" r=".55"><stop stop-color="#1e78ff" stop-opacity=".8"/><stop offset="1" stop-color="#1e78ff" stop-opacity="0"/></radialGradient></defs><rect width="1280" height="720" fill="url(#g)"/><rect width="1280" height="720" fill="url(#r)"/><g opacity=".25" stroke="#1e78ff"><path d="M0 120h1280M0 240h1280M0 360h1280M0 480h1280M0 600h1280M160 0v720M320 0v720M480 0v720M640 0v720M800 0v720M960 0v720M1120 0v720"/></g><text x="640" y="310" text-anchor="middle" fill="white" font-family="Arial" font-size="56" font-weight="800">${safeMode}</text><text x="640" y="370" text-anchor="middle" fill="#9cc8ff" font-family="Arial" font-size="22">${safePrompt.replace(/[<>&]/g, '')}</text><text x="640" y="645" text-anchor="middle" fill="#60a5fa" font-family="Arial" font-size="18">Provider key missing or provider returned no asset • ArtForge placeholder</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function callOpenAIImage(prompt: string, aspectRatio: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
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

async function callStabilityImage(prompt: string, aspectRatio: string, negativePrompt?: string) {
  const apiKey = Deno.env.get('STABILITY_API_KEY');
  if (!apiKey) return null;
  const [width, height] = aspectRatio === '9:16' ? [768, 1344] : aspectRatio === '1:1' ? [1024, 1024] : [1344, 768];
  const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    body: (() => {
      const form = new FormData();
      form.append('prompt', prompt);
      if (negativePrompt) form.append('negative_prompt', negativePrompt);
      form.append('model', 'sd3.5-large');
      form.append('output_format', 'png');
      form.append('width', String(width));
      form.append('height', String(height));
      return form;
    })(),
  });
  if (!res.ok) throw new Error(`Stability image failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.image ? `data:image/png;base64,${data.image}` : null;
}

async function callReplicate(prompt: string) {
  const token = Deno.env.get('REPLICATE_API_TOKEN');
  const version = Deno.env.get('REPLICATE_IMAGE_VERSION');
  if (!token || !version) return null;
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ version, input: { prompt } }),
  });
  if (!res.ok) throw new Error(`Replicate prediction failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.urls?.get || data?.id || null;
}

async function callTripo(prompt: string) {
  const apiKey = Deno.env.get('TRIPO3D_API_KEY');
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
    await new Promise((resolve) => setTimeout(resolve, 5000));
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
      quality = 'high',
      referenceImages = [],
      layers = [],
      nodes = [],
      scenes = [],
    } = body;

    if (!String(prompt).trim()) return json({ error: 'Prompt required' }, 400);

    let url: string | null = null;
    let type = mode;
    const startedAt = new Date().toISOString();

    if (mode === '3d_model' || provider === 'tripo3d') {
      url = await callTripo(prompt);
      type = '3d_model';
    } else if (provider === 'openai') {
      url = await callOpenAIImage(prompt, aspectRatio);
    } else if (provider === 'stability') {
      url = await callStabilityImage(prompt, aspectRatio, negativePrompt);
    } else if (provider === 'replicate') {
      url = await callReplicate(prompt);
      type = 'render_job';
    }

    if (!url) {
      url = svgPlaceholder(mode, prompt);
      type = mode === 'video' ? 'video' : mode === '3d_model' ? '3d_model' : mode === 'project' ? 'project' : 'image';
    }

    return json({
      status: 'complete',
      type,
      url,
      assetUrl: url,
      provider,
      mode,
      quality,
      durationSeconds,
      aspectRatio,
      referenceCount: Array.isArray(referenceImages) ? referenceImages.length : 0,
      workflow: { layers, nodes, scenes },
      startedAt,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ArtForge generation error:', error?.message, error?.stack);
    return json({ status: 'failed', error: error?.message || 'Unknown generation error' }, 500);
  }
});
