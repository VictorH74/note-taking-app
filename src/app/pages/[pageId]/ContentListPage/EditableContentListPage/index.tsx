"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

import {
  ContentListPageEditableChildrenProps,
  fullScreen,
  generateItemComponent,
  useEditableContentList,
} from "./useEditableContentList";
import { sanitizeText } from "@/lib/utils/functions";
import { TextSelectionContainer } from "@/components/TextSelectionContainer";
import { BlockActionsProvider } from "@/components/BlockActionsProvider";
import { PageContentContainer } from "../ContentListPageBase";

export function EditableContentListPage(
  props: ContentListPageEditableChildrenProps
) {
  const hook = useEditableContentList(props);

  if (hook.error) return <p className="text-sm text-red-400 font-semibold">{hook.error}</p>

  return (
    <PageContentContainer
      id="editable-content-list-page"
      className="w-full grid place-items-center"
    >
      <main
        id="page-content-container"
        className={twMerge(
          "min-h-[calc(100vh-40px)] w-full p-6 m-auto pt-20 relative",
          fullScreen ? "" : "max-w-3xl"
        )}
      >
        <div onMouseUp={() => { }}>
          <TextSelectionContainer>
            <h1
              contentEditable
              className="text-4xl font-extrabold outline-none"
              onInput={hook.handleContentTitleChange}
              dangerouslySetInnerHTML={{
                __html: sanitizeText(hook.pageContent?.title || ""),
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
        </div>

        <button
          className="h-96 w-full cursor-text"
          onClick={hook.createNewParagraphBlock}
        ></button>
      </main>
    </PageContentContainer>
  );
}
