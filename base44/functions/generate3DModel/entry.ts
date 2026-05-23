import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TRIPO_API_BASE = 'https://api.tripo3d.ai/v2/openapi';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { prompt, provider = 'tripo3d' } = await req.json();
    if (!prompt?.trim()) return Response.json({ error: 'Prompt required' }, { status: 400 });

    // For Tripo3D
    if (provider === 'tripo3d') {
      const apiKey = Deno.env.get('TRIPO3D_API_KEY');
      if (!apiKey) return Response.json({ error: 'Tripo3D API key not configured' }, { status: 500 });

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
        const errBody = await submitRes.text();
        console.error('Tripo submission error:', submitRes.status, errBody);
        throw new Error(`Tripo submission failed (${submitRes.status}): ${errBody}`);
      }

      const submitData = await submitRes.json();
      const taskId = submitData.data?.task_id;
      if (!taskId) {
        console.error('No task ID in response:', submitData);
        throw new Error('No task ID returned from Tripo');
      }

      let modelUrl = null;
      const maxAttempts = 48; // 4 minutes max
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 5000));

        const statusRes = await fetch(`${TRIPO_API_BASE}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ task_id: taskId }),
        });

        if (!statusRes.ok) {
          console.warn(`Poll ${i+1} failed:`, statusRes.status);
          continue;
        }

        const statusData = await statusRes.json();
        const status = statusData.data?.status;
        console.log(`Poll ${i+1}: status=${status}`);

        if (status === 'success') {
          modelUrl = statusData.data?.model?.glb_url;
          if (!modelUrl) throw new Error('Success but no GLB URL in response');
          break;
        } else if (status === 'failed' || status === 'error') {
          throw new Error(`Tripo generation ${status}`);
        }
      }

      if (!modelUrl) throw new Error('Tripo3D generation timeout (4+ minutes)');

      return Response.json({ modelUrl, taskId, prompt, provider: 'tripo3d' });
    }

    // For Sloyd (free procedural 3D)
    if (provider === 'sloyd') {
      return Response.json({
        modelUrl: `data:text/plain,Sloyd generation not yet implemented. Use Tripo3D instead.`,
        provider: 'sloyd',
        error: 'Sloyd integration pending'
      }, { status: 501 });
    }

    throw new Error(`Unknown 3D provider: ${provider}`);
  } catch (error) {
    console.error('3D generation error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});