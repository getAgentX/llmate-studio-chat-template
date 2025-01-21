import React, { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ConfirmModal from "../Modal/ConfirmModal";
import { useTheme } from "@/hooks/useTheme";
import Link from "next/link";

const UserMenu = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const session = useSession();
  const { theme } = useTheme();
  const toggleRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (toggleRef.current && !toggleRef.current.contains(e.target)) {
      setToggleMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handlePrimary = () => {
    localStorage.removeItem("currentOrganization");
    signOut();
  };

  const handleSecondary = () => {
    setShowConfirmLogout(false);
  };

  return (
    <div className="relative w-full">
      <div
        className={`flex items-center justify-center group h-8 w-full cursor-pointer ${
          toggleMenu ? "bg-active-bg border-border-active-color text-active-text"
            : "bg-transparent border-transparent hover:bg-active-bg-hover"
        }`}
        onClick={() => setToggleMenu(!toggleMenu)}
        data-tooltip-id="tooltip"
        data-tooltip-content="User"
        data-tooltip-place="right"
        data-tooltip-variant={theme}
      >
        {toggleMenu || (
          <svg
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 ${
              toggleMenu
                ? "fill-icon-color-hover"
                : "fill-icon-color"
            }`}
          >
            <path d="M7.00156 7.0001C6.12156 7.0001 5.36823 6.68676 4.74156 6.0601C4.1149 5.43343 3.80156 4.6801 3.80156 3.8001C3.80156 2.9201 4.1149 2.16676 4.74156 1.5401C5.36823 0.913431 6.12156 0.600098 7.00156 0.600098C7.88156 0.600098 8.6349 0.913431 9.26156 1.5401C9.88823 2.16676 10.2016 2.9201 10.2016 3.8001C10.2016 4.6801 9.88823 5.43343 9.26156 6.0601C8.6349 6.68676 7.88156 7.0001 7.00156 7.0001ZM0.601562 13.4001V11.1601C0.601562 10.7068 0.718229 10.2901 0.951562 9.9101C1.1849 9.5301 1.4949 9.2401 1.88156 9.0401C2.70823 8.62676 3.54823 8.31676 4.40156 8.1101C5.2549 7.90343 6.12156 7.8001 7.00156 7.8001C7.88156 7.8001 8.74823 7.90343 9.60156 8.1101C10.4549 8.31676 11.2949 8.62676 12.1216 9.0401C12.5082 9.2401 12.8182 9.5301 13.0516 9.9101C13.2849 10.2901 13.4016 10.7068 13.4016 11.1601V13.4001H0.601562Z" />
          </svg>
        )}

        {toggleMenu && (
          <svg
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 fill-active-text"
          >
            <path d="M7.00156 7.0001C6.12156 7.0001 5.36823 6.68676 4.74156 6.0601C4.1149 5.43343 3.80156 4.6801 3.80156 3.8001C3.80156 2.9201 4.1149 2.16676 4.74156 1.5401C5.36823 0.913431 6.12156 0.600098 7.00156 0.600098C7.88156 0.600098 8.6349 0.913431 9.26156 1.5401C9.88823 2.16676 10.2016 2.9201 10.2016 3.8001C10.2016 4.6801 9.88823 5.43343 9.26156 6.0601C8.6349 6.68676 7.88156 7.0001 7.00156 7.0001ZM0.601562 13.4001V11.1601C0.601562 10.7068 0.718229 10.2901 0.951562 9.9101C1.1849 9.5301 1.4949 9.2401 1.88156 9.0401C2.70823 8.62676 3.54823 8.31676 4.40156 8.1101C5.2549 7.90343 6.12156 7.8001 7.00156 7.8001C7.88156 7.8001 8.74823 7.90343 9.60156 8.1101C10.4549 8.31676 11.2949 8.62676 12.1216 9.0401C12.5082 9.2401 12.8182 9.5301 13.0516 9.9101C13.2849 10.2901 13.4016 10.7068 13.4016 11.1601V13.4001H0.601562Z" />
          </svg>
        )}
      </div>

      {toggleMenu && (
        <div
          className="absolute bottom-0 w-full left-[120%] rounded-md min-w-56 max-w-56 bg-dropdown-bg border border-border-color shadow-md"
          ref={toggleRef}
        >
          <div className="flex flex-col rounded">
            {session?.data?.user?.email && (
              <a className={`flex items-center justify-between px-2 h-8 text-xs font-medium rounded-t cursor-pointer text-dropdown-text bg-active-bg`}>
                <div className="flex items-center space-x-2 text-sm font-medium tracking-wide">
                  <div className="flex items-center space-x-2">
                  <svg
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 ${toggleMenu
                        ? "fill-icon-color-hover"
                        : "fill-icon-color"
                      }`}
                  >
                    <path d="M7.00156 7.0001C6.12156 7.0001 5.36823 6.68676 4.74156 6.0601C4.1149 5.43343 3.80156 4.6801 3.80156 3.8001C3.80156 2.9201 4.1149 2.16676 4.74156 1.5401C5.36823 0.913431 6.12156 0.600098 7.00156 0.600098C7.88156 0.600098 8.6349 0.913431 9.26156 1.5401C9.88823 2.16676 10.2016 2.9201 10.2016 3.8001C10.2016 4.6801 9.88823 5.43343 9.26156 6.0601C8.6349 6.68676 7.88156 7.0001 7.00156 7.0001ZM0.601562 13.4001V11.1601C0.601562 10.7068 0.718229 10.2901 0.951562 9.9101C1.1849 9.5301 1.4949 9.2401 1.88156 9.0401C2.70823 8.62676 3.54823 8.31676 4.40156 8.1101C5.2549 7.90343 6.12156 7.8001 7.00156 7.8001C7.88156 7.8001 8.74823 7.90343 9.60156 8.1101C10.4549 8.31676 11.2949 8.62676 12.1216 9.0401C12.5082 9.2401 12.8182 9.5301 13.0516 9.9101C13.2849 10.2901 13.4016 10.7068 13.4016 11.1601V13.4001H0.601562Z" />
                  </svg>
                  </div>
                  <span className="font-medium tracking-wide ">
                    {session?.data?.user?.email.length > 21
                      ? `${session?.data?.user?.email.slice(0, 21)}...`
                      : session?.data?.user?.email}
                  </span>
                </div>
              </a>
            )}

            <Link
              href="/user-info/facebook_ads"
              className={`flex items-center justify-between px-2 h-8 text-xs font-medium cursor-pointer hover:bg-active-bg-hover ${theme === 'dark' ? 'text-dropdown-text hover:text-primary-text' : ''} `}
            >
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    // className="w-4 h-4 fill-dropdown-icon"
                  >
                    <path d="M2.67188 14C2.11632 14 1.6441 13.8056 1.25521 13.4167C0.866319 13.0278 0.671875 12.5556 0.671875 12C0.671875 11.4444 0.866319 10.9722 1.25521 10.5833C1.6441 10.1944 2.11632 10 2.67188 10C2.77188 10 2.8691 10.0083 2.96354 10.025C3.05799 10.0417 3.14965 10.0611 3.23854 10.0833L5.93854 6.36667C5.74965 6.13333 5.60243 5.87222 5.49688 5.58333C5.39132 5.29444 5.33854 4.98889 5.33854 4.66667C5.33854 3.93333 5.59965 3.30556 6.12188 2.78333C6.6441 2.26111 7.27188 2 8.00521 2C8.73854 2 9.36632 2.26111 9.88854 2.78333C10.4108 3.30556 10.6719 3.93333 10.6719 4.66667C10.6719 4.98889 10.6163 5.29444 10.5052 5.58333C10.3941 5.87222 10.2441 6.13333 10.0552 6.36667L12.7719 10.0833C12.8608 10.0611 12.9524 10.0417 13.0469 10.025C13.1413 10.0083 13.2385 10 13.3385 10C13.8941 10 14.3663 10.1944 14.7552 10.5833C15.1441 10.9722 15.3385 11.4444 15.3385 12C15.3385 12.5556 15.1441 13.0278 14.7552 13.4167C14.3663 13.8056 13.8941 14 13.3385 14C12.783 14 12.3108 13.8056 11.9219 13.4167C11.533 13.0278 11.3385 12.5556 11.3385 12C11.3385 11.7889 11.3691 11.5861 11.4302 11.3917C11.4913 11.1972 11.5774 11.0222 11.6885 10.8667L8.98854 7.15C8.93299 7.17222 8.88021 7.18889 8.83021 7.2C8.78021 7.21111 8.72743 7.22778 8.67188 7.25V10.1167C9.06076 10.25 9.38021 10.4889 9.63021 10.8333C9.88021 11.1778 10.0052 11.5667 10.0052 12C10.0052 12.5556 9.81076 13.0278 9.42188 13.4167C9.03299 13.8056 8.56076 14 8.00521 14C7.44965 14 6.97743 13.8056 6.58854 13.4167C6.19965 13.0278 6.00521 12.5556 6.00521 12C6.00521 11.5667 6.13021 11.1806 6.38021 10.8417C6.63021 10.5028 6.94965 10.2611 7.33854 10.1167V7.25C7.28299 7.22778 7.23021 7.21111 7.18021 7.2C7.13021 7.18889 7.07743 7.17222 7.02188 7.15L4.32188 10.8667C4.43299 11.0222 4.5191 11.1972 4.58021 11.3917C4.64132 11.5861 4.67188 11.7889 4.67188 12C4.67188 12.5556 4.47743 13.0278 4.08854 13.4167C3.69965 13.8056 3.22743 14 2.67188 14Z" />
                  </svg>
                </span>

                <span className="font-medium tracking-wide">
                  Data Connections
                </span>
              </div>
            </Link>

            <button
              onClick={() => setShowConfirmLogout(true)}
              className={`flex items-center justify-between px-2 h-8 text-xs font-medium rounded-b cursor-pointer hover:bg-active-bg-hover ${theme === 'dark' ? 'text-dropdown-text hover:text-primary-text' : ''} `}
            >
              <div className="flex items-center space-x-2">
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
                      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                    />
                  </svg>
                </span>

                <span className="font-medium tracking-wide">Log out</span>
              </div>
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        show={showConfirmLogout}
        setShow={setShowConfirmLogout}
        heading="Confirm Logout"
        title={"Are you sure you want to Logout?"}
        description={"You are logged out when you confirm"}
        primaryBtn="Yes, Confirm"
        primaryChange={handlePrimary}
        secondaryBtn="No, keep me in"
        secondaryChange={handleSecondary}
      />
    </div>
  );
};

export default UserMenu;
