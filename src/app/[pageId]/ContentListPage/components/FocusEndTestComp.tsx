import { ParagraphBlockT } from "@/types/page";
import { ParagraphBlock } from "../../block-components/ParagraphBlock";

export function FocusEndTestComp() {
  function setCaret(id: string) {
    const element = document.getElementById(id);
    const range = document.createRange();
    const selection = window.getSelection();

    if (!element || !selection) return;

    const el = element.getElementsByClassName("block-input").item(0);
    if (!el) return;

    const lastChild = el.lastChild;
    if (!lastChild) return;

    console.log(el, lastChild);

    const offset = lastChild.textContent?.length || 0;

    range.setStart(lastChild, offset);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  return (
    <>
      <div className="border-2 border-amber-500">
        <div
          id="editable-test"
          contentEditable
          dangerouslySetInnerHTML={{
            __html:
              "text text text <br /> text text text <br /> text text text <br />",
          }}
        ></div>

        <button id="button" onClick={() => setCaret("editable-test")}>
          focus
        </button>
      </div>
      <div className="border-2 border-amber-500">
        <ParagraphBlock
          key={10}
          index={10}
          item={
            {
              id: "paragraph-99999",
              text: "This is a sample paragraph content.",
              type: "paragraph",
            } as ParagraphBlockT
          }
          onChange={() => {}}
        />

        <button id="button" onClick={() => setCaret("paragraph-3")}>
          focus
        </button>
      </div>
    </>
  );
}
