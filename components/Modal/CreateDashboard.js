import React, { useEffect, useRef, useState } from "react";
import {
  useCreateNewDashboardMutation,
  useUpdateDashboardInfoMutation,
} from "@/store/dashboard";
import { useRouter } from "next/router";

const CreateDashboard = ({
  createDashboard,
  setCreateDashboard,
  update = false,
  name = "",
  desc = "",
  refetch = () => {},
  listFetch = null,
  setNewDashboardSlug = () => {},
  setShowDashboardSuccessModal = () => {},
}) => {
  const [dashboardName, setDashboardName] = useState("");
  const [dashboardDescription, setDashboardDescription] = useState("");

  useEffect(() => {
    setDashboardName(name);
    setDashboardDescription(desc);
  }, [name, desc]);

  const modalRef = useRef(null);
  const router = useRouter();

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setDashboardName("");
      setDashboardDescription("");
      setCreateDashboard(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleCloseCreation = () => {
    setDashboardName("");
    setDashboardDescription("");
    setCreateDashboard(false);
  };

  const [createNewDashboard, {}] = useCreateNewDashboardMutation();
  const [updateDashboardInfo, {}] = useUpdateDashboardInfoMutation();

  const handleCreate = () => {
    createNewDashboard({
      payload: {
        label: dashboardName,
        description: dashboardDescription,
      },
    }).then((response) => {
      if (response.data) {
        // if (listFetch) {
        //   router.push(`/dashboard/${response.data.id}`);
        // } else {
        //   refetch();
        // }
        refetch();
        setNewDashboardSlug(response.data.id);
        setDashboardName("");
        setDashboardDescription("");
        setCreateDashboard(false);
        setShowDashboardSuccessModal(true);
      }
    });
  };

  const handleUpdate = () => {
    if (router.query.slug) {
      updateDashboardInfo({
        dashboard_id: router.query.slug,
        payload: {
          label: dashboardName,
          description: dashboardDescription,
        },
      }).then((response) => {
        if (response) {
          refetch();
          setDashboardName("");
          console.log("neww ");
          setDashboardDescription("");
          setCreateDashboard(false);
          setShowDashboardSuccessModal(true);
        }
      });
    }
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        createDashboard || "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-md border rounded-lg bg-dropdown-bg border-border-color font-roboto"
        ref={modalRef}
      >
        <div className="flex flex-col h-full space-y-4">
          <div className="relative flex items-center justify-between px-4 py-2 text-sm font-medium border-b text-muted border-border-color">
            {update && <span>Update Dashboard</span>}
            {update || <span>Create Dashboard</span>}

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
              Dashboard Name
            </div>

            {update && (
              <span className="text-xs font-normal tracking-wide text-secondary-text">
                Update a name for your dashboard
              </span>
            )}

            {update || (
              <span className="text-xs font-normal tracking-wide text-secondary-text">
                Enter a unique name for your new dashboard
              </span>
            )}
          </div>

          <div className="w-full px-4">
            <input
              type="text"
              className="w-full px-4 py-3 text-sm font-normal border rounded-md outline-none text-input-text bg-page border-input-border placeholder:text-input-placeholder focus:border-input-border-focus"
              placeholder="Enter your dashboard name here"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
            />
          </div>

          <div className="px-4 text-sm font-medium tracking-wide text-muted">
            Dashboard Description
          </div>

          <div className="w-full px-4">
            <textarea
              type="text"
              className="w-full px-4 py-3 text-sm font-normal border rounded-md outline-none text-input-text bg-page border-input-border placeholder:text-input-placeholder focus:border-input-border-focus recent__bar h-36"
              placeholder="Enter your description here"
              value={dashboardDescription}
              onChange={(e) => setDashboardDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end w-full px-4 py-2 space-x-4 border-t border-border-color">
            <button
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide border rounded-md w-fit text-btn-primary-outline-text hover:text-btn-primary-text group border-btn-primary-outline hover:bg-btn-primary-outline-bg"
              onClick={() => {
                setDashboardName("");
                setDashboardDescription("");
                setCreateDashboard(false);
              }}
            >
              Cancel
            </button>

            {update && (
              <button
                className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                onClick={handleUpdate}
                disabled={
                  dashboardName === name && dashboardDescription === desc
                }
              >
                Save
              </button>
            )}

            {update || (
              <button
                className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
                onClick={handleCreate}
                disabled={dashboardName === "" ? true : false}
              >
                Create
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDashboard;
