import React from "react";
import { useTextFormattingActionMenu } from "./useTextFormattingActionMenu";
import { FormattingActionBtns } from "./components/FormattingActionBtns";

export function TextFormattingActionMenu() {
  const hook = useTextFormattingActionMenu();

  return (
    <div
      ref={hook.TextSelectionActionsRef}
      className="fixed inset-x-0 pointer-events-none"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {hook.selectedRange && <FormattingActionBtns />}
    </div>
  );
}
