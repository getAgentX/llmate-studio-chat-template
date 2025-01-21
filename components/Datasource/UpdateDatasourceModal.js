import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMultistepForm } from "@/hooks/useMultistepForm";
import ConfirmModal from "../Modal/ConfirmModal";
import { useRouter } from "next/router";
import {
  useGetDatasourceInfoQuery,
  useUpdateDatabaseConnectionMutation,
  useUpdateSpreadsheetMutation,
  useGetDatabasesForDatasourceQuery,
  useGetTablesConnectionQuery,
  useGetTableSchemaQuery,
  useGetTableSchemaForDbQuery,
  useGetDbConnectionListQuery,
} from "@/store/datasource";
import SuccessModal from "../Modal/SuccessModal";
// import UpdateTableColumnInformation from "./UpdateTableColumnInformation";
import useDebounce from "@/hooks/useDebounce";
import isEqual from "lodash/isEqual";
import { useTheme } from "@/hooks/useTheme";
import { TableIcon } from "../Icons/icon";

const databases = [
  { name: "spreadsheet", img: "/assets/spreadsheet.svg", label: "Spreadsheet" },
  { name: "bigquery", img: "/assets/google-bigquery.svg", label: "Big Query" },
  { name: "postgres", img: "/assets/postgresql.svg", label: "Postgresql" },
  { name: "mariadb", img: "/assets/vector.svg", label: "Mariadb" },
  { name: "snowflake", img: "/assets/snowflake.svg", label: "Snowflake" },
  { name: "mysql", img: "/assets/mysql-logo.svg", label: "My SQL" },
  { name: "athena", img: "/assets/AWS-Athena.svg", label: "AWS Athena" },
  { name: "databricks", img: "/assets/Databricks.svg", label: "Databricks" },
  { name: "redshift", img: "/assets/aws-redshift.svg", label: "AWS Redshift" },
];

