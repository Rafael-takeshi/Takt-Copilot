export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { client, type, platform, theme, goal, audience, notes } = req.body;

  if (!client || !theme) {
    return res.status(400).json({ error: 'Cliente e tema são obrigatórios' });
  }

  try {
    const prompt = `Você é um time especializado em criação de conteúdo para redes sociais de uma agência de marketing digital. Gere um conteúdo completo e profissional para:

BRIEFING:
- Cliente: ${client}
- Tipo de conteúdo: ${type || 'Post único'}
- Plataforma: ${platform || 'Instagram'}
- Tema: ${theme}
- Objetivo: ${goal || 'Engajamento'}
- Público-alvo: ${audience || 'Geral'}
- Observações: ${notes || 'Nenhuma'}

Responda APENAS com um objeto JSON válido (sem markdown, sem explicações extras) neste formato exato:
{
  "analysis": "Análise do estilo visual recomendado: descreva a identidade visual ideal, paleta de cores, elementos gráficos e composição para este cliente e objetivo. Escreva 2 a 3 parágrafos detalhados e profissionais.",
  "idea": "Ideia estratégica: explique o conceito central do post, o posicionamento, o ângulo criativo e por que essa abordagem funciona para o público-alvo. Escreva 2 a 3 parágrafos.",
  "headline": "Headline curto e impactante para a arte (máximo 10 palavras)",
  "sub": "Subheadline complementar ao headline (máximo 15 palavras)",
  "cta": "Call to action direto (máximo 5 palavras com →)",
  "caption": "Legenda completa para a plataforma com emojis, quebras de linha, marcadores onde relevante, e de 3 a 5 hashtags relevantes no final",
  "visual": "Briefing visual detalhado para o designer: cores exatas com hexadecimal, tipografia, elementos visuais, composição, referências de estilo e instruções de execução",
  "checklist": ["Texto claro e objetivo", "CTA presente e visível", "Tom alinhado ao cliente", "Pouco texto na arte — legível", "Ideia compatível com objetivo", "Hashtags relevantes e limitadas", "Formatação de legenda OK", "Sem erros ortográficos"]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API Anthropic: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Resposta inválida da IA');

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error);
    return res.status(500).json({ error: 'Falha ao gerar conteúdo', details: error.message });
  }
}