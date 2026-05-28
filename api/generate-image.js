// api/generate-image.js
// Função serverless Vercel — geração de imagem com DALL-E 3
// Requer: OPENAI_API_KEY salva nas env vars do Vercel (já configurada)

import OpenAI from "openai";

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, client, platform, quality = "standard" } = req.body;

  if (!prompt || prompt.trim().length < 10) {
    return res.status(400).json({ error: "Briefing visual muito curto para gerar imagem." });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Monta um prompt enriquecido a partir do briefing visual da IA
    const enhancedPrompt = [
      `Imagem para post de ${platform || "Instagram"} do cliente "${client || "marca"}".`,
      `Briefing: ${prompt}`,
      `Estilo: profissional, limpo, moderno. Adequado para rede social.`,
      `Sem texto, sem marca d'água, sem borda. Alta qualidade visual.`,
    ].join(" ");

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: quality === "hd" ? "hd" : "standard",
      style: "vivid",
    });

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    return res.status(200).json({
      url: imageUrl,
      revised_prompt: revisedPrompt,
      quality,
      cost_estimate: quality === "hd" ? "~R$ 0,44" : "~R$ 0,22",
    });

  } catch (error) {
    console.error("[generate-image] Erro:", error);

    // Mensagens de erro amigáveis
    if (error?.status === 400 && error?.message?.includes("content_policy")) {
      return res.status(400).json({
        error: "O briefing contém conteúdo que o DALL-E não pode gerar. Tente ajustar a direção visual.",
      });
    }
    if (error?.status === 401) {
      return res.status(401).json({ error: "Chave da OpenAI inválida. Verifique nas env vars do Vercel." });
    }

    return res.status(500).json({
      error: error?.message || "Erro ao gerar imagem. Tente novamente.",
    });
  }
}
