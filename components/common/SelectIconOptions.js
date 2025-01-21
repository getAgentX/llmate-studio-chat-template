import React from "react";
import Select, { components } from "react-select";

const CustomOption = (props) => {
  const { data, innerRef, innerProps } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={`flex items-center p-2 text-xs text-input-text cursor-pointer ${props.isFocused ? "bg-btn-primary text-white" : "bg-dropdown-bg"
        }`}
    >
      {data.icon && (
        <img
          src={data.icon}
          alt={data.label}
          style={{ width: 20, height: 20, marginRight: 10 }}
        />
      )}
      <span className="line-clamp-1">{data.label}</span>
    </div>
  );
};

const CustomSingleValue = (props) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        {data.icon && (
          <img
            src={data.icon}
            alt={data.label}
            style={{
              width: 20,
              height: 20,
              objectFit: "contain",
            }}
          />
        )}
        <span className="text-xs text-accent">{data.label}</span>
      </div>
    </components.SingleValue>
  );
};

const SelectIconOptions = ({
  options,
  onSelect,
  placeholder = "",
  defaultValue = "",
  disabled = false,
  bgColor = "#09090b",
  borderColor = "#212227",
}) => {
  const handleSelectChange = (value) => {
    if (onSelect) onSelect(value);
  };

  return (
    <div className="relative">
      <Select
        defaultValue={defaultValue}
        onChange={handleSelectChange}
        options={options}
        isSearchable={false}
        placeholder={placeholder}
        isDisabled={disabled}
        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
        styles={{
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
          menu: (baseStyle) => ({
            ...baseStyle,
            backgroundColor: "var(--dropdown-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "4px",
            marginTop: "4px",
          }),
          option: (baseStyle, state) => ({
            ...baseStyle,
            backgroundColor: state.isFocused
              ? "var(--btn-primary)"
              : "var(--dropdown-bg)",
            color: state.isFocused ? "#fff" : "var(--accent)", 
            fontSize: "12px",
            padding: "8px",
            cursor: "pointer",
            "&:active": {
              backgroundColor: "var(--btn-primary)",
            },
          }),
          placeholder: (baseStyle) => ({
            ...baseStyle,
            color: "var(--btn-secondary-disable-text)",
            fontSize: "12px",
          }),
          menuList: (baseStyle) => ({
            ...baseStyle,
            padding: 0,
          }),
          input: (baseStyle) => ({
            ...baseStyle,
            color: "var(--accent)",
            fontSize: "12px",
          }),
          indicatorSeparator: () => ({
            display: "none", 
          }),
          placeholder: (baseStyle) => ({
            ...baseStyle,
            color: "var(--input-text)", // Placeholder color
            fontSize: "12px", // Adjust font size for placeholder
          }),
        }}
      />
    </div>
  );
};

export default SelectIconOptions;
