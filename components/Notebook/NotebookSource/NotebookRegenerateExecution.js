import React, { useEffect, useState } from "react";
import TableModal from "@/components/Modal/TableModal";
import { useRefreshAssistantGraphEventMutation } from "@/store/assistant";
import SqlErrorModal from "@/components/Modal/SqlErrorModal";
import CodeHighlighter from "@/components/common/CodeHighlighter";
import DashboardDropdown from "@/components/common/DashboardDropdown";
import NotebookAssistantGraphMenu from "@/components/Dashboard/NotebookAssistantGraphMenu";
import CommonChart from "@/components/common/CommonChart";
import PivotGraph from "@/components/Dashboard/PivotGraph";
import PivotGraphTable from "@/components/Dashboard/PivotGraphTable";

const NotebookRegenerateExecution = ({
  event,
  showAddDashboard,
  validation = {},
  messageId,
  handleAssistantAccept,
  isLoadingActive,
  streaming,
}) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const [currentTab, setCurrentTab] = useState("output");
  const [seeMoreTable, setSeeMoreTable] = useState({});
  const [showTable, setShowTable] = useState(false);
  const [showSqlError, setShowSqlError] = useState(false);
  const [currentDataframe, setCurrentDataframe] = useState("table");
  const [toggleDataframe, setToggleDataframe] = useState(false);
  const [dataframe, setDataframe] = useState({});
  const [visualizationConfig, setvisualizationConfig] = useState(
    event?.data_visualization_config || {}
  );

  const [showGraphChange, setShowGraphChange] = useState(false);
  const [chartType, setChartType] = useState("bar");

  const [refreshAssistantGraphEvent, { isLoading }] =
    useRefreshAssistantGraphEventMutation();

  useEffect(() => {
    if (event.dataframe) {
      setDataframe(event.dataframe);
    } else {
      setDataframe({});
    }
  }, []);

  const handleShowMore = () => {
    let eventId = event?.id;

    if (eventId) {
      refreshAssistantGraphEvent({
        message_id: messageId,
        event_id: eventId,
      }).then((response) => {
        if (response) {
          if (response.data) {
            setSeeMoreTable(response.data.dataframe);
            setShowTable(true);
          }
        }
      });
    }
  };

  const totalItems = dataframe[Object.keys(dataframe)[0]]?.length;

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const tableHeaders = Object.keys(dataframe).map((key, index) => (
    <th
      key={index}
      className="px-4 py-2 text-xs font-normal tracking-wide text-white border-t border-l border-r border-[#222222] whitespace-nowrap"
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
            className="px-4 py-2 text-xs tracking-wide border-r border-[#222222] text-white/40 whitespace-nowrap"
          >
            {dataframe[key][rowIndex] ?? "N/A"}
          </td>
        ))}
      </tr>
    ));
  })();

  const handleDataframeChange = (e) => {
    if (e.target.checked) {
      setCurrentDataframe("chart");
    } else {
      setCurrentDataframe("table");
    }

    setToggleDataframe(e.target.checked);
  };

  if (event?.error_message) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex flex-col border border-[#242424] rounded-md">
          <div className="flex items-center px-4 py-3 space-x-2 cursor-pointer">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium tracking-wide text-white capitalize xsm:text-sm">
                SQL Re-Generation <span className="text-white/25">:</span>
              </p>

              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                  >
                    <circle cx="8" cy="8" r="6" fill="white" />
                    <path
                      d="M8 12C8.22667 12 8.41667 11.9233 8.57 11.77C8.72333 11.6167 8.8 11.4267 8.8 11.2C8.8 10.9733 8.72333 10.7833 8.57 10.63C8.41667 10.4767 8.22667 10.4 8 10.4C7.77333 10.4 7.58333 10.4767 7.43 10.63C7.27667 10.7833 7.2 10.9733 7.2 11.2C7.2 11.4267 7.27667 11.6167 7.43 11.77C7.58333 11.9233 7.77333 12 8 12ZM7.2 8.8H8.8V4H7.2V8.8ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                      fill="#C22828"
                    />
                  </svg>
                </span>

                <p className="text-sm font-medium tracking-wide text-[#C22828] capitalize xsm:text-sm space-x-2">
                  <span>Failed</span>

                  <span
                    className="text-xs underline text-white/25 hover:text-white"
                    onClick={() => setShowSqlError(true)}
                  >
                    Click here to see the error
                  </span>
                </p>
              </div>
            </div>
          </div>

          <SqlErrorModal
            showSqlError={showSqlError}
            setShowSqlError={setShowSqlError}
            data={[event.error_message]}
          />
        </div>

        {/* <div className="h-8 w-0.5 bg-[#242424] mt-2 ml-8"></div> */}
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-[#242424] rounded-md w-full">
      <div
        className={`flex items-center justify-between px-4 py-3 space-x-2 cursor-pointer ${
          toggleDropdown ? "border-b border-[#242424]" : ""
        }`}
      >
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium tracking-wider capitalize text-white/25 xsm:text-sm">
            2nd Attempt:
          </p>

          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
              >
                <circle cx="8" cy="8" r="6" fill="white" />
                <path
                  d="M6.88 11.68L12.52 6.04L11.4 4.92L6.88 9.44L4.6 7.16L3.48 8.28L6.88 11.68ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                  fill="#24A631"
                />
              </svg>
            </span>

            <span className="text-[#24A631] tracking-wider font-medium text-sm">
              Success
            </span>
          </div>
        </div>

        {isLoadingActive || (
          <span
            className="flex items-center justify-center cursor-pointer"
            data-tooltip-id="tooltip"
            data-tooltip-content="Add Response to Notebook Interface"
            data-tooltip-place="top"
            onClick={() =>
              handleAssistantAccept({
                message_id: event.messageId,
                event_id: event.id,
                data_visualization_config: visualizationConfig,
              })
            }
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
            >
              <path
                d="M5.16602 6.83463H0.166016V5.16797H5.16602V0.167969H6.83268V5.16797H11.8327V6.83463H6.83268V11.8346H5.16602V6.83463Z"
                fill="#295EF4"
              />
            </svg>
          </span>
        )}
      </div>

      {toggleDropdown && (
        <div className="flex flex-col px-4 pb-4 space-y-4">
          <div className="flex items-center justify-between pt-2 border-b border-border">
            <div className="flex-wrap items-center hidden w-full pt-2 space-x-4 sm:flex max-w-fit">
              <button
                className={`text-xs pb-3 border-b-2 font-medium flex justify-center items-center space-x-2 tracking-wider capitalize transition-colors duration-300 ${
                  currentTab === "output"
                    ? "text-accent border-secondary"
                    : "text-white/50 border-transparent"
                }`}
                onClick={() => setCurrentTab("output")}
              >
                <span>Output</span>
              </button>

              <button
                className={`text-xs pb-3 border-b-2 font-medium flex justify-center items-center space-x-2 tracking-wider capitalize transition-colors duration-300 ${
                  currentTab === "sql_cmd"
                    ? "text-accent border-secondary"
                    : "text-white/50 border-transparent"
                }`}
                onClick={() => setCurrentTab("sql_cmd")}
              >
                <span>SQL Code</span>
              </button>

              {Object.keys(validation).length > 0 && (
                <button
                  className={`text-xs pb-3 border-b-2 font-medium flex justify-center items-center space-x-2 tracking-wider capitalize transition-colors duration-300 ${
                    currentTab === "summary"
                      ? "text-accent border-secondary"
                      : "text-white/50 border-transparent"
                  }`}
                  onClick={() => setCurrentTab("summary")}
                >
                  <span>SQL Summary</span>
                </button>
              )}
            </div>
          </div>

          {/* {currentTab === "output" && (
            <TableCard
              event={event}
              data={event.dataframe || {}}
              showAddDashboard={showAddDashboard}
              handleShowMore={handleShowMore}
              isLoading={isLoading}
            />
          )} */}

          {currentTab === "output" && (
            <div className="flex flex-col w-full space-y-4">
              {Object.keys(event.dataframe).length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span
                      className={`text-sm font-medium ${
                        currentDataframe === "table"
                          ? "text-white"
                          : "text-white/50"
                      }`}
                    >
                      Table
                    </span>

                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={toggleDataframe}
                        value={toggleDataframe}
                        className="sr-only peer"
                        onChange={(e) => handleDataframeChange(e)}
                      />
                      <div className="relative w-11 h-6 bg-[#212327] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[#295EF4] after:border-[#295EF4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#212327]"></div>
                    </label>

                    <span
                      className={`text-sm font-medium ${
                        currentDataframe === "chart"
                          ? "text-white"
                          : "text-white/50"
                      }`}
                    >
                      Chart
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {currentDataframe === "chart" && !streaming && (
                      <a
                        className="text-sm font-normal underline cursor-pointer text-secondary hover:text-white"
                        onClick={() => setShowGraphChange(true)}
                      >
                        Change graph type
                      </a>
                    )}

                    {showAddDashboard && currentDataframe === "table" && (
                      <DashboardDropdown
                        eventId={event.id}
                        messageId={event.messageId}
                      />
                    )}
                  </div>
                </div>
              )}

              {currentDataframe === "table" && !streaming && (
                <div className="relative w-full h-full group">
                  <PivotGraphTable
                    name="assistant"
                    payload={{
                      message_id: messageId,
                      event_id: event.id,
                    }}
                  />
                </div>
              )}

              {currentDataframe === "table" && streaming && (
                <div className="flex flex-col w-full overflow-x-auto recent__bar">
                  <table className="w-full min-w-full text-sm border-x border-b divide-y-2 rounded-md divide-[#222222] border-[#222222]">
                    <thead className="ltr:text-left rtl:text-right">
                      <tr>{tableHeaders}</tr>
                    </thead>

                    {totalItems > 0 && (
                      <tbody className="divide-y divide-[#222222]">
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

                        <span className="text-sm font-normal tracking-wide text-white">
                          No data generated
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentDataframe === "chart" && !streaming && (
                <div className="w-full h-96">
                  <PivotGraph
                    name="assistant"
                    payload={{
                      message_id: messageId,
                      event_id: event.id,
                    }}
                    config={visualizationConfig}
                  />
                </div>
              )}

              {currentDataframe === "chart" && streaming && (
                <div className="w-full h-96">
                  <CommonChart data={dataframe} />
                </div>
              )}

              {/* {currentDataframe === "table" && event?.is_data_too_large && (
                <div className="flex flex-col py-2 space-y-1 text-xs font-normal">
                  <span className="text-white">
                    Incomplete data is displayed.
                  </span>
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
              )} */}
            </div>
          )}

          {currentTab === "sql_cmd" && <CodeHighlighter data={event.sql} />}

          {Object.keys(validation).length > 0 && currentTab === "summary" && (
            <div className="w-full mx-auto text-white">
              <div className="flex flex-col space-y-4">
                {validation.steps_followed.length > 0 && (
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-col space-y-2">
                      <p className="text-xs font-medium tracking-wider text-white">
                        Steps followed to generate SQL
                      </p>
                      <p className="text-xs font-normal tracking-wider text-white/50">
                        The SQL will be generated based on these steps.
                      </p>
                    </div>

                    <div className="flex flex-col w-full min-h-32 rounded-md border border-[#222222]">
                      <div className="flex flex-col p-4 overflow-hidden text-sm leading-6">
                        <ul className="flex flex-col space-y-2">
                          {validation.steps_followed.map((item, index) => {
                            return (
                              <li key={index} className="list-disc list-inside">
                                {item}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {validation.errors_in_sql.length > 0 && (
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-col space-y-2">
                      <p className="text-xs font-medium tracking-wider text-white">
                        Errors
                      </p>
                      <p className="text-xs font-normal tracking-wider text-white/50">
                        List of encountered errors during SQL execution.
                      </p>
                    </div>

                    <div className="flex flex-col w-full space-y-4 min-h-32 rounded-md border border-[#222222]">
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
                                    className="w-4 h-4 fill-[#95979B]"
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
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <TableModal show={showTable} setShow={setShowTable} data={seeMoreTable} />

      {showGraphChange && (
        <NotebookAssistantGraphMenu
          show={showGraphChange}
          setShow={setShowGraphChange}
          dataField={dataframe}
          event={event}
          messageId={messageId}
          setChartType={setChartType}
          setvisualizationConfig={setvisualizationConfig}
        />
      )}
    </div>
  );
};

export default NotebookRegenerateExecution;
