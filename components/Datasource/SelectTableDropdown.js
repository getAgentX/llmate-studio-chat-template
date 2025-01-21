import React, { useState, useEffect } from "react";
import { TableIcon } from "../Icons/icon";

const SelectTableDropdwn = ({
  data,
  selectedColumns,
  onSelectChange,
  isDisabled = false,
}) => {
  const [toggleDropdown, setToggleDropdown] = useState(false);
  const [initialSortedColumns, setInitialSortedColumns] = useState([]);
  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    if (selectedColumns.length) {
      const selectedSet = new Set(selectedColumns.map((col) => col.name));
      const sortedColumns = [
        ...data?.columns?.filter((col) => selectedSet.has(col.name)),
        ...data?.columns?.filter((col) => !selectedSet.has(col.name)),
      ];
      setInitialSortedColumns(sortedColumns);
    } else {
      setInitialSortedColumns(data?.columns);
    }
  }, [data?.columns, selectedColumns]);

  useEffect(() => {
    // Update the allChecked state based on the selected columns
    if (selectedColumns.length === data?.columns?.length) {
      setAllChecked(true);
    } else {
      setAllChecked(false);
    }
  }, [selectedColumns, data?.columns]);

  const handleToggle = (column, isChecked) => {
    const updatedColumns = isChecked
      ? [...selectedColumns, column]
      : selectedColumns.filter((col) => col.name !== column.name);

    onSelectChange(updatedColumns);
  };

  const handleSelectAllToggle = (isChecked) => {
    if (isChecked) {
      onSelectChange(initialSortedColumns);
    } else {
      onSelectChange([]);
    }
    setAllChecked(isChecked);
  };

  return (
    <div className="flex flex-col rounded-md cursor-pointer">
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 text-xs tracking-wide rounded-md outline-none bg-secondary-bg h-9 2xl:text-sm text-primary-text"
        onClick={() => setToggleDropdown(!toggleDropdown)}
        // disabled={isDisabled}
      >
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center">
            <TableIcon size={4} />
          </span>

          <p
            className={`text-sm ${
              toggleDropdown
                ? "text-primary-text font-medium"
                : "text-secondary-text font-normal"
            }`}
          >
            {data?.name}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <p className="flex items-center space-x-1 font-normal">
            <span className="text-secondary-text">Selected</span>
            <span>
              {selectedColumns.length}/{data?.columns?.length}
            </span>
            <span className="text-secondary-text">Columns</span>
          </p>

          <span className="flex items-center justify-center">
            {toggleDropdown || (
              <svg
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 fill-icon-color"
              >
                <path d="M0 12V6.66667H1.33333V9.73333L9.73333 1.33333H6.66667V0H12V5.33333H10.6667V2.26667L2.26667 10.6667H5.33333V12H0Z" />
              </svg>
            )}

            {toggleDropdown && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-icon-color hover:text-icon-color-hover"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            )}
          </span>
        </div>
      </button>

      {toggleDropdown && (
        <div className="flex flex-col w-full space-y-2 border-b border-x border-border-color bg-page">
          <div className="relative flex flex-col px-3 py-3 space-y-0.5">
            <div className="absolute top-2 right-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allChecked}
                  className="sr-only peer"
                  onChange={(e) => handleSelectAllToggle(e.target.checked)}
                  disabled={isDisabled}
                />
                <div
                  className={`relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7] ${
                    isDisabled
                      ? "peer-checked:bg-blue-600/50 opacity-50"
                      : ""
                  }`}
                ></div>
                <span
                  className={`text-xs font-medium ms-3 ${
                    isDisabled
                      ? "text-blue-600/50"
                      : "text-btn-primary-outline-text"
                  }`}
                >
                  {allChecked ? "Remove All" : "Select All"}
                </span>
              </label>
            </div>

            {initialSortedColumns.map((column, index) => {
              return (
                <SwitchToggle
                  data={column}
                  key={index}
                  checked={selectedColumns.some(
                    (selectedColumn) => selectedColumn.name === column.name
                  )}
                  onToggle={(isChecked) => handleToggle(column, isChecked)}
                  isDisabled={isDisabled}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectTableDropdwn;

const SwitchToggle = ({ data, checked, onToggle, isDisabled }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        className="sr-only peer"
        onChange={(e) => onToggle(e.target.checked)}
        disabled={isDisabled}
      />

      <div
        className={`relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7] ${
          isDisabled
            ? "peer-checked:bg-blue-600/50 opacity-50"
            : ""
        }`}
      ></div>

      {isDisabled || (
        <span
          className={`text-sm font-medium ms-3 ${
            checked ? "text-primary-text" : "text-secondary-text"
          }`}
        >
          {data?.name}
        </span>
      )}

      {isDisabled && (
        <span className="text-sm font-medium ms-3 text-secondary-text">
          {data?.name}
        </span>
      )}
    </label>
  );
};