const UpdateDatasourceModal = ({
  show,
  setShow,
  dbConnection,
  setShowSuccess,
  refetch,
}) => {
  const modalRef = useRef(null);
  const [currentDatasource, setCurrentDatasource] = useState(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShow(false);
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
  }, [show]);

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] max-h-full md:inset-0 bg_blur ${
        show ? "" : "hidden"
      }`}
    >
      <div
        className="fixed top-0 bottom-0 right-0 w-full h-full max-w-[700px] overflow-x-hidden overflow-y-auto border-l border-border-color bg-page recent__bar"
        ref={modalRef}
      >
        <div className="relative flex flex-col h-full">
          <div className="sticky top-0 left-0 z-50 flex items-center justify-between w-full px-4 border-b min-h-12 bg-page border-border-color">
            <div className="flex items-center space-x-4 text-xs font-semibold tracking-wide text-primary-text">
              <span
                className="flex items-center justify-center"
                onClick={() => setShow(false)}
              >
                <svg
                  viewBox="0 0 12 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                >
                  <path
                    fill-rule="evenodd"
                    clipRule="evenodd"
                    d="M6.00104 6.91474L9.53637 10.4501C9.72397 10.6377 9.9784 10.7431 10.2437 10.7431C10.509 10.7431 10.7634 10.6377 10.951 10.4501C11.1386 10.2625 11.244 10.008 11.244 9.74274C11.244 9.47744 11.1386 9.223 10.951 9.03541L7.41437 5.50007L10.9504 1.96474C11.0432 1.87185 11.1169 1.76159 11.1671 1.64024C11.2173 1.51889 11.2432 1.38884 11.2431 1.2575C11.2431 1.12617 11.2172 0.99613 11.1669 0.874806C11.1166 0.753482 11.0429 0.643251 10.95 0.550407C10.8571 0.457562 10.7469 0.383923 10.6255 0.333692C10.5042 0.283462 10.3741 0.257624 10.2428 0.257655C10.1115 0.257686 9.98143 0.283585 9.8601 0.333872C9.73878 0.38416 9.62855 0.457852 9.5357 0.55074L6.00104 4.08607L2.4657 0.55074C2.3735 0.455188 2.26319 0.378954 2.14121 0.326488C2.01924 0.274023 1.88803 0.246375 1.75525 0.245159C1.62247 0.243943 1.49078 0.269183 1.36786 0.319406C1.24494 0.369629 1.13326 0.443829 1.03932 0.537677C0.945384 0.631525 0.871078 0.743142 0.820739 0.866014C0.770401 0.988886 0.745037 1.12055 0.746127 1.25333C0.747218 1.38611 0.774742 1.51734 0.827093 1.63937C0.879443 1.7614 0.955572 1.87178 1.05104 1.96407L4.5877 5.50007L1.05171 9.03607C0.956239 9.12837 0.88011 9.23875 0.827759 9.36077C0.775409 9.4828 0.747885 9.61403 0.746794 9.74681C0.745703 9.87959 0.771067 10.0113 0.821406 10.1341C0.871745 10.257 0.94605 10.3686 1.03999 10.4625C1.13392 10.5563 1.24561 10.6305 1.36853 10.6807C1.49145 10.731 1.62314 10.7562 1.75592 10.755C1.8887 10.7538 2.0199 10.7261 2.14188 10.6737C2.26386 10.6212 2.37417 10.545 2.46637 10.4494L6.00104 6.91541V6.91474Z"
                  />
                </svg>
              </span>

              <span>Datasource update</span>

              {currentDatasource === "structured" && (
                <div className="py-1 px-3 text-xs flex items-center justify-center space-x-2 rounded-full bg-page-hover text-[#49B1C5] w-fit">
                  <span className="w-1 h-1 rounded-full bg-[#49B1C5]"></span>
                  <span>Structured</span>
                </div>
              )}

              {currentDatasource === "semi-structured" && (
                <div className="py-1 px-3 text-xs flex items-center justify-center space-x-2 rounded-full bg-page-hover text-[#D980EC] w-fit">
                  <span className="w-1 h-1 rounded-full bg-[#D980EC]"></span>
                  <span>Semi-Structured</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col h-full px-4 pt-4 space-y-3">
            <Structured
              setShow={setShow}
              dbConnection={dbConnection}
              setShowSuccess={setShowSuccess}
              refetch={refetch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateDatasourceModal;

const Structured = ({ setShow, dbConnection, setShowSuccess, refetch }) => {
  const [jsonData, setJsonData] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [datasourceId, setDatasourceId] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [tablesChanged, setTablesChanged] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

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
      name: "",
      about: "",
      db_connection: {
        db_type: "bigquery",
      },
      file: "",
      database: "",
      tables: [],
      embedding_model: {
        embedding_provider: "openai",
        model: "text-embedding-ada-002",
      },
    },
  });

  const {
    data: getRes,
    isLoading,
    error: getError,
  } = useGetDatasourceInfoQuery(
    {
      datasource_id: router.query.slug,
    },
    {
      skip: !router.query.slug,
      refetchOnMountOrArgChange: true,
    }
  );

  const [updateDatabaseConnection, {}] = useUpdateDatabaseConnectionMutation();
  const [updateSpreadsheet, { isLoading: isLoadingSpreadsheet }] =
    useUpdateSpreadsheetMutation();

  useEffect(() => {
    setValue("db_connection", { ...dbConnection });
    setValue("database", getRes.ds_config.database);
  }, [dbConnection, getRes]);

  const dbConnectionData = getValues("db_connection");

  const handleUpdate = () => {
    const database = getValues("database");

    function getTrueColumnNames(data) {
      const result = {};

      Object.keys(data).forEach((tableName) => {
        const trueColumnNames = data[tableName]
          .filter(
            (column) => column.status === true || column.status === "true"
          )
          .map((column) => column.name);
        if (trueColumnNames.length > 0) {
          result[tableName] = trueColumnNames;
        }
      });

      return result;
    }

    const result = getTrueColumnNames(selectedColumns);

    const contextData = {
      database: database,
      db_connection: dbConnectionData,
      table_schema: result,
    };

    updateDatabaseConnection({
      datasource_id: router.query.slug,
      payload: contextData,
    })
      .then((response) => {
        if (response.data === null) {
          setShow(false);
          setShowSuccess(true);
          refetch();
        } else {
          setShow(false);
          setShowSuccess(false);
        }
      })
      .catch((error) => {
        setShowSuccess(false);
      });
  };

  const dbType = watch("db_connection.db_type");

  const ComponentData = [
    {
      name: `Select DB & 
      Add Connection`,
      component: (
        <SelectConnection
          register={register}
          setValue={setValue}
          watch={watch}
          getValues={getValues}
          reset={reset}
          isValid={isValid}
          isDirty={isDirty}
          handleCancel={() => setShowConfirmModal(true)}
          jsonData={jsonData}
          setJsonData={setJsonData}
          dbConnection={dbConnection}
          isLoadingSpreadsheet={isLoadingSpreadsheet}
        />
      ),
    },
    ...(dbType !== "spreadsheet"
      ? [
          {
            name: `Select Database, Table & Column`,
            component: (
              <UpdateTableColumnInformation
                setValue={setValue}
                watch={watch}
                setTablesChanged={setTablesChanged}
                getRes={getRes}
                dbConnectionData={dbConnectionData}
                selectedColumns={selectedColumns}
                setSelectedColumns={setSelectedColumns}
                update={true}
                handleUpdate={handleUpdate}
                tablesChanged={tablesChanged}
                theme={theme}
              />
            ),
          },
        ]
      : []),
  ];

  const {
    steps,
    currentStepIndex,
    step,
    isFirstStep,
    isLastStep,
    back,
    next,
    goTo,
  } = useMultistepForm(ComponentData);

  ComponentData.forEach((step) => {
    if (step.component.props.back === undefined) {
      step.component = React.cloneElement(step.component, { back, isLastStep });
    }
  });

  function onSubmit(data) {
    if (!isLastStep) return next();

    if (dbType === "spreadsheet") {
      delete data.db_connection;
      delete data.database;
      delete data.embedding_model;
      delete data.tables;

      const newData = {
        ...data,
        name: data?.file?.name || "",
      };

      const formData = new FormData();
      formData.append("file", newData.file);
      formData.append("ds_name", newData.file.name);

      Object.keys(newData).forEach((key) => {
        if (key !== "file" && key !== "name") {
          formData.append(key, newData[key]);
        }
      });

      updateSpreadsheet({
        datasource_id: router.query.slug,
        payload: formData,
      }).then((response) => {
        if (response.data === null) {
          // setDatasourceId(response.data.id);
          // setShowSuccessModal(true);
          refetch();
          setShow(false);
        }
      });
    }
  }

  const handlePrimary = () => {
    router.push(`/datasource/details/${datasourceId}/query`);
  };

  return (
    <div className="relative flex flex-col w-full h-full space-y-4">
      {isFirstStep && (
        <p className="text-xs font-semibold tracking-wide text-primary-text">
          Select DB
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="h-full">
        {step.component}
      </form>

      {showConfirmModal && (
        <ConfirmModal
          show={showConfirmModal}
          setShow={setShowConfirmModal}
          heading="Confirm Cancellation?"
          title="Are you sure you want to cancel?"
          description=""
          primaryBtn="No, Continue"
          primaryChange={() => setShowConfirmModal(false)}
          secondaryBtn="Yes"
          secondaryChange={() => setShow(false)}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          show={showSuccessModal}
          setShow={setShowSuccessModal}
          heading="Success Confirmation"
          title={""}
          description={"Datasource Updated Sucessfully"}
          // primaryBtn="Query"
          // primaryChange={handlePrimary}
          secondaryBtn="Close"
          secondaryChange={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

const SelectConnection = ({
  register,
  setValue,
  watch,
  getValues = () => {},
  reset = () => {},
  handleCancel = () => {},
  jsonData,
  setJsonData,
  back: previous,
  isValid = () => {},
  isDirty = () => {},
  dbConnection,
  isLoadingSpreadsheet,
}) => {
  const [database, setDatabase] = useState("");
  const [originalValues, setOriginalValues] = useState({});
  const [privateKey, setPrivateKey] = useState(jsonData.private_key || "");
  const [clientEmail, setClientEmail] = useState(jsonData.client_email || "");
  const [projectId, setProjectId] = useState(jsonData.project_id || "");
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  const dbType = watch("db_connection.db_type");

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  useEffect(() => {
    const databaseData = watch("db_connection.db_type");

    if (databaseData) {
      setDatabase(databaseData);

      if (databaseData === "spreadsheet") {
        const values = getValues();

        const newValues = {
          ...values,
          db_connection: {
            ...values.db_connection,
            file_key: "",
            file_name: "",
            file_type: "",
          },
          tables: [],
        };

        reset(newValues);
      }
    } else {
      setDatabase("spreadsheet");
    }

    // Store original values
    setOriginalValues(getValues());

    if (databaseData === "spreadsheet" && dbConnection?.file_name) {
      // Set the selectedFile state with the existing file details
      const file = {
        name: dbConnection.file_name,
        size: 0, // Size is unknown
        type: dbConnection.file_type,
      };
      setSelectedFile(file);
      // Set the file in the form values
      setValue("file", file, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [dbConnection]);

  const handleDatabaseSelect = (newDatabase) => {
    const values = getValues();

    const newValues = {
      ...values,
      db_connection: {
        // ...values.db_connection,
        db_type: newDatabase,
      },
      tables: [],
      database: "",
    };

    setJsonData({});
    reset(newValues);
    setDatabase(newDatabase);
    setValue("db_connection.db_type", newDatabase);
  };

  const handleReset = () => {
    reset(originalValues);
    setDatabase(originalValues?.db_connection?.db_type || "");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Get the first file (only one allowed)

    if (file && file.type === "application/json") {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const parsedJson = JSON.parse(e.target.result);
          setJsonData(parsedJson); // Store the parsed JSON data

          if (
            parsedJson.private_key &&
            parsedJson.client_email &&
            parsedJson.project_id
          ) {
            setPrivateKey(parsedJson.private_key);
            setClientEmail(parsedJson.client_email);
            setProjectId(parsedJson.project_id);

            const data = {
              private_key: parsedJson.private_key,
              client_email: parsedJson.client_email,
            };

            setValue("db_connection.project", parsedJson.project_id, {
              shouldValidate: true,
              shouldDirty: true,
            });

            setValue("db_connection.key_base64", data, {
              shouldValidate: true,
              shouldDirty: true,
            });
          } else {
            console.error("Required fields not found in JSON.");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };

      reader.readAsText(file); // Read the content of the file as text
    } else {
      console.log("Please upload a valid JSON file.");
    }
  };

  const handleAddFileClick = () => {
    fileInputRef.current.click();
  };

  const formatFileSize = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const supportedListType = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/x-excel",
    "application/x-msexcel",
    "application/xls",
    "application/x-xls",
    "application/vnd.ms-excel.addin.macroEnabled.12",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
    "application/vnd.ms-excel.template.macroEnabled.12",
  ];

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];

  //   if (file && supportedListType.includes(file.type)) {
  //     setSelectedFile(file);

  //     setValue("file", file, {
  //       shouldValidate: true,
  //       shouldDirty: true,
  //     });
  //   } else {
  //     console.log("Please select a CSV file.");
  //   }
  // };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Let react-hook-form's validate handle the size check
    setSelectedFile(file);

    setValue("file", file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="relative flex flex-col justify-between h-full">
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <div className="flex flex-col w-full space-y-4">
              <div className="grid w-full grid-cols-5 gap-4 select-none">
                {databases.map((db) => (
                  <button
                    key={db.name}
                    className={`flex flex-col space-y-3 items-center justify-center w-full px-2 py-2 space-x-2 text-xs font-medium text-primary-text border rounded-md cursor-pointer ${
                      database === db.name
                        ? "bg-page border-border-active-color"
                        : "border-border-color"
                    }`}
                    onClick={() => handleDatabaseSelect(db.name)}
                    type="button"
                  >
                    <img src={db.img} alt={db.label} className="w-8 h-8" />
                    <span>{db.label}</span>
                  </button>
                ))}
              </div>

              <input
                type="hidden"
                value={database}
                {...register("db_connection.db_type", { required: true })}
              />
            </div>
          </div>

          {database === "" && (
            <div className="col-span-12 border rounded-md border-border">
              <div className="flex flex-col">
                <div className="flex flex-col w-full px-4 py-4 text-center border-b border-border">
                  <p className="text-xs font-medium tracking-wide text-primary-text">
                    Add DB Connection
                  </p>
                </div>

                <div className="flex flex-col min-h-[240px] items-center justify-center w-full h-full space-y-2">
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 21 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 fill-icon-color"
                    >
                      <path d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 7.5 11.0208 7.40417 11.2125 7.2125C11.4042 7.02083 11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 11.2125 5.7875C11.0208 5.59583 10.7833 5.5 10.5 5.5C10.2167 5.5 9.97917 5.59583 9.7875 5.7875C9.59583 5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 9.59583 7.02083 9.7875 7.2125C9.97917 7.40417 10.2167 7.5 10.5 7.5ZM10.5 20.5C9.11667 20.5 7.81667 20.2375 6.6 19.7125C5.38333 19.1875 4.325 18.475 3.425 17.575C2.525 16.675 1.8125 15.6167 1.2875 14.4C0.7625 13.1833 0.5 11.8833 0.5 10.5C0.5 9.11667 0.7625 7.81667 1.2875 6.6C1.8125 5.38333 2.525 4.325 3.425 3.425C4.325 2.525 5.38333 1.8125 6.6 1.2875C7.81667 0.7625 9.11667 0.5 10.5 0.5C11.8833 0.5 13.1833 0.7625 14.4 1.2875C15.6167 1.8125 16.675 2.525 17.575 3.425C18.475 4.325 19.1875 5.38333 19.7125 6.6C20.2375 7.81667 20.5 9.11667 20.5 10.5C20.5 11.8833 20.2375 13.1833 19.7125 14.4C19.1875 15.6167 18.475 16.675 17.575 17.575C16.675 18.475 15.6167 19.1875 14.4 19.7125C13.1833 20.2375 11.8833 20.5 10.5 20.5ZM10.5 18.5C12.7333 18.5 14.625 17.725 16.175 16.175C17.725 14.625 18.5 12.7333 18.5 10.5C18.5 8.26667 17.725 6.375 16.175 4.825C14.625 3.275 12.7333 2.5 10.5 2.5C8.26667 2.5 6.375 3.275 4.825 4.825C3.275 6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 3.275 14.625 4.825 16.175C6.375 17.725 8.26667 18.5 10.5 18.5Z" />
                    </svg>
                  </span>

                  <span className="text-sm font-medium tracking-wider text-primary-text">
                    No DB has selected
                  </span>

                  <span className="text-sm font-normal tracking-wider text-secondary-text">
                    Select the required DB on the left and add the connections
                    here
                  </span>
                </div>
              </div>
            </div>
          )}

          {database && (
            <div className="col-span-12">
              <div className="flex flex-col">
                {database === "bigquery" && (
                  <div className="flex flex-col space-y-4">
                    {Object.keys(jsonData).length === 0 && (
                      <div className="flex items-center justify-center w-full">
                        <div className="flex flex-col w-full space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-normal text-primary-text">
                              Service-user json file*
                            </p>
                          </div>

                          <label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-64 border border-dashed rounded-md cursor-pointer border-border-color bg-page"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className="w-8 h-8 mb-4 text-secondary-text"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 16"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                />
                              </svg>
                              <p className="mb-2 text-sm text-secondary-text">
                                <span className="font-semibold">Click to</span>{" "}
                                upload service-user json file
                              </p>
                            </div>
                            <input
                              id="dropzone-file"
                              type="file"
                              accept=".json" // Restrict file type to JSON only
                              className="hidden"
                              onChange={handleFileUpload} // Handle file upload
                              // {...register("db_connection.key_base64", {
                              //   required: true,
                              // })}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {Object.keys(jsonData).length > 0 && (
                      <div className="flex flex-col space-y-4">
                        {projectId !== "" && (
                          <div className="grid grid-cols-12">
                            <div className="col-span-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-normal text-primary-text">
                                  Project *
                                </p>

                                {/* <span
                                  className="flex items-center justify-center cursor-pointer"
                                  onClick={handleRemoveServiceJson}
                                  data-tooltip-id="tooltip"
                                  data-tooltip-content="Clear"
                                  data-tooltip-place="bottom"
                                >
                                  <svg
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 fill-secondary-text hover:fill-primary-text"
                                  >
                                    <path d="M2.6665 12C2.29984 12 1.98595 11.8694 1.72484 11.6083C1.46373 11.3472 1.33317 11.0333 1.33317 10.6667V2H0.666504V0.666667H3.99984V0H7.99984V0.666667H11.3332V2H10.6665V10.6667C10.6665 11.0333 10.5359 11.3472 10.2748 11.6083C10.0137 11.8694 9.69984 12 9.33317 12H2.6665ZM9.33317 2H2.6665V10.6667H9.33317V2ZM3.99984 9.33333H5.33317V3.33333H3.99984V9.33333ZM6.6665 9.33333H7.99984V3.33333H6.6665V9.33333Z" />
                                  </svg>
                                </span> */}
                              </div>
                            </div>

                            <div className="col-span-10">
                              <input
                                type="text"
                                className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                                placeholder="Enter your BigQuery project name"
                                {...register("db_connection.project", {
                                  required: true,
                                })}
                                readOnly={true}
                              />
                            </div>
                          </div>
                        )}

                        {clientEmail !== "" && (
                          <div className="grid grid-cols-12">
                            <div className="col-span-2">
                              <p className="text-xs font-medium text-primary-text text-nowrap">
                                Client Email *
                              </p>
                            </div>

                            <div className="col-span-10">
                              <input
                                type="text"
                                className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                                {...register(
                                  "db_connection.key_base64.client_email",
                                  {
                                    required: true,
                                  }
                                )}
                                // value={clientEmail}
                                readOnly={true}
                              />
                            </div>
                          </div>
                        )}

                        {privateKey !== "" && (
                          <div className="grid grid-cols-12">
                            <div className="col-span-2">
                              <p className="text-xs font-medium text-primary-text text-nowrap">
                                Private Key:
                              </p>
                            </div>

                            <div className="col-span-10">
                              <textarea
                                type="text"
                                className="w-full px-4 py-3 overflow-y-auto text-xs border rounded-md outline-none resize-none h-36 bg-page recent__bar text-input-text border-input-border placeholder:text-input-placeholder"
                                placeholder="Provide the Base64-encoded key for authentication with BigQuery"
                                {...register(
                                  "db_connection.key_base64.private_key",
                                  {
                                    required: true,
                                  }
                                )}
                                // value={privateKey}
                                readOnly={true}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <input
                      type="hidden"
                      {...register("db_connection.key_base64", {
                        required: true,
                      })}
                    />
                  </div>
                )}

                {database === "postgres" && (
                  <div className="flex flex-col w-full space-y-4">
                    <p className="text-xs font-semibold tracking-wide text-primary-text">
                      Add Connections
                    </p>

                    <div className="flex flex-col space-y-4">
                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            User *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <div className="w-full">
                            <input
                              type="text"
                              className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                              placeholder="Enter your PostgreSQL username"
                              {...register("db_connection.user", {
                                required: true,
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Password *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="password"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your PostgreSQL password"
                            {...register("db_connection.password", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Host *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Provide the host address for your PostgreSQL database"
                            {...register("db_connection.host", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Port *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter the port number for your PostgreSQL database"
                            {...register("db_connection.port", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Database Name *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Provide the name of the PostgreSQL database"
                            {...register("db_connection.database", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {database === "mariadb" && (
                  <div className="flex flex-col w-full space-y-4">
                    <p className="text-xs font-semibold tracking-wide text-primary-text">
                      Add Connections
                    </p>

                    <div className="flex flex-col space-y-4">
                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            User *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your MariaDB username"
                            {...register("db_connection.user", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Password *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="password"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your MariaDB password"
                            {...register("db_connection.password", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Host *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Provide the host address for your MariaDB database"
                            {...register("db_connection.host", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Port *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter the port number for your MariaDB database"
                            {...register("db_connection.port", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {database === "snowflake" && (
                  <div className="flex flex-col w-full space-y-4">
                    <p className="text-xs font-semibold tracking-wide text-primary-text">
                      Add Connections
                    </p>

                    <div className="flex flex-col space-y-4">
                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            User *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your Snowflake username"
                            {...register("db_connection.user", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Password *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="password"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your Snowflake password"
                            {...register("db_connection.password", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Account *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Provide the Snowflake account name"
                            {...register("db_connection.account", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Warehouse *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter the Snowflake warehouse name"
                            {...register("db_connection.warehouse", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Db Collection *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Specify the name of the Snowflake database you want to connect to"
                            {...register("db_connection.database_collection", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {database === "mysql" && (
                  <div className="flex flex-col w-full space-y-4">
                    <p className="text-xs font-semibold tracking-wide text-primary-text">
                      Add Connections
                    </p>

                    <div className="flex flex-col space-y-4">
                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            User *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your MySQL username"
                            {...register("db_connection.user", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Password *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="password"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your MySQL password"
                            {...register("db_connection.password", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Host *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Provide the host address for your MySQL database"
                            {...register("db_connection.host", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Port *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your MySQL port"
                            {...register("db_connection.port", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {database === "athena" && (
                  <div className="flex flex-col w-full space-y-4">
                    <p className="text-xs font-semibold tracking-wide text-primary-text">
                      Add Connections
                    </p>

                    <div className="flex flex-col space-y-4">
                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Access Key *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your AWS access key"
                            {...register("db_connection.aws_access_key", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Secret Key *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="password"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your AWS secret key"
                            {...register("db_connection.aws_secret_key", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Region *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Specify the AWS region for your Amazon Athena"
                            {...register("db_connection.region", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            S3 Output Location *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Provide the S3 output location for your Amazon Athena"
                            {...register("db_connection.s3_output_location", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {database === "databricks" && (
                  <div className="flex flex-col w-full space-y-4">
                    <p className="text-xs font-semibold tracking-wide text-primary-text">
                      Add Connections
                    </p>

                    <div className="flex flex-col space-y-4 ">
                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Server Hostname *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your Server hostname for Databricks"
                            {...register("db_connection.server_hostname", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            HTTP Path *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="password"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Specify the HTTP path for Databricks"
                            {...register("db_connection.http_path", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Access Token *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Provide the access token for Databricks authentication"
                            {...register("db_connection.access_token", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {database === "redshift" && (
                  <div className="flex flex-col w-full space-y-4">
                    <p className="text-xs font-semibold tracking-wide text-primary-text">
                      Add Connections
                    </p>

                    <div className="flex flex-col space-y-4">
                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            User *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your Redshift username"
                            {...register("db_connection.user", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Password *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="password"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter your Redshift password"
                            {...register("db_connection.password", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Host *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Provide the host address for your Redshift database"
                            {...register("db_connection.host", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Port *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Enter the port number for your Redshift database"
                            {...register("db_connection.port", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>

                      {/* <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            DB Schema *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Specify the Redshift database schema you want to use"
                            {...register("db_connection.db_schema", {
                              required: true,
                            })}
                          />
                        </div>
                      </div> */}

                      <div className="grid items-center grid-cols-12">
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-primary-text text-nowrap">
                            Database *
                          </p>
                        </div>

                        <div className="col-span-10">
                          <input
                            type="text"
                            className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                            placeholder="Specify the name of the MariaDB database you want to connect to"
                            {...register("db_connection.database", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {database === "spreadsheet" && (
                  <div className="flex flex-col w-full space-y-4">
                    <p className="text-xs font-semibold tracking-wide text-primary-text">
                      Upload file
                    </p>

                    <div className="relative flex flex-col px-2 pb-2 border rounded-md border-border-color">
                      <div>
                        <div className="flex flex-col pt-6 space-y-2 rounded-md">
                          <div
                            className={`flex flex-col items-center justify-center py-2 space-y-4 ${
                              selectedFile
                                ? "opacity-50 select-none"
                                : "opacity-100"
                            }`}
                          >
                            <span className="flex items-center justify-center">
                              <svg
                                viewBox="0 0 38 38"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-8 h-8 fill-[#363941]"
                              >
                                <path d="M16.6654 28.3333V9.31658L10.5987 15.3833L7.33203 11.9999L18.9987 0.333252L30.6654 11.9999L27.3987 15.3833L21.332 9.31658V28.3333H16.6654ZM4.9987 37.6666C3.71536 37.6666 2.61675 37.2096 1.70286 36.2957C0.788976 35.3819 0.332031 34.2832 0.332031 32.9999V25.9999H4.9987V32.9999H32.9987V25.9999H37.6654V32.9999C37.6654 34.2832 37.2084 35.3819 36.2945 36.2957C35.3806 37.2096 34.282 37.6666 32.9987 37.6666H4.9987Z" />
                              </svg>
                            </span>

                            <div className="flex flex-col space-y-2 text-center">
                              <p className="text-sm font-semibold tracking-wider text-primary-text">
                                Upload Your File
                              </p>

                              {/* <p className="text-xs font-normal tracking-wider text-secondary-text">
                                Supported File Formats: CSV, Excel (XLSX, XLS)
                              </p> */}

                              <p className="text-xs font-normal tracking-wider text-secondary-text">
                                Supported File Formats: CSV, Excel (XLSX, XLS)
                                &nbsp;
                                <span className="font-semibold">(Max 2MB)</span>
                              </p>
                            </div>

                            <div>
                              <button
                                type="button"
                                className="h-8 px-3 text-xs font-semibold tracking-wider rounded-md bg-btn-primary text-btn-primary-text hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                                onClick={handleAddFileClick}
                                disabled={selectedFile}
                              >
                                Add File
                              </button>

                              <input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                              />

                              <input
                                type="hidden"
                                className="w-full p-3 text-xs border rounded-md outline-none text-input-text border-input-border bg-page placeholder:text-input-placeholder"
                                {...register("file", {
                                  required: true,
                                  validate: {
                                    supportedType: (fileObj) => {
                                      if (!fileObj) return true;
                                      return (
                                        supportedListType.includes(
                                          fileObj.type
                                        ) || "Unsupported file type."
                                      );
                                    },
                                    lessThan2MB: (fileObj) => {
                                      if (!fileObj) return true;
                                      return (
                                        fileObj.size <= MAX_FILE_SIZE ||
                                        "File size must be under 2MB"
                                      );
                                    },
                                  },
                                })}
                              />
                            </div>
                          </div>

                          {selectedFile && (
                            <div className="flex items-center justify-between px-4 py-2 mt-2 rounded-md bg-page-hover">
                              <div className="flex items-center space-x-4">
                                <img
                                  src="/assets/csv-logo.svg"
                                  alt="csv logo"
                                  className="object-cover w-8 aspect-auto"
                                />

                                <div className="flex flex-col space-y-1">
                                  <p className="text-xs font-medium tracking-wider capitalize text-primary-text">
                                    {selectedFile.name}
                                  </p>

                                  <p className="text-xs font-medium tracking-wider text-secondary-text">
                                    {formatFileSize(selectedFile.size)}
                                  </p>
                                </div>
                              </div>

                              <a
                                className="flex items-center justify-center px-2 space-x-2 text-xs font-normal tracking-wide cursor-pointer group text-secondary-text hover:text-primary-text"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setValue("file", "", {
                                    shouldValidate: false,
                                    shouldDirty: false,
                                  });
                                  fileInputRef.current.value = null;
                                }}
                              >
                                <span className="flex items-center justify-center">
                                  <svg
                                    viewBox="0 0 12 13"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3 h-3 fill-icon-color group-hover:fill-icon-color-hover"
                                  >
                                    <path d="M2.66797 12.5C2.3013 12.5 1.98741 12.3694 1.7263 12.1083C1.46519 11.8472 1.33464 11.5333 1.33464 11.1667V2.5H0.667969V1.16667H4.0013V0.5H8.0013V1.16667H11.3346V2.5H10.668V11.1667C10.668 11.5333 10.5374 11.8472 10.2763 12.1083C10.0152 12.3694 9.7013 12.5 9.33463 12.5H2.66797ZM9.33463 2.5H2.66797V11.1667H9.33463V2.5ZM4.0013 9.83333H5.33464V3.83333H4.0013V9.83333ZM6.66797 9.83333H8.0013V3.83333H6.66797V9.83333Z" />
                                  </svg>
                                </span>
                                <span>Remove</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedFile === null && (
                        <div className="flex p-4 mt-2 space-x-2 rounded-md bg-page-hover">
                          <div className="py-1">
                            <span className="flex items-center justify-center">
                              <svg
                                viewBox="0 0 12 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 fill-icon-color"
                              >
                                <path d="M5.4 9.5H6.6V5.9H5.4V9.5ZM6 4.7C6.17 4.7 6.3125 4.6425 6.4275 4.5275C6.5425 4.4125 6.6 4.27 6.6 4.1C6.6 3.93 6.5425 3.7875 6.4275 3.6725C6.3125 3.5575 6.17 3.5 6 3.5C5.83 3.5 5.6875 3.5575 5.5725 3.6725C5.4575 3.7875 5.4 3.93 5.4 4.1C5.4 4.27 5.4575 4.4125 5.5725 4.5275C5.6875 4.6425 5.83 4.7 6 4.7ZM6 12.5C5.17 12.5 4.39 12.3425 3.66 12.0275C2.93 11.7125 2.295 11.285 1.755 10.745C1.215 10.205 0.7875 9.57 0.4725 8.84C0.1575 8.11 0 7.33 0 6.5C0 5.67 0.1575 4.89 0.4725 4.16C0.7875 3.43 1.215 2.795 1.755 2.255C2.295 1.715 2.93 1.2875 3.66 0.9725C4.39 0.6575 5.17 0.5 6 0.5C6.83 0.5 7.61 0.6575 8.34 0.9725C9.07 1.2875 9.705 1.715 10.245 2.255C10.785 2.795 11.2125 3.43 11.5275 4.16C11.8425 4.89 12 5.67 12 6.5C12 7.33 11.8425 8.11 11.5275 8.84C11.2125 9.57 10.785 10.205 10.245 10.745C9.705 11.285 9.07 11.7125 8.34 12.0275C7.61 12.3425 6.83 12.5 6 12.5Z" />
                              </svg>
                            </span>
                          </div>

                          <p className="w-full text-xs font-normal leading-5 tracking-wider text-secondary-text">
                            Ensure that the uploaded file contains all examples
                            in the same format as the provided Demo File. You
                            can download and review the
                            <a
                              href="/assets/up.csv"
                              download
                              className="px-1 font-medium underline cursor-pointer text-secondary hover:text-primary-text"
                            >
                              Demo File
                            </a>{" "}
                            to understand the required format.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 left-0 z-50 flex items-center justify-between w-full py-2 bg-page">
        <span></span>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
            disabled={
              !isValid ||
              !isDirty ||
              isLoadingSpreadsheet ||
              (database === "spreadsheet" ? !selectedFile : null)
            }
          >
            {isLoadingSpreadsheet && (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-3 h-3 animate-spin text-primary-text fill-btn-primary"
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

                <span className="sr-only">Loading...</span>
              </div>
            )}

            <div>{dbType === "spreadsheet" ? "Save" : "Next"}</div>
          </button>
        </div>
      </div>
    </div>
  );
};

const UpdateTableColumnInformation = ({
  setValue,
  setTablesChanged = false,
  watch = () => {},
  getRes,
  dbConnectionData,
  isDisabled = false,
  selectedColumns,
  setSelectedColumns,
  isLastStep = false,
  update = false,
  handleUpdate = false,
  tablesChanged = false,
  back = () => {},
  theme
}) => {
  const [database, setDatabase] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [showSchema, setShowSchema] = useState(false);
  const [availableDatabases, setAvailableDatabases] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [initialSelectedColumns, setInitialSelectedColumns] = useState([]);

  console.log("dbConnectionData", dbConnectionData);
  const dropdownRef = useRef(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedSearchTableQuery = useDebounce(searchTableQuery, 500);

  const router = useRouter();

  useEffect(() => {
    if (isEqual(selectedColumns, initialSelectedColumns)) {
      setTablesChanged(false);
    } else {
      setTablesChanged(true);
    }
  }, [selectedColumns, initialSelectedColumns]);

  // const {
  //   data: getDatabases,
  //   isLoading: getDatabasesLoading,
  //   error: dbConnectionError,
  // } = useGetDatabasesForDatasourceQuery(
  //   {
  //     datasource_id: router.query.slug,
  //   },
  //   {
  //     skip: !router.query.slug,
  //     refetchOnMountOrArgChange: true,
  //   }
  // );

  const {
    data: getDatabases,
    isLoading: getDatabasesLoading,
    error: dbConnectionError,
  } = useGetDbConnectionListQuery(
    {
      payload: dbConnectionData,
    },
    {
      skip: !dbConnectionData,
    }
  );

  // const {
  //   data: tableRes,
  //   isLoading: tablesLoading,
  //   error: tableError,
  //   isFetching,
  // } = useGetTableSchemaQuery(
  //   {
  //     datasource_id: router.query.slug,
  //     database_name: database,
  //   },
  //   {
  //     skip: !router.query.slug || !database,
  //     refetchOnMountOrArgChange: true,
  //   }
  // );

  const {
    data: tableRes,
    isLoading: tablesLoading,
    error: tablesError,
    refetch: refetchTablesRes,
    isFetching,
  } = useGetTableSchemaForDbQuery(
    {
      datasource_id: router.query.slug,
      database_name: database,
      payload: {
        ...dbConnectionData,
      },
    },
    {
      skip: !router.query.slug || !dbConnectionData || !database,
    }
  );

  useEffect(() => {
    if (getDatabases) {
      setAvailableDatabases(getDatabases);
    }
  }, [getDatabases]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSchema(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDatabase = (newDatabase) => {
    setAvailableTables([]);
    setShowSchema(false);
    setDatabase(newDatabase);
    setValue("database", newDatabase);
  };

  useEffect(() => {
    if (tableRes) {
      function transformData(input) {
        return Object.keys(input).map((key) => ({
          name: key,
          columns: Object.entries(input[key]).map(([colName, status]) => ({
            name: colName,
            status: status,
          })),
        }));
      }

      const result = transformData(tableRes);
      setAvailableTables(result);

      const initialSelectedColumns = result.reduce((acc, table) => {
        acc[table.name] = table.columns;
        return acc;
      }, {});

      setSelectedColumns(initialSelectedColumns);
      setInitialSelectedColumns(initialSelectedColumns);
    }
  }, [tableRes]);

  useEffect(() => {
    if (getRes?.ds_config?.database) {
      setDatabase(getRes?.ds_config?.database);
    } else {
      setDatabase("");
    }
  }, [getRes]);

  const handleSelectChange = (tableName, columns) => {
    setSelectedColumns((prevSelectedColumns) => {
      const newSelectedColumns = {
        ...prevSelectedColumns,
        [tableName]: columns,
      };

      return newSelectedColumns;
    });
  };

  const filteredDatabases = availableDatabases?.filter((database) =>
    database.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const filteredTables = availableTables?.filter((table) =>
    table.name.toLowerCase().includes(debouncedSearchTableQuery.toLowerCase())
  );

  return (
    <div className="relative flex flex-col justify-between h-full p-3 bg-page">
      <div className={`flex flex-col space-y-2`}>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-1">
                <div className="flex items-center h-full">
                  <p className="text-xs font-medium text-primary-text">
                    Schema
                  </p>
                </div>
              </div>

              <div className="col-span-11">
                <div className="relative flex flex-col w-full space-y-1 max-w-72" ref={dropdownRef}>
                  <button
                    type="button"
                    className="flex items-center justify-between h-8 px-3 text-xs font-medium border rounded-md text-primary-text border-border-color"
                    onClick={() => setShowSchema(!showSchema)}
                    disabled={getDatabasesLoading || isDisabled}
                  >
                    <div className="flex items-center space-x-2 line-clamp-1">
                      <span className="flex items-center justify-center">
                        <svg
                          viewBox="0 0 12 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 fill-icon-color"
                        >
                          <path d="M0.666016 15.3334V11.3334H2.33268V10.0001H0.666016V6.00008H2.33268V4.66675H0.666016V0.666748H5.33268V4.66675H3.66602V6.00008H5.33268V7.33342H7.33268V6.00008H11.9993V10.0001H7.33268V8.66675H5.33268V10.0001H3.66602V11.3334H5.33268V15.3334H0.666016ZM1.99935 14.0001H3.99935V12.6667H1.99935V14.0001ZM1.99935 8.66675H3.99935V7.33342H1.99935V8.66675ZM8.66602 8.66675H10.666V7.33342H8.66602V8.66675ZM1.99935 3.33341H3.99935V2.00008H1.99935V3.33341Z" />
                        </svg>
                      </span>

                      {getDatabasesLoading ? (
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="w-4 h-4 animate-spin text-foreground fill-secondary"
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

                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : (
                        <span>{database || "Select Schema"}</span>
                      )}
                    </div>

                    <span className="flex items-center justify-center">
                      {showSchema || (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-icon-color hover:text-icon-color-hover"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      )}

                      {showSchema && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-icon-color-hover"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 15.75 7.5-7.5 7.5 7.5"
                          />
                        </svg>
                      )}
                    </span>
                  </button>

                  {!getDatabasesLoading && showSchema && (
                    <div className="absolute top-full left-0 w-full z-[100]">
                      <div className="relative flex flex-col overflow-hidden border rounded-md border-dropdown-border bg-dropdown-bg">
                        <div className="sticky top-0 left-0 w-full">
                          <div className="relative w-full border-b border-border-color">
                            <input
                              type="text"
                              className="w-full pl-4 pr-10 text-sm outline-none h-7 text-input-text bg-dropdown-bg placeholder:text-input-placeholder"
                              placeholder="Search schema"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            {searchQuery !== "" && (
                              <span
                                className="absolute flex items-center justify-center w-5 h-5 -translate-y-1/2 rounded-full cursor-pointer bg-border top-1/2 right-4"
                                onClick={() => setSearchQuery("")}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4 text-primary-text"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                  />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-full">
                          {filteredDatabases.length > 0 && (
                            <div className="grid w-full h-full grid-cols-1 gap-2 overflow-y-auto bg-dropdown-bg recent__bar max-h-48">
                              {filteredDatabases
                                ?.slice()
                                .sort((a, b) => {
                                  if (a === database) return -1;
                                  if (b === database) return 1;
                                  return 0;
                                })
                                .map((item, index) => {
                                  return (
                                    <a
                                      className={`flex items-center w-full px-2 h-7 space-x-2 text-xs 2xl:text-sm font-roboto cursor-pointer text-accent ${theme === 'dark' ? 'text-dropdown-text hover:text-primary-text hover:bg-btn-primary' : 'hover:bg-active-bg-hover'} ${
                                        database === item ? "" : ""
                                      }`}
                                      onClick={() => handleDatabase(item)}
                                      key={index}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        className={`w-5 h-5 ${
                                          database === item
                                            ? "fill-icon-color-hover"
                                            : "fill-icon-color"
                                        }`}
                                      >
                                        <path d="M20 17V7c0-2.168-3.663-4-8-4S4 4.832 4 7v10c0 2.168 3.663 4 8 4s8-1.832 8-4zM12 5c3.691 0 5.931 1.507 6 1.994C17.931 7.493 15.691 9 12 9S6.069 7.493 6 7.006C6.069 6.507 8.309 5 12 5zM6 9.607C7.479 10.454 9.637 11 12 11s4.521-.546 6-1.393v2.387c-.069.499-2.309 2.006-6 2.006s-5.931-1.507-6-2V9.607zM6 17v-2.393C7.479 15.454 9.637 16 12 16s4.521-.546 6-1.393v2.387c-.069.499-2.309 2.006-6 2.006s-5.931-1.507-6-2z"></path>
                                      </svg>

                                      <div className="w-full line-clamp-1">
                                        {item}
                                      </div>
                                    </a>
                                  );
                                })}
                            </div>
                          )}

                          {filteredDatabases.length === 0 && (
                            <div className="w-full h-48 max-w-sm col-span-12 bg-dropdown-bg">
                              <div className="flex flex-col items-center justify-center w-full h-full space-y-2">
                                <span className="flex items-center justify-center">
                                  <svg
                                    viewBox="0 0 21 21"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 fill-icon-color"
                                  >
                                    <path d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 7.5 11.0208 7.40417 11.2125 7.2125C11.4042 7.02083 11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 11.2125 5.7875C11.0208 5.59583 10.7833 5.5 10.5 5.5C10.2167 5.5 9.97917 5.59583 9.7875 5.7875C9.59583 5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 9.59583 7.02083 9.7875 7.2125C9.97917 7.40417 10.2167 7.5 10.5 7.5ZM10.5 20.5C9.11667 20.5 7.81667 20.2375 6.6 19.7125C5.38333 19.1875 4.325 18.475 3.425 17.575C2.525 16.675 1.8125 15.6167 1.2875 14.4C0.7625 13.1833 0.5 11.8833 0.5 10.5C0.5 9.11667 0.7625 7.81667 1.2875 6.6C1.8125 5.38333 2.525 4.325 3.425 3.425C4.325 2.525 5.38333 1.8125 6.6 1.2875C7.81667 0.7625 9.11667 0.5 10.5 0.5C11.8833 0.5 13.1833 0.7625 14.4 1.2875C15.6167 1.8125 16.675 2.525 17.575 3.425C18.475 4.325 19.1875 5.38333 19.7125 6.6C20.2375 7.81667 20.5 9.11667 20.5 10.5C20.5 11.8833 20.2375 13.1833 19.7125 14.4C19.1875 15.6167 18.475 16.675 17.575 17.575C16.675 18.475 15.6167 19.1875 14.4 19.7125C13.1833 20.2375 11.8833 20.5 10.5 20.5ZM10.5 18.5C12.7333 18.5 14.625 17.725 16.175 16.175C17.725 14.625 18.5 12.7333 18.5 10.5C18.5 8.26667 17.725 6.375 16.175 4.825C14.625 3.275 12.7333 2.5 10.5 2.5C8.26667 2.5 6.375 3.275 4.825 4.825C3.275 6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 3.275 14.625 4.825 16.175C6.375 17.725 8.26667 18.5 10.5 18.5Z" />
                                  </svg>
                                </span>

                                <span className="text-xs font-medium tracking-wider 2xl:text-sm text-primary-text">
                                  No Database Available
                                </span>

                                <span className="text-xs font-normal tracking-wider text-secondary-text">
                                  Credentials are incorrect, Please check again.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {filteredTables.length === 0 && (
            <div className="col-span-12">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal tracking-wide text-label-text">
                    Available tables from the selected schema
                  </span>

                  <div className="flex items-center space-x-2">
                    <div className="relative w-full pr-2">
                      <input
                        type="text"
                        className="w-full py-2 pl-8 pr-10 text-xs bg-transparent border rounded-md outline-none 2xl:text-sm text-primary-text placeholder:text-input-placeholder border-input-border"
                        placeholder="Search Table..."
                        disabled={true}
                      />

                      <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-secondary-text"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {tablesLoading && (
                  <div className="col-span-12 border rounded-md border-border-color">
                    <div className="flex items-center justify-center w-full h-60 text-primary-text">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5 animate-spin text-foreground fill-secondary"
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

                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  </div>
                )}

                {tablesLoading === false && isFetching && (
                  <div className="col-span-12 border rounded-md border-border-color">
                    <div className="flex items-center justify-center w-full h-60 text-primary-text">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5 animate-spin text-foreground fill-secondary"
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

                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  </div>
                )}

                {tablesLoading || isFetching || (
                  <div className="flex flex-col items-center justify-center w-full h-full space-y-2 border min-h-60 border-border-color">
                    <span className="flex items-center justify-center">
                      <svg
                        viewBox="0 0 21 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 fill-icon-color"
                      >
                        <path d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 7.5 11.0208 7.40417 11.2125 7.2125C11.4042 7.02083 11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 11.2125 5.7875C11.0208 5.59583 10.7833 5.5 10.5 5.5C10.2167 5.5 9.97917 5.59583 9.7875 5.7875C9.59583 5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 9.59583 7.02083 9.7875 7.2125C9.97917 7.40417 10.2167 7.5 10.5 7.5ZM10.5 20.5C9.11667 20.5 7.81667 20.2375 6.6 19.7125C5.38333 19.1875 4.325 18.475 3.425 17.575C2.525 16.675 1.8125 15.6167 1.2875 14.4C0.7625 13.1833 0.5 11.8833 0.5 10.5C0.5 9.11667 0.7625 7.81667 1.2875 6.6C1.8125 5.38333 2.525 4.325 3.425 3.425C4.325 2.525 5.38333 1.8125 6.6 1.2875C7.81667 0.7625 9.11667 0.5 10.5 0.5C11.8833 0.5 13.1833 0.7625 14.4 1.2875C15.6167 1.8125 16.675 2.525 17.575 3.425C18.475 4.325 19.1875 5.38333 19.7125 6.6C20.2375 7.81667 20.5 9.11667 20.5 10.5C20.5 11.8833 20.2375 13.1833 19.7125 14.4C19.1875 15.6167 18.475 16.675 17.575 17.575C16.675 18.475 15.6167 19.1875 14.4 19.7125C13.1833 20.2375 11.8833 20.5 10.5 20.5ZM10.5 18.5C12.7333 18.5 14.625 17.725 16.175 16.175C17.725 14.625 18.5 12.7333 18.5 10.5C18.5 8.26667 17.725 6.375 16.175 4.825C14.625 3.275 12.7333 2.5 10.5 2.5C8.26667 2.5 6.375 3.275 4.825 4.825C3.275 6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 3.275 14.625 4.825 16.175C6.375 17.725 8.26667 18.5 10.5 18.5Z" />
                      </svg>
                    </span>

                    {dbConnectionError?.data ? (
                      <span className="text-xs font-medium tracking-wider text-primary-text">
                        Error
                      </span>
                    ) : (
                      <span className="text-xs font-medium tracking-wider text-primary-text">
                        No Schema has selected
                      </span>
                    )}

                    {dbConnectionError?.data ? (
                      <span className="text-xs font-normal tracking-wider text-secondary-text">
                        {dbConnectionError?.data?.message}
                      </span>
                    ) : (
                      <span className="text-xs font-normal tracking-wider text-secondary-text">
                          Select a schema on above, then choose the table and column you need
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {filteredTables.length > 0 && (
            <div className="col-span-12">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal tracking-wide text-label-text">
                    Available tables from the selected schema
                  </span>

                  <div className="flex items-center space-x-2">
                    <div className="relative w-full pr-2">
                      <input
                        type="text"
                        className="w-full h-8 py-2 pl-10 pr-8 text-xs bg-transparent border rounded-md outline-none 2xl:text-sm text-primary-text placeholder:text-input-placeholder border-input-border"
                        placeholder="Search Table..."
                        value={searchTableQuery}
                        onChange={(e) => setSearchTableQuery(e.target.value)}
                        disabled={tablesLoading}
                      />

                      <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-secondary-text"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                          />
                        </svg>
                      </span>

                      {searchTableQuery !== "" && (
                        <span
                          className="absolute flex items-center justify-center w-5 h-5 -translate-y-1/2 rounded-full cursor-pointer bg-border top-1/2 right-4"
                          onClick={() => setSearchTableQuery("")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-primary-text"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18 18 6M6 6l12 12"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {tablesLoading && (
                  <div className="col-span-12 border rounded-md border-border-color">
                    <div className="flex items-center justify-center w-full h-60 text-primary-text">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5 animate-spin text-foreground fill-secondary"
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

                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  </div>
                )}

                {tablesLoading || (
                  <div className="flex flex-col space-y-2">
                    {filteredTables?.map((table, index) => {
                      return (
                        <SelectTableDropdown
                          data={table}
                          key={index}
                          selectedColumns={filteredTables[table.name] || []}
                          onSelectChange={handleSelectChange}
                          isDisabled={isDisabled}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLastStep && update && (
        <div className="sticky bottom-0 left-0 z-50 flex items-center justify-between w-full py-2 bg-page">
          <button
            type="button"
            className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
            onClick={() => back && back()}
          >
            <span className="flex items-center justify-center">
              <svg
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 fill-btn-primary-outline-icon "
              >
                <path d="M3.21602 6.6665L6.94935 10.3998L5.99935 11.3332L0.666016 5.99984L5.99935 0.666504L6.94935 1.59984L3.21602 5.33317H11.3327V6.6665H3.21602Z" />
              </svg>
            </span>
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
              onClick={() => setShow(false)}
            >
              Cancel
            </button>

            <button
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
              onClick={handleUpdate}
              // disabled={!tablesChanged}
              disabled={tablesError}
            >
              <div>Update</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SelectTableDropdown = ({ data, onSelectChange, isDisabled = false }) => {
  const [toggleDropdown, setToggleDropdown] = useState(false);
  const [columns, setColumns] = useState([]);
  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    setColumns(data.columns);
  }, [data.columns]);

  useEffect(() => {
    const allSelected = columns.every((col) => col.status);
    setAllChecked(allSelected);
  }, [columns]);

  const handleToggle = (columnName, isChecked) => {
    const updatedColumns = columns.map((col) =>
      col.name === columnName ? { ...col, status: isChecked } : col
    );
    setColumns(updatedColumns);

    onSelectChange(data.name, updatedColumns);
  };

  const handleSelectAllToggle = (isChecked) => {
    const updatedColumns = columns.map((col) => ({
      ...col,
      status: isChecked,
    }));
    setColumns(updatedColumns);

    onSelectChange(data.name, updatedColumns);
    setAllChecked(isChecked);
  };

  return (
    <div className="flex flex-col rounded-md cursor-pointer">
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 text-xs tracking-wide rounded-md outline-none bg-secondary-bg h-9 2xl:text-sm text-primary-text"
        onClick={() => setToggleDropdown(!toggleDropdown)}
      >
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center">
            <TableIcon size={4} />
          </span>

          <p
            className={`text-sm ${
              toggleDropdown
                ? "text-primary-text font-medium"
                : "text-secondary-text font-normal"
            }`}
          >
            {data?.name}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <p className="flex items-center space-x-1 font-normal">
            <span className="text-secondary-text">Selected</span>
            <span>
              {columns.filter((col) => col.status).length}/{columns.length}
            </span>
            <span className="text-secondary-text">Columns</span>
          </p>

          <span className="flex items-center justify-center">
            {toggleDropdown ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-icon-color hover:text-icon-color-hover"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 fill-icon-color"
              >
                <path d="M0 12V6.66667H1.33333V9.73333L9.73333 1.33333H6.66667V0H12V5.33333H10.6667V2.26667L2.26667 10.6667H5.33333V12H0Z" />
              </svg>
            )}
          </span>
        </div>
      </button>

      {toggleDropdown && (
        <div className="flex flex-col w-full space-y-2 border-b border-x border-border-color bg-page">
          <div className="relative flex flex-col px-3 py-3 space-y-0.5">
            <div className="absolute top-2 right-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allChecked}
                  className="sr-only peer"
                  onChange={(e) => handleSelectAllToggle(e.target.checked)}
                  disabled={isDisabled}
                />
                <div
                  className={`relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7] ${
                    isDisabled
                      ? "peer-checked:bg-blue-600/50 opacity-50"
                      : ""
                  }`}
                ></div>
                <span
                  className={`text-xs font-medium ms-3 ${
                    isDisabled
                      ? "text-blue-600/50"
                      : "text-btn-primary-outline-text"
                  }`}
                >
                  {allChecked ? "Remove All" : "Select All"}
                </span>
              </label>
            </div>

            {columns.map((column, index) => (
              <SwitchToggle
                data={column}
                key={index}
                checked={column.status}
                onToggle={(isChecked) => handleToggle(column.name, isChecked)}
                isDisabled={isDisabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SwitchToggle = ({ data, checked, onToggle, isDisabled }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        className="sr-only peer"
        onChange={(e) => onToggle(e.target.checked)}
        disabled={isDisabled}
      />

      <div
        className={`relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7] ${
          isDisabled
            ? "peer-checked:bg-blue-600/50 opacity-50"
            : ""
        }`}
      ></div>

      <span
        className={`text-sm font-medium ms-3 ${
          checked ? "text-primary-text" : "text-secondary-text"
        }`}
      >
        {data?.name}
      </span>
    </label>
  );
};
