import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";
import { twMerge } from "tailwind-merge";
interface ChangeLangBtnProps {
  selectedLang: string;
}
export function ChangeLangBtn(props: ChangeLangBtnProps) {
  const [openLangOpList, setOpenLangOpList] = React.useState(false);

  return (
    <button
      className="flex items-center text-[#cccccc]/70 cursor-pointer hover:brightness-125 duration-200"
      onClick={() => {
        setOpenLangOpList((prev) => !prev);
      }}
    >
      <span>{props.selectedLang}</span>
      <ExpandMoreIcon
        className={twMerge(
          "duration-200",
          openLangOpList ? "rotate-180" : "rotate-0"
        )}
      />
    </button>
  );
}
