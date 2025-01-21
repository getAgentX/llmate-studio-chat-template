import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useRef, useState } from "react";

const Sortby = ({ currentOrder, setCurrentOrder }) => {
  const [toggleSorting, setToggleSorting] = useState(false);
  const dropdownSortingRef = useRef(null);
  const { theme } = useTheme();
  const handleOutsideClick = (e) => {
    if (
      dropdownSortingRef.current &&
      !dropdownSortingRef.current.contains(e.target)
    ) {
      setToggleSorting(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleChnage = (value) => {
    setCurrentOrder(value);
    setToggleSorting(false);
  };

  return (
    <div className="relative" ref={dropdownSortingRef}>
      <button
        className={`flex items-center justify-center w-full h-8 px-3 space-x-2 text-xs font-medium tracking-wide border rounded-md border-dropdown-border max-w-fit text-btn-secondary-text disabled:text-btn-secondary-disable-text group bg-primary ${toggleSorting && "focus:border-active-border"}`}
        onClick={() => setToggleSorting((prev) => !prev)}
      >
        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3 h-3 ${theme === 'dark' ? 'fill-primary-text' : 'fill-user-icon'}`}
          >
            <path d="M0 8V6.66667H4V8H0ZM0 4.66667V3.33333H8V4.66667H0ZM0 1.33333V0H12V1.33333H0Z" />
          </svg>
        </span>
        <span className="hidden xsm:block text-dropdown-text">Sortby</span>
      </button>

      {toggleSorting && (
        <div className="absolute top-[114%] -left-16 min-w-36 rounded bg-dropdown-bg border border-border-color w-full flex flex-col space-y-1 shadow-md">
          <button
            className={`text-xs flex justify-between font-normal text-start text-accent py-2 transition-all duration-200 ${currentOrder === "A-Z"
              ? "bg-active-bg border-border-active-color text-active-text"
              : "bg-transparent border-transparent hover:bg-active-bg-hover"
              } rounded-t px-2 cursor-pointer line-clamp-1`}
            onClick={() => handleChnage("A-Z")}
          >
            <span>A-Z order</span>

            {currentOrder === "A-Z" && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="5.70312" cy="6.30078" r="4.5" fill="#F6F6F6" />
                  <path d="M5.16 8.76L9.39 4.53L8.55 3.69L5.16 7.08L3.45 5.37L2.61 6.21L5.16 8.76ZM6 12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 11.2125 2.295 10.785 1.755 10.245C1.215 9.705 0.7875 9.07 0.4725 8.34C0.1575 7.61 0 6.83 0 6C0 5.17 0.1575 4.39 0.4725 3.66C0.7875 2.93 1.215 2.295 1.755 1.755C2.295 1.215 2.93 0.7875 3.66 0.4725C4.39 0.1575 5.17 0 6 0C6.83 0 7.61 0.1575 8.34 0.4725C9.07 0.7875 9.705 1.215 10.245 1.755C10.785 2.295 11.2125 2.93 11.5275 3.66C11.8425 4.39 12 5.17 12 6C12 6.83 11.8425 7.61 11.5275 8.34C11.2125 9.07 10.785 9.705 10.245 10.245C9.705 10.785 9.07 11.2125 8.34 11.5275C7.61 11.8425 6.83 12 6 12Z" fill="#295EF4" />
                </svg>
              </span>
            )}
          </button>

          <button
            className={`text-xs flex justify-between font-normal text-start text-accent py-2 transition-all duration-200 ${currentOrder === "Z-A"
              ? "bg-active-bg border-border-active-color text-active-text"
              : "bg-transparent border-transparent hover:bg-active-bg-hover"
              } px-2 cursor-pointer line-clamp-1`}
            onClick={() => handleChnage("Z-A")}
          >
            <span>Z-A order</span>

            {currentOrder === "Z-A" && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="5.70312" cy="6.30078" r="4.5" fill="#F6F6F6" />
                  <path d="M5.16 8.76L9.39 4.53L8.55 3.69L5.16 7.08L3.45 5.37L2.61 6.21L5.16 8.76ZM6 12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 11.2125 2.295 10.785 1.755 10.245C1.215 9.705 0.7875 9.07 0.4725 8.34C0.1575 7.61 0 6.83 0 6C0 5.17 0.1575 4.39 0.4725 3.66C0.7875 2.93 1.215 2.295 1.755 1.755C2.295 1.215 2.93 0.7875 3.66 0.4725C4.39 0.1575 5.17 0 6 0C6.83 0 7.61 0.1575 8.34 0.4725C9.07 0.7875 9.705 1.215 10.245 1.755C10.785 2.295 11.2125 2.93 11.5275 3.66C11.8425 4.39 12 5.17 12 6C12 6.83 11.8425 7.61 11.5275 8.34C11.2125 9.07 10.785 9.705 10.245 10.245C9.705 10.785 9.07 11.2125 8.34 11.5275C7.61 11.8425 6.83 12 6 12Z" fill="#295EF4" />
                </svg>
              </span>
            )}
          </button>

          <button
            className={`text-xs flex justify-between font-normal text-start text-accent py-2 transition-all duration-200 ${currentOrder === "lastcreatedat"
              ? "bg-active-bg border-border-active-color text-active-text"
              : "bg-transparent border-transparent hover:bg-active-bg-hover"
              } px-2 cursor-pointer line-clamp-1`}
            onClick={() => handleChnage("lastcreatedat")}
          >
            <span>Last Created</span>

            {currentOrder === "lastcreatedat" && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="5.70312" cy="6.30078" r="4.5" fill="#F6F6F6" />
                  <path d="M5.16 8.76L9.39 4.53L8.55 3.69L5.16 7.08L3.45 5.37L2.61 6.21L5.16 8.76ZM6 12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 11.2125 2.295 10.785 1.755 10.245C1.215 9.705 0.7875 9.07 0.4725 8.34C0.1575 7.61 0 6.83 0 6C0 5.17 0.1575 4.39 0.4725 3.66C0.7875 2.93 1.215 2.295 1.755 1.755C2.295 1.215 2.93 0.7875 3.66 0.4725C4.39 0.1575 5.17 0 6 0C6.83 0 7.61 0.1575 8.34 0.4725C9.07 0.7875 9.705 1.215 10.245 1.755C10.785 2.295 11.2125 2.93 11.5275 3.66C11.8425 4.39 12 5.17 12 6C12 6.83 11.8425 7.61 11.5275 8.34C11.2125 9.07 10.785 9.705 10.245 10.245C9.705 10.785 9.07 11.2125 8.34 11.5275C7.61 11.8425 6.83 12 6 12Z" fill="#295EF4" />
                </svg>
              </span>
            )}
          </button>

          <button
            className={`text-xs flex justify-between font-normal text-start text-accent py-2 transition-all duration-200 ${currentOrder === "lastupdatedat"
              ? "bg-active-bg border-border-active-color text-active-text"
              : "bg-transparent border-transparent hover:bg-active-bg-hover"
              } rounded-b px-2 cursor-pointer line-clamp-1`}
            onClick={() => handleChnage("lastupdatedat")}
          >
            <span>Last Updated</span>

            {currentOrder === "lastupdatedat" && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="5.70312" cy="6.30078" r="4.5" fill="#F6F6F6" />
                  <path d="M5.16 8.76L9.39 4.53L8.55 3.69L5.16 7.08L3.45 5.37L2.61 6.21L5.16 8.76ZM6 12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 11.2125 2.295 10.785 1.755 10.245C1.215 9.705 0.7875 9.07 0.4725 8.34C0.1575 7.61 0 6.83 0 6C0 5.17 0.1575 4.39 0.4725 3.66C0.7875 2.93 1.215 2.295 1.755 1.755C2.295 1.215 2.93 0.7875 3.66 0.4725C4.39 0.1575 5.17 0 6 0C6.83 0 7.61 0.1575 8.34 0.4725C9.07 0.7875 9.705 1.215 10.245 1.755C10.785 2.295 11.2125 2.93 11.5275 3.66C11.8425 4.39 12 5.17 12 6C12 6.83 11.8425 7.61 11.5275 8.34C11.2125 9.07 10.785 9.705 10.245 10.245C9.705 10.785 9.07 11.2125 8.34 11.5275C7.61 11.8425 6.83 12 6 12Z" fill="#295EF4" />
                </svg>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sortby;
