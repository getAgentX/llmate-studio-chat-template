// import React, { useEffect, useRef, useState } from "react";

// const ConceptForSpecificDataResponse = ({ name, setValue }) => {
//   const [concepts, setConcepts] = useState([
//     {
//       name: "",
//       keywords: [],
//       context: "",
//     },
//   ]);

//   const isFirstRender = useRef(true);

//   const handleAddConcept = () => {
//     setConcepts([...concepts, { name: "", keywords: [], context: "" }]);
//   };

//   const handleRemoveConcept = (conceptIndex) => {
//     setConcepts(concepts.filter((_, i) => i !== conceptIndex));
//   };

//   const handleInputChange = (conceptIndex, field, value) => {
//     const updatedConcepts = concepts.map((concept, i) =>
//       i === conceptIndex ? { ...concept, [field]: value } : concept
//     );
//     setConcepts(updatedConcepts);
//   };

//   const handleAddKeyword = (conceptIndex, keyword) => {
//     const updatedConcepts = concepts.map((concept, i) =>
//       i === conceptIndex
//         ? { ...concept, keywords: [...concept.keywords, keyword] }
//         : concept
//     );
//     setConcepts(updatedConcepts);
//   };

//   const handleRemoveKeyword = (conceptIndex, keywordToRemove) => {
//     const updatedConcepts = concepts.map((concept, i) =>
//       i === conceptIndex
//         ? {
//             ...concept,
//             keywords: concept.keywords.filter(
//               (keyword) => keyword !== keywordToRemove
//             ),
//           }
//         : concept
//     );
//     setConcepts(updatedConcepts);
//   };

//   useEffect(() => {
//     function convertData(data) {
//       const result = {};

//       data.forEach((item) => {
//         result[item.name] = {
//           keywords: item.keywords,
//           context: item.context,
//         };
//       });

//       return result;
//     }

//     if (isFirstRender.current) {
//       isFirstRender.current = false;
//       return;
//     }

//     const outputData = convertData(concepts);

//     setValue(name, outputData, { shouldValidate: true });
//   }, [concepts]);

//   return (
//     <div className="flex flex-col w-full p-2">
//       <div className="flex flex-col space-y-6">
//         <div className="grid w-full grid-cols-12 gap-4">
//           <div className="col-span-4">
//             <div className="flex flex-col space-y-1">
//               <p className="text-sm font-medium tracking-wider text-white">
//                 Concept Name
//               </p>
//               <p className="text-xs font-normal tracking-wider text-white/50">
//                 Enter a unique name for your concept
//               </p>
//             </div>
//           </div>

//           <div className="col-span-4">
//             <div className="flex flex-col space-y-1">
//               <p className="text-sm font-medium tracking-wider text-white">
//                 Add keywords
//               </p>
//               <p className="text-xs font-normal tracking-wider text-white/50">
//                 Enter the specific keywords that trigger the Concept recognition
//                 by the datasource
//               </p>
//             </div>
//           </div>

//           <div className="col-span-4">
//             <div className="flex flex-col space-y-1">
//               <p className="text-sm font-medium tracking-wider text-white">
//                 Context
//               </p>
//               <p className="text-xs font-normal tracking-wider text-white/50">
//                 Provide context for your concept, including usage, purpose, and
//                 details.
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="w-full">
//           {concepts.map((concept, conceptIndex) => {
//             return (
//               <div
//                 key={conceptIndex}
//                 className="grid w-full grid-cols-12 gap-4"
//               >
//                 <div className="col-span-4">
//                   <textarea
//                     placeholder="Enter your concept name here"
//                     value={concept.name}
//                     onChange={(e) =>
//                       handleInputChange(conceptIndex, "name", e.target.value)
//                     }
//                     className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none min-h-36 border-border bg-[#181A1C] placeholder:text-white/40 resize-none recent__bar"
//                   />
//                 </div>

