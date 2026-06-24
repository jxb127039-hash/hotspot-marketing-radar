import { enrichWithAi } from "@/lib/ai";
import { scoreEvent } from "@/lib/scoring";
import { collectHotEvents } from "@/lib/sources";
import type { RadarItem, RadarSnapshot } from "@/lib/types";

export async function buildDailyRadar(): Promise<RadarSnapshot> {
  const { events, sourceStatuses } = await collectHotEvents();
  const scored = rankForDiverseDiscovery(events.map(scoreEvent)).slice(0, 18);
  const enriched = await enrichWithAi(scored);
  const now = new Date();

  return {
    generatedAt: now.toISOString(),
    dateLabel: new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      dateStyle: "full",
      timeStyle: "short"
    }).format(now),
    dataMode: enriched.mode,
    sourceStatuses,
    items: enriched.items,
    disclaimer:
      "基于公开信息生成，仅供营销策划参考；不包含京东内部销售、库存、毛利或未发布活动数据。"
  };
}

function rankForDiverseDiscovery(items: RadarItem[]): RadarItem[] {
  const byScore = [...items].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const sourceOrder = ["百度热搜", "Google 新闻 - 体育赛事", "Google 新闻 - 娱乐影视", "Google 新闻 - 生活消费", "IT之家", "36氪"];
  const picked: RadarItem[] = [];
  const seen = new Set<string>();

  sourceOrder.forEach((source) => {
    const sourceBest = byScore.find((item) => item.event.source === source && !seen.has(item.event.id));
    if (sourceBest) {
      picked.push(sourceBest);
      seen.add(sourceBest.event.id);
    }
  });

  byScore.forEach((item) => {
    if (!seen.has(item.event.id)) {
      picked.push(item);
      seen.add(item.event.id);
    }
  });

  return picked;
}
