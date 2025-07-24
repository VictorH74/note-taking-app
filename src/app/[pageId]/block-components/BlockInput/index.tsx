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

// sla={[index.prop1.prop2.prop3]}
export function BlockInput(props: BlockInputProps) {
  const inputRef = React.useRef<HTMLElement>(null);
  const shiftKey = React.useRef(false);
  const pressedKey = React.useRef<string>(null);
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
    const caretIndex = preRange.toString().length;
    // console.log(caretIndex, e.currentTarget.textContent?.length);

    pressedKey.current = e.key;
    shiftKey.current = e.shiftKey;

    if (
      e.key == "Backspace" &&
      ((e.currentTarget.textContent?.length || 0) <= 1 || caretIndex == 0)
    ) {
      if (props.onPressedBackspaceAtStart) {
        props.onPressedBackspaceAtStart();
        return;
      }
    }

    // if (e.key == "Enter") {
    //   // ENTER click at start with existing text content
    //   if ((e.currentTarget.textContent?.length || 0) > 0 && caretIndex == 0) {
    //     console.log(
    //       "CONDITION: (e.currentTarget.textContent?.length || 0) > 0 && caretIndex == 0",
    //       (e.currentTarget.textContent?.length || 0) > 0,
    //       caretIndex == 0
    //     );
    //     // TODO: new item block above it
    //     props.onPressedEnterAtStart?.();
    //     return;
    //   }

    //   // ENTER click with empty text content
    //   if (
    //     !e.shiftKey &&
    //     props.replaceBlock &&
    //     e.currentTarget.textContent?.length == 0
    //   ) {
    //     console.log(
    //       "CONDITION: !e.shiftKey && props.replaceBlock && e.currentTarget.textContent?.length == 0",
    //       !e.shiftKey,
    //       props.replaceBlock,
    //       e.currentTarget.textContent?.length == 0
    //     );
    //     console.log(
    //       "CALLED: addNewParagraphBlock(props.inputBlockIndex, true);"
    //     );
    //     addNewParagraphBlock(props.inputBlockIndex, "", true);
    //     return;
    //   }

    //   const isCaretAtEnd =
    //     caretIndex >= (e.currentTarget.textContent?.length || 0);
    //   if (e.shiftKey || !props.onPressedEnterAtEnd || !isCaretAtEnd) {
    //     console.log(
    //       "CONDITION: e.shiftKey || !props.onPressedEnterAtEnd || !isCaretAtEnd",
    //       e.shiftKey,
    //       !props.onPressedEnterAtEnd,
    //       !isCaretAtEnd
    //     );
    //     console.log("...");
    //     return;
    //   }

    //   console.log("CALLED: props.onPressedEnterAtEnd();");
    //   props.onPressedEnterAtEnd();
    //   e.preventDefault();
    // } else if (e.key == "Backspace") {
    //   if (props.onPressedBackspaceAtStart && caretIndex == 0) {
    //     props.onPressedBackspaceAtStart();
    //     return;
    //   }
    // }
  };

  const handleSelect = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    const { left, top } = range.getBoundingClientRect();

    showTextSelectionAction({ left, top }, props.inputBlockIndex);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (pressedKey.current) {
      const sel = window.getSelection();
      console.log("aa");
      if (!sel) return;
      console.log("bb");

      closeTextSelectionAction();

      const range = sel.getRangeAt(0).cloneRange();
      const preRange = range.cloneRange();
      preRange.selectNodeContents(e.currentTarget);
      preRange.setEnd(range.endContainer, range.endOffset);

      // TODO: fix 'caretIndex' precision
      const caretIndex = preRange.toString().length;
      console.clear();
      const key = pressedKey.current;
      console.log(key, caretIndex, e.currentTarget.textContent?.length);

      const shift = shiftKey.current;

      if (key == "Enter") {
        // ENTER click at start with existing text content
        if ((e.currentTarget.textContent?.length || 0) > 0 && caretIndex == 0) {
          console.log(
            "CONDITION: (e.currentTarget.textContent?.length || 0) > 0 && caretIndex == 0",
            (e.currentTarget.textContent?.length || 0) > 0,
            caretIndex == 0
          );
          // TODO: new item block above it
          props.onPressedEnterAtStart?.();
          return;
        }

        // ENTER click with empty text content
        if (
          !shift &&
          props.replaceBlock &&
          e.currentTarget.textContent?.length == 0
        ) {
          console.log(
            "CONDITION: !e.shift && props.replaceBlock && e.currentTarget.textContent?.length == 0",
            !shift,
            props.replaceBlock,
            e.currentTarget.textContent?.length == 0
          );
          console.log(
            "CALLED: addNewParagraphBlock(props.inputBlockIndex, true);"
          );
          addNewParagraphBlock(props.inputBlockIndex, "", true);
          return;
        }

        const isCaretAtEnd =
          caretIndex >= (e.currentTarget.textContent?.length || 0);
        if (shift || !props.onPressedEnterAtEnd || !isCaretAtEnd) {
          console.log(
            "CONDITION: e.shift || !props.onPressedEnterAtEnd || !isCaretAtEnd",
            shift,
            !props.onPressedEnterAtEnd,
            !isCaretAtEnd
          );
          console.log("...");
          return;
        }

        console.log("CALLED: props.onPressedEnterAtEnd();");
        props.onPressedEnterAtEnd();
        e.preventDefault();
      }
    }
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

  return React.createElement(props.tag || "div", {
    ref: props.ref || inputRef,
    className: twMerge(
      "h-fit w-full outline-none block-input",
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
  });

  // return (
  //   <div
  //     ref={inputRef}
  //     className={twMerge(
  //       "h-fit w-full outline-none block-input",
  //       props.className
  //     )}
  //     contentEditable
  //     dangerouslySetInnerHTML={{ __html: sanitizeText(props.text) }}
  //     // TODO: dangerouslySetInnerHTML={{ __html: formatText(item.text) }}
  //     onKeyDown={handleKeyDown}
  //     onFocus={props.onFocus}
  //     onBlur={props.onBlur}
  //     onSelect={handleSelect}
  //     onInput={handleInput}
  //   />
  // );
}
