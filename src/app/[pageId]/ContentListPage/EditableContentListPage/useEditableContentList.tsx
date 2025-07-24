import { usePageContentFetch } from "@/hooks/usePageContentFetch";
import {
  BlockT,
  BulletListItemBlockT,
  CheckListItemBlockT,
  CodeBlockT,
  Heading1BlockT,
  Heading2BlockT,
  Heading3BlockT,
  PageContentT,
  ParagraphBlockT,
  TableBlockT,
} from "@/types/page";
import React from "react";
import { ParagraphBlock } from "../../block-components/ParagraphBlock";
import { CodeBlock } from "../../block-components/CodeBlock";
import { BulletListItemBlock } from "../../block-components/BulletListItemBlock";
import { TableBlock } from "../../block-components/TableBlock";
import { usePageContent } from "@/hooks/usePageContent";
import { BlockListType } from "@/context/PageContentCtx";
import { CheckListItemBlock } from "../../block-components/CheckListItemBlock";
import { HeadingBlock } from "../../block-components/HeadingBlock";

export interface ContentListPageEditableChildrenProps {
  pageContentId: PageContentT["id"];
}

// TODO: Implement full-screen mode
export const fullScreen = false; // Placeholder for full-screen mode

export interface BlockComponentProps<T extends BlockT> {
  item: T;
  onChange: (itemChangedData: Partial<T>) => void;
  index: number;
}

export const generateItemComponent: Record<
  BlockListType["type"],
  (
    item: BlockT,
    index: number,
    onChange: (itemChangedData: Record<string, unknown>) => void
  ) => React.ReactNode
> = {
  paragraph: (item, index, onChange) => (
    <ParagraphBlock
      key={item.id}
      index={index}
      item={item as ParagraphBlockT}
      onChange={onChange}
    />
  ),
  code: (item, index, onChange) => (
    <CodeBlock
      key={item.id}
      index={index}
      item={item as CodeBlockT}
      onChange={onChange}
    />
  ),
  heading1: (item, index, onChange) => (
    <HeadingBlock
      key={item.id}
      index={index}
      headingBlockType="heading1"
      item={item as Heading1BlockT}
      onChange={onChange}
    />
  ),
  heading2: (item, index, onChange) => (
    <HeadingBlock
      key={item.id}
      index={index}
      headingBlockType="heading2"
      item={item as Heading2BlockT}
      onChange={onChange}
    />
  ),
  heading3: (item, index, onChange) => (
    <HeadingBlock
      key={item.id}
      index={index}
      headingBlockType="heading3"
      item={item as Heading3BlockT}
      onChange={onChange}
    />
  ),
  bulletlistitem: (item, index, onChange) => (
    <BulletListItemBlock
      key={item.id}
      index={index}
      item={item as BulletListItemBlockT}
      onChange={onChange}
    />
  ),
  // TODO: create own component
  checklistitem: (item, index, onChange) => (
    <CheckListItemBlock
      key={item.id}
      index={index}
      item={item as CheckListItemBlockT}
      onChange={onChange}
    />
  ),
  table: (item, index, onChange) => (
    <TableBlock
      key={item.id}
      index={index}
      item={item as TableBlockT}
      onChange={onChange}
    />
  ),
};

export const useEditableContentList = (
  props: ContentListPageEditableChildrenProps
) => {
  const { pageContent } = usePageContentFetch(props.pageContentId);
  const {
    setContentTitle,
    setContentBlockList,
    pageContentRef,
    changePageContentRefListItem,
    contentTitle,
    contentBlockList,
  } = usePageContent();

  React.useEffect(() => {
    if (!pageContent) return;

    console.log("Page content fetched:", pageContent);

    setContentTitle(pageContent.title);
    setContentBlockList(pageContent.blockList);
    pageContentRef.current = pageContent;
  }, [pageContent]);

  const makeHandleItemChange =
    (index: number) => (itemChangedData: Record<string, unknown>) => {
      changePageContentRefListItem(index, itemChangedData);
    };

  return {
    contentTitle,
    contentBlockList,
    setContentTitle,
    makeHandleItemChange,
  };
};
