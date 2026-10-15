import { type FactIdent, type StaticFacts, staticFacts } from "mahoraga-js";

export function getPaths(expr: string) {
  try {
    return staticFacts(expr);
  } catch (e) {
    console.error(e);
    return { paths: [], calls: [], roots: [] } as StaticFacts;
  }
}

export function dottedPath(path: FactIdent[]) {
  return path.map((p) => p.name).join(".");
}

export function uniquePaths(expr: string) {
  const seen = new Map<string, string[]>();
  for (const p of getPaths(expr).paths) {
    seen.set(
      dottedPath(p),
      p.map((s) => s.name),
    );
  }
  return [...seen.entries()].map(([dotted, segments]) => ({
    dotted,
    segments,
  }));
}

const isContainer = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export function getPath(obj: unknown, path: string[]): unknown {
  let cur = obj;
  for (const key of path) {
    if (!isContainer(cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

// "ul.registrationDate" -> ["ul", "registrationDate"], undefined if any segment is blank
export function parseDotted(path: string): string[] | undefined {
  const segments = path.split(".").map((s) => s.trim());
  return segments.every((s) => s !== "") ? segments : undefined;
}
