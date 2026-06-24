import type { HotEvent, MarketingPackage, RadarItem } from "@/lib/types";

type AiItem = {
  eventId: string;
  reasons: string[];
  risks: string[];
  marketing: MarketingPackage | null;
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          eventId: { type: "string" },
          reasons: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          marketing: {
            anyOf: [
              { type: "null" },
              {
                type: "object",
                additionalProperties: false,
                properties: {
                  targetAudience: { type: "string" },
                  usp: { type: "string" },
                  cta: { type: "string" },
                  salesPlay: { type: "string" },
                  wechat: { type: "string" },
                  weibo: { type: "string" },
                  onsite: { type: "string" },
                  push: { type: "string" },
                  community: { type: "string" }
                },
                required: [
                  "targetAudience",
                  "usp",
                  "cta",
                  "salesPlay",
                  "wechat",
                  "weibo",
                  "onsite",
                  "push",
                  "community"
                ]
              }
            ]
          }
        },
        required: ["eventId", "reasons", "risks", "marketing"]
      }
    }
  },
  required: ["items"]
};

export async function enrichWithAi(items: RadarItem[]): Promise<{
  mode: "ai" | "rules";
  items: RadarItem[];
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { mode: "rules", items };
  }

  try {
    const aiItems = await requestAi(
      items.map((item) => ({
        event: item.event,
        decision: item.decision,
        opportunityScore: item.opportunityScore,
        productMatches: item.productMatches
      }))
    );
    const byId = new Map(aiItems.map((item) => [item.eventId, item]));
    return {
      mode: "ai",
      items: items.map((item) => {
        const aiItem = byId.get(item.event.id);
        if (!aiItem) return item;
        const marketing = validateMarketing(aiItem.marketing) ? aiItem.marketing : item.marketing;
        return {
          ...item,
          reasons: aiItem.reasons.length ? aiItem.reasons : item.reasons,
          risks: aiItem.risks.length ? aiItem.risks : item.risks,
          marketing: item.decision === "不适合" ? null : marketing
        };
      })
    };
  } catch (error) {
    console.error("AI enrichment failed; falling back to rules", error);
    return { mode: "rules", items };
  }
}

async function requestAi(payload: Array<{
  event: HotEvent;
  decision: string;
  opportunityScore: number;
  productMatches: unknown;
}>): Promise<AiItem[]> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "你是京东全品类热点营销策略助手。只基于公开信息输出中文建议。优先判断热点能承接到哪些商品品类或消费场景，不要局限于手机、平板或 3C。每条可蹭或谨慎热点都必须包含目标受众、核心卖点 USP 和行动号召 CTA。避免暗示未授权官方赞助、明星肖像授权、内部库存、内部价格或未公开活动。"
        },
        {
          role: "user",
          content: JSON.stringify({ items: payload })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "hotspot_marketing_radar",
          schema: responseSchema,
          strict: true
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API ${response.status}`);
  }

  const body = (await response.json()) as { output_text?: string; output?: unknown[] };
  const text = body.output_text ?? extractOutputText(body.output);
  if (!text) {
    throw new Error("OpenAI response missing output text");
  }

  const parsed = JSON.parse(text) as { items?: AiItem[] };
  return Array.isArray(parsed.items) ? parsed.items : [];
}

function extractOutputText(output: unknown): string {
  if (!Array.isArray(output)) return "";
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && typeof part === "object" && "text" in part) {
        return String((part as { text: unknown }).text);
      }
    }
  }
  return "";
}

function validateMarketing(marketing: MarketingPackage | null): marketing is MarketingPackage {
  if (!marketing) return false;
  return [
    marketing.targetAudience,
    marketing.usp,
    marketing.cta,
    marketing.salesPlay,
    marketing.wechat,
    marketing.weibo,
    marketing.onsite,
    marketing.push,
    marketing.community
  ].every((value) => typeof value === "string" && value.trim().length > 0);
}
