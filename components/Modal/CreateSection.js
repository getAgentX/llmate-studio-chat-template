import React, { useEffect, useRef, useState } from "react";
import {
  useCreateNewSectionMutation,
  useUpdateSectionsInfoMutation,
} from "@/store/dashboard";
import { useRouter } from "next/router";

const CreateSection = ({
  createSection,
  setCreateSection,
  dashboardId,
  refetch = () => {},
  update = false,
  name = "",
  sectionId = null,
  refetchDashboard = () => {},
  setShowSaveSectionSuccess = () => {},
  getSectionList = false,
  setNewSectionSlug = () => {},
  setShowSectionSuccessConfirm = () => {},
}) => {
  const [sectionName, setSectionName] = useState("");
  const router = useRouter();

  useEffect(() => {
    setSectionName(name);
  }, [name]);

  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setSectionName("");
      setCreateSection(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleCloseCreation = () => {
    setSectionName("");
    setCreateSection(false);
  };

  const [createNewSection, { isLoading: sectionCreateLoading }] =
    useCreateNewSectionMutation();
  const [updateSectionsInfo, {}] = useUpdateSectionsInfoMutation();

  const handleCreate = () => {
    createNewSection({
      dashboard_id: dashboardId,
      payload: {
        label: sectionName,
      },
    }).then((response) => {
      if (response) {
        refetch(dashboardId);
        setSectionName("");
        setShowSaveSectionSuccess(true);
        setNewSectionSlug(response.data.id);
        setShowSectionSuccessConfirm(true);
        setCreateSection(false);

        if (getSectionList) {
          getSectionList(dashboardId);
        } else {
          router.push(`/dashboard/${router.query.slug}/s/${response.data.id}`);
        }
      }
    });
  };

  const handleUpdate = () => {
    if (dashboardId && sectionId) {
      updateSectionsInfo({
        dashboard_id: dashboardId,
        section_id: sectionId,
        payload: {
          label: sectionName,
        },
      }).then((response) => {
        if (response) {
          if (refetchDashboard) {
            refetchDashboard(dashboardId);
          } else {
            refetch();
          }
          setSectionName("");
          setCreateSection(false);
        }
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (sectionName !== "") {
        handleCreate();
      }
    }
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        createSection || "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-md border rounded-lg bg-dropdown-bg border-border-color"
        ref={modalRef}
      >
        <div className="flex flex-col h-full space-y-2">
          <div className="relative flex items-center justify-between px-4 py-2 text-sm font-medium border-b text-muted border-dropdown-border">
            {update ? <span>Update Section</span> : <span>Create Section</span>}

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
                className="w-4 h-4 fill-btn-primary-outline-icon hover:text-primary-text"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </span>
          </div>

          <div className="flex flex-col px-4 space-y-2">
            <div className="text-sm font-medium tracking-wide text-muted">
              Section Name
            </div>

            {update ? (
              <span className="text-xs font-normal tracking-wide text-secondary-text">
                Update a name for your section
              </span>
            ) : (
              <span className="text-xs font-normal tracking-wide text-secondary-text">
                Enter a unique name for your new section
              </span>
            )}
          </div>

          <div className="w-full px-4 pb-2">
            <input
              type="text"
              className="w-full h-8 px-4 text-sm font-normal border rounded-md outline-none bg-page border-input-border focus:border-input-border-focus text-input-text placeholder:text-input-placeholder"
              placeholder="Enter a unique name for your section"
              value={sectionName ? sectionName : update ? update : ""}
              onChange={(e) => setSectionName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="flex items-center justify-end w-full px-4 py-2 space-x-4 border-t border-dropdown-border">
            <button
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide border rounded-md w-fit text-btn-primary-outline-text hover:text-btn-primary-text group border-btn-primary-outline hover:bg-btn-primary-outline-bg"
              onClick={() => setCreateSection(false)}
            >
              Cancel
            </button>

            {update ? (
              <button
                className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
                onClick={handleUpdate}
                disabled={sectionName === "" ? true : false}
              >
                Save
              </button>
            ) : (
              <button
                className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
                onClick={handleCreate}
                disabled={
                  sectionName === "" ? true : false || sectionCreateLoading
                }
              >
                {sectionCreateLoading && (
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="w-3.5 h-3.5 animate-spin text-white fill-[#295EF4]"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>

                    <span className="sr-only">Loading...</span>
                  </div>
                )}

                <span>Create</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSection;
