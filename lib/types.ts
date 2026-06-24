export type Decision = "可蹭" | "谨慎" | "不适合";

export type SourceStatus = {
  name: string;
  status: "ok" | "partial" | "failed";
  itemCount: number;
  message: string;
};

export type HotEvent = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  heatSignals: string[];
  summary: string;
};

export type ScoreBreakdown = {
  heat: number;
  timeliness: number;
  categoryFit: number;
  sentimentSafety: number;
  complianceSafety: number;
  productFit: number;
};

export type ProductMatch = {
  category: string;
  query: string;
  angle: string;
  searchUrl: string;
  confidence: number;
};

export type MarketingPackage = {
  targetAudience: string;
  usp: string;
  cta: string;
  salesPlay: string;
  wechat: string;
  weibo: string;
  onsite: string;
  push: string;
  community: string;
};

export type RadarItem = {
  event: HotEvent;
  decision: Decision;
  opportunityScore: number;
  reasons: string[];
  risks: string[];
  score: ScoreBreakdown;
  productMatches: ProductMatch[];
  marketing: MarketingPackage | null;
};

export type RadarSnapshot = {
  generatedAt: string;
  dateLabel: string;
  dataMode: "ai" | "rules";
  sourceStatuses: SourceStatus[];
  items: RadarItem[];
  disclaimer: string;
};
