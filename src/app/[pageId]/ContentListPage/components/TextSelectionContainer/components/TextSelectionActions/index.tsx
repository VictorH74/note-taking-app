import React from "react";
import { useTextSelectionActions } from "./useTextSelectionActions";
import { twMerge } from "tailwind-merge";
import { ColorPicker } from "./components/ColorPicker";

export function TextSelectionActions() {
  const hook = useTextSelectionActions();

  return (
    <div
      ref={hook.TextSelectionActionsRef}
      className="fixed inset-x-0 pointer-events-none opacity-0"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="w-fit h-full bg-zinc-700 flex justify-center divide-x divide-zinc-600 rounded-md shadow-lg">
        {hook.actionBtnDataList.map(({ className, ...rest }, index) => (
          <button
            key={index}
            className={twMerge(
              "h-[38px] min-w-[38px] cursor-pointer text-sm hover:brightness-125 duration-150",
              className
            )}
            {...rest}
          />
        ))}
      </div>

      {hook.colorPickerPos && <ColorPicker position={hook.colorPickerPos} />}
    </div>
  );
}
