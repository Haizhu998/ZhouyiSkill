import { getPillarTime, type PillarTime } from "./calendar";
import type { ToneMode } from "./constants";

export const XIAO_PALACES = ["大安", "留连", "速喜", "赤口", "小吉", "空亡"] as const;
export type XiaoPalaceName = (typeof XIAO_PALACES)[number];

export type XiaoPalace = {
  name: XiaoPalaceName;
  nature: "吉" | "凶";
  element: string;
  meaning: string;
  advice: string;
};

export const XIAO_PALACE_INFO: Record<XiaoPalaceName, XiaoPalace> = {
  大安: {
    name: "大安",
    nature: "吉",
    element: "木",
    meaning: "安稳守成，事体平顺，宜静不宜急。谋事可成而节奏偏慢。",
    advice: "守正待时，稳健推进，不宜冒险更张。",
  },
  留连: {
    name: "留连",
    nature: "凶",
    element: "木",
    meaning: "牵滞不决，来去纠缠，事情反复、进度受阻。",
    advice: "暂缓决断，理清纠缠，防拖延耗力。",
  },
  速喜: {
    name: "速喜",
    nature: "吉",
    element: "火",
    meaning: "喜讯来得快，利于主动、会面、求财、感情推进。",
    advice: "宜速不宜迟，抓住窗口立刻行动。",
  },
  赤口: {
    name: "赤口",
    nature: "凶",
    element: "金",
    meaning: "口舌是非、冲突争执，官非病灾皆须防。",
    advice: "谨言慎行，避争讼，大事宜缓。",
  },
  小吉: {
    name: "小吉",
    nature: "吉",
    element: "水",
    meaning: "小有喜庆，贵人扶助，事可成而格局不大。",
    advice: "宜合作、求人、办小件，勿贪大。",
  },
  空亡: {
    name: "空亡",
    nature: "凶",
    element: "土",
    meaning: "落空、失期、心力白费，事情易中途消散。",
    advice: "不宜开新局，重在收心复盘，改日再举。",
  },
};
