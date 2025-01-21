import React, { useEffect, useState } from "react";
import Breadcrumb from "../common/Breadcrumbs";
import DatasourceLayout from "../Layout/DatasourceLayout";
import {
  useGetDatasourceInfoQuery,
  useUpdateDatasourceInfoMutation,
} from "@/store/datasource";
import { useRouter } from "next/router";
import UpdateConnectorInfo from "./UpdateConnectorInfo";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import ConfirmModal from "../Modal/ConfirmModal";
import SuccessModal from "../Modal/SuccessModal";

const ThirdPartyDetails = () => {
  const [showUpdateInfo, setShowUpdateInfo] = useState(false);
  const [infoConfig, setInfoConfig] = useState(true);
  const [editConfirm, setEditConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    },
  });

  const {
    data: getRes,
    isLoading: getLoading,
    error: getError,
    refetch,
  } = useGetDatasourceInfoQuery(
    {
      datasource_id: router.query.slug,
    },
    {
      skip: !router?.query?.slug,
    }
  );

  useEffect(() => {
    if (getRes) {
      const modifiedData = {
        name: getRes.name,
        about: getRes.about,
      };

      reset(modifiedData);
    }
  }, [getRes]);

  const [updateDatasourceInfo, { error: updateDatasourceInfoError }] =
    useUpdateDatasourceInfoMutation();

  const updateInformation = () => {
    const name = getValues("name");
    const about = getValues("about");

    const infoData = {
      name: name,
      about: about,
    };

    updateDatasourceInfo({
      datasource_id: router.query.slug,
      payload: infoData,
    })
      .then(() => {
        setShowSuccessModal(true);
        setInfoConfig(true);
        refetch();
      })
      .catch((error) => {
        console.error("Failed to update information:", error);
      });
  };

  const aboutInfo = watch("about");

  const handlePrimary = () => {
    router.push(`/datasource/details/${router.query.slug}/query`);
  };

  const crumbData = [
    { name: "Datasources", slug: "/datasource" },
    {
      name: getRes?.name || "Datasource Name",
      slug: `/datasource/details/${router.query.slug}`,
    },
  ];

  return (
    <div className="relative flex flex-col h-full max-h-screen min-h-screen overflow-hidden font-roboto">
      <Breadcrumb data={crumbData} />

      <DatasourceLayout
        activeTab={"information"}
        currentDatasource="third_party"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-3 h-9 bg-secondary-bg">
            <div className="flex items-center space-x-3">
              <p className="text-base font-normal text-primary-text">
                Datasource Information
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {infoConfig && (
                <button
                  className="flex items-center justify-center w-full h-7 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                  type="button"
                  onClick={() => setInfoConfig(false)}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 fill-btn-primary-outline-icon"
                    >
                      <path d="M1.33333 10.6667H2.28333L8.8 4.15L7.85 3.2L1.33333 9.71667V10.6667ZM0 12V9.16667L8.8 0.383333C8.93333 0.261111 9.08056 0.166667 9.24167 0.1C9.40278 0.0333333 9.57222 0 9.75 0C9.92778 0 10.1 0.0333333 10.2667 0.1C10.4333 0.166667 10.5778 0.266667 10.7 0.4L11.6167 1.33333C11.75 1.45556 11.8472 1.6 11.9083 1.76667C11.9694 1.93333 12 2.1 12 2.26667C12 2.44444 11.9694 2.61389 11.9083 2.775C11.8472 2.93611 11.75 3.08333 11.6167 3.21667L2.83333 12H0ZM8.31667 3.68333L7.85 3.2L8.8 4.15L8.31667 3.68333Z" />
                    </svg>
                  </span>
                  <span>Edit</span>
                </button>
              )}

              {infoConfig || (
                <div className="flex items-center space-x-4">
                  <a
                    className="flex items-center justify-center space-x-1.5 text-xs font-medium tracking-wide cursor-pointer text-[#9E2828] hover:text-primary-text"
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
                    className={`flex items-center space-x-1.5 text-xs font-medium group disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable ${
                      isDirty
                        ? "text-[#2A9E28] hover:text-primary-text"
                        : "text-btn-normal-text hover:text-btn-normal-hover"
                    }`}
                    type="button"
                    onClick={isDirty ? () => setEditConfirm(true) : null}
                    disabled={!isValid || !isDirty}
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable fill-[#2A9E28] group-hover:fill-btn-normal-hover"
                      >
                        <path d="M6.37031 12.0001L2.57031 8.20007L3.52031 7.25007L6.37031 10.1001L12.487 3.9834L13.437 4.9334L6.37031 12.0001Z" />
                      </svg>
                    </span>
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full px-3 py-3 space-y-2">
            <div className="grid items-center w-full grid-cols-12">
              <div className="col-span-2">
                <p className="text-xs font-medium text-primary-text">Name</p>
              </div>

              <div className="col-span-10">
                <input
                  type="text"
                  className={`w-full max-w-xl px-3 text-xs border rounded-md outline-none h-7 bg-page placeholder:text-input-placeholder font-normal ${
                    infoConfig
                      ? "text-input-text-inactive border-transparent py-0"
                      : "text-input-text border-input-border py-3 focus:border-input-border-focus"
                  }`}
                  {...register("name", { required: true })}
                  readOnly={infoConfig}
                />
              </div>
            </div>

            <div className="grid w-full grid-cols-12">
              <div className="col-span-2">
                <p className="text-xs font-medium text-primary-text">
                  Description
                </p>
              </div>

              <div className="col-span-10">
                {infoConfig || (
                  <TextareaAutosize
                    className={`w-full font-normal px-3 min-h-28 text-xs border rounded-md outline-none resize-y bg-page placeholder:text-input-placeholder recent__bar focus:border-input-border-focus ${
                      infoConfig
                        ? "text-input-text-inactive border-transparent py-0"
                        : "text-input-text max-w-xl border-input-border py-2"
                    }`}
                    {...register("about", { required: true })}
                    readOnly={infoConfig}
                  />
                )}

                {infoConfig && (
                  <div
                    className={`w-full px-3 text-xs border bg-page placeholder:text-input-placeholder font-normal ${
                      infoConfig
                        ? "text-input-text-inactive border-transparent py-0"
                        : "text-input-text border-input-border py-3"
                    }`}
                  >
                    <pre className="text-wrap font-roboto">{aboutInfo}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 h-9 bg-secondary-bg">
            <div className="flex items-center space-x-3">
              <p className="text-base font-normal text-primary-text">
                Connector Information
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                className="flex items-center justify-center w-full h-7 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                type="button"
                onClick={() => setShowUpdateInfo(!showUpdateInfo)}
              >
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 fill-btn-primary-outline-icon"
                  >
                    <path d="M1.33333 10.6667H2.28333L8.8 4.15L7.85 3.2L1.33333 9.71667V10.6667ZM0 12V9.16667L8.8 0.383333C8.93333 0.261111 9.08056 0.166667 9.24167 0.1C9.40278 0.0333333 9.57222 0 9.75 0C9.92778 0 10.1 0.0333333 10.2667 0.1C10.4333 0.166667 10.5778 0.266667 10.7 0.4L11.6167 1.33333C11.75 1.45556 11.8472 1.6 11.9083 1.76667C11.9694 1.93333 12 2.1 12 2.26667C12 2.44444 11.9694 2.61389 11.9083 2.775C11.8472 2.93611 11.75 3.08333 11.6167 3.21667L2.83333 12H0ZM8.31667 3.68333L7.85 3.2L8.8 4.15L8.31667 3.68333Z" />
                  </svg>
                </span>

                <span>Edit</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col w-full px-3 py-3 space-y-2">
            <div className="grid items-center w-full grid-cols-12">
              <div className="col-span-2">
                <p className="text-xs font-medium text-primary-text">Name</p>
              </div>

              <div className="col-span-10">
                <input
                  type="text"
                  className="w-full max-w-xl px-3 py-0 text-xs font-normal border border-transparent rounded-md outline-none text-input-text-inactive h-7 bg-page placeholder:text-input-placeholder"
                  value={getRes?.name}
                  readOnly={true}
                />
              </div>
            </div>

            <div className="grid items-center w-full grid-cols-12">
              <div className="col-span-2">
                <p className="text-xs font-medium text-primary-text">
                  User name
                </p>
              </div>

              <div className="col-span-10">
                {/* <input
                  type="text"
                  className="w-full max-w-xl px-3 py-0 text-xs font-normal border border-transparent rounded-md outline-none text-input-text-inactive h-7 bg-page placeholder:text-input-placeholder"
                  value={"Lorumipsum"}
                  readOnly={true}
                /> */}

                <p className="px-3 text-xs font-medium text-secondary-text">
                  {getRes?.ds_config.connector.user_identity
                    ?.federated_username || ""}
                </p>
              </div>
            </div>

            <div className="grid items-center w-full grid-cols-12">
              <div className="col-span-2">
                <p className="text-xs font-medium text-primary-text">
                  Accounts Connected
                </p>
              </div>

              <div className="col-span-10 px-3 py-1">
                <div className="flex flex-wrap gap-3">
                  {getRes?.ds_config.connector?.account_ids?.map(
                    (item, index) => {
                      return (
                        <div
                          className="flex items-center justify-center px-2 py-1 space-x-1 border rounded-full text-nowrap border-border-color"
                          key={index}
                        >
                          <span className="flex items-center justify-center">
                            <svg
                              viewBox="0 0 14 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3 fill-icon-color"
                            >
                              <path d="M2.89967 10.4007C3.46634 9.96732 4.09967 9.62565 4.79967 9.37565C5.49967 9.12565 6.23301 9.00065 6.99967 9.00065C7.76634 9.00065 8.49967 9.12565 9.19967 9.37565C9.89967 9.62565 10.533 9.96732 11.0997 10.4007C11.4886 9.9451 11.7913 9.42843 12.008 8.85065C12.2247 8.27287 12.333 7.65621 12.333 7.00065C12.333 5.52287 11.8136 4.26454 10.7747 3.22565C9.73579 2.18676 8.47745 1.66732 6.99967 1.66732C5.5219 1.66732 4.26356 2.18676 3.22467 3.22565C2.18579 4.26454 1.66634 5.52287 1.66634 7.00065C1.66634 7.65621 1.77467 8.27287 1.99134 8.85065C2.20801 9.42843 2.51079 9.9451 2.89967 10.4007ZM6.99967 7.66732C6.34412 7.66732 5.79134 7.44232 5.34134 6.99232C4.89134 6.54232 4.66634 5.98954 4.66634 5.33398C4.66634 4.67843 4.89134 4.12565 5.34134 3.67565C5.79134 3.22565 6.34412 3.00065 6.99967 3.00065C7.65523 3.00065 8.20801 3.22565 8.65801 3.67565C9.10801 4.12565 9.33301 4.67843 9.33301 5.33398C9.33301 5.98954 9.10801 6.54232 8.65801 6.99232C8.20801 7.44232 7.65523 7.66732 6.99967 7.66732ZM6.99967 13.6673C6.07745 13.6673 5.21079 13.4923 4.39967 13.1423C3.58856 12.7923 2.88301 12.3173 2.28301 11.7173C1.68301 11.1173 1.20801 10.4118 0.858008 9.60065C0.508008 8.78954 0.333008 7.92287 0.333008 7.00065C0.333008 6.07843 0.508008 5.21176 0.858008 4.40065C1.20801 3.58954 1.68301 2.88398 2.28301 2.28398C2.88301 1.68398 3.58856 1.20898 4.39967 0.858984C5.21079 0.508984 6.07745 0.333984 6.99967 0.333984C7.9219 0.333984 8.78856 0.508984 9.59967 0.858984C10.4108 1.20898 11.1163 1.68398 11.7163 2.28398C12.3163 2.88398 12.7913 3.58954 13.1413 4.40065C13.4913 5.21176 13.6663 6.07843 13.6663 7.00065C13.6663 7.92287 13.4913 8.78954 13.1413 9.60065C12.7913 10.4118 12.3163 11.1173 11.7163 11.7173C11.1163 12.3173 10.4108 12.7923 9.59967 13.1423C8.78856 13.4923 7.9219 13.6673 6.99967 13.6673ZM6.99967 12.334C7.58856 12.334 8.14412 12.2479 8.66634 12.0757C9.18856 11.9034 9.66634 11.6562 10.0997 11.334C9.66634 11.0118 9.18856 10.7645 8.66634 10.5923C8.14412 10.4201 7.58856 10.334 6.99967 10.334C6.41079 10.334 5.85523 10.4201 5.33301 10.5923C4.81079 10.7645 4.33301 11.0118 3.89967 11.334C4.33301 11.6562 4.81079 11.9034 5.33301 12.0757C5.85523 12.2479 6.41079 12.334 6.99967 12.334ZM6.99967 6.33398C7.28856 6.33398 7.52745 6.23954 7.71634 6.05065C7.90523 5.86176 7.99967 5.62287 7.99967 5.33398C7.99967 5.04509 7.90523 4.80621 7.71634 4.61732C7.52745 4.42843 7.28856 4.33398 6.99967 4.33398C6.71079 4.33398 6.4719 4.42843 6.28301 4.61732C6.09412 4.80621 5.99967 5.04509 5.99967 5.33398C5.99967 5.62287 6.09412 5.86176 6.28301 6.05065C6.4719 6.23954 6.71079 6.33398 6.99967 6.33398Z" />
                            </svg>
                          </span>

                          <p className="text-xs font-medium text-secondary-text">
                            {item.property_name}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DatasourceLayout>

      {showUpdateInfo && (
        <UpdateConnectorInfo
          show={showUpdateInfo}
          setShow={setShowUpdateInfo}
          data={getRes}
          refetch={refetch}
        />
      )}

      {editConfirm && (
        <ConfirmModal
          show={editConfirm}
          setShow={setEditConfirm}
          heading="Confirm Edit"
          title={"Are you sure you want to save your changes?"}
          description={""}
          primaryBtn="Yes, Confirm"
          primaryChange={updateInformation}
          secondaryBtn="No"
          secondaryChange={() => setEditConfirm(false)}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          show={showSuccessModal}
          setShow={setShowSuccessModal}
          heading="Datasource Updated Successfully"
          title={getValues("name")}
          description={getValues("about")}
          primaryBtn="Query"
          primaryChange={handlePrimary}
          secondaryBtn="Close"
          secondaryChange={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default ThirdPartyDetails;
