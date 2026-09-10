import { getPillarTime, type PillarTime } from "./calendar";
import {
  LIU_SHEN,
  liuShenStart,
  liuqinOf,
  wuxingOfZhi,
  type ToneMode,
  type Wuxing,
} from "./constants";
import {
  HEXAGRAMS,
  LINE_NAMES,
  TRIGRAMS,
  bitsToTrigram,
  hexagramFromBits,
  lineTitle,
  palaceOf,
  trigramByXiantian,
  type Hexagram,
  type LineBit,
  type PalaceInfo,
} from "./hexagrams";

export type YaoValue = 6 | 7 | 8 | 9;

export type YaoLine = {
  index: number;
  name: string;
  title: string;
  value: YaoValue;
  yang: boolean;
  changing: boolean;
  label: string;
  ganzhi: string;
  wuxing: Wuxing;
  liuqin: ReturnType<typeof liuqinOf>;
  liushen: string;
  isShi: boolean;
  isYing: boolean;
  yaoci: string;
};

export type LiuYaoChart = {
  kind: "liuyao";
  method: "time" | "coin";
  question: string;
  toneMode: ToneMode;
  time: PillarTime;
  tosses: YaoValue[];
  bengua: Hexagram;
  biangua: Hexagram | null;
  palace: PalaceInfo;
  yongshen: string;
  lines: YaoLine[];
  changedLines: YaoLine[];
  summary: string;
};

const YAO_LABEL: Record<YaoValue, string> = {
  6: "老阴",
  7: "少阳",
  8: "少阴",
  9: "老阳",
};

export function tossOne(): YaoValue {
  const a = Math.random() > 0.5 ? 3 : 2;
  const b = Math.random() > 0.5 ? 3 : 2;
  const c = Math.random() > 0.5 ? 3 : 2;
  return (a + b + c) as YaoValue;
}

export function tossSix(): YaoValue[] {
  return [tossOne(), tossOne(), tossOne(), tossOne(), tossOne(), tossOne()];
}

function yaoToBit(v: YaoValue): LineBit {
  return v === 7 || v === 9 ? 1 : 0;
}

function yaoChanging(v: YaoValue): boolean {
  return v === 6 || v === 9;
}

function timeTosses(p: PillarTime): YaoValue[] {
  const upperN = p.yearZhiNum + p.monthNum + p.dayNum;
  const lowerN = upperN + p.timeZhiNum;
  const upper = trigramByXiantian(upperN);
  const lower = trigramByXiantian(lowerN);
  const bits: LineBit[] = [...lower.bits, ...upper.bits];
  const moving = lowerN % 6 === 0 ? 5 : (lowerN % 6) - 1;
  return bits.map((bit, i) => {
    if (bit === 1) return i === moving ? 9 : 7;
    return i === moving ? 6 : 8;
  });
}

function naijiaFor(bits: LineBit[]): string[] {
  const lower = bitsToTrigram([bits[0], bits[1], bits[2]]);
  const upper = bitsToTrigram([bits[3], bits[4], bits[5]]);
  return [...TRIGRAMS[lower.key].naijiaInner, ...TRIGRAMS[upper.key].naijiaOuter];
}

export function pickYongshen(question: string): string {
  const q = question;
  if (/婚|恋|桃花|对象|感情|配偶|夫妻/.test(q)) return "妻财";
  if (/财|钱|生意|投资|买卖|求财|合同/.test(q)) return "妻财";
  if (/官|升|职|考试|功名|仕|诉讼|官司/.test(q)) return "官鬼";
  if (/病|疾|健康|医|治疗/.test(q)) return "子孙";
  if (/子|孕|生育|孩子/.test(q)) return "子孙";
  if (/宅|房|家|迁|文书|父母/.test(q)) return "父母";
  if (/兄弟|朋友|合伙|竞争/.test(q)) return "兄弟";
  return "世爻";
}

function yongshenNote(yong: string, lines: YaoLine[]): string {
  if (yong === "世爻") {
    const shi = lines.find((l) => l.isShi);
    return `以世爻（${shi?.title}${shi?.liuqin}${shi?.ganzhi}）为用`;
  }
  const hits = lines.filter((l) => l.liuqin === yong);
  if (hits.length === 0) return `用神取${yong}（本卦伏藏，需参伏神）`;
  return `用神取${yong}：${hits.map((h) => `${h.title}${h.ganzhi}`).join("、")}`;
}

export function castLiuYao(input: {
  question: string;
  date: Date;
  method: "time" | "coin";
  tosses?: YaoValue[];
  toneMode?: ToneMode;
}): LiuYaoChart {
  const time = getPillarTime(input.date);
  const tosses =
    input.method === "coin" && input.tosses && input.tosses.length === 6
      ? input.tosses
      : timeTosses(time);

  const bits = tosses.map(yaoToBit) as Hexagram["bits"];
  const changedBits = tosses.map((v, i) => {
    if (!yaoChanging(v)) return bits[i];
    return bits[i] === 1 ? 0 : 1;
  }) as Hexagram["bits"];

  const bengua = hexagramFromBits(bits);
  const hasChange = tosses.some(yaoChanging);
  const biangua = hasChange ? hexagramFromBits(changedBits) : null;
  const palace = palaceOf(bits);
  const naijia = naijiaFor(bits);
  const shenStart = liuShenStart(time.dayGan);
  const yongshen = pickYongshen(input.question);

  const lines: YaoLine[] = tosses.map((value, index) => {
    const yang = yaoToBit(value) === 1;
    const ganzhi = naijia[index];
    const zhi = ganzhi.slice(-1);
    const wuxing = wuxingOfZhi(zhi);
    return {
      index,
      name: LINE_NAMES[index],
      title: lineTitle(index, yang),
      value,
      yang,
      changing: yaoChanging(value),
      label: YAO_LABEL[value],
      ganzhi,
      wuxing,
      liuqin: liuqinOf(palace.palaceWuxing, wuxing),
      liushen: LIU_SHEN[(shenStart + index) % 6],
      isShi: index === palace.shi,
      isYing: index === palace.ying,
      yaoci: bengua.lines[index],
    };
  });

  const changedLines = lines.filter((l) => l.changing);
  const movingText =
    changedLines.length === 0
      ? "六爻安静，以卦辞及世爻为主。"
      : `动爻：${changedLines.map((l) => `${l.title}${l.label}`).join("、")}。`;

  const summary = `${time.lunarText}，${input.method === "coin" ? "铜钱摇卦" : "时间起卦"}得${bengua.alias}${bengua.name}之${biangua ? biangua.alias + biangua.name : "不变"}。${palace.palace}宫${palace.generationName}，世在${LINE_NAMES[palace.shi]}，应在${LINE_NAMES[palace.ying]}。${movingText}${yongshenNote(yongshen, lines)}。`;

  return {
    kind: "liuyao",
    method: input.method,
    question: input.question.trim(),
    toneMode: input.toneMode ?? "default",
    time,
    tosses,
    bengua,
    biangua,
    palace,
    yongshen,
    lines,
    changedLines,
    summary,
  };
}

export { YAO_LABEL };
