import React from "react";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useBlockActions } from "@/components/BlockActionsProvider";
import { twMerge } from "tailwind-merge";
import { LEFT_BLOCK_ACTIONS_CLASSNAME } from "@/lib/utils/constants";

interface LeftBlockActionsProps {
  blockIndex: number;
}
export function LeftBlockActions(props: LeftBlockActionsProps) {
  const actionBtnsRef = React.useRef<HTMLDivElement>(null);

  const { dragBlock, addBlockTriggerBlock } = useBlockActions();

  return (
    <div
      ref={actionBtnsRef}
      className={twMerge(
        "absolute -left-24 top-0 w-24 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        LEFT_BLOCK_ACTIONS_CLASSNAME
      )}
    >
      <button
        className="px-2 py-1"
        onClick={() => {
          addBlockTriggerBlock(props.blockIndex);
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
  );
}
