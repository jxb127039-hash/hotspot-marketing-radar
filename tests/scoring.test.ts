import { describe, expect, it } from "vitest";
import { scoreEvent } from "@/lib/scoring";
import type { HotEvent } from "@/lib/types";

function event(title: string, summary = title): HotEvent {
  return {
    id: title,
    title,
    source: "test",
    url: "https://example.com",
    publishedAt: new Date().toISOString(),
    heatSignals: ["测试"],
    summary
  };
}

describe("scoreEvent", () => {
  it("marks sports moments as usable or cautious when they map to categories", () => {
    const result = scoreEvent(event("世界杯球星破纪录刷屏，球迷热议观赛和拍照分享"));
    expect(["可蹭", "谨慎"]).toContain(result.decision);
    expect(result.productMatches.length).toBeGreaterThan(0);
    expect(result.risks.join("")).toContain("官方赞助");
  });

  it("rejects serious negative public events", () => {
    const result = scoreEvent(event("公共安全事故造成伤亡，引发社会关注"));
    expect(result.decision).toBe("不适合");
    expect(result.marketing).toBeNull();
  });

  it("rejects sports controversy with criminal allegations", () => {
    const result = scoreEvent(event("英格兰球员拒绝与涉嫌强奸球员握手"));
    expect(result.decision).toBe("不适合");
  });

  it("keeps required marketing fields for usable items", () => {
    const result = scoreEvent(event("AI 手机发布引发热搜，影像和办公能力升级"));
    expect(result.marketing?.targetAudience).toBeTruthy();
    expect(result.marketing?.usp).toBeTruthy();
    expect(result.marketing?.cta).toBeTruthy();
  });
});
