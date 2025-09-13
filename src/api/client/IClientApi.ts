import { PageListStreamObserver } from "@/types/client-api";
import {
  BlockT,
  EditablePageContentT,
  ListablePageDataT,
  PageContentT,
} from "@/types/page";

export interface IClientApi {
  getListablePageList(ownerId: string): Promise<ListablePageDataT[]>;
  getListablePageListStream(
    ownerId: string,
    observer: PageListStreamObserver
  ): () => void;
  getPageContent(pageId: string): Promise<PageContentT | null>;
  updatePageContent(
    pageId: PageContentT["id"],
    content: Partial<EditablePageContentT>
  ): Promise<void>;
  createPage(
    ownerId: PageContentT["ownerId"],
    parentId: PageContentT["parentId"]
  ): Promise<ListablePageDataT>;
  deletePage(id: PageContentT["id"]): Promise<void>;
  createPageMetadata(
    pageId: PageContentT["id"],
    ownerId: PageContentT["ownerId"]
  ): Promise<void>;

  deleteBlock(id: BlockT["id"], pageId: PageContentT["id"]): Promise<void>;
  createBlock(pageId: PageContentT["id"], item: BlockT): Promise<BlockT["id"]>;
  updateBlock(
    id: BlockT["id"],
    pageId: PageContentT["id"],
    data: Record<string, unknown>
  ): Promise<void>;
}
