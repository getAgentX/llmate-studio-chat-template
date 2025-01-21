// import React from "react";
// import { Line, Bar, Pie, Doughnut, Radar } from "react-chartjs-2";
// import Chart from "chart.js/auto";
// import { colors } from "@/data/ChartColors";

// const ChartComponent = ({ data }) => {
//   const stringArrayKey = Object.keys(data).find(
//     (key) =>
//       Array.isArray(data[key]) &&
//       data[key].every((element) => typeof element === "string")
//   );

//   const totalItems = data[Object.keys(data)[0]]?.length;

//   const labels = data[stringArrayKey] || [];

//   const datasets = Object.keys(data)
//     .filter((key) => key !== stringArrayKey)
//     .map((key, index) => {
//       const colorIndex = index % colors.length;
//       const borderColor = colors[colorIndex];
//       const backgroundColor = `${borderColor}B3`;
//       return {
//         label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
//         data: data[key],
//         fill: false,
//         borderColor,
//         backgroundColor,
//         tension: 0.1,
//       };
//     });

//   const chartData = {
//     labels,
//     datasets,
//   };

//   const options = {
//     scales: {
//       x: {
//         grid: {
//           color: "#282828",
//           borderColor: "#282828",
//           borderDash: [5, 5],
//         },
//         ticks: {
//           color: "#ffffff",
//         },
//       },
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: "#282828",
//           borderColor: "#282828",
//           borderDash: [5, 5],
//         },
//         ticks: {
//           color: "#ffffff",
//         },
//       },
//     },
//     plugins: {
//       legend: {
//         labels: {
//           color: "#ffffff",
//         },
//       },
//     },
//   };

//   return (
//     <div className="flex flex-col">
//       {totalItems > 0 && (
//         <div className="bg-[#1A1C1D]">
//           <Bar data={chartData} options={options} />
//         </div>
//       )}

//       {totalItems > 0 || (
//         <div className="flex items-center justify-center w-full h-48 rounded-md bg-[#1A1C1D]">
//           <div className="flex flex-col items-center justify-center w-full space-y-4">
//             <div className="w-8 h-8 flex justify-center items-center bg-[#383A40] rounded-full">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//                 className="w-5 h-5 text-[#E4C063]"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </div>

//             <span className="text-sm font-normal tracking-wide text-white">
//               No Data Found
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChartComponent;

// import React, { useState } from "react";
// import { Line, Bar, Pie, Doughnut, Radar } from "react-chartjs-2";
// import Chart from "chart.js/auto";
// import { colors } from "@/data/ChartColors";

// const ChartComponent = ({ data }) => {
//   const [selectedChartType, setSelectedChartType] = useState("Bar");
//   const [selectedXAxis, setSelectedXAxis] = useState("");
//   const [selectedYAxis, setSelectedYAxis] = useState("");

//   const dataKeys = Object.keys(data);

//   const handleChartTypeChange = (event) => {
//     setSelectedChartType(event.target.value);
//   };

//   const handleXAxisChange = (event) => {
//     setSelectedXAxis(event.target.value);
//   };

//   const handleYAxisChange = (event) => {
//     setSelectedYAxis(event.target.value);
//   };

//   const labels = data[selectedXAxis] || [];

//   const stringArrayKey = Object.keys(data).find(
//     (key) =>
//       Array.isArray(data[key]) &&
//       data[key].every((element) => typeof element === "string")
//   );

//   const datasets = Object.keys(data)
//     .filter((key) => key !== stringArrayKey)
//     .map((key, index) => {
//       const colorIndex = index % colors.length;
//       const borderColor = colors[colorIndex];
//       const backgroundColor = `${borderColor}B3`;
//       return {
//         label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
//         data: data[key],
//         fill: false,
//         borderColor,
//         backgroundColor,
//         tension: 0.1,
//       };
//     });

//   const chartData = {
//     labels,
//     datasets,
//   };

//   const options = {
//     scales: {
//       x: {
//         grid: {
//           color: "#282828",
//           borderColor: "#282828",
//           borderDash: [5, 5],
//         },
//         ticks: {
//           color: "#ffffff",
//         },
//       },
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: "#282828",
//           borderColor: "#282828",
//           borderDash: [5, 5],
//         },
//         ticks: {
//           color: "#ffffff",
//         },
//       },
//     },
//     plugins: {
//       legend: {
//         labels: {
//           color: "#ffffff",
//         },
//       },
//     },
//   };

