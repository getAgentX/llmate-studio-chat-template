import React, { useEffect, useState } from "react";
import DatasourceSidebar from "./DatasourceSidebar";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useDeleteDatasourceMutation,
  useGetDatasourceInfoQuery,
} from "@/store/datasource";
import CreateDatasourceModal from "../Datasource/CreateDatasourceModal";
import Split from "react-split";
import { useSelector } from "react-redux";
import { currentOrganizationSelector } from "@/store/current_organization";
import usePublished from "@/hooks/usePublished";
import SuccessModal from "../Modal/SuccessModal";
import LoaderConfirmModal from "../Modal/LoaderConfirmModal";
import { DatasourceIcon } from "../Icons/icon";
import { Db_type, getDbTypeDetails } from "../home/DatasourcesTable";

const structuredTabsList = [
  {
    name: "Information",
    slug: "/",
    key: "information",
  },
  {
    name: "Table & Schema",
    slug: "/update-table",
    key: "tables",
  },
  {
    name: "Joins",
    slug: "/joins",
    key: "joins",
  },
  {
    name: "LLM Settings",
    slug: "/advanced-settings",
    key: "advanced-settings",
  },
  {
    name: "Manage Examples",
    slug: "/manage-examples",
    key: "manage-examples",
  },
  {
    name: "Logs",
    slug: "/run-logs",
    key: "run-logs",
  },
  {
    name: "Suggested Questions",
    slug: "/suggested-questions",
    key: "questions",
  },
];

const semiStructuredTabsList = [
  {
    name: "Information",
    slug: "/",
    key: "information",
  },
  {
    name: "Setup",
    slug: "/configuration",
    key: "configuration",
  },
];

const thirdPartyList = [
  {
    name: "Information",
    slug: "/",
    key: "information",
  },
  {
    name: "Table & Schema",
    slug: "/third-party-table",
    key: "tables",
  },
  {
    name: "Joins",
    slug: "/third-party-joins",
    key: "joins",
  },
  {
    name: "LLM Settings",
    slug: "/third-party-advanced-settings",
    key: "advanced-settings",
  },
  {
    name: "Manage Examples",
    slug: "/third-party-examples",
    key: "manage-examples",
  },
  {
    name: "Logs",
    slug: "/third-party-run-logs",
    key: "run-logs",
  },
  {
    name: "Suggested Questions",
    slug: "/suggested-questions",
    key: "questions",
  },
];

