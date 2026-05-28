// api/generate-image.js
// Função serverless Vercel — geração de imagem com DALL-E 3
// Usa fetch direto (sem pacote openai) — mais compatível com todas as API keys

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'Chave da OpenAI não configurada.',
      details: 'Adicione OPENAI_API_KEY nas variáveis de ambiente do Vercel.'
    });
  }

  const { prompt, client, platform, quality = 'standard' } = req.body;

  if (!prompt || prompt.trim().length < 10) {
    return res.status(400).json({ error: 'Briefing visual muito curto para gerar imagem.' });
  }

  // Limita o prompt a 3800 caracteres (limite do DALL-E 3 é 4000)
  const briefing = prompt.length > 3000 ? prompt.substring(0, 3000) + '...' : prompt;

  const enhancedPrompt = [
    `Social media post image for "${client || 'brand'}" on ${platform || 'Instagram'}.`,
    `Visual direction: ${briefing}`,
    `Style: professional, clean, modern. No text overlay, no watermark, no border.`,
  ].join(' ');

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: quality === 'hd' ? 'hd' : 'standard',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.error?.message || response.statusText;
      const code = data?.error?.code || '';

      if (response.status === 401) {
        return res.status(500).json({ error: 'Chave da OpenAI inválida ou sem permissão para gerar imagens.' });
      }
      if (response.status === 429) {
        return res.status(500).json({ error: 'Limite de requisições da OpenAI atingido. Aguarde e tente novamente.' });
      }
      if (code === 'content_policy_violation') {
        return res.status(400).json({ error: 'O briefing contém conteúdo que o DALL-E não pode gerar. Tente ajustar a direção visual.' });
      }
      return res.status(500).json({ error: `Erro na OpenAI: ${msg}` });
    }

    const imageUrl = data.data[0].url;
    const revisedPrompt = data.data[0].revised_prompt;

    return res.status(200).json({
      url: imageUrl,
      revised_prompt: revisedPrompt,
      quality,
      cost_estimate: quality === 'hd' ? '~R$ 0,44' : '~R$ 0,22',
    });

  } catch (error) {
    console.error('[generate-image] Erro:', error);
    return res.status(500).json({ error: error.message || 'Erro ao gerar imagem. Tente novamente.' });
  }
}
