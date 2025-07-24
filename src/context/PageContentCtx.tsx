"use client";
import {
  BlockT,
  BlockTypeT,
  BulletListItemBlockT,
  CheckListItemBlockT,
  Heading1BlockT,
  Heading2BlockT,
  Heading3BlockT,
  HeadingItemTypeT,
  ListItemTypeT,
  PageContentT,
  ParagraphBlockT,
} from "@/types/page";
import React from "react";

export type BlockListType = PageContentT["blockList"][number];

interface ContentListCtxProps {
  pageContentRef: React.RefObject<PageContentT | null>;
  debounceTimeoutRef: React.RefObject<NodeJS.Timeout | null>;
  contentTitle: string;
  setContentTitle: React.Dispatch<React.SetStateAction<string>>;
  contentBlockList: PageContentT["blockList"];
  setContentBlockList: React.Dispatch<
    React.SetStateAction<PageContentT["blockList"]>
  >;
  changePageContentRefListItem(
    index: number,
    itemChangedData: Record<string, unknown>
  ): void;
  updatePageContent(): Promise<void>;
  addNewParagraphBlock(
    index?: number,
    initialText?: string,
    replace?: boolean
  ): void;
  addNewListItem(type: ListItemTypeT, indent?: number, newIndex?: number): void;
  addNewHeadingBlock: (type: HeadingItemTypeT, newIndex?: number) => void;
  addHeadingBlock(
    type: "heading1" | "heading2" | "heading3",
    newIndex?: number
  ): void;
  removeBlock(
    index: number,
    focusPrevBlock?: boolean,
    toConcatText?: string
  ): void;
  reorderBlockList: (index: number, toIndex: number) => void;
}

export const PageContentCtx = React.createContext<ContentListCtxProps | null>(
  null
);

