import { usePageContent } from "@/hooks/usePageContent";
import {
  FORMATTING_STYLE,
  FormattingT,
  BgColorFormattingT,
  TextColorFormattingT,
  INLINE_LINK_PREVIEW_CLASSNAME,
} from "@/lib/utils/constants";
import {
  compareStr,
  hasExistingBgColorStyle,
  hasExistingTextColorStyle,
  replaceBgColorStyle,
  replaceTextColorStyle,
  setInputUrlClickHandler,
} from "@/lib/utils/functions";
import React from "react";
import { MergedNodeList } from "./MergedNodeList";
import { PositionT } from "@/types/global";

interface TextSelectionCtxProps {
  selectedNodeFormattingStyleListRef: React.RefObject<string[] | null>;
  onChangeBlockIndexRef: React.RefObject<number | null>;
  commonFormattingRef: React.RefObject<Set<FormattingT> | null>;
  inputIdRef: React.RefObject<string | null>;
  selectedRange: Range | null;
  showTextFormattingActionMenu: (
    selectedRange: Range,
    onChangeBlockIndex: number,
    inputId: string
  ) => void;
  defineInputInlineLinkHandlers: (inputEl: HTMLElement) => void;
  hideTextFormattingActionMenu: () => void;
  applyRemoveFormatting(formatting: FormattingT): void;
  onHideFActionMenuListener(func: () => void): void;
  showInlineUrlChangeModal(link: HTMLAnchorElement, blockInputId: string): void
  replaceElWith(el: HTMLElement, startOffset: number, endOffset: number, ...nodes: Node[]): void
  mergeInputChildrenByFormattingStyle(inputEl: Element): Range | undefined
  hideInlineUrlChangeModal(): void
  inlineUrlChangeData: {
    position: PositionT
    linkEl: HTMLAnchorElement
    blockInputId: string,
  } | null
}

export const TextSelectionCtx =
  React.createContext<TextSelectionCtxProps | null>(null);

