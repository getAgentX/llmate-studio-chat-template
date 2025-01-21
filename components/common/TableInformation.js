import React, { useState } from "react";

const TableInformation = ({ data = {} }) => {
  const totalItems = data[Object.keys(data)[0]]?.length;

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const tableHeaders = Object.keys(data).map((key, index) => (
    <th
      key={index}
      className="px-4 py-2 text-xs font-normal tracking-wide text-white border-t border-l border-r border-[#1F1F21] whitespace-nowrap"
    >
      {formatKey(key)}
    </th>
  ));

  const rows = (() => {
    const totalItems = data[Object.keys(data)[0]]?.length;

    return Array.from({ length: totalItems }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        {Object.keys(data).map((key, colIndex) => (
          <td
            key={`${rowIndex}-${colIndex}`}
            className="px-4 py-2 text-xs bg-primary tracking-wide border-r border-dropdown-border text-white/40 whitespace-nowrap"
          >
            {data[key][rowIndex] ?? "N/A"}
          </td>
        ))}
      </tr>
    ));
  })();

  return (
    <div className="flex flex-col space-y-2">
      <div className="w-full mx-auto space-y-6 text-white">
        <div className="flex flex-col px-4 py-4 space-y-6 bg-page rounded-md border border-border">
          <div className="flex flex-col w-full overflow-x-auto recent__bar">
            <table className="w-full min-w-full text-sm divide-y-2 rounded-md divide-[#171717] bg-[#2A2D34] ">
              <thead className="ltr:text-left rtl:text-right bg-outline-color">
                <tr>{tableHeaders}</tr>
              </thead>

              {totalItems > 0 && (
                <tbody className="divide-y divide-[#171717] bg-primary">
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

                  <span className="text-sm font-normal tracking-wide text-white">
                    No data generated
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableInformation;
