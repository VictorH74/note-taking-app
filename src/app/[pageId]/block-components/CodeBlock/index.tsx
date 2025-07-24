import { CodeBlockT } from "@/types/page";
import { BlockComponentProps } from "../../ContentListPage/EditableContentListPage/useEditableContentList";

type CodeContentProps = BlockComponentProps<CodeBlockT>;

export function CodeBlock({ item }: CodeContentProps) {
  return (
    <div className="block-item">
      <pre className="my-4 bg-gray-100 p-4 rounded">
        <code>{item.content}</code>
      </pre>
    </div>
  );
}
