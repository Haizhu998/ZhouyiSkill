import { getPillarTime, isDayGui, type PillarTime } from "./calendar";
import {
  GAN,
  ZHI,
  isChong,
  isKe,
  wuxingOfGan,
  wuxingOfZhi,
  zhiByOffset,
  zhiIndex,
  type Gan,
  type ToneMode,
  type Wuxing,
  type Zhi,
} from "./constants";

export const GAN_LU: Record<Gan, Zhi> = {
  甲: "寅",
  乙: "辰",
  丙: "巳",
  丁: "未",
  戊: "巳",
  己: "未",
  庚: "申",
  辛: "戌",
  壬: "亥",
  癸: "丑",
};

export const TIANJIANG = ["贵人", "螣蛇", "朱雀", "六合", "勾陈", "青龙", "天空", "白虎", "太常", "玄武", "太阴", "天后"] as const;

export const GUI_REN: Record<Gan, [Zhi, Zhi]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  壬: ["巳", "卯"],
  癸: ["巳", "卯"],
  辛: ["午", "寅"],
};

export const ZHI_JIANG: Record<Zhi, string> = {
  子: "神后",
  丑: "大吉",
  寅: "功曹",
  卯: "太冲",
  辰: "天罡",
  巳: "太乙",
  午: "胜光",
  未: "小吉",
  申: "传送",
  酉: "从魁",
  戌: "河魁",
  亥: "登明",
};

export type Ke = {
  label: string;
  upper: Zhi;
  lower: string;
  upperJiang: string;
  relation: "下贼上" | "上克下" | "比和" | "下生上" | "上生下";
};

export type SanChuanSlot = {
  label: "初传" | "中传" | "末传";
  zhi: Zhi;
  jiang: string;
  tianjiang: string;
};

export type DaLiuRenChart = {
  kind: "luren";
  question: string;
  toneMode: ToneMode;
  time: PillarTime;
  yueJiang: Zhi;
  yueJiangName: string;
  zhanshi: Zhi;
  dipan: Zhi[];
  tianpan: Zhi[];
  tianjiangOnTian: string[];
  guiRen: Zhi;
  guiShun: boolean;
  sike: Ke[];
  sanchuan: SanChuanSlot[];
  method: string;
  dun: "伏吟" | "返吟" | "连茹" | "普通";
  summary: string;
};

function heGanLu(gan: Gan): Zhi {
  const HE: Record<Gan, Gan> = {
    甲: "己",
    乙: "庚",
    丙: "辛",
    丁: "壬",
    戊: "癸",
    己: "甲",
    庚: "乙",
    辛: "丙",
    壬: "丁",
    癸: "戊",
  };
  return GAN_LU[HE[gan]];
}

function rel(upper: Zhi, lower: string): Ke["relation"] {
  const lowerWx = GAN.includes(lower as Gan) ? wuxingOfGan(lower) : wuxingOfZhi(lower);
  const u = wuxingOfZhi(upper);
  if (u === lowerWx) return "比和";
  if (isKe(lowerWx, u)) return "下贼上";
  if (isKe(u, lowerWx)) return "上克下";
  const SHENG: Record<Wuxing, Wuxing> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  if (SHENG[lowerWx] === u) return "下生上";
  if (SHENG[u] === lowerWx) return "上生下";
  return "比和";
}

function buildTianpan(yueJiang: Zhi, zhanshi: Zhi): Zhi[] {
  const earth = zhiIndex(zhanshi);
  const start = zhiIndex(yueJiang);
  const pan: Zhi[] = Array.from({ length: 12 }, () => "子");
  for (let i = 0; i < 12; i++) {
    pan[(earth + i) % 12] = ZHI[(start + i) % 12];
  }
  return pan;
}

function shangShen(tianpan: Zhi[], earth: string): Zhi {
  return tianpan[zhiIndex(earth)];
}

function yangOf(zhi: Zhi): boolean {
  return zhiIndex(zhi) % 2 === 0;
}

function ganYang(gan: Gan): boolean {
  return GAN.indexOf(gan) % 2 === 0;
}

function uniqueKeUppers(kes: Ke[]): Zhi[] {
  const seen = new Set<string>();
  const out: Zhi[] = [];
  for (const k of kes) {
    if (!seen.has(k.upper)) {
      seen.add(k.upper);
      out.push(k.upper);
    }
  }
  return out;
}

