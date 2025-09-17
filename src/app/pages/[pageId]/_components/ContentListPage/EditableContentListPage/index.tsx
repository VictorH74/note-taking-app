"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

import {
  ContentListPageEditableChildrenProps,
  fullScreen,
  generateItemComponent,
  useEditableContentList,
} from "./useEditableContentList";
import { TextSelectionContainer } from "@/components/TextSelectionContainer";
import { BlockActionsProvider } from "@/components/BlockActionsProvider";
import { PageContentContainer } from "../ContentListPageBase";
import { PageTitleInput } from "./PageTitleInput";

export function EditableContentListPage(
  props: ContentListPageEditableChildrenProps
) {
  const hook = useEditableContentList(props);

  if (hook.loading) return <p className="animate-pulse text-2xl">Loading...</p>

  if (hook.error) return <p className="text-sm text-red-400 font-semibold">{hook.error}</p>

  if (!hook.pageContent) return <p className="text-2xl text-yellow-100">...</p>

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
            <PageTitleInput
              onInput={hook.handleContentTitleChange}
              text={hook.pageContent?.title || ""}
            ></PageTitleInput>

            <BlockActionsProvider>
              {hook.sortedPageBlockList.map((item, index) =>
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
