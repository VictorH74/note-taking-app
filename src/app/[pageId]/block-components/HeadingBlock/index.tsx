import { BlockT, HeadingItemTypeT } from "@/types/page";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import { twMerge } from "tailwind-merge";
import { usePageContent } from "@/hooks/usePageContent";
import { BlockContentWrapper } from "../BlockContentWrapper";
import React from "react";
import { BlockInput } from "../BlockInput";
import { applyFocus } from "@/utils/functions";

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
  }
> = {
  heading1: {
    tag: "h1",
    containerClassName: "pt-10 after:content-['Heading_1'] after:text-3xl",
    className: "text-3xl",
  },
  heading2: {
    tag: "h2",
    containerClassName: "pt-8 after:content-['Heading_2'] after:text-2xl",
    className: "text-2xl",
  },
  heading3: {
    tag: "h3",
    containerClassName: "pt-4 after:content-['Heading_3'] after:text-xl",
    className: "text-xl",
  },
};

const placeholderClassName =
  "after:absolute after:bottom-1 after:font-bold after:left-0 after:text-gray-400 after:pointer-events-none";
export function HeadingBlock(props: HeadingContentProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLElement>(null);

  const { addNewParagraphBlock, removeBlock } = usePageContent();

  const headingItemData = React.useMemo(
    () => headingData[props.headingBlockType],
    [props.headingBlockType]
  );

  const handleOnPressedEnterAtEnd = () => {
    addNewParagraphBlock(props.index + 1);
  };
  const handleOnPressedBackspaceAtStart = () => {
    removeBlock(props.index, true, props.item.text);
  };

  const handleInput = (innerHTML: string) => {
    props.onChange({
      text: innerHTML,
    });
  };
  return (
    <div
      ref={containerRef}
      id={props.item.id}
      className={twMerge(
        "relative cursor-text pb-1 block-item",
        headingItemData.containerClassName,
        placeholderClassName,
        props.item.text.length > 0 ? "after:opacity-0" : ""
      )}
      onClick={() => {
        applyFocus(props.item.id);
      }}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <BlockContentWrapper blockIndex={props.index}>
          <BlockInput
            ref={inputRef}
            className={twMerge("font-bold", headingItemData.className)}
            inputBlockIndex={props.index}
            text={props.item.text}
            cssAfterPropContainer={containerRef}
            hasParentWithCssAfterProp
            onInput={handleInput}
            onPressedEnterAtEnd={handleOnPressedEnterAtEnd}
            onPressedBackspaceAtStart={handleOnPressedBackspaceAtStart}
          />
        </BlockContentWrapper>
      </div>
    </div>
  );
}
