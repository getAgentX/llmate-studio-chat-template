import React, { useEffect, useState } from "react";
import { useGetAllUserLevelAccountsQuery } from "@/store/datasource";
import { useRouter } from "next/router";
import Link from "next/link";
import { DatasourceIcon, TableIcon } from "../Icons/icon";
import { Db_type, getDbTypeDetails } from "../home/DatasourcesTable";

const UserInfoSidebar = ({
  setShowCreateAssistant = () => {},
  isCollapse,
  setIsCollapse,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [openStates, setOpenStates] = useState({});
  const [userLevelList, setUserLevelList] = useState([]);

  const router = useRouter();

  useEffect(() => {
    if (router?.query?.slug) {
      setActiveIndex(router.query.slug);
      setOpenStates({
        [router.query.slug]: true,
      });
    }
  }, [router?.query?.slug]);

  const handleCollapseToggle = () => {
    setIsCollapse((prev) => !prev);
  };

  const {
    data: allUserList,
    error: allUserListError,
    isLoading: allUserListLoading,
    isFetching: allUserListFetch,
  } = useGetAllUserLevelAccountsQuery({});

  const transformAllUserListToArray = (allUserList) => {
    return Object.keys(allUserList).map((connectorType) => {
      const accountsObj = allUserList[connectorType] || {};
      const accounts = Object.keys(accountsObj).map((accountId) => ({
        id: accountId,
        name: accountsObj[accountId],
      }));
      return {
        connector_type: connectorType,
        accounts: accounts,
      };
    });
  };

  useEffect(() => {
    if (allUserList) {
      const arrayBasedData = transformAllUserListToArray(allUserList);
      setUserLevelList(arrayBasedData);
    }
  }, [allUserList]);

  return (
    <div className="flex flex-col w-full h-full space-y-3 border-r border-border-color bg-page">
      <div
        className={`flex items-center h-12 p-4 text-sm font-semibold border-b border-border-color text-primary-text ${
          isCollapse ? "justify-center w-12" : "justify-between w-full"
        }`}
      >
        <div className="flex items-center space-x-2">
          {isCollapse || <p>Explore</p>}
        </div>

        <div className="flex items-center space-x-1.5">
          {/* {isCollapse || (
            <button
              type="button"
              className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
              onClick={() => setShowCreateAssistant(true)}
            >
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-btn-primary-outline-icon"
                >
                  <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
                </svg>
              </span>
              <span>Add</span>
            </button>
          )} */}

          <button
            type="button"
            className="flex items-center justify-center cursor-pointer"
            onClick={handleCollapseToggle}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 fill-icon-color hover:fill-icon-color-hover ${
                isCollapse ? "rotate-180" : "rotate-0"
              }`}
            >
              <path d="M16.9984 18L18.3984 16.6L13.7984 12L18.3984 7.4L16.9984 6L10.9984 12L16.9984 18ZM7.99844 18V6H5.99844V18H7.99844Z" />
            </svg>
          </button>
        </div>
      </div>

      {isCollapse || (
        <div className="flex flex-col space-y-3 overflow-hidden">
          <div className="flex flex-col flex-grow overflow-y-auto recent__bar">
            <ul className="flex flex-col w-full">
              {userLevelList.map((item, index) => (
                <Database
                  data={item}
                  key={item.connector_type}
                  isActive={!!openStates[item.connector_type]}
                  onToggle={() => {
                    setOpenStates((prevOpenStates) => ({
                      ...prevOpenStates,
                      [item.connector_type]:
                        !prevOpenStates[item.connector_type],
                    }));
                  }}
                  router={router}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfoSidebar;

const Database = ({ data, isActive, onToggle, router }) => {
  const handlePageChange = () => {
    router.push(`/user-info/${data.connector_type}`);
  };

  return (
    <li className="flex flex-col">
      <div
        className={`flex h-7 space-x-3 cursor-pointer px-3 select-none border-l-2 ${
          router?.query.slug === data.connector_type &&
          !router?.query.user &&
          isActive
          ? "bg-active-bg border-border-active-color text-active-text"
          : "bg-transparent border-transparent hover:bg-active-bg-hover"
        }`}
      >
        <span
          className="flex items-center justify-center cursor-pointer"
          onClick={() => onToggle()}
        >
          <svg
            viewBox="0 0 10 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3 h-3 fill-icon-color hover:fill-icon-color-hover ${
              isActive ? "rotate-0" : "-rotate-90"
            }`}
          >
            <path d="M9.16536 0.333496L0.832031 0.333496L4.9987 4.50016L9.16536 0.333496Z" />
          </svg>
        </span>

        <div
          className="flex items-center w-full space-x-2"
          onClick={handlePageChange}
        >
          <span className="flex items-center justify-center cursor-pointer">
            {(() => {
              const type = data?.connector_type;
              const { img, label } = getDbTypeDetails(type, Db_type);
              return img ? (
                <img src={img} alt={label || "Icon"} className="w-4 h-4" />
              ) : (
                  <DatasourceIcon size={4} />
              )
            })()}
          </span>

          <p
            className={`text-xs font-medium capitalize line-clamp-1 ${
              router.query.slug === data.connector_type &&
              !router?.query.user &&
              isActive
                ? "text-active-text"
                : "text-primary-text"
            }`}
          >
            {data.connector_type}
          </p>
        </div>
      </div>

      {isActive && (
        <ul className="flex flex-col w-full">
          {data.accounts.map((account) => (
            <Link
              key={account.id}
              href={`/user-info/${data.connector_type}/s/${account.id}`}
              className={`flex h-7 pl-12 items-center space-x-3 group cursor-pointer px-3 select-none border-l-2 ${
                router.query.user === account.id
                ? "bg-active-bg border-border-active-color text-active-text"
                : "bg-transparent border-transparent hover:bg-active-bg-hover"
              }`}
            >
              <span className="flex items-center justify-center cursor-pointer">
                <TableIcon size={4} />
              </span>

              <p
                className={`text-xs font-medium capitalize line-clamp-1 ${
                  router.query.user === account.id
                    ? "text-active-text"
                    : "text-primary-text"
                }`}
              >
                {account.name}
              </p>
            </Link>
          ))}
        </ul>
      )}
    </li>
  );
};
