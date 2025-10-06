import { BlockT } from "@/types/page";

export class BlockChangingManager {
  private blockIdSet = new Set<BlockT["id"]>();
  private BlockIdRemovedListener: Record<BlockT["id"], () => Promise<void>> =
    {};

  remove(id: BlockT["id"]) {
    if (!this.blockIdSet.has(id)) return;

    this.blockIdSet.delete(id);
    if (!Object.hasOwn(this.BlockIdRemovedListener, id)) return;

    this.BlockIdRemovedListener[id]().then(() => {
      delete this.BlockIdRemovedListener[id];
    });
  }

  add(id: BlockT["id"]) {
    this.blockIdSet.add(id);
  }

  has(id: BlockT["id"]) {
    return this.blockIdSet.has(id);
  }

  addBlockIdRemovedListener(id: BlockT["id"], func: () => Promise<void>) {
    this.BlockIdRemovedListener[id] = func;
  }
}
