import React, { useEffect, useRef, useState } from "react";
import SelectOption from "../common/SelectOption";
import { Controller } from "react-hook-form";
import {
  useGetOrganizationPreferenceMutation,
  useGetOrganizationListQuery,
} from "@/store/organization";
import { useSelector } from "react-redux";
import { currentOrganizationSelector } from "@/store/current_organization";
import SelectIconOptions from "../common/SelectIconOptions";

const optionsOpenAI = [
  { value: "text-embedding-ada-002", label: "text-embedding-ada-002" },
  { value: "text-embedding-3-small", label: "text-embedding-3-small" },
  { value: "text-embedding-3-large", label: "text-embedding-3-large" },
];

const optionsAzure = [
  { value: "text-embedding-ada-002-2", label: "text-embedding-ada-002-2" },
  { value: "text-embedding-3-large-1", label: "text-embedding-3-large-1" },
];

const SelectEmbeddingDropdown = ({
  register,
  setValue,
  control,
  getValues,
  isValid = () => {},
  isDirty = () => {},
  updateInfo = () => {},
  reset = () => {},
  watch,
  show,
  setShow,
  status = "",
}) => {
  const [database, setDatabase] = useState("");
  const [isDatabaseLoading, setIsDatabaseLoading] = useState(true);
  const [currentModel, setCurrentModel] = useState(null);
  const [deploymentName, setDeploymentName] = useState("");
  const [anyModelEnabled, setAnyModelEnabled] = useState(false); // New state to track if any model is enabled
  const currentOrg = useSelector(currentOrganizationSelector);
  const [getOrganizationPreference] = useGetOrganizationPreferenceMutation();

  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const [state, setState] = useState({
    openai: false,
    azure_openai: false,
  });

  const {
    data: organizationList,
    isLoading: orgsLoading,
    error: orgsError,
  } = useGetOrganizationListQuery();

  useEffect(() => {
    if (organizationList) {
      const currentOrganization = organizationList.find(
        (org) => org.id === currentOrg.id
      );

      if (
        currentOrganization?.attributes?.membership_tier.includes("enterprise")
      ) {
        setState((prevState) => ({
          ...prevState,
          openai: true,
          azure_openai: true,
        }));
        setAnyModelEnabled(true);
      } else if (
        currentOrganization?.attributes?.membership_tier.includes("free")
      ) {
        fetchEnabledState(currentOrg.id);
      }
    }
  }, [currentOrg, organizationList]);

  const currModel = watch("embedding_model.model");

  useEffect(() => {
    const databaseData = getValues("embedding_model.embedding_provider");
    // const llmModel = getValues("embedding_model.model");

    if (currModel) {
      setCurrentModel({ value: currModel, label: currModel });
    } else {
      setCurrentModel(null);
    }

    if (databaseData) {
      setDatabase(databaseData);
      setIsDatabaseLoading(false);
    } else {
      setDatabase("");
      setIsDatabaseLoading(false);
    }
  }, [currModel]);

  const handleEmbeddingModel = (newDatabase) => {
    setDatabase(newDatabase);
    setValue("embedding_model.embedding_provider", newDatabase, {
      shouldValidate: true,
    });
  };

  const handleDeploymentNameChange = (e) => {
    setDeploymentName(e.target.value);
    setValue("embedding_model.deployment_name", e.target.value, {
      shouldValidate: true,
    });
  };

  const fetchEnabledState = async (orgId) => {
    try {
      const { data } = await getOrganizationPreference({
        organization_id: orgId,
      });
      if (data) {
        const newState = {
          openai: data.openai_preference?.openai_key_enabled || false,
          azure_openai:
            data.azure_openai_preference?.azure_openai_key_enabled || false,
        };
        setState(newState);
        setAnyModelEnabled(newState.openai || newState.azure_openai); // Update if any model is enabled
      }
    } catch (error) {
      console.error("Error fetching organization preferences", error);
    }
  };

  const handleSelect = (value) => {
    setCurrentModel(value);
  };

  const handleReset = () => {
    const values = getValues();

    const newValues = {
      ...values,
      embedding_model: {
        embedding_provider: "openai",
        model: "",
      },
    };

    setDatabase("openai");
    setCurrentModel(null);
    reset(newValues);
    setShow(false);
  };

  const databaseOptions = [
    { value: "openai", label: "OpenAI", icon: "/assets/chatgpt-icon.svg" },
    { value: "azure_openai", label: "Azure OpenAI", icon: "/assets/azure.svg" },
  ];

  return (
    <div
      className={`absolute top-[110%] right-0 z-[100] flex flex-col border rounded-md border-dropdown-border min-w-72 w-full max-w-72 bg-dropdown-bg shadow-md ${
        show || "hidden"
      }`}
      ref={modalRef}
    >
      <div className="flex flex-col px-4 py-4 space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="w-full">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-normal text-primary-text">Model Provider</p>

                {/* <button
                  type="button"
                  className="text-sm font-medium text-secondary hover:text-white"
                  onClick={() => handleReset()}
                >
                  Reset
                </button> */}
              </div>

              {/* <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`flex items-center justify-center w-full px-2 py-2 space-x-2 text-sm font-normal text-white border-2 rounded-md cursor-pointer ${
                    database === "openai" ? "border-secondary" : "border-border"
                  } ${!state.openai && "opacity-50"}`}
                  onClick={() => handleEmbeddingModel("openai")}
                  data-tooltip-id="tooltip"
                  data-tooltip-content={
                    !state.openai
                      ? "Enable this Model or Upgrade to pro plan to access all features."
                      : ""
                  }
                  data-tooltip-place="top"
                >
                  <img
                    src="/assets/chatgpt-icon.svg"
                    alt=""
                    className="w-6 h-6"
                  />
                  <span>OpenAI</span>
                </button>

                <button
                  type="button"
                  className={`flex items-center justify-center w-full px-2 py-2 space-x-2 text-sm font-normal text-white border-2 rounded-md cursor-pointer ${
                    database === "azure_openai"
                      ? "border-secondary"
                      : "border-border"
                  } ${!state.openai && "opacity-50"}`}
                  onClick={() => handleEmbeddingModel("azure_openai")}
                  data-tooltip-id="tooltip"
                  data-tooltip-content={
                    !state.openai
                      ? "Enable this Model or Upgrade to pro plan to access all features."
                      : ""
                  }
                  data-tooltip-place="top"
                >
                  <img src="/assets/azure.svg" alt="" className="w-6 h-6" />
                  <span>Azure OpenAI</span>
                </button>
              </div> */}

              {isDatabaseLoading || (
                <Controller
                  name="embedding_model.model"
                  control={control}
                  rules={{ required: "Model selection is required" }}
                  render={({
                    field: { onChange, value, ref },
                    fieldState: { error },
                  }) => (
                    <SelectIconOptions
                      options={databaseOptions}
                      onSelect={(value) => {
                        onChange(value.value);
                        handleEmbeddingModel(value.value);
                      }}
                      placeholder="Choose embedding provider"
                      value={database}
                      defaultValue={databaseOptions.find(
                        (type) => type.value === database
                      )}
                      bgColor="var(--bg-secondary)"
                      borderColor="var(--input-border)"
                    />
                  )}
                />
              )}

              <input
                type="hidden"
                value={database}
                {...register("embedding_model.embedding_provider", {
                  required: true,
                })}
              />
            </div>
          </div>

          {anyModelEnabled ? (
            <div className="w-full">
              {database && (
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-normal text-primary-text">
                        Configure Model
                      </p>
                    </div>

                    <Controller
                      name="embedding_model.model"
                      control={control}
                      rules={{ required: "Model selection is required" }}
                      render={({
                        field: { onChange, value, ref },
                        fieldState: { error },
                      }) => (
                        <SelectOption
                          options={
                            database === "azure_openai"
                              ? optionsAzure
                              : optionsOpenAI
                          }
                          onSelect={(value) => {
                            onChange(value.value);
                            handleSelect(value);
                          }}
                          placeholder="Choose model"
                          value={currentModel}
                          defaultValue={currentModel}
                          bgColor="var(--bg-secondary)"
                          borderColor="var(--input-border)"
                        />
                      )}
                    />

                    {database === "azure_openai" && (
                      <input
                        type="text"
                        placeholder="Enter the Deployment name ...."
                        value={deploymentName}
                        onChange={handleDeploymentNameChange}
                        className="w-full px-4 py-2 text-xs text-primary-text border border-input-border rounded-md bg-input-bg"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full border rounded-md border-border text-secondary-text">
              <p>Please enable at least one model to continue</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center w-full px-4 py-3 border-t border-border-color">
        <button
          type="button"
          className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap w-full bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
          disabled={!isValid || status === "pending"}
          onClick={updateInfo}
        >
          Save
        </button>

        {/* <div className="flex items-center space-x-2">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-foreground"
            onClick={() => handleReset()}
          >
            Reset
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default SelectEmbeddingDropdown;
