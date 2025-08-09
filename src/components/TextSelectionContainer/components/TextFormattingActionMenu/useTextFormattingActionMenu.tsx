import { useTextSelection } from "@/hooks/useTextSelection";
import React from "react";

// interface TextFormattingActionMenuProps {
//   onClose(): void;
// }

const decreaseLeftNumber = 30;

export const useTextFormattingActionMenu = () => {
  const TextSelectionActionsRef = React.useRef<HTMLDivElement>(null);

  const { commonFormattingRef, selectedRange } = useTextSelection();

  const setupTextFormattingActionMenuPos = React.useCallback(() => {
    if (!TextSelectionActionsRef.current) return;
    const TextSelectionActions = TextSelectionActionsRef.current;

    if (selectedRange) {
      const { top, left } = selectedRange.getBoundingClientRect();

      const TextFActionMenuWidth =
        TextSelectionActions.children[0].getBoundingClientRect().width;

      const calculedTop =
        top - (TextSelectionActions.getBoundingClientRect().height + 10);
      let calculedLeft =
        left - decreaseLeftNumber > 0 ? left - decreaseLeftNumber : 0;

      const resting =
        window.innerWidth -
        (calculedLeft + TextFActionMenuWidth) -
        decreaseLeftNumber;
      if (resting < 0) {
        calculedLeft = calculedLeft + resting;
      }

      TextSelectionActions.style.top = calculedTop + "px";
      TextSelectionActions.children[0].setAttribute(
        "style",
        `margin-left:${calculedLeft}px`
      );

      return;
    }
    TextSelectionActions.style.top = "0px";
  }, [selectedRange]);

  React.useEffect(() => {
    setupTextFormattingActionMenuPos();

    window.addEventListener("resize", setupTextFormattingActionMenuPos);

    return () => {
      window.removeEventListener("resize", setupTextFormattingActionMenuPos);
    };
  }, [setupTextFormattingActionMenuPos]);

  return {
    commonFormattingRef,
    TextSelectionActionsRef,
    selectedRange,
  };
};
