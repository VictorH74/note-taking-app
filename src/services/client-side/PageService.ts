import { ClientFirebaseApi } from "@/api/client/client-api-implementations/ClientFirebaseApi";
import { IClientApi } from "@/api/client/IClientApi";
import { PageListStreamObserver } from "@/types/client-api";
import { BlockT, ListablePageDataT, PageContentT } from "@/types/page";

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

  async deletePage(id: PageContentT["id"]): Promise<void> {
    return this.api.deletePage(id);
  }

  async createPageMetadata(
    pageId: PageContentT["id"],
    ownerId: PageContentT["ownerId"]
  ): Promise<void> {
    return this.api.createPageMetadata(pageId, ownerId);
  }

  async updateBlock(
    id: BlockT["id"],
    pageId: PageContentT["id"],
    data: Record<string, unknown>
  ): Promise<void> {
    return this.api.updateBlock(id, pageId, data);
  }

  async deleteBlock(
    id: BlockT["id"],
    pageId: PageContentT["id"]
  ): Promise<void> {
    return this.api.deleteBlock(id, pageId);
  }

  async createBlock(
    pageId: PageContentT["id"],
    item: BlockT
  ): Promise<BlockT["id"]> {
    return this.api.createBlock(pageId, item);
  }
}

export const pageService = new PageService(new ClientFirebaseApi());
