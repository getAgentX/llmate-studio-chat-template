import React, { useEffect, useState } from "react";
import { useDashboardContext } from "@/context/DashboardContext";
import { Chart as ChartJS } from "chart.js";
import { colors } from "@/data/ChartColors";
import * as XLSX from "xlsx";
import WidgetTable from "./WidgetTable";
import WidgetGraph from "./WidgetGraph";
import {
  useGetBulkWidgetDataMutation,
  useUpdateWidgetInfoMutation,
} from "@/store/dashboard";
import { useTheme } from "@/hooks/useTheme";
import { TableIcon } from "../Icons/icon";

const WidgetRender = ({
  dashboard_id,
  section_id,
  widgetData,
  onWidgetRefresh,
}) => {
  const [currentTab, setCurrentTab] = useState("chart");
  const [chartData, setChartData] = useState({});
  const [inputValue, setInputValue] = useState(widgetData?.label);
  const [firstRender, setFirstRender] = useState(true);
  const { theme } = useTheme();
  const {
    setShowWidgetMenu,
    setSelectedWidget,
    setDataframeColumns,
    setConfirmDeleteWidget,
    setVisualizationConfig,
    setShowSqlCmd,
    setSqlCmd,
  } = useDashboardContext();

  const [
    updateWidgetInfo,
    { data: updateData, error: updateError, isLoading: updateLoading },
  ] = useUpdateWidgetInfoMutation();

  const [getBulkWidgetData, { isLoading: bulkDownloadLoading }] =
    useGetBulkWidgetDataMutation();

  useEffect(() => {
    setInputValue(widgetData?.label);
  }, [widgetData]);

  const handleLabelBlur = async () => {
    if (inputValue !== widgetData?.label) {
      try {
        await updateWidgetInfo({
          dashboard_id,
          section_id,
          widget_id: widgetData.id,
          payload: { label: inputValue },
        });
        onWidgetRefresh();
      } catch (error) {
        console.error("Error updating label:", error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLabelBlur();
    }
  };

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }

    if (updateData && !updateLoading) {
      onWidgetRefresh();
    }
  }, [updateData]);

  const handleDownloadGraphData = () => {
    const desiredWidth = 1080;
    const desiredHeight = 500;

    const canvas = document.createElement("canvas");
    canvas.width = desiredWidth;
    canvas.height = desiredHeight;
    const ctx = canvas.getContext("2d");

    const chartDataToExport = {
      labels: chartData.labels,
      datasets: chartData.datasets.map((dataset, index) => {
        const colorIndex = index % colors.length;
        const borderColor = colors[colorIndex];
        const backgroundColor = `${borderColor}B3`;

        return {
          ...dataset,
          backgroundColor,
          borderColor,
        };
      }),
    };

    const chartOptionsToExport = {
      plugins: {
        legend: {
          display: true,
          labels: {
            color: theme === "dark" ? "#fff" : "#000", // Light theme text color for the legend
          },
        },

        background: {
          color: "#fff",
        },
      },
      scales: {
        x: {
          ticks: {
            color: theme === "dark" ? "#ffffff" : "#010616", // Adjust color for better visibility in dark mode
            callback: function (value) {
              const lbl = this.getLabelForValue(value);
              if (typeof lbl === "string" && lbl.length > 6) {
                return `${lbl.substring(0, 6)}...`;
              }
              return lbl;
            },
          },
          grid: {
            color: theme === "dark" ? "#282828" : "#EAECF0", // Adjust grid color for light/dark themes
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: theme === "dark" ? "#ffffff" : "#010616", // Adjust color for better visibility in dark mode
          },
          grid: {
            color: theme === "dark" ? "#282828" : "#EAECF0", // Adjust grid color for light/dark themes
          },
        },
      },
      animation: false,
      responsive: false,
      maintainAspectRatio: false,
    };

    const backgroundColorPlugin = {
      id: "custom_canvas_background_color",
      beforeDraw: (chart) => {
        const ctx = chart.canvas.getContext("2d");
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#fff"; // Set your desired background color
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      },
    };

    const currentChart = widgetData.data_visualization_config.graph_type;

    new ChartJS(ctx, {
      type: currentChart,
      data: chartDataToExport,
      options: chartOptionsToExport,
      plugins: [backgroundColorPlugin],
    });

    setTimeout(() => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1.0);
      link.download = `${widgetData?.label || "chart"}.png`;
      link.click();
    }, 500);
  };

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getAllDataForDownload = (fetchedData) => {
    if (!fetchedData) return [];

    const totalItemsAvailable =
      fetchedData[Object.keys(fetchedData)[0]]?.length;
    const formattedRows = Array.from({ length: totalItemsAvailable }).map(
      (_, rowIndex) => {
        return Object.keys(fetchedData).reduce((acc, key) => {
          acc[formatKey(key)] = fetchedData[key][rowIndex] ?? "N/A";
          return acc;
        }, {});
      }
    );

    return formattedRows;
  };

  const handleCsvDownload = () => {
    getBulkWidgetData({
      dashboard_id,
      section_id,
      widget_id: widgetData.id,
      skip: 0,
      limit: 100,
    }).then((response) => {
      if (response.data) {
        const dataToDownload = response.data;
        const dataForDownload = getAllDataForDownload(dataToDownload);

        const worksheet = XLSX.utils.json_to_sheet(dataForDownload);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

        XLSX.writeFile(workbook, `table-data.xlsx`);
      }
    });
  };

  return (
    <div className="w-full h-full overflow-hidden border-2 border-transparent rounded-md select-none bg-primary shadow-md">
      <div className="w-full h-full pb-2">
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center justify-between w-full px-2 space-x-2 text-xs font-normal leading-5 tracking-wide border-b min-h-10 border-border-color text-accent">
            <div className="w-full">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleKeyDown}
                className="w-full pr-2 bg-transparent border border-transparent outline-none hover:bg-page focus:border-input-border-focus focus:bg-secondary-bg"
              />
            </div>

            <div className="relative flex items-center pr-2 space-x-1">
              <span
                className="flex items-center justify-center rounded-full cursor-pointer w-7 h-7 hover:bg-active-bg group"
                onClick={() => {
                  setSelectedWidget({
                    id: widgetData.id,
                    name: widgetData?.label,
                    config: widgetData.data_visualization_config,
                  });

                  const widgetList = widgetData?.dataframe_columns || [];

                  const fieldData = widgetList.map((col) => {
                    return { name: col, sort_order: "" };
                  });

                  setDataframeColumns(fieldData);
                  setShowWidgetMenu(true);
                  setVisualizationConfig(widgetData?.data_visualization_config);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                data-tooltip-id="tooltip"
                data-tooltip-content="Edit Graph"
                data-tooltip-place="bottom"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-icon-color hover:text-active-text"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </span>

              <span
                className="flex items-center justify-center rounded-full cursor-pointer w-7 h-7 hover:bg-active-bg group"
                onClick={() => {
                  setSelectedWidget({
                    id: widgetData.id,
                    name: widgetData?.label,
                    config: widgetData.data_visualization_config,
                  });

                  setConfirmDeleteWidget(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                data-tooltip-id="tooltip"
                data-tooltip-content="Remove"
                data-tooltip-place="bottom"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-icon-color hover:text-active-text"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 space-x-2 text-xs font-normal leading-5 tracking-wide border-b min-h-10 text-muted border-border-color">
            <div className="flex items-center">
              <span
                className={`flex items-center justify-center rounded-full cursor-pointer w-7 h-7 hover:bg-active-bg ${
                  currentTab === "table" ? "bg-active-bg" : "bg-transparent"
                }`}
                onClick={() => setCurrentTab("table")}
                onMouseDown={(e) => e.stopPropagation()}
                data-tooltip-id="tooltip"
                data-tooltip-content="Table"
                data-tooltip-place="bottom"
              >
                <TableIcon size={4}/>
              </span>

              <span
                className={`flex items-center justify-center rounded-full cursor-pointer w-7 h-7 hover:bg-active-bg ml-2 ${
                  currentTab === "chart" ? "bg-active-bg" : "bg-transparent"
                }`}
                onClick={() => setCurrentTab("chart")}
                onMouseDown={(e) => e.stopPropagation()}
                data-tooltip-id="tooltip"
                data-tooltip-content="Chart"
                data-tooltip-place="bottom"
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-3 h-3 ${
                    currentTab === "chart"
                      ? "fill-active-icon"
                      : "fill-icon-color"
                  }`}
                >
                  <path d="M0 12V10.6667L1.33333 9.33333V12H0ZM2.66667 12V8L4 6.66667V12H2.66667ZM5.33333 12V6.66667L6.66667 8.01667V12H5.33333ZM8 12V8.01667L9.33333 6.68333V12H8ZM10.6667 12V5.33333L12 4V12H10.6667ZM0 8.55V6.66667L4.66667 2L7.33333 4.66667L12 0V1.88333L7.33333 6.55L4.66667 3.88333L0 8.55Z" />
                </svg>
              </span>

              <span
                className="flex items-center justify-center rounded-full cursor-pointer w-7 h-7 bg-transparent hover:bg-active-bg mr-4 ml-2"
                onClick={() => {
                  setSqlCmd(widgetData);
                  setShowSqlCmd(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                data-tooltip-id="tooltip"
                data-tooltip-content="Sql"
                data-tooltip-place="bottom"
              >
                <svg
                  viewBox="0 0 12 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 fill-icon-color hover:fill-active-icon"
                >
                  <path d="M4.4 10.3998L5.33333 9.43317L3.9 7.99984L5.33333 6.5665L4.4 5.59984L2 7.99984L4.4 10.3998ZM7.6 10.3998L10 7.99984L7.6 5.59984L6.66667 6.5665L8.1 7.99984L6.66667 9.43317L7.6 10.3998ZM1.33333 13.9998C0.966667 13.9998 0.652778 13.8693 0.391667 13.6082C0.130556 13.3471 0 13.0332 0 12.6665V3.33317C0 2.9665 0.130556 2.65261 0.391667 2.3915C0.652778 2.13039 0.966667 1.99984 1.33333 1.99984H4.13333C4.27778 1.59984 4.51944 1.27762 4.85833 1.03317C5.19722 0.788726 5.57778 0.666504 6 0.666504C6.42222 0.666504 6.80278 0.788726 7.14167 1.03317C7.48056 1.27762 7.72222 1.59984 7.86667 1.99984H10.6667C11.0333 1.99984 11.3472 2.13039 11.6083 2.3915C11.8694 2.65261 12 2.9665 12 3.33317V12.6665C12 13.0332 11.8694 13.3471 11.6083 13.6082C11.3472 13.8693 11.0333 13.9998 10.6667 13.9998H1.33333ZM1.33333 12.6665H10.6667V3.33317H1.33333V12.6665ZM6 2.83317C6.14444 2.83317 6.26389 2.78595 6.35833 2.6915C6.45278 2.59706 6.5 2.47761 6.5 2.33317C6.5 2.18873 6.45278 2.06928 6.35833 1.97484C6.26389 1.88039 6.14444 1.83317 6 1.83317C5.85556 1.83317 5.73611 1.88039 5.64167 1.97484C5.54722 2.06928 5.5 2.18873 5.5 2.33317C5.5 2.47761 5.54722 2.59706 5.64167 2.6915C5.73611 2.78595 5.85556 2.83317 6 2.83317Z" />
                </svg>
              </span>
            </div>

            {currentTab === "table" && (
              <div className="flex items-center pr-2 space-x-1">
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full cursor-pointer group w-7 h-7 hover:bg-active-bg"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => handleCsvDownload()}
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Download CSV"
                  data-tooltip-place="bottom"
                >
                  {bulkDownloadLoading || (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 cursor-pointer text-icon-color group-hover:text-active-text"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  )}

                  {bulkDownloadLoading && (
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="w-3.5 h-3.5 animate-spin text-white fill-[#295EF4]"
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
                </button>
              </div>
            )}

            {currentTab === "chart" && (
              <div className="flex items-center pr-2 space-x-1">
                {widgetData?.data_visualization_config?.graph_type !==
                  "table" &&
                  widgetData?.data_visualization_config?.graph_type !==
                    "LABELS_ONLY" && (
                    <span
                      className="flex items-center justify-center rounded-full cursor-pointer group w-7 h-7 hover:bg-active-bg"
                      onClick={handleDownloadGraphData}
                      onMouseDown={(e) => e.stopPropagation()}
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Download Graph"
                      data-tooltip-place="bottom"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 cursor-pointer text-icon-color group-hover:text-active-text"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                    </span>
                  )}
              </div>
            )}
          </div>

          <div className="flex flex-col w-full h-full recent__bar">
            {currentTab === "chart" && (
              <div className="w-full h-full grow">
                <div className="w-full h-full p-2">
                  <WidgetGraph
                    dashboard_id={dashboard_id}
                    section_id={section_id}
                    widgetData={widgetData}
                    setChartData={setChartData}
                  />
                </div>
              </div>
            )}

            {currentTab === "table" && (
              <WidgetTable
                dashboard_id={dashboard_id}
                section_id={section_id}
                widget_id={widgetData.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetRender;
