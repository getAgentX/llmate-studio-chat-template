import React, { useEffect, useState } from "react";
import NormalChart from "../common/NormalChart";
import { useGetDataGraphQuery } from "@/store/datasource";
import { useGetAssistantGraphQuery } from "@/store/assistant";

const MAX_PAGE = 9;

const PivotGraph = ({ name = "datasource", payload = {}, config = {} }) => {
  if (name === "datasource") {
    return <Datasource payload={payload} config={config} />;
  }

  if (name === "assistant") {
    return <Assistant payload={payload} config={config} />;
  }
};

export default PivotGraph;

const Datasource = ({ payload, config }) => {
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(null);

  const {
    data,
    error,
    isLoading: graphLoading,
    isFetching,
    refetch,
  } = useGetDataGraphQuery({
    ...payload,
    payload: {
      data_visualization_config: config,
    },
    skip: 0,
    limit: 10 * (page + 1),
  });

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

  if (graphLoading) {
    return (
      <div className="w-full h-64 bg-[#1E2022] rounded-md text-white min-h-full flex justify-center items-center">
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

          <span className="text-white sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  console.log("error", error);
  if (error || !chartData) {
    return (
      <div className="flex items-center justify-center h-64 overflow-y-auto text-white recent__bar">
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

          <p className="text-sm font-medium tracking-wider text-white/25">
            Invalid visualization. Please edit this graph
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="w-full h-full bg-[#1E2022] rounded-md text-white min-h-full flex justify-center  items-center">
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
        <div className="w-full h-full min-h-full bg-[#1E2022] relative group">
          <div className="w-full">
            <div
              className={`animate-full-width ${isFetching && "active"}`}
            ></div>
          </div>

          <NormalChart data={chartData} chartType={config?.graph_type} />

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

// const Assistant = ({ payload, config }) => {
//   const [page, setPage] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [chartData, setChartData] = useState(null);

//   const {
//     data,
//     error,
//     isLoading: graphLoading,
//     isFetching,
//     refetch,
//   } = useGetAssistantGraphQuery({
//     ...payload,
//     payload: {
//       data_visualization_config: config,
//     },
//     skip: 0,
//     limit: 10 * (page + 1),
//   });

//   useEffect(() => {
//     setIsLoading(true);

//     if (data) {
//       const yAxis = Object.keys(data?.y_axis)?.map((key) => ({
//         label: key,
//         data: data?.y_axis[key],
//       }));

//       const chartSchema = {
//         labels: data.x_axis || [],
//         datasets: yAxis,
//       };

//       setChartData(chartSchema);
//       setIsLoading(false);
//     } else {
//       setChartData(null);
//       setIsLoading(false);
//     }
//   }, [data, config]);

//   const handleZoomIn = () => {
//     if (isFetching || page == 0) return;
//     setPage(page - 1);
//   };

//   const handleZoomOut = () => {
//     if (isFetching || page == MAX_PAGE) return;
//     setPage(page + 1);
//   };

//   if (graphLoading) {
//     return (
//       <div className="flex items-center justify-center w-full h-full min-h-full text-white rounded-md">
//         <div role="status">
//           <svg
//             aria-hidden="true"
//             className="w-5 h-5 animate-spin text-white fill-[#295EF4]"
//             viewBox="0 0 100 101"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
//               fill="currentColor"
//             />
//             <path
//               d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
//               fill="currentFill"
//             />
//           </svg>

//           <span className="sr-only">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error || !chartData) {
//     return (
//       <div className="flex items-center justify-center h-64 overflow-y-auto text-white recent__bar">
//         <div className="flex flex-col items-center justify-center w-full h-full space-y-4 text-center">
//           <span className="flex items-center justify-center">
//             <svg
//               viewBox="0 0 48 48"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-6 h-6 fill-white/25"
//             >
//               <path d="M10.6667 37.3333H16V18.6667H10.6667V37.3333ZM21.3333 37.3333H26.6667V10.6667H21.3333V37.3333ZM32 37.3333H37.3333V26.6667H32V37.3333ZM5.33333 48C3.86667 48 2.61111 47.4778 1.56667 46.4333C0.522222 45.3889 0 44.1333 0 42.6667V5.33333C0 3.86667 0.522222 2.61111 1.56667 1.56667C2.61111 0.522222 3.86667 0 5.33333 0H42.6667C44.1333 0 45.3889 0.522222 46.4333 1.56667C47.4778 2.61111 48 3.86667 48 5.33333V42.6667C48 44.1333 47.4778 45.3889 46.4333 46.4333C45.3889 47.4778 44.1333 48 42.6667 48H5.33333ZM5.33333 42.6667H42.6667V5.33333H5.33333V42.6667Z" />
//             </svg>
//           </span>

//           <p className="text-sm font-medium tracking-wider text-white/25">
//             Invalid visualization. Please edit this graph
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full h-full">
//       {isLoading && (
//         <div className="flex items-center justify-center w-full h-full min-h-full text-white rounded-md">
//           <div role="status">
//             <svg
//               aria-hidden="true"
//               className="w-5 h-5 animate-spin text-white fill-[#295EF4]"
//               viewBox="0 0 100 101"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
//                 fill="currentColor"
//               />
//               <path
//                 d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
//                 fill="currentFill"
//               />
//             </svg>

//             <span className="sr-only">Loading...</span>
//           </div>
//         </div>
//       )}

//       {!isLoading && (
//         <div className="w-full h-full min-h-full px-3 relative group border-t border-border-color">
//           <div className="w-full">
//             <div
//               className={`animate-full-width ${isFetching && "active"}`}
//             ></div>
//           </div>

//           <NormalChart data={chartData} chartType={config?.graph_type} />

//           <div
//             className="absolute z-50 flex-col hidden space-y-2 top-2 group-hover:flex right-3"
//             onMouseDown={(e) => e.stopPropagation()}
//           >
//             <span
//               className="flex items-center justify-center"
//               onClick={handleZoomIn}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 className={`w-5 h-5 fill-secondary-text hover:fill-primary-text ${
//                   page === 0 || isFetching ? "cursor-default" : "cursor-pointer"
//                 }`}
//               >
//                 <path d="M10 2c-4.411 0-8 3.589-8 8s3.589 8 8 8a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8zm4 9h-3v3H9v-3H6V9h3V6h2v3h3v2z"></path>
//               </svg>
//             </span>

//             <span
//               className="flex items-center justify-center"
//               onClick={handleZoomOut}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 className={`w-5 h-5 fill-secondary-text hover:fill-primary-text ${
//                   page === MAX_PAGE || isFetching
//                     ? "cursor-default"
//                     : "cursor-pointer"
//                 }`}
//               >
//                 <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zM6 9h8v2H6V9z"></path>
//               </svg>
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// Some constant if you have a max page, etc.

const Assistant = ({ payload, config }) => {
  const [page, setPage] = useState(0);

  // 1) Manual states instead of RTK Query
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(null);

  // 2) useEffect to call our Next.js API route
  useEffect(() => {
    // Build request body similar to your RTK config
    //   skip=0, limit=10*(page+1), plus payload & config
    const body = {
      message_id: payload?.message_id,
      event_id: payload?.event_id,
      skip: 0,
      limit: 10 * (page + 1),
      payload: {
        data_visualization_config: config,
      },
    };

    // If we have missing IDs, skip
    if (!body.message_id || !body.event_id) {
      setData(null);
      setError("Missing message_id or event_id");
      return;
    }

    (async () => {
      try {
        setGraphLoading(true);
        setIsFetching(true);
        setData(null);
        setError(null);

        const response = await fetch("/api/getAssistantGraph", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message || "Error fetching data");
      } finally {
        setGraphLoading(false);
        setIsFetching(false);
      }
    })();
  }, [payload, config, page]);

  // 3) Derive chartData from `data` in another effect
  useEffect(() => {
    setIsLoading(true);

    if (data) {
      // build chart data
      const yAxis = Object.keys(data?.y_axis || {}).map((key) => ({
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

  // 4) Zoom In/Out
  const handleZoomIn = () => {
    if (isFetching || page === 0) return;
    setPage(page - 1);
  };

  const handleZoomOut = () => {
    if (isFetching || page === MAX_PAGE) return;
    setPage(page + 1);
  };

  // 5) Loading state
  if (graphLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-full text-white rounded-md">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-5 h-5 animate-spin text-white fill-[#295EF4]"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 
                 50 100.591C22.3858 100.591 0 
                 78.2051 0 50.5908C0 22.9766 
                 22.3858 0.59082 50 0.59082C77.6142 
                 0.59082 100 22.9766 100 50.5908ZM9.08144 
                 50.5908C9.08144 73.1895 27.4013 
                 91.5094 50 91.5094C72.5987 91.5094 
                 90.9186 73.1895 90.9186 50.5908C90.9186 
                 27.9921 72.5987 9.67226 50 9.67226C27.4013 
                 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 
                 38.4038 97.8624 35.9116 97.0079 
                 33.5539C95.2932 28.8227 92.871 
                 24.3692 89.8167 20.348C85.8452 
                 15.1192 80.8826 10.7238 75.2124 
                 7.41289C69.5422 4.10194 63.2754 
                 1.94025 56.7698 1.05124C51.7666 
                 0.367541 46.6976 0.446843 41.7345 
                 1.27873C39.2613 1.69328 37.813 
                 4.19778 38.4501 6.62326C39.0873 
                 9.04874 41.5694 10.4717 44.0505 
                 10.1071C47.8511 9.54855 51.7191 
                 9.52689 55.5402 10.0491C60.8642 
                 10.7766 65.9928 12.5457 70.6331 
                 15.2552C75.2735 17.9648 79.3347 
                 21.5619 82.5849 25.841C84.9175 
                 28.9121 86.7997 32.2913 88.1811 
                 35.8758C89.083 38.2158 91.5421 
                 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // 6) Error or empty chart
  if (error || !chartData) {
    return (
      <div className="flex items-center justify-center h-64 overflow-y-auto text-white recent__bar">
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

          <p className="text-sm font-medium tracking-wider text-white/25">
            Invalid visualization. Please edit this graph
          </p>
        </div>
      </div>
    );
  }

  // 7) If not loading/error, render the chart
  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="flex items-center justify-center w-full h-full min-h-full text-white rounded-md">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-5 h-5 animate-spin text-white fill-[#295EF4]"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 
                   77.6142 100.591 50 100.591C22.3858 
                   100.591 0 78.2051 0 50.5908C0 
                   22.9766 22.3858 0.59082 50 
                   0.59082C77.6142 0.59082 100 
                   22.9766 100 50.5908ZM9.08144 
                   50.5908C9.08144 73.1895 27.4013 
                   91.5094 50 91.5094C72.5987 
                   91.5094 90.9186 73.1895 90.9186 
                   50.5908C90.9186 27.9921 72.5987 
                   9.67226 50 9.67226C27.4013 9.67226 
                   9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 
                   38.4038 97.8624 35.9116 97.0079 
                   33.5539C95.2932 28.8227 92.871 
                   24.3692 89.8167 20.348C85.8452 
                   15.1192 80.8826 10.7238 75.2124 
                   7.41289C69.5422 4.10194 63.2754 
                   1.94025 56.7698 1.05124C51.7666 
                   0.367541 46.6976 0.446843 41.7345 
                   1.27873C39.2613 1.69328 37.813 
                   4.19778 38.4501 6.62326C39.0873 
                   9.04874 41.5694 10.4717 44.0505 
                   10.1071C47.8511 9.54855 51.7191 
                   9.52689 55.5402 10.0491C60.8642 
                   10.7766 65.9928 12.5457 70.6331 
                   15.2552C75.2735 17.9648 79.3347 
                   21.5619 82.5849 25.841C84.9175 
                   28.9121 86.7997 32.2913 88.1811 
                   35.8758C89.083 38.2158 91.5421 
                   39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="w-full h-full min-h-full px-3 relative group border-t border-border-color">
          <div className="w-full">
            <div
              className={`animate-full-width ${isFetching ? "active" : ""}`}
            ></div>
          </div>

          {/* Example usage of NormalChart with chartData */}
          <NormalChart data={chartData} chartType={config?.graph_type} />

          {/* Zoom Buttons */}
          <div
            className="absolute z-50 flex-col hidden space-y-2 top-2 group-hover:flex right-3"
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
                <path
                  d="M10 2c-4.411 0-8 3.589-8 8s3.589 8 8 8a7.952 
                  7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 
                  7.952 0 0 0 18 10c0-4.411-3.589-8-8-8zm4 9h-3v3H9v-3H6V9h3V6h2v3h3v2z"
                />
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
                <path
                  d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 
                  4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 
                  10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 
                  8zM6 9h8v2H6V9z"
                />
              </svg>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