function takeBi(candidates: Zhi[], dayGan: Gan): Zhi[] {
  const wantYang = ganYang(dayGan);
  const matched = candidates.filter((z) => yangOf(z) === wantYang);
  return matched.length ? matched : candidates;
}

function sheHaiDepth(upper: Zhi, tianpan: Zhi[]): number {
  const wx = wuxingOfZhi(upper);
  const start = zhiIndex(upper);
  let depth = 0;
  for (let i = 0; i < 12; i++) {
    const earth = ZHI[(start + i) % 12];
    if (isKe(wx, wuxingOfZhi(earth))) depth++;
    const sky = tianpan[(start + i) % 12];
    if (sky === upper && i > 0) break;
  }
  return depth;
}

function chuZhongMo(chu: Zhi, tianpan: Zhi[]): [Zhi, Zhi, Zhi] {
  const zhong = shangShen(tianpan, chu);
  const mo = shangShen(tianpan, zhong);
  return [chu, zhong, mo];
}

function pickSanChuan(
  sike: Ke[],
  tianpan: Zhi[],
  dayGan: Gan,
  dayZhi: Zhi,
  dun: DaLiuRenChart["dun"],
): { slots: [Zhi, Zhi, Zhi]; method: string } {
  if (dun === "伏吟") {
    const first = sike[0].upper;
    if (first === "子" || first === "午") {
      return { slots: [first, dayZhi, shangShen(tianpan, dayZhi)], method: "伏吟杜传" };
    }
    const zhong = zhiByOffset(first, 4);
    const mo = zhiByOffset(first, 8);
    if (sike.some((k) => k.relation === "下贼上" || k.relation === "上克下")) {
      const keFirst = uniqueKeUppers(sike.filter((k) => k.relation === "下贼上" || k.relation === "上克下"));
      const chu = takeBi(keFirst, dayGan)[0];
      return { slots: chuZhongMo(chu, tianpan), method: "伏吟贼克" };
    }
    return { slots: [first, zhong, mo], method: "伏吟自传" };
  }

  const zei = uniqueKeUppers(sike.filter((k) => k.relation === "下贼上"));
  const keShang = uniqueKeUppers(sike.filter((k) => k.relation === "上克下"));

  const takeFrom = (cands: Zhi[], method: string): { slots: [Zhi, Zhi, Zhi]; method: string } | null => {
    if (cands.length === 0) return null;
    if (cands.length === 1) return { slots: chuZhongMo(cands[0], tianpan), method };
    const bi = takeBi(cands, dayGan);
    if (bi.length === 1) return { slots: chuZhongMo(bi[0], tianpan), method: method + "·比用" };
    let best = bi[0];
    let bestD = -1;
    for (const z of bi) {
      const d = sheHaiDepth(z, tianpan);
      if (d > bestD) {
        bestD = d;
        best = z;
      }
    }
    return { slots: chuZhongMo(best, tianpan), method: method + "·涉害" };
  };

  const zeiHit = takeFrom(zei, "重审（下贼上）");
  if (zeiHit) return zeiHit;
  const keHit = takeFrom(keShang, "元首（上克下）");
  if (keHit) return keHit;

  const ganWx = wuxingOfGan(dayGan);
  const yao = uniqueKeUppers(
    sike.slice(1, 3).filter((k) => {
      const u = wuxingOfZhi(k.upper);
      return isKe(u, ganWx) || isKe(ganWx, u);
    }),
  );
  if (yao.length) {
    const bi = takeBi(yao, dayGan);
    return { slots: chuZhongMo(bi[0], tianpan), method: "遥克" };
  }

  const uniqueUppers = uniqueKeUppers(sike);
  if (uniqueUppers.length <= 3) {
    const chu = ganYang(dayGan) ? heGanLu(dayGan) : zhiByOffset(dayZhi, 3);
    const zhong = sike[0].upper;
    const mo = sike[2].upper;
    return { slots: [chu, zhong, mo], method: "别责" };
  }

  if (GAN_LU[dayGan] === dayZhi) {
    const chu = ganYang(dayGan) ? zhiByOffset(sike[0].upper, 3) : zhiByOffset(sike[3].upper, -3);
    return { slots: chuZhongMo(chu, tianpan), method: "八专" };
  }

  if (dun === "返吟") {
    const you = "酉" as Zhi;
    const chu = ganYang(dayGan) ? shangShen(tianpan, you) : you;
    return { slots: chuZhongMo(chu, tianpan), method: "返吟无依（井栏射）" };
  }

  const you = "酉" as Zhi;
  const chu = ganYang(dayGan) ? shangShen(tianpan, you) : tianpan.find((z, i) => ZHI[i] === shangShen(tianpan, you)) ?? you;
  const zhi = ganYang(dayGan) ? sike[2].upper : sike[0].upper;
  const mo = ganYang(dayGan) ? sike[0].upper : sike[2].upper;
  return { slots: [chu, zhi, mo], method: "昴星" };
}

