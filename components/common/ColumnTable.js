import { useTheme } from "@/hooks/useTheme";
import React, { useState } from "react";

const ColumnTable = ({ data }) => {
  const [pageNumber, setPageNumber] = useState(0);
  const { theme } = useTheme()
  const rowPerPage = 10;
  const pagesVisited = pageNumber * rowPerPage;

  const totalItems = data[Object.keys(data)[0]]?.length;
  const pageCount = Math.ceil(data[Object.keys(data)[0]]?.length / rowPerPage);

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const tableHeaders = Object.keys(data).map((key, index) => (
    <th
      key={index}
      className={`text-left px-3 text-xs h-7 font-normal overlay border border-border-color text-secondary-text whitespace-nowrap outline-color ${
        index === 0 ? "sticky top-0 left-0 " : "top-0"
      }`}
      style={{
        userSelect: "text !important", // Enable text selection
        background: "transparent", // Prevent background interference
        color: theme === 'dark' ? 'inherit' : "#414551"
      }}
    >
      {formatKey(key)}
    </th>
  ));

  const rows = (() => {
    // Determine the actual number of items available for the current page
    const totalItemsAvailable = Math.min(
      data[Object.keys(data)[0]]?.length - pagesVisited,
      rowPerPage
    );

    return Array.from({ length: totalItemsAvailable }).map((_, rowIndex) => {
      const absoluteIndex = pagesVisited + rowIndex;
      return (
        <tr key={rowIndex} className="outline-color">
          {Object.keys(data).map((key, colIndex) => (
            <td
              key={`${rowIndex}-${colIndex}`} // Update key to be unique per cell
              className={`px-3 h-7 text-xs text-left border border-border-color outline-color text-primary-text whitespace-nowrap ${
                colIndex === 0 ? "sticky left-0" : ""
              }`}
              style={{
                userSelect: "text !important", // Enable text selection
                background: "transparent", // Prevent background interference
                color: theme === 'dark' ? 'inherit' : "#414551"
              }}
            >
              {data[key][absoluteIndex] ?? "N/A"}
            </td>
          ))}
        </tr>
      );
    });
  })();

  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  return (
    <div
      // pb-32
      className="flex flex-col w-full h-full"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="relative flex flex-col w-full overflow-x-auto recent__bar">
        <table className="relative w-full min-w-full text-xs border-b divide-y-2 divide-border-color" 
          onMouseDown={(e) => e.stopPropagation()}>
          <thead className="sticky top-0 z-50 ltr:text-left rtl:text-right bg-secondary-bg">
            <tr>{tableHeaders}</tr>
          </thead>

          <tbody className="z-40 pb-10 divide-y divide-border-color bg-page outline-color">
            {rows}
          </tbody>
        </table>

        {/* <div className="sticky bottom-0 left-0 right-0 w-full">
          {totalItems > rowPerPage && (
            <div
              className="flex items-center justify-between w-full px-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                pageCount={pageCount}
                pageRangeDisplayed={3}
                onPageChange={changePage}
                containerClassName={
                  "bg-background w-full p-2 flex justify-start py-2 items-center text-primary-foreground             }
                pageClassName={
                  "h-8 w-8 rounded text-sm border-[1.5px] border-border cursor-pointer"
                }
                pageLinkClassName={
                  "w-full h-full flex justify-center items-center"
                }
                previousLinkClassName={
                  "text-sm font-medium font-Roboto tracking-widest"
                }
                nextLinkClassName={
                  "text-sm font-medium font-Roboto tracking-widest"
                }
                disabledClassName={"paginationDisabled"}
                activeClassName={
                  "h-8 w-8 rounded flex justify-center items-center text-sm bg-foreground text-muted border-none font-medium cursor-pointer"
                }
              />
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default ColumnTable;
