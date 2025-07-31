import { usePageContent } from "@/hooks/usePageContent";
import {
  FORMATTING_STYLE,
  FormattingT,
  TextFormattingT,
  BgColorFormattingT,
  TextColorFormattingT,
} from "@/utils/constants";
import {
  compareStr,
  hasExistingBgColorStyle,
  hasExistingTextColorStyle,
  replaceBgColorStyle,
  replaceTextColorStyle,
} from "@/utils/functions";
import React from "react";

interface TextSelectionCtxProps {
  TextSelectionActionsRef: React.RefObject<HTMLDivElement | null>;
  showTextSelectionAction: (
    selectedRangePos: {
      left: number;
      top: number;
    },
    onChangeBlockIndex: number,
    inputId: string
  ) => void;
  onChangeBlockIndexRef: React.RefObject<number | null>;
  inputIdRef: React.RefObject<string | null>;
  closeTextSelectionAction: () => void;
  commonFormattingRef: React.RefObject<Set<FormattingT> | null>;
  selectedNodeFormattingStyleListRef: React.RefObject<string[] | null>;
  setupSelectedStyle: () => void;
  formattingActionBtnRefs: React.RefObject<
    Record<TextFormattingT | "color", HTMLButtonElement | null>
  >;
  applyRemoveFormatting(formatting: FormattingT): void;
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
  const TextSelectionActionsRef = React.useRef<HTMLDivElement>(null);
  const commonFormattingRef = React.useRef<Set<FormattingT>>(null);
  const selectedNodeFormattingStyleListRef = React.useRef<Array<string>>(null);
  const formattingActionBtnRefs = React.useRef<
    Record<TextFormattingT | "color", HTMLButtonElement | null>
  >({
    bold: null,
    italic: null,
    underline: null,
    "strike-through": null,
    color: null,
  });

  const { pageContent, changePageContentBlockListItem } = usePageContent();

  const showTextSelectionAction = (
    selectedRangePos: {
      left: number;
      top: number;
    },
    onChangeBlockIndex: number,
    inputId: string
  ) => {
    if (!TextSelectionActionsRef.current) return;
    onChangeBlockIndexRef.current = onChangeBlockIndex;
    inputIdRef.current = inputId;

    const TextSelectionActions = TextSelectionActionsRef.current;
    const decreaseLeftNumber = 30;

    TextSelectionActions.style.top =
      selectedRangePos.top -
      (TextSelectionActions.getBoundingClientRect().height + 10) +
      "px";
    TextSelectionActions.children[0].setAttribute(
      "style",
      `margin-left:${
        selectedRangePos.left - decreaseLeftNumber > 0
          ? selectedRangePos.left - decreaseLeftNumber
          : 0
      }px`
    );
    TextSelectionActions.style.opacity = "100%";
    TextSelectionActions.style.pointerEvents = "all";

    setupSelectedStyle();

    window.addEventListener("mousedown", closeTextSelectionAction);
  };

