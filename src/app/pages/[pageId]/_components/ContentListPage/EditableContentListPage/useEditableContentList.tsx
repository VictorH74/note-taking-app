import { usePageContentFetch } from "@/hooks/usePageContentFetch";
import {
  BlockT,
  BulletListItemBlockT,
  CheckListItemBlockT,
  CodeBlockT,
  Heading1BlockT,
  Heading2BlockT,
  Heading3BlockT,
  NumberedListItemBlockT,
  PageContentT,
  ParagraphBlockT,
  TableBlockT,
} from "@/types/page";
import React from "react";
import {
  ParagraphBlock,
  ReadableParagraphBlock,
} from "../../blocks/ParagraphBlock";
import {
  CodeBlock,
  ReadableCodeBlock,
} from "../../blocks/CodeBlock";
import {
  BulletListItemBlock,
  ReadableBulletListItemBlock,
} from "../../blocks/BulletListItemBlock";
import { TableBlock } from "../../blocks/TableBlock";
import { usePageContent } from "@/hooks/usePageContent";
import { BlockListType } from "@/context/PageContentCtx";
import {
  CheckListItemBlock,
  ReadableCheckListItemBlock,
} from "../../blocks/CheckListItemBlock";
import {
  HeadingBlock,
  ReadableHeadingBlock,
} from "../../blocks/HeadingBlock";
import {
  NumberedListItemBlock,
  ReadableNumberedListItemBlock,
} from "../../blocks/NumberedListItemBlock";
import { applyFocus } from "@/lib/utils/functions";

export interface ContentListPageEditableChildrenProps {
  pageContentId: PageContentT["id"];
}

// TODO: Implement full-screen mode
export const fullScreen = false; // Placeholder for full-screen mode

export interface BlockComponentProps<T extends BlockT> {
  item: T;
  onChange?: (itemChangedData: Partial<T>) => void;
  index: number;
}

export const generateItemComponent: Record<
  BlockListType["type"],
  (
    item: BlockT,
    index: number,
    onChange?: (itemChangedData: Record<string, unknown>) => void
  ) => React.ReactNode
> = {
  paragraph: (item, index, onChange) =>
    !!onChange ? (
      <ParagraphBlock
        key={item.id}
        index={index}
        item={item as ParagraphBlockT}
        onChange={onChange}
      />
    ) : (
      <ReadableParagraphBlock
        key={item.id}
        index={index}
        item={item as ParagraphBlockT}
        onChange={onChange}
      />
    ),
  code: (item, index, onChange) =>
    !!onChange ? (
      <CodeBlock
        key={item.id}
        index={index}
        item={item as CodeBlockT}
        onChange={onChange}
      />
    ) : (
      <ReadableCodeBlock
        key={item.id}
        index={index}
        item={item as CodeBlockT}
      />
    ),
  heading1: (item, index, onChange) =>
    !!onChange ? (
      <HeadingBlock
        key={item.id}
        index={index}
        headingBlockType="heading1"
        item={item as Heading1BlockT}
        onChange={onChange}
      />
    ) : (
      <ReadableHeadingBlock
        key={item.id}
        index={index}
        headingBlockType="heading1"
        item={item as Heading1BlockT}
      />
    ),
  heading2: (item, index, onChange) =>
    !!onChange ? (
      <HeadingBlock
        key={item.id}
        index={index}
        headingBlockType="heading2"
        item={item as Heading2BlockT}
        onChange={onChange}
      />
    ) : (
      <ReadableHeadingBlock
        key={item.id}
        index={index}
        headingBlockType="heading2"
        item={item as Heading2BlockT}
        onChange={onChange}
      />
    ),
  heading3: (item, index, onChange) =>
    !!onChange ? (
      <HeadingBlock
        key={item.id}
        index={index}
        headingBlockType="heading3"
        item={item as Heading3BlockT}
        onChange={onChange}
      />
    ) : (
      <ReadableHeadingBlock
        key={item.id}
        index={index}
        headingBlockType="heading3"
        item={item as Heading3BlockT}
      />
    ),
  numberedlistitem: (item, index, onChange) =>
    !!onChange ? (
      <NumberedListItemBlock
        key={item.id}
        index={index}
        item={item as NumberedListItemBlockT}
        onChange={onChange}
      />
    ) : (
      <ReadableNumberedListItemBlock
        key={item.id}
        index={index}
        item={item as NumberedListItemBlockT}
        onChange={onChange}
      />
    ),
  bulletlistitem: (item, index, onChange) =>
    !!onChange ? (
      <BulletListItemBlock
        key={item.id}
        index={index}
        item={item as BulletListItemBlockT}
        onChange={onChange}
      />
    ) : (
      <ReadableBulletListItemBlock
        key={item.id}
        index={index}
        item={item as BulletListItemBlockT}
      />
    ),
  checklistitem: (item, index, onChange) =>
    !!onChange ? (
      <CheckListItemBlock
        key={item.id}
        index={index}
        item={item as CheckListItemBlockT}
        onChange={onChange}
      />
    ) : (
      <ReadableCheckListItemBlock
        key={item.id}
        index={index}
        item={item as CheckListItemBlockT}
      />
    ),
  table: (item, index, onChange) =>
    !!onChange ? (
      <TableBlock
        key={item.id}
        index={index}
        item={item as TableBlockT}
        onChange={onChange}
      />
    ) : (
      <ReadableParagraphBlock
        key={item.id}
        index={index}
        item={item as ParagraphBlockT}
        onChange={onChange}
      />
    ),
};

export const useEditableContentList = (
  props: ContentListPageEditableChildrenProps
) => {
  const { pageContent: retrivedPageContent, error, loading } = usePageContentFetch(
    props.pageContentId
  );
  const {
    pageContent,
    setPageContent,
    changePageContentTitle,
    changePageContentBlockListItem,
    addNewParagraphBlock,
  } = usePageContent();

  const sortedPageBlockList = React.useMemo<BlockListType[]>(() => {
    if (!pageContent) return []
    const blockById = pageContent.blockList.reduce<Record<BlockListType['id'], BlockListType>>((obj, block) => {
      obj[block.id] = block
      return obj
    }, {})

    return pageContent.blockSortIdList.map(id => blockById[id])
  }, [pageContent])

  React.useEffect(() => {
    if (!retrivedPageContent) return;

    setPageContent(retrivedPageContent);
    // setPageContent(retrivedPageContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrivedPageContent]);

  const makeHandleItemChange =
    (index: number) => (itemChangedData: Record<string, unknown>) => {
      changePageContentBlockListItem(index, itemChangedData);
    };

  const handleContentTitleChange = (e: React.FormEvent<HTMLHeadingElement>) => {
    changePageContentTitle(e.currentTarget.innerText);
  };

  const createNewParagraphBlock = () => {
    const lastBlock = pageContent?.blockList.at(-1);
    if (lastBlock?.type == "paragraph" && !lastBlock.text) {
      applyFocus(lastBlock.id);
      return;
    }

    addNewParagraphBlock();
  };

  return {
    pageContent,
    makeHandleItemChange,
    handleContentTitleChange,
    createNewParagraphBlock,
    loading,
    error,
    sortedPageBlockList
  };
};
