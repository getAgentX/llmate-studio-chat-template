import React, { useEffect, useState } from "react";
import SelectOption from "../common/SelectOption";
import { Controller } from "react-hook-form";
import {
  useGetOrganizationPreferenceMutation,
  useGetOrganizationListQuery,
} from "@/store/organization";
import { useSelector } from "react-redux";
import { currentOrganizationSelector } from "@/store/current_organization";

const optionsOpenAI = [
  { value: "text-embedding-ada-002", label: "text-embedding-ada-002" },
  { value: "text-embedding-3-small", label: "text-embedding-3-small" },
  { value: "text-embedding-3-large", label: "text-embedding-3-large" },
];

const optionsAzure = [
  { value: "text-embedding-ada-002-2", label: "text-embedding-ada-002-2" },
  { value: "text-embedding-3-large-1", label: "text-embedding-3-large-1" },
];

const SelectEmbedding = ({
  register,
  setValue,
  watch,
  control,
  getValues,
  isValid = () => {},
  isDirty = () => {},
  updateInfo = () => {},
  reset = () => {},
  handleCancel = () => {},
  update = false,
}) => {
  const [database, setDatabase] = useState("");
  const [showBtn, setShowBtn] = useState(false);
  const [currentModel, setCurrentModel] = useState({});
  const [deploymentName, setDeploymentName] = useState("");
  const [originalValues, setOriginalValues] = useState({});
  const [anyModelEnabled, setAnyModelEnabled] = useState(false); // New state to track if any model is enabled
  const currentOrg = useSelector(currentOrganizationSelector);
  const [getOrganizationPreference] = useGetOrganizationPreferenceMutation();

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
        setAnyModelEnabled(true); // At least one model is enabled for enterprise users
      } else if (
        currentOrganization?.attributes?.membership_tier.includes("free")
      ) {
        fetchEnabledState(currentOrg.id);
      }
    }
  }, [currentOrg, organizationList]);

  useEffect(() => {
    const databaseData = getValues("embedding_model.embedding_provider");
    const llmModel = getValues("embedding_model.model");

    console.log("llmModel", llmModel);

    if (llmModel) {
      setCurrentModel({ value: llmModel, label: llmModel });
    } else {
      setCurrentModel("");
    }

    if (databaseData) {
      setDatabase(databaseData);
    } else {
      setDatabase("");
    }

    // Store original values
    setOriginalValues(getValues());
  }, []);

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
        embedding_provider: "",
        model: "",
      },
    };

    setDatabase("");
    setCurrentModel("");
    reset(newValues);
  };

  const toggleEditMode = () => {
    if (showBtn) {
      reset(originalValues); // Reset to original values
    }
    setShowBtn(!showBtn);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col border rounded-md border-border bg-[#212426]">
        <div className="flex items-center justify-between w-full">
          {update && (
            <div className="flex items-center space-x-2">
              {showBtn && (
                <button
                  type="button"
                  className="text-sm font-medium text-secondary disabled:text-white/40"
                  disabled={!isValid || !isDirty}
                  onClick={updateInfo}
                >
                  Save
                </button>
              )}

              <a
                className="flex items-center justify-center px-2 space-x-2 text-sm font-medium tracking-wide cursor-pointer text-white/40 hover:text-white"
                onClick={toggleEditMode}
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
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                </span>
                <span>{showBtn ? "Cancel" : "Edit"}</span>
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-col px-6 py-4 space-y-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-normal text-white">
                    Select the required provider for your tasks
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`flex items-center justify-center w-full px-2 py-2 space-x-2 text-sm font-normal text-white border-2 rounded-md cursor-pointer ${
                      database === "openai"
                        ? "border-secondary"
                        : "border-border"
                    } ${!state.openai && "opacity-50"}`}
                    onClick={() => handleEmbeddingModel("openai")}
                    disabled={update ? !showBtn : false}
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
                    disabled={update ? !showBtn : false}
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
                </div>

                <input
                  type="hidden"
                  value={database}
                  {...register("embedding_model.embedding_provider", {
                    required: true,
                  })}
                  disabled={update ? !showBtn : false}
                />
              </div>
            </div>

            {anyModelEnabled ? (
              <div className="col-span-8 border rounded-md border-border">
                <div className="flex flex-col">
                  <div className="flex flex-col w-full px-4 py-4 text-center border-b border-border">
                    <p className="text-sm font-medium tracking-wide text-white">
                      Choose embedding model
                    </p>
                  </div>

                  {currentModel && (
                    <div className="flex flex-col px-4 py-4 space-y-4">
                      <div className="flex flex-col space-y-4">
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
                              disabled={update ? !showBtn : false}
                            />
                          )}
                        />

                        {database === "azure_openai" && (
                          <input
                            type="text"
                            placeholder="Enter the Deployment name ...."
                            value={deploymentName}
                            onChange={handleDeploymentNameChange}
                            className="w-full px-4 py-2 text-sm text-white bg-transparent border rounded-md outline-none placeholder:text-white/50 border-border"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center col-span-8 border rounded-md border-border text-white/50">
                <p>Please enable at least one model to continue</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {update || (
        <div className="flex items-center justify-between w-full py-4">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-foreground"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white rounded-md bg-foreground"
              onClick={() => handleReset()}
            >
              Reset
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
              disabled={!isValid || !anyModelEnabled}
            >
              Save & Next
            </button>
          </div>
        </div>
      )}

      {showBtn && update && (
        <div className="flex items-center justify-between w-full py-4">
          {/* <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-foreground"
            onClick={toggleEditMode}
          >
            Cancel Edit
          </button> */}

          <span></span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white rounded-md bg-foreground"
              onClick={() => handleReset()}
            >
              Reset
            </button>

            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
              disabled={!isValid || !isDirty}
              onClick={updateInfo}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectEmbedding;
