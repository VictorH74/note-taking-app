import {
  FORMATTING_STYLE,
  FORMATTING_NAME_LIST,
  FormattingT,
} from "@/utils/constants";
import React from "react";

interface TextSelectionCtxProps {
  TextSelectionActionsRef: React.RefObject<HTMLDivElement | null>;
  showTextSelectionAction: (
    selectedRangePos: {
      left: number;
      top: number;
    },
    onChangeBlockIndex: number,
    inputId: string
  ) => void;
  onChangeBlockIndexRef: React.RefObject<number | null>;
  inputIdRef: React.RefObject<string | null>;
  closeTextSelectionAction: () => void;
  commonFormattingRef: React.RefObject<Set<FormattingT> | null>;
  selectedNodeFormattingStyleListRef: React.RefObject<string[] | null>;
  setupSelectedStyle: () => void;
  formattingActionBtnRefs: React.RefObject<
    Record<FormattingT, HTMLButtonElement | null>
  >;
}

export const TextSelectionCtx =
  React.createContext<TextSelectionCtxProps | null>(null);

export function TextSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const onChangeBlockIndexRef = React.useRef<number | null>(null);
  const inputIdRef = React.useRef<string | null>(null);
  const TextSelectionActionsRef = React.useRef<HTMLDivElement>(null);
  const commonFormattingRef = React.useRef<Set<FormattingT>>(null);
  const selectedNodeFormattingStyleListRef = React.useRef<Array<string>>(null);
  const formattingActionBtnRefs = React.useRef<
    Record<FormattingT, HTMLButtonElement | null>
  >({
    bold: null,
    italic: null,
    underline: null,
    "strike-through": null,
  });

  const showTextSelectionAction = (
    selectedRangePos: {
      left: number;
      top: number;
    },
    onChangeBlockIndex: number,
    inputId: string
  ) => {
    if (!TextSelectionActionsRef.current) return;
    onChangeBlockIndexRef.current = onChangeBlockIndex;
    inputIdRef.current = inputId;

    const TextSelectionActions = TextSelectionActionsRef.current;
    const decreaseLeftNumber = 30;

    TextSelectionActions.style.top =
      selectedRangePos.top -
      (TextSelectionActions.getBoundingClientRect().height + 10) +
      "px";
    TextSelectionActions.children[0].setAttribute(
      "style",
      `margin-left:${
        selectedRangePos.left - decreaseLeftNumber > 0
          ? selectedRangePos.left - decreaseLeftNumber
          : 0
      }px`
    );
    TextSelectionActions.style.opacity = "100%";
    TextSelectionActions.style.pointerEvents = "all";

    setupSelectedStyle();

    window.addEventListener("mousedown", closeTextSelectionAction);
  };

  // TODO: better name to this func
  const setupSelectedStyle = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);

    console.log(`>> setupSelectedStyle: "${selection.toString()}"`);
    console.log(
      `          selected nodes: (${range.cloneContents().childNodes.length})`
    );
    range
      .cloneContents()
      .childNodes.forEach((node) => console.log("          ", node));

    // get formatting styles from selected nodes
    selectedNodeFormattingStyleListRef.current = [];
    if (range.cloneContents().childNodes.length > 1) {
      console.log(
        "      Upper to 1 node selected, walking through doom tree..."
      );
      const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return range.intersectsNode(node)
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
      console.log("startContainer", range.startContainer);
      console.log("startContainer parent", range.startContainer.parentElement);
      selectedNodeFormattingStyleListRef.current = [
        range.startContainer.parentElement?.getAttribute("style") || "",
      ];
    }

    // find common styles from selected nodes
    commonFormattingRef.current = new Set();
    Object.entries(FORMATTING_STYLE).forEach(([fName, fStyle]) => {
      let count = 0;

      selectedNodeFormattingStyleListRef.current!.forEach((style) => {
        console.log(style, fStyle, style.includes(fStyle));
        if (style.includes(fStyle.slice(0, -1))) count++;
      });

      if (
        count > 0 &&
        count == selectedNodeFormattingStyleListRef.current!.length
      )
        commonFormattingRef.current!.add(fName as FormattingT);
    });

    FORMATTING_NAME_LIST.forEach((fName) => {
      const fActionBtnRef = formattingActionBtnRefs.current[fName];
      if (!!fActionBtnRef)
        fActionBtnRef.style.color = commonFormattingRef.current?.has(fName)
          ? "#6479f0"
          : "#eeeeee";
    });

    console.log(
      "   setupSelectedStyle: selectedNodeFormattingStyleListRef",
      selectedNodeFormattingStyleListRef.current
    );
    console.log(
      "   setupSelectedStyle: commonFormattingRef",
      commonFormattingRef.current
    );
  };

  const closeTextSelectionAction = () => {
    console.log(">> closeTextSelectionAction");
    if (!TextSelectionActionsRef.current) return;

    const TextSelectionActions = TextSelectionActionsRef.current;

    selectedNodeFormattingStyleListRef.current = [];
    commonFormattingRef.current = new Set();

    TextSelectionActions.style.opacity = "0";
    TextSelectionActions.style.pointerEvents = "none";
    window.removeEventListener("mousedown", closeTextSelectionAction);
  };

  return (
    <TextSelectionCtx.Provider
      value={{
        formattingActionBtnRefs,
        inputIdRef,
        TextSelectionActionsRef,
        showTextSelectionAction,
        onChangeBlockIndexRef,
        closeTextSelectionAction,
        commonFormattingRef,
        setupSelectedStyle,
        selectedNodeFormattingStyleListRef,
      }}
    >
      {children}
    </TextSelectionCtx.Provider>
  );
}
