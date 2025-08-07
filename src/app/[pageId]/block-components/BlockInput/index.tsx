/* eslint-disable react-hooks/exhaustive-deps */
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { usePageContent } from "@/hooks/usePageContent";
import { useTextSelection } from "@/hooks/useTextSelection";
import { FORMATTING_STYLE, TextColorFormattingT } from "@/utils/constants";
import {
  applyFocus,
  applyFocusByIndex,
  replaceBgColorStyle,
  sanitizeText,
  setInputUrlClickHandler,
} from "@/utils/functions";
import React from "react";
import { twMerge } from "tailwind-merge";
import { LinkPreviewT } from "@/types/global";
import {
  UrlOptionsMenu,
  UrlOptionsMenuProps,
} from "./components/UrlOptionsMenu";
import { createPortal } from "react-dom";

interface BlockInputProps {
  text: string;
  onInput(innerHTML: string, textContent: string): void | string;
  ref?: React.RefObject<HTMLElement | null>;
  tag?: "div" | "h1" | "h2" | "h3";
  disableFormatting?: boolean;
  className?: string;
  useBreakLineElement?: boolean;
  placeholder?: string;
  cssAfterPropContainer?: React.RefObject<HTMLElement | null>;
  hasParentWithCssAfterProp?: boolean;
  onPressedEnterAtStart?: () => void;
  onPressedEnterAtEnd?: () => void;
  onPressedBackspaceAtStart?: () => void;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  inputBlockIndex: number;
  replaceBlock?: boolean;
}

const placeholderClassName =
  "after:content-[attr(data-placeholder)] after:absolute after:top-0 after:left-0 after:text-gray-400 after:pointer-events-none after:opacity-0";

