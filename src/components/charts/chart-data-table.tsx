import { Table } from "@mantine/core";
import type { ReactNode } from "react";

interface ChartTableColumn<TRow> {
  key: string;
  label: string;
  render: (row: TRow) => ReactNode;
}

interface ChartDataTableProps<TRow> {
  caption: string;
  columns: readonly ChartTableColumn<TRow>[];
  rows: readonly TRow[];
}

/** Keyboard/screen-reader friendly equivalent of chart tooltip-only detail. */
export function ChartDataTable<TRow>({ caption, columns, rows }: ChartDataTableProps<TRow>) {
  return (
    <Table.ScrollContainer minWidth={420} type="native">
      <Table aria-label={caption} highlightOnHover striped withTableBorder>
        <Table.Caption>{caption}</Table.Caption>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column.key} scope="col">
                {column.label}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, rowIndex) => (
            <Table.Tr key={rowIndex}>
              {columns.map((column) => (
                <Table.Td key={column.key}>{column.render(row)}</Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
