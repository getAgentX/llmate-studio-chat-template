import React, { useState, useEffect, useRef } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import CreateField from "../Modal/CreateField";
import TextFilterDropdown from "./TextFilterComponent";
import NumberFilterDropdown from "./NumberFilterComponent";
import ConfirmModal from "../Modal/ConfirmModal";
import IndeterminateCheckbox from "./IndeterminateCheckBox";
import AddRowModal from "./AddRowModal";

import { useBulkDownloadRowsMutation } from "@/store/semi_structured_datasource";
import Image from "next/image";

function useSkipper() {
  const shouldSkipRef = React.useRef(true);
  const shouldSkip = shouldSkipRef.current;

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = React.useCallback(() => {
    shouldSkipRef.current = false;
  }, []);

  React.useEffect(() => {
    shouldSkipRef.current = true;
  });

  return [shouldSkip, skip];
}

const BasicTable = ({
  skip,
  limit,
  setSkip,
  setLimit,
  slug,
  rowsDef,
  dataColumns,
  addColumn,
  removeColumn,
  addRow,
  deleteRow,
  columnFilters,
  setColumnFilters,
  updateColumn,
  fetchRows = false,
  existingColumns = [],
  showCreateField,
  setShowCreateField
}) => {

  const [showAddRow, setShowAddRow] = useState(false);
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [bulkDownload, { }] = useBulkDownloadRowsMutation();

  const [sourceId, setSourceId] = useState(null);

  const [rowSelection, setRowSelection] = useState({}); // row selection
  const [showSelectionCheckboxes, setShowSelectionCheckboxes] = useState(false);
  const [showAllRowActionsDropdown, setShowAllRowActionsDropdown] =
    useState(false);
  const modalRef = useRef(null);

  const handleCheckboxChange = (rowId) => {
    setRowSelection((prevSelection) => ({
      ...prevSelection,
      [rowId]: !prevSelection[rowId], // Toggle the checkbox state
    }));
  };


  const toggleAllRowActionsDropdown = () =>
    setShowAllRowActionsDropdown(!showAllRowActionsDropdown);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowAllRowActionsDropdown(false);
    }
  };

  const handleBulkDownload = () => {
    bulkDownload({ datasource_id: slug }).then((response) => {
      if (response.data) {
        if (response.data.url) {
          const link = document.createElement("a");
          link.href = response.data.url;
          link.download = "";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);


  const table = useReactTable({
    columns: [
      {
        id: "serialNo",
        header: () => (
          <h2 className="text-center">
            Serial No.
          </h2>
        ),
        cell: ({ row, table }) => (
          <h2 className="text-center sticky -left-2">
            {table.getRowModel().flatRows.indexOf(row) + 1}
          </h2>
        ),
        size: 20,
      },
      ...dataColumns,
      {
        id: "action",
        header: () => <h2 className="text-center">
          Action
        </h2>,
        cell: ({ row }) => (
          <div className="flex items-center space-x-2 cursor-pointer justify-center text-center">

            <button onClick={() => {
              setSourceId(row.original.source_id)
              setShowAddRow(true)
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 stroke-[#5F6368] hover:stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setSourceId(row.original.source_id);
                setConfirmDelete(true);
              }}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 stroke-[#5F6368] hover:stroke-white"
              >
                <g clip-path="url(#clip0_2724_22406)">
                  <path
                    d="M3 3.33398V14.6673H13V3.33398H3Z"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M6.66602 6.66602V10.9993"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M9.33398 6.66602V10.9993"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M1.33398 3.33398H14.6673"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M5.33398 3.33398L6.43032 1.33398H9.59302L10.6673 3.33398H5.33398Z"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2724_22406">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>
        ),
        size: 50,
      },
    ],
    data: rowsDef,
    state: {
      rowSelection: rowSelection,
      pagination: {
        pageSize: limit, // Set page size from the limit state
        pageIndex: Math.floor(skip / limit), // Calculate current page index based on skip and limit
      },
    },
    autoResetPageIndex,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    manualPagination: true,
  });

  const addRowToTable = () => {
    addRow();
    skipAutoResetPageIndex();
    table.setPageIndex(table.getPageCount() - 1);
  };

  const findRowBySourceId = (rowsDef, sourceId) => {
    const matchedRows = rowsDef.filter(row => row.source_id === sourceId);
    return matchedRows.length > 0 ? matchedRows[0] : null;
  }

  return (
    <>
      {/* Wrapping container for horizontal scroll */}
      <div className="relative overflow-auto z-40 h-[calc(100vh-180px)] recent__bar">
        <table className="text-sm text-left text-gray-500 rtl:text-right text-white/50 min-w-full">
          <thead className="sticky top-0 bg-[#181A1C] z-20">{table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSerialNo = header.column.id === "serialNo";
                const isAction = header.column.id === "action";
                const currentFilter = columnFilters[header.column.id] || {};

                // Skip rendering filter dropdown for Serial No. and Action columns
                if (isSerialNo || isAction) {
                  return (
                    <th key={header.id} className={`py - 3 px-6 border-r border-[#242424] ${isSerialNo ? 'sticky left-0 z-10 w-32 bg-[#181A1C]' : ''} ${isAction ? 'sticky right-0 z-10 bg-[#181A1C] w-32' : ''}`}>
              <div className="text-sm font-medium tracking-wide capitalize text-white/50">
                {flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            </th>
          );
                }

            return (
            <FilterDropdown
              key={header.id}
              header={header}
              currentFilter={currentFilter}
              setColumnFilters={setColumnFilters}
              removeColumn={removeColumn}
              updateColumn={updateColumn}
              showControls={true}
            />
            );
              })}
          </tr>
          ))}
        </thead>



        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="bg-[#1B1D1F] hover:bg-[#26292C]">
              {row.getVisibleCells().map((cell) => {
                const isSerialNo = cell.column.id === "serialNo";
                return (
                  <td
                    key={cell.id}
                    className={`py - 2 px-4 border-r border-l border-[#242424] ${cell.column.id === "serialNo" ? "sticky left-0 bg-[#1B1D1F] z-10" : cell.column.id === "action" ? "sticky right-0 bg-[#1B1D1F] z-10" : ""}`}
                    >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
                })}
        </tr>
            ))}
      </tbody>
    </table >
      </div >

  { showCreateField && (
    <CreateField
      visible={showCreateField}
      setVisible={setShowCreateField}
      submitField={addColumn}
      existingField={null}
      isEditing={false}
    />
  )}

      <AddRowModal
        show={showAddRow}
        setShow={setShowAddRow}
        slug={slug}
        existingColumns={existingColumns}
        refetchList={fetchRows}
        addColumn={addColumn}
        skip={skip}
        limit={limit}
        mode="update"
        existingRow={findRowBySourceId (rowsDef, sourceId)}
      />

      <ConfirmModal
        show={confirmDelete}
        setShow={setConfirmDelete}
        heading="Confirm Delete"
        title={"Are you sure you want to delete this row?"}
        description={"This action cannot be undone."}
        primaryBtn="Yes, Confirm"
        primaryChange={() => {
          console.log("Deleting row with sourceId:", sourceId); // Debug log
          deleteRow(sourceId);
          setConfirmDelete(false); // Optionally reset the modal visibility here
        }}
        secondaryBtn="No"
        secondaryChange={() => setConfirmDelete(false)}
      />
    </>
  );
};

