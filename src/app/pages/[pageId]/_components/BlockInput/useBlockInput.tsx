/* eslint-disable react-hooks/exhaustive-deps */
import Prism from "prismjs";
import { usePageContent } from "@/hooks/usePageContent";
import { useTextSelection } from "@/hooks/useTextSelection";
import { FORMATTING_STYLE, INLINE_LINK_PREVIEW_CLASSNAME, TextColorFormattingT } from "@/lib/utils/constants";
import {
  applyFocus,
  applyFocusByIndex,
  getCaretIndex,
  getElementFirstBlockInput,
  getNodeFromIndex,
  isInlineLinkPreviewNode,
  replaceBgColorStyle,
  sanitizeText,
} from "@/lib/utils/functions";
import React from "react";
import { LinkPreviewT } from "@/types/global";
import { UrlOptionsMenuProps } from "./components/UrlOptionsMenu";

export interface BlockInputProps {
  text: string;
  ref?: React.RefObject<HTMLElement | null>;
  tag?: "div" | "h1" | "h2" | "h3";
  className?: string;
  placeholder?: string;
  replaceBlock?: boolean;
  inputBlockIndex: number;
  disableFormatting?: boolean;
  hidePlaceholderWhenFocusOut?: boolean;
  useBreakLineElement?: boolean;
  onPressedBackspaceAtStart?: () => void;
  onPressedEnterAtStart?: () => void;
  onPressedEnterAtEnd?: () => void;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  onInput(innerHTML: string, textContent: string): void | string;
}

const placeholderClassName =
  "after:content-[attr(data-placeholder)] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-0 after:text-gray-400 after:pointer-events-none";

