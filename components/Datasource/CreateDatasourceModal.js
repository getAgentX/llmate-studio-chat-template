import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import SelectConnection from "./SelectConnection";
import { useMultistepForm } from "@/hooks/useMultistepForm";
import ConfirmModal from "../Modal/ConfirmModal";
import TableColumnInformation from "./TableColumnInformation";
import { useRouter } from "next/router";
import {
  useCreateSqlDatasourceMutation,
  useCreateSqlDatasourceSpreadsheetMutation,
  useCreateThirdPartyDatasourceMutation,
  useGetAllPropertiesQuery,
  useGetConnectorsStatusQuery,
  useGetSupportedConnectorsQuery,
} from "@/store/datasource";
import SuccessModal from "../Modal/SuccessModal";
import { useCreateSemiStructuredDatasourceMutation } from "@/store/semi_structured_datasource";
import useDebounce from "@/hooks/useDebounce";
import { useSession } from "next-auth/react";
import crypto from "crypto";
import base64url from "base64url";
import { useTheme } from "@/hooks/useTheme";
import { useIntercom } from "react-use-intercom";
import ErrorModal from "../Modal/ErrorModal";

const CreateDatasourceModal = ({ show, setShow, isThirdParty = false }) => {
  const modalRef = useRef(null);
  const [currentDatasource, setCurrentDatasource] = useState(null);

  const { theme } = useTheme();

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

  // for connect data button on home page, we are showing third ds by default
  useEffect(() => {
    if (isThirdParty) {
      setCurrentDatasource("third-ds");
    }
  }, []);

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] max-h-full md:inset-0 bg_blur font-roboto ${
        show ? "" : "hidden"
      }`}
    >
      <div
        className="fixed top-0 bottom-0 right-0 w-full h-full max-w-[700px] overflow-x-hidden overflow-y-auto border-l border-border-color bg-page recent__bar"
        ref={modalRef}
      >
        <div className="relative flex flex-col h-full">
          <div className="sticky top-0 left-0 z-50 flex items-center justify-between w-full h-12 px-4 border-b min-h-12 bg-page border-border-color">
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

              <span>Datasource creation</span>

              {currentDatasource === "structured" && (
                <div
                  className={`py-1 px-3 text-xs flex items-center justify-center space-x-2 rounded-full  w-fit ${
                    theme === "dark"
                      ? "bg-[#212B27] text-[#40AD7D]"
                      : "bg-[#E4FFF3] text-[#40AD7D]"
                  }`}
                >
                  <span className="w-1 h-1 rounded-full bg-[#40AD7D]"></span>
                  <span className="whitespace-nowrap text-nowrap">
                    Structured
                  </span>
                </div>
              )}

              {currentDatasource === "semi-structured" && (
                <div
                  className={`py-1 px-3 text-xs flex items-center justify-center space-x-2 rounded-full  w-fit ${
                    theme === "dark"
                      ? "bg-[#2A212A] text-[#A840AD]"
                      : "bg-[#FBE4FF] text-[#A840AD]"
                  }`}
                >
                  <span className="w-1 h-1 rounded-full bg-[#A840AD]"></span>
                  <span className="whitespace-nowrap text-nowrap">
                    Semi-Structured
                  </span>
                </div>
              )}

              {currentDatasource === "third-ds" && (
                <div
                  className={`py-1 px-3 text-xs flex items-center justify-center space-x-2 rounded-full  w-fit ${
                    theme === "dark"
                      ? "bg-[#2A2421] text-[#AD7A40]"
                      : "bg-[#FFEFE4] text-[#AD7A40]"
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${
                      theme === "dark" ? "bg-[#AD7A40] " : "bg-[#AD7A40] "
                    } `}
                  ></span>
                  <span className="whitespace-nowrap text-nowrap">
                    Third Party
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col h-full px-4 pt-4 space-y-3">
            {currentDatasource === null && (
              <div className="flex flex-col w-full space-y-6">
                <p className="text-xs font-medium tracking-wide text-primary-text">
                  Choose datasource type
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="flex flex-col p-4 space-y-2 border rounded-md cursor-pointer border-border-color hover:border-border-hover-color"
                    onClick={() => setCurrentDatasource("third-ds")}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center -space-x-4">
                        <span className="flex z-[4] items-center justify-center shadow-md w-10 h-10 border border-border-color rounded-full bg-page-hover">
                          <img
                            src="/assets/google_ads.svg"
                            alt="google_ads"
                            className="object-cover w-5 aspect-square"
                          />
                        </span>
                        <span className="flex z-[3] items-center justify-center shadow-md w-10 h-10 border border-border-color rounded-full bg-page-hover">
                          <img
                            src="/assets/facebook_ads.svg"
                            alt="facebook_ads"
                            className="object-cover w-5 aspect-square"
                          />
                        </span>
                        <span className="flex z-[2] items-center justify-center shadow-md w-10 h-10 border border-border-color rounded-full bg-page-hover">
                          <img
                            src="/assets/google_analytics.svg"
                            alt="google_analytics"
                            className="object-cover w-5 aspect-square"
                          />
                        </span>
                        <span className="flex z-[1] items-center justify-center shadow-md w-10 h-10 border border-border-color rounded-full bg-page-hover">
                          <img
                            src="/assets/linkedin.svg"
                            alt="linkedin"
                            className="object-cover w-5 aspect-square"
                          />
                        </span>
                      </div>

                      <span className="text-xs font-medium leading-6 text-secondary-text">
                        +40
                      </span>
                    </div>

                    <p className="text-sm font-medium 2xl:text-base text-primary-text">
                      Third-party Datasource
                    </p>

                    <p className="text-xs font-medium leading-6 text-secondary-text">
                      It connects to external sources, pulling real-time data
                      for analysis. It streamlines the process by eliminating
                      manual imports, providing instant data for quick
                      decisions.
                    </p>
                  </div>

                  <div
                    className="flex flex-col p-4 space-y-2 border rounded-md cursor-pointer border-border-color hover:border-border-hover-color"
                    onClick={() => setCurrentDatasource("structured")}
                  >
                    <div className="flex items-center -space-x-4">
                      <span className="flex z-[4] items-center justify-center shadow-md w-10 h-10 border border-border-color rounded-full bg-page-hover">
                        <img
                          src="/assets/spreadsheet.svg"
                          alt="csv"
                          className="object-cover w-5 aspect-square"
                        />
                      </span>
                      <span className="flex z-[3] items-center justify-center shadow-md w-10 h-10 border border-border-color rounded-full bg-page-hover">
                        <img
                          src="/assets/google-bigquery.svg"
                          alt="google-bigquery"
                          className="object-cover w-5 aspect-square"
                        />
                      </span>
                      <span className="flex z-[2] items-center justify-center shadow-md w-10 h-10 border border-border-color rounded-full bg-page-hover">
                        <img
                          src="/assets/snowflake.svg"
                          alt="snowflake"
                          className="object-cover w-5 aspect-square"
                        />
                      </span>
                      <span className="flex z-[1] items-center justify-center shadow-md w-10 h-10 border border-border-color rounded-full bg-page-hover">
                        <img
                          src="/assets/postgresql.svg"
                          alt="postgresql"
                          className="object-cover w-5 aspect-square"
                        />
                      </span>
                    </div>

                    <p className="text-sm font-medium 2xl:text-base text-primary-text">
                      Structured Datasource
                    </p>

                    <p className="text-xs font-medium leading-6 text-secondary-text">
                      It organizes data into a defined schema with structured
                      types like tables, enabling consistent storage, retrieval,
                      and easy querying.
                    </p>
                  </div>

                  <div
                    className="flex flex-col p-4 space-y-2 border rounded-md cursor-pointer border-border-color hover:border-border-hover-color"
                    onClick={() => setCurrentDatasource("semi-structured")}
                  >
                    <span className="flex z-[4] items-center justify-center shadow-md w-10 h-10 border border-border-color rounded-full bg-page-hover">
                      <img
                        src="/assets/carrier.svg"
                        alt="carrier"
                        className="object-cover w-5 aspect-square"
                      />
                    </span>

                    <p className="text-sm font-medium 2xl:text-base text-primary-text">
                      Semi-structured Datasource
                    </p>

                    <p className="text-xs font-medium leading-6 text-secondary-text">
                      It organizes data without a fixed format using tags,
                      enabling flexible handling and filtering of diverse
                      information.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentDatasource === "structured" && (
              <Structured
                setShow={setShow}
                setCurrentDatasource={setCurrentDatasource}
              />
            )}

            {currentDatasource === "semi-structured" && (
              <SemiStructured
                setShow={setShow}
                setCurrentDatasource={setCurrentDatasource}
              />
            )}

            {currentDatasource === "third-ds" && (
              <ThirdParty
                show={show}
                setShow={setShow}
                theme={theme}
                setCurrentDatasource={setCurrentDatasource}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDatasourceModal;

const Structured = ({ setShow, setCurrentDatasource }) => {
  const [jsonData, setJsonData] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [availableDatabases, setAvailableDatabases] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [datasourceId, setDatasourceId] = useState(null);

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
        db_type: "spreadsheet",
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

  const [
    createSqlDatasource,
    { data: sqlRes, isLoading: sqlLoading, error: sqlError },
  ] = useCreateSqlDatasourceMutation();

  const [
    createSqlDatasourceSpreadsheet,
    { data: sqlResSpreadsheet, isLoading: spreadsheetLoading },
  ] = useCreateSqlDatasourceSpreadsheetMutation();

  const dbType = watch("db_connection.db_type");
  const dbConnectionData = watch("db_connection");

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
          handleCancel={() => setShowConfirmModal(true)}
          jsonData={jsonData}
          setJsonData={setJsonData}
          spreadsheetLoading={spreadsheetLoading}
          errors={errors}
          setCurrentDatasource={setCurrentDatasource}
        />
      ),
    },
    ...(dbType !== "spreadsheet"
      ? [
          {
            name: `Select Database, Table & Column`,
            component: (
              <TableColumnInformation
                register={register}
                setValue={setValue}
                getValues={getValues}
                availableDatabases={availableDatabases}
                setAvailableDatabases={setAvailableDatabases}
                availableTables={availableTables}
                setAvailableTables={setAvailableTables}
                reset={reset}
                isValid={isValid}
                handleCancel={() => setShowConfirmModal(true)}
                watch={watch}
                dbConnectionData={dbConnectionData}
                sqlLoading={sqlLoading}
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

      createSqlDatasourceSpreadsheet({ payload: formData }).then((response) => {
        if (response.data) {
          setDatasourceId(response.data.id);
          setShowSuccessModal(true);
        }
      });
    } else {
      delete data.file;

      const newData = {
        ...data,
        name: data?.db_connection?.db_type || "",
      };

      createSqlDatasource({ payload: newData }).then((response) => {
        if (response.data) {
          setDatasourceId(response.data.id);
          setShowSuccessModal(true);
        }
      });
    }
  }

  const handlePrimary = () => {
    router.push(`/datasource/details/${datasourceId}/query`);
  };

  const handleSecondary = () => {
    router.push(`/datasource/details/${datasourceId}`);
  };

  return (
    <div className="flex flex-col w-full h-full space-y-4">
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
          primaryBtn="No,Continue"
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
          description={"Datasource Created Sucessfully"}
          primaryBtn="Query"
          primaryChange={handlePrimary}
          secondaryBtn="View"
          secondaryChange={handleSecondary}
          setHideDrawer={() => setShow(false)}
        />
      )}
    </div>
  );
};

const SemiStructured = ({ setShow, setCurrentDatasource }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [datasourceId, setDatasourceId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const router = useRouter();

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const [
    createSemiStructuredDatasource,
    {
      data: semiStructuredRes,
      isLoading: semiStructuredLoading,
      error: semiStructuredError,
    },
  ] = useCreateSemiStructuredDatasourceMutation();

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
      file: "",
    },
  });

  const formatFileSize = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleAddFileClick = () => {
    fileInputRef.current.click();
  };

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];

  //   if (
  //     file &&
  //     (file.type === "text/csv" ||
  //       file.type ===
  //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
  //       file.type === "application/vnd.ms-excel")
  //   ) {
  //     setSelectedFile(file);

  //     setValue("file", file, {
  //       shouldValidate: true,
  //       shouldDirty: true,
  //     });
  //   } else {
  //     alert("Please select a CSV file.");
  //   }
  // };

  const supportedListType = [
    "text/csv",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // "application/vnd.ms-excel",
    // "application/x-excel",
    // "application/x-msexcel",
    // "application/xls",
    // "application/x-xls",
    // "application/vnd.ms-excel.addin.macroEnabled.12",
    // "application/vnd.ms-excel.sheet.macroEnabled.12",
    // "application/vnd.ms-excel.template.macroEnabled.12",
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
  //     alert("Please select a CSV file.");
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

  const handleCreation = () => {
    const data = getValues();

    const newData = {
      ...data,
      name: data?.file?.name || "",
    };

    const formData = new FormData();
    formData.append("file", newData.file);
    formData.append("name", newData.file.name);

    Object.keys(newData).forEach((key) => {
      if (key !== "file" && key !== "name") {
        formData.append(key, newData[key]);
      }
    });

    createSemiStructuredDatasource({ payload: formData }).then((response) => {
      if (response.data) {
        setDatasourceId(response.data.id);
        setShowSuccessModal(true);
      }
    });
  };

  const handlePrimary = () => {
    router.push(`/datasource/details/${datasourceId}/configuration`);
  };

  const handleSecondary = () => {
    router.push(`/datasource/details/${datasourceId}`);
  };

  return (
    <div className="relative flex flex-col justify-between h-full">
      <div className="flex flex-col w-full space-y-4">
        <p className="text-xs font-semibold tracking-wide text-primary-text">
          Upload file
        </p>

        <div className="relative flex flex-col px-2 pb-2 border rounded-md border-border-color">
          <div>
            <div className="flex flex-col pt-6 space-y-2 rounded-md">
              <div
                className={`flex flex-col items-center justify-center py-2 space-y-4 ${
                  selectedFile ? "opacity-50 select-none" : "opacity-100"
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

                  <p className="text-xs font-normal tracking-wider text-secondary-text">
                    Supported File Formats: CSV &nbsp;
                    <span className="font-semibold">(Max 2MB)</span>
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    className="h-8 px-3 text-xs font-semibold tracking-wider rounded-md bg-btn-primary text-btn-primary-text hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                    onClick={handleAddFileClick}
                  >
                    Add File
                  </button>

                  {/* <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  /> */}

                  <input
                    type="file"
                    accept=".csv"
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
                            supportedListType.includes(fileObj.type) ||
                            "Unsupported file type."
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
                        {selectedFile.name} ajdjd
                      </p>

                      <p className="text-xs font-medium tracking-wider text-secondary-text">
                        {formatFileSize(selectedFile.size)}{" "}
                        {errors.file && (
                          <span className="text-red-500">
                            {errors.file.message}
                          </span>
                        )}
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
                Ensure that the uploaded file contains all examples in the same
                format as the provided Demo File. You can download and review
                the
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

      <div className="sticky bottom-0 left-0 z-50 flex items-center justify-between w-full py-2 bg-page">
        {setCurrentDatasource && (
          <button
            type="button"
            className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
            onClick={() => setCurrentDatasource(null)}
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
        )}

        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
            onClick={() => setShowConfirmModal(true)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
            disabled={!isValid || semiStructuredLoading || !selectedFile}
            onClick={() => handleCreation()}
          >
            {semiStructuredLoading && (
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

            <div>Create</div>
          </button>
        </div>
      </div>

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
          description={"Datasource Created Sucessfully"}
          primaryBtn="Setup"
          primaryChange={handlePrimary}
          secondaryBtn="View"
          secondaryChange={handleSecondary}
        />
      )}
    </div>
  );
};

const ThirdParty = ({ show, setShow, theme, setCurrentDatasource = false }) => {
  const [currentConnector, setCurrentConnector] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [datasourceId, setDatasourceId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showError, setShowError] = useState(false);

  const router = useRouter();

  const [
    createThirdPartyDatasource,
    { isLoading: createLoading, error: createError },
  ] = useCreateThirdPartyDatasourceMutation();

  const ComponentData = [
    {
      name: "Select Connector",
      component: (
        <Connector
          currentConnector={currentConnector}
          setConnector={setCurrentConnector}
          show={show}
          theme={theme}
        />
      ),
    },
    {
      name: "Connection Details",
      component: (
        <ConnectionDetails
          currentConnector={currentConnector}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          setConnector={setCurrentConnector}
        />
      ),
    },
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
      step.component = React.cloneElement(step.component, { back });
    }
  });

  const handleCreate = () => {
    if (!isLastStep) return next();

    const payload = {
      name: currentConnector,
      about: "",
      selected_properties: selectedColumns,
    };

    createThirdPartyDatasource({
      connector_type: currentConnector,
      payload: payload,
    }).then((response) => {
      if (response) {
        if (response.data) {
          setDatasourceId(response.data.id);
          setShowSuccessModal(true);
        } else {
          setShowSuccessModal(false);
        }
      }
    });
  };

  const handlePrimary = () => {
    router.push(`/datasource/details/${datasourceId}/query`);
  };

  const handleSecondary = () => {
    router.push(`/datasource/details/${datasourceId}`);
  };

  return (
    <div className="flex-1">
      <div className="relative flex flex-col justify-between w-full h-full space-y-4">
        {step.component}

        <div className="sticky bottom-0 left-0 z-50 flex items-center justify-between w-full py-2 bg-page">
          {isLastStep ? (
            <button
              type="button"
              className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
              // onClick={() => previous()}
              // disabled={sqlLoading}
              onClick={() => {
                setCurrentConnector("");
                back();
              }}
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
          ) : (
            <button
              type="button"
              className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
              onClick={() => setCurrentDatasource(null)}
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
          )}

          {/* {setCurrentDatasource && (
            <button
              type="button"
              className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
              onClick={() => setCurrentDatasource(null)}
            >
              Back
            </button>
          )} */}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
              // onClick={handleCancel}
              // disabled={spreadsheetLoading}
              onClick={() => setShowConfirmModal(true)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
              disabled={!currentConnector || createLoading}
              onClick={handleCreate}
            >
              {createLoading && (
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

              {isLastStep ? <div>Create</div> : <div>Next</div>}
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          show={showSuccessModal}
          setShow={setShowSuccessModal}
          heading="Success Confirmation"
          title={""}
          description={"Datasource Created Sucessfully"}
          primaryBtn="Query"
          primaryChange={handlePrimary}
          secondaryBtn="View details"
          secondaryChange={handleSecondary}
        />
      )}

      {showError && (
        <ErrorModal
          show={showError}
          setShow={setShowError}
          heading="Error Found"
          title=""
          description={createError?.data?.message}
          // primaryBtn="Model Management"
          // primaryChange={handleErrorPrimary}
          secondaryBtn="Close"
          secondaryChange={() => setShowError(false)}
        />
      )}

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
    </div>
  );
};

