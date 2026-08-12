import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
}

// Canonical admin data table — unifies the near-identical, copy-pasted
// `<table>` markup previously duplicated (with drift) across admin/users,
// admin/facilities, and admin/audit-logs.
export function DataTable<T>({
  columns,
  rows,
  keyField,
  onRowClick,
  emptyMessage = "Nothing to show yet.",
  wrapperClassName = "card overflow-x-auto",
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={wrapperClassName}>
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`border-b border-line px-3.5 pb-2.5 pt-3 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft ${col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3.5 py-6 text-center text-ink-soft">
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={String(row[keyField])}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-line last:border-b-0 transition hover:bg-paper-2 ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`p-3.5 ${col.align === "right" ? "text-right" : ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
