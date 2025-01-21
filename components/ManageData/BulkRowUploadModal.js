import React, { useEffect, useRef, useState } from "react";
import { useAddBulkRowsMutation } from "@/store/semi_structured_datasource";
import SuccessModal from "../Modal/SuccessModal";

const BulkRowUploadModal = ({
  show,
  setShow,
  slug = null,
  refetchList,
  skip,
  limit,
  existingColumns,
}) => {
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cleanup, setCleanup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [uploadRowsInBulk, {}] = useAddBulkRowsMutation();

  const resetSidebar = () => {
    fileInputRef.current.value = null;
    setSelectedFile(null);
    setShow(false);
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      resetSidebar();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      (file && file.type === "text/csv") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"
    ) {
      setSelectedFile(file);
    } else {
      alert("Please select a CSV file.");
    }
  };

  const handleAddFileClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const formatFileSize = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleUpload = () => {
    const payload = {
      file: selectedFile,
      cleanup: cleanup,
    };

    uploadRowsInBulk({
      datasource_id: slug,
      payload: payload,
    }).then((response) => {
      if (response) {
        refetchList(skip, limit);
        resetSidebar();
        setShowSuccessModal(true);
      }
    });
  };

  function generateRandomData(type) {
    if (type === "number") {
      return Array.from({ length: 5 }, () => Math.floor(Math.random() * 10000));
    } else {
      return Array.from({ length: 5 }, () =>
        Math.random().toString(36).substring(2, 15)
      );
    }
  }

  function createCSVData(columns) {
    const headers = Object.values(columns).map((col) => col.field_name);
    const rows = Array.from({ length: 10 }, () => {
      return Object.values(columns)
        .map((col) => `"${generateRandomData(col.field_type).join(", ")}"`)
        .join(",");
    });
    return [headers.join(","), ...rows].join("\n");
  }

  function downloadCSV(filename, content) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleDownloadDemoFile = () => {
    const csvData = createCSVData(existingColumns);
    downloadCSV("demo-file.csv", csvData);
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center z-[1000] max-h-full md:inset-0 bg_blur ${
        show ? "" : "hidden"
      }`}
    >
      <div
        className="w-full max-w-xl overflow-x-hidden overflow-y-auto rounded-md bg-foreground recent__bar"
        ref={modalRef}
      >
        <div className="relative flex flex-col">
          <div className="flex sticky top-0 left-0 bg-foreground w-full items-center py-4 px-4 justify-between border-b border-[#303237]">
            <a className="flex items-center justify-center space-x-4 text-sm font-medium tracking-wide text-white cursor-pointer group">
              <span>Bulk Rows Upload</span>
            </a>

            <span
              className="flex items-center justify-center"
              onClick={resetSidebar}
            >
              <svg
                viewBox="0 0 12 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 fill-[#878787] hover:fill-white cursor-pointer"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.00104 6.91474L9.53637 10.4501C9.72397 10.6377 9.9784 10.7431 10.2437 10.7431C10.509 10.7431 10.7634 10.6377 10.951 10.4501C11.1386 10.2625 11.244 10.008 11.244 9.74274C11.244 9.47744 11.1386 9.223 10.951 9.03541L7.41437 5.50007L10.9504 1.96474C11.0432 1.87185 11.1169 1.76159 11.1671 1.64024C11.2173 1.51889 11.2432 1.38884 11.2431 1.2575C11.2431 1.12617 11.2172 0.99613 11.1669 0.874806C11.1166 0.753482 11.0429 0.643251 10.95 0.550407C10.8571 0.457562 10.7469 0.383923 10.6255 0.333692C10.5042 0.283462 10.3741 0.257624 10.2428 0.257655C10.1115 0.257686 9.98143 0.283585 9.8601 0.333872C9.73878 0.38416 9.62855 0.457852 9.5357 0.55074L6.00104 4.08607L2.4657 0.55074C2.3735 0.455188 2.26319 0.378954 2.14121 0.326488C2.01924 0.274023 1.88803 0.246375 1.75525 0.245159C1.62247 0.243943 1.49078 0.269183 1.36786 0.319406C1.24494 0.369629 1.13326 0.443829 1.03932 0.537677C0.945384 0.631525 0.871078 0.743142 0.820739 0.866014C0.770401 0.988886 0.745037 1.12055 0.746127 1.25333C0.747218 1.38611 0.774742 1.51734 0.827093 1.63937C0.879443 1.7614 0.955572 1.87178 1.05104 1.96407L4.5877 5.50007L1.05171 9.03607C0.956239 9.12837 0.88011 9.23875 0.827759 9.36077C0.775409 9.4828 0.747885 9.61403 0.746794 9.74681C0.745703 9.87959 0.771067 10.0113 0.821406 10.1341C0.871745 10.257 0.94605 10.3686 1.03999 10.4625C1.13392 10.5563 1.24561 10.6305 1.36853 10.6807C1.49145 10.731 1.62314 10.7562 1.75592 10.755C1.8887 10.7538 2.0199 10.7261 2.14188 10.6737C2.26386 10.6212 2.37417 10.545 2.46637 10.4494L6.00104 6.91541V6.91474Z"
                />
              </svg>
            </span>
          </div>

          <div className="p-4">
            <div className="flex flex-col bg-[#2A2D34] rounded-md p-3 space-y-2">
              <div
                className={`flex flex-col items-center justify-center py-2 space-y-4 ${
                  selectedFile ? "opacity-50 select-none" : "opacity-100"
                }`}
              >
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 38 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 fill-[#363941]"
                  >
                    <path d="M16.6654 28.3333V9.31658L10.5987 15.3833L7.33203 11.9999L18.9987 0.333252L30.6654 11.9999L27.3987 15.3833L21.332 9.31658V28.3333H16.6654ZM4.9987 37.6666C3.71536 37.6666 2.61675 37.2096 1.70286 36.2957C0.788976 35.3819 0.332031 34.2832 0.332031 32.9999V25.9999H4.9987V32.9999H32.9987V25.9999H37.6654V32.9999C37.6654 34.2832 37.2084 35.3819 36.2945 36.2957C35.3806 37.2096 34.282 37.6666 32.9987 37.6666H4.9987Z" />
                  </svg>
                </span>

                <div className="flex flex-col space-y-2 text-center">
                  <p className="text-base font-medium tracking-wider text-white">
                    Upload Your File
                  </p>

                  <p className="text-sm font-normal tracking-wider text-white/25">
                    Supported File Formats : CSV
                  </p>
                </div>

                <div>
                  <button
                    className="px-4 py-2 text-sm font-semibold tracking-wider text-black bg-white rounded-lg"
                    onClick={handleAddFileClick}
                    disabled={selectedFile}
                  >
                    Add File
                  </button>
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between px-4 py-2 rounded-md bg-[#30333C]">
                  <div className="flex items-center space-x-4">
                    <img
                      src="/assets/csv-logo.svg"
                      alt="csv logo"
                      className="object-cover w-8 aspect-auto"
                    />

                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-medium tracking-wider text-white capitalize">
                        {selectedFile.name}
                      </p>

                      <p className="text-xs font-medium tracking-wider text-white/25">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  <a
                    className="flex items-center justify-center px-2 space-x-2 text-xs font-normal tracking-wide cursor-pointer group text-[#8D8E8F] hover:text-white"
                    onClick={() => {
                      setSelectedFile(null);
                      fileInputRef.current.value = null;
                    }}
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        viewBox="0 0 12 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 fill-[#8D8E8F] group-hover:fill-white"
                      >
                        <path d="M2.66797 12.5C2.3013 12.5 1.98741 12.3694 1.7263 12.1083C1.46519 11.8472 1.33464 11.5333 1.33464 11.1667V2.5H0.667969V1.16667H4.0013V0.5H8.0013V1.16667H11.3346V2.5H10.668V11.1667C10.668 11.5333 10.5374 11.8472 10.2763 12.1083C10.0152 12.3694 9.7013 12.5 9.33463 12.5H2.66797ZM9.33463 2.5H2.66797V11.1667H9.33463V2.5ZM4.0013 9.83333H5.33464V3.83333H4.0013V9.83333ZM6.66797 9.83333H8.0013V3.83333H6.66797V9.83333Z" />
                      </svg>
                    </span>
                    <span>Remove</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {selectedFile === null && (
            <div className="flex px-4 pb-4 space-x-2">
              <div className="py-1">
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 12 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-[#5F6368]"
                  >
                    <path d="M5.4 9.5H6.6V5.9H5.4V9.5ZM6 4.7C6.17 4.7 6.3125 4.6425 6.4275 4.5275C6.5425 4.4125 6.6 4.27 6.6 4.1C6.6 3.93 6.5425 3.7875 6.4275 3.6725C6.3125 3.5575 6.17 3.5 6 3.5C5.83 3.5 5.6875 3.5575 5.5725 3.6725C5.4575 3.7875 5.4 3.93 5.4 4.1C5.4 4.27 5.4575 4.4125 5.5725 4.5275C5.6875 4.6425 5.83 4.7 6 4.7ZM6 12.5C5.17 12.5 4.39 12.3425 3.66 12.0275C2.93 11.7125 2.295 11.285 1.755 10.745C1.215 10.205 0.7875 9.57 0.4725 8.84C0.1575 8.11 0 7.33 0 6.5C0 5.67 0.1575 4.89 0.4725 4.16C0.7875 3.43 1.215 2.795 1.755 2.255C2.295 1.715 2.93 1.2875 3.66 0.9725C4.39 0.6575 5.17 0.5 6 0.5C6.83 0.5 7.61 0.6575 8.34 0.9725C9.07 1.2875 9.705 1.715 10.245 2.255C10.785 2.795 11.2125 3.43 11.5275 4.16C11.8425 4.89 12 5.67 12 6.5C12 7.33 11.8425 8.11 11.5275 8.84C11.2125 9.57 10.785 10.205 10.245 10.745C9.705 11.285 9.07 11.7125 8.34 12.0275C7.61 12.3425 6.83 12.5 6 12.5Z" />
                  </svg>
                </span>
              </div>

              <p className="w-full text-xs font-normal leading-5 tracking-wider text-white/40">
                Ensure that the uploaded file contains all rows in the same
                format as the provided Demo File. You can download and review
                the
                <a
                  onClick={handleDownloadDemoFile}
                  className="px-1 font-medium underline cursor-pointer text-secondary hover:text-white"
                >
                  Demo File
                </a>{" "}
                to understand the required format.
              </p>
            </div>
          )}

          {selectedFile && (
            <div className="flex items-center px-4 pb-4 space-x-2">
              <input
                type="checkbox"
                className={`w-4 h-4 text-blue-600 cursor-pointer rounded accent-[#295EF4] ${
                  cleanup ? "" : "appearance-none"
                }`}
                value={cleanup}
                onChange={(e) => setCleanup(e.target.checked)}
                style={{ backgroundColor: "#2d3035" }}
              />

              <p className="w-full text-xs font-normal leading-5 tracking-wider text-white">
                Remove all the existing examples?{" "}
                <span className="text-white/40">
                  (Click Checkbox if you want to remove)
                </span>
              </p>
            </div>
          )}

          <div className="flex items-center justify-end py-3 px-4 border-t border-[#303237] space-x-2">
            <button
              type="button"
              className="px-6 py-2 text-sm font-medium text-white border border-[#313236] rounded-md bg-[#2A2C32]"
              onClick={resetSidebar}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]"
              disabled={selectedFile === null}
              onClick={handleUpload}
            >
              Upload
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          show={showSuccessModal}
          setShow={setShowSuccessModal}
          heading="Success Confirmation"
          title={"CSV uploaded successfully. Currently indexing rows...."}
          description={""}
          primaryBtn="Close"
          primaryChange={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default BulkRowUploadModal;
