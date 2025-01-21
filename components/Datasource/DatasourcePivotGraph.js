import React, { useEffect, useState, useRef } from "react";
import { useGetDataGraphQuery, useGetGraphForQuery } from "@/store/datasource";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie, Doughnut, Radar, Scatter } from "react-chartjs-2";
import { colors } from "@/data/ChartColors";
import { useTheme } from "@/hooks/useTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const MAX_PAGE = 9;

const DatasourcePivotGraph = ({
  payload,
  config,
  executeSqlLoading = false,
  sqlQueryError = false,
  sqlRunQuery = "",
}) => {
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(null);

  const {
    data,
    error,
    isLoading: graphLoading,
    isFetching,
    refetch,
  } = useGetGraphForQuery(
    {
      ...payload,
      payload: {
        query: sqlRunQuery || "",
        data_visualization_config: config,
      },
      skip: 0,
      limit: 10 * (page + 1),
    }
    // {
    //   skip: !payload.event_id,
    // }
  );

  useEffect(() => {
    setIsLoading(true);

    if (data) {
      const yAxis = Object.keys(data?.y_axis)?.map((key) => ({
        label: key,
        data: data?.y_axis[key],
      }));

      const chartSchema = {
        labels: data.x_axis || [],
        datasets: yAxis,
      };

      setChartData(chartSchema);
      setIsLoading(false);
    } else {
      setChartData(null);
      setIsLoading(false);
    }
  }, [data, config]);

  const handleZoomIn = () => {
    if (isFetching || page == 0) return;
    setPage(page - 1);
  };

  const handleZoomOut = () => {
    if (isFetching || page == MAX_PAGE) return;
    setPage(page + 1);
  };

  if (graphLoading || executeSqlLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-full text-white rounded-md bg-page">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-5 h-5 animate-spin text-white fill-[#295EF4]"
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
    );
  }

  function removeNewlines(input) {
    return input.replace(/\n/g, "");
  }

  const cleanedText = removeNewlines(error?.data?.message || "");

  if (error || !chartData || sqlQueryError?.data) {
    return (
      <div className="flex items-center justify-center h-full overflow-y-auto text-white recent__bar">
        <div className="flex flex-col items-center justify-center w-full h-full space-y-4 text-center">
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 fill-white/25"
            >
              <path d="M10.6667 37.3333H16V18.6667H10.6667V37.3333ZM21.3333 37.3333H26.6667V10.6667H21.3333V37.3333ZM32 37.3333H37.3333V26.6667H32V37.3333ZM5.33333 48C3.86667 48 2.61111 47.4778 1.56667 46.4333C0.522222 45.3889 0 44.1333 0 42.6667V5.33333C0 3.86667 0.522222 2.61111 1.56667 1.56667C2.61111 0.522222 3.86667 0 5.33333 0H42.6667C44.1333 0 45.3889 0.522222 46.4333 1.56667C47.4778 2.61111 48 3.86667 48 5.33333V42.6667C48 44.1333 47.4778 45.3889 46.4333 46.4333C45.3889 47.4778 44.1333 48 42.6667 48H5.33333ZM5.33333 42.6667H42.6667V5.33333H5.33333V42.6667Z" />
            </svg>
          </span>

          {error && (
            <p className="w-full max-w-xl text-xs font-medium tracking-wider text-center text-secondary-text">
              {cleanedText || ""}
            </p>
          )}

          {!error && sqlQueryError?.data?.message && (
            <p className="w-full max-w-xl text-xs font-medium tracking-wider text-center text-secondary-text">
              {sqlQueryError?.data?.message}
            </p>
          )}

          {!chartData && (
            <p className="w-full max-w-xl text-xs font-medium tracking-wider text-center text-secondary-text">
              Invalid visualization. Please edit this graph
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="flex items-center justify-center w-full h-full min-h-full text-white rounded-md bg-page">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-5 h-5 animate-spin text-white fill-[#295EF4]"
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

      {!isLoading && (
        <div className="relative w-full h-full min-h-full bg-page group">
          <div className="w-full">
            <div
              className={`animate-full-width ${isFetching && "active"}`}
            ></div>
          </div>

          <NormalChart
            data={chartData}
            chartType={config?.graph_type}
            datasource={true}
          />

          <div
            className="absolute flex-col hidden space-y-2 top-2 group-hover:flex right-3"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span
              className="flex items-center justify-center"
              onClick={handleZoomIn}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={`w-5 h-5 fill-secondary-text hover:fill-primary-text ${
                  page === 0 || isFetching ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <path d="M10 2c-4.411 0-8 3.589-8 8s3.589 8 8 8a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8zm4 9h-3v3H9v-3H6V9h3V6h2v3h3v2z"></path>
              </svg>
            </span>

            <span
              className="flex items-center justify-center"
              onClick={handleZoomOut}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={`w-5 h-5 fill-secondary-text hover:fill-primary-text ${
                  page === MAX_PAGE || isFetching
                    ? "cursor-default"
                    : "cursor-pointer"
                }`}
              >
                <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zM6 9h8v2H6V9z"></path>
              </svg>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasourcePivotGraph;

const NormalChart = ({ data, chartType = "bar", widgetId = null }) => {
  const chartRef = useRef(null);
  const { theme } = useTheme()
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => {
      const colorIndex = index % colors.length;
      const borderColor = colors[colorIndex];
      const backgroundColor = `${borderColor}B3`;

      return {
        label: dataset.label
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        data: dataset.data,
        borderColor,
        backgroundColor,
        borderWidth: 1,
        fill: dataset.fill || false,
        tension: dataset.tension || 0.1,
      };
    }),
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        labels: {
          color: theme === 'dark' ? "#fff" : "#000", // Light theme text color for the legend
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
          modifierKey: "ctrl",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
        },
        limits: {
          x: { min: "original", max: "original" },
          y: { min: "original", max: "original" },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? "#ffffff" : "#010616", // Adjust color for better visibility in dark mode
          callback: function (value) {
            const lbl = this.getLabelForValue(value);
            if (typeof lbl === "string" && lbl.length > 6) {
              return `${lbl.substring(0, 6)}...`;
            }
            return lbl;
          },
        },
        grid: {
          color: theme === 'dark' ? "#282828" : "#EAECF0", // Adjust grid color for light/dark themes
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === 'dark' ? "#ffffff" : "#010616", // Adjust color for better visibility in dark mode
        },
        grid: {
          color: theme === 'dark' ? "#282828" : "#EAECF0", // Adjust grid color for light/dark themes
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutSine",
      delay: 0,
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const canvasStyles = {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
  };

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <Line
            ref={chartRef}
            data={chartData}
            options={options}
            style={canvasStyles}
            id={`chart-${widgetId}`}
          />
        );
      case "bar":
        return (
          <Bar
            ref={chartRef}
            data={chartData}
            options={options}
            style={canvasStyles}
            id={`chart-${widgetId}`}
          />
        );
      case "stacked_bar":
        return (
          <Bar
            ref={chartRef}
            data={chartData}
            style={canvasStyles}
            id={`chart-${widgetId}`}
            options={{
              ...options,
              scales: {
                x: {
                  stacked: true,
                  ticks: {
                    color: "#fff",
                  },
                  grid: {
                    color: "#282828",
                  },
                },
                y: {
                  beginAtZero: true,
                  stacked: true,
                  ticks: {
                    color: "#fff",
                  },
                  grid: {
                    color: "#282828",
                  },
                },
              },
            }}
          />
        );
      case "pie":
        return (
          <Pie
            ref={chartRef}
            data={chartData}
            options={options}
            style={canvasStyles}
            id={`chart-${widgetId}`}
          />
        );
      case "doughnut":
        return (
          <Doughnut
            ref={chartRef}
            data={chartData}
            options={options}
            style={canvasStyles}
            id={`chart-${widgetId}`}
          />
        );
      case "radar":
        return (
          <Radar
            ref={chartRef}
            data={chartData}
            options={options}
            style={canvasStyles}
            id={`chart-${widgetId}`}
          />
        );
      case "scatter":
        return (
          <Scatter
            ref={chartRef}
            data={chartData}
            options={options}
            style={canvasStyles}
            id={`chart-${widgetId}`}
          />
        );
      case "multi_pie":
        return (
          <Doughnut
            ref={chartRef}
            style={canvasStyles}
            id={`chart-${widgetId}`}
            data={{
              labels: data?.labels || [],
              datasets: (data?.datasets || []).map((dataset, index) => ({
                label: dataset?.label || "",
                data: dataset?.data || [],
                backgroundColor: (dataset?.data || []).map(
                  (_, i) => colors[(index + i) % colors.length]
                ),
              })),
            }}
            options={options}
          />
        );
      default:
        return (
          <Bar
            ref={chartRef}
            data={chartData}
            options={options}
            style={canvasStyles}
            id={`chart-${widgetId}`}
          />
        );
    }
  };

  if (chartType == "table") {
    return (
      <div className="w-full">
        {data.labels.length > 0 && (
          <div className="w-full pb-4 text-xl text-center text-secondary-text">
            {data.labels[0]}
          </div>
        )}

        <div className="w-full overflow-x">
          <table className="w-full overflow-scroll border table-auto border-border-color">
            <thead
              // make sticky header
              className="sticky top-0 z-10 border bg-page "
            >
              <tr>
                {data.datasets.map((dataset, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-xs font-medium text-left border border-border-color text-secondary-text"
                  >
                    {dataset.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="">
              {data.datasets.length > 0 && (
                <tr>
                  {data.datasets.map((dataset, index) => (
                    <td
                      key={index}
                      className="px-6 py-4 text-sm text-left border border-border-color whitespace-nowrap text-secondary-text"
                    >
                      {dataset.data.length > 0 ? dataset.data[0] : "NA"}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (chartType == "LABELS_ONLY") {
    return (
      <div className="w-full">
        {data.labels.length > 0 && (
          <div className="px-6 py-4 text-center whitespace-nowrap expandable-text text-secondary-text">
            {data.labels[0]}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="w-full h-full max-h-full min-w-full rounded-md bg-page"
      style={{
        position: "relative",
        backgroundColor: "var(--bg-page-new)",
      }}
    >
      {renderChart()}
    </div>
  );
};
