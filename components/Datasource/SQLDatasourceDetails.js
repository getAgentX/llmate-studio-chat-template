import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import {
  useGetDownloadSpreadsheetMutation,
  useUpdateDatasourceInfoMutation,
  useUpdateDbConnectionMutation,
  useUpdateEmbeddingModelMutation,
  useUpdateSpreadsheetMutation,
  useUpdateSqlGeneratorMutation,
  useUpdateSqlRegeneratorMutation,
  useUpdateSqlValidatorMutation,
  useUpdateTablesMutation,
} from "@/store/datasource";
import ConfirmModal from "@/components/Modal/ConfirmModal";
import SuccessModal from "@/components/Modal/SuccessModal";
import { ErrorComponents } from "@/components";
import DetailsTableDropdwn from "./DetailsTableDropdwn";
import { useRouter } from "next/router";
import SelectIconOptions from "../common/SelectIconOptions";
import usePasswordToggle from "@/hooks/usePasswordToggle";
import ErrorModal from "../Modal/ErrorModal";
import { useSelector } from "react-redux";
import { currentOrganizationSelector } from "@/store/current_organization";
import usePublished from "@/hooks/usePublished";

const SQLDatasourceDetails = ({
  slug,
  data,
  refetchData = () => {},
  dbConnection,
  errorDbConnection,
}) => {
  const [editConfirm, setEditConfirm] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentTab, setCurrentTab] = useState("sql_generator");

  const [configuration, setConfiguration] = useState(true);
  const [infoConfig, setInfoConfig] = useState(true);
  const [showConnection, setShowConnection] = useState(true);
  const [database, setDatabase] = useState("");

  const [selectedColumns, setSelectedColumns] = useState({});
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [showFileUpdate, setShowFileUpdate] = useState(false);

  const [showUploadedError, setShowUploadedError] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    reset,
    trigger,
    formState: { errors, isValid, isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      about: "",
      db_connection: {
        db_type: "",
        project: "",
        key_base64: "",
      },
      database: "",
      tables: [],
      embedding_model: {
        embedding_provider: "openai",
        model: "text-embedding-ada-002",
      },
      sql_generator: {
        default: {
          llm: {
            llm_provider: "openai",
            llm_model: "gpt-3.5-turbo-1106",
            max_tokens: 1000,
            temperature: 0,
            top_p: 0,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: [],
          },
          example_count: 5,
          system_instructions: "",
          human_instructions: "",
        },
        checkpoints: [],
      },
      sql_regenerator: {
        default: {
          llm: {
            llm_provider: "openai",
            llm_model: "gpt-3.5-turbo-1106",
            max_tokens: 1000,
            temperature: 0,
            top_p: 0,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: [],
          },
          example_count: 5,
          system_instructions: "",
          human_instructions: "",
        },
        checkpoints: [],
      },
      sql_validator: {
        llm: {
          llm_provider: "openai",
          llm_model: "gpt-3.5-turbo-1106",
          max_tokens: 1000,
          temperature: 0,
          top_p: 0,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop: [],
        },
        example_count: 5,
        validation_template: {
          system_instructions: "",
          human_instructions: "",
          desc_steps_followed: "",
          desc_errors: "",
        },
      },
    },
  });

  useEffect(() => {
    if (data) {
      let regeneratorData;
      let validatorData;

      if (data.ds_config.sql_regenerator === null) {
        regeneratorData = {};
      } else {
        regeneratorData = {
          default: {
            llm: {
              llm_provider:
                data.ds_config.sql_regenerator.default.llm.llm_provider,
              llm_model: data.ds_config.sql_regenerator.default.llm.llm_model,
              max_tokens: data.ds_config.sql_regenerator.default.llm.max_tokens,
              temperature:
                data.ds_config.sql_regenerator.default.llm.temperature,
              top_p: data.ds_config.sql_regenerator.default.llm.top_p,
              frequency_penalty:
                data.ds_config.sql_regenerator.default.llm.frequency_penalty,
              presence_penalty:
                data.ds_config.sql_regenerator.default.llm.presence_penalty,
              stop: [],
            },
            example_count: data.ds_config.sql_regenerator.default.example_count,
            system_instructions:
              data.ds_config.sql_regenerator.default.system_instructions,
            human_instructions:
              data.ds_config.sql_regenerator.default.human_instructions,
          },
          checkpoints: [],
        };
      }

      if (data.ds_config.sql_validator === null) {
        validatorData = {};
      } else {
        validatorData = {
          llm: {
            llm_provider: data.ds_config.sql_validator.llm.llm_provider,
            llm_model: data.ds_config.sql_validator.llm.llm_model,
            max_tokens: data.ds_config.sql_validator.llm.max_tokens,
            temperature: data.ds_config.sql_validator.llm.temperature,
            top_p: data.ds_config.sql_validator.llm.top_p,
            frequency_penalty:
              data.ds_config.sql_validator.llm.frequency_penalty,
            presence_penalty: data.ds_config.sql_validator.llm.presence_penalty,
            stop: [],
          },
          example_count: data.ds_config.sql_validator.example_count,
          validation_template: {
            system_instructions:
              data.ds_config.sql_validator.validation_template
                .system_instructions,
            human_instructions:
              data.ds_config.sql_validator.validation_template
                .human_instructions,
            desc_steps_followed: "",
            desc_errors: "",
          },
        };
      }

      const modifiedData = {
        name: data.name,
        about: data.about,
        db_connection: {
          ...dbConnection,
        },
        database: data.ds_config.database,
        tables: data.ds_config.tables,
        embedding_model: {
          embedding_provider:
            data.ds_config.current_examples_index.embedding_model
              .embedding_provider,
          model: data.ds_config.current_examples_index.embedding_model.model,
        },
        sql_generator: {
          default: {
            llm: {
              llm_provider:
                data.ds_config.sql_generator.default.llm.llm_provider,
              llm_model: data.ds_config.sql_generator.default.llm.llm_model,
              max_tokens: data.ds_config.sql_generator.default.llm.max_tokens,
              temperature: data.ds_config.sql_generator.default.llm.temperature,
              top_p: data.ds_config.sql_generator.default.llm.top_p,
              frequency_penalty:
                data.ds_config.sql_generator.default.llm.frequency_penalty,
              presence_penalty:
                data.ds_config.sql_generator.default.llm.presence_penalty,
              stop: [],
            },
            example_count: data.ds_config.sql_generator.default.example_count,
            system_instructions:
              data.ds_config.sql_generator.default.system_instructions,
            human_instructions:
              data.ds_config.sql_generator.default.human_instructions,
          },
          checkpoints: [],
        },
        sql_regenerator: regeneratorData,
        sql_validator: validatorData,
        is_published: data.is_published,
      };

      reset(modifiedData);
    }
  }, [data, reset]);

  const [updateDatasourceInfo, { error: updateDatasourceInfoError }] =
    useUpdateDatasourceInfoMutation();
  const [updateDbConnection, { error: updateDbConnectionError }] =
    useUpdateDbConnectionMutation();
  const [updateTables, { error: updateTablesError }] =
    useUpdateTablesMutation();
  const [updateEmbeddingModel, { error: updateEmbeddingModelError }] =
    useUpdateEmbeddingModelMutation();
  const [updateSqlGenerator, { error: updateSqlGeneratorError }] =
    useUpdateSqlGeneratorMutation();
  const [updateSqlRegenerator, { error: updateSqlRegeneratorError }] =
    useUpdateSqlRegeneratorMutation();
  const [updateSqlValidator, { error: updateSqlValidatorError }] =
    useUpdateSqlValidatorMutation();

  const [updateSpreadsheet, { isLoading: isLoadingSpreadsheet }] =
    useUpdateSpreadsheetMutation();
  const [getDownloadSpreadsheet, {}] = useGetDownloadSpreadsheetMutation();

  const updateInformation = () => {
    const name = getValues("name");
    const about = getValues("about");

    const infoData = {
      name: name,
      about: about,
    };

    updateDatasourceInfo({ datasource_id: slug, payload: infoData })
      .then(() => {
        setShowSuccessModal(true); // Show success modal on success
        setInfoConfig(true);
      })
      .catch((error) => {
        console.error("Failed to update information:", error);
      });
  };

  const updateConnection = () => {
    const connection = getValues("db_connection");

    updateDbConnection({ datasource_id: slug, payload: connection })
      .then(() => {
        setShowSuccessModal(true);
        setShowConnection(true);
        router.push(`/datasource/details/${slug}/update-table`);
      })
      .catch((error) => {
        console.error("Failed to update connection:", error);
      });
  };

  const updateTable = () => {
    const database = getValues("database");
    const tables = getValues("tables");

    const data = {
      database: database,
      tables: tables,
    };

    setShowSuccessModal(true); // Show success modal on success
  };

  const updateContext = () => {
    const database = getValues("database");
    const tables = getValues("tables");

    const contextData = {
      database: database,
      tables: tables,
    };

    updateTables({ datasource_id: slug, payload: contextData })
      .then(() => {
        setShowSuccessModal(true); // Show success modal on success
      })
      .catch((error) => {
        console.error("Failed to update context:", error);
      });
  };

  const updateEmbedding = () => {
    const embedding = getValues("embedding_model");

    updateEmbeddingModel({ datasource_id: slug, payload: embedding })
      .then(() => {
        setShowSuccessModal(true); // Show success modal on success
      })
      .catch((error) => {
        console.error("Failed to update embedding model:", error);
      });
  };

  const updateConfiguration = (currentTab) => {
    if (currentTab === "sql_generator") {
      const generator = getValues("sql_generator");

      updateSqlGenerator({ datasource_id: slug, payload: generator })
        .then(() => {
          setShowSuccessModal(true); // Show success modal on success
        })
        .catch((error) => {
          console.error("Failed to update SQL generator:", error);
        });
    }

    if (currentTab === "sql_regenerator") {
      const regenerator = getValues("sql_regenerator");

      let regeneratorStructure;

      if (regenerator.sql_regenerator === null) {
        regeneratorStructure = {
          sql_regenerator: regenerator.sql_regenerator,
        };
      } else {
        regeneratorStructure = {
          sql_regenerator: {
            ...regenerator,
            checkpoints: [],
          },
        };
      }

      updateSqlRegenerator({
        datasource_id: slug,
        payload: regeneratorStructure,
      })
        .then(() => {
          setShowSuccessModal(true);
        })
        .catch((error) => {
          console.error("Failed to update SQL regenerator:", error);
        });
    }

    if (currentTab === "sql_validator") {
      const validator = getValues("sql_validator");

      let validatorStructure;

      if (validator.sql_validator === null) {
        validatorStructure = {
          sql_validator: validator.sql_validator,
        };
      } else {
        const validationTemplate = {
          ...validator.validation_template,
          desc_steps_followed: "",
          desc_errors: "",
        };

        validatorStructure = {
          sql_validator: {
            ...validator,
            validation_template: {
              ...validationTemplate,
            },
          },
        };
      }

      updateSqlValidator({ datasource_id: slug, payload: validatorStructure })
        .then(() => {
          setShowSuccessModal(true); // Show success modal on success
        })
        .catch((error) => {
          console.error("Failed to update SQL validator:", error);
        });
    }
  };

  const handleUpdateConfirmation = (editType) => {
    setCurrentEdit(editType);
    setEditConfirm(true);
  };

  const handleConfirmEdit = () => {
    if (currentEdit === "information") updateInformation();
    if (currentEdit === "connection") updateConnection();
    if (currentEdit === "table") updateTable();
    if (currentEdit === "context") updateContext();
    if (currentEdit === "embedding") updateEmbedding();
    if (currentEdit === "configuration") updateConfiguration(currentTab);
    setEditConfirm(false);
  };

  const handlePrimary = () => {
    router.push(`/datasource/details/${slug}/query`);
  };

  const handleSecondary = () => {
    setShowSuccessModal(false);
  };

  const connectionOptions = [
    {
      value: "bigquery",
      label: "bigquery",
      icon: "/assets/google-bigquery.svg",
    },
    { value: "postgres", label: "postgres", icon: "/assets/postgresql.svg" },
    { value: "mariadb", label: "mariadb", icon: "/assets/vector.svg" },
    {
      value: "snowflake",
      label: "snowflake",
      icon: "/assets/snowflake.svg",
    },
    { value: "mysql", label: "mysql", icon: "/assets/mysql-logo.svg" },
    { value: "athena", label: "athena", icon: "/assets/AWS-Athena.svg" },
    {
      value: "databricks",
      label: "databricks",
      icon: "/assets/Databricks.svg",
    },
    { value: "redshift", label: "redshift", icon: "/assets/aws-redshift.svg" },
    {
      value: "spreadsheet",
      label: "spreadsheet",
      icon: "/assets/spreadsheet.svg",
    },
  ];

  useEffect(() => {
    const databaseData = watch("db_connection.db_type");

    if (databaseData) {
      setDatabase(databaseData);
    } else {
      setDatabase("");
    }

    const columnsData = data?.ds_config?.tables;

    const convertArrayToObject = (dataArray) => {
      return dataArray.reduce((acc, current) => {
        acc[current.name] = current.columns;
        return acc;
      }, {});
    };

    if (columnsData) {
      const convertedObject = convertArrayToObject(columnsData);
      setSelectedColumns(convertedObject);
    } else {
      setSelectedColumns({});
    }
  }, []);

  const handleDatabaseSelect = (newDatabase) => {
    const values = getValues();

    const newValues = {
      ...values,
      db_connection: {
        ...values.db_connection,
        db_type: newDatabase,
      },
    };

    reset(newValues);
    setDatabase(newDatabase);
    setValue("db_connection.db_type", newDatabase);
  };

  const keyBase = watch("db_connection.key_base64");

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (
      file &&
      (file.type === "text/csv" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel")
    ) {
      setSelectedFile(file);

      const formData = new FormData();
      formData.append("file", file);

      updateSpreadsheet({ datasource_id: slug, payload: formData }).then(
        (response) => {
          if (response) {
            if (response.data === null) {
              setShowFileUpdate(true);
              refetchData();
            }

            if (response.error) {
              console.log("error", response.error.data.message);
              setShowUploadedError(true);
            }
          }
        }
      );
    } else {
      alert("Please select a CSV file.");
    }
  };

  const handleDownloadSpreadsheet = () => {
    getDownloadSpreadsheet({ datasource_id: slug }).then((response) => {
      if (response.data) {
        if (response.data.url) {
          const link = document.createElement("a");
          link.href = response.data.url;
          link.download = "";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });
  };

  const currentOrg = useSelector(currentOrganizationSelector);
  const isPublished = usePublished(
    currentOrg,
    data?.organization_id,
    data?.is_published
  );

  const {
    inputType: projectBigqueryInputType,
    toggleVisibility: toggleProjectBigqueryVisibility,
    icon: projectBigqueryIcon,
  } = usePasswordToggle();

  const {
    inputType: emailBigqueryInputType,
    toggleVisibility: toggleEmailBigqueryVisibility,
    icon: emailBigqueryIcon,
  } = usePasswordToggle();

  const {
    inputType: keyBigqueryInputType,
    toggleVisibility: toggleKeyBigqueryVisibility,
    icon: keyBigqueryIcon,
  } = usePasswordToggle();

  const {
    inputType: userInputType,
    toggleVisibility: toggleUserVisibility,
    icon: userIcon,
  } = usePasswordToggle();

  const {
    inputType: passwordInputType,
    toggleVisibility: togglePasswordVisibility,
    icon: passwordIcon,
  } = usePasswordToggle();

  const {
    inputType: hostInputType,
    toggleVisibility: toggleHostVisibility,
    icon: hostIcon,
  } = usePasswordToggle();

  const {
    inputType: portInputType,
    toggleVisibility: togglePortVisibility,
    icon: portIcon,
  } = usePasswordToggle();

  const {
    inputType: databaseInputType,
    toggleVisibility: toggleDatabaseVisibility,
    icon: databaseIcon,
  } = usePasswordToggle();

  const {
    inputType: userMariadbInputType,
    toggleVisibility: toggleUserMariadbVisibility,
    icon: userMariadbIcon,
  } = usePasswordToggle();

  const {
    inputType: passwordMariadbInputType,
    toggleVisibility: togglePasswordMariadbVisibility,
    icon: passwordMariadbIcon,
  } = usePasswordToggle();

  const {
    inputType: hostMariadbInputType,
    toggleVisibility: toggleHostMariadbVisibility,
    icon: hostMariadbIcon,
  } = usePasswordToggle();

  const {
    inputType: portMariadbInputType,
    toggleVisibility: togglePortMariadbVisibility,
    icon: portMariadbIcon,
  } = usePasswordToggle();

  const {
    inputType: userSnowflakeInputType,
    toggleVisibility: toggleUserSnowflakeVisibility,
    icon: userSnowflakeIcon,
  } = usePasswordToggle();

  const {
    inputType: passwordSnowflakeInputType,
    toggleVisibility: togglePasswordSnowflakeVisibility,
    icon: passwordSnowflakeIcon,
  } = usePasswordToggle();

  const {
    inputType: accountSnowflakeInputType,
    toggleVisibility: toggleAccountSnowflakeVisibility,
    icon: accountSnowflakeIcon,
  } = usePasswordToggle();

  const {
    inputType: warehouseSnowflakeInputType,
    toggleVisibility: toggleWarehouseSnowflakeVisibility,
    icon: warehouseSnowflakeIcon,
  } = usePasswordToggle();

  const {
    inputType: databaseSnowflakeInputType,
    toggleVisibility: toggleDatabaseSnowflakeVisibility,
    icon: databaseSnowflakeIcon,
  } = usePasswordToggle();

  const {
    inputType: userMysqlInputType,
    toggleVisibility: toggleUserMysqlVisibility,
    icon: userMysqlIcon,
  } = usePasswordToggle();

  const {
    inputType: passwordMysqlInputType,
    toggleVisibility: togglePasswordMysqlVisibility,
    icon: passwordMysqlIcon,
  } = usePasswordToggle();

  const {
    inputType: hostMysqlInputType,
    toggleVisibility: toggleHostMysqlVisibility,
    icon: hostMysqlIcon,
  } = usePasswordToggle();

  const {
    inputType: portMysqlInputType,
    toggleVisibility: togglePortMysqlVisibility,
    icon: portMysqlIcon,
  } = usePasswordToggle();

  const {
    inputType: accessKeyAthenaInputType,
    toggleVisibility: toggleAccessKeyAthenaVisibility,
    icon: accessKeyAthenaIcon,
  } = usePasswordToggle();

  const {
    inputType: secretKeyAthenaInputType,
    toggleVisibility: toggleSecretKeyAthenaVisibility,
    icon: secretKeyAthenaIcon,
  } = usePasswordToggle();

  const {
    inputType: regionAthenaInputType,
    toggleVisibility: toggleRegionAthenaVisibility,
    icon: regionAthenaIcon,
  } = usePasswordToggle();

  const {
    inputType: locationAthenaInputType,
    toggleVisibility: toggleLocationAthenaVisibility,
    icon: locationAthenaIcon,
  } = usePasswordToggle();

  const {
    inputType: hostnameDatabricksInputType,
    toggleVisibility: toggleHostnameDatabricksVisibility,
    icon: hostnameDatabricksIcon,
  } = usePasswordToggle();

  const {
    inputType: httpDatabricksInputType,
    toggleVisibility: toggleHttpDatabricksVisibility,
    icon: httpDatabricksIcon,
  } = usePasswordToggle();

  const {
    inputType: tokenDatabricksInputType,
    toggleVisibility: toggleTokenDatabricksVisibility,
    icon: tokenDatabricksIcon,
  } = usePasswordToggle();

  const {
    inputType: userRedshiftInputType,
    toggleVisibility: toggleUserRedshiftVisibility,
    icon: userRedshiftIcon,
  } = usePasswordToggle();

  const {
    inputType: passwordRedshiftInputType,
    toggleVisibility: togglePasswordRedshiftVisibility,
    icon: passwordRedshiftIcon,
  } = usePasswordToggle();

  const {
    inputType: hostRedshiftInputType,
    toggleVisibility: toggleHostRedshiftVisibility,
    icon: hostRedshiftIcon,
  } = usePasswordToggle();

  const {
    inputType: portRedshiftInputType,
    toggleVisibility: togglePortRedshiftVisibility,
    icon: portRedshiftIcon,
  } = usePasswordToggle();

  const {
    inputType: schemaRedshiftInputType,
    toggleVisibility: toggleSchemaRedshiftVisibility,
    icon: schemaRedshiftIcon,
  } = usePasswordToggle();

  const {
    inputType: databaseRedshiftInputType,
    toggleVisibility: toggleDatabaseRedshiftVisibility,
    icon: databaseRedshiftIcon,
  } = usePasswordToggle();

  if (
    updateDatasourceInfoError ||
    updateDbConnectionError ||
    updateTablesError ||
    updateEmbeddingModelError ||
    updateSqlGeneratorError ||
    updateSqlRegeneratorError ||
    updateSqlValidatorError
  ) {
    return (
      <ErrorComponents
        error={
          updateDatasourceInfoError ||
          updateDbConnectionError ||
          updateTablesError ||
          updateEmbeddingModelError ||
          updateSqlGeneratorError ||
          updateSqlRegeneratorError ||
          updateSqlValidatorError
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="flex flex-col col-span-6 px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                >
                  <g clip-path="url(#clip0_104_5193)">
                    <path
                      d="M8.33347 5.50013C8.20161 5.50013 8.07272 5.46103 7.96309 5.38778C7.85345 5.31452 7.76801 5.2104 7.71755 5.08859C7.66709 4.96677 7.65389 4.83272 7.67961 4.7034C7.70533 4.57408 7.76883 4.45529 7.86206 4.36206C7.9553 4.26882 8.07409 4.20533 8.20341 4.17961C8.33273 4.15388 8.46677 4.16709 8.58859 4.21754C8.71041 4.268 8.81453 4.35345 8.88778 4.46308C8.96103 4.57272 9.00013 4.70161 9.00013 4.83346C8.99978 5.01017 8.92943 5.17953 8.80448 5.30448C8.67953 5.42943 8.51017 5.49978 8.33347 5.50013ZM8.6668 12.5001V6.50013H7.33347V7.1668H8.00013V12.5001H7.33347V13.1668H9.33347V12.5001H8.6668ZM15.2001 8.83346C15.2001 10.1916 14.7974 11.5192 14.0429 12.6484C13.2884 13.7776 12.2159 14.6577 10.9612 15.1774C9.70651 15.6972 8.32585 15.8331 6.99385 15.5682C5.66184 15.3032 4.43832 14.6493 3.478 13.6889C2.51768 12.7286 1.86369 11.5051 1.59874 10.1731C1.33379 8.84108 1.46977 7.46042 1.98949 6.2057C2.50922 4.95099 3.38933 3.87856 4.51855 3.12404C5.64777 2.36952 6.97537 1.9668 8.33347 1.9668C9.23528 1.96653 10.1283 2.14397 10.9615 2.48896C11.7948 2.83395 12.5518 3.33973 13.1895 3.97741C13.8272 4.61509 14.333 5.37217 14.678 6.20539C15.023 7.03861 15.2004 7.93165 15.2001 8.83346ZM14.5335 8.83346C14.5335 7.60722 14.1698 6.40851 13.4886 5.38893C12.8073 4.36934 11.839 3.57467 10.7061 3.10541C9.5732 2.63615 8.32659 2.51337 7.12391 2.7526C5.92122 2.99182 4.81649 3.58232 3.9494 4.4494C3.08232 5.31649 2.49183 6.42122 2.2526 7.6239C2.01337 8.82659 2.13615 10.0732 2.60541 11.2061C3.07468 12.339 3.86935 13.3073 4.88893 13.9886C5.90852 14.6698 7.10722 15.0335 8.33347 15.0335C9.97727 15.0317 11.5532 14.3779 12.7156 13.2156C13.8779 12.0532 14.5317 10.4773 14.5335 8.83346Z"
                      fill="white"
                      fill-opacity="0.5"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_104_5193">
                      <rect
                        fill="white"
                        transform="translate(0 0.5)"
                        className="w-5 h-5"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </span>
              <p className="text-xs font-medium tracking-wider text-white">
                Information
              </p>
            </div>

            <div className="flex items-center">
              {infoConfig && !isPublished && (
                <a
                  className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-secondary hover:text-white"
                  onClick={() => setInfoConfig(false)}
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
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                      />
                    </svg>
                  </span>
                  <span>Edit</span>
                </a>
              )}

              {infoConfig || (
                <div className="flex items-center space-x-4">
                  <a
                    className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-white"
                    onClick={() => {
                      reset();
                      setInfoConfig(true);
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

                  <button
                    type="button"
                    className={`flex items-center justify-center space-x-2 text-xs disabled:text-white/40 disabled:cursor-default font-medium tracking-wide cursor-pointer ${
                      isDirty
                        ? "text-[#2A9E28] hover:text-white"
                        : "text-white/40 cursor-not-allowed"
                    }`}
                    onClick={
                      isDirty
                        ? () => handleUpdateConfirmation("information")
                        : null
                    }
                    disabled={!isValid || !isDirty}
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
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            className={`flex flex-col p-2 space-y-4 border rounded-md sm:p-4 ${
              infoConfig ? "border-border" : "border-secondary"
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

        <div className="flex flex-col col-span-6 px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                >
                  <path
                    d="M7.16667 15.5V10.5H8.83333V12.1667H15.5V13.8333H8.83333V15.5H7.16667ZM0.5 13.8333V12.1667H5.5V13.8333H0.5ZM3.83333 10.5V8.83333H0.5V7.16667H3.83333V5.5H5.5V10.5H3.83333ZM7.16667 8.83333V7.16667H15.5V8.83333H7.16667ZM10.5 5.5V0.5H12.1667V2.16667H15.5V3.83333H12.1667V5.5H10.5ZM0.5 3.83333V2.16667H8.83333V3.83333H0.5Z"
                    fill="#5F6368"
                  />
                </svg>
              </span>
              <p className="text-xs font-medium tracking-wider text-white">
                selected database & it’s connections
              </p>
            </div>

            {dbConnection?.db_type !== "llmate_sample_bigquery" && (
              <div className="flex items-center">
                {showConnection && !isPublished && (
                  <a
                    className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-secondary hover:text-white"
                    onClick={() => setShowConnection(false)}
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
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                        />
                      </svg>
                    </span>

                    <span>Edit</span>
                  </a>
                )}

                {showConnection || (
                  <div className="flex items-center space-x-4">
                    <a
                      className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-white"
                      onClick={() => setShowConnection(true)}
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

                    {database !== "spreadsheet" && (
                      <a
                        className={`flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer ${
                          isDirty
                            ? "text-[#2A9E28] hover:text-white"
                            : "text-white/40 cursor-not-allowed"
                        }`}
                        onClick={
                          isDirty
                            ? () => handleUpdateConfirmation("connection")
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
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {dbConnection?.db_type &&
            dbConnection?.db_type !== "llmate_sample_bigquery" && (
              <div
                className={`flex flex-col p-2 space-y-4 overflow-y-auto border rounded-md sm:space-y-6 sm:p-4 h-full recent__bar ${
                  configuration ? "border-border" : "border-secondary"
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex flex-col space-y-6">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12">
                        <div className="flex flex-col space-y-4">
                          <p className="text-sm font-normal text-white/40">
                            Selected Database
                          </p>
                          <Controller
                            name="db_connection.db_type"
                            control={control}
                            rules={{
                              required: "Model selection is required",
                            }}
                            render={({
                              field: { onChange, value, ref },
                              fieldState: { error },
                            }) => (
                              <SelectIconOptions
                                options={connectionOptions}
                                onSelect={(option) =>
                                  handleDatabaseSelect(option.value)
                                }
                                value={connectionOptions.find(
                                  (option) => option.value === value
                                )}
                                defaultValue={connectionOptions.find(
                                  (type) => type.value === dbConnection?.db_type
                                )}
                                disabled={showConnection}
                                placeholder="Select Database"
                              />
                            )}
                          />
                        </div>
                      </div>

                      {database === "" && (
                        <div className="col-span-12">
                          <div className="flex flex-col">
                            <div className="flex flex-col min-h-[240px] items-center justify-center w-full h-full space-y-2">
                              <span className="flex items-center justify-center">
                                <svg
                                  viewBox="0 0 21 21"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-5 h-5"
                                >
                                  <path
                                    d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 7.5 11.0208 7.40417 11.2125 7.2125C11.4042 7.02083 11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 11.2125 5.7875C11.0208 5.59583 10.7833 5.5 10.5 5.5C10.2167 5.5 9.97917 5.59583 9.7875 5.7875C9.59583 5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 9.59583 7.02083 9.7875 7.2125C9.97917 7.40417 10.2167 7.5 10.5 7.5ZM10.5 20.5C9.11667 20.5 7.81667 20.2375 6.6 19.7125C5.38333 19.1875 4.325 18.475 3.425 17.575C2.525 16.675 1.8125 15.6167 1.2875 14.4C0.7625 13.1833 0.5 11.8833 0.5 10.5C0.5 9.11667 0.7625 7.81667 1.2875 6.6C1.8125 5.38333 2.525 4.325 3.425 3.425C4.325 2.525 5.38333 1.8125 6.6 1.2875C7.81667 0.7625 9.11667 0.5 10.5 0.5C11.8833 0.5 13.1833 0.7625 14.4 1.2875C15.6167 1.8125 16.675 2.525 17.575 3.425C18.475 4.325 19.1875 5.38333 19.7125 6.6C20.2375 7.81667 20.5 9.11667 20.5 10.5C20.5 11.8833 20.2375 13.1833 19.7125 14.4C19.1875 15.6167 18.475 16.675 17.575 17.575C16.675 18.475 15.6167 19.1875 14.4 19.7125C13.1833 20.2375 11.8833 20.5 10.5 20.5ZM10.5 18.5C12.7333 18.5 14.625 17.725 16.175 16.175C17.725 14.625 18.5 12.7333 18.5 10.5C18.5 8.26667 17.725 6.375 16.175 4.825C14.625 3.275 12.7333 2.5 10.5 2.5C8.26667 2.5 6.375 3.275 4.825 4.825C3.275 6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 3.275 14.625 4.825 16.175C6.375 17.725 8.26667 18.5 10.5 18.5Z"
                                    fill="#5F6368"
                                  />
                                </svg>
                              </span>

                              <span className="text-sm font-medium tracking-wider text-white">
                                No DB has selected
                              </span>

                              <span className="text-sm font-normal tracking-wider text-white/25">
                                Select the required DB on the left and add the
                                connections here
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
                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white/40">
                                      Project *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={projectBigqueryInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your BigQuery project name"
                                      {...register("db_connection.project", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleProjectBigqueryVisibility}
                                    >
                                      {projectBigqueryIcon}
                                    </span>
                                  </div>
                                </div>

                                {typeof keyBase === "string" ? (
                                  <div className="flex flex-col space-y-4">
                                    <div className="flex flex-col">
                                      <p className="text-sm font-normal text-white/50">
                                        Key Base 64 *
                                      </p>
                                    </div>

                                    <div className="relative flex items-center space-x-2">
                                      {keyBigqueryInputType === "text" && (
                                        <textarea
                                          type={keyBigqueryInputType}
                                          className="w-full px-4 py-3 overflow-y-auto text-sm text-white border rounded-md outline-none resize-none h-36 border-border bg-[#181A1C] placeholder:text-white/40 recent__bar"
                                          placeholder="Provide the Base64-encoded key for authentication with BigQuery"
                                          {...register(
                                            "db_connection.key_base64",
                                            {
                                              required: true,
                                            }
                                          )}
                                          disabled={showConnection}
                                        />
                                      )}

                                      {keyBigqueryInputType === "password" && (
                                        <input
                                          type="text"
                                          className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                          placeholder="Check your KeyBase64"
                                          disabled={true}
                                        />
                                      )}

                                      {keyBigqueryInputType === "text" && (
                                        <span
                                          className="absolute transform cursor-pointer right-2 top-4"
                                          onClick={toggleKeyBigqueryVisibility}
                                        >
                                          {keyBigqueryIcon}
                                        </span>
                                      )}

                                      {keyBigqueryInputType === "password" && (
                                        <span
                                          className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                          onClick={toggleKeyBigqueryVisibility}
                                        >
                                          {keyBigqueryIcon}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col space-y-4">
                                    <div className="flex flex-col space-y-4 items-center">
                                      <div className="flex flex-col">
                                        <p className="text-sm font-normal text-white/40">
                                          Client Email *
                                        </p>
                                      </div>

                                      <div className="relative flex items-center space-x-2">
                                        <input
                                          type={emailBigqueryInputType}
                                          className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                          {...register(
                                            "db_connection.key_base64.client_email",
                                            {
                                              required: true,
                                            }
                                          )}
                                          disabled={showConnection}
                                        />

                                        <span
                                          className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                          onClick={
                                            toggleEmailBigqueryVisibility
                                          }
                                        >
                                          {emailBigqueryIcon}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex flex-col space-y-4 items-center">
                                      <div className="flex flex-col">
                                        <p className="text-sm font-normal text-white/40">
                                          Private Key:
                                        </p>
                                      </div>

                                      <div className="relative flex items-center space-x-2">
                                        {keyBigqueryInputType === "text" && (
                                          <textarea
                                            type={keyBigqueryInputType}
                                            className="w-full px-4 py-3 pr-10 overflow-y-auto text-sm text-white border rounded-md outline-none resize-none h-36 border-border bg-[#181A1C] placeholder:text-white/40 recent__bar"
                                            placeholder="Provide the Base64-encoded key for authentication with BigQuery"
                                            {...register(
                                              "db_connection.key_base64.private_key",
                                              {
                                                required: true,
                                              }
                                            )}
                                            disabled={showConnection}
                                          />
                                        )}

                                        {keyBigqueryInputType ===
                                          "password" && (
                                          <input
                                            type="text"
                                            className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                            placeholder="Check your KeyBase64"
                                            disabled={true}
                                          />
                                        )}

                                        {keyBigqueryInputType === "text" && (
                                          <span
                                            className="absolute transform cursor-pointer right-2 top-4"
                                            onClick={
                                              toggleKeyBigqueryVisibility
                                            }
                                          >
                                            {keyBigqueryIcon}
                                          </span>
                                        )}

                                        {keyBigqueryInputType ===
                                          "password" && (
                                          <span
                                            className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                            onClick={
                                              toggleKeyBigqueryVisibility
                                            }
                                          >
                                            {keyBigqueryIcon}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {database === "postgres" && (
                              <div className="flex flex-col space-y-4">
                                <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      User *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={userInputType}
                                      className="w-full px-4 py-3 text-sm pr-10 text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your PostgreSQL username"
                                      {...register("db_connection.user", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleUserVisibility}
                                    >
                                      {userIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Password *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={passwordInputType}
                                      className="w-full px-4 py-3 text-sm text-white pr-10 border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your PostgreSQL password"
                                      {...register("db_connection.password", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />
                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={togglePasswordVisibility}
                                    >
                                      {passwordIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Host *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={hostInputType}
                                      className="w-full px-4 py-3 text-sm pr-10 text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Provide the host address for your PostgreSQL database"
                                      {...register("db_connection.host", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleHostVisibility}
                                    >
                                      {hostIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Port *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={portInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter the port number for your PostgreSQL database"
                                      {...register("db_connection.port", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={togglePortVisibility}
                                    >
                                      {portIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Database Name *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={databaseInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Provide the name of the PostgreSQL database"
                                      {...register("db_connection.database", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleDatabaseVisibility}
                                    >
                                      {databaseIcon}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {database === "mariadb" && (
                              <div className="flex flex-col space-y-4">
                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      User *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={userMariadbInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your MariaDB username"
                                      {...register("db_connection.user", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleUserMariadbVisibility}
                                    >
                                      {userMariadbIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Password *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={passwordMariadbInputType}
                                      className="w-full px-4 p-10 py-3 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your MariaDB password"
                                      {...register("db_connection.password", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={togglePasswordMariadbVisibility}
                                    >
                                      {passwordMariadbIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Host *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={hostMariadbInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Provide the host address for your MariaDB database"
                                      {...register("db_connection.host", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleHostMariadbVisibility}
                                    >
                                      {hostMariadbIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Port *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={portMariadbInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter the port number for your MariaDB database"
                                      {...register("db_connection.port", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={togglePortMariadbVisibility}
                                    >
                                      {portMariadbIcon}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {database === "snowflake" && (
                              <div className="flex flex-col space-y-4">
                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      User *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={userSnowflakeInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your Snowflake username"
                                      {...register("db_connection.user", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleUserSnowflakeVisibility}
                                    >
                                      {userSnowflakeIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Password *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={passwordSnowflakeInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your Snowflake password"
                                      {...register("db_connection.password", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={
                                        togglePasswordSnowflakeVisibility
                                      }
                                    >
                                      {passwordSnowflakeIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Account *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={accountSnowflakeInputType}
                                      className="w-full px-4 pr-10 py-3 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Provide the Snowflake account name"
                                      {...register("db_connection.account", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleAccountSnowflakeVisibility}
                                    >
                                      {accountSnowflakeIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Warehouse *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={warehouseSnowflakeInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter the Snowflake warehouse name"
                                      {...register("db_connection.warehouse", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={
                                        toggleWarehouseSnowflakeVisibility
                                      }
                                    >
                                      {warehouseSnowflakeIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Database Collection *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={databaseSnowflakeInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Specify the name of the Snowflake database you want to connect to"
                                      {...register(
                                        "db_connection.database_collection",
                                        {
                                          required: true,
                                        }
                                      )}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={
                                        toggleDatabaseSnowflakeVisibility
                                      }
                                    >
                                      {databaseSnowflakeIcon}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {database === "mysql" && (
                              <div className="flex flex-col space-y-4">
                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      User *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={userMysqlInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your MySQL username"
                                      {...register("db_connection.user", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleUserMysqlVisibility}
                                    >
                                      {userMysqlIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Password *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={passwordMysqlInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your MySQL password"
                                      {...register("db_connection.password", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={togglePasswordMysqlVisibility}
                                    >
                                      {passwordMysqlIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Host *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={hostMysqlInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Provide the host address for your MySQL database"
                                      {...register("db_connection.host", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleHostMysqlVisibility}
                                    >
                                      {hostMysqlIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Port *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={portMysqlInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your MySQL port"
                                      {...register("db_connection.port", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={togglePortMysqlVisibility}
                                    >
                                      {portMysqlIcon}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {database === "athena" && (
                              <div className="flex flex-col space-y-4">
                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      AWS Access Key *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={accessKeyAthenaInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your AWS access key"
                                      {...register(
                                        "db_connection.aws_access_key",
                                        {
                                          required: true,
                                        }
                                      )}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleAccessKeyAthenaVisibility}
                                    >
                                      {accessKeyAthenaIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      AWS Secret Key *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={secretKeyAthenaInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your AWS secret key"
                                      {...register(
                                        "db_connection.aws_secret_key",
                                        {
                                          required: true,
                                        }
                                      )}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleSecretKeyAthenaVisibility}
                                    >
                                      {secretKeyAthenaIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Region *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={regionAthenaInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Specify the AWS region for your Amazon Athena"
                                      {...register("db_connection.region", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleRegionAthenaVisibility}
                                    >
                                      {regionAthenaIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      S3 Output Location *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={locationAthenaInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Provide the S3 output location for your Amazon Athena"
                                      {...register(
                                        "db_connection.s3_output_location",
                                        {
                                          required: true,
                                        }
                                      )}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleLocationAthenaVisibility}
                                    >
                                      {locationAthenaIcon}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {database === "databricks" && (
                              <div className="flex flex-col space-y-4">
                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Server Hostname *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={hostnameDatabricksInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your Server hostname for Databricks"
                                      {...register(
                                        "db_connection.server_hostname",
                                        {
                                          required: true,
                                        }
                                      )}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={
                                        toggleHostnameDatabricksVisibility
                                      }
                                    >
                                      {hostnameDatabricksIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      HTTP Path *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={httpDatabricksInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Specify the HTTP path for Databricks"
                                      {...register("db_connection.http_path", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleHttpDatabricksVisibility}
                                    >
                                      {httpDatabricksIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Access Token *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={tokenDatabricksInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Provide the access token for Databricks authentication"
                                      {...register(
                                        "db_connection.access_token",
                                        {
                                          required: true,
                                        }
                                      )}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleTokenDatabricksVisibility}
                                    >
                                      {tokenDatabricksIcon}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {database === "redshift" && (
                              <div className="flex flex-col space-y-4">
                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      User *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={userRedshiftInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your Redshift username"
                                      {...register("db_connection.user", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleUserRedshiftVisibility}
                                    >
                                      {userRedshiftIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Password *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={passwordRedshiftInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter your Redshift password"
                                      {...register("db_connection.password", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={togglePasswordRedshiftVisibility}
                                    >
                                      {passwordRedshiftIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Host *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={hostRedshiftInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Provide the host address for your Redshift database"
                                      {...register("db_connection.host", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleHostRedshiftVisibility}
                                    >
                                      {hostRedshiftIcon}
                                    </span>
                                  </div>
                                </div>

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Port *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={portRedshiftInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Enter the port number for your Redshift database"
                                      {...register("db_connection.port", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={togglePortRedshiftVisibility}
                                    >
                                      {portRedshiftIcon}
                                    </span>
                                  </div>
                                </div>

                              {/* <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      DB Schema *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={schemaRedshiftInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Specify the Redshift database schema you want to use"
                                      {...register("db_connection.db_schema", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleSchemaRedshiftVisibility}
                                    >
                                      {schemaRedshiftIcon}
                                    </span>
                                  </div>
                                </div> */}

                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white">
                                      Database *
                                    </p>
                                  </div>

                                  <div className="relative flex items-center space-x-2">
                                    <input
                                      type={databaseRedshiftInputType}
                                      className="w-full px-4 py-3 pr-10 text-sm text-white border rounded-md outline-none border-border bg-[#181A1C] placeholder:text-white/40"
                                      placeholder="Specify the name of the MariaDB database you want to connect to"
                                      {...register("db_connection.database", {
                                        required: true,
                                      })}
                                      disabled={showConnection}
                                    />

                                    <span
                                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                      onClick={toggleDatabaseRedshiftVisibility}
                                    >
                                      {databaseRedshiftIcon}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {database === "spreadsheet" && (
                              <div className="flex flex-col space-y-4">
                              <div className="flex flex-col space-y-4 items-center">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-normal text-white/50">
                                      Uploaded File
                                    </p>
                                  </div>

                                  <div className="relative flex items-center text-sm font-normal text-white/50 px-4 py-2 justify-between space-x-2 border rounded-md border-border bg-[#181A1C]">
                                    <p>{dbConnection.file_name || ""}</p>

                                    <div className="flex items-center space-x-3 text-xs">
                                      <a
                                        className="flex items-center space-x-2 cursor-pointer group text-white/50 hover:text-white"
                                        onClick={handleDownloadSpreadsheet}
                                      >
                                        <span className="flex items-center justify-center">
                                          <svg
                                            viewBox="0 0 12 12"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-3 h-3 fill-white/50 group-hover:fill-white"
                                          >
                                            <path d="M6.00033 8.66406L2.66699 5.33073L3.60033 4.36406L5.33366 6.0974V0.664062H6.66699V6.0974L8.40033 4.36406L9.33366 5.33073L6.00033 8.66406ZM2.00033 11.3307C1.63366 11.3307 1.31977 11.2002 1.05866 10.9391C0.797548 10.678 0.666992 10.3641 0.666992 9.9974V7.9974H2.00033V9.9974H10.0003V7.9974H11.3337V9.9974C11.3337 10.3641 11.2031 10.678 10.942 10.9391C10.6809 11.2002 10.367 11.3307 10.0003 11.3307H2.00033Z" />
                                          </svg>
                                        </span>

                                        <span>Download File</span>
                                      </a>

                                      {showConnection || (
                                        <>
                                          <button
                                            type="button"
                                            className="flex items-center space-x-2 text-white/50 hover:text-white group"
                                            onClick={() =>
                                              fileInputRef.current.click()
                                            }
                                            disabled={selectedFile}
                                          >
                                            {isLoadingSpreadsheet || (
                                              <span className="flex items-center justify-center">
                                                <svg
                                                  viewBox="0 0 12 15"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="w-3 h-3 fill-white/50 group-hover:fill-white"
                                                >
                                                  <path d="M6 14.6641C5.16667 14.6641 4.38611 14.5057 3.65833 14.1891C2.93056 13.8724 2.29722 13.4446 1.75833 12.9057C1.21944 12.3668 0.791667 11.7335 0.475 11.0057C0.158333 10.278 0 9.4974 0 8.66406H1.33333C1.33333 9.96406 1.78611 11.0668 2.69167 11.9724C3.59722 12.878 4.7 13.3307 6 13.3307C7.3 13.3307 8.40278 12.878 9.30833 11.9724C10.2139 11.0668 10.6667 9.96406 10.6667 8.66406C10.6667 7.36406 10.2139 6.26128 9.30833 5.35573C8.40278 4.45017 7.3 3.9974 6 3.9974H5.9L6.93333 5.03073L6 5.9974L3.33333 3.33073L6 0.664062L6.93333 1.63073L5.9 2.66406H6C6.83333 2.66406 7.61389 2.8224 8.34167 3.13906C9.06944 3.45573 9.70278 3.88351 10.2417 4.4224C10.7806 4.96129 11.2083 5.59462 11.525 6.3224C11.8417 7.05017 12 7.83073 12 8.66406C12 9.4974 11.8417 10.278 11.525 11.0057C11.2083 11.7335 10.7806 12.3668 10.2417 12.9057C9.70278 13.4446 9.06944 13.8724 8.34167 14.1891C7.61389 14.5057 6.83333 14.6641 6 14.6641Z" />
                                                </svg>
                                              </span>
                                            )}

                                            {isLoadingSpreadsheet && (
                                              <div role="status">
                                                <svg
                                                  aria-hidden="true"
                                                  className="w-3 h-3 animate-spin text-white fill-[#295EF4]"
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
                                            )}

                                            <span>Change File</span>
                                          </button>

                                          <input
                                            type="file"
                                            accept=".csv, .xls, .xlsx"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            style={{ display: "none" }}
                                          />
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          {dbConnection?.db_type === "llmate_sample_bigquery" && (
            <div className="h-[300px] w-full rounded-md bg-[#1E2022] flex flex-col space-y-3 items-center justify-center">
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 28 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                >
                  <path
                    d="M3.99984 35.1641C3.08317 35.1641 2.29845 34.8377 1.64567 34.1849C0.992893 33.5321 0.666504 32.7474 0.666504 31.8307V15.1641C0.666504 14.2474 0.992893 13.4627 1.64567 12.8099C2.29845 12.1571 3.08317 11.8307 3.99984 11.8307H5.6665V8.4974C5.6665 6.19184 6.479 4.22656 8.104 2.60156C9.729 0.976562 11.6943 0.164062 13.9998 0.164062C16.3054 0.164062 18.2707 0.976562 19.8957 2.60156C21.5207 4.22656 22.3332 6.19184 22.3332 8.4974V11.8307H23.9998C24.9165 11.8307 25.7012 12.1571 26.354 12.8099C27.0068 13.4627 27.3332 14.2474 27.3332 15.1641V31.8307C27.3332 32.7474 27.0068 33.5321 26.354 34.1849C25.7012 34.8377 24.9165 35.1641 23.9998 35.1641H3.99984ZM3.99984 31.8307H23.9998V15.1641H3.99984V31.8307ZM13.9998 26.8307C14.9165 26.8307 15.7012 26.5043 16.354 25.8516C17.0068 25.1988 17.3332 24.4141 17.3332 23.4974C17.3332 22.5807 17.0068 21.796 16.354 21.1432C15.7012 20.4905 14.9165 20.1641 13.9998 20.1641C13.0832 20.1641 12.2984 20.4905 11.6457 21.1432C10.9929 21.796 10.6665 22.5807 10.6665 23.4974C10.6665 24.4141 10.9929 25.1988 11.6457 25.8516C12.2984 26.5043 13.0832 26.8307 13.9998 26.8307ZM8.99984 11.8307H18.9998V8.4974C18.9998 7.10851 18.5137 5.92795 17.5415 4.95573C16.5693 3.98351 15.3887 3.4974 13.9998 3.4974C12.6109 3.4974 11.4304 3.98351 10.4582 4.95573C9.48595 5.92795 8.99984 7.10851 8.99984 8.4974V11.8307Z"
                    fill="#5F6368"
                  />
                </svg>
              </span>

              <p className="text-sm font-medium text-white">
                Database Credentials
              </p>

              <p className="px-6 text-sm font-normal text-center text-white/50">
                This is a demo datasource created by our team. Connection
                credentials are not displayed for security reasons.
              </p>
            </div>
          )}

          {errorDbConnection && (
            <div className="h-[300px] w-full rounded-md bg-[#1E2022] flex flex-col space-y-3 items-center justify-center">
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 28 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                >
                  <path
                    d="M3.99984 35.1641C3.08317 35.1641 2.29845 34.8377 1.64567 34.1849C0.992893 33.5321 0.666504 32.7474 0.666504 31.8307V15.1641C0.666504 14.2474 0.992893 13.4627 1.64567 12.8099C2.29845 12.1571 3.08317 11.8307 3.99984 11.8307H5.6665V8.4974C5.6665 6.19184 6.479 4.22656 8.104 2.60156C9.729 0.976562 11.6943 0.164062 13.9998 0.164062C16.3054 0.164062 18.2707 0.976562 19.8957 2.60156C21.5207 4.22656 22.3332 6.19184 22.3332 8.4974V11.8307H23.9998C24.9165 11.8307 25.7012 12.1571 26.354 12.8099C27.0068 13.4627 27.3332 14.2474 27.3332 15.1641V31.8307C27.3332 32.7474 27.0068 33.5321 26.354 34.1849C25.7012 34.8377 24.9165 35.1641 23.9998 35.1641H3.99984ZM3.99984 31.8307H23.9998V15.1641H3.99984V31.8307ZM13.9998 26.8307C14.9165 26.8307 15.7012 26.5043 16.354 25.8516C17.0068 25.1988 17.3332 24.4141 17.3332 23.4974C17.3332 22.5807 17.0068 21.796 16.354 21.1432C15.7012 20.4905 14.9165 20.1641 13.9998 20.1641C13.0832 20.1641 12.2984 20.4905 11.6457 21.1432C10.9929 21.796 10.6665 22.5807 10.6665 23.4974C10.6665 24.4141 10.9929 25.1988 11.6457 25.8516C12.2984 26.5043 13.0832 26.8307 13.9998 26.8307ZM8.99984 11.8307H18.9998V8.4974C18.9998 7.10851 18.5137 5.92795 17.5415 4.95573C16.5693 3.98351 15.3887 3.4974 13.9998 3.4974C12.6109 3.4974 11.4304 3.98351 10.4582 4.95573C9.48595 5.92795 8.99984 7.10851 8.99984 8.4974V11.8307Z"
                    fill="#5F6368"
                  />
                </svg>
              </span>

              <p className="text-sm font-medium text-white">
                Database Credentials
              </p>

              <p className="px-6 text-sm font-normal text-center text-white/50">
                You are not authorized to access this datasource
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col col-span-12 px-4 py-4 space-y-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 18 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                >
                  <path
                    d="M2.16667 15.6641C1.70833 15.6641 1.31597 15.5009 0.989583 15.1745C0.663194 14.8481 0.5 14.4557 0.5 13.9974V2.33073C0.5 1.8724 0.663194 1.48003 0.989583 1.15365C1.31597 0.827257 1.70833 0.664062 2.16667 0.664062H13.8333C14.2917 0.664062 14.684 0.827257 15.0104 1.15365C15.3368 1.48003 15.5 1.8724 15.5 2.33073V8.2474C15.3611 8.21962 15.2257 8.19878 15.0938 8.1849C14.9618 8.17101 14.8194 8.16406 14.6667 8.16406H13.8333V2.33073H2.16667V13.9974H4.75C4.80556 14.303 4.87847 14.5946 4.96875 14.8724C5.05903 15.1502 5.18056 15.4141 5.33333 15.6641H2.16667ZM2.16667 13.1641V13.9974V2.33073V13.1641ZM3.83333 12.3307H4.75C4.86111 11.6502 5.10417 11.0217 5.47917 10.4453C5.85417 9.86892 6.33333 9.38628 6.91667 8.9974H3.83333V12.3307ZM3.83333 7.33073H7.16667V3.9974H3.83333V7.33073ZM9.66667 16.4974C8.75 16.4974 7.96528 16.171 7.3125 15.5182C6.65972 14.8655 6.33333 14.0807 6.33333 13.1641C6.33333 12.2474 6.65972 11.4627 7.3125 10.8099C7.96528 10.1571 8.75 9.83073 9.66667 9.83073H11.3333V11.4974H9.66667C9.20833 11.4974 8.81597 11.6606 8.48958 11.987C8.16319 12.3134 8 12.7057 8 13.1641C8 13.6224 8.16319 14.0148 8.48958 14.3411C8.81597 14.6675 9.20833 14.8307 9.66667 14.8307H11.3333V16.4974H9.66667ZM8.83333 7.33073H12.1667V3.9974H8.83333V7.33073ZM9.66667 13.9974V12.3307H14.6667V13.9974H9.66667ZM13 16.4974V14.8307H14.6667C15.125 14.8307 15.5174 14.6675 15.8438 14.3411C16.1701 14.0148 16.3333 13.6224 16.3333 13.1641C16.3333 12.7057 16.1701 12.3134 15.8438 11.987C15.5174 11.6606 15.125 11.4974 14.6667 11.4974H13V9.83073H14.6667C15.5833 9.83073 16.3681 10.1536 17.0208 10.7995C17.6736 11.4453 18 12.2335 18 13.1641C18 14.0807 17.6736 14.8655 17.0208 15.5182C16.3681 16.171 15.5833 16.4974 14.6667 16.4974H13Z"
                    fill="#5F6368"
                  />
                </svg>
              </span>
              <p className="text-xs font-medium text-white">
                SELECTED DATASOURCE, TABLE & COLUMN CONFIGURATION
              </p>
            </div>

            {isPublished || (
              <div className="flex items-center">
                <Link
                  href={`/datasource/details/${data._id}/update-table`}
                  className="flex items-center justify-center space-x-2 text-xs font-medium tracking-wide cursor-pointer text-secondary hover:text-white"
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
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                      />
                    </svg>
                  </span>
                  <span>Edit</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col p-2 space-y-4 border rounded-md sm:p-4 border-border">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-4">
                <p className="text-xs font-normal tracking-wider text-white/50">
                  Selected Datasource
                </p>

                <div className="px-4 py-3 rounded-md bg-[#181A1C] flex items-center space-x-2 border border-[#242424] text-white text-xs tracking-wide">
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                    >
                      <path
                        d="M8 15.5C5.90278 15.5 4.12847 15.1771 2.67708 14.5312C1.22569 13.8854 0.5 13.0972 0.5 12.1667V3.83333C0.5 2.91667 1.23264 2.13194 2.69792 1.47917C4.16319 0.826389 5.93056 0.5 8 0.5C10.0694 0.5 11.8368 0.826389 13.3021 1.47917C14.7674 2.13194 15.5 2.91667 15.5 3.83333V12.1667C15.5 13.0972 14.7743 13.8854 13.3229 14.5312C11.8715 15.1771 10.0972 15.5 8 15.5ZM8 5.52083C9.23611 5.52083 10.4792 5.34375 11.7292 4.98958C12.9792 4.63542 13.6806 4.25694 13.8333 3.85417C13.6806 3.45139 12.9826 3.06944 11.7396 2.70833C10.4965 2.34722 9.25 2.16667 8 2.16667C6.73611 2.16667 5.49653 2.34375 4.28125 2.69792C3.06597 3.05208 2.36111 3.4375 2.16667 3.85417C2.36111 4.27083 3.06597 4.65278 4.28125 5C5.49653 5.34722 6.73611 5.52083 8 5.52083ZM8 9.66667C8.58333 9.66667 9.14583 9.63889 9.6875 9.58333C10.2292 9.52778 10.7465 9.44792 11.2396 9.34375C11.7326 9.23958 12.1979 9.11111 12.6354 8.95833C13.0729 8.80556 13.4722 8.63194 13.8333 8.4375V5.9375C13.4722 6.13194 13.0729 6.30556 12.6354 6.45833C12.1979 6.61111 11.7326 6.73958 11.2396 6.84375C10.7465 6.94792 10.2292 7.02778 9.6875 7.08333C9.14583 7.13889 8.58333 7.16667 8 7.16667C7.41667 7.16667 6.84722 7.13889 6.29167 7.08333C5.73611 7.02778 5.21181 6.94792 4.71875 6.84375C4.22569 6.73958 3.76389 6.61111 3.33333 6.45833C2.90278 6.30556 2.51389 6.13194 2.16667 5.9375V8.4375C2.51389 8.63194 2.90278 8.80556 3.33333 8.95833C3.76389 9.11111 4.22569 9.23958 4.71875 9.34375C5.21181 9.44792 5.73611 9.52778 6.29167 9.58333C6.84722 9.63889 7.41667 9.66667 8 9.66667ZM8 13.8333C8.63889 13.8333 9.28819 13.7847 9.94792 13.6875C10.6076 13.5903 11.2153 13.4618 11.7708 13.3021C12.3264 13.1424 12.7917 12.9618 13.1667 12.7604C13.5417 12.559 13.7639 12.3542 13.8333 12.1458V10.1042C13.4722 10.2986 13.0729 10.4722 12.6354 10.625C12.1979 10.7778 11.7326 10.9062 11.2396 11.0104C10.7465 11.1146 10.2292 11.1944 9.6875 11.25C9.14583 11.3056 8.58333 11.3333 8 11.3333C7.41667 11.3333 6.84722 11.3056 6.29167 11.25C5.73611 11.1944 5.21181 11.1146 4.71875 11.0104C4.22569 10.9062 3.76389 10.7778 3.33333 10.625C2.90278 10.4722 2.51389 10.2986 2.16667 10.1042V12.1667C2.23611 12.375 2.45486 12.5764 2.82292 12.7708C3.19097 12.9653 3.65278 13.1424 4.20833 13.3021C4.76389 13.4618 5.375 13.5903 6.04167 13.6875C6.70833 13.7847 7.36111 13.8333 8 13.8333Z"
                        fill="#5F6368"
                      />
                    </svg>
                  </span>

                  <span>{data.ds_config.database}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <p className="text-xs font-normal tracking-wider text-white/50">
                  Lists of available tables from the selected datasource
                </p>

                {data?.ds_config?.tables?.map((table, index) => {
                  return (
                    <DetailsTableDropdwn
                      data={table}
                      key={index}
                      selectedColumns={selectedColumns[table.name] || []}
                      datasourceId={data._id}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={editConfirm}
        setShow={setEditConfirm}
        heading="Confirm Edit"
        title={"Are you sure you want to save your changes?"}
        description={""}
        primaryBtn="Yes, Confirm"
        primaryChange={handleConfirmEdit}
        secondaryBtn="No"
        secondaryChange={() => setEditConfirm(false)}
      />

      <SuccessModal
        show={showSuccessModal}
        setShow={setShowSuccessModal}
        heading="Datasource Updated Successfully"
        title={getValues("name")}
        description={getValues("about")}
        primaryBtn="Query"
        primaryChange={handlePrimary}
        secondaryBtn="View"
        secondaryChange={handleSecondary}
      />

      <SuccessModal
        show={showFileUpdate}
        setShow={setShowFileUpdate}
        heading="Success Confirmation"
        title=""
        description="File Successfully Updated"
        primaryBtn="Close"
        primaryChange={() => {
          setShowFileUpdate(false);
          setShowConnection(false);
        }}
      />

      {showUploadedError && (
        <ErrorModal
          show={showUploadedError}
          setShow={setShowUploadedError}
          heading="Error Found"
          title=""
          description={response?.error?.data?.message}
          primaryBtn="Close"
          primaryChange={() => setShowUploadedError(false)}
        />
      )}
    </>
  );
};

export default SQLDatasourceDetails;
