import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DatasourceSidebar from "@/components/Layout/DatasourceSidebar";
import Link from "next/link";
import { useGetDatasourceInfoQuery } from "@/store/datasource";
import Split from "react-split";
import CreateDatasourceModal from "../Datasource/CreateDatasourceModal";
import { TableIcon } from "../Icons/icon";

const tabsList = [
  {
    name: "Information",
    slug: "/",
    key: "description",
  },
  {
    name: "Concepts",
    slug: "/concepts",
    key: "concepts",
  },
  {
    name: "Preview",
    slug: "/preview",
    key: "preview",
  },
];

const ThirdPartyTableLayout = ({ children, activeTab, extraChild = null }) => {
  const [slug, setSlug] = useState(null);
  const [tableName, setTableName] = useState(null);
  const [showCreateDatasource, setShowCreateDatasource] = useState(false);
  const [isCollapse, setIsCollapse] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (router?.query?.slug) {
      setSlug(router.query.slug);
    } else {
      setSlug(null);
    }

    if (router?.query["third-party-table"]) {
      setTableName(router?.query["third-party-table"]);
    } else {
      setTableName(null);
    }
  }, [router]);

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

        <div className="relative flex flex-col w-full h-full max-h-full overflow-y-auto recent__bar">
          <div className="sticky top-0 left-0 z-50 flex flex-col w-full bg-page">
            <div className="flex items-center justify-between h-12 px-4 border-b border-border-color">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center">
                  <span className="flex items-center justify-center cursor-pointer">
                    <TableIcon size={4} />
                  </span>
                </span>

                <div className="flex items-center space-x-2">
                  <p className="text-base font-normal text-primary-text">
                    {router?.query["third-party-table"] || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* <button
                  type="button"
                  className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-secondary-text hover:bg-btn-secondary-hover bg-btn-secondary-bg group"
                >
                  <span>
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-icon-color group-hover:fill-icon-color-hover"
                    >
                      <path d="M2.66797 12C2.3013 12 1.98741 11.8694 1.7263 11.6083C1.46519 11.3472 1.33464 11.0333 1.33464 10.6667V2H0.667969V0.666667H4.0013V0H8.0013V0.666667H11.3346V2H10.668V10.6667C10.668 11.0333 10.5374 11.3472 10.2763 11.6083C10.0152 11.8694 9.7013 12 9.33464 12H2.66797ZM9.33464 2H2.66797V10.6667H9.33464V2ZM4.0013 9.33333H5.33464V3.33333H4.0013V9.33333ZM6.66797 9.33333H8.0013V3.33333H6.66797V9.33333Z" />
                    </svg>
                  </span>
                </button> */}

                <div className="flex items-center space-x-2">
                  {currentStatus === "synced" && (
                    <span className="py-1 px-3 rounded-full border border-[#1BC655] text-xs text-[#1BC655] flex justify-center items-center">
                      Synced
                    </span>
                  )}

                  {currentStatus === "syncing" && (
                    <span className="flex items-center justify-center px-3 py-1 text-xs text-yellow-600 border border-yellow-600 rounded-full">
                      syncing
                    </span>
                  )}

                  {currentStatus === "failed" && (
                    <span className="flex items-center justify-center px-3 py-1 text-xs text-red-600 border border-red-600 rounded-full">
                      Sync Failed
                    </span>
                  )}

                  {getRes?.ds_config?.last_airbyte_synced_at && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className="flex items-center space-x-2"
                        >
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

                <Link
                  href={`/datasource/details/${slug}/query/${router?.query["third-party-table"]}`}
                  className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary"
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
              </div>
            </div>

            <div className="flex items-center justify-between px-4 border-b h-9 border-border-color">
              <div className="flex space-x-4 2xl:space-x-6">
                {tabsList?.map((item, index) => {
                  return (
                    <Link
                      key={index}
                      className={`py-3 pb-2.5 text-xs font-medium border-b-2 cursor-pointer ${
                        activeTab === item.key
                          ? "border-tabs-active text-tabs-active"
                          : "border-transparent text-tabs-text hover:text-tabs-hover"
                      }`}
                      href={`/datasource/details/${slug}/third-party-table/${tableName}${item.slug}`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {extraChild}
            </div>
          </div>

          <div className="w-full pt-4 pl-4 pr-4">{children}</div>
        </div>
      </Split>

      {showCreateDatasource && (
        <CreateDatasourceModal
          show={showCreateDatasource}
          setShow={setShowCreateDatasource}
        />
      )}
    </div>
  );
};

export default ThirdPartyTableLayout;
