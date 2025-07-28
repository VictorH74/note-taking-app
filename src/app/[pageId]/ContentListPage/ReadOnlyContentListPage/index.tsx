import { usePageContentFetch } from "@/hooks/usePageContentFetch";
import { PageContentT } from "@/types/page";

interface ReadOnlyContentListPageProps {
  pageContentId: PageContentT["id"];
}

export function ReadOnlyContentListPage(props: ReadOnlyContentListPageProps) {
  const { pageContent } = usePageContentFetch(props.pageContentId);

  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <h1 className="text-2xl font-bold">
          Content List Page: {pageContent?.title}
        </h1>
        <p className="text-lg">
          This is a placeholder for content. {pageContent?.blockList.length}{" "}
          items
        </p>
      </main>
    </div>
  );
}
