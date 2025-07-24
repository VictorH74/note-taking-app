import { PageContentCtx } from "@/context/PageContentCtx";
import React from "react";

export function usePageContent() {
  const ctx = React.useContext(PageContentCtx);

  if (!ctx) {
    throw new Error("usePageContent must be used within a PageContentProvider");
  }

  return ctx;
}
