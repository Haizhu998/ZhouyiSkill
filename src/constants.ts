export const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export type Gan = (typeof GAN)[number];
export type Zhi = (typeof ZHI)[number];
export type Wuxing = "金" | "木" | "水" | "火" | "土";

export const ZHI_NUM: Record<Zhi, number> = {
  子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6,
  午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 12,
};

export const ZHI_WUXING: Record<Zhi, Wuxing> = {
  子: "水", 亥: "水",
  寅: "木", 卯: "木",
  巳: "火", 午: "火",
  申: "金", 酉: "金",
  辰: "土", 戌: "土", 丑: "土", 未: "土",
};

export const GAN_WUXING: Record<Gan, Wuxing> = {
  甲: "木", 乙: "木",
  丙: "火", 丁: "火",
  戊: "土", 己: "土",
  庚: "金", 辛: "金",
  壬: "水", 癸: "水",
};

export const GAN_YINYANG: Record<Gan, "阳" | "阴"> = {
  甲: "阳", 丙: "阳", 戊: "阳", 庚: "阳", 壬: "阳",
  乙: "阴", 丁: "阴", 己: "阴", 辛: "阴", 癸: "阴",
};

export const ZHI_YINYANG: Record<Zhi, "阳" | "阴"> = {
  子: "阳", 寅: "阳", 辰: "阳", 午: "阳", 申: "阳", 戌: "阳",
  丑: "阴", 卯: "阴", 巳: "阴", 未: "阴", 酉: "阴", 亥: "阴",
};

export const KE_MAP: Record<Wuxing, Wuxing> = {
  木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
};

export const SHENG_MAP: Record<Wuxing, Wuxing> = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};

export function wuxingOfZhi(zhi: string): Wuxing {
  return ZHI_WUXING[zhi as Zhi];
}

export function wuxingOfGan(gan: string): Wuxing {
  return GAN_WUXING[gan as Gan];
}

export function isKe(a: Wuxing, b: Wuxing): boolean {
  return KE_MAP[a] === b;
}

export function zhiIndex(zhi: string): number {
  return ZHI.indexOf(zhi as Zhi);
}

export function ganIndex(gan: string): number {
  return GAN.indexOf(gan as Gan);
}

export function zhiByOffset(zhi: string, offset: number): Zhi {
  const i = zhiIndex(zhi);
  return ZHI[(i + offset + 1200) % 12];
}

export function isChong(a: string, b: string): boolean {
  return (zhiIndex(a) + 6) % 12 === zhiIndex(b);
}

export const LIUQIN_LABEL: Record<string, string> = {
  父母: "父母",
  兄弟: "兄弟",
  子孙: "子孙",
  妻财: "妻财",
  官鬼: "官鬼",
};

export function liuqinOf(self: Wuxing, other: Wuxing): "父母" | "兄弟" | "子孙" | "妻财" | "官鬼" {
  if (self === other) return "兄弟";
  if (SHENG_MAP[other] === self) return "父母";
  if (SHENG_MAP[self] === other) return "子孙";
  if (KE_MAP[self] === other) return "妻财";
  return "官鬼";
}

export const LIU_SHEN = ["青龙", "朱雀", "勾陈", "螣蛇", "白虎", "玄武"] as const;

export function liuShenStart(dayGan: string): number {
  const g = dayGan as Gan;
  if (g === "甲" || g === "乙") return 0;
  if (g === "丙" || g === "丁") return 1;
  if (g === "戊") return 2;
  if (g === "己") return 3;
  if (g === "庚" || g === "辛") return 4;
  return 5;
}

export const TONE_MODES = ["default", "harsh", "sweet"] as const;
export type ToneMode = (typeof TONE_MODES)[number];

export const TONE_LABEL: Record<ToneMode, string> = {
  default: "恭肃",
  harsh: "直断",
  sweet: "温言",
};

export function tonePrompt(mode: ToneMode): string {
  if (mode === "harsh") {
    return "【直断】语言必须直白尖锐、一针见血，不委婉、不安慰，把吉凶与时机说透。";
  }
  if (mode === "sweet") {
    return "【温言】多讲转机、优势与可为之机，指出问题时用温和而具体的方式。";
  }
  return "请用专业、克制、有据的古典术数口吻断事，吉凶分明，避免空泛套话。";
}
