import { BulletListItemBlockT } from "@/types/page";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import { twMerge } from "tailwind-merge";
import { usePageContent } from "@/hooks/usePageContent";
import React from "react";
import { BlockContentWrapper } from "../BlockContentWrapper";
import { BlockInput } from "../BlockInput";

type BulletListItemProps = BlockComponentProps<BulletListItemBlockT>;

const placeholderClassName =
  "after:content-['List'] after:absolute after:top-1/2 after:left-[27px] after:-translate-y-1/2 after:text-gray-400 after:pointer-events-none";

// TODO: implement numbers list item block
export function BulletListItemBlock({
  item,
  index,
  onChange,
}: BulletListItemProps) {
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
        <div
          className="py-[13px] size-fit pl-2 pr-3"
          style={{
            marginLeft: `${item.indent ? item.indent * 20 : 0}px`,
          }}
        >
          <div className="size-[7px] bg-white rounded-full" />
        </div>

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
      </BlockContentWrapper>
    </div>
  );
}