//                 <div className="col-span-4">
//                   <div className="flex flex-col px-2 py-1 space-y-1 overflow-y-auto border rounded-md h-[142px] border-border bg-[#181A1C] recent__bar">
//                     {concept.keywords.map((keyword, i) => (
//                       <button
//                         key={i}
//                         type="button"
//                         className="flex items-center justify-between px-2 py-2 text-xs font-normal text-white rounded-md cursor-auto bg-foreground"
//                       >
//                         <span>{keyword}</span>

//                         <span
//                           className="flex items-center justify-center cursor-pointer"
//                           onClick={() =>
//                             handleRemoveKeyword(conceptIndex, keyword)
//                           }
//                         >
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             strokeWidth={1.5}
//                             stroke="currentColor"
//                             className="w-4 h-4"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
//                             />
//                           </svg>
//                         </span>
//                       </button>
//                     ))}

//                     <textarea
//                       type="text"
//                       placeholder="Type keyword and Press “Enter” to add as a tag"
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter" && e.target.value.trim() !== "") {
//                           e.preventDefault();
//                           handleAddKeyword(conceptIndex, e.target.value.trim());
//                           e.target.value = "";
//                         }
//                       }}
//                       className="w-full px-1 py-2 text-sm text-white bg-transparent outline-none resize-none text-start min-h-20 placeholder:text-white/40"
//                     />
//                   </div>
//                 </div>

//                 <div className="col-span-4">
//                   <div className="flex items-start space-x-4">
//                     <textarea
//                       placeholder="Brief your concept like how and when it should be used by the datasource..."
//                       value={concept.context}
//                       onChange={(e) =>
//                         handleInputChange(
//                           conceptIndex,
//                           "context",
//                           e.target.value
//                         )
//                       }
//                       className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none min-h-36 border-border bg-[#181A1C] placeholder:text-white/40 resize-none recent__bar"
//                     />

//                     <span className="flex items-center justify-center">
//                       <svg
//                         viewBox="0 0 12 12"
//                         fill="none"
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="w-4 h-4 stroke-[#5F6368] hover:stroke-white cursor-pointer"
//                         onClick={() => handleRemoveConcept(conceptIndex)}
//                       >
//                         <g clipPath="url(#clip0_2110_18889)">
//                           <path
//                             d="M2.25 2.5V11H9.75V2.5H2.25Z"
//                             stroke-linejoin="round"
//                           />
//                           <path
//                             d="M5 5V8.25"
//                             stroke-linecap="round"
//                             stroke-linejoin="round"
//                           />
//                           <path
//                             d="M7 5V8.25"
//                             stroke-linecap="round"
//                             stroke-linejoin="round"
//                           />
//                           <path
//                             d="M1 2.5H11"
//                             stroke-linecap="round"
//                             stroke-linejoin="round"
//                           />
//                           <path
//                             d="M4 2.5L4.82225 1H7.19427L8 2.5H4Z"
//                             stroke-linejoin="round"
//                           />
//                         </g>
//                         <defs>
//                           <clipPath id="clip0_2110_18889">
//                             <rect width="12" height="12" fill="white" />
//                           </clipPath>
//                         </defs>
//                       </svg>
//                     </span>
//                   </div>
//                 </div>

//                 {/* <div>
//               <button
//                 onClick={() => handleRemoveConcept(conceptIndex)}
//                 type="button"
//               >
//                 Remove
//               </button>
//             </div> */}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div
//         className="flex items-center w-full py-2 space-x-1 text-sm font-medium tracking-wide cursor-pointer group text-secondary hover:text-secondary-foreground"
//         onClick={handleAddConcept}
//       >
//         <span className="flex items-center justify-center">
//           <svg
//             viewBox="0 0 16 16"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//             className="w-5 h-5 fill-secondary group-hover:fill-secondary-foreground"
//           >
//             <path d="M7.33337 8.66536H3.33337V7.33203H7.33337V3.33203H8.66671V7.33203H12.6667V8.66536H8.66671V12.6654H7.33337V8.66536Z" />
//           </svg>
//         </span>

//         <span>Add Concept</span>
//       </div>
//     </div>
//   );
// };

// export default ConceptForSpecificDataResponse;

import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

