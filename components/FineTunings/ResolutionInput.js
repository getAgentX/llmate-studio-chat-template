import React, { useState, useEffect } from "react";
import SelectOption from "../common/SelectOption";
import SyntaxHighlighter from "react-syntax-highlighter";
import { stackoverflowDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

const ResolutionInput = ({ eventStats }) => {
  const [currentData, setCurrentData] = useState({});
  const [formattedScore, setFormattedScore] = useState(null);
  const [generationOptions, setGenerationOptions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGenerationSelect = (value) => {
    const selectedData = eventStats.regenerate?.examples_used.find(
      (example) => example.user_query === value.value
    );

    setCurrentData(selectedData || {});

    const currIndex = generationOptions?.findIndex((item) => {
      return item.value === value.value;
    });

    setCurrentIndex(currIndex);

    const formattedS = parseFloat(selectedData?.score?.toFixed(1));
    setFormattedScore(formattedS);
  };

  useEffect(() => {
    const options = eventStats.regenerate?.examples_used?.map((example) => {
      return {
        value: example.user_query,
        label: example.user_query,
      };
    });

    const currIndex = options?.findIndex((item) => {
      return item.value === eventStats.regenerate?.examples_used[0].user_query;
    });

    setCurrentIndex(currIndex);

    if (options) {
      setGenerationOptions(options);

      const selectedData = eventStats.regenerate?.examples_used.find(
        (example) => example.user_query === options[0].value
      );

      setCurrentData(selectedData);

      const formattedS = parseFloat(selectedData?.score?.toFixed(1));
      setFormattedScore(formattedS);
    } else {
      setGenerationOptions({});
    }
  }, []);

  if (eventStats.regenerate?.examples_used?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 border rounded-md min-h-64 border-border">
        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
          >
            <path
              d="M11 17.5H13V11.5H11V17.5ZM12 9.5C12.2833 9.5 12.5208 9.40417 12.7125 9.2125C12.9042 9.02083 13 8.78333 13 8.5C13 8.21667 12.9042 7.97917 12.7125 7.7875C12.5208 7.59583 12.2833 7.5 12 7.5C11.7167 7.5 11.4792 7.59583 11.2875 7.7875C11.0958 7.97917 11 8.21667 11 8.5C11 8.78333 11.0958 9.02083 11.2875 9.2125C11.4792 9.40417 11.7167 9.5 12 9.5ZM12 22.5C10.6167 22.5 9.31667 22.2375 8.1 21.7125C6.88333 21.1875 5.825 20.475 4.925 19.575C4.025 18.675 3.3125 17.6167 2.7875 16.4C2.2625 15.1833 2 13.8833 2 12.5C2 11.1167 2.2625 9.81667 2.7875 8.6C3.3125 7.38333 4.025 6.325 4.925 5.425C5.825 4.525 6.88333 3.8125 8.1 3.2875C9.31667 2.7625 10.6167 2.5 12 2.5C13.3833 2.5 14.6833 2.7625 15.9 3.2875C17.1167 3.8125 18.175 4.525 19.075 5.425C19.975 6.325 20.6875 7.38333 21.2125 8.6C21.7375 9.81667 22 11.1167 22 12.5C22 13.8833 21.7375 15.1833 21.2125 16.4C20.6875 17.6167 19.975 18.675 19.075 19.575C18.175 20.475 17.1167 21.1875 15.9 21.7125C14.6833 22.2375 13.3833 22.5 12 22.5ZM12 20.5C14.2333 20.5 16.125 19.725 17.675 18.175C19.225 16.625 20 14.7333 20 12.5C20 10.2667 19.225 8.375 17.675 6.825C16.125 5.275 14.2333 4.5 12 4.5C9.76667 4.5 7.875 5.275 6.325 6.825C4.775 8.375 4 10.2667 4 12.5C4 14.7333 4.775 16.625 6.325 18.175C7.875 19.725 9.76667 20.5 12 20.5Z"
              fill="#5F6368"
            />
          </svg>
        </span>

        <p className="text-sm font-medium tracking-wider text-white/50">
          No examples available to display here currently
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium tracking-wider text-white">
          Example Viewed ({currentIndex + 1}/{generationOptions.length})
        </p>

        <p className="flex items-center space-x-2 text-sm font-medium text-white/50 text-nowrap">
          <span className="w-5 h-5 flex justify-center items-center rounded-full text-white bg-[#26282D]">
            {generationOptions.length}
          </span>{" "}
          <span>Relevant Examples Picked</span>
        </p>
      </div>

      <div className="flex flex-col w-full p-2 space-y-4 border rounded-md sm:p-4 border-[#212227] bg-page">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col w-full gap-2 text-sm font-normal xsm:flex-row xsm:items-center xsm:justify-between">
            <p className="text-sm font-medium text-white/50">Query</p>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white/50 text-nowrap">
                Similarity score :
              </span>

              <p className="flex items-center space-x-1 text-sm font-medium text-white text-nowrap">
                {formattedScore && <span>{formattedScore}</span>}
              </p>
            </div>
          </div>

          <SelectOption
            options={generationOptions}
            defaultValue={{
              value: eventStats.regenerate?.examples_used[0].user_query,
              label: eventStats.regenerate?.examples_used[0].user_query,
            }}
            onSelect={handleGenerationSelect}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <p className="text-sm font-medium text-white/50">Steps to follow</p>

          <textarea
            readOnly
            type="text"
            className="w-full px-4 py-3 overflow-y-auto text-sm text-white border rounded-md bg-[#181A1C] outline-none resize-none h-36 border-[#212227] placeholder:text-white/40 recent__bar"
            value={currentData.steps_to_follow}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <p className="text-sm font-medium text-white/50">SQL</p>

          <div className="overflow-hidden border rounded-md border-[#212227]">
            <SyntaxHighlighter
              language="Sql"
              style={{
                ...stackoverflowDark,

                hljs: {
                  ...stackoverflowDark.hljs,
                  backgroundColor: "#181A1C",
                  padding: "20px 12px",
                  fontSize: "14px",
                  lineHeight: "24px",
                  fontWeight: "600",
                },
              }}
              wrapLongLines={true}
            >
              {currentData.sql_cmd}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionInput;
