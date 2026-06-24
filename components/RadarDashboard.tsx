import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Clock3,
  ListChecks,
  Radio,
  ShieldCheck,
  Flame,
  Sparkles
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { Decision, RadarItem, RadarSnapshot } from "@/lib/types";

const decisionStyles: Record<Decision, string> = {
  可蹭: "border-action/30 bg-action/10 text-action",
  谨慎: "border-caution/30 bg-caution/10 text-caution",
  不适合: "border-zinc-300 bg-zinc-100 text-zinc-600"
};

export function RadarDashboard({ snapshot }: { snapshot: RadarSnapshot }) {
  const counts = {
    可蹭: snapshot.items.filter((item) => item.decision === "可蹭").length,
    谨慎: snapshot.items.filter((item) => item.decision === "谨慎").length,
    不适合: snapshot.items.filter((item) => item.decision === "不适合").length
  };
  const priorityItems = pickPriorityItems(snapshot.items);
  const heatItems = pickHeatItems(snapshot.items);
  const avoidItems = snapshot.items.filter((item) => item.decision === "不适合").slice(0, 4);

  return (
    <main className="min-h-screen">
      <section className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-line bg-paper px-3 py-1 text-sm text-zinc-700">
                <Radio className="size-4 text-jd" />
                京东全品类公开热点营销机会雷达
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
                今日热点筛选与机会判断
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
                先用双榜看清“大家正在关注什么”和“哪些更值得做”，再进入单个热点查看完整营销方案。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Metric label="可蹭" value={counts.可蹭} tone="text-action" />
              <Metric label="谨慎" value={counts.谨慎} tone="text-caution" />
              <Metric label="避开" value={counts.不适合} tone="text-zinc-500" />
            </div>
          </div>

          <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-3">
            <InfoStrip icon={<Clock3 className="size-4" />} label="生成时间" value={snapshot.dateLabel} />
            <InfoStrip
              icon={<Sparkles className="size-4" />}
              label="生成模式"
              value={snapshot.dataMode === "ai" ? "OpenAI 结构化生成" : "规则模板兜底"}
            />
            <InfoStrip icon={<ShieldCheck className="size-4" />} label="合规边界" value="公开信息，不承诺库存/价格/赞助关系" />
          </div>

          <OpportunityBoard priorityItems={priorityItems} heatItems={heatItems} avoidItems={avoidItems} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="space-y-4">
          <div className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <BarChart3 className="size-4 text-jd" />
              数据源状态
            </h2>
            <div className="space-y-3">
              {snapshot.sourceStatuses.map((source) => (
                <div key={source.name} className="rounded-md border border-line bg-paper p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-ink">{source.name}</span>
                    <span className="shrink-0 text-xs text-zinc-500">{source.itemCount} 条</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-zinc-600">{source.message}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-white p-4 text-sm leading-6 text-zinc-600 shadow-panel">
            <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink">
              <AlertTriangle className="size-4 text-caution" />
              使用边界
            </h2>
            <p>{snapshot.disclaimer}</p>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
              <ListChecks className="size-5 text-jd" />
              全部热点简表
            </h2>
            <span className="text-sm text-zinc-500">点击进入独立方案页</span>
          </div>
          <HotspotTable items={snapshot.items} />
        </div>
      </section>
    </main>
  );
}

function pickHeatItems(items: RadarItem[]): RadarItem[] {
  return [...items]
    .sort((a, b) => {
      const heatDelta = b.score.heat - a.score.heat;
      if (heatDelta !== 0) return heatDelta;
      return b.score.timeliness - a.score.timeliness;
    })
    .slice(0, 6);
}

function pickPriorityItems(items: RadarItem[]): RadarItem[] {
  const usable = items.filter((item) => item.decision !== "不适合");
  const creative = usable.filter((item) => isCreativeBridge(item));
  const direct = usable.filter((item) => !isCreativeBridge(item));
  const picked = [...creative.slice(0, 4), ...direct.slice(0, 2)];
  const seen = new Set<string>();

  return [...picked, ...usable]
    .filter((item) => {
      if (seen.has(item.event.id)) return false;
      seen.add(item.event.id);
      return true;
    })
    .slice(0, 6);
}

function isCreativeBridge(item: RadarItem): boolean {
  const text = `${item.event.title} ${item.event.summary} ${item.event.heatSignals.join(" ")} ${item.event.source}`;
  return /百度热搜|体育|娱乐|生活|世界杯|足球|球星|高考|暑期|旅行|演唱会|电影|剧集|明星|消费/.test(text);
}

function OpportunityBoard({
  priorityItems,
  heatItems,
  avoidItems
}: {
  priorityItems: RadarItem[];
  heatItems: RadarItem[];
  avoidItems: RadarItem[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-line bg-paper p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles className="size-4 text-jd" />
            今日先看
          </h2>
          <span className="text-xs text-zinc-500">双榜辅助选择</span>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          <RankPanel title="机会推荐" caption="按可操作性排序" icon={<Sparkles className="size-4 text-jd" />}>
            {priorityItems.map((item, index) => (
              <OpportunityRow key={`priority-${item.event.id}`} item={item} index={index} />
            ))}
          </RankPanel>
          <RankPanel title="热度排行" caption="按热度信号排序" icon={<Flame className="size-4 text-caution" />}>
            {heatItems.map((item, index) => (
              <HeatRow key={`heat-${item.event.id}`} item={item} index={index} />
            ))}
          </RankPanel>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <AlertTriangle className="size-4 text-caution" />
          今天先避开
        </h2>
        <div className="space-y-3">
          {avoidItems.length ? (
            avoidItems.map((item) => (
              <Link key={`avoid-${item.event.id}`} href={hotspotHref(item.event.id)} className="block rounded-md border border-line bg-paper p-3">
                <div className="line-clamp-2 text-sm font-medium text-ink">{item.event.title}</div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600">{item.risks[0]}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm leading-6 text-zinc-600">当前没有高风险热点，仍需逐条看合规提示。</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RankPanel({
  title,
  caption,
  icon,
  children
}: {
  title: string;
  caption: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          {icon}
          {title}
        </h3>
        <span className="text-xs text-zinc-500">{caption}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function OpportunityRow({ item, index }: { item: RadarItem; index: number }) {
  return (
    <Link
      href={hotspotHref(item.event.id)}
      className="grid gap-3 rounded-md border border-line bg-paper p-3 transition hover:border-ink md:grid-cols-[34px_1fr]"
    >
      <div className="flex size-8 items-center justify-center rounded-md bg-jd text-sm font-semibold text-white">
        {index + 1}
      </div>
      <div className="min-w-0">
        <div className="line-clamp-2 text-sm font-semibold leading-5 text-ink">{item.event.title}</div>
        <div className="mt-1 line-clamp-1 text-xs text-zinc-600">{getOneLinePlay(item)}</div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${decisionStyles[item.decision]}`}>
            {item.decision} {item.opportunityScore}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-action">
            {item.productMatches[0]?.category ?? "全品类"}
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function HeatRow({ item, index }: { item: RadarItem; index: number }) {
  return (
    <Link
      href={hotspotHref(item.event.id)}
      className="grid gap-3 rounded-md border border-line bg-paper p-3 transition hover:border-ink md:grid-cols-[34px_1fr]"
    >
      <div className="flex size-8 items-center justify-center rounded-md bg-caution text-sm font-semibold text-white">
        {index + 1}
      </div>
      <div className="min-w-0">
        <div className="line-clamp-2 text-sm font-semibold leading-5 text-ink">{item.event.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
          <span>热度 {item.score.heat}</span>
          <span>机会 {item.opportunityScore}</span>
          <span>{item.event.source}</span>
        </div>
      </div>
    </Link>
  );
}

function HotspotTable({ items }: { items: RadarItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
      <div className="hidden grid-cols-[56px_1fr_92px_110px_120px] gap-3 border-b border-line bg-paper px-4 py-3 text-xs font-semibold text-zinc-500 md:grid">
        <span>序号</span>
        <span>热点</span>
        <span>判断</span>
        <span>热度/机会</span>
        <span>主品类</span>
      </div>
      <div className="divide-y divide-line">
        {items.map((item, index) => (
          <Link
            key={item.event.id}
            href={hotspotHref(item.event.id)}
            className="grid gap-3 px-4 py-4 transition hover:bg-paper md:grid-cols-[56px_1fr_92px_110px_120px] md:items-center"
          >
            <span className="text-sm font-semibold text-zinc-500">{index + 1}</span>
            <div className="min-w-0">
              <div className="line-clamp-2 text-sm font-semibold leading-5 text-ink">{item.event.title}</div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                <span>{item.event.source}</span>
                <span>{item.event.heatSignals.slice(0, 2).join(" / ")}</span>
              </div>
            </div>
            <span className={`w-fit rounded-md border px-2 py-1 text-xs font-semibold ${decisionStyles[item.decision]}`}>
              {item.decision}
            </span>
            <span className="text-sm text-zinc-600">
              {item.score.heat} / {item.opportunityScore}
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-action">
              {item.productMatches[0]?.category ?? "全品类"}
              <ArrowRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="min-w-20 rounded-lg border border-line bg-paper px-4 py-3">
      <div className={`text-2xl font-semibold ${tone}`}>{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function InfoStrip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-lg border border-line bg-paper px-4 py-3">
      <div className="text-jd">{icon}</div>
      <div>
        <div className="text-xs text-zinc-500">{label}</div>
        <div className="font-medium text-ink">{value}</div>
      </div>
    </div>
  );
}

function getOneLinePlay(item: RadarItem): string {
  if (item.marketing) return item.marketing.salesPlay;
  return item.risks[0] ?? item.reasons[0] ?? "等待判断";
}

function hotspotHref(id: string): Route {
  return `/hotspots/${id}` as Route;
}
