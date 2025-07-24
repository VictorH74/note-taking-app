import { CheckListItemBlockT } from "@/types/page";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import { twMerge } from "tailwind-merge";
import { usePageContent } from "@/hooks/usePageContent";
import React from "react";
import { BlockWrapper } from "../BlockWrapper";
import { BlockInput } from "../BlockInput";

type CheckListItemBlockProps = BlockComponentProps<CheckListItemBlockT>;

const placeholderClassName =
  "after:content-['Check_list'] after:absolute after:top-1/2 after:left-[26px] after:-translate-y-1/2 after:text-gray-400 after:pointer-events-none";

// TODO: implement feature to change check shape (e.g., box, circle)
export function CheckListItemBlock({
  item,
  index,
  onChange,
}: CheckListItemBlockProps) {
  const blockContainerRef = React.useRef<HTMLDivElement>(null);

  const { addNewListItem, addNewParagraphBlock } = usePageContent();

  const handleOnPressedEnterAtStart = () => {
    addNewListItem(item.type, item.indent, index);
  };
  const handleOnPressedEnterAtEnd = () => {
    addNewListItem(item.type, item.indent, index + 1);
  };
  const handleOnPressedBackspaceAtStart = () => {
    addNewParagraphBlock(index, item.text, true);
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
      <BlockWrapper blockIndex={index} className="flex">
        <div
          className="py-1 size-fit pl-1 pr-[9px]"
          style={{
            marginLeft: `${item.indent ? item.indent * 20 : 0}px`,
          }}
        >
          <input
            defaultChecked={item.checked}
            type="checkbox"
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              onChange({
                checked,
              });
            }}
          />
        </div>

        <BlockInput
          inputBlockIndex={index}
          text={item.text}
          className="py-[6px]"
          replaceBlock
          hasParentWithCssAfterProp
          cssAfterPropContainer={blockContainerRef}
          onPressedEnterAtStart={handleOnPressedEnterAtStart}
          onPressedEnterAtEnd={handleOnPressedEnterAtEnd}
          onPressedBackspaceAtStart={handleOnPressedBackspaceAtStart}
          onInput={handleInput}
        />
      </BlockWrapper>
    </div>
  );
}
