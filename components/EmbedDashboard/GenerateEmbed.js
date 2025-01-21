import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useRef, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  stackoverflowDark,
  stackoverflowLight,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useRouter } from "next/router";
import {
  useGenerateEmbedLinkMutation,
  useUpdateDashboardPublishedStatusMutation,
  useUpdateEmbededStatusMutation,
} from "@/store/dashboard";

const GenerateEmbed = ({
  show,
  setShow,
  dashboardData = null,
  refetchDashboard,
}) => {
  const [generateLink, setGenerateLink] = useState(null);
  const [generateCode, setGenerateCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shareTeam, setShareTeam] = useState(false);
  const [publishEveryone, setPublishEveryone] = useState(false);

  const modalRef = useRef(null);
  const router = useRouter();

  const [generateEmbedLink, { isLoading }] = useGenerateEmbedLinkMutation();
  const [updateEmbededStatus, {}] = useUpdateEmbededStatusMutation();

  useEffect(() => {
    if (dashboardData?.embeded_id) {
      const link = `${process.env.NEXT_PUBLIC_BASE_URL}/embed-dashboard/${dashboardData?.embeded_id}?theme=light`;
      const code = `<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src=${`"${link}&embed=true"`} allowfullscreen></iframe>`;

      setGenerateLink(link);
      setGenerateCode(code);
    } else {
      if (!publishEveryone) {
        generateEmbedLink({ dashboard_id: router.query.slug }).then(
          (response) => {
            if (response.data) {
              const link = `${process.env.NEXT_PUBLIC_BASE_URL}/embed-dashboard/${response.data.id}?theme=light`;
              const code = `<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src=${`"${link}&embed=true"`} allowfullscreen></iframe>`;

              setGenerateLink(link);
              setGenerateCode(code);
              refetchDashboard();
            }
          }
        );
      }
    }

    if (dashboardData) {
      setShareTeam(dashboardData?.is_published);
      setPublishEveryone(dashboardData?.is_embeded);
    }
  }, [dashboardData]);

  const [updateDashboardPublishedStatus, { error: publishedDashboardError }] =
    useUpdateDashboardPublishedStatusMutation();

  const handleGenerateLink = () => {
    generateEmbedLink({ dashboard_id: router.query.slug }).then((response) => {
      if (response.data) {
        const link = `${process.env.NEXT_PUBLIC_BASE_URL}/embed-dashboard/${response.data.id}?theme=light`;
        const code = `<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src=${`"${link}&embed=true"`} allowfullscreen></iframe>`;

        setGenerateLink(link);
        setGenerateCode(code);
      }
    });
  };

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

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const handlePublish = (status) => {
    if (status && dashboardData) {
      updateDashboardPublishedStatus({
        dashboard_id: dashboardData._id,
        payload: {
          is_published: true,
        },
      }).then((response) => {
        refetchDashboard();
      });
    }

    if (!status && dashboardData) {
      updateDashboardPublishedStatus({
        dashboard_id: dashboardData._id,
        payload: {
          is_published: false,
        },
      }).then((response) => {
        refetchDashboard();
      });
    }
  };

  const handleEmbededStatus = (status) => {
    if (status && dashboardData) {
      updateEmbededStatus({
        dashboard_id: dashboardData._id,
        payload: {
          is_embeded: true,
        },
      }).then((response) => {
        refetchDashboard();
      });
    }

    if (!status && dashboardData) {
      updateEmbededStatus({
        dashboard_id: dashboardData._id,
        payload: {
          is_embeded: false,
        },
      }).then((response) => {
        refetchDashboard();
      });
    }
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        show || "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-md rounded-md bg-dropdown-bg"
        ref={modalRef}
      >
        <div className="flex flex-col h-full border rounded-md border-dropdown-border">
          <div className="flex flex-col space-y-4">
            <div className="relative flex items-center justify-between px-2 py-2 text-sm font-medium border-b min-h-8 text-dropdown-text border-dropdown-border">
              <div className="flex items-center space-x-2">
                <span>Share this dashboard</span>
              </div>

              <span className="cursor-pointer" onClick={() => setShow(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 fill-btn-primary-outline-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="flex flex-col px-2">
            <div className="flex items-center justify-between py-2 border-b border-border-color">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#2A5485]">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-white"
                  >
                    <g clip-path="url(#clip0_4154_4148)">
                      <path d="M0.671875 8.66634V7.96634C0.671875 7.64782 0.834838 7.38856 1.16076 7.18856C1.48669 6.98856 1.91632 6.88856 2.44965 6.88856C2.54595 6.88856 2.63854 6.89041 2.72743 6.89412C2.81632 6.89782 2.9015 6.90708 2.98299 6.9219C2.87928 7.07745 2.8015 7.24042 2.74965 7.41079C2.6978 7.58116 2.67187 7.75893 2.67187 7.94412V8.66634H0.671875ZM3.33854 8.66634V7.94412C3.33854 7.70708 3.40336 7.49042 3.53299 7.29412C3.66262 7.09782 3.84595 6.9256 4.08299 6.77745C4.32002 6.6293 4.60336 6.51819 4.93299 6.44412C5.26262 6.37004 5.62002 6.33301 6.00521 6.33301C6.3978 6.33301 6.75891 6.37004 7.08854 6.44412C7.41817 6.51819 7.7015 6.6293 7.93854 6.77745C8.17558 6.9256 8.35706 7.09782 8.48299 7.29412C8.60891 7.49042 8.67187 7.70708 8.67187 7.94412V8.66634H3.33854ZM9.33854 8.66634V7.94412C9.33854 7.75153 9.31447 7.57004 9.26632 7.39967C9.21817 7.2293 9.14595 7.07004 9.04965 6.9219C9.13113 6.90708 9.21447 6.89782 9.29965 6.89412C9.38484 6.89041 9.47187 6.88856 9.56076 6.88856C10.0941 6.88856 10.5237 6.98671 10.8497 7.18301C11.1756 7.3793 11.3385 7.64042 11.3385 7.96634V8.66634H9.33854ZM2.44965 6.44412C2.20521 6.44412 1.99595 6.35708 1.82187 6.18301C1.6478 6.00893 1.56076 5.79967 1.56076 5.55523C1.56076 5.30338 1.6478 5.09227 1.82187 4.9219C1.99595 4.75153 2.20521 4.66634 2.44965 4.66634C2.7015 4.66634 2.91262 4.75153 3.08299 4.9219C3.25336 5.09227 3.33854 5.30338 3.33854 5.55523C3.33854 5.79967 3.25336 6.00893 3.08299 6.18301C2.91262 6.35708 2.7015 6.44412 2.44965 6.44412ZM9.56076 6.44412C9.31632 6.44412 9.10706 6.35708 8.93299 6.18301C8.75891 6.00893 8.67187 5.79967 8.67187 5.55523C8.67187 5.30338 8.75891 5.09227 8.93299 4.9219C9.10706 4.75153 9.31632 4.66634 9.56076 4.66634C9.81262 4.66634 10.0237 4.75153 10.1941 4.9219C10.3645 5.09227 10.4497 5.30338 10.4497 5.55523C10.4497 5.79967 10.3645 6.00893 10.1941 6.18301C10.0237 6.35708 9.81262 6.44412 9.56076 6.44412ZM6.00521 5.99967C5.63484 5.99967 5.32002 5.87004 5.06076 5.61079C4.8015 5.35153 4.67187 5.03671 4.67187 4.66634C4.67187 4.28856 4.8015 3.9719 5.06076 3.71634C5.32002 3.46079 5.63484 3.33301 6.00521 3.33301C6.38299 3.33301 6.69965 3.46079 6.95521 3.71634C7.21076 3.9719 7.33854 4.28856 7.33854 4.66634C7.33854 5.03671 7.21076 5.35153 6.95521 5.61079C6.69965 5.87004 6.38299 5.99967 6.00521 5.99967Z" />
                    </g>
                    <defs>
                      <clipPath id="clip0_4154_4148">
                        <rect
                          width="10.6667"
                          height="10.6667"
                          fill="white"
                          transform="translate(0.671875 0.666748)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </span>

                <span className="text-sm font-medium text-primary-text">
                  Share internally within your team
                </span>
              </div>

              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareTeam}
                  className="sr-only peer"
                  onChange={(e) => {
                    setShareTeam(e.target.checked);
                    handlePublish(e.target.checked);
                  }}
                />

                <div className="relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#2A5485]">
                  <svg
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-white"
                  >
                    <path d="M4.99913 9.44406C4.38432 9.44406 3.80654 9.3274 3.2658 9.09406C2.72506 8.86073 2.25469 8.54406 1.85469 8.14406C1.45469 7.74406 1.13802 7.27369 0.904687 6.73295C0.671354 6.19221 0.554688 5.61443 0.554688 4.99962C0.554688 4.38481 0.671354 3.80703 0.904687 3.26629C1.13802 2.72555 1.45469 2.25518 1.85469 1.85518C2.25469 1.45518 2.72506 1.13851 3.2658 0.905176C3.80654 0.671842 4.38432 0.555176 4.99913 0.555176C5.61395 0.555176 6.19172 0.671842 6.73246 0.905176C7.27321 1.13851 7.74358 1.45518 8.14358 1.85518C8.54358 2.25518 8.86024 2.72555 9.09358 3.26629C9.32691 3.80703 9.44358 4.38481 9.44358 4.99962C9.44358 5.61443 9.32691 6.19221 9.09358 6.73295C8.86024 7.27369 8.54358 7.74406 8.14358 8.14406C7.74358 8.54406 7.27321 8.86073 6.73246 9.09406C6.19172 9.3274 5.61395 9.44406 4.99913 9.44406ZM4.55469 8.53295V7.66629C4.31024 7.66629 4.10098 7.57925 3.92691 7.40518C3.75284 7.2311 3.6658 7.02184 3.6658 6.7774V6.33295L1.53247 4.19962C1.51024 4.33295 1.48987 4.46629 1.47135 4.59962C1.45284 4.73295 1.44358 4.86629 1.44358 4.99962C1.44358 5.89592 1.73802 6.6811 2.32691 7.35518C2.9158 8.02925 3.65839 8.42184 4.55469 8.53295ZM7.62135 7.39962C7.7695 7.23666 7.90284 7.06073 8.02135 6.87184C8.13987 6.68295 8.23802 6.48666 8.3158 6.28295C8.39358 6.07925 8.45284 5.86999 8.49358 5.65518C8.53432 5.44036 8.55469 5.22184 8.55469 4.99962C8.55469 4.27369 8.35284 3.61073 7.94913 3.01073C7.54543 2.41073 7.00654 1.9774 6.33247 1.71073V1.88851C6.33247 2.13295 6.24543 2.34221 6.07135 2.51629C5.89728 2.69036 5.68802 2.7774 5.44358 2.7774H4.55469V3.66629C4.55469 3.79221 4.51209 3.89777 4.42691 3.98295C4.34172 4.06814 4.23617 4.11073 4.11024 4.11073H3.22135V4.99962H5.88802C6.01395 4.99962 6.1195 5.04221 6.20469 5.1274C6.28987 5.21258 6.33247 5.31814 6.33247 5.44406V6.7774H6.77691C6.9695 6.7774 7.14358 6.83481 7.29913 6.94962C7.45469 7.06443 7.56209 7.21443 7.62135 7.39962Z" />
                  </svg>
                </span>

                <span className="text-sm font-medium text-primary-text">
                  Publish to everyone
                </span>
              </div>

              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishEveryone}
                  className="sr-only peer"
                  onChange={(e) => {
                    setPublishEveryone(e.target.checked);
                    handleEmbededStatus(e.target.checked);
                  }}
                />

                <div className="relative w-11 h-6 rounded-full bg-toggle-circle-bg peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] peer-checked:after:bg-[#295ef4] after:bg-toggle-bg-color after:rounded-full after:h-5 after:w-5 after:transition-all scale-[0.7]"></div>
              </label>
            </div>
          </div>

          <div className="p-2">
            <div
              className={`p-4 space-y-3 rounded-md bg-secondary-bg ${
                publishEveryone || "opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#2A5485]">
                    <svg
                      viewBox="0 0 6 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-white"
                    >
                      <path d="M5.66667 6.66722C5.66667 7.43783 5.39621 8.09359 4.8553 8.6345C4.31439 9.17541 3.65863 9.44587 2.88802 9.44587C2.11741 9.44587 1.46165 9.17541 0.92074 8.6345C0.37983 8.09359 0.109375 7.43783 0.109375 6.66722V2.55482C0.109375 1.9991 0.30388 1.52673 0.692891 1.13771C1.0819 0.748704 1.55427 0.554199 2.11 0.554199C2.66573 0.554199 3.1381 0.748704 3.52711 1.13771C3.91612 1.52673 4.11062 1.9991 4.11062 2.55482V6.44493C4.11062 6.78578 3.99207 7.07475 3.75496 7.31187C3.51785 7.54898 3.22887 7.66753 2.88802 7.66753C2.54717 7.66753 2.25819 7.54898 2.02108 7.31187C1.78397 7.07475 1.66542 6.78578 1.66542 6.44493V2.33253H2.55458V6.44493C2.55458 6.54125 2.58607 6.62091 2.64906 6.68389C2.71204 6.74687 2.79169 6.77837 2.88802 6.77837C2.98435 6.77837 3.064 6.74687 3.12698 6.68389C3.18997 6.62091 3.22146 6.54125 3.22146 6.44493V2.55482C3.21405 2.24362 3.10476 1.98057 2.89358 1.76569C2.6824 1.55081 2.42121 1.44337 2.11 1.44337C1.79879 1.44337 1.53575 1.55081 1.32086 1.76569C1.10598 1.98057 0.998542 2.24362 0.998542 2.55482V6.66722C0.991132 7.19331 1.17267 7.63975 1.54316 8.00653C1.91364 8.37331 2.36193 8.5567 2.88802 8.5567C3.4067 8.5567 3.84758 8.37331 4.21066 8.00653C4.57373 7.63975 4.76268 7.19331 4.7775 6.66722V2.33253H5.66667V6.66722Z" />
                    </svg>
                  </span>

                  <span className="text-xs font-medium text-primary-text">
                    Link
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {isLoading || (
                    <button
                      type="button"
                      className="flex items-center justify-center cursor-pointer"
                      onClick={() => handleGenerateLink()}
                      disabled={!publishEveryone}
                    >
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 fill-icon-color hover:fill-icon-color-hover"
                      >
                        <path d="M5.99984 11.3333C4.51095 11.3333 3.24984 10.8167 2.2165 9.78332C1.18317 8.74999 0.666504 7.48888 0.666504 5.99999C0.666504 4.5111 1.18317 3.24999 2.2165 2.21666C3.24984 1.18332 4.51095 0.666656 5.99984 0.666656C6.7665 0.666656 7.49984 0.82499 8.19984 1.14166C8.89984 1.45832 9.49984 1.9111 9.99984 2.49999V0.666656H11.3332V5.33332H6.6665V3.99999H9.4665C9.11095 3.37777 8.62484 2.88888 8.00817 2.53332C7.3915 2.17777 6.72206 1.99999 5.99984 1.99999C4.88873 1.99999 3.94428 2.38888 3.1665 3.16666C2.38873 3.94443 1.99984 4.88888 1.99984 5.99999C1.99984 7.1111 2.38873 8.05555 3.1665 8.83332C3.94428 9.6111 4.88873 9.99999 5.99984 9.99999C6.85539 9.99999 7.62762 9.75555 8.3165 9.26666C9.00539 8.77777 9.48873 8.13332 9.7665 7.33332H11.1665C10.8554 8.5111 10.2221 9.47221 9.2665 10.2167C8.31095 10.9611 7.22206 11.3333 5.99984 11.3333Z" />
                      </svg>
                    </button>
                  )}

                  {isLoading && (
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="w-3.5 h-3.5 animate-spin text-primary-text fill-[#295EF4]"
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

                  <CopyToClipboard text={generateLink} onCopy={handleCopyCode}>
                    <button
                      type="button"
                      disabled={!publishEveryone}
                      className="flex items-center justify-center cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 12 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 fill-icon-color hover:fill-icon-color-hover"
                      >
                        <path d="M4 10.9999C3.63333 10.9999 3.31944 10.8694 3.05833 10.6083C2.79722 10.3471 2.66667 10.0333 2.66667 9.66658V1.66659C2.66667 1.29992 2.79722 0.98603 3.05833 0.724919C3.31944 0.463807 3.63333 0.333252 4 0.333252H10C10.3667 0.333252 10.6806 0.463807 10.9417 0.724919C11.2028 0.98603 11.3333 1.29992 11.3333 1.66659V9.66658C11.3333 10.0333 11.2028 10.3471 10.9417 10.6083C10.6806 10.8694 10.3667 10.9999 10 10.9999H4ZM4 9.66658H10V1.66659H4V9.66658ZM1.33333 13.6666C0.966667 13.6666 0.652778 13.536 0.391667 13.2749C0.130556 13.0138 0 12.6999 0 12.3333V2.99992H1.33333V12.3333H8.66667V13.6666H1.33333Z" />
                      </svg>
                    </button>
                  </CopyToClipboard>
                </div>
              </div>

              <div className="flex items-center w-full">
                <div className="relative flex items-center w-full">
                  <span className="flex absolute left-2 top-[50%] -translate-y-1/2 items-center justify-center">
                    <svg
                      viewBox="0 0 9 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-input-icon"
                    >
                      <path d="M8.9974 9.49992C8.9974 10.6555 8.59184 11.6388 7.78073 12.4499C6.96962 13.261 5.98628 13.6666 4.83073 13.6666C3.67517 13.6666 2.69184 13.261 1.88073 12.4499C1.06962 11.6388 0.664062 10.6555 0.664062 9.49992V3.33325C0.664062 2.49992 0.955729 1.79159 1.53906 1.20825C2.1224 0.624919 2.83073 0.333252 3.66406 0.333252C4.4974 0.333252 5.20573 0.624919 5.78906 1.20825C6.3724 1.79159 6.66406 2.49992 6.66406 3.33325V9.16658C6.66406 9.6777 6.48628 10.111 6.13073 10.4666C5.77517 10.8221 5.34184 10.9999 4.83073 10.9999C4.31962 10.9999 3.88628 10.8221 3.53073 10.4666C3.17517 10.111 2.9974 9.6777 2.9974 9.16658V2.99992H4.33073V9.16658C4.33073 9.31103 4.37795 9.43047 4.4724 9.52492C4.56684 9.61936 4.68628 9.66658 4.83073 9.66658C4.97517 9.66658 5.09462 9.61936 5.18906 9.52492C5.28351 9.43047 5.33073 9.31103 5.33073 9.16658V3.33325C5.31962 2.86659 5.15573 2.47214 4.83906 2.14992C4.5224 1.8277 4.13073 1.66659 3.66406 1.66659C3.1974 1.66659 2.80295 1.8277 2.48073 2.14992C2.15851 2.47214 1.9974 2.86659 1.9974 3.33325V9.49992C1.98628 10.2888 2.25851 10.9583 2.81406 11.5083C3.36962 12.0583 4.04184 12.3333 4.83073 12.3333C5.60851 12.3333 6.26962 12.0583 6.81406 11.5083C7.35851 10.9583 7.64184 10.2888 7.66406 9.49992V2.99992H8.9974V9.49992Z" />
                    </svg>
                  </span>

                  <input
                    type="text"
                    className="w-full pl-8 pr-4 text-sm font-normal border rounded-md rounded-tr-none rounded-br-none outline-none text-input-text min-h-8 bg-page border-input-border"
                    value={generateLink}
                    readOnly={true}
                    placeholder="No generated link"
                  />
                </div>

                {/* <CopyToClipboard text={generateLink} onCopy={handleCopyCode}>
                    <button
                      className="flex items-center justify-center px-4 space-x-2 text-xs font-bold tracking-wide rounded-md rounded-tl-none rounded-bl-none min-w-28 min-h-8 text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
                      disabled={!generateCode && !generateLink}
                    >
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </CopyToClipboard> */}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#2A5485]">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-white"
                    >
                      <path d="M5.33594 12L1.33594 8L5.33594 4L6.28594 4.95L3.21927 8.01667L6.26927 11.0667L5.33594 12ZM10.6693 12L9.71927 11.05L12.7859 7.98333L9.73594 4.93333L10.6693 4L14.6693 8L10.6693 12Z" />
                    </svg>
                  </span>

                  <span className="text-xs font-medium text-primary-text">
                    Embed code
                  </span>
                </div>

                <CopyToClipboard text={generateCode} onCopy={handleCopyCode}>
                  <button
                    type="button"
                    className="flex items-center justify-center cursor-pointer"
                    disabled={!publishEveryone}
                  >
                    <svg
                      viewBox="0 0 12 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5 fill-icon-color hover:fill-icon-color-hover"
                    >
                      <path d="M4 10.9999C3.63333 10.9999 3.31944 10.8694 3.05833 10.6083C2.79722 10.3471 2.66667 10.0333 2.66667 9.66658V1.66659C2.66667 1.29992 2.79722 0.98603 3.05833 0.724919C3.31944 0.463807 3.63333 0.333252 4 0.333252H10C10.3667 0.333252 10.6806 0.463807 10.9417 0.724919C11.2028 0.98603 11.3333 1.29992 11.3333 1.66659V9.66658C11.3333 10.0333 11.2028 10.3471 10.9417 10.6083C10.6806 10.8694 10.3667 10.9999 10 10.9999H4ZM4 9.66658H10V1.66659H4V9.66658ZM1.33333 13.6666C0.966667 13.6666 0.652778 13.536 0.391667 13.2749C0.130556 13.0138 0 12.6999 0 12.3333V2.99992H1.33333V12.3333H8.66667V13.6666H1.33333Z" />
                    </svg>
                  </button>
                </CopyToClipboard>
              </div>

              <CodeHighlighter data={generateCode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateEmbed;

const CodeHighlighter = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const { theme } = useTheme();

  // Determine whether to use dark or light theme
  const selectedStyle =
    theme === "dark" ? stackoverflowDark : stackoverflowLight;

  // Custom styling for light theme, if needed
  const customStyle = {
    ...selectedStyle,
    hljs: {
      ...selectedStyle.hljs,
      backgroundColor: theme === "dark" ? "#09090b" : "#fff", // Set light background for light theme
      padding: "12px 12px",
      fontSize: "14px",
    },
  };

  return (
    <div className="flex flex-col max-h-[380px] border border-input-border overflow-auto recent__bar rounded-md">
      <SyntaxHighlighter
        language="sql"
        style={customStyle}
        wrapLongLines={true}
      >
        {data}
      </SyntaxHighlighter>
    </div>
  );
};
