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

const CommonChart = ({ data = {}, chartType = "bar" }) => {
  const chartRef = useRef(null);

  const stringArrayKey = Object.keys(data).find(
    (key) =>
      Array.isArray(data[key]) &&
      data[key].every((element) => typeof element === "string")
  );
  const { theme } = useTheme()
  const totalItems = data[Object.keys(data)[0]]?.length;

  // const labels = data[stringArrayKey] || [];

  const labels = Object.keys(data);

  const datasets = Object.keys(data)
    .filter((key) => key !== stringArrayKey)
    .map((key, index) => {
      const colorIndex = index % colors.length;
      const borderColor = colors[colorIndex];
      const backgroundColor = `${borderColor}B3`;
      return {
        label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        data: data[key],
        fill: false,
        borderColor,
        backgroundColor,
        tension: 0.1,
      };
    });

  const chartData = {
    labels,
    datasets,
  };

  // const options = {
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       grid: {
  //         color: "#282828",
  //         borderColor: "#282828",
  //         borderDash: [5, 5],
  //       },
  //       ticks: {
  //         color: "#ffffff",
  //       },
  //     },
  //     x: {
  //       grid: {
  //         color: "#282828",
  //         borderColor: "#282828",
  //         borderDash: [5, 5],
  //       },
  //       ticks: {
  //         color: "#ffffff",
  //       },
  //     },
  //   },
  //   plugins: {
  //     legend: {
  //       labels: {
  //         color: "#ffffff",
  //       },
  //     },
  //   },
  // };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
      duration: 1500,
      easing: "easeOutBounce",
      delay: 500,
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return <Line ref={chartRef} data={chartData} options={options} />;
      case "bar":
        return <Bar ref={chartRef} data={chartData} options={options} />;
      case "stacked_bar":
        return (
          <Bar
            ref={chartRef}
            data={chartData}
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
      case "Pie":
        return <Pie ref={chartRef} data={chartData} options={options} />;
      case "Doughnut":
        return <Doughnut ref={chartRef} data={chartData} options={options} />;
      case "radar":
        return <Radar ref={chartRef} data={chartData} options={options} />;
      case "scatter":
        return <Scatter ref={chartRef} data={chartData} options={options} />;
      case "multi_pie":
        return (
          <Doughnut
            ref={chartRef}
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
        return <Bar ref={chartRef} data={chartData} options={options} />;
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {totalItems > 0 && (
        <div
          className="w-full min-w-full h-full max-h-full bg-[#1E2022] rounded-md"
          style={{
            position: "relative",
            backgroundColor: "var(--bg-page-new)",
          }}
          // onMouseDown={(e) => e.stopPropagation()}
        >
          {renderChart()}
        </div>
      )}

      {totalItems > 0 || (
        <div className="flex items-center justify-center w-full h-48 rounded-md bg-background">
          <div className="flex flex-col items-center justify-center w-full space-y-4">
            <div className="w-8 h-8 flex justify-center items-center bg-[#383A40] rounded-full">
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
              No Data Found
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonChart;
