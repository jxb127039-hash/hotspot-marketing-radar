import { ArrowLeft, BadgeCheck, ExternalLink, Radio, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import type { Decision, RadarItem } from "@/lib/types";

const decisionStyles: Record<Decision, string> = {
  可蹭: "border-action/30 bg-action/10 text-action",
  谨慎: "border-caution/30 bg-caution/10 text-caution",
  不适合: "border-zinc-300 bg-zinc-100 text-zinc-600"
};

export function HotspotDetail({ item }: { item: RadarItem }) {
  const copyText = item.marketing
    ? [
        `热点：${item.event.title}`,
        `判断：${item.decision}｜机会分：${item.opportunityScore}`,
        `目标受众：${item.marketing.targetAudience}`,
        `核心卖点（USP）：${item.marketing.usp}`,
        `行动号召（CTA）：${item.marketing.cta}`,
        `销售玩法：${item.marketing.salesPlay}`,
        `微信：${item.marketing.wechat}`,
        `微博：${item.marketing.weibo}`,
        `站内：${item.marketing.onsite}`,
        `Push：${item.marketing.push}`,
        `社群：${item.marketing.community}`
      ].join("\n\n")
    : `热点：${item.event.title}\n判断：${item.decision}\n${item.reasons.join("\n")}`;

  return (
    <main className="min-h-screen">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-paper px-3 text-sm font-medium text-ink transition hover:border-ink"
            >
              <ArrowLeft className="size-4" />
              返回热点筛选
            </Link>
            <div className="flex gap-2">
              <CopyButton text={copyText} label="复制完整方案" />
              <a
                href={item.event.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink transition hover:border-ink"
              >
                <ExternalLink className="size-4" />
                来源
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${decisionStyles[item.decision]}`}>
              {item.decision}
            </span>
            <span className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-zinc-600">
              机会 {item.opportunityScore}
            </span>
            <span className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-zinc-600">
              热度 {item.score.heat}
            </span>
            <span className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-zinc-600">
              {item.event.source}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink sm:text-4xl">{item.event.title}</h1>
          <p className="mt-3 text-base leading-7 text-zinc-600">{item.event.summary}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <Section title="判断理由" icon={<BadgeCheck className="size-4 text-action" />}>
          <ul className="grid gap-2 text-sm leading-6 text-zinc-700 md:grid-cols-2">
            {item.reasons.map((reason) => (
              <li key={reason} className="rounded-md border border-line bg-paper p-3">
                {reason}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="全品类货盘机会" icon={<ShoppingBag className="size-4 text-jd" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {item.productMatches.map((match) => (
              <a
                key={`${item.event.id}-${match.category}-${match.query}`}
                href={match.searchUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-line bg-paper p-4 transition hover:border-ink"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold text-ink">{match.category}</span>
                  <span className="text-xs text-zinc-500">匹配 {match.confidence}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{match.angle}</p>
              </a>
            ))}
          </div>
        </Section>

        {item.marketing ? (
          <>
            <Section title="销售玩法" icon={<Sparkles className="size-4 text-jd" />}>
              <div className="grid gap-3 text-sm leading-6 text-zinc-700 md:grid-cols-3">
                <InfoBlock label="目标受众" text={item.marketing.targetAudience} />
                <InfoBlock label="核心卖点（USP）" text={item.marketing.usp} />
                <InfoBlock label="行动号召（CTA）" text={item.marketing.cta} />
              </div>
              <div className="mt-4 rounded-md border border-line bg-paper p-4 text-sm leading-7 text-zinc-700">
                {item.marketing.salesPlay}
              </div>
            </Section>

            <Section title="多渠道文案" icon={<Radio className="size-4 text-action" />}>
              <div className="grid gap-3 text-sm leading-6 text-zinc-700">
                <CopyBlock label="微信" text={item.marketing.wechat} />
                <CopyBlock label="微博" text={item.marketing.weibo} />
                <CopyBlock label="站内" text={item.marketing.onsite} />
                <CopyBlock label="Push" text={item.marketing.push} />
                <CopyBlock label="社群" text={item.marketing.community} />
              </div>
            </Section>
          </>
        ) : (
          <Section title="处理建议" icon={<Sparkles className="size-4 text-zinc-500" />}>
            <p className="text-sm leading-7 text-zinc-600">该热点不建议做商业化借势，可仅作为舆情观察或选题参考。</p>
          </Section>
        )}
      </section>
    </main>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-panel sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-3">
      <div className="text-xs font-semibold text-zinc-500">{label}</div>
      <p className="mt-2">{text}</p>
    </div>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-zinc-500">{label}</span>
        <CopyButton text={text} label="复制" />
      </div>
      <p className="whitespace-pre-wrap break-words">{text}</p>
    </div>
  );
}
