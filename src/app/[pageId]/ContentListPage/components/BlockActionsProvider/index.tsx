import { usePageContent } from "@/hooks/usePageContent";
import { PositionT } from "@/types/global";
import React from "react";
import { BlockDropArea } from "./components/BlockDropArea";
import { AddBlockMenu } from "./components/AddBlockMenu";

type BlockActionsCtxT = {
  dragBlock: (blockIndex: number) => void;
  openAddBlockModal: (left: number, top: number) => void;
};

const BlockActionsCtx = React.createContext<BlockActionsCtxT | null>(null);

export const useBlockActions = () => {
  const ctx = React.use(BlockActionsCtx);

  if (!ctx)
    throw new Error(
      "useBlockActions must be used within a BlockActionsProvider"
    );

  return ctx;
};

interface BlockActionsProviderProps {
  children: React.ReactNode;
}

export function BlockActionsProvider(props: BlockActionsProviderProps) {
  const { reorderBlockList } = usePageContent();

  const [addBlockModalPos, setAddBlockModalPos] =
    React.useState<PositionT | null>(null);

  const [draggableBlockIndex, setDraggableBlockIndex] = React.useState<
    number | null
  >(null);

  const dragBlock = (blockIndex: number) => {
    setDraggableBlockIndex(blockIndex);
  };

  const openAddBlockModal = (left: number, top: number) => {
    setAddBlockModalPos({ left, top });
  };

  return (
    <BlockActionsCtx.Provider value={{ dragBlock, openAddBlockModal }}>
      {props.children}
      {addBlockModalPos && (
        <AddBlockMenu
          addBlockModalPos={addBlockModalPos}
          onClose={() => setAddBlockModalPos(null)}
        />
      )}
      {draggableBlockIndex != null && (
        <BlockDropArea
          draggableBlockIndex={draggableBlockIndex}
          onDrop={reorderBlockList}
          onClose={() => setDraggableBlockIndex(null)}
        />
      )}
    </BlockActionsCtx.Provider>
  );
}
