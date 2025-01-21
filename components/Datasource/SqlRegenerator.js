import React, { useEffect, useState } from "react";
import SelectOption from "../common/SelectOption";
import MentionTextarea from "../common/MentionTextarea";
import { Controller } from "react-hook-form";
import {
  useGetOrganizationPreferenceMutation,
  useGetOrganizationListQuery,
} from "@/store/organization";
import { useSelector } from "react-redux";
import { currentOrganizationSelector } from "@/store/current_organization";
import RangeSlider from "../common/RangeSlider";
import SelectIconOptions from "../common/SelectIconOptions";

const ProviderOptions = [
  {
    value: "openai",
    label: "OpenAI",
    icon: "/assets/chatgpt-icon.svg",
  },
  {
    value: "vertexai",
    label: "VertexAI",
    icon: "/assets/vertex-ai-seeklogo.svg",
  },
  {
    value: "claudeai",
    label: "ClaudeAI",
    icon: "/assets/claude-ai-icon.svg",
  },
  {
    value: "azure_openai",
    label: "Azure OpenAI",
    icon: "/assets/Microsoft_Azure.svg",
  },
  {
    value: "finetuned_openai",
    label: "Finetuned Openai",
    icon: "/assets/chatgpt-icon.svg",
  },
];

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

const SqlRegenerator = ({
  register,
  setValue,
  control,
  getValues,
  watch,
  update,
  showBtn,
  disabledRegenerator = true,
}) => {
  const [database, setDatabase] = useState("");
  const [currentModel, setCurrentModel] = useState("");
  const [tokens, setTokens] = useState(0);
  const [trainExample, setTrainExample] = useState(0);
  const currentOrg = useSelector(currentOrganizationSelector);
  const [getOrganizationPreference] = useGetOrganizationPreferenceMutation();

  const [states, setStates] = useState({
    openai: false,
    claudeai: false,
    vertexai: false,
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
        setStates({
          openai: true,
          claudeai: true,
          vertexai: true,
          azure_openai: true,
        });
      } else if (
        currentOrganization?.attributes?.membership_tier.includes("free")
      ) {
        fetchEnabledStates(currentOrg.id);
      }
    }
  }, [currentOrg, organizationList]);

  const databaseWatch = watch("sql_regenerator.default.llm.llm_provider");

  useEffect(() => {
    const databaseData = getValues("sql_regenerator.default.llm.llm_provider");
    const llmModel = getValues("sql_regenerator.default.llm.llm_model");

    if (databaseData !== "") {
      setDatabase(databaseData);
    } else {
      setDatabase("");
    }

    if (llmModel) {
      setCurrentModel({ value: llmModel, label: llmModel });
    } else {
      setCurrentModel("");
    }
  }, [databaseWatch]);

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
    setValue("sql_regenerator.default.llm.llm_model", "", {
      shouldValidate: true,
    });

    setDatabase(newDatabase);
    setValue("sql_regenerator.default.llm.llm_provider", newDatabase, {
      shouldValidate: true,
    });
  };

  const handleMaxTokens = (status) => {
    if (status === "increase") {
      setValue("sql_regenerator.default.llm.max_tokens", tokens + 1, {
        shouldValidate: true,
      });

      setTokens((prev) => prev + 1);
    }

    if (status === "decrease") {
      setValue("sql_regenerator.default.llm.max_tokens", tokens - 1, {
        shouldValidate: true,
      });

      setTokens((prev) => prev - 1);
    }
  };

  const handleTrainExample = (status) => {
    if (status === "increase") {
      setValue("sql_regenerator.default.example_count", trainExample + 1, {
        shouldValidate: true,
      });

      setTrainExample((prev) => prev + 1);
    }

    if (status === "decrease") {
      setValue("sql_regenerator.default.example_count", trainExample - 1, {
        shouldValidate: true,
      });

      setTrainExample((prev) => prev - 1);
    }
  };

  const handleSelect = (value) => {
    setCurrentModel(value);
  };

  const temperature = watch("sql_regenerator.default.llm.temperature");
  const topP = watch("sql_regenerator.default.llm.top_p");
  const frequencyPenalty = watch(
    "sql_regenerator.default.llm.frequency_penalty"
  );
  const presencePenalty = watch("sql_regenerator.default.llm.presence_penalty");

  const llmProvider = watch("sql_regenerator.default.llm.llm_provider");
  const llmModel = watch("sql_regenerator.default.llm.llm_model");
  const currentImg = ProviderOptions.find((type) => type.value === database);

  if (!disabledRegenerator) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full space-y-4 min-h-80 max-h-80">
        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 14 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 fill-icon-color"
          >
            <path d="M6.33398 10.8334H7.66732V6.83337H6.33398V10.8334ZM7.00065 5.50004C7.18954 5.50004 7.34787 5.43615 7.47565 5.30837C7.60343 5.1806 7.66732 5.02226 7.66732 4.83337C7.66732 4.64448 7.60343 4.48615 7.47565 4.35837C7.34787 4.2306 7.18954 4.16671 7.00065 4.16671C6.81176 4.16671 6.65343 4.2306 6.52565 4.35837C6.39787 4.48615 6.33398 4.64448 6.33398 4.83337C6.33398 5.02226 6.39787 5.1806 6.52565 5.30837C6.65343 5.43615 6.81176 5.50004 7.00065 5.50004ZM7.00065 14.1667C6.07843 14.1667 5.21176 13.9917 4.40065 13.6417C3.58954 13.2917 2.88398 12.8167 2.28398 12.2167C1.68398 11.6167 1.20898 10.9112 0.858984 10.1C0.508984 9.28893 0.333984 8.42226 0.333984 7.50004C0.333984 6.57782 0.508984 5.71115 0.858984 4.90004C1.20898 4.08893 1.68398 3.38337 2.28398 2.78337C2.88398 2.18337 3.58954 1.70837 4.40065 1.35837C5.21176 1.00837 6.07843 0.833374 7.00065 0.833374C7.92287 0.833374 8.78954 1.00837 9.60065 1.35837C10.4118 1.70837 11.1173 2.18337 11.7173 2.78337C12.3173 3.38337 12.7923 4.08893 13.1423 4.90004C13.4923 5.71115 13.6673 6.57782 13.6673 7.50004C13.6673 8.42226 13.4923 9.28893 13.1423 10.1C12.7923 10.9112 12.3173 11.6167 11.7173 12.2167C11.1173 12.8167 10.4118 13.2917 9.60065 13.6417C8.78954 13.9917 7.92287 14.1667 7.00065 14.1667ZM7.00065 12.8334C8.48954 12.8334 9.75065 12.3167 10.784 11.2834C11.8173 10.25 12.334 8.98893 12.334 7.50004C12.334 6.01115 11.8173 4.75004 10.784 3.71671C9.75065 2.68337 8.48954 2.16671 7.00065 2.16671C5.51176 2.16671 4.25065 2.68337 3.21732 3.71671C2.18398 4.75004 1.66732 6.01115 1.66732 7.50004C1.66732 8.98893 2.18398 10.25 3.21732 11.2834C4.25065 12.3167 5.51176 12.8334 7.00065 12.8334Z" />
          </svg>
        </span>
        <p className="w-full max-w-xl text-xs tracking-wider text-center text-secondary-text">
          When enabled, the datasource retrieves information from the 'SQL
          Regeneration' section when it is queried by the user.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col py-4 space-y-4">
        <div className="grid w-full grid-cols-12 gap-3 px-3">
          <div className="flex items-center col-span-2 space-x-3">
            <span className="text-xs text-primary-text">Model Provider</span>
          </div>

          <div className="w-full col-span-10 max-w-72">
            {showBtn && database && (
              <Controller
                name="sql_regenerator.default.llm.llm_provider"
                control={control}
                rules={{ required: "Model selection is required" }}
                render={({
                  field: { onChange, value, ref },
                  fieldState: { error },
                }) => (
                  <SelectIconOptions
                    options={ProviderOptions}
                    onSelect={(value) => {
                      onChange(value.value);
                    }}
                    placeholder="Choose embedding provider"
                    value={database}
                    defaultValue={ProviderOptions.find(
                      (type) => type.value === database
                    )}
                    bgColor="var(--bg-secondary)"
                    borderColor="var(--input-border)"
                    disabled={update ? !showBtn : false}
                  />
                )}
              />
            )}

            {!showBtn && database && (
              <div
                className={`w-full px-3 text-xs flex items-center space-x-2 border bg-page placeholder:text-input-placeholder font-normal ${
                  !showBtn
                    ? "text-input-text-inactive border-transparent py-0"
                    : "text-input-text border-input-border py-3"
                }`}
              >
                {currentImg?.icon && (
                  <img
                    src={currentImg?.icon || ""}
                    alt={currentImg?.label}
                    className="w-4 h-4"
                  />
                )}

                <span>{llmProvider}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="grid grid-cols-12 gap-4 px-3 bg-page">
            {database && (
              <div className="col-span-12 bg-page">
                <div className="flex flex-col">
                  <div
                    className={`flex flex-col ${
                      !showBtn ? "space-y-2" : "space-y-4"
                    }`}
                  >
                    <div className="grid w-full grid-cols-12 gap-3">
                      <div className="flex items-center col-span-2 space-x-3">
                        {database !== "finetuned_openai" && (
                          <div className="flex flex-col space-y-2">
                            <span className="text-xs text-primary-text">
                              Select your model
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="w-full col-span-10 max-w-72">
                        {showBtn && database === "openai" && (
                          <Controller
                            name="sql_regenerator.default.llm.llm_model"
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
                                disabled={update ? !showBtn : false}
                                bgColor="var(--bg-secondary)"
                                borderColor="var(--input-border)"
                              />
                            )}
                          />
                        )}

                        {showBtn && database === "vertexai" && (
                          <Controller
                            name="sql_regenerator.default.llm.llm_model"
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
                                disabled={update ? !showBtn : false}
                                bgColor="var(--bg-secondary)"
                                borderColor="var(--input-border)"
                              />
                            )}
                          />
                        )}

                        {showBtn && database === "claudeai" && (
                          <Controller
                            name="sql_regenerator.default.llm.llm_model"
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
                                disabled={update ? !showBtn : false}
                                bgColor="var(--bg-secondary)"
                                borderColor="var(--input-border)"
                              />
                            )}
                          />
                        )}

                        {showBtn && database === "azure_openai" && (
                          <Controller
                            name="sql_regenerator.default.llm.llm_model"
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
                                disabled={update ? !showBtn : false}
                                bgColor="var(--bg-secondary)"
                                borderColor="var(--input-border)"
                              />
                            )}
                          />
                        )}

                        {!showBtn && (
                          <div
                            className={`w-full px-3 text-xs border bg-page placeholder:text-input-placeholder font-normal ${
                              !showBtn
                                ? "text-input-text-inactive border-transparent py-0"
                                : "text-input-text border-input-border py-3"
                            }`}
                          >
                            {llmModel}
                          </div>
                        )}
                      </div>

                      {showBtn && database === "azure_openai" && (
                        <div className="grid w-full grid-cols-12 col-span-12 gap-3">
                          <div className="flex items-center col-span-2 space-x-3">
                            <span className="text-xs text-primary-text">
                              Enter Deployment Name
                            </span>
                          </div>

                          <div className="w-full col-span-10 max-w-72">
                            <input
                              type="text"
                              className="w-full p-3 text-xs font-normal border rounded-md appearance-none cursor-pointer h-7 max-w-72 text-input-text placeholder:text-input-placeholder bg-page border-input-border"
                              placeholder="Enter your deployment name"
                              {...register(
                                "sql_regenerator.default.llm.deployment_name",
                                { required: true }
                              )}
                              disabled={update ? !showBtn : false}
                            />
                          </div>
                        </div>
                      )}

                      {showBtn && database === "finetuned_openai" && (
                        <div className="grid w-full grid-cols-12 col-span-12 gap-3">
                          <div className="flex items-center col-span-2 space-x-3">
                            <span className="text-xs text-primary-text">
                              Enter the llm model
                            </span>
                          </div>

                          <div className="w-full col-span-10 max-w-72">
                            <input
                              type="text"
                              className="w-full p-3 text-xs font-normal border rounded-md appearance-none cursor-pointer h-7 max-w-72 text-input-text placeholder:text-input-placeholder bg-page border-input-border"
                              placeholder="Enter your llm model here"
                              {...register(
                                "sql_regenerator.default.llm.llm_model",
                                { required: true }
                              )}
                              disabled={update ? !showBtn : false}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <RangeSlider
                      name="sql_regenerator.default.llm.temperature"
                      label="Temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={temperature}
                      register={register}
                      showBtn={showBtn}
                      update={update}
                    />

                    <RangeSlider
                      name="sql_regenerator.default.llm.top_p"
                      label="Top P"
                      min={0}
                      max={1}
                      step={0.1}
                      value={topP}
                      register={register}
                      showBtn={showBtn}
                      update={update}
                    />

                    <RangeSlider
                      name="sql_regenerator.default.llm.frequency_penalty"
                      label="Frequency Penalty"
                      min={-2}
                      max={2}
                      step={0.1}
                      value={frequencyPenalty}
                      register={register}
                      showBtn={showBtn}
                      update={update}
                    />

                    <RangeSlider
                      name="sql_regenerator.default.llm.presence_penalty"
                      label="Presence Penalty"
                      min={-2}
                      max={2}
                      step={0.1}
                      value={presencePenalty}
                      register={register}
                      showBtn={showBtn}
                      update={update}
                    />

                    <div className="grid w-full grid-cols-12 gap-3">
                      <div className="flex items-center col-span-2 space-x-3">
                        <span className="text-xs text-primary-text">
                          max output tokens
                        </span>
                      </div>

                      <div className="col-span-10">
                        <div className="flex items-center w-full space-x-2 max-w-72">
                          <input
                            type="number"
                            className={`w-full max-w-72 px-3 text-xs border rounded-md outline-none h-7 bg-page focus:border-input-border-focus placeholder:text-input-placeholder font-normal ${
                              !showBtn
                                ? "text-input-text-inactive border-transparent py-0"
                                : "text-input-text border-input-border py-3"
                            }`}
                            placeholder="Enter your token here"
                            {...register(
                              "sql_regenerator.default.llm.max_tokens",
                              {
                                required: true,
                                min: {
                                  value: 1,
                                  message: "Value must be at least 1",
                                },
                                validate: (value) =>
                                  value >= 1 || "Value must be at least 1",
                              }
                            )}
                            disabled={update ? !showBtn : false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col px-3">
          <div className="grid w-full grid-cols-12 gap-3">
            <div className="flex items-center col-span-2 space-x-3">
              <span className="text-xs text-primary-text">
                User’s examples to pick for each run
              </span>
            </div>

            <div className="col-span-10">
              <input
                type="number"
                className={`w-full max-w-72 px-3 text-xs border rounded-md outline-none h-7 bg-page placeholder:text-input-placeholder font-normal focus:border-input-border-focus ${
                  !showBtn
                    ? "text-input-text-inactive border-transparent py-0"
                    : "text-input-text border-input-border py-3"
                }`}
                placeholder="Enter number of similar examples to pick"
                {...register("sql_regenerator.default.example_count", {
                  required: true,
                  min: {
                    value: 1,
                    message: "Value must be at least 1",
                  },
                  validate: (value) => value >= 1 || "Value must be at least 1",
                })}
                disabled={update ? !showBtn : false}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 px-3">
          <div className="col-span-2">
            <span className="text-xs text-primary-text">
              System Instruction
            </span>
          </div>

          <div className="col-span-10">
            <div
              className={`grid grid-cols-12 border rounded-md gap-3 ${
                showBtn ? "border-border-color p-2" : "border-transparent"
              }`}
            >
              {showBtn && (
                <div className="col-span-12">
                  <div className="flex flex-col w-full space-y-4">
                    <span className="text-xs text-primary-text">
                      Available variables
                    </span>

                    <div className="flex flex-wrap w-full h-full gap-2 p-2 overflow-y-auto border rounded-md border-border-color bg-page max-h-32 recent__bar">
                      <div className="px-3 py-1 text-xs font-normal text-tags-text rounded-full h-fit bg-tags-bg max-w-fit">
                        table_info
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-span-12">
                <div className="flex flex-col space-y-3">
                  {showBtn && (
                    <span className="text-xs text-primary-text">Prompt</span>
                  )}

                  <Controller
                    name="sql_regenerator.default.system_instructions"
                    control={control}
                    rules={{
                      required: true,
                      validate: (value, formValues) => {
                        const hasTableInfo = [
                          { id: "1", display: "table_info" },
                        ]?.some((item) => value.includes(`{${item.display}}`));

                        if (!hasTableInfo) {
                          return "At least one mention with 'table_info' is required.";
                        }
                        return true;
                      },
                    }}
                    render={({
                      field: { onChange, value, ref },
                      fieldState: { error },
                    }) => (
                      <MentionTextarea
                        data={[{ id: "1", display: "table_info" }]}
                        value={value || ""}
                        onChange={(newValue) => onChange(newValue)}
                        update={update}
                        showBtn={showBtn}
                        error={error}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 px-3">
          <div className="col-span-2">
            <span className="text-xs text-primary-text">
              Human Instructions
            </span>
          </div>

          <div className="col-span-10">
            <div
              className={`grid grid-cols-12 border rounded-md gap-3 ${
                showBtn ? "border-border-color p-2" : "border-transparent"
              }`}
            >
              {showBtn && (
                <div className="col-span-12">
                  <div className="flex flex-col w-full space-y-4">
                    <span className="text-xs text-primary-text">
                      Available variables
                    </span>

                    <div className="flex flex-wrap w-full h-full gap-2 p-2 overflow-y-auto border rounded-md border-border-color bg-page max-h-32 recent__bar">
                      <div className="px-3 py-1 text-xs font-normal text-tags-text rounded-full h-fit bg-tags-bg max-w-fit">
                        user_query
                      </div>
                      <div className="px-3 py-1 text-xs font-normal text-tags-text rounded-full h-fit bg-tags-bg max-w-fit">
                        wrong_sql
                      </div>
                      <div className="px-3 py-1 text-xs font-normal text-tags-text rounded-full h-fit bg-tags-bg max-w-fit">
                        sql_execution_error
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-span-12">
                <div className="flex flex-col space-y-3">
                  {showBtn && (
                    <span className="text-xs text-primary-text">Prompt</span>
                  )}

                  <Controller
                    name="sql_regenerator.default.human_instructions"
                    control={control}
                    rules={{
                      required: true,
                      validate: (value, formValues) => {
                        const hasTableInfo = [
                          { id: "1", display: "user_query" },
                          { id: "2", display: "wrong_sql" },
                          { id: "3", display: "sql_execution_error" },
                        ]?.some((item) => value.includes(`{${item.display}}`));

                        if (!hasTableInfo) {
                          return "At least one mention with 'user_query' is required.";
                        }
                        return true;
                      },
                    }}
                    render={({
                      field: { onChange, value, ref },
                      fieldState: { error },
                    }) => (
                      <MentionTextarea
                        data={[
                          { id: "1", display: "user_query" },
                          { id: "2", display: "wrong_sql" },
                          { id: "3", display: "sql_execution_error" },
                        ]}
                        value={value || ""}
                        onChange={(newValue) => onChange(newValue)}
                        update={update}
                        showBtn={showBtn}
                        error={error}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SqlRegenerator;
