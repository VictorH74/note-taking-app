import { ClientFirebaseApi } from "@/api/client/client-api-implementations/ClientFirebaseApi";
import { IClientApi } from "@/api/client/IClientApi";
import { PageListStreamObserver } from "@/types/client-api";
import { ListablePageDataT, PageContentT } from "@/types/page";

class PageService {
  constructor(private api: IClientApi) {}

  getListablePageList(ownerId: string): Promise<ListablePageDataT[]> {
    return this.api.getListablePageList(ownerId);
  }

  getListablePageListStream(ownerId: string, observer: PageListStreamObserver) {
    return this.api.getListablePageListStream(ownerId, observer);
  }

  async getPageContent(pageId: string): Promise<PageContentT | null> {
    return this.api.getPageContent(pageId);
  }

  async updatePageContent(
    pageId: PageContentT["id"],
    content: Partial<PageContentT>
  ): Promise<void> {
    return this.api.updatePageContent(pageId, content);
  }

  async createPage(
    ownerId: PageContentT["ownerId"],
    parentId: PageContentT["parentId"] = null
  ): Promise<ListablePageDataT> {
    return this.api.createPage(ownerId, parentId);
  }

  async createPageMetadata(
    pageId: PageContentT["id"],
    ownerId: PageContentT["ownerId"]
  ): Promise<void> {
    return this.api.createPageMetadata(pageId, ownerId);
  }
}

export const pageService = new PageService(new ClientFirebaseApi());
