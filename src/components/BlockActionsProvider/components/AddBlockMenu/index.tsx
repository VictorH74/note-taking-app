import {
  AddBlockModal,
  AddBlockModalHeight,
} from "@/app/[pageId]/components/AddBlockModal";
import { usePageContent } from "@/hooks/usePageContent";
import { PositionT } from "@/types/global";
import { BLOCK_ACTIONS_CLASSNAME } from "@/utils/constants";
import React from "react";
import { createPortal } from "react-dom";

interface AddBlockMenuProps {
  addBlockTriggerBlockIndex: number;
  onClose(): void;
}

export function AddBlockMenu({
  addBlockTriggerBlockIndex,
  onClose,
}: AddBlockMenuProps) {
  const [addBlockModalPos, setAddBlockModalPos] =
    React.useState<PositionT | null>(null);
  const [blockEl, setBlockEl] = React.useState<HTMLElement | null>(null);

  const [filter, setFilter] = React.useState("");

  const { pageContent } = usePageContent();

  React.useEffect(() => {
    const blockId = pageContent?.blockList[addBlockTriggerBlockIndex].id;
    if (!blockId) return;

    const blockEl = document.getElementById(blockId);
    if (!blockEl) return;
    setBlockEl(blockEl);
  }, [addBlockTriggerBlockIndex, pageContent?.blockList]);

  React.useEffect(() => {
    if (!blockEl) return;

    const addBlockInptContainer = blockEl
      ?.getElementsByClassName("add-block-inpt-container")
      .item(0);
    const blockActions = blockEl
      ?.getElementsByClassName(BLOCK_ACTIONS_CLASSNAME)
      .item(0);

    if (!addBlockInptContainer || !blockActions) return;
    const blockActionsRect = blockActions.getBoundingClientRect();

    const addBlockInptRect = addBlockInptContainer
      .getElementsByTagName("input")
      .item(0)
      ?.getBoundingClientRect();

    const addBlockInptHeight = addBlockInptRect?.height || 0;
    let addBlockModalTopPos =
      (addBlockInptRect?.top || 0) +
      addBlockInptHeight +
      addBlockInptHeight / 3;

    if (addBlockModalTopPos + AddBlockModalHeight > window.innerHeight) {
      addBlockModalTopPos =
        (addBlockInptRect?.top || 0) -
        addBlockInptHeight / 3 -
        AddBlockModalHeight;
    }

    setAddBlockModalPos({
      left: blockActionsRect.left + blockActionsRect.width,
      top: addBlockModalTopPos,
    });

    window.addEventListener("mousedown", onClose);

    return () => {
      window.removeEventListener("mousedown", onClose);
    };
  }, [blockEl, onClose]);

  return (
    <>
      {addBlockModalPos && (
        <AddBlockModal
          addBlockModalPos={addBlockModalPos}
          filter={filter}
          newBlockIndex={addBlockTriggerBlockIndex + 1}
          onClose={onClose}
        />
      )}
      {blockEl &&
        createPortal(
          <input
            placeholder="Type to filter..."
            onMouseDown={(e) => e.stopPropagation()}
            className="outline-none"
            onChange={(e) => {
              setFilter(e.currentTarget.value);
            }}
            autoFocus
          />,
          blockEl?.getElementsByClassName("add-block-inpt-container").item(0) ||
            document.body
        )}
    </>
  );
}
