// JS functions exposed to mahoraga expressions

const DAY = 86_400_000;
const num = (x: unknown) => (typeof x === "number" ? x : 0);

export function makeFns(now: Date) {
  return {
    scale: (
      x: number,
      inLo: number,
      inHi: number,
      outLo: number,
      outHi: number,
    ) => {
      const t = Math.min(1, Math.max(0, (num(x) - inLo) / (inHi - inLo)));
      return outLo + t * (outHi - outLo);
    },

    sigmoid: (x: number, mid: number, k: number) =>
      1 / (1 + Math.exp(-k * (num(x) - mid))),

    step: (x: number, thresholds: number[], scores: number[]) =>
      scores[thresholds.filter((t) => num(x) >= t).length],

    decay: (days: number, halfLife: number) =>
      Math.pow(0.5, num(days) / halfLife),

    contains: (s: string, sub: string) =>
      String(s ?? "")
        .toLowerCase()
        .includes(sub.toLowerCase()),

    round: (x: number, digits: number) => Number(num(x).toFixed(digits)),

    days_since: (date: string) =>
      date ? (now.getTime() - new Date(date).getTime()) / DAY : null,

    years_since: (date: string) =>
      date ? (now.getTime() - new Date(date).getTime()) / (365.25 * DAY) : null,
  };
}
