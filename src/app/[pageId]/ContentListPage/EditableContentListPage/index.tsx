"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

import {
  ContentListPageEditableChildrenProps,
  fullScreen,
  generateItemComponent,
  useEditableContentList,
} from "./useEditableContentList";
import { sanitizeText } from "@/utils/functions";
import { TextSelectionContainer } from "../components/TextSelectionContainer";
import { BlockActionsProvider } from "../components/BlockActionsProvider";

export function EditableContentListPage(
  props: ContentListPageEditableChildrenProps
) {
  const hook = useEditableContentList(props);

  return (
    <div className="min-h-screen w-full grid place-items-center ">
      <div className="w-full min-h-screen grid place-items-center px-24">
        <main
          className={twMerge(
            "h-[calc(100vh-40px)] w-full p-6 m-auto pt-20",
            fullScreen ? "" : "max-w-3xl"
          )}
        >
          <TextSelectionContainer>
            <h1
              contentEditable
              className="text-4xl font-extrabold outline-none"
              onInput={hook.handleContentTitleChange}
              dangerouslySetInnerHTML={{
                __html: sanitizeText(props.pageContentId || ""),
              }}
            ></h1>

            <BlockActionsProvider>
              {hook.pageContent?.blockList.map((item, index) =>
                generateItemComponent[item.type](
                  item,
                  index,
                  hook.makeHandleItemChange(index)
                )
              )}
            </BlockActionsProvider>
          </TextSelectionContainer>
          <button
            className="h-14 w-full cursor-text"
            onClick={hook.createNewParagraphBlock}
          ></button>
        </main>
      </div>
    </div>
  );
}
