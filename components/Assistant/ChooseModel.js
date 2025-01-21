import React, { useEffect, useState } from "react";
import SelectOption from "../common/SelectOption";
import { Controller } from "react-hook-form";
import {
  useGetOrganizationPreferenceMutation,
  useGetOrganizationListQuery,
} from "@/store/organization";
import { useSelector } from "react-redux";
import { currentOrganizationSelector } from "@/store/current_organization";

const openaiOptions = [
  { value: "gpt-3.5-turbo-1106", label: "gpt-3.5-turbo-1106" },
  { value: "gpt-3.5-turbo-0125", label: "gpt-3.5-turbo-0125" },
  { value: "gpt-4-0613", label: "gpt-4-0613" },
  { value: "gpt-4-1106-preview", label: "gpt-4-1106-preview" },
  { value: "gpt-4-0125-preview", label: "gpt-4-0125-preview" },
  { value: "gpt-4o-2024-05-13", label: "gpt-4o-2024-05-13" },
  { value: "gpt-4o-mini-2024-07-18", label: "gpt-4o-mini-2024-07-18" },
  { value: "gpt-4-turbo-preview", label: "gpt-4-turbo-preview" },
  { value: "gpt-4-turbo-2024-04-09", label: "gpt-4-turbo-2024-04-09" },
  { value: "gpt-4-turbo", label: "gpt-4-turbo" },
];

const vertexaiOptions = [
  { value: "gemini-pro", label: "gemini-pro" },
  { value: "chat-bison", label: "chat-bison" },
  { value: "codechat-bison", label: "codechat-bison" },
];

const claudeaiOptions = [
  { value: "claude-3-opus-20240229", label: "claude-3-opus-20240229" },
  { value: "claude-3-sonnet-20240229", label: "claude-3-sonnet-20240229" },
  { value: "claude-3-haiku-20240307", label: "claude-3-haiku-20240307" },
  { value: "claude-3-5-sonnet-20241022", label: "claude-3-5-sonnet-20241022" },
  { value: "claude-3-5-haiku-20241022", label: "claude-3-5-haiku-20241022" },
];

const azureOptions = [
  { value: "gpt-4o-2024-05-13", label: "gpt-4o-2024-05-13" },
  { value: "gpt-4-turbo-2024-04-09", label: "gpt-4-turbo-2024-04-09" },
  { value: "gpt-4-0613", label: "gpt-4-0613" },
  { value: "gpt-4-32k-0613", label: "gpt-4-32k-0613" },
  { value: "gpt-4-0125-preview", label: "gpt-4-0125-preview" },
  { value: "gpt-4-1106-preview", label: "gpt-4-1106-preview" },
  { value: "gpt-35-turbo-0125", label: "gpt-35-turbo-0125" },
  { value: "gpt-35-turbo-0613", label: "gpt-35-turbo-0613" },
  { value: "gpt-35-turbo-16k-0613", label: "gpt-35-turbo-16k-0613" },
  { value: "gpt-4o-mini-2024-07-18", label: "gpt-4o-mini-2024-07-18" },
];

