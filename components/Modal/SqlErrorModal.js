import React, { useEffect, useRef } from "react";

const SqlErrorModal = ({ data, showSqlError, setShowSqlError }) => {
  const errorRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (errorRef.current && !errorRef.current.contains(e.target)) {
      setShowSqlError(false);
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
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        showSqlError || "hidden"
      }`}
    >
      <div
        className="relative flex flex-col w-full max-w-xl p-2 space-y-4 rounded-lg bg-foreground"
        ref={errorRef}
      >
        <div className="relative flex items-center px-2 py-3 text-sm font-medium text-white tracking-wider border-b border-border">
          <div className="flex items-center space-x-2">
            <span className="flex justify-center items-center">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
              >
                <path
                  d="M8 12C8.22667 12 8.41667 11.9233 8.57 11.77C8.72333 11.6167 8.8 11.4267 8.8 11.2C8.8 10.9733 8.72333 10.7833 8.57 10.63C8.41667 10.4767 8.22667 10.4 8 10.4C7.77333 10.4 7.58333 10.4767 7.43 10.63C7.27667 10.7833 7.2 10.9733 7.2 11.2C7.2 11.4267 7.27667 11.6167 7.43 11.77C7.58333 11.9233 7.77333 12 8 12ZM7.2 8.8H8.8V4H7.2V8.8ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                  fill="#C22828"
                />
              </svg>
            </span>

            <span>SQL Error Details</span>
          </div>

          <span
            className="absolute flex items-center justify-center w-6 h-6 -translate-y-1/2 rounded-full cursor-pointer top-1/2 right-2 hover:bg-background"
            onClick={() => setShowSqlError(false)}
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

        {data?.length > 0 && (
          <div className="flex flex-col p-4 overflow-hidden overflow-y-auto text-sm leading-6 rounded-md max-h-72 min-h-32 recent__bar bg-background font-roboto">
            <ul className="flex flex-col space-y-4">
              {data?.map((item, index) => {
                return (
                  <li
                    key={index}
                    className="flex space-x-4 text-sm tracking-wide text-white"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-white/40"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </span>

                    <span className="w-full leading-5 font-medium text-[#8D8E8F]">
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlErrorModal;
