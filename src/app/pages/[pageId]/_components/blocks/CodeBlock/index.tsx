import { CodeBlockT } from "@/types/page";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";
import { BlockInput } from "../../BlockInput";
import React from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { BlockContainer } from "../../BlockContainer";

import { ChangeLangBtn } from "./ChangeLangBtn";
import { twMerge } from "tailwind-merge";
import { sanitizeText } from "@/lib/utils/functions";

type CodeContentProps = BlockComponentProps<CodeBlockT>;

export function CodeBlock({ item, index, onChange }: CodeContentProps) {
  if (!onChange) return;

  const handleInput = (_: string, textCode: string) => {
    const html = Prism.highlight(
      textCode,
      Prism.languages.javascript,
      item.language
    );
    onChange({ content: html.replaceAll("\n", "<br>") });
    return html;
  };

  if (!onChange)
    return (
      <div
        className={twMerge(
          "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
          "bg-[#1f1f1f] rounded-lg px-6 py-10 text-sm text-[#cccccc] line leading-4x"
        )}
        dangerouslySetInnerHTML={{
          __html: sanitizeText(item.content.replaceAll("<br>", "\n")),
        }}
      ></div>
    );

  return (
    <BlockContainer
      index={index}
      className="py-2 relative"
      id={item.id}
      spellCheck="false"
      autoCapitalize="off"
      autoCorrect="off"
      style={{
        fontFamily: "Consolas, 'Courier New', monospace",
      }}
    >
      <div className="relative">
        <div className="w-full flex items-center absolute top-0 z-10 inset-x-0 py-2 px-4 text-[13px]">
          <ChangeLangBtn selectedLang={item.language} />
        </div>
        <BlockInput
          text={item.content.replaceAll("<br>", "\n")}
          inputBlockIndex={index}
          className="bg-[#1f1f1f] rounded-lg px-6 py-10 text-sm text-[#cccccc] line leading-4x"
          onInput={handleInput}
          disableFormatting
          useBreakLineElement={false}
        />
      </div>

    </BlockContainer>
  );
}

export function ReadableCodeBlock({ item }: CodeContentProps) {
  return (
    <div
      className={twMerge(
        "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
        "bg-[#1f1f1f] rounded-lg px-6 py-10 text-sm text-[#cccccc] line leading-4x"
      )}
      dangerouslySetInnerHTML={{
        __html: sanitizeText(item.content.replaceAll("<br>", "\n")),
      }}
    ></div>
  );
}
