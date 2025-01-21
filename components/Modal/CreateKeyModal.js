import React, { useEffect, useRef, useState } from "react";
import Loader from "../loader/Loader";
import {
  useCreateApiUserMutation,
  useUpdateApiKeyLabelMutation,
} from "@/store/apiuser";

const CreateKeyModal = ({
  showModal,
  setShowModal,
  setShowSuccessModal,
  refetchList,
  update = false,
  userKey = null,
}) => {
  const [name, setName] = useState("");
  const [showError, setShowError] = useState(false);
  const modalRef = useRef(null);

  const [createApiUser, { data, isLoading, error }] =
    useCreateApiUserMutation();

  const [updateApiKeyLabel, { isLoading: isUpdateApiLoading }] =
    useUpdateApiKeyLabelMutation();

  useEffect(() => {
    if (userKey) {
      setName(userKey?.label);
    } else {
      setName("");
    }
  }, [userKey]);

  const handleCreateKey = () => {
    createApiUser({
      payload: {
        label: name,
      },
    }).then((response) => {
      if (response.data) {
        setName("");
        refetchList();
        setShowSuccessModal(true);
        setShowModal(false);
      } else {
        setShowError(true);
      }
    });
  };

  const handleUpdateApi = () => {
    if (userKey) {
      updateApiKeyLabel({
        api_user_id: userKey.id,
        payload: {
          label: name,
        },
      }).then((response) => {
        if (response.data === null) {
          setName("");
          refetchList();
          setShowSuccessModal(true);
          setShowModal(false);
        } else {
          setShowError(true);
        }
      });
    }
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setName("");
      setShowModal(false);
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
        showModal || "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-md border rounded-lg bg-dropdown-bg border-border-color"
        ref={modalRef}
      >
        <div className="relative flex items-center justify-between px-4 py-3 text-sm font-medium border-b border-border ">
          <div className="flex items-center justify-center text-sm font-medium tracking-wider text-primary-text ">
            Create an API Key
          </div>

          <span
            className="absolute flex items-center justify-center w-6 h-6 -translate-y-1/2 rounded-full cursor-pointer top-1/2 right-2 bg-background"
            onClick={() => {
              setName("");
              setShowModal(false);
            }}
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

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col px-4 mt-4 space-y-4">
            <p className="text-sm font-normal text-primary-text">
              API Key Name
            </p>

            <input
              type="text"
              className="w-full h-8 px-4 text-sm font-normal border rounded-md outline-none bg-page border-input-border focus:border-input-border-focus text-input-text placeholder:text-input-placeholder"
              value={name}
              placeholder="Give your API key a name"
              onChange={(e) => setName(e.target.value)}
            />

            {showError && error?.data?.message !== undefined && (
              <p className="text-sm text-red-500">{error?.data?.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end w-full h-12 px-4 border-t border-border-color">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide border rounded-md w-fit text-btn-primary-outline-text hover:text-btn-primary-text group border-btn-primary-outline hover:bg-btn-primary-outline-bg"
                onClick={() => {
                  setName("");
                }}
              >
                Close
              </button>

              {update ? (
                <button
                  type="button"
                  className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
                  disabled={!name || isUpdateApiLoading}
                  onClick={handleUpdateApi}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-x-2">
                      <Loader />
                      <span>Updating</span>
                    </div>
                  ) : (
                    "Update"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
                  disabled={!name || isLoading}
                  onClick={handleCreateKey}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-x-2">
                      <Loader />
                      <span>Creating</span>
                    </div>
                  ) : (
                    "Create"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateKeyModal;
