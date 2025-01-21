import React, { useEffect, useRef, useState } from "react";
import { useUpdateOrganizationNameMutation } from "@/store/organization";
import { useDispatch } from "react-redux";
import { setCurrentOrganization } from "@/store/current_organization";
import SuccessModal from "./SuccessModal";

const UpdateWorkspaceModal = ({
  showWorkspaceModal,
  setShowWorkspaceModal,
  data,
  refetch,
}) => {
  const [name, setName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const workspaceRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      setName(data.displayName);
    }
  }, [data]);

  const [updateOrganizationName, {}] = useUpdateOrganizationNameMutation();

  const handleOutsideClick = (e) => {
    if (workspaceRef.current && !workspaceRef.current.contains(e.target)) {
      setShowWorkspaceModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleUpdateName = () => {
    if (name !== "") {
      updateOrganizationName({
        payload: {
          name: name,
        },
        organization_id: data.id,
      }).then((response) => {
        if (response) {
          dispatch(
            setCurrentOrganization({
              id: data.id,
              name: name,
            })
          );
          setName("");
          refetch();
          setShowWorkspaceModal(false);
          setShowSuccessModal(true);
        }
      });
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
          showWorkspaceModal || "hidden"
        }`}
      >
        <div
          className="relative flex flex-col w-full max-w-lg  rounded-lg bg-dropdown-bg border border-dropdown-border"
          ref={workspaceRef}
        >
          <div className="relative flex items-center justify-between px-4 py-3 text-sm font-medium text-primary-text border-b border-border">
            <span>Update Workspace</span>

            <span
              className="absolute flex items-center justify-center w-6 h-6 -translate-y-1/2 rounded-full cursor-pointer top-1/2 right-2 bg-icon-selected-bg"
              onClick={() => setShowWorkspaceModal(false)}
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

          <div className="flex flex-col space-y-3 py-2">
            <div className="flex flex-col space-y-2 px-4 ">
              <p className="text-sm font-normal text-primary-text">
                Workspace Name
              </p>

              <input
                type="text"
                className="w-full h-8 px-4 text-sm font-normal border rounded-md outline-none bg-page border-input-border focus:border-input-border-focus text-input-text placeholder:text-input-placeholder"
                value={name}
                placeholder="Update your workspace name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end w-full px-4 py-2 border-t border-dropdown-border space-x-4">
              <button
                className="h-8 px-3 font-medium rounded-md text-btn-secondary-text bg-btn-secondary-bg text-xs hover:bg-btn-secondary-hover"
                onClick={() => {
                  setShowWorkspaceModal(false);
                  setName("");
                }}
              >
                Cancel
              </button>

              <button
                className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                onClick={handleUpdateName}
                disabled={data?.displayName !== name ? false : true}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        show={showSuccessModal}
        setShow={setShowSuccessModal}
        heading="Success Confirmation"
        title={""}
        description="Workspace Updated Successfully"
        primaryBtn="Close"
        primaryChange={() => setShowSuccessModal(false)}
      />
    </>
  );
};

export default UpdateWorkspaceModal;
