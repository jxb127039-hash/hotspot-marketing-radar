import { matchProducts } from "@/lib/products";
import type { Decision, HotEvent, RadarItem, ScoreBreakdown } from "@/lib/types";

const NEGATIVE_RE =
  /死亡|遇难|灾害|事故|地震|洪水|空难|战争|冲突|诈骗|违法|犯罪|强奸|性侵|丑闻|塌房|维权|召回|伤亡|公共安全|疾病|灾情/;
const COMPLIANCE_RE = /世界杯|奥运|FIFA|国家队|明星|C罗|梅西|演唱会|官方|授权|联名|赞助/;
const CATEGORY_RE =
  /手机|平板|电脑|数码|AI|芯片|影像|拍照|游戏|电竞|观赛|直播|学习|办公|耳机|穿戴|充电|京东|3C|消费电子|运动|食品|酒水|服饰|鞋包|汽车|图书|文具|家电|家居|美妆|个护|母婴|玩具|本地生活|旅行|酒店|门票/;
const BRIDGE_RE =
  /世界杯|足球|篮球|球星|体育|赛事|省超|村超|苏超|演唱会|电影|剧集|综艺|明星|音乐|高考|毕业|暑期|旅行|通勤|城市|消费|开学/;
const HEAT_RE = /热搜|刷屏|爆|夺冠|发布|官宣|首发|破纪录|回归|大促|补贴|赛事|演唱会|暑期|开学|高考|世界杯/;

export function scoreEvent(event: HotEvent): RadarItem {
  const text = `${event.title} ${event.summary} ${event.heatSignals.join(" ")}`;
  const hasDirectCategoryFit = CATEGORY_RE.test(text);
  const hasCreativeBridge = BRIDGE_RE.test(text);
  const score: ScoreBreakdown = {
    heat: clamp(HEAT_RE.test(text) ? 82 : event.heatSignals.length >= 2 ? 72 : 58),
    timeliness: scoreTimeliness(event.publishedAt),
    categoryFit: clamp(hasDirectCategoryFit ? 86 : hasCreativeBridge ? 70 : 38),
    sentimentSafety: clamp(NEGATIVE_RE.test(text) ? 15 : /争议|道歉|处罚|投诉/.test(text) ? 42 : 84),
    complianceSafety: clamp(COMPLIANCE_RE.test(text) ? 58 : 82),
    productFit: clamp(matchProducts(text)[0]?.confidence ?? 45)
  };

  const opportunityScore = Math.round(
    score.heat * 0.18 +
      score.timeliness * 0.14 +
      score.categoryFit * 0.22 +
      score.sentimentSafety * 0.18 +
      score.complianceSafety * 0.12 +
      score.productFit * 0.16
  );

  const decision = decide(opportunityScore, score, text);
  const risks = buildRisks(text, decision);
  const reasons = buildReasons(score, text, decision);

  return {
    event,
    decision,
    opportunityScore,
    reasons,
    risks,
    score,
    productMatches: matchProducts(text),
    marketing: decision === "不适合" ? null : buildRuleMarketing(event, text, decision)
  };
}

function scoreTimeliness(publishedAt: string): number {
  const ageHours = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 36e5);
  if (ageHours <= 12) return 92;
  if (ageHours <= 36) return 78;
  if (ageHours <= 72) return 62;
  return 46;
}

function decide(score: number, breakdown: ScoreBreakdown, text: string): Decision {
  if (NEGATIVE_RE.test(text) || breakdown.sentimentSafety < 35) return "不适合";
  if (score >= 72 && breakdown.categoryFit >= 58 && breakdown.complianceSafety >= 50) return "可蹭";
  if (score >= 54 && breakdown.sentimentSafety >= 50) return "谨慎";
  return "不适合";
}

function buildReasons(score: ScoreBreakdown, text: string, decision: Decision): string[] {
  const reasons = [];
  if (score.heat >= 75) reasons.push("热度信号较强，适合在 24 小时内做轻量快反。");
  if (score.categoryFit >= 75) reasons.push("与商品消费场景相关，可自然转到运动户外、食品酒水、服饰、家电、数码或本地生活等货盘。");
  if (score.categoryFit >= 65 && !CATEGORY_RE.test(text)) reasons.push("不是直接商品热点，但具备情绪梗或场景梗，适合做出其不意的创意迁移。");
  if (score.productFit >= 70) reasons.push("可匹配公开全品类商品/货盘，不依赖内部库存和毛利数据。");
  if (decision === "谨慎") reasons.push("具备传播入口，但需降低商业化表达，避免过度消费热点。");
  if (/体育|赛事|世界杯|夺冠|C罗|梅西/.test(text)) reasons.push("体育情绪适合绑定数字梗、观赛装备和球迷福利。");
  return reasons.length ? reasons : ["公开讨论具备一定关注度，可作为选题池观察。"];
}

