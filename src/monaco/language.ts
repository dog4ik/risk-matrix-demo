import type * as Monaco from "monaco-editor";

export const LANG = "mahoraga";

export function registerMahoraga(monaco: typeof Monaco) {
  monaco.languages.register({ id: LANG });

  monaco.languages.setLanguageConfiguration(LANG, {
    brackets: [
      ["(", ")"],
      ["[", "]"],
      ["{", "}"],
    ],
    autoClosingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: "{", close: "}" },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ["string"] },
    ],
    surroundingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  });

  monaco.languages.setMonarchTokensProvider(LANG, {
    keywords: ["true", "false", "null", "void"],
    tokenizer: {
      root: [
        [
          /[A-Za-z_]\w*(?=\s*\()/,
          {
            cases: {
              "@keywords": "keyword",
              "@default": "entity.name.function",
            },
          },
        ],
        [
          /[A-Za-z_]\w*/,
          { cases: { "@keywords": "keyword", "@default": "identifier" } },
        ],
        [/\d[\d_]*\.\d+([eE][-+]?\d+)?/, "number.float"],
        [/\d[\d_]*/, "number"],
        [/"/, "string", "@dstring"],
        [/'/, "string", "@sstring"],
        [/\|\||&&|==|!=|<=|>=|\?\?/, "operator"],
        [/[|+\-*/<>!?:]/, "operator"],
        [/[()[\]{}]/, "@brackets"],
        [/[.,]/, "delimiter"],
        [/\s+/, "white"],
      ],
      dstring: [
        [/\\./, "string.escape"],
        [/"/, "string", "@pop"],
        [/[^"\\]+/, "string"],
      ],
      sstring: [
        [/\\./, "string.escape"],
        [/'/, "string", "@pop"],
        [/[^'\\]+/, "string"],
      ],
    },
  } as Monaco.languages.IMonarchLanguage);
}
