import React, { useEffect, useRef, useState } from "react";

const UpdateWidget = ({
  showUpdateWidget,
  onClose,
  onSave,
  name = "",
}) => {
  const [widgetName, setWidgetName] = useState("");


  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleClose = (e) => {
    
    console.log("close");
    // e.stopPropagation();
    onClose();
    
  };

  

  const handleUpdate = (e) => {

    console.log("update");
    e.stopPropagation();
    onSave({label:widgetName});
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        showUpdateWidget || "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-md p-2 rounded-lg bg-foreground"
        ref={modalRef}
      >
        <div className="flex flex-col h-full space-y-4">
          <div className="relative flex items-center justify-between px-2 py-3 text-sm font-medium border-b text-muted border-border">
            <span>UPDATE WIDGET</span>

            <span
              className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer bg-background"
              onClick={handleClose}
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
              Update a widget name
            </span>
          </div>

          <div className="w-full px-2">
            <input
              type="text"
              className="w-full px-4 py-3 text-sm font-normal border-none rounded-md outline-none text-white/40 placeholder:text-white/40 bg-background"
              placeholder="Enter a unique name for your widget"
              value={widgetName}
              defaultValue={name}
              onChange={(e) => setWidgetName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end w-full px-2 pt-4 space-x-4 border-t border-border">
            <button
              className="px-4 py-2 text-sm font-medium text-white rounded-md min-w-28 bg-border"
              onClick={handleClose}
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 text-sm font-medium rounded-md min-w-28 text-muted bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
              onClick={handleUpdate}
              disabled={widgetName === "" ? true : false}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateWidget;
