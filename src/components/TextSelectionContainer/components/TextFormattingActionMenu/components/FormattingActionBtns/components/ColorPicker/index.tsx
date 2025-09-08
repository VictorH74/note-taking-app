import { useTextSelection } from "@/hooks/useTextSelection";
import { PositionT } from "@/types/global";
import {
  BG_COLOR_FORMATTING_NAME_LIST,
  FORMATTING_STYLE,
  TEXT_COLOR_FORMATTING_NAME_LIST,
} from "@/lib/utils/constants";

interface ColorPickerProps {
  position: PositionT;
}
export function ColorPicker(props: ColorPickerProps) {
  const { applyRemoveFormatting } = useTextSelection();
  return (
    <div
      className="absolute p-3 bg-zinc-700 border border-zinc-600 rounded-md -translate-x-1/2 w-[200px] pointer-events-auto"
      style={props.position}
    >
      <p className="text-sm font-semibold lowercase text-nowrap">text color</p>
      <div className="grid grid-cols-5 gap-2">
        {TEXT_COLOR_FORMATTING_NAME_LIST.map((fName) => (
          <button
            key={fName}
            ref={(ref) => {
              ref?.setAttribute("style", FORMATTING_STYLE[fName][0]);
            }}
            className="border border-zinc-600 py-[3px] px-2 rounded-md size-fit"
            onClick={() => {
              applyRemoveFormatting(fName);
            }}
          >
            A
          </button>
        ))}
      </div>
      <p className="text-sm font-semibold lowercase text-nowrap">
        background color
      </p>
      <div className="grid grid-cols-5 gap-2">
        {BG_COLOR_FORMATTING_NAME_LIST.map((fName) => (
          <button
            key={fName}
            ref={(ref) => {
              ref?.setAttribute("style", FORMATTING_STYLE[fName][0]);
            }}
            className="border border-zinc-600 size-[25px] rounded-md"
            onClick={() => {
              applyRemoveFormatting(fName);
            }}
          ></button>
        ))}
      </div>
    </div>
  );
}
