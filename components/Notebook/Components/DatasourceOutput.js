import React, { useState, useEffect } from "react";
import {
  useGetDatasourceRunMutation,
  useRefreshDatasourceGraphEventMutation,
} from "@/store/datasource";
import TableModal from "@/components/Modal/TableModal";
import NotebookDatasourceGraphMenu from "@/components/Dashboard/NotebookDatasourceGraphMenu";
import PivotGraph from "@/components/Dashboard/PivotGraph";
import PivotGraphTable from "@/components/Dashboard/PivotGraphTable";
import { useNotebookDatasourceContext } from "@/context/NotebookDatasourceContext";
import { TableIcon } from "@/components/Icons/icon";

const DatasourceOutput = ({
  event_id,
  datasource_id,
  datasource_run_id,
  data_visualization_config,
  sql_cmd,
  block_id,
  handleConfig,
}) => {
  const [currentDataframe, setCurrentDataframe] = useState("table");
  const [tableData, setTableData] = useState({});
  const [loading, setLoading] = useState(false);
  const [graphEvent, setGraphEvent] = useState(false);
  const [seeMoreTable, setSeeMoreTable] = useState({});
  const [showTable, setShowTable] = useState(false);
  const [showGraphChange, setShowGraphChange] = useState(false);
  const [visualizationInfo, setVisualizationInfo] = useState({});

  const { setSqlCmd, setShowNotebookSqlCmd, setBlockId, setdDatasoureId } =
    useNotebookDatasourceContext();

  const [getDatasourceRun, { error: getDatasourceRunError }] =
    useGetDatasourceRunMutation();
  const [refreshDatasourceGraphEvent, { isLoading }] =
    useRefreshDatasourceGraphEventMutation();

  useEffect(() => {
    setLoading(true);

    if (datasource_id && datasource_run_id) {
      getDatasourceRun({
        datasource_id: datasource_id,
        run_id: datasource_run_id,
      }).then((response) => {
        if (response.data) {
          const events = Object.values(response.data.events);

          const filterEvents = events.filter((item) =>
            item.hasOwnProperty("dataframe")
          );

          if (filterEvents && filterEvents.length > 0) {
            for (let i = 0; i < filterEvents.length; i++) {
              const event = filterEvents[i];

              if (
                event.event_type === "sql_datasource_sql_execution" &&
                event.sql_source === "SQLDatasourceSQLGeneration"
              ) {
                setGraphEvent(event);
                if (event.dataframe) {
                  setTableData(event.dataframe);
                  setLoading(false);
                } else {
                  setTableData({});
                }

                setVisualizationInfo(event?.data_visualization_config);
              }

              if (
                event.event_type === "sql_datasource_sql_execution" &&
                event.sql_source === "SQLDatasourceSQLRegenerate"
              ) {
                setGraphEvent(event);
                if (event.dataframe) {
                  setTableData(event.dataframe);
                  setLoading(false);
                } else {
                  setTableData({});
                }

                setVisualizationInfo(event?.data_visualization_config);
              }
            }
          }
        } else {
          setLoading(false);
        }
      });
    }
  }, []);

  return (
    <div className="w-full font-roboto">
      {loading === false ? (
        <div className="px-2 pb-2 mb-2 border rounded-md bg-secondary-bg border-border-color">
          <div className="flex flex-col w-full space-y-2">
            {Object.keys(tableData)?.length > 0 && (
              <div className="flex items-center justify-between border-b border-border-color">
                <div className="flex-wrap items-center hidden w-full pt-1 sm:flex max-w-fit">
                  <span
                    className={`flex items-center justify-center rounded-full cursor-pointer w-7 h-7 hover:bg-active-bg ${
                      currentDataframe === "table"
                        ? "bg-active-bg"
                        : "bg-transparent"
                    }`}
                    onClick={() => setCurrentDataframe("table")}
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Table"
                    data-tooltip-place="bottom"
                  >
                    <TableIcon size={4} />
                  </span>

                  <span
                    className={`flex items-center justify-center rounded-full cursor-pointer w-7 h-7 hover:bg-active-bg ml-2 ${
                      currentDataframe === "chart"
                        ? "bg-active-bg"
                        : "bg-transparent"
                    }`}
                    onClick={() => setCurrentDataframe("chart")}
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Chart"
                    data-tooltip-place="bottom"
                  >
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-3 h-3 ${
                        currentDataframe === "chart"
                          ? "fill-active-icon"
                          : "fill-icon-color"
                      }`}
                    >
                      <path d="M0 12V10.6667L1.33333 9.33333V12H0ZM2.66667 12V8L4 6.66667V12H2.66667ZM5.33333 12V6.66667L6.66667 8.01667V12H5.33333ZM8 12V8.01667L9.33333 6.68333V12H8ZM10.6667 12V5.33333L12 4V12H10.6667ZM0 8.55V6.66667L4.66667 2L7.33333 4.66667L12 0V1.88333L7.33333 6.55L4.66667 3.88333L0 8.55Z" />
                    </svg>
                  </span>

                  <span
                    className="flex items-center justify-center ml-2 bg-transparent rounded-full cursor-pointer w-7 h-7 hover:bg-active-bg"
                    onClick={() => {
                      setdDatasoureId(datasource_id);
                      setBlockId(block_id);
                      setSqlCmd(sql_cmd);
                      setShowNotebookSqlCmd(true);
                    }}
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sql"
                    data-tooltip-place="bottom"
                  >
                    <svg
                      viewBox="0 0 12 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-3 h-3 ${
                        currentDataframe === "sql"
                          ? "fill-active-icon"
                          : "fill-icon-color"
                      }`}
                    >
                      <path d="M4.4 10.3998L5.33333 9.43317L3.9 7.99984L5.33333 6.5665L4.4 5.59984L2 7.99984L4.4 10.3998ZM7.6 10.3998L10 7.99984L7.6 5.59984L6.66667 6.5665L8.1 7.99984L6.66667 9.43317L7.6 10.3998ZM1.33333 13.9998C0.966667 13.9998 0.652778 13.8693 0.391667 13.6082C0.130556 13.3471 0 13.0332 0 12.6665V3.33317C0 2.9665 0.130556 2.65261 0.391667 2.3915C0.652778 2.13039 0.966667 1.99984 1.33333 1.99984H4.13333C4.27778 1.59984 4.51944 1.27762 4.85833 1.03317C5.19722 0.788726 5.57778 0.666504 6 0.666504C6.42222 0.666504 6.80278 0.788726 7.14167 1.03317C7.48056 1.27762 7.72222 1.59984 7.86667 1.99984H10.6667C11.0333 1.99984 11.3472 2.13039 11.6083 2.3915C11.8694 2.65261 12 2.9665 12 3.33317V12.6665C12 13.0332 11.8694 13.3471 11.6083 13.6082C11.3472 13.8693 11.0333 13.9998 10.6667 13.9998H1.33333ZM1.33333 12.6665H10.6667V3.33317H1.33333V12.6665ZM6 2.83317C6.14444 2.83317 6.26389 2.78595 6.35833 2.6915C6.45278 2.59706 6.5 2.47761 6.5 2.33317C6.5 2.18873 6.45278 2.06928 6.35833 1.97484C6.26389 1.88039 6.14444 1.83317 6 1.83317C5.85556 1.83317 5.73611 1.88039 5.64167 1.97484C5.54722 2.06928 5.5 2.18873 5.5 2.33317C5.5 2.47761 5.54722 2.59706 5.64167 2.6915C5.73611 2.78595 5.85556 2.83317 6 2.83317Z" />
                    </svg>
                  </span>
                </div>

                {currentDataframe === "chart" && (
                  <a
                    className="text-sm font-normal underline cursor-pointer text-secondary hover:text-primary-text"
                    onClick={() => setShowGraphChange(true)}
                  >
                    Change graph type
                  </a>
                )}
              </div>
            )}

            {currentDataframe === "table" && (
              <div className="relative w-full h-full group">
                <PivotGraphTable
                  name="datasource"
                  payload={{
                    datasource_id: datasource_id,
                    run_id: datasource_run_id,
                    event_id: event_id,
                    sql_cmd: sql_cmd,
                  }}
                />
              </div>
            )}

            {currentDataframe === "chart" && (
              <div className="w-full h-[300px] relative group">
                <PivotGraph
                  name="datasource"
                  payload={{
                    datasource_id: datasource_id,
                    run_id: datasource_run_id,
                    event_id: event_id,
                  }}
                  config={data_visualization_config}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 mb-2 space-y-4 border rounded-md border-border-color bg-secondary-bg">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-6 h-6 animate-spin text-foreground fill-accent-foreground"
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
        </div>
      )}

      <TableModal show={showTable} setShow={setShowTable} data={seeMoreTable} />

      {showGraphChange && (
        <NotebookDatasourceGraphMenu
          show={showGraphChange}
          setShow={setShowGraphChange}
          dataField={tableData}
          datasourceId={datasource_id}
          eventId={event_id}
          runId={datasource_run_id}
          visualizationInfo={visualizationInfo}
          setVisualizationInfo={setVisualizationInfo}
          fromOutput={true}
          config={data_visualization_config}
          handleConfig={handleConfig}
        />
      )}
    </div>
  );
};

export default DatasourceOutput;
