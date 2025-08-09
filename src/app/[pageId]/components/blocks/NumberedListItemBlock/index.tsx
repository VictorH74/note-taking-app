import { NumberedListItemBlockT } from "@/types/page";
import { BlockComponentProps } from "../../../ContentListPage/EditableContentListPage/useEditableContentList";
import { usePageContent } from "@/hooks/usePageContent";
import React from "react";
import { BlockInput } from "../../BlockInput";
import { BlockContainer } from "../../BlockContainer";

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
