import React, { useCallback, useEffect, useState } from "react";
import { useGetDatasourcesTablesQuery } from "@/store/datasource";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { Tooltip } from "react-tooltip";
import Link from "next/link";
import { useGetAssistantsQuery } from "@/store/assistant";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "@/hooks/useTheme";
import { AssistantIcon, DatasourceIcon } from "../Icons/icon";
import { Db_type, getDbTypeDetails } from "../home/DatasourcesTable";

const AssistantSidebar = ({
  setShowCreateAssistant = () => {},
  isCollapse,
  setIsCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [openStates, setOpenStates] = useState({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [assistants, setAssistants] = useState([]);
  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      setDebouncedSearchQuery(value);
      setPage(0);
      setAssistants([]);
      setHasMore(true);
    }, 300),
    []
  );

  const { theme } = useTheme();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedChangeHandler(value);
  };

  const router = useRouter();

  useEffect(() => {
    if (router?.query?.slug) {
      setActiveIndex(router.query.slug);
      setOpenStates({
        [router.query.slug]: true,
      });
    }
  }, [router?.query?.slug]);

  const {
    data: getRes,
    error,
    isLoading,
    isFetching,
  } = useGetAssistantsQuery(
    {
      skip: page * 100,
      limit: 100,
      sort_by: "A-Z",
      query: debouncedSearchQuery,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (getRes) {
      if (page === 0) {
        setAssistants(getRes);
      } else {
        setAssistants((prevAssistants) => {
          const combinedData = [...prevAssistants, ...getRes];
          // Ensure uniqueness based on `id`
          const uniqueData = Array.from(
            new Map(combinedData.map((item) => [item.id, item])).values()
          );
          return uniqueData;
        });
      }

      setHasMore(getRes.length === 100);
    }
  }, [getRes, page]);

  const fetchMoreAssistants = () => {
    if (!isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleCollapseToggle = () => {
    setIsCollapse((prev) => !prev);
  };

  const openIds = Object.keys(openStates).filter((id) => openStates[id]);
  const firstOpenId = openIds.length > 0 ? openIds[0] : null;

  const sortedGetRes = [...(assistants || [])];

  // if (firstOpenId) {
  //   const index = sortedGetRes.findIndex((item) => item.id === firstOpenId);
  //   if (index > -1) {
  //     const [item] = sortedGetRes.splice(index, 1);
  //     sortedGetRes.unshift(item);
  //   }
  // }

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
          {isCollapse || (
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
          )}

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
          <div className="px-3">
            <div className="relative">
              <input
                type="text"
                className="w-full py-2 pl-8 pr-4 text-xs font-medium bg-transparent border rounded-md outline-none 2xl:text-sm text-input-text border-input-border placeholder:text-input-placeholder focus:border-active-border"
                placeholder="Search Assistants"
                value={searchQuery}
                onChange={handleInputChange}
              />

              <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
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
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </span>

              {searchQuery !== "" && (
                <span
                  className={`absolute flex items-center justify-center w-5 h-5 -translate-y-1/2 rounded-full cursor-pointer top-1/2 right-2 ${
                    theme === "dark" ? "bg-icon-selected-bg" : ""
                  } `}
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearchQuery("");
                    setPage(0);
                    setAssistants([]);
                    setHasMore(true);
                  }}
                >
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
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </span>
              )}
            </div>
          </div>

          <div
            className="flex flex-col flex-grow overflow-y-auto recent__bar"
            id="scrollableDiv"
          >
            {/* <ul className="flex flex-col w-full">
              {getRes?.map((item, index) => {
                return (
                  <Database
                    data={item}
                    key={index}
                    // isActive={item.id === activeIndex}
                    // onToggle={() => {
                    //   setActiveIndex(item.id === activeIndex ? null : item.id);
                    // }}
                    isActive={!!openStates[item.id]}
                    onToggle={() => {
                      setOpenStates((prevOpenStates) => ({
                        ...prevOpenStates,
                        [item.id]: !prevOpenStates[item.id],
                      }));
                    }}
                    router={router}
                  />
                );
              })}
            </ul> */}

            <InfiniteScroll
              dataLength={sortedGetRes.length}
              next={fetchMoreAssistants}
              hasMore={hasMore}
              loader={
                <div className="flex items-center justify-center w-full h-16">
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 animate-spin text-foreground fill-accent-foreground"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.0830 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>

                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              }
              endMessage={
                <p className="py-2 text-xs font-normal text-center text-secondary-text">
                  <b>No more assistants to display</b>
                </p>
              }
              scrollableTarget="scrollableDiv"
            >
              <ul className="flex flex-col w-full">
                {sortedGetRes.map((item, index) => {
                  return (
                    <Database
                      data={item}
                      key={index}
                      isActive={!!openStates[item.id]}
                      onToggle={() => {
                        setOpenStates((prevOpenStates) => ({
                          ...prevOpenStates,
                          [item.id]: !prevOpenStates[item.id],
                        }));
                      }}
                      router={router}
                    />
                  );
                })}
              </ul>
            </InfiniteScroll>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantSidebar;

