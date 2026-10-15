import type { Engine } from "mahoraga-js";

export type Outcome =
  | { ok: true; value: unknown }
  | { ok: false; error: unknown };

// `prev_risks` differs per field, so it is set before every evaluation
export function evaluateField(
  engine: Engine,
  expr: string,
  prevRisks: Record<string, unknown>,
) {
  engine.setEnv(["prev_risks"], prevRisks);
  return engine.evaluate(expr);
}

// Evaluates `expr` once per value put at `path`, then restores the path's
// top-level value to `originalRoot` (a missing key and void are the same).
export function evaluateEach(
  engine: Engine,
  expr: string,
  prevRisks: Record<string, unknown>,
  path: string[],
  originalRoot: unknown,
  values: unknown[],
): Outcome[] {
  engine.setEnv(["prev_risks"], prevRisks);
  console.time("eval_each");
  let output: Outcome[] = [];
  try {
    for (let value of values) {
      try {
        engine.setEnv(path, value);
        output.push({ ok: true, value: engine.evaluate(expr) });
      } catch (error) {
        output.push({ ok: false, error });
      }
    }
    return output;
  } finally {
    engine.setEnv(path.slice(0, 1), originalRoot);
    console.timeEnd("eval_each");
  }
}
