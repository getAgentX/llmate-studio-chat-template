import React, { useState, useEffect } from "react";
import ExecutionRequest from "../Events/ExecutionRequest";
import GenerateExecution from "../Events/GenerateExecution";
import AssistantResponse from "../Events/AssistantResponse";
import { useTheme } from "@/hooks/useTheme";

const ChatEvents = ({
  events,
  showAddDashboard = false,
  messageId = null,
  assistantName = "",
  streaming = false,
  onRenderComplete = null,
  handleAddWidgetFromEvent = null,
}) => {
  const [groupedEvents, setGroupedEvents] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    if (onRenderComplete) {
      onRenderComplete();
    }
  }, [groupedEvents]);

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

  const thoughtEventList = [
    "tool_exec_request",
    "sql_datasource_sql_generate",
    "tool_exec_response",
  ];
  const thoughtEvents = events?.filter((event) => {
    return thoughtEventList.includes(event.event_type);
  });

  return (
    <div className="flex flex-col w-full space-y-1 overflow-x-auto font-roboto">
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
            (e) =>
              e.event_type === "sql_datasource_sql_execution" &&
              e.error_message === null
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
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-secondary-bg"
                      : "bg-page border border-border-color rounded-br-md rounded-bl-md"
                  }`}
                >
                  <GenerateExecution
                    event={sqlExecution}
                    showAddDashboard={showAddDashboard}
                    validation={sqlValidation}
                    messageId={messageId}
                    streaming={streaming}
                    handleAddWidgetFromEvent={handleAddWidgetFromEvent}
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
};

export default ChatEvents;
