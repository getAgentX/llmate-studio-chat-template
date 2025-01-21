import React, { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import WidgetEmbedGraph from "./WidgetEmbedGraph";
import WidgetEmbedTable from "./WidgetEmbedTable";

const WidgetEmbedRender = ({
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

  useEffect(() => {
    setInputValue(widgetData?.label);
  }, [widgetData]);

  //   useEffect(() => {
  //     if (firstRender) {
  //       setFirstRender(false);
  //       return;
  //     }

  //     onWidgetRefresh();
  //   }, []);

  return (
    <div className="w-full h-full overflow-hidden border-2 border-transparent rounded-md shadow-md select-none bg-primary">
      <div className="w-full h-full pb-2">
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center justify-between w-full px-2 space-x-2 text-xs font-normal leading-5 tracking-wide border-b min-h-10 border-border-color text-accent">
            <div className="w-full">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pr-2 bg-transparent border border-transparent outline-none hover:bg-page focus:border-input-border-focus focus:bg-secondary-bg"
                readOnly={true}
              />
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
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-3 h-3 ${
                    currentTab === "table"
                      ? "fill-active-icon"
                      : "fill-icon-color"
                  }`}
                >
                  <path d="M0 10.6667V1.33333C0 0.966667 0.130556 0.652778 0.391667 0.391667C0.652778 0.130556 0.966667 0 1.33333 0H10.6667C11.0333 0 11.3472 0.130556 11.6083 0.391667C11.8694 0.652778 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8694 11.3472 11.6083 11.6083C11.3472 11.8694 11.0333 12 10.6667 12H1.33333C0.966667 12 0.652778 11.8694 0.391667 11.6083C0.130556 11.3472 0 11.0333 0 10.6667ZM1.33333 4H10.6667V1.33333H1.33333V4ZM4.88333 7.33333H7.11667V5.33333H4.88333V7.33333ZM4.88333 10.6667H7.11667V8.66667H4.88333V10.6667ZM1.33333 7.33333H3.55V5.33333H1.33333V7.33333ZM8.45 7.33333H10.6667V5.33333H8.45V7.33333ZM1.33333 10.6667H3.55V8.66667H1.33333V10.6667ZM8.45 10.6667H10.6667V8.66667H8.45V10.6667Z" />
                </svg>
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
            </div>
          </div>

          <div className="flex flex-col w-full h-full recent__bar">
            {currentTab === "chart" && (
              <div className="w-full h-full grow">
                <div className="w-full h-full p-2">
                  <WidgetEmbedGraph
                    dashboard_id={dashboard_id}
                    section_id={section_id}
                    widgetData={widgetData}
                    setChartData={setChartData}
                  />
                </div>
              </div>
            )}

            {currentTab === "table" && (
              <WidgetEmbedTable
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

export default WidgetEmbedRender;
