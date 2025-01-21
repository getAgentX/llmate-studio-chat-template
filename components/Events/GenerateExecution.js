import React, { useState, useEffect } from "react";
import TableModal from "../Modal/TableModal";
import CodeHighlighter from "../common/CodeHighlighter";
import CommonChart from "../common/CommonChart";
import AssistantGraphMenu from "../Dashboard/AssistantGraphMenu";
import PivotGraph from "../Dashboard/PivotGraph";
import PivotGraphTable from "../Dashboard/PivotGraphTable";
import SqlCommandMenu from "../Dashboard/SqlCommandMenu";

const GenerateExecution = ({
  event,
  validation = {},
  messageId,
  streaming,
  handleAddWidgetFromEvent = null,
}) => {
  const [currentTab, setCurrentTab] = useState("table");
  const [showTable, setShowTable] = useState(false);
  const [dataframe, setDataframe] = useState({});
  const [showGraphChange, setShowGraphChange] = useState(false);
  const [showSqlCommand, setShowSqlCommand] = useState(false);
  const [chartType, setChartType] = useState(
    event?.data_visualization_config?.graph_type
  );
  const [visualizationInfo, setVisualizationInfo] = useState(
    event?.data_visualization_config
  );

  const downloadCSV = (data) => {
    if (!data) {
      console.error("No data available to download.");
      return;
    }

    const headers = Object.keys(data);

    const numRows = data[headers[0]]?.length || 0;

    const csvRows = [];
    csvRows.push(headers.join(","));

    for (let i = 0; i < numRows; i++) {
      const row = headers.map((header) => {
        const value = data[header][i];
        return value !== undefined && value !== null ? value : "";
      });
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvDownload = async () => {
    try {
      const response = await fetch("/api/refreshAssistantGraph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: messageId,
          event_id: event.id,
          skip: 0,
          limit: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh graph: ${response.status}`);
      }

      const jsonData = await response.json();

      if (jsonData && jsonData.dataframe) {
        downloadCSV(jsonData.dataframe);
      }
    } catch (err) {
      console.error("Error during CSV download:", err);
    }
  };

  useEffect(() => {
    if (event.dataframe) {
      setDataframe(event.dataframe);
    } else {
      setDataframe({});
    }
  }, []);

  const totalItems = dataframe[Object.keys(dataframe)[0]]?.length;

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const tableHeaders = Object.keys(dataframe).map((key, index) => (
    <th
      key={index}
      className={`text-left px-3 text-xs h-7 font-normal overlay border border-border-color text-secondary-text whitespace-nowrap outline-color ${
        index === 0 ? "sticky top-0 left-0 " : "top-0"
      }`}
    >
      {formatKey(key)}
    </th>
  ));

  const rows = (() => {
    const totalItems = dataframe[Object.keys(dataframe)[0]]?.length;

    return Array.from({ length: totalItems }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        {Object.keys(dataframe).map((key, colIndex) => (
          <td
            key={`${rowIndex}-${colIndex}`} // Update key to be unique per cell
            className="px-3 text-xs text-left border h-7 border-border-color outline-color text-primary-text whitespace-nowrap"
          >
            {dataframe[key][rowIndex] ?? "N/A"}
          </td>
        ))}
      </tr>
    ));
  })();

  return (
    <div className="w-full font-roboto">
      {/* overflow-x-auto */}
      <div className="flex flex-col w-full">
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-3 rounded-b-lg">
            <div className="flex-wrap items-center hidden w-full gap-3 sm:flex max-w-fit">
              <button
                className={`text-xs h-9 font-medium border-b-2 flex group justify-center items-center space-x-1 tracking-wider  ${
                  currentTab === "table"
                    ? "text-tabs-active border-tabs-active"
                    : "text-tabs-text hover:text-tabs-hover border-transparent"
                }`}
                onClick={() => setCurrentTab("table")}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-3.5 h-3.5 ${
                    currentTab === "table"
                      ? "fill-tabs-active"
                      : "fill-tabs-icon group-hover:fill-tabs-hover"
                  }`}
                >
                  <path d="M3.33724 14C2.97057 14 2.65668 13.8694 2.39557 13.6083C2.13446 13.3472 2.00391 13.0333 2.00391 12.6667V3.33333C2.00391 2.96667 2.13446 2.65278 2.39557 2.39167C2.65668 2.13056 2.97057 2 3.33724 2H12.6706C13.0372 2 13.3511 2.13056 13.6122 2.39167C13.8734 2.65278 14.0039 2.96667 14.0039 3.33333V12.6667C14.0039 13.0333 13.8734 13.3472 13.6122 13.6083C13.3511 13.8694 13.0372 14 12.6706 14H3.33724ZM7.33724 10H3.33724V12.6667H7.33724V10ZM8.67057 10V12.6667H12.6706V10H8.67057ZM7.33724 8.66667V6H3.33724V8.66667H7.33724ZM8.67057 8.66667H12.6706V6H8.67057V8.66667ZM3.33724 4.66667H12.6706V3.33333H3.33724V4.66667Z" />
                </svg>

                <span>Table</span>
              </button>

              <button
                className={`text-xs h-9 font-medium border-b-2 flex group justify-center items-center space-x-1 tracking-wider  ${
                  currentTab === "chart"
                    ? "text-tabs-active border-tabs-active"
                    : "text-tabs-text hover:text-tabs-hover border-transparent"
                }`}
                onClick={() => setCurrentTab("chart")}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-3.5 h-3.5 ${
                    currentTab === "chart"
                      ? "fill-tabs-active"
                      : "fill-tabs-icon group-hover:fill-tabs-hover"
                  }`}
                >
                  <path d="M2 14V12.6667L3.33333 11.3333V14H2ZM4.66667 14V10L6 8.66667V14H4.66667ZM7.33333 14V8.66667L8.66667 10.0167V14H7.33333ZM10 14V10.0167L11.3333 8.68333V14H10ZM12.6667 14V7.33333L14 6V14H12.6667ZM2 10.55V8.66667L6.66667 4L9.33333 6.66667L14 2V3.88333L9.33333 8.55L6.66667 5.88333L2 10.55Z" />
                </svg>

                <span>Graph</span>
              </button>
            </div>

            <div className="flex-wrap items-center hidden gap-3 w-full sm:flex max-w-fit">
              {!handleAddWidgetFromEvent && (
                <button
                  className="flex items-center cursor-pointer justify-center w-full h-7 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                  onClick={() => setShowGraphChange(true)}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.4 fill-btn-primary-outline-icon "
                  >
                    <path d="M4.66667 11.3333H6V6.66667H4.66667V11.3333ZM7.33333 11.3333H8.66667V4.66667H7.33333V11.3333ZM10 11.3333H11.3333V8.66667H10V11.3333ZM3.33333 14C2.96667 14 2.65278 13.8694 2.39167 13.6083C2.13056 13.3472 2 13.0333 2 12.6667V3.33333C2 2.96667 2.13056 2.65278 2.39167 2.39167C2.65278 2.13056 2.96667 2 3.33333 2H12.6667C13.0333 2 13.3472 2.13056 13.6083 2.39167C13.8694 2.65278 14 2.96667 14 3.33333V12.6667C14 13.0333 13.8694 13.3472 13.6083 13.6083C13.3472 13.8694 13.0333 14 12.6667 14H3.33333ZM3.33333 12.6667H12.6667V3.33333H3.33333V12.6667Z" />
                  </svg>

                  <span>Change graph type</span>
                </button>
              )}

              {!handleAddWidgetFromEvent && (
                <button
                  className="flex items-center cursor-pointer justify-center w-full h-7 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                  onClick={handleCsvDownload}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.4 fill-btn-primary-outline-icon "
                  >
                    <path d="M8.0013 10.6665L4.66797 7.33317L5.6013 6.3665L7.33464 8.09984V2.6665H8.66797V8.09984L10.4013 6.3665L11.3346 7.33317L8.0013 10.6665ZM4.0013 13.3332C3.63464 13.3332 3.32075 13.2026 3.05964 12.9415C2.79852 12.6804 2.66797 12.3665 2.66797 11.9998V9.99984H4.0013V11.9998H12.0013V9.99984H13.3346V11.9998C13.3346 12.3665 13.2041 12.6804 12.943 12.9415C12.6819 13.2026 12.368 13.3332 12.0013 13.3332H4.0013Z" />
                  </svg>

                  <span>CSV</span>
                </button>
              )}
            </div>
          </div>

          <div className="h-[337px] w-full overflow-y-auto recent__bar">
            {currentTab === "table" && (
              <div className="flex flex-col w-full h-full">
                {currentTab === "table" && !streaming && (
                  <PivotGraphTable
                    name="assistant"
                    payload={{
                      message_id: messageId,
                      event_id: event.id,
                    }}
                  />
                )}

                {currentTab === "table" && streaming && (
                  <div className="flex flex-col w-full h-full overflow-x-auto recent__bar">
                    <table className="w-full min-w-full text-xs border-b divide-y-2 divide-border-color">
                      <thead className="sticky top-0 rounded-t-lg ltr:text-left rtl:text-right bg-primary">
                        <tr>{tableHeaders}</tr>
                      </thead>

                      {totalItems > 0 && (
                        <tbody className="pb-10 divide-y divide-border-color bg-primary outline-color">
                          {rows}
                        </tbody>
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

                          <span className="text-sm font-normal tracking-wide text-primary-text">
                            No data generated
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentTab === "chart" && !streaming && (
              <div className="w-full h-full">
                <PivotGraph
                  name="assistant"
                  payload={{
                    message_id: messageId,
                    event_id: event.id,
                  }}
                  config={visualizationInfo}
                />
              </div>
            )}

            {currentTab === "chart" && streaming && (
              <div className="w-full h-full border-t border-border-color">
                <CommonChart data={dataframe} />
              </div>
            )}

            {currentTab === "sql_cmd" && (
              <div className="w-full h-full border-t border-border-color">
                <CodeHighlighter data={event.sql} />
              </div>
            )}

            {Object.keys(validation).length > 0 &&
              currentTab === "sql_summary" && (
                <div className="w-full mx-auto h-[337px] overflow-y-auto recent__bar text-primary-text">
                  <div className="flex flex-col px-3 py-4 space-y-4 border-t border-border-color">
                    {validation.steps_followed.length > 0 && (
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-col w-full rounded-md min-h-32">
                          <div className="flex flex-col overflow-hidden text-sm leading-6">
                            <ul className="flex flex-col pl-4 space-y-2">
                              {validation.steps_followed.map((item, index) => {
                                return (
                                  <li
                                    key={index}
                                    className="list-disc list-outside"
                                  >
                                    {item}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* {validation.errors_in_sql.length > 0 && (
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-col space-y-2">
                          <p className="text-xs font-medium tracking-wider text-primary-text">
                            Errors
                          </p>
                          <p className="text-xs font-normal tracking-wider text-secondary-text">
                            List of encountered errors during SQL execution.
                          </p>
                        </div>

                        <div className="flex flex-col w-full space-y-4 border rounded-md min-h-32 border-border-color">
                          <div className="flex flex-col p-4 overflow-hidden text-sm leading-6">
                            <ul className="flex flex-col space-y-2">
                              {validation.errors_in_sql.map((item, index) => {
                                return (
                                  <li
                                    key={index}
                                    className="flex items-center space-x-2"
                                  >
                                    <span className="flex items-center justify-center">
                                      <svg
                                        viewBox="0 0 13 13"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4 fill-icon-color"
                                      >
                                        <path d="M6.5 9.625C6.67708 9.625 6.82552 9.5651 6.94531 9.44531C7.0651 9.32552 7.125 9.17708 7.125 9C7.125 8.82292 7.0651 8.67448 6.94531 8.55469C6.82552 8.4349 6.67708 8.375 6.5 8.375C6.32292 8.375 6.17448 8.4349 6.05469 8.55469C5.9349 8.67448 5.875 8.82292 5.875 9C5.875 9.17708 5.9349 9.32552 6.05469 9.44531C6.17448 9.5651 6.32292 9.625 6.5 9.625ZM5.875 7.125H7.125V3.375H5.875V7.125ZM6.5 12.75C5.63542 12.75 4.82292 12.5859 4.0625 12.2578C3.30208 11.9297 2.64062 11.4844 2.07812 10.9219C1.51562 10.3594 1.07031 9.69792 0.742188 8.9375C0.414062 8.17708 0.25 7.36458 0.25 6.5C0.25 5.63542 0.414062 4.82292 0.742188 4.0625C1.07031 3.30208 1.51562 2.64062 2.07812 2.07812C2.64062 1.51562 3.30208 1.07031 4.0625 0.742188C4.82292 0.414062 5.63542 0.25 6.5 0.25C7.36458 0.25 8.17708 0.414062 8.9375 0.742188C9.69792 1.07031 10.3594 1.51562 10.9219 2.07812C11.4844 2.64062 11.9297 3.30208 12.2578 4.0625C12.5859 4.82292 12.75 5.63542 12.75 6.5C12.75 7.36458 12.5859 8.17708 12.2578 8.9375C11.9297 9.69792 11.4844 10.3594 10.9219 10.9219C10.3594 11.4844 9.69792 11.9297 8.9375 12.2578C8.17708 12.5859 7.36458 12.75 6.5 12.75ZM6.5 11.5C7.89583 11.5 9.07812 11.0156 10.0469 10.0469C11.0156 9.07812 11.5 7.89583 11.5 6.5C11.5 5.10417 11.0156 3.92188 10.0469 2.95312C9.07812 1.98438 7.89583 1.5 6.5 1.5C5.10417 1.5 3.92188 1.98438 2.95312 2.95312C1.98438 3.92188 1.5 5.10417 1.5 6.5C1.5 7.89583 1.98438 9.07812 2.95312 10.0469C3.92188 11.0156 5.10417 11.5 6.5 11.5Z" />
                                      </svg>
                                    </span>

                                    <span>{item}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              )}
          </div>
        </div>

        <TableModal
          show={showTable}
          setShow={setShowTable}
          data={dataframe}
          event={event}
          messageId={messageId}
        />
      </div>

      {showGraphChange && (
        <AssistantGraphMenu
          show={showGraphChange}
          setShow={setShowGraphChange}
          dataField={dataframe}
          event={event}
          messageId={messageId}
          setChartType={setChartType}
          visualizationInfo={visualizationInfo}
          setVisualizationInfo={setVisualizationInfo}
        />
      )}

      {showSqlCommand && (
        <SqlCommandMenu
          show={showSqlCommand}
          setShow={setShowSqlCommand}
          data={event?.sql}
        />
      )}
    </div>
  );
};

export default GenerateExecution;
