import { BLOCK_INPUT_CLASSNAME } from "@/lib/utils/constants";
import React from "react";
import { twMerge } from "tailwind-merge";
import { UrlOptionsMenu } from "./components/UrlOptionsMenu";
import { BlockInputProps, useBlockInput } from "./useBlockInput";
import { InlineUrlDataChangeModal } from "./components/InlineUrlDataChangeModal";

export function BlockInput(props: BlockInputProps) {
  const hook = useBlockInput(props);

  return (
    <>
      {React.createElement(props.tag || "div", {
        ref: props.ref || hook.inputRef,
        className: twMerge(
          "h-fit w-full relative outline-none whitespace-pre-wrap cursor-text",
          hook.id,
          BLOCK_INPUT_CLASSNAME,
          props.className
        ),
        contentEditable: true,
        ...hook.handlers,
      })}
      {hook.urlOptionsMenuData &&
        (
          <UrlOptionsMenu
            {...hook.urlOptionsMenuData}
            onClose={(inputVChanged) => {
              hook.setUrlOptionsMenuData(null);
              if (inputVChanged) hook.handlers.onInput();
            }}
          />
        )}
      {hook.inlineUrlChangeData &&
        (
          <InlineUrlDataChangeModal
            {...hook.inlineUrlChangeData}
            onClose={() => hook.setInlineUrlChangeData(null)}
            syncBlockInput={hook.handlers.onInput}
          />
        )}
    </>
  );
}
