import React, { useEffect, useRef, useState } from "react";
import useDebounce from "@/hooks/useDebounce";

const DashboardMenu = ({
  setVisualizationConfig,
  fields = [],
  config = {},
}) => {
  const [chartType, setChartType] = useState("bar");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropIndicator, setDropIndicator] = useState(null);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState([]);

  useEffect(() => {
    const rowValues = rows.map((row) => ({
      row_name: row.name,
      sort_order: row.sort_order,
    }));

    // const colValues = columns.map((col) => ({
    //   col_name: col.name,
    //   sort_order: col.sort_order,
    // }));

    const valuesData = values.map((val) => ({
      field_name: val.name,
      aggregation: val.sort_order,
    }));

    const data = {
      indexes: rowValues,
      // columns: colValues,
      values: valuesData,
      graph_type: chartType,
    };

    setVisualizationConfig((prevConfig) => {
      if (JSON.stringify(prevConfig) !== JSON.stringify(data)) {
        return data;
      }
      return prevConfig;
    });
  }, [rows, values, chartType, setVisualizationConfig]);
  // columns

  useEffect(() => {
    if (config && Object.keys(config).length > 0) {
      if (config?.graph_type) {
        setChartType(config.graph_type);
      }

      if (config?.indexes) {
        setRows(
          config.indexes.map((row) => ({
            name: row.row_name,
            sort_order: row.sort_order,
          }))
        );
      }

      if (config?.values) {
        setValues(
          config.values.map((val) => ({
            name: val.field_name,
            sort_order: val.aggregation,
          }))
        );
      }
    }
  }, [config]);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const filteredFields = fields?.filter((field) =>
    field.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handleDragStart = (e, taskName) => {
    e.dataTransfer.setData("text/plain", taskName.toString());
  };

  const handleDragEnd = (e) => {
    e.dataTransfer.clearData();
    setDropIndicator(null);
  };

  const handleRowDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const fieldName = e.dataTransfer.getData("text/plain");
    const field = fields.find((field) => field.name === fieldName);

    const valueData = { ...field, sort_order: "asc" };

    if (field) {
      setRows((prevRows) => [...prevRows, valueData]);
    }
  };

  const handleColumnDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const fieldName = e.dataTransfer.getData("text/plain");
    const field = fields.find((field) => field.name === fieldName);

    const valueData = { ...field, sort_order: "asc" };

    if (field) {
      setColumns((prevCols) => [...prevCols, valueData]);
    }
  };

  const handleValueDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const fieldName = e.dataTransfer.getData("text/plain");

    const field = fields.find((field) => field.name === fieldName);

    const valueData = { ...field, sort_order: "sum" };

    if (field) {
      setValues((prevValue) => [...prevValue, valueData]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAdd = (menuName) => {
    if (menuName === "row") {
      const data = {
        name: fields[0]?.name || "",
        sort_order: "asc",
      };

      setRows((prevRows) => [...prevRows, data]);
    }

    if (menuName === "column") {
      const data = {
        name: fields[0]?.name || "",
        sort_order: "asc",
      };

      setColumns((prevColumn) => [...prevColumn, data]);
    }

    if (menuName === "value") {
      const data = {
        name: fields[0]?.name || "",
        sort_order: "sum",
      };

      setValues((prevValue) => [...prevValue, data]);
    }
  };

  return (
    <div className="grid w-full h-full grid-cols-12 gap-3">
      <div className="col-span-6 pb-10 pr-2 overflow-y-auto border-r scroll-smooth recent__bar border-border-color ">
        <div className="flex flex-col w-full space-y-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs font-medium tracking-wide text-primary-text">
                Rows
              </p>

              <div
                className="flex items-center space-x-1 text-xs font-medium tracking-wide cursor-pointer group text-secondary hover:text-secondary-foreground"
                onClick={() => handleAdd("row")}
              >
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 fill-secondary group-hover:fill-secondary-foreground"
                  >
                    <path d="M7.33337 8.66536H3.33337V7.33203H7.33337V3.33203H8.66671V7.33203H12.6667V8.66536H8.66671V12.6654H7.33337V8.66536Z" />
                  </svg>
                </span>

                <span>Add</span>
              </div>
            </div>

            <div
              className="w-full min-h-28"
              onDrop={handleRowDrop}
              onDragOver={handleDragOver}
            >
              {rows?.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full min-h-full px-2 py-6 space-y-2 text-center border-2 border-dashed rounded-md border-border-color">
                  <span className="flex items-center justify-center stroke-primary-text">
                    <svg
                      viewBox="0 0 15 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                    >
                      <path
                        d="M10.3332 15.373L13.8643 11.8333M7.83317 1H3.83317C2.89975 1 2.43304 1 2.07652 1.18166C1.76291 1.34144 1.50795 1.59641 1.34816 1.91002C1.1665 2.26653 1.1665 2.73325 1.1665 3.66667V13.3333C1.1665 14.2667 1.1665 14.7335 1.34816 15.09C1.50795 15.4036 1.76291 15.6586 2.07652 15.8183C2.43304 16 2.89975 16 3.83317 16H6.99984M7.83317 1L12.8332 6M7.83317 1V4.66667C7.83317 5.13337 7.83317 5.36673 7.924 5.54499C8.00392 5.70179 8.13134 5.82928 8.28817 5.90918C8.46642 6 8.69975 6 9.1665 6H12.8332M12.8332 6V7.66667M14.4998 13.5C14.4998 14.8807 13.3806 16 11.9998 16C10.6191 16 9.49984 14.8807 9.49984 13.5C9.49984 12.1192 10.6191 11 11.9998 11C13.3806 11 14.4998 12.1192 14.4998 13.5Z"
                        stroke-opacity="0.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>

                  <p className="text-xs font-medium text-primary-text">
                    No values assigned
                  </p>

                  <p className="text-xs font-normal text-secondary-text">
                    Drag values from the available fields and drop them here to
                    assign
                  </p>
                </div>
              )}

              {rows.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {rows.map((row, index) => {
                    return (
                      <RowMenu
                        data={row}
                        availableFields={fields}
                        key={index}
                        index={index}
                        rows={rows}
                        setRows={setRows}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-0.5 horizontal"></div>

          {/* <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs font-medium tracking-wide text-primary-text">
                Columns
              </p>

              <div
                className="flex items-center space-x-1 text-xs font-medium tracking-wide cursor-pointer group text-secondary hover:text-secondary-foreground"
                onClick={() => handleAdd("column")}
              >
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 fill-secondary group-hover:fill-secondary-foreground"
                  >
                    <path d="M7.33337 8.66536H3.33337V7.33203H7.33337V3.33203H8.66671V7.33203H12.6667V8.66536H8.66671V12.6654H7.33337V8.66536Z" />
                  </svg>
                </span>

                <span>Add</span>
              </div>
            </div>

            <div
              className="w-full min-h-28"
              onDrop={handleColumnDrop}
              onDragOver={handleDragOver}
            >
              {columns?.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full min-h-full px-2 py-6 space-y-2 text-center border-2 border-dashed rounded-md border-border-color">
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 15 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                    >
                      <path
                        d="M10.3332 15.373L13.8643 11.8333M7.83317 1H3.83317C2.89975 1 2.43304 1 2.07652 1.18166C1.76291 1.34144 1.50795 1.59641 1.34816 1.91002C1.1665 2.26653 1.1665 2.73325 1.1665 3.66667V13.3333C1.1665 14.2667 1.1665 14.7335 1.34816 15.09C1.50795 15.4036 1.76291 15.6586 2.07652 15.8183C2.43304 16 2.89975 16 3.83317 16H6.99984M7.83317 1L12.8332 6M7.83317 1V4.66667C7.83317 5.13337 7.83317 5.36673 7.924 5.54499C8.00392 5.70179 8.13134 5.82928 8.28817 5.90918C8.46642 6 8.69975 6 9.1665 6H12.8332M12.8332 6V7.66667M14.4998 13.5C14.4998 14.8807 13.3806 16 11.9998 16C10.6191 16 9.49984 14.8807 9.49984 13.5C9.49984 12.1192 10.6191 11 11.9998 11C13.3806 11 14.4998 12.1192 14.4998 13.5Z"
                        stroke="white"
                        stroke-opacity="0.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>

                  <p className="text-xs font-medium text-primary-text">
                    No values assigned
                  </p>

                  <p className="text-xs font-normal text-secondary-text">
                    Drag values from the available fields and drop them here to
                    assign
                  </p>
                </div>
              )}

              {columns.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {columns.map((column, index) => {
                    return (
                      <ColumnMenu
                        data={column}
                        availableFields={fields}
                        key={index}
                        index={index}
                        columns={columns}
                        setColumns={setColumns}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div> */}

          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs font-medium tracking-wide text-primary-text">
                Values
              </p>

              <div
                className="flex items-center space-x-1 text-xs font-medium tracking-wide cursor-pointer group text-secondary hover:text-secondary-foreground"
                onClick={() => handleAdd("value")}
              >
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 fill-secondary group-hover:fill-secondary-foreground"
                  >
                    <path d="M7.33337 8.66536H3.33337V7.33203H7.33337V3.33203H8.66671V7.33203H12.6667V8.66536H8.66671V12.6654H7.33337V8.66536Z" />
                  </svg>
                </span>

                <span>Add</span>
              </div>
            </div>

            <div
              className="w-full min-h-28"
              onDrop={handleValueDrop}
              onDragOver={handleDragOver}
            >
              {values?.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full min-h-full px-2 py-6 space-y-2 text-center border-2 border-dashed rounded-md border-border-color">
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 15 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 stroke-primary-text"
                    >
                      <path
                        d="M10.3332 15.373L13.8643 11.8333M7.83317 1H3.83317C2.89975 1 2.43304 1 2.07652 1.18166C1.76291 1.34144 1.50795 1.59641 1.34816 1.91002C1.1665 2.26653 1.1665 2.73325 1.1665 3.66667V13.3333C1.1665 14.2667 1.1665 14.7335 1.34816 15.09C1.50795 15.4036 1.76291 15.6586 2.07652 15.8183C2.43304 16 2.89975 16 3.83317 16H6.99984M7.83317 1L12.8332 6M7.83317 1V4.66667C7.83317 5.13337 7.83317 5.36673 7.924 5.54499C8.00392 5.70179 8.13134 5.82928 8.28817 5.90918C8.46642 6 8.69975 6 9.1665 6H12.8332M12.8332 6V7.66667M14.4998 13.5C14.4998 14.8807 13.3806 16 11.9998 16C10.6191 16 9.49984 14.8807 9.49984 13.5C9.49984 12.1192 10.6191 11 11.9998 11C13.3806 11 14.4998 12.1192 14.4998 13.5Z"
                        stroke-opacity="0.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>

                  <p className="text-xs font-medium text-primary-text">
                    No values assigned
                  </p>

                  <p className="text-xs font-normal text-secondary-text">
                    Drag values from the available fields and drop them here to
                    assign
                  </p>
                </div>
              )}

              {values.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {values.map((value, index) => {
                    return (
                      <ValueMenu
                        data={value}
                        availableFields={fields}
                        key={index}
                        index={index}
                        values={values}
                        setValues={setValues}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-6 pb-10 pr-2 overflow-y-auto scroll-smooth recent__bar">
        <div className="relative flex flex-col w-full">
          <div className="sticky top-0 left-0 z-50 flex flex-col w-full space-y-4 bg-dropdown-bg">
            <p className="text-xs font-medium tracking-wide text-primary-text">
              Chart Type
            </p>

            <div className="grid w-full grid-cols-4 gap-2 p-3 border rounded-md border-border-color">
              <li
                className={`flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${
                  chartType === "bar" ? "bg-active-bg" : "bg-transparent"
                }`}
                onClick={() => setChartType("bar")}
                data-tooltip-id="tooltip"
                data-tooltip-content="Bar Chart"
                data-tooltip-place="bottom"
              >
                <svg
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${
                    chartType === "bar" ? "fill-active-icon" : "fill-icon-color"
                  }`}
                >
                  <path d="M12 16V9H16V16H12ZM6 16V0H10V16H6ZM0 16V5H4V16H0Z" />
                </svg>
              </li>

              <li
                className={`flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${
                  chartType === "line" ? "bg-active-bg" : "bg-transparent"
                }`}
                onClick={() => setChartType("line")}
                data-tooltip-id="tooltip"
                data-tooltip-content="Line Chart"
                data-tooltip-place="bottom"
              >
                <svg
                  viewBox="0 0 20 14"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${
                    chartType === "line"
                      ? "fill-active-icon"
                      : "fill-icon-color"
                  }`}
                >
                  <path d="M1.5 13.5L0 12L7.5 4.5L11.5 8.5L18.6 0.5L20 1.9L11.5 11.5L7.5 7.5L1.5 13.5Z" />
                </svg>
              </li>

              <li
                className={`flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${
                  chartType === "multi_pie" ? "bg-active-bg" : "bg-transparent"
                }`}
                onClick={() => setChartType("multi_pie")}
                data-tooltip-id="tooltip"
                data-tooltip-content="Multi Pie Chart"
                data-tooltip-place="bottom"
              >
                <svg
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${
                    chartType === "multi_pie"
                      ? "fill-active-icon"
                      : "fill-icon-color"
                  }`}
                >
                  <path d="M11 9H17.95C17.7 7.16667 16.9375 5.6125 15.6625 4.3375C14.3875 3.0625 12.8333 2.3 11 2.05V9ZM9 17.95V2.05C6.98333 2.3 5.3125 3.17917 3.9875 4.6875C2.6625 6.19583 2 7.96667 2 10C2 12.0333 2.6625 13.8042 3.9875 15.3125C5.3125 16.8208 6.98333 17.7 9 17.95ZM11 17.95C12.8333 17.7167 14.3917 16.9583 15.675 15.675C16.9583 14.3917 17.7167 12.8333 17.95 11H11V17.95ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6792 0.2625 13.8875 0.7875C15.0958 1.3125 16.1542 2.02917 17.0625 2.9375C17.9708 3.84583 18.6875 4.90417 19.2125 6.1125C19.7375 7.32083 20 8.61667 20 10C20 11.3667 19.7375 12.6583 19.2125 13.875C18.6875 15.0917 17.975 16.1542 17.075 17.0625C16.175 17.9708 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z" />
                </svg>
              </li>

              <li
                className={`flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${
                  chartType === "radar" ? "bg-active-bg" : "bg-transparent"
                }`}
                onClick={() => setChartType("radar")}
                data-tooltip-id="tooltip"
                data-tooltip-content="Radar Chart"
                data-tooltip-place="bottom"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 ${
                    chartType === "radar"
                      ? "fill-active-icon"
                      : "fill-icon-color"
                  }`}
                >
                  <path d="M12 2C6.579 2 2 6.58 2 12s4.579 10 10 10 10-4.58 10-10S17.421 2 12 2zm0 18c-4.337 0-8-3.664-8-8 0-3.998 3.115-7.417 7-7.927V6.09C8.167 6.569 6 9.033 6 12c0 3.309 2.691 6 6 6 1.595 0 3.1-.626 4.237-1.763l-1.414-1.415A3.97 3.97 0 0 1 12 16c-2.206 0-4-1.794-4-4 0-1.858 1.279-3.411 3-3.858v2.146c-.59.353-1 .993-1 1.712 0 1.081.919 2 2 2s2-.919 2-2c0-.719-.41-1.359-1-1.712V4.073c3.885.51 7 3.929 7 7.927 0 4.336-3.663 8-8 8z"></path>
                </svg>
              </li>

              <li
                className={`flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${
                  chartType === "stacked_bar"
                    ? "bg-active-bg"
                    : "bg-transparent"
                }`}
                onClick={() => setChartType("stacked_bar")}
                data-tooltip-id="tooltip"
                data-tooltip-content="Stacked Bar Chart"
                data-tooltip-place="bottom"
              >
                <svg
                  viewBox="0 0 14 14"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${
                    chartType === "stacked_bar"
                      ? "fill-active-icon"
                      : "fill-icon-color"
                  }`}
                >
                  <path d="M0.333984 13.6654V4.4987H3.66732V13.6654H0.333984ZM0.333984 3.66536V0.332031H3.66732V3.66536H0.333984ZM5.33398 13.6654V6.9987H8.66732V13.6654H5.33398ZM5.33398 6.16536V2.83203H8.66732V6.16536H5.33398ZM10.334 13.6654V9.4987H13.6673V13.6654H10.334ZM10.334 8.66536V5.33203H13.6673V8.66536H10.334Z" />
                </svg>
              </li>

              <li
                className={`flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${
                  chartType === "scatter" ? "bg-active-bg" : "bg-transparent"
                }`}
                onClick={() => setChartType("scatter")}
                data-tooltip-id="tooltip"
                data-tooltip-content="Scatter Chart"
                data-tooltip-place="bottom"
              >
                <svg
                  viewBox="0 0 18 20"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${
                    chartType === "scatter"
                      ? "fill-active-icon"
                      : "fill-icon-color"
                  }`}
                >
                  <path d="M14 19.5C12.9 19.5 11.9583 19.1083 11.175 18.325C10.3917 17.5417 10 16.6 10 15.5C10 14.4 10.3917 13.4583 11.175 12.675C11.9583 11.8917 12.9 11.5 14 11.5C15.1 11.5 16.0417 11.8917 16.825 12.675C17.6083 13.4583 18 14.4 18 15.5C18 16.6 17.6083 17.5417 16.825 18.325C16.0417 19.1083 15.1 19.5 14 19.5ZM14 17.5C14.55 17.5 15.0208 17.3042 15.4125 16.9125C15.8042 16.5208 16 16.05 16 15.5C16 14.95 15.8042 14.4792 15.4125 14.0875C15.0208 13.6958 14.55 13.5 14 13.5C13.45 13.5 12.9792 13.6958 12.5875 14.0875C12.1958 14.4792 12 14.95 12 15.5C12 16.05 12.1958 16.5208 12.5875 16.9125C12.9792 17.3042 13.45 17.5 14 17.5ZM4 16.5C2.9 16.5 1.95833 16.1083 1.175 15.325C0.391667 14.5417 0 13.6 0 12.5C0 11.4 0.391667 10.4583 1.175 9.675C1.95833 8.89167 2.9 8.5 4 8.5C5.1 8.5 6.04167 8.89167 6.825 9.675C7.60833 10.4583 8 11.4 8 12.5C8 13.6 7.60833 14.5417 6.825 15.325C6.04167 16.1083 5.1 16.5 4 16.5ZM4 14.5C4.55 14.5 5.02083 14.3042 5.4125 13.9125C5.80417 13.5208 6 13.05 6 12.5C6 11.95 5.80417 11.4792 5.4125 11.0875C5.02083 10.6958 4.55 10.5 4 10.5C3.45 10.5 2.97917 10.6958 2.5875 11.0875C2.19583 11.4792 2 11.95 2 12.5C2 13.05 2.19583 13.5208 2.5875 13.9125C2.97917 14.3042 3.45 14.5 4 14.5ZM8 8.5C6.9 8.5 5.95833 8.10833 5.175 7.325C4.39167 6.54167 4 5.6 4 4.5C4 3.4 4.39167 2.45833 5.175 1.675C5.95833 0.891667 6.9 0.5 8 0.5C9.1 0.5 10.0417 0.891667 10.825 1.675C11.6083 2.45833 12 3.4 12 4.5C12 5.6 11.6083 6.54167 10.825 7.325C10.0417 8.10833 9.1 8.5 8 8.5ZM8 6.5C8.55 6.5 9.02083 6.30417 9.4125 5.9125C9.80417 5.52083 10 5.05 10 4.5C10 3.95 9.80417 3.47917 9.4125 3.0875C9.02083 2.69583 8.55 2.5 8 2.5C7.45 2.5 6.97917 2.69583 6.5875 3.0875C6.19583 3.47917 6 3.95 6 4.5C6 5.05 6.19583 5.52083 6.5875 5.9125C6.97917 6.30417 7.45 6.5 8 6.5Z" />
                </svg>
              </li>

              <li
                className={`flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${
                  chartType === "table" ? "bg-active-bg" : "bg-transparent"
                }`}
                onClick={() => setChartType("table")}
                data-tooltip-id="tooltip"
                data-tooltip-content="Table Chart"
                data-tooltip-place="bottom"
              >
                <svg
                  viewBox="0 0 18 18"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${
                    chartType === "table"
                      ? "fill-active-icon"
                      : "fill-icon-color"
                  }`}
                >
                  <path d="M15.6111 17.5H2.38889C1.86944 17.5 1.42477 17.315 1.05486 16.9451C0.684954 16.5752 0.5 16.1306 0.5 15.6111V2.38889C0.5 1.86944 0.684954 1.42477 1.05486 1.05486C1.42477 0.684954 1.86944 0.5 2.38889 0.5H15.6111C16.1306 0.5 16.5752 0.684954 16.9451 1.05486C17.315 1.42477 17.5 1.86944 17.5 2.38889V15.6111C17.5 16.1306 17.315 16.5752 16.9451 16.9451C16.5752 17.315 16.1306 17.5 15.6111 17.5ZM2.38889 5.22222H15.6111V2.38889H2.38889V5.22222ZM4.75 7.11111H2.38889V15.6111H4.75V7.11111ZM13.25 7.11111V15.6111H15.6111V7.11111H13.25ZM11.3611 7.11111H6.63889V15.6111H11.3611V7.11111Z" />
                </svg>
              </li>

              <li
                className={`flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${
                  chartType === "LABELS_ONLY"
                    ? "bg-active-bg"
                    : "bg-transparent"
                }`}
                onClick={() => setChartType("LABELS_ONLY")}
                data-tooltip-id="tooltip"
                data-tooltip-content="Card"
                data-tooltip-place="bottom"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className={`w-5 h-5 ${
                    chartType === "LABELS_ONLY"
                      ? "fill-active-icon"
                      : "fill-icon-color"
                  }`}
                >
                  <path d="M208,88H48a16,16,0,0,0-16,16v96a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104A16,16,0,0,0,208,88Zm0,112H48V104H208v96ZM48,64a8,8,0,0,1,8-8H200a8,8,0,0,1,0,16H56A8,8,0,0,1,48,64ZM64,32a8,8,0,0,1,8-8H184a8,8,0,0,1,0,16H72A8,8,0,0,1,64,32Z"></path>
                </svg>
              </li>
            </div>

            <p className="sticky top-0 left-0 w-full text-xs font-medium tracking-wide text-primary-text">
              Available Fields
            </p>

            <div className="relative w-full border rounded-tr-md rounded-tl-md border-border-color">
              <input
                type="text"
                className="w-full py-2 pl-10 pr-10 text-sm text-input-text bg-transparent outline-none rounded-tr-md rounded-tl-md placeholder:text-secondary-text"
                placeholder="Search by field name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-primary-text"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </span>

              {searchQuery !== "" && (
                <span
                  className="absolute flex items-center justify-center w-5 h-5 -translate-y-1/2 rounded-full cursor-pointer top-1/2 right-2"
                  onClick={() => setSearchQuery("")}
                >
                  <svg
                    viewBox="0 0 12 13"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 fill-icon-color hover:fill-primary-text"
                  >
                    <path d="M1.33317 12.3307L0.166504 11.1641L4.83317 6.4974L0.166504 1.83073L1.33317 0.664062L5.99984 5.33073L10.6665 0.664062L11.8332 1.83073L7.1665 6.4974L11.8332 11.1641L10.6665 12.3307L5.99984 7.66406L1.33317 12.3307Z" />
                  </svg>
                </span>
              )}
            </div>
          </div>

          <div className="relative z-40 flex flex-col w-full h-full space-y-4">
            <div className="flex flex-col space-y-2 border-b border-l border-r border-border-color">
              <div className="flex flex-col px-2 pb-2 space-y-3">
                <div className="mt-2 text-sm font-normal tracking-wide text-secondary-text">
                  Drag and Drop to choose
                </div>

                <ul className="flex flex-col w-full space-y-3 min-h-28">
                  {filteredFields?.map((field, index) => {
                    return (
                      <li
                        className={`!px-4 !py-2 rounded-md flex items-center space-x-2 w-fit bg-primary text-xs font-medium text-secondary-text hover:text-primary-text group cursor-grab ${
                          dropIndicator === field ? "bg-blue-600" : ""
                        } `}
                        draggable={true}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, field.name);
                        }}
                        onDragEnd={handleDragEnd}
                      >
                        <span className="flex items-center justify-center">
                          <svg
                            viewBox="0 0 8 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 fill-secondary-text group-hover:fill-primary-text"
                          >
                            <path d="M1.99984 11.3307C1.63317 11.3307 1.31928 11.2002 1.05817 10.9391C0.797059 10.678 0.666504 10.3641 0.666504 9.9974C0.666504 9.63073 0.797059 9.31684 1.05817 9.05573C1.31928 8.79462 1.63317 8.66406 1.99984 8.66406C2.3665 8.66406 2.68039 8.79462 2.9415 9.05573C3.20261 9.31684 3.33317 9.63073 3.33317 9.9974C3.33317 10.3641 3.20261 10.678 2.9415 10.9391C2.68039 11.2002 2.3665 11.3307 1.99984 11.3307ZM5.99984 11.3307C5.63317 11.3307 5.31928 11.2002 5.05817 10.9391C4.79706 10.678 4.6665 10.3641 4.6665 9.9974C4.6665 9.63073 4.79706 9.31684 5.05817 9.05573C5.31928 8.79462 5.63317 8.66406 5.99984 8.66406C6.3665 8.66406 6.68039 8.79462 6.9415 9.05573C7.20261 9.31684 7.33317 9.63073 7.33317 9.9974C7.33317 10.3641 7.20261 10.678 6.9415 10.9391C6.68039 11.2002 6.3665 11.3307 5.99984 11.3307ZM1.99984 7.33073C1.63317 7.33073 1.31928 7.20017 1.05817 6.93906C0.797059 6.67795 0.666504 6.36406 0.666504 5.9974C0.666504 5.63073 0.797059 5.31684 1.05817 5.05573C1.31928 4.79462 1.63317 4.66406 1.99984 4.66406C2.3665 4.66406 2.68039 4.79462 2.9415 5.05573C3.20261 5.31684 3.33317 5.63073 3.33317 5.9974C3.33317 6.36406 3.20261 6.67795 2.9415 6.93906C2.68039 7.20017 2.3665 7.33073 1.99984 7.33073ZM5.99984 7.33073C5.63317 7.33073 5.31928 7.20017 5.05817 6.93906C4.79706 6.67795 4.6665 6.36406 4.6665 5.9974C4.6665 5.63073 4.79706 5.31684 5.05817 5.05573C5.31928 4.79462 5.63317 4.66406 5.99984 4.66406C6.3665 4.66406 6.68039 4.79462 6.9415 5.05573C7.20261 5.31684 7.33317 5.63073 7.33317 5.9974C7.33317 6.36406 7.20261 6.67795 6.9415 6.93906C6.68039 7.20017 6.3665 7.33073 5.99984 7.33073ZM1.99984 3.33073C1.63317 3.33073 1.31928 3.20017 1.05817 2.93906C0.797059 2.67795 0.666504 2.36406 0.666504 1.9974C0.666504 1.63073 0.797059 1.31684 1.05817 1.05573C1.31928 0.794618 1.63317 0.664062 1.99984 0.664062C2.3665 0.664062 2.68039 0.794618 2.9415 1.05573C3.20261 1.31684 3.33317 1.63073 3.33317 1.9974C3.33317 2.36406 3.20261 2.67795 2.9415 2.93906C2.68039 3.20017 2.3665 3.33073 1.99984 3.33073ZM5.99984 3.33073C5.63317 3.33073 5.31928 3.20017 5.05817 2.93906C4.79706 2.67795 4.6665 2.36406 4.6665 1.9974C4.6665 1.63073 4.79706 1.31684 5.05817 1.05573C5.31928 0.794618 5.63317 0.664062 5.99984 0.664062C6.3665 0.664062 6.68039 0.794618 6.9415 1.05573C7.20261 1.31684 7.33317 1.63073 7.33317 1.9974C7.33317 2.36406 7.20261 2.67795 6.9415 2.93906C6.68039 3.20017 6.3665 3.33073 5.99984 3.33073Z" />
                          </svg>
                        </span>

                        <div className="line-clamp-1">{field.name}</div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMenu;

const RowMenu = ({ data, availableFields, index, rows, setRows }) => {
  const [toggleResponse, setToggleResponse] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [toggleOrder, setToggleOrder] = useState(false);
  const [currentOrderResponse, setCurrentOrderResponse] = useState("");

  const modalRef = useRef(null);
  const modalOrderRef = useRef(null);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    if (data) {
      setCurrentResponse(data.name);
      setCurrentOrderResponse(data.sort_order);
    }
  }, [data]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setToggleResponse(false);
    }

    if (modalOrderRef.current && !modalOrderRef.current.contains(e.target)) {
      setToggleOrder(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSort = () => {
    let rowItems = [...rows];
    const draggableItemContent = rowItems.splice(dragItem.current, 1)[0];
    rowItems.splice(dragOverItem.current, 0, draggableItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    setRows(rowItems);
  };

  const handleRemoveRow = () => {
    const updatedRows = rows.filter((_, rowIndex) => rowIndex !== index);

    setRows(updatedRows);
  };

  const handleUpdateRow = (key, newValue) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [key]: newValue };
    setRows(updatedRows);
  };

  const orderOptions = [
    {
      label: "Ascending",
      value: "asc",
    },
    {
      label: "Descending",
      value: "desc",
    },
  ];

  return (
    <div
      className={`flex flex-col space-y-2 p-2 rounded-md bg-primary ${
        dragItem.current === index ? "border border-secondary" : ""
      }`}
      draggable={true}
      onDragStart={(e) => (dragItem.current = index)}
      onDragEnter={(e) => (dragOverItem.current = index)}
      onDragEnd={handleSort}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-border-color">
        <div
          className={`relative flex ${toggleResponse ? "w-36" : ""}`}
          ref={modalRef}
        >
          <div className="w-full border rounded-md cursor-pointer border-border-color">
            <div
              className="flex items-center justify-between w-full px-2 py-1 space-x-2 rounded-md"
              onClick={() => setToggleResponse(!toggleResponse)}
            >
              {currentResponse && (
                <span className="text-xs font-medium text-primary-text line-clamp-1 whitespace-nowrap">
                  {currentResponse}
                </span>
              )}

              {currentResponse === "" && (
                <span className="text-xs font-medium text-primary-text line-clamp-1 whitespace-nowrap">
                  Choose Field
                </span>
              )}

              {toggleResponse || (
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 fill-primary-text"
                  >
                    <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                  </svg>
                </span>
              )}

              {toggleResponse && (
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 fill-primary-text"
                  >
                    <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                  </svg>
                </span>
              )}
            </div>
          </div>

          {toggleResponse && (
            <ul className="flex flex-col w-full bg-dropdown-bg rounded-md z-10 divide-y-2 divide-dropdown-border absolute top-[110%] left-0">
              {availableFields?.map((field) => {
                return (
                  <li
                    className="flex items-center justify-between px-2 py-2 text-xs font-medium text-primary-text cursor-pointer hover:bg-dropdown-hover bg-dropdown-bg"
                    onClick={() => {
                      handleUpdateRow("name", field.name);
                      setCurrentResponse(field.name);
                      setToggleResponse(false);
                    }}
                  >
                    <div className="line-clamp-1">{field.name}</div>

                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentResponse === field.name}
                          className={`w-3 h-3 text-blue-600 cursor-pointer rounded accent-[#295EF4] ${
                            currentResponse === field.name
                              ? ""
                              : "custom-checkbox"
                          }`}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <span
          className="flex items-center justify-center cursor-pointer"
          data-tooltip-id="tooltip"
          data-tooltip-content="Remove"
          data-tooltip-place="bottom"
          onClick={handleRemoveRow}
        >
          <svg
            viewBox="0 0 12 13"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3 fill-icon-color hover:fill-primary-text"
          >
            <path d="M1.33317 12.3307L0.166504 11.1641L4.83317 6.4974L0.166504 1.83073L1.33317 0.664062L5.99984 5.33073L10.6665 0.664062L11.8332 1.83073L7.1665 6.4974L11.8332 11.1641L10.6665 12.3307L5.99984 7.66406L1.33317 12.3307Z" />
          </svg>
        </span>
      </div>

      <div className="relative flex w-full" ref={modalOrderRef}>
        <div
          className={`w-full cursor-pointer border rounded-md ${
            toggleOrder ? "border-border-color" : "border-transparent"
          }`}
        >
          <div
            className="flex items-center justify-between w-full px-2 py-2.5 bg-dropdown-bg rounded-md border border-dropdown-border"
            onClick={() => setToggleOrder(!toggleOrder)}
          >
            {currentOrderResponse && (
              <span className="text-xs font-medium text-secondary-text line-clamp-1 whitespace-nowrap">
                {currentOrderResponse === "asc" && "Ascending"}
                {currentOrderResponse === "desc" && "Descending"}
              </span>
            )}

            {currentOrderResponse === "" && (
              <span className="text-xs font-medium text-secondary-text line-clamp-1 whitespace-nowrap">
                Choose Order
              </span>
            )}

            {toggleOrder || (
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-icon-color"
                >
                  <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                </svg>
              </span>
            )}

            {toggleOrder && (
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-white"
                >
                  <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                </svg>
              </span>
            )}
          </div>
        </div>

        {toggleOrder && (
          <ul className="flex flex-col w-full bg-dropdown-bg rounded-md border border-dropdown-border z-10 divide-y-2 divide-dropdown-border absolute top-[110%] left-0">
            {orderOptions?.map((order) => {
              return (
                <li
                  className="py-2.5 px-2 flex items-center justify-between hover:bg-dropdown-hover text-xs font-medium cursor-pointer text-primary-text bg-dropdown-bg"
                  onClick={() => {
                    handleUpdateRow("sort_order", order.value);
                    setCurrentOrderResponse(order.value);
                    setToggleOrder(false);
                  }}
                >
                  <div className="line-clamp-1">{order.label}</div>

                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentOrderResponse === order.value}
                        className={`w-4 h-4 text-blue-600 cursor-pointer rounded accent-[#295EF4] ${
                          currentOrderResponse === order.value
                            ? ""
                            : "custom-checkbox"
                        }`}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

const ValueMenu = ({ data, availableFields, index, values, setValues }) => {
  const [toggleResponse, setToggleResponse] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [toggleOrder, setToggleOrder] = useState(false);
  const [currentOrderResponse, setCurrentOrderResponse] = useState("");

  const modalRef = useRef(null);
  const modalOrderRef = useRef(null);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    if (data) {
      setCurrentResponse(data.name);
      setCurrentOrderResponse(data.sort_order);
    }
  }, [data]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setToggleResponse(false);
    }

    if (modalOrderRef.current && !modalOrderRef.current.contains(e.target)) {
      setToggleOrder(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSort = () => {
    let valueItems = [...values];
    const draggableItemContent = valueItems.splice(dragItem.current, 1)[0];
    valueItems.splice(dragOverItem.current, 0, draggableItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    setValues(valueItems);
  };

  const handleRemoveValue = () => {
    const updatedValues = values.filter(
      (_, valueIndex) => valueIndex !== index
    );
    setValues(updatedValues);
  };

  const handleUpdateValue = (key, newValue) => {
    const updatedValues = [...values];
    updatedValues[index] = { ...updatedValues[index], [key]: newValue };
    setValues(updatedValues);
  };

  const orderOptions = [
    {
      label: "Sum",
      value: "sum",
    },
    {
      label: "Mean",
      value: "mean",
    },
    {
      label: "Count",
      value: "count",
    },
    {
      label: "Min",
      value: "min",
    },
    {
      label: "Max",
      value: "max",
    },
  ];

  return (
    <div
      className={`flex flex-col space-y-2 p-2 rounded-md bg-primary ${
        dragItem.current === index ? "border border-secondary" : ""
      }`}
      draggable={true}
      onDragStart={(e) => (dragItem.current = index)}
      onDragEnter={(e) => (dragOverItem.current = index)}
      onDragEnd={handleSort}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-border-color">
        <div
          className={`relative flex ${toggleResponse ? "w-36" : ""}`}
          ref={modalRef}
        >
          <div className="w-full border rounded-md cursor-pointer border-border-color">
            <div
              className="flex items-center justify-between w-full px-2 py-1 space-x-2 rounded-md"
              onClick={() => setToggleResponse(!toggleResponse)}
            >
              {currentResponse && (
                <span className="text-xs font-medium text-primary-text line-clamp-1 whitespace-nowrap">
                  {currentResponse}
                </span>
              )}

              {currentResponse === "" && (
                <span className="text-xs font-medium text-primary-text line-clamp-1 whitespace-nowrap">
                  Choose Field
                </span>
              )}

              {toggleResponse || (
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 fill-white"
                  >
                    <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                  </svg>
                </span>
              )}

              {toggleResponse && (
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 fill-white"
                  >
                    <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                  </svg>
                </span>
              )}
            </div>
          </div>

          {toggleResponse && (
            <ul className="flex flex-col w-full bg-dropdown-bg rounded-md border border-dropdown-border z-10 divide-y-2 divide-dropdown-border absolute top-[110%] left-0">
              {availableFields?.map((field) => {
                return (
                  <li
                    className="py-2.5 px-2 flex items-center justify-between hover:bg-dropdown-hover text-xs font-medium cursor-pointer text-primary-text bg-dropdown-bg"
                    onClick={() => {
                      handleUpdateValue("name", field.name);
                      setCurrentResponse(field.name);
                      setToggleResponse(false);
                    }}
                  >
                    <div className="line-clamp-1">{field.name}</div>

                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentResponse === field.name}
                          className={`w-3 h-3 text-blue-600 cursor-pointer rounded accent-[#295EF4] ${
                            currentResponse === field.name
                              ? ""
                              : "custom-checkbox"
                          }`}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <span
          className="flex items-center justify-center cursor-pointer"
          data-tooltip-id="tooltip"
          data-tooltip-content="Remove"
          data-tooltip-place="bottom"
          onClick={handleRemoveValue}
        >
          <svg
            viewBox="0 0 12 13"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3 fill-icon-color hover:fill-primary-text"
          >
            <path d="M1.33317 12.3307L0.166504 11.1641L4.83317 6.4974L0.166504 1.83073L1.33317 0.664062L5.99984 5.33073L10.6665 0.664062L11.8332 1.83073L7.1665 6.4974L11.8332 11.1641L10.6665 12.3307L5.99984 7.66406L1.33317 12.3307Z" />
          </svg>
        </span>
      </div>

      <div className="relative flex w-full" ref={modalOrderRef}>
        <div
          className={`w-full cursor-pointer border rounded-md ${
            toggleOrder ? "border-border-color" : "border-transparent"
          }`}
        >
          <div
            className="flex items-center justify-between w-full px-2 py-2.5 bg-dropdown-bg rounded-md border border-dropdown-border"
            onClick={() => setToggleOrder(!toggleOrder)}
          >
            {currentOrderResponse && (
              <span className="text-xs font-medium text-secondary-text line-clamp-1 whitespace-nowrap">
                {currentOrderResponse === "sum" && "Sum"}
                {currentOrderResponse === "mean" && "Mean"}
                {currentOrderResponse === "count" && "Count"}
                {currentOrderResponse === "min" && "Min"}
                {currentOrderResponse === "max" && "Max"}
              </span>
            )}

            {currentOrderResponse === "" && (
              <span className="text-xs font-medium text-secondary-text line-clamp-1 whitespace-nowrap">
                Summarize by
              </span>
            )}

            {toggleOrder || (
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-icon-color"
                >
                  <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                </svg>
              </span>
            )}

            {toggleOrder && (
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-white"
                >
                  <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                </svg>
              </span>
            )}
          </div>
        </div>

        {toggleOrder && (
          <ul className="flex flex-col w-full bg-dropdown-bg rounded-md border border-dropdown-border z-10 divide-y-2 divide-dropdown-border absolute top-[110%] left-0">
            {orderOptions?.map((order) => {
              return (
                <li
                  className="py-2.5 px-2 flex items-center justify-between hover:bg-dropdown-hover text-xs font-medium cursor-pointer text-primary-text bg-dropdown-bg"
                  onClick={() => {
                    handleUpdateValue("sort_order", order.value);
                    setCurrentOrderResponse(order.value);
                    setToggleOrder(false);
                  }}
                >
                  <div className="line-clamp-1">{order.label}</div>

                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentOrderResponse === order.value}
                        className={`w-4 h-4 text-blue-600 cursor-pointer rounded accent-[#295EF4] ${
                          currentOrderResponse === order.value
                            ? ""
                            : "custom-checkbox"
                        }`}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
