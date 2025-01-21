import React from "react";
import Loader from "../loader/Loader";
import { useRouter } from "next/router";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import { AssistantIcon } from "../Icons/icon";

const providers = [
  {
    key: "openai",
    name: "OpenAI",
    icon: "/assets/chatgpt-icon.svg",
    tooltipPlace: "top",
  },
  {
    key: "vertexai",
    name: "VertexAI",
    icon: "/assets/vertex-ai-seeklogo.svg",
    tooltipPlace: "top",
  },
  {
    key: "claudeai",
    name: "ClaudeAI",
    icon: "/assets/claude-ai-icon.svg",
    tooltipPlace: "bottom",
  },
  {
    key: "azure_openai",
    name: "Azure OpenAI",
    icon: "/assets/Microsoft_Azure.svg",
    tooltipPlace: "bottom",
  },
];

export const formatLastUpdatedAt = (isoDate) => {
  const date = new Date(isoDate);

  // Extract components
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Determine AM/PM and adjust hour format
  const isPM = hours >= 12;
  const formattedHour = isPM ? hours % 12 || 12 : hours;
  const period = isPM ? "PM" : "AM";

  // Combine into desired format
  return `${day}/${month}/${year}, ${formattedHour}:${minutes}${period}`;
};

export const Db_type = [
  { name: "spreadsheet", img: "/assets/spreadsheet.svg", label: "Download" },
  {
    name: "semi_structured",
    img: "/assets/spreadsheet.svg",
    label: "speadsheet",
  },
  { name: "bigquery", img: "/assets/google-bigquery.svg", label: "Big Query" },
  { name: "postgres", img: "/assets/postgresql.svg", label: "Postgresql" },
  { name: "mariadb", img: "/assets/vector.svg", label: "Mariadb" },
  { name: "snowflake", img: "/assets/snowflake.svg", label: "Snowflake" },
  { name: "mysql", img: "/assets/mysql-logo.svg", label: "My SQL" },
  { name: "athena", img: "/assets/AWS-Athena.svg", label: "AWS Athena" },
  { name: "databricks", img: "/assets/Databricks.svg", label: "Databricks" },
  { name: "redshift", img: "/assets/aws-redshift.svg", label: "AWS Redshift" },
  {
    name: "facebook_ads",
    img: "/assets/facebook_ads.svg",
    label: "Facebook Ads",
  },
  { name: "google_ads", img: "/assets/google_ads.svg", label: "Google Ads" },
  {
    name: "google_analytics",
    img: "/assets/google_analytics.svg",
    label: "Google Analytics",
  },
  { name: "shopify", img: "/assets/shopify.svg", label: "Shopify" },
  { name: "linkedin", img: "/assets/linkedin.svg", label: "linkedin" },
  { name: "pinterest", img: "/assets/pinterest.svg", label: "pinterest" },
  { name: "hubspot", img: "/assets/hubspot.svg", label: "hubspot" },
  {
    name: "snapchat-marketing",
    img: "/assets/snapchat-marketing.svg",
    label: "snapchat marketing",
  },
  {
    name: "tiktok-marketing",
    img: "/assets/tiktok-marketing.svg",
    label: "tiktok-marketing",
  },
  {
    name: "youtube-analytics",
    img: "/assets/youtube-analytics.svg",
    label: "youtube-analytics",
  },
  { name: "mailchimp", img: "/assets/mailchimp.svg", label: "mailchimp" },
];

export const getDbTypeImage = (dbTypeKey) => {
  const dbType = Db_type.find((db) => db.name === dbTypeKey);
  return dbType ? dbType.img : "/assets/empty-file.svg"; // Default image if no match is found
};

export const getProviderIcon = (providerKey) => {
  const provider = providers.find((p) => p.key === providerKey);
  return provider ? provider.icon : "/assets/empty-file.svg";
};

