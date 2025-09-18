import React from "react";
import { PositionT } from "@/types/global";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTextSelection } from "@/hooks/useTextSelection";
import { TextFormattingT } from "@/lib/utils/constants";
import {
  BgColorFormattingT,
  FORMATTING_STYLE,
  FormattingT,
  TextColorFormattingT,
} from "@/lib/utils/constants";
import { replaceBgColorStyle } from "@/lib/utils/functions";
import { ColorPicker } from "./components/ColorPicker";

type ActionBtnDataListT = Pick<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "onClick" | "children"
> & {
  setElStyle?: (el: HTMLButtonElement) => void;
};

export interface FormattingActionBtnsProps {
  rangePos: PositionT
}

const decreaseLeftNumber = 30;

export const useFormattingActionBtns = (props: FormattingActionBtnsProps) => {
  const FormattingActionBtnsRef = React.useRef<HTMLDivElement>(null);

  const [calculatedPos, setCalculatedPos] = React.useState<PositionT | null>(null)
  const [formattingBtnStyle, setFormattingBtnStyle] = React.useState<Record<TextFormattingT | 'color', string> | null>(null)
  const [colorPickerPos, setColorPickerPos] = React.useState<PositionT | null>(
    null
  );

  const {
    applyRemoveFormatting,
    selectedRange,
    selectedNodeFormattingStyleListRef,
    commonFormattingRef,
    hideTextFormattingActionMenu,
  } = useTextSelection();

  const actionBtnDataList = React.useMemo<ActionBtnDataListT[]>(
    () => {
      if (!formattingBtnStyle) return []
      return [
        {
          children: "copy",
          className: "font-semibold px-2",
          onClick: () => { },
        },
        {
          children: "paste",
          className: "font-semibold px-2",
          onClick: () => { },
        },
        {
          children: "b",
          className: "uppercase font-extrabold",
          onClick: () => {
            applyRemoveFormatting("bold");
          },
          setElStyle: (el) => {
            el.setAttribute('style', formattingBtnStyle.bold || '')

          },
        },
        {
          children: "i",
          className: "uppercase font-medium italic",
          onClick: () => {
            applyRemoveFormatting("italic");
          },
          setElStyle: (el) => {
            el.setAttribute('style', formattingBtnStyle.italic || '')
          },
        },
        {
          children: "s",
          className: "uppercase font-medium line-through",
          onClick: () => {
            applyRemoveFormatting("strike-through");
          },
          setElStyle: (el) => {
            el.setAttribute('style', formattingBtnStyle["strike-through"] || '')
          },
        },
        {
          children: "u",
          className: "uppercase font-medium underline",
          onClick: () => {
            applyRemoveFormatting("underline");
          },
          setElStyle: (el) => {
            el.setAttribute('style', formattingBtnStyle.underline || '')
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
            const { height } = e.currentTarget.getBoundingClientRect();
            const { width } = FormattingActionBtnsRef.current!.getBoundingClientRect()
            setColorPickerPos({ left: width, top: height + 5 });
          },
          setElStyle: (el) => {
            const spanel = el.getElementsByClassName('color-formatting-btn').item(0)

            if (spanel) spanel.setAttribute('style', formattingBtnStyle.color)
          },
        },
      ]
    },
    [applyRemoveFormatting, formattingBtnStyle]
  );

  const setup = React.useCallback(() => {
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

    let colorFBtnStyle = ''
    const _formattingBtnStyle: Partial<typeof formattingBtnStyle> = {}

    const textColorFormattingPrefix: TextColorFormattingT = "color-";
    const bgColorFormattingPrefix: BgColorFormattingT = "bg-";

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
      let isColorFormattingKey = false
      if (fName.startsWith(textColorFormattingPrefix) && isCommonFormatting) {
        colorFBtnStyle = fStyle.concat(colorFBtnStyle)
        isColorFormattingKey = true;
      } else if (
        fName.startsWith(bgColorFormattingPrefix) &&
        isCommonFormatting
      ) {
        colorFBtnStyle = fStyle.concat(colorFBtnStyle);
        isColorFormattingKey = true;
      }
      _formattingBtnStyle.color = colorFBtnStyle

      if (isColorFormattingKey) return
      // highlight text formatting buttons
      const textFKey = fName
      const style = 'color:'.concat(isCommonFormatting ? "#6479f0" : "#eeeeee") + ';'
      _formattingBtnStyle[textFKey as TextFormattingT] = style
    });

    setFormattingBtnStyle(_formattingBtnStyle as typeof formattingBtnStyle)

    console.log(
      "   setup >> selectedNodeFormattingStyleList",
      selectedNodeFormattingStyleListRef.current
    );
    console.log("   setup >> commonFormatting", commonFormattingRef.current);

    window.addEventListener("mousedown", hideTextFormattingActionMenu);

    return () => {
      window.removeEventListener("mousedown", hideTextFormattingActionMenu);
    };
  }, [
    commonFormattingRef,
    hideTextFormattingActionMenu,
    selectedNodeFormattingStyleListRef,
    selectedRange,
  ]);

  React.useEffect(() => {
    if (!(actionBtnDataList.length > 0) || !FormattingActionBtnsRef.current) return;

    const FormattingActionBtns = FormattingActionBtnsRef.current;

    const { width: FActionBtnsWidth, height: FActionBtnsHeight } = FormattingActionBtns.getBoundingClientRect()
    const { top: rangeTop, left: rangeLeft } = props.rangePos

    const calculedTop = rangeTop - (FActionBtnsHeight + 10);
    let calculedLeft =
      rangeLeft - decreaseLeftNumber > 0 ? rangeLeft - decreaseLeftNumber : 0;

    const resting =
      window.innerWidth -
      (calculedLeft + FActionBtnsWidth) -
      decreaseLeftNumber;
    if (resting < 0) {
      calculedLeft = calculedLeft + resting;
    }

    setCalculatedPos({
      top: calculedTop,
      left: calculedLeft
    })

  }, [actionBtnDataList, props.rangePos]);

  React.useEffect(() => {
    return setup();
  }, [selectedRange, setup]);

  return {
    calculatedPos,
    FormattingActionBtnsRef,
    actionBtnDataList,
    colorPickerPos,
  };
};
