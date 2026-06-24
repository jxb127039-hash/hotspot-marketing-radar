import type { ProductMatch } from "@/lib/types";

const CATEGORY_RULES: Array<{
  category: ProductMatch["category"];
  keywords: RegExp;
  query: string;
  angle: string;
}> = [
  {
    category: "运动户外",
    keywords: /世界杯|足球|篮球|球星|赛事|夺冠|省超|村超|苏超|跑步|运动|健身|户外|露营|骑行/,
    query: "京东 运动户外 足球 球衣 运动装备",
    angle: "货盘逻辑：球衣/运动鞋做情绪表达，足球篮球/护具做参与感，露营桌椅做户外观赛。玩法可按球衣号、开球时间、主队色做限时会场。"
  },
  {
    category: "食品酒水",
    keywords: /世界杯|观赛|聚会|夜宵|啤酒|零食|饮料|烧烤|夏天|暑期|看球|朋友/,
    query: "京东 食品酒水 啤酒 零食 饮料 观赛",
    angle: "货盘逻辑：啤酒饮料做主推，零食速食做凑单，生鲜烧烤做高客单。玩法可做“开赛前补给、半场加购、赛后宵夜”三段转化。"
  },
  {
    category: "服饰鞋包",
    keywords: /明星|演唱会|球星|穿搭|同款|潮流|毕业|旅行|出游|通勤|防晒|夏季/,
    query: "京东 服饰鞋包 潮流 同款 防晒 出游",
    angle: "货盘逻辑：同色系穿搭做话题，鞋包配饰做低门槛转化，防晒外套/旅行鞋做场景升级。玩法可做“热搜同色，不说同款”。"
  },
  {
    category: "图书文具",
    keywords: /高考|中考|查分|录取|大学|开学|学习|考试|毕业|考研|阅读|文具/,
    query: "京东 图书 文具 学习用品 开学",
    angle: "货盘逻辑：文具教辅做刚需，效率工具做升级，礼盒做情绪奖励。玩法可按“查分后、录取后、开学前”做阶段式清单。"
  },
  {
    category: "汽车用品",
    keywords: /汽车|自驾|通勤|公交|上座率|出行|旅行|车载|新能源|保有量|城市/,
    query: "京东 汽车用品 自驾 车载 通勤",
    angle: "货盘逻辑：车载充电/支架做高频入口，清洁养护做复购，应急露营做高客单。玩法可包装成“通勤自由套装”。"
  },
  {
    category: "家电家居",
    keywords: /夏天|高温|清凉|居家|空调|冰箱|洗衣|观赛|聚会|做饭|装修|搬家/,
    query: "京东 家电家居 空调 冰箱 清凉 观赛",
    angle: "货盘逻辑：空调冰箱做季节大件，小厨电做聚会场景，收纳清洁做连带。玩法可从“把主场搬回家”切入客厅升级。"
  },
  {
    category: "美妆个护",
    keywords: /演唱会|明星|高温|防晒|出游|旅行|开学|毕业|拍照|约会|夏季/,
    query: "京东 美妆个护 防晒 出游 演唱会",
    angle: "货盘逻辑：防晒做刚需入口，补妆/香氛做出片升级，个护清洁做返程复购。玩法可做“出门前 30 分钟状态清单”。"
  },
  {
    category: "母婴玩具",
    keywords: /亲子|儿童|暑期|研学|玩具|家庭|学生|高考|毕业|旅行|假期/,
    query: "京东 母婴玩具 暑期 亲子 研学",
    angle: "货盘逻辑：玩具童书做陪伴入口，亲子出游用品做暑期场景，升学奖励做情绪转化。玩法可做“假期不无聊清单”。"
  },
  {
    category: "本地生活",
    keywords: /旅行|出游|暑期|演唱会|电影|餐饮|酒店|门票|城市|周末|文旅/,
    query: "京东 本地生活 旅行 酒店 门票 餐饮",
    angle: "货盘逻辑：酒店门票做目的地承接，餐饮券做低门槛，周边游套餐做升级。玩法可把热搜城市变成“周末就去”会场。"
  },
  {
    category: "手机",
    keywords: /手机|影像|拍照|直播|AI|赛事|明星|演唱会|游戏|换机|通信|出游|世界杯|球星|高考|毕业|旅行|通勤|城市/,
    query: "京东 手机 AI 影像 长续航",
    angle: "把热点情绪转成换机理由：影像记录、长续航、AI 助手、赛事/演唱会/旅行分享。"
  },
  {
    category: "平板",
    keywords: /平板|学习|办公|网课|阅读|生产力|赛事|观赛|游戏|AI|高考|暑期|追剧|影视|电影/,
    query: "京东 平板 学习 办公 游戏",
    angle: "用大屏、学习办公、轻生产力、追剧观赛和暑期学习场景承接热点讨论。"
  },
  {
    category: "电脑",
    keywords: /电脑|办公|AI|生产力|游戏|电竞|开学|高考|大学|创作|编程|毕业/,
    query: "京东 笔记本电脑 AI 办公 游戏",
    angle: "主打效率升级、AI 创作、游戏性能和开学/办公换新。"
  },
  {
    category: "配件",
    keywords: /手机壳|周边|联名|充电|支架|保护|出行|赛事|明星|潮流|球星|应援|演唱会|旅行|通勤|高考/,
    query: "京东 配件 手机壳 充电器",
    angle: "用低门槛配件做情绪消费，适合联名、应援、赠品和凑单。"
  },
  {
    category: "智能穿戴",
    keywords: /运动|健康|跑步|赛事|户外|手表|手环|睡眠/,
    query: "京东 智能手表 运动 健康",
    angle: "把体育、健康和户外热点转成运动记录、健康管理和礼赠场景。"
  },
  {
    category: "影音设备",
    keywords: /观赛|世界杯|电影|音乐|演唱会|直播|音箱|耳机|投影|大屏|追剧|综艺|赛事|游戏/,
    query: "京东 耳机 音箱 投影 观赛",
    angle: "用沉浸观赛、听歌、直播和家庭娱乐承接内容热度。"
  }
];

export function matchProducts(text: string): ProductMatch[] {
  const matched = CATEGORY_RULES.filter((rule) => rule.keywords.test(text)).map((rule) =>
    toProductMatch(rule, 88)
  );

  if (matched.length > 0) {
    return matched.slice(0, 4);
  }

  return [
    toProductMatch(CATEGORY_RULES.find((rule) => rule.category === "食品酒水") ?? CATEGORY_RULES[0], 56),
    toProductMatch(CATEGORY_RULES.find((rule) => rule.category === "服饰鞋包") ?? CATEGORY_RULES[1], 52),
    toProductMatch(CATEGORY_RULES.find((rule) => rule.category === "家电家居") ?? CATEGORY_RULES[2], 48)
  ];
}

function toProductMatch(
  rule: (typeof CATEGORY_RULES)[number],
  confidence: number
): ProductMatch {
  return {
    category: rule.category,
    query: rule.query,
    angle: rule.angle,
    searchUrl: `https://www.bing.com/search?q=${encodeURIComponent(`site:jd.com ${rule.query}`)}`,
    confidence
  };
}
