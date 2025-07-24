import React from "react";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { twMerge } from "tailwind-merge";
import { usePageContent } from "@/hooks/usePageContent";

interface BlockWrapperProps {
  children: React.ReactNode;
  blockIndex: number;
  className?: string;
}
export function BlockWrapper(props: BlockWrapperProps) {
  const actionBtnsRef = React.useRef<HTMLDivElement>(null);
  const dragContainerRef = React.useRef<HTMLDivElement>(null);
  const dropIndexRef = React.useRef<number>(null);
  const [grabbing, setGrabbing] = React.useState(false);
  const { reorderBlockList } = usePageContent();

  React.useEffect(() => {
    if (grabbing) {
      document.body.style.cursor = "grabbing";
      setupDragLayout();
      return;
    }

    if (dragContainerRef.current) {
      dragContainerRef.current.remove();
      dragContainerRef.current = null;

      if (typeof dropIndexRef.current == "number") {
        reorderBlockList(props.blockIndex, dropIndexRef.current);
        dropIndexRef.current = null;
      }
      document.body.style.cursor = "default";
    }
  }, [grabbing]);

  const setupDragLayout = () => {
    const blockList = document.getElementsByClassName("block-item");

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.inset = "0";
    container.id = `drag-container`;

    const createDropArea = (
      { top, left, width }: Pick<DOMRect, "top" | "left" | "width">,
      index: number,
      disabled?: boolean
    ) => {
      const increase = 40;

      const dropArea = document.createElement("div");
      if (!disabled) dropArea.className = "drop-area";

      dropArea.style.position = "absolute";
      dropArea.style.height = "fit";
      dropArea.style.top = top + "px";
      dropArea.style.left = left - increase + "px";
      dropArea.style.width = "fit";
      dropArea.style.transform = "translateY(-50%)";
      dropArea.style.display = `flex`;
      dropArea.style.justifyItems = "right";

      dropArea.onmouseover = () => {
        if (dropIndexRef.current !== index)
          dropIndexRef.current = disabled ? null : index;
      };

      const dropAreaChild = document.createElement("div");
      dropAreaChild.style.height = "3px";
      dropAreaChild.style.width = width + "px";
      dropAreaChild.style.transitionDuration = "300ms";
      dropAreaChild.style.marginLeft = increase + "px";
      dropAreaChild.style.marginTop = "20px";
      dropAreaChild.style.marginBottom = "20px";

      dropArea.appendChild(dropAreaChild);
      return dropArea;
    };

    for (let i = 0; i < blockList.length; i++) {
      const block = blockList[i];

      const { top, left, width, bottom } = block.getBoundingClientRect();

      // ++++++++++++++++++++++++++++++++++

      const dropArea = createDropArea(
        {
          top,
          left,
          width,
        },
        i,
        i == props.blockIndex || i - 1 == props.blockIndex
      );

      container.appendChild(dropArea);

      if (!(i == props.blockIndex) && i == blockList.length - 1) {
        const lastDropArea = createDropArea(
          {
            top: bottom,
            left,
            width,
          },
          i + 1
        );
        container.appendChild(lastDropArea);
      }

      // ++++++++++++++++++++++++++++++++++

      // if (i == props.blockIndex) continue;

      // const { top, left, width, bottom } = block.getBoundingClientRect();

      // if (!(i == props.blockIndex + 1)) {
      //   const dropArea = createDropArea(
      //     {
      //       top,
      //       left,
      //       width,
      //     },
      //     i
      //   );
      //   container.appendChild(dropArea);
      // }

      // if (i == blockList.length - 1) {
      //   const lastDropArea = createDropArea(
      //     {
      //       top: bottom,
      //       left,
      //       width,
      //     },
      //     i + 1
      //   );
      //   container.appendChild(lastDropArea);
      // }
    }

    document.body.appendChild(container);
    dragContainerRef.current = container;
    container.addEventListener("mouseup", () => {
      setGrabbing(false);
    });
  };

  return (
    <div
      className={twMerge("relative h-fit", props.className)}
      onMouseOver={() => {
        actionBtnsRef.current!.style.opacity = "1";
        actionBtnsRef.current!.style.pointerEvents = "auto";
      }}
      onMouseOut={() => {
        actionBtnsRef.current!.style.opacity = "0";
        actionBtnsRef.current!.style.pointerEvents = "none";
      }}
    >
      <div
        ref={actionBtnsRef}
        className="absolute -left-24 top-0 w-24 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none"
      >
        <button className="px-2 py-1">
          <AddIcon />
        </button>
        <button
          className="p-1 cursor-grab"
          onMouseDown={() => setGrabbing(true)}
        >
          <DragIndicatorIcon />
        </button>
      </div>
      {props.children}
    </div>
  );
}
