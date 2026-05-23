import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { provider, jobId, statusUrl } = await req.json();
    if (provider === 'replicate' && statusUrl) {
      const token = Deno.env.get('REPLICATE_API_TOKEN');
      if (!token) return Response.json({ error: 'REPLICATE_API_TOKEN not configured' }, { status: 500 });
      const res = await fetch(statusUrl, { headers: { Authorization: `Token ${token}` } });
      const data = await res.json();
      return Response.json({ provider, jobId, status: data.status, output: data.output, raw: data });
    }
    return Response.json({ provider, jobId, status: 'unknown', message: 'No provider status adapter configured for this job.' });
  } catch (error) {
    return Response.json({ error: error?.message || 'Status check failed' }, { status: 500 });
  }
});
