import React, { useEffect, useRef } from "react";

const ErrorModal = ({
  show,
  setShow,
  heading,
  title,
  description,
  primaryBtn = "",
  primaryChange = () => {},
  secondaryBtn = "",
  secondaryChange = () => {},
}) => {
  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShow(false);
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
        show ? "" : "hidden"
      }`}
    >
      <div
        className="relative flex flex-col w-full max-w-lg border rounded-lg bg-dropdown-bg border-dropdown-border"
        ref={modalRef}
      >
        <div className="flex flex-col h-full space-y-6">
          <div className="relative flex items-center justify-between px-4 py-4 text-base font-medium border-b text-muted border-border">
            <div className="flex items-center space-x-3">
              <span className="flex items-center justify-center">
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
              <span>{heading}</span>
            </div>

            <span
              className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer bg-background"
              onClick={() => setShow(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
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

          <div className="flex flex-col flex-grow px-4 space-y-4 overflow-auto">
            {title && (
              <div className="text-sm font-medium tracking-wide text-dropdown-text">
                {title}
              </div>
            )}

            {description && (
              <span className="text-xs font-normal leading-5 tracking-wide text-secondary-text line-clamp-3">
                {description}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end w-full px-2 py-2 space-x-4 border-t border-dropdown-border">
            {secondaryBtn && (
              <button
                className="h-8 px-3 text-xs font-medium rounded-md text-btn-secondary-text bg-btn-secondary-bg 2xl:text-sm hover:bg-btn-secondary-hover disabled:bg-btn-secondary-disable-bg disabled:text-btn-secondary-disable-text"
                onClick={secondaryChange}
              >
                {secondaryBtn}
              </button>
            )}

            {primaryBtn && (
              <button
                className="flex items-center justify-center h-8 px-3 text-xs font-semibold tracking-wide rounded-md gap-x-2 text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                onClick={primaryChange}
              >
                {primaryBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
