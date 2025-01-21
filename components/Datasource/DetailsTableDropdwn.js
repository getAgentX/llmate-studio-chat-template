import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Editor } from "@monaco-editor/react";
import { useTheme } from "@/hooks/useTheme";

  const darkTheme = {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "FFFFFF", background: "2A2D34" },
      { token: "invalid", foreground: "f44747" },
      { token: "emphasis", fontStyle: "italic" },
      { token: "strong", fontStyle: "bold" },
    ],
    colors: {
      "editor.foreground": "#F8F8F8",
      "editor.background": "#09090b",
      "editor.selectionBackground": "#264f78",
      "editor.lineHighlightBackground": "#09090b",
      "editorCursor.foreground": "#A7A7A7",
      "editorWhitespace.foreground": "#CAE2FB3D",
      "minimap.background": "#202020",
    },
  };
  const lightTheme = {
    base: "vs",
    inherit: true,
    rules: [
      { token: "", foreground: "000000", background: "FFFFFF" }, // Black text on white background
      { token: "invalid", foreground: "D32F2F" }, // Bright red for invalid tokens
      { token: "emphasis", fontStyle: "italic" }, // Italic for emphasis
      { token: "strong", fontStyle: "bold" }, // Bold for strong text
    ],
    colors: {
      "editor.foreground": "#1E1E1E", // Dark text for better readability
      "editor.background": "#FFFFFF", // White background
      "editor.selectionBackground": "#B4D7FF", // Light blue for selection
      "editor.lineHighlightBackground": "#F0F0F0", // Light gray for line highlight
      "editorCursor.foreground": "#000000", // Black cursor
      "editorWhitespace.foreground": "#D3D3D3", // Light gray for whitespace
      "minimap.background": "#F5F5F5", // Very light gray for minimap background
    },
  };

const Options = {
  showFoldingControls: "mouseover",
  smoothScrolling: true,
  suggestOnTriggerCharacters: true,
  wordBasedSuggestions: true,
  wordSeparators: "~!@#$%^&*()-=+[{]}|;:'\",.<>/?",
  wordWrap: true,
  wordWrapBreakAfterCharacters: "\t})]?|&,;",
  wordWrapBreakBeforeCharacters: "{([+",
  wordWrapBreakObtrusiveCharacters: ".",
  wordWrapColumn: 80,
  wordWrapMinified: true,
  wrappingIndent: "none",
  minimap: {
    enabled: false,
  },
  showUnused: false,
  fontSize: 14,
  lineNumbers: "off",
  readOnly: true,
};

