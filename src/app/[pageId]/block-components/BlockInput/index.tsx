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
} from "@/utils/functions";
import React from "react";
import { twMerge } from "tailwind-merge";

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
  const { showTextSelectionAction, closeTextSelectionAction } =
    useTextSelection();

  React.useEffect(() => {
    if (props.placeholder) {
      const cssAfterPropContainer = getCssAfterPropContainer();

      if (!cssAfterPropContainer) return;
      cssAfterPropContainer.setAttribute("data-placeholder", props.placeholder);

      if (!props.hasParentWithCssAfterProp)
        cssAfterPropContainer.classList.add(...placeholderClassName.split(" "));
    }
  }, []);

  const getCssAfterPropContainer = () => {
    if (props.cssAfterPropContainer) return props.cssAfterPropContainer.current;
    if (props.ref?.current) return props.ref.current;
    if (inputRef?.current) return inputRef.current;
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return -1;

    closeTextSelectionAction();

    const range = sel.getRangeAt(0).cloneRange();
    const preRange = range.cloneRange();
    preRange.selectNodeContents(e.currentTarget);
    preRange.setEnd(range.endContainer, range.endOffset);

    const caretIndex = preRange.toString().length;
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

          props.onInput(
            e.currentTarget.innerHTML,
            e.currentTarget.textContent || ""
          );
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

  const handleSelect = () => {
    const sel = window.getSelection();
    if (!sel) return;

    const range = sel.getRangeAt(0);

    if (props.disableFormatting) return;

    if (!sel.toString()) return;

    const { left, top } = range.getBoundingClientRect();

    showTextSelectionAction({ left, top }, props.inputBlockIndex, id);
  };

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const cssAfterPropContainer = getCssAfterPropContainer();

    if (!cssAfterPropContainer) return;

    if (e.currentTarget.textContent?.length == 0) {
      cssAfterPropContainer.classList.remove("after:opacity-0");
    } else if (
      e.currentTarget.textContent &&
      e.currentTarget.textContent?.length > 0 &&
      !cssAfterPropContainer.classList.contains("after:opacity-0")
    ) {
      cssAfterPropContainer.classList.add("after:opacity-0");
    }

    const data = props.onInput(
      e.currentTarget.innerHTML,
      e.currentTarget.textContent || ""
    );

    // TODO: improve
    if (data) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return -1;

      const range = sel.getRangeAt(0).cloneRange();
      const preRange = range.cloneRange();
      preRange.selectNodeContents(e.currentTarget);
      preRange.setEnd(range.endContainer, range.endOffset);

      const caretIndex = preRange.toString().length;

      e.currentTarget.innerHTML = data;
      applyFocusByIndex(
        pageContent!.blockList[props.inputBlockIndex].id,
        caretIndex
      );
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLElement>) => {
    e.clipboardData.types.forEach((v) =>
      console.log(v, e.clipboardData.getData(v))
    );

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
      const range = window.getSelection()?.getRangeAt(0);

      if (!range) return;

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
            cleanHtmlStr += new XMLSerializer()
              .serializeToString(node)
              .trimStart();
          else if (index == div.childNodes.length - 1)
            cleanHtmlStr += new XMLSerializer()
              .serializeToString(node)
              .trimEnd();
          else cleanHtmlStr += node.textContent;
        });

        return cleanHtmlStr;
      };

      const cleanElement = document.createElement("div");
      cleanElement.innerHTML = cleanHtmlData(
        e.clipboardData.getData("text/html")
      );

      for (let i = cleanElement.childNodes.length; i > 0; i--) {
        range.insertNode(cleanElement.childNodes.item(i - 1));
      }

      range.setStartAfter(e.currentTarget.lastChild!);
      range.collapse(true);

      handleInput(e as React.FormEvent<HTMLElement>);
      e.preventDefault();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    if (props.onFocus) props.onFocus(e);
  };

  return React.createElement(props.tag || "div", {
    ref: props.ref || inputRef,
    className: twMerge(
      "h-fit w-full outline-none block-input whitespace-pre-wrap cursor-text",
      id,
      props.className
    ),
    contentEditable: true,
    dangerouslySetInnerHTML: { __html: sanitizeText(props.text) },
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onBlur: props.onBlur,
    onSelect: handleSelect,
    onInput: handleInput,
    onPaste: handlePaste,
  });
}
