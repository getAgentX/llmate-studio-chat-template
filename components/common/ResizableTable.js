import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useTheme } from "@/hooks/useTheme";

const ResizableTable = ({
  columnsData,
  tableData,
  currentPage = 0,
  perPageLimit = 0,
}) => {
  const data = useMemo(() => tableData, [tableData]);
  const {theme} = useTheme()
  const columns = useMemo(() => {
    return [
      {
        accessorKey: "rowNumber",
        header: "Row",
        size: 50,
        minSize: 50,
        cell: (info) => currentPage * perPageLimit + info.row.index + 1,
      },
      ...columnsData.map((col) => ({
        accessorKey: col.accessorKey,
        header: col.header,
        size: col.size || 150,
        minSize: col.minSize || 100,
      })),
    ];
  }, [columnsData]);

  const [columnSizing, setColumnSizing] = useState({});

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className="overflow-x-auto recent__bar"
      style={{ direction: table.options.columnResizeDirection }}
    >
      <table
        className="border-collapse"
        {...{
          style: {
            width: table.getCenterTotalSize(),
          },
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="relative h-6 px-3 text-xs font-medium text-left border bg-secondary-bg text-nowrap border-border-color text-secondary-text"
                  style={{
                    width: header.getSize(), 
                    userSelect: "text", // Ensures column-wise copy
                    }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {header.column.getCanResize() && (
                    <div
                      {...{
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `resizer absolute bottom-0 right-0 flex items-center justify-center cursor-w-resize ${
                          header.column.getIsResizing() ? "isResizing" : ""
                        }`,
                        style: {
                          position: "absolute",
                          right: 0,
                          top: 0,
                          height: "100%",
                          width: "5px",
                          userSelect: "none",
                          touchAction: "none",
                        },
                      }}
                    >
                      {/* <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                        className="w-3 h-3 fill-icon-color"
                      >
                        <path d="M213.66,133.66l-80,80a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,11.32Zm-16-99.32a8,8,0,0,0-11.32,0l-152,152a8,8,0,0,0,11.32,11.32l152-152A8,8,0,0,0,197.66,34.34Z"></path>
                      </svg> */}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {/* {table.getRowModel().rows.map((row, rowIndex) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, cellIndex) => (
                <td
                  key={cell.id}
                  className={`h-6 px-3 text-xs font-medium text-left border border-border-color text-primary-text ${
                    rowIndex === 0 && cellIndex === 0
                      ? "bg-secondary-bg"
                      : "bg-page"
                  }`}
                >
                  <div className="line-clamp-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          ))} */}

          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, cellIndex) => (
                <td
                  key={cell.id}
                  className={`h-7 px-3 text-xs font-medium text-left border border-border-color ${
                    theme === 'dark' && cellIndex === 0
                      ? "bg-secondary-bg text-center text-secondary-text"
                      : "bg-page text-primary-text"
                  }`}
                  style={{
                    userSelect: "text", // Allow proper text copying
                    // background: "transparent",
                  }}
                >
                  <div className="line-clamp-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResizableTable;