//   const renderChart = () => {
//     switch (selectedChartType) {
//       case "Line":
//         return <Line data={chartData} options={options} />;
//       case "Bar":
//         return <Bar data={chartData} options={options} />;
//       case "Pie":
//         return <Pie data={chartData} options={options} />;
//       case "Doughnut":
//         return <Doughnut data={chartData} options={options} />;
//       case "Radar":
//         return <Radar data={chartData} options={options} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="flex flex-col space-y-4">
//       <div className="flex space-x-4">
//         <div>
//           <label className="text-sm font-normal text-white/40">Chart</label>
//           <select
//             value={selectedChartType}
//             onChange={handleChartTypeChange}
//             className="p-0.5 ml-2 text-white text-sm font-normal bg-[#1A1C1D] cursor-pointer outline-none border border-[#282828] px-0.5"
//           >
//             <option value="Bar">Bar</option>
//             <option value="Line">Line</option>
//             <option value="Pie">Pie</option>
//             <option value="Doughnut">Doughnut</option>
//             <option value="Radar">Radar</option>
//           </select>
//         </div>

//         <div>
//           <label className="text-sm font-normal text-white/40">X-axis</label>
//           <select
//             value={selectedXAxis}
//             onChange={handleXAxisChange}
//             className="p-0.5 ml-2 text-white text-sm font-normal bg-[#1A1C1D] cursor-pointer outline-none border border-[#282828] px-0.5"
//           >
//             <option value="" disabled>
//               Select X-axis
//             </option>
//             {dataKeys.map((key) => (
//               <option key={key} value={key}>
//                 {key
//                   .replace(/_/g, " ")
//                   .replace(/\b\w/g, (l) => l.toUpperCase())}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="text-sm font-normal text-white/40">Y-axis</label>
//           <select
//             value={selectedYAxis}
//             onChange={handleYAxisChange}
//             className="p-0.5 ml-2 text-white text-sm cursor-pointer font-normal bg-[#1A1C1D] outline-none border border-[#282828] px-0.5"
//           >
//             <option value="" disabled>
//               Select Y-axis
//             </option>
//             {dataKeys.map((key) => (
//               <option key={key} value={key}>
//                 {key
//                   .replace(/_/g, " ")
//                   .replace(/\b\w/g, (l) => l.toUpperCase())}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {datasets.length > 0 ? (
//         <div className="bg-[#1A1C1D] rounded-md">{renderChart()}</div>
//       ) : (
//         <div className="flex items-center justify-center w-full h-48 rounded-md bg-[#1A1C1D]">
//           <div className="flex flex-col items-center justify-center w-full space-y-4">
//             <div className="w-8 h-8 flex justify-center items-center bg-[#383A40] rounded-full">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//                 className="w-5 h-5 text-[#E4C063]"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </div>
//             <span className="text-sm font-normal tracking-wide text-white">
//               No Data Found
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChartComponent;

import React, { useEffect, useRef, useState } from "react";
import { Line, Bar, Pie, Doughnut, Radar } from "react-chartjs-2";
import Select from "react-select";
import { colors } from "@/data/ChartColors";
import { useTheme } from "@/hooks/useTheme";

