import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TRIPO_API_BASE = 'https://api.tripo3d.ai/v2/openapi';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { prompt } = await req.json();
    if (!prompt?.trim()) return Response.json({ error: 'Prompt required' }, { status: 400 });

    const apiKey = Deno.env.get('TRIPO3D_API_KEY');
    if (!apiKey) return Response.json({ error: 'API key not configured' }, { status: 500 });

    // Step 1: Submit generation task
    const submitRes = await fetch(`${TRIPO_API_BASE}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'text_to_model',
        prompt,
      }),
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      throw new Error(`Tripo submission failed: ${err}`);
    }

    const submitData = await submitRes.json();
    const taskId = submitData.data?.task_id;
    if (!taskId) throw new Error('No task ID returned');

    // Step 2: Poll for completion (max 2 min)
    let modelUrl = null;
    const maxAttempts = 24;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 5000)); // 5s between polls

      const statusRes = await fetch(`${TRIPO_API_BASE}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: taskId }),
      });

      if (!statusRes.ok) continue;

      const statusData = await statusRes.json();
      const status = statusData.data?.status;

      if (status === 'success') {
        modelUrl = statusData.data?.model?.glb_url;
        break;
      } else if (status === 'failed') {
        throw new Error('Tripo generation failed');
      }
    }

    if (!modelUrl) throw new Error('Generation timeout');

    return Response.json({
      modelUrl,
      taskId,
      prompt,
    });
  } catch (error) {
    console.error('3D generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});