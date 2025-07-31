export type PageDataT = {
  id: string;
  createdAt: string;
  updatedAt: string;
  contentId: PageContentT["id"];
  ownerId: string;
  settings: {
    allowComments: boolean;
    allowReactions: boolean;
    isFullWidth: boolean;
  };
  shareSettings: {
    isPublic: boolean;
    inviteds: [
      { userId: string; role: "all" | "editor" | "viewer" | "commenter" }
    ];
  };
};

export type PageContentT = {
  id: string;
  title: string;
  blockList: (BlockT & { [k: string]: unknown })[]; // Allow additional properties
};

export type ListItemTypeT =
  | "checklistitem"
  | "bulletlistitem"
  | "numberedlistitem";
export type HeadingItemTypeT = "heading1" | "heading2" | "heading3";

export type BlockTypeT =
  | ListItemTypeT
  | HeadingItemTypeT
  | "code"
  | "table"
  | "paragraph";

export interface BlockT<T extends BlockTypeT = BlockTypeT> {
  id: `${T}-${number}`;
  type: T;
}

export interface ListItemBlockT<T extends ListItemTypeT> extends BlockT<T> {
  text: string;
  indent?: number; // Indentation level for nested lists
}

export interface CodeBlockT extends BlockT<"code"> {
  content: string;
  language: string;
}
export interface TableBlockT extends BlockT<"table"> {
  rowCount: number;
  columnCount: number;
  headers: string[];
  rows: string[][];
}
export interface CheckListItemBlockT extends ListItemBlockT<"checklistitem"> {
  checked: boolean;
}
export type BulletListItemBlockT = ListItemBlockT<"bulletlistitem">;
export type NumberedListItemBlockT = ListItemBlockT<"numberedlistitem">;
export interface Heading1BlockT extends BlockT<"heading1"> {
  text: string;
}
export interface Heading2BlockT extends BlockT<"heading2"> {
  text: string;
}
export interface Heading3BlockT extends BlockT<"heading3"> {
  text: string;
}
export interface ParagraphBlockT extends BlockT<"paragraph"> {
  text: string;
}
