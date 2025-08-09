import React from "react";
import { twMerge } from "tailwind-merge";
import { BlockActions } from "./components/BlockActions";
import { BLOCK_ITEM_CLASSNAME } from "@/utils/constants";

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
  return (
    <>
      <div
        {...divProps}
        className={twMerge("relative", BLOCK_ITEM_CLASSNAME, className)}
      >
        <div className={twMerge("relative h-fit group")}>
          <BlockActions blockIndex={index} />
          <div className="block-content">{children}</div>
        </div>
        <div className="add-block-inpt-container" />
      </div>
    </>
  );
}
