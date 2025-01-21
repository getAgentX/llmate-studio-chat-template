import React from "react";
import Loader from "../loader/Loader";
import { getDbTypeImage } from "./AssistantsTable";
import { useRouter } from "next/router";
import Link from "next/link";
import { NotebookIcon } from "../Icons/icon";

const NotebooksTable = ({
  data,
  isLoading = false,
  showCreateModal = () => {},
  theme,
  searchQuery = "",
  isHome=false
}) => {
  const columns = ["Name", "Description", "Datasources", "Action"];

  const tableHeaders = columns.map((col, index) => (
    <th
      key={index}
      className={`h-12 px-3 py-2 text-[13px] font-medium text-left border-border-color text-nowrap text-[#a1a1a1] ${
        col === "Action" ? "w-[100px] pl-6" : ""
      }`}
    >
      {col}
    </th>
  ));

  const router = useRouter();

  const handleClick = (id) => {
    router.push(`/notebook/${id}`);
  };

  const tableRows = data?.map((item, index) => {
    const allDataSources = [
      ...(item.datasources_info?.db_types || []),
      ...(item.datasources_info?.connector_types || []),
      ...(item.datasources_info?.ds_types?.includes("spreadsheet")
        ? ["spreadsheet"]
        : []),
    ];

    return (
      <tr
        key={item.id}
        className="h-12 text-left cursor-pointer hover:bg-active-bg-hover"
        onClick={(e) => {
          e.stopPropagation();
          handleClick(item.id);
        }}
      >
        <td className="px-3 text-[13px] font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text w-[160px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
          <div className="flex space-x-2 overflow-hidden">
            <span className="flex items-center justify-center">
              <NotebookIcon size={4} />
            </span>
            <span className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">
              {item.label}
            </span>
          </div>
        </td>
        <td className="px-3 text-[13px] font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
          {item.description || "No description available"}
        </td>
        <td className="px-3 text-[13px] font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text w-[100px] max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-0.5">
              {allDataSources?.slice(0, 3).map((ds) => {
                let typeKey;

                return (
                    <img
                      src={getDbTypeImage(ds)}
                      alt={ds.db_type}
                      className="object-cover w-4 aspect-square"
                    />
                );
              })}
              {allDataSources.length > 3 && (
                <span className="flex items-center justify-center rounded-full text-[13px] font-medium text-primary-text">
                  +{allDataSources.length - 3}
                </span>
              )}
            </div>
          </div>
        </td>

        <td className="text-[13px] border-t border-border-color">
          <div className="flex text-[13px]">
            <a
              href={`/notebook/${item.id}`}
              className="flex items-center justify-center w-full px-4 py-2 space-x-1 text-[13px] font-medium tracking-wide bg-transparent rounded max-w-fit text-btn-primary-outline-text hover:bg-btn-primary hover:text-btn-primary-text group"
            >
              <span className="flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                >
                  <path
                    d="M2 14V10.6667H3.33333V12.6667H5.33333V14H2ZM10.6667 14V12.6667H12.6667V10.6667H14V14H10.6667ZM2 5.33333V2H5.33333V3.33333H3.33333V5.33333H2ZM12.6667 5.33333V3.33333H10.6667V2H14V5.33333H12.6667Z"
                  />
                </svg>
              </span>
              <span>View</span>
            </a>
            {/* <a
                        href={`/assistant/chat/${item.id}`}
                        className="flex items-center justify-center w-full h-5 px-3 space-x-1.5 text-[13px] font-medium tracking-wide rounded max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                        >
                            Chat
                        </a> */}
          </div>
        </td>
      </tr>
    );
  });

  if (isLoading)
    return (
      <div className="flex h-[220px] items-center justify-center rounded ">
        <Loader />
      </div>
    );

  if (isHome && data.length === 0)
    return (
      <div className="flex flex-col items-center w-full max-w-full mx-auto rounded-md py-10">
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="fill-icon-secondary"
        >
          <circle cx="28" cy="28" r="28" fill="var(--icon-secondary-bg)" />
          <path
            d="M35.5833 24.5H20.4167C19.7723 24.5 19.25 25.0223 19.25 25.6667V37.3333C19.25 37.9777 19.7723 38.5 20.4167 38.5H35.5833C36.2277 38.5 36.75 37.9777 36.75 37.3333V25.6667C36.75 25.0223 36.2277 24.5 35.5833 24.5Z"
            fill="var(--icon-secondary)"
            stroke="var(--icon-secondary)"
            stroke-width="1.6"
          />
          <path
            d="M23.9167 30.3333C24.561 30.3333 25.0833 29.811 25.0833 29.1667C25.0833 28.5223 24.561 28 23.9167 28C23.2723 28 22.75 28.5223 22.75 29.1667C22.75 29.811 23.2723 30.3333 23.9167 30.3333Z"
            fill="var(--icon-secondary-bg)"
          />
          <path
            d="M32.0807 30.3333C32.7251 30.3333 33.2474 29.811 33.2474 29.1667C33.2474 28.5223 32.7251 28 32.0807 28C31.4364 28 30.9141 28.5223 30.9141 29.1667C30.9141 29.811 31.4364 30.3333 32.0807 30.3333Z"
            fill="var(--icon-secondary-bg)"
          />
          <path
            d="M25.6667 32.667C25.0223 32.667 24.5 33.1893 24.5 33.8337C24.5 34.478 25.0223 35.0003 25.6667 35.0003V32.667ZM30.3333 35.0003C30.9777 35.0003 31.5 34.478 31.5 33.8337C31.5 33.1893 30.9777 32.667 30.3333 32.667V35.0003ZM25.6667 35.0003H30.3333V32.667H25.6667V35.0003Z"
            fill="var(--icon-secondary-bg)"
          />
          <path
            d="M28 19.834V24.5007"
            stroke="var(--icon-secondary)"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16.3359 29.167V33.8337"
            stroke="var(--icon-secondary)"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M39.6641 29.167V33.8337"
            stroke="var(--icon-secondary)"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M28.0026 19.8333C28.6469 19.8333 29.1693 19.311 29.1693 18.6667C29.1693 18.0223 28.6469 17.5 28.0026 17.5C27.3583 17.5 26.8359 18.0223 26.8359 18.6667C26.8359 19.311 27.3583 19.8333 28.0026 19.8333Z"
            stroke="var(--icon-secondary)"
            stroke-width="1.6"
          />
        </svg>
        <p className="mt-2 text-lg font-medium text-primary-text">
          You haven’t accessed any notebooks yet. Get started by:
        </p>
        <p className="w-full max-w-2xl mx-auto text-base font-normal text-center text-secondary-text">
          Creating a New Notebook to start your analysis journey.
          Opening Existing Notebooks to continue from where you left off.
          Dive into data exploration now!
        </p>
        <button
          type="button"
          onClick={() => showCreateModal(true)}
          className="flex items-center justify-center h-8 px-3 mt-2 space-x-2 text-[13px] font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
        >
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 fill-btn-primary-icon"
            >
              <path d="M4.33203 5.66634H0.332031V4.33301H4.33203V0.333008H5.66536V4.33301H9.66536V5.66634H5.66536V9.66634H4.33203V5.66634Z" />
            </svg>
          </span>
          <span className="hidden xsm:block">Create Notebook</span>
          <span className="xsm:hidden">Create</span>
        </button>
      </div>
    );

  if (data.length === 0 && searchQuery === "")
    return (
      <div className="flex flex-col items-center w-full max-w-full mx-auto rounded-md py-10">
        <span className="flex items-center justify-center p-3 rounded-full bg-icon-secondary-bg" >
          <NotebookIcon size={6} />
        </span>
        <p className="mt-2 text-sm font-medium text-primary-text" >
          Create Your First Notebook
        </p>

        <p className="w-4/5 mt-1 max-w-2xl mx-auto text-[13px] font-normal text-center text-secondary-text">
          Notebooks are where exploration meets insights. Use them to document
          analyses, create models, or collaborate with your team.
        </p>

        <button
          type="button"
          onClick={() => showCreateModal(true)}
          className="flex items-center justify-center h-8 px-3 mt-2 space-x-2 text-[13px] font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
        >
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 fill-btn-primary-icon"
            >
              <path d="M4.33203 5.66634H0.332031V4.33301H4.33203V0.333008H5.66536V4.33301H9.66536V5.66634H5.66536V9.66634H4.33203V5.66634Z" />
            </svg>
          </span>
          <span className="hidden xsm:block">Create Notebook</span>
          <span className="xsm:hidden">Create</span>
        </button>
      </div>
    );

  if (searchQuery && data.length === 0) {
    return (
      <div className="flex flex-col items-center w-full max-w-full mx-auto py-14">
        <svg
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 stroke-secondary-text"
        >
          <path
            d="M16 20.7476L20.2374 16.5M13 3.5H8.2C7.0799 3.5 6.51984 3.5 6.09202 3.71799C5.71569 3.90973 5.40973 4.21569 5.21799 4.59202C5 5.01984 5 5.5799 5 6.7V18.3C5 19.4201 5 19.9802 5.21799 20.408C5.40973 20.7843 5.71569 21.0903 6.09202 21.282C6.51984 21.5 7.0799 21.5 8.2 21.5H12M13 3.5L19 9.5M13 3.5V7.9C13 8.46005 13 8.74008 13.109 8.95399C13.2049 9.14215 13.3578 9.29513 13.546 9.39101C13.7599 9.5 14.0399 9.5 14.6 9.5H19M19 9.5V11.5M21 18.5C21 20.1569 19.6569 21.5 18 21.5C16.3431 21.5 15 20.1569 15 18.5C15 16.8431 16.3431 15.5 18 15.5C19.6569 15.5 21 16.8431 21 18.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* <p className="mt-2 text-lg font-medium text-primary-text">
          You haven’t accessed any notebooks yet. Get started by:
        </p> */}
        <p className="w-full max-w-2xl mx-auto text-base font-normal text-center text-secondary-text">
          Oops! No results found. Try refining your query for better results.
        </p>

        <div className="flex items-center justify-center space-x-2">
          <button
            type="button"
            onClick={() => showCreateModal(true)}
            className="flex items-center justify-center h-8 px-3 mt-2 space-x-2 text-[13px] font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
          >
            <span className="flex items-center justify-center">
              <svg
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 fill-btn-primary-icon"
              >
                <path d="M4.33203 5.66634H0.332031V4.33301H4.33203V0.333008H5.66536V4.33301H9.66536V5.66634H5.66536V9.66634H4.33203V5.66634Z" />
              </svg>
            </span>
            <span className="hidden xsm:block">Create Notebook</span>
            <span className="xsm:hidden">Create</span>
          </button>

          <Link
            href="/notebook"
            className="flex items-center justify-center h-8 px-3 mt-2 space-x-2 text-[13px] font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
          >
            <span className="hidden xsm:block">Explore</span>
            <span className="xsm:hidden">Explore</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <table className="w-full text-[13px] border-b border-collapse border-border-color">
      <thead className="sticky top-0 z-10 bg-primary text-primary-text">
        <tr className="">{tableHeaders}</tr>
      </thead>
      <tbody className="overflow-y-auto w-full max-h-[500px]">
        {data?.length > 0 ? (
          tableRows
        ) : (
          <tr>
            <td colSpan="6" className="py-4 text-center text-secondary-text">
              No Notebook available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default NotebooksTable;
