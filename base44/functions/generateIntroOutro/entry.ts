import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, text, template_name, duration, font_size, bg_gradient, text_color } = await req.json();

    if (!type || !text || !['intro', 'outro'].includes(type)) {
      return Response.json({ error: 'Missing or invalid type (intro/outro)' }, { status: 400 });
    }

    const videoData = {
      type, // 'intro' or 'outro'
      text,
      template: template_name || 'cinematic',
      duration: duration || 3,
      font_size: font_size || 48,
      bg_gradient: bg_gradient || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      text_color: text_color || '#fff',
      created_at: new Date().toISOString(),
      created_by: user.email
    };

    // Create video entity for the generated intro/outro
    const videoRecord = await base44.entities.Video.create({
      channel_id: 'system',
      title: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${text.slice(0, 30)}...`,
      description: JSON.stringify(videoData),
      status: 'processing',
      visibility: 'private',
      duration_seconds: videoData.duration
    });

    return Response.json({
      status: 'queued',
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} generation queued`,
      video_id: videoRecord.id,
      config: videoData,
      download_url: `/api/download-intro-outro/${videoRecord.id}`,
      estimated_processing_time: '3-10 seconds'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});