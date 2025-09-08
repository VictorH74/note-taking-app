import { ListablePageDataT } from "@/types/page";
import React from "react";
import { pageService } from "@/services/client-side/PageService";
import { PageTile } from "./components/PageTile";
import Image from "next/image";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useAuthUser } from "@/hooks/useAuthUser";
import { useRouter } from "next/navigation";

interface PageListSidebarProps {
  loggedUserEmail: string;
}

export function PageListSidebar(props: PageListSidebarProps) {
  const [pages, setPages] = React.useState<ListablePageDataT[]>([]);
  const { user } = useAuthUser()
  const router = useRouter()

  const pageChildren = React.useMemo(() => {
    const _pageChildren: Record<string, ListablePageDataT[]> = {
      root: [],
    };

    pages.forEach((page) => {
      if (page.parentId) {
        if (_pageChildren[page.parentId])
          _pageChildren[page.parentId].push(page);
        else _pageChildren[page.parentId] = [page];
        return;
      }

      _pageChildren.root.push(page);
    });

    return _pageChildren;
  }, [pages]);

  React.useEffect(() => {
    pageService.getListablePageList(props.loggedUserEmail).then((pages) => {
      setPages(pages);
    });
  }, []);

  const includeNewPage = (page: ListablePageDataT) => {
    setPages(prev => [...prev, page])
  }

  const createNewPage = async () => {
    const created = await pageService.createPage(user!.email!)
    includeNewPage(created)
    router.push(`/pages/${created.id}`);
  }

  return (
    <div className="bg-zinc-800 py-6 w-sm">
      {user && (
        <div className="flex gap-2 items-center justify-between mb-2 px-4">
          <div className="flex gap-2 items-center">
            <Image src={user.photoURL || 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pug/pug-original.svg'} alt="user image profile" width={25} height={25} className="rounded-md" />
            <p>{user.displayName}</p>
          </div>
          <div className="">
            <button className="" onClick={createNewPage}>
              <AddBoxIcon />
            </button>
          </div>
        </div>
      )}

      <ul className="px-2">
        {pageChildren.root!.map((page) => (
          <PageTile
            key={page.id}
            pageChildren={pageChildren}
            pageId={page.id}
            title={page.title}
            includeNewPage={includeNewPage}
          />
        ))}
      </ul>
    </div>
  );
}