  // TODO: better name to this func
  const setupSelectedStyle = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);

    range
      .cloneContents()
      .childNodes.forEach((node) => console.log("          ", node));

    // get formatting styles from selected nodes
    selectedNodeFormattingStyleListRef.current = [];
    if (range.cloneContents().childNodes.length > 1) {
      const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return range.intersectsNode(node)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          },
        }
      );

      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        const nodeStyle = parent?.getAttribute("style") ?? "";

        selectedNodeFormattingStyleListRef.current.push(nodeStyle);
      }
    } else {
      selectedNodeFormattingStyleListRef.current = [
        range.startContainer.parentElement?.getAttribute("style") || "",
      ];
    }

    // find common styles from selected nodes
    commonFormattingRef.current = new Set();

    const colorFBtn = (formattingActionBtnRefs.current.color
      ?.getElementsByClassName("color-formatting-btn")
      .item(0) ||
      (() => {
        throw new Error("Color demo element is null!");
      })()) as HTMLElement;

    const textColorFormattingPrefix: TextColorFormattingT = "color-";
    const bgColorFormattingPrefix: BgColorFormattingT = "bg-";

    let hasTextColorFormatting = false;
    let hasBgColorFormatting = false;

    Object.entries(FORMATTING_STYLE).forEach(([fName, [fStyle]]) => {
      let count = 0;

      selectedNodeFormattingStyleListRef.current!.forEach((style) => {
        if (fName.startsWith(textColorFormattingPrefix)) {
          if (replaceBgColorStyle(style, "").includes(fStyle.replace(/;$/, "")))
            count++;
        } else if (style.includes(fStyle.replace(/;$/, ""))) count++;
      });

      let isCommonFormatting = false;

      if (
        count > 0 &&
        count == selectedNodeFormattingStyleListRef.current!.length
      ) {
        commonFormattingRef.current!.add(fName as FormattingT);
        isCommonFormatting = true;
      }

      // style color formatting button
      const colorFBtnStyles = colorFBtn.getAttribute("style") || "";
      if (
        fName.startsWith(textColorFormattingPrefix) &&
        isCommonFormatting &&
        !hasTextColorFormatting
      ) {
        colorFBtn.setAttribute(
          "style",
          hasExistingTextColorStyle(colorFBtnStyles)
            ? replaceTextColorStyle(colorFBtnStyles, fStyle)
            : fStyle.concat(colorFBtnStyles)
        );
        hasTextColorFormatting = true;
      } else if (
        fName.startsWith(bgColorFormattingPrefix) &&
        isCommonFormatting &&
        !hasBgColorFormatting
      ) {
        colorFBtn.setAttribute(
          "style",
          hasExistingBgColorStyle(colorFBtnStyles)
            ? replaceBgColorStyle(colorFBtnStyles, fStyle)
            : fStyle.concat(colorFBtnStyles)
        );
        hasBgColorFormatting = true;
      }

      // highlight text formatting buttons
      const fActionBtnRef =
        formattingActionBtnRefs.current[
          fName as keyof typeof formattingActionBtnRefs.current
        ];

      if (!!fActionBtnRef)
        fActionBtnRef.style.color = isCommonFormatting ? "#6479f0" : "#eeeeee";
    });

    if (!hasTextColorFormatting)
      colorFBtn.setAttribute(
        "style",
        replaceTextColorStyle(colorFBtn.getAttribute("style") || "", "")
      );
    if (!hasBgColorFormatting)
      colorFBtn.setAttribute(
        "style",
        replaceBgColorStyle(colorFBtn.getAttribute("style") || "", "")
      );

    console.log(
      "   setupSelectedStyle >> selectedNodeFormattingStyleListRef",
      selectedNodeFormattingStyleListRef.current
    );
    console.log(
      "   setupSelectedStyle >> commonFormattingRef",
      commonFormattingRef.current
    );
  };

  const closeTextSelectionAction = () => {
    if (!TextSelectionActionsRef.current) return;

    const TextSelectionActions = TextSelectionActionsRef.current;

    selectedNodeFormattingStyleListRef.current = [];
    commonFormattingRef.current = new Set();

    TextSelectionActions.style.opacity = "0";
    TextSelectionActions.style.pointerEvents = "none";
    window.removeEventListener("mousedown", closeTextSelectionAction);
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

    setupSelectedStyle();
    mergeEqualStyleElements();

    // update 'pageContent' with changed item
    const blockId = pageContent?.blockList[onChangeBlockIndexRef.current!].id;
    const blockEl = document
      .getElementById(blockId as string)
      ?.getElementsByClassName(inputIdRef.current!)
      .item(0);

    changePageContentBlockListItem(onChangeBlockIndexRef.current!, {
      text: blockEl!.innerHTML,
    });
  };

  const mergeEqualStyleElements = () => {
    const range = window.getSelection()?.getRangeAt(0);
    if (!range) return;

    const blockInputId = inputIdRef.current;
    if (!blockInputId) return;

    const blockInputEl = document.getElementsByClassName(blockInputId).item(0);
    if (!blockInputEl) return;

    // fragments: [nodeStyle, nodeTextContent]
    const mergedNodesData: [string, string][] = [];
    let currentIndex = 0;

    let startRangeOffset: number | null = null;
    let endRangeOffset: number | null = null;
    let includeWhiteSpaceInNext = false;
    const selectedNodeIndexList: number[] = [];
    blockInputEl.childNodes.forEach((node, index) => {
      const isSelectedNode = range.intersectsNode(node);

      const nodeStyle =
        node.nodeType === Node.ELEMENT_NODE
          ? (node as HTMLElement).getAttribute("style")!
          : "";
      let nodeTextContent = node.textContent || "";
      let nodeInnerHTML =
        (node.nodeType === Node.ELEMENT_NODE
          ? (node as HTMLElement).innerHTML
          : new XMLSerializer().serializeToString(node)) || "";

      if (nodeTextContent == "") return;

      if (includeWhiteSpaceInNext) {
        nodeInnerHTML = " " + nodeInnerHTML;
        nodeTextContent = " " + nodeTextContent;
        includeWhiteSpaceInNext = false;
      }
      if (index == 0 || mergedNodesData.length == 0) {
        mergedNodesData.push([nodeStyle, nodeInnerHTML]);
        if (isSelectedNode) {
          if (!startRangeOffset) startRangeOffset = 0;
          endRangeOffset = nodeTextContent.length;
        }
      } else if (nodeTextContent == " ") {
        includeWhiteSpaceInNext = true;
      } else if (
        compareStr(
          nodeStyle.replace(/;$/, ""),
          mergedNodesData[currentIndex][0].replace(/;$/, "")
        )
      ) {
        if (isSelectedNode) {
          if (!startRangeOffset) {
            // 'temSpan' get the serialized text to get start and end range offset with precision
            const temSpan = document.createElement("span");
            temSpan.innerHTML = mergedNodesData[currentIndex][1];
            startRangeOffset = (temSpan.textContent || "").length;
          }
          endRangeOffset =
            mergedNodesData[currentIndex][1].concat(nodeTextContent).length;
        }

        mergedNodesData[currentIndex][1] += nodeInnerHTML;
      } else {
        mergedNodesData.push([nodeStyle, nodeInnerHTML]);
        currentIndex++;
        if (isSelectedNode) {
          if (!startRangeOffset) startRangeOffset = 0;
          endRangeOffset = nodeTextContent.length;
        }
      }
      if (isSelectedNode) selectedNodeIndexList.push(currentIndex);
    });
    const nodeListFrag = document.createDocumentFragment();
    nodeListFrag.append(
      ...mergedNodesData.map((data) => {
        if (data[0] == "") {
          return document.createTextNode(data[1]);
        }
        const span = document.createElement("span");
        span.textContent = data[1];
        span.setAttribute("style", data[0]);
        return span;
      })
    );

    blockInputEl.innerHTML = mergedNodesData
      .map((data) => {
        if (data[0] == "") {
          return data[1];
        }
        return `<span style="${data[0]}">${data[1]}</span>`;
      })
      .join("");

    if (
      selectedNodeIndexList.length > 0 &&
      startRangeOffset != null &&
      endRangeOffset != null
    ) {
      const startRangeNode = blockInputEl.childNodes.item(
        selectedNodeIndexList.at(0)!
      );
      const endRangeNode = blockInputEl.childNodes.item(
        selectedNodeIndexList.at(-1)!
      );
      range.setStart(startRangeNode.firstChild!, startRangeOffset);
      range.setEnd(endRangeNode.firstChild!, endRangeOffset);
    }
  };

  const applyFormattingToMultipleNodes = (
    formatting: FormattingT,
    selection: Selection
  ) => {
    console.log(`   ## (AM) apply ${formatting} formatting to multiple nodes`);
    if (!selectedNodeFormattingStyleListRef.current) return;
    const selectedNodeFormattingStyleList =
      selectedNodeFormattingStyleListRef.current;

    const range = selection.getRangeAt(0);
    const selectedNodes = range.cloneContents().childNodes;

    // apply formatting styles and merge duplicated formatting style elements
    const textColorFormattingPrefix: TextColorFormattingT = "color-";
    const bgColorFormattingPrefix: BgColorFormattingT = "bg-";
    const mergedNodesData: [string, string][] = [];
    let currentIndex = 0;
    selectedNodes.forEach((node, index) => {
      let nodeStyle =
        node.nodeType == Node.ELEMENT_NODE
          ? selectedNodeFormattingStyleList[index]
          : "";

      const fStile = FORMATTING_STYLE[formatting][0];

      // code snippets for applying
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

      const nodeTextContent = node.textContent || "";

      // code snippets for merging
      if (index == 0) {
        mergedNodesData[currentIndex] = [nodeStyle, nodeTextContent];
      } else if (
        compareStr(
          nodeStyle.replace(/;$/, ""),
          mergedNodesData[currentIndex][0].replace(/;$/, "")
        )
      ) {
        mergedNodesData[currentIndex][1] += nodeTextContent;
      } else {
        currentIndex++;
        mergedNodesData[currentIndex] = [nodeStyle, nodeTextContent];
      }
    });

    // include new fotmatting style in DOOM
    const frag = document.createDocumentFragment();
    range.extractContents();
    mergedNodesData.forEach((data) => {
      const [style, textContent] = data;
      const span = createFormattedSpan(style);
      span.textContent = textContent;
      frag.appendChild(span);
    });

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
      // # Parent element is a <span> element
      const {
        startOffset,
        endOffset,
        startContainer: { parentElement: parentEl },
      } = range;

      const parentStyle = parentEl?.getAttribute("style") || "";
      let finalStyles = parentStyle;

      const textColorFormattingPrefix: TextColorFormattingT = "color-";
      const bgColorFormattingPrefix: BgColorFormattingT = "bg-";

      if (
        formatting.startsWith(textColorFormattingPrefix) &&
        hasExistingTextColorStyle(finalStyles)
      ) {
        // remove existing text color style
        finalStyles = replaceTextColorStyle(finalStyles, "");
      } else if (
        formatting.startsWith(bgColorFormattingPrefix) &&
        hasExistingBgColorStyle(finalStyles)
      ) {
        // remove existing bg color style
        finalStyles = replaceBgColorStyle(finalStyles, "");
      }

      finalStyles = onAddStyle.concat(finalStyles);

      const parentText = parentEl!.textContent || "";
      const selectedText = parentText.slice(startOffset, endOffset);

      const getSlicedText = makeGetSlicedText(parentText);

      if (selectedText == parentText) {
        // all span element was selected
        parentEl!.setAttribute("style", finalStyles);
        return;
      }

      // ## fragments parent element to add the selected formatting style to selected range
      const frag = document.createDocumentFragment();
      let newSelectedNode: HTMLElement;

      if (startOffset == 0) {
        // ### fragments parent in 2 <span> elements
        const leftSpan = createFormattedSpan(finalStyles);
        leftSpan.textContent = selectedText;

        const rightSpan = createFormattedSpan(parentStyle);
        rightSpan.textContent = getSlicedText(endOffset);

        frag.append(leftSpan, rightSpan);
        newSelectedNode = leftSpan;
      } else if (endOffset == parentText.length) {
        // ### fragments parent in 2 <span> elements
        const leftSpan = createFormattedSpan(parentStyle);
        leftSpan.textContent = getSlicedText(0, startOffset);

        const rightSpan = createFormattedSpan(finalStyles);
        rightSpan.textContent = selectedText;

        frag.append(leftSpan, rightSpan);
        newSelectedNode = rightSpan;
      } else {
        // ### fragments parent in 3 <span> elements
        const leftSpan = createFormattedSpan(parentStyle);
        leftSpan.textContent = getSlicedText(0, startOffset);

        const middleSpan = createFormattedSpan(finalStyles);
        middleSpan.textContent = selectedText;

        const rightSpan = createFormattedSpan(parentStyle);
        rightSpan.textContent = getSlicedText(endOffset);

        frag.append(leftSpan, middleSpan, rightSpan);
        newSelectedNode = middleSpan;
      }

      parentEl?.replaceWith(frag);
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
    const selectedNodeFormattingStyleList =
      selectedNodeFormattingStyleListRef.current;

    const range = selection.getRangeAt(0);
    const selectedNodes = range.cloneContents().childNodes;

    // remove formatting styles and merge duplicated formatting style elements
    const mergedNodesData: [string, string][] = [];
    let currentIndex = 0;
    selectedNodes.forEach((node, index) => {
      const nodeStyleSet = new Set(
        node.nodeType == Node.ELEMENT_NODE
          ? selectedNodeFormattingStyleList[index]
              .replace(/;$/, "")
              .split(";")
              .toSorted()
          : []
      );

      const fStyle = FORMATTING_STYLE[formatting][0].replace(/;$/, "");
      const nodeText = node.textContent || "";

      // code snippets for removing
      if (nodeStyleSet.has(fStyle)) nodeStyleSet.delete(fStyle);

      // code snippets for merging
      const nodeStyleStr = Array.from(nodeStyleSet).join(";");
      if (index == 0) {
        mergedNodesData[currentIndex] = [nodeStyleStr, nodeText];
      } else if (nodeStyleStr == mergedNodesData[currentIndex][0]) {
        mergedNodesData[currentIndex][1] += nodeText;
      } else {
        currentIndex++;
        mergedNodesData[currentIndex] = [nodeStyleStr, nodeText];
      }
    });

    // include new fomatting style in DOOM
    const frag = document.createDocumentFragment();
    range.extractContents();
    mergedNodesData.forEach((data) => {
      const [fStyle, textContent] = data;
      if (fStyle !== "") {
        const span = createFormattedSpan(fStyle);
        span.textContent = textContent;
        frag.appendChild(span);
        return;
      }

      const textFrag = document.createDocumentFragment();
      textFrag.textContent = textContent;

      frag.appendChild(textFrag);
    });

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
      startContainer: { parentElement: parentEl },
    } = range;

    if (!parentEl)
      throw new Error(
        "removeFormattingToUniqueNode func must be used only in node type == 1"
      );

    const parentText = parentEl.textContent || "";
    const parentStyle = parentEl.getAttribute("style") || "";
    const frag = document.createDocumentFragment();

    const getSlicedText = makeGetSlicedText(parentText);
    const isAllParentTextSelected =
      parentText == getSlicedText(startOffset, endOffset);

    if (commonFormattingRef.current!.size > 1) {
      // will result in 2-3 <span> elements

      const onRemoveStyle = FORMATTING_STYLE[formatting][0];

      // ensure no trailing semicolon
      let newStyle = parentStyle.replace(onRemoveStyle, "");
      if (newStyle.length == parentStyle.length)
        newStyle = parentStyle.replace(onRemoveStyle.replace(/;$/, ""), "");

      if (isAllParentTextSelected) {
        parentEl.setAttribute("style", newStyle);
        return;
      }

      // ## fragments parent element to remove the selected formatting style from selected range

      let newSelectedNode: HTMLElement;

      if (startOffset == 0) {
        // ### fragments parent in 2 <span> elements
        const leftSpan = createFormattedSpan(newStyle);
        leftSpan.textContent = getSlicedText(0, endOffset);

        const rightSpan = createFormattedSpan(parentStyle);
        rightSpan.textContent = getSlicedText(endOffset);

        frag.append(leftSpan, rightSpan);
        newSelectedNode = leftSpan;
      } else if (endOffset == parentText.length) {
        // ### fragments parent in 2 <span> elements
        const leftSpan = createFormattedSpan(parentStyle);
        leftSpan.textContent = getSlicedText(0, startOffset);

        const rightSpan = createFormattedSpan(newStyle);
        rightSpan.textContent = range.extractContents().textContent;

        frag.append(leftSpan, rightSpan);
        newSelectedNode = rightSpan;
      } else {
        // ### fragments parent in 3 <span> elements
        const leftSpan = createFormattedSpan(parentStyle);
        leftSpan.textContent = getSlicedText(0, startOffset);

        const middleSpan = createFormattedSpan(newStyle);
        middleSpan.textContent = range.extractContents().textContent;

        const rightSpan = createFormattedSpan(parentStyle);
        rightSpan.textContent = getSlicedText(endOffset);

        frag.append(leftSpan, middleSpan, rightSpan);
        newSelectedNode = middleSpan;
      }

      parentEl.replaceWith(frag);
      range.selectNodeContents(newSelectedNode.firstChild!);
      return;
    }
    // will result in 1 text node and 1-2 <span> elements

    if (isAllParentTextSelected) {
      const textNode = document.createTextNode(selection.toString());
      parentEl.replaceWith(textNode);
      range.selectNodeContents(textNode);
      return;
    }

    let newSelectedNode: Text;
    if (startOffset == 0) {
      // ## fragments parent in 1 text node and 1 span element
      const textNode = document.createTextNode(getSlicedText(0, endOffset));

      const endPart = createFormattedSpan(parentStyle);
      endPart.textContent = getSlicedText(endOffset);

      frag.append(textNode, endPart);
      newSelectedNode = textNode;
    } else if (endOffset == parentText.length) {
      // ## fragments parent in 1 span element and 1 text node
      const startPart = createFormattedSpan(parentStyle);
      startPart.textContent = getSlicedText(0, startOffset);

      const textNode = document.createTextNode(getSlicedText(startOffset));

      frag.append(startPart, textNode);
      newSelectedNode = textNode;
    } else {
      // ## fragments parent in 2 <span> elements and 1 text node beetwen them
      const leftSpan = createFormattedSpan(parentStyle);
      leftSpan.textContent = getSlicedText(0, startOffset);

      const middle = document.createTextNode(selection.toString());

      const rightSpan = createFormattedSpan(parentStyle);
      rightSpan.textContent = getSlicedText(endOffset);

      frag.append(leftSpan, middle, rightSpan);
      newSelectedNode = middle;
    }

    parentEl.replaceWith(frag);
    range.selectNodeContents(newSelectedNode);
  };

  const createFormattedSpan = (style: string) => {
    const span = document.createElement("span");
    span.setAttribute("style", style);
    return span;
  };

  const makeGetSlicedText =
    (text: string) => (startIndex?: number, endIndex?: number) =>
      text.slice(startIndex, endIndex);

  return (
    <TextSelectionCtx.Provider
      value={{
        formattingActionBtnRefs,
        inputIdRef,
        TextSelectionActionsRef,
        showTextSelectionAction,
        onChangeBlockIndexRef,
        closeTextSelectionAction,
        commonFormattingRef,
        setupSelectedStyle,
        selectedNodeFormattingStyleListRef,
        applyRemoveFormatting,
      }}
    >
      {children}
    </TextSelectionCtx.Provider>
  );
}
