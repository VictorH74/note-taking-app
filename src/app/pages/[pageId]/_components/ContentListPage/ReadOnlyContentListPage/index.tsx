"use client";
import { usePageContentFetch } from "@/hooks/usePageContentFetch";
import { PageContentT } from "@/types/page";
import { PageContentContainer } from "../ContentListPageBase";
import { twMerge } from "tailwind-merge";
import {
  fullScreen,
  generateItemComponent,
} from "../EditableContentListPage/useEditableContentList";
import { sanitizeText } from "@/lib/utils/functions";
import React from "react";
import { BlockListType } from "@/context/PageContentCtx";

interface ReadOnlyContentListPageProps {
  pageContentId: PageContentT["id"];
}

export function ReadOnlyContentListPage(props: ReadOnlyContentListPageProps) {
  const { pageContent, error } = usePageContentFetch(props.pageContentId);

  const sortedPageBlockList = React.useMemo<BlockListType[]>(() => {
    if (!pageContent) return []
    const blockById = pageContent.blockList.reduce<Record<BlockListType['id'], BlockListType>>((obj, block) => {
      obj[block.id] = block
      return obj
    }, {})

    return pageContent.blockSortIdList.map(id => blockById[id])
  }, [pageContent])

  if (!pageContent) return null

  return (
    <PageContentContainer className="flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {error ? (
        <p className="text-sm text-red-400 font-semibold">{error}</p>
      ) : (
        <div
          id=""
          className="w-full min-h-screen grid place-items-center px-24 overflow-x-hidden"
        >
          <main
            id="page-content-container"
            className={twMerge(
              "min-h-[calc(100vh-40px)] w-full p-6 m-auto pt-20 relative",
              fullScreen ? "" : "max-w-3xl"
            )}
          >
            <div onMouseUp={() => { }}>
              <h1
                className="text-4xl font-extrabold outline-none mb-1"
                dangerouslySetInnerHTML={{
                  __html: sanitizeText(pageContent?.title || ""),
                }}
              ></h1>

              {sortedPageBlockList.map((item, index) =>
                generateItemComponent[item.type](item, index)
              )}
            </div>
          </main>
        </div>
      )}
    </PageContentContainer>
  );
}
