import { useState } from "react";
import ArrayItemsDropdown from "./ArrayItemsComponent";

const ArrayCell = ({ info, columnId }) => {
  const [eachDropdownVisible, setEachDropdownVisible] = useState(false);
  const cellData = info.getValue();
  // const source_id = info.row.original.source_id; // Access source_id from the row's original data

  // const handleUpdate = (updatedData) => {
  //   updateRow(source_id, columnId, updatedData); // Trigger update at ManageData level
  //   setEachDropdownVisible(false);
  // };

  const filteredData = Array.isArray(cellData)
    ? cellData.filter(
      (item) => item !== "" && item !== null && item !== undefined
    )
    : [];
  const itemsToShow = filteredData?.slice(0, 2);
  const handleCellClick = () => setEachDropdownVisible(true);
  const additionalCount =
    filteredData.length > 2 ? `+ ${filteredData.length - 2} more` : "";

  return (
    <>
      <div onClick={handleCellClick} className="p-2  cursor-pointer w-full">
        <div
          className="flex flex-wrap items-center gap-1 overflow-hidden"
          style={{ maxWidth: "150px", height: "auto", minHeight: "40px" }} 
        >
          {itemsToShow.map((item, index) => (
            <span
              key={index}
              className={`text-white flex-shrink-0 w-full truncate px-2 py-1 ${itemsToShow.length > 1
                ? "bg-[#2A2C32] rounded-md m-0 px-1 py-1.5 inline-block"
                : ""
                }`}
            >
              {item}
            </span>
          ))}
        </div>

        {additionalCount && (
          <div className="text-xs mt-2 italic text-left text-white/50">
            {additionalCount}
          </div>
        )}
      </div>
      <div className="relative">
        {eachDropdownVisible && (
          <ArrayItemsDropdown
            key={`${info.row.id}-${columnId}`}
            visible={eachDropdownVisible}
            data={cellData}
            toggleDropdown={() => setEachDropdownVisible(false)}
          />
        )}
      </div>
    </>
  );
};

export default ArrayCell;
