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

    const { video_id, text, width, height, bg_color, text_color, font_size } = await req.json();

    if (!video_id || !text) {
      return Response.json({ error: 'Missing video_id or text' }, { status: 400 });
    }

    // Get video
    const videos = await base44.entities.Video.list();
    const video = videos.find(v => v.id === video_id);

    if (!video) {
      return Response.json({ error: 'Video not found' }, { status: 404 });
    }

    const thumbnailData = {
      video_id,
      text,
      dimensions: { width: width || 1280, height: height || 720 },
      colors: { bg: bg_color || '#FF6B6B', text: text_color || '#FFFFFF' },
      font_size: font_size || 60,
      generated_at: new Date().toISOString(),
      generated_by: user.email
    };

    // In production: queue actual thumbnail generation job
    // For now: store metadata and return placeholder

    return Response.json({
      status: 'queued',
      message: 'Thumbnail generation queued',
      video_id: video_id,
      thumbnail_config: thumbnailData,
      estimated_processing_time: '2-5 seconds'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});