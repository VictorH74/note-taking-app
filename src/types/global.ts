export type PositionT = { left: number; top: number };
export type LinkPreviewT = {
  description: string;
  favicon_url: string;
  image_url: string;
  title: string;
  type: string;
  url: string;
  filtered_terms: string[];
};

export type TagNameT = keyof HTMLElementTagNameMap;
