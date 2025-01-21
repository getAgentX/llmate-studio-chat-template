import React, { useEffect, useState } from "react";
import SelectOption from "./SelectOption";
import CodeHighlighter from "./CodeHighlighter";
import DashboardDropdown from "./DashboardDropdown";
import CommonChart from "./CommonChart";

const TableCard = ({
  event = {},
  data = {},
  showAddDashboard = false,
  handleShowMore = () => {},
  isLoading = false,
}) => {
  const [currentTab, setCurrentTab] = useState("table");

  useEffect(() => {
    const totalItems = Object.keys(data)?.length;

    if (totalItems > 0) {
      setCurrentTab("table");
    } else {
      setCurrentTab("chart");
    }
  }, []);

  const options = [
    {
      value: "table",
      label: "Table",
    },
    {
      value: "chart",
      label: "Chart",
    },
  ];

  const handleSelect = (value) => {
    setCurrentTab(value.value);
  };

  const totalItems = data[Object.keys(data)[0]]?.length;

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const tableHeaders = Object.keys(data).map((key, index) => (
    <th
      key={index}
      className="px-4 py-2 text-xs font-normal tracking-wide text-white border-t border-l border-r border-[#393E49] whitespace-nowrap"
    >
      {formatKey(key)}
    </th>
  ));

  const rows = (() => {
    const totalItems = data[Object.keys(data)[0]]?.length;

    return Array.from({ length: totalItems }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        {Object.keys(data).map((key, colIndex) => (
          <td
            key={`${rowIndex}-${colIndex}`} // Update key to be unique per cell
            className="px-4 py-2 text-xs bg-[#30333C] tracking-wide border-r border-[#393E49] text-white whitespace-nowrap"
          >
            {data[key][rowIndex] ?? "N/A"}
          </td>
        ))}
      </tr>
    ));
  })();

  return (
    <div className="flex flex-col space-y-4">
      <div className="w-full mx-auto space-y-6 text-white">
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col w-full pb-3 border-b border-[#282828]">
            <div className="flex items-center justify-between">
              <div className="flex-wrap items-center hidden w-full sm:flex max-w-fit">
                <button
                  className={`py-2 text-xs font-medium rounded-md min-w-16 flex justify-center items-center space-x-2 px-2 tracking-wider transition-colors duration-300 ${
                    currentTab === "table"
                      ? "bg-[#30333C] text-accent"
                      : "bg-transparent text-white/50"
                  }`}
                  onClick={() => setCurrentTab("table")}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 ${
                        currentTab === "table" ? "fill-white" : "fill-[#5F6368]"
                      }`}
                    >
                      <path d="M10.875 12.125H2.125C1.78125 12.125 1.48698 12.0026 1.24219 11.7578C0.997396 11.513 0.875 11.2188 0.875 10.875V2.125C0.875 1.78125 0.997396 1.48698 1.24219 1.24219C1.48698 0.997396 1.78125 0.875 2.125 0.875H10.875C11.2188 0.875 11.513 0.997396 11.7578 1.24219C12.0026 1.48698 12.125 1.78125 12.125 2.125V10.875C12.125 11.2188 12.0026 11.513 11.7578 11.7578C11.513 12.0026 11.2188 12.125 10.875 12.125ZM2.125 4H10.875V2.125H2.125V4ZM3.6875 5.25H2.125V10.875H3.6875V5.25ZM9.3125 5.25V10.875H10.875V5.25H9.3125ZM8.0625 5.25H4.9375V10.875H8.0625V5.25Z" />
                    </svg>
                  </span>

                  <span>Dataframe</span>
                </button>

                <button
                  className={`py-2 text-xs font-medium rounded-md min-w-16 px-2 flex justify-center items-center space-x-2 tracking-wider transition-colors duration-300 ${
                    currentTab === "chart"
                      ? "bg-[#30333C] text-accent"
                      : "bg-transparent text-white/50"
                  }`}
                  onClick={() => setCurrentTab("chart")}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 ${
                        currentTab === "chart" ? "fill-white" : "fill-[#5F6368]"
                      }`}
                    >
                      <path d="M0.875 12.125V10.875L2.125 9.625V12.125H0.875ZM3.375 12.125V8.375L4.625 7.125V12.125H3.375ZM5.875 12.125V7.125L7.125 8.39062V12.125H5.875ZM8.375 12.125V8.39062L9.625 7.14062V12.125H8.375ZM10.875 12.125V5.875L12.125 4.625V12.125H10.875ZM0.875 8.89062V7.125L5.25 2.75L7.75 5.25L12.125 0.875V2.64062L7.75 7.01562L5.25 4.51562L0.875 8.89062Z" />
                    </svg>
                  </span>

                  <span>Data Visualization</span>
                </button>

                <button
                  className={`py-2 text-xs font-medium rounded-md min-w-16 px-2 flex justify-center items-center space-x-2 tracking-wider transition-colors duration-300 ${
                    currentTab === "sql_cmd"
                      ? "bg-[#30333C] text-accent"
                      : "bg-transparent text-white/50"
                  }`}
                  onClick={() => setCurrentTab("sql_cmd")}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 ${
                        currentTab === "sql_cmd"
                          ? "fill-white"
                          : "fill-[#5F6368]"
                      }`}
                    >
                      <path d="M8.53125 10.7188C8.65625 10.7188 8.76562 10.6719 8.85938 10.5781C8.95312 10.4844 9 10.375 9 10.25C9 10.125 8.95312 10.0156 8.85938 9.92188C8.76562 9.82812 8.65625 9.78125 8.53125 9.78125C8.40625 9.78125 8.29688 9.82812 8.20312 9.92188C8.10938 10.0156 8.0625 10.125 8.0625 10.25C8.0625 10.375 8.10938 10.4844 8.20312 10.5781C8.29688 10.6719 8.40625 10.7188 8.53125 10.7188ZM10.25 10.7188C10.375 10.7188 10.4844 10.6719 10.5781 10.5781C10.6719 10.4844 10.7188 10.375 10.7188 10.25C10.7188 10.125 10.6719 10.0156 10.5781 9.92188C10.4844 9.82812 10.375 9.78125 10.25 9.78125C10.125 9.78125 10.0156 9.82812 9.92188 9.92188C9.82812 10.0156 9.78125 10.125 9.78125 10.25C9.78125 10.375 9.82812 10.4844 9.92188 10.5781C10.0156 10.6719 10.125 10.7188 10.25 10.7188ZM11.9688 10.7188C12.0938 10.7188 12.2031 10.6719 12.2969 10.5781C12.3906 10.4844 12.4375 10.375 12.4375 10.25C12.4375 10.125 12.3906 10.0156 12.2969 9.92188C12.2031 9.82812 12.0938 9.78125 11.9688 9.78125C11.8438 9.78125 11.7344 9.82812 11.6406 9.92188C11.5469 10.0156 11.5 10.125 11.5 10.25C11.5 10.375 11.5469 10.4844 11.6406 10.5781C11.7344 10.6719 11.8438 10.7188 11.9688 10.7188ZM2.125 12.125C1.78125 12.125 1.48698 12.0026 1.24219 11.7578C0.997396 11.513 0.875 11.2188 0.875 10.875V2.125C0.875 1.78125 0.997396 1.48698 1.24219 1.24219C1.48698 0.997396 1.78125 0.875 2.125 0.875H10.875C11.2188 0.875 11.513 0.997396 11.7578 1.24219C12.0026 1.48698 12.125 1.78125 12.125 2.125V6.3125C11.9271 6.21875 11.724 6.13802 11.5156 6.07031C11.3073 6.0026 11.0938 5.95312 10.875 5.92188V2.125H2.125V10.875H5.90625C5.9375 11.1042 5.98698 11.3229 6.05469 11.5312C6.1224 11.7396 6.20312 11.9375 6.29688 12.125H2.125ZM2.125 10.25V10.875V2.125V5.92188V5.875V10.25ZM3.375 9.625H5.92188C5.95312 9.40625 6.0026 9.19271 6.07031 8.98438C6.13802 8.77604 6.21354 8.57292 6.29688 8.375H3.375V9.625ZM3.375 7.125H7.1875C7.52083 6.8125 7.89323 6.55208 8.30469 6.34375C8.71615 6.13542 9.15625 5.99479 9.625 5.92188V5.875H3.375V7.125ZM3.375 4.625H9.625V3.375H3.375V4.625ZM10.25 13.375C9.38542 13.375 8.64844 13.0703 8.03906 12.4609C7.42969 11.8516 7.125 11.1146 7.125 10.25C7.125 9.38542 7.42969 8.64844 8.03906 8.03906C8.64844 7.42969 9.38542 7.125 10.25 7.125C11.1146 7.125 11.8516 7.42969 12.4609 8.03906C13.0703 8.64844 13.375 9.38542 13.375 10.25C13.375 11.1146 13.0703 11.8516 12.4609 12.4609C11.8516 13.0703 11.1146 13.375 10.25 13.375Z" />
                    </svg>
                  </span>

                  <span>SQL Query</span>
                </button>
              </div>

              {showAddDashboard && (
                <DashboardDropdown
                  eventId={event.id}
                  messageId={event.messageId}
                />
              )}
            </div>

            <div className="sm:hidden">
              <SelectOption options={options} onSelect={handleSelect} />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {currentTab === "table" && (
              <div className="flex flex-col w-full overflow-x-auto rounded-md recent__bar">
                <table className="w-full min-w-full text-sm border-x border-b divide-y-2 rounded-md divide-[#393E49] bg-[#1B1D1F] border-[#393E49]">
                  <thead className="ltr:text-left rtl:text-right bg-[#30333C]">
                    <tr>{tableHeaders}</tr>
                  </thead>

                  {totalItems > 0 && (
                    <tbody className="divide-y divide-[#393E49]">{rows}</tbody>
                  )}
                </table>

                {totalItems > 0 || (
                  <div className="flex items-center justify-center w-full h-48 rounded-br-md rounded-bl-md bg-background">
                    <div className="flex flex-col items-center justify-center w-full space-y-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-bordeborder-border">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 text-[#E4C063]"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      <span className="text-sm font-normal tracking-wide text-white">
                        No data generated
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentTab === "chart" && (
              <div className="w-full">
                <CommonChart data={data} />
              </div>
            )}

            {currentTab === "sql_cmd" && <CodeHighlighter data={event.sql} />}
          </div>
        </div>
      </div>

      {/* {currentTab === "table" && event?.is_data_too_large && (
        <div className="flex items-center justify-center pt-4 pb-2">
          <button
            className="flex items-center justify-center px-4 py-2 space-x-2 text-xs font-medium tracking-wide text-white rounded-md cursor-pointer bg-[#30333C]"
            onClick={() => handleShowMore()}
          >
            {isLoading && (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5 animate-spin text-[#383A40] fill-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>

                <span className="sr-only">Loading...</span>
              </div>
            )}

            <span>See more</span>
          </button>
        </div>
      )} */}

      {currentTab === "table" && event?.is_data_too_large && (
        <div className="flex flex-col py-2 space-y-1 text-xs font-normal">
          <span className="text-white">Incomplete data is displayed.</span>
          <div className="flex items-center space-x-1 text-white/40">
            {isLoading && (
              <div role="status" className="mr-0.5">
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5 animate-spin text-[#383A40] fill-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>

                <span className="sr-only">Loading...</span>
              </div>
            )}
            <span
              className="mr-0.5 font-medium cursor-pointer text-secondary hover:underline"
              onClick={() => handleShowMore()}
            >
              See More
            </span>{" "}
            <span>to view the full dataset.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableCard;
