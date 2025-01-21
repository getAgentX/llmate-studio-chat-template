import React, { useEffect, useRef, useState } from "react";

const FormulaeSets = ({
  setValue = () => {},
  name,
  initialData = {},
  update,
  showBtn,
}) => {
  const [formulaSets, setFormulaSets] = useState([]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    const convertToArray = (formattedObject) => {
      const dataArray = [];

      for (const [term, description] of Object.entries(formattedObject)) {
        dataArray.push({ term, description });
      }

      return dataArray;
    };

    const reversedArray = convertToArray(initialData);

    if (reversedArray?.length > 0) {
      setFormulaSets(reversedArray);
    } else {
      setFormulaSets([
        {
          term: "",
          description: "",
        },
      ]);
    }
  }, []);

  const handleJoinSets = () => {
    const data = {
      term: "",
      description: "",
    };

    setFormulaSets((prev) => [...prev, data]);
  };

  const handleRemoveJoin = (index) => {
    setFormulaSets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    setFormulaSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set))
    );
  };

  useEffect(() => {
    let formattedObject = {};

    formulaSets.forEach((item) => {
      if (item.term !== "" && item.description !== "") {
        formattedObject[item.term] = item.description;
      }
    });

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setValue(name, formattedObject, { shouldValidate: true });
  }, [formulaSets]);

  return (
    <div className="rounded-md bg-[#1B1D1F] p-2 flex flex-col space-y-4">
      <p className="text-sm font-normal text-white">Term & Description</p>

      <div className="flex flex-col border rounded-md border-border bg-[#181A1C] cursor-default">
        <div className="flex items-center justify-between w-full px-4 py-3 text-sm font-normal tracking-wide border-b text-white/50 border-border">
          <p>Term</p>
          <p>Description</p>
          <p>Actions</p>
        </div>

        <div className="flex flex-col space-y-2">
          {formulaSets?.map((item, index) => {
            const { term, description } = item;

            return (
              <div className="flex items-center justify-between p-2 space-x-2">
                <textarea
                  type="text"
                  className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none min-h-36 border-border bg-[#181A1C] placeholder:text-white/40 resize-none recent__bar"
                  placeholder="Enter term or abbreviation here"
                  value={term}
                  onChange={(e) =>
                    handleInputChange(index, "term", e.target.value)
                  }
                  disabled={update ? !showBtn : false}
                />

                <textarea
                  type="text"
                  className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none min-h-36 border-border bg-[#181A1C] placeholder:text-white/40 resize-none recent__bar"
                  placeholder="Enter description, explanation, calculation here"
                  value={description}
                  onChange={(e) =>
                    handleInputChange(index, "description", e.target.value)
                  }
                  disabled={update ? !showBtn : false}
                />

                {update || (
                  <span className="flex items-center justify-center w-24">
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 stroke-[#5F6368] hover:stroke-white cursor-pointer"
                      onClick={() => handleRemoveJoin(index)}
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
                )}

                {showBtn && update && (
                  <span className="flex items-center justify-center w-24">
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 stroke-[#5F6368] hover:stroke-white cursor-pointer"
                      onClick={() => handleRemoveJoin(index)}
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
                )}
              </div>
            );
          })}
        </div>

        {update || (
          <div
            className="flex items-center w-full px-4 py-3 space-x-1 text-sm font-medium tracking-wide border-t cursor-pointer group text-secondary hover:text-secondary-foreground border-border"
            onClick={() => handleJoinSets()}
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

            <span>Add Term</span>
          </div>
        )}

        {showBtn && update && (
          <div
            className="flex items-center w-full px-4 py-3 space-x-1 text-sm font-medium tracking-wide border-t cursor-pointer group text-secondary hover:text-secondary-foreground border-border"
            onClick={() => handleJoinSets()}
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

            <span>Add Term</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaeSets;
