export const FORMATTING_NAME_LIST = [
  "bold",
  "italic",
  "strike-through",
  "underline",
] as const;

export const FORMATTING_STYLE: Record<FormattingT, `${string}:${string};`> = {
  bold: "font-weight:bold;",
  italic: "font-style:italic;",
  "strike-through": "text-decoration-line:line-through;",
  underline: "border-bottom:0.05em solid;",
};

export type FormattingT = (typeof FORMATTING_NAME_LIST)[number];
