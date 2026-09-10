import * as LunarJS from "lunar-javascript";
import { ZHI, ZHI_NUM, type Gan, type Zhi } from "./constants";

const Solar =
  (LunarJS as { Solar?: { fromYmdHms: typeof solarFrom } }).Solar ??
  (LunarJS as { default?: { Solar: { fromYmdHms: typeof solarFrom } } }).default?.Solar;

type LunarLike = {
  getYear(): number;
  getMonth(): number;
  getDay(): number;
  getYearGan(): string;
  getYearZhi(): string;
  getMonthGan(): string;
  getMonthZhi(): string;
  getDayGan(): string;
  getDayZhi(): string;
  getTimeGan(): string;
  getTimeZhi(): string;
  getYearInGanZhi(): string;
  getMonthInGanZhi(): string;
  getDayInGanZhi(): string;
  getTimeInGanZhi(): string;
  getMonthInChinese(): string;
  getDayInChinese(): string;
  getPrevJieQi(wholeDay?: boolean): { getName(): string };
};

type SolarLike = {
  fromYmdHms: (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
  ) => { getLunar(): LunarLike };
};

function solarFrom(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
): { getLunar(): LunarLike } {
  void year;
  void month;
  void day;
  void hour;
  void minute;
  void second;
  throw new Error("unreachable");
}

if (!Solar) {
  throw new Error("lunar-javascript Solar export missing");
}

const SolarAPI = Solar as SolarLike;

export type PillarTime = {
  date: Date;
  solarText: string;
  lunarText: string;
  yearGan: Gan;
  yearZhi: Zhi;
  monthGan: Gan;
  monthZhi: Zhi;
  dayGan: Gan;
  dayZhi: Zhi;
  timeGan: Gan;
  timeZhi: Zhi;
  yearGanzhi: string;
  monthGanzhi: string;
  dayGanzhi: string;
  timeGanzhi: string;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  lunarMonthName: string;
  lunarDayName: string;
  yearZhiNum: number;
  monthNum: number;
  dayNum: number;
  timeZhiNum: number;
  jieQi: string;
  yueJiang: Zhi;
  yueJiangName: string;
};

const YUE_JIANG_BY_JIEQI: Record<string, { zhi: Zhi; name: string }> = {
  大寒: { zhi: "子", name: "神后" },
  立春: { zhi: "子", name: "神后" },
  雨水: { zhi: "亥", name: "登明" },
  惊蛰: { zhi: "亥", name: "登明" },
  春分: { zhi: "戌", name: "河魁" },
  清明: { zhi: "戌", name: "河魁" },
  谷雨: { zhi: "酉", name: "从魁" },
  立夏: { zhi: "酉", name: "从魁" },
  小满: { zhi: "申", name: "传送" },
  芒种: { zhi: "申", name: "传送" },
  夏至: { zhi: "未", name: "小吉" },
  小暑: { zhi: "未", name: "小吉" },
  大暑: { zhi: "午", name: "胜光" },
  立秋: { zhi: "午", name: "胜光" },
  处暑: { zhi: "巳", name: "太乙" },
  白露: { zhi: "巳", name: "太乙" },
  秋分: { zhi: "辰", name: "天罡" },
  寒露: { zhi: "辰", name: "天罡" },
  霜降: { zhi: "卯", name: "太冲" },
  立冬: { zhi: "卯", name: "太冲" },
  小雪: { zhi: "寅", name: "功曹" },
  大雪: { zhi: "寅", name: "功曹" },
  冬至: { zhi: "丑", name: "大吉" },
  小寒: { zhi: "丑", name: "大吉" },
};

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatTimeInput(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function parseInquiryTime(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
}

export function nowInquiry(): { date: string; time: string } {
  const d = new Date();
  return { date: formatDateInput(d), time: formatTimeInput(d) };
}

export function resolveYueJiang(jieQiName: string): { zhi: Zhi; name: string } {
  return YUE_JIANG_BY_JIEQI[jieQiName] ?? { zhi: "子", name: "神后" };
}

export function getPillarTime(when: Date): PillarTime {
  const solar = SolarAPI.fromYmdHms(
    when.getFullYear(),
    when.getMonth() + 1,
    when.getDate(),
    when.getHours(),
    when.getMinutes(),
    when.getSeconds(),
  );
  const lunar = solar.getLunar();
  const jieQi = lunar.getPrevJieQi(true)?.getName?.() ?? "";
  const yue = resolveYueJiang(jieQi);
  const yearZhi = lunar.getYearZhi() as Zhi;
  const timeZhi = lunar.getTimeZhi() as Zhi;
  const lunarMonth = Math.abs(lunar.getMonth());

  return {
    date: when,
    solarText: `${when.getFullYear()}年${when.getMonth() + 1}月${when.getDate()}日 ${pad2(when.getHours())}:${pad2(when.getMinutes())}`,
    lunarText: `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
    yearGan: lunar.getYearGan() as Gan,
    yearZhi,
    monthGan: lunar.getMonthGan() as Gan,
    monthZhi: lunar.getMonthZhi() as Zhi,
    dayGan: lunar.getDayGan() as Gan,
    dayZhi: lunar.getDayZhi() as Zhi,
    timeGan: lunar.getTimeGan() as Gan,
    timeZhi,
    yearGanzhi: lunar.getYearInGanZhi(),
    monthGanzhi: lunar.getMonthInGanZhi(),
    dayGanzhi: lunar.getDayInGanZhi(),
    timeGanzhi: lunar.getTimeInGanZhi(),
    lunarYear: lunar.getYear(),
    lunarMonth,
    lunarDay: lunar.getDay(),
    lunarMonthName: lunar.getMonthInChinese(),
    lunarDayName: lunar.getDayInChinese(),
    yearZhiNum: ZHI_NUM[yearZhi],
    monthNum: lunarMonth,
    dayNum: lunar.getDay(),
    timeZhiNum: ZHI_NUM[timeZhi],
    jieQi,
    yueJiang: yue.zhi,
    yueJiangName: yue.name,
  };
}

export function isDayGui(timeZhi: Zhi): boolean {
  const i = ZHI.indexOf(timeZhi);
  return i >= 3 && i <= 8;
}
