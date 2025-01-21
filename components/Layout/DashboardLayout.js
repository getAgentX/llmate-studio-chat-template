import React, { useEffect, useState } from "react";
import {
  useDeleteSectionMutation,
  useGetDashboardQuery,
  useGetSectionsListQuery,
} from "@/store/dashboard";
import { useDashboardContext } from "@/context/DashboardContext";
import { useRouter } from "next/router";
import AddWidget from "../Dashboard/AddWidget";
import CreateSection from "../Modal/CreateSection";
import Link from "next/link";
import ConfirmModal from "../Modal/ConfirmModal";
import SuccessModal from "../Modal/SuccessModal";
import { useTheme } from "@/hooks/useTheme";
import { DashboardIcon } from "../Icons/icon";

const DashboardLayout = ({ children, refetchSection = () => {} }) => {
  const [createSection, setCreateSection] = useState(false);
  const [updateSection, setUpdateSection] = useState(false);
  const [sectionDeleteConfirmation, setSectionDeleteConfirmation] =
    useState(false);
  const [sectionId, setSectionId] = useState(null);
  const [showSectionDelete, setShowSectionDelete] = useState(false);
  const [showAddWidgetSuccess, setShowAddWidgetSuccess] = useState(false);
  const [showSectionCreatedSuccess, setShowSectionCreatedSuccess] =
    useState(false);
  const [newSectionSlug, setNewSectionSlug] = useState(null);

  const [isFirstRender, setIsFirstRender] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    if (showAddWidgetSuccess) {
      refetchSection();
    }
  }, [showAddWidgetSuccess]);
  const { theme } = useTheme();
  const {
    data: dashboardData,
    isLoading: loadingDashboard,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetDashboardQuery(
    { dashboard_id: router.query.slug },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [newDashboardData, setNewdashboardData] = useState(dashboardData || []);

  const {
    data: sectionList,
    isLoading: sectionListLoading,
    error: sectionListError,
    refetch: refetchSectionList,
  } = useGetSectionsListQuery(
    { dashboard_id: router.query.slug },
    {
      skip: !router?.query?.slug,
      refetchOnMountOrArgChange: true,
    }
  );

  const [deleteSection, {}] = useDeleteSectionMutation();

  const handlePrimarySectionDelete = () => {
    deleteSection({
      dashboard_id: router.query.slug,
      section_id: sectionId,
    }).then((response) => {
      if (response) {
        if (response.data === null) {
          refetchDashboard();
          refetchSectionList();

          // const currentIndex = sectionList?.findIndex(
          //   (section) => section.id === sectionId
          // );

          // let redirectTo = `/dashboard/${router.query.slug}/`;
          // if (currentIndex > 0) {
          //   redirectTo = `/dashboard/${router.query.slug}/s/${
          //     sectionList[currentIndex - 1].id
          //   }`;
          // } else if (currentIndex === 0 && sectionList.length > 1) {
          //   redirectTo = `/dashboard/${router.query.slug}/s/${sectionList[1].id}`;
          // }

          const updatedSectionList =
            sectionList?.filter((section) => section.id !== sectionId) || [];

          let redirectTo = `/dashboard/${router.query.slug}/`;

          if (updatedSectionList.length > 0) {
            const currentIndex = sectionList?.findIndex(
              (section) => section.id === sectionId
            );

            if (currentIndex > 0) {
              redirectTo = `/dashboard/${router.query.slug}/s/${
                updatedSectionList[currentIndex - 1].id
              }`;
            } else if (currentIndex === 0 && updatedSectionList.length > 0) {
              redirectTo = `/dashboard/${router.query.slug}/s/${updatedSectionList[0].id}`;
            }
          }

          setShowSectionDelete(true);
          refetchSectionList();
          setSectionDeleteConfirmation(false);
          setSectionId(null);

          router.push(redirectTo);
        }
      }
    });
  };

  const { showAddWidget, setShowAddWidget } = useDashboardContext();

  const handleSectionID = (sectionID) => {
    setSectionId(sectionID);

    if (sectionID) {
      setUpdateSection(true);
    }
  };

  const handleSectionDelete = (sectionID) => {
    setSectionId(sectionID);

    if (sectionID) {
      setSectionDeleteConfirmation(true);
    }
  };

  if (newDashboardData && newDashboardData?.sections?.length === 0) {
    router.push(`/dashboard/${router.query.slug}/`);
  }

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col">
          <div className="flex items-center justify-between h-12 px-4 border-b bg-page border-border-color">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center">
                  <DashboardIcon />
                </span>
              </div>

              <p className="text-sm font-medium text-primary-text">
                {newDashboardData?.label}
              </p>

              <div className="relative group">
                <span className="flex items-center justify-center cursor-pointer">
                  {theme === "dark" ? (
                    <svg
                      viewBox="0 0 14 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-icon-color hover:fill-icon-color-hover"
                    >
                      <path d="M6.33398 10.8334H7.66732V6.83337H6.33398V10.8334ZM7.00065 5.50004C7.18954 5.50004 7.34787 5.43615 7.47565 5.30837C7.60343 5.1806 7.66732 5.02226 7.66732 4.83337C7.66732 4.64448 7.60343 4.48615 7.47565 4.35837C7.34787 4.2306 7.18954 4.16671 7.00065 4.16671C6.81176 4.16671 6.65343 4.2306 6.52565 4.35837C6.39787 4.48615 6.33398 4.64448 6.33398 4.83337C6.33398 5.02226 6.39787 5.1806 6.52565 5.30837C6.65343 5.43615 6.81176 5.50004 7.00065 5.50004ZM7.00065 14.1667C6.07843 14.1667 5.21176 13.9917 4.40065 13.6417C3.58954 13.2917 2.88398 12.8167 2.28398 12.2167C1.68398 11.6167 1.20898 10.9112 0.858984 10.1C0.508984 9.28893 0.333984 8.42226 0.333984 7.50004C0.333984 6.57782 0.508984 5.71115 0.858984 4.90004C1.20898 4.08893 1.68398 3.38337 2.28398 2.78337C2.88398 2.18337 3.58954 1.70837 4.40065 1.35837C5.21176 1.00837 6.07843 0.833374 7.00065 0.833374C7.92287 0.833374 8.78954 1.00837 9.60065 1.35837C10.4118 1.70837 11.1173 2.18337 11.7173 2.78337C12.3173 3.38337 12.7923 4.08893 13.1423 4.90004C13.4923 5.71115 13.6673 6.57782 13.6673 7.50004C13.6673 8.42226 13.4923 9.28893 13.1423 10.1C12.7923 10.9112 12.3173 11.6167 11.7173 12.2167C11.1173 12.8167 10.4118 13.2917 9.60065 13.6417C8.78954 13.9917 7.92287 14.1667 7.00065 14.1667ZM7.00065 12.8334C8.48954 12.8334 9.75065 12.3167 10.784 11.2834C11.8173 10.25 12.334 8.98893 12.334 7.50004C12.334 6.01115 11.8173 4.75004 10.784 3.71671C9.75065 2.68337 8.48954 2.16671 7.00065 2.16671C5.51176 2.16671 4.25065 2.68337 3.21732 3.71671C2.18398 4.75004 1.66732 6.01115 1.66732 7.50004C1.66732 8.98893 2.18398 10.25 3.21732 11.2834C4.25065 12.3167 5.51176 12.8334 7.00065 12.8334Z" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.33203 11.333H8.66536V7.33301H7.33203V11.333ZM7.9987 5.99967C8.18759 5.99967 8.34592 5.93579 8.4737 5.80801C8.60148 5.68023 8.66536 5.5219 8.66536 5.33301C8.66536 5.14412 8.60148 4.98579 8.4737 4.85801C8.34592 4.73023 8.18759 4.66634 7.9987 4.66634C7.80981 4.66634 7.65148 4.73023 7.5237 4.85801C7.39592 4.98579 7.33203 5.14412 7.33203 5.33301C7.33203 5.5219 7.39592 5.68023 7.5237 5.80801C7.65148 5.93579 7.80981 5.99967 7.9987 5.99967ZM7.9987 14.6663C7.07648 14.6663 6.20981 14.4913 5.3987 14.1413C4.58759 13.7913 3.88203 13.3163 3.28203 12.7163C2.68203 12.1163 2.20703 11.4108 1.85703 10.5997C1.50703 9.78856 1.33203 8.9219 1.33203 7.99967C1.33203 7.07745 1.50703 6.21079 1.85703 5.39967C2.20703 4.58856 2.68203 3.88301 3.28203 3.28301C3.88203 2.68301 4.58759 2.20801 5.3987 1.85801C6.20981 1.50801 7.07648 1.33301 7.9987 1.33301C8.92092 1.33301 9.78759 1.50801 10.5987 1.85801C11.4098 2.20801 12.1154 2.68301 12.7154 3.28301C13.3154 3.88301 13.7904 4.58856 14.1404 5.39967C14.4904 6.21079 14.6654 7.07745 14.6654 7.99967C14.6654 8.9219 14.4904 9.78856 14.1404 10.5997C13.7904 11.4108 13.3154 12.1163 12.7154 12.7163C12.1154 13.3163 11.4098 13.7913 10.5987 14.1413C9.78759 14.4913 8.92092 14.6663 7.9987 14.6663Z"
                        fill="#A1A1A1"
                      />
                    </svg>
                  )}
                </span>

                <div className="absolute z-[1000] hidden w-full p-2 text-xs font-medium tracking-wider border rounded-md border-border-color bg-page text-secondary-text group-hover:block top-6 left-2 min-w-96 max-w-96 shadow-md">
                  {newDashboardData?.description}
                </div>
              </div>
            </div>

            {newDashboardData?.sections.length > 0 && (
              <div className="items-center hidden sm:flex">
                <button
                  className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                  onClick={() => setShowAddWidget(true)}
                >
                  <span className="flex items-center justify-center cursor-pointer">
                    <svg
                      viewBox="0 0 12 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 fill-btn-primary-outline-icon"
                    >
                      <path d="M5.16675 7.33073H0.166748V5.66406H5.16675V0.664062H6.83341V5.66406H11.8334V7.33073H6.83341V12.3307H5.16675V7.33073Z" />
                    </svg>
                    <p className="ml-2">Add Widget</p>
                  </span>
                </button>

                <button
                  className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                  onClick={() => setCreateSection(true)}
                >
                  <span className="flex items-center justify-center cursor-pointer">
                    <svg
                      viewBox="0 0 12 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 fill-btn-primary-outline-icon"
                    >
                      <path d="M5.16675 7.33073H0.166748V5.66406H5.16675V0.664062H6.83341V5.66406H11.8334V7.33073H6.83341V12.3307H5.16675V7.33073Z" />
                    </svg>
                    <p className="ml-2">Add Section</p>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 h-full overflow-hidden">
        <div className="flex-1">
          <div className="grid w-full h-full max-h-full grid-cols-12 rounded-md">
            <div className="col-span-12 overflow-y-auto recent__bar ">
              <div className="relative flex flex-col h-full max-h-full bg-page">
                <div className="flex sticky top-0 left-0 justify-between w-full bg-page">
                  <div className="flex-wrap items-center hidden w-full px-4 space-x-4 border-b sm:flex border-border-color">
                    <div className="flex-wrap items-center hidden w-full space-x-4 sm:flex">
                      {sectionList?.map((section) => {
                        return (
                          <div
                            className="flex items-center space-x-3 min-w-16 h-9"
                            key={section.id}
                          >
                            <Link
                              href={`/dashboard/${router.query.slug}/s/${section.id}`}
                              className={`flex items-center justify-center w-full h-full space-x-2 font-medium tracking-wider transition-colors duration-300 text-xs border-b-2 ${
                                router.query.section === section.id
                                  ? "text-tabs-active border-tabs-active"
                                  : "text-tabs-text border-transparent"
                              }`}
                            >
                              <span>{section.label}</span>
                            </Link>

                            {router.query.section === section.id && (
                              <div className="flex items-center space-x-2">
                                <span
                                  className="flex items-center justify-center cursor-pointer group"
                                  onClick={() => handleSectionID(section.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4 text-active-text"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                    />
                                  </svg>
                                </span>

                                <span
                                  className="flex items-center justify-center cursor-pointer group"
                                  onClick={() =>
                                    handleSectionDelete(section.id)
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4 text-active-text"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                    />
                                  </svg>
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddWidget && (
        <AddWidget
          show={showAddWidget}
          setShow={setShowAddWidget}
          currentSection={router.query.section}
          refetchDashboard={refetchDashboard}
          refetchSectionList={refetchSectionList}
          dashboardId={router.query.slug}
          setShowAddWidgetSuccess={setShowAddWidgetSuccess}
        />
      )}

      {showAddWidgetSuccess && (
        <SuccessModal
          show={showAddWidgetSuccess}
          setShow={setShowAddWidgetSuccess}
          heading="Success Confirmation"
          title=""
          description="Widget Added Successfully"
          primaryBtn="View"
          primaryChange={() => {
            refetchSectionList();
            refetchSection();
            setShowAddWidgetSuccess(false);
          }}
        />
      )}

      {createSection && (
        <CreateSection
          createSection={true}
          setCreateSection={setCreateSection}
          dashboardId={router.query.slug}
          refetch={refetchSectionList}
          setShowSectionSuccessConfirm={setShowSectionCreatedSuccess}
          setNewSectionSlug={setNewSectionSlug}
        />
      )}

      <SuccessModal
        show={showSectionCreatedSuccess}
        setShow={setShowSectionCreatedSuccess}
        heading="Success Confirmation"
        title="Section Created Successfully"
        description=""
        primaryBtn="View"
        primaryChange={() => {
          refetchDashboard(router.query.slug);
          setShowSectionCreatedSuccess(false);
        }}
      />

      {updateSection && (
        <CreateSection
          createSection={updateSection}
          setCreateSection={setUpdateSection}
          dashboardId={router.query.slug}
          update={
            dashboardData.sections.find(
              (section) => section.id === router.query.section
            )?.label
          }
          sectionId={router.query.section}
          refetchDashboard={refetchSectionList}
        />
      )}

      {sectionDeleteConfirmation && (
        <ConfirmModal
          show={sectionDeleteConfirmation}
          setShow={setSectionDeleteConfirmation}
          heading="Confirm Delete"
          title={"Are you sure you want to delete the section"}
          description={""}
          primaryBtn="Yes, Confirm"
          primaryChange={handlePrimarySectionDelete}
          secondaryBtn="No"
          secondaryChange={() => {
            setSectionDeleteConfirmation(false);
            setSectionId(null);
          }}
        />
      )}

      {showSectionDelete && (
        <SuccessModal
          show={showSectionDelete}
          setShow={setShowSectionDelete}
          heading="Success Confirmation"
          title=""
          description="Section Deleted Successfully"
          primaryBtn="Close"
          primaryChange={() => setShowSectionDelete(false)}
        />
      )}
    </>
  );
};

export default DashboardLayout;