function buildRisks(text: string, decision: Decision): string[] {
  const risks = [];
  if (COMPLIANCE_RE.test(text)) risks.push("涉及赛事、明星或授权词，避免暗示官方赞助、官方合作或肖像授权。");
  if (NEGATIVE_RE.test(text)) risks.push("涉及负面或严肃公共议题，不建议商业促销借势。");
  if (decision === "谨慎") risks.push("建议使用场景化表达，不做强促销标题党。");
  risks.push("仅基于公开信息判断，不承诺库存、价格、券力度或平台活动排期。");
  return risks;
}

function buildRuleMarketing(event: HotEvent, text: string, decision: Exclude<Decision, "不适合">) {
  const matches = matchProducts(text);
  const primaryCategory = matches[0]?.category ?? "食品酒水";
  const safePrefix = decision === "谨慎" ? "轻量借势" : "热点快反";
  const bridge = CATEGORY_RE.test(text) ? "直接承接" : "创意迁移";
  const profile = buildCreativeProfile(event, text, matches.map((match) => match.category));
  const usp = `${profile.hook}：${profile.basket}`;

  return {
    targetAudience: profile.audience,
    usp,
    cta: profile.cta,
    salesPlay: `${safePrefix} / ${bridge}：${profile.play} 主推 ${primaryCategory}，联动 ${matches
      .slice(1, 4)
      .map((match) => match.category)
      .join("、") || "相关品类"}；页面结构用“热点梗入口 + 场景套装 + 低门槛凑单 + 高客单升级”四段，不使用未授权官方合作表述。`,
    wechat: `目标受众：${profile.audience}\n核心卖点（USP）：${usp}\n行动号召（CTA）：${profile.cta}\n\n开头用热点做情绪入口，中段给“${profile.bundleName}”清单，结尾用公开在售商品承接，不做官方授权暗示。`,
    weibo: `${profile.shortCopy}\n\n${profile.socialTag}\nUSP：${profile.basket}\nCTA：${profile.cta}`,
    onsite: `${profile.bundleName}｜${event.title}`,
    push: `${profile.push}`,
    community: `今天这条热点适合做“${profile.bundleName}”。\n先抛梗：${profile.hook}\n再给货：${profile.basket}\n最后收口：${profile.cta}\n注意只说场景福利，不说官方合作。`
  };
}

