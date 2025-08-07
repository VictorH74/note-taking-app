/* eslint-disable react-hooks/exhaustive-deps */
import { usePageContent } from "@/hooks/usePageContent";
import { useTextSelection } from "@/hooks/useTextSelection";
import { PositionT } from "@/types/global";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";

type ActionBtnDataListT = Pick<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "onClick" | "children"
> & {
  ref?: (el: HTMLButtonElement) => void;
};

export const useTextFormattingActionMenu = () => {
  const {
    TextSelectionActionsRef,
    commonFormattingRef,
    applyRemoveFormatting,
    formattingActionBtnRefs,
    onHideFActionMenuListener,
  } = useTextSelection();
  const { pageContent } = usePageContent();
  const [colorPickerPos, setColorPickerPos] = React.useState<PositionT | null>(
    null
  );

  React.useEffect(() => {
    onHideFActionMenuListener(() => setColorPickerPos(null));
  }, []);

  const actionBtnDataList = React.useMemo<ActionBtnDataListT[]>(
    () => [
      {
        children: "copy",
        className: "font-semibold px-2",
        onClick: () => {},
      },
      {
        children: "paste",
        className: "font-semibold px-2",
        onClick: () => {},
      },
      {
        children: "b",
        className: "uppercase font-extrabold",
        onClick: () => {
          applyRemoveFormatting("bold");
        },
        ref: (el) => {
          formattingActionBtnRefs.current.bold = el;
        },
      },
      {
        children: "i",
        className: "uppercase font-medium italic",
        onClick: () => {
          applyRemoveFormatting("italic");
        },
        ref: (el) => {
          formattingActionBtnRefs.current.italic = el;
        },
      },
      {
        children: "s",
        className: "uppercase font-medium line-through",
        onClick: () => {
          applyRemoveFormatting("strike-through");
        },
        ref: (el) => {
          formattingActionBtnRefs.current["strike-through"] = el;
        },
      },
      {
        children: "u",
        className: "uppercase font-medium underline",
        onClick: () => {
          applyRemoveFormatting("underline");
        },
        ref: (el) => {
          formattingActionBtnRefs.current.underline = el;
        },
      },
      {
        children: (
          <>
            <span className="color-formatting-btn border border-zinc-600 py-[3px] px-2 rounded-md ">
              A
            </span>
            <ExpandMoreIcon sx={{ fontSize: 20 }} />
          </>
        ),
        className:
          "uppercase font-medium flex justify-center items-center px-3 relative",
        onClick: (e) => {
          const { left, height } = e.currentTarget.getBoundingClientRect();
          setColorPickerPos({ left, top: height });
        },
        ref: (el) => {
          formattingActionBtnRefs.current.color = el;
        },
      },
    ],
    [pageContent]
  );

  return {
    colorPickerPos,
    commonFormattingRef,
    TextSelectionActionsRef,
    actionBtnDataList,
  };
};
