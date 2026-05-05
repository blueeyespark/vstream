import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { full_name, email, channel_name, channel_url, portfolio_link, bio, content_category, avg_viewers, social_links } = await req.json();

  if (!full_name || !email || !channel_name || !bio) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Save the application
  const application = await base44.asServiceRole.entities.TalentApplication.create({
    full_name,
    email,
    channel_name,
    channel_url: channel_url || '',
    portfolio_link: portfolio_link || '',
    bio,
    content_category: content_category || 'other',
    avg_viewers: avg_viewers || '',
    social_links: social_links || '',
    status: 'pending',
  });

  // Get all admin users to notify
  const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

  // Send email to each admin
  const emailPromises = admins.map(admin =>
    base44.asServiceRole.integrations.Core.SendEmail({
      to: admin.email,
      subject: `New Talent Application: ${channel_name}`,
      body: `
<h2>New Talent Application Received</h2>
<p>A new creator has applied to join the platform.</p>

<table style="border-collapse:collapse;width:100%;max-width:600px;">
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6;">Name</td><td style="padding:8px;">${full_name}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6;">Email</td><td style="padding:8px;">${email}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6;">Channel</td><td style="padding:8px;">${channel_name}</td></tr>
  ${channel_url ? `<tr><td style="padding:8px;font-weight:bold;background:#f3f4f6;">Channel URL</td><td style="padding:8px;"><a href="${channel_url}">${channel_url}</a></td></tr>` : ''}
  ${portfolio_link ? `<tr><td style="padding:8px;font-weight:bold;background:#f3f4f6;">Portfolio</td><td style="padding:8px;"><a href="${portfolio_link}">${portfolio_link}</a></td></tr>` : ''}
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6;">Category</td><td style="padding:8px;">${content_category || 'N/A'}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6;">Avg Viewers</td><td style="padding:8px;">${avg_viewers || 'N/A'}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6;">Bio</td><td style="padding:8px;">${bio}</td></tr>
  ${social_links ? `<tr><td style="padding:8px;font-weight:bold;background:#f3f4f6;">Social Links</td><td style="padding:8px;">${social_links}</td></tr>` : ''}
</table>

<p style="margin-top:20px;">Please review this application in the admin panel.</p>
      `,
    }).catch(() => null)
  );

  await Promise.all(emailPromises);

  return Response.json({ success: true, application_id: application.id });
});