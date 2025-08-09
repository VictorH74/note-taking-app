/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import {
  BlockT,
  BlockTypeT,
  BulletListItemBlockT,
  CheckListItemBlockT,
  CodeBlockT,
  Heading1BlockT,
  Heading2BlockT,
  Heading3BlockT,
  HeadingItemTypeT,
  ListItemTypeT,
  NumberedListItemBlockT,
  PageContentT,
  ParagraphBlockT,
} from "@/types/page";
import { applyFocus } from "@/utils/functions";
import React from "react";

export type BlockListType = PageContentT["blockList"][number];

interface ContentListCtxProps {
  debounceTimeoutRef: React.RefObject<NodeJS.Timeout | null>;
  contentTitle: string;
  setContentTitle: React.Dispatch<React.SetStateAction<string>>;
  contentBlockList: PageContentT["blockList"];
  setContentBlockList: React.Dispatch<
    React.SetStateAction<PageContentT["blockList"]>
  >;
  setPageContent: (value: React.SetStateAction<PageContentT | null>) => void;

  changePageContentTitle: (text: string) => void;
  changePageContentBlockListItem(
    index: number,
    itemChangedData: Record<string, unknown>
  ): void;
  // applyPageContentChanges: () => void;

  addNewParagraphBlock(
    index?: number,
    initialText?: string,
    replace?: boolean
  ): void;
  addNewListItemBlock(
    type: ListItemTypeT,
    indent?: number,
    newIndex?: number,
    replace?: boolean
  ): void;
  addNewHeadingBlock: (
    type: HeadingItemTypeT,
    newIndex?: number,
    replace?: boolean
  ) => void;
  addCodeBlock: (
    content?: string,
    language?: string,
    index?: number,
    replace?: boolean
  ) => void;
  removeBlock(
    index: number,
    focusPrevBlock?: boolean,
    toConcatText?: string
  ): void;
  reorderBlockList: (index: number, toIndex: number) => void;

  pageContent: PageContentT | null;
}

export const PageContentCtx = React.createContext<ContentListCtxProps | null>(
  null
);

export function PageContentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [pageContent, setPageContent] = React.useState<PageContentT | null>(
    null
  );

  const [contentTitle, setContentTitle] = React.useState<string>("");
  const [contentBlockList, setContentBlockList] = React.useState<
    PageContentT["blockList"]
  >([]);

  const updatePageContent = async () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      console.log("Updating content list:", pageContent);
      // Here you would typically make an API call to update the content list
      // For example:
      // await api.updatePageContent(props.pageContentId, {
      //   itemList: contentBlockList,
      // });
    }, 1000 * 2);
  };

  React.useEffect(() => {
    if (!pageContent) return;

    updatePageContent();
  }, [pageContent]);

  const changePageContentTitle = (text: string) => {
    if (!pageContent) return;

    pageContent.title = text;
    updatePageContent();
  };

  const changePageContentBlockListItem = (
    index: number,
    itemChangedData: Record<string, unknown>
  ) => {
    if (!pageContent) return;

    const newItem = pageContent.blockList[index];

    pageContent.blockList[index] = {
      ...newItem,
      ...itemChangedData,
    } as BlockListType;
    updatePageContent();
  };

  const addNewHeadingBlock = (
    type: HeadingItemTypeT,
    newIndex?: number,
    replace?: boolean
  ) => {
    if (!pageContent) return;

    const baseData = {
      id: `${type}-${Date.now()}`,
      text: "",
      type: type,
    };

    const newHeadingBlockByType: Record<HeadingItemTypeT, BlockT> = {
      heading1: baseData as Heading1BlockT,
      heading2: baseData as Heading2BlockT,
      heading3: baseData as Heading3BlockT,
    };

    addNewBlock(newHeadingBlockByType[type], newIndex, replace);
  };

  const addNewParagraphBlock = (
    newIndex?: number,
    initialText: string = "",
    replace?: boolean
  ) => {
    const newItem: ParagraphBlockT = {
      id: `paragraph-${Date.now()}`,
      text: initialText,
      type: "paragraph",
    };

    addNewBlock(newItem, newIndex, replace);
  };

  function addNewListItemBlock(
    type: ListItemTypeT,
    indent?: number,
    newIndex?: number,
    replace?: boolean
  ) {
    const baseData = {
      id: `${type}-${Date.now()}`,
      text: "",
      type: type,
      indent,
    };

    const newListItemBlockByType: Record<ListItemTypeT, BlockT> = {
      checklistitem: {
        ...baseData,
        checked: false,
      } as CheckListItemBlockT,
      numberedlistitem: {
        ...baseData,
      } as NumberedListItemBlockT,
      bulletlistitem: {
        ...baseData,
      } as BulletListItemBlockT,
    };

    addNewBlock(newListItemBlockByType[type], newIndex, replace);
  }

  const addCodeBlock = (
    content: string = "",
    language: string = "JavasSript",
    index?: number,
    replace?: boolean
  ) => {
    const data: CodeBlockT = {
      id: `code-${Date.now()}`,
      type: "code",
      content,
      language,
    };

    addNewBlock(data, index, replace);
  };

  const addNewBlock = (item: BlockT, index?: number, replace?: boolean) => {
    if (!pageContent) return;

    const temp = { ...pageContent };

    temp.blockList.splice(
      index != undefined ? index : temp.blockList.length,
      replace ? 1 : 0,
      item as BlockT<BlockTypeT> & { [k: string]: unknown }
    );

    setPageContent(() => temp);
    applyFocus(item.id, "start");
  };

  const removeBlock = (
    index: number,
    focusPrevBlock?: boolean,
    toConcatText?: string
  ) => {
    if (!pageContent) return;

    const temp = { ...pageContent };

    temp.blockList.splice(index, 1);

    if (toConcatText && index > 0) {
      const block = temp.blockList[index - 1];
      if (!!block.text) {
        block.text += toConcatText;
      }
    }

    setPageContent(() => temp);

    if (focusPrevBlock && index > 0)
      applyFocus(pageContent.blockList[index - 1].id);
  };

  const reorderBlockList = (index: number, toIndex: number) => {
    if (!pageContent) return;

    const block = pageContent.blockList[index];

    pageContent.blockList.splice(index, 1);

    const finalToIndex = index < toIndex && toIndex > 0 ? toIndex - 1 : toIndex;

    addNewBlock(block, finalToIndex);
  };

  return (
    <PageContentCtx.Provider
      value={{
        contentBlockList,
        contentTitle,
        pageContent,
        debounceTimeoutRef,
        setContentBlockList,
        addNewHeadingBlock,
        setContentTitle,
        addNewParagraphBlock,
        changePageContentTitle,
        changePageContentBlockListItem,
        setPageContent,
        addNewListItemBlock,
        addCodeBlock,
        removeBlock,
        reorderBlockList,
      }}
    >
      {children}
    </PageContentCtx.Provider>
  );
}
