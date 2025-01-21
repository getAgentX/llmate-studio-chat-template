import { useTheme } from "@/hooks/useTheme";
import { useValidateFormulaMutation } from "@/store/datasource";
import { Editor } from "@monaco-editor/react";
import { useRouter } from "next/router";
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
  readOnly: false,
  selectOnLineNumbers: true,
  selectionClipboard: true,
  selectionHighlight: true,
  lineNumbers: "off",
};

const EditConceptModal = ({
  show,
  setShow,
  currentConcept = null,
  setCurrentConcept = null,
  currentTable,
  update = false,
  handleSaveChanges = () => {},
  handleAddConcept = () => {},
  setShowSuccessModal,
}) => {
  const [conceptName, setConceptName] = useState(
    currentConcept?.concept_name || ""
  );
  const [sqlRunQuery, setSqlRunQuery] = useState(
    currentConcept?.sql_code || ""
  );
  const [context, setContext] = useState(currentConcept?.context || "");
  const [initialQuery, setInitialQuery] = useState(
    currentConcept?.sql_code || ""
  );
  const [activeRun, setActiveRun] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toggleErrorMessage, setToggleErrorMessage] = useState(false);
  const [newSqlQuery, setNewSqlQuery] = useState(
    currentConcept?.sql_code || ""
  );

  const modalRef = useRef(null);
  const router = useRouter();
  const { theme: customTheme} = useTheme()
  const [validateFormula, { isLoading: sqlRunLoading }] =
    useValidateFormulaMutation();

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setCurrentConcept(null);
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
  }, [show]);

  useEffect(() => {
    if (newSqlQuery) {
      if (sqlRunQuery !== newSqlQuery) {
        setIsVerified(false);
      } else {
        setIsVerified(true);
      }
    }
  }, [sqlRunQuery]);

  const handleEditorChange = (newQuery) => {
    setSqlRunQuery(newQuery);

    if (newQuery !== initialQuery) {
      setActiveRun(true);
    } else {
      setActiveRun(false);
    }
  };

  const handleSqlRun = () => {
    setIsVerified(false);
    setErrorMessage("");
    setNewSqlQuery(sqlRunQuery);

    const payload = {
      formula: sqlRunQuery,
      table_name: currentTable.name,
    };

    validateFormula({
      datasource_id: router.query.slug,
      payload: payload,
    }).then((response) => {
      if (response.data) {
        setIsVerified(true);
        setActiveRun(false);
      }

      if (response.error) {
        setIsVerified(false);
        setErrorMessage(response.error.data.message);
      }
    });
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] max-h-full md:inset-0 bg_blur ${
        show ? "" : "hidden"
      }`}
    >
      <div
        className="fixed top-0 bottom-0 right-0 w-full max-w-2xl overflow-x-hidden overflow-y-auto border-l border-border-color bg-page recent__bar"
        ref={modalRef}
      >
        <div className="relative flex flex-col">
          <div className="sticky top-0 left-0 z-50 flex items-center justify-between w-full h-12 px-4 border-b bg-page border-border-color">
            <div className="flex items-center space-x-4 text-sm font-medium tracking-wide text-primary-text">
              <span
                className="flex items-center justify-center"
                onClick={() => {
                  setCurrentConcept(null);
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
                    fill-rule="evenodd"
                    clipRule="evenodd"
                    d="M6.00104 6.91474L9.53637 10.4501C9.72397 10.6377 9.9784 10.7431 10.2437 10.7431C10.509 10.7431 10.7634 10.6377 10.951 10.4501C11.1386 10.2625 11.244 10.008 11.244 9.74274C11.244 9.47744 11.1386 9.223 10.951 9.03541L7.41437 5.50007L10.9504 1.96474C11.0432 1.87185 11.1169 1.76159 11.1671 1.64024C11.2173 1.51889 11.2432 1.38884 11.2431 1.2575C11.2431 1.12617 11.2172 0.99613 11.1669 0.874806C11.1166 0.753482 11.0429 0.643251 10.95 0.550407C10.8571 0.457562 10.7469 0.383923 10.6255 0.333692C10.5042 0.283462 10.3741 0.257624 10.2428 0.257655C10.1115 0.257686 9.98143 0.283585 9.8601 0.333872C9.73878 0.38416 9.62855 0.457852 9.5357 0.55074L6.00104 4.08607L2.4657 0.55074C2.3735 0.455188 2.26319 0.378954 2.14121 0.326488C2.01924 0.274023 1.88803 0.246375 1.75525 0.245159C1.62247 0.243943 1.49078 0.269183 1.36786 0.319406C1.24494 0.369629 1.13326 0.443829 1.03932 0.537677C0.945384 0.631525 0.871078 0.743142 0.820739 0.866014C0.770401 0.988886 0.745037 1.12055 0.746127 1.25333C0.747218 1.38611 0.774742 1.51734 0.827093 1.63937C0.879443 1.7614 0.955572 1.87178 1.05104 1.96407L4.5877 5.50007L1.05171 9.03607C0.956239 9.12837 0.88011 9.23875 0.827759 9.36077C0.775409 9.4828 0.747885 9.61403 0.746794 9.74681C0.745703 9.87959 0.771067 10.0113 0.821406 10.1341C0.871745 10.257 0.94605 10.3686 1.03999 10.4625C1.13392 10.5563 1.24561 10.6305 1.36853 10.6807C1.49145 10.731 1.62314 10.7562 1.75592 10.755C1.8887 10.7538 2.0199 10.7261 2.14188 10.6737C2.26386 10.6212 2.37417 10.545 2.46637 10.4494L6.00104 6.91541V6.91474Z"
                  />
                </svg>
              </span>

              {update && <span>Edit Concept</span>}
              {update || <span>Add Concept</span>}
            </div>

            <div className="flex items-center space-x-2">
              {update && (
                <button
                  type="button"
                  className="flex items-center justify-center px-4 space-x-2 text-xs font-semibold tracking-wide rounded-md h-7 text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                  onClick={() =>
                  {
                    handleSaveChanges({
                      [conceptName]: {
                        keywords: [],
                        context: context,
                        sql_formula: sqlRunQuery,
                      },
                    })
                    setShowSuccessModal(true)
                  }}
                  disabled={!isVerified}
                >
                  <span className="text-nowrap">Save</span>
                </button>
              )}

              {update || (
                <button
                  type="button"
                  className="flex items-center justify-center px-4 space-x-2 text-xs font-semibold tracking-wide rounded-md h-7 text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                  onClick={() => 
                  {
                    handleAddConcept({
                      [conceptName]: {
                        keywords: [],
                        context: context,
                        sql_formula: sqlRunQuery,
                      },
                    })
                    setShowSuccessModal(true)
                  }
                  }
                  disabled={
                    !isVerified || !conceptName || !sqlRunQuery || !context
                  }
                >
                  <span className="text-nowrap">Add Concept</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full p-4 space-y-3">
            <div className="flex flex-col space-y-3">
              <p className="text-xs font-medium tracking-wide text-primary-text">
                Concept Name
              </p>

              <input
                type="text"
                className="w-full px-4 py-1 overflow-y-auto text-xs leading-6 bg-transparent border rounded-md outline-none 2xl:text-xs text-input-text border-input-border placeholder:text-input-placeholder recent__bar"
                placeholder="Enter column description here"
                value={conceptName}
                onChange={(e) => setConceptName(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-full space-y-3">
              <p className="text-xs font-medium tracking-wide text-primary-text">
                Context
              </p>

              <textarea
                type="text"
                className="w-full px-4 py-3 overflow-y-auto text-xs leading-6 bg-transparent border rounded-md outline-none resize-y text-input-text min-h-28 border-input-border placeholder:text-input-placeholder recent__bar"
                placeholder="Enter column description here"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between text-sm font-normal border-b border-border-color">
                <p className="flex items-center justify-center h-8 text-xs font-medium tracking-wide text-primary-text">
                  SQL Code
                </p>

                <button
                  type="button"
                  className="flex items-center justify-center h-6 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary group disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                  disabled={!activeRun}
                  onClick={handleSqlRun}
                >
                  {sqlRunLoading || (
                    <span className="flex items-center justify-center">
                      <svg
                        viewBox="0 0 8 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 fill-btn-primary-icon group-disabled:fill-btn-primary-disable-text"
                      >
                        <path d="M0.332031 10.1668V0.833496L7.66536 5.50016L0.332031 10.1668Z" />
                      </svg>
                    </span>
                  )}

                  {sqlRunLoading && (
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
                  <span className="text-nowrap">Run</span>
                </button>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="relative w-full overflow-hidden border rounded-md border-border-color">
                  <Editor
                    key={customTheme}
                    height="200px"
                    width="100%"
                    theme={customTheme === 'dark' ? "vs-dark" : 'vs'}
                    language="sql"
                    value={sqlRunQuery}
                    options={Options}
                    onChange={(value) => {
                      handleEditorChange(value);
                    }}
                    onMount={(editor, monaco) => {
                      monaco.editor.defineTheme("darkTheme", darkTheme);
                      monaco.editor.defineTheme("lightTheme", lightTheme);
                      monaco.editor.setTheme(customTheme === "dark" ? "darkTheme" : "lightTheme");
                    }}
                    placeholder="Enter your SQL formula."
                  />
                </div>

                {!isVerified && errorMessage && (
                  <div className="flex flex-col p-3 space-y-3 text-xs rounded-md bg-input-error-bg text-input-error-text">
                    <div
                      className="flex items-center justify-between w-full cursor-pointer"
                      onClick={() => setToggleErrorMessage(!toggleErrorMessage)}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center justify-center">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8 12C8.22667 12 8.41667 11.9233 8.57 11.77C8.72333 11.6167 8.8 11.4267 8.8 11.2C8.8 10.9733 8.72333 10.7833 8.57 10.63C8.41667 10.4767 8.22667 10.4 8 10.4C7.77333 10.4 7.58333 10.4767 7.43 10.63C7.27667 10.7833 7.2 10.9733 7.2 11.2C7.2 11.4267 7.27667 11.6167 7.43 11.77C7.58333 11.9233 7.77333 12 8 12ZM7.2 8.8H8.8V4H7.2V8.8ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                              fill="#C61B1B"
                            />
                          </svg>
                        </span>
                        <span>SQL run failed</span>
                      </div>

                      <span className="flex items-center justify-center">
                        <svg
                          viewBox="0 0 8 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`fill-icon-color-hover w-3 h-3 ${
                            toggleErrorMessage ? "rotate-180" : ""
                          }`}
                        >
                          <path d="M4 3.79984L0.933333 0.733171L0 1.6665L4 5.6665L8 1.6665L7.06667 0.733171L4 3.79984Z" />
                        </svg>
                      </span>
                    </div>

                    {toggleErrorMessage && (
                      <div className="text-primary-text">{errorMessage}</div>
                    )}
                  </div>
                )}

                {!errorMessage && isVerified && (
                  <div className="flex flex-col p-3 space-y-3 text-xs rounded-md bg-input-success-bg text-input-success-text">
                    <div className="flex items-center justify-between w-full cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center justify-center">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.06536 10.0666L10.7654 5.36658L9.83203 4.43325L6.06536 8.19992L4.16536 6.29992L3.23203 7.23325L6.06536 10.0666ZM6.9987 13.6666C6.07648 13.6666 5.20981 13.4916 4.3987 13.1416C3.58759 12.7916 2.88203 12.3166 2.28203 11.7166C1.68203 11.1166 1.20703 10.411 0.857031 9.59992C0.507031 8.78881 0.332031 7.92214 0.332031 6.99992C0.332031 6.0777 0.507031 5.21103 0.857031 4.39992C1.20703 3.58881 1.68203 2.88325 2.28203 2.28325C2.88203 1.68325 3.58759 1.20825 4.3987 0.858252C5.20981 0.508252 6.07648 0.333252 6.9987 0.333252C7.92092 0.333252 8.78759 0.508252 9.5987 0.858252C10.4098 1.20825 11.1154 1.68325 11.7154 2.28325C12.3154 2.88325 12.7904 3.58881 13.1404 4.39992C13.4904 5.21103 13.6654 6.0777 13.6654 6.99992C13.6654 7.92214 13.4904 8.78881 13.1404 9.59992C12.7904 10.411 12.3154 11.1166 11.7154 11.7166C11.1154 12.3166 10.4098 12.7916 9.5987 13.1416C8.78759 13.4916 7.92092 13.6666 6.9987 13.6666Z"
                              fill="#1BC655"
                            />
                          </svg>
                        </span>
                        <span>SQL run success</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditConceptModal;
