import React from "react";
import { twMerge } from "tailwind-merge";
import { ColorPicker } from "./components/ColorPicker";
import { ModalContainer } from "@/components/ModalContainer";
import { FormattingActionBtnsProps, useFormattingActionBtns } from "./useFormattingActionBtns";



export function FormattingActionBtns(props: FormattingActionBtnsProps) {
  const hook = useFormattingActionBtns(props)

  return (
    <ModalContainer onClose={() => { }} containerPos={hook.calculatedPos || { top: 0, left: 0 }}>
      <div ref={hook.FormattingActionBtnsRef} className={twMerge("w-fit h-full bg-zinc-700 flex justify-center divide-x divide-zinc-600 rounded-md shadow-lg", hook.calculatedPos ? '' : 'opacity-0')}>
        {hook.actionBtnDataList.map(({ className, setElStyle, ...rest }, index) => (
          <button
            key={index}
            className={twMerge(
              "h-[38px] min-w-[38px] cursor-pointer text-sm hover:brightness-125 duration-150",
              className
            )}
            {...rest}
            ref={refEl => {
              if (setElStyle && refEl)
                setElStyle(refEl)

            }}
          />
        ))}
      </div>
      {hook.colorPickerPos && <ColorPicker position={hook.colorPickerPos} />}
    </ModalContainer>
  );
}
