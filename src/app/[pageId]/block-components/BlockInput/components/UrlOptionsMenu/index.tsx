import { LinkPreviewT, PositionT } from "@/types/global";
import { FORMATTING_STYLE } from "@/utils/constants";
import React from "react";

export interface UrlOptionsMenuProps {
  position: PositionT;
  targetEl: HTMLAnchorElement;
  previewData: LinkPreviewT;
  onClose(inputValueChanged?: boolean): void;
}

const btnClassName = "px-4 py-2 cursor-pointer hover:brightness-120";

export const UrlOptionsMenu = (props: UrlOptionsMenuProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const onClose = () => {
    console.log("UrlOptionsMenu > onClose()");
    props.onClose();
  };

  React.useEffect(() => {
    if (!ref.current) return;

    setTimeout(() => {
      document.addEventListener("selectionchange", onClose);
      document.addEventListener("click", onClose);
    }, 0);

    return () => {
      document.removeEventListener("selectionchange", onClose);
      document.removeEventListener("click", onClose);
    };
  }, []);

  const convertLinkToUrlPreview = () => {
    props.targetEl.classList.add("inline-link-preview");
    props.targetEl.setAttribute(
      "class",
      "w-fit hover:bg-zinc-600 rounded-md px-1 duration-300 select-none"
    );

    const faviconImg = document.createElement("img");
    faviconImg.src = props.previewData.favicon_url;
    faviconImg.setAttribute(
      "style",
      "width:1.2em;height:1.2em;border-radius:3px;vertical-align:-0.22em;margin-inline-end:0.3em;display:inline;"
    );
    const titleSpan = document.createElement("span");
    titleSpan.textContent = props.previewData.title;
    titleSpan.setAttribute("style", FORMATTING_STYLE.bold[0].concat(""));

    props.targetEl.innerHTML = "";
    props.targetEl.append(faviconImg, titleSpan);

    props.onClose(true);
  };

  return (
    <div
      ref={ref}
      className="absolute p-2 rounded-lg bg-zinc-800 flex flex-col"
      style={props.position}
      onClick={(e) => e.stopPropagation()}
    >
      <button className={btnClassName} onClick={convertLinkToUrlPreview}>
        Preview
      </button>
      <button className={btnClassName} onClick={() => props.onClose()}>
        URL
      </button>
    </div>
  );
};