const Database = ({ data, isActive, onToggle, router }) => {
  const handlePageChnage = () => {
    router.push(`/assistant/details/${data.id}`);
  };
  const { theme } = useTheme();

  return (
    <li className="flex flex-col">
      <div
        className={`flex h-7 space-x-3 cursor-pointer px-3 justify-center select-none border-l-2 ${
          router?.query.slug === data.id &&
          !router?.query.datasource_id &&
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
              !router?.query.datasource_id && isActive
                ? "rotate-0"
                : "-rotate-90"
            }`}
          >
            <path d="M9.16536 0.333496L0.832031 0.333496L4.9987 4.50016L9.16536 0.333496Z" />
          </svg>
        </span>

        <div
          className="flex items-center w-full space-x-2"
          onClick={handlePageChnage}
        >
          {(router.query.slug === data.id &&
            !router?.query.datasource_id &&
            isActive) ||
            (<AssistantIcon size={4} />)}

          {router.query.slug === data.id &&
            !router?.query.datasource_id &&
            isActive && (
              <AssistantIcon size={4} />
            )}

          <p
            className={`text-xs font-medium line-clamp-1 ${
              router.query.slug === data.id &&
              !router?.query.datasource_id &&
              isActive
                ? "text-active-text"
                : "text-primary-text"
            }`}
          >
            {data.name}
          </p>
        </div>
      </div>

      {isActive && (
        <ul className="flex flex-col w-full">
          {data?.datasources?.map((item, index) => {
            return (
              <Link
                className={`flex h-7 pl-[60px] items-center space-x-2 group cursor-pointer px-3 select-none border-l-2 ${
                  router.query.slug === data.id &&
                  item.datasource_id === router?.query?.datasource_id
                    ? "bg-active-bg border-border-active-color text-active-text"
                    : "bg-transparent border-transparent hover:bg-active-bg-hover"
                }`}
                href={`/assistant/details/${data.id}/datasource/${item.datasource_id}`}
                key={index}
              >
                <span className="flex items-center justify-center cursor-pointer">
                  {/* <DatasourceIcon size={4} /> */}
                  {(() => {
                    const { img, label } = getDbTypeDetails(item?.db_type || item?.ds_type, Db_type);

                    return img ? (
                      <img src={img} alt={label || "Icon"} className="w-4 h-4" />
                    ) : (
                      <DatasourceIcon />
                    )
                  })()}
                </span>

                <p
                  className={`text-xs font-medium line-clamp-1 ${
                    router.query.slug === data.id &&
                    item.datasource_id === router?.query.datasource_id
                      ? "text-active-text"
                      : "text-primary-text"
                  }`}
                >
                  {item.name}
                </p>
              </Link>
            );
          })}
        </ul>
      )}
    </li>
  );
};
