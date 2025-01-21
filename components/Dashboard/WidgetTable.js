import React, { useCallback, useEffect, useState } from "react";
import ColumnTable from "../common/ColumnTable";
import { useGetWidgetDataQuery } from "@/store/dashboard";

const WidgetTable = ({ dashboard_id, section_id, widget_id }) => {
  const PER_PAGE_LIMIT = 10;
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  const handleNext = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const handlePrevious = useCallback(() => {
    setPage((prev) => prev - 1);
  }, []);

  const { data, error, isLoading, isFetching } = useGetWidgetDataQuery({
    dashboard_id,
    section_id,
    widget_id,
    skip: page * PER_PAGE_LIMIT,
    limit: PER_PAGE_LIMIT,
  });

  useEffect(() => {
    if (data) {
      // data[Object.keys(data)[0]]?.length < PER_PAGE_LIMIT
      //   ? setIsLastPage(true)
      //   : setIsLastPage(false);

      const isDataframeLessThanLimit =
        Object.values(data)[0]?.length < PER_PAGE_LIMIT;
      setIsLastPage(isDataframeLessThanLimit);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full overflow-y-auto recent__bar bg-secondary-bg">
        <div className="flex items-center justify-center w-full h-full">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-6 h-6 animate-spin text-border fill-[#295EF4]"
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
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full overflow-y-auto text-white recent__bar">
        <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 fill-icon-color"
            >
              <path d="M10.6667 37.3333H16V18.6667H10.6667V37.3333ZM21.3333 37.3333H26.6667V10.6667H21.3333V37.3333ZM32 37.3333H37.3333V26.6667H32V37.3333ZM5.33333 48C3.86667 48 2.61111 47.4778 1.56667 46.4333C0.522222 45.3889 0 44.1333 0 42.6667V5.33333C0 3.86667 0.522222 2.61111 1.56667 1.56667C2.61111 0.522222 3.86667 0 5.33333 0H42.6667C44.1333 0 45.3889 0.522222 46.4333 1.56667C47.4778 2.61111 48 3.86667 48 5.33333V42.6667C48 44.1333 47.4778 45.3889 46.4333 46.4333C45.3889 47.4778 44.1333 48 42.6667 48H5.33333ZM5.33333 42.6667H42.6667V5.33333H5.33333V42.6667Z" />
            </svg>
          </span>

          <p className="text-sm font-medium tracking-wider text-center text-secondary-text">
            {error?.data?.message?.replace(/\n/g, "")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 grow">
      <div className="relative w-full h-full">
        <div className="w-full h-full overflow-y-auto recent__bar bg-secondary-bg">
          <ColumnTable data={data ? data : {}} />
        </div>

        <div
          className="sticky bottom-0 left-0 flex items-center justify-between w-full px-2 py-2 bg-primary"
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
                className="w-2.5 h-2.5 fill-icon-color hover:fill-icon-color-hover"
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
                className="w-2.5 h-2.5 fill-icon-color hover:fill-icon-color-hover"
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
    </div>
  );
};

export default WidgetTable;
