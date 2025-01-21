import React, { useState } from "react";

const SystemPrompt = ({
  register,
  isValid = () => {},
  reset = () => {},
  handleCancel = () => {},
  getValues = () => {},
  back: previous,
}) => {
  const handleReset = () => {
    const values = getValues();
    const stageConfig = getValues("stage_config.default");

    const newValues = {
      ...values,
      stage_config: {
        default: {
          ...stageConfig,
          system_instructions: "",
        },
      },
    };

    reset(newValues);
  };

  return (
    <div className="flex flex-col rounded-md bg-[#212426]">
      <div className="flex flex-col px-6 py-4 space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <p className="text-base font-medium text-white">Prompt</p>

            <p className="text-sm font-normal text-white/50">
              Enter your system prompt
            </p>
          </div>

          <textarea
            type="text"
            className="w-full px-4 py-3 overflow-y-auto text-sm leading-6 text-white border rounded-md outline-none resize-y min-h-36 border-border bg-[#181A1C] placeholder:text-white/40 recent__bar"
            placeholder="Enter your system prompt here"
            {...register("stage_config.default.system_instructions", {
              required: true,
            })}
          />
        </div>
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
            Save Assistant
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemPrompt;
