import React, { useEffect, useState } from "react";
import { SelectOption } from "@/components";
import ConfirmModal from "@/components/Modal/ConfirmModal";
import {
  useUpdateEmbeddingModelMutation,
  useUpdateDatasourceColumnsMutation,
  useAddColumnsToDatasourceMutation,
  useDeleteDatasourceColumnMutation,
} from "@/store/semi_structured_datasource";
import { Controller, useForm } from "react-hook-form";
import {
  useGetDatasourceInfoQuery,
  useUpdateDatasourceInfoMutation,
} from "@/store/datasource";
import SuccessModal from "../Modal/SuccessModal";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Breadcrumb from "../common/Breadcrumbs";
import DatasourceLayout from "../Layout/DatasourceLayout";

const fieldTypes = [
  { value: "str", label: "String" },
  { value: "number", label: "Number" },
];

const displayConfigs = [
  { value: "never_show", label: "Never Show In Replies" },
  { value: "allow_selection", label: "Show When Asked By User" },
  { value: "always_show", label: "Always Show In replies" },
];

const SemiStructuredDatasourceDetails = () => {
  const [slug, setSlug] = useState(null);

  const [infoConfig, setInfoConfig] = useState(true);
  const [columns, setColumns] = useState({});
  const [showConfirmInfoModal, setShowConfirmInfoModal] = useState(false);
  const [showConfirmModelConfigModal, setShowConfirmModelConfigModal] = useState(false);
  const [showSuccessOnAddModal, setShowSuccessOnAddModal] = useState(false);
  const [showSuccessUpdatedModal, setShowSuccessUpdatedModal] = useState(false);
  const [columnId, setColumnId] = useState(null);
  const [confirmDeleteColumn, setConfirmDeleteColumn] = useState(false);
  const [showSuccessDelete, setShowSuccessDelete] = useState(false);
  const [showSuccessInfoUpdate, setShowSuccessInfoUpdate] = useState(false);
  const [isAddNewColumnActive, setIsAddNewColumnActive] = useState(false);
  const [addNewColumn, setAddNewColumn] = useState({
    field_name: "",
    field_type: "",
    allow_query: false,
    display_config: "",
    like_threshold: 0.9,
    not_like_threshold: 0.85,
  });

  const [currentlyEditing, setCurrentlyEditing] = useState(null);
  const [editableStates, setEditableStates] = useState({});
  const [dirtyStates, setDirtyStates] = useState({});
  
  const router = useRouter();

  useEffect(() => {
    if (router?.query?.slug) {
      setSlug(router.query.slug);
    }
  }, [router?.query?.slug]);

  const {
    data,
    isLoading: getLoading,
    error: getError,
    refetch: refetchData,
  } = useGetDatasourceInfoQuery(
    {
      datasource_id: router.query.slug,
    },
    {
      skip: !router?.query?.slug,
    }
  );

  useEffect(() => {
    if (data) {
      setColumns(data?.ds_config?.columns);
      setEditableStates(
        Object.keys(data?.ds_config?.columns || {}).reduce((acc, key) => {
          acc[key] = false; // Start with all fields non-editable
          return acc;
        }, {})
      );

      setDirtyStates(() =>
        Object.keys(data?.ds_config?.columns || {}).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {})
      );
    }
  }, [data]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    defaultValues: {
      name: data?.name || "",
      about: data?.about || "",
      embedding_model: data?.ds_config?.current_row_index?.embedding_model || {
        embedding_provider: "openai",
        model: "text-embedding-ada-002",
      },
      columns: Object.entries(data?.ds_config?.columns || {}).reduce(
        (acc, [id, column]) => {
          acc[id] = {
            ...column,
            allow_query: column.allow_query ?? false,
          };
          return acc;
        },
        {}
      ),
    },
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const [updateDatasourceInfo, { error: updateDatasourceInfoError }] =
    useUpdateDatasourceInfoMutation();

  const [updateEmbeddingModel] = useUpdateEmbeddingModelMutation();
  const [updateColumn] = useUpdateDatasourceColumnsMutation();
  const [addColumnsToDatasource] = useAddColumnsToDatasourceMutation();
  const [deleteDatasourceColumn] = useDeleteDatasourceColumnMutation();

  const handleColumnChange = (columnId, field, value) => {
    setColumns((currentColumns) => ({
      ...currentColumns,
      [columnId]: {
        ...currentColumns[columnId],
        [field]: value,
      },
    }));
    setValue(`columns.${columnId}.${field}`, value); // Update form state
    setDirtyStates((prev) => ({ ...prev, [columnId]: true })); // Mark as dirty
  };

  const handleInfoConfig = () => {
    const info = {
      name: getValues("name"),
      about: getValues("about"),
    };

    updateDatasourceInfo({ datasource_id: slug, payload: info })
      .then((response) => {
        if (response?.error) {
          toast.error("Failed to update information");
          console.error("API error:", response.error);
          return;
        }
        toast.success("Datasource information updated successfully!");
        setInfoConfig(true);
        setShowConfirmInfoModal(false);
        setShowSuccessInfoUpdate(true);
        setIsInfoSectionDirty(false);
        refetchData();
      })
      .catch((err) => {
        toast.error("An error occurred while updating");
        console.error("Error while updating datasource info:", err);
      });
  };

  const handleEmbeddingConfig = () => {
    const embedding = getValues("embedding_model");

    const payload = {
      embedding_model: {
        embedding_provider: embedding.embedding_provider,
        model: embedding.model,
      },
    };

    updateEmbeddingModel({ datasource_id: slug, payload: payload }).then(
      (response) => {
        setConfiguration(true);
        setShowConfirmModelConfigModal(false);
      }
    );
  };

  const handleNewColumnConfig = (addNewColumn) => {
    let newColumnPayload = {
      field_name: addNewColumn.field_name,
      field_type: addNewColumn.field_type, // Include field type for new columns
      allow_query: addNewColumn.allow_query,
      display_config: addNewColumn.display_config,
    };

    if (addNewColumn.field_type === "str") {
      newColumnPayload.like_threshold = addNewColumn.like_threshold;
      newColumnPayload.not_like_threshold = addNewColumn.not_like_threshold;
    }

    addColumnsToDatasource({
      datasource_id: slug,
      payload: { columns: [newColumnPayload] },
    }).then((response) => {
      if (response.data === null) {
        // refetchData();
        setShowSuccessOnAddModal(true);

        setEditableStates((prev) => ({
          ...prev,
          [columnId]: false,
        }));
      }

      if (response.error) {
        console.error("Error adding new column:", response.error);
      }
      refetchData();
      toast.success("Column Added successfully...");
    });
    setIsAddNewColumnActive(false);
  };

  const handleColumnsConfig = (columnId) => {
    // Fetch all data related to this column from the form state
    const columnData = getValues(`columns.${columnId}`);
    // Check if the column already exists
    const isNewColumn = !data?.ds_config?.columns?.hasOwnProperty(columnId);

    if (isNewColumn) {
      // Payload for new column includes 'field_type'
      let newColumnPayload = {
        field_name: columnData.field_name,
        field_type: columnData.field_type, // Include field type for new columns
        allow_query: columnData.allow_query,
        display_config: columnData.display_config,
      };

      // Conditionally add thresholds if field_type is 'str'
      if (columnData.field_type === "str") {
        newColumnPayload.like_threshold = columnData.like_threshold || 0.9;
        newColumnPayload.not_like_threshold =
          columnData.not_like_threshold || 0.85;
      }

      // Use addColumnsToDatasource API for new columns
      addColumnsToDatasource({
        datasource_id: slug,
        payload: { columns: [newColumnPayload] },
      }).then((response) => {
        if (response.data === null) {
          // refetchData();
          setShowSuccessOnAddModal(true);

          setEditableStates((prev) => ({
            ...prev,
            [columnId]: false,
          }));
        }

        if (response.error) {
          console.error("Error adding new column:", response.error);
        }
      });
    } else {
      // Payload for updating an existing column does not include 'field_type'
      let updateColumnPayload = {
        field_name: columnData.field_name,
        allow_query: columnData.allow_query,
        display_config: columnData.display_config,
      };

      // Conditionally add thresholds if field_type is 'str'
      if (columnData.field_type === "str") {
        updateColumnPayload.like_threshold = columnData.like_threshold || 0.9;
        updateColumnPayload.not_like_threshold =
          columnData.not_like_threshold || 0.85;
      }

      // Use updateColumn API for existing columns
      updateColumn({
        datasource_id: slug,
        column_id: columnId,
        payload: updateColumnPayload,
      }).then((response) => {
        if (response.data === null) {
          // refetchData();
          setShowSuccessUpdatedModal(true);

          setEditableStates((prev) => ({
            ...prev,
            [columnId]: false,
          }));
        }

        if (response.error) {
          console.error("Error updating column:", response.error);
        }
      });
    }
  };

  // Add Column to form & local state
  const addColumn = () => {
    setIsAddNewColumnActive(true);
    setIsFieldManagementDirty(true);
  };

  // Delete Column
  const removeColumn = () => {
    deleteDatasourceColumn({ datasource_id: slug, column_id: columnId }).then(
      (response) => {
        if (response.error) {
          console.error("Error deleting column:", response.error);
          setConfirmDeleteColumn(false);
          setShowSuccessDelete(false);
          setColumnId(null);
        }

        if (response.data === null) {
          refetchData();
          setConfirmDeleteColumn(false);
          setShowSuccessDelete(true);
          setColumnId(null);
          toast.success("Column Deleted successfully...");
        }
      }
    );
  };

  const allFieldsFilled = () => {
    const allFilled = Object.values(columns).every(
      (column) =>
        column.field_name && column.field_type && column.display_config
    );
    const anyEditable = Object.values(editableStates).some(
      (state) => state === true
    );
    return allFilled && !anyEditable;
  };

  const crumbData = [
    { name: "Datasources", slug: "/datasource" },
    {
      name: data?.name || "Datasource Name",
      slug: `/datasource/details/${slug}`,
    },
  ];

  return (
    <div className="relative flex flex-col h-full max-h-screen min-h-screen overflow-hidden font-inter">
      <Breadcrumb data={crumbData} />

      <DatasourceLayout activeTab={"information"} currentDatasource="semi_structured">
        <div className="flex flex-col w-full px-4 py-4 mx-auto space-y-3 max-w-7xl 2xl:max-w-full">
          <div className="h-9 flex items-center justify-between bg-secondary-bg px-2 rounded-[4px]">
            <h3 className="text-sm w-40 text-white"> Datasource Information</h3>
            {
              infoConfig ? (
                <button
                  className="flex items-center space-x-2 text-xs font-medium group disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable text-btn-normal-text hover:text-btn-normal-hover"
                  onClick={() => {
                    setInfoConfig(false);
                    setIsInfoSectionDirty(true);
                  }}
                  disabled={isFieldManagementDirty}

                  type="button"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable fill-btn-normal-icon group-hover:fill-btn-normal-hover"
                    >
                      <path d="M1.33333 10.6667H2.28333L8.8 4.15L7.85 3.2L1.33333 9.71667V10.6667ZM0 12V9.16667L8.8 0.383333C8.93333 0.261111 9.08056 0.166667 9.24167 0.1C9.40278 0.0333333 9.57222 0 9.75 0C9.92778 0 10.1 0.0333333 10.2667 0.1C10.4333 0.166667 10.5778 0.266667 10.7 0.4L11.6167 1.33333C11.75 1.45556 11.8472 1.6 11.9083 1.76667C11.9694 1.93333 12 2.1 12 2.26667C12 2.44444 11.9694 2.61389 11.9083 2.775C11.8472 2.93611 11.75 3.08333 11.6167 3.21667L2.83333 12H0ZM8.31667 3.68333L7.85 3.2L8.8 4.15L8.31667 3.68333Z" />
                    </svg>
                  </span>
                  <span>Edit</span>
                </button>
              ): (
                <div className="flex items-center space-x-4">
                  <button
                    className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-primary-text"
                    onClick={() => {
                      setInfoConfig(false);
                      setIsInfoSectionDirty(true);
                    }}
                    disabled={isFieldManagementDirty}
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </span>

                    <span>Cancel edit</span>
                  </button>

                  <button
                    className={`flex items-center space-x-2 text-xs font-medium group disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable text-[#2A9E28] hover:text-primary-text`}
                    onClick={() => setShowConfirmInfoModal(true)}
                    type="button"
                  >
                      <span className="flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable fill-[#2A9E28] group-hover:fill-btn-normal-hover">
                          <path d="M6.37031 12.0001L2.57031 8.20007L3.52031 7.25007L6.37031 10.1001L12.487 3.9834L13.437 4.9334L6.37031 12.0001Z" />
                        </svg>
                      </span>
                    <span>Save</span>
                  </button>
                </div>
              ) 
            }

          </div>
          <div className="space-y-2 flex flex-col justify-evenly  px-2">
            
            <div className="h-7 flex items-center">
              <h3 className="text-xs w-40 text-secondary-text">
                Name
              </h3>

              <input
                type="text"
                placeholder="Enter the datasource name here"
                className="px-4 w-[35rem] h-7 text-white rounded-[4px] border border-dropdown-border bg-page focus:outline-none focus:ring-2 text-xs focus:ring-secondary placeholder-[#a1a2ab]"
                {...register("name", { required: true })}
                readOnly={infoConfig}
              />
            </div>
            <div className="flex h-14">
              <h3 className="text-xs w-40 text-secondary-text">
                Description
              </h3>

              <textarea
                placeholder="Enter the datasource description here"
                
                className="px-4 w-[35rem] text-white rounded-[4px] border border-dropdown-border bg-page focus:outline-none focus:ring-2 text-xs focus:ring-secondary resize-none placeholder-[#a1a2ab]"
                {...register("about", { required: true })}
                readOnly={infoConfig}
              />
            </div>


            
          </div>
          <div className="h-9 flex items-center justify-between bg-secondary-bg px-2 rounded-[4px]">
            <h3 className="text-sm  text-white">  Selected Database & It’s Connections</h3>
            {
              true ? (
                <button
                  className="flex items-center space-x-2 text-xs font-medium group disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable text-btn-normal-text hover:text-btn-normal-hover"
                  // onClick={() => {
                  //   setInfoConfig(false);
                  //   setIsInfoSectionDirty(true);
                  // }}
                  // disabled={isFieldManagementDirty}

                  // type="button"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable fill-btn-normal-icon group-hover:fill-btn-normal-hover"
                    >
                      <path d="M1.33333 10.6667H2.28333L8.8 4.15L7.85 3.2L1.33333 9.71667V10.6667ZM0 12V9.16667L8.8 0.383333C8.93333 0.261111 9.08056 0.166667 9.24167 0.1C9.40278 0.0333333 9.57222 0 9.75 0C9.92778 0 10.1 0.0333333 10.2667 0.1C10.4333 0.166667 10.5778 0.266667 10.7 0.4L11.6167 1.33333C11.75 1.45556 11.8472 1.6 11.9083 1.76667C11.9694 1.93333 12 2.1 12 2.26667C12 2.44444 11.9694 2.61389 11.9083 2.775C11.8472 2.93611 11.75 3.08333 11.6167 3.21667L2.83333 12H0ZM8.31667 3.68333L7.85 3.2L8.8 4.15L8.31667 3.68333Z" />
                    </svg>
                  </span>
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-primary-text"
                    // onClick={() => {
                    //   setInfoConfig(false);
                    //   setIsInfoSectionDirty(true);
                    // }}
                    // disabled={isFieldManagementDirty}
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </span>

                    <span>Cancel</span>
                  </button>

                  <button
                    className={`flex items-center space-x-2 text-xs font-medium group disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable text-[#2A9E28] hover:text-primary-text`}
                    // onClick={
                    //   isDirty
                    //     ? () => {
                    //       setShowConfirmInfoModal(true);
                    //       setIsInfoSectionDirty(true);
                    //     }
                    //     : null
                    // }
                    // type="button"
                    // disabled={!isDirty}
                  >
                      <span className="flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable fill-[#2A9E28] group-hover:fill-btn-normal-hover">
                          <path d="M6.37031 12.0001L2.57031 8.20007L3.52031 7.25007L6.37031 10.1001L12.487 3.9834L13.437 4.9334L6.37031 12.0001Z" />
                        </svg>
                      </span>
                    <span>Save</span>
                  </button>
                </div>
              )
            }
          </div>
          
          {/* {database === "spreadsheet" && ( */}
            <div className="col-span-12">
              <div className="grid w-full grid-cols-12 items-center">
                <div className="col-span-2">
                  <p className="text-xs font-medium text-secondary-text">
                    Uploaded File
                  </p>
                </div>

                <div className="col-span-10">
                  <div className="relative max-w-xl w-full flex items-center justify-between px-3 py-2.5 space-x-2 text-xs font-normal border rounded-md 2xl:text-sm text-secondary-text border-border-color bg-page">
                    {/* <p>{dbConnection.file_name || ""}</p> */}
                    <p>{"file name"}</p>

                    <div className="flex items-center space-x-3 text-xs">
                      <a
                        className="flex items-center space-x-2 cursor-pointer group text-secondary-text hover:text-primary-text"
                        // onClick={handleDownloadSpreadsheet}
                      >
                        <span className="flex items-center justify-center">
                          <svg
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 fill-icon-color group-hover:fill-icon-color-hover"
                          >
                            <path d="M6.00033 8.66406L2.66699 5.33073L3.60033 4.36406L5.33366 6.0974V0.664062H6.66699V6.0974L8.40033 4.36406L9.33366 5.33073L6.00033 8.66406ZM2.00033 11.3307C1.63366 11.3307 1.31977 11.2002 1.05866 10.9391C0.797548 10.678 0.666992 10.3641 0.666992 9.9974V7.9974H2.00033V9.9974H10.0003V7.9974H11.3337V9.9974C11.3337 10.3641 11.2031 10.678 10.942 10.9391C10.6809 11.2002 10.367 11.3307 10.0003 11.3307H2.00033Z" />
                          </svg>
                        </span>

                        <span>Download File</span>
                      </a>

                      {/* {showConnection || ( */}
                        <>
                          <button
                            type="button"
                            className="flex items-center space-x-2 text-secondary-text hover:text-primary-text group"
                            // onClick={() => fileInputRef.current.click()}
                          // disabled={selectedFile}
                          >
                            {/* {isLoadingSpreadsheet || (
                              <span className="flex items-center justify-center">
                                <svg
                                  viewBox="0 0 12 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-3 h-3 fill-icon-color group-hover:fill-icon-color-hover"
                                >
                                  <path d="M6 14.6641C5.16667 14.6641 4.38611 14.5057 3.65833 14.1891C2.93056 13.8724 2.29722 13.4446 1.75833 12.9057C1.21944 12.3668 0.791667 11.7335 0.475 11.0057C0.158333 10.278 0 9.4974 0 8.66406H1.33333C1.33333 9.96406 1.78611 11.0668 2.69167 11.9724C3.59722 12.878 4.7 13.3307 6 13.3307C7.3 13.3307 8.40278 12.878 9.30833 11.9724C10.2139 11.0668 10.6667 9.96406 10.6667 8.66406C10.6667 7.36406 10.2139 6.26128 9.30833 5.35573C8.40278 4.45017 7.3 3.9974 6 3.9974H5.9L6.93333 5.03073L6 5.9974L3.33333 3.33073L6 0.664062L6.93333 1.63073L5.9 2.66406H6C6.83333 2.66406 7.61389 2.8224 8.34167 3.13906C9.06944 3.45573 9.70278 3.88351 10.2417 4.4224C10.7806 4.96129 11.2083 5.59462 11.525 6.3224C11.8417 7.05017 12 7.83073 12 8.66406C12 9.4974 11.8417 10.278 11.525 11.0057C11.2083 11.7335 10.7806 12.3668 10.2417 12.9057C9.70278 13.4446 9.06944 13.8724 8.34167 14.1891C7.61389 14.5057 6.83333 14.6641 6 14.6641Z" />
                                </svg>
                              </span>
                            )} */}

                            {/* {isLoadingSpreadsheet && (
                              <div role="status">
                                <svg
                                  aria-hidden="true"
                                  className="w-3 h-3 animate-spin text-primary-text fill-[#295EF4]"
                                  viewBox="0 0 100 101"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                  />
                                </svg>

                                <span className="sr-only">
                                  Loading...
                                </span>
                              </div>
                            )} */}

                            <span>Change File</span>
                          </button>

                          <input
                            type="file"
                            accept=".csv, .xls, .xlsx"
                            // ref={fileInputRef}
                            // onChange={handleFileChange}
                            style={{ display: "none" }}
                          />
                        </>
                      {/* )} */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/* )} */}

          <div className="grid grid-cols-12 gap-4">
            <div className="flex flex-col col-span-12 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src="/assets/information.svg"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Info content"
                    data-tooltip-place="right"
                  />

                  <p className="text-sm font-medium text-white">Information</p>
                </div>
                <div className="flex items-center">
                  {infoConfig && (
                    <button
                      className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-secondary hover:text-secondary-foreground"
                      onClick={() => {
                        setInfoConfig(false);
                        setIsInfoSectionDirty(true);
                      }}
                      disabled={isFieldManagementDirty}
                    >
                      <div className="flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                          />
                        </svg>
                      </div>
                      <span>Edit</span>
                    </button>
                  )}

                  {infoConfig || (
                    <div className="flex items-center space-x-4">
                      <a
                        className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-white"
                        onClick={() => {
                          setInfoConfig(true);
                          setIsInfoSectionDirty(false);
                          reset();
                        }}
                      >
                        <span className="flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18 18 6M6 6l12 12"
                            />
                          </svg>
                        </span>

                        <span>Cancel</span>
                      </a>

                      <a
                        className={`flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer ${isDirty
                          ? "text-[#2A9E28] hover:text-white"
                          : "text-white/40 cursor-not-allowed"
                          }`}
                        onClick={
                          isDirty
                            ? () => {
                              setShowConfirmInfoModal(true);
                              setIsInfoSectionDirty(true);
                            }
                            : null
                        }
                      >
                        <span className="flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        </span>
                        <span>Save</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`flex flex-col p-2 space-y-4 border rounded-md sm:p-4 ${infoConfig ? "border-border" : "border-secondary"
                  }`}
              >
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-normal text-white/40">
                    Datasource Name
                  </p>

                  <input
                    type="text"
                    className="w-full px-4 py-3 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                    {...register("name", { required: true })}
                    readOnly={infoConfig}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-normal text-white/40">
                    Datasource Description
                  </p>

                  <textarea
                    type="text"
                    className="w-full px-4 py-3 overflow-y-auto text-sm text-white border rounded-md outline-none resize-none h-36 border-border bg-[#181A1C] placeholder:text-white/40 recent__bar"
                    {...register("about", { required: true })}
                    readOnly={infoConfig}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col col-span-12 py-4 space-y-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <img src="/assets/field_management.svg" />
                  <p className="text-sm font-medium text-white">
                    Field Management
                  </p>
                </div>
              </div>

              <div className="flex flex-col p-2 space-y-4 border rounded-md sm:p-4 border-border">
                <div className="flex flex-col space-y-4">
                  <div className="grid items-center grid-cols-8 text-sm font-normal text-white gap-y-6 gap-x-5">
                    <div className="col-span-2">Field Name</div>
                    <div className="col-span-2">Field Type</div>
                    <div className="flex items-center col-span-2 space-x-2">
                      <p className="">Display Configuration</p>
                      <img
                        src="/assets/information.svg"
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Display Config"
                        data-tooltip-place="top"
                      />
                    </div>
                    <div className="flex items-center justify-center col-span-1 space-x-2">
                      <p className="">Allow Query</p>
                      <img
                        src="/assets/information.svg"
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Allow query"
                        data-tooltip-place="top"
                      />
                    </div>
                    <div className="flex items-center justify-center col-span-1">
                      Actions
                    </div>
                  </div>

                  {Object.entries(columns).map(([columnId, column]) => {
                    const fieldTypeValue = watch(
                      `columns[${columnId}].field_type`
                    );
                    const rowClasses = `grid grid-cols-8 gap-x-5 gap-y-16 items-start text-center py-4 ${editableStates[columnId]
                      ? "border border-secondary rounded-md"
                      : ""
                      }`;

                    return (
                      <div key={columnId} className={rowClasses}>
                        <div className="flex flex-col items-start col-span-2 space-y-2">
                          <input
                            type="text"
                            className="w-full px-2 py-2 text-sm text-white border rounded-md outline-none border-[#212227] bg-[#181A1C] placeholder:text-white/40"
                            placeholder="Enter name here..."
                            {...register(`columns[${columnId}].field_name`, {
                              required: true,
                            })}
                            value={column.field_name}
                            onChange={(e) =>
                              handleColumnChange(
                                columnId,
                                "field_name",
                                e.target.value
                              )
                            }
                            readOnly={!editableStates[columnId]}
                          />
                          {errors.columns &&
                            errors.columns[columnId] &&
                            errors.columns[columnId].field_name && (
                              <p className="mt-1 text-xs text-red-500">
                                Field name is required
                              </p>
                            )}
                        </div>

                        <div className="flex flex-col items-start col-span-2 space-y-4">
                          <Controller
                            name={`columns[${columnId}].field_type`}
                            control={control}
                            rules={{ required: "Field type is required" }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <SelectOption
                                options={fieldTypes}
                                placeholder="Select Field Type"
                                onSelect={(option) => {
                                  handleColumnChange(
                                    columnId,
                                    "field_type",
                                    option.value
                                  );
                                  onChange(option.value); // ensure the internal state is updated
                                }}
                                value={fieldTypes.find(
                                  (type) => type.value === value
                                )}
                                defaultValue={fieldTypes.find(
                                  (type) => type.value === column.field_type
                                )}
                                disabled={
                                  !editableStates[columnId] ||
                                  data?.ds_config?.columns?.hasOwnProperty(
                                    columnId
                                  )
                                }
                              />
                            )}
                          />
                          {errors.columns &&
                            errors.columns[columnId] &&
                            errors.columns[columnId].field_type && (
                              <p className="mt-1 text-xs text-red-500">
                                Field type is required
                              </p>
                            )}

                          {editableStates[columnId] &&
                            fieldTypeValue === "str" && (
                              <>
                                {/* <div className="flex items-center justify-between w-full text-center">
                              <span className="text-xs font-normal text-white/40">
                                THRESHOLD VALUES
                              </span>
                            </div> */}

                                <div className="flex flex-col w-full">
                                  <div className="w-full space-y-2">
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center justify-between w-full space-x-1">
                                        <div className="flex items-center space-x-2">
                                          <span>
                                            <svg
                                              width="16"
                                              height="16"
                                              viewBox="0 0 16 16"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path
                                                d="M7.33398 11.334H8.66732V7.33398H7.33398V11.334ZM8.00065 6.00065C8.18954 6.00065 8.34787 5.93676 8.47565 5.80898C8.60343 5.68121 8.66732 5.52287 8.66732 5.33398C8.66732 5.1451 8.60343 4.98676 8.47565 4.85898C8.34787 4.73121 8.18954 4.66732 8.00065 4.66732C7.81176 4.66732 7.65343 4.73121 7.52565 4.85898C7.39787 4.98676 7.33398 5.1451 7.33398 5.33398C7.33398 5.52287 7.39787 5.68121 7.52565 5.80898C7.65343 5.93676 7.81176 6.00065 8.00065 6.00065ZM8.00065 14.6673C7.07843 14.6673 6.21176 14.4923 5.40065 14.1423C4.58954 13.7923 3.88398 13.3173 3.28398 12.7173C2.68398 12.1173 2.20898 11.4118 1.85898 10.6007C1.50898 9.78954 1.33398 8.92287 1.33398 8.00065C1.33398 7.07843 1.50898 6.21176 1.85898 5.40065C2.20898 4.58954 2.68398 3.88398 3.28398 3.28398C3.88398 2.68398 4.58954 2.20898 5.40065 1.85898C6.21176 1.50898 7.07843 1.33398 8.00065 1.33398C8.92287 1.33398 9.78954 1.50898 10.6007 1.85898C11.4118 2.20898 12.1173 2.68398 12.7173 3.28398C13.3173 3.88398 13.7923 4.58954 14.1423 5.40065C14.4923 6.21176 14.6673 7.07843 14.6673 8.00065C14.6673 8.92287 14.4923 9.78954 14.1423 10.6007C13.7923 11.4118 13.3173 12.1173 12.7173 12.7173C12.1173 13.3173 11.4118 13.7923 10.6007 14.1423C9.78954 14.4923 8.92287 14.6673 8.00065 14.6673ZM8.00065 13.334C9.48954 13.334 10.7507 12.8173 11.784 11.784C12.8173 10.7507 13.334 9.48954 13.334 8.00065C13.334 6.51176 12.8173 5.25065 11.784 4.21732C10.7507 3.18398 9.48954 2.66732 8.00065 2.66732C6.51176 2.66732 5.25065 3.18398 4.21732 4.21732C3.18398 5.25065 2.66732 6.51176 2.66732 8.00065C2.66732 9.48954 3.18398 10.7507 4.21732 11.784C5.25065 12.8173 6.51176 13.334 8.00065 13.334Z"
                                                fill="white"
                                                fill-opacity="0.25"
                                              />
                                            </svg>
                                          </span>
                                          <span className="text-xs text-white ">
                                            Like Threshold
                                          </span>
                                        </div>

                                        {column.like_threshold && (
                                          <span className="text-xs text-center bg-[#181A1C] border border-[#212227] text-white py-1 px-2  rounded-md w-10 ">
                                            {column.like_threshold}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {editableStates[columnId] && (
                                      <div>
                                        <input
                                          type="range"
                                          min={0}
                                          max={1}
                                          step={0.01}
                                          className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-[#3C3C432E]"
                                          value={column.like_threshold}
                                          onChange={(e) =>
                                            handleColumnChange(
                                              columnId,
                                              "like_threshold",
                                              e.target.value
                                            )
                                          }
                                          disabled={!editableStates[columnId]}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div className="w-full ">
                                    <div className="flex items-center justify-between w-full mt-4">
                                      <div className="flex items-center justify-between w-full space-x-1">
                                        <div className="flex items-center space-x-2">
                                          <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M7.33398 11.334H8.66732V7.33398H7.33398V11.334ZM8.00065 6.00065C8.18954 6.00065 8.34787 5.93676 8.47565 5.80898C8.60343 5.68121 8.66732 5.52287 8.66732 5.33398C8.66732 5.1451 8.60343 4.98676 8.47565 4.85898C8.34787 4.73121 8.18954 4.66732 8.00065 4.66732C7.81176 4.66732 7.65343 4.73121 7.52565 4.85898C7.39787 4.98676 7.33398 5.1451 7.33398 5.33398C7.33398 5.52287 7.39787 5.68121 7.52565 5.80898C7.65343 5.93676 7.81176 6.00065 8.00065 6.00065ZM8.00065 14.6673C7.07843 14.6673 6.21176 14.4923 5.40065 14.1423C4.58954 13.7923 3.88398 13.3173 3.28398 12.7173C2.68398 12.1173 2.20898 11.4118 1.85898 10.6007C1.50898 9.78954 1.33398 8.92287 1.33398 8.00065C1.33398 7.07843 1.50898 6.21176 1.85898 5.40065C2.20898 4.58954 2.68398 3.88398 3.28398 3.28398C3.88398 2.68398 4.58954 2.20898 5.40065 1.85898C6.21176 1.50898 7.07843 1.33398 8.00065 1.33398C8.92287 1.33398 9.78954 1.50898 10.6007 1.85898C11.4118 2.20898 12.1173 2.68398 12.7173 3.28398C13.3173 3.88398 13.7923 4.58954 14.1423 5.40065C14.4923 6.21176 14.6673 7.07843 14.6673 8.00065C14.6673 8.92287 14.4923 9.78954 14.1423 10.6007C13.7923 11.4118 13.3173 12.1173 12.7173 12.7173C12.1173 13.3173 11.4118 13.7923 10.6007 14.1423C9.78954 14.4923 8.92287 14.6673 8.00065 14.6673ZM8.00065 13.334C9.48954 13.334 10.7507 12.8173 11.784 11.784C12.8173 10.7507 13.334 9.48954 13.334 8.00065C13.334 6.51176 12.8173 5.25065 11.784 4.21732C10.7507 3.18398 9.48954 2.66732 8.00065 2.66732C6.51176 2.66732 5.25065 3.18398 4.21732 4.21732C3.18398 5.25065 2.66732 6.51176 2.66732 8.00065C2.66732 9.48954 3.18398 10.7507 4.21732 11.784C5.25065 12.8173 6.51176 13.334 8.00065 13.334Z"
                                              fill="white"
                                              fill-opacity="0.25"
                                            />
                                          </svg>

                                          <span className="text-xs text-white">
                                            Not Like Threshold
                                          </span>
                                        </div>

                                        {column.not_like_threshold && (
                                          <span className="text-xs bg-[#181A1C] border border-[#212227] text-white py-1 px-2 rounded-md w-10">
                                            {column.not_like_threshold}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {editableStates[columnId] && (
                                      <div>
                                        <input
                                          type="range"
                                          min={0}
                                          max={1}
                                          step={0.01}
                                          className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-[#3C3C432E]"
                                          value={column.not_like_threshold}
                                          onChange={(e) =>
                                            handleColumnChange(
                                              columnId,
                                              "not_like_threshold",
                                              e.target.value
                                            )
                                          }
                                          disabled={!editableStates[columnId]}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                        </div>

                        <div className="flex flex-col items-start col-span-2 min-w-62">
                          <Controller
                            name={`columns[${columnId}].display_config`}
                            control={control}
                            rules={{
                              required: "Display configuration is required",
                            }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <SelectOption
                                options={displayConfigs}
                                placeholder="Select Display Config"
                                onSelect={(option) =>
                                  handleColumnChange(
                                    columnId,
                                    "display_config",
                                    option.value
                                  )
                                }
                                value={displayConfigs.find(
                                  (config) =>
                                    config.value === column.display_config
                                )}
                                defaultValue={displayConfigs.find(
                                  (config) =>
                                    config.value === column.display_config
                                )}
                                disabled={!editableStates[columnId]}
                              />
                            )}
                          />
                          {errors.columns &&
                            errors.columns[columnId] &&
                            errors.columns[columnId].display_config && (
                              <p className="mt-1 text-xs text-red-500">
                                Display Configuration is required
                              </p>
                            )}
                        </div>

                        <div
                          className={`flex flex-col items-center col-span-1 justify-center ${!editableStates[columnId] ? "h-full" : "h-10"
                            }`}
                        >
                          {!editableStates[columnId] ? (
                            <p className="text-xs  bg-[#181A1C] h-full text-white rounded-md pb-1.5 pt-[9px] px-4 border border-[#212227] w-3/5">
                              {column.allow_query ? "Yes" : "No"}
                            </p>
                          ) : (
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={column.allow_query}
                                {...register(`columns[${columnId}].allow_query`, {
                                  required: true,
                                })}
                                onChange={(e) =>
                                  handleColumnChange(
                                    columnId,
                                    "allow_query",
                                    e.target.checked
                                  )
                                }
                                className="sr-only peer"
                                disabled={!editableStates[columnId]}
                              />
                              <div className="relative w-11 h-6 bg-[#212327] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:after:bg-white peer-checked:bg-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1B1D1F] after:border-[#26282D] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer:after:bg-[#000000] peer:after:border-[#000000]"></div>
                            </label>
                          )}
                        </div>

                        <div
                          className={`flex flex-col items-center col-span-1 justify-center ${!editableStates[columnId] ? "h-full" : "h-10"
                            }`}
                        >
                          <div className="flex items-center space-x-4">
                            {!editableStates[columnId] ? (
                              <button
                                className={`flex items-center justify-center text-white/40 hover:text-white ${isInfoSectionDirty ||
                                  isAddNewColumnActive ||
                                  (currentlyEditing &&
                                    currentlyEditing !== columnId)
                                  ? "cursor-not-allowed"
                                  : ""
                                  }`}
                                disabled={
                                  isInfoSectionDirty ||
                                  isAddNewColumnActive ||
                                  (currentlyEditing &&
                                    currentlyEditing !== columnId)
                                }
                                onClick={() => {
                                  if (
                                    !currentlyEditing ||
                                    currentlyEditing === columnId
                                  ) {
                                    setEditableStates((prev) => ({
                                      ...prev,
                                      [columnId]: true,
                                    }));
                                    setCurrentlyEditing(columnId);
                                    setIsFieldManagementDirty(true);
                                  }
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                  />
                                </svg>
                              </button>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <button
                                  className={`flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer ${dirtyStates[columnId]
                                    ? ""
                                    : "text-white/40 hover:text-white cursor-not-allowed"
                                    }`}
                                  onClick={() => {
                                    setEditableStates((prev) => ({
                                      ...prev,
                                      [columnId]: false,
                                    }));
                                    setCurrentlyEditing(null);
                                    setIsFieldManagementDirty(false);
                                  }}
                                >
                                  <span className="flex items-center justify-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-[18px] h-[18px] text-[#9E2828] hover:text-white"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18 18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </span>
                                </button>

                                <button
                                  className={`flex items-center justify-center space-x-2 text-xs font-medium tracking-wide ${dirtyStates[columnId]
                                    ? "text-[#2A9E28] hover:text-white"
                                    : "text-white/40 hover:text-white cursor-not-allowed"
                                    }`}
                                  disabled={!dirtyStates[columnId]}
                                  onClick={
                                    dirtyStates[columnId]
                                      ? () => {
                                        handleColumnsConfig(columnId);
                                        setCurrentlyEditing(null);
                                        setIsFieldManagementDirty(false);
                                      }
                                      : null
                                  }
                                >
                                  <span className="flex items-center justify-center cursor-pointer">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-[18px] h-[18px] text-[#2A9E28] hover:text-white"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m4.5 12.75 6 6 9-13.5"
                                      />
                                    </svg>
                                  </span>
                                </button>
                              </div>
                            )}

                            <button
                              className={`flex items-center justify-center ${isInfoSectionDirty ||
                                (currentlyEditing &&
                                  currentlyEditing !== columnId)
                                ? "text-gray-400 cursor-not-allowed"
                                : "hover:text-white"
                                }`}
                              disabled={
                                isInfoSectionDirty ||
                                (currentlyEditing &&
                                  currentlyEditing !== columnId)
                              }
                              onClick={() => {
                                if (
                                  !currentlyEditing ||
                                  currentlyEditing === columnId
                                ) {
                                  setColumnId(columnId);
                                  setConfirmDeleteColumn(true);
                                  setIsFieldManagementDirty(false);
                                  setIsInfoSectionDirty(false);
                                }
                              }}
                            >
                              <svg
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 stroke-[#5F6368] hover:stroke-white"
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
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isAddNewColumnActive && (
                    <div className="grid items-start grid-cols-8 py-4 text-center border rounded-md gap-x-5 gap-y-16 border-secondary">
                      <div className="flex flex-col items-start col-span-2 space-y-2">
                        <input
                          type="text"
                          className="w-full px-2 py-2 text-sm text-white border rounded-md outline-none border-[#212227] bg-[#181A1C] placeholder:text-white/40"
                          placeholder="Enter name here..."
                          value={addNewColumn.field_name}
                          onChange={(e) =>
                            setAddNewColumn((prev) => ({
                              ...prev,
                              field_name: e.target.value,
                            }))
                          }
                        />
                        {errors.columns &&
                          errors.columns[columnId] &&
                          errors.columns[columnId].field_name && (
                            <p className="mt-1 text-xs text-red-500">
                              Field name is required
                            </p>
                          )}
                      </div>

                      <div className="flex flex-col items-start col-span-2 space-y-4">
                        <Controller
                          name={`addNewColumn_field_type`}
                          control={control}
                          rules={{ required: "Field type is required" }}
                          render={() => (
                            <SelectOption
                              options={fieldTypes}
                              placeholder="Select Field Type"
                              onSelect={(option) =>
                                setAddNewColumn((prev) => ({
                                  ...prev,
                                  field_type: option.value,
                                }))
                              }
                              value={fieldTypes.find(
                                (type) => type.value === addNewColumn.field_type
                              )}
                              defaultValue={fieldTypes.find(
                                (type) => type.value === addNewColumn.field_type
                              )}
                            />
                          )}
                        />
                        {errors.columns &&
                          errors.columns[columnId] &&
                          errors.columns[columnId].field_type && (
                            <p className="mt-1 text-xs text-red-500">
                              Field type is required
                            </p>
                          )}

                        {addNewColumn.field_type === "str" && (
                          <>
                            <div className="flex flex-col w-full">
                              <div className="w-full space-y-2">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center justify-between w-full space-x-1">
                                    <div className="flex items-center space-x-2">
                                      <span>
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 16 16"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M7.33398 11.334H8.66732V7.33398H7.33398V11.334ZM8.00065 6.00065C8.18954 6.00065 8.34787 5.93676 8.47565 5.80898C8.60343 5.68121 8.66732 5.52287 8.66732 5.33398C8.66732 5.1451 8.60343 4.98676 8.47565 4.85898C8.34787 4.73121 8.18954 4.66732 8.00065 4.66732C7.81176 4.66732 7.65343 4.73121 7.52565 4.85898C7.39787 4.98676 7.33398 5.1451 7.33398 5.33398C7.33398 5.52287 7.39787 5.68121 7.52565 5.80898C7.65343 5.93676 7.81176 6.00065 8.00065 6.00065ZM8.00065 14.6673C7.07843 14.6673 6.21176 14.4923 5.40065 14.1423C4.58954 13.7923 3.88398 13.3173 3.28398 12.7173C2.68398 12.1173 2.20898 11.4118 1.85898 10.6007C1.50898 9.78954 1.33398 8.92287 1.33398 8.00065C1.33398 7.07843 1.50898 6.21176 1.85898 5.40065C2.20898 4.58954 2.68398 3.88398 3.28398 3.28398C3.88398 2.68398 4.58954 2.20898 5.40065 1.85898C6.21176 1.50898 7.07843 1.33398 8.00065 1.33398C8.92287 1.33398 9.78954 1.50898 10.6007 1.85898C11.4118 2.20898 12.1173 2.68398 12.7173 3.28398C13.3173 3.88398 13.7923 4.58954 14.1423 5.40065C14.4923 6.21176 14.6673 7.07843 14.6673 8.00065C14.6673 8.92287 14.4923 9.78954 14.1423 10.6007C13.7923 11.4118 13.3173 12.1173 12.7173 12.7173C12.1173 13.3173 11.4118 13.7923 10.6007 14.1423C9.78954 14.4923 8.92287 14.6673 8.00065 14.6673ZM8.00065 13.334C9.48954 13.334 10.7507 12.8173 11.784 11.784C12.8173 10.7507 13.334 9.48954 13.334 8.00065C13.334 6.51176 12.8173 5.25065 11.784 4.21732C10.7507 3.18398 9.48954 2.66732 8.00065 2.66732C6.51176 2.66732 5.25065 3.18398 4.21732 4.21732C3.18398 5.25065 2.66732 6.51176 2.66732 8.00065C2.66732 9.48954 3.18398 10.7507 4.21732 11.784C5.25065 12.8173 6.51176 13.334 8.00065 13.334Z"
                                            fill="white"
                                            fill-opacity="0.25"
                                          />
                                        </svg>
                                      </span>
                                      <span className="text-xs text-white ">
                                        Like Threshold
                                      </span>
                                    </div>

                                    {addNewColumn.like_threshold && (
                                      <span className="text-xs text-center bg-[#181A1C] border border-[#212227] text-white py-1 px-2  rounded-md w-10 ">
                                        {addNewColumn.like_threshold}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-[#3C3C432E]"
                                    value={addNewColumn.like_threshold}
                                    onChange={(e) =>
                                      setAddNewColumn((prev) => ({
                                        ...prev,
                                        like_threshold: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                              </div>

                              <div className="w-full ">
                                <div className="flex items-center justify-between w-full mt-4">
                                  <div className="flex items-center justify-between w-full space-x-1">
                                    <div className="flex items-center space-x-2">
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M7.33398 11.334H8.66732V7.33398H7.33398V11.334ZM8.00065 6.00065C8.18954 6.00065 8.34787 5.93676 8.47565 5.80898C8.60343 5.68121 8.66732 5.52287 8.66732 5.33398C8.66732 5.1451 8.60343 4.98676 8.47565 4.85898C8.34787 4.73121 8.18954 4.66732 8.00065 4.66732C7.81176 4.66732 7.65343 4.73121 7.52565 4.85898C7.39787 4.98676 7.33398 5.1451 7.33398 5.33398C7.33398 5.52287 7.39787 5.68121 7.52565 5.80898C7.65343 5.93676 7.81176 6.00065 8.00065 6.00065ZM8.00065 14.6673C7.07843 14.6673 6.21176 14.4923 5.40065 14.1423C4.58954 13.7923 3.88398 13.3173 3.28398 12.7173C2.68398 12.1173 2.20898 11.4118 1.85898 10.6007C1.50898 9.78954 1.33398 8.92287 1.33398 8.00065C1.33398 7.07843 1.50898 6.21176 1.85898 5.40065C2.20898 4.58954 2.68398 3.88398 3.28398 3.28398C3.88398 2.68398 4.58954 2.20898 5.40065 1.85898C6.21176 1.50898 7.07843 1.33398 8.00065 1.33398C8.92287 1.33398 9.78954 1.50898 10.6007 1.85898C11.4118 2.20898 12.1173 2.68398 12.7173 3.28398C13.3173 3.88398 13.7923 4.58954 14.1423 5.40065C14.4923 6.21176 14.6673 7.07843 14.6673 8.00065C14.6673 8.92287 14.4923 9.78954 14.1423 10.6007C13.7923 11.4118 13.3173 12.1173 12.7173 12.7173C12.1173 13.3173 11.4118 13.7923 10.6007 14.1423C9.78954 14.4923 8.92287 14.6673 8.00065 14.6673ZM8.00065 13.334C9.48954 13.334 10.7507 12.8173 11.784 11.784C12.8173 10.7507 13.334 9.48954 13.334 8.00065C13.334 6.51176 12.8173 5.25065 11.784 4.21732C10.7507 3.18398 9.48954 2.66732 8.00065 2.66732C6.51176 2.66732 5.25065 3.18398 4.21732 4.21732C3.18398 5.25065 2.66732 6.51176 2.66732 8.00065C2.66732 9.48954 3.18398 10.7507 4.21732 11.784C5.25065 12.8173 6.51176 13.334 8.00065 13.334Z"
                                          fill="white"
                                          fill-opacity="0.25"
                                        />
                                      </svg>

                                      <span className="text-xs text-white">
                                        Not Like Threshold
                                      </span>
                                    </div>

                                    {addNewColumn.not_like_threshold && (
                                      <span className="text-xs bg-[#181A1C] border border-[#212227] text-white py-1 px-2 rounded-md w-10">
                                        {addNewColumn.not_like_threshold}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-[#3C3C432E]"
                                    value={addNewColumn.not_like_threshold}
                                    onChange={(e) =>
                                      setAddNewColumn((prev) => ({
                                        ...prev,
                                        not_like_threshold: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col items-start col-span-2 min-w-62">
                        <Controller
                          name={"addNewColumn_display_config"}
                          control={control}
                          rules={{
                            required: "Display configuration is required",
                          }}
                          render={() => (
                            <SelectOption
                              options={displayConfigs}
                              placeholder="Select Display Config"
                              onSelect={(option) =>
                                setAddNewColumn((prev) => ({
                                  ...prev,
                                  display_config: option.value,
                                }))
                              }
                              value={displayConfigs.find(
                                (config) =>
                                  config.value === addNewColumn.display_config
                              )}
                              defaultValue={displayConfigs.find(
                                (config) =>
                                  config.value === addNewColumn.display_config
                              )}
                            />
                          )}
                        />
                        {errors.columns &&
                          errors.columns[columnId] &&
                          errors.columns[columnId].display_config && (
                            <p className="mt-1 text-xs text-red-500">
                              Display Configuration is required
                            </p>
                          )}
                      </div>

                      <div
                        className={`flex flex-col items-center col-span-1 justify-center h-10`}
                      >
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addNewColumn.allow_query}
                            onChange={(e) =>
                              setAddNewColumn((prev) => ({
                                ...prev,
                                allow_query: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-[#212327] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:after:bg-white peer-checked:bg-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1B1D1F] after:border-[#26282D] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer:after:bg-[#000000] peer:after:border-[#000000]"></div>
                        </label>
                      </div>

                      <div
                        className={`flex flex-col items-center col-span-1 justify-center h-10`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <button
                              className={`flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer`}
                              onClick={() => {
                                setAddNewColumn({
                                  field_name: "",
                                  field_type: "",
                                  allow_query: false,
                                  display_config: "",
                                  like_threshold: 0.9,
                                  not_like_threshold: 0.85,
                                });
                                setIsAddNewColumnActive(false);
                                setIsFieldManagementDirty(false);
                              }}
                            >
                              <span className="flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-[18px] h-[18px] text-[#9E2828] hover:text-white"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                  />
                                </svg>
                              </span>
                            </button>

                            <button
                              className={`flex items-center justify-center space-x-2 text-xs  font-medium tracking-wide`}
                              onClick={() => {
                                handleNewColumnConfig(addNewColumn);
                              }}
                            >
                              <span className="flex items-center justify-center cursor-pointer">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-[18px] h-[18px] text-[#2A9E28] hover:text-white"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m4.5 12.75 6 6 9-13.5"
                                  />
                                </svg>
                              </span>
                            </button>
                          </div>

                          <button
                            className={`flex items-center justify-center ${currentlyEditing && currentlyEditing !== columnId
                              ? "text-gray-400 cursor-not-allowed"
                              : "hover:text-white"
                              }`}
                            disabled={isInfoSectionDirty && (currentlyEditing && currentlyEditing !== columnId)}
                            onClick={() => {
                              if (!currentlyEditing) {
                                setColumnId(columnId);
                                setConfirmDeleteColumn(true);
                                setIsFieldManagementDirty(false)
                                setIsInfoSectionDirty(false)
                              }
                            }}
                          >
                            <svg
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 stroke-[#5F6368] hover:stroke-white"
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
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-start">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-md disabled:bg-[#26282D]/50 ${!isAddNewColumnActive
                      ? "text-white bg-[#26282D] cursor-pointer"
                      : "text-gray-400 bg-[#26282D]/50 cursor-not-allowed"
                      }`}
                    onClick={addColumn}
                    disabled={!allFieldsFilled()}
                  >
                    + Add New Field
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ConfirmModal
          show={showConfirmInfoModal}
          setShow={setShowConfirmInfoModal}
          heading="Confirm Information Edit"
          title={"Do you want to confirm these changes?"}
          description={
            "Datasource Information will be updated after these changes."
          }
          primaryBtn="Yes, Confirm"
          primaryChange={handleInfoConfig}
          secondaryBtn="No"
          secondaryChange={() => setShowConfirmInfoModal(false)}
        />

        <ConfirmModal
          show={confirmDeleteColumn}
          setShow={setConfirmDeleteColumn}
          heading="Confirm Delete"
          title=""
          description="Do you want to delete these column?"
          primaryBtn="Yes, Confirm"
          primaryChange={() => removeColumn()}
          secondaryBtn="No"
          secondaryChange={() => setConfirmDeleteColumn(false)}
        />

        <ConfirmModal
          show={showConfirmModelConfigModal}
          setShow={setShowConfirmModelConfigModal}
          heading="Confirm Embeddings Model Edit"
          title={"Do you want to confirm these changes?"}
          description={
            "The Embeddings Model will be updated after these changes."
          }
          primaryBtn="Yes, Confirm"
          primaryChange={handleEmbeddingConfig}
          secondaryBtn="No"
          secondaryChange={() => setShowConfirmModelConfigModal(false)}
        />

        <SuccessModal
          show={showSuccessOnAddModal}
          setShow={setShowSuccessOnAddModal}
          heading="Success Confirmation"
          title=""
          description="Column Added Successfully"
          primaryBtn="Close"
          primaryChange={() => setShowSuccessOnAddModal(false)}
        />

        <SuccessModal
          show={showSuccessUpdatedModal}
          setShow={setShowSuccessUpdatedModal}
          heading="Success Confirmation"
          title=""
          description="Column Updated Successfully"
          primaryBtn="Close"
          primaryChange={() => setShowSuccessUpdatedModal(false)}
        />

        <SuccessModal
          show={showSuccessDelete}
          setShow={setShowSuccessDelete}
          heading="Success Confirmation"
          title=""
          description="Column Deleted Successfully"
          primaryBtn="Close"
          primaryChange={() => setShowSuccessDelete(false)}
        />

        <SuccessModal
          show={showSuccessInfoUpdate}
          setShow={setShowSuccessInfoUpdate}
          heading="Success Confirmation"
          title=""
          description="Information Updated Successfully"
          primaryBtn="Close"
          primaryChange={() => setShowSuccessInfoUpdate(false)}
        />
      </DatasourceLayout>
      </div>
  );
};

export default SemiStructuredDatasourceDetails;
