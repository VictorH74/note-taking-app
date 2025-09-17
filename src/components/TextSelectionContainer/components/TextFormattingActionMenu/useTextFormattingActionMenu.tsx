import { useTextSelection } from "@/hooks/useTextSelection";
import { PositionT } from "@/types/global";
import React from "react";

// interface TextFormattingActionMenuProps {
//   onClose(): void;
// }

export const useTextFormattingActionMenu = () => {
  const [rangePos, setRangePos] = React.useState<PositionT | null>(null)

  const { commonFormattingRef, selectedRange } = useTextSelection();

  const setupTextFormattingActionMenuPos = React.useCallback(() => {
    if (selectedRange) {
      const { top: rangeTop, left: RangeLeft } = selectedRange.getBoundingClientRect();

      setRangePos({
        top: rangeTop,
        left: RangeLeft
      })
      console.log('setRangePos')
      return;
    }
    setRangePos(null)
    console.log('setRangePos to null')
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
    rangePos,
    selectedRange,
  };
};
