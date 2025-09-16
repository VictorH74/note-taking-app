
"use client";
import { pageService } from "@/services/client-side/PageService";
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
import { applyFocus } from "@/lib/utils/functions";
import React from "react";
import { FooObj } from "./Foo";

export type BlockListType = PageContentT["blockList"][number];

interface ContentListCtxProps {
  debounceTimeoutRef: React.RefObject<NodeJS.Timeout | null>;

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

  const FooObjRef = React.useRef(new FooObj());
  const blockChangeDebounceTimeoutRef = React.useRef<Record<BlockT['id'], NodeJS.Timeout | null>>({});

  const [pageContent, setPageContent] = React.useState<PageContentT | null>(
    null
  );

  const updatePageContent = (content: Partial<PageContentT>) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // TODO: use pako to compress content before sending to API
    debounceTimeoutRef.current = setTimeout(async () => {
      await pageService.updatePageContent(pageContent!.id, content);
    }, 1000 * 2);
  };

  const changePageContentTitle = (text: string) => {
    if (!pageContent) return;

    pageContent.title = text;
    updatePageContent({ title: text });
  };

  const changePageContentBlockListItem = async (
    index: number,
    itemChangedData: Record<string, unknown>
  ) => {
    if (!pageContent) return;

    const blockId = pageContent.blockSortIdList[index];

    const block = pageContent.blockList.find(b => b.id == blockId)


    if (!block) return

    Object.assign(block, itemChangedData)

    if (blockChangeDebounceTimeoutRef.current?.[block.id]) {
      clearTimeout(blockChangeDebounceTimeoutRef.current[block.id]!);
    }

    // TODO: use pako to compress content before sending to API
    blockChangeDebounceTimeoutRef.current[block.id] = setTimeout(async () => {
      const updateAction = () => pageService.updateBlock(block.id, pageContent.id, itemChangedData)
      if (FooObjRef.current.has(block.id)) {
        console.log('freezed')
        FooObjRef.current.addBlockIdRemovedListener(block.id, updateAction)
        return;
      }
      await updateAction()
      console.log('updated')
    }, 1000 * 2);
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
    indent: number,
    newIndex?: number,
    replace?: boolean
  ) {
    const baseData = {
      id: `${type}-${Date.now()}`,
      text: "",
      type: type,
      indent: indent || null,
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
    const _pageContent = { ...pageContent };

    const newPageBlockSortIdList = _pageContent.blockSortIdList

    const deletedIds = newPageBlockSortIdList.splice(
      index != undefined ? index : newPageBlockSortIdList.length,
      replace ? 1 : 0,
      item.id
    );

    if (deletedIds.length > 0) {
      const deletedId = deletedIds.at(0)!
      const toDeleteIndex = _pageContent.blockList.findIndex(blck => blck.id == deletedId)
      _pageContent.blockList[toDeleteIndex] = item as BlockT<BlockTypeT> & { [k: string]: unknown }
    } else {
      _pageContent.blockList.push(item as BlockT<BlockTypeT> & { [k: string]: unknown })
    }

    const promises: Promise<unknown>[] = [
      pageService.createBlock(_pageContent.id, item)
    ]

    if (deletedIds.length > 0) {
      if (blockChangeDebounceTimeoutRef.current[deletedIds.at(0)!]) {
        clearTimeout(blockChangeDebounceTimeoutRef.current[deletedIds.at(0)!]!)
      }
      promises.push(pageService.deleteBlock(deletedIds.at(0)!, _pageContent.id))
    }

    promises.push(pageService.updatePageContent(_pageContent.id, { blockSortIdList: newPageBlockSortIdList }))

    // TODO: try / catch
    FooObjRef.current.add(item.id)

    Promise.all(promises).catch((err) => {
      console.error(err)
      alert(err)
      // TODO: handle error
    }).finally(() => {
      FooObjRef.current.remove(item.id)
    })

    setPageContent(() => _pageContent);

    setTimeout(() => {
      applyFocus(item.id, "start");
    }, 0);
  };

  const removeBlock = async (
    index: number,
    focusPrevBlock?: boolean,
    toConcatText?: string
  ) => {
    if (!pageContent) return;

    const _pageContent = { ...pageContent };
    const newPageBlockSortIdList = _pageContent.blockSortIdList

    const deletedIds = newPageBlockSortIdList.splice(index, 1);
    const deletedId = deletedIds.at(0)!
    const toDeleteIndex = _pageContent.blockList.findIndex(blck => blck.id == deletedId)

    _pageContent.blockList.splice(toDeleteIndex, 1);

    if (blockChangeDebounceTimeoutRef.current[deletedId]) {
      clearTimeout(blockChangeDebounceTimeoutRef.current[deletedId]!)
    }

    const promises: Promise<void>[] = []

    if (toConcatText && index > 0) {
      const topBlockId = _pageContent.blockSortIdList[index - 1]
      const block = _pageContent.blockList.find(blck => blck.id == topBlockId)!
      if (!!block.text) {
        block.text += toConcatText;
        promises.push(pageService.updateBlock(topBlockId, _pageContent.id, { text: block.text }))
      }
    }

    promises.push(
      pageService.deleteBlock(deletedId, _pageContent.id),
      pageService.updatePageContent(_pageContent.id, { blockSortIdList: newPageBlockSortIdList })
    )

    // TODO: try / catch
    Promise.all(promises)

    setPageContent(() => _pageContent);

    if (focusPrevBlock && index > 0)
      applyFocus(pageContent.blockSortIdList[index - 1]);
  };

  const reorderBlockList = (index: number, toIndex: number) => {
    if (!pageContent) return;

    const _pageContent = { ...pageContent };

    const newPageBlockSortIdList = _pageContent.blockSortIdList
    const blockId = newPageBlockSortIdList[index];

    const finalToIndex = index < toIndex && toIndex > 0 ? toIndex - 1 : toIndex;
    newPageBlockSortIdList.splice(index, 1);
    newPageBlockSortIdList.splice(finalToIndex, 0, blockId);

    // TODO: try / catch
    pageService.updatePageContent(_pageContent.id, { blockSortIdList: newPageBlockSortIdList })

    setPageContent(_pageContent)
  };

  return (
    <PageContentCtx.Provider
      value={{
        pageContent,
        debounceTimeoutRef,
        addNewHeadingBlock,
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
