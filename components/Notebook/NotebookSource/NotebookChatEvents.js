import React, { useState, useEffect } from "react";
import ExecutionRequest from "@/components/Events/ExecutionRequest";
import NotebookGenerateExecution from "./NotebookGenerateExecution";
import NotebookRegenerateExecution from "./NotebookRegenerateExecution";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkDownComponent from "@/components/common/MarkDownComponent";
import AssistantResponse from "@/components/Events/AssistantResponse";

const NotebookChatEvents = ({
  events,
  showAddDashboard = false,
  showReaction = false,
  messageId = null,
  assistantName = "",
  handleTextAccept = () => {},
  handleAssistantAccept = () => {},
  isLoadingActive = false,
  streaming = false,
  onRenderComplete = null,
}) => {
  const [validationData, setValidationData] = useState({});
  const [filterEvents, setFilterEvents] = useState(null);
  const [groupedEvents, setGroupedEvents] = useState([]);

  const [toggleThought, setToggleThought] = useState(false);
  const [thoughtData, setThoughtData] = useState([]);

  useEffect(() => {
    if (onRenderComplete) {
      onRenderComplete();
    }
  }, [groupedEvents]);

  // useEffect(() => {
  //   if (events) {
  //     const groupedEvents = [];
  //     let currentGroup = null;
  //     let hasExecution = false;
  //     let hasValidation = false;
  //     let discardGroup = false;

  //     events.forEach((event) => {
  //       if (event.event_type === "assistant_response") {
  //         groupedEvents.push({
  //           type: "assistant_response",
  //           data: [event],
  //         });
  //       } else if (event.event_type === "tool_exec_request") {
  //         currentGroup = {
  //           type: "tool_execution_group",
  //           data: [event],
  //         };
  //         hasExecution = false;
  //         hasValidation = false;
  //         discardGroup = false;
  //       } else if (
  //         event.event_type === "sql_datasource_sql_execution" ||
  //         event.event_type === "sql_datasource_validation"
  //       ) {
  //         if (currentGroup) {
  //           currentGroup.data.push(event);

  //           if (event.event_type === "sql_datasource_sql_execution") {
  //             hasExecution = true;
  //             if (event.error_message) {
  //               discardGroup = true;
  //             }
  //           }

  //           if (event.event_type === "sql_datasource_validation") {
  //             hasValidation = true;

  //             if (!discardGroup && hasExecution && hasValidation) {
  //               groupedEvents.push(currentGroup);
  //             }

  //             currentGroup = null;
  //             hasExecution = false;
  //             hasValidation = false;
  //             discardGroup = false;
  //           }
  //         } else {
  //           // sql_datasource_sql_execution or sql_datasource_validation without preceding tool_exec_request
  //           // Do not create a group; ignore these events
  //         }
  //       } else {
  //         // Ignore other events
  //       }
  //     });

  //     if (currentGroup && !discardGroup && hasExecution && hasValidation) {
  //       groupedEvents.push(currentGroup);
  //     }

  //     setGroupedEvents(groupedEvents);
  //   }
  // }, [events]);

  useEffect(() => {
    if (events) {
      const groupedEvents = [];
      let currentGroup = null;
      let hasExecution = false;
      let hasValidation = false;
      let discardGroup = false;
      let assistantResponsesBuffer = [];

      events.forEach((event) => {
        if (event.event_type === "tool_exec_request") {
          // Start a new group
          currentGroup = {
            type: "tool_execution_group",
            data: [event],
            dataframe: null, // Initialize dataframe property
          };
          hasExecution = false;
          hasValidation = false;
          discardGroup = false;
          assistantResponsesBuffer = [];
        } else if (
          event.event_type === "sql_datasource_sql_execution" ||
          event.event_type === "sql_datasource_validation"
        ) {
          if (currentGroup) {
            currentGroup.data.push(event);

            if (
              event.event_type === "sql_datasource_sql_execution" &&
              event.error_message === null
            ) {
              hasExecution = true;
              // Extract dataframe if available
              if (event.dataframe) {
                currentGroup.dataframe = event.dataframe;
              } else if (event.response && event.response.dataframe) {
                currentGroup.dataframe = event.response.dataframe;
              } else if (event.response) {
                currentGroup.dataframe = event.response;
              }
            } else if (event.error_message) {
              discardGroup = true;
            }

            if (event.event_type === "sql_datasource_validation") {
              hasValidation = true;

              if (!discardGroup && hasExecution) {
                // Include assistant_responses if hasValidation is true
                if (hasValidation) {
                  currentGroup.data = currentGroup.data.concat(
                    assistantResponsesBuffer
                  );
                } else {
                  // Exclude assistant_responses
                  currentGroup.data = currentGroup.data.filter(
                    (e) => e.event_type !== "assistant_response"
                  );
                }
                groupedEvents.push(currentGroup);
              }

              // Reset group
              currentGroup = null;
              hasExecution = false;
              hasValidation = false;
              discardGroup = false;
              assistantResponsesBuffer = [];
            }
          }
        } else if (event.event_type === "assistant_response") {
          if (currentGroup) {
            // Buffer assistant_response events
            // assistantResponsesBuffer.push(event);

            groupedEvents.push(currentGroup);

            currentGroup = null;
            hasExecution = false;
            hasValidation = false;
            discardGroup = false;
            assistantResponsesBuffer = [];
          }

          groupedEvents.push({
            type: "assistant_response",
            data: [event],
          });
        } else {
          // Ignore other events
        }
      });

      // Check for any remaining group at the end
      if (currentGroup && !discardGroup && hasExecution) {
        if (hasValidation) {
          currentGroup.data = currentGroup.data.concat(
            assistantResponsesBuffer
          );
        } else {
          // Exclude assistant_responses
          currentGroup.data = currentGroup.data.filter(
            (e) => e.event_type !== "assistant_response"
          );
        }
        groupedEvents.push(currentGroup);
      }

      setGroupedEvents(groupedEvents);
    }
  }, [events]);

  function removeHyphens(text) {
    return text.replace(/[-\/_:]/g, " ");
  }

  const thoughtEventList = [
    "tool_exec_request",
    "sql_datasource_sql_generate",
    "tool_exec_response",
  ];
  const thoughtEvents = events?.filter((event) => {
    return thoughtEventList.includes(event.event_type);
  });

  return (
    <div className="flex flex-col w-full space-y-2 overflow-x-auto font-roboto">
      {!streaming && thoughtEvents?.length > 0 && (
        <div className="flex flex-col">
          <div
            className="flex items-center justify-between py-1 space-x-2 cursor-pointer group w-fit"
            onClick={() => setToggleThought(!toggleThought)}
          >
            <p className="text-sm font-medium text-secondary-text group-hover:text-primary-text">
              Thoughts
            </p>

            <span className="flex items-center justify-center">
              {toggleThought || (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="w-4 h-4 fill-icon-color group-hover:fill-icon-color-hover"
                >
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              )}

              {toggleThought && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="w-4 h-4 fill-icon-color-hover"
                >
                  <path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"></path>
                </svg>
              )}
            </span>
          </div>

          {toggleThought && (
            <div className="flex flex-col py-2 pl-4 border-l-2 border-border-color">
              {thoughtEvents?.map((item, index) => {
                if (
                  item.event_type === "tool_exec_request" &&
                  item.tool_call_data.tool_call_type === "SQL"
                ) {
                  return (
                    <div className="flex flex-col space-y-3" key={index}>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-sm font-medium text-primary-text">
                          <span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 256 256"
                              className="w-4 h-4 fill-icon-color-hover"
                            >
                              <path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64Zm-21.61,74.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z"></path>
                            </svg>
                          </span>

                          <p>{removeHyphens(item.tool_routing.register_as)}</p>
                        </div>

                        <div className="relative group">
                          <span className="flex items-center justify-center cursor-pointer">
                            <svg
                              viewBox="0 0 14 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 fill-icon-color hover:fill-icon-color-hover"
                            >
                              <path d="M6.33398 10.8334H7.66732V6.83337H6.33398V10.8334ZM7.00065 5.50004C7.18954 5.50004 7.34787 5.43615 7.47565 5.30837C7.60343 5.1806 7.66732 5.02226 7.66732 4.83337C7.66732 4.64448 7.60343 4.48615 7.47565 4.35837C7.34787 4.2306 7.18954 4.16671 7.00065 4.16671C6.81176 4.16671 6.65343 4.2306 6.52565 4.35837C6.39787 4.48615 6.33398 4.64448 6.33398 4.83337C6.33398 5.02226 6.39787 5.1806 6.52565 5.30837C6.65343 5.43615 6.81176 5.50004 7.00065 5.50004ZM7.00065 14.1667C6.07843 14.1667 5.21176 13.9917 4.40065 13.6417C3.58954 13.2917 2.88398 12.8167 2.28398 12.2167C1.68398 11.6167 1.20898 10.9112 0.858984 10.1C0.508984 9.28893 0.333984 8.42226 0.333984 7.50004C0.333984 6.57782 0.508984 5.71115 0.858984 4.90004C1.20898 4.08893 1.68398 3.38337 2.28398 2.78337C2.88398 2.18337 3.58954 1.70837 4.40065 1.35837C5.21176 1.00837 6.07843 0.833374 7.00065 0.833374C7.92287 0.833374 8.78954 1.00837 9.60065 1.35837C10.4118 1.70837 11.1173 2.18337 11.7173 2.78337C12.3173 3.38337 12.7923 4.08893 13.1423 4.90004C13.4923 5.71115 13.6673 6.57782 13.6673 7.50004C13.6673 8.42226 13.4923 9.28893 13.1423 10.1C12.7923 10.9112 12.3173 11.6167 11.7173 12.2167C11.1173 12.8167 10.4118 13.2917 9.60065 13.6417C8.78954 13.9917 7.92287 14.1667 7.00065 14.1667ZM7.00065 12.8334C8.48954 12.8334 9.75065 12.3167 10.784 11.2834C11.8173 10.25 12.334 8.98893 12.334 7.50004C12.334 6.01115 11.8173 4.75004 10.784 3.71671C9.75065 2.68337 8.48954 2.16671 7.00065 2.16671C5.51176 2.16671 4.25065 2.68337 3.21732 3.71671C2.18398 4.75004 1.66732 6.01115 1.66732 7.50004C1.66732 8.98893 2.18398 10.25 3.21732 11.2834C4.25065 12.3167 5.51176 12.8334 7.00065 12.8334Z" />
                            </svg>
                          </span>

                          <div className="absolute z-[1000] hidden w-full p-2 text-xs font-medium tracking-wider border rounded-md border-border-color bg-page text-secondary-text group-hover:block top-6 left-2 min-w-96 max-w-96 shadow-md">
                            {item.tool_routing.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col pl-2 space-y-1">
                        <p className="text-xs font-medium text-primary-text">
                          {item.tool_call_data.query}
                        </p>
                      </div>
                    </div>
                  );
                }

                if (
                  item.event_type === "tool_exec_request" &&
                  item.tool_call_data.tool_call_type === "SEMI_STRUCTURED"
                ) {
                  return (
                    <div className="flex flex-col w-full" key={index}>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-sm font-medium tracking-wide">
                            <span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 256 256"
                                className="w-4 h-4 fill-icon-color-hover"
                              >
                                <path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64Zm-21.61,74.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z"></path>
                              </svg>
                            </span>

                            <span className="text-sm font-semibold text-primary-text">
                              {item?.tool_routing?.register_as}
                            </span>
                          </div>

                          <div className="relative group">
                            <span className="flex items-center justify-center cursor-pointer">
                              <svg
                                viewBox="0 0 14 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 fill-icon-color hover:fill-icon-color-hover"
                              >
                                <path d="M6.33398 10.8334H7.66732V6.83337H6.33398V10.8334ZM7.00065 5.50004C7.18954 5.50004 7.34787 5.43615 7.47565 5.30837C7.60343 5.1806 7.66732 5.02226 7.66732 4.83337C7.66732 4.64448 7.60343 4.48615 7.47565 4.35837C7.34787 4.2306 7.18954 4.16671 7.00065 4.16671C6.81176 4.16671 6.65343 4.2306 6.52565 4.35837C6.39787 4.48615 6.33398 4.64448 6.33398 4.83337C6.33398 5.02226 6.39787 5.1806 6.52565 5.30837C6.65343 5.43615 6.81176 5.50004 7.00065 5.50004ZM7.00065 14.1667C6.07843 14.1667 5.21176 13.9917 4.40065 13.6417C3.58954 13.2917 2.88398 12.8167 2.28398 12.2167C1.68398 11.6167 1.20898 10.9112 0.858984 10.1C0.508984 9.28893 0.333984 8.42226 0.333984 7.50004C0.333984 6.57782 0.508984 5.71115 0.858984 4.90004C1.20898 4.08893 1.68398 3.38337 2.28398 2.78337C2.88398 2.18337 3.58954 1.70837 4.40065 1.35837C5.21176 1.00837 6.07843 0.833374 7.00065 0.833374C7.92287 0.833374 8.78954 1.00837 9.60065 1.35837C10.4118 1.70837 11.1173 2.18337 11.7173 2.78337C12.3173 3.38337 12.7923 4.08893 13.1423 4.90004C13.4923 5.71115 13.6673 6.57782 13.6673 7.50004C13.6673 8.42226 13.4923 9.28893 13.1423 10.1C12.7923 10.9112 12.3173 11.6167 11.7173 12.2167C11.1173 12.8167 10.4118 13.2917 9.60065 13.6417C8.78954 13.9917 7.92287 14.1667 7.00065 14.1667ZM7.00065 12.8334C8.48954 12.8334 9.75065 12.3167 10.784 11.2834C11.8173 10.25 12.334 8.98893 12.334 7.50004C12.334 6.01115 11.8173 4.75004 10.784 3.71671C9.75065 2.68337 8.48954 2.16671 7.00065 2.16671C5.51176 2.16671 4.25065 2.68337 3.21732 3.71671C2.18398 4.75004 1.66732 6.01115 1.66732 7.50004C1.66732 8.98893 2.18398 10.25 3.21732 11.2834C4.25065 12.3167 5.51176 12.8334 7.00065 12.8334Z" />
                              </svg>
                            </span>

                            <div className="absolute z-[1000] hidden w-full p-2 text-xs font-medium tracking-wider border rounded-md border-border-color bg-page text-secondary-text group-hover:block top-6 left-2 min-w-96 max-w-96 shadow-md">
                              {item.tool_routing.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col pl-2 space-y-2">
                          {item?.tool_call_data.filter_rules && (
                            <div className="flex items-center space-x-2">
                              {Object.keys(
                                item?.tool_call_data.filter_rules
                              ).map((field_id, index) => {
                                let filters = [];
                                for (const filter_type of Object.keys(
                                  item?.tool_call_data.filter_rules[field_id]
                                )) {
                                  const value =
                                    item?.tool_call_data.filter_rules[field_id][
                                      filter_type
                                    ];

                                  if (
                                    item?.tool_call_data.column_type_map[
                                      field_id
                                    ] == "str"
                                  ) {
                                    if (Array.isArray(value)) {
                                      for (let filter_value of value) {
                                        filters.push(
                                          <button
                                            type="button"
                                            className="flex items-center justify-between px-2 py-1 text-xs font-normal rounded-md cursor-auto text-primary-text bg-primary"
                                            disabled={true}
                                            index={`${index}-${filter_type}`}
                                          >
                                            {
                                              item?.tool_call_data
                                                .column_name_map[field_id]
                                            }

                                            {filter_type == "contains_list" &&
                                              " ≈ "}
                                            {filter_type ==
                                              "not_contains_list" && " ≉ "}

                                            {filter_value}
                                          </button>
                                        );
                                      }
                                    } else if (typeof value == "string") {
                                      filters.push(
                                        <button
                                          type="button"
                                          className="flex items-center justify-between px-2 py-1 text-xs font-normal rounded-md cursor-auto text-primary-text bg-primary"
                                          disabled={true}
                                          index={`${index}-${filter_type}`}
                                        >
                                          {
                                            item?.tool_call_data
                                              .column_name_map[field_id]
                                          }

                                          {filter_type == "contains_list" &&
                                            " ≈ "}
                                          {filter_type == "not_contains_list" &&
                                            " ≉ "}
                                          {filter_type == "eq" && " = "}

                                          {value}
                                        </button>
                                      );
                                    }
                                  }

                                  if (
                                    item?.tool_call_data.column_type_map[
                                      field_id
                                    ] == "number"
                                  ) {
                                    filters.push(
                                      <button
                                        type="button"
                                        className="flex items-center justify-between px-2 py-1 text-xs font-normal rounded-md cursor-auto text-primary-text bg-primary"
                                        disabled={true}
                                        index={`${index}-${filter_type}`}
                                      >
                                        {
                                          item?.tool_call_data.column_name_map[
                                            field_id
                                          ]
                                        }

                                        {filter_type == "gt" && " > "}
                                        {filter_type == "gte" && " >= "}
                                        {filter_type == "lt" && " < "}
                                        {filter_type == "lte" && " <= "}
                                        {filter_type == "eq" && " = "}

                                        {value}
                                      </button>
                                    );
                                  }
                                }
                                return filters;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item.event_type === "sql_datasource_sql_generate") {
                  return (
                    <pre className="pl-2 mt-2 text-xs font-medium text-wrap font-roboto text-secondary-text">
                      {item.steps_to_follow}
                    </pre>
                  );
                }

                if (item.event_type === "tool_exec_response") {
                  return <div className="w-full py-2"></div>;
                }
              })}
            </div>
          )}
        </div>
      )}

      {groupedEvents.map((group, index) => {
        if (group.type === "assistant_response") {
          // Render assistant responses
          return group.data.map((event, idx) => (
            <div key={`${index}-${idx}`}>
              <AssistantResponse event={event} />
            </div>
          ));
        } else if (group.type === "tool_execution_group") {
          // Extract events from the group
          const executionRequest = group.data.find(
            (e) => e.event_type === "tool_exec_request"
          );

          const sqlExecution = group.data.find(
            (e) => e.event_type === "sql_datasource_sql_execution"
          );

          const sqlValidation = group.data.find(
            (e) => e.event_type === "sql_datasource_validation"
          );

          return (
            <div key={index}>
              {/* Render Execution Request */}
              {executionRequest && (
                <div>
                  <ExecutionRequest
                    event={executionRequest}
                    assistantName={assistantName}
                    score={sqlExecution?.highest_confidence_score}
                  />
                </div>
              )}

              {/* Render SQL Execution */}
              {sqlExecution && (
                <div className="bg-secondary-bg">
                  <NotebookGenerateExecution
                    event={sqlExecution}
                    showAddDashboard={showAddDashboard}
                    validation={sqlValidation}
                    messageId={messageId}
                    streaming={streaming}
                    handleAssistantAccept={handleAssistantAccept}
                    isLoadingActive={isLoadingActive}
                  />
                </div>
              )}
            </div>
          );
        } else {
          return null;
        }
      })}

      {!streaming && thoughtEvents?.length > 0 && (
        <div className="flex flex-col">
          <div className="flex flex-col">
            {thoughtEvents?.map((item, index) => {
              if (
                item.event_type === "tool_exec_response" &&
                item.error_message
              ) {
                return (
                  <div className="flex flex-col w-full max-w-2xl px-3 py-2 space-y-2 rounded-md bg-input-error-bg">
                    <div className="flex items-center w-full space-x-2">
                      <span className="flex items-center justify-center">
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                        >
                          <circle
                            cx="7.9974"
                            cy="8.00033"
                            r="5.33333"
                            fill="#F6F6F6"
                          />
                          <path
                            d="M8 12C8.22667 12 8.41667 11.9233 8.57 11.77C8.72333 11.6167 8.8 11.4267 8.8 11.2C8.8 10.9733 8.72333 10.7833 8.57 10.63C8.41667 10.4767 8.22667 10.4 8 10.4C7.77333 10.4 7.58333 10.4767 7.43 10.63C7.27667 10.7833 7.2 10.9733 7.2 11.2C7.2 11.4267 7.27667 11.6167 7.43 11.77C7.58333 11.9233 7.77333 12 8 12ZM7.2 8.8H8.8V4H7.2V8.8ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                            fill="#C61B1B"
                          />
                        </svg>
                      </span>

                      <span className="text-xs font-medium text-input-error-text">
                        Failed to fetch data from{" "}
                        {item?.tool_routing?.register_as}
                      </span>
                    </div>

                    <div className="text-xs font-normal leading-5 text-primary-text">
                      {item?.error_message}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );

  // return (
  //   <div className="w-full">
  //     <div className="flex flex-col space-y-2">
  //       {filterEvents?.map((event, index) => {
  //         if (event.event_type === "tool_exec_request") {
  //           return (
  //             <div
  //               className="flex flex-col w-full rounded-t-lg lg:pr-0 lg:pl-0 xsm:space-x-4 xsm:space-y-0 bg-secondary-bg xsm:flex-row"
  //               key={index}
  //             >
  //               <ExecutionRequest event={event} assistantName={assistantName} />
  //             </div>
  //           );
  //         }

  //         if (
  //           event.event_type === "sql_datasource_sql_execution" &&
  //           event.sql_source === "SQLDatasourceSQLGeneration"
  //         ) {
  //           return (
  //             <div
  //               className="flex flex-col w-full space-y-2 lg:pr-0 lg:pl-0 xsm:space-x-4 xsm:space-y-0 bg-secondary-bg xsm:flex-row"
  //               key={index}
  //             >
  //               <NotebookGenerateExecution
  //                 event={event}
  //                 showAddDashboard={showAddDashboard}
  //                 validation={validationData}
  //                 messageId={messageId}
  //                 streaming={streaming}
  //                 handleAssistantAccept={handleAssistantAccept}
  //                 isLoadingActive={isLoadingActive}
  //               />
  //             </div>
  //           );
  //         }

  //         if (event.event_type === "assistant_response") {
  //           return (
  //             <div
  //               className="flex flex-col w-full mt-2 space-y-2 lg:pr-0 lg:pl-0 xsm:space-x-4 xsm:space-y-0 xsm:flex-row"
  //               key={index}
  //             >
  //               <div className="flex items-start w-full space-x-2">
  //                 <div className="flex flex-col w-full space-y-2">
  //                   <div className="w-full text-sm leading-7 text-white">
  //                     <Markdown
  //                       remarkPlugins={[remarkGfm]}
  //                       components={MarkDownComponent}
  //                     >
  //                       {event.response}
  //                     </Markdown>
  //                   </div>
  //                 </div>

  //                 {isLoadingActive || (
  //                   <span
  //                     className="flex items-center justify-center mt-2 cursor-pointer"
  //                     onClick={() => handleTextAccept(event.response)}
  //                     data-tooltip-id="tooltip"
  //                     data-tooltip-content="Add Response to Notebook Interface"
  //                     data-tooltip-place="top"
  //                   >
  //                     <svg
  //                       viewBox="0 0 12 12"
  //                       fill="none"
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       className="w-4 h-4"
  //                     >
  //                       <path
  //                         d="M5.16602 6.83463H0.166016V5.16797H5.16602V0.167969H6.83268V5.16797H11.8327V6.83463H6.83268V11.8346H5.16602V6.83463Z"
  //                         fill="#295EF4"
  //                       />
  //                     </svg>
  //                   </span>
  //                 )}
  //               </div>
  //             </div>
  //           );
  //         }
  //       })}
  //     </div>
  //   </div>
  // );
};

export default NotebookChatEvents;
