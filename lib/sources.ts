import type { HotEvent, SourceStatus } from "@/lib/types";

const RSS_SOURCES = [
  {
    name: "百度热搜",
    url: "https://top.baidu.com/board?tab=realtime",
    type: "baidu" as const,
    defaultSignals: ["实时热搜", "大众热点"]
  },
  {
    name: "IT之家",
    url: "https://www.ithome.com/rss/",
    type: "rss" as const,
    defaultSignals: ["科技数码"]
  },
  {
    name: "36氪",
    url: "https://36kr.com/feed",
    type: "rss" as const,
    defaultSignals: ["商业科技"]
  },
  {
    name: "Google 新闻 - 体育赛事",
    url: "https://news.google.com/rss/search?q=%E4%B8%96%E7%95%8C%E6%9D%AF%20%E4%BD%93%E8%82%B2%20%E7%90%83%E6%98%9F%20%E7%83%AD%E6%90%9C%20%E4%BB%8A%E5%A4%A9&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
    type: "rss" as const,
    defaultSignals: ["体育赛事", "大众热点"]
  },
  {
    name: "Google 新闻 - 娱乐影视",
    url: "https://news.google.com/rss/search?q=%E7%83%AD%E6%90%9C%20%E5%A8%B1%E4%B9%90%20%E5%BD%B1%E8%A7%86%20%E6%BC%94%E5%94%B1%E4%BC%9A%20%E6%98%8E%E6%98%9F&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
    type: "rss" as const,
    defaultSignals: ["娱乐影视", "大众热点"]
  },
  {
    name: "Google 新闻 - 生活消费",
    url: "https://news.google.com/rss/search?q=%E7%83%AD%E6%90%9C%20%E6%9A%91%E6%9C%9F%20%E9%AB%98%E8%80%83%20%E6%97%85%E8%A1%8C%20%E6%B6%88%E8%B4%B9&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
    type: "rss" as const,
    defaultSignals: ["生活消费", "大众热点"]
  }
];

type SourceConfig = (typeof RSS_SOURCES)[number];

const FALLBACK_EVENTS: HotEvent[] = [
  {
    id: "fallback-ai-phone",
    title: "AI 手机与端侧大模型持续升温，用户关注拍照、翻译和办公效率",
    source: "内置样例",
    url: "https://www.jd.com/",
    publishedAt: new Date().toISOString(),
    heatSignals: ["科技热词", "数码相关", "可承接手机/平板/电脑"],
    summary: "AI 终端话题适合与换机理由、学习办公效率、影像体验结合。"
  },
  {
    id: "fallback-sports-viewing",
    title: "国际赛事带动观赛和社交讨论，球迷场景成为消费电子传播切口",
    source: "内置样例",
    url: "https://www.jd.com/",
    publishedAt: new Date().toISOString(),
    heatSignals: ["体育热点", "场景消费", "运动户外/食品酒水/服饰/影音可承接"],
    summary: "赛事热点可转为大屏观赛、长续航、拍照分享、联名配件等销售玩法。"
  },
  {
    id: "fallback-negative",
    title: "某公共安全事件引发讨论，社会情绪偏严肃",
    source: "内置样例",
    url: "https://www.jd.com/",
    publishedAt: new Date().toISOString(),
    heatSignals: ["负面舆情", "不适合促销"],
    summary: "涉及伤亡、灾害、冲突、公共安全的热点不应借势卖货。"
  }
];

export async function collectHotEvents(): Promise<{
  events: HotEvent[];
  sourceStatuses: SourceStatus[];
}> {
  const settled = await Promise.allSettled(RSS_SOURCES.map(fetchRssSource));
  const sourceStatuses: SourceStatus[] = [];
  const events: HotEvent[] = [];

  settled.forEach((result, index) => {
    const source = RSS_SOURCES[index];
    if (result.status === "fulfilled") {
      events.push(...result.value.events);
      sourceStatuses.push({
        name: source.name,
        status: result.value.events.length > 0 ? "ok" : "partial",
        itemCount: result.value.events.length,
        message: result.value.events.length > 0 ? "采集成功" : "源可访问但未解析到条目"
      });
    } else {
      sourceStatuses.push({
        name: source.name,
        status: "failed",
        itemCount: 0,
        message: result.reason instanceof Error ? result.reason.message : "采集失败"
      });
    }
  });

  const deduped = diversifyEvents(dedupeEvents(events), 28);

  if (deduped.length === 0) {
    sourceStatuses.push({
      name: "内置样例",
      status: "partial",
      itemCount: FALLBACK_EVENTS.length,
      message: "公开源暂不可用，使用样例保证页面可读"
    });
    return { events: FALLBACK_EVENTS, sourceStatuses };
  }

  return { events: deduped, sourceStatuses };
}

