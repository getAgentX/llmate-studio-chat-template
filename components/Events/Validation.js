import React, { useState } from "react";
import SelectOption from "../common/SelectOption";

const Validation = ({ event }) => {
  const [currentTab, setCurrentTab] = useState("summary");
  const [toggleDropdown, setToggleDropdown] = useState(false);

  const options = [
    {
      value: "summary",
      label: "Summary",
    },
    {
      value: "errors_in_sql",
      label: "SQL Command",
    },
  ];

  const handleSelect = (value) => {
    setCurrentTab(value.value);
  };

  return (
    <div className="flex flex-col bg-[#2A2D34] rounded-md">
      <div
        className="flex justify-between items-center px-4 py-4 cursor-pointer"
        onClick={() => setToggleDropdown(!toggleDropdown)}
      >
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
            >
              <circle cx="8" cy="8" r="6" fill="white" />
              <path
                d="M6.88 11.68L12.52 6.04L11.4 4.92L6.88 9.44L4.6 7.16L3.48 8.28L6.88 11.68ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                fill="#24A631"
              />
            </svg>
          </span>

          <p className="text-sm font-medium tracking-wide text-white capitalize xsm:text-sm">
            Summarising steps
          </p>
        </div>

        {toggleDropdown || (
          <span className="flex justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-white"
            >
              <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
            </svg>
          </span>
        )}

        {toggleDropdown && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-white"
          >
            <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
          </svg>
        )}
      </div>

      {toggleDropdown && (
        <div className="px-4 pb-4">
          <div className="w-full mx-auto text-white">
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between">
                  <div className="flex-wrap items-center hidden w-full sm:flex max-w-fit bg-[#2C3037] p-1.5 rounded-md">
                    <button
                      className={`py-2 text-xs font-medium rounded-md min-w-16 px-2 tracking-wider flex justify-center items-center space-x-2 capitalize transition-colors duration-300 ${
                        currentTab === "summary"
                          ? "bg-[#363942] text-accent"
                          : "bg-[#2C3037] text-white/50"
                      }`}
                      onClick={() => setCurrentTab("summary")}
                    >
                      <span className="flex justify-center items-center">
                        <svg
                          viewBox="0 0 13 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`w-4 h-4 ${
                            currentTab === "summary"
                              ? "fill-white"
                              : "fill-[#95979B]"
                          }`}
                        >
                          <path d="M4.625 9.875V8.625H12.125V9.875H4.625ZM4.625 6.125V4.875H12.125V6.125H4.625ZM4.625 2.375V1.125H12.125V2.375H4.625ZM2.125 10.5C1.78125 10.5 1.48698 10.3776 1.24219 10.1328C0.997396 9.88802 0.875 9.59375 0.875 9.25C0.875 8.90625 0.997396 8.61198 1.24219 8.36719C1.48698 8.1224 1.78125 8 2.125 8C2.46875 8 2.76302 8.1224 3.00781 8.36719C3.2526 8.61198 3.375 8.90625 3.375 9.25C3.375 9.59375 3.2526 9.88802 3.00781 10.1328C2.76302 10.3776 2.46875 10.5 2.125 10.5ZM2.125 6.75C1.78125 6.75 1.48698 6.6276 1.24219 6.38281C0.997396 6.13802 0.875 5.84375 0.875 5.5C0.875 5.15625 0.997396 4.86198 1.24219 4.61719C1.48698 4.3724 1.78125 4.25 2.125 4.25C2.46875 4.25 2.76302 4.3724 3.00781 4.61719C3.2526 4.86198 3.375 5.15625 3.375 5.5C3.375 5.84375 3.2526 6.13802 3.00781 6.38281C2.76302 6.6276 2.46875 6.75 2.125 6.75ZM2.125 3C1.78125 3 1.48698 2.8776 1.24219 2.63281C0.997396 2.38802 0.875 2.09375 0.875 1.75C0.875 1.40625 0.997396 1.11198 1.24219 0.867188C1.48698 0.622396 1.78125 0.5 2.125 0.5C2.46875 0.5 2.76302 0.622396 3.00781 0.867188C3.2526 1.11198 3.375 1.40625 3.375 1.75C3.375 2.09375 3.2526 2.38802 3.00781 2.63281C2.76302 2.8776 2.46875 3 2.125 3Z" />
                        </svg>
                      </span>
                      <span>Summary</span>
                    </button>

                    <button
                      className={`py-2 text-xs font-medium rounded-md min-w-16 px-2 tracking-wider flex justify-center items-center space-x-2 capitalize transition-colors duration-300 ${
                        currentTab === "errors_in_sql"
                          ? "bg-[#363942] text-accent"
                          : "bg-[#2C3037] text-white/50"
                      }`}
                      onClick={() => setCurrentTab("errors_in_sql")}
                    >
                      <span className="flex justify-center items-center">
                        <svg
                          viewBox="0 0 13 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`w-4 h-4 ${
                            currentTab === "errors_in_sql"
                              ? "fill-white"
                              : "fill-[#95979B]"
                          }`}
                        >
                          <path d="M6.5 9.625C6.67708 9.625 6.82552 9.5651 6.94531 9.44531C7.0651 9.32552 7.125 9.17708 7.125 9C7.125 8.82292 7.0651 8.67448 6.94531 8.55469C6.82552 8.4349 6.67708 8.375 6.5 8.375C6.32292 8.375 6.17448 8.4349 6.05469 8.55469C5.9349 8.67448 5.875 8.82292 5.875 9C5.875 9.17708 5.9349 9.32552 6.05469 9.44531C6.17448 9.5651 6.32292 9.625 6.5 9.625ZM5.875 7.125H7.125V3.375H5.875V7.125ZM6.5 12.75C5.63542 12.75 4.82292 12.5859 4.0625 12.2578C3.30208 11.9297 2.64062 11.4844 2.07812 10.9219C1.51562 10.3594 1.07031 9.69792 0.742188 8.9375C0.414062 8.17708 0.25 7.36458 0.25 6.5C0.25 5.63542 0.414062 4.82292 0.742188 4.0625C1.07031 3.30208 1.51562 2.64062 2.07812 2.07812C2.64062 1.51562 3.30208 1.07031 4.0625 0.742188C4.82292 0.414062 5.63542 0.25 6.5 0.25C7.36458 0.25 8.17708 0.414062 8.9375 0.742188C9.69792 1.07031 10.3594 1.51562 10.9219 2.07812C11.4844 2.64062 11.9297 3.30208 12.2578 4.0625C12.5859 4.82292 12.75 5.63542 12.75 6.5C12.75 7.36458 12.5859 8.17708 12.2578 8.9375C11.9297 9.69792 11.4844 10.3594 10.9219 10.9219C10.3594 11.4844 9.69792 11.9297 8.9375 12.2578C8.17708 12.5859 7.36458 12.75 6.5 12.75ZM6.5 11.5C7.89583 11.5 9.07812 11.0156 10.0469 10.0469C11.0156 9.07812 11.5 7.89583 11.5 6.5C11.5 5.10417 11.0156 3.92188 10.0469 2.95312C9.07812 1.98438 7.89583 1.5 6.5 1.5C5.10417 1.5 3.92188 1.98438 2.95312 2.95312C1.98438 3.92188 1.5 5.10417 1.5 6.5C1.5 7.89583 1.98438 9.07812 2.95312 10.0469C3.92188 11.0156 5.10417 11.5 6.5 11.5Z" />
                        </svg>
                      </span>

                      <span>Errors In SQL</span>
                    </button>
                  </div>
                </div>

                <div className="sm:hidden">
                  <SelectOption options={options} onSelect={handleSelect} />
                </div>
              </div>

              {currentTab === "errors_in_sql" &&
                event.errors_in_sql.length > 0 && (
                  <div className="flex flex-col w-full space-y-4 min-h-32 rounded-md bg-[#30333C]">
                    <div className="flex flex-col p-4 overflow-hidden text-sm leading-6">
                      <ul className="flex flex-col space-y-2">
                        {event.errors_in_sql.map((item, index) => {
                          return (
                            <li
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <span className="flex justify-center items-center">
                                <svg
                                  viewBox="0 0 13 13"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 fill-[#95979B]"
                                >
                                  <path d="M6.5 9.625C6.67708 9.625 6.82552 9.5651 6.94531 9.44531C7.0651 9.32552 7.125 9.17708 7.125 9C7.125 8.82292 7.0651 8.67448 6.94531 8.55469C6.82552 8.4349 6.67708 8.375 6.5 8.375C6.32292 8.375 6.17448 8.4349 6.05469 8.55469C5.9349 8.67448 5.875 8.82292 5.875 9C5.875 9.17708 5.9349 9.32552 6.05469 9.44531C6.17448 9.5651 6.32292 9.625 6.5 9.625ZM5.875 7.125H7.125V3.375H5.875V7.125ZM6.5 12.75C5.63542 12.75 4.82292 12.5859 4.0625 12.2578C3.30208 11.9297 2.64062 11.4844 2.07812 10.9219C1.51562 10.3594 1.07031 9.69792 0.742188 8.9375C0.414062 8.17708 0.25 7.36458 0.25 6.5C0.25 5.63542 0.414062 4.82292 0.742188 4.0625C1.07031 3.30208 1.51562 2.64062 2.07812 2.07812C2.64062 1.51562 3.30208 1.07031 4.0625 0.742188C4.82292 0.414062 5.63542 0.25 6.5 0.25C7.36458 0.25 8.17708 0.414062 8.9375 0.742188C9.69792 1.07031 10.3594 1.51562 10.9219 2.07812C11.4844 2.64062 11.9297 3.30208 12.2578 4.0625C12.5859 4.82292 12.75 5.63542 12.75 6.5C12.75 7.36458 12.5859 8.17708 12.2578 8.9375C11.9297 9.69792 11.4844 10.3594 10.9219 10.9219C10.3594 11.4844 9.69792 11.9297 8.9375 12.2578C8.17708 12.5859 7.36458 12.75 6.5 12.75ZM6.5 11.5C7.89583 11.5 9.07812 11.0156 10.0469 10.0469C11.0156 9.07812 11.5 7.89583 11.5 6.5C11.5 5.10417 11.0156 3.92188 10.0469 2.95312C9.07812 1.98438 7.89583 1.5 6.5 1.5C5.10417 1.5 3.92188 1.98438 2.95312 2.95312C1.98438 3.92188 1.5 5.10417 1.5 6.5C1.5 7.89583 1.98438 9.07812 2.95312 10.0469C3.92188 11.0156 5.10417 11.5 6.5 11.5Z" />
                                </svg>
                              </span>

                              <span>{item}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}

              {currentTab === "summary" && event.steps_followed.length > 0 && (
                <div className="flex flex-col w-full min-h-32 rounded-md bg-[#30333C]">
                  <div className="flex flex-col p-4 overflow-hidden text-sm leading-6">
                    <ul className="flex flex-col space-y-2">
                      {event.steps_followed.map((item, index) => {
                        return (
                          <li key={index} className="list-disc list-inside">
                            {item}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Validation;
