import React, { useState, useEffect, useRef } from "react";

const TextFilterDropdown = ({
  visible,
  toggleDropdown,
  onFilterSelect,
  initialFilter,
}) => {
  const [likeTags, setLikeTags] = useState(initialFilter.contains_list || []);
  const [notLikeTags, setNotLikeTags] = useState(
    initialFilter.not_contains_list || []
  );
  const [likeInput, setLikeInput] = useState("");
  const [notLikeInput, setNotLikeInput] = useState("");

  const modalRef = useRef(null);

  if (!visible) {
    return null;
  }

  const handleLikeInputChange = (e) => {
    setLikeInput(e.target.value);
  };

  const handleNotLikeInputChange = (e) => {
    setNotLikeInput(e.target.value);
  };

  const handleLikeInputKeyDown = (e) => {
    if (e.key === "Enter" && likeInput.trim()) {
      e.preventDefault();
      setLikeTags([...likeTags, likeInput.trim()]);
      setLikeInput("");
    }
  };

  const handleNotLikeInputKeyDown = (e) => {
    if (e.key === "Enter" && notLikeInput.trim()) {
      e.preventDefault();
      setNotLikeTags([...notLikeTags, notLikeInput.trim()]);
      setNotLikeInput("");
    }
  };

  const removeLikeTag = (index) => {
    setLikeTags(likeTags.filter((_, i) => i !== index));
  };

  const removeNotLikeTag = (index) => {
    setNotLikeTags(notLikeTags.filter((_, i) => i !== index));
  };

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

  return (
    <div
      className="absolute top-[120%] left-0 min-w-80 w-full p-2 rounded-lg bg-foreground border border-border z-[100]"
      ref={modalRef}
    >
      <div className="flex flex-col h-full space-y-4">
        <div className="relative flex items-center justify-between px-2 text-sm py-2 border-b border-border">
          <div>
            <h2 className="font-medium tracking-wide text-muted  ">TEXT FILTER</h2>
            <p className=" text-xs tracking-wide my-1 text-white/50" style={{ textTransform: 'none', fontWeight:'normal' }} >Press Enter to add multiple filters</p>
          </div>
          <span
            className="flex items-center justify-center self-start w-6 h-6 rounded-full cursor-pointer bg-background"
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

        <div className="flex flex-col px-2 space-y-3">
          <div className="text-xs font-medium tracking-wide text-muted">
            Contains List
          </div>
          <div className="flex items-center flex-wrap bg-background px-2 py-1 rounded-md">
            {likeTags?.length > 0 &&
              likeTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-foreground text-white flex items-center rounded px-2 py-2 m-1 space-x-2 text-xs capitalize"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeLikeTag(index)}
                    className="ml-2 text-gray-200 hover:text-white"
                  >
                    <svg
                      viewBox="0 0 8 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-2.5 h-2.5"
                    >
                      <path
                        d="M1.2 7.5L0.5 6.8L3.3 4L0.5 1.2L1.2 0.5L4 3.3L6.8 0.5L7.5 1.2L4.7 4L7.5 6.8L6.8 7.5L4 4.7L1.2 7.5Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </span>
              ))}

            <input
              type="text"
              className="flex-1 py-2 px-1 bg-transparent outline-none font-normal text-sm placeholder:text-white/40 text-white"
              placeholder="Enter a value and press 'Enter' to add..."
              value={likeInput}
              onChange={handleLikeInputChange}
              onKeyDown={handleLikeInputKeyDown}
            />
          </div>
        </div>

        <div className="flex flex-col px-2 space-y-3">
          <div className="text-xs font-medium tracking-wide text-muted">
            Does not contain list
          </div>
          <div className="flex items-center flex-wrap bg-background px-2 py-1 rounded-md">
            { notLikeTags?.length > 0 && 
                notLikeTags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-foreground text-white flex items-center rounded px-2 py-2 m-1 space-x-2 text-xs capitalize"
                  >
                    {tag}
                    <button
                      onClick={() => removeNotLikeTag(index)}
                      className="ml-2 text-gray-200 hover:text-white"
                    >
                      &times;
                    </button>
                  </span>
            ))}
          <input
            type="text"
            className="flex-1 py-2 px-1 bg-transparent outline-none font-normal text-sm placeholder:text-white/40 text-white"
            placeholder="Enter a value and press 'Enter' to add..."
            value={notLikeInput}
            onChange={handleNotLikeInputChange}
            onKeyDown={handleNotLikeInputKeyDown}
          />
          </div>

        </div>

        <div className="flex items-center justify-end w-full px-2 pt-4 space-x-2 border-t border-border">
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded-md min-w-28 bg-border"
            onClick={() => {
              setLikeTags([]);
              setNotLikeTags([]);
              toggleDropdown();
            }}
          >
            Reset All
          </button>

          <button
            className="px-4 py-2 text-sm font-medium rounded-md min-w-28 text-muted bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
            onClick={() => {
              // Mapping likeTags and notLikeTags to the new desired structure
              onFilterSelect({
                contains_list: likeTags,
                not_contains_list: notLikeTags,
              });
              toggleDropdown();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextFilterDropdown;
