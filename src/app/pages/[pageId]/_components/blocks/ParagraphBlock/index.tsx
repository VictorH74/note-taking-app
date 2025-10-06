import { ParagraphBlockT } from "@/types/page";
// import { formatText } from "@/utils/functions";
import React from "react";
import { usePageContent } from "@/hooks/usePageContent";
import { BlockInput } from "../../BlockInput";
import { BlockContainer } from "../../BlockContainer";
import { twMerge } from "tailwind-merge";
import { sanitizeText } from "@/lib/utils/functions";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";

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

  const blockGenerationString = React.useMemo<Record<string, (text: string) => void>>(
    () => ({
      "# ": (htmlText) => addNewHeadingBlock("heading1", htmlText, index, true),
      "## ": (htmlText) => addNewHeadingBlock("heading2", htmlText, index, true),
      "### ": (htmlText) => addNewHeadingBlock("heading3", htmlText, index, true),
      "- ": (htmlText) => addNewListItemBlock("bulletlistitem", htmlText, 0, index, true),
      "1. ": (htmlText) =>
        addNewListItemBlock("numberedlistitem", htmlText, 0, index, true),
      "[] ": (htmlText) => addNewListItemBlock("checklistitem", htmlText, 0, index, true),
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
    const block = pageContent!.blockList.find(b => b.id == pageContent!.blockSortIdList[index])
    removeBlock(index, true, block!.text as string);
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    const input = inputRef.current!;

    if (!input) return;

    if (e.currentTarget.textContent?.length == 0)
      input.classList.remove("after:opacity-0");
  };

  const handleInput = (innerHTML: string, textContent: string) => {
    if (!onChange) return;

    let blockGenerationFunc: ((text: string) => void) | null = null;
    let blockGenerationKey: string = '';
    for (const key of Object.keys(blockGenerationString)) {
      if (textContent.startsWith(key)) {
        blockGenerationFunc = blockGenerationString[key];
        blockGenerationKey = key
        break;
      }
    }

    if (blockGenerationFunc != undefined) {
      blockGenerationFunc(innerHTML.replace(blockGenerationKey, ''));
      return;
    }

    onChange({
      text: innerHTML,
    });
  };

  if (!onChange)
    return (
      <div
        className={twMerge(
          "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
          "py-1"
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeText(item.text) }}
      ></div>
    );

  return (
    <BlockContainer id={item.id} index={index}>
      <BlockInput
        ref={inputRef}
        inputBlockIndex={index}
        className="py-1"
        placeholder="Write something..."
        text={item.text}
        hidePlaceholderWhenFocusOut
        onFocus={handleFocus}
        onInput={handleInput}
        onPressedEnterAtStart={handleOnPressedEnterAtStart}
        onPressedEnterAtEnd={handleOnPressedEnterAtEnd}
        onPressedBackspaceAtStart={handleOnPressedBackspaceAtStart}
      />
    </BlockContainer>
  );
}

export function ReadableParagraphBlock({ item }: ParagraphContentProps) {
  return (
    <div
      className={twMerge(
        "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
        "py-1"
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeText(item.text) }}
    ></div>
  );
}