const ChooseModel = ({
  register,
  setValue,
  getValues,
  control,
  watch,
  isValid = () => {},
  reset = () => {},
  handleCancel = () => {},
  back: previous,
}) => {
  const [database, setDatabase] = useState("");
  const [currentModel, setCurrentModel] = useState("");
  const [tokens, setTokens] = useState(0);
  const currentOrg = useSelector(currentOrganizationSelector);
  const [getOrganizationPreference] = useGetOrganizationPreferenceMutation();

  const [states, setStates] = useState({
    openai: false,
    claudeai: false,
    vertexai: false,
    azure_openai: false,
    finetuned_openai: false,
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
        setStates({
          openai: true,
          claudeai: true,
          vertexai: true,
          azure_openai: true,
          finetuned_openai: true,
        });
      } else if (
        currentOrganization?.attributes?.membership_tier.includes("free")
      ) {
        fetchEnabledStates(currentOrg.id);
      }
    }
  }, [currentOrg, organizationList]);

  useEffect(() => {
    const databaseData = getValues("stage_config.default.llm.llm_provider");
    const llmModel = getValues("stage_config.default.llm.llm_model");

    if (databaseData) {
      setDatabase(databaseData);
    } else {
      setDatabase("");
    }

    if (llmModel) {
      setCurrentModel({ value: llmModel, label: llmModel });
    } else {
      setCurrentModel("");
    }
  }, [getValues]);

  const fetchEnabledStates = async (orgId) => {
    try {
      const { data } = await getOrganizationPreference({
        organization_id: orgId,
      });
      if (data) {
        const newState = {
          openai: data.openai_preference?.openai_key_enabled || false,
          claudeai: data.claudeai_preference?.anthropic_key_enabled || false,
          vertexai: data.vertexai_preference?.vertex_creds_enabled || false,
          azure_openai:
            data.azure_openai_preference?.azure_openai_key_enabled || false,
        };
        setStates(newState);
      }
    } catch (error) {
      console.error("Error fetching organization preferences", error);
    }
  };

  const handleLLmProvider = (newDatabase) => {
    setCurrentModel("");
    setValue("stage_config.default.llm.llm_model", "", {
      shouldValidate: true,
    });

    setDatabase(newDatabase);
    setValue("stage_config.default.llm.llm_provider", newDatabase, {
      shouldValidate: true,
    });
  };

  const handleSelect = (value) => {
    setCurrentModel(value.value);
  };

  const handleMaxTokens = (status) => {
    if (status === "increase") {
      setValue("stage_config.default.llm.max_tokens", tokens + 1, {
        shouldValidate: true,
      });

      setTokens((prev) => prev + 1);
    }

    if (status === "decrease") {
      setValue("stage_config.default.llm.max_tokens", tokens - 1, {
        shouldValidate: true,
      });

      setTokens((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    const values = getValues();

    const newValues = {
      ...values,
      stage_config: {
        default: {
          sql_datasource_routing: {},
          chat_history_length: 2,
          system_instructions: "",
          llm: {
            llm_provider: "openai",
            llm_model: "gpt-3.5-turbo-1106",
            max_tokens: 1000,
            temperature: 0,
            top_p: 0,
            frequency_penalty: -2,
            presence_penalty: -2,
            stop: [],
          },
        },
      },
    };

    setDatabase("");
    setTokens(0);
    reset(newValues);
  };

  const temperature = watch("stage_config.default.llm.temperature");
  const topP = watch("stage_config.default.llm.top_p");
  const frequencyPenalty = watch("stage_config.default.llm.frequency_penalty");
  const presencePenalty = watch("stage_config.default.llm.presence_penalty");

  return (
    <div className="flex flex-col border rounded-md border-border">
      <div className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium text-white">Model Provider</p>

              <p className="text-sm font-normal text-white/25">
                Choose the required model provider which suits for your tasks.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  key: "openai",
                  name: "OpenAI",
                  icon: "/assets/chatgpt-icon.svg",
                  tooltipPlace: "top",
                },
                {
                  key: "vertexai",
                  name: "VertexAI",
                  icon: "/assets/vertex-ai-seeklogo.svg",
                  tooltipPlace: "top",
                },
                {
                  key: "claudeai",
                  name: "ClaudeAI",
                  icon: "/assets/claude-ai-icon.svg",
                  tooltipPlace: "bottom",
                },
                {
                  key: "azure_openai",
                  name: "Azure OpenAI",
                  icon: "/assets/Microsoft_Azure.svg",
                  tooltipPlace: "bottom",
                },
                {
                  key: "finetuned_openai",
                  name: "Fine-tuned",
                  icon: "/assets/chatgpt-icon.svg",
                  tooltipPlace: "bottom",
                },
              ].map((provider) => {
                return (
                  <div key={provider.key} className="relative group">
                    <a
                      className={`flex items-center justify-center w-full px-2 py-1.5 space-x-2 text-sm font-normal text-white border-2 rounded-md cursor-pointer  ${
                        database === provider.key
                          ? "border-secondary"
                          : "border-border"
                      }`}
                      onClick={() => handleLLmProvider(provider.key)}
                    >
                      <img src={provider.icon} alt="" className="w-6 h-6" />
                      <span>{provider.name}</span>
                    </a>
                  </div>
                );
              })}
            </div>

            <input
              type="hidden"
              value={database}
              {...register("stage_config.default.llm.llm_provider", {
                required: true,
              })}
            />
          </div>
        </div>

        {database === "" && (
          <div className="col-span-8 border rounded-md border-border">
            <div className="flex flex-col">
              <div className="flex flex-col w-full px-4 py-4 text-center border-b border-border">
                <p className="text-xs font-medium tracking-wide text-white">
                  Choose model
                </p>
              </div>

              <div className="flex flex-col min-h-[240px] items-center justify-center w-full h-full space-y-2">
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 21 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                  >
                    <path
                      d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 7.5 11.0208 7.40417 11.2125 7.2125C11.4042 7.02083 11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 11.2125 5.7875C11.0208 5.59583 10.7833 5.5 10.5 5.5C10.2167 5.5 9.97917 5.59583 9.7875 5.7875C9.59583 5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 9.59583 7.02083 9.7875 7.2125C9.97917 7.40417 10.2167 7.5 10.5 7.5ZM10.5 20.5C9.11667 20.5 7.81667 20.2375 6.6 19.7125C5.38333 19.1875 4.325 18.475 3.425 17.575C2.525 16.675 1.8125 15.6167 1.2875 14.4C0.7625 13.1833 0.5 11.8833 0.5 10.5C0.5 9.11667 0.7625 7.81667 1.2875 6.6C1.8125 5.38333 2.525 4.325 3.425 3.425C4.325 2.525 5.38333 1.8125 6.6 1.2875C7.81667 0.7625 9.11667 0.5 10.5 0.5C11.8833 0.5 13.1833 0.7625 14.4 1.2875C15.6167 1.8125 16.675 2.525 17.575 3.425C18.475 4.325 19.1875 5.38333 19.7125 6.6C20.2375 7.81667 20.5 9.11667 20.5 10.5C20.5 11.8833 20.2375 13.1833 19.7125 14.4C19.1875 15.6167 18.475 16.675 17.575 17.575C16.675 18.475 15.6167 19.1875 14.4 19.7125C13.1833 20.2375 11.8833 20.5 10.5 20.5ZM10.5 18.5C12.7333 18.5 14.625 17.725 16.175 16.175C17.725 14.625 18.5 12.7333 18.5 10.5C18.5 8.26667 17.725 6.375 16.175 4.825C14.625 3.275 12.7333 2.5 10.5 2.5C8.26667 2.5 6.375 3.275 4.825 4.825C3.275 6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 3.275 14.625 4.825 16.175C6.375 17.725 8.26667 18.5 10.5 18.5Z"
                      fill="#5F6368"
                    />
                  </svg>
                </span>

                <span className="text-sm font-medium tracking-wider text-white">
                  No model provider has selected
                </span>

                <span className="text-sm font-normal tracking-wider text-white/25">
                  Select the required model provider on the left and choose the
                  model here
                </span>
              </div>
            </div>
          </div>
        )}

        {database && (
          <div className="col-span-8 border rounded-md border-border">
            <div className="flex flex-col">
              <div className="flex flex-col w-full px-4 py-4 text-center border-b border-border">
                <p className="text-sm font-medium tracking-wide text-white">
                  Set Params
                </p>
              </div>

              <div className="flex flex-col px-4 py-4 space-y-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium text-white">Model</p>

                    <p className="text-sm font-normal text-white/25">
                      Choose the required model which suits for your tasks.
                    </p>
                  </div>

                  {database === "openai" && (
                    <Controller
                      name="stage_config.default.llm.llm_model"
                      control={control}
                      rules={{ required: "Model selection is required" }}
                      render={({
                        field: { onChange, value, ref },
                        fieldState: { error },
                      }) => (
                        <SelectOption
                          options={openaiOptions}
                          onSelect={(value) => {
                            onChange(value.value);
                            handleSelect(value);
                          }}
                          placeholder="Choose model"
                          value={openaiOptions.find(
                            (option) => option.value === value
                          )}
                          defaultValue={currentModel}
                        />
                      )}
                    />
                  )}

                  {database === "vertexai" && (
                    <Controller
                      name="stage_config.default.llm.llm_model"
                      control={control}
                      rules={{ required: "Model selection is required" }}
                      render={({
                        field: { onChange, value, ref },
                        fieldState: { error },
                      }) => (
                        <SelectOption
                          options={vertexaiOptions}
                          onSelect={(value) => {
                            onChange(value.value);
                            handleSelect(value);
                          }}
                          placeholder="Choose model"
                          value={vertexaiOptions.find(
                            (option) => option.value === value
                          )}
                          defaultValue={currentModel}
                        />
                      )}
                    />
                  )}

                  {database === "claudeai" && (
                    <Controller
                      name="stage_config.default.llm.llm_model"
                      control={control}
                      rules={{ required: "Model selection is required" }}
                      render={({
                        field: { onChange, value, ref },
                        fieldState: { error },
                      }) => (
                        <SelectOption
                          options={claudeaiOptions}
                          onSelect={(value) => {
                            onChange(value.value);
                            handleSelect(value);
                          }}
                          placeholder="Choose model"
                          value={claudeaiOptions.find(
                            (option) => option.value === value
                          )}
                          defaultValue={currentModel}
                        />
                      )}
                    />
                  )}

                  {database === "azure_openai" && (
                    <Controller
                      name="stage_config.default.llm.llm_model"
                      control={control}
                      rules={{ required: "Model selection is required" }}
                      render={({
                        field: { onChange, value, ref },
                        fieldState: { error },
                      }) => (
                        <SelectOption
                          options={azureOptions}
                          onSelect={(value) => {
                            onChange(value.value);
                            handleSelect(value);
                          }}
                          placeholder="Choose model"
                          value={azureOptions.find(
                            (option) => option.value === value
                          )}
                          defaultValue={currentModel}
                        />
                      )}
                    />
                  )}

                  {database === "finetuned_openai" && (
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col space-y-2">
                        <span className="text-sm text-white/40">
                          Enter the llm model
                        </span>
                      </div>

                      <input
                        type="text"
                        className="w-full px-4 py-2 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                        placeholder="Enter your llm model here"
                        {...register("stage_config.default.llm.llm_model", {
                          required: true,
                        })}
                        disabled={currentModel}
                      />
                    </div>
                  )}
                </div>

                {currentModel && (
                  <div className="flex flex-col space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm text-white/40">
                            Temperature
                          </span>

                          <span className="text-sm text-white min-w-6 h-6 rounded-md bg-[#181A1C] flex justify-center items-center">
                            {temperature}
                          </span>
                        </div>

                        <div>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.1}
                            className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-[#3C3C432E]"
                            {...register(
                              "stage_config.default.llm.temperature"
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm text-white/40">Top P</span>

                          <span className="text-sm text-white min-w-6 h-6 rounded-md bg-[#181A1C] flex justify-center items-center">
                            {topP}
                          </span>
                        </div>

                        <div>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.1}
                            className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-[#3C3C432E]"
                            {...register("stage_config.default.llm.top_p")}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm text-white/40">
                            Frequency Penalty
                          </span>

                          <span className="text-sm text-white min-w-6 h-6 rounded-md bg-[#181A1C] flex justify-center items-center">
                            {frequencyPenalty}
                          </span>
                        </div>

                        <div>
                          <input
                            type="range"
                            min={-2}
                            max={2}
                            step={0.1}
                            className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-[#3C3C432E]"
                            {...register(
                              "stage_config.default.llm.frequency_penalty"
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm text-white/40">
                            Presence Penalty
                          </span>

                          <span className="text-sm text-white min-w-6 h-6 rounded-md bg-[#181A1C] flex justify-center items-center">
                            {presencePenalty}
                          </span>
                        </div>

                        <div>
                          <input
                            type="range"
                            min={-2}
                            max={2}
                            step={0.1}
                            className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-[#3C3C432E]"
                            {...register(
                              "stage_config.default.llm.presence_penalty"
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm font-medium text-white">
                          Max Output
                        </p>

                        <p className="text-sm font-normal text-white/25">
                          Enter the required output value here
                        </p>
                      </div>

                      <div className="flex items-center border rounded-md border-border bg-[#181A1C]">
                        <a
                          className="flex items-center justify-center border-r cursor-pointer h-9 w-14 border-border"
                          onClick={() => handleMaxTokens("decrease")}
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
                              d="M5 12h14"
                            />
                          </svg>
                        </a>

                        <input
                          type="number"
                          className="h-9 placeholder:text-white/40 border-transparent text-center bg-transparent outline-none text-sm text-white [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none w-full"
                          placeholder="e.g 500..."
                          {...register("stage_config.default.llm.max_tokens", {
                            required: true,
                            min: {
                              value: 1,
                            },
                          })}
                        />

                        <a
                          className="flex items-center justify-center border-l cursor-pointer h-9 w-14 border-border"
                          onClick={() => handleMaxTokens("increase")}
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
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between w-full px-6 py-4 border-t border-border">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white rounded-md bg-foreground"
          onClick={handleCancel}
        >
          Cancel
        </button>

        <div className="flex items-center space-x-2">
          {/* <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-foreground"
            onClick={() => handleReset()}
          >
            Reset
          </button> */}

          <button
            type="button"
            className="px-4 py-2 text-sm font-medium border rounded-md text-secondary hover:text-white border-secondary hover:border-white"
            onClick={() => previous()}
          >
            Previous
          </button>

          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
            disabled={!isValid}
          >
            Save & Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseModel;
