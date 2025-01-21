import React, { useCallback, useEffect, useState } from "react";
import { useRefreshGraphEventQuery } from "@/store/datasource";
import { useRefreshAssistantGraphQuery } from "@/store/assistant";
import ResizableTable from "../common/ResizableTable";

const NormalGraphTable = ({ name = "datasource", payload = {} }) => {
  if (name === "datasource") {
    return <Datasource payload={payload} />;
  }

  if (name === "assistant") {
    return <Assistant payload={payload} />;
  }
};

export default NormalGraphTable;

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

  const { data, error, isLoading, isFetching } = useRefreshGraphEventQuery({
    ...payload,
    skip: page * PER_PAGE_LIMIT,
    limit: PER_PAGE_LIMIT,
  });

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

const Assistant = ({ payload }) => {
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

  const { data, error, isLoading, isFetching } = useRefreshAssistantGraphQuery({
    ...payload,
    skip: page * PER_PAGE_LIMIT,
    limit: PER_PAGE_LIMIT,
  });

  const totalItems = dataframe[Object.keys(data?.dataframe || {})[0]]?.length;

  const tableHeaders = Object.keys(data?.dataframe || {}).map((key, index) => (
    <th
      key={index}
      className={`text-left px-3 text-xs h-7 font-normal overlay border border-border-color text-secondary-text whitespace-nowrap outline-color`}
    >
      {key}
    </th>
  ));

  console.log("data", data);

  const rows = (() => {
    const totalItems = data?.dataframe[Object.keys(dataframe)[0]]?.length;

    return Array.from({ length: totalItems }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        {Object.keys(dataframe).map((key, colIndex) => (
          <td
            key={`${rowIndex}-${colIndex}`} // Update key to be unique per cell
            className="px-3 text-xs text-left border h-7 border-border-color outline-color text-primary-text whitespace-nowrap"
          >
            {dataframe[key][rowIndex] ?? "N/A"}
          </td>
        ))}
      </tr>
    ));
  })();

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
    <div className="flex flex-col justify-between w-full h-full bg-secondary-bg">
      {/* <ResizableTable
        columnsData={columnsData}
        tableData={tableData}
        currentPage={page}
        perPageLimit={PER_PAGE_LIMIT}
      /> */}

      <div className="flex flex-col w-full h-full overflow-x-auto recent__bar">
        <table className="w-full min-w-full text-xs border-b divide-y-2 divide-border-color">
          <thead className="sticky top-0 rounded-t-lg ltr:text-left rtl:text-right bg-primary">
            <tr>{tableHeaders}</tr>
          </thead>

          {totalItems > 0 && (
            <tbody className="pb-10 divide-y divide-border-color bg-primary outline-color">
              {rows}
            </tbody>
          )}
        </table>

        {totalItems > 0 || (
          <div className="flex items-center justify-center w-full h-48 rounded-br-md rounded-bl-md bg-background">
            <div className="flex flex-col items-center justify-center w-full space-y-4">
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

              <span className="text-sm font-normal tracking-wide text-primary-text">
                No data generated
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-between w-full h-10 px-2 space-x-4 rounded-bl-md rounded-br-md bg-secondary-bg"
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

        <div className="mb-1">
          <span className="text-xs font-medium tracking-wider text-secondary-text ">
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
