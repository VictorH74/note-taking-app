import { CodeBlockT } from "@/types/page";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import { BlockInput } from "../BlockInput";
import React from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { BlockContentWrapper } from "../BlockContentWrapper";

type CodeContentProps = BlockComponentProps<CodeBlockT>;

export function CodeBlock({ item, index, onChange }: CodeContentProps) {
  const handleInput = (_: string, textCode: string) => {
    const html = Prism.highlight(
      textCode,
      Prism.languages.javascript,
      item.language
    );
    onChange({ content: html });
    return html;
  };

  return (
    <div
      className="block-item py-2 relative"
      id={item.id}
      spellCheck="false"
      autoCapitalize="off"
      autoCorrect="off"
      style={{
        fontFamily: "Consolas, 'Courier New', monospace",
      }}
    >
      <BlockContentWrapper blockIndex={index}>
        <div className="w-full flex absolute top-0 inset-x-0 py-2 px-4 text-[13px]">
          <span className="text-[#cccccc]/70">{item.language}</span>
        </div>
        <BlockInput
          text={item.content}
          inputBlockIndex={index}
          className="bg-[#1f1f1f] rounded-lg px-6 py-10 text-sm text-[#cccccc] line leading-4x"
          onInput={handleInput}
          disableFormatting
          useBreakLineElement={false}
        />
      </BlockContentWrapper>
    </div>
  );
}
