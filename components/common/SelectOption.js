import React from "react";
import Select from "react-select";

const SelectOption = ({
  options,
  onSelect,
  placeholder = "",
  value = null,
  disabled = false,
  bgColor = "#09090b",
  borderColor = "#212227",
  customStyles = {},
}) => {
  const handleSelectChange = (value) => {
    if (onSelect) onSelect(value);
  };

  const defaultStyles = {
    container: (baseStyle) => ({
      ...baseStyle,
      width: "100%",
    }),
    control: (baseStyle) => ({
      ...baseStyle,
      backgroundColor: bgColor || "var(--dropdown-bg)",
      borderColor: borderColor,
      borderRadius: "4px",
      minHeight: "32px",
      fontSize: "12px",
      cursor: "pointer",
      "&:hover": {
        borderColor: "var(--btn-primary)",
      },
    }),
    singleValue: (baseStyle) => ({
      ...baseStyle,
      color: "var(--accent)",
      fontSize: "12px",
    }),
    option: (baseStyle, state) => ({
      ...baseStyle,
      backgroundColor: state.isFocused
        ? "var(--btn-primary-bg)" // Apply hover background color
        : "var(--dropdown-bg)", // Default background
      color: state.isFocused ? "#fff" : "var(--accent)", 
      fontSize: "12px",
      padding: "8px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "var(--btn-primary-bg)", // Apply active background color
      },
    }),

    menu: (baseStyle) => ({
      ...baseStyle,
      backgroundColor: "var(--dropdown-bg)",
      border: "1px solid var(--border-color)",
      borderRadius: "4px",
      marginTop: "4px",
    }),
    menuList: (baseStyle) => ({
      ...baseStyle,
      padding: 0,
    }),
    placeholder: (baseStyle) => ({
      ...baseStyle,
      color: "var(--btn-secondary-disable-text)",
      fontSize: "12px",
    }),
    dropdownIndicator: (baseStyle) => ({
      ...baseStyle,
      color: "#6e6d7a",
      "&:hover": {
        color: "#ffffff",
      },
    }),
    indicatorSeparator: () => ({
      display: "none", // Remove the vertical separator
    }),
    input: (baseStyle) => ({
      ...baseStyle,
      color: "#ffffff",
      fontSize: "14px",
    }),
    placeholder: (baseStyle) => ({
      ...baseStyle,
      color: "var(--input-text)", // Placeholder color
      fontSize: "12px", // Adjust font size for placeholder
    }),
  };

  return (
    <div style={{ width: "100%" }}>
      <Select
        value={value}
        onChange={handleSelectChange}
        options={options}
        isSearchable={false}
        placeholder={placeholder}
        isDisabled={disabled}
        styles={{ ...defaultStyles, ...customStyles }}
      />
    </div>
  );
};

export default SelectOption;
