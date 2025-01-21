import React, { useState, useEffect, useRef } from "react";

const ArrayItemsDropdown = ({ visible, data, toggleDropdown}) => {
  const [tags, setTags] = useState([]);
  // const [tagInput, setTagInput] = useState("");
  // const [inputError, setInputError] = useState("");
  const modalRef = useRef(null);

  if (!visible) {
    return null;
  }

  // const handleTagInputChange = (e) => {
  //   const input = e.target.value;
  //   if (field_type === "number" && input !== "" && isNaN(input)) {
  //     setInputError("Please enter a number."); 
  //     return; // Prevent non-numeric input for 'number' field type
  //   } else {
  //     setInputError("");
  //   }
  //   setTagInput(input);
  // };

  // const handleTagInputKeyDown = (e) => {
  //   if (e.key === "Enter" && tagInput.trim()) {
  //     e.preventDefault();
  //     if (field_type === "number" && isNaN(tagInput.trim())) {
  //       setInputError("Please enter a number.");
  //       return;
  //     }
  //     setTags([...tags, field_type === "number" ? Number(tagInput.trim()) : tagInput.trim()]);
  //     setTagInput("");
  //     setInputError("");
  //   }
  // };

  // const removeTag = (index) => {
  //   setTags(tags.filter((_, i) => i !== index));
  // };

  // const handleSubmit = () => {
  //   if (field_type === "number" && tags.some(tag => isNaN(tag))) {
  //     setInputError("Please ensure all entries are numbers.");
  //     return;
  //   }
  //   onSubmit(tags);
  //   toggleDropdown();
  // };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      toggleDropdown();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (data) {
      setTags(data.filter(single => single != ""));
    }
  }, [data]);

  if(tags.length ==0) return null

  return (
    <div className="absolute top-[0%] left-0 min-w-72 max-w-72 w-full p-2 bg-[#26282D] rounded-lg bg-foreground border border-border z-20" ref={modalRef}>
      <div className="flex flex-col h-full">
        <div className="flex flex-col px-2 space-y-4">
          {/* <input
            type="text"
            className="w-full px-4 py-3 mt-2 text-sm font-normal bg-[#2A2C32] text-white border-none rounded-md outline-none placeholder:text-white/40"
            placeholder="Add values and press Enter to add"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
          /> */}
          {/* {inputError && <div className="text-red-500 text-xs italic">{inputError}</div>} */}
            <div className="space-y-4">
              <div className="space-x-2">
                <span>ADDED ENTRIES</span>
                <span className="bg-white text-black  py-0.5 px-2 rounded-full">{tags.filter(tag => tag !== "").length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.filter(tag => tag !== "").map((tag, index) => (
                  <div key={index} className="flex items-center px-2 py-1 text-xs font-normal text-white bg-gray-600 rounded">
                    <span className="flex-1 min-w-0">{tag}</span>
                    {/* <button onClick={() => removeTag(index)} className="ml-2 text-gray-200 hover:text-white">&times;</button> */}
                  </div>
                ))}
              </div>
            </div>
          {/* {tags.length === 0 && <div className="flex flex-col items-center w-full mx-auto space-y-1 max-w-7xl">
            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.33398 11.832H8.66732V7.83203H7.33398V11.832ZM8.00065 6.4987C8.18954 6.4987 8.34787 6.43481 8.47565 6.30703C8.60343 6.17925 8.66732 6.02092 8.66732 5.83203C8.66732 5.64314 8.60343 5.48481 8.47565 5.35703C8.34787 5.22925 8.18954 5.16536 8.00065 5.16536C7.81176 5.16536 7.65343 5.22925 7.52565 5.35703C7.39787 5.48481 7.33398 5.64314 7.33398 5.83203C7.33398 6.02092 7.39787 6.17925 7.52565 6.30703C7.65343 6.43481 7.81176 6.4987 8.00065 6.4987ZM8.00065 15.1654C7.07843 15.1654 6.21176 14.9904 5.40065 14.6404C4.58954 14.2904 3.88398 13.8154 3.28398 13.2154C2.68398 12.6154 2.20898 11.9098 1.85898 11.0987C1.50898 10.2876 1.33398 9.42092 1.33398 8.4987C1.33398 7.57648 1.50898 6.70981 1.85898 5.8987C2.20898 5.08759 2.68398 4.38203 3.28398 3.78203C3.88398 3.18203 4.58954 2.70703 5.40065 2.35703C6.21176 2.00703 7.07843 1.83203 8.00065 1.83203C8.92287 1.83203 9.78954 2.00703 10.6007 2.35703C11.4118 2.70703 12.1173 3.18203 12.7173 3.78203C13.3173 4.38203 13.7923 5.08759 14.1423 5.8987C14.4923 6.70981 14.6673 7.57648 14.6673 8.4987C14.6673 9.42092 14.4923 10.2876 14.1423 11.0987C13.7923 11.9098 13.3173 12.6154 12.7173 13.2154C12.1173 13.8154 11.4118 14.2904 10.6007 14.6404C9.78954 14.9904 8.92287 15.1654 8.00065 15.1654ZM8.00065 13.832C9.48954 13.832 10.7507 13.3154 11.784 12.282C12.8173 11.2487 13.334 9.98759 13.334 8.4987C13.334 7.00981 12.8173 5.7487 11.784 4.71536C10.7507 3.68203 9.48954 3.16536 8.00065 3.16536C6.51176 3.16536 5.25065 3.68203 4.21732 4.71536C3.18398 5.7487 2.66732 7.00981 2.66732 8.4987C2.66732 9.98759 3.18398 11.2487 4.21732 12.282C5.25065 13.3154 6.51176 13.832 8.00065 13.832Z" fill="#5F6368" />
            </svg>
            <p className="text-sm font-normal text-white text-center">
              No Added values to show here
            </p>
            <p className="w-full max-w-2xl mx-auto text-xs font-normal leading-4 text-center text-white/40">
              Add the required values above and press "Enter" to add
              it here
            </p>
          </div>
          } */}
        </div>
        {/* <div className="flex items-center justify-end w-full px-2 py-2 pt-4 space-x-4 border-t border-border">
          <button className="px-4 py-2 text-sm font-medium text-secondary-foreground border border-secondary-foreground rounded-md min-w-28 bg-border" onClick={() => {
            setTags([]);
            toggleDropdown();
          }}>Reset All</button>
          <button className="px-4 py-2 text-sm font-medium rounded-md min-w-28 text-muted bg-secondary hover:bg-secondary-foreground" onClick={handleSubmit}>Save</button>
        </div> */}
      </div>
    </div>
  );
};

export default ArrayItemsDropdown;
