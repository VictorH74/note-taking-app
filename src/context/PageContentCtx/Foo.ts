import { BlockT } from "@/types/page";

// TODO: improve name
export class FooObj {
  private blockIdSet = new Set<BlockT["id"]>();
  private BlockIdRemovedListener: Record<BlockT["id"], () => Promise<void>> =
    {};

  async remove(id: BlockT["id"]) {
    if (!this.blockIdSet.has(id)) return;

    this.blockIdSet.delete(id);
    await this.BlockIdRemovedListener[id]();
    delete this.BlockIdRemovedListener[id];
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