export function BlockInput({
  useBreakLineElement = true,
  ...props
}: BlockInputProps) {
  const id = React.useId();
  const inputRef = React.useRef<HTMLElement>(null);
  const { addNewParagraphBlock, pageContent, addCodeBlock } = usePageContent();
  const {
    showTextFormattingActionMenu,
    hideTextFormattingActionMenu,
    redefineInputLinksClickHandler,
  } = useTextSelection();

  const [urlOptionsMenuData, setUrlOptionsMenuData] = React.useState<Omit<
    UrlOptionsMenuProps,
    "onClose"
  > | null>(null);

  React.useEffect(() => {
    if (props.placeholder) {
      const cssAfterPropContainer = getCssAfterPropContainer();

      if (!cssAfterPropContainer) return;
      cssAfterPropContainer.setAttribute("data-placeholder", props.placeholder);

      if (!props.hasParentWithCssAfterProp)
        cssAfterPropContainer.classList.add(...placeholderClassName.split(" "));
    }

    const inputRef = getInputRef();
    if (!inputRef) return;

    inputRef.innerHTML = sanitizeText(props.text);
    redefineInputLinksClickHandler(inputRef);
  }, [pageContent]);

  const getCssAfterPropContainer = () => {
    if (props.cssAfterPropContainer) return props.cssAfterPropContainer.current;
    return getInputRef();
  };

  const getInputRef = () => {
    if (props.ref?.current) return props.ref.current;
    if (inputRef?.current) return inputRef.current;
    return null;
  };

  const getCaretIndex = () => {
    const sel = window.getSelection();
    if (!sel) return -1;

    const range = sel.getRangeAt(0).cloneRange();
    const preRange = range.cloneRange();
    preRange.selectNodeContents(getInputRef()!);
    preRange.setEnd(range.endContainer, range.endOffset);
    return preRange.toString().length;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return -1;
    hideTextFormattingActionMenu();

    const range = sel.getRangeAt(0).cloneRange();
    const caretIndex = getCaretIndex();

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
          console.log("// break line");

          const br = useBreakLineElement
            ? document.createElement("br")
            : document.createTextNode("\n");

          range.deleteContents();
          range.insertNode(br);
          range.setStartAfter(br);
          range.collapse(true);

          sel.removeAllRanges();
          sel.addRange(range);

          props.onInput(...getInputValue());
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
        if (caretIndex == 0 && props.inputBlockIndex > 0) {
          applyFocus(
            pageContent!.blockList[props.inputBlockIndex - 1].id,
            "end"
          );
          e.preventDefault();
        }
      },
      ArrowRight: () => {
        if (
          caretIndex >= textContent.length &&
          props.inputBlockIndex < pageContent!.blockList.length - 1
        ) {
          applyFocus(
            pageContent!.blockList[props.inputBlockIndex + 1].id,
            "start"
          );
          e.preventDefault();
        }
      },
      ArrowUp: () => {
        const caretTop = range.getBoundingClientRect().y;

        const { firstChild } = e.currentTarget;
        if (!firstChild) return;

        const tempRange = document.createRange();
        tempRange.setStart(firstChild, 0);
        const startTop = tempRange.getBoundingClientRect().y;

        if (caretTop == startTop && props.inputBlockIndex > 0) {
          applyFocusByIndex(
            pageContent!.blockList[props.inputBlockIndex - 1].id,
            caretIndex
          );
          e.preventDefault();
        }
      },
      ArrowDown: () => {
        const caretTop = range.getBoundingClientRect().y;

        const { lastChild } = e.currentTarget;
        if (!lastChild) return;

        const tempRange = document.createRange();
        tempRange.setStart(lastChild, lastChild.textContent?.length || 0);
        const endTop = tempRange.getBoundingClientRect().y;

        if (
          caretTop == endTop &&
          props.inputBlockIndex < pageContent!.blockList.length - 1
        ) {
          applyFocusByIndex(
            pageContent!.blockList[props.inputBlockIndex + 1].id,
            caretIndex
          );
          e.preventDefault();
        }
      },
    };

    if (e.key in keyAction) keyAction[e.key as keyof typeof keyAction]();
  };

  // TODO: implement feature to set caret to a inline url preview
  const handleSelect = () => {
    console.log("on select");
    const sel = window.getSelection();
    if (!sel) return;

    const range = sel.getRangeAt(0);

    if (props.disableFormatting) return;

    if (!sel.toString()) return;

    const { left, top } = range.getBoundingClientRect();

    showTextFormattingActionMenu({ left, top }, props.inputBlockIndex, id);
  };

  const handleInput = () => {
    const cssAfterPropContainer = getCssAfterPropContainer();
    const inputRef = getInputRef();

    if (!cssAfterPropContainer || !inputRef) return;

    if (inputRef.textContent?.length == 0) {
      cssAfterPropContainer.classList.remove("after:opacity-0");
    } else if (
      inputRef.textContent &&
      inputRef.textContent?.length > 0 &&
      !cssAfterPropContainer.classList.contains("after:opacity-0")
    ) {
      cssAfterPropContainer.classList.add("after:opacity-0");
    }

    const data = props.onInput(...getInputValue());

    // TODO: improve
    if (data) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return -1;

      // TODO: ...
      const range = sel.getRangeAt(0).cloneRange();
      const preRange = range.cloneRange();
      preRange.selectNodeContents(inputRef);
      preRange.setEnd(range.endContainer, range.endOffset);

      const caretIndex = preRange.toString().length;

      inputRef.innerHTML = data;
      applyFocusByIndex(
        pageContent!.blockList[props.inputBlockIndex].id,
        caretIndex
      );
    }
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
      console.log(vsCodeEditorData);
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
          pageContent?.blockList[props.inputBlockIndex].type == "paragraph"
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

  const getInputValue: () => [string, string] = () => {
    const inputRef = getInputRef()!;
    if (!inputRef) return ["", ""];

    return [inputRef.innerHTML, inputRef.textContent || ""];
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    if (props.onFocus) props.onFocus(e);
  };

  const createInlineUrl = (previewData: LinkPreviewT) => {
    const range = window.getSelection()?.getRangeAt(0);
    if (!range) return;

    const link = document.createElement("a");
    link.setAttribute("class", "text-gray-400");
    link.style.cursor = "pointer";
    link.href = previewData.url;
    link.textContent = previewData.title;
    link.onclick = () =>
      setInputUrlClickHandler(getInputRef()!, previewData.url);
    // TODO: open ChangeLinkDataModal by link selection
    // link.onselectionchange = () => {
    //   const preRange = range.cloneRange();
    //   preRange.selectNodeContents(range.endContainer);
    //   preRange.setStart(link.firstChild!, link.textContent?.length || 0);
    //   const { top, left, height } = preRange.getBoundingClientRect();
    //   console.log("onselectionchange | show modeal in ", left, top + height);
    // };
    // link.onselect = () => {
    //   const preRange = range.cloneRange();
    //   preRange.selectNodeContents(range.endContainer);
    //   preRange.setStart(link.firstChild!, link.textContent?.length || 0);
    //   const { top, left, height } = preRange.getBoundingClientRect();
    //   console.log("onselect | show modeal in ", left, top + height);
    // };

    const inputRef = getInputRef()!;

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
    redefineInputLinksClickHandler(inputRef);

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
          cleanHtmlStr += `<span style="${newNodeStyles}" >${
            (node as HTMLElement).innerHTML
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

  return (
    <>
      {React.createElement(props.tag || "div", {
        ref: props.ref || inputRef,
        className: twMerge(
          "h-fit w-full outline-none block-input whitespace-pre-wrap cursor-text",
          id,
          props.className
        ),
        contentEditable: true,
        onKeyDown: handleKeyDown,
        onFocus: handleFocus,
        onBlur: props.onBlur,
        onSelect: handleSelect,
        onInput: handleInput,
        onPaste: handlePaste,
      })}
      {urlOptionsMenuData &&
        createPortal(
          <UrlOptionsMenu
            {...urlOptionsMenuData}
            onClose={(inputVChanged) => {
              setUrlOptionsMenuData(null);
              if (inputVChanged) handleInput();
            }}
          />,
          document.body
        )}
    </>
  );
}
