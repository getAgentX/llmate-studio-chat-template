import React, { useEffect, useRef, useState } from "react";
import { SelectOption } from "@/components";
import ConfirmModal from "@/components/Modal/ConfirmModal";
import {
  useBulkDownloadRowsMutation,
  useAddBulkRowsMutation,
} from "@/store/semi_structured_datasource";
import { Controller, useForm } from "react-hook-form";
import {
  useGetDatasourceInfoQuery,
  useUpdateDatasourceInfoMutation,
} from "@/store/datasource";
import { useRouter } from "next/router";
import Breadcrumb from "../common/Breadcrumbs";
import DatasourceLayout from "../Layout/DatasourceLayout";
import SuccessModal from "../Modal/SuccessModal";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const SemiStructuredDatasourceDetails = () => {
  const [slug, setSlug] = useState(null);
  const fileInputRef = useRef(null);
  const [editInfo, setEditInfo] = useState(false);
  const [editCsv, setEditCsv] = useState(false);
  const [infoData, setInfoData] = useState({
    name: "",
    about: "",
  });
  const [csvData, setCsvData] = useState([]);
  const [file, setFile] = useState(null);
  const [cleanup, setCleanup] = useState(false);
  const [showSuccessOnUploadModal, setShowSuccessOnUploadModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fileError, setFileError] = useState(null);

  // const handleFileChange = (e) => {
  //   setFile(e.target.files[0]);
  // };

  const handleFileChange = (e) => {
    setFileError(null);
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    if (uploadedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileError("File size must be under 2 MB.");
      e.target.value = null;
      return;
    }

    setFile(uploadedFile);
  };

  // Toggle cleanup option
  const handleCleanupChange = (e) => {
    setCleanup(e.target.checked);
  };

  const [showConfirmInfoModal, setShowConfirmInfoModal] = useState(false);

  const router = useRouter();
  const formatFileSize = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  useEffect(() => {
    if (router?.query?.slug) {
      setSlug(router.query.slug);
    }
  }, [router?.query?.slug]);

  const {
    data,
    isLoading: getLoading,
    error: getError,
    refetch: refetchData,
  } = useGetDatasourceInfoQuery(
    {
      datasource_id: router.query.slug,
    },
    {
      skip: !router?.query?.slug,
    }
  );

  const [updateDatasourceInfo, { error: updateDatasourceInfoError }] =
    useUpdateDatasourceInfoMutation();

  const [bulkDownloadRows] = useBulkDownloadRowsMutation();
  const [addBulkRows] = useAddBulkRowsMutation();

  const handleInfoConfig = () => {
    const info = { ...infoData, data: csvData };

    updateDatasourceInfo({ datasource_id: slug, payload: info })
      .then((response) => {
        if (response?.error) {
          return;
        }

        setShowConfirmInfoModal(false);
        setShowSuccessModal(true);
      })
      .catch((err) => {
        console.error("An error occurred while updating");
      });
  };

  const crumbData = [
    { name: "Datasources", slug: "/datasource" },
    {
      name: data?.name || "Datasource Name",
      slug: `/datasource/details/${slug}`,
    },
  ];
  const handleBulkUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const payload = { file, cleanup };
    try {
      await addBulkRows({ datasource_id: slug, payload }).unwrap();
      setShowSuccessOnUploadModal(true);
    } catch (error) {
      console.error("Bulk upload failed:", error);
    }
  };

  const handleBulkDownload = () => {
    bulkDownloadRows({ datasource_id: slug }).then((response) => {
      if (response.data) {
        if (response.data.url) {
          const link = document.createElement("a");
          link.href = response.data.url;
          link.download = "";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });
  };

  useEffect(() => {
    if (data) {
      setInfoData({
        name: data.name,
        about: data.about,
      });
    }
  }, [data]);

  return (
    <div className="relative flex flex-col h-full max-h-screen min-h-screen overflow-hidden overflow-y-auto font-roboto recent__bar">
      <Breadcrumb data={crumbData} />

      <DatasourceLayout
        activeTab={"information"}
        currentDatasource="semi_structured"
      >
        <div className="flex flex-col w-full mx-auto space-y-3 max-w-7xl 2xl:max-w-full">
          <div className="h-9 flex items-center justify-between bg-secondary-bg px-2 rounded-[4px]">
            <h3 className="w-40 text-sm text-primary-text ">
              {" "}
              Datasource Information
            </h3>
            {!editInfo ? (
              <button
                className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                type="button"
                onClick={() => setEditInfo(true)}
              >
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 fill-btn-primary-outline-icon"
                  >
                    <path d="M1.33333 10.6667H2.28333L8.8 4.15L7.85 3.2L1.33333 9.71667V10.6667ZM0 12V9.16667L8.8 0.383333C8.93333 0.261111 9.08056 0.166667 9.24167 0.1C9.40278 0.0333333 9.57222 0 9.75 0C9.92778 0 10.1 0.0333333 10.2667 0.1C10.4333 0.166667 10.5778 0.266667 10.7 0.4L11.6167 1.33333C11.75 1.45556 11.8472 1.6 11.9083 1.76667C11.9694 1.93333 12 2.1 12 2.26667C12 2.44444 11.9694 2.61389 11.9083 2.775C11.8472 2.93611 11.75 3.08333 11.6167 3.21667L2.83333 12H0ZM8.31667 3.68333L7.85 3.2L8.8 4.15L8.31667 3.68333Z" />
                  </svg>
                </span>

                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-primary-text"
                  onClick={() => setEditInfo(false)}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </span>

                  <span>Cancel</span>
                </button>

                <button
                  className={`flex items-center space-x-2 text-xs font-medium group disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable text-[#2A9E28] hover:text-primary-text`}
                  onClick={() => setShowConfirmInfoModal(true)}
                  type="button"
                >
                  <span className="flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable fill-[#2A9E28] group-hover:fill-btn-normal-hover">
                      <path d="M6.37031 12.0001L2.57031 8.20007L3.52031 7.25007L6.37031 10.1001L12.487 3.9834L13.437 4.9334L6.37031 12.0001Z" />
                    </svg>
                  </span>
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col px-2 space-y-2 justify-evenly">
            <div className="flex items-center h-7">
              <h3 className="w-40 text-xs text-primary-text">Name</h3>

              <input
                type="text"
                name="name"
                placeholder="Enter the datasource name here"
                className={`px-4 w-[35rem] h-7  rounded-[4px] bg-page focus:outline-none text-xs focus:border-input-border-focus placeholder:text-input-placeholder ${editInfo
                  ? "border border-border-color w-[35rem] text-primary-text"
                  : "text-secondary-text w-full pl-9 pt-[1px]"
                  }
                `}
                value={infoData.name}
                onChange={(e) => {
                  setInfoData((prevData) => ({
                    ...prevData,
                    name: e.target.value,
                  }));
                }}
                disabled={!editInfo}
              />
            </div>
            <div className="flex ">
              <h3 className="w-40 text-xs text-primary-text">Description</h3>

              <textarea
                placeholder="Enter the datasource description here"
                className={`px-4 rounded-[4px] bg-page focus:outline-none focus:border-input-border-focus text-xs focus:ring-secondary resize-none placeholder:text-input-placeholder ${editInfo
                  ? "border border-border-color h-14 w-[35rem] text-primary-text"
                  : "w-full pl-9 pt-[1px] text-secondary-text"
                  }
                `}
                value={infoData.about}
                onChange={(e) => {
                  setInfoData((prevData) => ({
                    ...prevData,
                    about: e.target.value,
                  }));
                }}
                disabled={!editInfo}
              />
            </div>
          </div>
          <div className="h-9 flex items-center justify-between bg-secondary-bg px-2 rounded-[4px]">
            <h3 className="text-sm text-primary-text">
              {" "}
              Selected Database & It’s Connections
            </h3>
            {!editCsv ? (
              <button
                className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                onClick={() => setEditCsv(true)}
              >
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 fill-btn-primary-outline-icon"
                  >
                    <path d="M1.33333 10.6667H2.28333L8.8 4.15L7.85 3.2L1.33333 9.71667V10.6667ZM0 12V9.16667L8.8 0.383333C8.93333 0.261111 9.08056 0.166667 9.24167 0.1C9.40278 0.0333333 9.57222 0 9.75 0C9.92778 0 10.1 0.0333333 10.2667 0.1C10.4333 0.166667 10.5778 0.266667 10.7 0.4L11.6167 1.33333C11.75 1.45556 11.8472 1.6 11.9083 1.76667C11.9694 1.93333 12 2.1 12 2.26667C12 2.44444 11.9694 2.61389 11.9083 2.775C11.8472 2.93611 11.75 3.08333 11.6167 3.21667L2.83333 12H0ZM8.31667 3.68333L7.85 3.2L8.8 4.15L8.31667 3.68333Z" />
                  </svg>
                </span>

                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-primary-text"
                  onClick={() => setEditCsv(false)}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </span>

                  <span>Cancel</span>
                </button>

                <button
                  className={`flex items-center space-x-2 text-xs font-medium group disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable text-[#2A9E28] hover:text-primary-text`}
                  onClick={handleBulkUpload}
                >
                  <span className="flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable fill-[#2A9E28] group-hover:fill-btn-normal-hover">
                      <path d="M6.37031 12.0001L2.57031 8.20007L3.52031 7.25007L6.37031 10.1001L12.487 3.9834L13.437 4.9334L6.37031 12.0001Z" />
                    </svg>
                  </span>
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex ">
            <div className="pl-2">
              <h3 className="w-40 pt-2 text-xs text-primary-text">
                Uploaded File
              </h3>
            </div>
            {!editCsv ? (
              <button
                className="flex items-center self-end justify-center px-4 space-x-2 text-xs font-medium tracking-wide text-white rounded-md cursor-pointer group whitespace-nowrap"
                onClick={handleBulkDownload}
                type="button"
              >
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-secondary-text group-hover:fill-secondary-text"
                  >
                    <path d="M6.0013 8.66675L2.66797 5.33342L3.6013 4.36675L5.33464 6.10008V0.666748H6.66797V6.10008L8.4013 4.36675L9.33464 5.33342L6.0013 8.66675ZM2.0013 11.3334C1.63464 11.3334 1.32075 11.2029 1.05964 10.9417C0.798524 10.6806 0.667969 10.3667 0.667969 10.0001V8.00008H2.0013V10.0001H10.0013V8.00008H11.3346V10.0001C11.3346 10.3667 11.2041 10.6806 10.943 10.9417C10.6819 11.2029 10.368 11.3334 10.0013 11.3334H2.0013Z" />
                  </svg>
                </span>

                <span className="text-xs font-medium text-secondary-text group-hover:text-primary-text">
                  Download as CSV
                </span>
              </button>
            ) : (
              <div className="relative flex flex-col px-2 pb-2 border rounded-md border-border-color w-[35rem]">
                <div>
                  <div className="flex flex-col pt-6 space-y-2 rounded-md">
                    <div
                      className={`flex flex-col items-center justify-center py-2 space-y-4 ${file ? "opacity-50 select-none" : "opacity-100"
                        }`}
                    >
                      <span className="flex items-center justify-center">
                        <svg
                          viewBox="0 0 38 38"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-8 h-8 fill-primary-text"
                        >
                          <path d="M16.6654 28.3333V9.31658L10.5987 15.3833L7.33203 11.9999L18.9987 0.333252L30.6654 11.9999L27.3987 15.3833L21.332 9.31658V28.3333H16.6654ZM4.9987 37.6666C3.71536 37.6666 2.61675 37.2096 1.70286 36.2957C0.788976 35.3819 0.332031 34.2832 0.332031 32.9999V25.9999H4.9987V32.9999H32.9987V25.9999H37.6654V32.9999C37.6654 34.2832 37.2084 35.3819 36.2945 36.2957C35.3806 37.2096 34.282 37.6666 32.9987 37.6666H4.9987Z" />
                        </svg>
                      </span>

                      <div className="flex flex-col space-y-2 text-center">
                        <p className="text-sm font-semibold tracking-wider text-primary-text">
                          Upload Your File
                        </p>

                        <p className="text-xs font-normal tracking-wider text-secondary-text">
                          Supported File Formats: CSV &nbsp;
                          <span className="font-semibold">(Max 2MB)</span>
                        </p>
                      </div>

                      <div>
                        <button
                          type="button"
                          className="h-8 px-3 text-xs font-semibold tracking-wider rounded-md bg-btn-primary text-btn-primary-text hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                          onClick={() => {
                            fileInputRef.current.click();
                          }}
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

                        <input
                          type="hidden"
                          className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                        // {...register("file", {
                        //   required: true,
                        // })}
                        />
                      </div>
                    </div>

                    {file && (
                      <div className="flex items-center justify-between px-4 py-2 mt-2 rounded-md bg-page-hover">
                        <div className="flex items-center space-x-4">
                          <img
                            src="/assets/csv-logo.svg"
                            alt="csv logo"
                            className="object-cover w-8 aspect-auto"
                          />

                          <div className="flex flex-col space-y-1">
                            <p className="text-xs font-medium tracking-wider text-primary-text">
                              {file.name}
                            </p>

                            <p className="text-xs font-medium tracking-wider text-secondary-text">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>

                        <a
                          className="flex items-center justify-center px-2 space-x-2 text-xs font-normal tracking-wide cursor-pointer group text-secondary-text hover:text-primary-text"
                          onClick={() => {
                            setFile(null);
                            fileInputRef.current.value = null;
                          }}
                        >
                          <span className="flex items-center justify-center">
                            <svg
                              viewBox="0 0 12 13"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3 fill-icon-color group-hover:fill-icon-color-hover"
                            >
                              <path d="M2.66797 12.5C2.3013 12.5 1.98741 12.3694 1.7263 12.1083C1.46519 11.8472 1.33464 11.5333 1.33464 11.1667V2.5H0.667969V1.16667H4.0013V0.5H8.0013V1.16667H11.3346V2.5H10.668V11.1667C10.668 11.5333 10.5374 11.8472 10.2763 12.1083C10.0152 12.3694 9.7013 12.5 9.33463 12.5H2.66797ZM9.33463 2.5H2.66797V11.1667H9.33463V2.5ZM4.0013 9.83333H5.33464V3.83333H4.0013V9.83333ZM6.66797 9.83333H8.0013V3.83333H6.66797V9.83333Z" />
                            </svg>
                          </span>
                          <span>Remove</span>
                        </a>
                      </div>
                    )}

                    {fileError && (
                      <p className="mt-1 text-xs text-red-500">{fileError}</p>
                    )}
                  </div>
                </div>

                {file === null && (
                  <div className="flex p-4 mt-2 space-x-2 rounded-md bg-page-hover">
                    <div className="py-1">
                      <span className="flex items-center justify-center">
                        <svg
                          viewBox="0 0 12 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 fill-icon-color"
                        >
                          <path d="M5.4 9.5H6.6V5.9H5.4V9.5ZM6 4.7C6.17 4.7 6.3125 4.6425 6.4275 4.5275C6.5425 4.4125 6.6 4.27 6.6 4.1C6.6 3.93 6.5425 3.7875 6.4275 3.6725C6.3125 3.5575 6.17 3.5 6 3.5C5.83 3.5 5.6875 3.5575 5.5725 3.6725C5.4575 3.7875 5.4 3.93 5.4 4.1C5.4 4.27 5.4575 4.4125 5.5725 4.5275C5.6875 4.6425 5.83 4.7 6 4.7ZM6 12.5C5.17 12.5 4.39 12.3425 3.66 12.0275C2.93 11.7125 2.295 11.285 1.755 10.745C1.215 10.205 0.7875 9.57 0.4725 8.84C0.1575 8.11 0 7.33 0 6.5C0 5.67 0.1575 4.89 0.4725 4.16C0.7875 3.43 1.215 2.795 1.755 2.255C2.295 1.715 2.93 1.2875 3.66 0.9725C4.39 0.6575 5.17 0.5 6 0.5C6.83 0.5 7.61 0.6575 8.34 0.9725C9.07 1.2875 9.705 1.715 10.245 2.255C10.785 2.795 11.2125 3.43 11.5275 4.16C11.8425 4.89 12 5.67 12 6.5C12 7.33 11.8425 8.11 11.5275 8.84C11.2125 9.57 10.785 10.205 10.245 10.745C9.705 11.285 9.07 11.7125 8.34 12.0275C7.61 12.3425 6.83 12.5 6 12.5Z" />
                        </svg>
                      </span>
                    </div>

                    <p className="w-full text-xs font-normal leading-5 tracking-wider text-secondary-text">
                      Ensure that the uploaded file contains all examples in the
                      same format as the provided Demo File. You can download
                      and review the
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
              </div>
            )}
          </div>
        </div>

        {showConfirmInfoModal && (
          <ConfirmModal
            show={showConfirmInfoModal}
            setShow={setShowConfirmInfoModal}
            heading="Confirm Information Edit"
            title={"Do you want to confirm these changes?"}
            description={
              "Datasource Information will be updated after these changes."
            }
            primaryBtn="Yes, Confirm"
            primaryChange={handleInfoConfig}
            secondaryBtn="No"
            secondaryChange={() => setShowConfirmInfoModal(false)}
          />
        )}

        {showSuccessOnUploadModal && (
          <SuccessModal
            show={showSuccessOnUploadModal}
            setShow={setShowSuccessOnUploadModal}
            heading="Success Confirmation"
            title=""
            description="CSV uploaded Successfully"
            primaryBtn="Close"
            primaryChange={() => {
              setShowSuccessOnUploadModal(false);
              setEditCsv(false);
            }}
          />
        )}

        {showSuccessModal && (
          <SuccessModal
            show={showSuccessModal}
            setShow={setShowSuccessModal}
            heading="Success Confirmation"
            title={"Datasource information updated successfully!"}
            description={""}
            primaryBtn="Close"
            primaryChange={() => setShowSuccessModal(false)}
          />
        )}
      </DatasourceLayout>
    </div>
  );
};

export default SemiStructuredDatasourceDetails;
