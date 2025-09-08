import {
  EditablePageContentT,
  ListablePageDataT,
  PageContentT,
} from "@/types/page";

export interface IClientApi {
  getListablePageList(ownerId: string): Promise<ListablePageDataT[]>;
  getPageContent(pageId: string): Promise<PageContentT | null>;
  updatePageContent(
    pageId: string,
    content: Partial<EditablePageContentT>
  ): Promise<void>;
  createPage(
    ownerId: PageContentT["ownerId"],
    parentId: PageContentT["parentId"]
  ): Promise<ListablePageDataT>;
  createPageMetadata(
    pageId: PageContentT["id"],
    ownerId: PageContentT["ownerId"]
  ): Promise<void>;
}
