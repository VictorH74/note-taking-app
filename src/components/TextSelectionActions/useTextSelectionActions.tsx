import { usePageContent } from "@/hooks/usePageContent";
import { useTextSelection } from "@/hooks/useTextSelection";
import { FORMATTING_STYLE, FormattingT } from "@/utils/constants";
import { compareStr } from "@/utils/functions";
import React from "react";

type ActionBtnDataListT = {
  label: string;
  className: string;
  onClick(): void;
  ref?: (el: HTMLButtonElement) => void;
};

// TODO: depois da execuçãp de qualquer função de format., verificar na elemento pai todos as childrens para mesclar elementos com o mesmo estilo de format.
export const useTextSelectionActions = () => {
  // const formattingActionBtnRefList = React.useRef(FORMATTING_NAME_LIST.map(() => React.createRef()))
  // const formattingActionBtnRefs = React.useRef<HTMLButtonElement[]>([]);
  const {
    TextSelectionActionsRef,
    closeTextSelectionAction,
    selectedNodeFormattingStyleListRef,
    commonFormattingRef,
    setupSelectedStyle,
    onChangeBlockIndexRef,
    formattingActionBtnRefs,
  } = useTextSelection();
  const { pageContentRef, changePageContentRefListItem } = usePageContent();

  const actionBtnDataList = React.useMemo<ActionBtnDataListT[]>(
    () => [
      {
        label: "copy",
        className: "font-semibold px-2",
        onClick: () => {},
      },
      {
        label: "paste",
        className: "font-semibold px-2",
        onClick: () => {},
      },
      {
        label: "b",
        className: "uppercase font-extrabold",
        onClick: () => {
          applyRemoveFormatting("bold");
        },
        ref: (el) => {
          formattingActionBtnRefs.current.bold = el;
        },
      },
      {
        label: "i",
        className: "uppercase font-medium italic",
        onClick: () => {
          applyRemoveFormatting("italic");
        },
        ref: (el) => {
          formattingActionBtnRefs.current.italic = el;
        },
      },
      {
        label: "s",
        className: "uppercase font-medium line-through",
        onClick: () => {
          applyRemoveFormatting("strike-through");
        },
        ref: (el) => {
          formattingActionBtnRefs.current["strike-through"] = el;
        },
      },
      {
        label: "u",
        className: "uppercase font-medium underline",
        onClick: () => {
          applyRemoveFormatting("underline");
        },
        ref: (el) => {
          formattingActionBtnRefs.current.underline = el;
        },
      },
      {
        label: "a",
        className: "uppercase font-medium",
        onClick: () => {
          // TODO: implement color selector and call 'applyRemoveFormatting("color", selectedColor);'
        },
        ref: () => {
          // formattingActionBtnRefs.current[4] = el;
        },
      },
    ],
    []
  );

  // TODO: when totally usable, check result in DOOM
  const applyRemoveFormatting = (formatting: FormattingT) => {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString();
    if (!selectedText) return;

    console.log(
      ">> applyRemoveFormatting func:",
      `(${formatting})`,
      selectedText
    );

    const range = selection.getRangeAt(0);

    const selectedNodes = range.cloneContents().childNodes;

    console.log(`     nodes: (${selectedNodes.length})`);
    selectedNodes.forEach((node) => console.log("     ", node));

    if (selectedNodes.length > 1) {
      console.log("   multiple node");

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

    // update 'pageContentRef' with changed item
    if (onChangeBlockIndexRef.current) {
      const blockId =
        pageContentRef.current?.blockList[onChangeBlockIndexRef.current].id;
      const blockEl = document.getElementById(blockId as string);

      changePageContentRefListItem(onChangeBlockIndexRef.current, {
        text: blockEl!.innerHTML,
      });
    }
  };

  // TODO: may be better if called when 'closeTextSelectionAction' is called
  const mergeElements = () => {
    // const paragraphId = window
    //   .getSelection()
    //   ?.getRangeAt(0)
    //   .commonAncestorContainer.parentElement?.getAttribute("id");
    // if (!paragraphId) return;
    // const p = document.getElementById("content-2");
    // if (!p) return;
    // const fragments: [string, boolean, string][] = [];
    // p.childNodes.forEach((node) => {
    //   if (node.nodeType === Node.TEXT_NODE) {
    //     const txt = node.textContent || "";
    //     if (txt.trim()) fragments.push([txt, false, ""]);
    //   } else if (node.nodeType === Node.ELEMENT_NODE) {
    //     const el = node as HTMLElement;
    //     fragments.push([
    //       el.textContent || "",
    //       true,
    //       el.getAttribute("style") || "",
    //     ]);
    //   }
    // });
    // console.log(fragments);
    // ################################################################
    // const styleDataList: [string, string][] = [];
    // const currentIndex = 0;
    //   selection
    //     .getRangeAt(0)
    //     .commonAncestorContainer.childNodes.forEach((node, index) => {
    //       const nodeStyle =
    //         node.nodeType == 3
    //           ? ""
    //           : node.parentElement?.getAttribute("style") || "";
    //       console.log(node.nodeType, nodeStyle, node.textContent, node.parentElement);
    //       if (index == 0) {
    //         styleDataList[currentIndex] = [nodeStyle, node.textContent || ""];
    //         return;
    //       }
    //       if (nodeStyle == styleDataList[currentIndex][0]) {
    //         styleDataList[currentIndex][1] += node.textContent || "";
    //         return;
    //       }
    //       currentIndex++;
    //       styleDataList[currentIndex] = [nodeStyle, node.textContent || ""];
    //     });
    //   // console.log(styleDataList);
  };

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

      // code snippets for applying
      if (!nodeStyle.includes(FORMATTING_STYLE[formatting].slice(0, -1)))
        nodeStyle = FORMATTING_STYLE[formatting].concat(nodeStyle);

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

    console.log(frag.firstChild?.firstChild);

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
    const onAddStyle = FORMATTING_STYLE[formatting];

    if (commonFormattingRef.current!.size > 0) {
      // # Parent element is a <span> element
      const {
        startOffset,
        endOffset,
        startContainer: { parentElement: parentEl },
      } = range;

      const parentStyle = parentEl?.getAttribute("style") || "";
      const parentTextContent = parentEl?.textContent || "";
      const selectedTextContent = parentTextContent.slice(
        startOffset,
        endOffset
      );

      if (selectedTextContent == parentTextContent) {
        parentEl?.setAttribute("style", onAddStyle.concat(parentStyle));
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

      // code snippets for removing
      if (nodeStyleSet.has(FORMATTING_STYLE[formatting])) {
        nodeStyleSet.delete(FORMATTING_STYLE[formatting]);
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
      const onRemoveStyle = FORMATTING_STYLE[formatting];

      if (allParentTextContentSelected) {
        console.log(
          `>>>> (RUAA) remove ${formatting} formatting from unique <span> node that have all content selected`
        );
        parentEl.setAttribute("style", parentStyle.replace(onRemoveStyle, ""));
        return;
      }

      // ## fragment parent element to remove the selected formatting style from selected range
      const spanElStyle = parentStyle
        .replace(onRemoveStyle, "")
        .replace(onRemoveStyle.slice(0, -1), ""); // ensure no trailing semicolon

      let newSelectedNode: HTMLElement;

      if (startOffset == 0) {
        // ### fragment parent in 2 <span> elements
        console.log(
          `>>>> (RUAB) remove ${formatting} formatting of start part from unique <span> node`
        );
        const leftSpan = createSpanElWithStyle(spanElStyle);
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

        const rightSpan = createSpanElWithStyle(spanElStyle);
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

        const middleSpan = createSpanElWithStyle(spanElStyle);
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

  return {
    applyRemoveFormatting,
    commonFormattingRef,
    TextSelectionActionsRef,
    closeTextSelectionAction,
    actionBtnDataList,
  };
};
