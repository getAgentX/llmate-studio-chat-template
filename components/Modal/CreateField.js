import React, { useEffect, useRef, useState } from "react";
import SelectOption from "../common/SelectOption";

const fieldTypes = [
  { value: "str", label: "String" },
  { value: "number", label: "Number" },
];

const displayConfigs = [
  { value: "never_show", label: "Never Show In Replies" },
  { value: "allow_selection", label: "Show When Asked By User" },
  { value: "always_show", label: "Always Show In replies" },
];

const CreateField = ({
  visible,
  setVisible,
  submitField,
  existingField,
  isEditing,
}) => {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState(
    existingField ? existingField.field_type : ""
  );
  const [displayConfig, setDisplayConfig] = useState(
    existingField ? existingField.display_config : ""
  );
  const [allowQuery, setAllowQuery] = useState(false);
  const [likeThreshold, setLikeThreshold] = useState(0.9);
  const [notLikeThreshold, setNotLikeThreshold] = useState(0.85);

  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setVisible(false);
    }
  };

  useEffect(() => {
    if (existingField && isEditing) {
      console.log("Received editingData: ", existingField);
      setFieldName(existingField.field_name);
      setFieldType(existingField.field_type);
      setDisplayConfig(existingField.display_config);
      setAllowQuery(existingField.allow_query);
      if (existingField.field_type === "str") {
        setLikeThreshold(existingField.like_threshold || 0.9);
        setNotLikeThreshold(existingField.not_like_threshold || 0.85);
      }
    }
  }, [existingField, isEditing]);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleFieldTypeChange = (option) => {
    if (fieldType !== option.value) { 
      setFieldType(option.value);
    }
  };

  const handleDisplayConfigChange = (option) => {
    if (displayConfig !== option.value) {
      setDisplayConfig(option.value);
    }
  };

  const handleCloseCreation = () => {
    setVisible(false);
  };

  const handleClickInside = (e) => {
    e.stopPropagation(); // This will prevent the click from propagating to outer elements
  };

  const handleSubmit = () => {
    const columnData = {
      field_name: fieldName,
      display_config: displayConfig,
      allow_query: allowQuery,
    };

    // Add field-specific properties based on whether it's an edit or create operation
    if (isEditing) {
      if (fieldType === "str") {
        columnData.like_threshold = likeThreshold;
        columnData.not_like_threshold = notLikeThreshold;
      }
      submitField(existingField.id, columnData); // Update existing field
    } else {
      // For new fields, include the field type
      columnData.field_type = fieldType;
      if (fieldType === "str") {
        columnData.like_threshold = likeThreshold;
        columnData.not_like_threshold = notLikeThreshold;
      }
      submitField(columnData); // Add new field
    }
    setVisible(false); // Close the modal after submission
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1100] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${visible ? "" : "hidden"
        }`}
      ref={modalRef}
      onClick={handleCloseCreation}
    >
      <div
        className="relative w-full max-w-md p-2 rounded-lg bg-foreground"
        onClick={handleClickInside}
      >
        <div className="flex flex-col h-full space-y-4">
          <div className="relative flex items-center justify-between px-2 py-3 text-sm font-medium border-b text-muted border-border">
            <span>{isEditing ? "UPDATE FIELD" : "CREATE FIELD"}</span>
            <span
              className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer bg-background"
              onClick={handleCloseCreation}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-white/60 hover:text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </span>
          </div>

          <div className="flex flex-col px-2 space-y-2">
            <div className="text-sm font-medium tracking-wide text-muted">
              Field Name
            </div>
            <span className="text-xs font-normal tracking-wide capitalize text-white/40">
              Enter a unique name for your new field
            </span>
            <input
              type="text"
              className="w-full px-2 py-2 text-sm font-normal text-white border-none rounded-md outline-none placeholder:text-white/40 bg-background"
              placeholder="Enter your field name here"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
          </div>

          <div className="flex flex-col px-2 space-y-2">
            <div className="text-sm font-medium tracking-wide text-muted">
              Field Type
            </div>
            <div className="font-normal">
              <SelectOption
                options={fieldTypes}
                value={fieldTypes.find((type) => type.value === fieldType)} 
                onSelect={handleFieldTypeChange}
                placeholder="Select Field Type"
                disabled={isEditing}
                customStyles={
                  isEditing
                    ? {
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: state.isDisabled
                          ? "#303237"
                          : base.backgroundColor,
                        cursor: state.isDisabled ? "not-allowed" : "pointer",
                        border: "none",
                      }),
                    }
                    : {}
                }
              />
            </div>
            {isEditing && (
              <span className="font-thin tracking-wide text-white capitalize">
                Field Type cannot be edited
              </span>
            )}

            {fieldType === "str" && (
              <>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-white/40">
                    THRESHOLD VALUES
                  </span>
                </div>
                <div className="flex space-x-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="space-x-2 font-normal">
                        <span className="text-xs text-white capitalize">
                          Like Threshold
                        </span>
                        <span className="px-2 py-1 text-xs text-white bg-gray-700 rounded-md">
                          {likeThreshold}
                        </span>
                      </div>
                    </div>
                    <div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-secondary"
                        value={likeThreshold}
                        onChange={(e) =>
                          setLikeThreshold(parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="space-x-2">
                        <span className="text-xs font-normal text-white capitalize">
                          Not Like Threshold
                        </span>
                        <span className="px-2 py-1 text-xs text-white bg-gray-700 rounded-md">
                          {notLikeThreshold}
                        </span>
                      </div>
                    </div>
                    <div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-secondary"
                        value={notLikeThreshold}
                        onChange={(e) =>
                          setNotLikeThreshold(parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col px-2 space-y-2">
            <div className="text-sm font-medium tracking-wide text-muted">
              Display Configuration
            </div>
            <div className="font-normal">
              <SelectOption
                options={displayConfigs}
                value={displayConfigs.find((configs) => configs.value === displayConfig)}
                onSelect={handleDisplayConfigChange}
                placeholder="Select Display Config"
              />
            </div>
          </div>

          <div className="flex flex-col px-2 space-y-2">
            <div className="text-sm font-normal tracking-wide text-muted">
              Allow Query
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowQuery}
                className="sr-only peer"
                onChange={(e) => setAllowQuery(e.target.checked)}
              />
              <div className="relative w-11 h-6 bg-[#212327] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[#295EF4] after:border-[#295EF4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#212327]"></div>
            </label>
          </div>

          <div className="flex items-center justify-end w-full px-2 pt-4 space-x-4 border-t border-border">
            <button
              className="px-4 py-2 text-sm font-medium text-white rounded-md min-w-28 bg-border"
              onClick={() => setVisible(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md min-w-28 text-muted bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]"
              onClick={handleSubmit}
              disabled={
                fieldName === "" || fieldType === "" || displayConfig === ""
              }
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateField;