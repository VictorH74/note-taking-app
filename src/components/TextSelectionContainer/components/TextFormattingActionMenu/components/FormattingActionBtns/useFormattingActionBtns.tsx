import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTextSelection } from "@/hooks/useTextSelection";
import { TextFormattingT } from "@/utils/constants";
import { usePageContent } from "@/hooks/usePageContent";
import { PositionT } from "@/types/global";
import {
  BgColorFormattingT,
  FORMATTING_STYLE,
  FormattingT,
  TextColorFormattingT,
} from "@/utils/constants";
import {
  hasExistingBgColorStyle,
  hasExistingTextColorStyle,
  replaceBgColorStyle,
  replaceTextColorStyle,
} from "@/utils/functions";

type ActionBtnDataListT = Pick<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "onClick" | "children"
> & {
  ref?: (el: HTMLButtonElement) => void;
};

export const useFormattingActionBtns = () => {
  const formattingActionBtnRefs = React.useRef<
    Record<TextFormattingT | "color", HTMLButtonElement | null>
  >({
    bold: null,
    italic: null,
    underline: null,
    "strike-through": null,
    color: null,
  });

  const [colorPickerPos, setColorPickerPos] = React.useState<PositionT | null>(
    null
  );

  const { pageContent } = usePageContent();
  const {
    applyRemoveFormatting,
    selectedRange,
    selectedNodeFormattingStyleListRef,
    commonFormattingRef,
    hideTextFormattingActionMenu,
  } = useTextSelection();

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
    [pageContent, applyRemoveFormatting]
  );

  React.useEffect(() => {
    return setup();
  }, [selectedRange]);

  const setup = () => {
    if (!selectedRange) return;

    // get formatting styles from selected nodes
    selectedNodeFormattingStyleListRef.current = [];
    if (selectedRange.cloneContents().childNodes.length > 1) {
      const walker = document.createTreeWalker(
        selectedRange.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return selectedRange.intersectsNode(node)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          },
        }
      );

      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        const nodeStyle = parent?.getAttribute("style") ?? "";

        selectedNodeFormattingStyleListRef.current.push(nodeStyle);
      }
    } else {
      selectedNodeFormattingStyleListRef.current = [
        selectedRange.startContainer.parentElement?.getAttribute("style") || "",
      ];
    }

    // find common styles from selected nodes
    commonFormattingRef.current = new Set();

    const colorFBtn = (formattingActionBtnRefs.current.color
      ?.getElementsByClassName("color-formatting-btn")
      .item(0) ||
      (() => {
        throw new Error("Color demo element is null!");
      })()) as HTMLElement;

    const textColorFormattingPrefix: TextColorFormattingT = "color-";
    const bgColorFormattingPrefix: BgColorFormattingT = "bg-";

    let hasTextColorFormatting = false;
    let hasBgColorFormatting = false;

    Object.entries(FORMATTING_STYLE).forEach(([fName, [fStyle]]) => {
      let count = 0;

      selectedNodeFormattingStyleListRef.current!.forEach((style) => {
        if (fName.startsWith(textColorFormattingPrefix)) {
          if (replaceBgColorStyle(style, "").includes(fStyle.replace(/;$/, "")))
            count++;
        } else if (style.includes(fStyle.replace(/;$/, ""))) count++;
      });

      let isCommonFormatting = false;

      if (
        count > 0 &&
        count == selectedNodeFormattingStyleListRef.current!.length
      ) {
        commonFormattingRef.current!.add(fName as FormattingT);
        isCommonFormatting = true;
      }

      // style color formatting button
      const colorFBtnStyles = colorFBtn.getAttribute("style") || "";
      if (
        fName.startsWith(textColorFormattingPrefix) &&
        isCommonFormatting &&
        !hasTextColorFormatting
      ) {
        colorFBtn.setAttribute(
          "style",
          hasExistingTextColorStyle(colorFBtnStyles)
            ? replaceTextColorStyle(colorFBtnStyles, fStyle)
            : fStyle.concat(colorFBtnStyles)
        );
        hasTextColorFormatting = true;
      } else if (
        fName.startsWith(bgColorFormattingPrefix) &&
        isCommonFormatting &&
        !hasBgColorFormatting
      ) {
        colorFBtn.setAttribute(
          "style",
          hasExistingBgColorStyle(colorFBtnStyles)
            ? replaceBgColorStyle(colorFBtnStyles, fStyle)
            : fStyle.concat(colorFBtnStyles)
        );
        hasBgColorFormatting = true;
      }

      // highlight text formatting buttons
      const fActionBtnRef =
        formattingActionBtnRefs.current[
          fName as keyof typeof formattingActionBtnRefs.current
        ];

      if (!!fActionBtnRef)
        fActionBtnRef.style.color = isCommonFormatting ? "#6479f0" : "#eeeeee";
    });

    if (!hasTextColorFormatting)
      colorFBtn.setAttribute(
        "style",
        replaceTextColorStyle(colorFBtn.getAttribute("style") || "", "")
      );
    if (!hasBgColorFormatting)
      colorFBtn.setAttribute(
        "style",
        replaceBgColorStyle(colorFBtn.getAttribute("style") || "", "")
      );

    console.log(
      "   setup >> selectedNodeFormattingStyleList",
      selectedNodeFormattingStyleListRef.current
    );
    console.log("   setup >> commonFormatting", commonFormattingRef.current);

    window.addEventListener("mousedown", hideTextFormattingActionMenu);

    return () => {
      window.removeEventListener("mousedown", hideTextFormattingActionMenu);
    };
  };

  return {
    actionBtnDataList,
    colorPickerPos,
  };
};
