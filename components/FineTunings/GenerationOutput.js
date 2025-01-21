import React, { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { stackoverflowDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import SqlErrorModal from "../Modal/SqlErrorModal";
import TableInformation from "../common/TableInformation";

const GenerationOutput = ({ eventStats }) => {
  const [editSqlTab, setEditSqlTab] = useState("sql");
  const [showSqlError, setShowSqlError] = useState(false);

  return (
    <>
      <div className="flex flex-col space-y-4 sm:space-y-6">
        {eventStats.generation?.steps_to_follow && (
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-normal text-white">Steps to follow</p>

            <textarea
              readOnly
              type="text"
              className="w-full px-4 py-3 overflow-y-auto text-sm text-white border rounded-md bg-[#181A1C] outline-none resize-none h-36 border-border placeholder:text-white/40 recent__bar"
              value={eventStats.generation.steps_to_follow}
            />
          </div>
        )}

        {eventStats.generation_execution && (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center w-full space-x-2">
                {eventStats.generation_execution?.sql && (
                  <a
                    className={`px-4 py-2 text-xs font-medium flex items-center space-x-2 justify-center tracking-wide cursor-pointer ${
                      editSqlTab === "sql"
                      ? "bg-page text-white  border-b-2 border-active-color"
                        : "text-white/40 "
                    }`}
                    onClick={() => setEditSqlTab("sql")}
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                      >
                        <path
                          d="M8.16667 11C8.3 11 8.41667 10.95 8.51667 10.85C8.61667 10.75 8.66667 10.6333 8.66667 10.5C8.66667 10.3667 8.61667 10.25 8.51667 10.15C8.41667 10.05 8.3 10 8.16667 10C8.03333 10 7.91667 10.05 7.81667 10.15C7.71667 10.25 7.66667 10.3667 7.66667 10.5C7.66667 10.6333 7.71667 10.75 7.81667 10.85C7.91667 10.95 8.03333 11 8.16667 11ZM10 11C10.1333 11 10.25 10.95 10.35 10.85C10.45 10.75 10.5 10.6333 10.5 10.5C10.5 10.3667 10.45 10.25 10.35 10.15C10.25 10.05 10.1333 10 10 10C9.86667 10 9.75 10.05 9.65 10.15C9.55 10.25 9.5 10.3667 9.5 10.5C9.5 10.6333 9.55 10.75 9.65 10.85C9.75 10.95 9.86667 11 10 11ZM11.8333 11C11.9667 11 12.0833 10.95 12.1833 10.85C12.2833 10.75 12.3333 10.6333 12.3333 10.5C12.3333 10.3667 12.2833 10.25 12.1833 10.15C12.0833 10.05 11.9667 10 11.8333 10C11.7 10 11.5833 10.05 11.4833 10.15C11.3833 10.25 11.3333 10.3667 11.3333 10.5C11.3333 10.6333 11.3833 10.75 11.4833 10.85C11.5833 10.95 11.7 11 11.8333 11ZM1.33333 12.5C0.966667 12.5 0.652778 12.3694 0.391667 12.1083C0.130556 11.8472 0 11.5333 0 11.1667V1.83333C0 1.46667 0.130556 1.15278 0.391667 0.891667C0.652778 0.630556 0.966667 0.5 1.33333 0.5H10.6667C11.0333 0.5 11.3472 0.630556 11.6083 0.891667C11.8694 1.15278 12 1.46667 12 1.83333V6.3C11.7889 6.2 11.5722 6.11389 11.35 6.04167C11.1278 5.96944 10.9 5.91667 10.6667 5.88333V1.83333H1.33333V11.1667H5.36667C5.4 11.4111 5.45278 11.6444 5.525 11.8667C5.59722 12.0889 5.68333 12.3 5.78333 12.5H1.33333ZM1.33333 10.5V11.1667V1.83333V5.88333V5.83333V10.5ZM2.66667 9.83333H5.38333C5.41667 9.6 5.46944 9.37222 5.54167 9.15C5.61389 8.92778 5.69444 8.71111 5.78333 8.5H2.66667V9.83333ZM2.66667 7.16667H6.73333C7.08889 6.83333 7.48611 6.55556 7.925 6.33333C8.36389 6.11111 8.83333 5.96111 9.33333 5.88333V5.83333H2.66667V7.16667ZM2.66667 4.5H9.33333V3.16667H2.66667V4.5ZM10 13.8333C9.07778 13.8333 8.29167 13.5083 7.64167 12.8583C6.99167 12.2083 6.66667 11.4222 6.66667 10.5C6.66667 9.57778 6.99167 8.79167 7.64167 8.14167C8.29167 7.49167 9.07778 7.16667 10 7.16667C10.9222 7.16667 11.7083 7.49167 12.3583 8.14167C13.0083 8.79167 13.3333 9.57778 13.3333 10.5C13.3333 11.4222 13.0083 12.2083 12.3583 12.8583C11.7083 13.5083 10.9222 13.8333 10 13.8333Z"
                          fill={editSqlTab === "sql" ? "#ffffff" : "#939396"}
                        />
                      </svg>
                    </span>

                    <span className="tracking-wider">SQL</span>
                  </a>
                )}

                <a
                  className={`px-4 py-2 text-xs font-medium tracking-wide flex items-center space-x-2 justify-center cursor-pointer ${
                    editSqlTab === "data-response"
                    ? "bg-page text-white  border-b-2 border-active-color"
                      : "text-white/40"
                  }`}
                  onClick={() => setEditSqlTab("data-response")}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 11 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                    >
                      <path
                        d="M0.333984 10.8337V6.83366H2.33398V10.8337H0.333984ZM4.33398 10.8337V3.50033H6.33398V10.8337H4.33398ZM8.33398 10.8337V0.166992H10.334V10.8337H8.33398Z"
                        fill={
                          editSqlTab === "data-response" ? "#ffffff" : "#939396"
                        }
                      />
                    </svg>
                  </span>

                  <span className="tracking-wider">Data Response</span>
                </a>
              </div>

              {eventStats.generation_execution?.error_message && (
                <div
                  className="flex items-center space-x-2 text-xs font-medium text-white cursor-pointer"
                  onClick={() => setShowSqlError(true)}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                    >
                      <path
                        d="M8 12C8.22667 12 8.41667 11.9233 8.57 11.77C8.72333 11.6167 8.8 11.4267 8.8 11.2C8.8 10.9733 8.72333 10.7833 8.57 10.63C8.41667 10.4767 8.22667 10.4 8 10.4C7.77333 10.4 7.58333 10.4767 7.43 10.63C7.27667 10.7833 7.2 10.9733 7.2 11.2C7.2 11.4267 7.27667 11.6167 7.43 11.77C7.58333 11.9233 7.77333 12 8 12ZM7.2 8.8H8.8V4H7.2V8.8ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                        fill="#C22828"
                      />
                    </svg>
                  </span>

                  <span className="whitespace-nowrap">
                    SQL error message will be showing here
                  </span>
                </div>
              )}
            </div>

            {eventStats.generation_execution?.sql && editSqlTab === "sql" && (
              <div className="overflow-hidden border rounded-md border-border">
                <SyntaxHighlighter
                  language="Sql"
                  style={{
                    ...stackoverflowDark,

                    hljs: {
                      ...stackoverflowDark.hljs,
                      backgroundColor: "#09090b",
                      padding: "20px 12px",
                      fontSize: "14px",
                      lineHeight: "24px",
                      fontWeight: "600",
                    },
                  }}
                  wrapLongLines={true}
                >
                  {eventStats.generation_execution.sql}
                </SyntaxHighlighter>
              </div>
            )}

            {editSqlTab === "data-response" && (
              <TableInformation
                data={eventStats.generation_execution.dataframe || {}}
              />
            )}
          </div>
        )}
      </div>

      {eventStats.generation_execution && (
        <SqlErrorModal
          showSqlError={showSqlError}
          setShowSqlError={setShowSqlError}
          data={[eventStats.generation_execution?.error_message]}
        />
      )}
    </>
  );
};

export default GenerationOutput;
