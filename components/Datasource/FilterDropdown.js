import React, { useRef, useEffect } from "react";
import { Range } from "react-range";
import SelectOption from "../common/SelectOption";

const FilterDropdown = ({
  isOpen,
  onClose,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  runStatus,
  setRunStatus,
  verificationStatus,
  setVerificationStatus,
  highestConfidenceScore,
  setHighestConfidenceScore,
  onApply,
}) => {
  const sectionRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (sectionRef.current && !sectionRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const RunStatusOptions = [
    { value: "", label: "All" },
    { value: "SUCCESS", label: "Success" },
    { value: "FAILED", label: "Failed" },
  ];

  const verificationOptions = [
    { value: "", label: "All" },
    { value: "VERIFIED", label: "Verified" },
    { value: "UNVERIFIED", label: "Unverified" },
  ];
  return (
    <div
      ref={sectionRef}
      className="absolute right-0 z-50 flex flex-col p-4 space-y-3 border rounded-lg shadow-lg border-dropdown-border text-primary-text top-2 w-96 bg-dropdown-bg"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold 2xl:text-base">Filter</h2>

        <span className="flex items-center justify-center" onClick={onClose}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
          >
            <path
              fill-rule="evenodd"
              clipRule="evenodd"
              d="M8.00006 9.41376L11.5354 12.9491C11.723 13.1367 11.9774 13.2421 12.2427 13.2421C12.508 13.2421 12.7625 13.1367 12.9501 12.9491C13.1377 12.7615 13.243 12.5071 13.243 12.2418C13.243 11.9765 13.1377 11.722 12.9501 11.5344L9.41339 7.9991L12.9494 4.46376C13.0422 4.37088 13.1159 4.26061 13.1661 4.13926C13.2163 4.01791 13.2422 3.88786 13.2421 3.75653C13.2421 3.62519 13.2162 3.49515 13.1659 3.37383C13.1156 3.25251 13.0419 3.14227 12.9491 3.04943C12.8562 2.95659 12.7459 2.88295 12.6246 2.83272C12.5032 2.78249 12.3732 2.75665 12.2418 2.75668C12.1105 2.75671 11.9805 2.78261 11.8591 2.8329C11.7378 2.88318 11.6276 2.95688 11.5347 3.04976L8.00006 6.5851L4.46473 3.04976C4.37253 2.95421 4.26222 2.87798 4.14024 2.82551C4.01826 2.77305 3.88705 2.7454 3.75427 2.74418C3.6215 2.74297 3.48981 2.76821 3.36689 2.81843C3.24397 2.86865 3.13228 2.94285 3.03834 3.0367C2.94441 3.13055 2.8701 3.24217 2.81976 3.36504C2.76942 3.48791 2.74406 3.61958 2.74515 3.75236C2.74624 3.88513 2.77377 4.01637 2.82612 4.1384C2.87847 4.26042 2.9546 4.3708 3.05006 4.4631L6.58673 7.9991L3.05073 11.5351C2.95526 11.6274 2.87913 11.7378 2.82678 11.8598C2.77443 11.9818 2.74691 12.1131 2.74582 12.2458C2.74473 12.3786 2.77009 12.5103 2.82043 12.6332C2.87077 12.756 2.94507 12.8676 3.03901 12.9615C3.13295 13.0553 3.24463 13.1295 3.36755 13.1798C3.49047 13.23 3.62216 13.2552 3.75494 13.254C3.88772 13.2528 4.01893 13.2251 4.14091 13.1727C4.26288 13.1202 4.37319 13.044 4.46539 12.9484L8.00006 9.41443V9.41376Z"
            />
          </svg>
        </span>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex justify-between">
          <label className="block text-xs font-medium 2xl:text-sm">
            Date Range
          </label>
          <button
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
            className="text-xs font-medium text-blue-500"
          >
            Reset
          </button>
        </div>

        <div className="flex space-x-4">
          <input
            type="date"
            value={startDate || ""}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md border-input-border bg-page text-primary-text focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            style={{ height: "40px" }}
          />
          <input
            type="date"
            value={endDate || ""}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md border-input-border bg-page text-primary-text focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            style={{ height: "40px" }}
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex justify-between mb-2">
          <label className="block text-xs font-medium 2xl:text-sm">
            Run Status
          </label>
          <button
            onClick={() => setRunStatus(null)}
            className="text-xs font-medium text-blue-500"
          >
            Reset
          </button>
        </div>

        {/* <select
          value={runStatus || ""}
          onChange={(e) => setRunStatus(e.target.value)}
          className="block w-full px-3 py-2 border rounded-md border-input-border bg-page text-primary-text focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          style={{ height: "40px" }}
        >
          <option value="">All</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select> */}
        <SelectOption
          options={RunStatusOptions}
          value={RunStatusOptions.find((option) => option.value === runStatus)}
          onSelect={(selectedOption) => setRunStatus(selectedOption?.value || "")}
          placeholder="Select Status"
          bgColor="var(--bg-secondary)"
          borderColor="var(--input-border)"
          customStyles={{
            container: (baseStyle) => ({
              ...baseStyle,
              marginBottom: "10px", // Example custom styling
            }),
          }}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex justify-between mb-2">
          <label className="block text-xs font-medium 2xl:text-sm">
            Verification Status
          </label>
          <button
            onClick={() => setVerificationStatus(null)}
            className="text-xs font-medium text-blue-500"
          >
            Reset
          </button>
        </div>

        {/* <select
          value={verificationStatus || ""}
          onChange={(e) => setVerificationStatus(e.target.value)}
          className="block w-full px-3 py-2 border rounded-md border-input-border bg-page text-primary-text focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          style={{ height: "40px" }}
        >
          <option value="">All</option>
          <option value="VERIFIED">Verified</option>
          <option value="UNVERIFIED">Unverified</option>
        </select> */}
        <SelectOption
          options={verificationOptions}
          value={verificationOptions.find(
            (option) => option.value === verificationStatus
          )}
          onSelect={(selectedOption) =>
            setVerificationStatus(selectedOption?.value || "")
          }
          placeholder="Select Verification Status"
          bgColor="var(--bg-secondary)"
          borderColor="var(--input-border)"
          customStyles={{
            container: (baseStyle) => ({
              ...baseStyle,
              marginBottom: "10px", // Example custom styling
            }),
          }}
        />
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between">
          <label className="block text-xs font-medium 2xl:text-sm">
            Confidence Score Range
          </label>

          <button
            onClick={() => setHighestConfidenceScore([0, 100])}
            className="text-xs font-medium text-blue-500"
          >
            Reset
          </button>
        </div>

        <div className="px-2 mt-4">
          <Range
            step={1}
            min={0}
            max={100}
            values={highestConfidenceScore}
            onChange={(values) => setHighestConfidenceScore(values)}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "6px",
                  width: "100%",
                  background: "var(--range-slider)",
                  borderRadius: "3px",
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "16px",
                  width: "16px",
                  backgroundColor: "var(--link-secondary-color)",
                  borderRadius: "50%",
                }}
              />
            )}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs">
          <span>{highestConfidenceScore[0]}</span>
          <span>{highestConfidenceScore[1]}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide border rounded-md w-fit text-btn-primary-outline-text hover:text-btn-primary-text group border-btn-primary-outline hover:bg-btn-primary-outline-bg"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterDropdown;
