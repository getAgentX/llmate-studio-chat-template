import React, { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  stackoverflowDark,
  stackoverflowLight,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTheme } from "@/hooks/useTheme";

const CodeHighlighter = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const { theme } = useTheme();

  // Determine whether to use dark or light theme
  const selectedStyle =
    theme === "dark" ? stackoverflowDark : stackoverflowLight;

  // Custom styling for light theme, if needed
  const customStyle = {
    ...selectedStyle,
    hljs: {
      ...selectedStyle.hljs,
      backgroundColor: theme === "dark" ? "#0f0f10" : "#fff", // Set light background for light theme
      padding: "20px 12px",
      fontSize: "14px",
    },
  };

  return (
    <div className="flex flex-col max-h-[380px] overflow-auto recent__bar rounded">
      <SyntaxHighlighter
        language="sql"
        style={customStyle}
        wrapLongLines={true}
      >
        {data}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeHighlighter;
