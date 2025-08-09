import { TableBlockT } from "@/types/page";
import { BlockComponentProps } from "../../../ContentListPage/EditableContentListPage/useEditableContentList";
import { BlockContainer } from "../../BlockContainer";

type TableContentProps = BlockComponentProps<TableBlockT>;

export function TableBlock({ item, index }: TableContentProps) {
  return (
    <BlockContainer index={index}>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            {item.headers.map((header, headerIndex) => (
              <th key={headerIndex} className="border px-4 py-2">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {item.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </BlockContainer>
  );
}