const AssistantsTable = ({
  data,
  isLoading = false,
  showCreateModal = () => {},
  theme,
  searchQuery = "",
  isListing = false,
  dataLength = null,
  next = () => {},
  hasMore = false,
  page = null,
  isHome = false
}) => {
  const columns = [
    "Name",
    "Description",
    "Last used at",
    // "Model used",
    "Datasources",
    "Action",
  ];
  const router = useRouter();
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

  const handleClick = (id) => {
    router.push(`/assistant/details/${id}`);
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
        <div className="flex space-x-2 overflow-hidden">
          <span className="flex items-center justify-center">
            <AssistantIcon size={4}/>
          </span>
          <span className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">
            {item.name}
          </span>
        </div>
      </td>

      <td className="px-3 text-[13px] font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
        {item.about || "No description available"}
      </td>

      <td className="px-3 text-[13px] font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text w-[120px] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
        {formatLastUpdatedAt(item.last_updated_at)}
      </td>

      {/* <td className="px-3 font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text w-[200px] max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap">
        <div className="flex items-center gap-2" key={item.label}>
          <img
            src={getProviderIcon(item?.llm_providers?.[0])}
            alt={"Icon"}
            className="w-4 h-4"
          />
          <span className="whitespace-nowrap">{item?.llm_models?.[0]}</span>
        </div>
      </td> */}

      <td className="px-3 font-normal text-left border-t cursor-pointer h-12 border-border-color text-primary-text w-[100px] max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-0.5">
            {item.datasources?.slice(0, 3).map((ds) => {
              let typeKey;

              if (ds.ds_type === "sql_generator") {
                typeKey = ds.db_type;
              } else if (ds.ds_type === "third_party") {
                typeKey = ds.connector_type;
              } else if (ds.ds_type === "semi_structured") {
                typeKey = "spreadsheet";
              }

              return (
                  <img
                    src={getDbTypeImage(typeKey)}
                    alt={ds.db_type}
                    className="object-cover w-4 aspect-square"
                  />
              );
            })}
            {item.datasources.length > 3 && (
              <span className="flex items-center justify-center rounded-full text-[13px] font-medium text-[#a1a1a1]">
                +{item.datasources.length - 3}
              </span>
            )}
          </div>
        </div>
      </td>


      <td className="text-[13px] border-t border-border-color">
        <div className="flex text-[13px]">
          {/* <a
                        href={`/assistant/details/${item.id}`}
                        className="flex items-center justify-center w-full h-5 px-3 space-x-1 text-[13px] font-medium tracking-wide bg-transparent rounded max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover group"
                    >
                        <span className="flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
                                <path d="M2 14V10.6667H3.33333V12.6667H5.33333V14H2ZM10.6667 14V12.6667H12.6667V10.6667H14V14H10.6667ZM2 5.33333V2H5.33333V3.33333H3.33333V5.33333H2ZM12.6667 5.33333V3.33333H10.6667V2H14V5.33333H12.6667Z" fill="#295EF4" />
                            </svg>
                        </span>
                        <span >View</span>
                    </a> */}
          <a
            href={`/assistant/chat/${item.id}`}
            className="flex items-center justify-center w-full px-4 py-2 space-x-1 text-[13px] font-medium tracking-wide bg-transparent rounded max-w-fit text-btn-primary-outline-text hover:bg-btn-primary hover:text-btn-primary-text group"
          >
            <span className="flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentcolor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.6693 14.6654L12.0026 11.9987H5.33594C4.96927 11.9987 4.65538 11.8681 4.39427 11.607C4.13316 11.3459 4.0026 11.032 4.0026 10.6654V9.9987H11.3359C11.7026 9.9987 12.0165 9.86814 12.2776 9.60703C12.5387 9.34592 12.6693 9.03203 12.6693 8.66536V3.9987H13.3359C13.7026 3.9987 14.0165 4.12925 14.2776 4.39036C14.5387 4.65148 14.6693 4.96536 14.6693 5.33203V14.6654ZM2.66927 8.11536L3.4526 7.33203H10.0026V2.66536H2.66927V8.11536ZM1.33594 11.332V2.66536C1.33594 2.2987 1.46649 1.98481 1.7276 1.7237C1.98872 1.46259 2.3026 1.33203 2.66927 1.33203H10.0026C10.3693 1.33203 10.6832 1.46259 10.9443 1.7237C11.2054 1.98481 11.3359 2.2987 11.3359 2.66536V7.33203C11.3359 7.6987 11.2054 8.01259 10.9443 8.2737C10.6832 8.53481 10.3693 8.66536 10.0026 8.66536H4.0026L1.33594 11.332Z"
                />
              </svg>
            </span>
            <span>Chat</span>
          </a>
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

  if (isHome && data.length === 0 )
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
          You haven’t used any assistants yet. Get started by:
        </p>

        <p className="w-full max-w-2xl mx-auto text-base font-normal text-center text-secondary-text">
          Creating a New Assistant tailored to your needs. Exploring Existing Assistants to start chatting and getting insights right away. Ready to simplify your workflow?
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
          <span className="hidden xsm:block">Create Assistant</span>
          <span className="xsm:hidden">Create</span>
        </button>
      </div>
    );

  if (data.length === 0 && searchQuery === "")
    return (
      <div className="flex flex-col items-center w-full max-w-full mx-auto rounded-md py-10">
        <span className="flex items-center justify-center p-3 rounded-full bg-icon-secondary-bg" >
            <AssistantIcon size={6} />
        </span>
        <p className="mt-2 text-sm font-medium text-primary-text" >
          Let’s Create Your First Assistant
        </p>

        <p className="w-4/5 mt-1 max-w-2xl mx-auto text-[13px] font-normal text-center text-secondary-text">
          Welcome! Start by creating an assistant to chat and get instant data
          responses. Save time by accessing relevant data directly through your
          personalized assistant.
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
          <span className="hidden xsm:block">Create Assistant</span>
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
          className="w-6 h-6 stroke-secondary-text"
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
            <span className="hidden xsm:block">Create Assistant</span>
            <span className="xsm:hidden">Create</span>
          </button>

          <Link
            href="/assistant"
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
      <thead className="bg-primary text-primary-text !sticky top-0 left-0 right-0 z-10">
        <tr className="">{tableHeaders}</tr>
      </thead>
      <tbody className="overflow-y-auto w-full max-h-[500px] ">
        {data?.length > 0 ? (
          tableRows
        ) : (
          <tr>
            <td colSpan="6" className="py-4 text-center text-secondary-text">
              No assistant available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default AssistantsTable;
