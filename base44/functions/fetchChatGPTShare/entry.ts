import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await req.json();
    if (!url) return Response.json({ error: 'URL is required' }, { status: 400 });

    // Extract the share ID from the URL
    // Supports:
    //   https://chatgpt.com/share/6a18ff21-8bfc-83e8-9bef-b649397ffebd
    //   https://chat.openai.com/share/6a18ff21-8bfc-83e8-9bef-b649397ffebd
    const match = url.match(/(?:chatgpt\.com|chat\.openai\.com)\/share\/([a-f0-9-]+)/i);
    if (!match) {
      return Response.json({ error: 'Invalid ChatGPT share URL. Expected format: chatgpt.com/share/...' }, { status: 400 });
    }

    const shareId = match[1];

    // Fetch the share page HTML — the conversation data lives in a __NEXT_DATA__ script tag
    // We must fetch as a browser would (with Accept: text/html)
    const pageRes = await fetch(`https://chatgpt.com/share/${shareId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      }
    });

    if (!pageRes.ok) {
      return Response.json({ error: `Page fetch failed: HTTP ${pageRes.status}` }, { status: 400 });
    }

    const html = await pageRes.text();

    // Try extracting __NEXT_DATA__ JSON
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const serverResponse = nextData?.props?.pageProps?.serverResponse?.data;
        if (serverResponse?.mapping) {
          const result = parseConversationMapping(serverResponse.mapping, serverResponse.title);
          if (result.messages.length > 0) return Response.json(result);
        }
      } catch (_) { /* fall through */ }
    }

    // Try script tags that embed conversation JSON directly
    const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
    for (const sm of scriptMatches) {
      const content = sm[1];
      if (content.includes('"mapping"') && content.includes('"message"')) {
        try {
          // Try to find a JSON object with mapping inside
          const jsonMatch = content.match(/\{[\s\S]*"mapping"[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.mapping) {
              const result = parseConversationMapping(parsed.mapping, parsed.title);
              if (result.messages.length > 0) return Response.json(result);
            }
          }
        } catch (_) { /* continue */ }
      }
    }

    // As a last resort, try to look for JSON embedded with conversation data anywhere in the HTML
    // ChatGPT sometimes puts it as a raw JSON in a script with type=application/json
    const jsonScripts = [...html.matchAll(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)];
    for (const js of jsonScripts) {
      try {
        const parsed = JSON.parse(js[1]);
        if (parsed?.mapping) {
          const result = parseConversationMapping(parsed.mapping, parsed.title);
          if (result.messages.length > 0) return Response.json(result);
        }
      } catch (_) { /* continue */ }
    }

    return Response.json({
      error: 'This conversation could not be extracted automatically. It may be set to private or require login. Please use the "Paste Text" tab instead — open the link in your browser, select all (Ctrl+A), copy (Ctrl+C), and paste.',
      requiresManualPaste: true,
    }, { status: 422 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

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

  // Start from root nodes (no parent)
  const rootIds = Object.keys(mapping).filter(id => !mapping[id].parent);
  for (const rootId of rootIds) walkNode(rootId);

  const text = messages
    .map(m => `${m.role === 'user' ? '👤 User' : '🤖 ChatGPT'}: ${m.content}`)
    .join('\n\n---\n\n');

  return { text, title, messageCount: messages.length, source: 'parsed' };
}