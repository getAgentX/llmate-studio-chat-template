import React, { useEffect, useRef, useState } from "react";
import DatasourceChatBot from "./DatasourceChatBot";
import AssistantChatBot from "./AssistantChatBot";
import { useGetDatasourcesListQuery } from "@/store/datasource";
import { useGetAssistantsQuery } from "@/store/assistant";
import useDebounce from "@/hooks/useDebounce";
import { AssistantIcon } from "@/components/Icons/icon";

const NotebookSource = ({
  insertDatasourceBlock,
  insertAssistantBlock,
  data_type,
  datasourceId,
  assistantId,
  source_block,
  initialData,
  setSourceProps,
  editor,
}) => {
  const [currentDatasource, setCurrentDatasource] = useState({});
  const [currentAssistant, setCurrentAssistant] = useState({});
  const [toggleDatasource, setToggleDatasource] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAssistantQuery, setSearchAssistantQuery] = useState("");
  const [currentAnalyzer, setCurrentAnalyzer] = useState("datasource");

  const datasourceRef = useRef(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedAssistantSearchQuery = useDebounce(searchAssistantQuery, 500);

  const handleOutsideClick = (e) => {
    if (datasourceRef.current && !datasourceRef.current.contains(e.target)) {
      setSearchQuery("");
      setSearchAssistantQuery("");
      setToggleDatasource(false);
    }
  };

  useEffect(() => {
    if (toggleDatasource) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [toggleDatasource]);

  // Fetch Datasources
  const { data: getRes, isLoading: datasourceLoading } =
    useGetDatasourcesListQuery({
      skip: 0,
      limit: 100,
      sort_by: "A-Z",
      ds_type: "sql_generator",
      query: debouncedSearchQuery,
    });

  // Fetch Assistants
  const { data: getAssistantsRes, isLoading: isAssistantsLoading } =
    useGetAssistantsQuery(
      {
        skip: 0,
        limit: 100,
        sort_by: "A-Z",
        query: debouncedAssistantSearchQuery,
      },
      {
        refetchOnMountOrArgChange: true,
      }
    );

  // Insert blocks
  const handleDatasourceInsertBlock = (content) => {
    insertDatasourceBlock(source_block, content);
  };

  const handleAssistantInsertBlock = (content) => {
    insertAssistantBlock(source_block, content);
  };

  // Handle datasource selection
  const handleDatasourceChange = (datasource) => {
    setCurrentDatasource(datasource);
    setCurrentAssistant({});
    setToggleDatasource(false);
  };

  const handleRestSourceProps = () => {
    setCurrentDatasource({});
    setCurrentAssistant({});
    setSourceProps({});
  };

  const handleChangeSource = (type, id) => {
    if (type === "sql_datasource_run") {
      setSourceProps({
        data_type: "sql_datasource_run",
        datasourceId: id,
        source_block: editor.getTextCursorPosition().block.id,
      });
    }

    if (type === "chatbot_sql_datasource_run") {
      setSourceProps({
        data_type: "chatbot_sql_datasource_run",
        assistantId: id,
        source_block: editor.getTextCursorPosition().block.id,
      });
    }
  };

  const generateKey = () => {
    if (data_type === "sql_datasource_run") {
      return `datasource-${datasourceId}-${source_block}`;
    }
    if (data_type === "chatbot_sql_datasource_run") {
      return `assistant-${assistantId}-${source_block}`;
    }
    return `default-${Date.now()}`;
  };

  // Return the correct chatbot if data_type is present
  if (data_type === "sql_datasource_run") {
    return (
      <div className="flex flex-col w-full h-full max-h-full overflow-hidden">
        <DatasourceChatBot
          key={generateKey()}
          insertBlock={handleDatasourceInsertBlock}
          id={datasourceId}
          initialData={initialData}
          source_block={source_block}
          handleRestSourceProps={handleRestSourceProps}
          handleChangeSource={handleChangeSource}
        />
      </div>
    );
  }

  if (data_type === "chatbot_sql_datasource_run") {
    return (
      <div className="flex flex-col w-full h-full overflow-hidden">
        <AssistantChatBot
          key={generateKey()}
          insertBlock={handleAssistantInsertBlock}
          id={assistantId}
          initialData={initialData}
          source_block={source_block}
          handleRestSourceProps={handleRestSourceProps}
          handleChangeSource={handleChangeSource}
        />
      </div>
    );
  }

  // Otherwise, show the default UI to choose a datasource or assistant
  return (
    <div className="flex items-center justify-center flex-1 h-full">
      <div className="flex flex-col space-y-3 text-center">
        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 48 47"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 fill-icon-color"
          >
            <path d="M19.2311 32.8327C23.12 32.8327 26.4256 31.4716 29.1478 28.7493C31.87 26.0271 33.2311 22.7216 33.2311 18.8327C33.2311 14.9438 31.87 11.6382 29.1478 8.91602C26.4256 6.19379 23.12 4.83268 19.2311 4.83268C15.3422 4.83268 12.0367 6.19379 9.31445 8.91602C6.59223 11.6382 5.23112 14.9438 5.23112 18.8327C5.23112 22.7216 6.59223 26.0271 9.31445 28.7493C12.0367 31.4716 15.3422 32.8327 19.2311 32.8327ZM16.8978 25.8327V9.49935H21.5645V25.8327H16.8978ZM8.73112 25.8327V14.166H13.3978V25.8327H8.73112ZM25.0645 25.8327V16.4993H29.7311V25.8327H25.0645ZM43.9645 46.8327L30.7228 33.591C29.1283 34.8355 27.3589 35.798 25.4145 36.4785C23.47 37.1591 21.4089 37.4993 19.2311 37.4993C14.02 37.4993 9.60612 35.691 5.98945 32.0743C2.37279 28.4577 0.564453 24.0438 0.564453 18.8327C0.564453 13.6216 2.37279 9.20768 5.98945 5.59102C9.60612 1.97435 14.02 0.166016 19.2311 0.166016C24.4422 0.166016 28.8561 1.97435 32.4728 5.59102C36.0895 9.20768 37.8978 13.6216 37.8978 18.8327C37.8978 21.0105 37.5575 23.0716 36.877 25.016C36.1964 26.9605 35.2339 28.7299 33.9895 30.3243L47.2311 43.566L43.9645 46.8327Z" />
          </svg>
        </span>

        <p className="text-sm font-semibold text-primary-text">
          Call your datasource or assistant here
        </p>
        <p className="w-full max-w-sm text-xs font-medium text-center text-secondary-text">
          Choose the required datasource or assistant for your tasks and analyze
          it here to get the data.
        </p>

        <div className="relative flex w-full" ref={datasourceRef}>
          <div
            className={`w-full cursor-pointer border bg-dropdown-bg rounded-md ${
              toggleDatasource ? "border-[#242729]" : "border-transparent"
            }`}
          >
            <div
              className="flex items-center justify-between w-full h-8 px-2 py-2 space-x-2 border rounded-md min-w-80 border-dropdown-border"
              onClick={() => setToggleDatasource(!toggleDatasource)}
            >
              {currentDatasource?.name ? (
                <span className="text-xs font-medium text-dropdown-text line-clamp-1 whitespace-nowrap">
                  {currentDatasource?.name}
                </span>
              ) : currentAssistant?.name ? (
                <span className="text-xs font-medium text-dropdown-text line-clamp-1 whitespace-nowrap">
                  {currentAssistant?.name}
                </span>
              ) : (
                <span className="text-xs font-medium text-input-placeholder line-clamp-1 whitespace-nowrap">
                  Choose datasource or assistant
                </span>
              )}

              {toggleDatasource ? (
                <span className="flex items-center justify-center">
                  {/* Up Arrow Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 fill-dropdown-icon"
                  >
                    <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                  </svg>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {/* Down Arrow Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 fill-dropdown-icon"
                  >
                    <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                  </svg>
                </span>
              )}
            </div>
          </div>

          {toggleDatasource && (
            <ul className="flex flex-col w-full bg-dropdown-bg rounded-md max-h-52 overflow-y-auto recent__bar z-10 absolute top-[110%] left-0 shadow-md border-dropdown-border border">
              {/* Analyzer Tabs */}
              <li className="sticky top-0 left-0 w-full bg-dropdown-bg">
                <ul className="flex items-center">
                  <li
                    className={`min-h-8 text-sm font-medium flex items-center space-x-2 justify-center px-2 border-b-2 cursor-pointer ${
                      currentAnalyzer === "datasource"
                        ? "border-tabs-active text-tabs-active"
                        : "border-transparent text-tabs-text hover:text-tabs-hover"
                    }`}
                    onClick={() => setCurrentAnalyzer("datasource")}
                  >
                    <span className="flex items-center justify-center">
                      {/* DB Icon */}
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={
                          currentAnalyzer === "datasource"
                            ? "w-4 h-4 fill-active-icon"
                            : "w-4 h-4 fill-icon-color"
                        }
                      >
                        <path d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z" />
                      </svg>
                    </span>
                    <span>Datasources</span>
                  </li>

                  <li
                    className={`min-h-8 text-sm font-medium flex items-center space-x-2 justify-center px-2 border-b-2 cursor-pointer ${
                      currentAnalyzer === "assistant"
                        ? "border-tabs-active text-tabs-active"
                        : "border-transparent text-tabs-text hover:text-tabs-hover"
                    }`}
                    onClick={() => setCurrentAnalyzer("assistant")}
                  >
                    <span className="flex items-center justify-center">
                      <AssistantIcon size={4} />
                    </span>
                    <span>Assistants</span>
                  </li>
                </ul>
              </li>

              {/* Search Input */}
              <li className="sticky top-0 left-0 w-full p-2 bg-dropdown-bg">
                {currentAnalyzer === "datasource" && (
                  <input
                    type="text"
                    className="w-full h-8 px-2 text-xs border rounded-md outline-none bg-dropdown-bg text-primary-text border-dropdown-border placeholder:text-input-placeholder focus:border-active-border"
                    placeholder="Search datasource"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                )}

                {currentAnalyzer === "assistant" && (
                  <input
                    type="text"
                    className="w-full h-8 px-2 text-xs border rounded-md outline-none bg-dropdown-bg text-primary-text border-dropdown-border placeholder:text-input-placeholder focus:border-active-border"
                    placeholder="Search assistant"
                    value={searchAssistantQuery}
                    onChange={(e) => setSearchAssistantQuery(e.target.value)}
                  />
                )}
              </li>

              {/* Loading and Empty States */}
              {currentAnalyzer === "datasource" && datasourceLoading && (
                <li className="flex items-center justify-center h-40 px-4">
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 animate-spin text-primary-text fill-btn-primary"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 
                          0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 
                          100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 
                          73.1895 27.4013 91.5094 50 91.5094C72.5987 
                          91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 
                          27.9921 72.5987 9.67226 50 9.67226C27.4013 
                          9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 
                          38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 
                          28.8227 92.871 24.3692 89.8167 20.348C85.8452 
                          15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 
                          4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 
                          0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 
                          1.69328 37.813 4.19778 38.4501 6.62326C39.0873 
                          9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 
                          9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 
                          10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 
                          17.9648 79.3347 21.5619 82.5849 25.841C84.9175 
                          28.9121 86.7997 32.2913 88.1811 35.8758C89.083 
                          38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                </li>
              )}

              {currentAnalyzer === "datasource" &&
                !datasourceLoading &&
                !(getRes?.length > 0) && (
                  <li className="flex items-center justify-center h-40 px-4 text-xs font-medium text-center capitalize text-dropdown-text">
                    Datasource not available
                  </li>
                )}

              {currentAnalyzer === "assistant" &&
                !isAssistantsLoading &&
                !(getAssistantsRes?.length > 0) && (
                  <li className="flex items-center justify-center h-40 px-4 text-xs font-medium text-center capitalize text-dropdown-text">
                    Assistant not available
                  </li>
                )}

              {/* Datasource List */}
              {!datasourceLoading &&
                currentAnalyzer === "datasource" &&
                getRes?.length > 0 &&
                getRes
                  ?.filter(
                    (item) => item.ds_config.ds_type !== "semi_structured"
                  )
                  .map((datasource) => (
                    <li
                      key={datasource.id}
                      className="flex items-center justify-between h-8 px-2 py-2 text-xs font-medium border-b cursor-pointer border-dropdown-border hover:bg-btn-primary text-dropdown-text bg-dropdown-bg"
                      onClick={() => {
                        handleDatasourceChange(datasource);
                        setSourceProps({
                          data_type: "sql_datasource_run",
                          datasourceId: datasource.id,
                          source_block: editor.getTextCursorPosition().block.id,
                        });
                        // setDatasourceId(datasource.id);
                      }}
                    >
                      <div className="flex items-center space-x-2 line-clamp-1">
                        <span className="flex items-center justify-center">
                          {/* DB Icon */}
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 fill-icon-color"
                          >
                            <path
                              d="M8 14C6.32222 14 4.90278 13.7417 3.74167 
                              13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 
                              3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 
                              6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 
                              2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 
                              12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 
                              9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 
                              5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 
                              12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 
                              10.9917 3.76667C9.99722 3.47778 9 3.33333 8 
                              3.33333C6.98889 3.33333 5.99722 3.475 5.025 
                              3.75833C4.05278 4.04167 3.48889 4.35 3.33333 
                              4.68333C3.48889 5.01667 4.05278 5.32222 5.025 
                              5.6C5.99722 5.87778 6.98889 6.01667 8 
                              6.01667ZM8 9.33333C8.46667 9.33333 8.91667 
                              9.31111 9.35 9.26667C9.78333 9.22222 10.1972 
                              9.15833 10.5917 9.075C10.9861 8.99167 11.3583 
                              8.88889 11.7083 8.76667C12.0583 8.64444 
                              12.3778 8.50556 12.6667 8.35V6.35C12.3778 
                              6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 
                              6.88889 10.9861 6.99167 10.5917 7.075C10.1972 
                              7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 
                              8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 
                              7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 
                              7.15833 5.375 7.075C4.98056 6.99167 4.61111 
                              6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 
                              6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 
                              8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 
                              8.99167 5.375 9.075C5.76944 9.15833 6.18889 
                              9.22222 6.63333 9.26667C7.07778 9.31111 
                              7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 
                              12.6667 9.03056 12.6278 9.55833 12.55C10.0861 
                              12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 
                              12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 
                              11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 
                              9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 
                              10.9861 10.325 10.5917 10.4083C10.1972 10.4917 
                              9.78333 10.5556 9.35 10.6C8.91667 10.6444 
                              8.46667 10.6667 8 10.6667C7.53333 10.6667 
                              7.07778 10.6444 6.63333 10.6C6.18889 10.5556 
                              5.76944 10.4917 5.375 10.4083C4.98056 10.325 
                              4.61111 10.2222 4.26667 10.1C3.92222 9.97778 
                              3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 
                              11.5 3.56389 11.6611 3.85833 11.8167C4.15278 
                              11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 
                              12.3694 5.9 12.4722 6.43333 12.55C6.96667 
                              12.6278 7.48889 12.6667 8 12.6667Z"
                            />
                          </svg>
                        </span>
                        <span>{datasource.name}</span>

                        {currentDatasource.id === datasource.id && (
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="5.70312"
                                cy="6.30078"
                                r="4.5"
                                fill="#F6F6F6"
                              />
                              <path
                                d="M5.16 8.76L9.39 4.53L8.55 3.69L5.16 7.08L3.45 5.37L2.61 6.21L5.16 
                                  8.76ZM6 12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 
                                  11.2125 2.295 10.785 1.755 10.245C1.215 9.705 
                                  0.7875 9.07 0.4725 8.34C0.1575 7.61 0 6.83 0 
                                  6C0 5.17 0.1575 4.39 0.4725 3.66C0.7875 2.93 
                                  1.215 2.295 1.755 1.755C2.295 1.215 2.93 
                                  0.7875 3.66 0.4725C4.39 0.1575 5.17 0 6 
                                  0C6.83 0 7.61 0.1575 8.34 0.4725C9.07 0.7875 
                                  9.705 1.215 10.245 1.755C10.785 2.295 11.2125 
                                  2.93 11.5275 3.66C11.8425 4.39 12 5.17 
                                  12 6C12 6.83 11.8425 7.61 11.5275 8.34C11.2125 
                                  9.07 10.785 9.705 10.245 10.245C9.705 
                                  10.785 9.07 11.2125 8.34 11.5275C7.61 11.8425 
                                  6.83 12 6 12Z"
                                fill="#295EF4"
                              />
                            </svg>
                          </span>
                        )}
                      </div>

                      {datasource.ds_config.ds_type === "sql_generator" && (
                        <div className="text-xs flex font-medium items-center justify-center space-x-2 text-[#40AD7D] w-fit">
                          <span>Structured</span>
                        </div>
                      )}
                      {datasource.ds_config.ds_type === "semi_structured" && (
                        <div className="text-xs font-medium flex items-center justify-center space-x-2 text-[#A840AD] w-fit">
                          <span>Semi-Structured</span>
                        </div>
                      )}
                      {datasource.ds_config.ds_type === "third_party" && (
                        <div className="text-xs font-medium flex items-center justify-center space-x-2 text-[#AD7A40] w-fit">
                          <span>Third Party</span>
                        </div>
                      )}
                    </li>
                  ))}

              {/* Assistant List */}
              {!isAssistantsLoading &&
                currentAnalyzer === "assistant" &&
                getAssistantsRes?.length > 0 &&
                getAssistantsRes.map((assistant) => (
                  <li
                    key={assistant.id}
                    className="flex items-center justify-between h-8 px-2 py-2 text-xs font-medium border-b cursor-pointer border-dropdown-border hover:bg-btn-primary text-dropdown-text bg-dropdown-bg"
                    onClick={() => {
                      setCurrentDatasource({});
                      setCurrentAssistant(assistant);
                      setSourceProps({
                        data_type: "chatbot_sql_datasource_run",
                        assistantId: assistant.id,
                        source_block: editor.getTextCursorPosition().block.id,
                      });
                      // setAssistantId(assistant.id);
                      setToggleDatasource(false);
                    }}
                  >
                    <div className="flex items-center space-x-2 line-clamp-1">
                      <span className="flex items-center justify-center">
                        {/* Assistant Icon */}
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                        >
                          <path
                            d="M12.3333 6H3.66667C3.29848 6 3 6.29848 3 6.66667V13.3333C3 
                              13.7015 3.29848 14 3.66667 14H12.3333C12.7015 14 
                              13 13.7015 13 13.3333V6.66667C13 6.29848 
                              12.7015 6 12.3333 6Z"
                            className="stroke-icon-color"
                          />
                          <path
                            d="M5.66667 9.33333C6.03486 9.33333 
                              6.33333 9.03486 6.33333 8.66667C6.33333 
                              8.29848 6.03486 8 5.66667 8C5.29848 8 
                              5 8.29848 5 8.66667C5 9.03486 5.29848 
                              9.33333 5.66667 9.33333Z"
                            className="fill-icon-color"
                          />
                          <path
                            d="M10.3327 9.33333C10.7009 9.33333 
                              10.9993 9.03486 10.9993 8.66667C10.9993 
                              8.29848 10.7009 8 10.3327 8C9.96449 
                              8 9.66602 8.29848 9.66602 8.66667C9.66602 
                              9.03486 9.96449 9.33333 10.3327 9.33333Z"
                            className="fill-icon-color"
                          />
                          <path
                            d="M6.66667 10.6667C6.29847 10.6667 
                              6 10.9652 6 11.3334C6 11.7016 6.29847 
                              12.0001 6.66667 12.0001V10.6667ZM9.33333 
                              12.0001C9.70153 12.0001 10 11.7016 10 
                              11.3334C10 10.9652 9.70153 10.6667 
                              9.33333 10.6667V12.0001ZM6.66667 12.0001H9.33333V10.6667H6.66667V12.0001Z"
                            className="fill-icon-color"
                          />
                          <path
                            d="M8 3.33325V5.99992"
                            className="stroke-icon-color"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M1.33398 8.66675V11.3334"
                            className="stroke-icon-color"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14.666 8.66675V11.3334"
                            className="stroke-icon-color"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8.00065 3.33333C8.36884 3.33333 8.66732 
                              3.03486 8.66732 2.66667C8.66732 2.29848 
                              8.36884 2 8.00065 2C7.63246 2 7.33398 
                              2.29848 7.33398 2.66667C7.33398 3.03486 
                              7.63246 3.33333 8.00065 3.33333Z"
                            className="stroke-icon-color"
                          />
                        </svg>
                      </span>
                      <span>{assistant.name}</span>

                      {currentAssistant.id === assistant.id && (
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="5.70312"
                              cy="6.30078"
                              r="4.5"
                              fill="#F6F6F6"
                            />
                            <path
                              d="M5.16 8.76L9.39 4.53L8.55 3.69L5.16 
                                7.08L3.45 5.37L2.61 6.21L5.16 8.76ZM6 
                                12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 
                                11.2125 2.295 10.785 1.755 10.245C1.215 
                                9.705 0.7875 9.07 0.4725 8.34C0.1575 
                                7.61 0 6.83 0 6C0 5.17 0.1575 4.39 
                                0.4725 3.66C0.7875 2.93 1.215 
                                2.295 1.755 1.755C2.295 1.215 
                                2.93 0.7875 3.66 0.4725C4.39 0.1575 
                                5.17 0 6 0C6.83 0 7.61 0.1575 
                                8.34 0.4725C9.07 0.7875 9.705 
                                1.215 10.245 1.755C10.785 2.295 
                                11.2125 2.93 11.5275 3.66C11.8425 
                                4.39 12 5.17 12 6C12 6.83 11.8425 
                                7.61 11.5275 8.34C11.2125 9.07 
                                10.785 9.705 10.245 10.245C9.705 
                                10.785 9.07 11.2125 8.34 11.5275C7.61 
                                11.8425 6.83 12 6 12Z"
                              fill="#295EF4"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotebookSource;
