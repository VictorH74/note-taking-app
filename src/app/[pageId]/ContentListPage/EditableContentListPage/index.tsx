"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

import {
  ContentListPageEditableChildrenProps,
  fullScreen,
  generateItemComponent,
  useEditableContentList,
} from "./useEditableContentList";
import { TextSelectionProvider } from "@/context/TextSelectionCtx";
import { TextSelectionActions } from "@/components/TextSelectionActions";

// TODO: formart content when was copied from the editor

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
          <TextSelectionProvider>
            <h1 className="text-4xl font-extrabold">{hook.contentTitle}</h1>

            {hook.contentBlockList.map((item, index) =>
              generateItemComponent[item.type](
                item,
                index,
                hook.makeHandleItemChange(index)
              )
            )}
            <TextSelectionActions />
          </TextSelectionProvider>
        </main>
      </div>
    </div>
  );
}
