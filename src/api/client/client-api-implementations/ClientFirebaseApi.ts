import {
  ListablePageDataT,
  PageContentT,
  EditablePageContentT,
  PageContentMetadataT,
} from "@/types/page";
import { IClientApi } from "../IClientApi";
// import { listablePageList } from "@/mockData/listablePageList";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/configs/firebase";
import { PageListStreamObserver } from "@/types/client-api";

export class ClientFirebaseApi implements IClientApi {
  async getListablePageList(ownerId: string): Promise<ListablePageDataT[]> {
    const q = query(collection(db, "pages"), where("ownerId", "==", ownerId));

    const querySnapshot = await getDocs(q);
    const pages: ListablePageDataT[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ListablePageDataT;
      pages.push({ ...data, id: doc.id });
    });

    return pages;
  }

  getListablePageListStream(ownerId: string, observer: PageListStreamObserver) {
    const q = query(collection(db, "pages"), where("ownerId", "==", ownerId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = {
          ...change.doc.data(),
          id: change.doc.id,
        } as ListablePageDataT;

        if (change.type === "added") {
          observer.onAdd(data);
        }
        if (change.type === "modified") {
          observer.onChange(data);
        }
        if (change.type === "removed") {
          observer.onRemove(data);
        }
      });
    });

    return unsubscribe;
  }

  async getPageContent(pageId: string): Promise<PageContentT | null> {
    const pageRef = doc(db, "pages", pageId); // {id, title, parentId, ownerId, createdAt, updatedAt}
    const pageContentRef = doc(db, `pages/${pageId}/blocks`, "data"); // {blockList: [...]}

    let page: PageContentT;

    try {
      const pageDocSnap = await getDoc(pageRef);
      if (pageDocSnap.exists()) {
        page = pageDocSnap.data() as PageContentT;
        page.id = pageDocSnap.id;

        const pageBlocksDocSnap = await getDoc(pageContentRef);
        page.blockList = pageBlocksDocSnap.exists()
          ? pageBlocksDocSnap.data().blockList
          : [];
        return page;
      }

      throw new Error("404 - No such document!");
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  }

  async updatePageContent(
    pageId: string,
    content: Partial<EditablePageContentT>
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    if (content.title) {
      promises.push(
        setDoc(
          doc(db, "pages", pageId),
          { title: content.title, updatedAt: new Date().toISOString() },
          { merge: true }
        )
      );
    }

    if (content.blockList) {
      promises.push(
        setDoc(
          doc(db, `pages/${pageId}/blocks`, "data"),
          { blockList: content.blockList },
          { merge: true }
        )
      );
      promises.push(
        updateDoc(doc(db, "pages", pageId), {
          updatedAt: new Date().toISOString(),
        })
      );
    }

    await Promise.all(promises);
  }

  async createPage(
    ownerId: PageContentT["ownerId"],
    parentId: PageContentT["parentId"]
  ): Promise<ListablePageDataT> {
    const content: Omit<ListablePageDataT, "id"> = {
      title: "New Page",
      parentId,
      ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ref = await addDoc(collection(db, "pages"), content);
    await this.createPageMetadata(ref.id, ownerId);
    const createdDoc = await getDoc(ref);

    return { ...createdDoc.data(), id: createdDoc.id } as ListablePageDataT;
  }

  async deletePage(id: PageContentT["id"]): Promise<void> {
    try {
      const deletePromises: Promise<void>[] = [
        deleteDoc(doc(db, "pages", id)),
        deleteDoc(doc(db, `pages/${id}/blocks`, "data")),
        deleteDoc(doc(db, `pages-metadata`, id)),
      ];

      const q = query(collection(db, "pages"), where("parentId", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.size > 0)
        querySnapshot.docs.forEach((document) =>
          deletePromises.push(this.deletePage(document.id))
        );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Erro ao excluir documentos:", error);
    }
  }

  async createPageMetadata(
    pageId: PageContentT["id"],
    ownerId: PageContentT["ownerId"]
  ): Promise<void> {
    const pageMetadata: PageContentMetadataT = {
      contentId: pageId,
      allowComments: true,
      allowReactions: true,
      ownerId: ownerId,
      isPublic: true,
      inviteds: [],
    };

    return setDoc(doc(db, `pages-metadata`, pageId), pageMetadata);
  }
}
