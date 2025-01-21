import React, { useCallback, useEffect, useState } from "react";
import ColumnTable from "../common/ColumnTable";
import {
  useExecuteSqlDatasourceQueryQuery,
  useRefreshGraphEventQuery,
} from "@/store/datasource";
import { useRefreshAssistantGraphQuery } from "@/store/assistant";
import ResizableTable from "../common/ResizableTable";
import { useTheme } from "@/hooks/useTheme";

const PivotGraphTable = ({ name = "datasource", payload = {} }) => {
  if (name === "datasource") {
    return <Datasource payload={payload} />;
  }

  if (name === "assistant") {
    return <Assistant payload={payload} />;
  }
};

export default PivotGraphTable;

const Datasource = ({ payload }) => {
  const PER_PAGE_LIMIT = 10;
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [dataframe, setDataframe] = useState({});
  const [columnsData, setColumnsData] = useState([]);
  const [tableData, setTableData] = useState([]);

  const handleNext = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const handlePrevious = useCallback(() => {
    setPage((prev) => prev - 1);
  }, []);

  const { sql_cmd, datasource_id, ...queryPayload } = payload;

  const shouldSkipRefreshGraphEvent = Boolean(sql_cmd);
  const shouldSkipExecuteSql = !Boolean(sql_cmd);

  // const { data, error, isLoading, isFetching } = useRefreshGraphEventQuery(
  //   {
  //     ...queryPayload,
  //     skip: page * PER_PAGE_LIMIT,
  //     limit: PER_PAGE_LIMIT,
  //   },
  //   { skip: sql_cmd }
  // );

  // const { data, error, isLoading, isFetching } = useExecuteSqlDatasourceQueryQuery(
  //   {
  //    datasource_id: payload.datasource_id,
  //     payload: {
  //       query: sql_cmd,
  //     },
  //     skip: page * PER_PAGE_LIMIT,
  //     limit: PER_PAGE_LIMIT,
  //   },
  //   { skip: !sql_cmd }
  // );

  const {
    data: refreshData,
    error: refreshError,
    isLoading: refreshIsLoading,
    isFetching: refreshIsFetching,
  } = useRefreshGraphEventQuery(
    {
      ...queryPayload,
      skip: page * PER_PAGE_LIMIT,
      limit: PER_PAGE_LIMIT,
    },
    { skip: shouldSkipRefreshGraphEvent }
  );

  // Hook for executing SQL datasource (skipped if sql_cmd is absent)
  const {
    data: executeData,
    error: executeError,
    isLoading: executeIsLoading,
    isFetching: executeIsFetching,
  } = useExecuteSqlDatasourceQueryQuery(
    {
      datasource_id: payload.datasource_id,
      payload: {
        query: sql_cmd,
      },
      skip: page * PER_PAGE_LIMIT,
      limit: PER_PAGE_LIMIT,
    },
    { skip: shouldSkipExecuteSql }
  );

  const data = sql_cmd ? executeData : refreshData;
  const error = sql_cmd ? executeError : refreshError;
  const isLoading = sql_cmd ? executeIsLoading : refreshIsLoading;
  const isFetching = sql_cmd ? executeIsFetching : refreshIsFetching;

  const formatDataForReactTable = (dataframe) => {
    if (!dataframe || typeof dataframe !== "object") {
      return { tableData: [], columnsData: [] };
    }

    const keys = Object.keys(dataframe);
    const numRows = dataframe[keys[0]].length;

    const tableData = [];

    for (let i = 0; i < numRows; i++) {
      let row = {};
      keys.forEach((key) => {
        row[key] = dataframe[key][i];
      });
      tableData.push(row);
    }

    const columnsData = keys.map((key) => ({
      accessorKey: key,
      header: key,
      size: 150,
      minSize: 150,
    }));

    return { tableData, columnsData };
  };

  useEffect(() => {
    if (data) {
      // data[Object.keys(data)[0]]?.length < PER_PAGE_LIMIT
      //   ? setIsLastPage(true)
      //   : setIsLastPage(false);

      const isDataframeLessThanLimit =
        Object.values(data.dataframe)[0]?.length < PER_PAGE_LIMIT;
      setIsLastPage(isDataframeLessThanLimit);

      const dataframe = data?.dataframe;
      setDataframe(dataframe);

      if (dataframe) {
        const { tableData, columnsData } = formatDataForReactTable(dataframe);
        setTableData(tableData);
        setColumnsData(columnsData);
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full rounded-md min-h-64 text-primary-text">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-5 h-5 animate-spin text-primary-text fill-[#295EF4]"
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 overflow-y-auto text-primary-text recent__bar">
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

          <p className="text-sm font-medium tracking-wider text-secondary-text">
            Invalid visualization. Please edit this graph
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-secondary-bg">
      {/* <div className="w-full h-full overflow-y-auto recent__bar">
        <ColumnTable data={data ? dataframe : {}} />
      </div> */}

      <ResizableTable
        columnsData={columnsData}
        tableData={tableData}
        currentPage={page}
        perPageLimit={PER_PAGE_LIMIT}
      />

      <div
        className="flex items-center justify-between w-full h-10 px-2 outline-color"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="flex items-center py-1 space-x-2 text-xs font-medium tracking-wider text-secondary-text group hover:text-primary-text disabled:cursor-not-allowed"
          disabled={page == 0 || isFetching}
          onClick={handlePrevious}
        >
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 5 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-2.5 h-2.5 stroke-secondary-text group-hover:stroke-primary-text"
            >
              <path
                d="M4.25 1L1.25 4L4.25 7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span>Previous</span>
        </button>

        <div>
          <span className="text-xs font-medium tracking-wider text-secondary-text">
            {isFetching ? "Loading..." : `Page ${page + 1}`}
          </span>
        </div>

        <button
          type="button"
          className="right-0 flex items-center py-1 space-x-2 text-xs font-medium tracking-wider text-secondary-text group hover:text-primary-text disabled:cursor-not-allowed"
          disabled={isLastPage || isFetching}
          onClick={handleNext}
        >
          <span>Next</span>

          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 5 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-2.5 h-2.5 stroke-secondary-text group-hover:stroke-primary-text"
            >
              <path
                d="M0.75 1L3.75 4L0.75 7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

// const Assistant = ({ payload }) => {
//   const PER_PAGE_LIMIT = 10;
//   const [page, setPage] = useState(0);
//   const [isLastPage, setIsLastPage] = useState(false);
//   const [dataframe, setDataframe] = useState({});
//   const [columnsData, setColumnsData] = useState([]);
//   const [tableData, setTableData] = useState([]);

//   const handleNext = useCallback(() => {
//     setPage((prev) => prev + 1);
//   }, []);
//   const { theme } = useTheme();
//   const handlePrevious = useCallback(() => {
//     setPage((prev) => prev - 1);
//   }, []);

//   // const { data, error, isLoading, isFetching } = useRefreshAssistantGraphQuery({
//   //   ...payload,
//   //   skip: page * PER_PAGE_LIMIT,
//   //   limit: PER_PAGE_LIMIT,
//   // });

//   const { sql_cmd, ...queryPayload } = payload;

//   const shouldSkipRefreshGraphEvent = Boolean(sql_cmd);
//   const shouldSkipExecuteSql = !Boolean(sql_cmd);

//   const {
//     data: refreshData,
//     error: refreshError,
//     isLoading: refreshIsLoading,
//     isFetching: refreshIsFetching,
//   } = useRefreshAssistantGraphQuery(
//     {
//       ...queryPayload,
//       skip: page * PER_PAGE_LIMIT,
//       limit: PER_PAGE_LIMIT,
//     },
//     { skip: shouldSkipRefreshGraphEvent }
//   );

//   // Hook for executing SQL datasource (skipped if sql_cmd is absent)
//   const {
//     data: executeData,
//     error: executeError,
//     isLoading: executeIsLoading,
//     isFetching: executeIsFetching,
//   } = useExecuteSqlDatasourceQueryQuery(
//     {
//       datasource_id: payload.datasource_id,
//       payload: {
//         query: sql_cmd,
//       },
//       skip: page * PER_PAGE_LIMIT,
//       limit: PER_PAGE_LIMIT,
//     },
//     { skip: shouldSkipExecuteSql }
//   );

//   const data = sql_cmd ? executeData : refreshData;
//   const error = sql_cmd ? executeError : refreshError;
//   const isLoading = sql_cmd ? executeIsLoading : refreshIsLoading;
//   const isFetching = sql_cmd ? executeIsFetching : refreshIsFetching;

//   const formatDataForReactTable = (dataframe) => {
//     if (!dataframe || typeof dataframe !== "object") {
//       return { tableData: [], columnsData: [] };
//     }

//     const keys = Object.keys(dataframe);
//     const numRows = dataframe[keys[0]].length;

//     const tableData = [];

//     for (let i = 0; i < numRows; i++) {
//       let row = {};
//       keys.forEach((key) => {
//         row[key] = dataframe[key][i];
//       });
//       tableData.push(row);
//     }

//     const columnsData = keys.map((key) => ({
//       accessorKey: key,
//       header: key,
//       size: 150,
//       minSize: 150,
//     }));

//     return { tableData, columnsData };
//   };

//   useEffect(() => {
//     if (data) {
//       // data[Object.keys(data)[0]]?.length < PER_PAGE_LIMIT
//       //   ? setIsLastPage(true)
//       //   : setIsLastPage(false);

//       const isDataframeLessThanLimit =
//         Object.values(data.dataframe)[0]?.length < PER_PAGE_LIMIT;
//       setIsLastPage(isDataframeLessThanLimit);

//       const dataframe = data?.dataframe;
//       setDataframe(dataframe);

//       if (dataframe) {
//         const { tableData, columnsData } = formatDataForReactTable(dataframe);
//         setTableData(tableData);
//         setColumnsData(columnsData);
//       }
//     }
//   }, [data]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center w-full rounded-md min-h-64 text-primary-text">
//         <div role="status">
//           <svg
//             aria-hidden="true"
//             className="w-5 h-5 animate-spin text-primary-text fill-[#295EF4]"
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

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 overflow-y-auto text-primary-text recent__bar">
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

//           <p className="text-sm font-medium tracking-wider text-secondary-text">
//             Invalid visualization. Please edit this graph
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`flex flex-col justify-between w-full h-full  rounded-x-md rounded-b-md ${
//         theme === "dark" ? "bg-secondary-bg" : ""
//       }`}
//     >
//       {/* <div className="w-full h-full overflow-y-auto recent__bar">
//         <ColumnTable data={data ? dataframe : {}} />
//       </div> */}

//       <ResizableTable
//         columnsData={columnsData}
//         tableData={tableData}
//         currentPage={page}
//         perPageLimit={PER_PAGE_LIMIT}
//       />

//       <div
//         className="flex items-center justify-between w-full h-10 px-2 space-x-4 rounded-x-md rounded-b-md bg-secondary-bg"
//         onMouseDown={(e) => e.stopPropagation()}
//       >
//         <button
//           type="button"
//           className="flex items-center py-1 space-x-2 text-xs font-medium tracking-wider text-secondary-text group hover:text-primary-text disabled:cursor-not-allowed"
//           disabled={page == 0 || isFetching}
//           onClick={handlePrevious}
//         >
//           <span className="flex items-center justify-center">
//             <svg
//               viewBox="0 0 5 8"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-2.5 h-2.5 stroke-secondary-text group-hover:stroke-primary-text"
//             >
//               <path
//                 d="M4.25 1L1.25 4L4.25 7"
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//               />
//             </svg>
//           </span>
//           <span>Previous</span>
//         </button>

//         <div className="mb-1">
//           <span className="text-xs font-medium tracking-wider text-secondary-text ">
//             {isFetching ? "Loading..." : `Page ${page + 1}`}
//           </span>
//         </div>

//         <button
//           type="button"
//           className="right-0 flex items-center py-1 space-x-2 text-xs font-medium tracking-wider text-secondary-text group hover:text-primary-text disabled:cursor-not-allowed"
//           disabled={isLastPage || isFetching}
//           onClick={handleNext}
//         >
//           <span>Next</span>

//           <span className="flex items-center justify-center">
//             <svg
//               viewBox="0 0 5 8"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-2.5 h-2.5 stroke-secondary-text group-hover:stroke-primary-text"
//             >
//               <path
//                 d="M0.75 1L3.75 4L0.75 7"
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//               />
//             </svg>
//           </span>
//         </button>
//       </div>
//     </div>
//   );
// };

const PER_PAGE_LIMIT = 10;

const Assistant = ({ payload }) => {
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [dataframe, setDataframe] = useState({});
  const [columnsData, setColumnsData] = useState([]);
  const [tableData, setTableData] = useState([]);

  // 1) Local states to handle "refresh" data, errors, loading, etc.
  const [refreshData, setRefreshData] = useState(null);
  const [refreshError, setRefreshError] = useState(null);
  const [refreshIsLoading, setRefreshIsLoading] = useState(false);
  const [refreshIsFetching, setRefreshIsFetching] = useState(false);

  // from your theme hook
  const { theme } = useTheme();

  // Next / Prev page
  const handleNext = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);
  const handlePrevious = useCallback(() => {
    setPage((prev) => prev - 1);
  }, []);

  // 2) Extract "sql_cmd" from payload to decide how to fetch data
  const { sql_cmd, ...queryPayload } = payload;
  const shouldSkipRefreshGraphEvent = Boolean(sql_cmd); // if sql_cmd is present, skip
  const shouldSkipExecuteSql = !Boolean(sql_cmd); // if sql_cmd is absent, skip

  // 3) For SQL commands: Use the existing RTK query
  const {
    data: executeData,
    error: executeError,
    isLoading: executeIsLoading,
    isFetching: executeIsFetching,
  } = useExecuteSqlDatasourceQueryQuery(
    {
      datasource_id: payload.datasource_id,
      payload: {
        query: sql_cmd,
      },
      skip: page * PER_PAGE_LIMIT,
      limit: PER_PAGE_LIMIT,
    },
    { skip: shouldSkipExecuteSql }
  );

  // 4) Manually fetch from our Next.js API route instead of useRefreshAssistantGraphQuery
  useEffect(() => {
    // If we do have sql_cmd, we skip refreshing graph
    // (meaning we'll rely on the executeSqlDatasourceQueryQuery)
    if (!shouldSkipRefreshGraphEvent) {
      (async () => {
        try {
          setRefreshIsLoading(true);
          setRefreshIsFetching(true);

          // Build the request body to match the route's expectations
          const body = {
            message_id: queryPayload.message_id,
            event_id: queryPayload.event_id,
            payload: queryPayload.payload,
            skip: page * PER_PAGE_LIMIT,
            limit: PER_PAGE_LIMIT,
          };

          // POST to our new route: /api/refreshAssistantGraph
          const response = await fetch("/api/refreshAssistantGraph", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            throw new Error(
              `Refresh request failed. Status: ${response.status}`
            );
          }

          const jsonData = await response.json();
          setRefreshData(jsonData);
          setRefreshError(null);
        } catch (err) {
          setRefreshError(err);
        } finally {
          setRefreshIsLoading(false);
          setRefreshIsFetching(false);
        }
      })();
    }
  }, [page]);

  // 5) Merge the "refresh" and "execute" results:
  //    If we have an SQL command, we use the "execute" data;
  //    otherwise we use the "refresh" data
  const data = sql_cmd ? executeData : refreshData;
  const error = sql_cmd ? executeError : refreshError;
  const isLoading = sql_cmd ? executeIsLoading : refreshIsLoading;
  const isFetching = sql_cmd ? executeIsFetching : refreshIsFetching;

  // 6) Utility to shape the returned dataframe into
  //    {tableData, columnsData} for your table
  const formatDataForReactTable = (df) => {
    if (!df || typeof df !== "object") {
      return { tableData: [], columnsData: [] };
    }

    const keys = Object.keys(df);
    if (keys.length === 0) return { tableData: [], columnsData: [] };

    // number of rows (assume all columns have same length)
    const numRows = df[keys[0]].length;
    const tableRows = [];

    for (let i = 0; i < numRows; i++) {
      let row = {};
      keys.forEach((k) => {
        row[k] = df[k][i];
      });
      tableRows.push(row);
    }

    const columnsArr = keys.map((k) => ({
      accessorKey: k,
      header: k,
      size: 150,
      minSize: 150,
    }));

    return { tableData: tableRows, columnsData: columnsArr };
  };

  // 7) Whenever data changes, update local table data
  useEffect(() => {
    if (data) {
      const df = data.dataframe || {};

      // Check if the first column has < PER_PAGE_LIMIT => last page
      const firstColumnArray = Object.values(df)[0] || [];
      setIsLastPage(firstColumnArray.length < PER_PAGE_LIMIT);

      setDataframe(df);

      const { tableData, columnsData } = formatDataForReactTable(df);
      setTableData(tableData);
      setColumnsData(columnsData);
    }
  }, [data]);

  // 8) Render states: loading, error, or table
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-64 text-primary-text">
        {/* Loading Spinner */}
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-5 h-5 animate-spin text-primary-text fill-[#295EF4]"
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 overflow-y-auto text-primary-text recent__bar">
        <div className="flex flex-col items-center justify-center w-full h-full space-y-4 text-center">
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 fill-white/25"
            >
              <path
                d="M10.6667 37.3333H16V18.6667H10.6667V37.3333ZM21.3333 37.3333H26.6667V10.6667H21.3333V37.3333ZM32 37.3333H37.3333V26.6667H32V37.3333ZM5.33333 48C3.86667 48 2.61111 47.4778 1.56667 46.4333C0.522222 45.3889 0 44.1333 0 42.6667V5.33333C0 3.86667 0.522222 2.61111 1.56667 1.56667C2.61111 0.522222 3.86667 0 
                5.33333 0H42.6667C44.1333 0 
                45.3889 0.522222 46.4333 
                1.56667C47.4778 2.61111 48 
                3.86667 48 5.33333V42.6667C48 
                44.1333 47.4778 45.3889 46.4333 
                46.4333C45.3889 47.4778 44.1333 
                48 42.6667 48H5.33333ZM5.33333 
                42.6667H42.6667V5.33333H5.33333V42.6667Z"
              />
            </svg>
          </span>

          <p className="text-sm font-medium tracking-wider text-secondary-text">
            Invalid visualization. Please edit this graph
          </p>
        </div>
      </div>
    );
  }

  // Finally, render your table (e.g. ResizableTable) + pagination
  return (
    <div
      className={`flex flex-col justify-between w-full h-full rounded-x-md 
        rounded-b-md ${theme === "dark" ? "bg-secondary-bg" : ""}`}
    >
      {/* Example table rendering (replace with your code) */}
      <ResizableTable
        columnsData={columnsData}
        tableData={tableData}
        currentPage={page}
        perPageLimit={PER_PAGE_LIMIT}
      />

      <div
        className="flex items-center justify-between w-full h-10 px-2 space-x-4 
          rounded-x-md rounded-b-md bg-secondary-bg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="flex items-center py-1 space-x-2 text-xs font-medium 
            tracking-wider text-secondary-text group hover:text-primary-text 
            disabled:cursor-not-allowed"
          disabled={page === 0 || isFetching}
          onClick={handlePrevious}
        >
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 5 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-2.5 h-2.5 stroke-secondary-text 
                group-hover:stroke-primary-text"
            >
              <path
                d="M4.25 1L1.25 4L4.25 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>Previous</span>
        </button>

        <div className="mb-1">
          <span className="text-xs font-medium tracking-wider text-secondary-text">
            {isFetching ? "Loading..." : `Page ${page + 1}`}
          </span>
        </div>

        <button
          type="button"
          className="right-0 flex items-center py-1 space-x-2 
            text-xs font-medium tracking-wider text-secondary-text 
            group hover:text-primary-text disabled:cursor-not-allowed"
          disabled={isLastPage || isFetching}
          onClick={handleNext}
        >
          <span>Next</span>
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 5 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-2.5 h-2.5 stroke-secondary-text 
                group-hover:stroke-primary-text"
            >
              <path
                d="M0.75 1L3.75 4L0.75 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};
