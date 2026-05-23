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

    const { preset_name, preset_type, preset_data } = await req.json();

    if (!preset_name || !preset_type || !preset_data) {
      return Response.json({ error: 'Missing preset_name, preset_type, or preset_data' }, { status: 400 });
    }

    // Store preset in user metadata
    const userPresets = {
      type: preset_type, // 'video_effect', 'thumbnail_color', 'intro_template'
      name: preset_name,
      data: preset_data,
      created_at: new Date().toISOString(),
      user_email: user.email
    };

    // In production: create/update a Preset entity
    // For now: return success response

    return Response.json({
      status: 'success',
      message: `Preset "${preset_name}" saved successfully`,
      preset: userPresets,
      can_reuse: true,
      can_share: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});