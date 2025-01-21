import React, { useEffect, useRef } from "react";

const SuccessModal = ({
  show,
  setShow,
  heading,
  title,
  description,
  primaryBtn = "",
  primaryChange = () => {},
  secondaryBtn = "",
  secondaryChange = () => {},
  setHideDrawer = null,
}) => {
  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShow(false);

      if (setHideDrawer) {
        setHideDrawer(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const primaryBtnIcon = (primaryBtn) => {
    switch (primaryBtn.toLowerCase()) {
      case "chat":
        return (
          <svg
            viewBox="0 0 14 14"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 fill-white"
          >
            <path d="M3.66536 11.0002C3.47648 11.0002 3.31814 10.9363 3.19036 10.8085C3.06259 10.6807 2.9987 10.5224 2.9987 10.3335V9.00016H11.6654V3.00016H12.9987C13.1876 3.00016 13.3459 3.06405 13.4737 3.19183C13.6015 3.31961 13.6654 3.47794 13.6654 3.66683V13.6668L10.9987 11.0002H3.66536ZM0.332031 10.3335V1.00016C0.332031 0.811274 0.39592 0.652941 0.523698 0.525163C0.651476 0.397385 0.809809 0.333496 0.998698 0.333496H9.66536C9.85425 0.333496 10.0126 0.397385 10.1404 0.525163C10.2681 0.652941 10.332 0.811274 10.332 1.00016V7.00016C10.332 7.18905 10.2681 7.34738 10.1404 7.47516C10.0126 7.60294 9.85425 7.66683 9.66536 7.66683H2.9987L0.332031 10.3335Z" />
          </svg>
        );
      case "view":
        return (
          <svg
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3 fill-white"
          >
            <path d="M0 12V10.6667L1.33333 9.33333V12H0ZM2.66667 12V8L4 6.66667V12H2.66667ZM5.33333 12V6.66667L6.66667 8.01667V12H5.33333ZM8 12V8.01667L9.33333 6.68333V12H8ZM10.6667 12V5.33333L12 4V12H10.6667ZM0 8.55V6.66667L4.66667 2L7.33333 4.66667L12 0V1.88333L7.33333 6.55L4.66667 3.88333L0 8.55Z" />
          </svg>
        );
      case "query":
        return (
          <svg
            viewBox="0 0 16 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 fill-white"
          >
            <path d="M1.7474 11.1168L0.664062 10.3335L3.9974 5.00016L5.9974 7.3335L8.66406 3.00016L10.4807 5.71683C10.2252 5.72794 9.98351 5.7585 9.75573 5.8085C9.52795 5.8585 9.30295 5.92794 9.08073 6.01683L8.71406 5.46683L6.18073 9.5835L4.16406 7.2335L1.7474 11.1168ZM14.3807 14.3335L12.2974 12.2502C12.0752 12.4057 11.828 12.5224 11.5557 12.6002C11.2835 12.6779 11.003 12.7168 10.7141 12.7168C9.88073 12.7168 9.1724 12.4252 8.58906 11.8418C8.00573 11.2585 7.71406 10.5502 7.71406 9.71683C7.71406 8.8835 8.00573 8.17516 8.58906 7.59183C9.1724 7.0085 9.88073 6.71683 10.7141 6.71683C11.5474 6.71683 12.2557 7.0085 12.8391 7.59183C13.4224 8.17516 13.7141 8.8835 13.7141 9.71683C13.7141 10.0057 13.6752 10.2863 13.5974 10.5585C13.5196 10.8307 13.403 11.0835 13.2474 11.3168L15.3307 13.3835L14.3807 14.3335ZM10.7141 11.3835C11.1807 11.3835 11.5752 11.2224 11.8974 10.9002C12.2196 10.5779 12.3807 10.1835 12.3807 9.71683C12.3807 9.25016 12.2196 8.85572 11.8974 8.5335C11.5752 8.21127 11.1807 8.05016 10.7141 8.05016C10.2474 8.05016 9.85295 8.21127 9.53073 8.5335C9.20851 8.85572 9.0474 9.25016 9.0474 9.71683C9.0474 10.1835 9.20851 10.5779 9.53073 10.9002C9.85295 11.2224 10.2474 11.3835 10.7141 11.3835ZM12.1974 6.05016C11.9863 5.96127 11.7668 5.88905 11.5391 5.8335C11.3113 5.77794 11.0752 5.74461 10.8307 5.7335L14.2474 0.333496L15.3307 1.11683L12.1974 6.05016Z" />
          </svg>
        );
      default:
        return null; // No icon if no match
    }
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-6 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        show ? "" : "hidden"
      }`}
    >
      <div className="relative w-full max-w-md bg-dropdown-bg rounded-md" ref={modalRef}>
        <div className="flex flex-col justify-between h-full space-y-4 border rounded-md border-dropdown-border min-h-48">
          <div className="flex flex-col space-y-4">
            <div className="relative flex items-center justify-between px-4 py-2 text-base font-medium border-b text-dropdown-text border-dropdown-border">
              <div className="flex items-center space-x-3">
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-[#25D221]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </span>
                <span>{heading}</span>
              </div>

              {/* <span
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
              </span> */}
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
          </div>

          <div className="flex items-center justify-end w-full px-2 py-2 space-x-4 border-t border-dropdown-border">
            {secondaryBtn && (
              <button
                className="h-8 px-3 text-xs rounded-md text-btn-secondary-text font-semibold bg-btn-secondary-bg hover:bg-btn-secondary-hover disabled:bg-btn-secondary-disable-bg disabled:text-btn-secondary-disable-text"
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
                {primaryBtnIcon(primaryBtn)}
                {primaryBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
