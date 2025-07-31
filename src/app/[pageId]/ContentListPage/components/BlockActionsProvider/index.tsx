import { usePageContent } from "@/hooks/usePageContent";
import { PositionT } from "@/types/global";
import React from "react";
import { twMerge } from "tailwind-merge";

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

const increase = 60;

export function BlockActionsProvider(props: BlockActionsProviderProps) {
  const blockContentRef = React.useRef<Node>(null);
  const blockWidthRef = React.useRef<number>(null);

  const { reorderBlockList } = usePageContent();

  const [addBlockModalPos, setAddBlockModalPos] =
    React.useState<PositionT | null>(null);
  const [mousePos, setMousePos] = React.useState<PositionT | null>(null);

  const [onDragBlockIndex, setOnDragBlockIndex] = React.useState<number | null>(
    null
  );
  const [dropAreaDataList, setDropAreaDataList] = React.useState<
    Pick<DOMRect, "top" | "left" | "width">[]
  >([]);

  React.useEffect(() => {
    const handlerClick = () => {
      console.log("setAddBlockModalPos(null);");
      // setAddBlockModalPos(null);
    };
    if (addBlockModalPos) {
      window.addEventListener("click", handlerClick);
      return;
    }

    window.removeEventListener("click", handlerClick);

    return () => {
      window.removeEventListener("click", handlerClick);
    };
  }, [addBlockModalPos]);

  React.useEffect(() => {
    if (onDragBlockIndex != null) {
      document.body.style.cursor = "grabbing";

      const blockList = document.getElementsByClassName("block-item");

      const blockEl = blockList[onDragBlockIndex!];
      const blockContent = blockEl
        .getElementsByClassName("block-wrapper-content")
        .item(0);
      if (blockContent) {
        blockContentRef.current = blockContent.cloneNode(true);
        blockWidthRef.current = blockEl.getBoundingClientRect().width;
      }

      const tempDropAreaDataList: typeof dropAreaDataList = [];
      for (let i = 0; i < blockList.length; i++) {
        const block = blockList[i];

        const { top, left, width, bottom } = block.getBoundingClientRect();

        tempDropAreaDataList.push({ top, left, width });

        if (i == blockList.length - 1)
          tempDropAreaDataList.push({ top: bottom, left, width });
      }
      setDropAreaDataList(tempDropAreaDataList);
      return;
    }

    document.body.style.cursor = "default";
    setMousePos(null);
    setDropAreaDataList([]);
  }, [onDragBlockIndex]);

  const dragBlock = (blockIndex: number) => {
    setOnDragBlockIndex(blockIndex);
  };

  const openAddBlockModal = (left: number, top: number) => {
    setAddBlockModalPos({ left, top });
  };

  return (
    <BlockActionsCtx.Provider value={{ dragBlock, openAddBlockModal }}>
      {props.children}
      {addBlockModalPos && (
        <div
          className="absolute w-[300px] h-[200px] border-2 border-purple-300"
          style={addBlockModalPos}
          onClick={(e) => e.stopPropagation()}
        >
          aaaaa
        </div>
      )}
      {onDragBlockIndex != null && dropAreaDataList.length > 0 && (
        <div
          className="fixed inset-0 overflow-hidden"
          onMouseUp={() => {
            setOnDragBlockIndex(null);
          }}
          onMouseMove={(e) => {
            setMousePos({ left: e.clientX, top: e.clientY });
          }}
        >
          {dropAreaDataList.map((data, i) => {
            const ignoreDropArea =
              onDragBlockIndex == i || onDragBlockIndex == i - 1;
            return (
              <div
                key={i}
                className={twMerge(
                  "absolute size-fit -translate-y-1/2 py-3",
                  ignoreDropArea ? "" : "drop-area"
                )}
                style={{
                  top: data.top,
                  left: data.left - increase,
                }}
                onMouseUp={
                  ignoreDropArea
                    ? undefined
                    : () => reorderBlockList(onDragBlockIndex, i)
                }
              >
                <div
                  className="h-[3px] duration-300"
                  style={{
                    width: data.width,
                    marginLeft: increase,
                  }}
                ></div>
              </div>
            );
          })}
          {mousePos != null && (
            <div
              ref={(ref) => {
                ref?.append(blockContentRef.current!);
              }}
              className="absolute pointer-events-none opacity-40 -translate-y-1/2 "
              style={{
                top: mousePos.top,
                left: mousePos.left + increase / 2,
                width: blockWidthRef.current || 0,
              }}
            />
          )}
        </div>
      )}
    </BlockActionsCtx.Provider>
  );
}
