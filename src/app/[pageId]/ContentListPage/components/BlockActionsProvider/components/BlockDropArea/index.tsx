import { PositionT } from "@/types/global";
import React from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";

export interface BlockDropAreaProps {
  //   dropAreaDataList: Pick<DOMRect, "top" | "width" | "left">[];
  draggableBlockIndex: number;
  onDrop(index: number, toIndex: number): void;
  onClose(): void;
}

export function BlockDropArea({
  draggableBlockIndex,
  onDrop,
  onClose,
}: BlockDropAreaProps) {
  const blockContentRef = React.useRef<Node>(null);
  const blockWidthRef = React.useRef<number>(null);
  const blockListContainerTop = React.useRef<number>(null);

  const [dropAreaDataList, setDropAreaDataList] = React.useState<
    Pick<DOMRect, "top" | "width" | "left">[]
  >([]);

  const [mousePos, setMousePos] = React.useState<PositionT | null>(null);
  const [scrollHeight, setScrollHeight] = React.useState(0);

  const updateScrollHeight = () => {
    setScrollHeight(window.scrollY);
  };

  const updateMousePos = (e: MouseEvent) => {
    setMousePos({ left: e.clientX, top: e.clientY });
  };

  const getBlockListContainer = () => {
    return document.getElementById("page-content-container");
  };

  React.useEffect(() => {
    const blockListContainer = getBlockListContainer();
    if (!blockListContainer) return;
    blockListContainerTop.current =
      blockListContainer.getBoundingClientRect().top;

    const blockList = document.getElementsByClassName("block-item");
    const blockEl = blockList[draggableBlockIndex!];
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

    document.body.style.cursor = "grabbing";
    document.addEventListener("mouseup", onClose);
    window.addEventListener("mousemove", updateMousePos);
    window.addEventListener("scroll", updateScrollHeight);

    return () => {
      document.body.style.cursor = "default";
      document.removeEventListener("mouseup", onClose);
      window.removeEventListener("mousemove", updateMousePos);
      window.removeEventListener("scroll", updateScrollHeight);
    };
  }, [draggableBlockIndex, onClose]);

  return createPortal(
    <div className="absolute inset-0 overflow-hidden">
      {dropAreaDataList.map((data, i) => {
        const ignoreDropArea =
          draggableBlockIndex == i || draggableBlockIndex == i - 1;
        return (
          <div
            key={i}
            className={twMerge(
              "absolute inset-x-0 -translate-y-1/2 py-3",
              ignoreDropArea ? "" : "drop-area"
            )}
            style={{
              top: data.top - (blockListContainerTop.current || 0),
            }}
            onMouseUp={
              ignoreDropArea ? undefined : () => onDrop(draggableBlockIndex, i)
            }
          >
            <div
              className="h-[3px] duration-300 w-full mx-auto"
              style={{
                width: data.width,
              }}
            ></div>
          </div>
        );
      })}
      {mousePos != null &&
        createPortal(
          <div
            ref={(ref) => {
              ref?.append(blockContentRef.current!);
            }}
            className="absolute pointer-events-none opacity-40 -translate-y-1/2 "
            style={{
              top: mousePos.top + scrollHeight,
              left: mousePos.left,
              width: blockWidthRef.current || 0,
            }}
          />,
          document.getElementById("editable-content-list-page") || document.body
        )}
    </div>,
    getBlockListContainer() || document.body
  );
}
