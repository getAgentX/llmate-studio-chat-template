import React, { useCallback, useEffect, useState } from "react";
import ResizableTable from "../common/ResizableTable";
import {
  useExecuteSqlQueryMutation,
  useRefreshGraphEventQuery,
} from "@/store/datasource";
import { useRouter } from "next/router";

const DatasourceResizableTable = ({
  payload,
  dataframe: dataframeTable,
  setDataframe,
  resetKey,
  executeSqlLoading = false,
  sqlQueryError = false,
  sqlRunQuery = "",
}) => {
  const PER_PAGE_LIMIT = 10;
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [columnsData, setColumnsData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    setPage(0);
    setIsLastPage(false);
    setColumnsData([]);
    setTableData([]);
    setTotalRows(0);
  }, [resetKey]);

  const router = useRouter();

  const [executeSqlQuery, { isLoading, error }] = useExecuteSqlQueryMutation();

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
    }));

    return { tableData, columnsData };
  };

  const getTableDataframe = (pageNum) => {
    executeSqlQuery({
      datasource_id: payload.datasource_id,
      payload: {
        query: sqlRunQuery,
      },
      skip: pageNum * PER_PAGE_LIMIT,
      limit: PER_PAGE_LIMIT,
    }).then((response) => {
      if (response.data) {
        const { tableData, columnsData } = formatDataForReactTable(
          response.data.dataframe
        );
        setTableData(tableData);
        setColumnsData(columnsData);
        setDataframe(response.data.dataframe);

        if (response.data) {
          const totalRows =
            Object.values(response.data.dataframe)[0]?.length || 0;
          setIsLastPage((page + 1) * PER_PAGE_LIMIT > totalRows);
        }
      }

      if (response.error) {
      }
    });
  };

  useEffect(() => {
    setPage(0);
    setIsLastPage(false);
    setColumnsData([]);
    setTableData([]);
    const isDataframeAvailable = Object.keys(dataframeTable).length;

    if (isDataframeAvailable > 0) {
      const { tableData, columnsData } =
        formatDataForReactTable(dataframeTable);

      setTableData(tableData);
      setColumnsData(columnsData);

      const totalRows = Object.values(dataframeTable)[0]?.length || 0;
      setIsLastPage((page + 1) * PER_PAGE_LIMIT > totalRows);
    } else {
      getTableDataframe(0);
    }
  }, [dataframeTable]);

  const handleNext = useCallback(() => {
    setPage((prev) => {
      getTableDataframe(prev + 1);
      return prev + 1;
    });
  }, []);

  const handlePrevious = useCallback(() => {
    setPage((prev) => {
      getTableDataframe(prev - 1);
      return prev - 1;
    });
  }, []);

  if (executeSqlLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-md text-primary-text bg-page">
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

  function removeNewlines(input) {
    return input.replace(/\n/g, "");
  }

  const cleanedText = removeNewlines(error?.data?.message || "");

  if (error || sqlQueryError?.data) {
    return (
      <div className="flex items-center justify-center h-full overflow-y-auto text-primary-text recent__bar">
        <div className="flex flex-col items-center justify-center w-full h-full space-y-4 text-center">
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 fill-icon-color"
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
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-between w-full h-full">
      <div className="w-full pb-10 overflow-y-auto recent__bar">
        <ResizableTable
          columnsData={columnsData}
          tableData={tableData}
          currentPage={page}
          perPageLimit={PER_PAGE_LIMIT}
        />
      </div>

      <div
        className="sticky bottom-0 left-0 right-0 flex items-center justify-between w-full px-2 py-2 bg-page"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="flex items-center py-1 space-x-2 text-xs font-medium tracking-wider text-secondary-text group hover:text-primary-text disabled:cursor-not-allowed"
          disabled={page === 0 || isLoading}
          onClick={handlePrevious}
        >
          <span className="flex items-center justify-center">
            {/* Previous Icon */}
            <svg
              viewBox="0 0 5 8"
              fill="none"
              className="w-2.5 h-2.5 stroke-icon-color group-hover:stroke-icon-color-hover"
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

        <div>
          <span className="text-xs font-medium tracking-wider text-secondary-text">
            {isLoading ? "Loading..." : `Page ${page + 1}`}
          </span>
        </div>

        <button
          type="button"
          className="right-0 flex items-center py-1 space-x-2 text-xs font-medium tracking-wider text-secondary-text group hover:text-primary-text disabled:cursor-not-allowed"
          disabled={isLastPage || isLoading}
          onClick={handleNext}
        >
          <span>Next</span>

          <span className="flex items-center justify-center">
            {/* Next Icon */}
            <svg
              viewBox="0 0 5 8"
              fill="none"
              className="w-2.5 h-2.5 stroke-icon-color group-hover:stroke-icon-color-hover"
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

export default DatasourceResizableTable;
