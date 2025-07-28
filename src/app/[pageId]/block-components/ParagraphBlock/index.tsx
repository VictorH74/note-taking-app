import { ParagraphBlockT } from "@/types/page";
// import { formatText } from "@/utils/functions";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import React from "react";
import { usePageContent } from "@/hooks/usePageContent";
import { twMerge } from "tailwind-merge";
import { BlockContentWrapper } from "../BlockContentWrapper";
import { BlockInput } from "../BlockInput";

type ParagraphContentProps = BlockComponentProps<ParagraphBlockT>;

const placeholderClassName =
  "after:content-['Write_something...'] after:absolute after:top-1/2 after:left-0 after:-translate-y-1/2 after:text-gray-400 after:pointer-events-none after:opacity-0";

export function ParagraphBlock({
  item,
  onChange,
  index,
}: ParagraphContentProps) {
  const blockContainerRef = React.useRef<HTMLDivElement>(null);

  const { addNewParagraphBlock, removeBlock } = usePageContent();

  const handleOnPressedEnterAtEnd = () => {
    addNewParagraphBlock(index + 1);
  };
  const handleOnPressedBackspaceAtStart = () => {
    console.log("ParagraphBlock >> handleOnPressedBackspaceAtStart()");
    removeBlock(index, true, item.text);
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    const blockContainer = blockContainerRef.current!;

    if (!blockContainer) return;

    if (e.currentTarget.textContent?.length == 0)
      blockContainer.classList.remove("after:opacity-0");
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const blockContainer = blockContainerRef.current!;

    if (!blockContainer) return;

    if (e.currentTarget.textContent?.length == 0)
      blockContainer.classList.add("after:opacity-0");
  };

  const handleInput = (innerHTML: string) => {
    onChange({
      text: innerHTML,
    });
  };

  return (
    <div
      ref={blockContainerRef}
      id={item.id}
      className={twMerge("relative block-item", placeholderClassName)}
    >
      <BlockContentWrapper blockIndex={index}>
        <BlockInput
          inputBlockIndex={index}
          className="py-1"
          hasParentWithCssAfterProp
          cssAfterPropContainer={blockContainerRef}
          text={item.text}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onPressedEnterAtEnd={handleOnPressedEnterAtEnd}
          onPressedBackspaceAtStart={handleOnPressedBackspaceAtStart}
        />
      </BlockContentWrapper>
    </div>
  );
}
