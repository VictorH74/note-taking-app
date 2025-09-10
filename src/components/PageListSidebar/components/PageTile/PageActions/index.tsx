/* eslint-disable react-hooks/exhaustive-deps */
import { PositionT } from "@/types/global";
import React from "react";
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { pageService } from "@/services/client-side/PageService";


interface PageActionsProps {
    onClose(): void
    position: PositionT
    pageId: string
}

export function PageActions(props: PageActionsProps) {
    const [disabledActions, setDisabledActions] = React.useState(false)

    const pageActionBtnGenerationData = React.useMemo(() => ([
        {
            onClick: () => {
                // navigator.clipboard.writeText()
                props.onClose()
            },
            Icon: LinkIcon,
            label: 'Copy link'
        },
        {
            onClick: () => { },
            Icon: ContentCopyIcon,
            label: 'Duplicate'
        },
        {
            onClick: async () => {
                // await pageService.updatePageContent(props.pageId, {title})
                props.onClose()
            },
            Icon: DriveFileRenameOutlineIcon,
            label: 'Rename'
        },
        {
            onClick: async () => {
                setDisabledActions(true)
                await pageService.deletePage(props.pageId)
                props.onClose()
            },
            Icon: DeleteOutlineIcon,
            label: 'Delete'
        },
        {
            onClick: () => {
                const aEl = document.createElement('a')
                aEl.href = (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'vh-note-taking.vercel.app') + '/pages/' + props.pageId
                aEl.target = '_blank'
                aEl.click()
                props.onClose()
            },
            Icon: OpenInNewIcon,
            label: 'Open in new tab'
        },
    ]), [])

    return (
        <div className="fixed inset-0 z-50" onMouseDown={() => props.onClose()}>
            <div className="absolute w-2xs h-auto px-2 py-1 bg-zinc-700 rounded-md" style={props.position} onMouseDown={e => e.stopPropagation()}>
                {pageActionBtnGenerationData.map(({ Icon, ...data }) => (
                    <button key={data.label} className="w-full text-left p-2 flex items-center gap-2" disabled={disabledActions} onClick={data.onClick}><Icon />{data.label}</button>
                ))}
            </div>
        </div>
    )
}