const ChartComponent = ({ data }) => {
  const [selectedChartType, setSelectedChartType] = useState({
    value: "Bar",
    label: "Bar",
  });
  const { theme } = useTheme()
  const [selectedXAxis, setSelectedXAxis] = useState(null);
  const [selectedYAxes, setSelectedYAxes] = useState([]);

  const [toggleYAxes, setToggleYAxes] = useState(false);

  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setToggleYAxes(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const dataKeys = Object.keys(data);

  const handleChartTypeChange = (selectedOption) => {
    setSelectedChartType(selectedOption);
  };

  const handleXAxisChange = (selectedOption) => {
    setSelectedXAxis(selectedOption ? selectedOption.value : null);
  };

  const handleSelectYaxis = (option) => {
    setSelectedYAxes((prev) => [...prev, option]);
    setToggleYAxes(false);
  };

  const handleRemoveYaxis = (option) => {
    const data = selectedYAxes.filter((item) => {
      return item.value !== option.value;
    });

    setSelectedYAxes(data);
    setToggleYAxes(false);
  };

  const labels = data[selectedXAxis] || [];

  const datasets = selectedYAxes.map((key, index) => {
    const colorIndex = index % colors.length;
    const borderColor = colors[colorIndex];
    const backgroundColor = `${borderColor}B3`;
    return {
      label: key.value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      data: data[key.value],
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

  const options = {
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
    plugins: {
      legend: {
          labels: {
            color: theme === 'dark' ? "#fff" : "#000", // Light theme text color for the legend
          },
      },
    },
  };

  const renderChart = () => {
    switch (selectedChartType.value) {
      case "Line":
        return <Line data={chartData} options={options} />;
      case "Bar":
        return <Bar data={chartData} options={options} />;
      case "Pie":
        return <Pie data={chartData} options={options} />;
      case "Doughnut":
        return <Doughnut data={chartData} options={options} />;
      case "Radar":
        return <Radar data={chartData} options={options} />;
      default:
        return null;
    }
  };

  const axisOptions = dataKeys.map((key) => ({
    value: key,
    label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
  }));

  const chartTypeOptions = [
    { value: "Bar", label: "Bar" },
    { value: "Line", label: "Line" },
    { value: "Pie", label: "Pie" },
    { value: "Doughnut", label: "Doughnut" },
    { value: "Radar", label: "Radar" },
  ];

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2">
        <div className="flex items-center">
          <div className="w-32">
            <Select
              options={chartTypeOptions}
              value={selectedChartType}
              onChange={handleChartTypeChange}
              className="text-sm font-normal w-full bg-[#1A1C1D] cursor-pointer border border-[#282828]"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "#1A1C1D",
                  borderColor: "#282828",
                  color: "#ffffff",
                  cursor: "pointer",
                }),
                singleValue: (baseStyle, state) => ({
                  ...baseStyle,
                  color: "#ffffff",
                  fontSize: "14px",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#1A1C1D",
                  borderColor: "#282828",
                  color: "#ffffff",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "#282828" : "#1A1C1D",
                  color: "#ffffff",
                  fontSize: "14px",
                  cursor: "pointer",
                  "&:active": {
                    backgroundColor: "#323435",
                  },
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "#ffffff",
                }),
                input: (baseStyle, state) => ({
                  ...baseStyle,
                  color: "#ffffff",
                  fontSize: "14px",
                }),
                indicatorSeparator: () => ({
                  display: "none",
                }),
                noOptionsMessage: (baseStyle, state) => ({
                  ...baseStyle,
                  color: "#ffffff",
                  fontSize: "14px",
                }),
              }}
            />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-32">
            <Select
              options={axisOptions}
              value={axisOptions.find(
                (option) => option.value === selectedXAxis
              )}
              onChange={handleXAxisChange}
              className="text-sm font-normal w-full bg-[#1A1C1D] cursor-pointer whitespace-nowrap border border-[#282828]"
              placeholder="Select X-axis"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "#1A1C1D",
                  borderColor: "#282828",
                  color: "#ffffff",
                  cursor: "pointer",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#1A1C1D",
                  borderColor: "#282828",
                  color: "#ffffff",
                }),
                singleValue: (baseStyle, state) => ({
                  ...baseStyle,
                  color: "#ffffff",
                  fontSize: "14px",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "#282828" : "#1A1C1D",
                  color: "#ffffff",
                  fontSize: "14px",
                  cursor: "pointer",
                  "&:active": {
                    backgroundColor: "#323435",
                  },
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "#ffffff",
                }),
                input: (baseStyle, state) => ({
                  ...baseStyle,
                  color: "#ffffff",
                  fontSize: "14px",
                }),
                indicatorSeparator: () => ({
                  display: "none",
                }),
                noOptionsMessage: (baseStyle, state) => ({
                  ...baseStyle,
                  color: "#ffffff",
                  fontSize: "14px",
                }),
              }}
            />
          </div>
        </div>

        <div className="flex w-full">
          <div className="relative flex w-32">
            <div className="border-2 border-[#282828] cursor-pointer w-full">
              <div
                className={`flex items-center justify-between w-full px-2 py-1.5 border rounded-md hover:border-white/80 ${
                  toggleYAxes ? "border-blue-500" : "border-transparent"
                }`}
                onClick={() => setToggleYAxes(!toggleYAxes)}
              >
                <span className="text-sm font-normal text-white/40 line-clamp-1 whitespace-nowrap">
                  Select Y-axis
                </span>

                {toggleYAxes || (
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-6 h-6 fill-white"
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                )}

                {toggleYAxes && (
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-6 h-6 fill-white/40"
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {toggleYAxes && (
              <ul
                className="flex flex-col w-full border border-[#282828] rounded-md absolute top-[110%] left-0"
                ref={modalRef}
              >
                {axisOptions?.map((option) => {
                  const isSelected = selectedYAxes.some(
                    (item) => item.value === option.value
                  );

                  return (
                    <>
                      {isSelected || (
                        <li
                          className="py-2 px-2 flex items-center justify-between hover:bg-[#282828] text-sm font-normal cursor-pointer text-white bg-[#1A1C1D]"
                          onClick={() => handleSelectYaxis(option)}
                        >
                          <div className="line-clamp-1">{option.label}</div>
                        </li>
                      )}

                      {isSelected && (
                        <li
                          className="py-2 px-2 flex items-center space-x-2 justify-between hover:bg-[#282828] text-sm font-normal cursor-pointer text-white bg-[#1A1C1D]"
                          onClick={() => handleRemoveYaxis(option)}
                        >
                          <div className="w-full line-clamp-1">
                            {option.label}
                          </div>

                          <div>
                            <span className="flex items-center justify-center w-4 h-4 bg-[#295ef4] rounded-full">
                              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            </span>
                          </div>
                        </li>
                      )}
                    </>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {datasets.length > 0 ? (
        <div className="bg-[#1A1C1D] rounded-md">{renderChart()}</div>
      ) : (
        <div className="flex items-center justify-center w-full h-48 rounded-md bg-[#1A1C1D]">
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
              Select graph configuration
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartComponent;
