import React, { useEffect, useState } from "react";
import GenerateContextDropdown from "./GenerateContextDropdown";

const GenerateContext = ({
  register,
  setValue,
  getValues,
  control,
  isValid = () => {},
  isDirty = () => {},
  updateInfo = () => {},
  handleCancel = () => {},
  reset = () => {}, // Ensure reset is passed as a prop
  update = false,
  back: previous,
  showBtn = false,
  setShowBtn = false,
}) => {
  // const [showBtn, setShowBtn] = useState(false);
  const [tables, setTables] = useState([]);
  const [originalValues, setOriginalValues] = useState({});

  useEffect(() => {
    const tables = getValues("tables");
    if (tables) {
      setTables(tables);
    } else {
      setTables([]);
    }
    // Store original values
    setOriginalValues(getValues());
  }, []);

  const toggleEditMode = () => {
    if (showBtn) {
      reset(originalValues); // Reset to original values
    }
    setShowBtn(!showBtn);
  };

  return (
    <div className="flex flex-col rounded-md bg-[#212426]">
      <div className="flex flex-col p-2 px-4 space-y-2">
        <p className="text-base font-medium text-white">
          Lists of the selected tables from your database
        </p>

        <p className="text-sm font-normal text-white/25">
          Configure your table and the selected columns by clicking these
          individually.
        </p>
      </div>

      <div className="px-4 py-2 space-y-2">
        {tables?.map((table, index) => {
          return (
            <GenerateContextDropdown
              data={table}
              index={index}
              register={register}
              setValue={setValue}
              key={index}
              control={control}
              getValues={getValues}
              update={update}
              showBtn={showBtn}
            />
          );
        })}
      </div>

      {update || (
        <div className="flex items-center justify-between w-full px-6 py-4 border-t border-border">
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
              Save Changes
            </button>
          </div>
        </div>
      )}

      {showBtn && update && (
        <div className="flex items-center justify-between w-full px-6 py-4 border-t border-border">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-foreground"
            onClick={toggleEditMode}
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
              disabled={!isValid}
              onClick={updateInfo}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateContext;
