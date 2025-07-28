import { usePageContent } from "@/hooks/usePageContent";
import { useTextSelection } from "@/hooks/useTextSelection";
import { sanitizeText } from "@/utils/functions";
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

      console.log(cssAfterPropContainer);

      if (!cssAfterPropContainer) return;
      cssAfterPropContainer.setAttribute("data-placeholder", props.placeholder);

      if (!props.hasParentWithCssAfterProp)
        cssAfterPropContainer.classList.add(...placeholderClassName.split(" "));
    }

    // return () => {
    //   console.count("BlockInput > useEffect");
    //   closeTextSelectionAction();
    // };
  }, []);

  const getCssAfterPropContainer = () => {
    if (props.cssAfterPropContainer) return props.cssAfterPropContainer.current;
    if (props.ref?.current) return props.ref.current;
    if (inputRef?.current) return inputRef.current;
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
    console.log("+++++++++++++++ BlockInput >> handleKeyDown +++++++++++++++");
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return -1;

    closeTextSelectionAction();

    const range = sel.getRangeAt(0).cloneRange();
    const preRange = range.cloneRange();
    preRange.selectNodeContents(e.currentTarget);
    preRange.setEnd(range.endContainer, range.endOffset);

    // TODO: fix 'caretIndex' precision
    const caretIndex = caretIndexRef.current!;

    console.log(
      "caretIndex: ",
      caretIndex,
      "textContent: ",
      e.currentTarget.textContent?.length
    );

    // if (
    //   e.key == "Backspace" &&
    //   ((e.currentTarget.textContent?.length || 0) <= 1 || caretIndex == 0)
    // ) {
    //   if (props.onPressedBackspaceAtStart) {
    //     props.onPressedBackspaceAtStart();
    //     return;
    //   }
    // }

    if (e.key == "Enter") {
      // ENTER click at start with existing text content
      if ((e.currentTarget.textContent?.length || 0) > 0 && caretIndex == 0) {
        console.log(
          "CONDITION: (e.currentTarget.textContent?.length || 0) > 0 && caretIndex == 0",
          (e.currentTarget.textContent?.length || 0) > 0,
          caretIndex == 0
        );
        props.onPressedEnterAtStart?.();
        e.preventDefault();
        return;
      }

      // ENTER click with empty text content
      if (
        !e.shiftKey &&
        props.replaceBlock &&
        e.currentTarget.textContent?.length == 0
      ) {
        console.log(
          "CONDITION: !e.shiftKey && props.replaceBlock && e.currentTarget.textContent?.length == 0",
          !e.shiftKey,
          props.replaceBlock,
          e.currentTarget.textContent?.length == 0
        );
        console.log(
          "CALLED: addNewParagraphBlock(props.inputBlockIndex, true);"
        );
        addNewParagraphBlock(props.inputBlockIndex, "", true);
        e.preventDefault();
        return;
      }

      const isCaretAtEnd =
        caretIndex >= (e.currentTarget.textContent?.length || 0);
      if (e.shiftKey || !props.onPressedEnterAtEnd || !isCaretAtEnd) {
        console.log(
          "CONDITION: e.shiftKey || !props.onPressedEnterAtEnd || !isCaretAtEnd",
          e.shiftKey,
          !props.onPressedEnterAtEnd,
          !isCaretAtEnd
        );
        console.log("...");
        return;
      }

      console.log("CALLED: props.onPressedEnterAtEnd();");
      props.onPressedEnterAtEnd();
      e.preventDefault();
    } else if (e.key == "Backspace") {
      if (props.onPressedBackspaceAtStart && caretIndex == 0) {
        console.log("CALLED: props.onPressedBackspaceAtStart();");
        props.onPressedBackspaceAtStart();
        e.preventDefault();
        return;
      }
    }
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

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
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
    // TODO: implement 'handlePaste' func
    e.clipboardData.types.forEach((format) => {
      console.log(format.toLocaleUpperCase(), e.clipboardData.getData(format));
    });
  };

  return React.createElement(props.tag || "div", {
    ref: props.ref || inputRef,
    className: twMerge(
      "h-fit w-full outline-none block-input",
      id,
      props.className
    ),
    contentEditable: true,
    dangerouslySetInnerHTML: { __html: sanitizeText(props.text) },
    // TODO: dangerouslySetInnerHTML={{ __html: formatText(item.text) }}
    onKeyDown: handleKeyDown,
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    onSelect: handleSelect,
    onInput: handleInput,
    onPaste: handlePaste,
  });
}