const Connector = ({
  currentConnector,
  setConnector,
  show: showPopup,
  back,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [combineConnectors, setCombineConnectors] = useState([]);
  const [filteredConnectors, setFilteredConnectors] = useState([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { boot, shutdown, hide, show, isOpen } = useIntercom();

  const {
    data: getConnectorsStatus,
    isLoading: getConnectorsStatusLoading,
    error: getConnectorsStatusError,
    refetch: refetchConnectorsStatus,
  } = useGetConnectorsStatusQuery({});

  // const {
  //   data: getSupportedConnectors,
  //   isLoading: getSupportedConnectorsLoading,
  //   error: getSupportedConnectorsError,
  //   refetch: refetchSupportedConnectors,
  // } = useGetSupportedConnectorsQuery({});

  const session = useSession();

  function parseJwt(token) {
    if (!token) {
      return;
    }
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(window.atob(base64));
  }

  const getConnectionLink = (provider) => {
    const token = session.data.accessToken;

    const sessionToken = parseJwt(token);
    const session_state = sessionToken.sid;

    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
    const authServerRoot = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL;
    const redirectUri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account-link-callback`
    );

    const nonce = Math.random().toString(36).substring(2, 15);
    const input = nonce + session_state + clientId + provider;
    const hash = base64url(crypto.createHash("sha256").update(input).digest());

    const linkUrl = `${authServerRoot}/broker/${provider}/link?client_id=${clientId}&redirect_uri=${redirectUri}&nonce=${nonce}&hash=${hash}`;

    return linkUrl;
  };

  const handleLinkAccount = async (provider, onSuccess) => {
    try {
      const data = getConnectionLink(provider);

      if (data) {
        const linkWindow = window.open(data, "_blank", "width=500,height=600");

        const interval = setInterval(async () => {
          if (linkWindow.closed) {
            clearInterval(interval);
            onSuccess();
          }
        }, 1000);
      }
    } catch (error) {
      alert("Failed to initiate account linking.");
    }
  };

  const onSuccess = () => {
    refetchConnectorsStatus();
  };

  const handleConnector = (item, status, connector) => {
    if (status === "connected") {
      setConnector(connector);
    } else {
      setConnector(connector);
      handleLinkAccount(item.heimdall_alias, onSuccess);
    }
  };

  useEffect(() => {
    if (getConnectorsStatus) {
      const filterConnectors = getConnectorsStatus?.map((item) => {
        const data = {
          ...item,
          coming_soon: false,
        };
        return data;
      });

      const comingSoonConnectors = [
        // {
        //   connector: "facebook_ads",
        //   heimdall_alias: "facebook_ads",
        //   status: "connected",
        //   username: "Not connected",
        //   coming_soon: true,
        // },
        // {
        //   connector: "google_ads",
        //   heimdall_alias: "google_ads",
        //   status: "connected",
        //   username: "Not connected",
        //   coming_soon: true,
        // },
        // {
        //   connector: "google_analytics",
        //   heimdall_alias: "google_analytics",
        //   status: "connected",
        //   username: "Not connected",
        //   coming_soon: true,
        // },
        {
          connector: "shopify",
          heimdall_alias: "shopify",
          status: "connected",
          username: "Not connected",
          coming_soon: true,
        },
        {
          connector: "linkedin",
          heimdall_alias: "linkedin",
          status: "connected",
          username: "Not connected",
          coming_soon: true,
        },
        {
          connector: "pinterest",
          heimdall_alias: "pinterest",
          status: "connected",
          username: "Not connected",
          coming_soon: true,
        },
        {
          connector: "hubspot",
          heimdall_alias: "hubspot",
          status: "connected",
          username: "Not connected",
          coming_soon: true,
        },
        {
          connector: "snapchat-marketing",
          heimdall_alias: "snapchat marketing",
          status: "connected",
          username: "Not connected",
          coming_soon: true,
        },
        {
          connector: "tiktok-marketing",
          heimdall_alias: "tiktok-marketing",
          status: "connected",
          username: "Not connected",
          coming_soon: true,
        },
        {
          connector: "youtube-analytics",
          heimdall_alias: "youtube-analytics",
          status: "connected",
          username: "Not connected",
          coming_soon: true,
        },
        {
          connector: "mailchimp",
          heimdall_alias: "mailchimp",
          status: "connected",
          username: "Not connected",
          coming_soon: true,
        },
      ];

      // const sortedConnector = filterConnectors?.filter((item) => {
      //   return item.connector !== "google_ads";
      // });

      const combConnectors = [...filterConnectors, ...comingSoonConnectors];
      // const combConnectors = [...comingSoonConnectors];
      setCombineConnectors(combConnectors);
    }
  }, [getConnectorsStatus]);

  useEffect(() => {
    if (debouncedSearchQuery) {
      const filtered = combineConnectors.filter((connector) =>
        connector.connector
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase())
      );
      setFilteredConnectors(filtered);
    } else {
      setFilteredConnectors(combineConnectors);
    }
  }, [debouncedSearchQuery, combineConnectors]);

  const handleIntercom = () => {
    boot();
    show();
  };

  useEffect(() => {
    if (showPopup && !isOpen) {
      shutdown();
    } else {
      boot();
    }
  }, [isOpen, handleIntercom]);

  return (
    <div className="flex flex-col w-full h-full space-y-4">
      <div className="px-3 py-2 text-base font-normal h-9 bg-secondary-bg text-primary-text">
        Select Connector
      </div>

      {getConnectorsStatusLoading && (
        <div className="flex items-center justify-center w-full h-full space-y-4">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-4 h-4 animate-spin text-primary-text fill-btn-primary"
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
      )}

      {getConnectorsStatusLoading || (
        <div className="flex flex-col w-full h-full space-y-4">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full h-10 pl-10 pr-4 text-sm font-medium bg-transparent border rounded-md outline-none text-input-text border-input-border placeholder:text-input-placeholder"
              placeholder="Search by connector name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-input-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </span>

            {searchQuery !== "" && (
              <span
                className="absolute flex items-center justify-center w-5 h-5 -translate-y-1/2 rounded-full cursor-pointer bg-icon-selected-bg top-1/2 right-2"
                onClick={() => setSearchQuery("")}
              >
                <svg
                  viewBox="0 0 12 13"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 fill-icon-color hover:fill-primary-text"
                >
                  <path d="M1.33317 12.3307L0.166504 11.1641L4.83317 6.4974L0.166504 1.83073L1.33317 0.664062L5.99984 5.33073L10.6665 0.664062L11.8332 1.83073L7.1665 6.4974L11.8332 11.1641L10.6665 12.3307L5.99984 7.66406L1.33317 12.3307Z" />
                </svg>
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {filteredConnectors?.map((item, index) => {
              return (
                <div
                  className={`flex flex-col justify-between p-4 space-y-4 border rounded-md cursor-pointer ${
                    item?.connector === currentConnector
                      ? "border-border-hover-color"
                      : "border-border-color hover:border-border-hover-color"
                  }`}
                  key={index}
                  onClick={() =>
                    item.coming_soon
                      ? handleIntercom()
                      : handleConnector(item, item?.status, item?.connector)
                  }
                >
                  <div className="flex items-center justify-between">
                    <img
                      src={`/assets/${item?.connector}.svg`}
                      alt="google_ads"
                      className="object-cover w-6 aspect-auto"
                    />

                    {item.coming_soon ? (
                      <div>
                        <button
                          type="button"
                          className="flex items-center justify-center w-full border border-border-color h-6 px-2 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-secondary-text hover:bg-btn-secondary-outline-hover bg-transparent group"
                          disabled={isOpen}
                        >
                          <span>Coming Soon...</span>
                        </button>
                      </div>
                    ) : (
                      <div>
                        {item?.status === "connected" ? (
                          <button
                            type="button"
                            className={`flex items-center justify-center w-full h-6 px-2 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit group cursor-default ${
                              theme === "dark"
                                ? "bg-[#121815] text-[#40AD7D]"
                                : "bg-[#E4FFF3] text-[#40AD7D]"
                            }`}
                            disabled={true}
                          >
                            <span>Connected</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="flex items-center justify-center w-full h-6 px-2 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text bg-btn-primary-outline-hover group"
                          >
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    {item.coming_soon ? (
                      <p className="text-sm font-medium capitalize 2xl:text-base text-primary-text">
                        {item?.connector}
                      </p>
                    ) : (
                      <p className="text-sm font-medium 2xl:text-base text-primary-text">
                        {item?.connector === "facebook_ads" && "Facebook Ads"}
                        {item?.connector === "google_ads" && "Google Ads"}
                        {item?.connector === "google_analytics" &&
                          "Google Analytics"}
                        {item?.connector === "shopify" && "Shopify"}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      {item?.status === "connected" ? (
                        <div className="flex items-center space-x-3">
                          <p className="text-xs font-medium leading-6 text-secondary-text">
                            {item?.username}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-medium leading-6 text-secondary-text">
                            Not connected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ConnectionDetails = ({
  currentConnector,
  selectedColumns,
  setSelectedColumns,
  setConnector,
}) => {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allProperties, setAllProperties] = useState([]);

  const {
    data: getConnectorsStatus,
    isLoading: getConnectorsStatusLoading,
    error: getConnectorsStatusError,
    refetch: refetchConnectorsStatus,
  } = useGetConnectorsStatusQuery({});

  const {
    data: getAllProperties = [],
    isLoading: getAllPropertiesLoading,
    error: getAllPropertiesError,
    refetch: refetchAllProperties,
    isFetching,
  } = useGetAllPropertiesQuery(
    {
      connector_type: currentConnector,
      skip: page * 10,
      limit: 10,
    },
    {
      skip: !currentConnector,
    }
  );

  useEffect(() => {
    setAllProperties(getAllProperties);

    if (getAllProperties.length < 10) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [getAllProperties]);

  const getFilterInfo = getConnectorsStatus?.find(
    (item) => item.connector === currentConnector
  );

  const handleToggle = (propertyId, propertyName, isChecked) => {
    const updatedColumns = { ...selectedColumns };
    if (isChecked) {
      updatedColumns[propertyId] = propertyName;
    } else {
      delete updatedColumns[propertyId];
    }
    setSelectedColumns(updatedColumns);
  };

  const session = useSession();
  function parseJwt(token) {
    if (!token) return;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(window.atob(base64));
  }

  const getConnectionLink = (provider) => {
    const token = session.data?.accessToken || "";
    const sessionToken = parseJwt(token);
    const session_state = sessionToken?.sid || "";

    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
    const authServerRoot = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL;
    const redirectUri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account-link-callback`
    );

    const nonce = Math.random().toString(36).substring(2, 15);
    const input = nonce + session_state + clientId + provider;
    const hash = base64url(crypto.createHash("sha256").update(input).digest());

    return `${authServerRoot}/broker/${provider}/link?client_id=${clientId}&redirect_uri=${redirectUri}&nonce=${nonce}&hash=${hash}`;
  };

  const handleLinkAccount = async (provider, onSuccess) => {
    try {
      const data = getConnectionLink(provider);
      if (data) {
        const linkWindow = window.open(data, "_blank", "width=500,height=600");
        const interval = setInterval(() => {
          if (linkWindow.closed) {
            clearInterval(interval);
            onSuccess();
          }
        }, 1000);
      }
    } catch (error) {
      console.log("Error linking account:", error);
      alert("Failed to initiate account linking.");
    }
  };

  const onSuccess = () => {
    refetchConnectorsStatus();
    refetchAllProperties();
  };

  const handleConnector = (item, status, connector) => {
    setConnector(connector);
    handleLinkAccount(item.heimdall_alias, onSuccess);
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  if (getConnectorsStatusLoading || getAllPropertiesLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full space-y-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between px-3 py-2 min-h-9 bg-secondary-bg">
        <div className="text-base font-normal text-primary-text">
          Connection Details
        </div>
        <div
          className="flex items-center space-x-1 cursor-pointer group"
          onClick={() =>
            handleConnector(
              getFilterInfo,
              getFilterInfo?.status,
              getFilterInfo?.connector
            )
          }
        >
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 fill-icon-color group-hover:fill-icon-color-hover"
            >
              <path
                d="M5.99984 11.3333C4.51095 11.3333 3.24984 10.8167 2.2165 
                9.78332C1.18317 8.74999 0.666504 7.48888 0.666504 
                5.99999C0.666504 4.5111 1.18317 3.24999 2.2165 
                2.21666C3.24984 1.18332 4.51095 0.666656 5.99984 
                0.666656C6.7665 0.666656 7.49984 0.82499 8.19984 
                1.14166C8.89984 1.45832 9.49984 1.9111 9.99984 
                2.49999V0.666656H11.3332V5.33332H6.6665V3.99999H9.4665C9.11095 
                3.37777 8.62484 2.88888 8.00817 2.53332C7.3915 2.17777 
                6.72206 1.99999 5.99984 1.99999C4.88873 1.99999 
                3.94428 2.38888 3.1665 3.16666C2.38873 3.94443 
                1.99984 4.88888 1.99984 5.99999C1.99984 7.1111 
                2.38873 8.05555 3.1665 8.83332C3.94428 9.6111 
                4.88873 9.99999 5.99984 9.99999C6.85539 9.99999 
                7.62762 9.75555 8.3165 9.26666C9.00539 8.77777 
                9.48873 8.13332 9.7665 7.33332H11.1665C10.8554 
                8.5111 10.2221 9.47221 9.2665 10.2167C8.31095 
                10.9611 7.22206 11.3333 5.99984 11.3333Z"
              />
            </svg>
          </span>
          <p className="text-xs font-medium text-secondary-text group-hover:text-primary-text">
            Reconnect
          </p>
        </div>
      </div>

      <div className="flex flex-col w-full px-3 py-3 space-y-2">
        <div className="grid w-full grid-cols-12">
          <div className="col-span-3">
            <p className="text-xs font-medium text-primary-text">
              Selected Connector
            </p>
          </div>
          <div className="col-span-9">
            <div className="flex items-center space-x-4">
              <p className="text-xs font-medium text-secondary-text">
                {getFilterInfo?.connector === "facebook_ads" && "Facebook Ads"}
                {getFilterInfo?.connector === "google_ads" && "Google Ads"}
                {getFilterInfo?.connector === "google_analytics" &&
                  "Google Analytics"}
                {getFilterInfo?.connector === "shopify" && "Shopify"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-12">
          <div className="col-span-3">
            <p className="text-xs font-medium text-primary-text">Username</p>
          </div>
          <div className="col-span-9">
            <p className="text-xs font-medium text-secondary-text">
              {getFilterInfo?.username}
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 text-base font-normal h-9 bg-secondary-bg text-primary-text">
        Choose the required accounts from your connections
      </div>

      {!isFetching && allProperties?.length > 0 && (
        <div className="overflow-y-auto recent__bar min-h-36 max-h-56">
          <div className="flex flex-col py-3 space-y-2">
            {(allProperties || []).map((property) => (
              <SwitchToggle
                key={property.property_id}
                data={{
                  id: property.property_id,
                  name: property.property_name,
                }}
                checked={selectedColumns.hasOwnProperty(property.property_id)}
                onToggle={(isChecked) =>
                  handleToggle(
                    property.property_id,
                    property.property_name,
                    isChecked
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {isFetching && (
        <div className="flex items-center justify-center overflow-y-auto h-36 recent__bar">
          <LoadingSpinner />
        </div>
      )}

      <div className="flex flex-col py-3 space-y-2">
        {allProperties.length === 0 && <NoAccountsFound />}
      </div>

      <div className="flex items-center justify-between px-3 py-3 space-x-2 border-t border-border-color">
        <button
          type="button"
          className="flex items-center py-1 space-x-2 text-xs font-medium tracking-wider text-secondary-text group hover:text-primary-text disabled:cursor-not-allowed"
          onClick={handlePrevPage}
          disabled={page === 0 || getAllPropertiesLoading}
        >
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 5 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-2.5 h-2.5 stroke-secondary-text group-hover:stroke-primary-text"
            >
              <path
                d="M4.25 1L1.25 4L4.25 7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span>Previous</span>
        </button>

        <div>
          <span className="text-xs font-medium tracking-wider text-secondary-text ">
            {getAllPropertiesLoading ? "Loading..." : `Page ${page + 1}`}
          </span>
        </div>

        <button
          type="button"
          className="right-0 flex items-center py-1 space-x-2 text-xs font-medium tracking-wider text-secondary-text group hover:text-primary-text disabled:cursor-not-allowed"
          onClick={handleNextPage}
          disabled={!hasMore || getAllPropertiesLoading}
        >
          <span>Next</span>

          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 5 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-2.5 h-2.5 stroke-secondary-text group-hover:stroke-primary-text"
            >
              <path
                d="M0.75 1L3.75 4L0.75 7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

const SwitchToggle = ({ data, checked, onToggle }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        className="sr-only peer"
        onChange={(e) => onToggle(e.target.checked)}
      />
      <div
        className="relative w-11 h-6 rounded-full bg-toggle-circle-bg 
                   peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                   after:content-[''] after:absolute after:top-0.5 after:start-[2px] 
                   peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-disable 
                   after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7]"
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

const LoadingSpinner = () => (
  <div role="status">
    <svg
      aria-hidden="true"
      className="w-4 h-4 animate-spin text-primary-text fill-btn-primary"
      viewBox="0 0 100 101"
      fill="none"
    >
      <path
        d="M100 50.5908C100 
           78.2051 77.6142 100.591 50 100.591C22.3858 
           100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 
           0.59082 50 0.59082C77.6142 0.59082 100 22.9766 
           100 50.5908ZM9.08144 50.5908C9.08144 
           73.1895 27.4013 91.5094 50 91.5094C72.5987 
           91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 
           27.9921 72.5987 9.67226 50 9.67226C27.4013 
           9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 
           35.9116 97.0079 33.5539C95.2932 28.8227 
           92.871 24.3692 89.8167 20.348C85.8452 
           15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 
           4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 
           0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 
           1.69328 37.813 4.19778 38.4501 6.62326C39.0873 
           9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 
           9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 
           10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 
           17.9648 79.3347 21.5619 82.5849 25.841C84.9175 
           28.9121 86.7997 32.2913 88.1811 35.8758C89.083 
           38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);

const NoAccountsFound = () => (
  <div className="flex flex-col items-center justify-center w-full h-48 col-span-12 space-y-2 border rounded-md border-border-color">
    <span className="flex items-center justify-center">
      <svg
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 fill-icon-color"
      >
        <path
          d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 
          7.5 11.0208 7.40417 11.2125 7.2125C11.4042 7.02083 
          11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 
          11.2125 5.7875C11.0208 5.59583 10.7833 5.5 10.5 
          5.5C10.2167 5.5 9.97917 5.59583 9.7875 5.7875C9.59583 
          5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 9.59583 
          7.02083 9.7875 7.2125C9.97917 7.40417 10.2167 
          7.5 10.5 7.5ZM10.5 20.5C9.11667 20.5 7.81667 
          20.2375 6.6 19.7125C5.38333 19.1875 4.325 
          18.475 3.425 17.575C2.525 16.675 1.8125 
          15.6167 1.2875 14.4C0.7625 13.1833 0.5 
          11.8833 0.5 10.5C0.5 9.11667 0.7625 7.81667 
          1.2875 6.6C1.8125 5.38333 2.525 4.325 
          3.425 3.425C4.325 2.525 5.38333 1.8125 
          6.6 1.2875C7.81667 0.7625 9.11667 0.5 
          10.5 0.5C11.8833 0.5 13.1833 0.7625 
          14.4 1.2875C15.6167 1.8125 16.675 
          2.525 17.575 3.425C18.475 4.325 
          19.1875 5.38333 19.7125 6.6C20.2375 
          7.81667 20.5 9.11667 20.5 10.5C20.5 
          11.8833 20.2375 13.1833 19.7125 
          14.4C19.1875 15.6167 18.475 16.675 
          17.575 17.575C16.675 18.475 15.6167 
          19.1875 14.4 19.7125C13.1833 20.2375 
          11.8833 20.5 10.5 20.5ZM10.5 
          18.5C12.7333 18.5 14.625 17.725 
          16.175 16.175C17.725 14.625 18.5 
          12.7333 18.5 10.5C18.5 8.26667 
          17.725 6.375 16.175 4.825C14.625 
          3.275 12.7333 2.5 10.5 2.5C8.26667 
          2.5 6.375 3.275 4.825 4.825C3.275 
          6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 
          3.275 14.625 4.825 16.175C6.375 
          17.725 8.26667 18.5 10.5 18.5Z"
        />
      </svg>
    </span>
    <span className="text-xs font-medium tracking-wider 2xl:text-sm text-primary-text">
      No Accounts Found
    </span>
    <span className="text-xs font-normal tracking-wider text-secondary-text">
      Please reconnect again.
    </span>
  </div>
);
