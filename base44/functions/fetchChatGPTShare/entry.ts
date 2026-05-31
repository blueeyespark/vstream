import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { url, openaiApiKey } = await req.json();
    if (!url) return Response.json({ error: 'URL is required' }, { status: 400 });

    const match = url.match(/(?:chatgpt\.com|chat\.openai\.com)\/share\/([a-f0-9-]+)/i);
    if (!match) {
      return Response.json({ error: 'Invalid ChatGPT share URL.' }, { status: 400 });
    }

    const shareId = match[1];

    // If user provided their OpenAI API key, use the official API to fetch the shared conversation
    if (openaiApiKey) {
      try {
        // Use the OpenAI API to retrieve the shared conversation
        const apiRes = await fetch(`https://api.openai.com/v1/chat/share/${shareId}`, {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data?.mapping) {
            const result = parseConversationMapping(data.mapping, data.title);
            if (result.messages.length > 0) return Response.json(result);
          }
        }

        // Fallback: try fetching the share page with the API key as a cookie/auth header
        const pageRes = await fetch(`https://chatgpt.com/share/${shareId}`, {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
          }
        });

        if (pageRes.ok) {
          const html = await pageRes.text();
          const parsed = tryParseHtml(html);
          if (parsed) return Response.json(parsed);
        }
      } catch (_) { /* fall through to HTML scrape */ }
    }

    // No API key — try plain HTML scrape (works for public shares)
    const pageRes = await fetch(`https://chatgpt.com/share/${shareId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      }
    });

    if (pageRes.ok) {
      const html = await pageRes.text();
      const parsed = tryParseHtml(html);
      if (parsed) return Response.json(parsed);
    }

    // Could not extract — needs manual paste or API key
    return Response.json({
      error: 'Could not extract this conversation automatically.',
      requiresManualPaste: true,
      requiresApiKey: !openaiApiKey,
    }, { status: 422 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function tryParseHtml(html) {
  // Try __NEXT_DATA__
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]);
      const serverResponse = nextData?.props?.pageProps?.serverResponse?.data;
      if (serverResponse?.mapping) {
        const result = parseConversationMapping(serverResponse.mapping, serverResponse.title);
        if (result.messages.length > 0) return result;
      }
    } catch (_) {}
  }

  // Try other script tags
  const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
  for (const sm of scriptMatches) {
    const content = sm[1];
    if (content.includes('"mapping"') && content.includes('"message"')) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*"mapping"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.mapping) {
            const result = parseConversationMapping(parsed.mapping, parsed.title);
            if (result.messages.length > 0) return result;
          }
        }
      } catch (_) {}
    }
  }

  return null;
}

function parseConversationMapping(mapping, title = 'Untitled') {
  const messages = [];
  const visited = new Set();

  const walkNode = (nodeId) => {
    if (!nodeId || visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = mapping[nodeId];
    if (!node) return;

    const msg = node.message;
    if (msg && msg.content && msg.author) {
      const role = msg.author.role;
      const parts = msg.content.parts || [];
      const text = parts.filter(p => typeof p === 'string').join('').trim();
      if (text && (role === 'user' || role === 'assistant')) {
        messages.push({ role, content: text });
      }
    }

    for (const childId of (node.children || [])) {
      walkNode(childId);
    }
  };

  const rootIds = Object.keys(mapping).filter(id => !mapping[id].parent);
  for (const rootId of rootIds) walkNode(rootId);

  const text = messages
    .map(m => `${m.role === 'user' ? '👤 User' : '🤖 ChatGPT'}: ${m.content}`)
    .join('\n\n---\n\n');

  return { text, title, messageCount: messages.length, source: 'parsed' };
}