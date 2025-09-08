import React from "react";
import { useTextFormattingActionMenu } from "./useTextFormattingActionMenu";
import { FormattingActionBtns } from "./components/FormattingActionBtns";
import { ModalContainer } from "@/components/ModalContainer";

export function TextFormattingActionMenu() {
  const hook = useTextFormattingActionMenu();

  return (
    <ModalContainer>
      <div
        ref={hook.TextSelectionActionsRef}
        className="absolute inset-x-0 pointer-events-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {hook.selectedRange && <FormattingActionBtns />}
      </div>
    </ModalContainer>
  );
}
