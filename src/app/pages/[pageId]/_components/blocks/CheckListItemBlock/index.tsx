/* eslint-disable react-hooks/exhaustive-deps */
import { CheckListItemBlockT } from "@/types/page";
import { usePageContent } from "@/hooks/usePageContent";
import React from "react";
import { BlockInput } from "../../BlockInput";
import { BlockContainer } from "../../BlockContainer";
import { twMerge } from "tailwind-merge";
import { sanitizeText } from "@/lib/utils/functions";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";

type CheckListItemBlockProps = BlockComponentProps<CheckListItemBlockT>;

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
    if (!onChange) return;

    onChange({
      text: innerHTML,
    });
  };

  if (!onChange)
    return (
      <div className="flex">
        <div
          className="py-[7px] size-fit pl-1 pr-[9px]"
          style={{
            marginLeft: `${item.indent ? item.indent * 20 : 0}px`,
          }}
        >
          <input defaultChecked={item.checked} type="checkbox" />
        </div>
        <div
          className={twMerge(
            "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
            "py-[6px] inline"
          )}
          dangerouslySetInnerHTML={{ __html: sanitizeText(item.text) }}
        ></div>
      </div>
    );

  return (
    <BlockContainer ref={blockContainerRef} id={item.id} index={index}>
      <div className="flex">
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
          className="py-[6px] inline"
          placeholder="Check list"
          replaceBlock
          onPressedEnterAtStart={handleOnPressedEnterAtStart}
          onPressedEnterAtEnd={handleOnPressedEnterAtEnd}
          onPressedBackspaceAtStart={handleOnPressedBackspaceAtStart}
          onInput={handleInput}
        />
      </div>
    </BlockContainer>
  );
}

export function ReadableCheckListItemBlock({ item }: CheckListItemBlockProps) {
  return (
    <div className="flex">
      <div
        className="py-[7px] size-fit pl-1 pr-[9px]"
        style={{
          marginLeft: `${item.indent ? item.indent * 20 : 0}px`,
        }}
      >
        <input
          defaultChecked={item.checked}
          className="pointer-events-none"
          type="checkbox"
        />
      </div>
      <div
        className={twMerge(
          "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
          "py-[6px] inline"
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeText(item.text) }}
      ></div>
    </div>
  );
}
