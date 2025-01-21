import React, { useEffect, useRef, useState } from "react";
import { useUploadExamplesInBulkMutation } from "@/store/sql_datasource";
import SuccessModal from "../Modal/SuccessModal";
import Loader from "../loader/Loader";

const BulkUploadModal = ({ show, setShow, slug = null, refetchList, setShowBulkUploadSuccess=()=>{} }) => {
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cleanup, setCleanup] = useState(false);
  // const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [uploadExamplesInBulk, {}] = useUploadExamplesInBulkMutation();

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
      file &&
      (file.type === "text/csv" ||
        file.type === "application/csv" ||
        file.type === "application/vnd.ms-excel" ||
        file.type === "text/plain")
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

  const [ isUploading, setIsUploading] = useState(false)
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }

    const payload = {
      file: selectedFile,
      cleanup: cleanup,
    };

    setIsUploading(true);
    try {
      // Using `await` with the mutation to handle async behavior
      const response = await uploadExamplesInBulk({
        datasource_id: slug,
        payload: payload,
      }).unwrap(); // Use `.unwrap()` if you're using RTK Query for proper promise resolution.

      if (response) {
        setShowBulkUploadSuccess(true);
        resetSidebar(); // Reset modal and file input
        // refetchList(); // Refresh the list after upload
      }
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur  ${
          show ? "" : "hidden"
        }`}
      >
        <div
          className="relative w-full max-w-md p-2 border rounded-lg bg-dropdown-bg border-border-color"
          ref={modalRef}
        >
          <div className="relative flex flex-col">
            <div className="flex sticky top-0 left-0 w-full items-center py-4 px-4 justify-between border-b border-border-color">
              <a className="flex items-center justify-center space-x-4 text-sm font-medium tracking-wide text-primary-text cursor-pointer group">
                <span>Bulk Examples Upload</span>
              </a>

              <span
                className="flex items-center justify-center"
                onClick={resetSidebar}
              >
                <svg
                  viewBox="0 0 12 13"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 fill-icon-color hover:fill-primary-text"
                >
                  <path d="M1.33317 12.3307L0.166504 11.1641L4.83317 6.4974L0.166504 1.83073L1.33317 0.664062L5.99984 5.33073L10.6665 0.664062L11.8332 1.83073L7.1665 6.4974L11.8332 11.1641L10.6665 12.3307L5.99984 7.66406L1.33317 12.3307Z" />
                </svg>
              </span>
            </div>

            <div className="p-4">
              <div className="flex flex-col rounded-md p-3 space-y-2">
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
                      className="w-8 h-8 fill-icon-color hover:fill-primary-text"
                    >
                      <path d="M16.6654 28.3333V9.31658L10.5987 15.3833L7.33203 11.9999L18.9987 0.333252L30.6654 11.9999L27.3987 15.3833L21.332 9.31658V28.3333H16.6654ZM4.9987 37.6666C3.71536 37.6666 2.61675 37.2096 1.70286 36.2957C0.788976 35.3819 0.332031 34.2832 0.332031 32.9999V25.9999H4.9987V32.9999H32.9987V25.9999H37.6654V32.9999C37.6654 34.2832 37.2084 35.3819 36.2945 36.2957C35.3806 37.2096 34.282 37.6666 32.9987 37.6666H4.9987Z" />
                    </svg>
                  </span>

                  <div className="flex flex-col space-y-2 text-center">
                    <p className="text-base font-medium tracking-wider text-primary-text">
                      Upload Your File
                    </p>

                    <p className="text-sm font-normal tracking-wider text-secondary-text">
                      Supported File Formats : CSV
                    </p>
                  </div>

                  <div>
                    <button
                      className="flex items-center justify-center h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary"
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
                  <div className="flex items-center justify-between px-4 py-2 rounded-md bg-page-light">
                    <div className="flex items-center space-x-4">
                      <img
                        src="/assets/csv-logo.svg"
                        alt="csv logo"
                        className="object-cover w-8 aspect-auto"
                      />

                      <div className="flex flex-col space-y-1">
                        <p className="text-xs font-medium tracking-wider text-primary-text capitalize">
                          {selectedFile.name}
                        </p>

                        <p className="text-xs font-medium tracking-wider text-muted">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>

                    <a
                      className="flex items-center justify-center px-2 space-x-2 text-xs font-normal tracking-wide cursor-pointer group text-[#8D8E8F] hover:text-primary-text"
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

                <p className="w-full text-xs font-normal leading-5 tracking-wider text-secondary-text">
                  Ensure that the uploaded file contains all examples in the
                  same format as the provided Demo File. You can download and
                  review the
                  <a
                    href="/assets/up.csv"
                    download
                    className="px-1 font-medium underline cursor-pointer text-secondary hover:text-primary-text"
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
                  style={{ backgroundColor: "var(--active-bg" }}
                />

                <p className="w-full text-xs font-normal leading-5 tracking-wider text-primary-text">
                  Remove all the existing examples?{" "}
                  <span className="text-secondary-text">
                    (Click Checkbox if you want to remove)
                  </span>
                </p>
              </div>
            )}

            <div className="flex items-center justify-end py-3 px-4 border-t border-border-color space-x-2">
              <button
                type="button"
                className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide border rounded-md w-fit text-btn-primary-outline-text hover:text-btn-primary-text group border-btn-primary-outline hover:bg-btn-primary-outline-bg"
                onClick={resetSidebar}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                disabled={selectedFile === null || isUploading}
                onClick={handleUpload}
              >
                {isUploading ? (
                  <div className="flex items-center gap-x-2">
                    <Loader />
                    <span>Uploading...</span>
                  </div>
                ) :
                  "Upload"
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* <SuccessModal
        show={showSuccessModal}
        setShow={setShowSuccessModal}
        heading="Success Confirmation"
        title={""}
        description="Your csv file is uploaded successfully"
        primaryBtn="Close"
        primaryChange={() => setShowSuccessModal(false)}
      /> */}
    </>
  );
};

export default BulkUploadModal;
