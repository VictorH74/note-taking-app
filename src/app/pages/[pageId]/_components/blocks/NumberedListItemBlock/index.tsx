import { NumberedListItemBlockT } from "@/types/page";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import { usePageContent } from "@/hooks/usePageContent";
import React from "react";
import { BlockInput } from "../../BlockInput";
import { BlockContainer } from "../../BlockContainer";
import { twMerge } from "tailwind-merge";
import { sanitizeText } from "@/lib/utils/functions";

type NumberedListItemProps = BlockComponentProps<NumberedListItemBlockT>;

export function NumberedListItemBlock({
  item,
  index,
  onChange,
}: NumberedListItemProps) {
  const blockContainerRef = React.useRef<HTMLDivElement>(null);

  const { pageContent, addNewListItemBlock, addNewParagraphBlock } =
    usePageContent();

  const handleOnPressedEnterAtStart = () => {
    addNewListItemBlock(item.type, '', item.indent, index);
  };
  const handleOnPressedEnterAtEnd = () => {
    addNewListItemBlock(item.type, '', item.indent, index + 1);
  };
  const handleOnPressedBackspaceAtStart = () => {
    const block = pageContent!.blockList.find(b => b.id == pageContent!.blockSortIdList[index])
    addNewParagraphBlock(
      index,
      block!.text as string,
      true
    );
  };

  const handleInput = (innerHTML: string) => {
    if (!onChange) return;

    onChange({
      text: innerHTML,
    });
  };

  const getNumber = (currentIndex: number, count: number = 0) => {
    if (currentIndex == 0) return count + 1;

    if (pageContent?.blockSortIdList[currentIndex - 1].startsWith("numberedlistitem")) {
      return getNumber(currentIndex - 1, count + 1);
    }

    return count + 1;
  };

  if (!onChange)
    return (
      <div
        className={twMerge(
          "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
          "py-[6px]"
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeText(item.text) }}
      ></div>
    );

  return (
    <BlockContainer ref={blockContainerRef} id={item.id} index={index}>
      <div className="relative w-full ml-[25px]">
        <span className=" absolute top-0 right-[calc(100%+6px)] py-[6px] font-medium">
          {getNumber(index)}.
        </span>
        <BlockInput
          text={item.text}
          inputBlockIndex={index}
          className="py-[6px]"
          replaceBlock
          placeholder="Numbered list"
          onPressedEnterAtStart={handleOnPressedEnterAtStart}
          onPressedEnterAtEnd={handleOnPressedEnterAtEnd}
          onPressedBackspaceAtStart={handleOnPressedBackspaceAtStart}
          onInput={handleInput}
        />
      </div>
    </BlockContainer>
  );
}

export function ReadableNumberedListItemBlock({
  item,
  index,
}: NumberedListItemProps) {
  // const getNumber = (currentIndex: number, count: number = 0) => {
  //   if (currentIndex == 0) return count + 1;

  //   if (pageContent?.blockList[currentIndex - 1].type == "numberedlistitem") {
  //     return getNumber(currentIndex - 1, count + 1);
  //   }

  //   return count + 1;
  // };

  const getNumber = (currentIndex: number) => {
    return currentIndex + 1;
  };

  return (
    <div className="relative w-full ml-[25px]">
      <span className=" absolute top-0 right-[calc(100%+6px)] py-[6px] font-medium">
        {getNumber(index)}.{/* {getNumber(index)}. */}
      </span>
      <div
        className={twMerge(
          "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
          "py-[6px]"
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeText(item.text) }}
      ></div>
    </div>
  );
}
