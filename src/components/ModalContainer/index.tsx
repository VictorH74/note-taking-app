"use client";

import React from "react";
import { createPortal } from "react-dom";
export function ModalContainer({ children }: React.PropsWithChildren) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none">{children}</div>,
    document.body
  );
}
