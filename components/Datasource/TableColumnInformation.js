import React, { useEffect, useRef, useState } from "react";
import SelectTableDropdown from "./SelectTableDropdown";
import {
  useGetDbConnectionListQuery,
  useGetTablesConnectionQuery,
} from "@/store/datasource";
import useDebounce from "@/hooks/useDebounce";
import { useTheme } from "@/hooks/useTheme";

const TableColumnInformation = ({
  setValue,
  getValues,
  setTablesChanged = false, // Receive the setter function
  availableDatabases,
  setAvailableDatabases,
  availableTables,
  setAvailableTables,
  watch = () => {},
  getRes,
  dbConnectionData,
  update = false,
  isValid,
  back: previous,
  handleCancel,
  sqlLoading = false,
  isDisabled = false,
}) => {
  const [database, setDatabase] = useState("");
  const [selectedColumns, setSelectedColumns] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [showSchema, setShowSchema] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const { theme } = useTheme();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedSearchTableQuery = useDebounce(searchTableQuery, 500);

  const tables = watch("tables");
  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowSchema(false);
    }
  };

  useEffect(() => {
    if (showSchema) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showSchema]);

  useEffect(() => {
    if (tables?.length === 0) {
      setDatabase("");
      setAvailableTables([]);
      setAvailableDatabases([]);
    }
  }, [tables]);

  const {
    data: dbConnectionRes,
    isLoading: dbConnectionLoading,
    error: dbConnectionError,
  } = useGetDbConnectionListQuery(
    {
      payload: dbConnectionData,
    },
    {
      skip: !dbConnectionData,
    }
  );

  const {
    data: tablesRes,
    isLoading: tablesLoading,
    error: tablesError,
    refetch: refetchTablesRes,
    isFetching,
  } = useGetTablesConnectionQuery(
    {
      payload: {
        db_connection: {
          ...dbConnectionData,
        },
        database: database,
      },
    },
    {
      skip: !dbConnectionData || !database,
    }
  );

  useEffect(() => {
    if (dbConnectionRes) {
      setAvailableDatabases(dbConnectionRes);
    }
  }, [dbConnectionRes]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setShowSchema(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  const handleDatabase = (newDatabase) => {
    setAvailableTables([]);
    setShowSchema(false);
    setDatabase(newDatabase);
    setValue("database", newDatabase);
    // refetchTablesRes();
  };

  useEffect(() => {
    if (tablesRes) {
      setAvailableTables(tablesRes);
    }
  }, [tablesRes]);

  useEffect(() => {
    // const columnsData = getValues("tables");
    const columnsData = tables;

    const convertArrayToObject = (dataArray) => {
      return dataArray.reduce((acc, current) => {
        acc[current.name] = current.columns;
        return acc;
      }, {});
    };

    if (columnsData.length > 0) {
      const convertedObject = convertArrayToObject(columnsData);
      setSelectedColumns(convertedObject);
    } else {
      setSelectedColumns({});
    }

    if (getRes?.ds_config?.database) {
      setDatabase(getRes?.ds_config?.database);
    } else {
      setDatabase("");
    }
  }, [getRes, getValues]);

  const handleSelectChange = (tableName, columns) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [tableName]: columns,
    }));

    const data = {
      ...selectedColumns,
      [tableName]: columns,
    };

    function processData(dataObject) {
      return Object.keys(dataObject).map((key) => ({
        name: key,
        description: "",
        columns: dataObject[key],
      }));
    }

    const initialDataArray = processData(data);

    const transformedData = initialDataArray.map((dataSet) => ({
      name: dataSet.name || "",
      description: dataSet.description || "",
      columns: dataSet.columns.map((col) => ({
        col_type: col.col_type || "",
        name: col.name || "",
        cardinality: col.cardinality || "high",
        examples: col.examples || [],
        description: col.description || "",
      })),
    }));

    setValue("tables", transformedData);

    if (setTablesChanged) {
      setTablesChanged(true);
    }
  };

  const filteredDatabases = availableDatabases?.filter((database) =>
    database.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const filteredTables = availableTables?.filter((table) =>
    table.name.toLowerCase().includes(debouncedSearchTableQuery.toLowerCase())
  );

  const handleScroll = (e) => {
    const threshold = 100;
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      setDisplayCount((prev) => prev + 50);
    }
  };

  const displayedDatabases = filteredDatabases.slice(0, displayCount);

  return (
    <div className="relative flex flex-col justify-between h-full p-3 bg-page">
      <div className={`flex flex-col space-y-2`}>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-1">
                <div className="flex items-center h-full">
                  <p className="text-xs font-medium text-primary-text">
                    Schema
                  </p>
                </div>
              </div>

              <div className="col-span-11">
                <div className="relative flex flex-col w-full space-y-1 max-w-72">
                  <button
                    type="button"
                    className="flex items-center justify-between h-8 px-3 text-xs font-medium border rounded-md text-primary-text border-border-color"
                    onClick={() => setShowSchema(!showSchema)}
                    disabled={dbConnectionLoading || isDisabled}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center justify-center">
                        <svg
                          viewBox="0 0 12 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 fill-icon-color"
                        >
                          <path d="M0.666016 15.3334V11.3334H2.33268V10.0001H0.666016V6.00008H2.33268V4.66675H0.666016V0.666748H5.33268V4.66675H3.66602V6.00008H5.33268V7.33342H7.33268V6.00008H11.9993V10.0001H7.33268V8.66675H5.33268V10.0001H3.66602V11.3334H5.33268V15.3334H0.666016ZM1.99935 14.0001H3.99935V12.6667H1.99935V14.0001ZM1.99935 8.66675H3.99935V7.33342H1.99935V8.66675ZM8.66602 8.66675H10.666V7.33342H8.66602V8.66675ZM1.99935 3.33341H3.99935V2.00008H1.99935V3.33341Z" />
                        </svg>
                      </span>

                      {dbConnectionLoading ? (
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="w-4 h-4 animate-spin text-foreground fill-secondary"
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
                      ) : (
                        <span>{database || "Select Schema"}</span>
                      )}
                    </div>

                    <span className="flex items-center justify-center">
                      {showSchema || (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-icon-color hover:text-icon-color-hover"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      )}

                      {showSchema && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-icon-color-hover"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 15.75 7.5-7.5 7.5 7.5"
                          />
                        </svg>
                      )}
                    </span>
                  </button>

                  {!dbConnectionLoading && showSchema && (
                    <div
                      className="absolute top-full left-0 w-full z-[100]"
                      ref={modalRef}
                    >
                      <div className="relative flex flex-col overflow-hidden border rounded-md border-dropdown-border bg-dropdown-bg">
                        <div className="sticky top-0 left-0 w-full">
                          <div className="relative w-full border-b border-border-color">
                            <input
                              type="text"
                              className="w-full pl-4 pr-10 text-sm outline-none h-7 text-input-text bg-dropdown-bg placeholder:text-input-placeholder"
                              placeholder="Search schema"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            {searchQuery !== "" && (
                              <span
                                className="absolute flex items-center justify-center w-5 h-5 -translate-y-1/2 rounded-full cursor-pointer bg-border top-1/2 right-4"
                                onClick={() => setSearchQuery("")}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4 text-primary-text"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                  />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-full">
                          {filteredDatabases.length > 0 && (
                            <div
                              className="grid w-full h-full grid-cols-1 gap-2 overflow-y-auto bg-dropdown-bg recent__bar max-h-48"
                              onScroll={handleScroll}
                            >
                              {displayedDatabases
                                ?.slice()
                                .sort((a, b) => {
                                  if (a === database) return -1;
                                  if (b === database) return 1;
                                  return 0;
                                })
                                .map((item, index) => {
                                  return (
                                    <a
                                      className={`flex items-center w-full px-2 h-7 space-x-2 text-xs 2xl:text-sm font-roboto cursor-pointer text-accent ${
                                        theme === "dark"
                                          ? "text-dropdown-text hover:text-primary-text hover:bg-btn-primary"
                                          : "hover:bg-active-bg-hover"
                                      } ${database === item ? "" : ""}`}
                                      onClick={() => handleDatabase(item)}
                                      key={index}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        className={`w-5 h-5 ${
                                          database === item
                                            ? "fill-icon-color-hover"
                                            : "fill-icon-color"
                                        }`}
                                      >
                                        <path d="M20 17V7c0-2.168-3.663-4-8-4S4 4.832 4 7v10c0 2.168 3.663 4 8 4s8-1.832 8-4zM12 5c3.691 0 5.931 1.507 6 1.994C17.931 7.493 15.691 9 12 9S6.069 7.493 6 7.006C6.069 6.507 8.309 5 12 5zM6 9.607C7.479 10.454 9.637 11 12 11s4.521-.546 6-1.393v2.387c-.069.499-2.309 2.006-6 2.006s-5.931-1.507-6-2V9.607zM6 17v-2.393C7.479 15.454 9.637 16 12 16s4.521-.546 6-1.393v2.387c-.069.499-2.309 2.006-6 2.006s-5.931-1.507-6-2z"></path>
                                      </svg>

                                      <div className="w-full line-clamp-1">
                                        {item}
                                      </div>
                                    </a>
                                  );
                                })}
                            </div>
                          )}

                          {filteredDatabases.length === 0 && (
                            <div className="w-full h-48 max-w-sm col-span-12 bg-dropdown-bg">
                              <div className="flex flex-col items-center justify-center w-full h-full space-y-2">
                                <span className="flex items-center justify-center">
                                  <svg
                                    viewBox="0 0 21 21"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 fill-icon-color"
                                  >
                                    <path d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 7.5 11.0208 7.40417 11.2125 7.2125C11.4042 7.02083 11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 11.2125 5.7875C11.0208 5.59583 10.7833 5.5 10.5 5.5C10.2167 5.5 9.97917 5.59583 9.7875 5.7875C9.59583 5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 9.59583 7.02083 9.7875 7.2125C9.97917 7.40417 10.2167 7.5 10.5 7.5ZM10.5 20.5C9.11667 20.5 7.81667 20.2375 6.6 19.7125C5.38333 19.1875 4.325 18.475 3.425 17.575C2.525 16.675 1.8125 15.6167 1.2875 14.4C0.7625 13.1833 0.5 11.8833 0.5 10.5C0.5 9.11667 0.7625 7.81667 1.2875 6.6C1.8125 5.38333 2.525 4.325 3.425 3.425C4.325 2.525 5.38333 1.8125 6.6 1.2875C7.81667 0.7625 9.11667 0.5 10.5 0.5C11.8833 0.5 13.1833 0.7625 14.4 1.2875C15.6167 1.8125 16.675 2.525 17.575 3.425C18.475 4.325 19.1875 5.38333 19.7125 6.6C20.2375 7.81667 20.5 9.11667 20.5 10.5C20.5 11.8833 20.2375 13.1833 19.7125 14.4C19.1875 15.6167 18.475 16.675 17.575 17.575C16.675 18.475 15.6167 19.1875 14.4 19.7125C13.1833 20.2375 11.8833 20.5 10.5 20.5ZM10.5 18.5C12.7333 18.5 14.625 17.725 16.175 16.175C17.725 14.625 18.5 12.7333 18.5 10.5C18.5 8.26667 17.725 6.375 16.175 4.825C14.625 3.275 12.7333 2.5 10.5 2.5C8.26667 2.5 6.375 3.275 4.825 4.825C3.275 6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 3.275 14.625 4.825 16.175C6.375 17.725 8.26667 18.5 10.5 18.5Z" />
                                  </svg>
                                </span>

                                <span className="text-xs font-medium tracking-wider 2xl:text-sm text-primary-text">
                                  No Database Available
                                </span>

                                <span className="text-xs font-normal tracking-wider text-secondary-text">
                                  Credentials are incorrect, Please check again.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {availableTables.length === 0 && (
            <div className="col-span-12">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal tracking-wide text-label-text">
                    Available tables from the selected schema
                  </span>

                  <div className="flex items-center space-x-2">
                    <div className="relative w-full pr-2">
                      <input
                        type="text"
                        className="w-full py-2 pl-8 pr-10 text-xs bg-transparent border rounded-md outline-none 2xl:text-sm text-primary-text placeholder:text-input-placeholder border-input-border"
                        placeholder="Search Table..."
                        disabled={true}
                      />

                      <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-secondary-text"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {tablesLoading && (
                  <div className="col-span-12 border rounded-md border-border-color">
                    <div className="flex items-center justify-center w-full h-60 text-primary-text">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5 animate-spin text-foreground fill-secondary"
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
                  </div>
                )}

                {tablesLoading === false && isFetching && (
                  <div className="col-span-12 border rounded-md border-border-color">
                    <div className="flex items-center justify-center w-full h-60 text-primary-text">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5 animate-spin text-foreground fill-secondary"
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
                  </div>
                )}

                {tablesLoading || (
                  <div className="flex flex-col items-center justify-center w-full h-full space-y-2 border min-h-60 border-border-color">
                    <span className="flex items-center justify-center">
                      <svg
                        viewBox="0 0 21 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 fill-icon-color"
                      >
                        <path d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 7.5 11.0208 7.40417 11.2125 7.2125C11.4042 7.02083 11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 11.2125 5.7875C11.0208 5.59583 10.7833 5.5 10.5 5.5C10.2167 5.5 9.97917 5.59583 9.7875 5.7875C9.59583 5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 9.59583 7.02083 9.7875 7.2125C9.97917 7.40417 10.2167 7.5 10.5 7.5ZM10.5 20.5C9.11667 20.5 7.81667 20.2375 6.6 19.7125C5.38333 19.1875 4.325 18.475 3.425 17.575C2.525 16.675 1.8125 15.6167 1.2875 14.4C0.7625 13.1833 0.5 11.8833 0.5 10.5C0.5 9.11667 0.7625 7.81667 1.2875 6.6C1.8125 5.38333 2.525 4.325 3.425 3.425C4.325 2.525 5.38333 1.8125 6.6 1.2875C7.81667 0.7625 9.11667 0.5 10.5 0.5C11.8833 0.5 13.1833 0.7625 14.4 1.2875C15.6167 1.8125 16.675 2.525 17.575 3.425C18.475 4.325 19.1875 5.38333 19.7125 6.6C20.2375 7.81667 20.5 9.11667 20.5 10.5C20.5 11.8833 20.2375 13.1833 19.7125 14.4C19.1875 15.6167 18.475 16.675 17.575 17.575C16.675 18.475 15.6167 19.1875 14.4 19.7125C13.1833 20.2375 11.8833 20.5 10.5 20.5ZM10.5 18.5C12.7333 18.5 14.625 17.725 16.175 16.175C17.725 14.625 18.5 12.7333 18.5 10.5C18.5 8.26667 17.725 6.375 16.175 4.825C14.625 3.275 12.7333 2.5 10.5 2.5C8.26667 2.5 6.375 3.275 4.825 4.825C3.275 6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 3.275 14.625 4.825 16.175C6.375 17.725 8.26667 18.5 10.5 18.5Z" />
                      </svg>
                    </span>

                    {dbConnectionError?.data ? (
                      <span className="text-xs font-medium tracking-wider text-primary-text">
                        Error
                      </span>
                    ) : (
                      <span className="text-xs font-medium tracking-wider text-primary-text">
                        No Schema has selected
                      </span>
                    )}

                    {dbConnectionError?.data ? (
                      <span className="text-xs font-normal tracking-wider text-secondary-text">
                        {dbConnectionError?.data?.message}
                      </span>
                    ) : (
                      <span className="text-xs font-normal tracking-wider text-secondary-text">
                        Select a schema on above, then choose the table and
                        column you need.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {database && availableTables.length > 0 && (
            <div className="col-span-12">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal tracking-wide text-label-text">
                    Available tables from the selected schema
                  </span>

                  <div className="flex items-center space-x-2">
                    <div className="relative w-full pr-2">
                      <input
                        type="text"
                        className="w-full h-8 py-2 pl-10 pr-8 text-xs bg-transparent border rounded-md outline-none 2xl:text-sm text-primary-text placeholder:text-input-placeholder border-input-border"
                        placeholder="Search Table..."
                        value={searchTableQuery}
                        onChange={(e) => setSearchTableQuery(e.target.value)}
                        disabled={tablesLoading}
                      />

                      <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-secondary-text"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                          />
                        </svg>
                      </span>

                      {searchTableQuery !== "" && (
                        <span
                          className="absolute flex items-center justify-center w-5 h-5 -translate-y-1/2 rounded-full cursor-pointer bg-border top-1/2 right-4"
                          onClick={() => setSearchTableQuery("")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-primary-text"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18 18 6M6 6l12 12"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {tablesLoading && (
                  <div className="col-span-12 border rounded-md border-border-color">
                    <div className="flex items-center justify-center w-full h-60 text-primary-text">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5 animate-spin text-foreground fill-secondary"
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
                  </div>
                )}

                {tablesLoading || (
                  <div className="flex flex-col space-y-2">
                    {filteredTables?.map((table, index) => {
                      return (
                        <SelectTableDropdown
                          data={table}
                          key={index}
                          selectedColumns={selectedColumns[table.name] || []}
                          onSelectChange={(columns) =>
                            handleSelectChange(table.name, columns)
                          }
                          isDisabled={isDisabled}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {update || (
        <div className="sticky bottom-0 left-0 z-50 col-span-12 bg-page">
          <div className="flex items-center justify-end w-full py-2">
            {/* <button
              type="button"
              className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
              onClick={() => previous && previous()}
              disabled={sqlLoading}
            >
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 fill-btn-primary-outline-icon "
                >
                  <path d="M3.21602 6.6665L6.94935 10.3998L5.99935 11.3332L0.666016 5.99984L5.99935 0.666504L6.94935 1.59984L3.21602 5.33317H11.3327V6.6665H3.21602Z" />
                </svg>
              </span>
              <span>Back</span>
            </button> */}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                onClick={handleCancel}
                disabled={sqlLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center justify-center px-4 py-2 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                disabled={!isValid || sqlLoading}
              >
                {sqlLoading && (
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="w-3 h-3 animate-spin text-primary-text fill-btn-primary"
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
                )}

                <span>Create</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableColumnInformation;
