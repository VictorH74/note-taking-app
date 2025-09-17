import React from "react";
import { twMerge } from "tailwind-merge";
import { LeftBlockActions } from "./components/LeftBlockActions";
import { BLOCK_ITEM_CLASSNAME } from "@/lib/utils/constants";
import { RightBlockActions } from "./components/RightBlockActions";

type BlockContainer = React.PropsWithChildren &
  React.ComponentProps<"div"> & {
    index: number;
    className?: string;
  };

export function BlockContainer({
  index,
  className,
  children,
  ...divProps
}: BlockContainer) {
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <>
      <div
        {...divProps}
        className={twMerge("relative", BLOCK_ITEM_CLASSNAME, className)}
      >
        <div ref={ref} className={twMerge("relative h-fit group duration-200 rounded-md px-1")}>
          <LeftBlockActions blockIndex={index} />
          <div className="block-content">{children}</div>
          <RightBlockActions blockIndex={index} BlockContainerRef={ref} />
        </div>
        <div className="add-block-inpt-container" />
      </div>
    </>
  );
}
