import React, { useEffect, useRef, useState } from "react";
import SuccessModal from "../Modal/SuccessModal";
import { useRouter } from "next/router";
import {
  useAccountsPermissionQuery,
  useGetConnectorsStatusQuery,
  useUpdateSourceMutation,
} from "@/store/datasource";
import { useSession } from "next-auth/react";
import { useMultistepForm } from "@/hooks/useMultistepForm";
import useDebounce from "@/hooks/useDebounce";
import base64url from "base64url";
import crypto from "crypto";
import { useTheme } from "@/hooks/useTheme";
import ErrorModal from "../Modal/ErrorModal";

const UpdateConnectorInfo = ({ show, setShow, data, refetch }) => {
  const [currentConnector, setCurrentConnector] = useState(
    data?.ds_config?.connector.connector_type || ""
  );
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [datasourceId, setDatasourceId] = useState(null);
  const [isHideUpdate, setIsHideUpdate] = useState(false);
  const [showError, setShowError] = useState(false);

  const router = useRouter();
  const modalRef = useRef(null);
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

  const [updateSource, { isLoading: updateLoading, error: updateError }] =
    useUpdateSourceMutation();

  const ComponentData = [
    {
      name: "Select Connector",
      component: (
        <Connector
          currentConnector={currentConnector}
          setConnector={setCurrentConnector}
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
          connector={data.ds_config.connector}
          setIsHideUpdate={setIsHideUpdate}
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

  useEffect(() => {
    if (data?.ds_config?.connector) {
      goTo(1);
    }
  }, [data]);

  const handleUpdate = () => {
    if (!isLastStep) return next();

    const payload = {
      name: currentConnector,
      selected_properties: selectedColumns,
    };

    updateSource({
      datasource_id: router.query.slug,
      payload: payload,
    }).then((response) => {
      if (response) {
        if (response.data) {
          refetch();
          setShow(false);
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

              <span>Datasource update</span>

              <div
                className={`py-1 px-3 text-xs flex items-center justify-center space-x-2 rounded-full text-orange-400 w-fit ${
                  theme === "dark" ? "bg-[#36270C]" : "bg-orange-100"
                }`}
              >
                <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                <span>Third-Party</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full px-4 pt-4 space-y-3">
            <div className="relative flex flex-col justify-between w-full h-full space-y-4">
              {step.component}

              {isHideUpdate || (
                <div className="sticky bottom-0 left-0 z-50 flex items-center justify-between w-full py-2 bg-page">
                  {/* {isLastStep ? (
                  <button
                    type="button"
                    className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
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
                  <span></span>
                )} */}

                  <span></span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                      disabled={!currentConnector || updateLoading}
                      onClick={handleUpdate}
                    >
                      {updateLoading && (
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

                      {isLastStep ? <div>Update</div> : <div>Next</div>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* {showSuccessModal && (
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
            )} */}
          </div>
        </div>
      </div>

      {showError && (
        <ErrorModal
          show={showError}
          setShow={setShowError}
          heading="Error Found"
          title=""
          description={updateError?.data?.message}
          secondaryBtn="Close"
          secondaryChange={() => setShowError(false)}
        />
      )}
    </div>
  );
};

export default UpdateConnectorInfo;

const Connector = ({ currentConnector, setConnector, back }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: getConnectorsStatus,
    isLoading: getConnectorsStatusLoading,
    error: getConnectorsStatusError,
    refetch: refetchConnectorsStatus,
  } = useGetConnectorsStatusQuery({});

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
      console.log("Error linking account:", error);
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

          <div className="grid grid-cols-2 gap-2">
            {getConnectorsStatus?.map((item) => {
              return (
                <div
                  className={`flex flex-col items-center justify-center p-4 space-y-2 border rounded-md cursor-pointer  ${
                    item?.connector === currentConnector
                      ? "border-border-hover-color"
                      : "border-border-color hover:border-border-hover-color"
                  }`}
                  onClick={() =>
                    handleConnector(item, item?.status, item?.connector)
                  }
                >
                  <img
                    src={`/assets/${item?.connector}.svg`}
                    alt="google_ads"
                    className="object-cover w-8 aspect-auto"
                  />

                  <p className="text-sm font-medium 2xl:text-base text-primary-text">
                    {item?.connector === "facebook_ads" && "Facebook Ads"}
                    {item?.connector === "google_ads" && "Google Ads"}
                    {item?.connector === "google_analytics" &&
                      "Google Analytics"}
                    {item?.connector === "shopify" && "Shopify"}
                  </p>

                  <div className="flex items-center space-x-2">
                    {item?.status === "connected" ? (
                      <div className="flex items-center space-x-3">
                        <p className="text-xs font-medium leading-6 text-secondary-text">
                          {item?.username}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center justify-center">
                          <svg
                            viewBox="0 0 15 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                          >
                            <path
                              d="M6.83594 7.33268H4.16927C3.24705 7.33268 2.46094 7.00768 1.81094 6.35768C1.16094 5.70768 0.835938 4.92157 0.835938 3.99935C0.835938 3.07713 1.16094 2.29102 1.81094 1.64102C2.46094 0.991016 3.24705 0.666016 4.16927 0.666016H6.83594V1.99935H4.16927C3.61372 1.99935 3.14149 2.19379 2.7526 2.58268C2.36372 2.97157 2.16927 3.44379 2.16927 3.99935C2.16927 4.5549 2.36372 5.02713 2.7526 5.41602C3.14149 5.8049 3.61372 5.99935 4.16927 5.99935H6.83594V7.33268ZM4.83594 4.66602V3.33268H10.1693V4.66602H4.83594ZM8.16927 7.33268V5.99935H10.8359C11.3915 5.99935 11.8637 5.8049 12.2526 5.41602C12.6415 5.02713 12.8359 4.5549 12.8359 3.99935C12.8359 3.44379 12.6415 2.97157 12.2526 2.58268C11.8637 2.19379 11.3915 1.99935 10.8359 1.99935H8.16927V0.666016H10.8359C11.7582 0.666016 12.5443 0.991016 13.1943 1.64102C13.8443 2.29102 14.1693 3.07713 14.1693 3.99935C14.1693 4.92157 13.8443 5.70768 13.1943 6.35768C12.5443 7.00768 11.7582 7.33268 10.8359 7.33268H8.16927Z"
                              fill="#295EF4"
                            />
                          </svg>
                        </span>

                        <p className="text-xs font-medium leading-6 text-active-text">
                          Connect
                        </p>
                      </div>
                    )}
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

// const ConnectionDetails = ({
//   currentConnector,
//   selectedColumns,
//   setSelectedColumns,
//   connector,
//   setIsHideUpdate,
// }) => {
//   const router = useRouter();
//   const session = useSession();

//   const { theme } = useTheme();

//   const {
//     data: getConnectorsStatus,
//     isLoading: getConnectorsStatusLoading,
//     error: getConnectorsStatusError,
//     refetch: refetchConnectorsStatus,
//   } = useGetConnectorsStatusQuery({});

//   const {
//     data: getAccountsPermission,
//     isLoading: accountsPermissionLoading,
//     error: getAccountsPermissionError,
//     refetch,
//   } = useAccountsPermissionQuery(
//     { datasource_id: router.query.slug },
//     { skip: !router.query.slug, refetchOnMountOrArgChange: true }
//   );

//   useEffect(() => {
//     if (
//       getAccountsPermissionError &&
//       getAccountsPermissionError.data.type === "InvalidSocialConnectionError"
//     ) {
//       setIsHideUpdate(true);
//     } else {
//       setIsHideUpdate(false);
//     }
//   }, [getAccountsPermissionError]);

//   const getFilterInfo = getConnectorsStatus?.find((item) => {
//     return item.connector === currentConnector;
//   });

//   useEffect(() => {
//     if (getAccountsPermission) {
//       const initialSelectedColumns = {};
//       Object.entries(getAccountsPermission).forEach(([id, account]) => {
//         if (account.status === "enabled") {
//           initialSelectedColumns[id] = account.name;
//         }
//       });
//       setSelectedColumns(initialSelectedColumns);
//     }
//   }, [getAccountsPermission]);

//   const handleToggle = (id, name, isChecked) => {
//     const updatedColumns = { ...selectedColumns };

//     if (isChecked) {
//       updatedColumns[id] = name;
//     } else {
//       delete updatedColumns[id];
//     }

//     setSelectedColumns(updatedColumns);
//   };

//   if (getConnectorsStatusLoading || accountsPermissionLoading) {
//     return (
//       <div className="flex items-center justify-center w-full h-full space-y-4">
//         <div role="status">
//           <svg
//             aria-hidden="true"
//             className="w-4 h-4 animate-spin text-primary-text fill-btn-primary"
//             viewBox="0 0 100 101"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
//               fill="currentColor"
//             />
//             <path
//               d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
//               fill="currentFill"
//             />
//           </svg>

//           <span className="sr-only">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   const getConnector = [getFilterInfo];

//   function parseJwt(token) {
//     if (!token) {
//       return;
//     }
//     const base64Url = token.split(".")[1];
//     const base64 = base64Url.replace("-", "+").replace("_", "/");
//     return JSON.parse(window.atob(base64));
//   }

//   const getConnectionLink = (provider) => {
//     const token = session.data.accessToken;

//     const sessionToken = parseJwt(token);
//     const session_state = sessionToken.sid;

//     const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
//     const authServerRoot = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL;
//     const redirectUri = encodeURIComponent(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/account-link-callback`
//     );

//     const nonce = Math.random().toString(36).substring(2, 15);
//     const input = nonce + session_state + clientId + provider;
//     const hash = base64url(crypto.createHash("sha256").update(input).digest());

//     const linkUrl = `${authServerRoot}/broker/${provider}/link?client_id=${clientId}&redirect_uri=${redirectUri}&nonce=${nonce}&hash=${hash}`;

//     return linkUrl;
//   };

//   const handleLinkAccount = async (provider, onSuccess) => {
//     try {
//       const data = getConnectionLink(provider);

//       if (data) {
//         const linkWindow = window.open(data, "_blank", "width=500,height=600");

//         const interval = setInterval(async () => {
//           if (linkWindow.closed) {
//             clearInterval(interval);
//             onSuccess();
//           }
//         }, 1000);
//       }
//     } catch (error) {
//       console.log("Error linking account:", error);
//       alert("Failed to initiate account linking.");
//     }
//   };

//   const onSuccess = () => {
//     refetchConnectorsStatus();
//     refetch();
//   };

//   const handleConnector = (item) => {
//     handleLinkAccount(item.heimdall_alias, onSuccess);
//   };

//   const isStatusRestricted = Object.entries(getAccountsPermission || {}).some(
//     ([id, account]) => {
//       return account?.status === "restricted";
//     }
//   );

//   if (
//     getAccountsPermissionError &&
//     getAccountsPermissionError.data.type === "InvalidSocialConnectionError"
//   ) {
//     return (
//       <div className="grid grid-cols-2 gap-2">
//         {getConnector?.map((item) => {
//           return (
//             <div
//               className={`flex flex-col items-center justify-center p-4 space-y-2 border rounded-md cursor-pointer  ${
//                 item?.connector === currentConnector
//                   ? "border-border-hover-color"
//                   : "border-border-color hover:border-border-hover-color"
//               }`}
//               onClick={() =>
//                 handleConnector(item, item?.status, item?.connector)
//               }
//             >
//               <img
//                 src={`/assets/${item?.connector}.svg`}
//                 alt="google_ads"
//                 className="object-cover w-8 aspect-auto"
//               />

//               <p className="text-sm font-medium 2xl:text-base text-primary-text">
//                 {item?.connector === "facebook_ads" && "Facebook Ads"}
//                 {item?.connector === "google_ads" && "Google Ads"}
//                 {item?.connector === "google_analytics" && "Google Analytics"}
//                 {item?.connector === "shopify" && "Shopify"}
//               </p>

//               <div className="flex items-center space-x-2">
//                 {item?.status === "connected" ? (
//                   <div className="flex items-center space-x-3">
//                     <p className="text-xs font-medium leading-6 text-secondary-text">
//                       {item?.username}
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="flex items-center space-x-2">
//                     <span className="flex items-center justify-center">
//                       <svg
//                         viewBox="0 0 15 8"
//                         fill="none"
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="w-4 h-4"
//                       >
//                         <path
//                           d="M6.83594 7.33268H4.16927C3.24705 7.33268 2.46094 7.00768 1.81094 6.35768C1.16094 5.70768 0.835938 4.92157 0.835938 3.99935C0.835938 3.07713 1.16094 2.29102 1.81094 1.64102C2.46094 0.991016 3.24705 0.666016 4.16927 0.666016H6.83594V1.99935H4.16927C3.61372 1.99935 3.14149 2.19379 2.7526 2.58268C2.36372 2.97157 2.16927 3.44379 2.16927 3.99935C2.16927 4.5549 2.36372 5.02713 2.7526 5.41602C3.14149 5.8049 3.61372 5.99935 4.16927 5.99935H6.83594V7.33268ZM4.83594 4.66602V3.33268H10.1693V4.66602H4.83594ZM8.16927 7.33268V5.99935H10.8359C11.3915 5.99935 11.8637 5.8049 12.2526 5.41602C12.6415 5.02713 12.8359 4.5549 12.8359 3.99935C12.8359 3.44379 12.6415 2.97157 12.2526 2.58268C11.8637 2.19379 11.3915 1.99935 10.8359 1.99935H8.16927V0.666016H10.8359C11.7582 0.666016 12.5443 0.991016 13.1943 1.64102C13.8443 2.29102 14.1693 3.07713 14.1693 3.99935C14.1693 4.92157 13.8443 5.70768 13.1943 6.35768C12.5443 7.00768 11.7582 7.33268 10.8359 7.33268H8.16927Z"
//                           fill="#295EF4"
//                         />
//                       </svg>
//                     </span>

//                     <p className="text-xs font-medium leading-6 text-active-text">
//                       Connect
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col w-full h-full">
//       <div className="flex items-center justify-between px-3 py-2 text-base font-normal h-9 bg-secondary-bg text-primary-text">
//         <div className="text-base font-normal text-primary-text">
//           Connection Details
//         </div>

//         <div
//           className="flex items-center space-x-1 cursor-pointer group"
//           onClick={() =>
//             handleConnector(
//               getFilterInfo,
//               getFilterInfo?.status,
//               getFilterInfo?.connector
//             )
//           }
//         >
//           <span className="flex items-center justify-center">
//             <svg
//               viewBox="0 0 12 12"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-3 h-3 fill-icon-color group-hover:fill-icon-color-hover"
//             >
//               <path d="M5.99984 11.3333C4.51095 11.3333 3.24984 10.8167 2.2165 9.78332C1.18317 8.74999 0.666504 7.48888 0.666504 5.99999C0.666504 4.5111 1.18317 3.24999 2.2165 2.21666C3.24984 1.18332 4.51095 0.666656 5.99984 0.666656C6.7665 0.666656 7.49984 0.82499 8.19984 1.14166C8.89984 1.45832 9.49984 1.9111 9.99984 2.49999V0.666656H11.3332V5.33332H6.6665V3.99999H9.4665C9.11095 3.37777 8.62484 2.88888 8.00817 2.53332C7.3915 2.17777 6.72206 1.99999 5.99984 1.99999C4.88873 1.99999 3.94428 2.38888 3.1665 3.16666C2.38873 3.94443 1.99984 4.88888 1.99984 5.99999C1.99984 7.1111 2.38873 8.05555 3.1665 8.83332C3.94428 9.6111 4.88873 9.99999 5.99984 9.99999C6.85539 9.99999 7.62762 9.75555 8.3165 9.26666C9.00539 8.77777 9.48873 8.13332 9.7665 7.33332H11.1665C10.8554 8.5111 10.2221 9.47221 9.2665 10.2167C8.31095 10.9611 7.22206 11.3333 5.99984 11.3333Z" />
//             </svg>
//           </span>

//           <p className="text-xs font-medium text-secondary-text group-hover:text-primary-text">
//             Reconnect
//           </p>
//         </div>
//       </div>

//       <div className="flex flex-col w-full px-3 py-3 space-y-2">
//         <div className="grid w-full grid-cols-12">
//           <div className="col-span-3">
//             <p className="text-xs font-medium text-primary-text">
//               Selected Connector
//             </p>
//           </div>

//           <div className="col-span-9">
//             <p className="text-xs font-medium text-secondary-text">
//               {connector?.connector_type === "facebook_ads" && "Facebook Ads"}
//               {connector?.connector_type === "google_ads" && "Google Ads"}
//               {connector?.connector_type === "google_analytics" &&
//                 "Google Analytics"}
//               {connector?.connector_type === "shopify" && "Shopify"}
//             </p>
//           </div>
//         </div>

//         <div className="grid w-full grid-cols-12">
//           <div className="col-span-3">
//             <p className="text-xs font-medium text-primary-text">Username</p>
//           </div>

//           <div className="col-span-9">
//             <p className="text-xs font-medium text-secondary-text">
//               {getFilterInfo?.username}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="px-3 py-2 text-base font-normal h-9 bg-secondary-bg text-primary-text">
//         Choose the required accounts from your connections
//       </div>

//       <div className="flex flex-col py-3 space-y-2">
//         {Object.entries(getAccountsPermission || {}).map(([id, account]) => {
//           const isChecked = selectedColumns.hasOwnProperty(id);
//           return (
//             <SwitchToggle
//               key={id}
//               data={{ id, name: account.name }}
//               checked={isChecked}
//               onToggle={(isChecked) =>
//                 handleToggle(id, account.name, isChecked)
//               }
//               status={account.status}
//             />
//           );
//         })}

//         {Object.keys(getAccountsPermission || {}).length === 0 && (
//           <div className="w-full h-48 col-span-12 border rounded-md border-border-color">
//             <div className="flex flex-col items-center justify-center w-full h-full space-y-2">
//               <span className="flex items-center justify-center">
//                 <svg
//                   viewBox="0 0 21 21"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="w-5 h-5 fill-icon-color"
//                 >
//                   <path d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 7.5 11.0208 7.40417 11.2125 7.2125C11.4042 7.02083 11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 11.2125 5.7875C11.0208 5.59583 10.7833 5.5 10.5 5.5C10.2167 5.5 9.97917 5.59583 9.7875 5.7875C9.59583 5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 9.59583 7.02083 9.7875 7.2125C9.97917 7.40417 10.2167 7.5 10.5 7.5ZM10.5 20.5C9.11667 20.5 7.81667 20.2375 6.6 19.7125C5.38333 19.1875 4.325 18.475 3.425 17.575C2.525 16.675 1.8125 15.6167 1.2875 14.4C0.7625 13.1833 0.5 11.8833 0.5 10.5C0.5 9.11667 0.7625 7.81667 1.2875 6.6C1.8125 5.38333 2.525 4.325 3.425 3.425C4.325 2.525 5.38333 1.8125 6.6 1.2875C7.81667 0.7625 9.11667 0.5 10.5 0.5C11.8833 0.5 13.1833 0.7625 14.4 1.2875C15.6167 1.8125 16.675 2.525 17.575 3.425C18.475 4.325 19.1875 5.38333 19.7125 6.6C20.2375 7.81667 20.5 9.11667 20.5 10.5C20.5 11.8833 20.2375 13.1833 19.7125 14.4C19.1875 15.6167 18.475 16.675 17.575 17.575C16.675 18.475 15.6167 19.1875 14.4 19.7125C13.1833 20.2375 11.8833 20.5 10.5 20.5ZM10.5 18.5C12.7333 18.5 14.625 17.725 16.175 16.175C17.725 14.625 18.5 12.7333 18.5 10.5C18.5 8.26667 17.725 6.375 16.175 4.825C14.625 3.275 12.7333 2.5 10.5 2.5C8.26667 2.5 6.375 3.275 4.825 4.825C3.275 6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 3.275 14.625 4.825 16.175C6.375 17.725 8.26667 18.5 10.5 18.5Z" />
//                 </svg>
//               </span>

//               <span className="text-xs font-medium tracking-wider 2xl:text-sm text-primary-text">
//                 No Accounts Found
//               </span>

//               <span className="text-xs font-normal tracking-wider text-secondary-text">
//                 Please reconnect again.
//               </span>
//             </div>
//           </div>
//         )}
//       </div>

//       {isStatusRestricted && (
//         <div
//           className={`flex flex-col w-full px-3 py-2 space-y-2 rounded-md ${
//             theme === "dark" ? "bg-[#36270C]" : "bg-orange-100"
//           }`}
//         >
//           <div className="flex items-center w-full space-x-2">
//             <span className="flex items-center justify-center">
//               <svg
//                 viewBox="0 0 16 16"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//                 className={`w-4 h-4  ${
//                   theme === "dark" ? "fill-[#fb923c]" : "fill-orange-400"
//                 }`}
//               >
//                 <circle cx="7.9974" cy="8.00033" r="5.33333" fill="#F6F6F6" />
//                 <path d="M8 12C8.22667 12 8.41667 11.9233 8.57 11.77C8.72333 11.6167 8.8 11.4267 8.8 11.2C8.8 10.9733 8.72333 10.7833 8.57 10.63C8.41667 10.4767 8.22667 10.4 8 10.4C7.77333 10.4 7.58333 10.4767 7.43 10.63C7.27667 10.7833 7.2 10.9733 7.2 11.2C7.2 11.4267 7.27667 11.6167 7.43 11.77C7.58333 11.9233 7.77333 12 8 12ZM7.2 8.8H8.8V4H7.2V8.8ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z" />
//               </svg>
//             </span>

//             <span className="text-xs font-medium text-orange-400">Warning</span>
//           </div>

//           <div
//             className={`text-xs font-normal leading-5 text-primary-text ${
//               theme === "dark" ? "text-primary-text" : "text-[#414551]"
//             }`}
//           >
//             Some accounts previously connected to this data source will no
//             longer be accessible. These accounts will stop syncing, but their
//             data will remain available.
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const SwitchToggle = ({ data, checked, status, onToggle }) => {
//   return (
//     <label
//       className={`inline-flex items-center cursor-pointer ${
//         status === "restricted" && "opacity-50"
//       }`}
//     >
//       <input
//         type="checkbox"
//         checked={checked}
//         className="sr-only peer"
//         onChange={(e) => onToggle(e.target.checked)}
//         disabled={status === "restricted"}
//       />
//       <div
//         className={`relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7]`}
//       ></div>
//       <p
//         className={`text-sm w-full flex justify-between font-medium ms-3 ${
//           checked ? "text-primary-text" : "text-secondary-text"
//         }`}
//       >
//         <span>{data?.name}</span>{" "}
//         {status === "restricted" && (
//           <span className="text-orange-400">No access</span>
//         )}
//       </p>
//     </label>
//   );
// };

const ConnectionDetails = ({
  currentConnector,
  selectedColumns,
  setSelectedColumns,
  connector,
  setIsHideUpdate,
}) => {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [accessibleAccounts, setAccessibleAccounts] = useState([]);
  const router = useRouter();
  const session = useSession();
  const { theme } = useTheme();

  const {
    data: getConnectorsStatus,
    isLoading: getConnectorsStatusLoading,
    error: getConnectorsStatusError,
    refetch: refetchConnectorsStatus,
  } = useGetConnectorsStatusQuery({});

  const {
    data: getAccountsPermission,
    isLoading: accountsPermissionLoading,
    error: getAccountsPermissionError,
    refetch,
    isFetching,
  } = useAccountsPermissionQuery(
    { datasource_id: router.query.slug, skip: page * 10, limit: 10 },
    { skip: !router.query.slug, refetchOnMountOrArgChange: true }
  );

  const [hasRestricted, setHasRestricted] = useState(false);

  useEffect(() => {
    if (
      getAccountsPermissionError &&
      getAccountsPermissionError.data?.type === "InvalidSocialConnectionError"
    ) {
      setIsHideUpdate(true);
    } else {
      setIsHideUpdate(false);
    }
  }, [getAccountsPermissionError, setIsHideUpdate]);

  useEffect(() => {
    if (getAccountsPermission) {
      const { enabled_accounts = [] } = getAccountsPermission;
      const initialSelectedColumns = {};

      enabled_accounts.forEach((acc) => {
        initialSelectedColumns[acc.property_id] = acc.property_name;
      });

      setSelectedColumns(initialSelectedColumns);

      setHasRestricted(
        (getAccountsPermission?.restricted_accounts || []).length > 0
      );
    }
  }, [getAccountsPermission, setSelectedColumns]);

  useEffect(() => {
    if (getAccountsPermission) {
      let accessibleAccount = getAccountsPermission?.accessible_accounts || [];

      accessibleAccount = accessibleAccount.filter(
        (acc) =>
          !enabledAccounts.some((en) => en.property_id === acc.property_id)
      );

      setAccessibleAccounts(accessibleAccount);
      setHasMore(getAccountsPermission?.accessible_accounts?.length === 10);
    }
  }, [getAccountsPermission]);

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

    let returnUrl;

    if (provider === "google") {
      returnUrl = `${authServerRoot}/broker/${provider}/link?client_id=${clientId}&redirect_uri=${redirectUri}&nonce=${nonce}&hash=${hash}&prompt=consent`;
    } else {
      returnUrl = `${authServerRoot}/broker/${provider}/link?client_id=${clientId}&redirect_uri=${redirectUri}&nonce=${nonce}&hash=${hash}`;
    }

    return returnUrl;
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
      console.log("Error linking account:", error);
      alert("Failed to initiate account linking.");
    }
  };

  const onSuccess = () => {
    refetchConnectorsStatus();
    refetch();
  };

  const handleConnectorReconnect = (item) => {
    handleLinkAccount(item?.heimdall_alias, onSuccess);
  };

  const handleToggle = (propertyId, propertyName, isChecked) => {
    const updatedColumns = { ...selectedColumns };
    if (isChecked) {
      updatedColumns[propertyId] = propertyName;
    } else {
      delete updatedColumns[propertyId];
    }
    setSelectedColumns(updatedColumns);
  };

  const fetchMoreAccountsPermissions = () => {
    if (!accountsPermissionLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
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

  if (getConnectorsStatusLoading || accountsPermissionLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full space-y-4">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-4 h-4 animate-spin text-primary-text fill-btn-primary"
            viewBox="0 0 100 101"
            fill="none"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 
                22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 
                50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 
                73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 
                9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 
                33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 
                15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 
                1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 
                41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 
                6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 
                10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 
                10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 
                15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 
                25.841C84.9175 28.9121 86.7997 32.2913 88.1811 
                35.8758C89.083 38.2158 91.5421 39.6781 93.9676 
                39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // const restrictedAccounts = getAccountsPermission?.restricted_accounts || [];
  // const enabledAccounts = getAccountsPermission?.enabled_accounts || [];
  // const accessibleAccounts = getAccountsPermission?.accessible_accounts || [];

  const restrictedAccounts = getAccountsPermission?.restricted_accounts || [];
  const enabledAccounts = getAccountsPermission?.enabled_accounts || [];

  const allAccounts = [
    ...restrictedAccounts.map((acc) => ({ ...acc, status: "restricted" })),
    ...enabledAccounts.map((acc) => ({ ...acc, status: "enabled" })),
    ...accessibleAccounts.map((acc) => ({ ...acc, status: "accessible" })),
  ];

  const getFilterInfo = getConnectorsStatus?.find(
    (item) => item?.connector === currentConnector
  );

  if (
    restrictedAccounts.length === 0 &&
    enabledAccounts.length === 0 &&
    accessibleAccounts.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-2 border rounded-md border-border-color">
        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 fill-icon-color"
          >
            <path
              d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 7.5 11.0208 7.40417 11.2125 7.2125C11.4042 
              7.02083 11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 11.2125 5.7875C11.0208 
              5.59583 10.7833 5.5 10.5 5.5C10.2167 5.5 9.97917 5.59583 9.7875 5.7875C9.59583 
              5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 9.59583 7.02083 9.7875 7.2125C9.97917 
              7.40417 10.2167 7.5 10.5 7.5ZM10.5 20.5C9.11667 20.5 7.81667 20.2375 6.6 19.7125C5.38333 
              19.1875 4.325 18.475 3.425 17.575C2.525 16.675 1.8125 15.6167 1.2875 
              14.4C0.7625 13.1833 0.5 11.8833 0.5 10.5C0.5 9.11667 0.7625 7.81667 
              1.2875 6.6C1.8125 5.38333 2.525 4.325 3.425 3.425C4.325 2.525 
              5.38333 1.8125 6.6 1.2875C7.81667 0.7625 9.11667 0.5 10.5 0.5C11.8833 
              0.5 13.1833 0.7625 14.4 1.2875C15.6167 1.8125 16.675 2.525 17.575 
              3.425C18.475 4.325 19.1875 5.38333 19.7125 6.6C20.2375 7.81667 20.5 
              9.11667 20.5 10.5C20.5 11.8833 20.2375 13.1833 19.7125 
              14.4C19.1875 15.6167 18.475 16.675 17.575 17.575C16.675 18.475 
              15.6167 19.1875 14.4 19.7125C13.1833 20.2375 11.8833 20.5 10.5 
              20.5ZM10.5 18.5C12.7333 18.5 14.625 17.725 16.175 16.175C17.725 
              14.625 18.5 12.7333 18.5 10.5C18.5 8.26667 17.725 6.375 16.175 
              4.825C14.625 3.275 12.7333 2.5 10.5 2.5C8.26667 2.5 6.375 3.275 
              4.825 4.825C3.275 6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 3.275 
              14.625 4.825 16.175C6.375 17.725 8.26667 18.5 10.5 18.5Z"
            />
          </svg>
        </span>
        <span className="text-xs font-medium 2xl:text-sm text-primary-text">
          No Accounts Found
        </span>
        <span className="text-xs font-normal text-secondary-text">
          Please reconnect again.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between px-3 py-2 text-base font-normal h-9 bg-secondary-bg text-primary-text">
        <div className="text-base font-normal text-primary-text">
          Connection Details
        </div>
        <div
          className="flex items-center space-x-1 cursor-pointer group"
          onClick={() => handleConnectorReconnect(getFilterInfo)}
        >
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 fill-icon-color group-hover:fill-icon-color-hover"
            >
              <path
                d="M5.99984 11.3333C4.51095 11.3333 3.24984 10.8167 2.2165 9.78332C1.18317 8.74999 0.666504 
                7.48888 0.666504 5.99999C0.666504 4.5111 1.18317 3.24999 2.2165 2.21666C3.24984 1.18332 
                4.51095 0.666656 5.99984 0.666656C6.7665 0.666656 7.49984 0.82499 8.19984 1.14166C8.89984 
                1.45832 9.49984 1.9111 9.99984 2.49999V0.666656H11.3332V5.33332H6.6665V3.99999H9.4665C9.11095 
                3.37777 8.62484 2.88888 8.00817 2.53332C7.3915 2.17777 6.72206 1.99999 5.99984 1.99999C4.88873 
                1.99999 3.94428 2.38888 3.1665 3.16666C2.38873 3.94443 1.99984 4.88888 1.99984 5.99999C1.99984 
                7.1111 2.38873 8.05555 3.1665 8.83332C3.94428 9.6111 4.88873 9.99999 5.99984 9.99999C6.85539 
                9.99999 7.62762 9.75555 8.3165 9.26666C9.00539 8.77777 9.48873 8.13332 9.7665 7.33332H11.1665C10.8554 
                8.5111 10.2221 9.47221 9.2665 10.2167C8.31095 10.9611 7.22206 11.3333 5.99984 11.3333Z"
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
            <p className="text-xs font-medium text-secondary-text">
              {connector?.connector_type === "facebook_ads" && "Facebook Ads"}
              {connector?.connector_type === "google_ads" && "Google Ads"}
              {connector?.connector_type === "google_analytics" &&
                "Google Analytics"}
              {connector?.connector_type === "shopify" && "Shopify"}
            </p>
          </div>
        </div>
        <div className="grid w-full grid-cols-12">
          <div className="col-span-3">
            <p className="text-xs font-medium text-primary-text">Username</p>
          </div>
          <div className="col-span-9">
            <p className="text-xs font-medium text-secondary-text">
              {getFilterInfo?.username || "Not connected"}
            </p>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="px-3 py-2 text-base font-normal h-9 bg-secondary-bg text-primary-text">
        Choose the required accounts from your connections
      </div>

      {isFetching || (
        <div className="overflow-y-auto recent__bar max-h-56">
          {allAccounts.length > 0 && (
            <div className="flex flex-col py-3 space-y-2">
              {allAccounts.map((acc) => {
                const isChecked = !!selectedColumns[acc.property_id];
                return (
                  <SwitchToggle
                    key={acc.property_id}
                    data={{ id: acc.property_id, name: acc.property_name }}
                    checked={isChecked}
                    status={acc.status}
                    onToggle={(checkedValue) =>
                      handleToggle(
                        acc.property_id,
                        acc.property_name,
                        checkedValue
                      )
                    }
                  />
                );
              })}
            </div>
          )}

          {allAccounts.length === 0 && (
            <div className="w-full h-48 col-span-12 border rounded-md border-border-color">
              <div className="flex flex-col items-center justify-center w-full h-full space-y-2">
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 21 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 fill-icon-color"
                  >
                    <path
                      d="M9.5 15.5H11.5V9.5H9.5V15.5ZM10.5 7.5C10.7833 7.5 11.0208 7.40417 11.2125 
                    7.2125C11.4042 7.02083 11.5 6.78333 11.5 6.5C11.5 6.21667 11.4042 5.97917 
                    11.2125 5.7875C11.0208 5.59583 10.7833 5.5 10.5 5.5C10.2167 5.5 9.97917 
                    5.59583 9.7875 5.7875C9.59583 5.97917 9.5 6.21667 9.5 6.5C9.5 6.78333 
                    9.59583 7.02083 9.7875 7.2125C9.97917 7.40417 10.2167 7.5 10.5 
                    7.5ZM10.5 20.5C9.11667 20.5 7.81667 20.2375 6.6 19.7125C5.38333 
                    19.1875 4.325 18.475 3.425 17.575C2.525 16.675 1.8125 15.6167 
                    1.2875 14.4C0.7625 13.1833 0.5 11.8833 0.5 10.5C0.5 9.11667 0.7625 
                    7.81667 1.2875 6.6C1.8125 5.38333 2.525 4.325 3.425 3.425C4.325 
                    2.525 5.38333 1.8125 6.6 1.2875C7.81667 0.7625 9.11667 0.5 
                    10.5 0.5C11.8833 0.5 13.1833 0.7625 14.4 1.2875C15.6167 1.8125 
                    16.675 2.525 17.575 3.425C18.475 4.325 19.1875 5.38333 
                    19.7125 6.6C20.2375 7.81667 20.5 9.11667 20.5 10.5C20.5 11.8833 
                    20.2375 13.1833 19.7125 14.4C19.1875 15.6167 18.475 16.675 
                    17.575 17.575C16.675 18.475 15.6167 19.1875 14.4 19.7125C13.1833 
                    20.2375 11.8833 20.5 10.5 20.5ZM10.5 18.5C12.7333 18.5 14.625 
                    17.725 16.175 16.175C17.725 14.625 18.5 12.7333 18.5 
                    10.5C18.5 8.26667 17.725 6.375 16.175 4.825C14.625 3.275 
                    12.7333 2.5 10.5 2.5C8.26667 2.5 6.375 3.275 4.825 
                    4.825C3.275 6.375 2.5 8.26667 2.5 10.5C2.5 12.7333 
                    3.275 14.625 4.825 16.175C6.375 17.725 8.26667 
                    18.5 10.5 18.5Z"
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
            </div>
          )}
        </div>
      )}

      {isFetching && (
        <div className="flex items-center justify-center overflow-y-auto h-36 recent__bar">
          <LoadingSpinner />
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-3 space-x-2 border-t border-border-color">
        <button
          type="button"
          className="flex items-center py-1 space-x-2 text-xs font-medium tracking-wider text-secondary-text group hover:text-primary-text disabled:cursor-not-allowed"
          onClick={handlePrevPage}
          disabled={page === 0 || accountsPermissionLoading}
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
            {accountsPermissionLoading ? "Loading..." : `Page ${page + 1}`}
          </span>
        </div>

        <button
          type="button"
          className="right-0 flex items-center py-1 space-x-2 text-xs font-medium tracking-wider text-secondary-text group hover:text-primary-text disabled:cursor-not-allowed"
          onClick={handleNextPage}
          disabled={!hasMore || accountsPermissionLoading}
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

      {hasRestricted && (
        <div
          className={`flex flex-col w-full px-3 py-2 space-y-2 rounded-md ${
            theme === "dark" ? "bg-[#36270C]" : "bg-orange-100"
          }`}
        >
          <div className="flex items-center w-full space-x-2">
            <span className="flex items-center justify-center">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 ${
                  theme === "dark" ? "fill-[#fb923c]" : "fill-orange-400"
                }`}
              >
                <circle cx="7.9974" cy="8.00033" r="5.33333" fill="#F6F6F6" />
                <path
                  d="M8 12C8.22667 12 8.41667 11.9233 8.57 11.77C8.72333 11.6167 8.8 11.4267 
                  8.8 11.2C8.8 10.9733 8.72333 10.7833 8.57 10.63C8.41667 10.4767 
                  8.22667 10.4 8 10.4C7.77333 10.4 7.58333 10.4767 7.43 
                  10.63C7.27667 10.7833 7.2 10.9733 7.2 11.2C7.2 11.4267 
                  7.27667 11.6167 7.43 11.77C7.58333 11.9233 7.77333 12 8 
                  12ZM7.2 8.8H8.8V4H7.2V8.8ZM8 16C6.89333 16 5.85333 15.79 
                  4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 
                  12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 
                  0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 
                  3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 
                  0.63C5.85333 0.21 6.89333 0 8 0C9.10667 
                  0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 
                  1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 
                  4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 
                  15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 
                  12.94 13.66 13.66C12.94 14.38 12.0933 14.95 
                  11.12 15.37C10.1467 15.79 9.10667 16 8 
                  16Z"
                />
              </svg>
            </span>
            <span className="text-xs font-medium text-orange-400">Warning</span>
          </div>

          <div
            className={`text-xs font-normal leading-5 ${
              theme === "dark" ? "text-primary-text" : "text-[#414551]"
            }`}
          >
            Some accounts previously connected to this data source will no
            longer be accessible. These accounts will stop syncing, but their
            data will remain available.
          </div>
        </div>
      )}
    </div>
  );
};

const SwitchToggle = ({ data, checked, status, onToggle }) => {
  const isDisabled = status === "restricted";

  return (
    <label
      className={`inline-flex items-center cursor-pointer ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        className="sr-only peer"
        onChange={(e) => onToggle(e.target.checked)}
        disabled={isDisabled}
      />
      <div
        className={`relative w-11 h-6 rounded-full bg-toggle-circle-bg 
          peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
          after:content-[''] after:absolute after:top-0.5 after:start-[2px] 
          peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color 
          after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7]`}
      />
      <p
        className={`text-sm w-full flex justify-between font-medium ms-3 ${
          checked ? "text-primary-text" : "text-secondary-text"
        }`}
      >
        <span>{data?.name}</span>
        {status === "restricted" && (
          <span className="text-orange-400">No access</span>
        )}
      </p>
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
