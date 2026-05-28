export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verificação antecipada da API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'Chave da API Anthropic não configurada.',
      details: 'Adicione ANTHROPIC_API_KEY nas variáveis de ambiente do Vercel (Settings → Environment Variables).'
    });
  }

  const { client, type, platform, theme, goal, audience, notes, clientProfile, referenceImage, referenceImageType } = req.body;

  if (!client || !theme) {
    return res.status(400).json({ error: 'Cliente e tema são obrigatórios' });
  }

  try {
    const profileSection = clientProfile
      ? `\nPERFIL DO CLIENTE (USE PARA CALIBRAR TOM E ESTILO):\n${clientProfile}\n`
      : '';

    const imageSection = referenceImage
      ? `\nIMAGEM DE REFERÊNCIA: O usuário enviou uma imagem de referência visual. Analise-a cuidadosamente na sua resposta de "analysis", descrevendo: paleta de cores, tipografia, composição, estilo visual e como adaptar esses elementos para o cliente ${client}.\n`
      : '';

    const prompt = `Você é um time especializado em criação de conteúdo para redes sociais de uma agência de marketing digital.

ATENÇÃO: Todo o conteúdo gerado deve ser EXCLUSIVAMENTE sobre o cliente "${client}". Não mencione outros clientes ou empresas.

BRIEFING OBRIGATÓRIO:
- CLIENTE: ${client} (use este nome em todo o conteúdo)
- Tipo de conteúdo: ${type || 'Post único'}
- Plataforma: ${platform || 'Instagram'}
- Tema: ${theme}
- Objetivo: ${goal || 'Engajamento'}
- Público-alvo: ${audience || 'Geral'}
- Observações: ${notes || 'Nenhuma'}
${profileSection}${imageSection}
Gere um conteúdo completo e profissional para ${client}. Responda APENAS com um objeto JSON válido (sem markdown, sem \`\`\`json, sem explicações extras) neste formato exato:
{
  "analysis": "Análise do estilo visual ideal para ${client}${referenceImage ? ' com base na imagem de referência enviada' : ''}: descreva a identidade visual, paleta de cores, elementos gráficos e composição adequados para este cliente e objetivo. 2 a 3 parágrafos detalhados.",
  "idea": "Ideia estratégica para ${client}: explique o conceito central do post, o posicionamento e o ângulo criativo. Mencione o cliente ${client} explicitamente. 2 a 3 parágrafos.",
  "headline": "Headline curto e impactante para a arte de ${client} (máximo 10 palavras)",
  "sub": "Subheadline complementar (máximo 15 palavras)",
  "cta": "Call to action direto (máximo 5 palavras com →)",
  "caption": "Legenda completa para ${platform} sobre ${client}, com emojis, quebras de linha, marcadores onde relevante, e de 3 a 5 hashtags relevantes no final",
  "visual": "Briefing visual detalhado para o designer de ${client}: cores exatas com hexadecimal, tipografia, elementos visuais, composição e instruções de execução",
  "checklist": ["Texto claro e objetivo", "CTA presente e visível", "Tom alinhado ao cliente ${client}", "Pouco texto na arte — legível", "Ideia compatível com objetivo ${goal || 'Engajamento'}", "Hashtags relevantes e limitadas", "Formatação de legenda OK", "Sem erros ortográficos"]
}`;

    // Monta o conteúdo da mensagem (texto puro ou multimodal com imagem)
    let messageContent;
    if (referenceImage && referenceImageType) {
      messageContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: referenceImageType,
            data: referenceImage,
          },
        },
        { type: "text", text: prompt },
      ];
    } else {
      messageContent = prompt;
    }

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
        messages: [{ role: 'user', content: messageContent }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const status = response.status;
      if (status === 401) {
        return res.status(500).json({
          error: 'Chave da API Anthropic inválida ou expirada.',
          details: 'Verifique ANTHROPIC_API_KEY nas variáveis de ambiente do Vercel.'
        });
      }
      if (status === 429) {
        return res.status(500).json({
          error: 'Limite de requisições atingido na API Anthropic.',
          details: 'Aguarde alguns segundos e tente novamente.'
        });
      }
      throw new Error(`API Anthropic retornou ${status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) throw new Error('Resposta vazia da API Anthropic.');

    // Extrai o JSON da resposta (remove possíveis blocos de código)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('A IA não retornou JSON válido. Tente novamente.');

    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      throw new Error('Erro ao interpretar resposta da IA: ' + parseErr.message);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao gerar conteúdo',
      details: error.cause ? String(error.cause) : undefined
    });
  }
}
