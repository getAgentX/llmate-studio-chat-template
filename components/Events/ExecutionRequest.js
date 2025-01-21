import { useTheme } from "@/hooks/useTheme";
import React from "react";

const ExecutionRequest = ({ event, score = false }) => {
  const tool_call_data = event.tool_call_data;

  const { theme } = useTheme();

  if (!tool_call_data) {
    return null;
  }

  if (tool_call_data.tool_call_type == "SQL") {
    return (
      <div
        className={`flex flex-col justify-center w-full min-h-8 py-2 px-3 rounded-tr-md rounded-tl-md ${
          theme === "dark"
            ? "bg-secondary-bg"
            : "shadow-md border-x border-t bg-page"
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center rounded-t-lg ${
              theme === "dark" ? "bg-secondary-bg" : "bg-page"
            }`}
          >
            {tool_call_data.query && (
              <p className="text-sm font-normal tracking-wide capitalize text-primary-text ">
                {tool_call_data.query}
              </p>
            )}
          </div>
        </div>

        {tool_call_data.tables_to_use && (
          <div className="flex items-center px-3 pt-1 pb-2 space-x-2 bg-secondary-bg">
            <p className="text-xs font-normal text-white/60 text-nowrap">
              Selected Tables
            </p>

            {tool_call_data.tables_to_use?.map((table, index) => (
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <button
                  type="button"
                  className="flex items-center justify-between px-2 py-1 text-xs font-normal text-white rounded-md cursor-auto max-w-fit "
                  disabled={true}
                  key={index}
                >
                  <span>{table}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
};

export default ExecutionRequest;