export function TextSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const onChangeBlockIndexRef = React.useRef<number | null>(null);
  const inputIdRef = React.useRef<string | null>(null);
  const commonFormattingRef = React.useRef<Set<FormattingT>>(null);
  const selectedNodeFormattingStyleListRef = React.useRef<Array<string>>(null);
  const onHideFActionMenuListenerList = React.useRef<Array<() => void>>([]);
  const scheduledShowInlineUrlChangeModalFuncRef = React.useRef<NodeJS.Timeout | null>(null);

  const [selectedRange, setSelectedRange] = React.useState<Range | null>(null);
  const [inlineUrlChangeData, setInlineUrlChangeData] = React.useState<TextSelectionCtxProps['inlineUrlChangeData']>(null)

  const { pageContent, changePageContentBlockListItem } = usePageContent();

  const showInlineUrlChangeModal = (linkEl: HTMLAnchorElement, blockInputId: string) => {
    const { top, left, height } = linkEl.getBoundingClientRect();
    setInlineUrlChangeData({
      position: { left, top: top + height },
      linkEl,
      blockInputId,
    })
  }
  const hideInlineUrlChangeModal = () => setInlineUrlChangeData(null)

  const onHideFActionMenuListener = (func: () => void) => {
    onHideFActionMenuListenerList.current.push(func);
  };

  const showTextFormattingActionMenu = (
    selectedRange: Range,
    onChangeBlockIndex: number,
    inputId: string
  ) => {
    onChangeBlockIndexRef.current = onChangeBlockIndex;
    inputIdRef.current = inputId;

    setSelectedRange(selectedRange);
  };

  const hideTextFormattingActionMenu = () => {
    // const selection = window.getSelection();
    // if (selection?.toString()) return

    selectedNodeFormattingStyleListRef.current = [];
    commonFormattingRef.current = new Set();

    setSelectedRange(null);
  };

  const applyRemoveFormatting = (formatting: FormattingT) => {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);

    const selectedNodes = range.cloneContents().childNodes;

    if (selectedNodes.length > 1) {
      if (commonFormattingRef.current?.has(formatting)) {
        removeFormattingToMultipleNodes(formatting, selection);
      } else {
        applyFormattingToMultipleNodes(formatting, selection);
      }
    } else {
      if (commonFormattingRef.current?.has(formatting)) {
        removeFormattingToUniqueNode(formatting, selection);
      } else {
        applyFormattingToUniqueNode(formatting, selection);
      }
    }

    const blockInputId = inputIdRef.current;
    if (!blockInputId) return;
    const blockInputEl = document.getElementsByClassName(blockInputId).item(0);
    if (!blockInputEl) return;

    const newRange = mergeInputChildrenByFormattingStyle(blockInputEl);
    if (newRange) setSelectedRange(newRange);

    // update 'pageContent' with changed item
    const blockId = pageContent?.blockSortIdList[onChangeBlockIndexRef.current!]
    const blockEl = document
      .getElementById(blockId as string)
      ?.getElementsByClassName(inputIdRef.current!)
      .item(0);

    changePageContentBlockListItem(onChangeBlockIndexRef.current!, {
      text: blockEl!.innerHTML,
    });
  };

  const compareElements = (el1: HTMLElement, el2: HTMLElement) => {
    if (el1.tagName != el2.tagName) return false;

    const isSameStyle = compareStr(
      getElAttrValue(el1, "style").replace(/;$/, ""),
      getElAttrValue(el2, "style").replace(/;$/, "")
    );

    if (el1.tagName == "SPAN") {
      return isSameStyle;
    } else if (el1.tagName == "A") {
      return (
        isSameStyle &&
        (el1 as HTMLAnchorElement).href == (el2 as HTMLAnchorElement).href
      );
    }

    return false;
  };

  const mergeInputChildrenByFormattingStyle = (inputEl: Element) => {
    const range = window.getSelection()?.getRangeAt(0);
    if (!range) return;

    type SelectRangeT = {
      node: Node;
      offset: number;
    };
    let selectRangeStart: SelectRangeT | null = null;
    let selectRangeEnd: SelectRangeT | null = null;

    const getNodeText = (node: Node) => node.textContent || "";

    let isSelectedNode = false;
    const mergedNodeList = new MergedNodeList.Builder(inputEl.childNodes)
      .onBeforeMerging((cloneNode, originalNode) => {
        isSelectedNode = range.intersectsNode(originalNode);
        return cloneNode;
      })
      .onMatchesAsElement((prevNode, clonedNode) => ({
        adicionalCondition: compareElements(
          prevNode as HTMLElement,
          clonedNode as HTMLElement
        ),
        aditionalAction() {
          if (isSelectedNode) {
            const endOffset = (prevNode.textContent || "").length;
            if (!selectRangeStart)
              selectRangeStart = {
                node: prevNode,
                offset: endOffset - getNodeText(clonedNode).length,
              };

            selectRangeEnd = { node: prevNode, offset: endOffset };
          }
        },
      }))
      .onMatchesAsText((prevNode, clonedNode) => ({
        aditionalAction() {
          if (isSelectedNode) {
            const endOffset = (prevNode.textContent || "").length;
            if (!selectRangeStart)
              selectRangeStart = {
                node: prevNode,
                offset: endOffset - getNodeText(clonedNode).length,
              };

            selectRangeEnd = {
              node: prevNode,
              offset: endOffset,
            };
          }
        },
      }))
      .onMergingFail((clonedNode) => {
        if (isSelectedNode) {
          if (!selectRangeStart)
            selectRangeStart = { node: clonedNode, offset: 0 };
          selectRangeEnd = {
            node: clonedNode,
            offset: getNodeText(clonedNode).length,
          };
        }
      })
      .build();

    inputEl.replaceChildren(...mergedNodeList.list);

    const getRangeSelection: (selectRange: SelectRangeT) => [Node, number] = ({
      node,
      offset,
    }) => [
        node.nodeType == Node.ELEMENT_NODE ? node.firstChild! : node,
        offset,
      ];

    if (selectRangeStart && selectRangeEnd) {
      range.setStart(...getRangeSelection(selectRangeStart as SelectRangeT));
      range.setEnd(...getRangeSelection(selectRangeEnd as SelectRangeT));
    }

    defineInputInlineLinkHandlers(inputEl as HTMLElement);

    return range.cloneRange();
  };

  const defineInputInlineLinkHandlers = (inputEl: HTMLElement) => {
    const linkEls = inputEl.getElementsByTagName("a");

    if (linkEls.length > 0) {
      for (let i = 0; i < linkEls.length; i++) {
        const link = linkEls[i];
        link.onclick = () => setInputUrlClickHandler(inputEl, link.href);

        if (!link.classList.contains(INLINE_LINK_PREVIEW_CLASSNAME)) {
          link.onmouseover = () => {
            scheduledShowInlineUrlChangeModalFuncRef.current = setTimeout(() => {
              showInlineUrlChangeModal(link, inputEl.getAttribute('id')!)
            }, 600);
          }
          link.onmouseleave = () => {
            if (scheduledShowInlineUrlChangeModalFuncRef.current)
              clearTimeout(scheduledShowInlineUrlChangeModalFuncRef.current)
          }
        }
      }
    }
  };

  const applyFormattingToMultipleNodes = (
    formatting: FormattingT,
    selection: Selection
  ) => {
    console.log(`   ## (AM) apply ${formatting} formatting to multiple nodes`);

    const range = selection.getRangeAt(0);
    const selectedNodes = range.cloneContents().childNodes;

    const getTextNodeSerializedStr = (textNode: Node) =>
      new XMLSerializer().serializeToString(textNode);

    const textColorFormattingPrefix: TextColorFormattingT = "color-";
    const bgColorFormattingPrefix: BgColorFormattingT = "bg-";
    const applyFormatting = (node: Node) => {
      const fStile = FORMATTING_STYLE[formatting][0];
      if (node.nodeType == Node.TEXT_NODE) {
        const spanEl = document.createElement("span");
        spanEl.setAttribute("style", fStile);
        spanEl.innerHTML = getTextNodeSerializedStr(node);
        node = spanEl;
      } else {
        let nodeStyle = getElAttrValue(node as ChildNode, "style");

        if (
          formatting.startsWith(textColorFormattingPrefix) &&
          hasExistingTextColorStyle(nodeStyle)
        ) {
          nodeStyle = replaceTextColorStyle(nodeStyle, fStile);
        } else if (
          formatting.startsWith(bgColorFormattingPrefix) &&
          hasExistingBgColorStyle(nodeStyle)
        ) {
          nodeStyle = replaceBgColorStyle(nodeStyle, fStile);
        } else if (!nodeStyle.includes(fStile.replace(/;$/, ""))) {
          nodeStyle = fStile.concat(nodeStyle);
        }

        (node as HTMLElement).setAttribute("style", nodeStyle);
      }
      return node;
    };

    const mergedNodeList = new MergedNodeList.Builder(selectedNodes)
      .onBeforeMerging(applyFormatting)
      .onMatchesAsElement((prevNode, clonedNode) => ({
        adicionalCondition: compareElements(
          prevNode as HTMLElement,
          clonedNode as HTMLElement
        ),
      }))
      .build();

    // include new fotmatting style in DOOM
    const frag = document.createDocumentFragment();
    range.extractContents();

    frag.append(...mergedNodeList.list);

    // TODO: verify if it is needed
    if (frag.childNodes.length == 1) {
      const newSelectedNode = frag.firstChild!.firstChild!;
      range.insertNode(frag.firstChild!);
      range.selectNodeContents(newSelectedNode);
      return;
    }

    range.insertNode(frag);
  };

  const applyFormattingToUniqueNode = (
    formatting: FormattingT,
    selection: Selection
  ) => {
    console.log(`   ## (AU) apply ${formatting} formatting to unique node`);
    const range = selection.getRangeAt(0);

    const onAddStyle = FORMATTING_STYLE[formatting][0];
    if (commonFormattingRef.current!.size > 0) {
      // # Parent element is a element
      const {
        startOffset,
        endOffset,
        startContainer: { parentElement },
      } = range;

      if (!parentElement) return;

      const parentStyle = parentElement?.getAttribute("style") || "";
      let computedStyle = parentStyle;

      const textColorFormattingPrefix: TextColorFormattingT = "color-";
      const bgColorFormattingPrefix: BgColorFormattingT = "bg-";
      if (
        formatting.startsWith(textColorFormattingPrefix) &&
        hasExistingTextColorStyle(computedStyle)
      ) {
        // remove existing text color style
        computedStyle = replaceTextColorStyle(computedStyle, "");
      } else if (
        formatting.startsWith(bgColorFormattingPrefix) &&
        hasExistingBgColorStyle(computedStyle)
      ) {
        // remove existing bg color style
        computedStyle = replaceBgColorStyle(computedStyle, "");
      }

      computedStyle = onAddStyle.concat(computedStyle);

      const parentText = parentElement.textContent || "";
      const selectedText = selection.toString();

      if (selectedText == parentText) {
        parentElement.setAttribute("style", computedStyle);
        return;
      }

      const cloneNodeWithData = makeCloneNodeWithData(parentElement);

      const newSelectedNode = cloneNodeWithData(selectedText, computedStyle);

      replaceElWith(parentElement, startOffset, endOffset, newSelectedNode)

      range.selectNodeContents(newSelectedNode.firstChild!);
      return;
    }

    // # Parent element is a text fragment
    const span = createFormattedSpan(onAddStyle);
    range.surroundContents(span);
    range.selectNodeContents(span.firstChild!);
  };

  const removeFormattingToMultipleNodes = (
    formatting: FormattingT,
    selection: Selection
  ) => {
    if (!selectedNodeFormattingStyleListRef.current) return;

    const range = selection.getRangeAt(0);
    const selectedNodes = range.cloneContents().childNodes;

    const mergedNodeList = new MergedNodeList.Builder(selectedNodes)
      .onBeforeMerging((node) => {
        if (node.nodeType == Node.ELEMENT_NODE) {
          const nodeStyle = getElAttrValue(node, "style");
          const nodeStyleSet = new Set(
            nodeStyle ? nodeStyle.replace(/;$/, "").split(";").toSorted() : []
          );
          const fStyle = FORMATTING_STYLE[formatting][0].replace(/;$/, "");
          if (nodeStyleSet.has(fStyle)) nodeStyleSet.delete(fStyle);

          if (nodeStyleSet.size == 0 && (node as HTMLElement).tagName == "SPAN")
            node = document.createTextNode(node.textContent || "");
          else
            (node as HTMLElement).setAttribute(
              "style",
              Array.from(nodeStyleSet).join(";")
            );
        }

        return node;
      })
      .onMatchesAsElement((prevNode, clonedNode) => ({
        adicionalCondition: compareElements(
          prevNode as HTMLElement,
          clonedNode as HTMLElement
        ),
      }))
      .build();

    // include new fomatting style in DOOM
    const frag = document.createDocumentFragment();
    range.extractContents();
    frag.append(...mergedNodeList.list);
    range.insertNode(frag);
  };

  const removeFormattingToUniqueNode = (
    formatting: FormattingT,
    selection: Selection
  ) => {
    console.log(`   ## (RU) remove ${formatting} formatting from unique node`);
    const range = selection.getRangeAt(0);
    const {
      startOffset,
      endOffset,
      startContainer: { parentElement },
    } = range;

    if (!parentElement) return;

    const parentText = parentElement.textContent || "";
    const parentStyle = parentElement.getAttribute("style") || "";
    const onRemoveStyle = FORMATTING_STYLE[formatting][0];

    const selectedText = selection.toString();

    let newStyle = parentStyle.replace(onRemoveStyle, "");
    if (newStyle.length == parentStyle.length)
      newStyle = parentStyle.replace(onRemoveStyle.replace(/;$/, ""), "");

    if (parentText == selectedText) {
      if (newStyle) {
        parentElement.setAttribute("style", newStyle);
        return;
      }

      const textNode = document.createTextNode(selection.toString());
      parentElement.replaceWith(textNode);
      range.selectNodeContents(textNode);
      return;
    }

    const cloneNodeWithData = makeCloneNodeWithData(parentElement);

    const selectedNode = newStyle ?
      cloneNodeWithData(selectedText, newStyle)
      : document.createTextNode(selectedText);

    replaceElWith(parentElement, startOffset, endOffset, selectedNode)

    range.selectNodeContents(
      selectedNode.nodeType == Node.ELEMENT_NODE
        ? selectedNode.firstChild!
        : selectedNode
    );
  };

  const replaceElWith = (el: HTMLElement, startOffset: number, endOffset: number, ...nodes: Node[]) => {
    console.log(el)
    console.log('nodes')
    nodes.forEach(n => console.log(n))

    const parentText = el.textContent;
    if (startOffset == 0)
      return el.before(...nodes);
    if (endOffset >= parentText.length)
      return el.after(...nodes);
    const parentStyle = el.getAttribute("style") || "";
    const cloneNodeWithData = makeCloneNodeWithData(el)
    const leftNode = cloneNodeWithData(
      parentText.substring(0, startOffset),
      parentStyle
    );
    const rightNode = cloneNodeWithData(
      parentText.substring(endOffset),
      parentStyle
    );
    el.replaceWith(leftNode, ...nodes, rightNode);

  }

  const getElAttrValue = (node: Node, attr: string) =>
    (node as HTMLElement).getAttribute(attr) || "";

  const createFormattedSpan = (style: string) => {
    const span = document.createElement("span");
    span.setAttribute("style", style);
    return span;
  };

  const makeCloneNodeWithData =
    (node: Node) => (text: string, styles: string) => {
      const nodeClone = node.cloneNode(true);
      (nodeClone as HTMLElement).setAttribute("style", styles);
      nodeClone.textContent = text;
      return nodeClone;
    };

  return (
    <TextSelectionCtx.Provider
      value={{
        onHideFActionMenuListener,
        inputIdRef,
        mergeInputChildrenByFormattingStyle,
        replaceElWith,
        defineInputInlineLinkHandlers,
        showTextFormattingActionMenu,
        selectedRange,
        onChangeBlockIndexRef,
        inlineUrlChangeData,
        hideTextFormattingActionMenu,
        commonFormattingRef,
        selectedNodeFormattingStyleListRef,
        applyRemoveFormatting,
        showInlineUrlChangeModal,
        hideInlineUrlChangeModal,
      }}
    >
      {children}
    </TextSelectionCtx.Provider>
  );
}
