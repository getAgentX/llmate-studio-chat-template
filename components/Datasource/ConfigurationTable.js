import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

// Editable cell component for text inputs
const EditableCell = ({
  value: initialValue,
  row: { original },
  column: { id },
  updateData,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    updateData(original.uuid, id, value); // Update the data when the user leaves the input field
  };

  return (
    <input
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-full text-primary-text bg-transparent focus:outline-none focus:ring-0"
    />
  );
};

// Select cell component for dropdowns
// Update the SelectCell component to check if `isNew` is true
const SelectCell = ({
  value: initialValue,
  row: { original },
  column: { id },
  updateData,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
    updateData(original.uuid, id, e.target.value); // Update immediately when a selection is made
  };
  const isSelectable = original.isNew;

  return isSelectable ? (
    <select
      value={value}
      onChange={handleChange}
      className={`w-full bg-page focus:outline-none focus:ring-0 -ml-1 ${
        value === "str" ? "text-[#C56A49]" : "text-[#70B0A9]"
      }`}
    >
      <option value="str">STRING</option>
      <option value="number">NUMBER</option>
    </select>
  ) : (
    <span className={value === "str" ? "text-[#C56A49]" : "text-[#70B0A9]"}>
      {value === "str" ? "STRING" : "NUMBER"}
    </span>
  );
};

// Dropdown cell component for displayConfigurations
const DisplayConfigurationCell = ({
  value: initialValue,
  row: { original },
  column: { id },
  updateData,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
    updateData(original.uuid, id, e.target.value);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className="w-full text-dropdown-text bg-page focus:outline-none focus:ring-0"
    >
      <option value="always_show">Always show in replies</option>
      <option value="allow_selection">Show when asked by user</option>
      <option value="never_show">Never show in replies</option>
    </select>
  );
};

// Checkbox cell component
const CheckboxCell = ({
  value: initialValue,
  row: { original },
  column: { id },
  updateData,
}) => {
  const [checked, setChecked] = useState(initialValue);

  const handleChange = (e) => {
    setChecked(e.target.checked);
    updateData(original.uuid, id, e.target.checked); // Update the value in the parent component
  };

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="sr-only peer"
      />
      <div className="relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7]"></div>
    </label>
  );
};

const ResizableConfigurationTable = ({
  tableData,
  updateData,
  deleteRow,
  isEditable,
}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const formattedData = Object.entries(tableData || {}).map(
      ([uuid, columnData]) => ({
        uuid, // Use the UUID as an identifier for the row
        field_name: columnData.field_name,
        field_type: columnData.field_type,
        allow_query: columnData.allow_query,
        display_config: columnData.display_config,
        isNew: columnData.isNew || false, // Include the isNew flag (default to false if not present)
      })
    );
    setData(formattedData); // Update local state when tableData changes
  }, [tableData]);

  const columnsData = [
    { accessorKey: "field_name", header: "Field Name", size: 200 },
    { accessorKey: "field_type", header: "Field Type", size: 100 },
    { accessorKey: "allow_query", header: "Allow filter", size: 50 },
    {
      accessorKey: "display_config",
      header: "Display Configuration",
      size: 200,
    },
  ];

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "rowNumber",
        header: "S.No",
        size: 30,
        minSize: 30,
        cell: (info) => info.row.index + 1, // Row number display
      },
      ...columnsData.map((col) => ({
        accessorKey: col.accessorKey,
        header: col.header,
        size: col.size || 150,
        minSize: col.minSize || 80,
        cell: (info) => {
          const value = info.getValue();
          const original = info.row.original;

          if (col.accessorKey === "field_name") {
            return isEditable ? (
              <EditableCell {...info} value={value} updateData={updateData} />
            ) : (
              <span>{value}</span>
            );
          }

          if (col.accessorKey === "field_type") {
            return isEditable ? (
              <SelectCell {...info} value={value} updateData={updateData} />
            ) : (
              <span
                className={
                  value === "str" ? "text-[#C56A49]" : "text-[#70B0A9]"
                }
              >
                {value === "str" ? "STRING" : "NUMBER"}
              </span>
            );
          }

          if (col.accessorKey === "allow_query") {
            return isEditable ? (
              <CheckboxCell {...info} value={value} updateData={updateData} />
            ) : (
              <label className="inline-flex items-center justify-center w-full cursor-pointer ">
                <input
                  type="checkbox"
                  checked={value}
                  className="sr-only peer"
                />
                {/* <div className="relative w-11 h-6 rounded-full bg-[#15151A] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-white after:bg-[#3D3F44] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 scale-[0.7]"></div> */}

                <div
                    className={`relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7] ${
                    !isEditable
                      ? "peer-checked:bg-blue-600/50 opacity-50"
                      : ""
                  }`}
                ></div>
              </label>
            );
          }

          if (col.accessorKey === "display_config") {
            return isEditable ? (
              <DisplayConfigurationCell
                {...info}
                value={value}
                updateData={updateData}
              />
            ) : (
              <span>
                {value === "always_show"
                  ? "Always show in replies"
                  : value === "allow_selection"
                  ? "Show when asked by user"
                  : "Never show in replies"}
              </span>
            );
          }

          return value || "N/A";
        },
      })),
      {
        accessorKey: "actions",
        header: "Actions",
        size: 40,
        cell: ({ row }) => (
          <div className="flex items-center">
            <button
              onClick={() => deleteRow(row.original.uuid)}
              disabled={!isEditable} // Disable button when not editable
              className={`text-red-500 hover:text-red-700 flex items-center justify-center ${
                !isEditable ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 fill-icon-color hover:fill-icon-color-hover"
              >
                <path d="M4.6665 14C4.29984 14 3.98595 13.8694 3.72484 13.6083C3.46373 13.3472 3.33317 13.0333 3.33317 12.6667V4H2.6665V2.66667H5.99984V2H9.99984V2.66667H13.3332V4H12.6665V12.6667C12.6665 13.0333 12.5359 13.3472 12.2748 13.6083C12.0137 13.8694 11.6998 14 11.3332 14H4.6665ZM11.3332 4H4.6665V12.6667H11.3332V4ZM5.99984 11.3333H7.33317V5.33333H5.99984V11.3333ZM8.6665 11.3333H9.99984V5.33333H8.6665V11.3333Z" />
              </svg>
            </button>
          </div>
        ),
      },
    ];
  }, [columnsData, data, updateData, isEditable]);

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
    <div className="p-1 overflow-x-auto bg-page">
      <table className="w-full border border-dropdown-border min-w-max">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="relative px-3 text-xs font-medium tracking-wider text-left capitalize border h-7 bg-secondary-bg text-secondary-text border-dropdown-border"
                  style={{ width: header.getSize() }}
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
                        className: `resizer ${
                          header.column.getIsResizing() ? "isResizing" : ""
                        }`,
                        style: {
                          position: "absolute",
                          right: 0,
                          top: 0,
                          height: "100%",
                          width: "5px",
                          cursor: "col-resize",
                          userSelect: "none",
                          touchAction: "none",
                        },
                      }}
                    />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="transition duration-200 ease-in-out hover:bg-page-hover"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 text-xs font-medium text-primary-text truncate border h-7 border-dropdown-border"
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

export default ResizableConfigurationTable;
