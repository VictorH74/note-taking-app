import { usePageContent } from "@/hooks/usePageContent";
import { useTextSelection } from "@/hooks/useTextSelection";
import { FORMATTING_STYLE, TextColorFormattingT } from "@/utils/constants";
import { replaceBgColorStyle, sanitizeText } from "@/utils/functions";
import React from "react";
import { twMerge } from "tailwind-merge";

interface BlockInputProps {
  text: string;
  onInput(innerHTML: string): void;
  ref?: React.RefObject<HTMLElement | null>;
  tag?: "div" | "h1" | "h2" | "h3";
  disableFormatting?: boolean;
  className?: string;
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

export function BlockInput(props: BlockInputProps) {
  const id = React.useId();
  const inputRef = React.useRef<HTMLElement>(null);
  const caretIndexRef = React.useRef<number>(null);
  const { addNewParagraphBlock } = usePageContent();
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

    // TODO: fix 'caretIndex' precision
    const caretIndex = caretIndexRef.current!;

    if (e.key == "Enter") {
      if ((e.currentTarget.textContent?.length || 0) > 0 && caretIndex == 0) {
        // ENTER click at start with existing text content
        props.onPressedEnterAtStart?.();
        e.preventDefault();
        return;
      }

      if (
        !e.shiftKey &&
        props.replaceBlock &&
        e.currentTarget.textContent?.length == 0
      ) {
        // ENTER click with empty text content
        addNewParagraphBlock(props.inputBlockIndex, "", true);
        e.preventDefault();
        return;
      }

      const isCaretAtEnd =
        caretIndex >= (e.currentTarget.textContent?.length || 0);
      if (e.shiftKey || !props.onPressedEnterAtEnd || !isCaretAtEnd) {
        // input break line
        const br = document.createElement("br");

        range.deleteContents();
        range.insertNode(br);

        range.setStartAfter(br);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);

        props.onInput(e.currentTarget.innerHTML);
        e.preventDefault();
        return;
      }

      // ENTER click at end
      props.onPressedEnterAtEnd();
      e.preventDefault();
      return;
    }
    if (e.key == "Backspace") {
      if (props.onPressedBackspaceAtStart && caretIndex == 0) {
        console.log("CALLED: props.onPressedBackspaceAtStart();");
        props.onPressedBackspaceAtStart();
        e.preventDefault();
      }
      return;
    }
    // TODO: implement actions of navigation between blocks or block lines
    // if (e.key == "ArrowUp") {
    //   e.
    //   return;
    // }
    // if (e.key == "ArrowDown") {
    //   return;
    // }
  };

  const updateCaretIndex = (e: React.SyntheticEvent<HTMLElement, Event>) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return -1;

    const range = sel.getRangeAt(0).cloneRange();
    const preRange = range.cloneRange();
    preRange.selectNodeContents(e.currentTarget);
    preRange.setEnd(range.endContainer, range.endOffset);

    caretIndexRef.current = preRange.toString().length;
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLElement, Event>) => {
    const sel = window.getSelection();
    if (!sel) return;

    updateCaretIndex(e);

    if (props.disableFormatting) return;

    const selText = sel.toString();
    if (!selText) return;

    const range = sel.getRangeAt(0);
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

    props.onInput(e.currentTarget.innerHTML);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    // TODO: create code block if data was copied from vs code

    if (e.clipboardData.types.includes("text/html")) {
      const range = window.getSelection()?.getRangeAt(0);

      if (!range) return;

      const cleanNodesParent = document.createElement("div");

      const div = document.createElement("div");
      div.innerHTML = sanitizeText(e.clipboardData.getData("text/html"));

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
            cleanNodesParent.innerHTML += (node as HTMLElement).innerHTML;
          else {
            cleanNodesParent.innerHTML += `<span style="${newNodeStyles}" >${
              (node as HTMLElement).innerHTML
            }</span>`;
          }
          return;
        }

        if (index == 0)
          cleanNodesParent.innerHTML += new XMLSerializer()
            .serializeToString(node)
            .trimStart();
        else if (index == div.childNodes.length - 1)
          cleanNodesParent.innerHTML += new XMLSerializer()
            .serializeToString(node)
            .trimEnd();
        else cleanNodesParent.innerHTML += node.textContent;
      });

      for (let i = cleanNodesParent.childNodes.length; i > 0; i--) {
        range.insertNode(cleanNodesParent.childNodes.item(i - 1));
      }

      range.setStartAfter(e.currentTarget.lastChild!);
      range.collapse(true);

      handleInput(e as React.FormEvent<HTMLElement>);
      e.preventDefault();
    }
  };

  return React.createElement(props.tag || "div", {
    ref: props.ref || inputRef,
    className: twMerge(
      "h-fit w-full outline-none block-input whitespace-pre-wrap",
      id,
      props.className
    ),
    contentEditable: true,
    dangerouslySetInnerHTML: { __html: sanitizeText(props.text) },
    onKeyDown: handleKeyDown,
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    onSelect: handleSelect,
    onInput: handleInput,
    onPaste: handlePaste,
  });
}