async function fetchRssSource(source: SourceConfig): Promise<{ events: HotEvent[] }> {
  const response = await fetch(source.url, {
    headers: {
      "user-agent": "Mozilla/5.0 HotspotMarketingRadar/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const xml = await response.text();
  if (source.type === "baidu") {
    return { events: parseBaiduHotBoard(xml, source).slice(0, 16) };
  }

  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 8);
  const events = items
    .map((item, index) => {
      const raw = item[1];
      const title = getTag(raw, "title");
      const link = getTag(raw, "link");
      const publishedAt = getTag(raw, "pubDate");
      const description = stripHtml(getTag(raw, "description"));

      if (!title || !link) return null;

      return {
        id: stableId(`${source.name}-${title}-${index}`),
        title,
        source: source.name,
        url: link,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        heatSignals: inferHeatSignals(title, description, source.defaultSignals),
        summary: description || "公开新闻源条目，等待进一步营销判断。"
      } satisfies HotEvent;
    })
    .filter(Boolean) as HotEvent[];

  return { events };
}

function parseBaiduHotBoard(html: string, source: SourceConfig): HotEvent[] {
  const dataMatch = html.match(/<!--s-data:([\s\S]*?)-->/);
  if (!dataMatch) return [];

  try {
    const payload = JSON.parse(dataMatch[1]) as {
      data?: { cards?: Array<{ content?: Array<Record<string, unknown>> }> };
    };
    const content = payload.data?.cards?.flatMap((card) => card.content ?? []) ?? [];
    return content
      .map((item, index) => {
        const title = String(item.query ?? item.word ?? "").trim();
        const summary = String(item.desc ?? "").trim();
        const url = String(item.url ?? item.rawUrl ?? "https://top.baidu.com/board?tab=realtime");
        const hotScore = String(item.hotScore ?? "");
        if (!title) return null;

        return {
          id: stableId(`${source.name}-${title}-${index}`),
          title,
          source: source.name,
          url,
          publishedAt: new Date().toISOString(),
          heatSignals: inferHeatSignals(title, summary, [
            ...source.defaultSignals,
            hotScore ? `热搜指数 ${hotScore}` : "热搜榜"
          ]),
          summary: summary || "百度实时热搜条目，适合先判断情绪与商业化边界。"
        } satisfies HotEvent;
      })
      .filter(Boolean) as HotEvent[];
  } catch {
    return [];
  }
}

function getTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeEntities(match?.[1]?.replace(/^<!\[CDATA\[|\]\]>$/g, "").trim() ?? "");
}

function stripHtml(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(0, 180);
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function inferHeatSignals(title: string, description: string, defaults: string[] = []): string[] {
  const text = `${title} ${description}`;
  const signals = [...defaults];
  if (/热搜|爆|刷屏|关注|讨论|发布|官宣|夺冠|世界杯|赛事|演唱会|高考/.test(text)) signals.push("大众热度");
  if (/世界杯|足球|篮球|球星|赛事|夺冠|省超|村超|苏超|C罗|梅西|哈兰德/.test(text)) signals.push("体育热点");
  if (/电影|剧集|综艺|演唱会|明星|艺人|音乐|游戏|漫威|IP/.test(text)) signals.push("娱乐热点");
  if (/AI|手机|平板|电脑|数码|芯片|影像|游戏|电竞|穿戴|耳机/.test(text)) signals.push("数码相关");
  if (/优惠|补贴|消费|换新|开学|高考|出游|办公|学习|通勤|暑期/.test(text)) signals.push("消费场景");
  return Array.from(new Set(signals.length ? signals : ["公开新闻"])).slice(0, 5);
}

function dedupeEvents(events: HotEvent[]): HotEvent[] {
  const seen = new Set<string>();
  return events.filter((event) => {
    const key = event.title.replace(/\s+/g, "").toLowerCase().slice(0, 36);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function diversifyEvents(events: HotEvent[], limit: number): HotEvent[] {
  const bySource = new Map<string, HotEvent[]>();
  events.forEach((event) => {
    const group = bySource.get(event.source) ?? [];
    group.push(event);
    bySource.set(event.source, group);
  });

  const result: HotEvent[] = [];
  const sourceNames = Array.from(bySource.keys());
  let cursor = 0;

  while (result.length < limit && sourceNames.some((source) => (bySource.get(source)?.length ?? 0) > cursor)) {
    for (const source of sourceNames) {
      const event = bySource.get(source)?.[cursor];
      if (event) result.push(event);
      if (result.length >= limit) break;
    }
    cursor += 1;
  }

  return result;
}

function stableId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `event-${Math.abs(hash)}`;
}