const DatasourceLayout = ({
  children,
  activeTab,
  extraChild = null,
  currentDatasource = "structured",
}) => {
  const [slug, setSlug] = useState(null);
  const [showCreateDatasource, setShowCreateDatasource] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showSuccessDelete, setShowSuccessDelete] = useState(false);
  const [isCollapse, setIsCollapse] = useState(false);
  const [showDatasourceDeleteSuccess, setShowDatasourceDeleteSuccess] =
    useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (router?.query?.slug) {
      setSlug(router.query.slug);
    }
  }, [router?.query?.slug]);

  const [
    deleteDatasource,
    { error: deleteDatasourceError, isLoading: deleteLoading },
  ] = useDeleteDatasourceMutation();

  const {
    data: getRes,
    isLoading,
    error: getError,
    refetch,
  } = useGetDatasourceInfoQuery(
    {
      datasource_id: router.query.slug,
    },
    {
      skip: !router.query.slug,
    }
  );

  useEffect(() => {
    if (
      getRes?.ds_config.airbyte_status === "pending" ||
      getRes?.ds_config.transformation_status === "pending"
    ) {
      setCurrentStatus("syncing");
    } else if (
      getRes?.ds_config.airbyte_status === "failed" ||
      getRes?.ds_config.transformation_status === "failed"
    ) {
      setCurrentStatus("failed");
    } else if (
      getRes?.ds_config.airbyte_status === "success" &&
      getRes?.ds_config.transformation_status === "success"
    ) {
      setCurrentStatus("synced");
    } else {
      setCurrentStatus("syncing");
    }
  }, [getRes]);

  const currentOrg = useSelector(currentOrganizationSelector);
  const isPublished = usePublished(
    currentOrg,
    getRes?.organization_id,
    getRes?.is_published
  );

  const tempTabsList =
    currentDatasource === "structured"
      ? structuredTabsList
      : currentDatasource === "semi_structured"
      ? semiStructuredTabsList
      : thirdPartyList;

  const tabsList = isPublished
    ? tempTabsList.filter((tab) => tab.key !== "questions")
    : tempTabsList;

  const handleDeleteDatasource = () => {
    deleteDatasource({
      datasource_id: router.query.slug,
    }).then((response) => {
      if (response.data == null) {
        setConfirmDelete(false);
        setShowDatasourceDeleteSuccess(true);
      }

      if (response.error) {
        console.log("error", response.error);
        setConfirmDelete(false);
        setShowDatasourceDeleteSuccess(false);
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const options = {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const formattedDate = date.toLocaleString("en-US", options);

    return formattedDate;
  };

  const formatDateToLocal = (dateString) => {
    const date = new Date(dateString);

    const structured = new Date(
      date.getTime() - date.getTimezoneOffset() * 60 * 1000
    );

    const formattedDateString = formatDate(structured.toString());

    return formattedDateString;
  };

  const localTimeString = formatDateToLocal(
    getRes?.ds_config?.last_airbyte_synced_at
  );

  return (
    <div className="flex w-full h-screen overflow-hidden font-roboto">
      <Split
        className="split_row"
        direction="horizontal"
        minSize={100}
        gutterSize={2}
        cursor="e-resize"
        // sizes={[20, 80]}
        sizes={[isCollapse ? "48px" : 20, isCollapse ? 96.5 : 80]}
      >
        <div className="w-full h-full max-h-full">
          <DatasourceSidebar
            setShowCreateDatasource={setShowCreateDatasource}
            isCollapse={isCollapse}
            setIsCollapse={setIsCollapse}
          />
        </div>

        <div className="w-full h-full max-h-full">
          <div className="relative flex flex-col w-full h-full overflow-y-auto recent__bar">
            <div className="sticky top-0 left-0 z-50 flex flex-col w-full bg-page">
              <div className="flex items-center justify-between h-12 px-4 border-b border-border-color">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center">
                    {(() => {
                      const config = getRes?.ds_config;
                      let typeKey;

                      if (config?.ds_type === "third_party") {
                        typeKey =
                          config?.connector_type || config?.connector?.connector_type;
                      } else if (config?.ds_type === "sql_generator") {
                        typeKey = config?.db_connection?.db_type;
                      } else if (config?.ds_type === "semi_structured") {
                        typeKey = config?.ds_type;
                      }

                      const { img, label } = getDbTypeDetails(typeKey, Db_type);

                      return img ? (
                        <img src={img} alt={label || "Icon"} className="w-4 h-4" />
                      ) : (
                        <DatasourceIcon />
                      )
                    })()}
                  </span>

                  <div className="flex items-center space-x-2">
                    <p className="text-base font-normal capitalize text-primary-text max-w-60 leading-none text-ellipsis overflow-hidden whitespace-nowrap">
                      {getRes?.name || ""}
                    </p>

                    {getRes?.ds_config?.ds_type === "sql_generator" && (
                      <div className="text-[11px] font-medium flex items-center justify-center space-x-2 text-[#49B1C5] w-fit">
                        <span>Structured</span>
                      </div>
                    )}

                    {getRes?.ds_config?.ds_type === "semi_structured" && (
                      <div className="text-[11px] font-medium flex items-center justify-center space-x-2 text-[#D980EC] w-fit">
                        <span>Semi-Structured</span>
                      </div>
                    )}

                    {getRes?.ds_config?.ds_type === "third_party" && (
                      <div className="text-[11px] font-medium flex items-center justify-center space-x-2 text-[#C56A49] w-fit">
                        <span>Third-Party</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {currentDatasource === "third_party" && (
                    <div className="flex items-center space-x-2">
                      {/* {currentStatus === "synced" && (
                          <span className="py-1 px-3 rounded-full border border-[#1BC655] text-xs text-[#1BC655] flex justify-center items-center">
                            Synced
                          </span>
                        )} */}

                      {/* {currentStatus === "syncing" && (
                          <span className="flex items-center justify-center px-3 py-1 text-xs text-yellow-600 border border-yellow-600 rounded-full">
                            syncing
                          </span>
                        )} */}

                      {getRes?.ds_config?.last_transformation_synced_at ===
                        null && (
                        <span className="flex items-center justify-center px-3 py-1 text-xs text-yellow-600 border border-yellow-600 rounded-full">
                          syncing
                        </span>
                      )}

                      {/* {currentStatus === "failed" && (
                          <span className="flex items-center justify-center px-3 py-1 text-xs text-red-600 border border-red-600 rounded-full">
                            Sync Failed
                          </span>
                        )} */}

                      {getRes?.ds_config?.last_airbyte_synced_at && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              className="flex items-center space-x-2"
                            >
                              {/* <span className="flex items-center justify-center">
                              <svg
                                viewBox="0 0 11 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-3 h-3 fill-icon-color"
                              >
                                <path d="M0 11.3327V9.99935H1.83333L1.56667 9.76602C0.988889 9.2549 0.583333 8.67157 0.35 8.01602C0.116667 7.36046 0 6.69935 0 6.03268C0 4.79935 0.369444 3.70213 1.10833 2.74102C1.84722 1.7799 2.81111 1.14379 4 0.832682V2.23268C3.2 2.52157 2.55556 3.01324 2.06667 3.70768C1.57778 4.40213 1.33333 5.17713 1.33333 6.03268C1.33333 6.53268 1.42778 7.01879 1.61667 7.49102C1.80556 7.96324 2.1 8.39935 2.5 8.79935L2.66667 8.96602V7.33268H4V11.3327H0ZM6.66667 11.166V9.76602C7.46667 9.47713 8.11111 8.98546 8.6 8.29102C9.08889 7.59657 9.33333 6.82157 9.33333 5.96602C9.33333 5.46602 9.23889 4.9799 9.05 4.50768C8.86111 4.03546 8.56667 3.59935 8.16667 3.19935L8 3.03268V4.66602H6.66667V0.666016H10.6667V1.99935H8.83333L9.1 2.23268C9.64445 2.77713 10.0417 3.36879 10.2917 4.00768C10.5417 4.64657 10.6667 5.29935 10.6667 5.96602C10.6667 7.19935 10.2972 8.29657 9.55833 9.25768C8.81944 10.2188 7.85556 10.8549 6.66667 11.166Z" />
                              </svg>
                            </span> */}

                              <span className="text-xs font-medium text-secondary-text">
                                Last sync :
                              </span>
                            </button>

                            <span className="text-xs font-medium text-primary-text">
                              {localTimeString || ""}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentDatasource === "structured" && (
                    <Link
                      href={`/datasource/details/${slug}/query`}
                      className="flex items-center justify-center h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary"
                    >
                      <span className="flex items-center justify-center">
                        <svg
                          viewBox="0 0 16 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 fill-btn-primary-icon"
                        >
                          <path d="M1.75033 11.1168L0.666992 10.3335L4.00033 5.00016L6.00033 7.3335L8.66699 3.00016L10.4837 5.71683C10.2281 5.72794 9.98644 5.7585 9.75866 5.8085C9.53088 5.8585 9.30588 5.92794 9.08366 6.01683L8.71699 5.46683L6.18366 9.5835L4.16699 7.2335L1.75033 11.1168ZM14.3837 14.3335L12.3003 12.2502C12.0781 12.4057 11.8309 12.5224 11.5587 12.6002C11.2864 12.6779 11.0059 12.7168 10.717 12.7168C9.88366 12.7168 9.17533 12.4252 8.59199 11.8418C8.00866 11.2585 7.71699 10.5502 7.71699 9.71683C7.71699 8.8835 8.00866 8.17516 8.59199 7.59183C9.17533 7.0085 9.88366 6.71683 10.717 6.71683C11.5503 6.71683 12.2587 7.0085 12.842 7.59183C13.4253 8.17516 13.717 8.8835 13.717 9.71683C13.717 10.0057 13.6781 10.2863 13.6003 10.5585C13.5225 10.8307 13.4059 11.0835 13.2503 11.3168L15.3337 13.3835L14.3837 14.3335ZM10.717 11.3835C11.1837 11.3835 11.5781 11.2224 11.9003 10.9002C12.2225 10.5779 12.3837 10.1835 12.3837 9.71683C12.3837 9.25016 12.2225 8.85572 11.9003 8.5335C11.5781 8.21127 11.1837 8.05016 10.717 8.05016C10.2503 8.05016 9.85588 8.21127 9.53366 8.5335C9.21144 8.85572 9.05033 9.25016 9.05033 9.71683C9.05033 10.1835 9.21144 10.5779 9.53366 10.9002C9.85588 11.2224 10.2503 11.3835 10.717 11.3835ZM12.2003 6.05016C11.9892 5.96127 11.7698 5.88905 11.542 5.8335C11.3142 5.77794 11.0781 5.74461 10.8337 5.7335L14.2503 0.333496L15.3337 1.11683L12.2003 6.05016Z" />
                        </svg>
                      </span>

                      <span>Query</span>
                    </Link>
                  )}

                  {currentDatasource === "third_party" && (
                    <Link
                      href={`/datasource/details/${slug}/query`}
                      className="flex items-center justify-center h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary"
                    >
                      <span className="flex items-center justify-center">
                        <svg
                          viewBox="0 0 16 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 fill-btn-primary-icon"
                        >
                          <path d="M1.75033 11.1168L0.666992 10.3335L4.00033 5.00016L6.00033 7.3335L8.66699 3.00016L10.4837 5.71683C10.2281 5.72794 9.98644 5.7585 9.75866 5.8085C9.53088 5.8585 9.30588 5.92794 9.08366 6.01683L8.71699 5.46683L6.18366 9.5835L4.16699 7.2335L1.75033 11.1168ZM14.3837 14.3335L12.3003 12.2502C12.0781 12.4057 11.8309 12.5224 11.5587 12.6002C11.2864 12.6779 11.0059 12.7168 10.717 12.7168C9.88366 12.7168 9.17533 12.4252 8.59199 11.8418C8.00866 11.2585 7.71699 10.5502 7.71699 9.71683C7.71699 8.8835 8.00866 8.17516 8.59199 7.59183C9.17533 7.0085 9.88366 6.71683 10.717 6.71683C11.5503 6.71683 12.2587 7.0085 12.842 7.59183C13.4253 8.17516 13.717 8.8835 13.717 9.71683C13.717 10.0057 13.6781 10.2863 13.6003 10.5585C13.5225 10.8307 13.4059 11.0835 13.2503 11.3168L15.3337 13.3835L14.3837 14.3335ZM10.717 11.3835C11.1837 11.3835 11.5781 11.2224 11.9003 10.9002C12.2225 10.5779 12.3837 10.1835 12.3837 9.71683C12.3837 9.25016 12.2225 8.85572 11.9003 8.5335C11.5781 8.21127 11.1837 8.05016 10.717 8.05016C10.2503 8.05016 9.85588 8.21127 9.53366 8.5335C9.21144 8.85572 9.05033 9.25016 9.05033 9.71683C9.05033 10.1835 9.21144 10.5779 9.53366 10.9002C9.85588 11.2224 10.2503 11.3835 10.717 11.3835ZM12.2003 6.05016C11.9892 5.96127 11.7698 5.88905 11.542 5.8335C11.3142 5.77794 11.0781 5.74461 10.8337 5.7335L14.2503 0.333496L15.3337 1.11683L12.2003 6.05016Z" />
                        </svg>
                      </span>

                      <span>Query</span>
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between px-4 border-b h-9 border-border-color">
                <div className="flex space-x-4">
                  {/* .filter((item) => {
                      if (!hideJoin) {
                        return item.key !== "joins";
                      } else {
                        return item;
                      }
                    }) */}

                  {tabsList?.map((item, index) => {
                    return (
                      <Link
                        key={index}
                        className={`py-3 pb-2.5 text-xs font-medium border-b-2 cursor-pointer ${
                          activeTab === item.key
                            ? "border-tabs-active text-tabs-active"
                            : "border-transparent text-tabs-text hover:text-tabs-hover"
                        }`}
                        href={`/datasource/details/${slug}${item.slug}`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                <div>{extraChild}</div>
              </div>
            </div>

            <div className="w-full px-4 pt-4">{children}</div>
          </div>
        </div>
      </Split>

      {showCreateDatasource && (
        <CreateDatasourceModal
          show={showCreateDatasource}
          setShow={setShowCreateDatasource}
        />
      )}

      {confirmDelete && (
        <LoaderConfirmModal
          show={confirmDelete}
          setShow={setConfirmDelete}
          heading="Confirm Delete"
          title={"Are you sure you want to delete the datasource"}
          description={""}
          primaryBtn="Yes, Confirm"
          primaryChange={handleDeleteDatasource}
          secondaryBtn="No"
          secondaryChange={() => setConfirmDelete(false)}
          isLoading={deleteLoading}
          loadingText={"deleting"}
        />
      )}
      <SuccessModal
        show={showDatasourceDeleteSuccess}
        setShow={setShowDatasourceDeleteSuccess}
        heading="Success Confirmation"
        title={""}
        description="Datasource Deleted Successfully"
        primaryBtn="Close"
        primaryChange={() => {
          setShowDatasourceDeleteSuccess(false);
          router.push("/datasource");
        }}
      />

      {/* {showSuccessDelete && (
        <SuccessModal
          show={showSuccessDelete}
          setShow={setShowSuccessDelete}
          heading="Success Confirmation"
          title=""
          description="Datasource deleted Successfully."
          primaryBtn="Close"
          primaryChange={() => setShowSuccessDelete(false)}
        />
      )} */}
    </div>
  );
};

export default DatasourceLayout;
