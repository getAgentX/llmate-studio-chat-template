import React from "react";
import { useTheme } from "@/hooks/useTheme";

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  if (!theme) {
    return null;
  }

  return (
    <button
      type="button"
      className="flex items-center justify-center w-10 h-10"
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      title="Toggle Theme"
    >
      {theme === "light" ? (
        <img src="/assets/light-theme-icon.svg" />
      ) : (
        <img src="/assets/dark-theme-icon.svg" />
      )}
    </button>
  );
};

export default ThemeToggleButton;
