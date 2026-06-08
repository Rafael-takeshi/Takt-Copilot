import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  client: z.string().optional().default(""),
  theme: z.string().min(1, "Tema é obrigatório"),
  platform: z.string().min(1),
  format: z.string().min(1),
  objective: z.string().min(1),
  tone: z.string().optional().default(""),
  model: z.string().optional().default("google/gemini-3-flash-preview"),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  providers: z
    .object({ claude: z.boolean(), gpt: z.boolean(), gemini: z.boolean() })
    .optional(),
});

const OutputSchema = z.object({
  hook: z.string(),
  caption: z.string(),
  cta: z.string(),
  hashtags: z.string(),
  reelsScript: z.array(z.object({ time: z.string(), text: z.string() })),
});

const ALLOWED_MODELS = new Set([
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "openai/gpt-5",
  "openai/gpt-5-mini",
]);

export const generatePostContent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

    // Respeitar provedores habilitados — se o modelo selecionado pertence a um provedor desativado, faz fallback.
    let model = ALLOWED_MODELS.has(data.model) ? data.model : "google/gemini-3-flash-preview";
    const providers = data.providers;
    if (providers) {
      const isGoogle = model.startsWith("google/");
      const isOpenAI = model.startsWith("openai/");
      if ((isGoogle && !providers.gemini) || (isOpenAI && !providers.gpt)) {
        if (providers.gemini) model = "google/gemini-3-flash-preview";
        else if (providers.gpt) model = "openai/gpt-5-mini";
        else throw new Error("Nenhum provedor de IA está habilitado nas Configurações.");
      }
    }

    const systemPrompt = `Você é um copywriter sênior especialista em marketing digital e redes sociais.
Gere conteúdo em português do Brasil, criativo, claro e adaptado à plataforma indicada.
Sempre responda em JSON válido conforme o schema solicitado, sem markdown.`;

    const userPrompt = `Crie um post para:
- Cliente: ${data.client || "(não informado)"}
- Tema: ${data.theme}
- Plataforma: ${data.platform}
- Formato: ${data.format}
- Objetivo: ${data.objective}
- Tom de voz: ${data.tone || "natural"}

Retorne JSON com:
{
  "hook": "frase de abertura curta e impactante",
  "caption": "legenda completa, parágrafos curtos, emojis quando fizer sentido",
  "cta": "chamada para ação curta",
  "hashtags": "5 a 10 hashtags relevantes separadas por espaço, começando com #",
  "reelsScript": [{"time":"0-3s","text":"..."},{"time":"3-7s","text":"..."},{"time":"7-15s","text":"..."}]
}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: data.temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados no workspace.");
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Falha na IA: ${res.status} ${txt.slice(0, 200)}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Resposta da IA não é JSON válido");
    }
    return OutputSchema.parse(parsed);
  });
