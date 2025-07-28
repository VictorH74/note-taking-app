import { CheckListItemBlockT } from "@/types/page";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import { twMerge } from "tailwind-merge";
import { usePageContent } from "@/hooks/usePageContent";
import React from "react";
import { BlockContentWrapper } from "../BlockContentWrapper";
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
  const inputRef = React.useRef<HTMLElement>(null);

  const { pageContent, addNewListItemBlock, addNewParagraphBlock } =
    usePageContent();

  React.useEffect(() => {
    if (inputRef.current && item.checked) {
      inputRef.current.style.textDecorationLine = "line-through";
      inputRef.current.style.color = "#8d8d8d";
    }
  }, []);

  const handleOnPressedEnterAtStart = () => {
    addNewListItemBlock(item.type, item.indent, index);
  };
  const handleOnPressedEnterAtEnd = () => {
    console.log("handleOnPressedEnterAtEnd");
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
          className="py-[7px] size-fit pl-1 pr-[9px]"
          style={{
            marginLeft: `${item.indent ? item.indent * 20 : 0}px`,
          }}
        >
          <input
            defaultChecked={item.checked}
            type="checkbox"
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              if (inputRef.current) {
                inputRef.current.style.textDecorationLine = checked
                  ? "line-through"
                  : "none";
                inputRef.current.style.color = checked ? "#8d8d8d" : "";
              }
              onChange({
                checked,
              });
            }}
          />
        </div>

        <BlockInput
          ref={inputRef}
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
      </BlockContentWrapper>
    </div>
  );
}
