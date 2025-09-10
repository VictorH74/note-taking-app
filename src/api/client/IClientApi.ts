import { PageListStreamObserver } from "@/types/client-api";
import {
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
}
