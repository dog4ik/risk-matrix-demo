import { staticFacts, type FactIdent, type StaticFacts } from "mahoraga-js";

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
