import { TextSelectionProvider } from "@/context/TextSelectionCtx";
import React from "react";
import { TextSelectionActions } from "./components/TextSelectionActions";

interface TextSelectionContainerProps {
  children: React.ReactNode;
}

export function TextSelectionContainer(props: TextSelectionContainerProps) {
  return (
    <TextSelectionProvider>
      {props.children}
      <TextSelectionActions />
    </TextSelectionProvider>
  );
}
