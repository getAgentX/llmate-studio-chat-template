import {
  useAddWidgetFromDatasourceRunMutation,
  useGetDashboardListMutation,
  useGetSectionsMutation,
} from "@/store/dashboard";
import React, { useEffect, useRef, useState } from "react";
import CreateDashboard from "../Modal/CreateDashboard";
import CreateSection from "../Modal/CreateSection";
import CreateWidget from "../Modal/CreateWidget";
import SuccessModal from "../Modal/SuccessModal";

const FinetuningWidget = ({ eventId, runid }) => {
  const [toggleDashboard, setToggleDashboard] = useState(false);
  const [toggleSection, setToggleSection] = useState(false);
  const [createDashboard, setCreateDashboard] = useState(false);
  const [createSection, setCreateSection] = useState(false);
  const [createWidget, setCreateWidget] = useState(false);
  const [currentDashboardId, setCurrentDashboardId] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const dashboardRef = useRef(null);
  const sectionRef = useRef(null);

  const [
    getDashboardList,
    { data: fetchedDashboards, isLoading, refetch: refetchDashboard },
  ] = useGetDashboardListMutation();

  useEffect(() => {
    getDashboardList({
      skip: 0,
      limit: 100,
    });
  }, []);

  const [getSections, { data: fetchedSections, isLoading: isLoadingSection }] =
    useGetSectionsMutation();

  const [addWidgetFromDatasourceRun, {}] =
    useAddWidgetFromDatasourceRunMutation();

  const handleOutsideClick = (e) => {
    if (!createDashboard) {
      if (dashboardRef.current && sectionRef.current) {
        if (sectionRef.current && !sectionRef.current.contains(e.target)) {
          setToggleSection(false);
        }
      } else {
        if (dashboardRef.current && !dashboardRef.current.contains(e.target)) {
          setToggleDashboard(false);
        }

        if (sectionRef.current && !sectionRef.current.contains(e.target)) {
          setToggleSection(false);
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [createDashboard]);

  const handleOpenDashboard = (state) => {
    if (state) {
      setToggleDashboard(true);
    }

    if (!state) {
      setToggleDashboard(false);
      setToggleSection(false);
    }
  };

  const handleDashboard = (dashboard_id) => {
    setCurrentDashboardId(dashboard_id);

    getSections({ dashboard_id: dashboard_id }).then((response) => {
      if (response.data) {
        setToggleSection(true);
      }
    });
  };

  const handleWidget = (section_id) => {
    setCurrentSectionId(section_id);
    setCreateWidget(true);
  };

  const handleCreate = (widgetName) => {
    const payload = {
      datasource_run_id: runid,
      event_id: eventId,
      label: widgetName,
    };

    addWidgetFromDatasourceRun({
      dashboard_id: currentDashboardId,
      section_id: currentSectionId,
      payload: payload,
    }).then((response) => {
      if (response) {
        setCreateWidget(false);
        setShowSuccessModal(true);
      } else {
        setCreateWidget(false);
      }
    });
  };

  return (
    <div className="relative flex justify-end">
      <div className="relative">
        {/* <span
          className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer bg-[#1B1D1F] hover:bg-border ${
            toggleDashboard
              ? "bg-border fill-white"
              : "fill-[#626262] hover:fill-muted"
          }`}
          onClick={() => handleOpenDashboard(!toggleDashboard)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            className="w-4 h-4"
          >
            <path d="M235.32,81.37,174.63,20.69a16,16,0,0,0-22.63,0L98.37,74.49c-10.66-3.34-35-7.37-60.4,13.14a16,16,0,0,0-1.29,23.78L85,159.71,42.34,202.34a8,8,0,0,0,11.32,11.32L96.29,171l48.29,48.29A16,16,0,0,0,155.9,224c.38,0,.75,0,1.13,0a15.93,15.93,0,0,0,11.64-6.33c19.64-26.1,17.75-47.32,13.19-60L235.33,104A16,16,0,0,0,235.32,81.37ZM224,92.69h0l-57.27,57.46a8,8,0,0,0-1.49,9.22c9.46,18.93-1.8,38.59-9.34,48.62L48,100.08c12.08-9.74,23.64-12.31,32.48-12.31A40.13,40.13,0,0,1,96.81,91a8,8,0,0,0,9.25-1.51L163.32,32,224,92.68Z"></path>
          </svg>
        </span> */}

        <div
          className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-white/50 hover:text-white group"
          onClick={() => handleOpenDashboard(!toggleDashboard)}
        >
          <span className="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="w-4 h-4 fill-icon-color group-hover:fill-icon-color-hover"
            >
              <path d="M235.32,81.37,174.63,20.69a16,16,0,0,0-22.63,0L98.37,74.49c-10.66-3.34-35-7.37-60.4,13.14a16,16,0,0,0-1.29,23.78L85,159.71,42.34,202.34a8,8,0,0,0,11.32,11.32L96.29,171l48.29,48.29A16,16,0,0,0,155.9,224c.38,0,.75,0,1.13,0a15.93,15.93,0,0,0,11.64-6.33c19.64-26.1,17.75-47.32,13.19-60L235.33,104A16,16,0,0,0,235.32,81.37ZM224,92.69h0l-57.27,57.46a8,8,0,0,0-1.49,9.22c9.46,18.93-1.8,38.59-9.34,48.62L48,100.08c12.08-9.74,23.64-12.31,32.48-12.31A40.13,40.13,0,0,1,96.81,91a8,8,0,0,0,9.25-1.51L163.32,32,224,92.68Z"></path>
            </svg>
          </span>

          <span>Add to dashboard</span>
        </div>

        {toggleDashboard && (
          <div
            className="absolute top-8 right-6 h-64 w-[300px] rounded-md bg-[#383A40] z-50 shadow-sm"
            ref={dashboardRef}
          >
            <div className="flex flex-col h-full space-y-2">
              <div className="flex items-center justify-center px-2 py-3 text-sm font-medium border-b border-[#46494F] text-white">
                Add a Dashboard
              </div>

              <div className="flex flex-col flex-1 space-y-2 overflow-y-auto recent__bar">
                <div className="px-2 text-xs text-white/40">
                  Select a Dashboard
                </div>

                <div className="flex-1 overflow-y-auto recent__bar">
                  <ul className="flex flex-col h-full px-2 space-y-1 text-xs font-normal text-muted">
                    {fetchedDashboards?.map((item, index) => {
                      return (
                        <li
                          className={`flex items-center justify-between px-2 py-2 bg-transparent rounded-md hover:bg-[#1b1c1d] cursor-pointer`}
                          onClick={() => handleDashboard(item._id)}
                          key={index}
                        >
                          <span>{item.label}</span>
                          <span className="flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-3 h-3 text-muted"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {fetchedDashboards?.length > 0 || (
                    <div className="flex items-center justify-center w-full h-full text-xs font-normal text-white/40">
                      No Dashboard Added
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex items-center justify-center w-full h-full">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-6 h-6 animate-spin text-border fill-[#295EF4]"
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
                    </div>
                  )}
                </div>
              </div>

              <div className="px-2 pb-2">
                <button
                  className="flex items-center justify-center w-full py-2 space-x-2 text-sm font-medium rounded-md bg-secondary text-muted"
                  onClick={() => setCreateDashboard(true)}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-muted"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </span>
                  <span>New Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {toggleSection && (
          <div
            className="absolute top-24 right-[322px] h-64 w-[300px] rounded-md bg-[#383A40] z-50 shadow-sm shadow_right"
            ref={sectionRef}
          >
            <div className="flex flex-col h-full space-y-2">
              <div className="flex flex-col flex-1 space-y-2 overflow-y-auto recent__bar">
                <div className="px-2 pt-2 text-xs text-white/40">
                  Select a Section
                </div>

                <div className="flex-1 overflow-y-auto recent__bar">
                  {fetchedSections?.length > 0 && (
                    <ul className="flex flex-col h-full px-2 space-y-1 text-xs font-normal text-muted">
                      {fetchedSections?.map((item, index) => {
                        return (
                          <li
                            className="flex items-center justify-between px-2 py-1 h-9 group bg-transparent rounded-md hover:bg-[#1b1c1d] cursor-pointer"
                            key={index}
                          >
                            <span>{item.label}</span>

                            <span
                              className="group-hover:flex hidden items-center justify-center rounded-md bg-[#3C3D44] px-4 py-1 text-xs font-medium tracking-wide"
                              onClick={() => handleWidget(item.id)}
                            >
                              Add
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {fetchedSections?.length > 0 || (
                    <div className="flex items-center justify-center w-full h-full text-xs font-normal text-white/40">
                      No Section Added
                    </div>
                  )}

                  {isLoadingSection && (
                    <div className="flex items-center justify-center w-full h-full">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-6 h-6 animate-spin text-border fill-[#295EF4]"
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
                    </div>
                  )}
                </div>
              </div>

              <div className="px-2 pb-2">
                <button
                  className="flex items-center justify-center w-full py-2 space-x-2 text-sm font-medium rounded-md bg-secondary text-muted"
                  onClick={() => setCreateSection(true)}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-muted"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </span>
                  <span>New Section</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <CreateDashboard
          createDashboard={createDashboard}
          setCreateDashboard={setCreateDashboard}
          refetch={getDashboardList}
        />

        <CreateSection
          createSection={createSection}
          setCreateSection={setCreateSection}
          dashboardId={currentDashboardId}
          refetch={getDashboardList}
        />

        <CreateWidget
          createWidget={createWidget}
          setCreateWidget={setCreateWidget}
          handleCreate={handleCreate}
        />

        <SuccessModal
          show={showSuccessModal}
          setShow={setShowSuccessModal}
          heading="Success Confirmation"
          title={""}
          description="Widget Created Successfully"
          primaryBtn="Close"
          primaryChange={() => setShowSuccessModal(false)}
        />
      </div>
    </div>
  );
};

export default FinetuningWidget;