export default BasicTable;

const FilterDropdown = ({
  header,
  currentFilter,
  setColumnFilters,
  removeColumn,
  updateColumn,
  showControls,
}) => {
  const [activeColumn, setActiveColumn] = useState(null);
  const modalRef = useRef(null);

  const [showTextFilter, setShowTextFilter] = useState(false);
  const [showNumberFilter, setShowNumberFilter] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const [showEditFieldModal, setShowEditFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [confirmColumnDelete, setConfirmColumnDelete] = useState(false);

  const [filterValues, setFilterValues] = useState(currentFilter);

  const toggleTextFilter = () => {
    setShowTextFilter((current) => !current);
    setShowNumberFilter(false);
  };

  const toggleNumberFilter = () => {
    setShowNumberFilter((current) => !current);
    setShowTextFilter(false);
  };

  const handleFilterIconClick = (event, column) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setActiveColumn(column);
    if (column.columnDef.type === "str") {
      setShowTextFilter((current) => !current);
      setShowNumberFilter(false);
    } else if (column.columnDef.type === "number") {
      setShowNumberFilter((current) => !current);
      setShowTextFilter(false);
    }
  };

  const handleFilterSelect = (newFilter) => {
    setFilterValues(newFilter);
    setColumnFilters((prevFilters) => ({
      ...prevFilters,
      [header.column.id]: newFilter,
    }));
  };

  const handleActionsClick = () => {
    setShowActionsDropdown(!showActionsDropdown);
  };

  const handleEditField = () => {
    const columnData = {
      id: header.column.id,
      field_name: header.column.columnDef.header,
      field_type: header.column.columnDef.type,
      display_config: header.column.columnDef.display_config,
      allow_query: header.column.columnDef.allow_query,
    };

    if (header.column.columnDef.type === "str") {
      columnData.like_threshold = header.column.columnDef.like_threshold || 0.9;
      columnData.not_like_threshold =
        header.column.columnDef.not_like_threshold || 0.85;
    }
    setEditingField(columnData);
    setShowEditFieldModal(true);
  };
  const handleDeleteField = () => {
    console.log("Delete Field clicked");
    setConfirmColumnDelete(true);
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowActionsDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setFilterValues(currentFilter); // Update local state when the currentFilter prop changes
  }, [currentFilter]);

  return showControls ? (
    <th
      key={header.id}
      scope="col"
      className="py-3 px-6 border-r border-[#242424]  min-w-52"
    >
      <div className="flex items-center justify-between space-x-4">
        <div className="text-sm font-medium tracking-wide capitalize text-white/50">
          {flexRender(header.column.columnDef.header, header.getContext())}
        </div>

        <div className="relative flex items-center space-x-2 ">
          <span
            className="flex items-center justify-center"
            onClick={(event) => handleFilterIconClick(event, header.column)}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 cursor-pointer stroke-white"
            >
              <path
                d="M5.90497 8.3374C4.24601 7.09707 3.06376 5.73277 2.41823 4.96578C2.2184 4.72835 2.15292 4.5546 2.11355 4.24853C1.97874 3.20053 1.91134 2.67653 2.21863 2.33827C2.52593 2 3.06936 2 4.15622 2H11.8438C12.9307 2 13.4741 2 13.7813 2.33827C14.0887 2.67653 14.0213 3.20053 13.8865 4.24854C13.8471 4.55461 13.7816 4.72836 13.5817 4.96578C12.9353 5.73375 11.7507 7.10047 10.0884 8.34233C9.938 8.45473 9.83887 8.6378 9.82047 8.84093C9.6558 10.6613 9.50393 11.6584 9.4094 12.1628C9.25687 12.9771 8.10213 13.4671 7.484 13.9042C7.11607 14.1644 6.66953 13.8547 6.62185 13.4519C6.53095 12.6841 6.35974 11.1243 6.17285 8.84093C6.15606 8.63593 6.05657 8.45073 5.90497 8.3374Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>

          <span
            className="flex items-center justify-center"
            onClick={handleActionsClick}
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 cursor-pointer fill-white"
            >
              <path d="M6 10C5.725 10 5.48958 9.90208 5.29375 9.70625C5.09792 9.51042 5 9.275 5 9C5 8.725 5.09792 8.48958 5.29375 8.29375C5.48958 8.09792 5.725 8 6 8C6.275 8 6.51042 8.09792 6.70625 8.29375C6.90208 8.48958 7 8.725 7 9C7 9.275 6.90208 9.51042 6.70625 9.70625C6.51042 9.90208 6.275 10 6 10ZM6 7C5.725 7 5.48958 6.90208 5.29375 6.70625C5.09792 6.51042 5 6.275 5 6C5 5.725 5.09792 5.48958 5.29375 5.29375C5.48958 5.09792 5.725 5 6 5C6.275 5 6.51042 5.09792 6.70625 5.29375C6.90208 5.48958 7 5.725 7 6C7 6.275 6.90208 6.51042 6.70625 6.70625C6.51042 6.90208 6.275 7 6 7ZM6 4C5.725 4 5.48958 3.90208 5.29375 3.70625C5.09792 3.51042 5 3.275 5 3C5 2.725 5.09792 2.48958 5.29375 2.29375C5.48958 2.09792 5.725 2 6 2C6.275 2 6.51042 2.09792 6.70625 2.29375C6.90208 2.48958 7 2.725 7 3C7 3.275 6.90208 3.51042 6.70625 3.70625C6.51042 3.90208 6.275 4 6 4Z" />
            </svg>
          </span>

          {showActionsDropdown && (
            <div
              className="absolute top-[120%] left-0 min-w-36 w-full rounded-lg bg-[#26282D] border border-border z-[100]"
              ref={modalRef}
            >
              <ul>
                <li
                  className="px-4 py-2.5 text-[#97999D] hover:text-white group cursor-pointer flex items-center space-x-2 "
                  onClick={handleEditField}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-white/50 group-hover:fill-white"
                  >
                    <path d="M3.33333 12.6667H4.28333L10.8 6.15L9.85 5.2L3.33333 11.7167V12.6667ZM2 14V11.1667L10.8 2.38333C10.9333 2.26111 11.0806 2.16667 11.2417 2.1C11.4028 2.03333 11.5722 2 11.75 2C11.9278 2 12.1 2.03333 12.2667 2.1C12.4333 2.16667 12.5778 2.26667 12.7 2.4L13.6167 3.33333C13.75 3.45556 13.8472 3.6 13.9083 3.76667C13.9694 3.93333 14 4.1 14 4.26667C14 4.44444 13.9694 4.61389 13.9083 4.775C13.8472 4.93611 13.75 5.08333 13.6167 5.21667L4.83333 14H2ZM10.3167 5.68333L9.85 5.2L10.8 6.15L10.3167 5.68333Z" />
                  </svg>
                  <span className="capitalize">Edit Field</span>
                </li>
                <li
                  className="px-4 py-2.5 text-[#B83B3B] hover:text-white group cursor-pointer flex items-center space-x-2"
                  onClick={handleDeleteField}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-[#B83B3B] group-hover:fill-white"
                  >
                    <path d="M4.66797 14C4.3013 14 3.98741 13.8694 3.7263 13.6083C3.46519 13.3472 3.33464 13.0333 3.33464 12.6667V4H2.66797V2.66667H6.0013V2H10.0013V2.66667H13.3346V4H12.668V12.6667C12.668 13.0333 12.5374 13.3472 12.2763 13.6083C12.0152 13.8694 11.7013 14 11.3346 14H4.66797ZM11.3346 4H4.66797V12.6667H11.3346V4ZM6.0013 11.3333H7.33464V5.33333H6.0013V11.3333ZM8.66797 11.3333H10.0013V5.33333H8.66797V11.3333Z" />
                  </svg>
                  <span className="capitalize">Delete Field</span>
                </li>
              </ul>
            </div>
          )}

          {showTextFilter && (
            <TextFilterDropdown
              visible={showTextFilter}
              initialFilter={filterValues}
              toggleDropdown={toggleTextFilter}
              onFilterSelect={handleFilterSelect}
            />
          )}

          {showNumberFilter && (
            <NumberFilterDropdown
              visible={showNumberFilter}
              initialFilter={filterValues}
              toggleDropdown={toggleNumberFilter}
              onFilterSelect={handleFilterSelect}
            />
          )}
        </div>

        {showEditFieldModal && (
          <CreateField
            visible={showEditFieldModal}
            setVisible={setShowEditFieldModal}
            submitField={updateColumn}
            existingField={editingField}
            isEditing={true}
          />
        )}

        <ConfirmModal
          show={confirmColumnDelete}
          setShow={setConfirmColumnDelete}
          heading="Confirm Delete"
          title={"Are you sure you want to delete this column?"}
          description={"This action cannot be undone."}
          primaryBtn="Yes, Confirm"
          primaryChange={() => {
            console.log("Deleting column with id:", header.id); // Debug log
            removeColumn(header.id);
            setConfirmColumnDelete(false); // Optionally reset the modal visibility here
          }}
          secondaryBtn="No"
          secondaryChange={() => setConfirmColumnDelete(false)}
        />
      </div>
    </th>
  ) : (
    <th
      key={header.id}
      scope="col"
      className="py-3 px-6 border-r border-l border-[#242424]"
    >
      {/* Simplified rendering without controls for checkbox column */}
      <div className="text-xs tracking-wide text-white/50">
        {flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    </th>
  );
};