function buildCreativeProfile(event: HotEvent, text: string, categories: string[]) {
  const categoryText = categories.slice(0, 4).join(" + ");

  if (/世界杯|足球|篮球|球星|哈兰德|C罗|梅西|赛事|省超|村超|苏超/.test(text)) {
    return {
      hook: "把球迷情绪从比分带到装备",
      basket: `球衣鞋服、运动装备、看球零食酒水、客厅观赛设备、球星色系穿搭联动，当前可落 ${categoryText}`,
      bundleName: "看球三件套升级计划",
      audience: "看球人群、轻运动用户、球星话题参与者，以及愿意为观赛聚会和应援穿搭消费的人群。",
      cta: "上京东搜看球装备、球迷穿搭、观赛零食，先把今晚的主场备齐。",
      play: "把球衣号、比分、开球时间、连胜/出线这些数字变成会场锚点，做“开球前补给、半场加购、赛后同款”三段式货盘",
      shortCopy: "不一定每个人都上场，但每个人都可以有自己的主场。",
      socialTag: "#把主场搬回家#",
      push: "今晚主场先备好：看球零食、球迷穿搭、运动装备，去京东配齐"
    };
  }

  if (/演唱会|明星|艺人|音乐|巡演|电影|剧集|综艺|影视|同款/.test(text)) {
    return {
      hook: "把围观明星转成出门前的同款准备",
      basket: `演唱会穿搭、防晒彩妆、拍照补光、应援周边、酒店门票和出行用品联动，当前可落 ${categoryText}`,
      bundleName: "出片应援套装",
      audience: "演唱会观众、追星用户、周末出行人群，以及关注同款穿搭和拍照出片的人群。",
      cta: "上京东搜演唱会穿搭、防晒补妆、出片装备，提前把状态准备好。",
      play: "把“谁去了现场、谁出了片、谁穿了什么”拆成穿搭、妆造、出行、拍摄四个货盘入口，做低客单应援品到高客单出行装备的连带",
      shortCopy: "热搜看的是现场，京东准备的是你去现场的状态。",
      socialTag: "#下一场我也要出片#",
      push: "演唱会/追剧热点正热：穿搭、防晒、拍照、出行装备一站配齐"
    };
  }

  if (/高考|中考|查分|录取|大学|开学|毕业|考研|学习/.test(text)) {
    return {
      hook: "把查分情绪转成上岸后的第一份奖励",
      basket: `图书文具、电脑数码、宿舍小家电、拉杆箱、护眼台灯和升学礼物联动，当前可落 ${categoryText}`,
      bundleName: "上岸奖励清单",
      audience: "学生家庭、准大学生、毕业生、备考人群，以及正在准备开学和升学礼物的人群。",
      cta: "上京东搜上岸礼物、开学装备、学习效率，把下一阶段先准备起来。",
      play: "用“查分前、查分后、录取后、开学前”做时间轴，把情绪节点对应到文具、电脑、箱包、宿舍用品和礼赠会场",
      shortCopy: "分数出来了，下一段路也该准备好了。",
      socialTag: "#上岸后的第一份奖励#",
      push: "查分季到了：开学装备、学习好物、上岸礼物，去京东列清单"
    };
  }

  if (/公交|通勤|汽车|自驾|出行|保有量|城市|车载|新能源/.test(text)) {
    return {
      hook: "把出行焦虑转成通勤体验升级",
      basket: `汽车用品、车载小电器、通勤包、耳机、咖啡水杯、清洁个护和应急用品联动，当前可落 ${categoryText}`,
      bundleName: "通勤自由套装",
      audience: "上班族、有车家庭、城市通勤人群、自驾用户，以及对出行效率和舒适度敏感的人群。",
      cta: "上京东搜通勤装备、车载用品、自驾补给，把每天路上的体验先升级。",
      play: "把热点里的“堵、挤、远、累”翻译成车载、随身、办公、补给四类解决方案，用一站式清单降低选择成本",
      shortCopy: "改变不了通勤距离，至少可以改变路上的体验。",
      socialTag: "#通勤也要有掌控感#",
      push: "通勤话题升温：车载用品、随身装备、自驾补给，去京东换个轻松路上"
    };
  }

  if (/旅行|出游|暑期|文旅|酒店|门票|清凉|露营|周末/.test(text)) {
    return {
      hook: "把想出门的情绪转成出发前一晚清单",
      basket: `旅行箱包、防晒个护、户外露营、食品饮料、小家电、本地生活和亲子用品联动，当前可落 ${categoryText}`,
      bundleName: "说走就走补给包",
      audience: "暑期出游用户、亲子家庭、周末短途人群、露营玩家，以及正在收藏目的地的人群。",
      cta: "上京东搜出游补给、防晒清凉、露营装备，把行李箱先装满。",
      play: "把目的地热度拆成“路上、住下、玩开、晒后、返程”五个消费时刻，用清单式会场承接多品类连带",
      shortCopy: "热搜给你目的地，京东给你出发的底气。",
      socialTag: "#出发前一晚买什么#",
      push: "暑期出游热了：防晒、箱包、露营、亲子补给，去京东补齐"
    };
  }

  return {
    hook: "把热点注意力转成场景解决方案",
    basket: `${categoryText || "食品酒水 + 服饰鞋包 + 家电家居"} 等相关货盘做组合承接`,
    bundleName: "热点场景解决方案",
    audience: "关注今日热点、近期有相关场景消费需求的京东用户。",
    cta: "上京东搜索相关品类关键词，查看公开在售商品与限时福利。",
    play: "先提炼热点中的情绪、数字或场景，再把它拆成入门凑单品、核心主推品和升级高客单品三层货盘",
    shortCopy: "热点不只用来看，也能变成今天的生活灵感。",
    socialTag: "#热点里的消费灵感#",
    push: "今日热点可转场景清单，去京东看看相关好物"
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
