import React from "react";
import { twMerge } from "tailwind-merge";

interface PageContentContainerProps extends React.PropsWithChildren {
  id?: string;
  className?: string;
}

export function PageContentContainer(props: PageContentContainerProps) {
  return (
    <div
      id={props.id}
      className={twMerge("w-full grid place-items-center", props.className)}
    >
      {props.children}
    </div>
  );
}
