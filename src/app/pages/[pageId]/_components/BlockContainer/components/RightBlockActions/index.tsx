import React from "react";
import { useBlockActions } from "@/components/BlockActionsProvider";
import { twMerge } from "tailwind-merge";
import RemoveIcon from '@mui/icons-material/Remove';

interface RightBlockActionsProps {
  blockIndex: number;
}
export function RightBlockActions(props: RightBlockActionsProps) {
  const actionBtnsRef = React.useRef<HTMLDivElement>(null);

  const { deleteBlock } = useBlockActions();

  return (
    <div
      ref={actionBtnsRef}
      className={twMerge(
        "absolute -right-24 top-0 w-24 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      )}
    >
      <button
        className="px-2 py-1"
        onClick={() => {
          deleteBlock(props.blockIndex);
        }}
      >
        <RemoveIcon />
      </button>
    </div>
  );
}