export const useBlockInput = ({
  useBreakLineElement = true,
  ...props
}: BlockInputProps) => {
  const id = React.useId();
  const inputRef = React.useRef<HTMLElement>(null);

  const [urlOptionsMenuData, setUrlOptionsMenuData] = React.useState<Omit<
    UrlOptionsMenuProps,
    "onClose"
  > | null>(null)

  const { addNewParagraphBlock, pageContent, addCodeBlock } = usePageContent();
  const {
    inlineUrlChangeData,
    showTextFormattingActionMenu,
    hideTextFormattingActionMenu,
    defineInputInlineLinkHandlers,
    showInlineUrlChangeModal,
    hideInlineUrlChangeModal
  } = useTextSelection();

  React.useEffect(() => {
    const inputRef = getInputRef();
    if (!inputRef) return;

    setTimeout(() => {
      if (props.placeholder) {
        inputRef.setAttribute("data-placeholder", props.placeholder);
        inputRef.classList.add(...placeholderClassName.split(" "));

        if (inputRef.textContent || props.hidePlaceholderWhenFocusOut) inputRef.classList.add("after:opacity-0");
      }
    }, 0);
  }, []);

  React.useEffect(() => {
    const inputRef = getInputRef();
    if (!inputRef) return;

    inputRef.innerHTML = sanitizeText(props.text);
    defineInputInlineLinkHandlers(inputRef);
  }, [pageContent]);

  const getInputRef = () => {
    if (props.ref?.current) return props.ref.current;
    if (inputRef?.current) return inputRef.current;
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return -1;
    hideTextFormattingActionMenu();
    hideInlineUrlChangeModal()

    const range = sel.getRangeAt(0).cloneRange();
    const caretIndex = getCaretIndex(getInputRef()!);

    const textContent = e.currentTarget.textContent || "";

    const keyAction = {
      Enter: () => {
        if (textContent.length > 0 && caretIndex == 0) {
          // ENTER click at start with existing text content
          props.onPressedEnterAtStart?.();
        } else if (
          !e.shiftKey &&
          props.replaceBlock &&
          e.currentTarget.textContent?.length == 0
        ) {
          // ENTER click with empty text content
          addNewParagraphBlock(props.inputBlockIndex, "", true);
        } else if (
          e.shiftKey ||
          !props.onPressedEnterAtEnd ||
          !(caretIndex >= textContent.length)
        ) {
          const br = useBreakLineElement
            ? document.createElement("br")
            : document.createTextNode("\n");

          range.deleteContents();
          range.insertNode(br);
          range.setStartAfter(br);
          range.collapse(true);

          sel.removeAllRanges();
          sel.addRange(range);

          const { htmlText, text } = getInputValues();
          props.onInput(htmlText, text);
        } else {
          // ENTER click at end
          props.onPressedEnterAtEnd();
        }
        e.preventDefault();
      },
      Backspace: () => {
        if (props.onPressedBackspaceAtStart && caretIndex == 0) {
          props.onPressedBackspaceAtStart();
          e.preventDefault();
        }
      },
      ArrowLeft: () => {
        if (caretIndex == 0) {
          if (props.inputBlockIndex > 0) {
            const elId = pageContent!.blockSortIdList[props.inputBlockIndex - 1]
            const el = getElementFirstBlockInput(elId)
            if (!el) return;
            applyFocus(el, "end");

          } else {
            const element = document.getElementById('page-title');
            applyFocus(
              element!,
              "end"
            );
          }


          e.preventDefault();
          return;
        }

        const inputRef = getInputRef();
        if (inputRef && caretIndex > 0 && inputRef.childNodes.length > 0) {
          const rangeSelection = getNodeFromIndex(inputRef, caretIndex);
          if (rangeSelection && isInlineLinkPreviewNode(rangeSelection.node)) {
            sel.removeAllRanges();
            range.setEndBefore(rangeSelection.node);
            sel.addRange(range);
            e.preventDefault();
          }
        }
      },
      ArrowRight: () => {
        if (
          caretIndex >= textContent.length &&
          props.inputBlockIndex < pageContent!.blockSortIdList.length - 1
        ) {
          const elId = pageContent!.blockSortIdList[props.inputBlockIndex + 1]
          const el = getElementFirstBlockInput(elId)
          applyFocus(
            el!,
            "start"
          );
          e.preventDefault();
          return;
        }

        const inputRef = getInputRef();
        if (inputRef && caretIndex > 0 && inputRef.childNodes.length > 0) {
          const rangeSelection = getNodeFromIndex(inputRef, caretIndex + 1);
          if (rangeSelection && isInlineLinkPreviewNode(rangeSelection.node)) {
            sel.removeAllRanges();
            range.setStartAfter(rangeSelection.node);
            sel.addRange(range);
            e.preventDefault();
          }
        }
      },
      ArrowUp: () => {
        const isFirstBlockItem = props.inputBlockIndex == 0; // TODO: override to props.canFocusTopInput

        if (textContent.length == 0) {

          if (isFirstBlockItem) {
            applyFocusByIndex(document.getElementById('page-title')!, caretIndex)
          } else {
            applyFocusByIndex(
              getElementFirstBlockInput(pageContent!.blockSortIdList[props.inputBlockIndex - 1])!,
              caretIndex
            );
          }

          e.preventDefault();
          return;
        }

        let { firstChild } = e.currentTarget;
        if (!firstChild) return;

        if (firstChild.nodeType == Node.ELEMENT_NODE)
          firstChild = firstChild.firstChild!;

        const tempRange = document.createRange();
        tempRange.setStart(firstChild, 0);

        const caretTop = range.getBoundingClientRect().y;
        const startTop = tempRange.getBoundingClientRect().y;

        if (caretTop == startTop) {
          if (isFirstBlockItem) {
            applyFocusByIndex(document.getElementById('page-title')!, caretIndex)
          } else {
            applyFocusByIndex(
              getElementFirstBlockInput(pageContent!.blockSortIdList[props.inputBlockIndex - 1])!,
              caretIndex
            );
          }

          e.preventDefault();
        }
      },
      ArrowDown: () => {
        const isLastBlockItem =
          props.inputBlockIndex == pageContent!.blockSortIdList.length - 1; // TODO: override to props.canFocusBottomInput

        if (textContent.length == 0 && !isLastBlockItem) {
          applyFocusByIndex(
            getElementFirstBlockInput(pageContent!.blockSortIdList[props.inputBlockIndex + 1])!,
            caretIndex
          );
          e.preventDefault();
          return;
        }

        const getLastChildNode = (node: ChildNode) => {
          if (node.nodeType == Node.ELEMENT_NODE && node.lastChild)
            return getLastChildNode(node.lastChild);

          return node;
        };

        let { lastChild } = e.currentTarget;
        if (!lastChild) return;

        if (lastChild.nodeType == Node.ELEMENT_NODE)
          lastChild = getLastChildNode(lastChild);

        const tempRange = document.createRange();
        tempRange.setStart(lastChild, lastChild.textContent?.length || 0);

        const caretTop = range.getBoundingClientRect().y;
        const endTop = tempRange.getBoundingClientRect().y;

        if (caretTop == endTop && !isLastBlockItem) {
          applyFocusByIndex(
            getElementFirstBlockInput(pageContent!.blockSortIdList[props.inputBlockIndex + 1])!,
            caretIndex
          );
          e.preventDefault();
        }
      },
    };

    if (e.key in keyAction) keyAction[e.key as keyof typeof keyAction]();
  };

  const handleSelect = () => {
    const sel = window.getSelection();
    if (!sel) return;

    const range = sel.getRangeAt(0);

    if (props.disableFormatting) return;

    if (!sel.toString()) {
      const preRange = range.cloneRange();

      if (preRange.startContainer && preRange.startContainer.parentElement?.tagName == 'A') {
        if (!preRange.startContainer.parentElement.classList.contains(INLINE_LINK_PREVIEW_CLASSNAME)) {
          const link = range.startContainer.parentElement as HTMLAnchorElement

          showInlineUrlChangeModal(link)
          return
        }
      }

      if (inlineUrlChangeData) hideInlineUrlChangeModal()
      return;
    }

    showTextFormattingActionMenu(range.cloneRange(), props.inputBlockIndex, id);
  };

  const handleInput = () => {
    const inputRef = getInputRef();

    if (!inputRef || !inputRef) return;

    if (inputRef.textContent?.length == 0) {
      inputRef.classList.remove("after:opacity-0");
    } else if (
      inputRef.textContent &&
      inputRef.textContent?.length > 0 &&
      !inputRef.classList.contains("after:opacity-0")
    ) {
      inputRef.classList.add("after:opacity-0");
    }

    const inputValues = getInputValues();

    if (inputValues.text == "") {
      inputRef.innerHTML = "";
      inputValues.htmlText = "";
    }

    const { htmlText, text } = inputValues;
    const changedHtmlText = props.onInput(htmlText, text);

    if (changedHtmlText) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return -1;

      const range = sel.getRangeAt(0).cloneRange();
      const preRange = range.cloneRange();
      preRange.selectNodeContents(inputRef);
      preRange.setEnd(range.endContainer, range.endOffset);

      const caretIndex = preRange.toString().length;

      inputRef.innerHTML = changedHtmlText;
      applyFocusByIndex(
        getElementFirstBlockInput(pageContent!.blockSortIdList[props.inputBlockIndex])!,
        caretIndex
      );
      return;
    }

    // TODO: open add block modal using '/' char
    // if (text.endsWith("/")) {
    //   setShowAddBlockModal(true);
    // }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLElement>) => {
    // e.clipboardData.types.forEach((v) =>
    //   console.log(v, e.clipboardData.getData(v))
    // );

    const sel = window.getSelection();
    const range = sel?.getRangeAt(0);

    if (!range) return;

    if (sel!.toString()) {
      range.deleteContents();
    }

    if (e.clipboardData.types.includes("vscode-editor-data")) {
      e.preventDefault();
      const vsCodeEditorData = JSON.parse(
        e.clipboardData.getData("vscode-editor-data")
      ) as object;
      // console.log(vsCodeEditorData);
      if (!("mode" in vsCodeEditorData)) return;

      const code = e.clipboardData.getData("text/plain");
      const htmlContent = Prism.highlight(
        code,
        Prism.languages.javascript,
        vsCodeEditorData.mode as string
      );

      const language = vsCodeEditorData.mode as string;

      if (!e.currentTarget.textContent) {
        return addCodeBlock(
          htmlContent,
          language.includes("react") ? "javascript" : language,
          props.inputBlockIndex,
          pageContent?.blockSortIdList[props.inputBlockIndex].startsWith("paragraph")
        );
      }
      return addCodeBlock(htmlContent, language, props.inputBlockIndex + 1);
    } else if (e.clipboardData.types.includes("text/html")) {
      if (e.clipboardData.types.includes("text/link-preview")) {
        e.preventDefault();

        const linkPreview = JSON.parse(
          e.clipboardData.getData("text/link-preview")
        ) as LinkPreviewT;

        createInlineUrl(linkPreview);

        return handleInput();
      }

      const cleanElement = document.createElement("div");
      cleanElement.innerHTML = cleanHtmlData(
        e.clipboardData.getData("text/html")
      );

      let lastInsertedNode: Node | null = null;
      const childNodesLength = cleanElement.childNodes.length;
      for (let i = cleanElement.childNodes.length; i > 0; i--) {
        const node = cleanElement.childNodes.item(i - 1);

        if (i == childNodesLength) lastInsertedNode = node;

        range.insertNode(node);
      }

      if (!lastInsertedNode) lastInsertedNode = cleanElement.lastChild!;

      range.setStartAfter(lastInsertedNode);
      range.collapse(true);

      handleInput();
      e.preventDefault();
    } else if (e.clipboardData.types.includes("text/plain")) {
    }
  };

  const getInputValues: () => { htmlText: string; text: string } = () => {
    const inputRef = getInputRef()!;
    if (!inputRef) return { htmlText: "", text: "" };

    return {
      htmlText: inputRef.innerHTML,
      text: inputRef.textContent || "",
    };
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (props.onBlur) props.onBlur(e)


    if (props.hidePlaceholderWhenFocusOut) {
      const input = getInputRef()
      if (!input) return;

      if (e.currentTarget.textContent?.length == 0)
        input.classList.add("after:opacity-0");
    }

  };

  const createInlineUrl = (previewData: LinkPreviewT) => {
    const range = window.getSelection()?.getRangeAt(0);
    if (!range) return;

    const link = document.createElement("a");
    link.setAttribute("class", "text-gray-400");
    link.style.cursor = "pointer";
    link.href = previewData.url;
    link.textContent = previewData.title;

    const inputRef = getInputRef()!;

    if (inputRef.textContent) {
      const startPartRange = range.cloneRange();
      startPartRange.setStart(inputRef.firstChild!, 0);
      startPartRange.setEnd(range.startContainer, range.startOffset);

      const endPartRange = range.cloneRange();
      endPartRange.setStart(range.startContainer, range.startOffset);
      endPartRange.setEnd(
        inputRef.lastChild!,
        (inputRef.lastChild!.textContent || "").length
      );

      const startPartFrag = startPartRange.cloneContents();
      const endPartFrag = endPartRange.cloneContents();

      inputRef.replaceChildren(startPartFrag, link, endPartFrag);
    } else {
      inputRef.replaceChildren(link);
    }
    defineInputInlineLinkHandlers(inputRef);

    range.setStartAfter(link);
    range.collapse(true);

    const preRange = range.cloneRange();
    preRange.selectNodeContents(range.endContainer);
    preRange.setStart(link.firstChild!, link.textContent.length);
    const { top, left, height } = preRange.getBoundingClientRect();
    setUrlOptionsMenuData({
      position: { left, top: top + height },
      previewData,
      targetEl: link,
    });
  };

  const cleanHtmlData = (htmlStr: string) => {
    let cleanHtmlStr = "";

    const div = document.createElement("div");
    div.innerHTML = sanitizeText(htmlStr);

    const textColorFPrefix: TextColorFormattingT = "color-";
    div.childNodes.forEach((node, index) => {
      if (node.nodeType == Node.ELEMENT_NODE) {
        const nodeStyles = (node as HTMLElement).getAttribute("style");
        let newNodeStyles = "";
        if (!nodeStyles) return;
        Object.entries(FORMATTING_STYLE).forEach(([fName, fStyles]) => {
          if (fName.startsWith(textColorFPrefix)) {
            for (let i = 0; i < fStyles.length; i++) {
              if (
                replaceBgColorStyle(nodeStyles, "").includes(
                  fStyles[i].replace(/;$/, "")
                )
              ) {
                newNodeStyles += fStyles[0];
                break;
              }
            }
          } else {
            for (let i = 0; i < fStyles.length; i++) {
              if (nodeStyles.includes(fStyles[i].replace(/;$/, ""))) {
                newNodeStyles += fStyles[0];
                break;
              }
            }
          }
        });

        if (newNodeStyles == "")
          cleanHtmlStr += (node as HTMLElement).innerHTML;
        else {
          cleanHtmlStr += `<span style="${newNodeStyles}" >${(node as HTMLElement).innerHTML
            }</span>`;
        }
        return;
      }

      if (index == 0)
        cleanHtmlStr += new XMLSerializer().serializeToString(node).trimStart();
      else if (index == div.childNodes.length - 1)
        cleanHtmlStr += new XMLSerializer().serializeToString(node).trimEnd();
      else cleanHtmlStr += node.textContent;
    });

    return cleanHtmlStr;
  };

  return {
    urlOptionsMenuData,
    inputRef,
    id,
    inlineUrlChangeData,
    handlers: {
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      onSelect: handleSelect,
      onInput: handleInput,
      onPaste: handlePaste,
      onBlur: handleBlur
    },
    hideInlineUrlChangeModal,
    setUrlOptionsMenuData,
  };
};
