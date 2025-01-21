// import React, { useState, useEffect } from "react";
// import dynamic from "next/dynamic";

// import {
//   PivotTableUI,
//   createPlotlyRenderers,
//   TableRenderers,
// } from "@imc-trading/react-pivottable";
// import "@imc-trading/react-pivottable/pivottable.css";

// const Plotly = dynamic(() => import("react-plotly.js"), {
//   ssr: false,
// });

// const PlotlyRenderers = createPlotlyRenderers(Plotly);

// const AdvancedChart = ({
//   chartData = {},
//   setConfigData = () => {},
//   configuration = {},
// }) => {
//   const [state, setState] = useState({});
//   const [data, setData] = useState([]);

//   // useEffect(() => {
//   //   if (configuration) {
//   //     setState({
//   //       rows: configuration.rows || [],
//   //       cols: configuration.cols || [],
//   //     });
//   //   }
//   // }, [configuration]);

//   const transformData = (json) => {
//     const keys = Object.keys(json);
//     const length = json[keys[0]].length;

//     const result = [keys];

//     for (let i = 0; i < length; i++) {
//       const row = [];
//       keys.forEach((key) => {
//         row.push(json[key][i]);
//       });
//       result.push(row);
//     }

//     return result;
//   };

//   useEffect(() => {
//     if (chartData) {
//       const transformedData = transformData(chartData);
//       setData(transformedData);
//       setState({ rows: transformedData[0] });
//     }
//   }, [chartData]);

//   const handleDataChange = (s) => {
//     setState(s);

//     if (setConfigData) {
//       setConfigData(s);
//     }
//   };

//   return (
//     <div className="bg-[#1B1D1F] border border-[#26282A] rounded-md p-2 w-full">
//       <div className="table-container">
//         {data?.length > 0 && (
//           <PivotTableUI
//             data={data}
//             onChange={(s) => handleDataChange(s)}
//             renderers={{ ...TableRenderers, ...PlotlyRenderers }}
//             {...state}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdvancedChart;

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  PivotTableUI,
  createPlotlyRenderers,
  TableRenderers,
} from "@imc-trading/react-pivottable";
import "@imc-trading/react-pivottable/pivottable.css";

const Plotly = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

const PlotlyRenderers = createPlotlyRenderers(Plotly);

const AdvancedChart = ({
  chartData = {},
  setConfigData = () => {},
  configuration = {},
}) => {
  const [state, setState] = useState({});
  const [data, setData] = useState([]);

  const transformData = (json) => {
    const keys = Object.keys(json);

    if (keys.length === 0) {
      return [];
    }

    if (
      !Array.isArray(json[keys[0]]) ||
      typeof json[keys[0]].length === "undefined"
    ) {
      throw new Error(
        `The value for key "${keys[0]}" is not an array or does not have a length property.`
      );
    }

    const length = json[keys[0]].length;
    const result = [keys];

    for (let i = 0; i < length; i++) {
      const row = [];
      keys.forEach((key) => {
        row.push(json[key][i]);
      });
      result.push(row);
    }

    return result;
  };

  useEffect(() => {
    if (Object.keys(chartData).length > 0) {
      const transformedData = transformData(chartData);
      setData(transformedData);
      setState({ rows: transformedData[0] });
    } else {
      setData([]);
      setState({});
    }
  }, [chartData]);

  const handleDataChange = (s) => {
    setState(s);

    if (setConfigData) {
      setConfigData(s);
    }
  };

  return (
    <div className="bg-[#1B1D1F] border border-[#26282A] rounded-md p-2 w-full">
      {data?.length > 0 ? (
        <div className="table-container">
          <PivotTableUI
            data={data}
            onChange={(s) => handleDataChange(s)}
            renderers={{ ...TableRenderers, ...PlotlyRenderers }}
            {...state}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full space-y-4 text-sm font-normal tracking-wider text-center text-white/50 min-h-44">
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
      )}
    </div>
  );
};

export default AdvancedChart;
