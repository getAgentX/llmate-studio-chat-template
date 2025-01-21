import React, { useEffect, useRef, useState } from "react";
import {
  useAddRowToDatasourceMutation,
  useUpdateRowbyIdMutation,
} from "@/store/semi_structured_datasource";
import CreateField from "../Modal/CreateField";
import { toast } from "react-toastify";
import ConfirmModal from "../Modal/ConfirmModal";
import SuccessModal from "../Modal/SuccessModal";
import Loader from "../loader/Loader";

const AddRowModal = ({
  show,
  setShow,
  slug = null,
  existingColumns,
  refetchList,
  addColumn,
  skip,
  limit,
  mode, // New prop to determine mode ("add" or "update")
  existingRow = null, // Row data for update mode
}) => {
  const sideModalRef = useRef(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showCreateNewField, setShowCreateNewField] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [columnValues, setColumnValues] = useState({});
  const [addRowToDatasource, {}] = useAddRowToDatasourceMutation();
  const [updateRowbyId] = useUpdateRowbyIdMutation(); // Mutation for updating rows

  const resetSidebar = () => {
    const resetValues = Object.keys(existingColumns).reduce((acc, columnId) => {
      acc[columnId] = []; // Reset to empty arrays
      return acc;
    }, {});
    setColumnValues(resetValues);
    setShow(false);
    setShowAdd(false);
  };

  const handleInputChange = (columnId, value) => {
    setColumnValues((prev) => ({ ...prev, [columnId]: value }));
  };

  const handleOutsideClick = (e) => {
    if (!showCreateNewField) {
      if (sideModalRef.current && !sideModalRef.current.contains(e.target)) {
        resetSidebar();
      }
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [show, showCreateNewField]);

  useEffect(() => {
    if (existingColumns && mode === "update" && existingRow) {
      const initialValues = Object.keys(existingColumns).reduce(
        (acc, columnId) => {
          acc[columnId] = existingRow[columnId] || []; // Initialize with existing row values for update mode
          return acc;
        },
        {}
      );
      setColumnValues(initialValues);
    }
  }, [existingColumns, mode, existingRow]);

  const handleTagInputChange = (e, columnId) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();

      // Check if columnValues[columnId] exists and is an array
      const currentTags = Array.isArray(columnValues[columnId])
        ? columnValues[columnId]
        : [];

      // Create the new array with the new tag added
      const newTags = [...currentTags, e.target.value.trim()];

      // Update the state with the new array
      setColumnValues((prev) => ({ ...prev, [columnId]: newTags }));

      // Clear the input
      e.target.value = "";
    }
  };

  const removeTag = (columnId, index) => {
    setColumnValues((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((_, idx) => idx !== index),
    }));
  };

  const handleAddOrUpdateRow = () => {
    setLoading(true);

    const payload = Object.keys(existingColumns).reduce((acc, columnId) => {
      acc[columnId] = {
        field_type: existingColumns[columnId].field_type,
        values: columnValues[columnId],
      };
      return acc;
    }, {});

    switch (mode) {
      case "add":
        addRowToDatasource({ datasource_id: slug, payload })
          .then((response) => {
            if (response.error) {
              console.error("Error adding new row:", response.error);
            } else {
              refetchList(skip, limit);
              resetSidebar();
              setShowSuccessModal(true);
              toast.success("Row Added Successfully!");
            }
          })
          .finally(() => {
            setLoading(false);
          });
        break;

      case "update":
        if (existingRow) {
          updateRowbyId({
            datasource_id: slug,
            source_id: existingRow.source_id,
            payload,
          })
            .then((response) => {
              if (response.error) {
                console.error("Error updating row:", response.error);
                toast.error("Failed to update row.");
              } else {
                refetchList(skip, limit);
                resetSidebar();
                setShowSuccessModal(true);
                toast.success("Row Updated Successfully!");
              }
            })
            .finally(() => {
              setLoading(false);
            });
        }
        break;

      default:
        console.error("Invalid mode:", mode);
        setLoading(false);
        break;
    }
  };

  useEffect(() => {
    const allFieldsFilled = Object.values(columnValues).some(
      (tags) => tags.length > 0
    );
    setShowAdd(allFieldsFilled);
  }, [columnValues]);

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] max-h-full md:inset-0 bg_blur ${
        show ? "" : "hidden"
      }`}
    >
      <div
        className="fixed top-0 bottom-0 right-0 w-full max-w-xl overflow-x-hidden overflow-y-auto bg-foreground recent__bar"
        ref={sideModalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex flex-col">
          <div className="flex sticky top-0 left-0 bg-foreground w-full items-center py-2 px-4 justify-between border-b border-[#303237]">
            <div className="flex items-center space-x-4 text-sm font-medium tracking-wide text-white">
              <span
                className="flex items-center justify-center"
                onClick={resetSidebar}
              >
                <svg
                  viewBox="0 0 12 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 fill-[#878787] hover:fill-white cursor-pointer"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.00104 6.91474L9.53637 10.4501C9.72397 10.6377 9.9784 10.7431 10.2437 10.7431C10.509 10.7431 10.7634 10.6377 10.951 10.4501C11.1386 10.2625 11.244 10.008 11.244 9.74274C11.244 9.47744 11.1386 9.223 10.951 9.03541L7.41437 5.50007L10.9504 1.96474C11.0432 1.87185 11.1169 1.76159 11.1671 1.64024C11.2173 1.51889 11.2432 1.38884 11.2431 1.2575C11.2431 1.12617 11.2172 0.99613 11.1669 0.874806C11.1166 0.753482 11.0429 0.643251 10.95 0.550407C10.8571 0.457562 10.7469 0.383923 10.6255 0.333692C10.5042 0.283462 10.3741 0.257624 10.2428 0.257655C10.1115 0.257686 9.98143 0.283585 9.8601 0.333872C9.73878 0.38416 9.62855 0.457852 9.5357 0.55074L6.00104 4.08607L2.4657 0.55074C2.3735 0.455188 2.26319 0.378954 2.14121 0.326488C2.01924 0.274023 1.88803 0.246375 1.75525 0.245159C1.62247 0.243943 1.49078 0.269183 1.36786 0.319406C1.24494 0.369629 1.13326 0.443829 1.03932 0.537677C0.945384 0.631525 0.871078 0.743142 0.820739 0.866014C0.770401 0.988886 0.745037 1.12055 0.746127 1.25333C0.747218 1.38611 0.774742 1.51734 0.827093 1.63937C0.879443 1.7614 0.955572 1.87178 1.05104 1.96407L4.5877 5.50007L1.05171 9.03607C0.956239 9.12837 0.88011 9.23875 0.827759 9.36077C0.775409 9.4828 0.747885 9.61403 0.746794 9.74681C0.745703 9.87959 0.771067 10.0113 0.821406 10.1341C0.871745 10.257 0.94605 10.3686 1.03999 10.4625C1.13392 10.5563 1.24561 10.6305 1.36853 10.6807C1.49145 10.731 1.62314 10.7562 1.75592 10.755C1.8887 10.7538 2.0199 10.7261 2.14188 10.6737C2.26386 10.6212 2.37417 10.545 2.46637 10.4494L6.00104 6.91541V6.91474Z"
                  />
                </svg>
              </span>
              <div>
                <span>{mode === "add" ? "Add Row" : "Update Row"}</span>
                <span
                  className="my-1 ml-2 text-xs tracking-wide text-white/50"
                  style={{ textTransform: "none", fontWeight: "normal" }}
                >
                  {"(Press 'Enter' to add multiple values)"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 flex justify-center items-center h-9 min-w-28 py-2 text-sm font-medium text-white rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
              onClick={handleAddOrUpdateRow}
              disabled={!showAdd || loading}
            >
              {loading ? <Loader /> : mode === "add" ? "Add" : "Update"}
            </button>
          </div>

          <div className="flex flex-col px-4 py-3 space-y-4">
            <div className="flex flex-col space-y-4">
              {Object.entries(existingColumns).map(([columnId, column]) => (
                <div key={columnId} className="flex flex-col space-y-2">
                  <p className="py-2 text-sm font-medium tracking-wide text-white">
                    {column.field_name}
                  </p>

                  <div className="flex items-center flex-wrap bg-[#2A2D34] text-white rounded-md">
                    {columnValues[columnId] &&
                      columnValues[columnId].map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center px-2 py-1 m-1 space-x-2 text-xs font-medium text-white rounded bg-foreground"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(columnId, index)}
                            className="ml-2 text-xs"
                          >
                            <svg
                              viewBox="0 0 8 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-2.5 h-2.5"
                            >
                              <path
                                d="M1.2 7.5L0.5 6.8L3.3 4L0.5 1.2L1.2 0.5L4 3.3L6.8 0.5L7.5 1.2L4.7 4L7.5 6.8L6.8 7.5L4 4.7L1.2 7.5Z"
                                fill="white"
                              />
                            </svg>
                          </button>
                        </span>
                      ))}

                    <input
                      id={columnId}
                      type={column.field_type === "number" ? "number" : "text"}
                      className="flex-1 px-2 py-3 text-sm bg-transparent outline-none placeholder:text-white/40"
                      placeholder="Enter a value and press 'Enter' to add..."
                      onKeyDown={(e) => handleTagInputChange(e, columnId)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SuccessModal
              show={showSuccessModal}
              setShow={setShowSuccessModal}
              heading="Success Confirmation"
              title=""
              description={`Row ${
                mode === "add" ? "added" : "updated"
              } successfully.`}
              primaryBtn="Close"
              primaryChange={() => setShowSuccessModal(true)}
            />

            {/* <div>
              <button
                type="button"
                className="flex items-center rounded-md py-1.5 px-3 group text-white bg-secondary hover:bg-secondary-foreground font-medium text-sm space-x-2 cursor-pointer"
                onClick={() => setShowCreateNewField(true)}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 fill-white"
                >
                  <path d="M7.33203 8.66732H3.33203V7.33398H7.33203V3.33398H8.66536V7.33398H12.6654V8.66732H8.66536V12.6673H7.33203V8.66732Z" />
                </svg>
                <span>Add Field</span>
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {showCreateNewField && (
        <CreateField
          visible={showCreateNewField}
          setVisible={setShowCreateNewField}
          submitField={addColumn}
          existingField={null}
          isEditing={false}
        />
      )}

      {/* {showConfirmAddRowModal && (
        <ConfirmModal
          show={showConfirmAddRowModal}
          setShow={setShowConfirmAddRowModal}
          heading="Confirm Row Addition"
          title={"Are you sure you want to add this row?"}
          description={""}
          primaryBtn="Yes, Confirm"
          primaryChange={() => handleAddRow()}
          secondaryBtn="No"
          secondaryChange={() => setShowConfirmAddRowModal(false)}
        />
      )} */}
    </div>
  );
};

export default AddRowModal;
