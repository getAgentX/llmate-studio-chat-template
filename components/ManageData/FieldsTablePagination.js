import React from "react";

const FieldsTablePagination = ({ skip, setSkip, limit, setLimit }) => {
  const entriesOptions = [10, 20, 30, 40, 50];

  return (
    <div className="flex items-center justify-between pb-4 text-xs text-white/50">
      <div className="flex items-center space-x-2">
        <span>Showing</span>

        <select
          value={limit}
          onChange={(e) => {
            const newLimit = Number(e.target.value);
            setLimit(newLimit);
          }}
          className="p-1 text-white bg-[#181A1C] border border-[#282828] rounded-md outline-none cursor-pointer"
        >
          {entriesOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <span>entries per page</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            setSkip(0);
          }}
          disabled={skip === 0}
          className="px-3 py-1 text-sm rounded-md bg-[#26282D] border border-[#282828] disabled:bg-[#181A1C]"
        >
          {"<<"}
        </button>
        <button
          onClick={() => setSkip(Math.max(0, skip - limit))}
          className="px-3 py-1 text-sm rounded-md bg-[#26282D] border border-[#282828] disabled:bg-[#181A1C]"
        >
          Previous
        </button>
        <button
          onClick={() => setSkip(skip + limit)}
          className="px-3 py-1 text-sm rounded-md bg-[#26282D] border border-[#282828] disabled:bg-[#181A1C]"
        >
          Next
        </button>
        <button className="px-3 py-1 text-sm rounded-md bg-[#26282D] border border-[#282828] disabled:bg-[#181A1C]">
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default FieldsTablePagination;
