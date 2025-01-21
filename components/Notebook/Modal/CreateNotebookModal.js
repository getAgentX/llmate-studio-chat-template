import React, { useEffect, useRef, useState } from "react";
import { useGetDatasourcesMutation } from "@/store/datasource";
import { useGetAssistantsListMutation } from "@/store/assistant";
import {
  useCreateNotebookMutation,
  useGetNotebookMutation,
  useUpdateNotebookInfoMutation,
} from "@/store/notebook";
import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/router";

const CreateNotebookModal = ({
  showModal,
  setShowModal,
  update = false,
  notebookId = null,
  fetchNotebookInfo = false,
  setNewSlug = () => {},
  setShowNotebookSuccessModal = () => {},
}) => {
  const [notebookName, setNotebookName] = useState("");
  const [notebookDescription, setNotebookDescription] = useState("");
  const [toggleDatasource, setToggleDatasource] = useState(false);
  const [toggleAssistant, setToggleAssistant] = useState(false);

  const [searchDatasource, setSearchDatasource] = useState("");
  const [datasources, setDatasources] = useState([]);
  const [selectedDatasources, setSelectedDatasources] = useState([]);

  const [searchAssistants, setSearchAssistants] = useState("");
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistants, setSelectedAssistants] = useState([]);

  const modalRef = useRef(null);
  const datasourceRef = useRef(null);
  const assistantRef = useRef(null);

  const router = useRouter();

  const [getDatasources, {}] = useGetDatasourcesMutation();
  const [getAssistantsList, {}] = useGetAssistantsListMutation();
  const [createNotebook, { isLoading: createNotebookLoading }] =
    useCreateNotebookMutation();
  const [getNotebook, {}] = useGetNotebookMutation();
  const [updateNotebookInfo, { isLoading: updateNotebookLoading }] =
    useUpdateNotebookInfoMutation();

  const debouncedDatasourceSearch = useDebounce(searchDatasource, 500);
  const debouncedAssistantSearch = useDebounce(searchAssistants, 500);

  useEffect(() => {
    getDatasources({
      skip: 0,
      limit: 100,
      sort_by: "A-Z",
      query: "",
    }).then((response) => {
      if (response.data) {
        const nonSemiStructuredDS = response.data.filter(
          (datasource) => datasource?.ds_config.ds_type !== "semi_structured"
        );

        setDatasources(nonSemiStructuredDS);
      } else {
        console.log("NO data sources found");
      }
    });
  }, [debouncedDatasourceSearch]);

  useEffect(() => {
    getAssistantsList({
      skip: 0,
      limit: 100,
      sort_by: "A-Z",
      query: "",
    }).then((response) => {
      if (response.data) {
        setAssistants(response.data);
      }
    });
  }, [debouncedAssistantSearch]);

  useEffect(() => {
    if (update && notebookId) {
      getNotebook({
        notebook_id: notebookId,
      }).then((response) => {
        if (response?.data) {
          setNotebookName(response.data.label || "");
          setNotebookDescription(response.data.description || "");
          setSelectedDatasources(response.data.datasource_ids || []);
          setSelectedAssistants(response.data.assistant_ids || []);
        }
      });
    }
  }, [update, notebookId]);

  const initialStates = () => {
    setNotebookName("");
    setNotebookDescription("");
    setToggleDatasource(false);
    setToggleAssistant(false);
    setSearchDatasource("");
    setSearchAssistants("");
    setSelectedDatasources([]);
    setSelectedAssistants([]);
  };

  const handleOutsideClick = (e) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(e.target) && // Check for clicks outside modal
      !datasourceRef.current?.contains(e.target) && // Check for clicks outside datasource dropdown
      !assistantRef.current?.contains(e.target) // Check for clicks outside assistant dropdown
    ) {
      initialStates(); // Reset everything
      setShowModal(false); // Close modal
    } else {
      // Close dropdowns if clicked inside modal but outside their respective dropdowns
      if (!datasourceRef.current?.contains(e.target)) {
        setToggleDatasource(false);
      }
      if (!assistantRef.current?.contains(e.target)) {
        setToggleAssistant(false);
      }
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showModal]);

  const handleCloseCreation = (e) => {
    if (!datasourceRef.current?.contains(e.target)) {
      setToggleDatasource(false);
    }
    if (!assistantRef.current?.contains(e.target)) {
      setToggleAssistant(false);
    }
    initialStates();
    setShowModal(false);
  };

  const handleCreate = () => {
    const notebookPayload = {
      label: notebookName,
      description: notebookDescription,
      // assistant_ids: selectedAssistants,
      // datasource_ids: selectedDatasources,
    };

    createNotebook({
      payload: notebookPayload,
    }).then((response) => {
      if (response.data) {
        setShowModal(false);
        setNewSlug(response.data.id);
        setShowNotebookSuccessModal(true);
        // router.push(`/notebook/${response.data.id}`);
      }
    });
  };

  const handleUpdate = () => {
    updateNotebookInfo({
      notebook_id: notebookId,
      payload: {
        label: notebookName,
        description: notebookDescription,
      },
    }).then((response) => {
      if (response.data === null) {
        if (update && fetchNotebookInfo) {
          fetchNotebookInfo();
          setShowNotebookSuccessModal(true);
        }

        setShowModal(false);
      }
    });
  };

  const handleDatasourceSelect = (id) => {
    setSelectedDatasources((prev) =>
      prev.includes(id)
        ? prev.filter((datasourceId) => datasourceId !== id)
        : [...prev, id]
    );
  };

  const handleAssistantSelect = (id) => {
    setSelectedAssistants((prev) =>
      prev.includes(id)
        ? prev.filter((assistantId) => assistantId !== id)
        : [...prev, id]
    );
  };

  const filteredDatasources = datasources?.filter((datasource) =>
    datasource?.name
      .toLowerCase()
      .includes(debouncedDatasourceSearch.toLowerCase())
  );

  const filteredAssistants = assistants?.filter((assistant) =>
    assistant?.name
      .toLowerCase()
      .includes(debouncedAssistantSearch.toLowerCase())
  );

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        showModal ? "" : "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-md border rounded-lg bg-dropdown-bg border-border-color font-roboto"
        ref={modalRef}
      >
        <div className="flex flex-col h-full space-y-4">
          <div className="relative flex items-center justify-between px-4 py-2 text-sm font-medium border-b text-muted border-border-color">
            <span>Create Notebook</span>

            <button
              className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer bg-background text-secondary-text hover:text-primary-text"
              onClick={handleCloseCreation}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 "
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Notebook Name Input */}
          <div className="flex flex-col px-4 space-y-2">
            <div className="text-sm font-medium tracking-wide text-muted">
              Notebook Name
            </div>

            <span className="text-xs font-normal tracking-wide text-secondary-text">
              {update
                ? "Update a name for your notebook"
                : "Give a unique name to your notebook"}
            </span>
          </div>

          <div className="w-full px-4">
            <input
              type="text"
              className="w-full h-8 px-4 text-sm font-normal border rounded-md outline-none bg-page border-input-border focus:border-input-border-focus text-input-text placeholder:text-input-placeholder"
              placeholder="Enter your notebook name here"
              value={notebookName}
              onChange={(e) => setNotebookName(e.target.value)}
            />
          </div>

          <div className="flex flex-col px-4 space-y-2">
            <div className="text-sm font-medium tracking-wide text-primary-text">
              Notebook Description
            </div>

            <span className="text-xs font-normal tracking-wide text-secondary-text">
              {update
                ? "Update a description for your notebook"
                : "Give a unique description to your notebook"}
            </span>
          </div>

          <div className="w-full px-4">
            <textarea
              type="text"
              className="w-full px-4 py-3 text-sm font-normal border rounded-md outline-none text-input-text bg-page border-input-border placeholder:text-input-placeholder focus:border-input-border-focus recent__bar h-36"
              placeholder="Enter your description here"
              value={notebookDescription}
              onChange={(e) => setNotebookDescription(e.target.value)}
            />
          </div>

          {/* Datasource Dropdown */}
          {/* <div className="flex flex-col px-2 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3"
                >
                  <path
                    d="M6 12C4.32222 12 2.90278 11.7417 1.74167 11.225C0.580556 10.7083 0 10.0778 0 9.33333V2.66667C0 1.93333 0.586111 1.30556 1.75833 0.783333C2.93056 0.261111 4.34444 0 6 0C7.65556 0 9.06944 0.261111 10.2417 0.783333C11.4139 1.30556 12 1.93333 12 2.66667V9.33333C12 10.0778 11.4194 10.7083 10.2583 11.225C9.09722 11.7417 7.67778 12 6 12ZM6 4.01667C6.98889 4.01667 7.98333 3.875 8.98333 3.59167C9.98333 3.30833 10.5444 3.00556 10.6667 2.68333C10.5444 2.36111 9.98611 2.05556 8.99167 1.76667C7.99722 1.47778 7 1.33333 6 1.33333C4.98889 1.33333 3.99722 1.475 3.025 1.75833C2.05278 2.04167 1.48889 2.35 1.33333 2.68333C1.48889 3.01667 2.05278 3.32222 3.025 3.6C3.99722 3.87778 4.98889 4.01667 6 4.01667ZM6 7.33333C6.46667 7.33333 6.91667 7.31111 7.35 7.26667C7.78333 7.22222 8.19722 7.15833 8.59167 7.075C8.98611 6.99167 9.35833 6.88889 9.70833 6.76667C10.0583 6.64444 10.3778 6.50556 10.6667 6.35V4.35C10.3778 4.50556 10.0583 4.64444 9.70833 4.76667C9.35833 4.88889 8.98611 4.99167 8.59167 5.075C8.19722 5.15833 7.78333 5.22222 7.35 5.26667C6.91667 5.31111 6.46667 5.33333 6 5.33333C5.53333 5.33333 5.07778 5.31111 4.63333 5.26667C4.18889 5.22222 3.76944 5.15833 3.375 5.075C2.98056 4.99167 2.61111 4.88889 2.26667 4.76667C1.92222 4.64444 1.61111 4.50556 1.33333 4.35V6.35C1.61111 6.50556 1.92222 6.64444 2.26667 6.76667C2.61111 6.88889 2.98056 6.99167 3.375 7.075C3.76944 7.15833 4.18889 7.22222 4.63333 7.26667C5.07778 7.31111 5.53333 7.33333 6 7.33333ZM6 10.6667C6.51111 10.6667 7.03056 10.6278 7.55833 10.55C8.08611 10.4722 8.57222 10.3694 9.01667 10.2417C9.46111 10.1139 9.83333 9.96945 10.1333 9.80833C10.4333 9.64722 10.6111 9.48333 10.6667 9.31667V7.68333C10.3778 7.83889 10.0583 7.97778 9.70833 8.1C9.35833 8.22222 8.98611 8.325 8.59167 8.40833C8.19722 8.49167 7.78333 8.55556 7.35 8.6C6.91667 8.64444 6.46667 8.66667 6 8.66667C5.53333 8.66667 5.07778 8.64444 4.63333 8.6C4.18889 8.55556 3.76944 8.49167 3.375 8.40833C2.98056 8.325 2.61111 8.22222 2.26667 8.1C1.92222 7.97778 1.61111 7.83889 1.33333 7.68333V9.33333C1.38889 9.5 1.56389 9.66111 1.85833 9.81667C2.15278 9.97222 2.52222 10.1139 2.96667 10.2417C3.41111 10.3694 3.9 10.4722 4.43333 10.55C4.96667 10.6278 5.48889 10.6667 6 10.6667Z"
                    fill="#5F6368"
                  ></path>
                </svg>
              </span>

              <div className="text-sm font-medium tracking-wide text-primary-text">
                Select Datasource
              </div>
            </div>

            <span className="text-xs font-normal tracking-wide text-white/40">
              Select as many datasources as required for your notebook. You can
              modify them later.
            </span>
          </div>

          <div
            className="relative flex flex-col w-full px-2"
            ref={datasourceRef}
          >
            <button
              type="button"
              className="cursor-pointer w-full border border-[#313236] bg-[#2A2C32] rounded-md"
              onClick={() => {
                setToggleDatasource(!toggleDatasource);
                setToggleAssistant(false);
              }}
            >
              <div className="flex items-center justify-between w-full px-2 py-2 rounded-md">
                <div className="text-xs font-normal capitalize text-white/50 line-clamp-1">
                  {selectedDatasources?.length > 0 ? (
                    <div className="flex items-center space-x-2 text-xs font-medium text-white">
                      <span>Selected</span>

                      <div className="w-4 h-4 rounded-full bg-[#295EF4]">
                        {selectedDatasources?.length}
                      </div>
                    </div>
                  ) : (
                    "Choose"
                  )}
                </div>

                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className={`w-4 h-4 ${
                      toggleDatasource
                        ? "transform rotate-180 fill-white"
                        : "fill-white/50"
                    }`}
                  >
                    <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                  </svg>
                </span>
              </div>
            </button>

            {toggleDatasource && (
              <div className=" absolute w-full flex flex-col bg-[#2A2C32] rounded-md mt-1 z-50">
                <div className="sticky top-0 w-[97%]   bg-[#303237]">
                  <input
                    type="text"
                    className="w-full py-1.5 pl-10 text-sm text-white bg-transparent border rounded-md outline-none border-border placeholder:text-white/50"
                    placeholder="Search datasource"
                    value={searchDatasource}
                    onChange={(e) => setSearchDatasource(e.target.value)}
                    autoFocus={true}
                  />

                  <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </span>

                  {searchDatasource !== "" && (
                    <span
                      className="absolute z-50 flex items-center justify-center w-5 h-5 -translate-y-1/2 rounded-full cursor-pointer bg-border top-1/2"
                      onClick={() => setSearchDatasource("")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  )}
                </div>

                {filteredDatasources?.length > 0 && (
                  <ul className="flex shadow-lg flex-col bg-[#2A2C32] rounded-br-md rounded-bl-md overflow-hidden overflow-y-auto min-h-28 max-h-28 h-full z-10 divide-y-2 divide-[#2D3035] absolute top-[100%] right-3.5 left-0 recent__bar border-2 border-[#313236]">
                    {filteredDatasources?.map((datasource, index) => {
                      const isSelected = selectedDatasources.includes(
                        datasource.id
                      );

                      return (
                        <li
                          className={`py-2.5 px-2 flex items-center justify-between text-xs font-normal cursor-pointer text-white hover:bg-[#3c3e42]`}
                          key={index}
                          onClick={() => handleDatasourceSelect(datasource.id)}
                        >
                          <div className="line-clamp-1">{datasource.name}</div>

                          <div>
                            {isSelected || (
                              <div className="w-3 h-3 rounded-full border border-[#3E3E3E]"></div>
                            )}

                            {isSelected && (
                              <span className="flex items-center justify-center">
                                <svg
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-3 h-3"
                                >
                                  <rect
                                    width="12"
                                    height="12"
                                    rx="6"
                                    fill="#295EF4"
                                  />
                                  <g clipPath="url(#clip0_2560_10948)">
                                    <path
                                      d="M4.9373 8.16725C4.76698 8.16732 4.60364 8.09962 4.48331 7.97909L3.11077 6.60705C2.96308 6.45932 2.96308 6.21984 3.11077 6.07211C3.2585 5.92442 3.49798 5.92442 3.64571 6.07211L4.9373 7.36369L8.35429 3.9467C8.50202 3.79902 8.7415 3.79902 8.88924 3.9467C9.03692 4.09444 9.03692 4.33391 8.88924 4.48165L5.39128 7.97909C5.27095 8.09962 5.10761 8.16732 4.9373 8.16725Z"
                                      fill="white"
                                    />
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_2560_10948)">
                                      <rect
                                        width="6"
                                        height="6"
                                        fill="white"
                                        transform="translate(3 3)"
                                      />
                                    </clipPath>
                                  </defs>
                                </svg>
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {filteredDatasources?.length === 0 && (
                  <div className="bg-[#2A2C32] shadow-lg text-xs border-2 border-[#313236] font-medium min-h-16 w-full tracking-wider text-white/50 rounded-br-md rounded-bl-md flex justify-center items-center">
                    No datasource available
                  </div>
                )}
              </div>
            )}
          </div> */}

          {/* Assistants Dropdown */}
          {/* <div className="flex flex-col px-2 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                >
                  <path
                    d="M12.3333 6H3.66667C3.29848 6 3 6.29848 3 6.66667V13.3333C3 13.7015 3.29848 14 3.66667 14H12.3333C12.7015 14 13 13.7015 13 13.3333V6.66667C13 6.29848 12.7015 6 12.3333 6Z"
                    stroke="#8D8E8F"
                  ></path>
                  <path
                    d="M5.66667 9.33333C6.03486 9.33333 6.33333 9.03486 6.33333 8.66667C6.33333 8.29848 6.03486 8 5.66667 8C5.29848 8 5 8.29848 5 8.66667C5 9.03486 5.29848 9.33333 5.66667 9.33333Z"
                    fill="#8D8E8F"
                  ></path>
                  <path
                    d="M10.3327 9.33333C10.7009 9.33333 10.9993 9.03486 10.9993 8.66667C10.9993 8.29848 10.7009 8 10.3327 8C9.96449 8 9.66602 8.29848 9.66602 8.66667C9.66602 9.03486 9.96449 9.33333 10.3327 9.33333Z"
                    fill="#8D8E8F"
                  ></path>
                  <path
                    d="M6.66667 10.668C6.29847 10.668 6 10.9664 6 11.3346C6 11.7028 6.29847 12.0013 6.66667 12.0013V10.668ZM9.33333 12.0013C9.70153 12.0013 10 11.7028 10 11.3346C10 10.9664 9.70153 10.668 9.33333 10.668V12.0013ZM6.66667 12.0013H9.33333V10.668H6.66667V12.0013Z"
                    fill="#8D8E8F"
                  ></path>
                  <path
                    d="M8 3.33203V5.9987"
                    stroke="#8D8E8F"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M1.33398 8.66797V11.3346"
                    stroke="#8D8E8F"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M14.666 8.66797V11.3346"
                    stroke="#8D8E8F"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M8.00065 3.33333C8.36884 3.33333 8.66732 3.03486 8.66732 2.66667C8.66732 2.29848 8.36884 2 8.00065 2C7.63246 2 7.33398 2.29848 7.33398 2.66667C7.33398 3.03486 7.63246 3.33333 8.00065 3.33333Z"
                    stroke="#8D8E8F"
                  ></path>
                </svg>
              </span>

              <div className="text-sm font-medium tracking-wide text-primary-text">
                Select Assistants
              </div>
            </div>

            <span className="text-xs font-normal tracking-wide text-white/40">
              Select as many assistants as required for your notebook. You can
              modify them later.
            </span>
          </div>

          <div
            className="relative flex flex-col w-full px-2"
            ref={assistantRef}
          >
            <button
              type="button"
              className="cursor-pointer w-full border border-[#313236] bg-[#2A2C32] rounded-md"
              onClick={() => {
                setToggleAssistant(!toggleAssistant);
                setToggleDatasource(false);
              }}
            >
              <div className="flex items-center justify-between w-full px-2 py-2 rounded-md">
                <div className="text-xs font-normal capitalize text-white/50 line-clamp-1">
                  {selectedAssistants?.length > 0 ? (
                    <div className="flex items-center space-x-2 text-xs font-medium text-white">
                      <span>Selected</span>

                      <div className="w-4 h-4 rounded-full bg-[#295EF4]">
                        {selectedAssistants?.length}
                      </div>
                    </div>
                  ) : (
                    "Choose"
                  )}
                </div>

                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className={`w-4 h-4 ${
                      toggleAssistant
                        ? "transform rotate-180 fill-white"
                        : "fill-white/50"
                    }`}
                  >
                    <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                  </svg>
                </span>
              </div>
            </button>

            {toggleAssistant && (
              <div className="absolute w-full flex flex-col bg-[#2A2C32] rounded-md mt-1">
                <div className="sticky top-0 w-[98%] bg-[#303237] ">
                  <input
                    type="text"
                    className="w-full  py-1.5 pl-10 pr-10 text-sm text-white bg-transparent border rounded-md outline-none border-border placeholder:text-white/50"
                    placeholder="Search assistant"
                    value={searchAssistants}
                    onChange={(e) => setSearchAssistants(e.target.value)}
                    autoFocus={true}
                  />

                  <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </span>

                  {searchAssistants !== "" && (
                    <span
                      className="absolute flex items-center justify-center w-5 h-5 -translate-y-1/2 rounded-full cursor-pointer bg-border top-1/2 right-2"
                      onClick={() => setSearchAssistants("")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  )}
                </div>

                {filteredAssistants?.length > 0 && (
                  <ul className="flex flex-col bg-[#2A2C32] shadow-lg rounded-br-md rounded-bl-md z-10 divide-y-2 divide-[#2D3035] absolute top-[100%] right-2 left-0 overflow-hidden overflow-y-auto min-h-28 max-h-28 h-full recent__bar border-2 border-[#313236]">
                    {filteredAssistants?.map((assistant, index) => {
                      const isSelected = selectedAssistants.includes(
                        assistant.id
                      );

                      return (
                        <li
                          className={`py-2.5 px-2 flex items-center justify-between text-xs font-normal cursor-pointer text-white hover:bg-[#3c3e42]`}
                          key={index}
                          onClick={() => handleAssistantSelect(assistant.id)}
                        >
                          <div className="line-clamp-1">{assistant.name}</div>

                          <div>
                            {isSelected || (
                              <div className="w-3 h-3 rounded-full border border-[#3E3E3E]"></div>
                            )}

                            {isSelected && (
                              <span className="flex items-center justify-center">
                                <svg
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-3 h-3"
                                >
                                  <rect
                                    width="12"
                                    height="12"
                                    rx="6"
                                    fill="#295EF4"
                                  />
                                  <g clipPath="url(#clip0_2560_10948)">
                                    <path
                                      d="M4.9373 8.16725C4.76698 8.16732 4.60364 8.09962 4.48331 7.97909L3.11077 6.60705C2.96308 6.45932 2.96308 6.21984 3.11077 6.07211C3.2585 5.92442 3.49798 5.92442 3.64571 6.07211L4.9373 7.36369L8.35429 3.9467C8.50202 3.79902 8.7415 3.79902 8.88924 3.9467C9.03692 4.09444 9.03692 4.33391 8.88924 4.48165L5.39128 7.97909C5.27095 8.09962 5.10761 8.16732 4.9373 8.16725Z"
                                      fill="white"
                                    />
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_2560_10948)">
                                      <rect
                                        width="6"
                                        height="6"
                                        fill="white"
                                        transform="translate(3 3)"
                                      />
                                    </clipPath>
                                  </defs>
                                </svg>
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {filteredAssistants?.length === 0 && (
                  <div className="bg-[#2A2C32] shadow-lg text-xs font-medium tracking-wider text-white/50 min-h-16 w-full border-2 border-[#313236] rounded-br-md rounded-bl-md flex justify-center items-center">
                    No assistant available
                  </div>
                )}
              </div>
            )}
          </div> */}

          <div className="flex items-center justify-end w-full px-4 py-2 space-x-4 border-t border-border-color">
            <button
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide border rounded-md w-fit text-btn-primary-outline-text hover:text-btn-primary-text group border-btn-primary-outline hover:bg-btn-primary-outline-bg"
              onClick={handleCloseCreation}
            >
              Cancel
            </button>

            <button
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
              onClick={update ? handleUpdate : handleCreate}
              disabled={
                notebookName === "" ||
                notebookDescription === "" ||
                createNotebookLoading ||
                updateNotebookLoading
              }
            >
              {createNotebookLoading && (
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

              {updateNotebookLoading && (
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

              <span>{update ? "Save" : "Create"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNotebookModal;
