import { pageService } from "@/services/client-side/PageService";
import { PageContentT } from "@/types/page";
import React from "react";

export const usePageContentFetch = (pageId: string) => {
  const [pageContent, setPageContent] = React.useState<PageContentT | null>(
    null
  );
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // TODO: add abort controller to cancel fetch on unmount
    // const abortController = new AbortController();
    // const { signal } = abortController;

    const fetchPageContent = async () => {
      try {
        // TODO: Simulate fetching page content from an API or database
        // Replace this with actual fetch logic

        // page id placeholder: "content-list-id-placeholder"
        const data = await pageService.getPageContent(pageId);

        setPageContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();

    // return () => abortController.abort();
  }, [pageId]);

  return { pageContent, loading, error };
};
