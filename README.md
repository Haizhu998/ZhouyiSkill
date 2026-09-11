# ZhouyiSkill

Agent skill pack for **instant Chinese divination**. The 起卦 time is always the **inquiry timestamp** unless the user names another moment.

Arts:

- **六爻** — time casting (先天数) or three-coin lines; 本卦 / 变卦 / 纳甲 / 世应 / 六亲
- **大六壬** — 月将加时, 四课三传, 十二天将
- **小六壬** — 月日时落宫（大安…空亡）

These are the same algorithms used by the **AI周易推演** app: [Haizhu998/AItuisuan](https://github.com/Haizhu998/AItuisuan) (inspired by [WuXieXie/AiTaoist](https://github.com/WuXieXie/AiTaoist)).

## For agents

Load `SKILL.md`, then the matching file under `skills/`. TypeScript sources in `src/` are executable references.

```ts
import { parseInquiryTime, castLiuYao, castDaLiuRen, castXiaoLiuRen } from "./src";

const date = parseInquiryTime("2026-09-10", "19:30"); // inquiry time
const liuyao = castLiuYao({ question: "出行是否顺利", date, method: "time" });
const luren = castDaLiuRen({ question: "此事吉凶", date });
const xiao = castXiaoLiuRen({ question: "今日宜否出门", date });
```

Requires `lunar-javascript` for 干支 / 农历 / 节气.

## Disclaimer

Cultural study and entertainment. Not medical, legal, or investment advice.
