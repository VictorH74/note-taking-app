import { IServerApi } from "@/api/server/IServerApi";
import { ServerFirebaseApi } from "@/api/server/server-api-implementations/ServerFirebaseApi";
import { PageContentMetadataT } from "@/types/page";

class PageService {
  constructor(private api: IServerApi) {}

  async getPageMetadata(pageId: string): Promise<PageContentMetadataT | null> {
    return this.api.getPageMetadata(pageId);
  }
}

export const pageService = new PageService(new ServerFirebaseApi());
