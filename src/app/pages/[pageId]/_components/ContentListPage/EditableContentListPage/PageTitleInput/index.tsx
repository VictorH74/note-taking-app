import { usePageContent } from "@/hooks/usePageContent";
import { BLOCK_INPUT_CLASSNAME } from "@/lib/utils/constants";
import { applyFocus, applyFocusByIndex, getCaretIndex, getElementFirstBlockInput, sanitizeText } from "@/lib/utils/functions"

interface PageTitleInputProps {
    text: string
    onInput: (e: React.FormEvent<HTMLHeadingElement>) => void
}

export function PageTitleInput(props: PageTitleInputProps) {
    const { pageContent, addNewParagraphBlock } = usePageContent()

    const handleKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return -1;

        const range = sel.getRangeAt(0).cloneRange();
        const caretIndex = getCaretIndex(e.currentTarget);

        const textContent = e.currentTarget.textContent || "";

        const keyAction = {
            Enter: () => {
                if (textContent.length == caretIndex)
                    addNewParagraphBlock(0, "");
                e.preventDefault();
            },
            ArrowRight: () => {
                if (
                    caretIndex >= textContent.length && pageContent!.blockSortIdList.length > 0
                ) {
                    const element = document.getElementById(pageContent!.blockSortIdList[0]);
                    const el = element!.getElementsByClassName(BLOCK_INPUT_CLASSNAME).item(0);
                    if (!el) return;

                    applyFocus(
                        el!,
                        "start"
                    );
                    e.preventDefault();
                    return;
                }
            },
            ArrowDown: () => {
                const hasBlock = pageContent!.blockSortIdList.length > 0
                if (textContent.length == 0 && hasBlock) {
                    applyFocusByIndex(
                        getElementFirstBlockInput(pageContent!.blockSortIdList[0])!,
                        caretIndex
                    );
                    e.preventDefault();
                    return;
                }

                const getLastChildNode = (node: ChildNode) => {
                    if (node.nodeType == Node.ELEMENT_NODE && node.lastChild)
                        return getLastChildNode(node.lastChild);

                    return node;
                };

                let { lastChild } = e.currentTarget;
                if (!lastChild) return;

                if (lastChild.nodeType == Node.ELEMENT_NODE)
                    lastChild = getLastChildNode(lastChild);

                const tempRange = document.createRange();
                tempRange.setStart(lastChild, lastChild.textContent?.length || 0);

                const caretTop = range.getBoundingClientRect().y;
                const endTop = tempRange.getBoundingClientRect().y;

                if (caretTop == endTop && hasBlock) {
                    applyFocusByIndex(
                        getElementFirstBlockInput(pageContent!.blockSortIdList[0])!,
                        caretIndex
                    );
                    e.preventDefault();
                }
            },
        };

        if (e.key in keyAction) keyAction[e.key as keyof typeof keyAction]();
    };

    return (
        <h1
            contentEditable
            className="text-4xl font-extrabold outline-none mb-1"
            id="page-title"
            onInput={props.onInput}
            onKeyDown={handleKeyDown}
            dangerouslySetInnerHTML={{
                __html: sanitizeText(props.text),
            }}
        ></h1>
    )
}