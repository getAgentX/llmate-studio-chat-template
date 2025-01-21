import React, { useState } from "react";
import ChartComponent from "./ChartComponent";
import Table from "./Table";
import SelectOption from "./SelectOption";
import * as XLSX from "xlsx";
import { useTableContext } from "@/context/TableContext";
import FinetuningWidget from "../Datasource/FinetuningWidget";

const ChartCardInformation = ({
  data = {},
  showPin = false,
  runid = null,
  generationExecution = null,
  regenerateExecution = null,
}) => {
  const [currentTab, setCurrentTab] = useState("table");
  const [downloadLoading, setDownloadLoading] = useState(false);

  const { setTableData } = useTableContext();

  const options = [
    {
      value: "table",
      label: "Table",
    },
    {
      value: "chart",
      label: "Chart",
    },
  ];

  const handleSelect = (value) => {
    setCurrentTab(value.value);
  };

  const totalItems = data[Object.keys(data)[0]]?.length;

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

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
    setDownloadLoading(true);

    const dataToDownload = data;

    setTableData(dataToDownload);

    const dataForDownload = getAllDataForDownload(dataToDownload);

    const worksheet = XLSX.utils.json_to_sheet(dataForDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // XLSX.writeFile(workbook, `${messageId}.xlsx`);
    XLSX.writeFile(workbook, `table-data.xlsx`);

    setDownloadLoading(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-normal text-white">Data Response</p>

        {showPin && (
          <FinetuningWidget
            runid={runid}
            eventId={generationExecution?.dataframe || regenerateExecution?.id}
          />
        )}
      </div>

      <div className="w-full mx-auto space-y-6 text-white">
        <div className="flex flex-col px-4 py-4 space-y-4 bg-[#181A1C] rounded-md border border-border">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between border-b border-border">
              <div className="flex-wrap items-center hidden w-full sm:flex max-w-fit">
                <button
                  className={`text-xs pb-2 border-b-2 font-medium min-w-16 px-2 tracking-wider transition-colors duration-300 ${
                    currentTab === "table"
                      ? "text-accent border-secondary"
                      : "text-white/40 border-transparent"
                  }`}
                  onClick={() => setCurrentTab("table")}
                >
                  Table
                </button>

                <button
                  className={`text-xs pb-2 border-b font-medium min-w-16 px-2 tracking-wider  transition-colors duration-300 ${
                    currentTab === "chart"
                      ? "text-accent border-secondary"
                      : "text-white/40 border-transparent"
                  }`}
                  onClick={() => setCurrentTab("chart")}
                >
                  Chart
                </button>
              </div>

              {totalItems > 0 && (
                <div
                  className="flex items-center justify-end w-full pb-2 space-x-2 cursor-pointer text-white/40 hover:text-white"
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

                  <span className="text-xs ">Download Data</span>
                </div>
              )}
            </div>

            <div className="sm:hidden">
              <SelectOption options={options} onSelect={handleSelect} />
            </div>
          </div>

          {currentTab === "table" && <Table data={data} />}

          {currentTab === "chart" && <ChartComponent data={data} />}
        </div>
      </div>
    </div>
  );
};

export default ChartCardInformation;
