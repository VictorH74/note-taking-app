import { BulletListItemBlockT } from "@/types/page";
import React from "react";
import { BlockInput } from "../../BlockInput";
import { BlockContainer } from "../../BlockContainer";
import { twMerge } from "tailwind-merge";
import { sanitizeText } from "@/lib/utils/functions";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import { usePageContent } from "@/hooks/usePageContent";

type BulletListItemProps = BlockComponentProps<BulletListItemBlockT>;

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

  if (!onChange)
    return (
      <div className="flex">
        <div
          className="py-[13px] size-fit pl-2 pr-3"
          style={{
            marginLeft: `${item.indent ? item.indent * 20 : 0}px`,
          }}
        >
          <div className="size-[7px] bg-white rounded-full" />
        </div>

        <div
          className={twMerge(
            "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
            "py-[6px]"
          )}
          dangerouslySetInnerHTML={{ __html: sanitizeText(item.text) }}
        ></div>
      </div>
    );

  return (
    <BlockContainer ref={blockContainerRef} id={item.id} index={index}>
      <div className="flex">
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
          placeholder="List"
          onPressedEnterAtStart={handleOnPressedEnterAtStart}
          onPressedEnterAtEnd={handleOnPressedEnterAtEnd}
          onPressedBackspaceAtStart={handleOnPressedBackspaceAtStart}
          onInput={handleInput}
        />
      </div>
    </BlockContainer>
  );
}

export function ReadableBulletListItemBlock({ item }: BulletListItemProps) {
  return (
    <div className="flex">
      <div
        className="py-[13px] size-fit pl-2 pr-3"
        style={{
          marginLeft: `${item.indent ? item.indent * 20 : 0}px`,
        }}
      >
        <div className="size-[7px] bg-white rounded-full" />
      </div>

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
