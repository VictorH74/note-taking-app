import { ParagraphBlockT } from "@/types/page";
// import { formatText } from "@/utils/functions";
import { BlockComponentProps } from "../../../ContentListPage/EditableContentListPage/useEditableContentList";
import React from "react";
import { usePageContent } from "@/hooks/usePageContent";
import { BlockInput } from "../../BlockInput";
import { BlockContainer } from "../../BlockContainer";

type ParagraphContentProps = BlockComponentProps<ParagraphBlockT>;

export function ParagraphBlock({
  item,
  onChange,
  index,
}: ParagraphContentProps) {
  const inputRef = React.useRef<HTMLElement>(null);

  const {
    pageContent,
    addNewParagraphBlock,
    removeBlock,
    addNewListItemBlock,
    addNewHeadingBlock,
  } = usePageContent();

  const blockGenerationString = React.useMemo<Record<string, () => void>>(
    () => ({
      "# ": () => addNewHeadingBlock("heading1", index, true),
      "## ": () => addNewHeadingBlock("heading2", index, true),
      "### ": () => addNewHeadingBlock("heading3", index, true),
      "- ": () => addNewListItemBlock("bulletlistitem", undefined, index, true),
      "1. ": () =>
        addNewListItemBlock("numberedlistitem", undefined, index, true),
      "[] ": () => addNewListItemBlock("checklistitem", undefined, index, true),
    }),
    [addNewHeadingBlock, addNewListItemBlock, index]
  );

  const handleOnPressedEnterAtStart = () => {
    addNewParagraphBlock(index);
  };
  const handleOnPressedEnterAtEnd = () => {
    addNewParagraphBlock(index + 1);
  };
  const handleOnPressedBackspaceAtStart = () => {
    removeBlock(index, true, pageContent!.blockList[index].text as string);
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    const input = inputRef.current!;

    if (!input) return;

    if (e.currentTarget.textContent?.length == 0)
      input.classList.remove("after:opacity-0");
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const input = inputRef.current!;

    if (!input) return;

    if (e.currentTarget.textContent?.length == 0)
      input.classList.add("after:opacity-0");
  };

  const handleInput = (innerHTML: string, textContent: string) => {
    const blockGenerationFunc = blockGenerationString[textContent];

    if (blockGenerationFunc != undefined) {
      blockGenerationFunc();
      return;
    }

    onChange({
      text: innerHTML,
    });
  };

  return (
    <BlockContainer id={item.id} index={index}>
      <BlockInput
        ref={inputRef}
        inputBlockIndex={index}
        className="py-1"
        placeholder="Write something..."
        text={item.text}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onPressedEnterAtStart={handleOnPressedEnterAtStart}
        onPressedEnterAtEnd={handleOnPressedEnterAtEnd}
        onPressedBackspaceAtStart={handleOnPressedBackspaceAtStart}
      />
    </BlockContainer>
  );
}
