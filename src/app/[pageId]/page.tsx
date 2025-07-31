import { PageDataT } from "@/types/page";
import { EditableContentListPage } from "./ContentListPage/EditableContentListPage";
import { ReadOnlyContentListPage } from "./ContentListPage/ReadOnlyContentListPage";
import { PageContentProvider } from "@/context/PageContentCtx";

export default async function Page({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  // TODO: Fetch page content based on params.pageId

  // Example content, replace with actual fetched data
  const pageData: PageDataT = {
    contentId: "content-list-id-placeholder",
    createdAt: new Date().toISOString(),
    id: pageId,
    ownerId: "owner-id-placeholder",
    settings: {
      allowComments: true,
      allowReactions: true,
      isFullWidth: false,
    },
    shareSettings: {
      isPublic: true,
      inviteds: [{ userId: "user-id-placeholder", role: "all" }],
    },
    updatedAt: new Date().toISOString(),
  };

  // TODO: Check if user is the owner of the page
  const owner = true; // Placeholder for owner check

  const editor = owner; // = owner || pageData.shareSettings.inviteds.some((invited) => invited.role === "editor");

  if (editor)
    return (
      <PageContentProvider>
        <EditableContentListPage pageContentId={pageData.id} />
      </PageContentProvider>
    );

  if (pageData.shareSettings.isPublic)
    return <ReadOnlyContentListPage pageContentId={pageData.contentId} />;

  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-lg">This is a private page.</p>
      </main>
    </div>
  );
}
