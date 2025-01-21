import React, { useEffect, useState } from "react";
import SqlGenerator from "./SqlGenerator";
import SqlRegenerator from "./SqlRegenerator";
import SqlValidation from "./SqlValidation";
import ConfirmModal from "../Modal/ConfirmModal";
import ErrorModal from "../Modal/ErrorModal";
import { useRouter } from "next/router";
import usePublished from "@/hooks/usePublished";
import { currentOrganizationSelector } from "@/store/current_organization";
import { useSelector } from "react-redux";
import { useGetDatasourceInfoQuery } from "@/store/datasource";

const SqlConfiguration = ({
  register,
  setValue,
  control,
  getValues,
  watch,
  isValid = () => { },
  isDirty = () => { },
  updateInfo = () => { },
  reset = () => { },
  update = false,
  setCurrentSelectedTab = () => { },
  trigger = () => { },
  modifiedData,
  generatorError = "",
  regeneratorError = "",
  validatorError = "",
}) => {
  const [showGeneratorBtn, setShowGeneratorBtn] = useState(false);
  const [showRegeneratorBtn, setShowRegeneratorBtn] = useState(false);
  const [showValidatorBtn, setShowValidatorBtn] = useState(false);

  const [toggleRegenerator, setToggleRegenerator] = useState(false);
  const [toggleValidator, setToggleValidator] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showError, setShowError] = useState(false);

  const [isGenerationCollapsible, setIsGenerationCollapsible] = useState(false);
  const [isRegenerationCollapsible, setIsRegenerationCollapsible] =
    useState(false);
  const [isSummarizationCollapsible, setIsSummarizationCollapsible] =
    useState(false);

  useEffect(() => {
    if (generatorError || regeneratorError || validatorError) {
      setShowError(true);
    }
  }, [generatorError, regeneratorError, validatorError]);

  const router = useRouter();

  const {
    data: getRes,
    isLoading,
    error: getError,
    refetch,
  } = useGetDatasourceInfoQuery(
    {
      datasource_id: router.query.slug,
    },
    {
      skip: !router.query.slug,
    }
  );

  const currentOrg = useSelector(currentOrganizationSelector);

  const isPublished = usePublished(
    currentOrg,
    getRes?.organization_id,
    getRes?.is_published
  );

  useEffect(() => {
    if (Object.keys(modifiedData).length > 0) {
      if (Object.keys(modifiedData.sql_regenerator).length > 0) {
        setToggleRegenerator(true);
      }

      if (Object.keys(modifiedData.sql_validator).length > 0) {
        setToggleValidator(true);
      }
    }
  }, [modifiedData]);

  const handleTabChanges = (tab) => {
    setCurrentSelectedTab(tab);
    setShowGeneratorBtn(false);
    setShowRegeneratorBtn(false);
    setShowValidatorBtn(false);
  };

  const toggleEditMode = () => {
    if (showGeneratorBtn) {
      reset({}); // Reset to original values
    }

    setShowGeneratorBtn(!showGeneratorBtn);
    setShowRegeneratorBtn(!showRegeneratorBtn);
    setShowValidatorBtn(!showValidatorBtn);
    setConfirmCancel(false);
  };

  const handleToggleRegenerator = (e) => {
    setShowRegeneratorBtn(true);

    const isChecked = e.target.checked;

    if (!isChecked) {
      setValue("sql_regenerator", { sql_regenerator: null });
    } else {
      setValue(
        "sql_regenerator.default.system_instructions",
        `You are an assistant designed to correct the given wrong SQL query by using the examples provided.

## Below is the database info:
{table_info}


## General Guidelines to be followed strictly:
 - Always respond in markdown format - Your SQL should be enclosed with sql ACTUAL_SQL `,
        { shouldValidate: true, shouldDirty: true }
      );

      setValue(
        "sql_regenerator.default.human_instructions",
        `Question: {user_query}

*Wrong SQL:*
{wrong_sql}

**Error: **
{sql_execution_error}`,
        { shouldValidate: true, shouldDirty: true }
      );
    }

    setValue(
      "sql_regenerator.default.llm",
      {
        llm_provider: "openai",
        llm_model: "gpt-3.5-turbo-1106",
        max_tokens: 1000,
        temperature: 0,
        top_p: 0,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: [],
      },
      { shouldValidate: true, shouldDirty: true }
    );

    setValue("sql_regenerator.default.example_count", 5, {
      shouldValidate: true,
      shouldDirty: true,
    });

    trigger();
    setToggleRegenerator(isChecked);
  };

  const handleToggleValidator = (e) => {
    setShowValidatorBtn(true);

    const isChecked = e.target.checked;

    if (!isChecked) {
      setValue("sql_validator", { sql_validator: null });
    } else {
      setValue(
        "sql_validator.validation_template.system_instructions",
        `You are an AI designed to validate the SQL given by user using below examples.

## Table Info:
{table_info}

## Few Examples:
{examples}`,
        { shouldValidate: true, shouldDirty: true }
      );

      setValue(
        "sql_validator.validation_template.human_instructions",
        `**Question:** {user_query}

**SQL to Verify:**
{generated_sql}`,
        { shouldValidate: true, shouldDirty: true }
      );
    }

    setValue(
      "sql_validator.llm",
      {
        llm_provider: "openai",
        llm_model: "gpt-3.5-turbo-1106",
        max_tokens: 1000,
        temperature: 0,
        top_p: 0,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: [],
      },
      { shouldValidate: true, shouldDirty: true }
    );

    setValue("sql_validator.example_count", 5, {
      shouldValidate: true,
      shouldDirty: true,
    });

    trigger();
    setToggleValidator(isChecked);
  };

  const handlePrimary = () => {
    window.open("/model-management", "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="flex flex-col space-y-2 bg-page">
        <div
          className="flex items-center justify-between px-3 py-2 cursor-pointer h-9 bg-secondary-bg"
          onClick={() => {
            if (!showGeneratorBtn) {
              setIsGenerationCollapsible(!isGenerationCollapsible);
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <p
              className={`text-xs ${isGenerationCollapsible
                  ? "text-primary-text font-medium"
                  : "text-secondary-text font-normal"
                }`}
            >
              SQL Generation
            </p>

            <div className="relative group">
              <span className="flex items-center justify-center cursor-pointer">
                <svg
                  viewBox="0 0 14 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${isGenerationCollapsible
                      ? "fill-icon-color-hover"
                      : "fill-icon-color"
                    }`}
                >
                  <path d="M6.33398 10.8334H7.66732V6.83337H6.33398V10.8334ZM7.00065 5.50004C7.18954 5.50004 7.34787 5.43615 7.47565 5.30837C7.60343 5.1806 7.66732 5.02226 7.66732 4.83337C7.66732 4.64448 7.60343 4.48615 7.47565 4.35837C7.34787 4.2306 7.18954 4.16671 7.00065 4.16671C6.81176 4.16671 6.65343 4.2306 6.52565 4.35837C6.39787 4.48615 6.33398 4.64448 6.33398 4.83337C6.33398 5.02226 6.39787 5.1806 6.52565 5.30837C6.65343 5.43615 6.81176 5.50004 7.00065 5.50004ZM7.00065 14.1667C6.07843 14.1667 5.21176 13.9917 4.40065 13.6417C3.58954 13.2917 2.88398 12.8167 2.28398 12.2167C1.68398 11.6167 1.20898 10.9112 0.858984 10.1C0.508984 9.28893 0.333984 8.42226 0.333984 7.50004C0.333984 6.57782 0.508984 5.71115 0.858984 4.90004C1.20898 4.08893 1.68398 3.38337 2.28398 2.78337C2.88398 2.18337 3.58954 1.70837 4.40065 1.35837C5.21176 1.00837 6.07843 0.833374 7.00065 0.833374C7.92287 0.833374 8.78954 1.00837 9.60065 1.35837C10.4118 1.70837 11.1173 2.18337 11.7173 2.78337C12.3173 3.38337 12.7923 4.08893 13.1423 4.90004C13.4923 5.71115 13.6673 6.57782 13.6673 7.50004C13.6673 8.42226 13.4923 9.28893 13.1423 10.1C12.7923 10.9112 12.3173 11.6167 11.7173 12.2167C11.1173 12.8167 10.4118 13.2917 9.60065 13.6417C8.78954 13.9917 7.92287 14.1667 7.00065 14.1667ZM7.00065 12.8334C8.48954 12.8334 9.75065 12.3167 10.784 11.2834C11.8173 10.25 12.334 8.98893 12.334 7.50004C12.334 6.01115 11.8173 4.75004 10.784 3.71671C9.75065 2.68337 8.48954 2.16671 7.00065 2.16671C5.51176 2.16671 4.25065 2.68337 3.21732 3.71671C2.18398 4.75004 1.66732 6.01115 1.66732 7.50004C1.66732 8.98893 2.18398 10.25 3.21732 11.2834C4.25065 12.3167 5.51176 12.8334 7.00065 12.8334Z" />
                </svg>
              </span>

              <div className="absolute z-50 hidden w-full p-2 text-xs font-medium tracking-wider text-center border rounded-md border-border-color bg-secondary-bg text-secondary-text group-hover:block bottom-6 left-2 min-w-64 max-w-64">
                When enabled, the datasource retrieves information from the 'SQL
                Summarization' section when it is queried by the user.
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isGenerationCollapsible && (
              <div className="flex items-center space-x-4">
                {showGeneratorBtn || isPublished || (
                  <button
                    className="flex items-center justify-center w-full h-7 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowGeneratorBtn(true);
                    }}
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
                )}

                {showGeneratorBtn && (
                  <div className="flex items-center space-x-4">
                    <a
                      className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-primary-text"
                      onClick={(event) => {
                        event.stopPropagation();
                        setShowGeneratorBtn(false);
                      }}
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
                    </a>

                    <button
                      className={`flex items-center space-x-2 text-xs font-medium group   disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable ${isDirty
                          ? "text-[#2A9E28] hover:text-primary-text"
                          : "text-btn-normal-text hover:text-btn-normal-hover"
                        }`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isDirty) {
                          updateInfo();
                          handleTabChanges("sql_generator");
                        }
                      }}
                      disabled={!isValid || !isDirty}
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
            )}

            {isGenerationCollapsible ? (
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 8 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                >
                  <path d="M4 0.733415L0 4.73341L0.933333 5.66675L4 2.60008L7.06667 5.66675L8 4.73341L4 0.733415Z" />
                </svg>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                >
                  <path d="M0 12V6.66667H1.33333V9.73333L9.73333 1.33333H6.66667V0H12V5.33333H10.6667V2.26667L2.26667 10.6667H5.33333V12H0Z" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {isGenerationCollapsible && (
          <SqlGenerator
            register={register}
            setValue={setValue}
            control={control}
            getValues={getValues}
            watch={watch}
            update={update}
            showBtn={showGeneratorBtn}
          />
        )}

        <div
          className="flex items-center justify-between px-3 py-2 cursor-pointer h-9 bg-secondary-bg"
          onClick={() => {
            if (!showRegeneratorBtn) {
              setIsRegenerationCollapsible(!isRegenerationCollapsible);
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <p
              className={`text-xs ${isRegenerationCollapsible
                  ? "text-primary-text font-medium"
                  : "text-secondary-text font-normal"
                }`}
            >
              SQL Re-generation
            </p>

            <div className="relative group">
              <span className="flex items-center justify-center cursor-pointer">
                <svg
                  viewBox="0 0 14 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${isRegenerationCollapsible
                      ? "fill-icon-color-hover"
                      : "fill-icon-color"
                    }`}
                >
                  <path d="M6.33398 10.8334H7.66732V6.83337H6.33398V10.8334ZM7.00065 5.50004C7.18954 5.50004 7.34787 5.43615 7.47565 5.30837C7.60343 5.1806 7.66732 5.02226 7.66732 4.83337C7.66732 4.64448 7.60343 4.48615 7.47565 4.35837C7.34787 4.2306 7.18954 4.16671 7.00065 4.16671C6.81176 4.16671 6.65343 4.2306 6.52565 4.35837C6.39787 4.48615 6.33398 4.64448 6.33398 4.83337C6.33398 5.02226 6.39787 5.1806 6.52565 5.30837C6.65343 5.43615 6.81176 5.50004 7.00065 5.50004ZM7.00065 14.1667C6.07843 14.1667 5.21176 13.9917 4.40065 13.6417C3.58954 13.2917 2.88398 12.8167 2.28398 12.2167C1.68398 11.6167 1.20898 10.9112 0.858984 10.1C0.508984 9.28893 0.333984 8.42226 0.333984 7.50004C0.333984 6.57782 0.508984 5.71115 0.858984 4.90004C1.20898 4.08893 1.68398 3.38337 2.28398 2.78337C2.88398 2.18337 3.58954 1.70837 4.40065 1.35837C5.21176 1.00837 6.07843 0.833374 7.00065 0.833374C7.92287 0.833374 8.78954 1.00837 9.60065 1.35837C10.4118 1.70837 11.1173 2.18337 11.7173 2.78337C12.3173 3.38337 12.7923 4.08893 13.1423 4.90004C13.4923 5.71115 13.6673 6.57782 13.6673 7.50004C13.6673 8.42226 13.4923 9.28893 13.1423 10.1C12.7923 10.9112 12.3173 11.6167 11.7173 12.2167C11.1173 12.8167 10.4118 13.2917 9.60065 13.6417C8.78954 13.9917 7.92287 14.1667 7.00065 14.1667ZM7.00065 12.8334C8.48954 12.8334 9.75065 12.3167 10.784 11.2834C11.8173 10.25 12.334 8.98893 12.334 7.50004C12.334 6.01115 11.8173 4.75004 10.784 3.71671C9.75065 2.68337 8.48954 2.16671 7.00065 2.16671C5.51176 2.16671 4.25065 2.68337 3.21732 3.71671C2.18398 4.75004 1.66732 6.01115 1.66732 7.50004C1.66732 8.98893 2.18398 10.25 3.21732 11.2834C4.25065 12.3167 5.51176 12.8334 7.00065 12.8334Z" />
                </svg>
              </span>

              <div className="absolute z-50 hidden w-full p-2 text-xs font-medium tracking-wider text-center border rounded-md border-border-color bg-secondary-bg text-secondary-text group-hover:block bottom-6 left-2 min-w-64 max-w-64">
                When enabled, the datasource retrieves information from the 'SQL
                Regeneration' section when it is queried by the user.
              </div>
            </div>

            {isRegenerationCollapsible && showRegeneratorBtn && (
              <div
                className="flex items-center space-x-4"
                onClick={(e) => e.stopPropagation()}
              >
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toggleRegenerator}
                    className="sr-only peer"
                    onChange={(e) => handleToggleRegenerator(e)}
                  />
                  {/* <div
                    className={`relative w-11 h-6 bg-[#0B1737] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[#295EF4] after:border-[#295EF4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B1737]   ${
                      !toggleRegenerator ? "opacity-50" : "opacity-100"
                    }`}
                  ></div> */}

                  <div
                    className={`relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all ${!toggleRegenerator
                        ? "peer-checked:bg-blue-600/50 opacity-50"
                        : ""
                      }`}
                  ></div>
                </label>

                {toggleRegenerator && (
                  <span className="text-xs font-medium   text-primary-text">
                    Enabled
                  </span>
                )}

                {toggleRegenerator || (
                  <span className="text-xs font-medium   text-secondary-text">
                    Disabled
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isRegenerationCollapsible && (
              <div className="flex items-center space-x-4">
                {showRegeneratorBtn || isPublished || (
                  <button
                    className="flex items-center justify-center w-full h-7 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowRegeneratorBtn(true);
                    }}
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
                )}

                {showRegeneratorBtn && (
                  <div className="flex items-center space-x-4">
                    <a
                      className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-primary-text"
                      onClick={(event) => {
                        event.stopPropagation();
                        setShowRegeneratorBtn(false);
                      }}
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
                    </a>

                    <button
                      className={`flex items-center space-x-2 text-xs font-medium group   disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable ${isDirty
                          ? "text-[#2A9E28] hover:text-primary-text"
                          : "text-btn-normal-text hover:text-btn-normal-hover"
                        }`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isDirty) {
                          updateInfo();
                          handleTabChanges("sql_regenerator");
                        }
                      }}
                      disabled={!isValid || !isDirty}
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
            )}

            {isRegenerationCollapsible ? (
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 8 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                >
                  <path d="M4 0.733415L0 4.73341L0.933333 5.66675L4 2.60008L7.06667 5.66675L8 4.73341L4 0.733415Z" />
                </svg>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                >
                  <path d="M0 12V6.66667H1.33333V9.73333L9.73333 1.33333H6.66667V0H12V5.33333H10.6667V2.26667L2.26667 10.6667H5.33333V12H0Z" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {isRegenerationCollapsible && (
          <SqlRegenerator
            register={register}
            setValue={setValue}
            control={control}
            getValues={getValues}
            watch={watch}
            update={update}
            showBtn={showRegeneratorBtn}
            disabledRegenerator={toggleRegenerator}
          />
        )}

        <div
          className="flex items-center justify-between px-3 py-2 cursor-pointer h-9 bg-secondary-bg"
          onClick={() => {
            if (!showValidatorBtn) {
              setIsSummarizationCollapsible(!isSummarizationCollapsible);
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <p
              className={`text-xs ${isSummarizationCollapsible
                  ? "text-primary-text font-medium"
                  : "text-secondary-text font-normal"
                }`}
            >
              SQL Summarization
            </p>

            <div className="relative group">
              <span className="flex items-center justify-center cursor-pointer">
                <svg
                  viewBox="0 0 14 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${isSummarizationCollapsible
                      ? "fill-icon-color-hover"
                      : "fill-icon-color"
                    }`}
                >
                  <path d="M6.33398 10.8334H7.66732V6.83337H6.33398V10.8334ZM7.00065 5.50004C7.18954 5.50004 7.34787 5.43615 7.47565 5.30837C7.60343 5.1806 7.66732 5.02226 7.66732 4.83337C7.66732 4.64448 7.60343 4.48615 7.47565 4.35837C7.34787 4.2306 7.18954 4.16671 7.00065 4.16671C6.81176 4.16671 6.65343 4.2306 6.52565 4.35837C6.39787 4.48615 6.33398 4.64448 6.33398 4.83337C6.33398 5.02226 6.39787 5.1806 6.52565 5.30837C6.65343 5.43615 6.81176 5.50004 7.00065 5.50004ZM7.00065 14.1667C6.07843 14.1667 5.21176 13.9917 4.40065 13.6417C3.58954 13.2917 2.88398 12.8167 2.28398 12.2167C1.68398 11.6167 1.20898 10.9112 0.858984 10.1C0.508984 9.28893 0.333984 8.42226 0.333984 7.50004C0.333984 6.57782 0.508984 5.71115 0.858984 4.90004C1.20898 4.08893 1.68398 3.38337 2.28398 2.78337C2.88398 2.18337 3.58954 1.70837 4.40065 1.35837C5.21176 1.00837 6.07843 0.833374 7.00065 0.833374C7.92287 0.833374 8.78954 1.00837 9.60065 1.35837C10.4118 1.70837 11.1173 2.18337 11.7173 2.78337C12.3173 3.38337 12.7923 4.08893 13.1423 4.90004C13.4923 5.71115 13.6673 6.57782 13.6673 7.50004C13.6673 8.42226 13.4923 9.28893 13.1423 10.1C12.7923 10.9112 12.3173 11.6167 11.7173 12.2167C11.1173 12.8167 10.4118 13.2917 9.60065 13.6417C8.78954 13.9917 7.92287 14.1667 7.00065 14.1667ZM7.00065 12.8334C8.48954 12.8334 9.75065 12.3167 10.784 11.2834C11.8173 10.25 12.334 8.98893 12.334 7.50004C12.334 6.01115 11.8173 4.75004 10.784 3.71671C9.75065 2.68337 8.48954 2.16671 7.00065 2.16671C5.51176 2.16671 4.25065 2.68337 3.21732 3.71671C2.18398 4.75004 1.66732 6.01115 1.66732 7.50004C1.66732 8.98893 2.18398 10.25 3.21732 11.2834C4.25065 12.3167 5.51176 12.8334 7.00065 12.8334Z" />
                </svg>
              </span>

              <div className="absolute z-50 hidden w-full p-2 text-xs font-medium tracking-wider text-center border rounded-md border-border-color bg-secondary-bg text-secondary-text group-hover:block bottom-6 left-2 min-w-64 max-w-64">
                When enabled, the datasource retrieves information from the 'SQL
                Summarization' section when it is queried by the user.
              </div>
            </div>

            {isSummarizationCollapsible && showValidatorBtn && (
              <div
                className="flex items-center space-x-4"
                onClick={(e) => e.stopPropagation()}
              >
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toggleValidator}
                    className="sr-only peer"
                    onChange={(e) => handleToggleValidator(e)}
                  />
                  {/* <div
                    className={`relative w-11 h-6 bg-[#0B1737] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[#295EF4] after:border-[#295EF4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B1737]   ${
                      !toggleValidator ? "opacity-50" : "opacity-100"
                    }`}
                  ></div> */}

                  <div
                    className={`relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all ${!toggleValidator
                        ? "peer-checked:bg-blue-600/50 opacity-50"
                        : ""
                      }`}
                  ></div>
                </label>

                {toggleValidator && (
                  <span className="text-xs font-medium   text-primary-text">
                    Enabled
                  </span>
                )}

                {toggleValidator || (
                  <span className="text-xs font-medium   text-secondary-text">
                    Disabled
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isSummarizationCollapsible && (
              <div className="flex items-center space-x-4">
                {showValidatorBtn || isPublished || (
                  <button
                    className="flex items-center justify-center w-full h-7 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowValidatorBtn(true);
                    }}
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
                )}

                {showValidatorBtn && (
                  <div className="flex items-center space-x-4">
                    <a
                      className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-primary-text"
                      onClick={(event) => {
                        event.stopPropagation();
                        setShowValidatorBtn(false);
                      }}
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
                    </a>

                    <button
                      className={`flex items-center space-x-2 text-xs font-medium group   disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable ${isDirty
                          ? "text-[#2A9E28] hover:text-primary-text"
                          : "text-btn-normal-text hover:text-btn-normal-hover"
                        }`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isDirty) {
                          updateInfo();
                          handleTabChanges("sql_validator");
                        }
                      }}
                      disabled={!isValid || !isDirty}
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
            )}

            {isSummarizationCollapsible ? (
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 8 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                >
                  <path d="M4 0.733415L0 4.73341L0.933333 5.66675L4 2.60008L7.06667 5.66675L8 4.73341L4 0.733415Z" />
                </svg>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                >
                  <path d="M0 12V6.66667H1.33333V9.73333L9.73333 1.33333H6.66667V0H12V5.33333H10.6667V2.26667L2.26667 10.6667H5.33333V12H0Z" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {isSummarizationCollapsible && (
          <SqlValidation
            register={register}
            setValue={setValue}
            control={control}
            getValues={getValues}
            watch={watch}
            update={update}
            showBtn={showValidatorBtn}
            disabledValidation={toggleValidator}
          />
        )}
      </div>

      <ConfirmModal
        show={confirmCancel}
        setShow={setConfirmCancel}
        heading="Confirm Cancel"
        title={"Are you sure you want to cancel?"}
        description={""}
        primaryBtn="Yes, Confirm"
        primaryChange={toggleEditMode}
        secondaryBtn="No"
        secondaryChange={() => setConfirmCancel(false)}
      />

      <ErrorModal
        show={showError}
        setShow={setShowError}
        heading="Error Found"
        title=""
        description={
          generatorError?.data?.message ||
          regeneratorError?.data?.message ||
          validatorError?.data?.message
        }
        primaryBtn="Model Management"
        primaryChange={handlePrimary}
        secondaryBtn="Close"
        secondaryChange={() => setShowError(false)}
      />
    </>
  );
};

export default SqlConfiguration;
