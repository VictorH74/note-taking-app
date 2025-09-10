import { EditableContentListPage } from "./ContentListPage/EditableContentListPage";
import { ReadOnlyContentListPage } from "./ContentListPage/ReadOnlyContentListPage";
import { PageContentProvider } from "@/context/PageContentCtx";

import type { Metadata } from "next";
import { pageService } from "@/services/server-side/PageService";
import { getCurrentUser } from "@/lib/configs/firebase-admin";
import { forbidden, notFound } from "next/navigation";
import { ErrorBoundary } from "./ErrorBoundary";
import ErrorComp from "./error";

export const metadata: Metadata = {
  title: "Pages",
};

export default async function Page({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const pageMetadata = await pageService.getPageMetadata(pageId);

  if (!pageMetadata)
    notFound();

  const user = await getCurrentUser();

  const owner = user && user.email == pageMetadata.ownerId;

  const hasEditPermission = () => {
    if (!user) return false;
    if (owner) return true;

    const invited = pageMetadata.inviteds.find(
      (invited) => invited.userId === user.email
    );
    if (!invited) return false;
    return invited.role === "all" || invited.role === "editor";
  };

  if (hasEditPermission())
    return (
      <ErrorBoundary fallback={<ErrorComp error={new Error()} reset={() => { }} />}>
        <PageContentProvider>
          <EditableContentListPage pageContentId={pageId} />
        </PageContentProvider>
      </ErrorBoundary>

    );

  if (pageMetadata.isPublic)
    return (
      <ErrorBoundary fallback={<ErrorComp error={new Error()} reset={() => { }} />}>
        <ReadOnlyContentListPage pageContentId={pageMetadata.contentId} />
      </ErrorBoundary>
    );

  forbidden();
}
