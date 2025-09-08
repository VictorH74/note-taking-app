import { PageContentMetadataT } from "@/types/page";
import { IServerApi } from "../IServerApi";
import { adminDb } from "@/lib/configs/firebase-admin";

export class ServerFirebaseApi implements IServerApi {
  async getPageMetadata(pageId: string): Promise<PageContentMetadataT | null> {
    const ref = adminDb.collection("pages-metadata").doc(pageId);
    const doc = await ref.get();

    if (doc.exists) {
      const data = doc.data() as PageContentMetadataT;
      return { ...data };
    }
    throw new Error("Not found" + pageId);
  }
}
