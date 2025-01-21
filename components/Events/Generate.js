import React from "react";

const Generate = () => {
  return (
    <div className="flex flex-col space-y-2 bg-[#1A1C1D] border border-[#282828] p-3 rounded-lg">
      <div className="flex items-center space-x-2 bg-[#252728] max-w-fit rounded-lg px-3 py-2">
        <span className="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-white"
          >
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
            <path d="M9.999 13.587 7.7 11.292l-1.412 1.416 3.713 3.705 6.706-6.706-1.414-1.414z"></path>
          </svg>
        </span>

        <p className="text-sm font-medium tracking-wide text-white capitalize xsm:text-sm">
          Generating SQL
        </p>
      </div>
    </div>
  );
};

export default Generate;
