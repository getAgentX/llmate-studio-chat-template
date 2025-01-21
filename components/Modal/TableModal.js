import React, { useEffect, useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import * as XLSX from "xlsx";
import CommonChart from "../common/CommonChart";

const TableModal = ({ show, setShow, data = {} }) => {
  const [pageNumber, setPageNumber] = useState(0);
  const [toggleDataframe, setToggleDataframe] = useState(false);
  const [currentDataframe, setCurrentDataframe] = useState("table");

  const tableRef = useRef(null);

  const length = 10;

  const rowPerPage = length;
  const pagesVisited = pageNumber * rowPerPage;

  const totalItems = data[Object.keys(data)[0]]?.length;
  const pageCount = Math.ceil(data[Object.keys(data)[0]]?.length / rowPerPage);

  const handleOutsideClick = (e) => {
    if (tableRef.current && !tableRef.current.contains(e.target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const tableHeaders = Object.keys(data).map((key, index) => (
    <th
      key={index}
      className="!px-4 !py-2 text-xs font-normal tracking-wide !text-white border-t border-l border-r !border-[#30333C] whitespace-nowrap"
    >
      {formatKey(key)}
    </th>
  ));

  const rows = (() => {
    const totalItemsAvailable = Math.min(
      data[Object.keys(data)[0]]?.length - pagesVisited,
      rowPerPage
    );

    return Array.from({ length: totalItemsAvailable }).map((_, rowIndex) => {
      const absoluteIndex = pagesVisited + rowIndex;
      return (
        <tr key={rowIndex}>
          {Object.keys(data).map((key, colIndex) => (
            <td
              key={`${rowIndex}-${colIndex}`}
              className="!px-4 !py-2 text-xs !bg-[#26282D] tracking-wide border-r !border-[#30333C] !text-white/40 whitespace-nowrap"
            >
              {data[key][absoluteIndex] ?? "N/A"}
            </td>
          ))}
        </tr>
      );
    });
  })();

  const getAllDataForDownload = (fetchedData) => {
    if (!fetchedData) return [];

    const totalItemsAvailable =
      fetchedData[Object.keys(fetchedData)[0]]?.length;
    const formattedRows = Array.from({ length: totalItemsAvailable }).map(
      (_, rowIndex) => {
        return Object.keys(fetchedData).reduce((acc, key) => {
          acc[formatKey(key)] = fetchedData[key][rowIndex] ?? "N/A";
          return acc;
        }, {});
      }
    );

    return formattedRows;
  };

  const handleLoadTable = async () => {
    const dataToDownload = data;

    const dataForDownload = getAllDataForDownload(dataToDownload);

    const worksheet = XLSX.utils.json_to_sheet(dataForDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    XLSX.writeFile(workbook, `table-data.xlsx`);
  };

  const handleDataframeChange = (e) => {
    if (e.target.checked) {
      setCurrentDataframe("chart");
    } else {
      setCurrentDataframe("table");
    }

    setToggleDataframe(e.target.checked);
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 !z-[10000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        show || "hidden"
      }`}
    >
      <div
        className="relative flex flex-col w-full max-w-5xl p-2 space-y-4 rounded-lg bg-foreground"
        ref={tableRef}
      >
        <div className="relative flex items-center justify-between px-2 py-3 text-sm font-medium text-white border-b border-border">
          <span>TABLE - FULL VIEW</span>

          <span
            className="absolute flex items-center justify-center w-6 h-6 -translate-y-1/2 rounded-full cursor-pointer top-1/2 right-2 bg-background"
            onClick={() => setShow(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-white/60 hover:text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative flex items-center px-2 space-x-4">
            <span
              className={`text-sm font-medium ${
                currentDataframe === "table" ? "text-white" : "text-white/50"
              }`}
            >
              Table
            </span>

            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={toggleDataframe}
                value={toggleDataframe}
                className="sr-only peer"
                onChange={(e) => handleDataframeChange(e)}
              />
              <div className="relative w-11 h-6 bg-[#212327] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[#295EF4] after:border-[#295EF4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#212327]"></div>
            </label>

            <span
              className={`text-sm font-medium ${
                currentDataframe === "chart" ? "text-white" : "text-white/50"
              }`}
            >
              Chart
            </span>
          </div>

          {currentDataframe === "table" && (
            <div
              className="flex items-center justify-center space-x-2 cursor-pointer group"
              onClick={handleLoadTable}
            >
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 fill-secondary group-hover:fill-secondary-foreground"
                >
                  <path d="M5.99984 8.6665L2.6665 5.33317L3.59984 4.3665L5.33317 6.09984V0.666504H6.6665V6.09984L8.39984 4.3665L9.33317 5.33317L5.99984 8.6665ZM1.99984 11.3332C1.63317 11.3332 1.31928 11.2026 1.05817 10.9415C0.797059 10.6804 0.666504 10.3665 0.666504 9.99984V7.99984H1.99984V9.99984H9.99984V7.99984H11.3332V9.99984C11.3332 10.3665 11.2026 10.6804 10.9415 10.9415C10.6804 11.2026 10.3665 11.3332 9.99984 11.3332H1.99984Z" />
                </svg>
              </span>

              <span className="text-sm font-medium tracking-wider text-secondary group-hover:text-secondary-foreground">
                Download
              </span>
            </div>
          )}
        </div>

        {currentDataframe === "table" && (
          <div className="flex flex-col w-full h-full overflow-x-auto recent__bar min-h-60">
            <table className="w-full min-w-full text-sm border-x border-b divide-y-2 rounded-md !divide-border !bg-[#181A1C] !border-[#30333C]">
              <thead className="ltr:text-left rtl:text-right !bg-[#30333C]">
                <tr>{tableHeaders}</tr>
              </thead>

              {totalItems > 0 && (
                <tbody className="divide-y !divide-[#30333C]">{rows}</tbody>
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

                  <span className="text-sm font-normal tracking-wide text-white">
                    No data generated
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center">
              {totalItems > 0 && (
                <ReactPaginate
                  previousLabel={
                    <div className="flex items-center space-x-2 group">
                      <span className="flex items-center justify-center">
                        <svg
                          viewBox="0 0 12 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 fill-white/50 group-hover:fill-white"
                        >
                          <path d="M5.45131 9.99991C5.5502 9.99949 5.64674 9.96977 5.72874 9.91449C5.81073 9.8592 5.87449 9.78085 5.91195 9.68934C5.94941 9.59782 5.9589 9.49725 5.9392 9.40034C5.91951 9.30344 5.87153 9.21454 5.80131 9.14491L3.50131 6.85491C3.45445 6.80843 3.41725 6.75313 3.39187 6.6922C3.36648 6.63127 3.35342 6.56591 3.35342 6.49991C3.35342 6.4339 3.36648 6.36855 3.39187 6.30762C3.41725 6.24669 3.45445 6.19139 3.50131 6.14491L5.80131 3.85491C5.84818 3.80843 5.88538 3.75313 5.91076 3.6922C5.93614 3.63127 5.94921 3.56591 5.94921 3.49991C5.94921 3.4339 5.93614 3.36855 5.91076 3.30762C5.88538 3.24669 5.84818 3.19139 5.80131 3.14491C5.70763 3.05178 5.58091 2.99951 5.44881 2.99951C5.31672 2.99951 5.19 3.05178 5.09631 3.14491L2.80131 5.43991C2.52041 5.72116 2.36263 6.10241 2.36263 6.49991C2.36263 6.89741 2.52041 7.27866 2.80131 7.55991L5.09631 9.85491C5.14303 9.90125 5.19844 9.93791 5.25936 9.96279C5.32028 9.98768 5.38551 10.0003 5.45131 9.99991Z" />
                          <path d="M8.95132 9.99991C9.0502 9.99949 9.14674 9.96977 9.22874 9.91449C9.31073 9.8592 9.37449 9.78085 9.41195 9.68934C9.44941 9.59782 9.4589 9.49725 9.4392 9.40034C9.41951 9.30344 9.37153 9.21454 9.30131 9.14491L6.65632 6.49991L9.30131 3.85491C9.34818 3.80843 9.38538 3.75313 9.41076 3.6922C9.43615 3.63127 9.44921 3.56591 9.44921 3.49991C9.44921 3.4339 9.43615 3.36855 9.41076 3.30762C9.38538 3.24669 9.34818 3.19139 9.30131 3.14491C9.20763 3.05178 9.08091 2.99951 8.94881 2.99951C8.81672 2.99951 8.69 3.05178 8.59632 3.14491L5.59631 6.14491C5.54945 6.19139 5.51225 6.24669 5.48687 6.30762C5.46148 6.36855 5.44842 6.4339 5.44842 6.49991C5.44842 6.56591 5.46148 6.63127 5.48687 6.6922C5.51225 6.75313 5.54945 6.80843 5.59631 6.85491L8.59632 9.85491C8.64304 9.90125 8.69844 9.93791 8.75936 9.96279C8.82028 9.98768 8.88551 10.0003 8.95132 9.99991Z" />
                        </svg>
                      </span>

                      <span>Previous</span>
                    </div>
                  }
                  nextLabel={
                    <div className="flex items-center space-x-2 group">
                      <span>Next</span>

                      <span className="flex items-center justify-center">
                        <svg
                          viewBox="0 0 12 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 fill-white/50 group-hover:fill-white"
                        >
                          <path d="M6.54869 9.99991C6.4498 9.99949 6.35326 9.96977 6.27126 9.91449C6.18927 9.8592 6.12551 9.78085 6.08805 9.68934C6.05059 9.59782 6.0411 9.49725 6.0608 9.40034C6.08049 9.30344 6.12847 9.21454 6.19869 9.14491L8.49869 6.85491C8.54555 6.80843 8.58275 6.75313 8.60813 6.6922C8.63352 6.63127 8.64658 6.56591 8.64658 6.49991C8.64658 6.4339 8.63352 6.36855 8.60813 6.30762C8.58275 6.24669 8.54555 6.19139 8.49869 6.14491L6.19869 3.85491C6.15182 3.80843 6.11462 3.75313 6.08924 3.6922C6.06386 3.63127 6.05079 3.56591 6.05079 3.49991C6.05079 3.4339 6.06386 3.36855 6.08924 3.30762C6.11462 3.24669 6.15182 3.19139 6.19869 3.14491C6.29237 3.05178 6.41909 2.99951 6.55119 2.99951C6.68328 2.99951 6.81 3.05178 6.90369 3.14491L9.19869 5.43991C9.47959 5.72116 9.63737 6.10241 9.63737 6.49991C9.63737 6.89741 9.47959 7.27866 9.19869 7.55991L6.90369 9.85491C6.85697 9.90125 6.80156 9.93791 6.74064 9.96279C6.67972 9.98768 6.61449 10.0003 6.54869 9.99991Z" />
                          <path d="M3.04868 9.99991C2.9498 9.99949 2.85326 9.96977 2.77126 9.91449C2.68927 9.8592 2.62551 9.78085 2.58805 9.68934C2.55059 9.59782 2.5411 9.49725 2.5608 9.40034C2.58049 9.30344 2.62847 9.21454 2.69869 9.14491L5.34368 6.49991L2.69869 3.85491C2.65182 3.80843 2.61462 3.75313 2.58924 3.6922C2.56385 3.63127 2.55079 3.56591 2.55079 3.49991C2.55079 3.4339 2.56385 3.36855 2.58924 3.30762C2.61462 3.24669 2.65182 3.19139 2.69869 3.14491C2.79237 3.05178 2.91909 2.99951 3.05119 2.99951C3.18328 2.99951 3.31 3.05178 3.40368 3.14491L6.40369 6.14491C6.45055 6.19139 6.48775 6.24669 6.51313 6.30762C6.53852 6.36855 6.55158 6.4339 6.55158 6.49991C6.55158 6.56591 6.53852 6.63127 6.51313 6.6922C6.48775 6.75313 6.45055 6.80843 6.40369 6.85491L3.40368 9.85491C3.35696 9.90125 3.30156 9.93791 3.24064 9.96279C3.17972 9.98768 3.11449 10.0003 3.04868 9.99991Z" />
                        </svg>
                      </span>
                    </div>
                  }
                  pageCount={pageCount}
                  pageRangeDisplayed={3}
                  onPageChange={changePage}
                  containerClassName={
                    "w-full px-2 pt-3 pb-2 flex justify-center items-center text-white gap-x-2"
                  }
                  pageClassName={"h-8 w-8 rounded-full text-sm cursor-pointer"}
                  pageLinkClassName={
                    "w-full h-full flex justify-center items-center"
                  }
                  previousLinkClassName={
                    "text-sm font-normal font-Roboto tracking-widest text-white/40 hover:text-white select-none"
                  }
                  nextLinkClassName={
                    "text-sm font-normal font-Roboto tracking-widest text-white/40 hover:text-white select-none"
                  }
                  disabledClassName={"paginationDisabled"}
                  activeClassName={
                    "h-8 w-8 rounded-full flex justify-center items-center text-sm bg-[#30333C] text-muted border-none font-normal cursor-pointer"
                  }
                />
              )}
            </div>
          </div>
        )}

        {currentDataframe === "chart" && (
          <div className="min-h-96 max-h-[440px] h-full overflow-hidden scroll_popup w-full">
            {Object.keys(data).length > 0 && <CommonChart data={data} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableModal;
