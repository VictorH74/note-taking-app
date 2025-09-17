import React from "react";
import { useTextFormattingActionMenu } from "./useTextFormattingActionMenu";
import { FormattingActionBtns } from "./components/FormattingActionBtns";

export function TextFormattingActionMenu() {
  const hook = useTextFormattingActionMenu();

  if (hook.rangePos) return <FormattingActionBtns rangePos={hook.rangePos} />

}
