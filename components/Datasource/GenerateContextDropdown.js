import React, { useEffect, useState } from "react";
import SelectOption from "../common/SelectOption";
import { Controller } from "react-hook-form";
import JoinsSets from "./JoinsSets";
import FormulaeSets from "./FormulaeSets";
import ConceptForSpecificDataResponse from "./ConceptForSpecificDataResponse ";
import AutoFillModal from "../Modal/AutoFillModal";
import { useAutofillWithAiMutation } from "@/store/datasource";

const optionsCardinality = [
  { value: "high", label: "High" },
  { value: "low", label: "Low" },
];

const GenerateContextDropdown = ({
  data,
  index,
  register,
  setValue,
  getValues,
  control,
  update,
  showBtn,
}) => {
  const [toggleDropdown, setToggleDropdown] = useState(false);
  const [currentTab, setCurrentTab] = useState("description");
  const [showInfo, setShowInfo] = useState(true);
  const [showAutoFillModal, setShowAutoFillModal] = useState(false);

  const [autofillWithAi, { data: aiRes, isLoading, error }] =
    useAutofillWithAiMutation();

  const handleGenerate = (payload) => {
    const table = getValues(`tables.${index}`);

    if (!payload || !table) {
      console.error("Invalid payload or table:", payload, table);
      return;
    }

    const dataSchema = {
      ...payload,
      table: table,
    };

    autofillWithAi({ payload: dataSchema })
      .then((response) => {
        if (response.data) {
          console.log("response", response.data);

          setValue(`tables.${index}`, response.data);
          setShowAutoFillModal(false);
        } else {
          console.error("No data returned from API", response);
        }
      })
      .catch((err) => {
        console.error("API call failed", err);
      });
  };

  return (
    <div className="flex flex-col space-y-2 rounded-md cursor-pointer bg-[#181A1C]">
      <div
        className="flex items-center justify-between w-full px-4 py-3 text-sm tracking-wide text-white"
        onClick={() => setToggleDropdown(!toggleDropdown)}
      >
        <p className="font-medium">{data?.name}</p>

        {toggleDropdown || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-white/40 hover:text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        )}

        {toggleDropdown && (
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
              d="m4.5 15.75 7.5-7.5 7.5 7.5"
            />
          </svg>
        )}
      </div>

      {toggleDropdown && (
        <div className="flex flex-col">
          <div className="flex-wrap items-center hidden w-full px-2 sm:flex max-w-fit">
            <button
              className={`text-xs border-b-2 font-medium flex justify-center items-center space-x-4 min-w-16 px-2 tracking-wider capitalize transition-colors duration-300 ${
                currentTab === "description"
                  ? "text-accent border-secondary"
                  : "text-white/40 border-transparent"
              }`}
              type="button"
            >
              <div
                className="pb-4"
                onClick={() => setCurrentTab("description")}
              >
                Table & Column Descriptions
              </div>

              {currentTab === "description" && (
                <span
                  className="flex items-center justify-center pb-4 cursor-pointer"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <svg
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                  >
                    <path
                      d="M6.96536 11.0026C7.1987 11.0026 7.39592 10.922 7.55703 10.7609C7.71814 10.5998 7.7987 10.4026 7.7987 10.1693C7.7987 9.93594 7.71814 9.73872 7.55703 9.5776C7.39592 9.41649 7.1987 9.33594 6.96536 9.33594C6.73203 9.33594 6.53481 9.41649 6.3737 9.5776C6.21259 9.73872 6.13203 9.93594 6.13203 10.1693C6.13203 10.4026 6.21259 10.5998 6.3737 10.7609C6.53481 10.922 6.73203 11.0026 6.96536 11.0026ZM6.36536 8.43594H7.5987C7.5987 8.06927 7.64036 7.78038 7.7237 7.56927C7.80703 7.35816 8.04314 7.06927 8.43203 6.7026C8.72092 6.41371 8.9487 6.13871 9.11536 5.8776C9.28203 5.61649 9.36536 5.3026 9.36536 4.93594C9.36536 4.31371 9.13759 3.83594 8.68203 3.5026C8.22648 3.16927 7.68759 3.0026 7.06536 3.0026C6.43203 3.0026 5.91814 3.16927 5.5237 3.5026C5.12925 3.83594 4.85425 4.23594 4.6987 4.7026L5.7987 5.13594C5.85425 4.93594 5.97925 4.71927 6.1737 4.48594C6.36814 4.2526 6.66536 4.13594 7.06536 4.13594C7.42092 4.13594 7.68759 4.23316 7.86536 4.4276C8.04314 4.62205 8.13203 4.83594 8.13203 5.06927C8.13203 5.29149 8.06536 5.49983 7.93203 5.69427C7.7987 5.88871 7.63203 6.06927 7.43203 6.23594C6.94314 6.66927 6.64314 6.99705 6.53203 7.21927C6.42092 7.44149 6.36536 7.84705 6.36536 8.43594ZM6.9987 13.6693C6.07648 13.6693 5.20981 13.4943 4.3987 13.1443C3.58759 12.7943 2.88203 12.3193 2.28203 11.7193C1.68203 11.1193 1.20703 10.4137 0.857031 9.6026C0.507031 8.79149 0.332031 7.92483 0.332031 7.0026C0.332031 6.08038 0.507031 5.21372 0.857031 4.4026C1.20703 3.59149 1.68203 2.88594 2.28203 2.28594C2.88203 1.68594 3.58759 1.21094 4.3987 0.860937C5.20981 0.510937 6.07648 0.335938 6.9987 0.335938C7.92092 0.335938 8.78759 0.510937 9.5987 0.860937C10.4098 1.21094 11.1154 1.68594 11.7154 2.28594C12.3154 2.88594 12.7904 3.59149 13.1404 4.4026C13.4904 5.21372 13.6654 6.08038 13.6654 7.0026C13.6654 7.92483 13.4904 8.79149 13.1404 9.6026C12.7904 10.4137 12.3154 11.1193 11.7154 11.7193C11.1154 12.3193 10.4098 12.7943 9.5987 13.1443C8.78759 13.4943 7.92092 13.6693 6.9987 13.6693Z"
                      fill="#5F6368"
                    />
                  </svg>
                </span>
              )}
            </button>

            <button
              className={`text-xs border-b-2 font-medium flex justify-center items-center space-x-4 min-w-16 px-2 tracking-wider capitalize transition-colors duration-300 ${
                currentTab === "joining"
                  ? "text-accent border-secondary"
                  : "text-white/40 border-transparent"
              }`}
              type="button"
            >
              <div className="pb-4" onClick={() => setCurrentTab("joining")}>
                Data Joining Setup
              </div>

              {currentTab === "joining" && (
                <span
                  className="flex items-center justify-center pb-4 cursor-pointer"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <svg
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                  >
                    <path
                      d="M6.96536 11.0026C7.1987 11.0026 7.39592 10.922 7.55703 10.7609C7.71814 10.5998 7.7987 10.4026 7.7987 10.1693C7.7987 9.93594 7.71814 9.73872 7.55703 9.5776C7.39592 9.41649 7.1987 9.33594 6.96536 9.33594C6.73203 9.33594 6.53481 9.41649 6.3737 9.5776C6.21259 9.73872 6.13203 9.93594 6.13203 10.1693C6.13203 10.4026 6.21259 10.5998 6.3737 10.7609C6.53481 10.922 6.73203 11.0026 6.96536 11.0026ZM6.36536 8.43594H7.5987C7.5987 8.06927 7.64036 7.78038 7.7237 7.56927C7.80703 7.35816 8.04314 7.06927 8.43203 6.7026C8.72092 6.41371 8.9487 6.13871 9.11536 5.8776C9.28203 5.61649 9.36536 5.3026 9.36536 4.93594C9.36536 4.31371 9.13759 3.83594 8.68203 3.5026C8.22648 3.16927 7.68759 3.0026 7.06536 3.0026C6.43203 3.0026 5.91814 3.16927 5.5237 3.5026C5.12925 3.83594 4.85425 4.23594 4.6987 4.7026L5.7987 5.13594C5.85425 4.93594 5.97925 4.71927 6.1737 4.48594C6.36814 4.2526 6.66536 4.13594 7.06536 4.13594C7.42092 4.13594 7.68759 4.23316 7.86536 4.4276C8.04314 4.62205 8.13203 4.83594 8.13203 5.06927C8.13203 5.29149 8.06536 5.49983 7.93203 5.69427C7.7987 5.88871 7.63203 6.06927 7.43203 6.23594C6.94314 6.66927 6.64314 6.99705 6.53203 7.21927C6.42092 7.44149 6.36536 7.84705 6.36536 8.43594ZM6.9987 13.6693C6.07648 13.6693 5.20981 13.4943 4.3987 13.1443C3.58759 12.7943 2.88203 12.3193 2.28203 11.7193C1.68203 11.1193 1.20703 10.4137 0.857031 9.6026C0.507031 8.79149 0.332031 7.92483 0.332031 7.0026C0.332031 6.08038 0.507031 5.21372 0.857031 4.4026C1.20703 3.59149 1.68203 2.88594 2.28203 2.28594C2.88203 1.68594 3.58759 1.21094 4.3987 0.860937C5.20981 0.510937 6.07648 0.335938 6.9987 0.335938C7.92092 0.335938 8.78759 0.510937 9.5987 0.860937C10.4098 1.21094 11.1154 1.68594 11.7154 2.28594C12.3154 2.88594 12.7904 3.59149 13.1404 4.4026C13.4904 5.21372 13.6654 6.08038 13.6654 7.0026C13.6654 7.92483 13.4904 8.79149 13.1404 9.6026C12.7904 10.4137 12.3154 11.1193 11.7154 11.7193C11.1154 12.3193 10.4098 12.7943 9.5987 13.1443C8.78759 13.4943 7.92092 13.6693 6.9987 13.6693Z"
                      fill="#5F6368"
                    />
                  </svg>
                </span>
              )}
            </button>

            <button
              className={`text-xs border-b-2 font-medium flex justify-center items-center space-x-4 min-w-16 px-2 tracking-wider capitalize transition-colors duration-300 ${
                currentTab === "specific-data"
                  ? "text-accent border-secondary"
                  : "text-white/40 border-transparent"
              }`}
              type="button"
            >
              <div
                className="pb-4"
                onClick={() => setCurrentTab("specific-data")}
              >
                Concepts
              </div>

              {currentTab === "specific-data" && (
                <span
                  className="flex items-center justify-center pb-4 cursor-pointer"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <svg
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                  >
                    <path
                      d="M6.96536 11.0026C7.1987 11.0026 7.39592 10.922 7.55703 10.7609C7.71814 10.5998 7.7987 10.4026 7.7987 10.1693C7.7987 9.93594 7.71814 9.73872 7.55703 9.5776C7.39592 9.41649 7.1987 9.33594 6.96536 9.33594C6.73203 9.33594 6.53481 9.41649 6.3737 9.5776C6.21259 9.73872 6.13203 9.93594 6.13203 10.1693C6.13203 10.4026 6.21259 10.5998 6.3737 10.7609C6.53481 10.922 6.73203 11.0026 6.96536 11.0026ZM6.36536 8.43594H7.5987C7.5987 8.06927 7.64036 7.78038 7.7237 7.56927C7.80703 7.35816 8.04314 7.06927 8.43203 6.7026C8.72092 6.41371 8.9487 6.13871 9.11536 5.8776C9.28203 5.61649 9.36536 5.3026 9.36536 4.93594C9.36536 4.31371 9.13759 3.83594 8.68203 3.5026C8.22648 3.16927 7.68759 3.0026 7.06536 3.0026C6.43203 3.0026 5.91814 3.16927 5.5237 3.5026C5.12925 3.83594 4.85425 4.23594 4.6987 4.7026L5.7987 5.13594C5.85425 4.93594 5.97925 4.71927 6.1737 4.48594C6.36814 4.2526 6.66536 4.13594 7.06536 4.13594C7.42092 4.13594 7.68759 4.23316 7.86536 4.4276C8.04314 4.62205 8.13203 4.83594 8.13203 5.06927C8.13203 5.29149 8.06536 5.49983 7.93203 5.69427C7.7987 5.88871 7.63203 6.06927 7.43203 6.23594C6.94314 6.66927 6.64314 6.99705 6.53203 7.21927C6.42092 7.44149 6.36536 7.84705 6.36536 8.43594ZM6.9987 13.6693C6.07648 13.6693 5.20981 13.4943 4.3987 13.1443C3.58759 12.7943 2.88203 12.3193 2.28203 11.7193C1.68203 11.1193 1.20703 10.4137 0.857031 9.6026C0.507031 8.79149 0.332031 7.92483 0.332031 7.0026C0.332031 6.08038 0.507031 5.21372 0.857031 4.4026C1.20703 3.59149 1.68203 2.88594 2.28203 2.28594C2.88203 1.68594 3.58759 1.21094 4.3987 0.860937C5.20981 0.510937 6.07648 0.335938 6.9987 0.335938C7.92092 0.335938 8.78759 0.510937 9.5987 0.860937C10.4098 1.21094 11.1154 1.68594 11.7154 2.28594C12.3154 2.88594 12.7904 3.59149 13.1404 4.4026C13.4904 5.21372 13.6654 6.08038 13.6654 7.0026C13.6654 7.92483 13.4904 8.79149 13.1404 9.6026C12.7904 10.4137 12.3154 11.1193 11.7154 11.7193C11.1154 12.3193 10.4098 12.7943 9.5987 13.1443C8.78759 13.4943 7.92092 13.6693 6.9987 13.6693Z"
                      fill="#5F6368"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-col w-full space-y-2 border-t border-border">
            <div className="grid grid-cols-12 gap-2 p-2">
              {currentTab === "description" && (
                <div className="col-span-12">
                  <div className="flex flex-col space-y-4">
                    {currentTab === "description" && showInfo && (
                      <div className="w-full rounded-md p-4 bg-[#1E2022] flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium tracking-wide text-white">
                            What is Table and Column Description?
                          </p>

                          <span
                            className="flex items-center justify-center"
                            onClick={() => setShowInfo(false)}
                          >
                            <svg
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3 fill-secondary-text hover:fill-primary-text"
                            >
                              <path d="M1.33464 11.8307L0.167969 10.6641L4.83464 5.9974L0.167969 1.33073L1.33464 0.164062L6.0013 4.83073L10.668 0.164062L11.8346 1.33073L7.16797 5.9974L11.8346 10.6641L10.668 11.8307L6.0013 7.16406L1.33464 11.8307Z" />
                            </svg>
                          </span>
                        </div>

                        <ul className="flex flex-col space-y-2 text-sm font-normal tracking-wide list-disc list-inside text-white/50">
                          <li>
                            To help our AI understand and analyze your data
                            effectively, please provide detailed descriptions:
                          </li>
                          <li>
                            <span className="font-bold">
                              Table Description:
                            </span>{" "}
                            Describe the table's purpose, the type of data it
                            holds, and how it’s structured. This gives the AI an
                            overview of the data's context.
                          </li>
                          <li>
                            <span className="font-bold">
                              Column Description:
                            </span>{" "}
                            Explain the data each column contains, including its
                            type, role, and any key relationships or
                            constraints. This helps the AI interpret the data
                            correctly.
                          </li>
                          <li>
                            Think of these descriptions as instructions you'd
                            give to a new team member, ensuring the AI can
                            analyze your data with precision.
                          </li>
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-col mt-2 space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-sm font-normal text-white">
                          Table description
                        </p>

                        <div className="relative">
                          <button
                            type="button"
                            className="flex items-center justify-center space-x-2 text-sm font-medium group text-secondary hover:text-white"
                            onClick={() =>
                              setShowAutoFillModal(!showAutoFillModal)
                            }
                          >
                            <span className="flex items-center justify-center">
                              <svg
                                viewBox="0 0 12 13"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 fill-secondary group-hover:fill-white"
                              >
                                <g clip-path="url(#clip0_4961_18587)">
                                  <path d="M4.87599 12.501C4.75747 12.5016 4.6416 12.466 4.54385 12.399C4.4461 12.332 4.37113 12.2367 4.32896 12.126L3.39521 9.69786C3.37629 9.64893 3.34736 9.6045 3.31027 9.5674C3.27318 9.53031 3.22874 9.50138 3.17981 9.48247L0.750986 8.54802C0.640348 8.50555 0.545186 8.43054 0.47806 8.33288C0.410934 8.23521 0.375 8.11949 0.375 8.00099C0.375 7.88248 0.410934 7.76676 0.47806 7.6691C0.545186 7.57143 0.640348 7.49642 0.750986 7.45396L3.17911 6.52021C3.22804 6.50129 3.27248 6.47236 3.30957 6.43527C3.34666 6.39818 3.37559 6.35374 3.3945 6.30481L4.32896 3.87599C4.37142 3.76535 4.44643 3.67019 4.54409 3.60306C4.64176 3.53593 4.75748 3.5 4.87599 3.5C4.99449 3.5 5.11021 3.53593 5.20788 3.60306C5.30554 3.67019 5.38055 3.76535 5.42302 3.87599L6.35677 6.30411C6.37568 6.35304 6.40461 6.39748 6.4417 6.43457C6.47879 6.47166 6.52323 6.50059 6.57216 6.5195L8.98622 7.44833C9.10136 7.49101 9.20056 7.56813 9.2703 7.6692C9.34004 7.77027 9.37695 7.89038 9.37599 8.01317C9.3742 8.12962 9.3375 8.24284 9.27064 8.3382C9.20379 8.43355 9.10985 8.50665 9.00099 8.54802L6.57286 9.48177C6.52393 9.50068 6.4795 9.52961 6.4424 9.5667C6.40531 9.60379 6.37638 9.64823 6.35747 9.69716L5.42302 12.126C5.38084 12.2367 5.30587 12.332 5.20812 12.399C5.11037 12.466 4.9945 12.5016 4.87599 12.501Z" />
                                  <path d="M2.06246 4.62494C1.99298 4.62493 1.92513 4.60388 1.86785 4.56455C1.81057 4.52522 1.76656 4.46946 1.7416 4.40462L1.34644 3.37712C1.33788 3.35465 1.32466 3.33424 1.30765 3.31724C1.29065 3.30023 1.27024 3.28702 1.24777 3.27845L0.220268 2.88329C0.155435 2.85833 0.0996864 2.81431 0.0603664 2.75703C0.0210464 2.69975 0 2.63191 0 2.56244C0 2.49296 0.0210464 2.42512 0.0603664 2.36784C0.0996864 2.31056 0.155435 2.26654 0.220268 2.24158L1.24777 1.84642C1.27022 1.83782 1.29061 1.82458 1.30761 1.80758C1.3246 1.79058 1.33784 1.7702 1.34644 1.74775L1.73808 0.729388C1.76017 0.669436 1.79817 0.616635 1.84802 0.576662C1.89786 0.536689 1.95765 0.511054 2.02097 0.502513C2.09699 0.493272 2.17392 0.509673 2.23956 0.549116C2.3052 0.588559 2.35579 0.648787 2.38332 0.720248L2.77847 1.74775C2.78707 1.7702 2.80031 1.79058 2.81731 1.80758C2.83431 1.82458 2.85469 1.83782 2.87714 1.84642L3.90464 2.24158C3.96948 2.26654 4.02523 2.31056 4.06455 2.36784C4.10387 2.42512 4.12491 2.49296 4.12491 2.56244C4.12491 2.63191 4.10387 2.69975 4.06455 2.75703C4.02523 2.81431 3.96948 2.85833 3.90464 2.88329L2.87714 3.27845C2.85467 3.28702 2.83426 3.30023 2.81726 3.31724C2.80025 3.33424 2.78704 3.35465 2.77847 3.37712L2.38332 4.40462C2.35836 4.46946 2.31434 4.52522 2.25706 4.56455C2.19978 4.60388 2.13194 4.62493 2.06246 4.62494Z" />
                                  <path d="M9.3747 6.50014C9.2989 6.50012 9.2249 6.47713 9.16243 6.4342C9.09996 6.39127 9.05197 6.33042 9.02478 6.25967L8.48946 4.86819C8.48005 4.84367 8.46558 4.8214 8.44701 4.80283C8.42844 4.78425 8.40617 4.76979 8.38165 4.76037L6.99017 4.22506C6.91947 4.19782 6.85869 4.14981 6.81582 4.08735C6.77295 4.02488 6.75 3.9509 6.75 3.87514C6.75 3.79938 6.77295 3.7254 6.81582 3.66293C6.85869 3.60047 6.91947 3.55246 6.99017 3.52522L8.38165 2.98991C8.40617 2.98049 8.42844 2.96603 8.44701 2.94745C8.46558 2.92888 8.48005 2.90661 8.48946 2.88209L9.02079 1.50045C9.04505 1.43512 9.08656 1.37758 9.14091 1.33395C9.19527 1.29033 9.26043 1.26226 9.32946 1.25272C9.41242 1.24268 9.49635 1.26063 9.56794 1.30373C9.63953 1.34682 9.69467 1.4126 9.72462 1.49061L10.2599 2.88209C10.2693 2.90661 10.2838 2.92888 10.3024 2.94745C10.321 2.96603 10.3432 2.98049 10.3677 2.98991L11.7592 3.52522C11.8299 3.55246 11.8907 3.60047 11.9336 3.66293C11.9765 3.7254 11.9994 3.79938 11.9994 3.87514C11.9994 3.9509 11.9765 4.02488 11.9336 4.08735C11.8907 4.14981 11.8299 4.19782 11.7592 4.22506L10.3677 4.76037C10.3432 4.76979 10.321 4.78425 10.3024 4.80283C10.2838 4.8214 10.2693 4.84367 10.2599 4.86819L9.72462 6.25967C9.69743 6.33042 9.64944 6.39127 9.58697 6.4342C9.5245 6.47713 9.45049 6.50012 9.3747 6.50014Z" />
                                </g>
                                <defs>
                                  <clipPath id="clip0_4961_18587">
                                    <rect
                                      width="12"
                                      height="12"
                                      fill="white"
                                      transform="translate(0 0.5)"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                            </span>

                            <span>Fill with AI</span>
                          </button>

                          {showAutoFillModal && (
                            <AutoFillModal
                              setShowAutoFillModal={setShowAutoFillModal}
                              handleGenerate={handleGenerate}
                              isLoading={isLoading}
                            />
                          )}
                        </div>
                      </div>

                      <textarea
                        type="text"
                        className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none resize-y min-h-36 border-border bg-[#181A1C] placeholder:text-white/40 recent__bar"
                        placeholder="Enter your table description here"
                        {...register(`tables.${index}.description`, {
                          required: false,
                        })}
                        disabled={update ? !showBtn : false}
                      />
                    </div>

                    <div className="flex flex-col w-full p-4 space-y-6 rounded-md bg-[#1B1D1F]">
                      {data?.columns?.map((column, i) => {
                        return (
                          <GenerateCol
                            data={column}
                            index={i}
                            tableId={index}
                            register={register}
                            control={control}
                            setValue={setValue}
                            getValues={getValues}
                            key={i}
                            update={update}
                            showBtn={showBtn}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {currentTab === "joining" && (
                <div className="col-span-12">
                  <div className="flex flex-col space-y-4">
                    {currentTab === "joining" && showInfo && (
                      <div className="w-full rounded-md p-4 bg-[#1E2022] flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium tracking-wide text-white">
                            What is Data Joining setup?
                          </p>

                          <span
                            className="flex items-center justify-center"
                            onClick={() => setShowInfo(false)}
                          >
                            <svg
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3 fill-secondary-text hover:fill-primary-text"
                            >
                              <path d="M1.33464 11.8307L0.167969 10.6641L4.83464 5.9974L0.167969 1.33073L1.33464 0.164062L6.0013 4.83073L10.668 0.164062L11.8346 1.33073L7.16797 5.9974L11.8346 10.6641L10.668 11.8307L6.0013 7.16406L1.33464 11.8307Z" />
                            </svg>
                          </span>
                        </div>

                        <ul className="flex flex-col space-y-2 text-sm font-normal tracking-wide list-disc list-inside text-white/50">
                          <li>
                            To enhance the AI's ability to analyze your data,
                            please specify the joins between tables:
                          </li>
                          <li>
                            <span className="font-bold">Table Joins:</span>{" "}
                            Identify pairs of tables that can be joined,
                            specifying the columns that relate them. This helps
                            the AI understand how your data is interconnected.
                          </li>
                          <li>
                            <span className="font-bold">Multiple Joins:</span>{" "}
                            You can add multiple joins to cover all relevant
                            relationships between your tables, enabling more
                            complex analyses.
                          </li>
                          <li>
                            Providing clear join information ensures that the AI
                            can accurately combine data from different tables
                            for comprehensive insights.
                          </li>
                        </ul>
                      </div>
                    )}

                    <JoinsSets
                      currentTableName={data?.name}
                      columns={data?.columns}
                      getValues={getValues}
                      setValue={setValue}
                      name={`tables.${index}.joins`}
                      initialData={data?.joins}
                      update={update}
                      showBtn={showBtn}
                    />
                  </div>
                </div>
              )}

              {currentTab === "specific-data" && (
                <div className="col-span-12">
                  <div className="flex flex-col space-y-4">
                    {currentTab === "specific-data" && showInfo && (
                      <div className="w-full rounded-md p-4 bg-[#1E2022] flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium tracking-wide text-white">
                            Concept
                          </p>

                          <span
                            className="flex items-center justify-center"
                            onClick={() => setShowInfo(false)}
                          >
                            <svg
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3 fill-secondary-text hover:fill-primary-text"
                            >
                              <path d="M1.33464 11.8307L0.167969 10.6641L4.83464 5.9974L0.167969 1.33073L1.33464 0.164062L6.0013 4.83073L10.668 0.164062L11.8346 1.33073L7.16797 5.9974L11.8346 10.6641L10.668 11.8307L6.0013 7.16406L1.33464 11.8307Z" />
                            </svg>
                          </span>
                        </div>

                        <p className="text-sm font-normal tracking-wide text-white/50">
                          To guide the AI in handling specific or complex
                          calculations, please define the following:
                        </p>
                        <p className="text-sm font-normal tracking-wide text-white/50">
                          <span className="font-bold">Concept Name:</span> Give
                          a clear and concise name to the concept or rule.
                        </p>
                        <p className="text-sm font-normal tracking-wide text-white/50">
                          <span className="font-bold">Concept Tags:</span> List
                          tags that will trigger this concept during analysis or
                          query generation. These tags act as keywords the AI
                          will recognize.
                        </p>
                        <p className="text-sm font-normal tracking-wide text-white/50">
                          <span className="font-bold">Context:</span> Describe
                          the concept in plain English, explaining any nuances
                          or rules the AI should follow.
                        </p>
                        <p className="text-sm font-normal tracking-wide text-white/50">
                          These details help the AI apply your specific logic
                          and rules accurately during data analysis.
                        </p>

                        <ul className="flex flex-col space-y-2 text-sm font-normal tracking-wide list-disc list-inside text-white/50">
                          <li>
                            A Concept can have multiple tags or none at all.
                          </li>
                          <li>
                            Without tags, a Concept is always relevant, and its
                            context is always passed to the Datasource.
                          </li>
                          <li>
                            The Datasource searches for tags in questions to
                            match them with the associated Concept.
                          </li>
                          <li>
                            Context for each Concept is passed to the Datasource
                            when a tag is detected or with every question if no
                            tag is present.
                          </li>
                        </ul>
                      </div>
                    )}

                    <ConceptForSpecificDataResponse
                      name={`tables.${index}.formulae`}
                      setValue={setValue}
                    />
                  </div>
                </div>
              )}

              {/* <div className="col-span-6">
                <div className="flex flex-col space-y-2">
                  <JoinsSets
                    currentTableName={data?.name}
                    columns={data?.columns}
                    getValues={getValues}
                    setValue={setValue}
                    name={`tables.${index}.joins`}
                    initialData={data?.joins}
                    update={update}
                    showBtn={showBtn}
                  />

                  <FormulaeSets
                    setValue={setValue}
                    name={`tables.${index}.formulae`}
                    initialData={data?.formulae}
                    update={update}
                    showBtn={showBtn}
                  />
                </div>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateContextDropdown;

const GenerateCol = ({
  data,
  index,
  tableId,
  register,
  control,
  setValue,
  getValues,
  update,
  showBtn,
}) => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [currentModel, setCurrentModel] = useState("");

  useEffect(() => {
    const fullData = getValues(`tables.${tableId}.columns.${index}`);

    if (fullData.examples && fullData.examples.length > 0) {
      setTags(fullData.examples);
    } else {
      setTags([]);
    }
  }, []);

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      setTags([...tags, inputValue.trim()]);
      setInputValue("");

      setValue(`tables.${tableId}.columns.${index}.examples`, [
        ...tags,
        inputValue.trim(),
      ]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);

    setValue(`tables.${tableId}.columns.${index}.examples`, updatedTags);
  };

  // useEffect(() => {
  //   setValue(`tables.${tableId}.columns.${index}.examples`, tags);
  // }, [tags]);

  const handleSelect = (value) => {
    // setCurrentModel(value);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        <div className="flex w-full space-x-4">
          <div className="flex flex-col w-64 space-y-4">
            {index === 0 && (
              <p className="text-xs tracking-wide text-white/40">Column name</p>
            )}

            <p className="text-sm font-medium tracking-wide text-white">
              {data?.name}
            </p>

            {data?.col_type === "DATE" && (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-green-200 bg-green-800 rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}

            {data?.col_type === "STRING" && (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-[#A3CAFF] bg-[#313F71] rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}

            {data?.col_type === "NUMBER" && (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-[#C4A3FF] bg-[#4F4062] rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}

            {["NUMBER", "STRING", "DATE"].includes(data?.col_type) || (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-yellow-100 bg-yellow-800 rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}
          </div>

          <div className="flex flex-col w-full space-y-4">
            {index === 0 && (
              <p className="text-xs tracking-wide text-white/40">Cardinality</p>
            )}

            <Controller
              name={`tables.${tableId}.columns.${index}.cardinality`}
              control={control}
              rules={{ required: "Model selection is required" }}
              render={({
                field: { onChange, value, ref },
                fieldState: { error },
              }) => (
                <SelectOption
                  options={optionsCardinality}
                  onSelect={(value) => {
                    onChange(value.value);
                    handleSelect(value);
                  }}
                  placeholder="Choose cardinality"
                  value={optionsCardinality.find(
                    (option) => option.value === value
                  )}
                  defaultValue={{
                    value: data.cardinality,
                    label: data.cardinality,
                  }}
                  disabled={update ? !showBtn : false}
                />
              )}
            />
          </div>
        </div>
      </div>

      <div className="col-span-8">
        <div className="flex w-full space-x-4">
          <div className="flex flex-col w-full space-y-4">
            {index === 0 && (
              <p className="text-xs tracking-wide text-white/40">Description</p>
            )}

            <textarea
              type="text"
              className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none resize-y min-h-28 border-border bg-[#181A1C] placeholder:text-white/40 recent__bar"
              placeholder="Enter column description here"
              {...register(`tables.${tableId}.columns.${index}.description`, {
                required: false,
              })}
              disabled={update ? !showBtn : false}
            />
          </div>

          <div className="flex flex-col w-full space-y-4">
            {index === 0 && (
              <p className="text-xs tracking-wide text-white/40">
                Sample values
              </p>
            )}
            <div className="flex flex-col px-2 py-1 space-y-1 overflow-y-auto border rounded-md h-28 border-border bg-[#181A1C] recent__bar">
              {tags?.map((tag) => {
                return (
                  <button
                    type="button"
                    className="flex items-center justify-between px-2 py-2 text-xs font-normal text-white rounded-md cursor-auto bg-foreground"
                    disabled={update ? !showBtn : false}
                  >
                    <span>{tag}</span>

                    <span
                      className="flex items-center justify-center cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
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
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </span>
                  </button>
                );
              })}

              <textarea
                type="text"
                className="flex-1 w-full px-1 py-2 text-sm text-white bg-transparent outline-none resize-none min-h-20 placeholder:text-white/40"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={update ? !showBtn : false}
                placeholder="Enter sample values here"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
