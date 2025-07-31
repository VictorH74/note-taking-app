import { usePageContent } from "@/hooks/usePageContent";
import {
  FORMATTING_STYLE,
  FormattingT,
  TextFormattingT,
  TEXT_FORMATTING_NAME_LIST,
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

      if (
        count > 0 &&
        count == selectedNodeFormattingStyleListRef.current!.length
      ) {
        commonFormattingRef.current!.add(fName as FormattingT);
      }

      const isCommonFormatting = commonFormattingRef.current?.has(
        fName as FormattingT
      );

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
            ? replaceTextColorStyle(colorFBtnStyles, fStyle[0])
            : colorFBtnStyles.concat(fStyle[0])
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
            ? replaceBgColorStyle(colorFBtnStyles, fStyle[0])
            : colorFBtnStyles.concat(fStyle[0])
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

  // TODO: when totally usable, check result in DOOM
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
    mergeElements();

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

  // TODO: may be better if called when 'closeTextSelectionAction' is called
  const mergeElements = () => {
    const range = window.getSelection()?.getRangeAt(0);
    if (!range) return;

    const blockInputId = inputIdRef.current;
    if (!blockInputId) return;

    const blockInputEl = document.getElementsByClassName(blockInputId).item(0);
    if (!blockInputEl) return;

    // fragments: [nodeStyle, nodeTextContent]
    const fragments: [string, string][] = [];
    let currentIndex = 0;

    let startRangeOffset: number | null = null;
    let endRangeOffset: number | null = null;
    const selectedNodeIndexList: number[] = [];
    blockInputEl.childNodes.forEach((node, index) => {
      const isSelectedNode = range.intersectsNode(node);

      const nodeStyle =
        node.nodeType === Node.ELEMENT_NODE
          ? (node as HTMLElement).getAttribute("style") || ""
          : "";
      const nodeTextContent = node.textContent || "";
      const nodeInnerHTML =
        (node.nodeType === Node.ELEMENT_NODE
          ? (node as HTMLElement).innerHTML
          : new XMLSerializer().serializeToString(node)) || "";

      if (nodeTextContent == "") return;

      if (index == 0) {
        fragments.push([nodeStyle, nodeInnerHTML]);
        if (isSelectedNode) {
          if (!startRangeOffset) startRangeOffset = 0;
          endRangeOffset = nodeTextContent.length;
          console.log(startRangeOffset, endRangeOffset);
        }
      } else if (
        compareStr(
          nodeStyle.replace(/;$/, ""),
          fragments[currentIndex][0].replace(/;$/, "")
        )
      ) {
        if (isSelectedNode) {
          if (!startRangeOffset) {
            // 'temSpan' get the serialized text to get start and end range offset with precision
            const temSpan = document.createElement("span");
            temSpan.innerHTML = fragments[currentIndex][1];
            startRangeOffset = (temSpan.textContent || "").length;
          }
          endRangeOffset =
            fragments[currentIndex][1].concat(nodeTextContent).length;
          console.log(startRangeOffset, endRangeOffset);
        }

        fragments[currentIndex][1] += nodeInnerHTML;
      } else {
        fragments.push([nodeStyle, nodeInnerHTML]);
        currentIndex++;
        if (isSelectedNode) {
          if (!startRangeOffset) startRangeOffset = 0;
          endRangeOffset = nodeTextContent.length;
        }
      }
      if (isSelectedNode) {
        selectedNodeIndexList.push(currentIndex);
      }
    });

    const nodeListFrag = document.createDocumentFragment();
    nodeListFrag.append(
      ...fragments.map((data) => {
        if (data[0] == "") {
          return document.createTextNode(data[1]);
        }
        const span = document.createElement("span");
        span.textContent = data[1];
        span.setAttribute("style", data[0]);
        return span;
      })
    );

    console.log(fragments);
    console.log(
      fragments
        .map((data) => {
          if (data[0] == "") {
            return data[1];
          }
          return `<span style="${data[0]}">${data[1]}</span>`;
        })
        .join("")
    );
    console.log(selectedNodeIndexList);
    if (startRangeOffset && endRangeOffset)
      console.log(
        selectedNodeIndexList.map((index) => fragments[index][1]).join(""),
        startRangeOffset,
        endRangeOffset
      );

    blockInputEl.innerHTML = fragments
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

  // TODO: override color formatting
  const applyFormattingToMultipleNodes = (
    formatting: FormattingT,
    selection: Selection
  ) => {
    console.log(`   ## apply ${formatting} formatting to multiple nodes`);
    if (!selectedNodeFormattingStyleListRef.current) return;
    let currentIndex = 0;

    const frag = document.createDocumentFragment();

    const range = selection.getRangeAt(0);
    const selectedNodes = range.cloneContents().childNodes;

    // apply formatting styles and merge duplicated formatting style elements
    const formattingDataList: [string, string][] = [];
    selectedNodes.forEach((node, index) => {
      let nodeStyle =
        node.nodeType == 1
          ? selectedNodeFormattingStyleListRef.current![index]
          : "";

      const fStile = FORMATTING_STYLE[formatting][0];

      // code snippets for applying
      if (!nodeStyle.includes(fStile.replace(/;$/, "")))
        nodeStyle = fStile.concat(nodeStyle);

      const nodeTextContent = node.textContent || "";

      // code snippets for merging
      if (index == 0) {
        formattingDataList[currentIndex] = [nodeStyle, nodeTextContent];
        return;
      }

      // slice func is used to ignore trailing semicolon in the compareStr func
      if (
        compareStr(
          nodeStyle.replaceAll(";", ""),
          formattingDataList[currentIndex][0].replaceAll(";", "")
        )
      ) {
        formattingDataList[currentIndex][1] += nodeTextContent;
        return;
      }
      currentIndex++;
      formattingDataList[currentIndex] = [nodeStyle, nodeTextContent];
    });

    // include new fotmatting style in DOOM
    range.extractContents();
    formattingDataList.forEach((data) => {
      const [style, textContent] = data;
      const span = createSpanElWithStyle(style);
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

      let parentStyle = parentEl?.getAttribute("style") || "";

      if (
        !(TEXT_FORMATTING_NAME_LIST as readonly string[]).includes(formatting)
      ) {
        const textColorFormattingPrefix: TextColorFormattingT = "color-";
        const bgColorFormattingPrefix: BgColorFormattingT = "bg-";
        if (
          formatting.startsWith(textColorFormattingPrefix) &&
          hasExistingTextColorStyle(parentStyle)
        ) {
          // remove existing text color style
          parentStyle = replaceTextColorStyle(parentStyle, "");
        } else if (
          formatting.startsWith(bgColorFormattingPrefix) &&
          hasExistingBgColorStyle(parentStyle)
        ) {
          // remove existing bg color style
          parentStyle = replaceBgColorStyle(parentStyle, "");
        }
      }

      const parentTextContent = parentEl!.textContent || "";
      const selectedTextContent = parentTextContent.slice(
        startOffset,
        endOffset
      );

      if (selectedTextContent == parentTextContent) {
        // all span element was selected
        parentEl!.setAttribute("style", onAddStyle.concat(parentStyle));
        return;
      }

      // ## fragment parent element to add the selected formatting style to selected range
      const frag = document.createDocumentFragment();
      let newSelectedNode: HTMLElement;

      if (startOffset == 0) {
        // ### fragment parent in 2 <span> elements
        const leftSpan = createSpanElWithStyle(onAddStyle.concat(parentStyle));
        leftSpan.textContent = selectedTextContent;

        const rightSpan = createSpanElWithStyle(parentStyle);
        rightSpan.textContent = parentTextContent.slice(endOffset);

        frag.append(leftSpan, rightSpan);
        newSelectedNode = leftSpan;
      } else if (endOffset == parentTextContent.length) {
        // ### fragment parent in 2 <span> elements
        const leftSpan = createSpanElWithStyle(parentStyle);
        leftSpan.textContent = parentTextContent.slice(0, startOffset);

        const rightSpan = createSpanElWithStyle(onAddStyle.concat(parentStyle));
        rightSpan.textContent = selectedTextContent;

        frag.append(leftSpan, rightSpan);
        newSelectedNode = rightSpan;
      } else {
        // ### fragment parent in 3 <span> elements
        const leftSpan = createSpanElWithStyle(parentStyle);
        leftSpan.textContent = parentTextContent.slice(0, startOffset);

        const middleSpan = createSpanElWithStyle(
          onAddStyle.concat(parentStyle)
        );
        middleSpan.textContent = selectedTextContent;

        const rightSpan = createSpanElWithStyle(parentStyle);
        rightSpan.textContent = parentTextContent.slice(endOffset);

        frag.append(leftSpan, middleSpan, rightSpan);
        newSelectedNode = middleSpan;
      }

      parentEl?.replaceWith(frag);
      range.selectNodeContents(newSelectedNode.firstChild!);
      return;
    }

    console.log("aaaaaa");

    // # Parent element is a text fragment
    const span = createSpanElWithStyle(onAddStyle);
    range.surroundContents(span);
    range.selectNodeContents(span.firstChild!);
  };

  const removeFormattingToMultipleNodes = (
    formatting: FormattingT,
    selection: Selection
  ) => {
    let currentIndex = 0;
    const frag = document.createDocumentFragment();
    const fragDataList: [string, string][] = [];

    const range = selection.getRangeAt(0);
    const selectedNodes = range.cloneContents().childNodes;

    // remove formatting styles and merge duplicated formatting style elements
    selectedNodes.forEach((node, index) => {
      const nodeStyleSet = new Set(
        // TODO: make this array generation more clean
        node.nodeType == 1
          ? selectedNodeFormattingStyleListRef
              .current![index].slice(
                0,
                selectedNodeFormattingStyleListRef.current![index].endsWith(";")
                  ? -1
                  : selectedNodeFormattingStyleListRef.current![index].length
              )
              .split(";")
              .map((str) => str.concat(";"))
              .toSorted()
          : []
      );

      const fStyle = FORMATTING_STYLE[formatting][0];

      // code snippets for removing
      if (nodeStyleSet.has(fStyle)) {
        nodeStyleSet.delete(fStyle);
      }

      // code snippets for merging
      const nodeStyleStr = Array.from(nodeStyleSet).join("");
      if (index == 0) {
        fragDataList[currentIndex] = [nodeStyleStr, node.textContent || ""];
        return;
      }
      if (nodeStyleStr == fragDataList[currentIndex][0]) {
        fragDataList[currentIndex][1] += node.textContent || "";
        return;
      }
      currentIndex++;
      fragDataList[currentIndex] = [nodeStyleStr || "", node.textContent || ""];
    });

    // include new fomatting style in DOOM
    range.extractContents();
    fragDataList.forEach((data) => {
      const [fStyle, textContent] = data;
      if (fStyle !== "") {
        const span = createSpanElWithStyle(fStyle);
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

    const textContent = parentEl.textContent || "";
    const parentStyle = parentEl.getAttribute("style") || "";
    const frag = document.createDocumentFragment();

    const allParentTextContentSelected =
      textContent == textContent.slice(startOffset, endOffset);

    if (commonFormattingRef.current!.size > 1) {
      const onRemoveStyle = FORMATTING_STYLE[formatting][0];

      // ensure no trailing semicolon
      let newStyle = parentStyle.replace(onRemoveStyle, "");
      if (newStyle.length == parentStyle.length)
        newStyle = parentStyle.replace(onRemoveStyle.replace(/;$/, ""), "");

      if (allParentTextContentSelected) {
        console.log(
          `>>>> (RUAA) remove ${formatting} formatting from unique <span> node that have all content selected`
        );

        parentEl.setAttribute("style", newStyle);
        return;
      }

      // ## fragment parent element to remove the selected formatting style from selected range

      let newSelectedNode: HTMLElement;

      if (startOffset == 0) {
        // ### fragment parent in 2 <span> elements
        console.log(
          `>>>> (RUAB) remove ${formatting} formatting of start part from unique <span> node`
        );
        const leftSpan = createSpanElWithStyle(newStyle);
        leftSpan.textContent = textContent.slice(0, endOffset);

        const rightSpan = createSpanElWithStyle(parentStyle);
        rightSpan.textContent = textContent.slice(endOffset);

        frag.append(leftSpan, rightSpan);
        newSelectedNode = leftSpan;
      } else if (endOffset == textContent.length) {
        console.log(
          `>>>> (RUAC) remove ${formatting} formatting of end part from unique <span> node`
        );
        // ### fragment parent in 2 <span> elements
        const leftSpan = createSpanElWithStyle(parentStyle);
        leftSpan.textContent = textContent.slice(0, startOffset);

        const rightSpan = createSpanElWithStyle(newStyle);
        rightSpan.textContent = range.extractContents().textContent;

        frag.append(leftSpan, rightSpan);
        newSelectedNode = rightSpan;
      } else {
        console.log(
          `>>>> (RUAD) remove ${formatting} formatting of middle part from unique <span> node`
        );
        // ### fragment parent in 3 <span> elements
        const leftSpan = createSpanElWithStyle(parentStyle);
        leftSpan.textContent = textContent.slice(0, startOffset);

        const middleSpan = createSpanElWithStyle(newStyle);
        middleSpan.textContent = range.extractContents().textContent;

        const rightSpan = createSpanElWithStyle(parentStyle);
        rightSpan.textContent = textContent.slice(endOffset);

        frag.append(leftSpan, middleSpan, rightSpan);
        newSelectedNode = middleSpan;
      }

      parentEl.replaceWith(frag);
      range.selectNodeContents(newSelectedNode.firstChild!);
      return;
    }

    if (allParentTextContentSelected) {
      console.log(
        `>>>> (RUBA) remove ${formatting} formatting from unique <span> node that have all content selected`
      );

      const textNode = document.createTextNode(selection.toString());
      parentEl.replaceWith(textNode);
      range.selectNodeContents(textNode);
      return;
    }

    let newSelectedNode: Text;
    if (startOffset == 0) {
      console.log(
        `>>>> (RUBB) remove ${formatting} formatting of start part from unique <span> node`
      );
      // ## fragment parent in 1 text node and 1 span element
      const textNode = document.createTextNode(textContent.slice(0, endOffset));

      const endPart = createSpanElWithStyle(parentStyle);
      endPart.textContent = textContent.slice(endOffset);

      frag.append(textNode, endPart);
      newSelectedNode = textNode;
    } else if (endOffset == textContent.length) {
      console.log(
        `>>>> (RUBC) remove ${formatting} formatting of end part from unique <span> node`
      );
      // ## fragment parent in 1 span element and 1 text node
      const startPart = createSpanElWithStyle(parentStyle);
      startPart.textContent = textContent.slice(0, startOffset);

      const textNode = document.createTextNode(textContent.slice(startOffset));

      frag.append(startPart, textNode);
      newSelectedNode = textNode;
    } else {
      console.log(
        `>>>> (RUBD) remove ${formatting} formatting of middle part from unique <span> node`
      );
      // ## fragment parent in 2 <span> elements and 1 text node beetwen them
      console.log(`### 3 parts ###`);
      const leftSpan = createSpanElWithStyle(parentStyle);
      leftSpan.textContent = textContent.slice(0, startOffset);

      const middleTextNode = document.createTextNode(selection.toString());

      const rightSpan = createSpanElWithStyle(parentStyle);
      rightSpan.textContent = textContent.slice(endOffset);

      frag.append(leftSpan, middleTextNode, rightSpan);
      newSelectedNode = middleTextNode;
    }

    parentEl.replaceWith(frag);
    range.selectNodeContents(newSelectedNode);
  };

  const createSpanElWithStyle = (style: string) => {
    const span = document.createElement("span");
    span.setAttribute("style", style);
    return span;
  };

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
