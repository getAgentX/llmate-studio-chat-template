import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkDownComponent from "../common/MarkDownComponent";

const AssistantResponse = ({ event }) => {
  return (
      <div className="flex flex-col space-y-2">
        <div className="w-full text-sm leading-7 text-primary-text">
          <Markdown remarkPlugins={[remarkGfm]} components={MarkDownComponent}>
            {event.response}
          </Markdown>
        </div>
      </div>
  );
};

export default AssistantResponse;
