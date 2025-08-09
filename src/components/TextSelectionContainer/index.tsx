import { TextSelectionProvider } from "@/context/TextSelectionCtx";
import React from "react";
import { TextFormattingActionMenu } from "./components/TextFormattingActionMenu";

interface TextSelectionContainerProps {
  children: React.ReactNode;
}

export function TextSelectionContainer(props: TextSelectionContainerProps) {
  return (
    <TextSelectionProvider>
      {props.children}
      <TextFormattingActionMenu />
    </TextSelectionProvider>
  );
}
