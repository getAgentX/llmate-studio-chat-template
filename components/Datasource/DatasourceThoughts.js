import { useTheme } from "@/hooks/useTheme";
import { Editor } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";

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
  lineHeight: 20,
  mouseWheelZoom: true,
  readOnly: true,
  selectOnLineNumbers: true,
  selectionClipboard: true,
  selectionHighlight: true,
  lineNumbers: "off",
};

const DatasourceThoughts = ({ show, setShow, eventStats }) => {
  const [usedExamples, setUsedExamples] = useState([]);
  const modalRef = useRef(null);
  const { theme : customTheme } = useTheme()
  useEffect(() => {
    let generationExamplesUsed = [];
    let regenerateExamplesUsed = [];

    if (eventStats?.generation?.examples_used) {
      generationExamplesUsed = [...eventStats?.generation?.examples_used];
    }

    if (eventStats?.regenerate?.examples_used) {
      regenerateExamplesUsed = [...eventStats?.regenerate?.examples_used];
    }

    const mergeExamples = [
      ...new Set([...generationExamplesUsed, ...regenerateExamplesUsed]),
    ];
    setUsedExamples(mergeExamples);
  }, [eventStats]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] max-h-full md:inset-0 bg_blur ${
        show ? "" : "hidden"
      }`}
    >
      <div
        className="fixed top-0 bottom-0 right-0 w-full max-w-2xl overflow-x-hidden overflow-y-auto border-l bg-page border-border-color recent__bar"
        ref={modalRef}
      >
        <div className="relative flex flex-col">
          <div className="sticky top-0 left-0 flex items-center justify-between w-full px-4 py-3 border-b bg-page border-border-color">
            <div className="flex items-center space-x-4 text-xs font-semibold tracking-wide 2xl:text-sm text-primary-text">
              <span
                className="flex items-center justify-center"
                onClick={() => {
                  setShow(false);
                }}
              >
                <svg
                  viewBox="0 0 12 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.00104 6.91474L9.53637 10.4501C9.72397 10.6377 9.9784 10.7431 10.2437 10.7431C10.509 10.7431 10.7634 10.6377 10.951 10.4501C11.1386 10.2625 11.244 10.008 11.244 9.74274C11.244 9.47744 11.1386 9.223 10.951 9.03541L7.41437 5.50007L10.9504 1.96474C11.0432 1.87185 11.1169 1.76159 11.1671 1.64024C11.2173 1.51889 11.2432 1.38884 11.2431 1.2575C11.2431 1.12617 11.2172 0.99613 11.1669 0.874806C11.1166 0.753482 11.0429 0.643251 10.95 0.550407C10.8571 0.457562 10.7469 0.383923 10.6255 0.333692C10.5042 0.283462 10.3741 0.257624 10.2428 0.257655C10.1115 0.257686 9.98143 0.283585 9.8601 0.333872C9.73878 0.38416 9.62855 0.457852 9.5357 0.55074L6.00104 4.08607L2.4657 0.55074C2.3735 0.455188 2.26319 0.378954 2.14121 0.326488C2.01924 0.274023 1.88803 0.246375 1.75525 0.245159C1.62247 0.243943 1.49078 0.269183 1.36786 0.319406C1.24494 0.369629 1.13326 0.443829 1.03932 0.537677C0.945384 0.631525 0.871078 0.743142 0.820739 0.866014C0.770401 0.988886 0.745037 1.12055 0.746127 1.25333C0.747218 1.38611 0.774742 1.51734 0.827093 1.63937C0.879443 1.7614 0.955572 1.87178 1.05104 1.96407L4.5877 5.50007L1.05171 9.03607C0.956239 9.12837 0.88011 9.23875 0.827759 9.36077C0.775409 9.4828 0.747885 9.61403 0.746794 9.74681C0.745703 9.87959 0.771067 10.0113 0.821406 10.1341C0.871745 10.257 0.94605 10.3686 1.03999 10.4625C1.13392 10.5563 1.24561 10.6305 1.36853 10.6807C1.49145 10.731 1.62314 10.7562 1.75592 10.755C1.8887 10.7538 2.0199 10.7261 2.14188 10.6737C2.26386 10.6212 2.37417 10.545 2.46637 10.4494L6.00104 6.91541V6.91474Z"
                  />
                </svg>
              </span>

              <span className="text-primary-text">Thoughts</span>
            </div>
          </div>

          <div className="flex flex-col px-4 py-4 space-y-2 overflow-y-auto recent__bar">
            <div className="flex items-center space-x-3">
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 16 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 fill-icon-color-hover"
                >
                  <path d="M5.49609 12.8301V11.1634H15.4961V12.8301H5.49609ZM5.49609 7.83008V6.16341H15.4961V7.83008H5.49609ZM5.49609 2.83008V1.16341H15.4961V2.83008H5.49609ZM2.16276 13.6634C1.70443 13.6634 1.31207 13.5002 0.985677 13.1738C0.659288 12.8474 0.496094 12.4551 0.496094 11.9967C0.496094 11.5384 0.659288 11.1461 0.985677 10.8197C1.31207 10.4933 1.70443 10.3301 2.16276 10.3301C2.62109 10.3301 3.01346 10.4933 3.33984 10.8197C3.66623 11.1461 3.82943 11.5384 3.82943 11.9967C3.82943 12.4551 3.66623 12.8474 3.33984 13.1738C3.01346 13.5002 2.62109 13.6634 2.16276 13.6634ZM2.16276 8.66341C1.70443 8.66341 1.31207 8.50022 0.985677 8.17383C0.659288 7.84744 0.496094 7.45508 0.496094 6.99675C0.496094 6.53841 0.659288 6.14605 0.985677 5.81966C1.31207 5.49327 1.70443 5.33008 2.16276 5.33008C2.62109 5.33008 3.01346 5.49327 3.33984 5.81966C3.66623 6.14605 3.82943 6.53841 3.82943 6.99675C3.82943 7.45508 3.66623 7.84744 3.33984 8.17383C3.01346 8.50022 2.62109 8.66341 2.16276 8.66341ZM2.16276 3.66341C1.70443 3.66341 1.31207 3.50022 0.985677 3.17383C0.659288 2.84744 0.496094 2.45508 0.496094 1.99675C0.496094 1.53841 0.659288 1.14605 0.985677 0.819662C1.31207 0.493273 1.70443 0.330078 2.16276 0.330078C2.62109 0.330078 3.01346 0.493273 3.33984 0.819662C3.66623 1.14605 3.82943 1.53841 3.82943 1.99675C3.82943 2.45508 3.66623 2.84744 3.33984 3.17383C3.01346 3.50022 2.62109 3.66341 2.16276 3.66341Z" />
                </svg>
              </span>

              <p className="text-xs font-semibold 2xl:text-sm text-primary-text">
                Steps Followed to generate SQL
              </p>
            </div>

            <div className="w-full py-3 pl-6 border-l border-border-color">
              <textarea
                className="w-full p-4 text-xs font-medium border rounded-md outline-none h-28 bg-page border-border-color min-h-28 text-secondary-text"
                value={
                  eventStats?.generation?.steps_to_follow ||
                  eventStats?.regenerate?.steps_to_follow ||
                  ""
                }
                readOnly={true}
              ></textarea>
            </div>

            <div className="flex items-center space-x-3">
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 14 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 fill-icon-color-hover"
                >
                  <path d="M5.79036 14.1665L10.1029 8.99984H6.76953L7.3737 4.27067L3.51953 9.83317H6.41536L5.79036 14.1665ZM3.66536 17.3332L4.4987 11.4998H0.332031L7.83203 0.666504H9.4987L8.66536 7.33317H13.6654L5.33203 17.3332H3.66536Z" />
                </svg>
              </span>

              <p className="text-xs font-semibold 2xl:text-sm text-primary-text">
                Examples Powering
              </p>
            </div>

            <div className="flex flex-col w-full py-3 pl-6 space-y-2">
              {usedExamples?.length > 0 &&
                usedExamples?.map((Example, index) => {
                  return <Examples data={Example} key={index} />;
                })}

              {usedExamples?.length === 0 && (
                <div className="flex flex-col items-center justify-center space-y-4 border rounded-md min-h-64 border-border-color">
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 fill-icon-color"
                    >
                      <path d="M11 17.5H13V11.5H11V17.5ZM12 9.5C12.2833 9.5 12.5208 9.40417 12.7125 9.2125C12.9042 9.02083 13 8.78333 13 8.5C13 8.21667 12.9042 7.97917 12.7125 7.7875C12.5208 7.59583 12.2833 7.5 12 7.5C11.7167 7.5 11.4792 7.59583 11.2875 7.7875C11.0958 7.97917 11 8.21667 11 8.5C11 8.78333 11.0958 9.02083 11.2875 9.2125C11.4792 9.40417 11.7167 9.5 12 9.5ZM12 22.5C10.6167 22.5 9.31667 22.2375 8.1 21.7125C6.88333 21.1875 5.825 20.475 4.925 19.575C4.025 18.675 3.3125 17.6167 2.7875 16.4C2.2625 15.1833 2 13.8833 2 12.5C2 11.1167 2.2625 9.81667 2.7875 8.6C3.3125 7.38333 4.025 6.325 4.925 5.425C5.825 4.525 6.88333 3.8125 8.1 3.2875C9.31667 2.7625 10.6167 2.5 12 2.5C13.3833 2.5 14.6833 2.7625 15.9 3.2875C17.1167 3.8125 18.175 4.525 19.075 5.425C19.975 6.325 20.6875 7.38333 21.2125 8.6C21.7375 9.81667 22 11.1167 22 12.5C22 13.8833 21.7375 15.1833 21.2125 16.4C20.6875 17.6167 19.975 18.675 19.075 19.575C18.175 20.475 17.1167 21.1875 15.9 21.7125C14.6833 22.2375 13.3833 22.5 12 22.5ZM12 20.5C14.2333 20.5 16.125 19.725 17.675 18.175C19.225 16.625 20 14.7333 20 12.5C20 10.2667 19.225 8.375 17.675 6.825C16.125 5.275 14.2333 4.5 12 4.5C9.76667 4.5 7.875 5.275 6.325 6.825C4.775 8.375 4 10.2667 4 12.5C4 14.7333 4.775 16.625 6.325 18.175C7.875 19.725 9.76667 20.5 12 20.5Z" />
                    </svg>
                  </span>

                  <p className="text-xs font-medium tracking-wider 2xl:text-sm text-secondary-text">
                    No examples available to display here currently
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasourceThoughts;

const Examples = ({ data }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col space-y-3">
      <div
        className="flex items-center justify-between h-10 px-4 py-3 border rounded-md cursor-pointer border-border-color"
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <p className="text-xs font-medium 2xl:text-sm text-primary-text line-clamp-1">
          {data?.user_query || ""}
        </p>

        {isCollapsed ? (
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 8 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 fill-icon-color-hover"
            >
              <path d="M4 0.733415L0 4.73341L0.933333 5.66675L4 2.60008L7.06667 5.66675L8 4.73341L4 0.733415Z" />
            </svg>
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 fill-icon-color"
            >
              <path d="M0 12V6.66667H1.33333V9.73333L9.73333 1.33333H6.66667V0H12V5.33333H10.6667V2.26667L2.26667 10.6667H5.33333V12H0Z" />
            </svg>
          </span>
        )}
      </div>

      {isCollapsed && (
        <div className="pl-3">
          <div className="flex flex-col py-3 pl-3 space-y-3 border-l border-border-color">
            <p className="text-xs font-semibold 2xl:text-sm text-primary-text">
              SQL
            </p>

            <div className="relative flex-1 w-full h-full overflow-hidden border rounded-md border-border-color">
              <Editor
                key={customTheme}
                height="250px"
                width="100%"
                theme={customTheme === 'dark' ? "vs-dark" : 'vs'}
                language="sql"
                value={data?.sql_cmd || ""}
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
      )}
    </div>
  );
};