function attachJiang(tianpan: Zhi[], gui: Zhi, shun: boolean): string[] {
  const start = tianpan.indexOf(gui);
  const out = Array.from({ length: 12 }, () => "");
  for (let i = 0; i < 12; i++) {
    const idx = shun ? (start + i) % 12 : (start - i + 12) % 12;
    out[idx] = TIANJIANG[i];
  }
  return out;
}

export function castDaLiuRen(input: {
  question: string;
  date: Date;
  toneMode?: ToneMode;
}): DaLiuRenChart {
  const time = getPillarTime(input.date);
  const yueJiang = time.yueJiang;
  const zhanshi = time.timeZhi;
  const tianpan = buildTianpan(yueJiang, zhanshi);
  const dipan = [...ZHI];

  const dayGan = time.dayGan;
  const dayZhi = time.dayZhi;
  const ganLu = GAN_LU[dayGan];

  const k1u = shangShen(tianpan, ganLu);
  const k2u = shangShen(tianpan, k1u);
  const k3u = shangShen(tianpan, dayZhi);
  const k4u = shangShen(tianpan, k3u);

  const sikeRaw: Array<{ label: string; upper: Zhi; lower: string }> = [
    { label: "一课", upper: k1u, lower: dayGan },
    { label: "二课", upper: k2u, lower: k1u },
    { label: "三课", upper: k3u, lower: dayZhi },
    { label: "四课", upper: k4u, lower: k3u },
  ];

  const day = isDayGui(zhanshi);
  const gui = GUI_REN[dayGan][day ? 0 : 1];
  const guiEarth = tianpan.findIndex((z) => z === gui);
  const shun = guiEarth >= 0 && guiEarth <= 5;
  const tianjiangOnTian = attachJiang(tianpan, gui, shun);

  const sike: Ke[] = sikeRaw.map((k) => ({
    ...k,
    upperJiang: ZHI_JIANG[k.upper],
    relation: rel(k.upper, k.lower),
  }));

  let dun: DaLiuRenChart["dun"] = "普通";
  if (yueJiang === zhanshi) dun = "伏吟";
  else if (isChong(yueJiang, zhanshi)) dun = "返吟";

  const picked = pickSanChuan(sike, tianpan, dayGan, dayZhi, dun);
  const labels: SanChuanSlot["label"][] = ["初传", "中传", "末传"];
  const sanchuan: SanChuanSlot[] = picked.slots.map((zhi, i) => ({
    label: labels[i],
    zhi,
    jiang: ZHI_JIANG[zhi],
    tianjiang: tianjiangOnTian[tianpan.indexOf(zhi)] || "",
  }));

  const tianpanText = dipan.map((d, i) => `${d}上${tianpan[i]}`).join("  ");
  const summary = `${time.lunarText}。月将${yueJiang}${time.yueJiangName}加${zhanshi}时，日辰${time.dayGanzhi}。四课：${sike.map((k) => `${k.upper}加${k.lower}`).join("，")}。三传${sanchuan.map((s) => s.zhi).join("→")}，取法${picked.method}。贵人${gui}（${day ? "昼" : "夜"}，${shun ? "顺" : "逆"}行）。`;

  return {
    kind: "luren",
    question: input.question.trim(),
    toneMode: input.toneMode ?? "default",
    time,
    yueJiang,
    yueJiangName: time.yueJiangName,
    zhanshi,
    dipan,
    tianpan,
    tianjiangOnTian,
    guiRen: gui,
    guiShun: shun,
    sike,
    sanchuan,
    method: picked.method,
    dun,
    summary: `${summary} 天盘：${tianpanText}`,
  };
}
