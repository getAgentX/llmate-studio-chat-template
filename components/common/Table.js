import React, { useState } from "react";
import ReactPaginate from "react-paginate";

const Table = ({ data, length = 5 }) => {
  const [pageNumber, setPageNumber] = useState(0);

  const rowPerPage = length;
  const pagesVisited = pageNumber * rowPerPage;

  const totalItems = data[Object.keys(data)[0]]?.length;
  const pageCount = Math.ceil(data[Object.keys(data)[0]]?.length / rowPerPage);

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
      className="px-4 py-2 text-xs font-normal tracking-wide text-white border-t border-l border-r border-[#282828] whitespace-nowrap"
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
        <tr key={rowIndex}>
          {Object.keys(data).map((key, colIndex) => (
            <td
              key={`${rowIndex}-${colIndex}`} // Update key to be unique per cell
              className="px-4 py-2 text-xs bg-[#1A1C1D] tracking-wide border-r border-border text-white/40 whitespace-nowrap"
            >
              {data[key][absoluteIndex] ?? "N/A"}
            </td>
          ))}
        </tr>
      );
    });
  })();

  // const getAllDataForDownload = (fetchedData) => {
  //   if (!fetchedData) return [];

  //   const totalItemsAvailable =
  //     fetchedData[Object.keys(fetchedData)[0]]?.length;
  //   const formattedRows = Array.from({ length: totalItemsAvailable }).map(
  //     (_, rowIndex) => {
  //       return Object.keys(fetchedData).reduce((acc, key) => {
  //         acc[formatKey(key)] = fetchedData[key][rowIndex] ?? "N/A";
  //         return acc;
  //       }, {});
  //     }
  //   );

  //   return formattedRows;
  // };

  // const handleLoadTable = async () => {
  //   setDownloadLoading(true);

  //   const dataToDownload = data;

  //   const dataForDownload = getAllDataForDownload(dataToDownload);

  //   const worksheet = XLSX.utils.json_to_sheet(dataForDownload);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  //   XLSX.writeFile(workbook, "table-data.xlsx");

  //   setDownloadLoading(false);
  // };

  return (
    <div className="flex flex-col w-full overflow-x-auto recent__bar">
      <table className="w-full min-w-full text-sm border-x border-b divide-y-2 rounded-md divide-border bg-[#181A1C] border-[#282828]">
        <thead className="ltr:text-left rtl:text-right bg-[#1A1C1D]">
          <tr>{tableHeaders}</tr>
        </thead>

        {totalItems > 0 && (
          <tbody className="divide-y divide-border">{rows}</tbody>
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
        {/* <div
          className="flex items-center w-full space-x-2 cursor-pointer text-white/40 hover:text-white"
          onClick={handleLoadTable}
        >
          {downloadLoading || (
            <span className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </span>
          )}

          {downloadLoading && (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-4 h-4 animate-spin text-border fill-white"
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
          )}

          <span className="text-sm ">Download Data</span>
        </div> */}

        {totalItems > 0 && (
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            pageCount={pageCount}
            pageRangeDisplayed={3}
            onPageChange={changePage}
            containerClassName={
              "w-full px-2 py-2 flex justify-end items-center text-white gap-x-2"
            }
            pageClassName={"h-8 w-8 rounded-full text-sm cursor-pointer"}
            pageLinkClassName={"w-full h-full flex justify-center items-center"}
            previousLinkClassName={
              "text-sm font-normal font-Roboto tracking-widest text-white/40 hover:text-white select-none"
            }
            nextLinkClassName={
              "text-sm font-normal font-Roboto tracking-widest text-white/40 hover:text-white select-none"
            }
            disabledClassName={"paginationDisabled"}
            activeClassName={
              "h-8 w-8 rounded-full flex justify-center items-center text-sm bg-[#26282D] text-muted border-none font-normal cursor-pointer"
            }
          />
        )}
      </div>
    </div>
  );
};

export default Table;
