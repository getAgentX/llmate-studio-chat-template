import React, { useState, useEffect, useRef } from "react";

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

const AutoFillModal = ({
  setShowAutoFillModal,
  handleGenerate = () => {},
  isLoading = false,
}) => {
  const [toggleProvider, setToggleProvider] = useState(false);
  const [currentProvider, setCurrentProvider] = useState({
    value: "openai",
    label: "OpenAI",
    icon: "/assets/chatgpt-icon.svg",
  });
  const [currentModelOptions, setCurrentModelOptions] = useState(openaiOptions);
  const [toggleModel, setToggleModel] = useState(false);
  const [currentModel, setCurrentModel] = useState({
    value: "gpt-4o-mini-2024-07-18",
    label: "gpt-4o-mini-2024-07-18",
  });
  const [prompt, setPrompt] = useState("");

  const providerRef = useRef(null);
  const modelRef = useRef(null);
  const autoFillRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (autoFillRef.current && !autoFillRef.current.contains(e.target)) {
      setShowAutoFillModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleOutsideProviderClick = (e) => {
    if (providerRef.current && !providerRef.current.contains(e.target)) {
      setToggleProvider(false);
    }
  };

  useEffect(() => {
    if (toggleProvider) {
      document.addEventListener("mousedown", handleOutsideProviderClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideProviderClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideProviderClick);
    };
  }, [toggleProvider]);

  const handleOutsideModelClick = (e) => {
    if (modelRef.current && !modelRef.current.contains(e.target)) {
      setToggleModel(false);
    }
  };

  useEffect(() => {
    if (toggleModel) {
      document.addEventListener("mousedown", handleOutsideModelClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideModelClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideModelClick);
    };
  }, [toggleModel]);

  const handleProvider = (provider) => {
    setCurrentProvider(provider);

    if (provider.value === "openai") {
      setCurrentModelOptions(openaiOptions);
      setCurrentModel({
        value: "gpt-3.5-turbo-1106",
        label: "gpt-3.5-turbo-1106",
      });
    }

    if (provider.value === "vertexai") {
      setCurrentModelOptions(vertexaiOptions);
      setCurrentModel({ value: "gemini-pro", label: "gemini-pro" });
    }

    if (provider.value === "claudeai") {
      setCurrentModelOptions(claudeaiOptions);
      setCurrentModel({
        value: "claude-3-opus-20240229",
        label: "claude-3-opus-20240229",
      });
    }

    if (provider.value === "azure_openai") {
      setCurrentModelOptions(azureOptions);
      setCurrentModel({
        value: "gpt-4o-2024-05-13",
        label: "gpt-4o-2024-05-13",
      });
    }
  };

  const Generate = () => {
    const payload = {
      model: {
        llm_provider: currentProvider.value,
        llm_model: currentModel.value,
        max_tokens: 2000,
      },
      additional_instructions: prompt,
    };

    handleGenerate(payload);
  };

  return (
    <div
      className="max-w-96 min-w-96 w-full rounded-md z-50 flex flex-col absolute top-[110%] right-0 bg-dropdown-bg border border-dropdown-border"
      ref={autoFillRef}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-dropdown-border">
        <span className="text-xs font-medium tracking-wide text-primary-text">
          Fill description with AI
        </span>

        <span
          className="flex items-center justify-center cursor-pointer"
          onClick={() => setShowAutoFillModal(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-secondary-text hover:text-primary-text"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </span>
      </div>

      <div className="grid w-full grid-cols-2 gap-2 px-4 py-3">
        <div className="flex flex-col w-full space-y-2 text-xs font-normal tracking-wide text-white text-start">
          <p>Model Provider</p>

          <div className="relative flex w-full" ref={providerRef}>
            <div className="w-full border rounded-md cursor-pointer border-dropdown-border">
              <div
                className="flex items-center justify-between w-full px-2 py-2 space-x-2 border rounded-md border-dropdown-border bg-page"
                onClick={() => setToggleProvider(!toggleProvider)}
              >
                {currentProvider && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={currentProvider.icon}
                      alt={currentProvider.label}
                      loading="lazy"
                      className="object-cover w-4 aspect-square"
                    />

                    <div className="text-xs font-medium text-white line-clamp-1 ">
                      {currentProvider.label}
                    </div>
                  </div>
                )}

                {currentProvider === "" && (
                  <div className="text-xs font-medium text-white line-clamp-1">
                    Choose Provider
                  </div>
                )}

                {toggleProvider || (
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-white"
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                )}

                {toggleProvider && (
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-white"
                    >
                      <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {toggleProvider && (
              <ul className="flex flex-col w-full bg-dropdown-bg rounded-md max-h-40 overflow-y-auto recent__bar z-10 divide-y-2 divide-border-color absolute top-[110%] left-0">
                {ProviderOptions?.map((provider) => {
                  return (
                    <li
                      className="flex items-center px-2 py-2 space-x-2 text-xs font-medium text-white cursor-pointer hover:bg-page-hover bg-page"
                      onClick={() => {
                        handleProvider(provider);
                        setToggleProvider(false);
                      }}
                    >
                      <img
                        src={provider.icon}
                        alt={provider.label}
                        loading="lazy"
                        className="object-cover w-4 aspect-square"
                      />

                      <div className="line-clamp-1">{provider.label}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col w-full space-y-2 text-xs font-normal tracking-wide text-white text-start">
          <p>Model</p>

          <div className="relative flex w-full" ref={modelRef}>
            <div className="w-full border rounded-md cursor-pointer border-dropdown-border">
              <div
                className="flex items-center justify-between w-full px-2 py-2 space-x-2 border rounded-md border-dropdown-border bg-page"
                onClick={() => setToggleModel(!toggleModel)}
              >
                {currentModel && (
                  <div className="flex items-center space-x-2">
                    <div className="text-xs font-medium text-white line-clamp-1 ">
                      {currentModel.label}
                    </div>
                  </div>
                )}

                {currentModel === "" && (
                  <div className="text-xs font-medium text-white line-clamp-1">
                    Choose Model
                  </div>
                )}

                {toggleModel || (
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-white"
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                )}

                {toggleModel && (
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-white"
                    >
                      <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {toggleModel && (
              <ul className="flex flex-col w-full bg-dropdown-bg rounded-md max-h-40 overflow-y-auto recent__bar z-10 divide-y-2 divide-border-color absolute top-[110%] left-0">
                {currentModelOptions?.map((model) => {
                  return (
                    <li
                      className="flex items-center px-2 py-2 space-x-2 text-xs font-medium text-white cursor-pointer hover:bg-page-hover bg-page"
                      onClick={() => {
                        setCurrentModel(model);
                        setToggleModel(false);
                      }}
                    >
                      <div className="line-clamp-1">{model.label}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col px-4 py-3 space-y-2">
        <p className="text-xs font-normal text-white text-start">
          Prompt <span className="text-white/50">(Optional)</span>
        </p>

        <textarea
          type="text"
          className="w-full px-2 py-2 overflow-y-auto text-sm font-normal leading-6 text-white border rounded-md outline-none resize-y min-h-28 border-dropdown-border bg-page-hover placeholder:text-white/50 recent__bar"
          placeholder="Create a one sentence summary of this table"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div className="px-4 pb-3">
        <button
          type="button"
          className="text-xs font-medium text-white bg-secondary flex justify-center items-center hover:bg-secondary-foreground tracking-wider px-4 py-3 rounded-md w-full disabled:bg-[#193892]/25 disabled:text-white/25"
          disabled={prompt === ""}
          onClick={Generate}
        >
          {isLoading ? (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-4 h-4 animate-spin text-white fill-[#295EF4]"
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
          ) : (
            "Generate"
          )}
        </button>
      </div>
    </div>
  );
};

export default AutoFillModal;
