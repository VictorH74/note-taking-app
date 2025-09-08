import { PageContentMetadataT } from "@/types/page";

export interface IServerApi {
  getPageMetadata(pageId: string): Promise<PageContentMetadataT | null>;
}
