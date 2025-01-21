import React, { useState } from "react";

const VerificationModal = ({ isOpen, onClose, onSave }) => {
  const [selectedOption, setSelectedOption] = useState("Under Verification");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-foreground rounded-lg shadow-lg p-6 w-full max-w-md mx-4 md:mx-0">
        <h2 className="text-lg font-semibold mb-4">Verify & Save Changes</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="Verified"
              checked={selectedOption === "Verified"}
              onChange={() => setSelectedOption("Verified")}
              className="form-radio text-accent"
            />
            <span className="text-white">Approve the Output (Verified)</span>
          </label>
          <p className="pl-6 text-sm text-white/60">
            Confirm that the output of the run meets expectations.
          </p>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="Under Verification"
              checked={selectedOption === "Under Verification"}
              onChange={() => setSelectedOption("Under Verification")}
              className="form-radio text-accent"
            />
            <span className="text-white">Request Improvements (Under Verification)</span>
          </label>
          <p className="pl-6 text-sm text-white/60">
            Suggest modifications to the execution steps and SQL queries until the output meets expectations.
          </p>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-2 text-sm font-medium text-white bg-transparent border border-gray-500 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedOption)}
            className="px-4 py-2 text-sm font-medium  bg-blue-500 text-white rounded-md hover:bg-accent-dark"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
