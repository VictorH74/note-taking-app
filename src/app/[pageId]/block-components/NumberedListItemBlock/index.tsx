import { NumberedListItemBlockT } from "@/types/page";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import { twMerge } from "tailwind-merge";
import { usePageContent } from "@/hooks/usePageContent";
import React from "react";
import { BlockContentWrapper } from "../BlockContentWrapper";
import { BlockInput } from "../BlockInput";

type NumberedListItemProps = BlockComponentProps<NumberedListItemBlockT>;

const placeholderClassName =
  "after:content-['Numbered_list'] after:absolute after:top-1/2 after:left-[27px] after:-translate-y-1/2 after:text-gray-400 after:pointer-events-none";

export function NumberedListItemBlock({
  item,
  index,
  onChange,
}: NumberedListItemProps) {
  const blockContainerRef = React.useRef<HTMLDivElement>(null);

  const { pageContent, addNewListItemBlock, addNewParagraphBlock } =
    usePageContent();

  const handleOnPressedEnterAtStart = () => {
    addNewListItemBlock(item.type, item.indent, index);
  };
  const handleOnPressedEnterAtEnd = () => {
    addNewListItemBlock(item.type, item.indent, index + 1);
  };
  const handleOnPressedBackspaceAtStart = () => {
    addNewParagraphBlock(
      index,
      pageContent!.blockList[index].text as string,
      true
    );
  };

  const handleInput = (innerHTML: string) => {
    onChange({
      text: innerHTML,
    });
  };

  const getNumber = (currentIndex: number, count: number = 0) => {
    if (currentIndex == 0) return count + 1;

    if (pageContent?.blockList[currentIndex - 1].type == "numberedlistitem") {
      return getNumber(currentIndex - 1, count + 1);
    }

    return count + 1;
  };

  return (
    <div
      ref={blockContainerRef}
      id={item.id}
      className={twMerge(
        "relative block-item",
        placeholderClassName,
        item.text.length > 0 ? "after:opacity-0" : ""
      )}
    >
      <BlockContentWrapper blockIndex={index} className="flex">
        <div className="relative w-full ml-[25px]">
          <span className=" absolute top-0 right-[calc(100%+6px)] py-1 font-medium">
            {getNumber(index)}.
          </span>
          <BlockInput
            text={item.text}
            inputBlockIndex={index}
            className="py-[6px]"
            replaceBlock
            hasParentWithCssAfterProp
            cssAfterPropContainer={blockContainerRef}
            onPressedEnterAtStart={handleOnPressedEnterAtStart}
            onPressedEnterAtEnd={handleOnPressedEnterAtEnd}
            onPressedBackspaceAtStart={handleOnPressedBackspaceAtStart}
            onInput={handleInput}
          />
        </div>
      </BlockContentWrapper>
    </div>
  );
}
