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

    const { video_id, start_time, end_time, brightness, contrast, volume, preset_name } = await req.json();

    if (!video_id) {
      return Response.json({ error: 'Missing video_id' }, { status: 400 });
    }

    // Get video
    const videos = await base44.entities.Video.list();
    const targetVideo = videos.find(v => v.id === video_id);

    if (!targetVideo) {
      return Response.json({ error: 'Video not found' }, { status: 404 });
    }

    // Update video with edit metadata
    const editMetadata = {
      trim: { start: start_time || 0, end: end_time || targetVideo.duration_seconds },
      effects: { brightness: brightness || 100, contrast: contrast || 100, volume: volume || 1 },
      preset: preset_name || 'default',
      edited_at: new Date().toISOString(),
      edited_by: user.email
    };

    await base44.entities.Video.update(video_id, {
      description: JSON.stringify({ ...JSON.parse(targetVideo.description || '{}'), edits: editMetadata })
    });

    return Response.json({
      status: 'success',
      message: 'Video edits applied and queued for processing',
      video_id: video_id,
      edits: editMetadata,
      duration: (end_time || targetVideo.duration_seconds) - (start_time || 0)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});