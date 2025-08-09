export type BgColorFormattingT = `bg-${string}`;
export type TextColorFormattingT = `color-${string}`;

export const TEXT_COLOR_FORMATTING_NAME_LIST: TextColorFormattingT[] = [
  "color-gray",
  "color-green",
  "color-blue",
  "color-pink",
  "color-red",
  "color-orange",
  "color-purple",
  "color-yellow",
  "color-cyan",
] as const;

export const BG_COLOR_FORMATTING_NAME_LIST: BgColorFormattingT[] = [
  "bg-gray",
  "bg-green",
  "bg-blue",
  "bg-pink",
  "bg-red",
  "bg-orange",
  "bg-purple",
  "bg-yellow",
  "bg-cyan",
] as const;

export const TEXT_FORMATTING_NAME_LIST = [
  "bold",
  "italic",
  "strike-through",
  "underline",
] as const;

export const FORMATTING_NAME_LIST = [
  ...TEXT_FORMATTING_NAME_LIST,
  ...TEXT_COLOR_FORMATTING_NAME_LIST,
  ...BG_COLOR_FORMATTING_NAME_LIST,
] as const;

export const FORMATTING_STYLE: Record<FormattingT, `${string}:${string};`[]> = {
  bold: ["font-weight:bold;", "font-weight:600;", "font-weight:700;"],
  italic: ["font-style:italic;"],
  "strike-through": [
    "text-decoration-line:line-through;",
    "text-decoration:line-through;",
  ],
  underline: ["border-bottom:0.05em solid;"],
  "color-gray": ["color:oklch(70.7% 0.022 261.325);"],
  "color-green": ["color:oklch(79.2% 0.209 151.711);"],
  "color-blue": ["color:oklch(70.7% 0.165 254.624);"],
  "color-pink": ["color:oklch(71.8% 0.202 349.761);"],
  "color-red": ["color:oklch(70.4% 0.191 22.216);"],
  "color-orange": ["color:oklch(75% 0.183 55.934);"],
  "color-purple": ["color:oklch(71.4% 0.203 305.504);"],
  "color-yellow": ["color:oklch(85.2% 0.199 91.936);"],
  "color-cyan": ["color:oklch(78.9% 0.154 211.53);"],
  "bg-gray": ["background-color:oklch(27.8% 0.033 256.848);"],
  "bg-green": ["background-color:oklch(44.8% 0.119 151.328);"],
  "bg-blue": ["background-color:oklch(42.4% 0.199 265.638);"],
  "bg-pink": ["background-color:oklch(45.9% 0.187 3.815);"],
  "bg-red": ["background-color:oklch(44.4% 0.177 26.899);"],
  "bg-orange": ["background-color:oklch(47% 0.157 37.304);"],
  "bg-purple": ["background-color:oklch(43.8% 0.218 303.724);"],
  "bg-yellow": ["background-color:oklch(47.6% 0.114 61.907);"],
  "bg-cyan": ["background-color:oklch(45% 0.085 224.283);"],
};

export type ColorFormattingT = (typeof TEXT_COLOR_FORMATTING_NAME_LIST)[number];
export type TextFormattingT = (typeof TEXT_FORMATTING_NAME_LIST)[number];
export type FormattingT = (typeof FORMATTING_NAME_LIST)[number];

export const BLOCK_INPUT_CLASSNAME = "block-input";
export const BLOCK_ITEM_CLASSNAME = "block-item";
export const INLINE_LINK_PREVIEW_CLASSNAME = "inline-link-preview";
