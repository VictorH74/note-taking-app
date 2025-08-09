import { twMerge } from "tailwind-merge";
import { useFormattingActionBtns } from "./useFormattingActionBtns";
import { ColorPicker } from "./components/ColorPicker";

export function FormattingActionBtns() {
  const hook = useFormattingActionBtns();

  return (
    <>
      <div className="w-fit h-full bg-zinc-700 flex justify-center divide-x divide-zinc-600 rounded-md shadow-lg pointer-events-auto">
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
    </>
  );
}
