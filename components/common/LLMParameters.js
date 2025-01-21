import React from "react";
import { Controller } from "react-hook-form";
import SelectOption from "./SelectOption";

const LlmParams = ({ database, control, currentModel, handleSelect, register, update, showBtn }) => {
  const options = {
    openai: [
      { value: "gpt-3.5-turbo-1106", label: "gpt-3.5-turbo-1106" },
      { value: "gpt-3.5-turbo-0125", label: "gpt-3.5-turbo-0125" },
      { value: "gpt-4-1106-preview", label: "gpt-4-1106-preview" },
      { value: "gpt-4-0125-preview", label: "gpt-4-0125-preview" },
    ],
    vertexai: [
      { value: "gemini-pro", label: "gemini-pro" },
      { value: "chat-bison", label: "chat-bison" },
      { value: "codechat-bison", label: "codechat-bison" },
    ],
    claudeai : [
      { value: "claude-3-opus-20240229", label: "claude-3-opus-20240229" },
      { value: "claude-3-sonnet-20240229", label: "claude-3-sonnet-20240229" },
      { value: "claude-3-haiku-20240307", label: "claude-3-haiku-20240307" },
      { value: "claude-3-5-sonnet-20241022", label: "claude-3-5-sonnet-20241022" },
      { value: "claude-3-5-haiku-20241022", label: "claude-3-5-haiku-20241022" },
    ],
    azure_openai: [
      { value: "gpt-4o-2024-05-13", label: "gpt-4o-2024-05-13" },
      { value: "gpt-4-turbo-2024-04-09", label: "gpt-4-turbo-2024-04-09" },
      { value: "gpt-4-0613", label: "gpt-4-0613" },
      { value: "gpt-4-32k-0613", label: "gpt-4-32k-0613" },
      { value: "gpt-4-0125-preview", label: "gpt-4-0125-preview" },
      { value: "gpt-4-1106-preview", label: "gpt-4-1106-preview" },
      { value: "gpt-35-turbo-0125", label: "gpt-35-turbo-0125" },
      { value: "gpt-35-turbo-0613", label: "gpt-35-turbo-0613" },
      { value: "gpt-35-turbo-16k-0613", label: "gpt-35-turbo-16k-0613" },
    ],
  };

  return (
    <div className="col-span-8 border rounded-md border-border">
      <div className="flex flex-col">
        <div className="flex flex-col w-full px-4 py-4 text-center border-b border-border">
          <p className="text-sm font-medium tracking-wide text-white">Set Params</p>
        </div>
        <div className="flex flex-col px-4 py-4 space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-white/40">Select your model</span>
            </div>
            <Controller
              name="sql_generator.default.llm.llm_model"
              control={control}
              rules={{ required: "Model selection is required" }}
              render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
                <SelectOption
                  options={options[database]}
                  onSelect={(value) => {
                    onChange(value.value);
                    handleSelect(value);
                  }}
                  placeholder="Choose model"
                  value={options[database].find((option) => option.value === value)}
                  defaultValue={currentModel}
                  disabled={update ? !showBtn : false}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LlmParams;
