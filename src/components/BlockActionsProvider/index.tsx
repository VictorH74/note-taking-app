import { usePageContent } from "@/hooks/usePageContent";
import React from "react";
import { BlockDropArea } from "./components/BlockDropArea";
import { AddBlockMenu } from "./components/AddBlockMenu";

type BlockActionsCtxT = {
  dragBlock: (blockIndex: number) => void;
  addBlockTriggerBlock: (blockIndex: number) => void;
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

  const [draggableBlockIndex, setDraggableBlockIndex] = React.useState<
    number | null
  >(null);
  const [addBlockTriggerBlockIndex, setAddBlockTriggerBlockIndex] =
    React.useState<number | null>(null);

  const dragBlock = (blockIndex: number) => {
    setDraggableBlockIndex(blockIndex);
  };

  const addBlockTriggerBlock = (blockIndex: number) => {
    setAddBlockTriggerBlockIndex(blockIndex);
  };

  return (
    <BlockActionsCtx.Provider value={{ dragBlock, addBlockTriggerBlock }}>
      {props.children}
      {addBlockTriggerBlockIndex != null && (
        <AddBlockMenu
          addBlockTriggerBlockIndex={addBlockTriggerBlockIndex}
          onClose={() => setAddBlockTriggerBlockIndex(null)}
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
