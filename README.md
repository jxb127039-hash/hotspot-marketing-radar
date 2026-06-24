# 公开热点营销机会雷达

面向京东全品类的热点营销机会工作台。应用每天从公开 RSS/新闻源采集热点，判断是否适合营销借势，并生成商品/品类匹配、销售玩法和多渠道文案。

## 本地运行

```bash
pnpm install
pnpm dev
```

访问 `http://127.0.0.1:3000`。

## 环境变量

复制 `.env.example` 为 `.env.local` 后配置：

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

没有 `OPENAI_API_KEY` 时，系统会自动使用规则模板兜底，页面仍可运行。

## GitHub Pages 部署

仓库已配置 GitHub Actions：`.github/workflows/pages.yml`。

触发方式：

- 推送到 `main` 后自动构建并部署。
- 每天 UTC 00:00、06:00、12:00 自动重建，刷新公开热点。
- 也可以在 GitHub Actions 里手动运行 `Deploy hotspot radar`。

如果需要 AI 生成更强文案，在仓库 Settings → Secrets and variables → Actions 里添加 `OPENAI_API_KEY`。

## 数据边界

应用只使用公开信息，不接入京东内网销售、库存、毛利或未发布活动数据。所有输出均为营销策划参考，不代表官方赞助、官方授权或最终促销承诺。
