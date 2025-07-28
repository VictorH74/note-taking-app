import React from "react";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { twMerge } from "tailwind-merge";
import { useBlockActions } from "../../ContentListPage/components/BlockActionsProvider";

interface BlockContentWrapperProps {
  children: React.ReactNode;
  blockIndex: number;
  className?: string;
}
export function BlockContentWrapper(props: BlockContentWrapperProps) {
  const actionBtnsRef = React.useRef<HTMLDivElement>(null);

  const { dragBlock, openAddBlockModal } = useBlockActions();

  return (
    <div className={twMerge("relative h-fit block-wrapper")}>
      <div
        ref={actionBtnsRef}
        className="absolute -left-24 top-0 w-24 flex items-center justify-center opacity-0 transition-opacity duration-300 block-wrapper-actions"
      >
        <button
          className="px-2 py-1"
          onClick={() => {
            const { x, width, y, height } =
              actionBtnsRef.current!.getBoundingClientRect();

            openAddBlockModal(x + width, y + height);
          }}
        >
          <AddIcon />
        </button>
        <div
          className="p-1 cursor-grab"
          onMouseDown={() => dragBlock(props.blockIndex)}
        >
          <DragIndicatorIcon />
        </div>
      </div>
      <div className={twMerge("block-wrapper-content", props.className)}>
        {props.children}
      </div>
    </div>
  );
}
