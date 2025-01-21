import React, { useRef } from "react";
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

const NormalChart = ({ data, chartType = "bar", widgetId = null }) => {
  const chartRef = useRef(null);
  const { theme } = useTheme();

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
          color: theme === "dark" ? "#fff" : "#000", // Light theme text color for the legend
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
                    color: theme === "dark" ? "#fff" : "#000", // Ensure ticks are visible in dark mode
                  },
                  grid: {
                    color: theme === "dark" ? "#282828" : "#EAECF0", // Grid color for stacked bar chart
                  },
                },
                y: {
                  beginAtZero: true,
                  stacked: true,
                  ticks: {
                    color: theme === "dark" ? "#fff" : "#000", // Ensure ticks are visible in dark mode
                  },
                  grid: {
                    color: theme === "dark" ? "#282828" : "#EAECF0", // Grid color for stacked bar chart
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
      <div className="w-full px-2">
        {data.labels.length > 0 && (
          <div className="w-full pb-4 text-xl text-center text-secondary-text">
            {data.labels[0]}
          </div>
        )}

        <div className="w-full overflow-x">
          <table className="w-full overflow-scroll border table-auto border-border-color">
            <thead className="sticky top-0 z-10 border secondary-bg ">
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
      className="w-full h-full max-h-full min-w-full rounded-md outline-color bg-page"
      style={{
        position: "relative",
        backgroundColor: "var(--bg-page-new)", // Adjust the chart container background color
      }}
    >
      {renderChart()}
    </div>
  );
};

export default NormalChart;
``;
