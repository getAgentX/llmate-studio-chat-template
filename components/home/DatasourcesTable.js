import React from "react";
import Loader from "../loader/Loader";
import Link from "next/link";
import { useBulkDownloadRowsMutation } from "@/store/semi_structured_datasource";
import { useGetDownloadSpreadsheetMutation } from "@/store/datasource";
import { useRouter } from "next/router";
import { DatasourceIcon, QueryIcon, SetupIcon } from "../Icons/icon";

export const getDbTypeDetails = (dbTypeName, Db_type) => {
  const matchedType = Db_type.find((item) => item.name === dbTypeName);
  return matchedType ? { img: matchedType.img, label: matchedType.label } : { img: "", label: "" };
};

export const Db_type = [
  { name: "spreadsheet", img: "/assets/spreadsheet.svg", label: "File" },
  { name: "semi_structured", img: "/assets/spreadsheet.svg", label: "File" },
  { name: "bigquery", img: "/assets/google-bigquery.svg", label: "Big Query" },
  { name: "postgres", img: "/assets/postgresql.svg", label: "Postgresql" },
  { name: "mariadb", img: "/assets/vector.svg", label: "Mariadb" },
  { name: "snowflake", img: "/assets/snowflake.svg", label: "Snowflake" },
  { name: "mysql", img: "/assets/mysql-logo.svg", label: "My SQL" },
  { name: "athena", img: "/assets/AWS-Athena.svg", label: "AWS Athena" },
  { name: "databricks", img: "/assets/Databricks.svg", label: "Databricks" },
  { name: "redshift", img: "/assets/aws-redshift.svg", label: "AWS Redshift" },
  { name: "facebook_ads", img: "/assets/facebook_ads.svg", label: "Facebook Ads" },
  { name: "google_ads", img: "/assets/google_ads.svg", label: "Google Ads" },
  { name: "google_analytics", img: "/assets/google_analytics.svg", label: "Google Analytics" },
  { name: "shopify", img: "/assets/shopify.svg", label: "Shopify" },
  { name: "linkedin", img: "/assets/linkedin.svg", label: "linkedin" },
  { name: "pinterest", img: "/assets/pinterest.svg", label: "pinterest" },
  { name: "hubspot", img: "/assets/hubspot.svg", label: "hubspot" },
  { name: "snapchat-marketing", img: "/assets/snapchat-marketing.svg", label: "snapchat marketing" },
  { name: "tiktok-marketing", img: "/assets/tiktok-marketing.svg", label: "tiktok-marketing" },
  { name: "youtube-analytics", img: "/assets/youtube-analytics.svg", label: "youtube-analytics" },
  { name: "mailchimp", img: "/assets/mailchimp.svg", label: "mailchimp" },
];
const DatasourcesTable = ({
  data,
  theme,
  isLoading = false,
  showCreateModal = () => { },
  searchQuery = "",
  isHome = false
}) => {
  const [bulkDownloadRows] = useBulkDownloadRowsMutation();
  const [getDownloadSpreadsheet] = useGetDownloadSpreadsheetMutation();

  const handleBulkDownload = (id) => {
    bulkDownloadRows({ datasource_id: id }).then((response) => {
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

  const handleDownloadSpreadsheet = (id) => {
    getDownloadSpreadsheet({ datasource_id: id }).then((response) => {
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

  const columns = ["Name", "Description", "Type", "Connected With", "Action"];
  const tableHeaders = columns.map((col, index) => (
    <th
      key={index}
      className={`h-12 px-3 py-2 text-[13px] font-medium text-left border-border-color text-nowrap text-[#a1a1a1] ${col === "Action" ? "w-[120px] pl-8" : ""}`} >
      {col}
    </th>
  ));

  const router = useRouter();

  const handleClick = (id) => {
    router.push(`/datasource/details/${id}`);
  };

  const tableRows = data?.map((item, index) => (
    <tr
      key={item.id}
      className="h-12 text-left cursor-pointer hover:bg-active-bg-hover"
      onClick={(e) => {
        e.stopPropagation();
        handleClick(item.id);
      }}
    >
      <td className="px-3 text-[13px] font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text w-[160px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="flex items-center justify-center">
            <DatasourceIcon size={4} />
          </span>
          <span className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[160px]">
            {item.name}
          </span>
        </div>
      </td>
      <td className="px-3 text-[13px] font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
        {item.about || "No description available"}
      </td>
      <td className="px-3 text-[13px] font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text w-[180px] max-w-[240px]">
        {item.ds_config?.ds_type === "sql_generator" && (
          <div
            className={`py-0.5 px-3 text-[13px] flex items-center justify-center space-x-2 rounded  w-fit ${theme === "dark"
              ? "bg-[#212B27] text-[#40AD7D]"
              : "bg-[#E4FFF3] text-[#40AD7D]"
              }`}
          >
            <span className="whitespace-nowrap text-nowrap">Structured</span>
          </div>
        )}

        {item.ds_config?.ds_type === "semi_structured" && (
          <div
            className={`py-0.5 px-3 text-[13px] flex items-center justify-center space-x-2 rounded  w-fit ${theme === "dark"
              ? "bg-[#2A212A] text-[#A840AD]"
              : "bg-[#FBE4FF] text-[#A840AD]"
              }`}
          >
            <span className="whitespace-nowrap text-nowrap">
              Semi-Structured
            </span>
          </div>
        )}

        {item.ds_config?.ds_type === "third_party" && (
          <div
            className={`py-0.5 px-3 text-[13px] flex items-center justify-center space-x-2 rounded  w-fit ${theme === "dark"
              ? "bg-[#2A2421] text-[#AD7A40]"
              : "bg-[#FFEFE4] text-[#AD7A40]"
              }`}
          >
            <span className="whitespace-nowrap text-nowrap">Third Party</span>
          </div>
        )}
      </td>
      <td className="text-[13px] font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text w-[150px] max-w-[240px]">
        {(() => {
          const config = item?.ds_config;
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

          return label ? (
            <div className="flex items-center gap-2 px-3" key={label}>
              {img && (
                <img src={img} alt={label || "Icon"} className="w-4 h-4" />
              )}
              <span className="whitespace-nowrap">{label}</span>
              {typeKey === "semi_structured" && (
                <button
                  className="w-4"
                  onClick={() => handleBulkDownload(item?.id)}
                >
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-input-placeholder group-hover:fill-secondary-text"
                  >
                    <path d="M6.0013 8.66675L2.66797 5.33342L3.6013 4.36675L5.33464 6.10008V0.666748H6.66797V6.10008L8.4013 4.36675L9.33464 5.33342L6.0013 8.66675ZM2.0013 11.3334C1.63464 11.3334 1.32075 11.2029 1.05964 10.9417C0.798524 10.6806 0.667969 10.3667 0.667969 10.0001V8.00008H2.0013V10.0001H10.0013V8.00008H11.3346V10.0001C11.3346 10.3667 11.2041 10.6806 10.943 10.9417C10.6819 11.2029 10.368 11.3334 10.0013 11.3334H2.0013Z" />
                  </svg>
                </button>
              )}
              {config?.ds_type === "sql_generator" &&
                config?.db_connection?.db_type === "spreadsheet" && (
                  <button
                    className="w-4"
                    onClick={() => handleDownloadSpreadsheet(item?.id)}
                  >
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-input-placeholder group-hover:fill-secondary-text"
                    >
                      <path d="M6.0013 8.66675L2.66797 5.33342L3.6013 4.36675L5.33464 6.10008V0.666748H6.66797V6.10008L8.4013 4.36675L9.33464 5.33342L6.0013 8.66675ZM2.0013 11.3334C1.63464 11.3334 1.32075 11.2029 1.05964 10.9417C0.798524 10.6806 0.667969 10.3667 0.667969 10.0001V8.00008H2.0013V10.0001H10.0013V8.00008H11.3346V10.0001C11.3346 10.3667 11.2041 10.6806 10.943 10.9417C10.6819 11.2029 10.368 11.3334 10.0013 11.3334H2.0013Z" />
                    </svg>
                  </button>
                )}
            </div>
          ) : (
            <span className="text-[13px] text-gray-500">-</span>
          );
        })()}
      </td>

      <td className="text-[13px] border-t border-border-color pl-3">
        <div className="flex text-[13px]">
          {/* <Link
                        href={`/datasource/details/${item.id}`}
                        className="flex items-center justify-center w-full py-1.5 px-2 space-x-1 text-[13px] font-medium tracking-wide rounded max-w-fit text-btn-primary-outline-text hover:bg-active-bg bg-transparent group"
                    >
                        <span className="flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
                                <path d="M2 14V10.6667H3.33333V12.6667H5.33333V14H2ZM10.6667 14V12.6667H12.6667V10.6667H14V14H10.6667ZM2 5.33333V2H5.33333V3.33333H3.33333V5.33333H2ZM12.6667 5.33333V3.33333H10.6667V2H14V5.33333H12.6667Z" fill="#295EF4" />
                            </svg>
                        </span>
                        <span >View</span>
                    </Link> */}

          <Link
            href={`/datasource/details/${item?.id}/${item?.ds_config?.ds_type === "semi_structured"
              ? "configuration"
              : "query"
              }`}
            className="flex items-center justify-center w-full px-4 py-2 space-x-1 text-[13px] font-medium tracking-wide bg-transparent rounded max-w-fit text-btn-primary-outline-text hover:bg-btn-primary hover:text-btn-primary-text group"
          >
            <span className="flex items-center justify-center">
              {
                item.ds_config.ds_type === "semi_structured"
                  ? (<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.33333 14V10H8.66667V11.3333H14V12.6667H8.66667V14H7.33333ZM2 12.6667V11.3333H6V12.6667H2ZM4.66667 10V8.66667H2V7.33333H4.66667V6H6V10H4.66667ZM7.33333 8.66667V7.33333H14V8.66667H7.33333ZM10 6V2H11.3333V3.33333H14V4.66667H11.3333V6H10ZM2 4.66667V3.33333H8.66667V4.66667H2Z" />
                  </svg>
                  )
                  : (<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.75521 12.1173L0.671875 11.334L4.00521 6.00065L6.00521 8.33398L8.67188 4.00065L10.4885 6.71732C10.233 6.72843 9.99132 6.75898 9.76354 6.80898C9.53576 6.85898 9.31076 6.92843 9.08854 7.01732L8.72188 6.46732L6.18854 10.584L4.17188 8.23398L1.75521 12.1173ZM14.3885 15.334L12.3052 13.2507C12.083 13.4062 11.8358 13.5229 11.5635 13.6007C11.2913 13.6784 11.0108 13.7173 10.7219 13.7173C9.88854 13.7173 9.18021 13.4257 8.59688 12.8423C8.01354 12.259 7.72188 11.5507 7.72188 10.7173C7.72188 9.88398 8.01354 9.17565 8.59688 8.59232C9.18021 8.00898 9.88854 7.71732 10.7219 7.71732C11.5552 7.71732 12.2635 8.00898 12.8469 8.59232C13.4302 9.17565 13.7219 9.88398 13.7219 10.7173C13.7219 11.0062 13.683 11.2868 13.6052 11.559C13.5274 11.8312 13.4108 12.084 13.2552 12.3173L15.3385 14.384L14.3885 15.334ZM10.7219 12.384C11.1885 12.384 11.583 12.2229 11.9052 11.9007C12.2274 11.5784 12.3885 11.184 12.3885 10.7173C12.3885 10.2507 12.2274 9.85621 11.9052 9.53399C11.583 9.21176 11.1885 9.05065 10.7219 9.05065C10.2552 9.05065 9.86076 9.21176 9.53854 9.53399C9.21632 9.85621 9.05521 10.2507 9.05521 10.7173C9.05521 11.184 9.21632 11.5784 9.53854 11.9007C9.86076 12.2229 10.2552 12.384 10.7219 12.384ZM12.2052 7.05065C11.9941 6.96176 11.7747 6.88954 11.5469 6.83398C11.3191 6.77843 11.083 6.7451 10.8385 6.73398L14.2552 1.33398L15.3385 2.11732L12.2052 7.05065Z" />
                  </svg>
                  )
              }
            </span>
            <span>{item.ds_config.ds_type === 'semi_structured' ? 'Setup' : 'Query'}</span>
          </Link>
        </div>
      </td>
    </tr>
  ));

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
          You haven’t connected any datasources yet. Get started by:
        </p>
        <p className="w-full max-w-2xl mx-auto text-base font-normal text-center text-secondary-text">
          Adding a New Datasource to bring in your data.
          Reviewing Existing Datasource Options to choose one that fits your needs.
          Let’s unify your data and unlock its potential!

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
          <span className="hidden xsm:block">Create Datasource</span>
          <span className="xsm:hidden">Create</span>
        </button>
      </div>
    );


  if (data.length === 0 && searchQuery === "")
    return (
      <div className="flex flex-col items-center w-full max-w-full mx-auto rounded-md py-10">
        <span className="flex items-center justify-center p-3 rounded-full bg-icon-secondary-bg" >
          <DatasourceIcon size={6} />
        </span>
        <p className="mt-2 text-sm font-medium text-primary-text" >
          Connect Your First Datasource
        </p>

        <p className="w-4/5 mt-1 max-w-2xl mx-auto text-[13px] font-normal text-center text-secondary-text">
          Data starts here! Connect to your key data sources to power your
          insights and analytics.
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
          <span className="hidden xsm:block">Create Datasource</span>
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
            <span className="hidden xsm:block">Create Datasource</span>
            <span className="xsm:hidden">Create</span>
          </button>

          <Link
            href="/datasource"
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
              No Datasources available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default DatasourcesTable;
