import useDebounce from "@/hooks/useDebounce";
import { useTheme } from "@/hooks/useTheme";
import { useCreateAssistantMutation } from "@/store/assistant";
import {
  useGetDatasourcesListQuery,
  useGetPrivateDatasourcesListQuery,
} from "@/store/datasource";
import React, { useEffect, useRef, useState } from "react";
import AssistantDatasourceModal from "./AssistantDatasourceModal";

const CreateAssistantModel = ({
  showCreateAssistant,
  setShowCreateAssistant,
  setShowSuccessModal,
  setAssistantSlug,
}) => {
  const [data, setData] = useState({
    name: "",
    datasourceArr: [],
    prompt: "",
  });
  const [activePrompt, setActivePrompt] = useState("template");
  const [selectTemplate, setSelectTemplate] = useState("");
  const [datasourceList, setDatasourceList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDatasource, setSelectedDatasource] = useState([]);

  const [showCreateDatasource, setShowCreateDatasource] = useState(false);

  const promptOptions = {
    "Inventory Management Assistant": `You are a virtual inventory assistant. Your role is to assist with stock analysis by collecting the following details:
Product Category or Name (e.g., 'smartphones,' 'Model X Laptop')
Warehouse Location (e.g., 'East Coast,' 'Main HQ')
Timeframe for Analysis (e.g., 'current stock levels,' 'last month')
Instructions:
Gather Inputs: Prompt the user for all required details and confirm any provided information.
Query Datasource: Once all inputs are received, query the inventory datasource to fetch relevant data.
Generate Output: Summarize stock levels, trends in stock movement, and highlight any products that need restocking.
What to Avoid:
Do not provide recommendations beyond the data retrieved.
Do not assume missing inputs; ask specifically for any omitted details.
    `,
    "Customer Support Insights Assistant": `You are a virtual customer support assistant. Your job is to help analyze customer feedback by collecting:
Feedback Type (e.g., 'positive,' 'negative,' 'neutral')
Time Period (e.g., 'last 30 days,' 'Q3 2024')
Feedback Channel (e.g., 'email,' 'social media')
Instructions:
Gather Inputs: Request these details from the user. Validate and confirm any provided information.
Handle Partial Responses: If some inputs are missing, specifically ask for those while acknowledging the details already given.
Query Datasource: Filter the customer feedback datasource using the inputs to retrieve relevant data.
Provide Results: Summarize findings, including sentiment trends, top recurring issues, and any notable customer highlights.
What to Avoid:
Avoid making inferences about feedback beyond the datasource results.
Do not speculate on customer satisfaction without data."
`,
    "Marketing Campaign Analysis Assistant": `
You are a virtual marketing assistant. Your role is to analyze campaign performance by gathering the following details from the user:
Campaign Name or Type (e.g., 'Black Friday sale,' 'email marketing')
Platform (e.g., 'Google Ads,' 'Meta Ads')
Timeframe (e.g., 'last 7 days,' 'this month')
Instructions:
Collect Inputs: Prompt the user for these details. Confirm and retain any responses.
Clarify and Guide: If the user’s input is unclear or incomplete, guide them toward providing a clear response.
Query Datasource: Use the collected inputs to query the marketing datasource and fetch the relevant campaign performance metrics.
Generate Insights: Present a summary of metrics such as impressions, clicks, CTR, conversions, and ROAS, along with any standout trends.
What to Avoid:
Avoid assumptions about unclear inputs.
Do not interpret data; focus solely on what the datasource provides.`,
    "Sales Insights Assistant": `You are a virtual sales assistant. Your task is to collect three key pieces of information from the user before querying the datasource:
Time Period (e.g., 'last week,' 'last month,' 'last quarter')
Product Category (e.g., 'electronics,' 'clothing,' 'home appliances')
Sales Channel (e.g., 'online store,' 'retail outlet')
Instructions:
Collect Inputs: Ask the user for the required details. Acknowledge and retain any inputs they provide.
Fill in Missing Details: If the user omits any of the three details, specifically ask for the missing information. Avoid repeating queries for information already provided.
Process Inputs: Once all inputs are collected, query the sales datasource using the provided filters.
Generate Response: Summarize the sales data in a user-friendly manner, highlighting trends and key metrics like total sales, top products, and performance across channels.
What to Avoid:
Do not infer or assume missing inputs.
Do not provide analysis beyond the data retrieved from the datasource.
`,
  };

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: getRes,
    refetch,
    error,
    isLoading,
    isFetching,
  } = useGetPrivateDatasourcesListQuery({
    skip: 0,
    limit: 100,
    sort_by: "lastcreatedat",
    is_published: false,
    query: debouncedSearchQuery,
  });

  const [
    createAssistant,
    { data: assistantRes, isLoading: assistantLoading, error: assistantError },
  ] = useCreateAssistantMutation();
  const { theme } = useTheme();

  const modalRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (getRes) {
      setDatasourceList(getRes);
    }
  }, [getRes]);

  const toggleCheck = (id) => {
    setDatasourceList((prevDataSources) => {
      // Focus the search input field when an item is checked or unchecked
      // if (searchInputRef.current) {
      //     searchInputRef.current.focus();
      // }

      // Toggle the checked state of the datasource
      const updatedSources = prevDataSources.map((source) =>
        source.id === id ? { ...source, checked: !source.checked } : source
      );

      // Filter the checked and unchecked items based on updated sources
      const checkedItems = updatedSources.filter((source) => source.checked);
      const uncheckedItems = updatedSources.filter((source) => !source.checked);

      // Update the array of selected datasource IDs in the data object
      const selectedIds = checkedItems.map((source) => source.id);

      setData((prevData) => ({ ...prevData, datasourceArr: selectedIds }));

      // Return the updated list with checked items first
      return [...checkedItems, ...uncheckedItems];
    });
  };

  const resetStates = () => {
    setDatasourceList((prevDataSources) =>
      prevDataSources.map((source) => ({ ...source, checked: false }))
    );
    setData({
      name: "",
      datasourceArr: [],
      prompt: "",
    });
    setSearchTerm("");
    setActivePrompt("template");
    setSelectTemplate("Inventory Management Assistant");
    setIsDropdownOpen(false);
  };

  const handleCancelCreateFlow = () => {
    resetStates();
    setShowCreateAssistant(false);
  };

  const handleCreateAssistant = async () => {
    try {
      const datasourceIds = selectedDatasource?.map((item) => {
        return item.id;
      });

      const requestData = {
        name: data.name,
        default_stage: "default",
        about: "",
        stage_config: {
          default: {
            routing: datasourceIds,
            system_instructions: data.prompt,
          },
        },
      };

      const response = await createAssistant({ payload: requestData });

      if (response && !response.error) {
        resetStates();
        setAssistantSlug(response?.data?.id);
        setShowCreateAssistant(false);
        setShowSuccessModal(true);
      } else {
        console.error("Error creating assistant:", response.error);
      }
    } catch (error) {
      console.error("Failed to create assistant:", error);
    }
  };

  const handleOutsideClick = (e) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      e.target.id !== "searchInput"
    ) {
      setIsDropdownOpen(false);
      setSearchTerm("");
    }
  };

  const handleAddDatasource = (data) => {
    setSelectedDatasource((prev) => [...prev, data]);

    const filterData = datasourceList?.filter((item) => {
      return item.id !== data.id;
    });

    setDatasourceList(filterData);
  };

  const handleRemoveDatasource = (data) => {
    setDatasourceList((prev) => [...prev, data]);

    const filterData = selectedDatasource?.filter((item) => {
      return item.id !== data.id;
    });

    setSelectedDatasource(filterData);
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const filteredDatasources = datasourceList?.filter((datasource) =>
    datasource.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] max-h-full md:inset-0 bg_blur ${
        showCreateAssistant ? "" : "hidden"
      }`}
    >
      <div
        className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-2xl overflow-x-hidden overflow-y-auto border-l border-border-color bg-page recent__bar"
        ref={modalRef}
      >
        <div className="relative flex flex-col min-h-screen">
          {showCreateDatasource || (
            <div className="sticky top-0 left-0 z-50 flex items-center justify-between w-full px-4 border-b bg-page border-border-color">
              <div className="flex items-center h-12 space-x-3 text-xs font-semibold tracking-wide text-primary-text">
                <span
                  className="flex items-center justify-center"
                  onClick={() => setShowCreateAssistant(false)}
                >
                  <svg
                    viewBox="0 0 12 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                  >
                    <path
                      fill-rule="evenodd"
                      clipRule="evenodd"
                      d="M6.00104 6.91474L9.53637 10.4501C9.72397 10.6377 9.9784 10.7431 10.2437 10.7431C10.509 10.7431 10.7634 10.6377 10.951 10.4501C11.1386 10.2625 11.244 10.008 11.244 9.74274C11.244 9.47744 11.1386 9.223 10.951 9.03541L7.41437 5.50007L10.9504 1.96474C11.0432 1.87185 11.1169 1.76159 11.1671 1.64024C11.2173 1.51889 11.2432 1.38884 11.2431 1.2575C11.2431 1.12617 11.2172 0.99613 11.1669 0.874806C11.1166 0.753482 11.0429 0.643251 10.95 0.550407C10.8571 0.457562 10.7469 0.383923 10.6255 0.333692C10.5042 0.283462 10.3741 0.257624 10.2428 0.257655C10.1115 0.257686 9.98143 0.283585 9.8601 0.333872C9.73878 0.38416 9.62855 0.457852 9.5357 0.55074L6.00104 4.08607L2.4657 0.55074C2.3735 0.455188 2.26319 0.378954 2.14121 0.326488C2.01924 0.274023 1.88803 0.246375 1.75525 0.245159C1.62247 0.243943 1.49078 0.269183 1.36786 0.319406C1.24494 0.369629 1.13326 0.443829 1.03932 0.537677C0.945384 0.631525 0.871078 0.743142 0.820739 0.866014C0.770401 0.988886 0.745037 1.12055 0.746127 1.25333C0.747218 1.38611 0.774742 1.51734 0.827093 1.63937C0.879443 1.7614 0.955572 1.87178 1.05104 1.96407L4.5877 5.50007L1.05171 9.03607C0.956239 9.12837 0.88011 9.23875 0.827759 9.36077C0.775409 9.4828 0.747885 9.61403 0.746794 9.74681C0.745703 9.87959 0.771067 10.0113 0.821406 10.1341C0.871745 10.257 0.94605 10.3686 1.03999 10.4625C1.13392 10.5563 1.24561 10.6305 1.36853 10.6807C1.49145 10.731 1.62314 10.7562 1.75592 10.755C1.8887 10.7538 2.0199 10.7261 2.14188 10.6737C2.26386 10.6212 2.37417 10.545 2.46637 10.4494L6.00104 6.91541V6.91474Z"
                    />
                  </svg>
                </span>

                <span>Create Assistant</span>
              </div>
            </div>
          )}

          {showCreateDatasource || (
            <div className="flex flex-col">
              <div className="flex flex-col flex-grow p-4 space-y-3 text-primary-text">
                <div className="flex items-center h-10 px-2">
                  <h3 className="w-40 text-xs ">Name</h3>
                  <input
                    type="text"
                    placeholder="Enter a unique name for your assistant here"
                    alue={data.name}
                    onChange={(e) => {
                      setData((prevData) => ({
                        ...prevData,
                        name: e.target.value,
                      }));
                    }}
                    className="px-4 w-full h-10 text-input-text rounded-[4px] border border-border-color bg-page focus:outline-none focus:ring-2 text-xs focus:ring-secondary"
                  />
                </div>

                <div className="min-h-9 flex items-center justify-between bg-secondary-bg px-2 rounded-[4px]">
                  <h3 className="w-40 text-sm ">Select Datasources</h3>

                  <button
                    type="button"
                    className="flex items-center justify-center w-full h-7 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                    onClick={() => setShowCreateDatasource(true)}
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 fill-btn-primary-outline-icon"
                      >
                        <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
                      </svg>
                    </span>
                    <span>Add Datasource</span>
                  </button>
                </div>

                <div className="flex flex-col h-full p-2 space-y-3">
                  <div className="relative w-full">
                    <input
                      type="text"
                      className="w-full h-10 pl-10 pr-4 text-sm font-medium bg-transparent border rounded-md outline-none text-input-text border-border-color placeholder:text-input-placeholder focus:border-active-border"
                      placeholder="Search datasource..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-primary-text"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      </svg>
                    </span>

                    {searchQuery !== "" && (
                      <span
                        className="absolute flex items-center justify-center w-5 h-5 -translate-y-1/2 rounded-full cursor-pointer bg-icon-selected-bg top-1/2 right-2"
                        onClick={() => setSearchQuery("")}
                      >
                        <svg
                          viewBox="0 0 12 13"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3 fill-icon-color hover:fill-primary-text"
                        >
                          <path d="M1.33317 12.3307L0.166504 11.1641L4.83317 6.4974L0.166504 1.83073L1.33317 0.664062L5.99984 5.33073L10.6665 0.664062L11.8332 1.83073L7.1665 6.4974L11.8332 11.1641L10.6665 12.3307L5.99984 7.66406L1.33317 12.3307Z" />
                        </svg>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col h-64 gap-2 overflow-y-auto recent__bar">
                    <div className="flex flex-wrap gap-2">
                      {selectedDatasource?.map((datasource) => {
                        return (
                          <div
                            className="flex items-center h-8 gap-2 px-4 py-3 border rounded-full cursor-pointer bg-active-bg border-btn-primary-outline-bg hover:border-btn-primary-outline-bg"
                            onClick={() => handleRemoveDatasource(datasource)}
                          >
                            <span className="flex items-center justify-center">
                              {theme === "dark" ? (
                                <svg
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 fill-icon-selected-color"
                                >
                                  <path d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z" />
                                </svg>
                              ) : (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z"
                                    fill="#010616"
                                  />
                                </svg>
                              )}
                            </span>

                            <span className="text-xs font-medium text-primary-text">
                              {datasource.name}
                            </span>

                            {datasource?.ds_config?.ds_type ===
                              "sql_generator" && (
                              <div className="text-[10px] flex font-medium items-center justify-center space-x-2 text-[#40AD7D] w-fit">
                                <span>Structured</span>
                              </div>
                            )}

                            {datasource?.ds_config?.ds_type ===
                              "semi_structured" && (
                              <div className="text-[10px] font-medium flex items-center justify-center space-x-2 text-[#A840AD] w-fit">
                                <span>Semi-Structured</span>
                              </div>
                            )}

                            {datasource?.ds_config?.ds_type ===
                              "third_party" && (
                              <div className="text-[10px] font-medium flex items-center justify-center space-x-2 text-[#AD7A40] w-fit">
                                <span>Third Party</span>
                              </div>
                            )}

                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={true}
                                className="hidden"
                              />
                              <div className="flex items-center justify-center w-4 h-4 transition-all rounded-full cursor-pointer">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="7.60156"
                                    cy="8.40039"
                                    r="6"
                                    fill="#F6F6F6"
                                  />
                                  <path
                                    d="M6.88 11.68L12.52 6.04L11.4 4.92L6.88 9.44L4.6 7.16L3.48 8.28L6.88 11.68ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                                    fill="#295EF4"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {datasourceList?.map((datasource) => {
                        return (
                          <div
                            className="flex items-center h-8 gap-2 px-4 py-3 border rounded-full cursor-pointer bg-page border-border-color hover:border-btn-primary-outline-bg"
                            onClick={() => handleAddDatasource(datasource)}
                          >
                            <span className="flex items-center justify-center">
                              {theme === "dark" ? (
                                <svg
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 fill-icon-selected-color"
                                >
                                  <path d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z" />
                                </svg>
                              ) : (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z"
                                    fill="#010616"
                                  />
                                </svg>
                              )}
                            </span>

                            <span className="text-xs font-medium text-primary-text">
                              {datasource.name}
                            </span>

                            {datasource?.ds_config?.ds_type ===
                              "sql_generator" && (
                              <div className="text-[10px] flex font-medium items-center justify-center space-x-2 text-[#40AD7D] w-fit">
                                <span>Structured</span>
                              </div>
                            )}

                            {datasource?.ds_config?.ds_type ===
                              "semi_structured" && (
                              <div className="text-[10px] font-medium flex items-center justify-center space-x-2 text-[#A840AD] w-fit">
                                <span>Semi-Structured</span>
                              </div>
                            )}

                            {datasource?.ds_config?.ds_type ===
                              "third_party" && (
                              <div className="text-[10px] font-medium flex items-center justify-center space-x-2 text-[#AD7A40] w-fit">
                                <span>Third Party</span>
                              </div>
                            )}

                            <button
                              type="button"
                              className="flex items-center justify-center"
                            >
                              <svg
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 fill-[#295EF4] hover:fill-icon-color-hover cursor-pointer"
                              >
                                <path d="M7.33203 8.66683H3.33203V7.3335H7.33203V3.3335H8.66536V7.3335H12.6654V8.66683H8.66536V12.6668H7.33203V8.66683Z" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="h-9 flex items-center justify-between bg-secondary-bg px-2 rounded-[4px]">
                  <h3 className="w-40 text-sm ">Prompt</h3>
                </div>

                <div className="px-2 text-white">
                  {/* Radio Buttons */}
                  <div className="space-y-2">
                    <div>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative mr-2">
                          <input
                            type="radio"
                            name="promptType"
                            value="ownPrompt"
                            checked={activePrompt === "ownPrompt"}
                            onClick={() => {
                              setData((prevData) => ({
                                ...prevData,
                                prompt: "",
                              }));
                              setActivePrompt("ownPrompt");
                            }}
                            className="absolute w-0 h-0 opacity-0"
                          />
                          <div
                            className={`w-4 h-4 rounded-full cursor-pointer flex items-center justify-center ${
                              activePrompt === "ownPrompt"
                                ? "border-border-active-color border"
                                : ""
                            }`}
                            onClick={() => {
                              setData((prevData) => ({
                                ...prevData,
                                prompt: "",
                              }));
                              setActivePrompt("ownPrompt");
                            }}
                          >
                            {activePrompt === "ownPrompt" ? (
                              <div className="w-2 h-2 rounded-full bg-secondary"></div>
                            ) : (
                              <div className="w-4 h-4 border rounded-full border-border-active-color"></div>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs ${
                            activePrompt === "ownPrompt"
                              ? "text-primary-text"
                              : "text-secondary-text"
                          }`}
                        >
                          Write own prompt
                        </span>
                      </label>
                    </div>
                    {activePrompt === "ownPrompt" ? (
                      <div className="rounded-[1px] ml-5">
                        <textarea
                          className="w-full h-20 p-1 text-xs border rounded-md text-input-text bg-page border-dropdown-border focus:outline-border-active-color focus:outline-none"
                          placeholder="Enter your prompt here..."
                          value={data.prompt}
                          onChange={(e) =>
                            setData((prevData) => ({
                              ...prevData,
                              prompt: e.target.value,
                            }))
                          }
                        ></textarea>
                      </div>
                    ) : null}

                    <div>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative mr-2">
                          <input
                            type="radio"
                            name="promptType"
                            value="template"
                            checked={activePrompt === "template"}
                            onChange={() => setActivePrompt("template")}
                            className="absolute w-0 h-0 opacity-0"
                          />
                          <div
                            className={`w-4 h-4 rounded-full cursor-pointer flex items-center justify-center ${
                              activePrompt === "template"
                                ? "border-border-active-color border "
                                : ""
                            }`}
                            onClick={() => setActivePrompt("template")}
                          >
                            {activePrompt === "template" ? (
                              <div className="w-2 h-2 rounded-full bg-secondary"></div>
                            ) : (
                              <div className="w-4 h-4 border rounded-full border-border-active-color"></div>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs ${
                            activePrompt === "template"
                              ? "text-primary-text"
                              : "text-secondary-text"
                          }`}
                        >
                          Choose from template
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Conditionally Render Components */}
                  <div className="mt-3">
                    {activePrompt === "template" ? (
                      <div className="grid grid-cols-2 gap-3 ml-5">
                        {/* Template 1 */}
                        <div
                          className={`relative p-3 rounded-md cursor-pointer hover:border-border-active-color ${
                            selectTemplate === "Inventory Management Assistant"
                              ? "border-border-active-color border"
                              : "border border-dropdown-border"
                          }`}
                          onClick={() => {
                            setSelectTemplate("Inventory Management Assistant");
                            setData((prevData) => ({
                              ...prevData,
                              prompt:
                                promptOptions["Inventory Management Assistant"],
                            }));
                            setActivePrompt("ownPrompt");
                          }}
                        >
                          <div className="flex flex-col justify-center">
                            <div className="h-6">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 18H16V16H8V18ZM8 14H16V12H8V14ZM6 22C5.45 22 4.97917 21.8042 4.5875 21.4125C4.19583 21.0208 4 20.55 4 20V4C4 3.45 4.19583 2.97917 4.5875 2.5875C4.97917 2.19583 5.45 2 6 2H14L20 8V20C20 20.55 19.8042 21.0208 19.4125 21.4125C19.0208 21.8042 18.55 22 18 22H6ZM13 9V4H6V20H18V9H13Z"
                                  fill={
                                    selectTemplate ===
                                    "Inventory Management Assistant"
                                      ? "#F6F6F6"
                                      : "#5F6368"
                                  }
                                />
                              </svg>
                            </div>

                            <div
                              className={`flex items-center h-6 text-xs font-semibold ${
                                selectTemplate ===
                                "Inventory Management Assistant"
                                  ? "text-primary-text"
                                  : "text-secondary-text"
                              }`}
                            >
                              <h4>Inventory Management Assistant</h4>
                            </div>
                          </div>
                          <p className="text-[10px] text-secondary-text h-14 overflow-hidden text-ellipsis line-clamp-4">
                            {promptOptions["Inventory Management Assistant"]}
                          </p>
                          {/* Blue Tick Icon */}
                          {selectTemplate ===
                            "Inventory Management Assistant" && (
                            <div className="absolute top-3 right-3">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle
                                  cx="7.60156"
                                  cy="8.40039"
                                  r="6"
                                  fill="#F6F6F6"
                                />
                                <path
                                  d="M6.88 11.68L12.52 6.04L11.4 4.92L6.88 9.44L4.6 7.16L3.48 8.28L6.88 11.68ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                                  fill="#295EF4"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Template 2 */}
                        <div
                          className={`relative p-3 rounded-md cursor-pointer hover:border-border-active-color border ${
                            selectTemplate ===
                            "Customer Support Insights Assistant"
                              ? "border-border-active-color "
                              : " border-dropdown-border"
                          }`}
                          onClick={() => {
                            setSelectTemplate(
                              "Customer Support Insights Assistant"
                            );
                            setData((prevData) => ({
                              ...prevData,
                              prompt:
                                promptOptions[
                                  "Customer Support Insights Assistant"
                                ],
                            }));
                            setActivePrompt("ownPrompt");
                          }}
                        >
                          <div className="flex flex-col justify-center">
                            <div className="h-6">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 18H16V16H8V18ZM8 14H16V12H8V14ZM6 22C5.45 22 4.97917 21.8042 4.5875 21.4125C4.19583 21.0208 4 20.55 4 20V4C4 3.45 4.19583 2.97917 4.5875 2.5875C4.97917 2.19583 5.45 2 6 2H14L20 8V20C20 20.55 19.8042 21.0208 19.4125 21.4125C19.0208 21.8042 18.55 22 18 22H6ZM13 9V4H6V20H18V9H13Z"
                                  fill={
                                    selectTemplate ===
                                    "Customer Support Insights Assistant"
                                      ? "#F6F6F6"
                                      : "#5F6368"
                                  }
                                />
                              </svg>
                            </div>
                            <div
                              className={`flex items-center h-6 text-xs font-semibold ${
                                selectTemplate ===
                                "Customer Support Insights Assistant"
                                  ? "text-primary-text"
                                  : "text-secondary-text"
                              }`}
                            >
                              <h4>Customer Support Insights Assistant</h4>
                            </div>
                          </div>
                          <p className="text-[10px] text-secondary-text h-14 overflow-hidden text-ellipsis line-clamp-4">
                            {
                              promptOptions[
                                "Customer Support Insights Assistant"
                              ]
                            }
                          </p>
                          {selectTemplate ===
                            "Customer Support Insights Assistant" && (
                            <div className="absolute top-3 right-3">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle
                                  cx="7.60156"
                                  cy="8.40039"
                                  r="6"
                                  fill="#F6F6F6"
                                />
                                <path
                                  d="M6.88 11.68L12.52 6.04L11.4 4.92L6.88 9.44L4.6 7.16L3.48 8.28L6.88 11.68ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                                  fill="#295EF4"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Template 3 */}
                        <div
                          className={`relative p-3 rounded-md cursor-pointer hover:border-border-active-color border ${
                            selectTemplate ===
                            "Marketing Campaign Analysis Assistant"
                              ? "border-border-active-color"
                              : "border-dropdown-border"
                          }`}
                          onClick={() => {
                            setSelectTemplate(
                              "Marketing Campaign Analysis Assistant"
                            );
                            setData((prevData) => ({
                              ...prevData,
                              prompt:
                                promptOptions[
                                  "Marketing Campaign Analysis Assistant"
                                ],
                            }));
                            setActivePrompt("ownPrompt");
                          }}
                        >
                          <div className="flex flex-col justify-center">
                            <div className="h-6">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 18H16V16H8V18ZM8 14H16V12H8V14ZM6 22C5.45 22 4.97917 21.8042 4.5875 21.4125C4.19583 21.0208 4 20.55 4 20V4C4 3.45 4.19583 2.97917 4.5875 2.5875C4.97917 2.19583 5.45 2 6 2H14L20 8V20C20 20.55 19.8042 21.0208 19.4125 21.4125C19.0208 21.8042 18.55 22 18 22H6ZM13 9V4H6V20H18V9H13Z"
                                  fill={
                                    selectTemplate ===
                                    "Marketing Campaign Analysis Assistant"
                                      ? "#F6F6F6"
                                      : "#5F6368"
                                  }
                                />
                              </svg>
                            </div>

                            <div
                              className={`flex items-center h-6 text-xs font-semibold ${
                                selectTemplate ===
                                "Marketing Campaign Analysis Assistant"
                                  ? theme === "dark"
                                    ? "text-primary-text"
                                    : "text-secondary-text"
                                  : "text-secondary-text"
                              }`}
                            >
                              <h4>Marketing Campaign Analysis Assistant</h4>
                            </div>
                          </div>
                          <p className="text-[10px] text-secondary-text h-14 overflow-hidden text-ellipsis line-clamp-4">
                            {
                              promptOptions[
                                "Marketing Campaign Analysis Assistant"
                              ]
                            }
                          </p>
                          {selectTemplate ===
                            "Marketing Campaign Analysis Assistant" && (
                            <div className="absolute top-3 right-3">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle
                                  cx="7.60156"
                                  cy="8.40039"
                                  r="6"
                                  fill="#F6F6F6"
                                />
                                <path
                                  d="M6.88 11.68L12.52 6.04L11.4 4.92L6.88 9.44L4.6 7.16L3.48 8.28L6.88 11.68ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                                  fill="#295EF4"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Template 4 */}
                        <div
                          className={`relative p-3 rounded-md cursor-pointer hover:border-border-active-color border ${
                            selectTemplate === "Sales Insights Assistant"
                              ? "border-border-active-color"
                              : "border-dropdown-border"
                          }`}
                          onClick={() => {
                            setSelectTemplate("Sales Insights Assistant");
                            setData((prevData) => ({
                              ...prevData,
                              prompt: promptOptions["Sales Insights Assistant"],
                            }));
                            setActivePrompt("ownPrompt");
                          }}
                        >
                          <div className="flex flex-col justify-center">
                            <div className="h-6">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 18H16V16H8V18ZM8 14H16V12H8V14ZM6 22C5.45 22 4.97917 21.8042 4.5875 21.4125C4.19583 21.0208 4 20.55 4 20V4C4 3.45 4.19583 2.97917 4.5875 2.5875C4.97917 2.19583 5.45 2 6 2H14L20 8V20C20 20.55 19.8042 21.0208 19.4125 21.4125C19.0208 21.8042 18.55 22 18 22H6ZM13 9V4H6V20H18V9H13Z"
                                  fill={
                                    selectTemplate ===
                                    "Sales Insights Assistant"
                                      ? "#F6F6F6"
                                      : "#5F6368"
                                  }
                                />
                              </svg>
                            </div>

                            <div
                              className={`flex items-center h-6 text-xs font-semibold ${
                                selectTemplate === "Sales Insights Assistant"
                                  ? "text-primary-text"
                                  : "text-secondary-text"
                              }`}
                            >
                              <h4>Sales Insights Assistant </h4>
                            </div>
                          </div>
                          <p className="text-[10px] text-secondary-text h-14 overflow-hidden text-ellipsis line-clamp-4">
                            {promptOptions["Sales Insights Assistant"]}
                          </p>
                          {selectTemplate === "Sales Insights Assistant" && (
                            <div className="absolute top-3 right-3 ">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle
                                  cx="7.60156"
                                  cy="8.40039"
                                  r="6"
                                  fill="#F6F6F6"
                                />
                                <path
                                  d="M6.88 11.68L12.52 6.04L11.4 4.92L6.88 9.44L4.6 7.16L3.48 8.28L6.88 11.68ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                                  fill="#295EF4"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 flex items-center justify-end w-full h-12 p-4 space-x-2 border-t bg-page border-border-color">
                <button
                  type="button"
                  className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                  onClick={handleCancelCreateFlow}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center justify-center px-4 py-2 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                  onClick={handleCreateAssistant}
                  disabled={
                    !data.name ||
                    selectedDatasource.length === 0 ||
                    !data.prompt ||
                    assistantLoading
                  }
                >
                  {assistantLoading && (
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="w-3 h-3 animate-spin text-primary-text fill-btn-primary"
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
              </div>
            </div>
          )}

          {showCreateDatasource && (
            <AssistantDatasourceModal
              show={showCreateDatasource}
              setShow={setShowCreateDatasource}
              refetchDatasource={refetch}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAssistantModel;