const DetailsTableDropdwn = ({ data, selectedColumns, datasourceId }) => {
  const [toggleDropdown, setToggleDropdown] = useState(false);
  const [initialSortedColumns, setInitialSortedColumns] = useState([]);
  const [currentTab, setCurrentTab] = useState("description");
  const { theme: customTheme } = useTheme()

  useEffect(() => {
    if (selectedColumns.length) {
      const selectedSet = new Set(selectedColumns.map((col) => col.name));
      const sortedColumns = [
        ...data?.columns?.filter((col) => selectedSet.has(col.name)),
        ...data?.columns?.filter((col) => !selectedSet.has(col.name)),
      ];
      setInitialSortedColumns(sortedColumns);
    } else {
      setInitialSortedColumns(data?.columns);
    }
  }, [data?.columns, selectedColumns]);

  return (
    <div className="flex flex-col rounded-md cursor-pointer bg-[#181A1C]">
      <div
        className="flex items-center justify-between w-full px-4 py-3 text-sm tracking-wide text-white"
        onClick={() => setToggleDropdown(!toggleDropdown)}
      >
        <p className="font-medium">{data?.name}</p>

        <div className="flex items-center space-x-2">
          <p className="font-normal">
            <span className="text-white/40">Selected</span>{" "}
            {selectedColumns.length} Columns
          </p>

          <span className="flex items-center justify-center">
            {toggleDropdown || (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-white/40 hover:text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            )}

            {toggleDropdown && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            )}
          </span>
        </div>
      </div>

      {toggleDropdown && (
        <div className="flex flex-col w-full space-y-2 border-t border-border">
          <div className="relative flex flex-col px-4 py-4 space-y-4">
            <p className="text-xs font-normal tracking-wider text-white/50">
              SELECTED COLUMN LISTS
            </p>

            <div className="flex-wrap items-center hidden w-full sm:flex max-w-fit">
              <button
                className={`text-xs border-b-2 font-medium flex justify-center items-center space-x-4 min-w-16 px-2 tracking-wider capitalize transition-colors duration-300 ${
                  currentTab === "description"
                    ? "text-accent border-secondary"
                    : "text-white/40 border-transparent"
                }`}
                type="button"
              >
                <div
                  className="pb-4"
                  onClick={() => setCurrentTab("description")}
                >
                  Table & Column Descriptions
                </div>
              </button>

              <button
                className={`text-xs border-b-2 font-medium flex justify-center items-center space-x-4 min-w-16 px-2 tracking-wider capitalize transition-colors duration-300 ${
                  currentTab === "joining"
                    ? "text-accent border-secondary"
                    : "text-white/40 border-transparent"
                }`}
                type="button"
              >
                <div className="pb-4" onClick={() => setCurrentTab("joining")}>
                  Data Joining Setup
                </div>
              </button>

              <button
                className={`text-xs border-b-2 font-medium flex justify-center items-center space-x-4 min-w-16 px-2 tracking-wider capitalize transition-colors duration-300 ${
                  currentTab === "concepts"
                    ? "text-accent border-secondary"
                    : "text-white/40 border-transparent"
                }`}
                type="button"
              >
                <div className="pb-4" onClick={() => setCurrentTab("concepts")}>
                  Concepts
                </div>
              </button>
            </div>

            {currentTab === "description" &&
              initialSortedColumns.map((column, index) => {
                return <GenerateCol data={column} index={index} />;
              })}

            {currentTab === "joining" && (
              <div className="rounded-md bg-[#1B1D1F] p-2 flex flex-col space-y-4">
                {data?.joins?.length > 0 && (
                  <p className="text-sm font-normal text-white">
                    Possible Column Joins Sets
                  </p>
                )}

                <div className="flex flex-col">
                  {data?.joins?.length > 0 &&
                    data?.joins.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="flex flex-col border rounded-md border-border bg-[#181A1C] cursor-default mb-2"
                      >
                        <div className="flex items-center justify-between w-full px-4 py-3 text-sm tracking-wide text-white border-b border-border">
                          <p className="font-medium">Set - {setIndex + 1}</p>
                        </div>

                        <div className="flex flex-col px-2 py-2 space-y-2">
                          {set &&
                            set?.joins.map((item, index) => (
                              <Sets
                                key={index}
                                data={item}
                                currentTableName={data.name}
                              />
                            ))}
                        </div>
                      </div>
                    ))}

                  {data?.joins?.length > 0 || (
                    <div className="flex flex-col items-center justify-center w-full space-y-4 text-sm font-medium h-96 text-white/50">
                      <p>Joins are not available.</p>

                      <Link
                        href={`/datasource/details/${datasourceId}/update-table`}
                        className="flex items-center justify-center px-4 py-2 space-x-2 text-xs font-medium tracking-wide border-2 rounded-md cursor-pointer border-secondary hover:border-white text-secondary hover:text-white"
                      >
                        <span>Add Joins</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentTab === "concepts" && (
              <Concepts data={data?.formulae} datasourceId={datasourceId} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsTableDropdwn;

const GenerateCol = ({ data, index }) => {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        <div className="flex w-full space-x-4">
          <div className="flex flex-col w-64 space-y-4">
            {index === 0 && (
              <p className="text-xs tracking-wide text-white/40">Column name</p>
            )}

            <p className="text-sm font-medium tracking-wide text-white capitalize">
              {data?.name}
            </p>

            {data?.col_type === "DATE" && (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-green-200 capitalize bg-green-800 rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}

            {data?.col_type === "STRING" && (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-[#A3CAFF] capitalize bg-[#313F71] rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}

            {data?.col_type === "NUMBER" && (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-[#C4A3FF] capitalize bg-[#4F4062] rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}

            {["NUMBER", "STRING", "DATE"].includes(data?.col_type) || (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-yellow-100 capitalize bg-yellow-800 rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}
          </div>

          <div className="flex flex-col w-full space-y-4">
            {index === 0 && (
              <p className="text-xs tracking-wide text-white/40">Cardinality</p>
            )}

            <input
              type="text"
              readOnly={true}
              className="px-4 py-2 text-white/50 text-xs font-medium border outline-none border-[#212227] bg-[#181A1C] rounded-md"
              value={data.cardinality}
            />

            {/* <SelectOption
              options={{ value: data.cardinality, label: data.cardinality }}
              placeholder="Choose option"
              defaultValue={{
                value: data.cardinality,
                label: data.cardinality,
              }}
              disabled={true}
            /> */}
          </div>
        </div>
      </div>

      <div className="col-span-8">
        <div className="flex w-full space-x-4">
          <div className="flex flex-col w-full space-y-4">
            {index === 0 && (
              <p className="text-xs tracking-wide text-white/40">Description</p>
            )}

            <textarea
              type="text"
              className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none resize-y min-h-28 border-border bg-[#181A1C] placeholder:text-white/40 recent__bar"
              placeholder="Enter column description here"
              disabled={true}
              value={data.description}
            />
          </div>

          <div className="flex flex-col w-full space-y-4">
            {index === 0 && (
              <p className="text-xs tracking-wide text-white/40">
                Sample values
              </p>
            )}
            <div className="flex flex-col px-2 py-1 space-y-1 overflow-y-auto border rounded-md h-28 border-border bg-[#181A1C] recent__bar">
              {data.examples?.map((tag) => {
                return (
                  <button
                    type="button"
                    className="flex items-center justify-between px-2 py-2 text-xs font-normal text-white rounded-md cursor-auto bg-foreground"
                    disabled={true}
                  >
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sets = ({ data, currentTableName }) => {
  return (
    <div className="flex items-center justify-between p-2 text-white">
      <div className="flex items-center w-full space-x-2">
        <div className="flex flex-col space-y-4 rounded-md bg-[#212325] p-2 w-full">
          <div className="flex flex-col space-y-2">
            <p className="text-xs font-normal tracking-wider text-white">
              Selected Table
            </p>

            <div className="text-xs font-normal text-white tracking-wider w-full bg-[#181A1C] capitalize flex items-center justify-between rounded-md px-2 py-2">
              {currentTableName}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <p className="text-xs font-normal tracking-wider text-white">
              Select the column from the selected table to join with another
            </p>

            <div className="relative flex w-full">
              <button
                type="button"
                className="cursor-pointer w-full border bg-[#181A1C] border-[#242424] rounded-md"
                disabled={true}
              >
                <div className="flex items-center justify-between w-full px-2 py-2 rounded-md">
                  <div className="w-full text-xs font-normal capitalize text-start text-white/50 line-clamp-1">
                    {data.source_column}
                  </div>

                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-white/50"
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 17 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 fill-white/50"
          >
            <path d="M16.666 3L11.666 0.113249V5.88675L16.666 3ZM0.666016 3.5H12.166V2.5H0.666016V3.5Z" />
            <path d="M0.666016 11L5.66602 8.11325V13.8868L0.666016 11ZM16.666 11.5H5.16602V10.5H16.666V11.5Z" />
          </svg>
        </span>

        <div className="flex flex-col space-y-4 rounded-md bg-[#212325] px-2 py-6 w-full">
          <div className="flex flex-col space-y-2">
            <span className="flex items-center justify-center">
              <svg
                viewBox="0 0 18 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
              >
                <path
                  d="M8.16602 8.66927H4.83268C3.6799 8.66927 2.69727 8.26302 1.88477 7.45052C1.07227 6.63802 0.666016 5.65538 0.666016 4.5026C0.666016 3.34983 1.07227 2.36719 1.88477 1.55469C2.69727 0.742187 3.6799 0.335938 4.83268 0.335938H8.16602V2.0026H4.83268C4.13824 2.0026 3.54796 2.24566 3.06185 2.73177C2.57574 3.21788 2.33268 3.80816 2.33268 4.5026C2.33268 5.19705 2.57574 5.78733 3.06185 6.27344C3.54796 6.75955 4.13824 7.0026 4.83268 7.0026H8.16602V8.66927ZM5.66602 5.33594V3.66927H12.3327V5.33594H5.66602ZM9.83268 8.66927V7.0026H13.166C13.8605 7.0026 14.4507 6.75955 14.9368 6.27344C15.423 5.78733 15.666 5.19705 15.666 4.5026C15.666 3.80816 15.423 3.21788 14.9368 2.73177C14.4507 2.24566 13.8605 2.0026 13.166 2.0026H9.83268V0.335938H13.166C14.3188 0.335938 15.3014 0.742187 16.1139 1.55469C16.9264 2.36719 17.3327 3.34983 17.3327 4.5026C17.3327 5.65538 16.9264 6.63802 16.1139 7.45052C15.3014 8.26302 14.3188 8.66927 13.166 8.66927H9.83268Z"
                  fill="white"
                  fill-opacity="0.25"
                />
              </svg>
            </span>

            <p className="text-xs font-normal tracking-wider text-center text-white">
              Connect with
            </p>

            <div className="relative flex w-full">
              <button
                type="button"
                className="cursor-pointer w-full border bg-[#181A1C] border-[#242424] rounded-md"
                disabled={true}
              >
                <div className="flex items-center justify-between w-full px-2 py-2 rounded-md">
                  <div className="w-full text-xs font-normal capitalize text-start text-white/50 line-clamp-1">
                    {data.join_type}
                  </div>

                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-white/50"
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 17 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 fill-white/50"
          >
            <path d="M16.666 3L11.666 0.113249V5.88675L16.666 3ZM0.666016 3.5H12.166V2.5H0.666016V3.5Z" />
            <path d="M0.666016 11L5.66602 8.11325V13.8868L0.666016 11ZM16.666 11.5H5.16602V10.5H16.666V11.5Z" />
          </svg>
        </span>

        <div className="flex flex-col space-y-4 rounded-md bg-[#212325] p-2 w-full">
          <div className="flex flex-col space-y-2">
            <p className="text-xs font-normal tracking-wider text-white">
              Select the table you want to join with
            </p>

            <div className="relative flex w-full">
              <button
                type="button"
                className="cursor-pointer w-full border bg-[#181A1C] border-[#242424] rounded-md"
                disabled={true}
              >
                <div className="flex items-center justify-between w-full px-2 py-2 rounded-md">
                  <div className="w-full text-xs font-normal capitalize text-start text-white/50 line-clamp-1">
                    {data.target_table}
                  </div>

                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-white/50"
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <p className="text-xs font-normal tracking-wider text-white">
              Select the Column from the selected table you want to join with
            </p>

            <div className="relative flex w-full">
              <button
                type="button"
                className="cursor-pointer w-full border bg-[#181A1C] border-[#242424] rounded-md"
                disabled={true}
              >
                <div className="flex items-center justify-between w-full px-2 py-2 rounded-md">
                  <div className="w-full text-xs font-normal capitalize text-start text-white/50 line-clamp-1">
                    {data.target_column}
                  </div>

                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-white/50"
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Concepts = ({ data = [], datasourceId }) => {
  const [conceptsData, setConceptsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    function transformInputDynamic(input) {
      const output = [];

      for (const key in input) {
        if (input.hasOwnProperty(key)) {
          if (typeof input[key] === "object" && input[key] !== null) {
            output.push({
              name: key,
              context: input[key].context || "",
              sql_formula: input[key].sql_formula || "",
            });
          } else {
            output.push({
              name: key,
              context: "",
              sql_formula: "",
            });
          }
        }
      }

      return output;
    }

    const outputData = transformInputDynamic(data);
    setConceptsData(outputData);
    setIsLoading(false);
  }, [data]);

  if (isLoading) {
    <div className="flex flex-col items-center rounded-md bg-[#1B1D1F] justify-center w-full space-y-4 text-sm font-medium h-96 text-white/50">
      <div role="status">
        <svg
          aria-hidden="true"
          className="w-6 h-6 animate-spin text-white fill-[#295EF4]"
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
    </div>;
  }

  if (conceptsData?.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-md bg-[#1B1D1F] justify-center w-full space-y-4 text-sm font-medium h-96 text-white/50">
        <p>Concepts are not available.</p>

        <Link
          href={`/datasource/details/${datasourceId}/update-table`}
          className="flex items-center justify-center px-4 py-2 space-x-2 text-xs font-medium tracking-wide border-2 rounded-md cursor-pointer border-secondary hover:border-white text-secondary hover:text-white"
        >
          <span>Add Concept</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-2">
      <div className="flex flex-col space-y-6">
        <div className="grid w-full grid-cols-12 gap-4">
          <div className="col-span-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium tracking-wider text-white">
                Concept Name
              </p>
              <p className="text-xs font-normal tracking-wider text-white/50">
                Enter a unique name for your concept
              </p>
            </div>
          </div>

          <div className="col-span-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium tracking-wider text-white">
                Context
              </p>
              <p className="text-xs font-normal tracking-wider text-white/50">
                Provide context for your concept, including usage, purpose, and
                details.
              </p>
            </div>
          </div>

          <div className="col-span-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium tracking-wider text-white">
                SQL Formula
              </p>
              <p className="text-xs font-normal tracking-wider text-white/50">
                Write the SQL formula that is associated with this concept.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full space-y-2">
          {conceptsData?.map((concept, conceptIndex) => (
            <div key={conceptIndex} className="grid w-full grid-cols-12 gap-4">
              <div className="col-span-4">
                <textarea
                  placeholder="Enter your concept name here"
                  value={concept.name}
                  className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none min-h-36 border-border bg-[#181A1C] placeholder:text-white/40 resize-none recent__bar"
                  readOnly={true}
                />
              </div>

              <div className="col-span-4">
                <textarea
                  placeholder="Brief your concept like how and when it should be used by the datasource..."
                  value={concept.context}
                  className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-primary-white border rounded-md outline-none min-h-36 border-border bg-[#181A1C] placeholder:text-white/40 resize-none recent__bar"
                  readOnly={true}
                />
              </div>

              <div className="col-span-4">
                <div className="flex items-start w-full space-x-2">
                  <Editor
                    key={customTheme}
                    height="150px"
                    theme={customTheme === 'dark' ? "vs-dark" : 'vs'}
                    className="overflow-hidden border rounded-md border-border placeholder:text-white/40"
                    language="sql"
                    value={concept.sql_formula}
                    options={Options}
                    onMount={(editor, monaco) => {
                      monaco.editor.defineTheme("darkTheme", darkTheme);
                      monaco.editor.defineTheme("lightTheme", lightTheme);
                      monaco.editor.setTheme(customTheme === "dark" ? "darkTheme" : "lightTheme");
                    }}
                    placeholder="Enter your SQL formula."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
