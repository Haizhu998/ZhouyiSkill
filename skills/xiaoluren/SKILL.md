---
name: xiaoluren
description: Cast 小六壬 from inquiry time. Count 大安→留连→速喜→赤口→小吉→空亡 by lunar month, day, hour.
---

# 小六壬即时起卦

Clock from parent `SKILL.md`.

六宫循环（吉凶）：

1. 大安 吉 木 — 安稳守成，宜静
2. 留连 凶 木 — 牵滞反复
3. 速喜 吉 火 — 喜来得快，宜速
4. 赤口 凶 金 — 口舌官非
5. 小吉 吉 水 — 小喜贵人，宜合作
6. 空亡 凶 土 — 落空失期

数法（宫序从 0=大安 起，步数含起点）：

```
monthIndex = (lunarMonth - 1) % 6
dayIndex   = (monthIndex + lunarDay - 1) % 6
hourIndex  = (dayIndex + timeZhiNum - 1) % 6
```

时支数 子1 … 亥12。

断事以 **时落** 为主，月落、日落为辅。三宫同吉则顺，时落凶而月日吉则先滞后通。

见 `src/xiaoluren.ts`。
