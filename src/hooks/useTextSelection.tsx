import { TextSelectionCtx } from "@/context/TextSelectionCtx";
import React from "react";

export function useTextSelection() {
  const ctx = React.use(TextSelectionCtx);

  if (!ctx) {
    throw new Error(
      "useTextSelection must be used within a TextSelectionProvider"
    );
  }

  return ctx;
}
