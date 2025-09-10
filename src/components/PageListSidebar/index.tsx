/* eslint-disable react-hooks/exhaustive-deps */
import { ListablePageDataT } from "@/types/page";
import React from "react";
import { pageService } from "@/services/client-side/PageService";
import { PageTile } from "./components/PageTile";
import Image from "next/image";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useAuthUser } from "@/hooks/useAuthUser";
import { usePathname, useRouter } from "next/navigation";

interface PageListSidebarProps {
  loggedUserEmail: string;
}

export function PageListSidebar(props: PageListSidebarProps) {
  const currentPageIdRef = React.useRef<string | null>(null)
  const [pages, setPages] = React.useState<ListablePageDataT[]>([]);
  const [pageChildren, setPageChildren] = React.useState<Record<string, { children: ListablePageDataT[], expanded: boolean }>>({
    root: {
      children: [],
      expanded: false
    }
  });
  const { user } = useAuthUser()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    const { root } = pageChildren

    const _pageChildren: typeof pageChildren = {
      root: {
        children: [],
        expanded: root.expanded
      }
    }

    pages.forEach((page) => {
      if (page.parentId) {
        if (_pageChildren[page.parentId])
          _pageChildren[page.parentId].children.push(page);
        else {
          _pageChildren[page.parentId] = {
            children: [page],
            expanded: pageChildren[page.parentId] ? pageChildren[page.parentId].expanded : false
          };
        }
        return;
      }

      _pageChildren.root.children.push(page);
    });

    setPageChildren(_pageChildren);
  }, [pages])

  React.useEffect(() => {
    if (!pathname.includes('pages/') || pages.length == 0) return
    let pageId: string | null | undefined = pathname.split('/').at(-1)
    if (!pageId) return

    if (pageId === currentPageIdRef.current) return;
    currentPageIdRef.current = pageId

    const obj = pages.reduce<Record<string, ListablePageDataT>>((prevObj, cPage) => {
      prevObj[cPage.id] = cPage;
      return prevObj
    }, {})

    while (!!pageId) {
      const parentId: string | null = obj[pageId].parentId
      if (parentId) pageChildren[parentId].expanded = true
      pageId = parentId
    }

    setPageChildren(() => pageChildren)
  }, [pathname, pageChildren])

  React.useEffect(() => {
    const unsub = pageService.getListablePageListStream(props.loggedUserEmail, {
      onAdd(data) {
        console.log('ADDED', data)
        setPages(prev => [...prev, data])
      },
      onChange(data) {
        setPages(prev => prev.map(p => p.id == data.id ? data : p))
      },
      onRemove(data) {
        setPages(prev => prev.filter(p => p.id == data.id))
      },
    })

    return () => {
      unsub()
    }
  }, []);

  const createNewPage = async () => {
    const created = await pageService.createPage(user!.email!)
    router.push(`/pages/${created.id}`);
  }

  const toggleExpandPageChildren = (pageId: string, value: boolean) => setPageChildren(prev => {
    const temp = { ...prev }
    temp[pageId].expanded = value
    return temp
  })

  return (
    <div className="bg-zinc-800 py-6 w-sm">
      {user && (
        <div className="flex gap-2 items-center justify-between px-4">
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

      <div className="w-full h-[1px] bg-gray-600 my-3" />

      <ul className="px-3">
        {!!pageChildren.root && !!pageChildren.root.children && pageChildren.root.children.map((page) => (
          <PageTile
            key={page.id}
            pageChildren={pageChildren}
            pageId={page.id}
            title={page.title}
            toggleExpandPageChildren={toggleExpandPageChildren}
          />
        ))}
      </ul>
    </div>
  );
}
