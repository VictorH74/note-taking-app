import { usePageContent } from "@/hooks/usePageContent";
import { PositionT } from "@/types/global";
import React from "react";
import { createPortal } from "react-dom";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ChecklistIcon from "@mui/icons-material/Checklist";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import TitleIcon from "@mui/icons-material/Title";
import CodeIcon from "@mui/icons-material/Code";
import TableViewIcon from "@mui/icons-material/TableView";

interface AddBlockModalProps {
  addBlockModalPos: PositionT;
  newBlockIndex: number;
  filter: string;
  onClose(): void;
}

export const AddBlockModalHeight = 400;

export function AddBlockModal({
  addBlockModalPos,
  newBlockIndex,
  filter,
  onClose,
}: AddBlockModalProps) {
  const {
    addNewParagraphBlock,
    addCodeBlock,
    addNewHeadingBlock,
    addNewListItemBlock,
  } = usePageContent();

  const blockCreatingList = React.useMemo(() => {
    return [
      {
        icon: TitleIcon,
        title: "Heading 1",
        createBlockFunc: () => addNewHeadingBlock("heading1", newBlockIndex),
      },
      {
        icon: TitleIcon,
        title: "Heading 2",
        createBlockFunc: () => addNewHeadingBlock("heading2", newBlockIndex),
      },
      {
        icon: TitleIcon,
        title: "Heading 3",
        createBlockFunc: () => addNewHeadingBlock("heading3", newBlockIndex),
      },
      {
        icon: TextFieldsIcon,
        title: "Paragraph",
        createBlockFunc: () => addNewParagraphBlock(newBlockIndex),
      },
      {
        icon: CodeIcon,
        title: "Code",
        createBlockFunc: () => addCodeBlock("", "typescript", newBlockIndex),
      },
      {
        icon: TableViewIcon,
        title: "Table",
        createBlockFunc: () => addNewParagraphBlock(newBlockIndex),
      },
      {
        icon: FormatListBulletedIcon,
        title: "Bullet List",
        createBlockFunc: () =>
          addNewListItemBlock("bulletlistitem", undefined, newBlockIndex),
      },
      {
        icon: FormatListNumberedIcon,
        title: "Numbered List",
        createBlockFunc: () =>
          addNewListItemBlock("numberedlistitem", undefined, newBlockIndex),
      },
      {
        icon: ChecklistIcon,
        title: "Check List",
        createBlockFunc: () =>
          addNewListItemBlock("checklistitem", undefined, newBlockIndex),
      },
    ];
  }, [
    addCodeBlock,
    addNewHeadingBlock,
    addNewListItemBlock,
    addNewParagraphBlock,
    newBlockIndex,
  ]);

  return createPortal(
    <ul
      className="absolute w-[300px] overflow-y-auto bg-zinc-800 rounded-lg px-1 py-3 z-10 animate-fade-in-scale-forwards scrollbar"
      style={{ ...addBlockModalPos, height: AddBlockModalHeight }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {blockCreatingList
        .filter((v) => {
          return v.title.toLowerCase().includes(filter.toLowerCase());
        })
        .map(({ createBlockFunc, title, icon }) => {
          const Icon = icon;
          return (
            <li
              key={title}
              className="px-2 py-3 cursor-pointer flex items-center hover:bg-zinc-700 duration-200"
              onClick={() => {
                createBlockFunc();
                onClose();
              }}
            >
              <div className="w-8">
                <Icon />
              </div>
              <span>{title}</span>
            </li>
          );
        })}
    </ul>,
    document.body
  );
}
