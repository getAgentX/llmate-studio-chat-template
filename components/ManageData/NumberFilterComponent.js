import React, { useState, useEffect, useRef } from "react";
import SelectOption from "../common/SelectOption";

const NumberFilterDropdown = ({ visible, initialFilter, toggleDropdown, onFilterSelect }) => {
  const [numberValue, setNumberValue] = useState("");
  const [operation, setOperation] = useState(initialFilter ? Object.keys(initialFilter).find(key => initialFilter[key] !== "") : "");
  const modalRef = useRef(null);

  const operations = [
    { value: "eq", label: "Equal to" },
    { value: "gt", label: "Greater Than" },
    { value: "lt", label: "Less Than" },
    { value: "gte", label: "Greater Than or Equal To" },
    { value: "lte", label: "Less Than or Equal To" },
  ];

  if (!visible) {
    return null;
  }

  const handleNumberChange = (e) => {
    setNumberValue(e.target.value);
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      toggleDropdown();
    }
  };

  useEffect(() => {
    if (initialFilter && visible) {
      // Extract the first key-value pair from the filter object where the value is not empty
      const operationKey = Object.keys(initialFilter).find(key => initialFilter[key] !== "");
  
      if (operationKey) {
        setOperation(operationKey); // Set the operation type
        setNumberValue(initialFilter[operationKey]); // Set the corresponding value
      }
    }
  }, [initialFilter, visible]);
  

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="absolute top-[120%] left-0 min-w-72 w-full p-2 rounded-lg bg-foreground border border-border z-[100]" ref={modalRef}>
      <div className="flex flex-col h-full space-y-2">
        <div className="relative flex items-center justify-between px-2 py-3 text-sm font-medium border-b text-muted border-border">
          <span>NUMBER FILTER</span>
          <span
            className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer bg-background"
            onClick={toggleDropdown}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-white/60 hover:text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </span>
        </div>

        <div className="px-2 text-xs capitalize font-normal">
          <SelectOption
            options={operations}
            placeholder="Select an Operation"
            onSelect={(option) => {
              setOperation(option.value); 
            }}
            value={operations.find((op) => op.value === operation)}
            defaultValue={operations.find((op) => op.value === initialFilter?.operation)}
          />
        </div>

        {operation && (
          <div className="px-2">
            <input
              type="number"
              className="w-full px-4 py-3 mt-2 text-sm font-normal text-white border-none rounded-md outline-none placeholder:text-white/40 bg-background"
              placeholder="Enter number"
              value={numberValue}
              onChange={handleNumberChange}
            />
          </div>
        )}

        <div className="flex items-center justify-end w-full px-2 pt-4 border-t border-border">
          <button
            className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md ${operation && numberValue
                ? "bg-secondary hover:bg-secondary-foreground"
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
            onClick={() => {
              const filterPayload = { [operation]: numberValue }; // Simplify payload construction
              onFilterSelect(filterPayload);
              toggleDropdown();
            }}
            disabled={!operation || !numberValue}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberFilterDropdown;