const theme = {
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
    "editor.background": "#181A1C",
    "editor.selectionBackground": "#181A1C",
    "editor.lineHighlightBackground": "#181A1C",
    "editorCursor.foreground": "#A7A7A7",
    "editorWhitespace.foreground": "#CAE2FB3D",
    "minimap.background": "#202020",
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
};

const ConceptForSpecificDataResponse = ({ name, setValue }) => {
  const [concepts, setConcepts] = useState([
    {
      name: "",
      context: "",
      sql_formula: "",
    },
  ]);

  const isFirstRender = useRef(true);

  const handleAddConcept = () => {
    setConcepts([...concepts, { name: "", context: "", sql_formula: "" }]);
  };

  const handleRemoveConcept = (conceptIndex) => {
    setConcepts(concepts.filter((_, i) => i !== conceptIndex));
  };

  const handleInputChange = (conceptIndex, field, value) => {
    const updatedConcepts = concepts?.map((concept, i) =>
      i === conceptIndex ? { ...concept, [field]: value } : concept
    );
    setConcepts(updatedConcepts);
  };

  useEffect(() => {
    function convertData(data) {
      const result = {};

      data.forEach((item) => {
        result[item.name] = {
          context: item.context,
          sql_formula: item.sql_formula,
        };
      });

      return result;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const outputData = convertData(concepts);
    setValue(name, outputData, { shouldValidate: true });
  }, [concepts]);

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
          {concepts?.map((concept, conceptIndex) => (
            <div key={conceptIndex} className="grid w-full grid-cols-12 gap-4">
              <div className="col-span-4">
                <textarea
                  placeholder="Enter your concept name here"
                  value={concept.name}
                  onChange={(e) =>
                    handleInputChange(conceptIndex, "name", e.target.value)
                  }
                  className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none min-h-36 border-border bg-[#181A1C] placeholder:text-white/40 resize-none recent__bar"
                />
              </div>

              <div className="col-span-4">
                <textarea
                  placeholder="Brief your concept like how and when it should be used by the datasource..."
                  value={concept.context}
                  onChange={(e) =>
                    handleInputChange(conceptIndex, "context", e.target.value)
                  }
                  className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none min-h-36 border-border bg-[#181A1C] placeholder:text-white/40 resize-none recent__bar"
                />
              </div>

              <div className="col-span-4">
                <div className="flex items-start w-full space-x-2">
                  <Editor
                    height="150px"
                    theme="vs-dark"
                    className="overflow-hidden border rounded-md border-border placeholder:text-white/40"
                    language="sql"
                    value={concept.sql_formula}
                    options={Options}
                    onChange={(value) =>
                      handleInputChange(conceptIndex, "sql_formula", value)
                    }
                    onMount={(editor) => {
                      monaco.editor.defineTheme("myTheme", theme);
                      monaco.editor.setTheme("myTheme");
                    }}
                    placeholder="Enter your SQL formula."
                  />

                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 stroke-[#5F6368] hover:stroke-white cursor-pointer"
                      onClick={() => handleRemoveConcept(conceptIndex)}
                    >
                      <g clipPath="url(#clip0_2110_18889)">
                        <path
                          d="M2.25 2.5V11H9.75V2.5H2.25Z"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5 5V8.25"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M7 5V8.25"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M1 2.5H11"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M4 2.5L4.82225 1H7.19427L8 2.5H4Z"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2110_18889">
                          <rect width="12" height="12" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="flex items-center w-full py-2 space-x-1 text-sm font-medium tracking-wide cursor-pointer group text-secondary hover:text-secondary-foreground"
        onClick={handleAddConcept}
      >
        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 fill-secondary group-hover:fill-secondary-foreground"
          >
            <path d="M7.33337 8.66536H3.33337V7.33203H7.33337V3.33203H8.66671V7.33203H12.6667V8.66536H8.66671V12.6654H7.33337V8.66536Z" />
          </svg>
        </span>

        <span>Add Concept</span>
      </div>
    </div>
  );
};

export default ConceptForSpecificDataResponse;
