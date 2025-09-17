import { ModalContainer } from "@/components/ModalContainer";
import { PositionT } from "@/types/global";

interface InlineUrlDataChangeModalProps {
    position: PositionT
    linkEl: HTMLAnchorElement
    syncBlockInput(): void
    onClose(): void
}

export function InlineUrlDataChangeModal(props: InlineUrlDataChangeModalProps) {
    return (
        <ModalContainer onClose={props.onClose} containerPos={props.position} className="pointer-events-auto" >
            <div
                className="p-2 rounded-lg bg-zinc-800 w-2xs pointer-events-auto space-y-2"
                onClick={(e) => e.stopPropagation()}
            >
                <div>
                    Url
                    <input type="text" className="w-full px-2 bg-zinc-700/60" defaultValue={props.linkEl.href} onChange={(e) => {
                        props.linkEl.href = e.currentTarget.value
                        props.syncBlockInput()
                    }} />
                </div>
                <div>
                    Title
                    <input type="text" className="w-full px-2 bg-zinc-700/60" defaultValue={props.linkEl.textContent as string} onChange={(e) => {
                        props.linkEl.textContent = e.currentTarget.value
                        props.syncBlockInput()
                    }} />
                </div>
            </div>
        </ModalContainer>
    );
}