export function PageContentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageContentRef = React.useRef<PageContentT | null>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [contentTitle, setContentTitle] = React.useState<string>("");
  const [contentBlockList, setContentBlockList] = React.useState<
    PageContentT["blockList"]
  >([]);
  const [lastFocusedItemId, setLastFocusedItemId] = React.useState<
    BlockT["id"] | null
  >(null);

  const addItemFocus = React.useMemo<
    Record<BlockTypeT, (itemElement: HTMLElement) => void>
  >(
    () => ({
      paragraph: (el) => {
        const element = el.getElementsByClassName("block-input").item(0);
        if (!element) return;
        (element as HTMLElement).focus();
      },
      checklistitem: (el) => {
        const element = el.getElementsByClassName("block-input").item(0);
        if (!element) return;
        (element as HTMLElement).focus();
      },
      bulletlistitem: (el) => {
        const element = el.getElementsByClassName("block-input").item(0);
        if (!element) return;
        // TODO: fix this attempt to focus last of element content
        (element as HTMLElement).focus();

        // const range = document.createRange();
        // const selection = window.getSelection();

        // range.setStart(element.childNodes[element.childNodes.length - 1], 4);
        // range.collapse(false);

        // selection?.removeAllRanges();
        // selection?.addRange(range);
      },
      code: () => {},
      heading1: (el) => {
        const element = el.getElementsByClassName("block-input").item(0);
        if (!element) return;
        (element as HTMLElement).focus();
      },
      heading2: (el) => {
        const element = el.getElementsByClassName("block-input").item(0);
        if (!element) return;
        (element as HTMLElement).focus();
      },
      heading3: (el) => {
        const element = el.getElementsByClassName("block-input").item(0);
        if (!element) return;
        (element as HTMLElement).focus();
      },
      table: () => {},
    }),
    []
  );

  React.useEffect(() => {
    if (!pageContentRef.current) return;

    pageContentRef.current.blockList = contentBlockList;
  }, [contentBlockList]);

  React.useEffect(() => {
    if (!pageContentRef.current) return;

    pageContentRef.current.title = contentTitle;
  }, [contentTitle]);

  React.useEffect(() => {
    if (!lastFocusedItemId) return;
    console.log(lastFocusedItemId);
    const [id] = lastFocusedItemId.split("-");

    const itemElement = document.getElementById(lastFocusedItemId);
    if (itemElement) {
      addItemFocus[id as BlockTypeT](itemElement);
      setLastFocusedItemId(null);
    }
  }, [lastFocusedItemId]);

  const addHeadingBlock = (type: HeadingItemTypeT, newIndex?: number) => {
    if (!pageContentRef.current) return;

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

    addNewBlock(newHeadingBlockByType[type], newIndex);
  };

  const addNewParagraphBlock = (
    newIndex?: number,
    initialText?: string,
    replace?: boolean
  ) => {
    if (!pageContentRef.current) return;

    const newItem: ParagraphBlockT = {
      id: `paragraph-${Date.now()}`,
      text: initialText || "",
      type: "paragraph",
    };

    addNewBlock(newItem, newIndex, replace);
  };

  const addNewHeadingBlock = (type: HeadingItemTypeT, newIndex?: number) => {
    if (!pageContentRef.current) return;

    const baseData = {
      text: "",
      type: type,
    };

    const newHeadingBlockByType: Record<HeadingItemTypeT, BlockT> = {
      heading1: {
        ...baseData,
        id: `${type}-${Date.now()}`,
      } as Heading1BlockT,
      heading2: {
        ...baseData,
        id: `${type}-${Date.now()}`,
      } as Heading2BlockT,
      heading3: {
        ...baseData,
        id: `${type}-${Date.now()}`,
      } as Heading3BlockT,
    };

    addNewBlock(newHeadingBlockByType[type], newIndex);
  };

  function addNewListItem(
    type: ListItemTypeT,
    indent?: number,
    newIndex?: number
  ) {
    if (!pageContentRef.current) return;

    const baseData = {
      id: `${type}-${Date.now()}`,
      text: "",
      type: type,
      indent,
    };

    // type a = BlockT<BlockTypeT> & { [k: string]: unknown; }
    const newListItemBlockByType: Record<ListItemTypeT, BlockT> = {
      checklistitem: {
        ...baseData,
        decoration: "check",
        checked: false,
      } as CheckListItemBlockT,
      bulletlistitem: {
        ...baseData,
        decoration: "bullet",
      } as BulletListItemBlockT,
    };

    addNewBlock(newListItemBlockByType[type], newIndex);
  }

  const addNewBlock = (item: BlockT, index?: number, replace?: boolean) => {
    if (!pageContentRef.current) return;

    pageContentRef.current.blockList.splice(
      index || pageContentRef.current.blockList.length,
      replace ? 1 : 0,
      item as BlockT<BlockTypeT> & { [k: string]: unknown }
    );

    setContentBlockList(pageContentRef.current.blockList);
    setLastFocusedItemId(item.id);
    updatePageContent();
  };

  const changePageContentRefListItem = (
    index: number,
    itemChangedData: Record<string, unknown>
  ) => {
    if (!pageContentRef.current) return;

    const newItem = pageContentRef.current.blockList[index];

    pageContentRef.current.blockList[index] = {
      ...newItem,
      ...itemChangedData,
    } as BlockListType;

    updatePageContent();
  };

  const removeBlock = (
    index: number,
    focusPrevBlock?: boolean,
    toConcatText?: string
  ) => {
    if (!pageContentRef.current) return;

    pageContentRef.current.blockList.splice(index, 1);

    if (toConcatText && index > 0) {
      const block = pageContentRef.current.blockList[index - 1];
      if (
        [
          "checklistitem",
          "bulletlistitem",
          "heading1",
          "heading2",
          "heading3",
          "paragraph",
        ].includes(block.type)
      ) {
        block.text += toConcatText;
      }
    }

    setContentBlockList(pageContentRef.current.blockList);
    if (focusPrevBlock && index > 0)
      setLastFocusedItemId(pageContentRef.current.blockList[index - 1].id);
    updatePageContent();
  };

  const reorderBlockList = (index: number, toIndex: number) => {
    if (!pageContentRef.current) return;

    const block = pageContentRef.current.blockList[index];

    pageContentRef.current.blockList.splice(index, 1);

    // addNewBlock(block, toIndex);
    addNewBlock(block, index < toIndex ? toIndex - 1 : toIndex);
  };

  const updatePageContent = async () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      console.log("Updating content list:", pageContentRef.current?.blockList);
      // Here you would typically make an API call to update the content list
      // For example:
      // await api.updatePageContent(props.pageContentId, {
      //   itemList: contentBlockList,
      // });
    }, 1000 * 2);
  };

  return (
    <PageContentCtx.Provider
      value={{
        contentBlockList,
        contentTitle,
        debounceTimeoutRef,
        pageContentRef,
        setContentBlockList,
        addNewHeadingBlock,
        setContentTitle,
        addNewParagraphBlock,
        changePageContentRefListItem,
        updatePageContent,
        addNewListItem,
        addHeadingBlock,
        removeBlock,
        reorderBlockList,
      }}
    >
      {children}
    </PageContentCtx.Provider>
  );
}
