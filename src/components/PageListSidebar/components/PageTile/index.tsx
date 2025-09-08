import { ListablePageDataT } from "@/types/page";
import React from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { twMerge } from "tailwind-merge";
import { usePathname, useRouter } from "next/navigation";
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { pageService } from "@/services/client-side/PageService";
import { useAuthUser } from "@/hooks/useAuthUser";

interface PageTileProps {
  pageChildren: Record<string, ListablePageDataT[]>;
  pageId: string;
  title: string;
  childrenIndent?: number;
  includeNewPage: (page: ListablePageDataT) => void
}

export function PageTile({
  pageChildren,
  pageId,
  childrenIndent,
  title,
  includeNewPage
}: PageTileProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthUser()

  const isActive = React.useMemo(() => {
    return pathname.includes(pageId);
  }, [pathname, pageId]);

  const createChildPage = async () => {
    const newPage = await pageService.createPage(user!.email!, pageId)
    includeNewPage(newPage)
    router.push(`/pages/${newPage.id}`);
  }

  return (
    <div className="" style={{ marginLeft: 10 * (childrenIndent || 0) }}>
      <div className="flex items-center group/tile">
        <div className="flex items-center w-full">
          <button
            className={twMerge("relative p-2")}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <DescriptionIcon sx={{ color: "#919191", fontSize: 20 }} className={twMerge(!!pageChildren[pageId] ? 'group-hover/tile:opacity-0 duration-200' : '')} />
            {
              !!pageChildren[pageId] && (
                <span className="absolute inset-0 opacity-0 group-hover/tile:opacity-100 duration-200 grid place-items-center">
                  <KeyboardArrowRightIcon
                    className={twMerge(isExpanded ? "rotate-90" : "")}
                    sx={{ color: "#919191", fontSize: 25 }}
                  />
                </span>
              )
            }

          </button>
          <button
            className={twMerge(
              "flex items-center gap-1 font-semibold text-sm min-w-fit text-nowrap w-full",
              isActive ? "text-green-200" : "cursor-pointer"
            )}
            onClick={() => {
              router.push(`/pages/${pageId}`);
            }}
            disabled={isActive}
          >
            {title}
          </button>
        </div>

        <div className="flex items-center group-hover/tile:opacity-100 opacity-0 duration-200">
          <button className="p-2 relative group/more-opt-btn"><MoreHorizIcon className="group-hover/more-opt-btn:bg-zinc-700 duration-200 rounded-md" /></button>
          {user?.email && (
            <button className="p-2 group/add-btn" onClick={async (btn) => {
              btn.currentTarget.disabled = true
              createChildPage()
            }}><AddIcon className="group-hover/add-btn:bg-zinc-700 duration-200 rounded-md" /></button>
          )}

        </div>
      </div>
      {pageChildren[pageId] &&
        isExpanded &&
        pageChildren[pageId].map((page) => (
          <PageTile
            key={page.id}
            pageChildren={pageChildren}
            pageId={page.id}
            title={page.title}
            childrenIndent={1}
            includeNewPage={includeNewPage}
          />
        ))}
    </div>
  );
}
