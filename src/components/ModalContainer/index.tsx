"use client";

import { PositionT } from "@/types/global";
import React from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";

interface ModalContainerProps extends React.PropsWithChildren {
  containerPos: PositionT
  onClose(): void
  className?: string
}


export function ModalContainer(props: ModalContainerProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    window.addEventListener('mousedown', props.onClose)

    return () => {
      window.removeEventListener('mousedown', props.onClose)
    }
  }, [props.onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={twMerge("fixed inset-0 z-50 pointer-events-none", props.className)}>
      <div className="pointer-events-auto absolute" style={props.containerPos} onMouseDown={e => e.stopPropagation()}>
        {props.children}
      </div>
    </div>,
    document.body
  );
}
