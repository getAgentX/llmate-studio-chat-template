import React, { useEffect, useRef, useState } from "react";
import AdvancedChart from "../../common/AdvancedChart";

const NotebookChartModal = ({
  show,
  setShow,
  data = {},
  setvisualizationConfig = () => {},
}) => {
  const [configData, setConfigData] = useState({});
  const modalRef = useRef(null);
  const modalYAxesRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalYAxesRef.current && !modalYAxesRef.current.contains(e.target)) {
      setToggleYAxes(false);
    }

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

  const handleSaveChanges = () => {
    delete configData.data;

    const data = {
      visualization_config: configData,
    };

    setvisualizationConfig(data.visualization_config);
    setShow(false);
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full w-full h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        show || "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-5xl px-4 py-2 rounded-lg bg-foreground"
        ref={modalRef}
      >
        <div className="flex flex-col h-full space-y-2">
          <div className="relative flex items-center justify-between px-2 py-3 text-sm font-medium border-b text-muted border-border">
            <div className="flex items-center space-x-2">
              <span>EDIT CHART</span>
            </div>

            <span
              className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer bg-background"
              onClick={() => setShow(false)}
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
          {/* overflow-y-auto recent__bar */}
          <div className="min-h-96 max-h-[440px] h-full overflow-hidden scroll_popup">
            {Object.keys(data).length > 0 && (
              <AdvancedChart chartData={data} setConfigData={setConfigData} />
            )}
          </div>

          <div className="flex items-center justify-between w-full px-2 pt-2 pb-2 space-x-4 border-t border-border">
            <button
              className="px-4 py-2 text-sm font-medium text-white rounded-md min-w-28 bg-border"
              onClick={() => setShow(false)}
            >
              Cancel
            </button>

            <div className="flex items-center space-x-4">
              {/* <button
                className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md min-w-28"
                onClick={handleSaveNew}
                type="button"
              >
                Save as New
              </button> */}
              <button
                className="px-4 py-2 text-sm font-medium rounded-md min-w-28 text-muted bg-secondary hover:bg-secondary-foreground"
                onClick={handleSaveChanges}
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotebookChartModal;
