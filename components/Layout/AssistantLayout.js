import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Split from "react-split";
import ConfirmModal from "../Modal/ConfirmModal";
import {
  useDeleteAssistantMutation,
  useGetAssistantInfoQuery,
} from "@/store/assistant";
import AssistantSidebar from "./AssistantSidebar";
import CreateAssistantModel from "../Assistant/CreateAssistantModel";
import SuccessModal from "../Modal/SuccessModal";
import { currentOrganizationSelector } from "@/store/current_organization";
import { useSelector } from "react-redux";
import usePublished from "@/hooks/usePublished";
import { useTheme } from "@/hooks/useTheme";
import { AssistantIcon } from "../Icons/icon";

const tabsList = [
  {
    name: "Information",
    slug: "/",
    key: "information",
  },
  {
    name: "LLM Settings",
    slug: "/configuration",
    key: "configuration",
  },
  {
    name: "Datasources",
    slug: "/integrated-datasource",
    key: "integrated",
  },
  {
    name: "Chat History",
    slug: "/logs",
    key: "logs",
  },
  {
    name: "Suggested Questions",
    slug: "/suggested-questions",
    key: "questions",
  },
];

const AssistantLayout = ({ children, activeTab, extraChild = null }) => {
  const [slug, setSlug] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCreateAssistant, setShowCreateAssistant] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assistantSlug, setAssistantSlug] = useState(false);
  const [isCollapse, setIsCollapse] = useState(false);
  const [showAssistantDeleteSuccess, setShowAssistantDeleteSuccess] =
    useState(false);

  const router = useRouter();
  const { theme } = useTheme();
  const {
    data: getRes,
    isLoading,
    error: getError,
    refetch,
  } = useGetAssistantInfoQuery(
    {
      assistant_id: router.query.slug,
    },
    {
      skip: !router.query.slug,
    }
  );

  const currentOrg = useSelector(currentOrganizationSelector);
  const isPublished = usePublished(
    currentOrg,
    getRes?.organization_id,
    getRes?.is_published
  );

  const [deleteAssistant, { error: deleteAssistantError }] =
    useDeleteAssistantMutation();

  useEffect(() => {
    if (router?.query?.slug) {
      setSlug(router.query.slug);
    }
  }, [router?.query?.slug]);

  const handleDeleteAssistant = () => {
    deleteAssistant({
      assistant_id: router?.query?.slug,
    }).then((response) => {
      setConfirmDelete(false);
      setShowAssistantDeleteSuccess(true);
    });
  };

  const handlePrimary = () => {
    setShowSuccessModal(false);
    router.push(`/assistant/chat/${assistantSlug}`);
  };

  const handleSecondary = () => {
    setShowSuccessModal(false);
    router.push(`/assistant/details/${assistantSlug}`);
  };

  return (
    <div className="flex w-full h-screen overflow-hidden font-roboto">
      <Split
        className="split_row"
        direction="horizontal"
        minSize={isCollapse ? 0 : 100}
        gutterSize={2}
        cursor="e-resize"
        // sizes={[20, 80]}
        sizes={[isCollapse ? "48px" : 20, isCollapse ? 96.5 : 80]}
      >
        <div className="w-full h-full max-h-full">
          <AssistantSidebar
            setShowCreateAssistant={setShowCreateAssistant}
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
                    <AssistantIcon size={4} />
                  </span>

                  <p className="overflow-hidden text-base font-normal leading-none capitalize text-primary-text max-w-60 text-ellipsis whitespace-nowrap">
                    {getRes?.name || ""}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {!isPublished && (
                    <button
                      type="button"
                      className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <span>
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3 fill-btn-primary-outline-icon"
                        >
                          <path d="M2.66797 12C2.3013 12 1.98741 11.8694 1.7263 11.6083C1.46519 11.3472 1.33464 11.0333 1.33464 10.6667V2H0.667969V0.666667H4.0013V0H8.0013V0.666667H11.3346V2H10.668V10.6667C10.668 11.0333 10.5374 11.3472 10.2763 11.6083C10.0152 11.8694 9.7013 12 9.33464 12H2.66797ZM9.33464 2H2.66797V10.6667H9.33464V2ZM4.0013 9.33333H5.33464V3.33333H4.0013V9.33333ZM6.66797 9.33333H8.0013V3.33333H6.66797V9.33333Z" />
                        </svg>
                      </span>

                      <span>Delete</span>
                    </button>
                  )}

                  <Link
                    href={`/assistant/chat/${slug}`}
                    className="flex items-center justify-center h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary"
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 fill-btn-primary-icon"
                      >
                        <path d="M4.66536 12.0002C4.47648 12.0002 4.31814 11.9363 4.19036 11.8085C4.06259 11.6807 3.9987 11.5224 3.9987 11.3335V10.0002H12.6654V4.00016H13.9987C14.1876 4.00016 14.3459 4.06405 14.4737 4.19183C14.6015 4.31961 14.6654 4.47794 14.6654 4.66683V14.6668L11.9987 12.0002H4.66536ZM1.33203 11.3335V2.00016C1.33203 1.81127 1.39592 1.65294 1.5237 1.52516C1.65148 1.39738 1.80981 1.3335 1.9987 1.3335H10.6654C10.8543 1.3335 11.0126 1.39738 11.1404 1.52516C11.2681 1.65294 11.332 1.81127 11.332 2.00016V8.00016C11.332 8.18905 11.2681 8.34738 11.1404 8.47516C11.0126 8.60294 10.8543 8.66683 10.6654 8.66683H3.9987L1.33203 11.3335Z" />
                      </svg>
                    </span>

                    <span>Chat</span>
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
                        href={`/assistant/details/${slug}${item.slug}`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {extraChild}
              </div>
            </div>

            <div className="w-full px-4 pt-4">{children}</div>
          </div>
        </div>
      </Split>

      {confirmDelete && (
        <ConfirmModal
          show={confirmDelete}
          setShow={setConfirmDelete}
          heading="Confirm Delete"
          title={"Are you sure you want to delete the assistant"}
          description={""}
          primaryBtn="Yes, Confirm"
          primaryChange={handleDeleteAssistant}
          secondaryBtn="No"
          secondaryChange={() => setConfirmDelete(false)}
        />
      )}

      <SuccessModal
        show={showAssistantDeleteSuccess}
        setShow={setShowAssistantDeleteSuccess}
        heading="Success Confirmation"
        title={""}
        description="Assistant Deleted Successfully"
        primaryBtn="Close"
        primaryChange={() => {
          setShowAssistantDeleteSuccess(false);
          router.push("/assistant");
        }}
      />

      {showCreateAssistant && (
        <CreateAssistantModel
          showCreateAssistant={showCreateAssistant}
          setShowCreateAssistant={setShowCreateAssistant}
          setShowSuccessModal={setShowSuccessModal}
          setAssistantSlug={setAssistantSlug}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          show={showSuccessModal}
          setShow={setShowSuccessModal}
          heading="Assistant Created Successfully"
          title={"You have successfully created the Assistant"}
          description="Your new assistant is ready to use now"
          primaryBtn="Chat"
          primaryChange={handlePrimary}
          secondaryBtn="View"
          secondaryChange={handleSecondary}
        />
      )}
    </div>
  );
};

export default AssistantLayout;
