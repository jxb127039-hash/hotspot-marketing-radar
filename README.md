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
CRON_SECRET=
```

没有 `OPENAI_API_KEY` 时，系统会自动使用规则模板兜底，页面仍可运行。

## Vercel 部署

1. 在 Vercel 导入此目录。
2. 配置 `OPENAI_API_KEY`、`OPENAI_MODEL` 和可选的 `CRON_SECRET`。
3. `vercel.json` 已配置 Cron：北京时间 08:00、14:00、20:00 触发 `/api/cron`。
4. 前台读取缓存快照；`/api/snapshot` 可用于检查当前生成结果。

## 数据边界

应用只使用公开信息，不接入京东内网销售、库存、毛利或未发布活动数据。所有输出均为营销策划参考，不代表官方赞助、官方授权或最终促销承诺。
