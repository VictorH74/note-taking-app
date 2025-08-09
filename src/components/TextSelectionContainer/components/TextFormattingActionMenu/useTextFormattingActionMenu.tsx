import { useTextSelection } from "@/hooks/useTextSelection";
import React from "react";

// interface TextFormattingActionMenuProps {
//   onClose(): void;
// }

const decreaseLeftNumber = 30;

export const useTextFormattingActionMenu = () => {
  const TextSelectionActionsRef = React.useRef<HTMLDivElement>(null);

  const { commonFormattingRef, selectedRange } = useTextSelection();

  React.useEffect(() => {
    if (!TextSelectionActionsRef.current) return;
    const TextSelectionActions = TextSelectionActionsRef.current;

    if (selectedRange) {
      const { top, left } = selectedRange.getBoundingClientRect();

      TextSelectionActions.style.top =
        top - (TextSelectionActions.getBoundingClientRect().height + 10) + "px";
      TextSelectionActions.children[0].setAttribute(
        "style",
        `margin-left:${
          left - decreaseLeftNumber > 0 ? left - decreaseLeftNumber : 0
        }px`
      );

      return;
    }

    TextSelectionActions.style.top = "0px";
  }, [selectedRange]);

  return {
    commonFormattingRef,
    TextSelectionActionsRef,
    selectedRange,
  };
};
