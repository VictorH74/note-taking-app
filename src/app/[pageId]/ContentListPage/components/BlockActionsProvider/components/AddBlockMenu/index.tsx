import { PositionT } from "@/types/global";
import React from "react";
import { createPortal } from "react-dom";

interface AddBlockMenuProps {
  addBlockModalPos: PositionT;
  onClose(): void;
}

export function AddBlockMenu({ addBlockModalPos, onClose }: AddBlockMenuProps) {
  React.useEffect(() => {
    window.addEventListener("mousedown", onClose);
    return () => {
      window.removeEventListener("mousedown", onClose);
    };
  }, [addBlockModalPos, onClose]);

  return createPortal(
    <div
      className="absolute w-[300px] h-[200px] border-2 border-purple-300"
      style={addBlockModalPos}
      onMouseDown={(e) => e.stopPropagation()}
    >
      aaaaa
      <button onClick={onClose}>close</button>
    </div>,
    document.body
  );
}
