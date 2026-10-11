import { type FactIdent, staticFacts } from "mahoraga-js";
import type * as Monaco from "monaco-editor";
import { LANG } from "./language";
import { STDLIB } from "./stdlib";

export type ExprCtx = {
  input: Record<string, unknown>;
  // values of the rows above, visible as `prev_risks`
  prevRisks: Record<string, number>;
  // JS functions passed to evaluate
  fns: Record<string, (...args: any[]) => unknown>;
};

// per-model context, keyed by model uri; filled by ExprEditor
export const exprCtx = new Map<string, ExprCtx>();

// stands in for the word being typed, so an incomplete `ul.` still parses
const CURSOR = "__cursor__";

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const scopeOf = (ctx: ExprCtx): Record<string, unknown> => ({
  ...ctx.input,
  prev_risks: ctx.prevRisks,
});

function facts(expr: string) {
  try {
    return staticFacts(expr);
  } catch {
    return null;
  }
}

const contains = (ident: FactIdent, offset: number) =>
  ident.span[0] <= offset && offset <= ident.span[1];

// Walks `path` through the scope; undefined once a segment is missing
function resolve(scope: Record<string, unknown>, path: FactIdent[]) {
  let cur: unknown = scope;
  for (const { name } of path) {
    if (!isObject(cur) && !Array.isArray(cur)) return undefined;
    cur = (cur as Record<string, unknown>)[name];
  }
  return cur;
}

export function registerCompletion(monaco: typeof Monaco) {
  const Kind = monaco.languages.CompletionItemKind;

  monaco.languages.registerCompletionItemProvider(LANG, {
    triggerCharacters: ["."],
    provideCompletionItems(model, position) {
      const ctx = exprCtx.get(model.uri.toString());
      if (!ctx) return { suggestions: [] };
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      // let mahoraga find the access chain the cursor is in
      const text = model.getValue();
      const offset = model.getOffsetAt(position);
      const parsed = facts(text.slice(0, offset) + CURSOR + text.slice(offset));
      if (!parsed) return { suggestions: [] };

      const scope = scopeOf(ctx);
      const path = parsed.paths.find((p) =>
        p.slice(1).some((seg) => contains(seg, offset)),
      );
      if (path) {
        const at = path.findIndex((seg) => contains(seg, offset));
        const parent = resolve(scope, path.slice(0, at));
        if (!isObject(parent)) return { suggestions: [] };
        return {
          suggestions: Object.keys(parent).map((k) => ({
            label: k,
            kind: Kind.Field,
            insertText: k,
            range,
          })),
        };
      }

      return {
        suggestions: [
          ...Object.keys(scope).map((k) => ({
            label: k,
            kind: Kind.Variable,
            insertText: k,
            range,
          })),
          ...[...Object.keys(ctx.fns), ...Object.keys(STDLIB)].map((name) => ({
            label: name,
            kind: Kind.Function,
            detail: STDLIB[name]?.sig,
            documentation: STDLIB[name]?.doc,
            insertText: name,
            range,
          })),
        ],
      };
    },
  });

  monaco.languages.registerHoverProvider(LANG, {
    provideHover(model, position) {
      const ctx = exprCtx.get(model.uri.toString());
      const parsed = facts(model.getValue());
      if (!ctx || !parsed) return null;
      const offset = model.getOffsetAt(position);
      for (const path of parsed.paths) {
        const at = path.findIndex((seg) => contains(seg, offset));
        if (at === -1) continue;
        const value = resolve(scopeOf(ctx), path.slice(0, at + 1));
        const [start, end] = path[at].span;
        return {
          range: monaco.Range.fromPositions(
            model.getPositionAt(start),
            model.getPositionAt(end),
          ),
          contents: [
            {
              value: `\`\`\`json\n${JSON.stringify(value, null, 2) ?? "void"}\n\`\`\``,
            },
          ],
        };
      }
      return null;
    },
  });
}
