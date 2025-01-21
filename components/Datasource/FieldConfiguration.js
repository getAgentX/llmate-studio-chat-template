import React, { useState, useEffect } from "react";
import SelectOption from "../common/SelectOption";
import { Controller } from "react-hook-form";

const fieldTypes = [
  { value: "str", label: "String" },
  { value: "number", label: "Number" },
];


const displayConfigs = [
  { value: "never_show", label: "Never Show In Replies" },
  { value: "allow_selection", label: "Show When Asked By User" },
  { value: "always_show", label: "Always Show In replies" },
];

const getDefaultColumn = () => ({
  field_name: "",
  field_type: "",
  allow_query: false,
  display_config: "",
});

const FieldConfiguration = ({
  control,
  register,
  reset = () => {},
  handleCancel = () => {},
  getValues,
  setValue,
  isValid,
  errors,
}) => {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const columnValues = getValues("columns");
    setColumns(columnValues);
  }, []);

  const addColumn = () => {
    const newColumn = getDefaultColumn();
    const newColumns = [...columns, newColumn];
    setColumns(newColumns);

    // Update form state with new column
    const formValues = getValues(); // Get current form values
    setValue("columns", [...formValues.columns, newColumn]); // Update 'columns' in the form
  };

  const removeColumn = (index) => {
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);

    reset({
      ...getValues(), // Spread existing form values to maintain other form states
      columns: newColumns.map((col) => ({
        field_name: col.field_name,
        field_type: col.field_type,
        display_config: col.display_config,
        allow_query: col.allow_query,
      })),
    });
  };

  const handleReset = () => {
    const defaultColumn = [getDefaultColumn()]; // Create an array with a single default column

    // Reset local state
    setColumns(defaultColumn);

    // Reset form state with explicit default column
    reset({
      ...getValues(), // maintain other form state values if needed
      columns: defaultColumn, // set columns to a single default column
    });
  };

  const handleFieldChange = (index, field, value) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      newColumns[index][field] = value;
      return newColumns;
    });
  };

  const handleCopyColumn = (column) => {
    const newColumn = {
      ...column,
      field_name: `${column.field_name}_copy`, 
    };

    const newCopy = [...columns, newColumn];

    setColumns(newCopy);

    const formValues = getValues();
    setValue("columns", [...formValues.columns, column]);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col p-4 border rounded-md border-border bg-[#212426]">
        <div className="flex flex-col space-y-4">
          <div className="grid items-center grid-cols-8 gap-y-6 gap-x-5 text-sm font-normal text-white">
            <div className="col-span-2">
              Field Name
            </div>
            <div className="col-span-2">
              Field Type
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <p className="">
                Display Configuration
              </p>
              <img src="/assets/information.svg" data-tooltip-id="tooltip"
                data-tooltip-content="Display Config"
                data-tooltip-place="top" />
            </div>
            <div className="col-span-1 flex justify-center items-center space-x-2">
              <p className="">
                Allow Query
              </p>
              <img src="/assets/information.svg"
                data-tooltip-id="tooltip"
                data-tooltip-content="Allow query"
                data-tooltip-place="top" />
            </div>
            <div className="col-span-1 flex justify-center items-center">
              Actions
            </div>
          </div>

          {columns.map((column, index) => (
            <div
              key={index}
              className="grid items-center grid-cols-8 gap-4 text-center"
            >
              <div className="flex flex-col items-center col-span-2 space-y-2">
                <input
                  type="text"
                  className="w-full px-4 py-2 text-sm text-white border rounded-md outline-none border-[#242424] bg-[#181A1C] placeholder:text-white/40"
                  placeholder="Enter Field Name Here..."
                  {...register(`columns[${index}].field_name`, {
                    required: true,
                  })}
                  value={column.field_name}
                  onChange={(e) => {
                    const newColumns = columns.slice();
                    newColumns[index].field_name = e.target.value;
                    setColumns(newColumns);
                  }}
                />
                {errors.columns &&
                  errors.columns[index] &&
                  errors.columns[index].field_name && (
                    <p className="mt-1 text-xs text-red-500">
                      Field name is required
                    </p>
                  )}
              </div>

              <div className="flex flex-col  col-span-2 space-y-2">
                <Controller
                  name={`columns[${index}].field_type`}
                  control={control}
                  rules={{ required: "Field type is required" }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <SelectOption
                      options={fieldTypes}
                      placeholder="Select Field Type"
                      onSelect={(selectedOption) => {
                        onChange(selectedOption.value); // Update react-hook-form state
                        handleFieldChange(
                          index,
                          "field_type",
                          selectedOption.value
                        ); // Update local component state
                      }}
                      value={fieldTypes.find((type) => type.value === value)}
                      defaultValue={fieldTypes.find(
                        (type) => type.value === value
                      )}
                    />
                  )}
                />
                {errors.columns &&
                  errors.columns[index] &&
                  errors.columns[index].field_type && (
                    <p className="mt-1 text-xs text-red-500">
                      Field type is required
                    </p>
                  )}
              </div>

              <div className="flex flex-col  col-span-2 space-y-2">
                <Controller
                  name={`columns[${index}].display_config`}
                  control={control}
                  rules={{ required: "Display configuration is required" }}
                  render={({ field: { onChange, value } }) => (
                    <SelectOption
                      options={displayConfigs}
                      placeholder="Select Display Config"
                      onSelect={(selectedOption) => {
                        onChange(selectedOption.value); // Update react-hook-form state
                        handleFieldChange(
                          index,
                          "display_config",
                          selectedOption.value
                        ); // Update local component state
                      }}
                      value={displayConfigs.find(
                        (config) => config.value === value
                      )}
                      defaultValue={displayConfigs.find(
                        (config) => config.value === value
                      )}
                    />
                  )}
                />
                {errors.columns &&
                  errors.columns[index] &&
                  errors.columns[index].display_config && (
                    <p className="mt-1 text-xs text-red-500">
                      Display Configuration is required
                    </p>
                  )}
              </div>

              <div className="flex flex-col items-center col-span-1 space-y-2">
                <Controller
                  name={`columns[${index}].allow_query`}
                  control={control}
                  defaultValue={column.allow_query}
                  render={({ field: { onChange, value, ref } }) => (
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        ref={ref}
                        checked={value}
                        className="sr-only peer"
                        onChange={(e) => {
                          onChange(e.target.checked); // Update the form state
                          const newColumns = [...columns];
                          newColumns[index].allow_query = e.target.checked; // Update local state
                          setColumns(newColumns);
                        }}
                      />
                      <div className="relative w-11 h-6 bg-[#363a42] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:after:bg-white peer-checked:bg-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1B1D1F] after:border-[#26282D] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer:after:bg-[#000000] peer:after:border-[#000000]"></div>
                    </label>
                  )}
                />
              </div>

              <div className="flex items-center col-span-1 space-x-2 justify-center">
                <span
                  className="flex items-center justify-center"
                  onClick={() => handleCopyColumn(column)}
                >
                  <svg
                    viewBox="0 0 12 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 cursor-pointer fill-secondary-text hover:fill-primary-text"
                  >
                    <path d="M4 11.0026C3.63333 11.0026 3.31944 10.872 3.05833 10.6109C2.79722 10.3498 2.66667 10.0359 2.66667 9.66927V1.66927C2.66667 1.3026 2.79722 0.988715 3.05833 0.727604C3.31944 0.466493 3.63333 0.335938 4 0.335938H10C10.3667 0.335938 10.6806 0.466493 10.9417 0.727604C11.2028 0.988715 11.3333 1.3026 11.3333 1.66927V9.66927C11.3333 10.0359 11.2028 10.3498 10.9417 10.6109C10.6806 10.872 10.3667 11.0026 10 11.0026H4ZM4 9.66927H10V1.66927H4V9.66927ZM1.33333 13.6693C0.966667 13.6693 0.652778 13.5387 0.391667 13.2776C0.130556 13.0165 0 12.7026 0 12.3359V3.0026H1.33333V12.3359H8.66667V13.6693H1.33333Z" />
                  </svg>
                </span>

                <span
                  className="flex items-center justify-center"
                  onClick={() => removeColumn(index)}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 cursor-pointer stroke-white/50 hover:stroke-white"
                  >
                    <g clip-path="url(#clip0_2724_22406)">
                      <path
                        d="M3 3.33398V14.6673H13V3.33398H3Z"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M6.66602 6.66602V10.9993"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M9.33398 6.66602V10.9993"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M1.33398 3.33398H14.6673"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.33398 3.33398L6.43032 1.33398H9.59302L10.6673 3.33398H5.33398Z"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_2724_22406">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>

                {/* <img
                  src="/assets/dustbin.svg"
                  alt="remove"
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => removeColumn(index)}
                /> */}
              </div>
            </div>
          ))}

          <div className="flex justify-start">
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2 space-x-2 text-xs font-medium border rounded-md text-secondary hover:text-secondary-foreground border-secondary hover:border-secondary-foreground"
              onClick={addColumn}
            >
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                >
                  <path
                    d="M6.01501 2.5L6.00586 9.5"
                    stroke="#295EF4"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2.5 6H9.5"
                    stroke="#295EF4"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span>Add Field</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full py-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white rounded-md bg-foreground"
          onClick={handleCancel}
        >
          Cancel
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-foreground"
            onClick={handleReset}
          >
            Reset
          </button>

          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]"
            disabled={!isValid || columns.length === 0}
          >
            Save Datasource
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldConfiguration;
