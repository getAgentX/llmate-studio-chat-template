import React from "react";

const ProviderSelection = ({ database, handleLLmProvider, states }) => {
  const providers = [
    { key: "openai", name: "OpenAI", icon: "/assets/chatgpt-icon.svg", tooltipPlace: "top" },
    { key: "vertexai", name: "VertexAI", icon: "/assets/vertex-ai-seeklogo.svg", tooltipPlace: "top" },
    { key: "claudeai", name: "ClaudeAI", icon: "/assets/claude-ai-icon.svg", tooltipPlace: "bottom" },
    { key: "azure_openai", name: "Azure OpenAI", icon: "/assets/Microsoft_Azure.svg", tooltipPlace: "bottom" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {providers.map((provider) => {
        const isEnabled = states[provider.key];
        return (
          <div key={provider.key} className="relative group">
            <a
              className={`flex items-center justify-center w-full px-2 py-1.5 space-x-2 text-sm font-normal text-white border-2 rounded-md cursor-pointer ${
                database === provider.key ? "border-secondary" : "border-border"
              } ${!isEnabled && "opacity-50"}`}
              onClick={() => isEnabled && handleLLmProvider(provider.key)}
              data-tooltip-id="tooltip"
              data-tooltip-content={!isEnabled ? "Upgrade to pro plan to access all features." : ""}
              data-tooltip-place={provider.tooltipPlace}
            >
              <img src={provider.icon} alt="" className="w-6 h-6" />
              <span>{provider.name}</span>
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default ProviderSelection;
