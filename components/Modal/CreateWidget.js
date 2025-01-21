import React, { useEffect, useRef, useState } from "react";

const CreateWidget = ({ createWidget, setCreateWidget, handleCreate }) => {
  const [widgetName, setWidgetName] = useState("");

  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setWidgetName("");
      setCreateWidget(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleCloseCreation = () => {
    setCreateWidget(false);
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        createWidget || "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-md p-2 border rounded-lg bg-dropdown-bg border-border-color"
        ref={modalRef}
      >
        <div className="flex flex-col h-full space-y-4">
          <div className="relative flex items-center justify-between px-2 py-3 text-sm font-medium border-b text-muted border-dropdown-border">
            <span>Create Widget</span>

            <span
              className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer bg-background"
              onClick={handleCloseCreation}
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

          <div className="flex flex-col px-2 space-y-2">
            <div className="text-sm font-medium tracking-wide text-muted">
              Widget Name
            </div>
            <span className="text-xs font-normal tracking-wide text-white/40">
              Enter a unique name for your new Widget
            </span>
          </div>

          <div className="w-full px-2">
            <input
              type="text"
              className="w-full h-8 px-4 text-sm font-normal border rounded-md outline-none bg-page border-input-border focus:border-input-border-focus text-input-text placeholder:text-input-placeholder"
              placeholder="Enter your widget name here"
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end w-full px-2 pt-4 space-x-4 border-t border-dropdown-border">
            <button
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide border rounded-md w-fit text-btn-primary-outline-text hover:text-btn-primary-text group border-btn-primary-outline hover:bg-btn-primary-outline-bg"
              onClick={() => setCreateWidget(false)}
            >
              Cancel
            </button>

            <button
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
              onClick={() => handleCreate(widgetName)}
              disabled={widgetName === "" ? true : false}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWidget;
