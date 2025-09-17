import { BlockT, HeadingItemTypeT } from "@/types/page";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import { twMerge } from "tailwind-merge";
import { usePageContent } from "@/hooks/usePageContent";
import React from "react";
import { BlockInput } from "../../BlockInput";
import { applyFocus, getElementFirstBlockInput, sanitizeText } from "@/lib/utils/functions";
import { BlockContainer } from "../../BlockContainer";

type HeadingContentProps = {
  headingBlockType: HeadingItemTypeT;
} & BlockComponentProps<
  BlockT<HeadingContentProps["headingBlockType"]> & { text: string }
>;

type HeadingTagT = "h1" | "h2" | "h3";
const headingData: Record<
  HeadingItemTypeT,
  {
    tag: HeadingTagT;
    containerClassName: string;
    className: string;
    placeholder: string;
  }
> = {
  heading1: {
    tag: "h1",
    containerClassName: "pt-10",
    className: "text-3xl  after:text-3xl",
    placeholder: "Heading 1",
  },
  heading2: {
    tag: "h2",
    containerClassName: "pt-8",
    className: "text-2xl  after:text-2xl",
    placeholder: "Heading 2",
  },
  heading3: {
    tag: "h3",
    containerClassName: "pt-4",
    className: "text-xl  after:text-xl",
    placeholder: "Heading 3",
  },
};

export function HeadingBlock(props: HeadingContentProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLElement>(null);

  const { addNewParagraphBlock, removeBlock } = usePageContent();

  const headingItemData = React.useMemo(
    () => headingData[props.headingBlockType],
    [props.headingBlockType]
  );

  const handleInput = (innerHTML: string) => {
    if (!props.onChange) return;

    props.onChange({
      text: innerHTML,
    });
  };

  const handleOnPressedEnterAtEnd = () => {
    addNewParagraphBlock(props.index + 1);
  };
  const handleOnPressedBackspaceAtStart = () => {
    removeBlock(props.index, true, props.item.text);
  };

  if (!props.onChange)
    return (
      <div
        className={twMerge(
          "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
          "font-bold",
          headingItemData.className
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeText(props.item.text) }}
      ></div>
    );

  return (
    <BlockContainer
      index={props.index}
      ref={containerRef}
      id={props.item.id}
      className={twMerge(
        "cursor-text pb-1",
        headingItemData.containerClassName
      )}
      onClick={() => {
        applyFocus(getElementFirstBlockInput(props.item.id)!);
      }}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <BlockInput
          ref={inputRef}
          className={twMerge("font-bold", headingItemData.className)}
          inputBlockIndex={props.index}
          text={props.item.text}
          placeholder={headingItemData.placeholder}
          onInput={handleInput}
          onPressedEnterAtEnd={handleOnPressedEnterAtEnd}
          onPressedBackspaceAtStart={handleOnPressedBackspaceAtStart}
        />
      </div>
    </BlockContainer>
  );
}

export function ReadableHeadingBlock(props: HeadingContentProps) {
  const headingItemData = React.useMemo(
    () => headingData[props.headingBlockType],
    [props.headingBlockType]
  );

  if (!props.onChange)
    return (
      <div
        className={twMerge(
          "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
          "font-bold",
          headingItemData.className,
          headingItemData.containerClassName
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeText(props.item.text) }}
      ></div>
    );
}
